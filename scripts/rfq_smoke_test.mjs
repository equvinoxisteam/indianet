import { createRequire } from 'module'

const require = createRequire(import.meta.url)
// Load server-side dependencies from SERVER/node_modules (repo root doesn't have them installed).
const jwt = require('../SERVER/node_modules/jsonwebtoken')
const { MongoClient } = require('../SERVER/node_modules/mongodb')
import fs from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'

// Minimal .env loader (avoid requiring `dotenv` from root).
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', 'SERVER', '.env')

if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const value = trimmed.slice(eqIdx + 1).trim()
    if (key && process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

const DB_URL = process.env.DB_URL
const DB_NAME = process.env.DB_NAME
const JWT_SECRET = process.env.JWT_SECRET

const SERVER_BASE = process.env.SERVER_BASE || 'http://localhost:5000'

function requireEnv(name, val) {
  if (!val) {
    throw new Error(`Missing env var: ${name}`)
  }
  return val
}

requireEnv('DB_URL', DB_URL)
requireEnv('DB_NAME', DB_NAME)
requireEnv('JWT_SECRET', JWT_SECRET)

async function main() {
  const client = new MongoClient(DB_URL)
  await client.connect()
  const db = client.db(DB_NAME)

  const vendors = db.collection('vendors')
  const users = db.collection('users')
  const products = db.collection('products')
  const admins = db.collection('admin')

  const acceptedVendors = await vendors.find({ accept: true }).limit(25).toArray()
  if (!acceptedVendors.length) {
    throw new Error('No accepted vendors found in `vendors` collection (accept: true).')
  }

  const vendorProducts = await products
    .find({ vendor: true, pickup_location: { $ne: null } })
    .limit(200)
    .toArray()

  if (!vendorProducts.length) {
    throw new Error('No vendor products found (products.vendor=true).')
  }

  // Pick a product that maps to one accepted vendor via `pickup_location` (used as RFQ.vendorId).
  let chosenProduct = null
  let chosenVendor = null
  for (const p of vendorProducts) {
    const vendorIdStr = p.pickup_location
    if (!vendorIdStr) continue
    const v = acceptedVendors.find((x) => x._id.toString() === vendorIdStr)
    if (v) {
      chosenProduct = p
      chosenVendor = v
      break
    }
  }

  if (!chosenProduct || !chosenVendor) {
    throw new Error('Could not match any vendor product to an accepted vendor via pickup_location.')
  }

  const user = await users.findOne({})
  if (!user) {
    throw new Error('No users found in `users` collection.')
  }

  const admin = await admins.findOne({})
  if (!admin) {
    throw new Error('No admin found in `admin` collection.')
  }

  const userToken = jwt.sign({ email: user.email, _id: user._id }, JWT_SECRET, { expiresIn: 86400 })
  const vendorToken = jwt.sign({ email: chosenVendor.email, _id: chosenVendor._id }, JWT_SECRET, { expiresIn: 86400 })
  const adminToken = jwt.sign({ email: admin.email, _id: admin._id }, JWT_SECRET, { expiresIn: 86400 })

  const productImage = chosenProduct.files?.[0]?.filename || ''
  const rfqPayload = {
    userId: user._id.toString(),
    userName: user.name || user.userName || 'SmokeUser',
    userEmail: user.email,
    userNumber: '9999999999',
    productId: chosenProduct._id.toString(),
    productName: chosenProduct.name,
    productSlug: chosenProduct.slug,
    productImage,
    vendorId: chosenProduct.pickup_location,
    quantity: 1,
    message: 'rfq smoke test'
  }

  // 1) Submit RFQ
  const submitRes = await fetch(`${SERVER_BASE}/api/users/submitRfq`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': userToken
    },
    body: JSON.stringify(rfqPayload)
  })
  const submitJson = await submitRes.json()
  if (!submitRes.ok || submitJson !== 'done') {
    throw new Error(`submitRfq failed: status=${submitRes.status}, body=${JSON.stringify(submitJson)}`)
  }

  // Get the created RFQ record by matching productId + latest createdAt.
  const rfq = await db.collection('rfq')
    .find({ productId: rfqPayload.productId, userEmail: rfqPayload.userEmail })
    .sort({ createdAt: -1 })
    .limit(1)
    .next()

  if (!rfq) throw new Error('RFQ document not found after submit.')

  const rfqId = rfq._id.toString()
  console.log('RFQ created:', rfqId, 'initial quotedPrice=', rfq.quotedPrice)

  // 2) Vendor quotes privately
  const quotedPrice = '1234.50'
  const quoteRes = await fetch(`${SERVER_BASE}/api/vendor/quoteRfq`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-access-token': vendorToken
    },
    body: JSON.stringify({ rfqId, quotedPrice })
  })
  const quoteJson = await quoteRes.json()
  if (!quoteRes.ok || quoteJson !== 'done') {
    throw new Error(`quoteRfq failed: status=${quoteRes.status}, body=${JSON.stringify(quoteJson)}`)
  }

  // 3) Admin sees quotedPrice
  const detailsRes = await fetch(`${SERVER_BASE}/api/admin/getRfqDetails?rfqId=${rfqId}`, {
    method: 'GET',
    headers: {
      'x-access-token': adminToken
    }
  })
  const detailsJson = await detailsRes.json()
  if (!detailsRes.ok) {
    throw new Error(`getRfqDetails failed: status=${detailsRes.status}, body=${JSON.stringify(detailsJson)}`)
  }

  const adminQuoted = detailsJson?.quotedPrice
  console.log('Admin sees quotedPrice:', adminQuoted)

  if (adminQuoted === null || adminQuoted === undefined) {
    throw new Error('Admin quotedPrice is missing after vendor quote.')
  }

  // 4) Enforcement check: no allowRfq product should allowCod/allowOnline true.
  const bad = await products.find({ allowRfq: true, $or: [{ allowCod: true }, { allowOnline: true }] }).limit(10).toArray()
  console.log('Products violating allowRfq enforcement count:', bad.length)
  if (bad.length) {
    console.log('Example violating product IDs:', bad.map((x) => x._id.toString()).slice(0, 5))
  }

  await client.close()
  console.log('RFQ smoke test OK')
}

main().catch(async (e) => {
  console.error('RFQ smoke test FAILED:', e?.message || e)
  process.exitCode = 1
})

