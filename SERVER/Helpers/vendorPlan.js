import db from '../Config/Connection.js'
import collections from '../Config/Collection.js'
import { ObjectId } from 'mongodb'
import {
    buildActivationFields,
    computePlanExpiry,
    getMonthStart,
    getPlanAccess,
    getPlanConfig,
    isPlanExpired,
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

    async enforceShowcaseAfterPlanChange(vendorId, vendor) {
        const access = getPlanAccess(vendor)
        const limit = access.showcaseLimit
        if (limit == null) {
            await db.get().collection(collections.VENDORS).updateOne(
                { _id: new ObjectId(vendorId) },
                { $set: { showcaseLocked: false } }
            )
            return
        }
        const products = await db.get().collection(collections.PRODUCTS)
            .find({
                vendor: true,
                vendorId: String(vendorId),
                isShowcase: true,
                publishStatus: 'published',
            })
            .sort({ _id: 1 })
            .toArray()

        if (products.length > limit) {
            const excessIds = products.slice(limit).map((p) => p._id)
            await db.get().collection(collections.PRODUCTS).updateMany(
                { _id: { $in: excessIds } },
                { $set: { isShowcase: false } }
            )
        }
        await this.syncShowcaseLock(vendorId, vendor)
    },

    async ensurePlanCurrent(vendor) {
        if (!vendor?._id) return vendor
        let current = await this.refreshQuotaIfNeeded(vendor)
        if (!isPlanExpired(current)) return current
        if (!current.plan || current.plan === 'free') return current
        if (current.planPreventAutoDowngrade) return current

        const target = normalizePlanKey(current.planDowngradeTo) || 'free'
        await this.downgradePlan(current._id.toString(), target)
        return db.get().collection(collections.VENDORS).findOne({ _id: current._id })
    },

    assertCanPublish(vendor) {
        const access = getPlanAccess(vendor)
        if (!access.isActive) {
            return {
                ok: false,
                code: 'PLAN_REQUIRED',
                message: access.isPaused
                    ? 'Your plan is paused by admin. Contact support to resume.'
                    : access.isPending
                    ? 'Your plan request is pending admin approval. You can save drafts until your plan is activated.'
                    : access.isExpired
                        ? 'Your plan has expired. Request a new plan or contact admin.'
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
                message: access.isPaused
                    ? 'Your plan is paused by admin. Contact support to resume.'
                    : access.isPending
                    ? 'Your plan request is pending admin approval.'
                    : access.isExpired
                        ? 'Your plan has expired.'
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
        if (access.showcaseUnlimited) return { ok: true }
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
        if (!access.isActive || access.showcaseUnlimited) {
            if (vendor?.showcaseLocked) {
                await db.get().collection(collections.VENDORS).updateOne(
                    { _id: new ObjectId(vendorId) },
                    { $set: { showcaseLocked: false } }
                )
            }
            return { ...vendor, showcaseLocked: false }
        }
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
            const period = details.period === 'semiannual' ? 'semiannual' : 'annual'
            db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
                .then((vendor) => {
                    if (!vendor) {
                        reject(new Error('not_found'))
                        return
                    }
                    const updates = {
                        planRequested: planKey,
                        planRequestedAt: now,
                        planUpgradePending: true,
                        planRequestDetails: {
                            name: details.name || '',
                            email: details.email || '',
                            phone: details.phone || '',
                            company: details.company || '',
                            period,
                            country: details.country || '',
                            currency: details.currency || '',
                            price: details.price || '',
                        },
                    }
                    if (vendor.planStatus !== 'active') {
                        updates.planStatus = 'pending'
                    }
                    return db.get().collection(collections.VENDORS).updateOne(
                        { _id: new ObjectId(vendorId) },
                        { $set: updates }
                    )
                })
                .then(() => resolve({ plan: planKey, period }))
                .catch(() => reject())
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

    async activatePlan(vendorId, planKey, options = {}) {
        const fields = buildActivationFields(planKey, options)
        if (!fields) throw new Error('invalid_plan')
        const result = await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            {
                $set: fields,
                $unset: { planRequestDetails: '' },
            }
        )
        if (result.matchedCount === 0) throw new Error('not_found')
        const vendor = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        await this.enforceShowcaseAfterPlanChange(vendorId, vendor)
        return fields
    },

    async downgradePlan(vendorId, toPlanKey = 'free') {
        const target = normalizePlanKey(toPlanKey) || 'free'
        const fields = buildActivationFields(target, { period: 'annual' })
        if (!fields) throw new Error('invalid_plan')
        await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $set: fields }
        )
        const vendor = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        await this.enforceShowcaseAfterPlanChange(vendorId, vendor)
        return fields
    },

    async updatePlanSubscription(vendorId, options = {}) {
        const vendor = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        if (!vendor) throw new Error('not_found')

        const planKey = normalizePlanKey(options.plan) || vendor.plan || 'free'
        const period = options.period === 'semiannual' ? 'semiannual' : 'annual'
        const hasCustomExpiry = options.expiresAt != null && String(options.expiresAt).trim() !== ''
        const previousPlan = normalizePlanKey(vendor.plan)
        const planTierChanged = planKey !== previousPlan
        const periodChanged = period !== vendor.planBillingPeriod
        let useCustomExpiry = hasCustomExpiry
        if (useCustomExpiry && vendor.planExpiresAt && (planTierChanged || periodChanged)) {
            const nextExpiry = new Date(options.expiresAt)
            const currentExpiry = new Date(vendor.planExpiresAt)
            if (nextExpiry.toDateString() === currentExpiry.toDateString()) {
                useCustomExpiry = false
            }
        }

        const fields = buildActivationFields(planKey, {
            period,
            expiresAt: null,
            preventAutoDowngrade: options.preventAutoDowngrade ?? vendor.planPreventAutoDowngrade,
            downgradeToPlan: options.downgradeToPlan || vendor.planDowngradeTo || 'free',
        })

        if (planKey === 'free') {
            fields.planExpiresAt = null
            fields.planBillingPeriod = null
        } else if (useCustomExpiry) {
            fields.planExpiresAt = new Date(options.expiresAt)
        } else if (planTierChanged || periodChanged || !vendor.planExpiresAt) {
            fields.planExpiresAt = computePlanExpiry(new Date(), planKey, period, null)
            fields.planActivatedAt = new Date()
            fields.planExpiryWarningSentAt = null
        } else {
            fields.planExpiresAt = new Date(vendor.planExpiresAt)
            fields.planActivatedAt = vendor.planActivatedAt || new Date()
        }

        if (!planTierChanged) {
            fields.rfqQuotaUsed = vendor.rfqQuotaUsed || 0
            fields.rfqQuotaPeriodStart = vendor.rfqQuotaPeriodStart || getMonthStart()
        }

        await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            {
                $set: fields,
                $unset: { planRequestDetails: '' },
            }
        )
        const updated = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        await this.enforceShowcaseAfterPlanChange(vendorId, updated)
        return fields
    },

    deactivatePlan(vendorId) {
        return this.downgradePlan(vendorId, 'free')
    },

    async pausePlan(vendorId) {
        const vendor = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        if (!vendor) throw new Error('not_found')
        if (vendor.planStatus !== 'active' || vendor.plan === 'free') {
            throw new Error('cannot_pause')
        }
        await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $set: { planStatus: 'paused', planPausedAt: new Date() } }
        )
        return { planStatus: 'paused' }
    },

    async resumePlan(vendorId) {
        const vendor = await db.get().collection(collections.VENDORS).findOne({ _id: new ObjectId(vendorId) })
        if (!vendor) throw new Error('not_found')
        if (vendor.planStatus !== 'paused') throw new Error('not_paused')
        if (isPlanExpired(vendor)) throw new Error('plan_expired')
        await db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $set: { planStatus: 'active', planPausedAt: null } }
        )
        return { planStatus: 'active' }
    },

    incrementRfqQuota(vendorId) {
        return db.get().collection(collections.VENDORS).updateOne(
            { _id: new ObjectId(vendorId) },
            { $inc: { rfqQuotaUsed: 1 } }
        )
    },

    getPendingPlanVendors(skip = 0, limit = 20) {
        return db.get().collection(collections.VENDORS)
            .find({ $or: [{ planStatus: 'pending' }, { planUpgradePending: true }] })
            .sort({ planRequestedAt: -1 })
            .skip(parseInt(skip, 10))
            .limit(limit)
            .toArray()
    },

    countPendingPlanVendors() {
        return db.get().collection(collections.VENDORS).countDocuments({
            $or: [{ planStatus: 'pending' }, { planUpgradePending: true }],
        })
    },

    getPlanLabel(planKey) {
        return getPlanConfig(planKey)?.label || '—'
    },
}
