import bcrypt from 'bcrypt'
import collections from '../Config/Collection.js'
import { sendAdminWelcome } from './sendAuthEmail.js'

/**
 * Upserts admin user from ADMIN_EMAIL + ADMIN_PASSWORD so dashboard login matches .env.
 * ADMIN_MAIL remains for notification recipients only.
 */
export async function seedDefaultAdmin(db) {
  const email = process.env.ADMIN_EMAIL?.trim()
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    return
  }
  try {
    const col = db.collection(collections.ADMIN)
    const hashed = await bcrypt.hash(password, 10)
    const result = await col.updateOne(
      { email },
      { $set: { email, password: hashed } },
      { upsert: true }
    )
    console.log('Indianet: admin login synced for', email)
    if (result.upsertedCount === 1) {
      sendAdminWelcome(email).catch(() => {})
    }
  } catch (e) {
    console.error('seedDefaultAdmin:', e.message)
  }
}
