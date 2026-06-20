import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import vendorPlan from './vendorPlan.js'
import { sendVendorPlanExpiryWarning, sendVendorPlanExpired } from './sendAuthEmail.js'

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const CHECK_INTERVAL_MS = 60 * 60 * 1000

async function processVendorPlanLifecycle(vendor) {
    if (!vendor?._id) return
    const plan = vendor.plan
    const status = vendor.planStatus
    if (!plan || plan === 'free' || status !== 'active') return
    if (!vendor.planExpiresAt) return

    const expiresAt = new Date(vendor.planExpiresAt).getTime()
    const now = Date.now()
    const msUntilExpiry = expiresAt - now
    const vendorId = vendor._id.toString()

    if (msUntilExpiry > 0 && msUntilExpiry <= ONE_DAY_MS && !vendor.planExpiryWarningSentAt) {
        try {
            await sendVendorPlanExpiryWarning({
                email: vendor.email,
                name: vendor.companyName || vendor.companyInfo || vendor.name,
                planLabel: vendorPlan.getPlanLabel(vendor.plan),
                expiresAt: vendor.planExpiresAt,
            })
            await db.get().collection(collections.VENDORS).updateOne(
                { _id: vendor._id },
                { $set: { planExpiryWarningSentAt: new Date() } }
            )
        } catch {
            // non-fatal
        }
        return
    }

    if (msUntilExpiry <= 0 && !vendor.planPreventAutoDowngrade) {
        const planLabel = vendorPlan.getPlanLabel(vendor.plan)
        const target = vendor.planDowngradeTo || 'free'
        await vendorPlan.downgradePlan(vendorId, target)
        try {
            await sendVendorPlanExpired({
                email: vendor.email,
                name: vendor.companyName || vendor.companyInfo || vendor.name,
                planLabel,
            })
        } catch {
            // non-fatal
        }
    }
}

export async function runPlanLifecycleTick() {
    if (!db.get()) return { processed: 0 }
    const vendors = await db.get().collection(collections.VENDORS).find({
        accept: true,
        planStatus: 'active',
        plan: { $nin: [null, 'free'] },
        planExpiresAt: { $exists: true, $ne: null },
    }).toArray()

    for (const vendor of vendors) {
        await processVendorPlanLifecycle(vendor).catch(() => {})
    }
    return { processed: vendors.length }
}

let lifecycleTimer = null

export function startPlanLifecycleScheduler() {
    if (lifecycleTimer) return
    const tick = () => {
        runPlanLifecycleTick().catch((e) => console.error('Plan lifecycle tick:', e.message))
    }
    tick()
    lifecycleTimer = setInterval(tick, CHECK_INTERVAL_MS)
}

export default {
    runPlanLifecycleTick,
    startPlanLifecycleScheduler,
}
