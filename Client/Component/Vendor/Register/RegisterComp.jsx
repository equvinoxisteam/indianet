import BrandLogo from '@/Component/Common/BrandLogo'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import Server from '../../../Config/Server'
import toast from 'react-hot-toast';

function digitsOnly(s) {
    return String(s ?? '').replace(/\D/g, '')
}

const COUNTRY_RULES = {
    India: {
        phoneMin: 10,
        phoneMax: 10,
        postalRegex: /^\d{6}$/,
        postalLabel: 'PIN Code',
        idLabel: 'Aadhaar number',
        idPlaceholder: '12-digit Aadhaar number'
    },
    'United States': {
        phoneMin: 10,
        phoneMax: 10,
        postalRegex: /^\d{5}(-\d{4})?$/,
        postalLabel: 'ZIP Code',
        idLabel: 'National ID / Tax ID',
        idPlaceholder: 'ID or tax number'
    },
    'United Kingdom': {
        phoneMin: 10,
        phoneMax: 11,
        postalRegex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
        postalLabel: 'Postcode',
        idLabel: 'National ID / Tax ID',
        idPlaceholder: 'ID or tax number'
    },
    UAE: {
        phoneMin: 9,
        phoneMax: 9,
        postalRegex: /^[A-Za-z0-9\- ]{3,12}$/,
        postalLabel: 'Postal Code',
        idLabel: 'National ID / Trade License',
        idPlaceholder: 'National ID or trade license no.'
    },
    Singapore: {
        phoneMin: 8,
        phoneMax: 8,
        postalRegex: /^\d{6}$/,
        postalLabel: 'Postal Code',
        idLabel: 'National ID / Tax ID',
        idPlaceholder: 'ID or tax number'
    }
}

const COUNTRY_OPTIONS = Object.keys(COUNTRY_RULES)

function normalizeText(s) {
    return String(s ?? '').trim().replace(/\s+/g, ' ')
}

function validEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function RegisterComp() {
    useEffect(() => {
        document.body.style.background = '#f0f5fa'
        return () => {
            document.body.style.background = ''
        }
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
        gstin: '',
        locality: '',
        pinCode: '',
        address: '',
        city: '',
        country: 'India',
        state: 'Andhra Pradesh',
    })

    const steps = [
        { id: 1, label: 'Business' },
        { id: 2, label: 'Identity' },
        { id: 3, label: 'Address' }
    ]

    const [step, setStep] = useState(1)
    const totalSteps = steps.length
    const [submitting, setSubmitting] = useState(false)

    const validateStep = (currentStep) => {
        const countryRule = COUNTRY_RULES[formData.country] || COUNTRY_RULES.India

        if (currentStep === 1) {
            if (normalizeText(formData.companyName).length < 3) {
                toast.error('Please enter your company / business name')
                return false
            }
            if (normalizeText(formData.companyName).length > 120) {
                toast.error('Company name is too long')
                return false
            }
            if (formData.sellingElsewhere === 'Other' && normalizeText(formData.sellingElsewhereDetail).length < 2) {
                toast.error('Please specify where you sell')
                return false
            }
        } else if (currentStep === 2) {
            if (normalizeText(formData.adharName).length < 3) {
                toast.error('Please enter name on Aadhaar')
                return false
            }
            if (formData.country === 'India' && digitsOnly(formData.adharNumber).length !== 12) {
                toast.error('Aadhaar must be exactly 12 digits')
                return false
            }
            if (formData.country !== 'India' && !/^[A-Za-z0-9\- ]{6,20}$/.test(normalizeText(formData.adharNumber))) {
                toast.error('Please enter a valid national ID / tax ID')
                return false
            }
            if (!validEmail(formData.email)) {
                toast.error('Please enter a valid email')
                return false
            }
            const phoneLength = digitsOnly(formData.number).length
            if (phoneLength < countryRule.phoneMin || phoneLength > countryRule.phoneMax) {
                toast.error(`Phone number must be ${countryRule.phoneMin === countryRule.phoneMax ? countryRule.phoneMin : `${countryRule.phoneMin}-${countryRule.phoneMax}`} digits for ${formData.country}`)
                return false
            }
            if (normalizeText(formData.gstin) && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(normalizeText(formData.gstin))) {
                toast.error('GSTIN format is invalid')
                return false
            }
        } else if (currentStep === 3) {
            if (!normalizeText(formData.locality) || !normalizeText(formData.address) || !normalizeText(formData.city)) {
                toast.error('Please fill all address fields')
                return false
            }
            if (!normalizeText(formData.state)) {
                toast.error('Please select your state/region')
                return false
            }
            if (!COUNTRY_OPTIONS.includes(formData.country)) {
                toast.error('Please select a valid country')
                return false
            }
            if (!countryRule.postalRegex.test(normalizeText(formData.pinCode))) {
                toast.error(`Enter a valid ${countryRule.postalLabel}`)
                return false
            }
        }
        return true
    }

    const nextStep = (e) => {
        e.preventDefault()
        if (validateStep(step)) {
            setStep(s => s + 1)
            window.scrollTo(0, 0)
        }
    }

    const prevStep = () => {
        setStep(s => s - 1)
        window.scrollTo(0, 0)
    }

    const formHandle = (e) => {
        e.preventDefault()
        if (!validateStep(3)) return
        if (submitting) return
        setSubmitting(true)

        const payload = {
            companyName: normalizeText(formData.companyName),
            sellingElsewhere: formData.sellingElsewhere,
            sellingElsewhereDetail: normalizeText(formData.sellingElsewhereDetail),
            adharName: normalizeText(formData.adharName),
            adharNumber: digitsOnly(formData.adharNumber),
            email: String(formData.email || '').trim().toLowerCase(),
            number: digitsOnly(formData.number).slice(0, (COUNTRY_RULES[formData.country] || COUNTRY_RULES.India).phoneMax),
            gstin: String(formData.gstin || '').trim().toUpperCase(),
            locality: normalizeText(formData.locality),
            pinCode: String(formData.pinCode || '').trim().toUpperCase(),
            address: normalizeText(formData.address),
            city: normalizeText(formData.city),
            state: normalizeText(formData.state),
            country: formData.country,
        }

        Server.post('/vendor/register', payload).then((res) => {
            if (res.data.found) {
                toast.error('Vendor Already Found')
            } else {
                toast.success('Vendor Successfully Requested')
                navigate.push('/vendor/login')
            }
        }).catch(() => {
            toast.error('Registration failed. Please try again.')
        }).finally(() => {
            setSubmitting(false)
        })
    }

    return (
        <div className='RegisterComp'>
            <div className="registerShell">
                <div className="registerCard">
                    <div className="modal-header-section text-center pb-4">
                        <BrandLogo href="/" />
                        <h2 className="registerTitle mt-3 mb-1">Partner with Indianet</h2>
                        <p className="small text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                            Join India's most trusted marketplace
                        </p>
                    </div>

                    <div className="progress-container">
                        <div className="progress-bar-fill" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }}></div>
                        {steps.map((s) => (
                            <div key={s.id} className={`step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                                {step > s.id ? '✓' : s.id}
                                <span className="step-label">{s.label}</span>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={formHandle}>
                        {step === 1 && (
                            <div className="form-section">
                                <h6>Business Information</h6>
                                <div className="form-group">
                                    <label>Company / business name</label>
                                    <input type="text" placeholder="Registered business name"
                                        value={formData.companyName} onChange={(e) => {
                                            setFormData({ ...formData, companyName: e.target.value })
                                        }} required />
                                </div>
                                <div className="form-group">
                                    <label>Do you sell on other platforms?</label>
                                    <select value={formData.sellingElsewhere} onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            sellingElsewhere: e.target.value,
                                            sellingElsewhereDetail: e.target.value === 'Other' ? formData.sellingElsewhereDetail : ''
                                        })
                                    }} >
                                        <option value="No">No, Indianet is my first</option>
                                        <option value="Amazon">Amazon</option>
                                        <option value="Flipkart">Flipkart</option>
                                        <option value="Meesho">Meesho</option>
                                        <option value="Own website">Own website / store</option>
                                        <option value="Other">Other platforms</option>
                                    </select>
                                </div>
                                {formData.sellingElsewhere === 'Other' && (
                                    <div className="form-group">
                                        <label>Please specify</label>
                                        <input type="text" placeholder="e.g. offline markets"
                                            value={formData.sellingElsewhereDetail} onChange={(e) => {
                                                setFormData({ ...formData, sellingElsewhereDetail: e.target.value })
                                            }} required />
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-section">
                                <h6>Identity Verification</h6>
                                <div className="form-group">
                                    <label>Name on Aadhaar</label>
                                    <input type="text" placeholder='As mentioned on your Aadhaar card'
                                        value={formData.adharName} onChange={(e) => {
                                            setFormData({ ...formData, adharName: e.target.value })
                                        }} required />
                                </div>
                                <div className="row">
                                    <div className="col-md-12 form-group">
                                        <label>Aadhaar number</label>
                                        <input
                                            type="text"
                                            inputMode={formData.country === 'India' ? 'numeric' : 'text'}
                                            autoComplete="off"
                                            maxLength={formData.country === 'India' ? 12 : 20}
                                            placeholder={(COUNTRY_RULES[formData.country] || COUNTRY_RULES.India).idPlaceholder}
                                            value={formData.adharNumber} onChange={(e) => {
                                                const v = formData.country === 'India'
                                                    ? digitsOnly(e.target.value).slice(0, 12)
                                                    : e.target.value.replace(/[^A-Za-z0-9\- ]/g, '').slice(0, 20)
                                                setFormData({ ...formData, adharNumber: v })
                                            }} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Business Email</label>
                                    <input type="email" placeholder='name@company.com'
                                        value={formData.email} onChange={(e) => {
                                            setFormData({ ...formData, email: e.target.value })
                                        }} required />
                                </div>
                                <div className="form-group">
                                    <label>Mobile Number</label>
                                    <input type="tel" inputMode="numeric" maxLength={(COUNTRY_RULES[formData.country] || COUNTRY_RULES.India).phoneMax} placeholder='Enter contact number'
                                        value={formData.number} onChange={(e) => {
                                            const maxLen = (COUNTRY_RULES[formData.country] || COUNTRY_RULES.India).phoneMax
                                            const v = digitsOnly(e.target.value).slice(0, maxLen)
                                            setFormData({ ...formData, number: v })
                                        }} required />
                                </div>
                                <div className="form-group">
                                    <label>GSTIN (Optional)</label>
                                    <input type="text" placeholder='Enter GSTIN if applicable'
                                        value={formData.gstin} onChange={(e) => {
                                            setFormData({ ...formData, gstin: e.target.value })
                                        }} />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="form-section">
                                <h6>Operational Address</h6>
                                <div className="row">
                                    <div className="col-md-8 form-group">
                                        <label>Locality / Street</label>
                                        <input type="text" placeholder='e.g. Sector 12, MG Road'
                                            value={formData.locality} onChange={(e) => {
                                                setFormData({ ...formData, locality: e.target.value })
                                            }} required />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>{(COUNTRY_RULES[formData.country] || COUNTRY_RULES.India).postalLabel}</label>
                                        <input type="text" maxLength={10} placeholder='Enter postal code'
                                            value={formData.pinCode} onChange={(e) => {
                                                const v = e.target.value.toUpperCase().replace(/[^A-Z0-9\- ]/g, '').slice(0, 10)
                                                setFormData({ ...formData, pinCode: v })
                                            }} required />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Detailed Address</label>
                                    <textarea placeholder='Building number, floor, area details...'
                                        value={formData.address} onChange={(e) => {
                                            setFormData({ ...formData, address: e.target.value })
                                        }} required />
                                </div>
                                <div className="row">
                                    <div className="col-md-4 form-group">
                                        <label>City / Town</label>
                                        <input type="text" placeholder='Enter city'
                                            value={formData.city} onChange={(e) => {
                                                setFormData({ ...formData, city: e.target.value })
                                            }} required />
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>Country</label>
                                        <select value={formData.country} onChange={(e) => {
                                            const country = e.target.value
                                            setFormData({
                                                ...formData,
                                                country,
                                                state: country === 'India' ? 'Andhra Pradesh' : '',
                                                number: '',
                                                pinCode: '',
                                                adharNumber: ''
                                            })
                                        }}>
                                            {COUNTRY_OPTIONS.map((country) => (
                                                <option key={country} value={country}>{country}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-4 form-group">
                                        <label>{formData.country === 'India' ? 'State' : 'State / Region'}</label>
                                        {formData.country === 'India' ? (
                                            <select value={formData.state} onChange={(e) => {
                                                setFormData({ ...formData, state: e.target.value })
                                            }}>
                                                <option value="Andhra Pradesh">Andhra Pradesh</option>
                                                <option value="Delhi">Delhi</option>
                                                <option value="Karnataka">Karnataka</option>
                                                <option value="Maharashtra">Maharashtra</option>
                                                <option value="Tamil Nadu">Tamil Nadu</option>
                                                <option value="West Bengal">West Bengal</option>
                                                <option value="Uttar Pradesh">Uttar Pradesh</option>
                                                <option value="Gujarat">Gujarat</option>
                                                <option value="Telangana">Telangana</option>
                                                <option value="Rajasthan">Rajasthan</option>
                                                <option value="Punjab">Punjab</option>
                                                <option value="Haryana">Haryana</option>
                                                <option value="Madhya Pradesh">Madhya Pradesh</option>
                                                <option value="Bihar">Bihar</option>
                                                <option value="Kerala">Kerala</option>
                                                <option value="Assam">Assam</option>
                                            </select>
                                        ) : (
                                            <input
                                                type="text"
                                                placeholder='Enter state / region'
                                                value={formData.state}
                                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                                required
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="action-buttons">
                            {step > 1 && (
                                <button type="button" className="btn-secondary-register" onClick={prevStep}>
                                    Back
                                </button>
                            )}
                            {step < totalSteps ? (
                                <button type="button" className="btn-primary-register" onClick={nextStep}>
                                    Next Step
                                </button>
                            ) : (
                                <button type='submit' className="btn-primary-register" disabled={submitting}>
                                    {submitting ? 'Submitting...' : 'Complete Registration'}
                                </button>
                            )}
                        </div>
                    </form>

                    <p className="registerFooter">
                        Already have a seller account?
                        <button type="button" className="link-login" onClick={() => navigate.push('/vendor/login')}>
                            Sign In
                        </button>
                    </p>
                </div>
            </div>
        </div>
    )
}


export default RegisterComp
