import nodemailer from 'nodemailer'

/**
 * Gmail SMTP via App Password (not your normal Gmail password).
 * Create at: https://myaccount.google.com/apppasswords
 */
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
})

export default transporter