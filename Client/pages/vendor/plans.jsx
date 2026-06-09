import Loading from '@/Component/Loading/Loading'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Server, { vendorCheck } from '@/Config/Server'
import { useRouter } from 'next/router'
import { Fragment, useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const Header = dynamic(() => import('@/Component/Vendor/Header/Header'))

const plans = [
    {
        name: 'Free',
        planKey: 'free',
        color: '#64748b',
        annualPrice: 0,
        includes: null,
        isIncluded: true,
        bestFor: 'Start selling with no upfront cost (activated when admin approves your account).',
        features: [
            'Unlimited product uploads',
            '1 product showcase (locked when used)',
            'See & respond to 5 buyer RFQs per month',
            'Store page (products & contacts only — no company profile)',
            'Draft & publish catalogue',
        ],
    },
    {
        name: 'Basic',
        planKey: 'basic',
        color: '#4f46e5',
        annualPrice: 110000,
        includes: null,
        bestFor: 'New suppliers starting their B2B journey.',
        features: [
            'Unlimited Product Uploading',
            'Business Registration Verified',
            '5 Product Showcases',
            "Access to Buyers' Purchase Requests (RFQ)",
            'See & respond to 20 RFQs per month',
            'Store page without public company profile',
        ],
    },
    {
        name: 'Plus',
        planKey: 'plus',
        color: '#0284c7',
        annualPrice: 165000,
        includes: 'Basic',
        bestFor: 'Growing businesses seeking greater product visibility and more buyer inquiries.',
        features: [
            'Public company profile on your store',
            'Verified vendor badge on profile & products',
            '20 Product Showcases',
            'See & respond to 40 RFQs per month',
            'Basic Advertisement Support',
        ],
    },
    {
        name: 'Pro',
        planKey: 'pro',
        color: '#7c3aed',
        annualPrice: 234000,
        includes: 'Plus',
        bestFor: 'Suppliers who need more RFQ volume and flexible showcase control.',
        features: [
            'Public company profile + verified vendor badge',
            '20 Product Showcases',
            'See & respond to 60 RFQs per month',
            'Change showcased products anytime',
            'Product Advertisements',
            '2-Star Supplier Rating (6 months)',
        ],
    },
    {
        name: 'Premium',
        planKey: 'premium',
        color: '#ea580c',
        annualPrice: 750000,
        includes: 'Pro',
        highlighted: true,
        bestFor: 'Established manufacturers seeking maximum visibility, trust, and buyer reach.',
        features: [
            'Public company profile + verified vendor badge',
            'Product & Branded Advertisements',
            'Verified Supplier badge (Premium)',
            '4-Star Supplier Rating (Direct for 6 Months)',
            'Third-Party Assessment Report',
            'Verified Video Shooting Service',
            'Indianet Manufacturers Exclusive Promotion',
            '60 Product Showcases',
            'Unlimited RFQ visibility & responses',
            'Keyword Ads Ranking Service',
        ],
    },
]

const countries = [
    { code: 'IN', name: 'India', currency: 'INR', symbol: '₹', rate: 1 },
    { code: 'US', name: 'USA', currency: 'USD', symbol: '$', rate: 1 / 83.5 },
    { code: 'AE', name: 'UAE', currency: 'AED', symbol: 'AED ', rate: 1 / 22.75 },
    { code: 'GB', name: 'UK', currency: 'GBP', symbol: '£', rate: 1 / 105.7 },
]

export default function VendorPlans() {
    const navigate = useRouter()
    const [loaded, setLoaded] = useState(false)
    const [country, setCountry] = useState(countries[0])
    const [showModal, setShowModal] = useState(false)
    const [selectedPlan, setSelectedPlan] = useState(null)
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', company: '' })
    const [vendorData, setVendorData] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('vendorToken')
        if (!token) {
            navigate.push('/vendor/login')
            return
        }
        vendorCheck(token, (vendor) => {
            if (!vendor?.status) {
                localStorage.removeItem('vendorToken')
                navigate.push('/vendor/login')
            } else {
                setVendorData(vendor)
                setFormData({
                    name: vendor.adharName || '',
                    email: vendor.email || '',
                    phone: vendor.number || '',
                    company: vendor.companyName || '',
                })
                setLoaded(true)
            }
        })
    }, [])

    const convert = (inrAmount) => {
        const amount = Math.round((inrAmount || 0) * country.rate)
        return amount.toLocaleString(country.code === 'IN' ? 'en-IN' : 'en-US')
    }

    const handleSelectPlan = (plan) => {
        setSelectedPlan({
            ...plan,
            calcPrice: convert(plan.annualPrice),
            billingPeriod: 'annual',
        })
        setShowModal(true)
    }

    const submitLead = (e) => {
        e.preventDefault()
        const loadToast = toast.loading('Submitting request...')
        Server.post('/users/submitPricingRequest', {
            ...formData,
            vendorId: vendorData?._id,
            plan: selectedPlan.planKey || selectedPlan.name.toLowerCase(),
            period: selectedPlan.billingPeriod,
            country: country.name,
            currency: country.currency,
            price: selectedPlan.calcPrice,
        }).then(() => {
            toast.dismiss(loadToast)
            toast.success('Plan request sent. Admin will activate after external payment.')
            setShowModal(false)
            setVendorData((v) => v ? {
                ...v,
                planAccess: {
                    ...(v.planAccess || {}),
                    planStatus: 'pending',
                    planRequested: selectedPlan.name.toLowerCase(),
                    isPending: true,
                    isActive: false,
                },
            } : v)
        }).catch(() => {
            toast.dismiss(loadToast)
            toast.error('Failed to submit')
        })
    }

    if (!loaded) {
        return <Loading />
    }

    return (
        <Fragment>
            <Head>
                <title>Pricing Plans - Indianet</title>
            </Head>
            <main className='Vendor'>
                <Header />
                <div className="containerVendor py-4">
                    <div className="vendorPageHeader">
                        <h1 className="vendorPageTitle">Pricing Plans</h1>
                        <p className="vendorPageSubtitle">Choose the right annual plan. All prices are tax exclusive.</p>
                    </div>

                    {vendorData?.planAccess?.isActive && (
                        <div className="alert alert-success">
                            <strong>Active plan:</strong> {vendorData.planAccess.planLabel}
                            {vendorData.planAccess.planExpiresAt && (
                                <span> — valid until {new Date(vendorData.planAccess.planExpiresAt).toLocaleDateString()}</span>
                            )}
                        </div>
                    )}
                    {vendorData?.planAccess?.isPending && !vendorData?.planAccess?.isActive && (
                        <div className="alert alert-warning">
                            <strong>Plan request pending.</strong> You requested {vendorData.planAccess.planRequestedLabel || vendorData.planAccess.planRequested}.
                            Admin will activate your plan after external payment is confirmed.
                        </div>
                    )}
                    {vendorData?.planAccess?.plan === 'free' && vendorData?.planAccess?.isActive && (
                        <div className="alert alert-info">
                            You are on the <strong>Free</strong> plan: unlimited uploads, 1 showcase (locked when used), 5 RFQ/month.
                            Upgrade below for more showcases, RFQ quota, and Pro showcase flexibility.
                        </div>
                    )}
                    {!vendorData?.planAccess?.isActive && !vendorData?.planAccess?.isPending && (
                        <div className="alert alert-info">
                            After admin approves your vendor account you receive the Free plan automatically.
                            Request a paid plan below for higher limits.
                        </div>
                    )}

                    <div className="d-flex flex-wrap gap-3 align-items-center justify-content-end mb-4">
                        <label className="small text-muted mb-0">Display currency</label>
                        <select
                            className="form-select vendorPricingCountrySelect"
                            value={country.code}
                            onChange={(e) => {
                                const c = countries.find((x) => x.code === e.target.value)
                                if (c) setCountry(c)
                            }}
                        >
                            {countries.map((c) => (
                                <option key={c.code} value={c.code}>{c.name} ({c.currency})</option>
                            ))}
                        </select>
                    </div>

                    <div className="row g-3">
                        {plans.map((plan) => (
                            <div className="col-12 col-md-6 col-xl-3" key={plan.name}>
                                <div className={`vendorPricingCard h-100${plan.highlighted ? ' vendorPricingCard--highlighted' : ''}`}>
                                    <h4 className="vendorPricingCardName" style={{ color: plan.color }}>{plan.name}</h4>
                                    <p className="vendorPricingCardPrice">
                                        {country.symbol}{convert(plan.annualPrice)}
                                        <span className="vendorPricingCardPeriod"> / Year</span>
                                    </p>
                                    <p className="vendorPricingCardTax">Tax Exclusive</p>

                                    {plan.includes && (
                                        <p className="vendorPricingCardIncludes">
                                            Everything in <strong>{plan.includes}</strong>, plus:
                                        </p>
                                    )}

                                    <ul className="vendorPricingCardFeatures">
                                        {plan.features.map((feature) => (
                                            <li key={feature}>
                                                <i className="fa-solid fa-check vendorPricingCardCheck" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <p className="vendorPricingCardBestFor">
                                        <strong>Best for:</strong> {plan.bestFor}
                                    </p>

                                    {plan.isIncluded ? (
                                        <button type="button" className="vendorBtnSecondary vendorPricingCardBtn" disabled>
                                            {vendorData?.planAccess?.plan === 'free' ? 'Your current plan' : 'Included on approval'}
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="vendorBtnPrimary vendorPricingCardBtn"
                                            onClick={() => handleSelectPlan(plan)}
                                            disabled={vendorData?.planAccess?.plan === plan.planKey && vendorData?.planAccess?.isActive}
                                        >
                                            {vendorData?.planAccess?.plan === plan.planKey && vendorData?.planAccess?.isActive ? 'Current plan' : 'Select Plan'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {showModal && selectedPlan && (
                    <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,.45)' }} tabIndex="-1">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Request {selectedPlan.name} Plan</h5>
                                    <button type="button" className="btn-close" onClick={() => setShowModal(false)} />
                                </div>
                                <div className="modal-body">
                                    <p className="small text-muted mb-3">
                                        {country.symbol}{selectedPlan.calcPrice} / Year ({country.currency}, tax exclusive)
                                    </p>
                                    <form onSubmit={submitLead}>
                                        <input className="form-control mb-2" required placeholder="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                                        <input className="form-control mb-2" required type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                                        <input className="form-control mb-2" required placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                                        <input className="form-control mb-3" required placeholder="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                                        <button type="submit" className="vendorBtnPrimary w-100">Submit</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </Fragment>
    )
}
