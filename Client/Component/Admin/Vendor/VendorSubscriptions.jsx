import { adminAxios, apiUnreachableMessage } from '../../../Config/Server'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import PlanExpiryCountdown from '@/Component/Common/PlanExpiryCountdown'

const PLAN_OPTIONS = [
    { key: 'free', label: 'Free' },
    { key: 'basic', label: 'Basic' },
    { key: 'plus', label: 'Plus' },
    { key: 'pro', label: 'Pro' },
    { key: 'premium', label: 'Premium' },
]

function planLabel(vendor) {
    if (!vendor?.plan) return '—'
    const found = PLAN_OPTIONS.find((p) => p.key === vendor.plan)
    return found ? found.label : vendor.plan
}

function requestedLabel(vendor) {
    if (!vendor?.planRequested) return '—'
    const found = PLAN_OPTIONS.find((p) => p.key === vendor.planRequested)
    return found ? found.label : vendor.planRequested
}

function periodLabel(period) {
    if (period === 'semiannual') return '6 months'
    if (period === 'annual') return '1 year'
    return '—'
}

function formatExpiry(vendor) {
    if (!vendor?.planExpiresAt) return vendor?.plan === 'free' ? 'No expiry' : '—'
    return new Date(vendor.planExpiresAt).toLocaleDateString()
}

function planDaysRemaining(vendor) {
    if (!vendor?.planExpiresAt || vendor?.plan === 'free') return null
    const ms = new Date(vendor.planExpiresAt).getTime() - Date.now()
    if (ms <= 0) return 0
    return Math.ceil(ms / (24 * 60 * 60 * 1000))
}

function VendorSubscriptions({ logOut, onPlanChanged }) {
    const [pending, setPending] = useState([])
    const [pendingTotal, setPendingTotal] = useState(0)
    const [accepted, setAccepted] = useState([])
    const [loading, setLoading] = useState(true)
    const [activatePlan, setActivatePlan] = useState({})
    const [activatePeriod, setActivatePeriod] = useState({})
    const [manageVendor, setManageVendor] = useState(null)
    const [managePlan, setManagePlan] = useState('basic')
    const [managePeriod, setManagePeriod] = useState('annual')
    const [manageExpiresAt, setManageExpiresAt] = useState('')
    const [managePreventAutoDowngrade, setManagePreventAutoDowngrade] = useState(false)
    const [manageDowngradeTo, setManageDowngradeTo] = useState('free')

    const loadData = () => {
        setLoading(true)
        adminAxios((server) => {
            Promise.all([
                server.get('/admin/getVendorPlanRequests', { params: { skip: 0 } }),
                server.get('/admin/getVendors', { params: { accept: true, skip: 0 } }),
            ]).then(([pendingRes, acceptedRes]) => {
                if (pendingRes.data.login || acceptedRes.data.login) {
                    logOut()
                    return
                }
                setPending(pendingRes.data.vendors || [])
                setPendingTotal(pendingRes.data.total || 0)
                setAccepted(acceptedRes.data.vendors || [])
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Failed to load plan data')
            }).finally(() => setLoading(false))
        })
    }

    useEffect(() => {
        loadData()
    }, [])

    const openManage = (v) => {
        setManageVendor(v)
        setManagePlan(v.plan || v.planRequested || 'basic')
        setManagePeriod(v.planBillingPeriod || v.planRequestDetails?.period || 'annual')
        setManageExpiresAt(v.planExpiresAt ? new Date(v.planExpiresAt).toISOString().slice(0, 10) : '')
        setManagePreventAutoDowngrade(!!v.planPreventAutoDowngrade)
        setManageDowngradeTo(v.planDowngradeTo || 'free')
    }

    const activate = (vendor, planKey, period) => {
        const plan = planKey || activatePlan[vendor._id] || vendor.planRequested || 'basic'
        const billingPeriod = period || activatePeriod[vendor._id] || vendor.planRequestDetails?.period || 'annual'
        adminAxios((server) => {
            server.put('/admin/activateVendorPlan', {
                vendorId: vendor._id,
                plan,
                period: billingPeriod,
            }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    const exp = res.data.expiresAt ? ` until ${new Date(res.data.expiresAt).toLocaleDateString()}` : ''
                    toast.success(`${vendor.companyName || vendor.adharName}: ${plan} (${periodLabel(billingPeriod)})${exp}`)
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Activation failed')
            })
        })
    }

    const saveSubscription = () => {
        if (!manageVendor) return
        adminAxios((server) => {
            server.put('/admin/updateVendorPlan', {
                vendorId: manageVendor._id,
                plan: managePlan,
                period: managePeriod,
                expiresAt: manageExpiresAt || null,
                preventAutoDowngrade: managePreventAutoDowngrade,
                downgradeToPlan: manageDowngradeTo,
            }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    toast.success('Subscription updated')
                    setManageVendor(null)
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Update failed')
            })
        })
    }

    const pausePlan = (vendor) => {
        if (!window.confirm(`Pause ${vendor.companyName || vendor.adharName}'s plan? Vendor loses paid features until resumed.`)) return
        adminAxios((server) => {
            server.put('/admin/pauseVendorPlan', { vendorId: vendor._id }).then((res) => {
                if (res.data.login) logOut()
                else {
                    toast.success('Plan paused')
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => toast.error(apiUnreachableMessage(err) || 'Pause failed'))
        })
    }

    const resumePlan = (vendor) => {
        adminAxios((server) => {
            server.put('/admin/resumeVendorPlan', { vendorId: vendor._id }).then((res) => {
                if (res.data.login) logOut()
                else {
                    toast.success('Plan resumed')
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => toast.error(apiUnreachableMessage(err) || 'Resume failed'))
        })
    }

    const deactivatePlan = (vendor) => {
        if (!window.confirm(`Deactivate plan and move ${vendor.companyName || vendor.adharName} to Free?`)) return
        adminAxios((server) => {
            server.put('/admin/deactivateVendorPlan', { vendorId: vendor._id }).then((res) => {
                if (res.data.login) logOut()
                else {
                    toast.success('Plan deactivated — vendor on Free')
                    setManageVendor(null)
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => toast.error(apiUnreachableMessage(err) || 'Deactivate failed'))
        })
    }

    const downgradeNow = (vendor, toPlan = 'free') => {
        const label = PLAN_OPTIONS.find((p) => p.key === toPlan)?.label || toPlan
        if (!window.confirm(`Downgrade ${vendor.companyName || vendor.adharName} to ${label} now? Showcase slots will be trimmed automatically.`)) return
        adminAxios((server) => {
            server.put('/admin/downgradeVendorPlan', { vendorId: vendor._id, toPlan }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    toast.success(`Downgraded to ${label}`)
                    setManageVendor(null)
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Downgrade failed')
            })
        })
    }

    if (loading) {
        return <p className="text-muted py-3">Loading subscription data...</p>
    }

    return (
        <div className="vendorSubscriptionsAdmin mt-4">
            <div className="adminPageHeader mb-3">
                <h2>Vendor Subscriptions</h2>
                <p>
                    Activate plans after external payment. Annual = full yearly price; 6-month = half price + 10%.
                    Vendors receive an email 24 hours before expiry. After expiry, plans auto-downgrade to Free unless auto-downgrade is paused.
                </p>
            </div>

            <div className="settingsProfileCard mb-4">
                <h3 className="h5 mb-3">Pending plan requests ({pendingTotal})</h3>
                {pending.length === 0 ? (
                    <p className="text-muted small mb-0">No vendors waiting for plan activation.</p>
                ) : (
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead>
                                <tr>
                                    <th>Company</th>
                                    <th>Email</th>
                                    <th>Requested plan</th>
                                    <th>Billing</th>
                                    <th>Requested on</th>
                                    <th>Activate as</th>
                                    <th>Period</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map((v) => (
                                    <tr key={v._id}>
                                        <td>{v.companyName || v.adharName}</td>
                                        <td>{v.email}</td>
                                        <td><strong>{requestedLabel(v)}</strong></td>
                                        <td>{periodLabel(v.planRequestDetails?.period)}</td>
                                        <td>{v.planRequestedAt ? new Date(v.planRequestedAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={activatePlan[v._id] || v.planRequested || 'basic'}
                                                onChange={(e) => setActivatePlan({ ...activatePlan, [v._id]: e.target.value })}
                                            >
                                                {PLAN_OPTIONS.filter((p) => p.key !== 'free').map((p) => (
                                                    <option key={p.key} value={p.key}>{p.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={activatePeriod[v._id] || v.planRequestDetails?.period || 'annual'}
                                                onChange={(e) => setActivatePeriod({ ...activatePeriod, [v._id]: e.target.value })}
                                            >
                                                <option value="annual">1 year</option>
                                                <option value="semiannual">6 months</option>
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="ActionBtn"
                                                onClick={() => activate(
                                                    v,
                                                    activatePlan[v._id] || v.planRequested,
                                                    activatePeriod[v._id] || v.planRequestDetails?.period
                                                )}
                                            >
                                                Activate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="settingsProfileCard">
                <h3 className="h5 mb-3">Accepted vendors — plan access</h3>
                <div className="table-responsive">
                    <table className="table align-middle">
                        <thead>
                            <tr>
                                <th>Company</th>
                                <th>Email</th>
                                <th>Current plan</th>
                                <th>Billing</th>
                                <th>Expires</th>
                                <th>Timer</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {accepted.map((v) => (
                                <tr key={v._id}>
                                    <td>{v.companyName || v.adharName}</td>
                                    <td>{v.email}</td>
                                    <td>{planLabel(v)}</td>
                                    <td>{periodLabel(v.planBillingPeriod)}</td>
                                    <td>
                                        {formatExpiry(v)}
                                        {v.planPreventAutoDowngrade && (
                                            <span className="badge bg-secondary ms-1" title="Auto-downgrade paused">Paused auto</span>
                                        )}
                                    </td>
                                    <td>
                                        {v.planExpiresAt && v.plan !== 'free' ? (
                                            <PlanExpiryCountdown expiresAt={v.planExpiresAt} />
                                        ) : '—'}
                                        {planDaysRemaining(v) === 1 && (
                                            <div className="small text-warning">Warning email sent</div>
                                        )}
                                    </td>
                                    <td>
                                        {v.planStatus === 'paused' && <span className="text-secondary">Paused</span>}
                                        {v.planStatus === 'active' && <span className="text-success">Active</span>}
                                        {v.planStatus === 'pending' && <span className="text-warning">Pending</span>}
                                        {(!v.planStatus || v.planStatus === 'none') && <span className="text-muted">No plan</span>}
                                    </td>
                                    <td className="d-flex flex-wrap gap-2">
                                        <button type="button" className="ActionBtn" onClick={() => openManage(v)}>
                                            {v.planStatus === 'active' || v.planStatus === 'paused' ? 'Manage' : 'Assign plan'}
                                        </button>
                                        {v.planStatus === 'active' && v.plan !== 'free' && (
                                            <button type="button" className="ActionBtn" onClick={() => pausePlan(v)}>Pause</button>
                                        )}
                                        {v.planStatus === 'paused' && (
                                            <button type="button" className="ActionBtn" onClick={() => resumePlan(v)}>Resume</button>
                                        )}
                                        {v.planStatus === 'active' && v.plan !== 'free' && (
                                            <button type="button" className="ActionBtn" onClick={() => downgradeNow(v, 'free')}>
                                                Downgrade
                                            </button>
                                        )}
                                        {v.plan !== 'free' && v.planStatus !== 'none' && (
                                            <button type="button" className="ActionBtn" onClick={() => deactivatePlan(v)}>
                                                Deactivate
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {manageVendor && (
                <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,.45)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Manage subscription — {manageVendor.companyName || manageVendor.adharName}</h5>
                                <button type="button" className="btn-close" onClick={() => setManageVendor(null)} />
                            </div>
                            <div className="modal-body">
                                <p className="small text-muted">
                                    Change plan, set custom expiry, pause auto-downgrade mid-term, or downgrade immediately.
                                    Showcase slots are enforced automatically when the plan changes.
                                </p>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Plan</label>
                                        <select className="form-select" value={managePlan} onChange={(e) => setManagePlan(e.target.value)}>
                                            {PLAN_OPTIONS.map((p) => (
                                                <option key={p.key} value={p.key}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Billing period</label>
                                        <select
                                            className="form-select"
                                            value={managePeriod}
                                            onChange={(e) => setManagePeriod(e.target.value)}
                                            disabled={managePlan === 'free'}
                                        >
                                            <option value="annual">1 year (full annual price)</option>
                                            <option value="semiannual">6 months (half + 10%)</option>
                                        </select>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Expiry date (optional override)</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            value={manageExpiresAt}
                                            onChange={(e) => setManageExpiresAt(e.target.value)}
                                            disabled={managePlan === 'free'}
                                        />
                                        <div className="form-text">Leave blank to auto-calculate from billing period on save.</div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Auto-downgrade to</label>
                                        <select
                                            className="form-select"
                                            value={manageDowngradeTo}
                                            onChange={(e) => setManageDowngradeTo(e.target.value)}
                                            disabled={managePlan === 'free'}
                                        >
                                            {PLAN_OPTIONS.map((p) => (
                                                <option key={p.key} value={p.key}>{p.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-12">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="preventAutoDowngrade"
                                                checked={managePreventAutoDowngrade}
                                                onChange={(e) => setManagePreventAutoDowngrade(e.target.checked)}
                                                disabled={managePlan === 'free'}
                                            />
                                            <label className="form-check-label" htmlFor="preventAutoDowngrade">
                                                Pause auto-downgrade when plan expires (admin must downgrade manually)
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="d-flex flex-wrap gap-2 mt-4">
                                    <button type="button" className="ActionBtn" onClick={saveSubscription}>
                                        Save subscription
                                    </button>
                                    {manageVendor.planStatus === 'active' && managePlan !== 'free' && (
                                        <button type="button" className="ActionBtn" onClick={() => pausePlan(manageVendor)}>
                                            Pause plan
                                        </button>
                                    )}
                                    {manageVendor.planStatus === 'paused' && (
                                        <button type="button" className="ActionBtn" onClick={() => resumePlan(manageVendor)}>
                                            Resume plan
                                        </button>
                                    )}
                                    {managePlan !== 'free' && (
                                        <button type="button" className="ActionBtn" onClick={() => downgradeNow(manageVendor, manageDowngradeTo)}>
                                            Downgrade now
                                        </button>
                                    )}
                                    {managePlan !== 'free' && (
                                        <button type="button" className="ActionBtn" onClick={() => deactivatePlan(manageVendor)}>
                                            Deactivate (Free)
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorSubscriptions
