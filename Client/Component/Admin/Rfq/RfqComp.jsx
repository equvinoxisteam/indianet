import { adminAxios } from '../../../Config/Server'
import { useContext, useState, useEffect } from 'react'
import Loading from '@/Component/Loading/Loading'
import ContentControl from '@/ContentControl/ContentControl'
import toast from 'react-hot-toast'

function RfqComp({ loaded, setLoaded }) {
    const { setAdminLogged } = useContext(ContentControl)
    const [search, setSearch] = useState('')
    const [rfqs, setRfqs] = useState([])
    const [total, setTotal] = useState(0)

    const [selectedRfq, setSelectedRfq] = useState(null)
    const [updateStatus, setUpdateStatus] = useState('')
    const [payType, setPayType] = useState('cod')

    const normalizeStatus = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
    const statusTitle = (s) => {
        const st = normalizeStatus(s)
        if (st === 'pending') return 'Pending'
        if (st === 'in progress' || st === 'in_progress') return 'In Progress'
        if (st === 'approved') return 'Approved'
        if (st === 'rejected') return 'Rejected'
        return s || ''
    }
    const statusToDropdownValue = (s) => statusTitle(s) || 'Pending'
    const statusBadgeClass = (s) => {
        const st = normalizeStatus(s)
        if (st === 'pending') return 'bg-warning'
        if (st === 'approved') return 'bg-success'
        if (st === 'rejected') return 'bg-danger'
        return 'bg-info'
    }
    const dropdownValueToCanonical = (val) => {
        const v = normalizeStatus(val)
        if (v === 'pending') return 'pending'
        if (v === 'in progress' || v === 'in_progress') return 'in_progress'
        if (v === 'approved') return 'approved'
        if (v === 'rejected') return 'rejected'
        return normalizeStatus(val)
    }
    const normalizePayType = (v) => {
        const s = String(v ?? '').toLowerCase().trim()
        if (s === 'cod') return 'cod'
        if (s === 'online' || s === 'prepaid') return 'online'
        return s || 'cod'
    }
    const rfqDateValue = (obj) => obj?.createdAt || obj?.date || null

    const logOut = () => {
        setAdminLogged({ status: false })
        localStorage.removeItem("adminToken")
        setLoaded(true)
        window.location.href = '/admin/login'
    }

    const fetchRfqs = (skipValue = 0, isLoadMore = false) => {
        adminAxios((server) => {
            server.get('/admin/getRfqs', {
                params: { search: search, skip: skipValue }
            }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    if (isLoadMore) {
                        setRfqs([...rfqs, ...res.data.rfqs])
                    } else {
                        setRfqs(res.data.rfqs)
                    }
                    setTotal(res.data.total)
                    setLoaded(true)
                }
            }).catch(() => {
                setLoaded(true)
            })
        })
    }

    useEffect(() => {
        fetchRfqs(0, false)
    }, [search])

    const loadDetails = (id) => {
        adminAxios((server) => {
            server.get('/admin/getRfqDetails', { params: { rfqId: id } }).then((res) => {
                if (res.data.login) {
                    logOut()
                } else {
                    setSelectedRfq(res.data)
                    setUpdateStatus(statusToDropdownValue(res.data.status))
                    setPayType(normalizePayType(res.data.payType || 'cod'))
                }
            })
        })
    }

    const handleUpdate = () => {
        const canonicalStatus = dropdownValueToCanonical(updateStatus)
        const canonicalPayType = normalizePayType(payType)
        adminAxios((server) => {
            server.put('/admin/updateRfq', { rfqId: selectedRfq._id, status: canonicalStatus, payType: canonicalPayType }).then((res) => {
                if (res.data === 'done') {
                    toast.success('RFQ Status Updated')
                    setSelectedRfq(null)
                    fetchRfqs(0, false)
                }
            }).catch(() => {
                toast.error('Failed to update RFQ')
            })
        })
    }

    const handleDelete = (id) => {
        if (!window.confirm("Are you sure you want to delete this RFQ?")) return;
        adminAxios((server) => {
            server.delete('/admin/deleteRfq', { data: { rfqId: id } }).then((res) => {
                if (res.data === 'done') {
                    toast.success('RFQ Deleted')
                    fetchRfqs(0, false)
                }
            }).catch(() => {
                toast.error('Failed to delete RFQ')
            })
        })
    }

    return (
        <>
            {loaded ? (
                <div className='OrdersComp'>
                    <div className='AdminContainer pb-3'>

                        <div className="alert alert-info text-start small mb-3">
                            RFQs are auto-sent to vendors by plan quota when buyers submit. You see all requests here — use Rejected only if you need to block one.
                        </div>

                        <div className="BtnsSections text-center pt-3">
                            <div className="row">
                                <div className="col-12 col-md-4 pb-2">
                                    <input type="text" value={search} onInput={(e) => setSearch(e.target.value)} placeholder='Search Customer Name' />
                                </div>
                            </div>
                        </div>

                        <div className='MainTable text-center table-responsive'>
                            <table className="table align-middle">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Product</th>
                                        <th>Customer</th>
                                        <th>Vendor</th>
                                        <th>Qty</th>
                                        <th>Status</th>
                                        <th>Quoted</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rfqs.map((obj, key) => (
                                        <tr key={key}>
                                            <td>{rfqDateValue(obj) ? new Date(rfqDateValue(obj)).toLocaleDateString() : '—'}</td>
                                            <td>
                                                <div className="small fw-medium">{obj.productName || '—'}</div>
                                                <div className="small text-muted">{obj.productId}</div>
                                            </td>
                                            <td>
                                                <div>{obj.userName || obj.name || '—'}</div>
                                                <div className="small text-muted">{obj.userEmail || '—'}</div>
                                            </td>
                                            <td>
                                                <div className="small">{obj.vendorName || '—'}</div>
                                                <div className="small text-muted">{obj.vendorId || '—'}</div>
                                            </td>
                                            <td>{obj.quantity}</td>
                                            <td>
                                                <span className={`badge ${statusBadgeClass(obj.status)}`}>
                                                    {statusTitle(obj.status)}
                                                </span>
                                            </td>
                                            <td>
                                                {obj.quotedPrice !== null && obj.quotedPrice !== undefined ? `₹ ${obj.quotedPrice}` : '—'}
                                            </td>
                                            <td>
                                                <button className='ActionBtn btn-sm me-2' onClick={() => loadDetails(obj._id)}>View</button>
                                                <button className='ActionBtn btn-sm btn-danger ms-2' onClick={() => handleDelete(obj._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {rfqs.length < total && (
                            <div>
                                <button data-for="loadMore" onClick={() => fetchRfqs(rfqs.length, true)}>Load More</button>
                            </div>
                        )}
                    </div>
                </div>
            ) : <Loading />}

            {/* Modal for RFQ Details */}
            {selectedRfq && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">RFQ Details</h5>
                                <button type="button" className="btn-close" onClick={() => setSelectedRfq(null)}></button>
                            </div>
                            <div className="modal-body text-start">
                                <p><strong>Product:</strong> {selectedRfq.productName || '—'} <span className="text-muted small">({selectedRfq.productId})</span></p>
                                    <p><strong>Customer Name:</strong> {selectedRfq.userName || selectedRfq.name || '—'}</p>
                                    <p><strong>Email:</strong> {selectedRfq.userEmail || selectedRfq.email || '—'}</p>
                                    <p><strong>Phone:</strong> {selectedRfq.userNumber || selectedRfq.number || '—'}</p>
                                <p><strong>Quantity Requested:</strong> {selectedRfq.quantity}</p>
                                <hr />
                                <p><strong>Vendor:</strong> {selectedRfq.vendorName || '—'}</p>
                                <p><strong>Vendor Email:</strong> {selectedRfq.vendorEmail || '—'}</p>
                                <p><strong>Vendor Phone:</strong> {selectedRfq.vendorPhone || '—'}</p>
                                <p><strong>Vendor Plan:</strong> {selectedRfq.vendorPlan || '—'}</p>
                                <p><strong>Vendor ID:</strong> {selectedRfq.vendorId || '—'}</p>
                                <p><strong>Vendor Quoted Price:</strong> {selectedRfq.quotedPrice !== null && selectedRfq.quotedPrice !== undefined ? `₹ ${selectedRfq.quotedPrice}` : '—'}</p>
                                <p><strong>Current Status:</strong> {statusTitle(selectedRfq.status)}</p>
                                <p><strong>Message:</strong> {selectedRfq.message || 'N/A'}</p>
                                <hr />
                                <div className="mb-3">
                                    <label className="form-label"><strong>Update Status:</strong></label>
                                    <select className="form-select" value={updateStatus} onChange={(e) => setUpdateStatus(e.target.value)}>
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label"><strong>Payment Type:</strong></label>
                                    <select className="form-select" value={payType} onChange={(e) => setPayType(e.target.value)}>
                                        <option value="cod">COD</option>
                                        <option value="online">ONLINE / PREPAID</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setSelectedRfq(null)}>Close</button>
                                <button type="button" className="btn btn-primary" onClick={handleUpdate}>Save Changes</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default RfqComp
