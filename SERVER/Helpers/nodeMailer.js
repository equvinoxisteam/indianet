import { sendMail } from './mailTransport.js'

/** @deprecated Prefer sendTemplatedMail from mailService.js */
export default {
    sendMail: (options) => sendMail(options),
}
