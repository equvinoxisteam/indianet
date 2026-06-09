export const GST_RATE = 0.18

export function toFiniteNumber(v, fallback = 0) {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
}

export function computeGstAmount(baseAmount, gstRate = GST_RATE) {
    const n = toFiniteNumber(baseAmount, 0)
    return Math.round(n * gstRate * 100) / 100
}

export function allocateShippingAcrossItems(shippingTotal, orderItems, { getSellingPrice } = {}) {
    const items = Array.isArray(orderItems) ? [...orderItems] : []
    const total = toFiniteNumber(shippingTotal, 0)
    const priceFn = getSellingPrice || ((it) => it?.selling_price ?? 0)

    const sumSelling = items.reduce((sum, it) => sum + toFiniteNumber(priceFn(it), 0), 0)

    if (items.length === 0) return { items, shippingTotalAllocated: 0 }
    if (sumSelling <= 0) {
        const per = total / items.length
        let allocated = 0
        for (const it of items) {
            it.shippingAmount = Math.round(per * 100) / 100
            allocated += it.shippingAmount
        }
        return { items, shippingTotalAllocated: allocated }
    }

    // Allocate proportionally by selling price. Ensure last item absorbs rounding error.
    let allocated = 0
    for (let i = 0; i < items.length; i++) {
        const it = items[i]
        const ratio = toFiniteNumber(priceFn(it), 0) / sumSelling
        const isLast = i === items.length - 1
        const alloc = isLast
            ? (total - allocated)
            : Math.round(total * ratio * 100) / 100
        it.shippingAmount = alloc
        allocated += alloc
    }

    return { items, shippingTotalAllocated: allocated }
}

