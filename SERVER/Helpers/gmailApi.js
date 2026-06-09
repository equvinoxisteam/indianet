function getGmailEnv() {
    return {
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        redirectUri: process.env.GMAIL_REDIRECT_URI || 'https://developers.google.com/oauthplayground',
        user: process.env.GMAIL_USER || process.env.MAIL_USER,
    }
}

export function isGmailApiConfigured() {
    const { clientId, clientSecret, refreshToken, user } = getGmailEnv()
    return !!(clientId && clientSecret && refreshToken && user)
}

let cachedAccessToken = null
let tokenExpiresAt = 0

async function getAccessToken() {
    if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
        return cachedAccessToken
    }

    const { clientId, clientSecret, refreshToken } = getGmailEnv()
    const body = new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
    })

    const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
    })

    const data = await res.json()
    if (!res.ok) {
        throw new Error(data.error_description || data.error || `Token refresh failed (${res.status})`)
    }

    cachedAccessToken = data.access_token
    tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000
    return cachedAccessToken
}

function encodeSubject(subject) {
    return `=?UTF-8?B?${Buffer.from(String(subject), 'utf8').toString('base64')}?=`
}

function buildRawMessage({ from, to, subject, text, html }) {
    const lines = [
        `From: ${from}`,
        `To: ${to}`,
        `Subject: ${encodeSubject(subject)}`,
        'MIME-Version: 1.0',
    ]

    if (html && text) {
        const boundary = `indianet_${Date.now()}`
        lines.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, '')
        lines.push(`--${boundary}`)
        lines.push('Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 7bit', '', text, '')
        lines.push(`--${boundary}`)
        lines.push('Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: 7bit', '', html, '')
        lines.push(`--${boundary}--`)
    } else if (html) {
        lines.push('Content-Type: text/html; charset=UTF-8', 'Content-Transfer-Encoding: 7bit', '', html)
    } else {
        lines.push('Content-Type: text/plain; charset=UTF-8', 'Content-Transfer-Encoding: 7bit', '', text || '')
    }

    return Buffer.from(lines.join('\r\n'))
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '')
}

/**
 * Send email via Gmail REST API (HTTPS). Works on Railway — no SMTP ports.
 */
export async function sendViaGmailApi({ from, to, subject, text, html }) {
    const accessToken = await getAccessToken()
    const raw = buildRawMessage({ from, to, subject, text, html })

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ raw }),
    })

    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
        const msg = data?.error?.message || JSON.stringify(data)
        throw new Error(`Gmail API ${res.status}: ${msg}`)
    }
}
