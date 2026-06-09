import { sendTemplatedMail } from './mailService.js'
import * as templates from './emailTemplates.js'

export async function sendUserSignupOtp(to, otp, name) {
    const { subject, text, html } = templates.userSignupOtp({ otp, name })
    return sendTemplatedMail({ to, subject, text, html })
}

export async function sendUserForgotOtp(to, otp, name) {
    const { subject, text, html } = templates.userForgotOtp({ otp, name })
    return sendTemplatedMail({ to, subject, text, html })
}

export async function sendVendorLoginOtp(to, otp) {
    const { subject, text, html } = templates.vendorLoginOtp({ otp, email: to })
    return sendTemplatedMail({ to, subject, text, html })
}

export async function sendAdminLoginAlert(email) {
    const { subject, text, html } = templates.adminLoginAlert({ email })
    const notifyTo = process.env.ADMIN_MAIL || email
    return sendTemplatedMail({ to: notifyTo, subject, text, html })
}

export async function sendAdminWelcome(email) {
    const { subject, text, html } = templates.adminWelcome({ email })
    return sendTemplatedMail({ to: email, subject, text, html })
}

export async function sendAdminNewRfq(details) {
    if (!process.env.ADMIN_MAIL) return false
    const { subject, text, html } = templates.adminNewRfq(details)
    return sendTemplatedMail({ to: process.env.ADMIN_MAIL, subject, text, html })
}

export async function sendAdminPlanRequest(details) {
    if (!process.env.ADMIN_MAIL) return false
    const { subject, text, html } = templates.adminPlanRequest(details)
    return sendTemplatedMail({ to: process.env.ADMIN_MAIL, subject, text, html })
}
