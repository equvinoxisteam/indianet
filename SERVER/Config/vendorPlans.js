export const VENDOR_PLAN_KEYS = ['free', 'basic', 'plus', 'pro', 'premium']



export const VENDOR_PLANS = {

    free: {

        label: 'Free',

        annualPrice: 0,

        rfqQuotaMonthly: 5,

        showcaseLimit: 1,

        adsEnabled: false,

        verifiedBadge: false,

        showCompanyProfile: false,

        supplierRating: null,

        canChangeShowcaseWhenLocked: false,

    },

    basic: {

        label: 'Basic',

        annualPrice: 110000,

        rfqQuotaMonthly: 20,

        showcaseLimit: 5,

        adsEnabled: false,

        verifiedBadge: false,

        showCompanyProfile: false,

        supplierRating: null,

        canChangeShowcaseWhenLocked: false,

    },

    plus: {

        label: 'Plus',

        annualPrice: 165000,

        rfqQuotaMonthly: 40,

        showcaseLimit: 20,

        adsEnabled: 'basic',

        verifiedBadge: true,

        showCompanyProfile: true,

        supplierRating: null,

        canChangeShowcaseWhenLocked: false,

    },

    pro: {

        label: 'Pro',

        annualPrice: 234000,

        rfqQuotaMonthly: 60,

        showcaseLimit: 20,

        adsEnabled: 'product',

        verifiedBadge: true,

        showCompanyProfile: true,

        supplierRating: 2,

        canChangeShowcaseWhenLocked: true,

    },

    premium: {

        label: 'Premium',

        annualPrice: 750000,

        rfqQuotaMonthly: null,

        showcaseLimit: 60,

        adsEnabled: 'full',

        verifiedBadge: true,

        showCompanyProfile: true,

        supplierRating: 4,

        canChangeShowcaseWhenLocked: true,

    },

}



export function getVerificationTagsForPlan(config) {

    if (!config?.verifiedBadge) return []

    const tags = ['Verified Vendor']

    if (config.key === 'premium') tags.push('Verified Supplier')

    return tags

}



export function normalizePlanKey(plan) {

    if (!plan) return null

    const key = String(plan).trim().toLowerCase()

    return VENDOR_PLAN_KEYS.includes(key) ? key : null

}



export function getPlanConfig(planKey) {

    const key = normalizePlanKey(planKey)

    if (!key) return null

    return { key, ...VENDOR_PLANS[key] }

}



export function planCanChangeShowcase(planKey) {

    const config = getPlanConfig(planKey)

    return !!config?.canChangeShowcaseWhenLocked

}



export function getMonthStart(date = new Date()) {

    return new Date(date.getFullYear(), date.getMonth(), 1)

}



export function addYears(date, years = 1) {

    const d = new Date(date)

    d.setFullYear(d.getFullYear() + years)

    return d

}



export function shouldResetQuota(periodStart) {

    if (!periodStart) return true

    const start = new Date(periodStart)

    const now = new Date()

    return start.getFullYear() !== now.getFullYear() || start.getMonth() !== now.getMonth()

}



export function isPlanExpired(vendor) {

    if (!vendor?.planExpiresAt) return false

    return new Date(vendor.planExpiresAt).getTime() < Date.now()

}



export function buildActivationFields(planKey) {

    const config = getPlanConfig(planKey)

    if (!config) return null

    const now = new Date()

    const verificationTags = getVerificationTagsForPlan(config)

    const isFree = config.key === 'free'

    return {

        plan: config.key,

        planStatus: 'active',

        planRequested: config.key,

        planActivatedAt: now,

        planExpiresAt: isFree ? null : addYears(now, 1),

        rfqQuotaLimit: config.rfqQuotaMonthly,

        rfqQuotaUsed: 0,

        rfqQuotaPeriodStart: getMonthStart(now),

        showcaseLimit: config.showcaseLimit,

        showcaseLocked: false,

        adsEnabled: config.adsEnabled,

        verifiedBadge: config.verifiedBadge,

        supplierRating: config.supplierRating,

        verificationTags,

    }

}



export function getPlanAccess(vendor) {

    const status = vendor?.planStatus || 'none'

    const planKey = normalizePlanKey(vendor?.plan)

    const config = planKey ? getPlanConfig(planKey) : null

    const expired = status === 'active' && isPlanExpired(vendor)

    const active = status === 'active' && planKey && config && !expired

    const pending = status === 'pending'

    const rfqLimit = active ? config.rfqQuotaMonthly : null

    const rfqUsed = vendor?.rfqQuotaUsed || 0

    const showcaseLimit = active ? config.showcaseLimit : 0



    return {

        planStatus: expired ? 'expired' : status,

        plan: planKey,

        planLabel: config?.label || null,

        planRequested: normalizePlanKey(vendor?.planRequested),

        planRequestedLabel: getPlanConfig(vendor?.planRequested)?.label || null,

        planRequestedAt: vendor?.planRequestedAt || null,

        planActivatedAt: vendor?.planActivatedAt || null,

        planExpiresAt: vendor?.planExpiresAt || null,

        isActive: !!active,

        isPending: pending,

        isExpired: expired,

        canAccessRfq: !!active && (rfqLimit == null || rfqLimit > 0),

        canPublishProducts: !!active,

        rfqQuotaLimit: rfqLimit,

        rfqQuotaUsed: rfqUsed,

        rfqQuotaRemaining: rfqLimit == null ? (active ? null : 0) : Math.max(0, rfqLimit - rfqUsed),

        showcaseLimit,

        showcaseLocked: !!vendor?.showcaseLocked,

        canChangeShowcase: active ? planCanChangeShowcase(planKey) : false,

        adsEnabled: active ? config.adsEnabled : false,

        verifiedBadge: active ? config.verifiedBadge : false,

        showCompanyProfile: active ? !!config.showCompanyProfile : false,

        supplierRating: active ? config.supplierRating : null,

    }

}


