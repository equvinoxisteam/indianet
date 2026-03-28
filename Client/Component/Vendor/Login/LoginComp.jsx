import BrandLogo from '@/Component/Common/BrandLogo'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Server, { apiUnreachableMessage } from '../../../Config/Server'
import toast from 'react-hot-toast';

function LoginComp() {
    useEffect(() => {
        document.body.style.background = '#f0f5fa'
    }, [])

    const navigate = useRouter()

    const [formData, setFormData] = useState({
        email: '',
        otp: ''
    })

    const [otpSent, setOtpSent] = useState(false)

    const formHandle = (e) => {
        e.preventDefault()
        if (otpSent) {
            Server.post('/vendor/login', formData).then((response) => {
                if (response.data.request) {
                    setOtpSent(false)
                    toast.error('Your seller account is still pending admin approval.')
                } else {
                    if (response.data.resent) {
                        toast.success('Resent OTP')
                    } else {
                        if (response.data.status) {
                            localStorage.setItem('vendorToken', response.data.token)
                            document.body.style.background = '#f0f5fa'
                            navigate.push('/vendor/dashboard')
                            toast.success("Login successful")
                        } else {
                            toast.error("Wrong OTP")
                        }
                    }
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Error')
            })
        } else {
            Server.post('/vendor/sentOtpLogin', formData).then((res) => {
                if (res.data.request) {
                    setOtpSent(false)
                    toast.error('Your seller account is still pending admin approval.')
                } else {
                    if (res.data.mail) {
                        setOtpSent(true)
                        toast.success("Otp Sent Successfully")
                    } else {
                        setOtpSent(false)
                        toast.success("Otp Sent Failed")
                    }
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Error')
            })
        }
    }

    return (
        <div className='LoginComp'>
            <div className="vendorAuthShell">
                <div className="vendorAuthCard">
                    <div className="text-center pb-2">
                        <BrandLogo href="/" />
                        <p className="vendorAuthSub mb-0 mt-2">Seller login</p>
                    </div>
                    <h3 className="vendorAuthTitle">Sign in</h3>
                    <form onSubmit={formHandle}>
                        <div>
                            <label>Email</label>
                            <input type="email" value={formData.email} onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value })
                            }} placeholder='Registered email' required />
                        </div>
                        {otpSent && (
                            <div className='pt-3'>
                                <label>OTP</label>
                                <input type="text" inputMode="numeric" value={formData.otp} onChange={(e) => {
                                    setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })
                                }} placeholder='Enter OTP' required />
                                <button type='button' className="btn-resend mt-2" onClick={() => {
                                    Server.post('/vendor/sentOtpLogin', formData).then((res) => {
                                        if (res.data.request) {
                                            setOtpSent(false)
                                            toast.error('Your seller account is still pending admin approval.')
                                        } else if (res.data.mail) {
                                            toast.success("OTP sent")
                                        } else {
                                            toast.error("OTP send failed")
                                        }
                                    }).catch((err) => toast.error(apiUnreachableMessage(err) || 'Error'))
                                }}>Resend OTP</button>
                            </div>
                        )}
                        <div className="pt-4">
                            {otpSent
                                ? <button type='submit' className="btn-vendor-primary">Login</button>
                                : <button type='submit' className="btn-vendor-primary">Send OTP</button>}
                        </div>
                    </form>
                    <p className="vendorAuthFooter">
                        Not a member?{' '}
                        <button type="button" className="link-register" onClick={() => {
                            document.body.style.background = '#f0f5fa'
                            navigate.push('/vendor/register')
                        }}>Register</button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default LoginComp
