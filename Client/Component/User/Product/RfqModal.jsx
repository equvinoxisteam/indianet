import { useContext, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import Server, { ServerId, userAxios } from '../../../Config/Server'
import toast from 'react-hot-toast'

function RfqModal({ show, setShow, product }) {
  const { userLogged, setLoginModal } = useContext(ContentControl)
  const [loading, setLoading] = useState(false)
  const [rfqDetails, setRfqDetails] = useState({
    userNumber: '',
    quantity: 1,
    message: ''
  })

  // Close if click outside
  const handleWrapperClick = (e) => {
    if (e.target.className === 'modal-overlay') {
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
        vendorId: product.pickup_location,
        quantity: rfqDetails.quantity,
        message: rfqDetails.message
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
          toast.success("Quote Requested Successfully! Our team will contact you soon.")
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
    <div className='modal-overlay' onClick={handleWrapperClick} style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex',
      justifyContent: 'center', alignItems: 'center'
    }}>
      <div className='card' style={{ width: '90%', maxWidth: '500px', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h4 style={{ margin: 0 }}>Request a Quote</h4>
          <button style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }} onClick={() => setShow(false)}>&times;</button>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
          <img src={ServerId + '/product/' + product.uni_id_1 + product.uni_id_2 + '/' + product.files[0].filename} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '6px' }} />
          <div>
            <h6 style={{ margin: 0, fontSize: '0.9rem' }}>{product.name}</h6>
            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Variant: {product.currVariantSize}</span>
          </div>
        </div>

        <form onSubmit={submitRfq}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Phone Number *</label>
            <input type='text' className='input-field' value={rfqDetails.userNumber} onChange={(e) => setRfqDetails({...rfqDetails, userNumber: e.target.value})} placeholder='+91 9876543210' required />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Quantity *</label>
            <input type='number' min='1' className='input-field' value={rfqDetails.quantity} onChange={(e) => setRfqDetails({...rfqDetails, quantity: parseInt(e.target.value)})} required />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>Additional Message (Optional)</label>
            <textarea className='input-field' rows='3' value={rfqDetails.message} onChange={(e) => setRfqDetails({...rfqDetails, message: e.target.value})} placeholder='Tell us your specific requirements...'></textarea>
          </div>

          <button type='submit' className='btn-primary' style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default RfqModal
