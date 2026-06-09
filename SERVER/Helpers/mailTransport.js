import nodemailer from 'nodemailer'
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

function parseFromAddress(from) {
    const raw = from || process.env.MAIL_FROM || `Indianet <${process.env.MAIL_USER}>`
    const match = String(raw).match(/^(.+?)\s*<([^>]+)>$/)
    if (match) {
        return { name: match[1].trim(), email: match[2].trim(), formatted: raw }
    }
    return { email: String(raw).trim(), formatted: String(raw).trim() }
}

export function getMailProvider() {
    const explicit = (process.env.MAIL_PROVIDER || '').toLowerCase().trim()
    if (explicit === 'resend' || explicit === 'ses' || explicit === 'smtp') return explicit
    if (process.env.RESEND_API_KEY) return 'resend'
    if (process.env.MAIL_USE_SES === 'true' && process.env.AWS_ACCESS_KEY_ID) return 'ses'
    return 'smtp'
}

export function isMailConfigured() {
    const provider = getMailProvider()
    if (provider === 'resend') return !!process.env.RESEND_API_KEY
    if (provider === 'ses') {
        return !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY)
    }
    return !!(process.env.MAIL_USER && process.env.MAIL_PASS)
}

let smtpTransporter = null

function getSmtpTransporter() {
    if (!smtpTransporter) {
        smtpTransporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST || 'smtp.gmail.com',
            port: Number(process.env.MAIL_PORT || 465),
            secure: process.env.MAIL_SECURE !== 'false',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
            connectionTimeout: 15000,
            greetingTimeout: 15000,
            socketTimeout: 20000,
        })
    }
    return smtpTransporter
}

let sesClient = null

function getSesClient() {
    if (!sesClient) {
        sesClient = new SESClient({
            region: process.env.AWS_SES_REGION || process.env.AWS_REGION || 'eu-north-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        })
    }
    return sesClient
}

async function sendViaSmtp({ from, to, subject, text, html }) {
    await getSmtpTransporter().sendMail({ from, to, subject, text, html })
}

async function sendViaResend({ from, to, subject, text, html }) {
    const fromAddr = parseFromAddress(from)
    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: fromAddr.formatted,
            to: [to],
            subject,
            html,
            text,
        }),
    })

    if (!res.ok) {
        const body = await res.text()
        throw new Error(`Resend API ${res.status}: ${body}`)
    }
}

async function sendViaSes({ from, to, subject, text, html }) {
    const fromAddr = parseFromAddress(from)
    const source = fromAddr.name
        ? `${fromAddr.name} <${fromAddr.email}>`
        : fromAddr.email

    await getSesClient().send(
        new SendEmailCommand({
            Source: source,
            Destination: { ToAddresses: [to] },
            Message: {
                Subject: { Data: subject, Charset: 'UTF-8' },
                Body: {
                    ...(html ? { Html: { Data: html, Charset: 'UTF-8' } } : {}),
                    ...(text ? { Text: { Data: text, Charset: 'UTF-8' } } : {}),
                },
            },
        })
    )
}

/**
 * Send email via HTTPS API (Resend / SES) or SMTP (local dev / Railway Pro).
 * Railway Hobby/Free blocks outbound SMTP — use MAIL_PROVIDER=resend or ses.
 */
export async function sendMail({ from, to, subject, text, html }) {
    const provider = getMailProvider()
    const fromHeader = from || process.env.MAIL_FROM || `Indianet <${process.env.MAIL_USER}>`
    const payload = { from: fromHeader, to, subject, text, html }

    if (provider === 'resend') {
        await sendViaResend(payload)
        return
    }
    if (provider === 'ses') {
        await sendViaSes(payload)
        return
    }
    await sendViaSmtp(payload)
}
