import collections from '../Config/Collection.js'

/** OTP validity — must match email copy ("10 minutes") */
export const OTP_TTL_SECONDS = 600

export async function ensureOtpTtlIndex(db) {
    const col = db.collection(collections.OTP)
    try {
        await col.dropIndex('createdAt_1')
    } catch (_) {
        // index may not exist yet
    }
    await col.createIndex({ createdAt: 1 }, { expireAfterSeconds: OTP_TTL_SECONDS })
}
