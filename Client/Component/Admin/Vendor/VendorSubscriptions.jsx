import { adminAxios, apiUnreachableMessage } from '../../../Config/Server'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

const PLAN_OPTIONS = [
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

function VendorSubscriptions({ logOut, onPlanChanged }) {
    const [pending, setPending] = useState([])
    const [pendingTotal, setPendingTotal] = useState(0)
    const [accepted, setAccepted] = useState([])
    const [loading, setLoading] = useState(true)
    const [activatePlan, setActivatePlan] = useState({})
    const [manageVendor, setManageVendor] = useState(null)
    const [managePlan, setManagePlan] = useState('basic')

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

    const activate = (vendor, planKey) => {
        const plan = planKey || activatePlan[vendor._id] || vendor.planRequested || 'basic'
        adminAxios((server) => {
            server.put('/admin/activateVendorPlan', {
                vendorId: vendor._id,
                plan,
            }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    toast.success(`${vendor.companyName || vendor.adharName}: ${plan} plan activated`)
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Activation failed')
            })
        })
    }

    const deactivate = (vendor) => {
        if (!window.confirm(`Remove plan access for ${vendor.companyName || vendor.adharName}?`)) return
        adminAxios((server) => {
            server.put('/admin/deactivateVendorPlan', { vendorId: vendor._id }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    toast.success('Plan access removed')
                    loadData()
                    onPlanChanged?.()
                }
            }).catch((err) => {
                toast.error(apiUnreachableMessage(err) || 'Failed to deactivate')
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
                <p>After external payment, activate the plan the vendor requested. Vendors only get RFQ and publish access with an active plan.</p>
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
                                    <th>Requested on</th>
                                    <th>Activate as</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pending.map((v) => (
                                    <tr key={v._id}>
                                        <td>{v.companyName || v.adharName}</td>
                                        <td>{v.email}</td>
                                        <td><strong>{requestedLabel(v)}</strong></td>
                                        <td>{v.planRequestedAt ? new Date(v.planRequestedAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            <select
                                                className="form-select form-select-sm"
                                                value={activatePlan[v._id] || v.planRequested || 'basic'}
                                                onChange={(e) => setActivatePlan({ ...activatePlan, [v._id]: e.target.value })}
                                            >
                                                {PLAN_OPTIONS.map((p) => (
                                                    <option key={p.key} value={p.key}>{p.label}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="ActionBtn"
                                                onClick={() => activate(v, activatePlan[v._id] || v.planRequested)}
                                            >
                                                Activate plan
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
                                    <td>
                                        {v.planStatus === 'active' && <span className="text-success">Active</span>}
                                        {v.planStatus === 'pending' && <span className="text-warning">Pending</span>}
                                        {(!v.planStatus || v.planStatus === 'none') && <span className="text-muted">No plan</span>}
                                    </td>
                                    <td className="d-flex flex-wrap gap-2">
                                        <button
                                            type="button"
                                            className="ActionBtn"
                                            onClick={() => {
                                                setManageVendor(v)
                                                setManagePlan(v.plan || v.planRequested || 'basic')
                                            }}
                                        >
                                            {v.planStatus === 'active' ? 'Change plan' : 'Assign plan'}
                                        </button>
                                        {v.planStatus === 'active' && (
                                            <button type="button" className="ActionBtn" onClick={() => deactivate(v)}>
                                                Revoke
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
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Manage plan — {manageVendor.companyName || manageVendor.adharName}</h5>
                                <button type="button" className="btn-close" onClick={() => setManageVendor(null)} />
                            </div>
                            <div className="modal-body">
                                <p className="small text-muted">Vendor pays externally. Switch on the plan here to grant platform access.</p>
                                <label className="form-label">Plan</label>
                                <select className="form-select mb-3" value={managePlan} onChange={(e) => setManagePlan(e.target.value)}>
                                    {PLAN_OPTIONS.map((p) => (
                                        <option key={p.key} value={p.key}>{p.label}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    className="ActionBtn w-100"
                                    onClick={() => {
                                        activate(manageVendor, managePlan)
                                        setManageVendor(null)
                                    }}
                                >
                                    Activate {PLAN_OPTIONS.find((p) => p.key === managePlan)?.label} plan
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default VendorSubscriptions
