import { allocateShippingAcrossItems, computeGstAmount } from '../SERVER/ShipRocket/shippingTaxUtils.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

// Scenario 1: Proportional allocation with rounding.
{
  const shippingTotal = 120.55
  const items = [
    { selling_price: 1000, quantity: 2 },
    { selling_price: 333.33, quantity: 1 },
    { selling_price: 666.67, quantity: 1 }
  ]

  const { shippingTotalAllocated } = allocateShippingAcrossItems(shippingTotal, items)
  const allocatedDiff = Math.abs(shippingTotalAllocated - shippingTotal)

  assert(allocatedDiff < 0.01, `Shipping allocation mismatch. diff=${allocatedDiff}`)

  // Scenario 1 GST: rounded per-item.
  let gstSum = 0
  for (const it of items) {
    it.gstAmount = computeGstAmount(it.selling_price)
    gstSum += it.gstAmount
  }

  const subtotal = items.reduce((s, it) => s + it.selling_price, 0)
  const gstOnSubtotal = computeGstAmount(subtotal)
  const gstDiff = Math.abs(gstSum - gstOnSubtotal)
  assert(gstDiff < 0.05, `GST allocation drift too high. diff=${gstDiff}`)
}

// Scenario 2: sumSelling <= 0, equal distribution fallback.
{
  const shippingTotal = 99
  const items = [{ selling_price: 0 }, { selling_price: 0 }]
  const { shippingTotalAllocated } = allocateShippingAcrossItems(shippingTotal, items)
  assert(Math.abs(shippingTotalAllocated - shippingTotal) < 0.01, 'Shipping allocation fallback mismatch')
}

console.log('shipping_tax_validation OK')

