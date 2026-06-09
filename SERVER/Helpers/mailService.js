import nodeMailer from './nodeMailer.js'

export function isMailConfigured() {
    return !!(process.env.MAIL_USER && process.env.MAIL_PASS)
}

/**
 * Send HTML + plain-text email via Gmail (MAIL_USER / MAIL_PASS app password).
 */
export async function sendTemplatedMail({ to, subject, text, html, from }) {
    if (!to) return false
    if (!isMailConfigured()) {
        console.warn('[mail] Skipped (MAIL_USER/MAIL_PASS not set):', subject)
        return false
    }

    try {
        await nodeMailer.sendMail({
            from: from || process.env.MAIL_FROM || `Indianet <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
            html,
        })
        return true
    } catch (err) {
        console.error('[mail] Send failed:', subject, err?.message || err)
        return false
    }
}
