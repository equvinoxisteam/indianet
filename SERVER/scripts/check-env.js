import * as dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { isS3Enabled, getPublicFileBaseUrl } from '../Helpers/s3Client.js'
import { isMailConfigured, getMailProvider } from '../Helpers/mailService.js'
import { sendMail } from '../Helpers/mailTransport.js'

dotenv.config()

const required = [
    'PORT', 'DB_URL', 'DB_NAME', 'JWT_SECRET',
    'MAIL_FROM',
    'ADMIN_MAIL', 'ADMIN_EMAIL', 'ADMIN_PASSWORD',
    'AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'AWS_S3_BUCKET', 'S3_PUBLIC_URL',
    'CLIENT_URL', 'CORS_ORIGINS',
]

function check(name, ok, note = '') {
    console.log(`${ok ? 'OK' : 'MISSING'}  ${name}${note ? ` — ${note}` : ''}`)
}

async function testMongo() {
    const client = new MongoClient(process.env.DB_URL, { serverSelectionTimeoutMS: 8000 })
    await client.connect()
    await client.db(process.env.DB_NAME).command({ ping: 1 })
    await client.close()
}

async function testMail() {
    const to = process.env.ADMIN_MAIL || process.env.GMAIL_USER || process.env.MAIL_USER
    await sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject: 'Indianet mail test',
        text: 'If you received this, email is working.',
        html: '<p>If you received this, email is working.</p>',
    })
}

async function main() {
    console.log('=== SERVER .env checklist ===\n')

    for (const key of required) {
        const val = process.env[key]
        check(key, !!val && String(val).trim().length > 0)
    }

    check('MAIL_PROVIDER', !!process.env.MAIL_PROVIDER, 'use gmail on Railway')
    check('GMAIL_CLIENT_ID', !!process.env.GMAIL_CLIENT_ID, 'Gmail API OAuth')
    check('GMAIL_CLIENT_SECRET', !!process.env.GMAIL_CLIENT_SECRET, 'Gmail API OAuth')
    check('GMAIL_REFRESH_TOKEN', !!process.env.GMAIL_REFRESH_TOKEN, 'Gmail API OAuth')
    check('GMAIL_USER', !!(process.env.GMAIL_USER || process.env.MAIL_USER), 'sender account')
    if (process.env.GMAIL_USER) {
        check('GMAIL_USER matches MAIL_FROM', process.env.MAIL_FROM?.includes(process.env.GMAIL_USER))
    }
    check('SUPPORT_EMAIL', !!(process.env.SUPPORT_EMAIL || process.env.ADMIN_MAIL), 'optional but set')

  console.log('\n=== Optional (not required for your setup) ===')
    check('RAZORPAY_ID', !!process.env.RAZORPAY_ID, 'online pay — skipped')
    check('SHIPROCKET_EMAIL', !!process.env.SHIPROCKET_EMAIL, 'shipping — skipped')

    console.log('\n=== Live connectivity ===')

    try {
        await testMongo()
        console.log('OK  MongoDB Atlas — connected')
    } catch (e) {
        console.log('FAIL MongoDB —', e.message)
    }

    console.log(isS3Enabled() ? `OK  S3 — enabled (${getPublicFileBaseUrl()})` : 'FAIL S3 — not configured')

    console.log(`INFO mail provider: ${getMailProvider()}`)

    if (isMailConfigured()) {
        try {
            await testMail()
            console.log(`OK  Email (${getMailProvider()}) — test message sent to ${process.env.ADMIN_MAIL || process.env.MAIL_USER}`)
        } catch (e) {
            console.log(`FAIL Email (${getMailProvider()}) —`, e.message)
        }
    } else {
        console.log('FAIL Email — set GMAIL_* OAuth vars (see GMAIL_OAUTH_SETUP.md)')
    }

    console.log('\n=== CLIENT .env.local (check manually) ===')
    console.log('ServerUrl should be: http://localhost:3000/api → use http://localhost:5000/api')
    console.log('ServerId should match S3_PUBLIC_URL')
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
