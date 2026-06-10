import express from "express";
import users from './Routes/users.js'
import admin from './Routes/admin.js'
import vendor from './Routes/vendor.js'
import cors from 'cors'
import db from "./Config/Connection.js";
import bodyParser from 'body-parser'
import * as dotenv from 'dotenv'
import { seedDefaultAdmin } from './Helpers/seedAdmin.js'
import { isS3Enabled } from './Helpers/s3Client.js'
import { getMailProvider, isMailConfigured } from './Helpers/mailService.js'
import { ensureOtpTtlIndex } from './Helpers/otpIndex.js'
dotenv.config()

var app = express()

var port = process.env.PORT || 5000
let dbConnected = false

const corsOrigins = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

db.connect((err) => {
    if (err) {
        dbConnected = false
        console.log("Connection Error : ", err)
    }
    else {
        dbConnected = true
        console.log('Database Connected')
        if (isS3Enabled()) {
            console.log('File storage: AWS S3')
        } else {
            console.log('File storage: local disk (./uploads)')
        }
        if (isMailConfigured()) {
            console.log(`Email: ${getMailProvider()} (configured)`)
        } else {
            console.warn('Email: not configured — OTP emails will fail')
        }
        ensureOtpTtlIndex(db.get()).catch((e) => console.error('OTP index:', e.message))
        seedDefaultAdmin(db.get()).catch((e) => console.error(e))
    }
})

app.use(corsOrigins.length > 0
    ? cors({ origin: corsOrigins, credentials: true })
    : cors())

app.get('/health', (req, res) => {
    res.status(200).json({
        ok: true,
        db: dbConnected,
        storage: isS3Enabled() ? 's3' : 'local',
    })
})

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

if (!isS3Enabled()) {
    app.use('/uploads', express.static('./uploads'))
    app.use(express.static('./uploads'))
}

app.use((req, res, next) => {
    if (!dbConnected || !db.get()) {
        return res.status(503).json({ status: false, message: 'Database is unavailable. Please try again shortly.' })
    }
    next()
})

app.use('/api/users/', users)
app.use('/api/admin/', admin)
app.use('/api/vendor/', vendor)

app.listen(port, (err) => {
    if (err) console.log(err);
    console.log("Server listening on PORT", port);
})