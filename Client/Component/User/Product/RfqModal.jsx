import { useContext, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import Server, { ServerId, userAxios } from '../../../Config/Server'
import toast from 'react-hot-toast'

function RfqModal({ show, setShow, product, selectedVariant, selectedVariantLabel }) {
  const { userLogged, setLoginModal } = useContext(ContentControl)
  const [loading, setLoading] = useState(false)
  const [rfqDetails, setRfqDetails] = useState({
    userNumber: '',
    quantity: 1,
    message: ''
  })

  // Close if click outside
  const handleWrapperClick = (e) => {
    if (e.target === e.currentTarget) {
      setShow(false)
    }
  }

  const submitRfq = (e) => {
    e.preventDefault()

    if (!userLogged.status) {
      setShow(false)
      setLoginModal(obj => ({
        ...obj,
        btn: true,
        active: true,
        member: true,
        forgot: false
      }))
      return
    }

    if (!rfqDetails.userNumber) {
      toast.error("Please enter a phone number.")
      return
    }
    if (rfqDetails.quantity < 1) {
      toast.error("Quantity must be at least 1.")
      return
    }

    setLoading(true)
    userAxios((server) => {
      server.post('/users/submitRfq', {
        userId: userLogged._id,
        userName: userLogged.name,
        userEmail: userLogged.email,
        userNumber: rfqDetails.userNumber,
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        productImage: product.files[0]?.filename || '',
        vendorId: product.vendorId || product.pickup_location || null,
        quantity: rfqDetails.quantity,
        message: rfqDetails.message,
        variantSize: selectedVariantLabel || product.currVariantSize || '',
        variantDetails: selectedVariant?.details || product.variantDetails || ''
      }).then((res) => {
        setLoading(false)
        if (res.data.login) {
          setShow(false)
          setLoginModal(obj => ({
            ...obj,
            btn: true,
            active: true,
            member: true,
            forgot: false
          }))
        } else {
          toast.success("Quote requested! You can submit as many RFQs as you need. Our team will review and forward to the supplier.")
          setShow(false)
          setRfqDetails({ userNumber: '', quantity: 1, message: '' })
        }
      }).catch((err) => {
        setLoading(false)
        toast.error("Failed to submit quote request. Please try again.")
      })
    })
  }

  if (!show) return null

  return (
    <div className='modal-overlay' onClick={handleWrapperClick}>
      <div className='card-flat rfq-modal-card'>
        <div className='rfq-modal-header'>
          <h4 className='rfq-modal-title'>Request a Quote</h4>
          <button type='button' className='rfq-modal-close' onClick={() => setShow(false)} aria-label='Close modal'>&times;</button>
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
          <div className='rfq-form-group'>
            <label className='form-label'>Phone Number *</label>
            <input type='text' className='input-field' value={rfqDetails.userNumber} onChange={(e) => setRfqDetails({...rfqDetails, userNumber: e.target.value})} placeholder='+91 9876543210' required />
          </div>

          <div className='rfq-form-group'>
            <label className='form-label'>Quantity *</label>
            <input type='number' min='1' className='input-field' value={rfqDetails.quantity} onChange={(e) => setRfqDetails({...rfqDetails, quantity: parseInt(e.target.value)})} required />
          </div>

          <div className='rfq-form-group rfq-form-group--message'>
            <label className='form-label'>Additional Message (Optional)</label>
            <textarea className='input-field' rows='3' value={rfqDetails.message} onChange={(e) => setRfqDetails({...rfqDetails, message: e.target.value})} placeholder='Tell us your specific requirements...'></textarea>
          </div>

          <button type='submit' className='btn-primary rfq-submit-btn' disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RfqModal
