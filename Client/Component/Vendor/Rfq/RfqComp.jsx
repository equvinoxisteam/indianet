import { vendorAxios } from '@/Config/Server'
import { useContext, useEffect, useMemo, useState } from 'react'
import Loading from '@/Component/Loading/Loading'
import ContentControl from '@/ContentControl/ContentControl'
import toast from 'react-hot-toast'

function RfqComp({ loaded, setLoaded }) {
  const { setVendorLogged } = useContext(ContentControl)

  const [search, setSearch] = useState('')
  const [rfqs, setRfqs] = useState([])
  const [total, setTotal] = useState(0)

  const [selectedRfq, setSelectedRfq] = useState(null)
  const [quotedPrice, setQuotedPrice] = useState('')
  const [planAccess, setPlanAccess] = useState(null)
  const [hiddenRfqCount, setHiddenRfqCount] = useState(0)
  const [totalApprovedRfqs, setTotalApprovedRfqs] = useState(0)

  const normalizeStatus = (s) => String(s ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
  const statusTitle = (s) => {
    const st = normalizeStatus(s)
    if (st === 'pending') return 'Pending'
    if (st === 'in progress' || st === 'in_progress') return 'In Progress'
    if (st === 'approved') return 'Approved'
    if (st === 'rejected') return 'Rejected'
    return s || ''
  }
  const rfqDateValue = (obj) => obj?.createdAt || obj?.date || null

  const logOut = () => {
    setVendorLogged({ status: false })
    localStorage.removeItem('vendorToken')
    setLoaded(true)
    window.location.href = '/vendor/login'
  }

  const fetchRfqs = (skipValue = 0, isLoadMore = false) => {
    vendorAxios((server) => {
      server.get('/vendor/getMyRfqs', {
        params: { search: search, skip: skipValue, status: 'all' }
      }).then((res) => {
        if (res.data.login) {
          logOut()
        } else {
          if (isLoadMore) {
            setRfqs([...rfqs, ...res.data.rfqs])
          } else {
            setRfqs(res.data.rfqs)
          }
          setTotal(res.data.total || 0)
          setHiddenRfqCount(res.data.hiddenCount || 0)
          setTotalApprovedRfqs(res.data.totalApproved || res.data.total || 0)
          if (res.data.planAccess) setPlanAccess((prev) => ({ ...prev, ...res.data.planAccess }))
          setLoaded(true)
        }
      }).catch(() => {
        setLoaded(true)
        toast.error('Failed to load RFQs')
      })
    })
  }

  useEffect(() => {
    setLoaded(false)
    fetchRfqs(0, false)
    vendorAxios((server) => {
      server.get('/vendor/getPlanAccess').then((res) => {
        if (!res.data.login) setPlanAccess(res.data)
      }).catch(() => {})
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const openRfq = (rfq) => {
    setSelectedRfq(rfq)
    setQuotedPrice(rfq.quotedPrice ?? '')
  }

  const submitQuote = () => {
    if (!selectedRfq) return

    const price = quotedPrice
    if (price === '' || price === null || price === undefined) {
      toast.error('Please enter quoted price')
      return
    }

    vendorAxios((server) => {
      server.put('/vendor/quoteRfq', {
        rfqId: selectedRfq._id,
        quotedPrice: price
      }).then((res) => {
        if (res.data === 'done') {
          toast.success('Quote saved')
          setSelectedRfq(null)
          fetchRfqs(0, false)
          vendorAxios((s) => {
            s.get('/vendor/getPlanAccess').then((r) => {
              if (!r.data.login) setPlanAccess(r.data)
            }).catch(() => {})
          })
        }
      }).catch((err) => {
        toast.error(err.response?.data?.error || 'Failed to save quote')
      })
    })
  }

  const modal = useMemo(() => {
    if (!selectedRfq) return null

    return (
      <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 2000 }}>
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 shadow-lg rounded-3">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title fw-bold">RFQ details</h5>
              <button type="button" className="btn-close" onClick={() => setSelectedRfq(null)} aria-label="Close" />
            </div>
            <div className="modal-body text-start pt-2">
              <div className="row g-2 small">
                <div className="col-sm-6"><span className="text-muted">Product ID</span><div className="fw-medium">{selectedRfq.productId}</div></div>
                <div className="col-sm-6"><span className="text-muted">Status</span><div><span className="badge bg-light text-dark border">{statusTitle(selectedRfq.status)}</span></div></div>
                <div className="col-sm-6"><span className="text-muted">Customer</span><div className="fw-medium">{selectedRfq.userName || selectedRfq.name || '—'}</div></div>
                <div className="col-sm-6"><span className="text-muted">Quantity</span><div>{selectedRfq.quantity}</div></div>
                <div className="col-12"><span className="text-muted">Email</span><div>{selectedRfq.userEmail || selectedRfq.email || '—'}</div></div>
                <div className="col-12"><span className="text-muted">Phone</span><div>{selectedRfq.userNumber || selectedRfq.number || '—'}</div></div>
                <div className="col-12"><span className="text-muted">Message</span><div className="border rounded p-2 bg-light mt-1">{selectedRfq.message || '—'}</div></div>
              </div>
              <hr className="my-3" />
              <label className="form-label fw-bold small">Your quoted price (₹)</label>
              <input
                type="number"
                className="form-control form-control-lg"
                value={quotedPrice}
                onChange={(e) => setQuotedPrice(e.target.value)}
                placeholder="Enter price"
              />
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setSelectedRfq(null)}>Close</button>
              <button type="button" className="btn btn-dark rounded-pill px-4" onClick={submitQuote}>Save quote</button>
            </div>
          </div>
        </div>
      </div>
    )
  }, [selectedRfq, quotedPrice])

  return (
    <>
      {loaded ? (
        <div className="OrdersComp containerVendor">
          <div className="vendorPageHeader">
            <h1 className="vendorPageTitle">Request for quotes</h1>
            <p className="vendorPageSubtitle">New buyer enquiries arrive automatically — respond within your monthly plan quota</p>
          </div>

          {planAccess && !planAccess.isActive && (
            <div className="alert alert-warning">
              {planAccess.isPaused
                ? 'Your plan is paused by admin. You cannot view or quote RFQs until it is resumed.'
                : planAccess.isPending
                ? 'Your plan request is pending admin activation. You cannot quote RFQs until your plan is active.'
                : planAccess.isExpired
                  ? 'Your plan has expired. Request a new plan from the Plans page.'
                  : 'An active plan is required to respond to RFQs. Go to Plans to upgrade.'}
            </div>
          )}
          {planAccess?.isActive && (
            <div className="alert alert-light border py-2 mb-3">
              <strong>{planAccess.planLabel}</strong> plan
              {' · '}
              Showcase: {planAccess.showcaseUnlimited
                ? `${planAccess.showcaseUsed ?? 0} / Unlimited`
                : `${planAccess.showcaseUsed ?? 0}/${planAccess.showcaseLimit ?? 0}`}
              {planAccess.showcaseLocked && !planAccess.canChangeShowcase && ' (locked)'}
            </div>
          )}
          {planAccess?.isActive && planAccess.rfqQuotaLimit != null && (
            <div className="alert alert-info py-2">
              RFQ quota this month: <strong>{planAccess.rfqQuotaUsed}/{planAccess.rfqQuotaLimit}</strong>
              {planAccess.rfqQuotaRemaining === 0 && ' — quota reached'}
            </div>
          )}
          {planAccess?.isActive && planAccess.rfqQuotaLimit == null && (
            <div className="alert alert-success py-2">Unlimited RFQ visibility and responses on your {planAccess.planLabel} plan.</div>
          )}
          {planAccess?.isActive && hiddenRfqCount > 0 && (
            <div className="alert alert-warning py-2">
              <strong>{hiddenRfqCount}</strong> additional approved RFQ{hiddenRfqCount === 1 ? '' : 's'} this month are hidden by your plan limit
              ({totalApprovedRfqs} total approved, showing {planAccess.rfqQuotaLimit}). Upgrade to see and respond to more.
            </div>
          )}

          <form
            className="vendorToolbar"
            onSubmit={(e) => {
              e.preventDefault()
              setLoaded(false)
              fetchRfqs(0, false)
            }}
          >
            <div className="vendorSearchWrap" style={{ maxWidth: '100%' }}>
              <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
              <input
                className="vendorSearchInput"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by customer name…"
                aria-label="Search RFQs"
              />
            </div>
            <button type="submit" className="vendorBtnSecondary">
              <i className="fa-solid fa-rotate me-1" /> Refresh
            </button>
          </form>

          <div className="vendorTableCard">
            <div className="table-responsive">
              <table className="vendorTable table mb-0">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product ID</th>
                    <th>Customer</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Quoted</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rfqs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-5">No RFQs yet.</td>
                    </tr>
                  ) : (
                    rfqs.map((obj, key) => (
                      <tr key={key}>
                        <td>{rfqDateValue(obj) ? new Date(rfqDateValue(obj)).toLocaleDateString() : '—'}</td>
                        <td className="small font-monospace">{obj.productId}</td>
                        <td className="fw-medium">{obj.userName || obj.name || '—'}</td>
                        <td>{obj.quantity}</td>
                        <td><span className="badge bg-light text-dark border">{statusTitle(obj.status)}</span></td>
                        <td>{obj.quotedPrice !== null && obj.quotedPrice !== undefined ? `₹${obj.quotedPrice}` : '—'}</td>
                        <td>
                          <button type="button" className="vendorBtnSecondary" onClick={() => openRfq(obj)}>View</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {rfqs.length < total && (
            <div className="text-center mt-3">
              <button type="button" className="vendorBtnPrimary" data-for="loadMore" onClick={() => fetchRfqs(rfqs.length, true)}>
                Load more
              </button>
            </div>
          )}

          {modal}
        </div>
      ) : <Loading />}
    </>
  )
}

export default RfqComp
