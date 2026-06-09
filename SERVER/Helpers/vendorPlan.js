import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'
import {
    buildActivationFields,
    getMonthStart,
    getPlanAccess,
    getPlanConfig,
    normalizePlanKey,
    planCanChangeShowcase,
    shouldResetQuota,
} from '../Config/vendorPlans.js'

export default {
    getPlanAccess,

    async refreshQuotaIfNeeded(vendor) {
        if (!vendor || !shouldResetQuota(vendor.rfqQuotaPeriodStart)) return vendor
        await db.get().collection(collections.VENDORS).updateOne(
            { _id: vendor._id },
            { $set: { rfqQuotaUsed: 0, rfqQuotaPeriodStart: getMonthStart() } }
        )
        return { ...vendor, rfqQuotaUsed: 0, rfqQuotaPeriodStart: getMonthStart() }
    },

    assertCanPublish(vendor) {
        const access = getPlanAccess(vendor)
        if (!access.isActive) {
            return {
                ok: false,
                code: 'PLAN_REQUIRED',
                message: access.isPending
                    ? 'Your plan request is pending admin approval. You can save drafts until your plan is activated.'
                    : 'An active subscription plan is required to publish products. Choose a plan from the Plans page.',
            }
        }
        return { ok: true, access }
    },

    assertCanQuoteRfq(vendor) {
        const access = getPlanAccess(vendor)
        if (!access.isActive) {
            return {
                ok: false,
                code: 'PLAN_REQUIRED',
                message: access.isPending
                    ? 'Your plan request is pending admin approval.'
                    : 'An active subscription plan is required to respond to RFQs.',
            }
        }
        if (access.rfqQuotaLimit != null && access.rfqQuotaRemaining <= 0) {
            return {
                ok: false,
                code: 'RFQ_QUOTA_EXCEEDED',
                message: `Monthly RFQ quota reached (${access.rfqQuotaLimit}/month). Upgrade your plan or wait until next month.`,
            }
        }
        return { ok: true, access }
    },

    async countShowcaseProducts(vendorId, excludeProductId = null) {
        const query = {
            vendor: true,
            vendorId: String(vendorId),
            isShowcase: true,
            publishStatus: 'published',
        }
        if (excludeProductId) {
            query._id = { $ne: new ObjectId(excludeProductId) }
        }
        return db.get().collection(collections.PRODUCTS).countDocuments(query)
    },

    async assertShowcaseLimit(vendor, vendorId, wantsShowcase, excludeProductId = null) {
        if (!wantsShowcase) return { ok: true }
        const access = getPlanAccess(vendor)
        if (!access.isActive) {
            return { ok: false, message: 'Active plan required to mark product showcases.' }
        }
        const current = await this.countShowcaseProducts(vendorId, excludeProductId)
        if (current >= access.showcaseLimit) {
            return {
                ok: false,
                message: `Showcase limit reached (${access.showcaseLimit} products on your ${access.planLabel} plan).`,
            }
        }
        return { ok: true }
    },

    async assertShowcaseChange(vendor, vendorId, productId, wasShowcase, wantsShowcase) {
        if (wasShowcase === wantsShowcase) return { ok: true }
        if (!vendor?.showcaseLocked) return { ok: true }
        if (planCanChangeShowcase(vendor?.plan)) return { ok: true }
        return {
            ok: false,
            code: 'SHOWCASE_LOCKED',
            message: 'Your showcased products are locked. Upgrade to Pro or Premium to change which products are showcased.',
        }
    },

    async syncShowcaseLock(vendorId, vendor) {
        const access = getPlanAccess(vendor)
        if (!access.isActive || !access.showcaseLimit) return vendor
        const used = await this.countShowcaseProducts(vendorId)
        const shouldLock = used >= access.showcaseLimit
        if (!!vendor.showcaseLocked === shouldLock) return vendor
        await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $set: { showcaseLocked: shouldLock } }
        )
        return { ...vendor, showcaseLocked: shouldLock }
    },

    requestPlan(vendorId, details) {
        return new Promise((resolve, reject) => {
            const planKey = normalizePlanKey(details.plan)
            if (!planKey) {
                reject(new Error('invalid_plan'))
                return
            }
            const now = new Date()
            db.get().collection(collections.VENDORS).updateOne(
                { _id: new ObjectId(vendorId) },
                {
                    $set: {
                        planStatus: 'pending',
                        planRequested: planKey,
                        planRequestedAt: now,
                        planRequestDetails: {
                            name: details.name || '',
                            email: details.email || '',
                            phone: details.phone || '',
                            company: details.company || '',
                            period: details.period || 'annual',
                            country: details.country || '',
                            currency: details.currency || '',
                            price: details.price || '',
                        },
                    },
                }
            ).then(() => resolve({ plan: planKey })).catch(() => reject())
        })
    },

    requestPlanByEmail(email, details) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).findOne({ email: String(email).toLowerCase() })
                .then((vendor) => {
                    if (!vendor) {
                        resolve({ linked: false })
                        return
                    }
                    this.requestPlan(vendor._id, details).then(() => {
                        resolve({ linked: true, vendorId: vendor._id })
                    }).catch(reject)
                }).catch(reject)
        })
    },

    activatePlan(vendorId, planKey) {
        return new Promise((resolve, reject) => {
            const fields = buildActivationFields(planKey)
            if (!fields) {
                reject(new Error('invalid_plan'))
                return
            }
            db.get().collection(collections.VENDORS).updateOne(
                { _id: new ObjectId(vendorId) },
                { $set: fields }
            ).then((result) => {
                if (result.matchedCount === 0) reject(new Error('not_found'))
                else resolve(fields)
            }).catch(reject)
        })
    },

    deactivatePlan(vendorId) {
        return new Promise((resolve, reject) => {
            db.get().collection(collections.VENDORS).updateOne(
                { _id: new ObjectId(vendorId) },
                {
                    $set: {
                        plan: null,
                        planStatus: 'none',
                        planRequested: null,
                        planRequestedAt: null,
                        planActivatedAt: null,
                        planExpiresAt: null,
                        rfqQuotaLimit: null,
                        rfqQuotaUsed: 0,
                        rfqQuotaPeriodStart: null,
                        showcaseLimit: 0,
                        showcaseLocked: false,
                        adsEnabled: false,
                        verifiedBadge: false,
                        supplierRating: null,
                        verificationTags: [],
                    },
                }
            ).then(() => resolve()).catch(reject)
        })
    },

    incrementRfqQuota(vendorId) {
        return db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $inc: { rfqQuotaUsed: 1 } }
        )
    },

    getPendingPlanVendors(skip = 0, limit = 20) {
        return db.get().collection(collections.VENDORS)
            .find({ planStatus: 'pending' })
            .sort({ planRequestedAt: -1 })
            .skip(parseInt(skip, 10))
            .limit(limit)
            .toArray()
    },

    countPendingPlanVendors() {
        return db.get().collection(collections.VENDORS).countDocuments({ planStatus: 'pending' })
    },

    getPlanLabel(planKey) {
        return getPlanConfig(planKey)?.label || '—'
    },
}
