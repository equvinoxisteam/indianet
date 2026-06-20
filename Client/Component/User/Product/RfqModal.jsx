import { useContext, useEffect, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import Server, { ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast'

function RfqModal({ show, setShow, product, selectedVariant, selectedVariantLabel }) {
  const { userLogged, setLoginModal } = useContext(ContentControl)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [rfqDetails, setRfqDetails] = useState({
    userName: '',
    userEmail: '',
    userNumber: '',
    quantity: 1,
    message: ''
  })

  useEffect(() => {
    if (!show) return
    setSubmitted(false)
    setRfqDetails((prev) => ({
      ...prev,
      userName: userLogged.status ? (userLogged.name || '') : '',
      userEmail: userLogged.status ? (userLogged.email || '') : '',
    }))
  }, [show, userLogged.status, userLogged.name, userLogged.email])

  const buildPayload = () => ({
    userId: userLogged.status ? userLogged._id : undefined,
    userName: rfqDetails.userName.trim(),
    userEmail: rfqDetails.userEmail.trim().toLowerCase(),
    userNumber: rfqDetails.userNumber.trim(),
    productId: product._id,
    productName: product.name,
    productSlug: product.slug,
    productImage: product.files[0]?.filename || '',
    vendorId: product.vendorId || product.pickup_location || null,
    quantity: rfqDetails.quantity,
    message: rfqDetails.message,
    variantSize: selectedVariantLabel || product.currVariantSize || '',
    variantDetails: selectedVariant?.details || product.variantDetails || '',
  })

  const submitPayload = (payload) => {
    setLoading(true)
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    const headers = token ? { 'x-access-token': token } : {}

    Server.post('/users/submitRfq', payload, { headers }).then(() => {
      setLoading(false)
      setSubmitted(true)
      setRfqDetails((prev) => ({ ...prev, userNumber: '', quantity: 1, message: '' }))
    }).catch((err) => {
      setLoading(false)
      const msg = err?.response?.data?.error || 'Failed to submit quote request. Please try again.'
      toast.error(msg)
    })
  }

  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) setShow(false)
  }

  const submitRfq = (e) => {
    e.preventDefault()

    if (!rfqDetails.userName.trim()) {
      toast.error('Please enter your name.')
      return
    }
    if (!rfqDetails.userEmail.trim()) {
      toast.error('Please enter your email.')
      return
    }
    if (!rfqDetails.userNumber.trim()) {
      toast.error('Please enter a phone number.')
      return
    }
    if (rfqDetails.quantity < 1) {
      toast.error('Quantity must be at least 1.')
      return
    }

    submitPayload(buildPayload())
  }

  const closeModal = () => {
    setShow(false)
    setSubmitted(false)
  }

  if (!show) return null

  if (submitted) {
    return (
      <div className='modal-overlay' onClick={handleWrapperClick}>
        <div className='card-flat rfq-modal-card'>
          <div className='rfq-modal-header'>
            <h4 className='rfq-modal-title'>Quote submitted</h4>
            <button type='button' className='rfq-modal-close' onClick={closeModal} aria-label='Close modal'>&times;</button>
          </div>
          <div className='rfq-modal-form'>
            <p className='mb-3'>
              Your request has been sent to the supplier. They will respond based on their plan quota. Our team also receives a copy for support.
            </p>
            {!userLogged.status && (
              <div className='rfq-login-prompt p-3 mb-3 rounded border'>
                <p className='small mb-2 mb-md-3'>
                  Want to track this quote? Sign in to view your RFQ history anytime.
                </p>
                <div className='d-flex flex-wrap gap-2'>
                  <button
                    type='button'
                    className='btn-primary rfq-submit-btn'
                    style={{ flex: '1 1 auto', minWidth: '120px' }}
                    onClick={() => {
                      closeModal()
                      setLoginModal({ btn: true, active: true, member: true, forgot: false })
                    }}
                  >
                    Sign in
                  </button>
                  <button
                    type='button'
                    className='btn btn-outline-secondary'
                    style={{ flex: '1 1 auto', minWidth: '120px' }}
                    onClick={closeModal}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            )}
            {userLogged.status && (
              <button type='button' className='btn-primary rfq-submit-btn w-100' onClick={closeModal}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='modal-overlay' onClick={handleWrapperClick}>
      <div className='card-flat rfq-modal-card'>
        <div className='rfq-modal-header'>
          <h4 className='rfq-modal-title'>Request a Quote</h4>
          <button type='button' className='rfq-modal-close' onClick={closeModal} aria-label='Close modal'>&times;</button>
        </div>

        <div className='rfq-modal-product'>
          <img
            className='rfq-modal-product-img'
            src={ServerId + '/product/' + product.uni_id_1 + product.uni_id_2 + '/' + product.files[0].filename}
            alt={product.name}
          />
          <div>
            <h6 className='rfq-modal-product-name'>{product.name}</h6>
            <span className='rfq-modal-product-variant'>Variant: {selectedVariantLabel || product.currVariantSize || 'Standard'}</span>
          </div>
        </div>

        <form onSubmit={submitRfq} className='rfq-modal-form'>
          {!userLogged.status && (
            <>
              <div className='rfq-form-group'>
                <label className='form-label'>Your Name *</label>
                <input type='text' className='input-field' value={rfqDetails.userName} onChange={(e) => setRfqDetails({ ...rfqDetails, userName: e.target.value })} placeholder='Full name' required />
              </div>
              <div className='rfq-form-group'>
                <label className='form-label'>Email *</label>
                <input type='email' className='input-field' value={rfqDetails.userEmail} onChange={(e) => setRfqDetails({ ...rfqDetails, userEmail: e.target.value })} placeholder='you@company.com' required />
              </div>
            </>
          )}

          <div className='rfq-form-group'>
            <label className='form-label'>Phone Number *</label>
            <input type='text' className='input-field' value={rfqDetails.userNumber} onChange={(e) => setRfqDetails({ ...rfqDetails, userNumber: e.target.value })} placeholder='+91 9876543210' required />
          </div>

          <div className='rfq-form-group'>
            <label className='form-label'>Quantity *</label>
            <input type='number' min='1' className='input-field' value={rfqDetails.quantity} onChange={(e) => setRfqDetails({ ...rfqDetails, quantity: parseInt(e.target.value, 10) || 1 })} required />
          </div>

          <div className='rfq-form-group rfq-form-group--message'>
            <label className='form-label'>Additional Message (Optional)</label>
            <textarea className='input-field' rows='3' value={rfqDetails.message} onChange={(e) => setRfqDetails({ ...rfqDetails, message: e.target.value })} placeholder='Tell us your specific requirements...'></textarea>
          </div>

          <p className='text-muted small mb-2'>No login required. Sign in after submit is optional — to track your quotes.</p>

          <button type='submit' className='btn-primary rfq-submit-btn' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RfqModal
