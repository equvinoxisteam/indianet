import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { MongoClient } = require('../SERVER/node_modules/mongodb')
const jwt = require('../SERVER/node_modules/jsonwebtoken')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const envPath = path.join(__dirname, '..', 'SERVER', '.env')

const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/)
const env = {}
for (const l of lines) {
  const t = l.trim()
  if (!t || t.startsWith('#')) continue
  const i = t.indexOf('=')
  if (i === -1) continue
  const k = t.slice(0, i)
  const v = t.slice(i + 1)
  if (env[k] === undefined) env[k] = v
}

const DB_URL = env.DB_URL
const DB_NAME = env.DB_NAME
const SERVER_BASE = process.env.SERVER_BASE || 'http://localhost:5000'

async function main() {
  if (!DB_URL || !DB_NAME) throw new Error('Missing DB_URL/DB_NAME in SERVER/.env')

  const client = new MongoClient(DB_URL)
  await client.connect()
  const db = client.db(DB_NAME)

  const user = await db.collection('users').findOne({})
  if (!user) throw new Error('No user found.')

  // Find a non-RFQ product that allows COD.
  const product =
    (await db.collection('products').findOne({
      allowCod: true,
      allowRfq: { $ne: true }
    })) || (await db.collection('products').findOne({ allowCod: true }))

  if (!product) throw new Error('No COD-allowed product found.')

  const before = await db.collection('orders').countDocuments({})

  // 1) Add to cart (so COD order uses cart flow on the backend).
  const userToken = jwt.sign({ email: user.email, _id: user._id }, env.JWT_SECRET || process.env.JWT_SECRET, {
    expiresIn: 86400
  })

  const addToCartRes = await fetch(`${SERVER_BASE}/api/users/addToCart`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-access-token': userToken },
    body: JSON.stringify({
      item: {
        quantity: 1,
        proId: product._id.toString(),
        price: product.price,
        mrp: product.mrp,
        variantSize: product.currVariantSize || ''
      }
    })
  })

  const addToCartJson = await addToCartRes.json().catch(() => ({}))
  if (!addToCartRes.ok) {
    throw new Error(`addToCart failed: status=${addToCartRes.status} body=${JSON.stringify(addToCartJson)}`)
  }

  // 2) Place COD order for cart.
  const payload = {
    userId: user._id.toString(),
    order: {
      name: user.name || 'Smoke User',
      number: '9876543210',
      pin: 110001,
      locality: 'loc',
      address: 'Smoke address',
      city: 'Delhi',
      state: 'Delhi',
      payType: 'cod',
      email: user.email,
      discount: { min: 0, discount: 0 },
      totalAmount: 1,
      order: {
        type: 'cart'
      }
    }
  }

  const res = await fetch(`${SERVER_BASE}/api/users/order-item-cod`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`order-item-cod failed: status=${res.status} body=${JSON.stringify(json)}`)
  if (json !== 'done') console.log('order-item-cod response:', json)

  const after = await db.collection('orders').countDocuments({})
  console.log('Orders created:', after - before)
  console.log('COD smoke test OK')
  await client.close()
}

main().catch((e) => {
  console.error('COD smoke test FAILED:', e?.message || e)
  process.exitCode = 1
})

