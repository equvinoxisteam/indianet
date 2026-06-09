import Eye from '@/Assets/Eye'
import EyeHide from '@/Assets/EyeHide'
import BrandLogo from '@/Component/Common/BrandLogo'
import Server from '@/Config/Server'
import { useRouter } from 'next/router'
import React, { useRef, useState } from 'react'
import toast from 'react-hot-toast';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const passRef = useRef()
    const [passShow, setPassShow] = useState(false)
    const [loading, setLoading] = useState(false)

    const navigate = useRouter()

    const formHandle = (e) => {
        e.preventDefault()
        if (loading) return
        setLoading(true)
        Server.post('/admin/login', formData).then((res) => {
            if (res.data.admin) {
                localStorage.setItem('adminToken', res.data.admin)
                toast.success('Login successful')
                navigate.push('/admin/dashboard')
            } else {
                toast.error("Email or password is incorrect")
            }
        }).catch(() => {
            toast.error("Could not sign in. Please try again.")
        }).finally(() => {
            setLoading(false)
        })
    }

    return (
        <div className='Login'>
            <form onSubmit={formHandle} className="adminAuthForm">
                <div className="text-center mb-3">
                    <span className="authChip">Admin Portal</span>
                </div>
                <div className="text-center mb-3">
                    <BrandLogo href="/" />
                    <h4>Welcome back</h4>
                    <p className="small text-muted mb-0 mt-2">Sign in to manage vendors, products and orders</p>
                </div>
                <div className="row">
                    <div className="col-12">
                        <label>Email address</label>
                        <input type="email" value={formData.email} onChange={(e) => {
                            setFormData({
                                ...formData,
                                email: e.target.value
                            })
                        }} placeholder='admin@indianet.com' autoComplete="email" required />
                    </div>
                    <div className="col-12">
                        <label>Password</label>
                        <div className="passGrid">
                            <input type="password" value={formData.password} onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    password: e.target.value
                                })
                            }} ref={passRef} autoComplete="current-password" required />
                            {
                                passShow ? <button type='button' data-for="pass" onClick={() => {
                                    setPassShow(false)
                                    passRef.current.type = "password"
                                }}> <EyeHide color={'#ffffff'} /> </button>
                                    : <button type='button' data-for="pass" onClick={() => {
                                        setPassShow(true)
                                        passRef.current.type = "text"
                                    }}> <Eye color={'#ffffff'} /> </button>
                            }
                        </div>
                    </div>
                    <div className="col-12">
                        <button type='submit' disabled={loading}>
                            {loading ? 'Signing in...' : 'Login'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default Login