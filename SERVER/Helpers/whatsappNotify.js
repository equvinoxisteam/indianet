function normalizePhone(num) {
    if (!num) return null
    const raw = String(num).trim()
    if (raw.startsWith('+')) return raw
    const d = raw.replace(/\D/g, '')
    if (d.length === 10) return `+91${d}`
    if (d.length === 12 && d.startsWith('91')) return `+${d}`
    return d.length >= 10 ? `+${d}` : null
}

/**
 * Send WhatsApp via Twilio (TWILIO_*) or generic API (WHATSAPP_API_URL + WHATSAPP_API_KEY).
 */
export async function sendWhatsAppMessage({ to, body }) {
    if (!to || !body) return false
    const phone = normalizePhone(to)
    if (!phone) return false

    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_FROM) {
        try {
            const sid = process.env.TWILIO_ACCOUNT_SID
            const auth = Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64')
            const params = new URLSearchParams({
                From: process.env.TWILIO_WHATSAPP_FROM,
                To: `whatsapp:${phone}`,
                Body: body,
            })
            const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
                method: 'POST',
                headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params,
            })
            if (res.ok) return true
            console.error('[whatsapp] Twilio error:', await res.text())
        } catch (err) {
            console.error('[whatsapp] Twilio failed:', err?.message || err)
        }
    }

    if (process.env.WHATSAPP_API_URL) {
        try {
            const headers = { 'Content-Type': 'application/json' }
            if (process.env.WHATSAPP_API_KEY) {
                headers.Authorization = `Bearer ${process.env.WHATSAPP_API_KEY}`
            }
            const res = await fetch(process.env.WHATSAPP_API_URL, {
                method: 'POST',
                headers,
                body: JSON.stringify({ phone, to: phone, message: body, text: body }),
            })
            if (res.ok) return true
            console.error('[whatsapp] API error:', await res.text())
        } catch (err) {
            console.error('[whatsapp] API failed:', err?.message || err)
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        console.warn('[whatsapp] Skipped (not configured):', phone, body.slice(0, 100))
    }
    return false
}
