import BrandLogo from '@/Component/Common/BrandLogo'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import Server from '../../../Config/Server'
import toast from 'react-hot-toast';

function digitsOnly(s) {
    return String(s ?? '').replace(/\D/g, '')
}

function RegisterComp() {
    useEffect(() => {
        document.body.style.background = '#f0f5fa'
    }, [])

    const navigate = useRouter()

    const [formData, setFormData] = useState({
        companyName: '',
        sellingElsewhere: 'No',
        sellingElsewhereDetail: '',
        adharName: '',
        adharNumber: '',
        email: '',
        number: '',
        panNumber: '',
        gstin: '',
        locality: '',
        pinCode: '',
        address: '',
        city: '',
        state: 'Andhra Pradesh',
        bankAccOwner: '',
        bankName: '',
        bankAccNumber: '',
        bankIFSC: '',
        bankBranchName: '',
        bankBranchNumber: '',
    })

    const validate = () => {
        if (!formData.companyName.trim()) {
            toast.error('Please enter your company / business name')
            return false
        }
        if (formData.sellingElsewhere === 'Other' && !formData.sellingElsewhereDetail.trim()) {
            toast.error('Please specify where you sell (or add details)')
            return false
        }
        const adhar = digitsOnly(formData.adharNumber)
        const mobile = digitsOnly(formData.number)
        const pin = digitsOnly(formData.pinCode)
        const pan = String(formData.panNumber || '').replace(/\s/g, '').toUpperCase()

        if (adhar.length !== 12) {
            toast.error('Aadhaar must be exactly 12 digits (avoid leading-zero issues: type all 12 digits)')
            return false
        }
        if (mobile.length !== 10) {
            toast.error('Mobile number must be 10 digits')
            return false
        }
        if (pan.length !== 10) {
            toast.error('PAN must be 10 characters')
            return false
        }
        if (pin.length !== 6) {
            toast.error('PIN code must be 6 digits')
            return false
        }
        return true
    }

    const formHandle = (e) => {
        e.preventDefault()
        if (!validate()) return

        const payload = {
            ...formData,
            adharNumber: digitsOnly(formData.adharNumber),
            number: digitsOnly(formData.number),
            pinCode: digitsOnly(formData.pinCode),
            panNumber: String(formData.panNumber || '').replace(/\s/g, '').toUpperCase(),
        }

        Server.post('/vendor/register', payload).then((res) => {
            if (res.data.found) {
                toast.error('Vendor Already Found')
            } else {
                toast.success('Vendor Successfully Requested')
                navigate.push('/vendor/login')
            }
        }).catch(() => {
            toast.error('Registration failed. Check server is running and try again.')
        })
    }

    return (
        <div className='RegisterComp'>
            <div className="registerShell">
                <div className="registerCard">
                    <div className="text-center pb-3">
                        <BrandLogo href="/" />
                        <p className="registerSub mb-0 mt-2">Seller registration</p>
                    </div>
                    <h3 className="registerTitle">Register as a seller</h3>
                    <form onSubmit={formHandle}>
                        <h6>Business</h6>
                        <div aria-label="business">
                            <div>
                                <label>Company / business name</label>
                                <input type="text" placeholder="Registered business name"
                                    value={formData.companyName} onChange={(e) => {
                                        setFormData({ ...formData, companyName: e.target.value })
                                    }} required />
                            </div>
                            <div className="pt-3">
                                <label>Do you sell on other platforms?</label>
                                <select value={formData.sellingElsewhere} onChange={(e) => {
                                    setFormData({
                                        ...formData,
                                        sellingElsewhere: e.target.value,
                                        sellingElsewhereDetail: e.target.value === 'Other' ? formData.sellingElsewhereDetail : ''
                                    })
                                }} >
                                    <option value="No">No</option>
                                    <option value="Amazon">Amazon</option>
                                    <option value="Flipkart">Flipkart</option>
                                    <option value="Meesho">Meesho</option>
                                    <option value="Own website">Own website / store</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            {formData.sellingElsewhere === 'Other' && (
                                <div className="pt-3">
                                    <label>Please specify</label>
                                    <input type="text" placeholder="e.g. offline markets, other marketplace"
                                        value={formData.sellingElsewhereDetail} onChange={(e) => {
                                            setFormData({ ...formData, sellingElsewhereDetail: e.target.value })
                                        }} required />
                                </div>
                            )}
                        </div>

                        <h6 className="pt-3">User Details</h6>
                        <div aria-label='user-details'>
                            <div>
                                <label>Name on Aadhaar</label>
                                <input type="text" placeholder='Full name as on Aadhaar'
                                    value={formData.adharName} onChange={(e) => {
                                        setFormData({ ...formData, adharName: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Aadhaar number</label>
                                <input type="text" inputMode="numeric" autoComplete="off" maxLength={12} placeholder='12-digit Aadhaar'
                                    value={formData.adharNumber} onChange={(e) => {
                                        const v = digitsOnly(e.target.value).slice(0, 12)
                                        setFormData({ ...formData, adharNumber: v })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Email</label>
                                <input type="email" placeholder='Email'
                                    value={formData.email} onChange={(e) => {
                                        setFormData({ ...formData, email: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Mobile</label>
                                <input type="tel" inputMode="numeric" maxLength={10} placeholder='10-digit mobile'
                                    value={formData.number} onChange={(e) => {
                                        const v = digitsOnly(e.target.value).slice(0, 10)
                                        setFormData({ ...formData, number: v })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>PAN</label>
                                <input type="text" placeholder='10-character PAN' maxLength={10}
                                    value={formData.panNumber} onChange={(e) => {
                                        setFormData({ ...formData, panNumber: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10) })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>GSTIN (optional)</label>
                                <input type="text" placeholder='GSTIN if applicable'
                                    value={formData.gstin} onChange={(e) => {
                                        setFormData({ ...formData, gstin: e.target.value })
                                    }} />
                            </div>
                        </div>

                        <h6 className='pt-3'>Address</h6>
                        <div aria-label='address'>
                            <div>
                                <label>Locality</label>
                                <input type="text" placeholder='Locality'
                                    value={formData.locality} onChange={(e) => {
                                        setFormData({ ...formData, locality: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>PIN code</label>
                                <input type="text" inputMode="numeric" maxLength={6} placeholder='6-digit PIN'
                                    value={formData.pinCode} onChange={(e) => {
                                        const v = digitsOnly(e.target.value).slice(0, 6)
                                        setFormData({ ...formData, pinCode: v })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Address</label>
                                <textarea placeholder='Full address' rows={3}
                                    value={formData.address} onChange={(e) => {
                                        setFormData({ ...formData, address: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>City / District / Town</label>
                                <input type="text" placeholder='City'
                                    value={formData.city} onChange={(e) => {
                                        setFormData({ ...formData, city: e.target.value })
                                    }} required />
                            </div>
                            <div className="pt-3">
                                <label>State</label>
                                <select value={formData.state} onChange={(e) => {
                                    setFormData({ ...formData, state: e.target.value })
                                }} >
                                    <option value="Andhra Pradesh">Andhra Pradesh</option>
                                    <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                                    <option value="Assam">Assam</option>
                                    <option value="Bihar">Bihar</option>
                                    <option value="Chandigarh">Chandigarh</option>
                                    <option value="Chhattisgarh">Chhattisgarh</option>
                                    <option value="Dadar and Nagar Haveli">Dadar and Nagar Haveli</option>
                                    <option value="Daman and Diu">Daman and Diu</option>
                                    <option value="Delhi">Delhi</option>
                                    <option value="Lakshadweep">Lakshadweep</option>
                                    <option value="Puducherry">Puducherry</option>
                                    <option value="Goa">Goa</option>
                                    <option value="Gujarat">Gujarat</option>
                                    <option value="Haryana">Haryana</option>
                                    <option value="Himachal Pradesh">Himachal Pradesh</option>
                                    <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                                    <option value="Jharkhand">Jharkhand</option>
                                    <option value="Karnataka">Karnataka</option>
                                    <option value="Kerala">Kerala</option>
                                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                                    <option value="Maharashtra">Maharashtra</option>
                                    <option value="Manipur">Manipur</option>
                                    <option value="Meghalaya">Meghalaya</option>
                                    <option value="Mizoram">Mizoram</option>
                                    <option value="Nagaland">Nagaland</option>
                                    <option value="Odisha">Odisha</option>
                                    <option value="Punjab">Punjab</option>
                                    <option value="Rajasthan">Rajasthan</option>
                                    <option value="Sikkim">Sikkim</option>
                                    <option value="Tamil Nadu">Tamil Nadu</option>
                                    <option value="Telangana">Telangana</option>
                                    <option value="Tripura">Tripura</option>
                                    <option value="Uttar Pradesh">Uttar Pradesh</option>
                                    <option value="Uttarakhand">Uttarakhand</option>
                                    <option value="West Bengal">West Bengal</option>
                                </select>
                            </div>
                        </div>

                        <h6 className='pt-3'>Bank details</h6>
                        <div aria-label='account-details'>
                            <div>
                                <label>Account holder name</label>
                                <input type="text" placeholder='Name as per bank'
                                    value={formData.bankAccOwner} onChange={(e) => {
                                        setFormData({ ...formData, bankAccOwner: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Bank name</label>
                                <input type="text" placeholder='Bank name'
                                    value={formData.bankName} onChange={(e) => {
                                        setFormData({ ...formData, bankName: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Account number</label>
                                <input type="text" inputMode="numeric" placeholder='Account number'
                                    value={formData.bankAccNumber} onChange={(e) => {
                                        setFormData({ ...formData, bankAccNumber: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>IFSC</label>
                                <input type="text" placeholder='IFSC'
                                    value={formData.bankIFSC} onChange={(e) => {
                                        setFormData({ ...formData, bankIFSC: e.target.value.toUpperCase() })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Branch name</label>
                                <input type="text" placeholder='Branch'
                                    value={formData.bankBranchName} onChange={(e) => {
                                        setFormData({ ...formData, bankBranchName: e.target.value })
                                    }} required />
                            </div>
                            <div className='pt-3'>
                                <label>Branch phone (optional)</label>
                                <input type="text" placeholder='Branch contact'
                                    value={formData.bankBranchNumber} onChange={(e) => {
                                        setFormData({ ...formData, bankBranchNumber: e.target.value })
                                    }} />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button type='submit' className="btn-primary-register">Submit registration</button>
                        </div>
                    </form>
                    <p className="registerFooter">
                        Already a member?{' '}
                        <button type="button" className="link-login" onClick={() => navigate.push('/vendor/login')}>Login</button>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RegisterComp
