import Razorpay from 'razorpay'
import crypto from 'crypto'

let instance = null

function getInstance() {
    const keyId = process.env.RAZORPAY_ID
    const keySecret = process.env.RAZORPAY_SECREt
    if (!keyId || !keySecret) return null
    if (!instance) {
        instance = new Razorpay({ key_id: keyId, key_secret: keySecret })
    }
    return instance
}

export const paymentVery = (razorpayRes) => {
    return new Promise((resolve, reject) => {
        if (!process.env.RAZORPAY_SECREt) {
            reject()
            return
        }
        let body = razorpayRes.razorpay_order_id + "|" + razorpayRes.razorpay_payment_id;

        let expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_SECREt)
            .update(body.toString())
            .digest('hex')

        if (expectedSignature === razorpayRes.razorpay_signature) {
            resolve(true)
        } else {
            reject()
        }

    })
}

export const refundPayment = ({ payId, price }) => {
    return new Promise((resolve, reject) => {
        const rzp = getInstance()
        if (!rzp) {
            reject()
            return
        }
        rzp.payments.refund(payId, {
            "amount": price * 100,
            "speed": "normal",
        }).then((done) => {
            resolve()
        }).catch((err) => {
            reject()
        })
    })
}

export const generateRazorpay = (amount, callback) => {
    const rzp = getInstance()
    if (!rzp) {
        callback(null)
        return
    }
    var options = {
        amount: amount,
        currency: "INR",
        receipt: `${Date.now() + Math.random()}`
    };
    rzp.orders.create(options, function (err, order) {
        if (!err) {
            callback(order.id)
        } else {
            callback(null)
        }
    });
}

export const fetchPayment = (paymentId, callback) => {
    const rzp = getInstance()
    if (!rzp) {
        callback(null)
        return
    }
    rzp.payments.fetch(paymentId, { "expand[]": "card" }, (err, done) => {
        if (!err) {
            callback(done.amount)
        } else {
            callback(null)
        }
    })
}
