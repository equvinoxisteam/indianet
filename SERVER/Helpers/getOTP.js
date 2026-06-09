export default (done) => {
    const digits = '1234567890'
    let otp = ''
    for (let i = 0; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    done(otp)
}
