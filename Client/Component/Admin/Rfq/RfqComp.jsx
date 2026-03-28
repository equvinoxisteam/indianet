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
                    setUpdateStatus(res.data.status)
                }
            })
        })
    }

    const handleUpdate = () => {
        adminAxios((server) => {
            server.put('/admin/updateRfq', { rfqId: selectedRfq._id, status: updateStatus }).then((res) => {
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
                                        <th>Product ID</th>
                                        <th>Customer</th>
                                        <th>Quantity</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rfqs.map((obj, key) => (
                                        <tr key={key}>
                                            <td>{new Date(obj.date).toLocaleDateString()}</td>
                                            <td>{obj.productId}</td>
                                            <td>{obj.name}</td>
                                            <td>{obj.quantity}</td>
                                            <td>
                                                <span className={`badge ${obj.status === 'Pending' ? 'bg-warning' : obj.status === 'Approved' ? 'bg-success' : obj.status === 'Rejected' ? 'bg-danger' : 'bg-info'}`}>
                                                    {obj.status}
                                                </span>
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
                                <p><strong>Product ID:</strong> {selectedRfq.productId}</p>
                                <p><strong>Customer Name:</strong> {selectedRfq.name}</p>
                                <p><strong>Email:</strong> {selectedRfq.email}</p>
                                <p><strong>Phone:</strong> {selectedRfq.number}</p>
                                <p><strong>Quantity Requested:</strong> {selectedRfq.quantity}</p>
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
