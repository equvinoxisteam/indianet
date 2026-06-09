import * as dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { isS3Enabled, getPublicFileBaseUrl } from '../Helpers/s3Client.js'
import { isMailConfigured } from '../Helpers/mailService.js'
import nodemailer from 'nodemailer'

dotenv.config()

const required = [
    'PORT', 'DB_URL', 'DB_NAME', 'JWT_SECRET',
    'MAIL_USER', 'MAIL_PASS', 'MAIL_FROM',
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
    const t = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS },
    })
    await t.verify()
}

async function main() {
    console.log('=== SERVER .env checklist ===\n')

    for (const key of required) {
        const val = process.env[key]
        check(key, !!val && String(val).trim().length > 0)
    }

    check('MAIL_USER matches MAIL_FROM', process.env.MAIL_FROM?.includes(process.env.MAIL_USER))
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

    if (isMailConfigured()) {
        try {
            await testMail()
            console.log('OK  Gmail SMTP — credentials verified')
        } catch (e) {
            console.log('FAIL Gmail —', e.message)
        }
    } else {
        console.log('FAIL Gmail — MAIL_USER/MAIL_PASS missing')
    }

    console.log('\n=== CLIENT .env.local (check manually) ===')
    console.log('ServerUrl should be: http://localhost:3000/api → use http://localhost:5000/api')
    console.log('ServerId should match S3_PUBLIC_URL')
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})
