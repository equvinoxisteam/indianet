import { useRouter } from 'next/router'
import Server from '../../../Config/Server'

function EditOrder({ Order }) {

    return (
        <div className='containerVendor OrderDetails'>
            <div className="vendorPageHeader">
                <h1 className="vendorPageTitle">Order details</h1>
                <p className="vendorPageSubtitle">View customer, payment and shipment information</p>
            </div>

            <div className="settingsProfileCard">
                <div className='d-flex flex-wrap gap-2 mb-3'>
                    <button
                        type="button"
                        className="vendorBtnSecondary"
                        data-for="showproduct"
                        onClick={() => window.open(`/p/${Order.slug}/${Order.proId}`, '_blank')}
                    >
                        <i className="fa-solid fa-up-right-from-square me-1" /> Show product
                    </button>
                </div>

                <div className="row g-3">
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Order status</label>
                        <input type="text" className="form-control" value={Order.OrderStatus || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Created on</label>
                        <input type="text" className="form-control" value={Order.created || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Secret order ID</label>
                        <input type="text" className="form-control" value={Order.secretOrderId || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Variant size</label>
                        <input type="text" className="form-control" value={Order.variantSize || '—'} readOnly disabled />
                    </div>
                    {Order.OrderStatus === 'Return' && (
                        <div className='col-12'>
                            <label className="form-label fw-semibold">Return reason</label>
                            <textarea className="form-control" value={Order.returnReason || ''} rows={3} readOnly disabled />
                        </div>
                    )}

                    <div className='col-12'><h3 className="settingsProfileCardTitle">Payment & product</h3></div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Payment type</label>
                        <input type="text" className="form-control" value={Order.details?.payType || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Payment ID</label>
                        <input type="text" className="form-control" value={Order.payId || '—'} readOnly disabled />
                    </div>
                    <div className='col-12'>
                        <label className="form-label fw-semibold">Product name</label>
                        <textarea className="form-control" value={Order.proName || ''} rows={2} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Quantity</label>
                        <input type="text" className="form-control" value={Order.quantity ?? ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">Price</label>
                        <input type="text" className="form-control" value={Order.price ?? ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">MRP</label>
                        <input type="text" className="form-control" value={Order.mrp ?? ''} readOnly disabled />
                    </div>

                    <div className='col-12'><h3 className="settingsProfileCardTitle">Customer address</h3></div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Name</label>
                        <input type="text" className="form-control" value={Order.details?.name || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Locality</label>
                        <input type="text" className="form-control" value={Order.details?.locality || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Phone</label>
                        <input type="text" className="form-control" value={Order.details?.number || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-6'>
                        <label className="form-label fw-semibold">Email</label>
                        <input type="text" className="form-control" value={Order.details?.email || ''} readOnly disabled />
                    </div>
                    <div className='col-12'>
                        <label className="form-label fw-semibold">Address</label>
                        <textarea className="form-control" value={Order.details?.address || ''} rows={3} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">PIN code</label>
                        <input type="text" className="form-control" value={Order.details?.pin || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">City</label>
                        <input type="text" className="form-control" value={Order.details?.city || ''} readOnly disabled />
                    </div>
                    <div className='col-12 col-md-4'>
                        <label className="form-label fw-semibold">State</label>
                        <input type="text" className="form-control" value={Order.details?.state || ''} readOnly disabled />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default EditOrder