import BrandLogo from '@/Component/Common/BrandLogo'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import Server, { apiUnreachableMessage } from '../../../Config/Server'
import toast from 'react-hot-toast';

function LoginComp() {
    useEffect(() => {
        document.body.style.background = '#f0f5fa'
        return () => {
            document.body.style.background = ''
        }
    }, [])

    const navigate = useRouter()

    const [formData, setFormData] = useState({
        email: '',
        otp: ''
    })

    const [otpSent, setOtpSent] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const formHandle = (e) => {
        e.preventDefault()
        if (submitting) return
        setSubmitting(true)
        if (otpSent) {
            Server.post('/vendor/login', formData).then((response) => {
                if (response.data.request) {
                    setOtpSent(false)
                    toast.error('Your seller account is still pending admin approval.')
                } else {
                    if (response.data.resent) {
                        if (response.data.mail) {
                            toast.success('OTP expired. A new code has been sent to your email.')
                        } else {
                            toast.error('OTP expired. Could not send a new code — try Resend code.')
                        }
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
            }).finally(() => {
                setSubmitting(false)
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
                        toast.error("Otp send failed")
                    }
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Error')
            }).finally(() => {
                setSubmitting(false)
            })
        }
    }

    return (
        <div className='LoginComp'>
            <div className="vendorAuthShell">
                <div className="vendorAuthCard">
                    <div className="modal-header-section text-center pb-4">
                        <BrandLogo href="/" />
                        <h2 className="vendorAuthTitle mt-3 mb-1">
                            {otpSent ? 'Verify OTP' : 'Seller Login'}
                        </h2>
                        <p className="small text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                            {otpSent ? 'Enter the code sent to your email' : 'Sign in to manage your vendor dashboard'}
                        </p>
                    </div>
                    
                    <form onSubmit={formHandle}>
                        <div className="form-group">
                            <label>Email Address</label>
                            <input type="email" value={formData.email} onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value })
                            }} placeholder='name@company.com' required />
                        </div>
                        {otpSent && (
                            <div className='form-group otp-section'>
                                <label>Verification Code</label>
                                <input type="text" inputMode="numeric" value={formData.otp} onChange={(e) => {
                                    setFormData({ ...formData, otp: e.target.value.replace(/\D/g, '') })
                                }} placeholder='6-digit code' required />
                                <button type='button' className="btn-resend" onClick={() => {
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
                                }}>Resend code</button>
                            </div>
                        )}
                        <div className="pt-2">
                            <button type='submit' className="btn-vendor-primary" disabled={submitting}>
                                {submitting ? 'Please wait...' : otpSent ? 'Verify & Login' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                    <p className="vendorAuthFooter">
                        New seller?
                        <button type="button" className="link-register" onClick={() => {
                            document.body.style.background = '#f0f5fa'
                            navigate.push('/vendor/register')
                        }}>Register your business</button>
                    </p>
                </div>
            </div>
        </div>

    )
}

export default LoginComp
