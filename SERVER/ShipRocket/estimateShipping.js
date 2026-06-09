import axiosLib from 'axios'
import tokenShipRocket from './token.js'

const axios = axiosLib.default

function toNumberOrNull(v) {
    const n = Number(v)
    return Number.isFinite(n) ? n : null
}

function extractRate(company) {
    // ShipRocket payload fields can differ; try common variants.
    const candidates = [
        company?.rate,
        company?.shipping_charge,
        company?.shipping_charges,
        company?.total_amount,
        company?.amount,
        company?.service_cost,
        company?.rate_amount
    ]

    for (const c of candidates) {
        const n = toNumberOrNull(c)
        if (n !== null) return n
    }

    return null
}

export default async function estimateShippingCost({
    pickup_postcode,
    delivery_postcode,
    cod = false,
    weight = 2.5,
    length = 10,
    breadth = 15,
    height = 20,
    mode = 'Surface'
}) {
    if (!pickup_postcode || !delivery_postcode) {
        throw new Error('pickup_postcode and delivery_postcode are required')
    }

    const token = await tokenShipRocket()

    const params = new URLSearchParams({
        pickup_postcode: String(pickup_postcode),
        delivery_postcode: String(delivery_postcode),
        weight: String(weight),
        cod: cod ? '1' : '0',
        mode: mode
    })

    // Include dimensions when provided.
    const dimCandidates = { length, breadth, height }
    for (const [k, v] of Object.entries(dimCandidates)) {
        const n = toNumberOrNull(v)
        if (n !== null) params.set(k, String(n))
    }

    const url = `https://apiv2.shiprocket.in/v1/external/courier/serviceability/?${params.toString()}`

    const response = await axios({
        method: 'GET',
        url,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        redirect: 'follow'
    }).catch(() => null)

    if (!response || !response.data) {
        return { available: false, shippingAmount: null }
    }

    const companies = response.data?.data?.available_courier_companies || []
    if (!Array.isArray(companies) || companies.length === 0) {
        return { available: false, shippingAmount: null }
    }

    const rates = companies
        .map(extractRate)
        .filter((n) => n !== null)

    if (rates.length === 0) {
        // Fallback to first company if structure differs.
        const firstRate = extractRate(companies[0])
        return { available: Boolean(firstRate !== null), shippingAmount: firstRate }
    }

    const shippingAmount = Math.min(...rates)
    return { available: true, shippingAmount }
}

