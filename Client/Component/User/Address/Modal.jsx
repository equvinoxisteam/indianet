import { userAxios } from '@/Config/Server'
import React, { useEffect, useState } from 'react'
import Xicon from '@/Assets/Xicon'
import toast from 'react-hot-toast';
import { Countries } from '@/Config/GlobalData';

function Modal({ Address, setUpdate, setUserLogged }) {
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        countryCode: '+91',
        number: '',
        pin: '',
        locality: '',
        address: '',
        city: '',
        state: '',
        country: 'India'
    })

    useEffect(() => {
        if (Address.name && !Address.new) {
            setFormData({
                ...Address,
                countryCode: Address.countryCode || '+91',
                country: Address.country || 'India'
            })
        } else {
            setFormData({
                name: '',
                countryCode: '+91',
                number: '',
                pin: '',
                locality: '',
                address: '',
                city: '',
                state: '',
                country: 'India'
            })
        }
    }, [Address])

    const formHandle = (e) => {
        e.preventDefault()
        // Validating 6-digit as requested specifically
        if (formData.pin.length === 6) {
            if (formData.number.length >= 8 && formData.number.length <= 15) {
                if (!Address.new) {
                    userAxios((server) => {
                        server.put('/users/editAddress', formData).then((res) => {
                            if (res.data.login) {
                                setUserLogged({ status: false })
                                localStorage.removeItem('token')
                            } else {
                                setUpdate(update => !update)
                                toast.success("Updated Successfully")
                            }
                        }).catch(() => {
                            toast.error("Error Updating Address")
                        })
                    })
                } else {
                    userAxios((server) => {
                        server.post('/users/addAddress', formData).then((res) => {
                            if (res.data.login) {
                                setUserLogged({ status: false })
                                localStorage.removeItem('token')
                            } else {
                                setUpdate(update => !update)
                                setFormData({
                                    name: '',
                                    countryCode: '+91',
                                    number: '',
                                    pin: '',
                                    locality: '',
                                    address: '',
                                    city: '',
                                    state: '',
                                    country: 'India'
                                })
                                toast.success("Address Added")
                            }
                        }).catch(() => {
                            toast.error("Error Adding Address")
                        })
                    })
                }
            } else {
                toast.error("Invalid Mobile Number")
            }
        } else {
            toast.error("Pincode Must be 6 Digits")
        }
    }

    return (
        <div className="modal fade" id="addressModal" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-lg">
                <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '16px' }}>
                    <div className="modal-header border-0 pb-0 px-4 pt-4">
                        <h5 className="modal-title font-bold UserBlackMain" style={{ fontSize: '1.25rem' }}>
                            {Address.new ? 'Add Shipping Address' : 'Edit Shipping Address'}
                        </h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body p-4">
                        <form onSubmit={formHandle}>
                            <div className="row">
                                <div className="col-12 mb-4">
                                     <label className='form-label mb-2'>COUNTRY / REGION</label>
                                     <select className='input-field px-3' value={formData.country} onChange={(e) => {
                                         const selected = Countries.find(c => c.name === e.target.value);
                                         setFormData({ ...formData, country: e.target.value, countryCode: selected?.code || '+91' })
                                     }} required>
                                         {Countries.map((c, i) => (
                                             <option key={i} value={c.name}>{c.name}</option>
                                         ))}
                                     </select>
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>FULL NAME</label>
                                     <input type="text" className='input-field' value={formData.name} onChange={(e) => {
                                         setFormData({ ...formData, name: e.target.value })
                                     }} placeholder='First and Last Name' required />
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>MOBILE NUMBER</label>
                                     <div className='d-flex gap-2'>
                                         <select className='input-field px-2' style={{ width: '95px', flexShrink: 0 }} value={formData.countryCode} onChange={(e) => {
                                             setFormData({ ...formData, countryCode: e.target.value })
                                         }}>
                                             {Countries.map((c, i) => (
                                                 <option key={i} value={c.code}>{c.code}</option>
                                             ))}
                                         </select>
                                         <input type="number" className='input-field flex-grow-1' value={formData.number} onInput={(e) => {
                                             setFormData({ ...formData, number: e.target.value })
                                         }} placeholder='Mobile Number' required />
                                     </div>
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>6-DIGIT PINCODE</label>
                                     <input type="number" className='input-field' value={formData.pin} onInput={(e) => {
                                         setFormData({ ...formData, pin: e.target.value })
                                     }} placeholder='6-digit Pincode' required />
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>LOCALITY / AREA</label>
                                     <input type="text" className='input-field' value={formData.locality} onInput={(e) => {
                                         setFormData({ ...formData, locality: e.target.value })
                                     }} placeholder='Locality' required />
                                 </div>
                                 <div className="col-12 mb-4">
                                     <label className='form-label mb-2'>ADDRESS (HOUSE NO, STREET, etc.)</label>
                                     <textarea className='input-field' style={{ height: '90px', paddingTop: '12px' }} value={formData.address} onInput={(e) => {
                                         setFormData({ ...formData, address: e.target.value })
                                     }} placeholder='Address (Area and Street)' required></textarea>
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>CITY / DISTRICT / TOWN</label>
                                     <input className='input-field' value={formData.city} onInput={(e) => {
                                         setFormData({ ...formData, city: e.target.value })
                                     }} type="text" placeholder='City/District/Town' required />
                                 </div>
                                 <div className="col-md-6 mb-4">
                                     <label className='form-label mb-2'>STATE / PROVINCE / REGION</label>
                                     <input className='input-field' value={formData.state} onInput={(e) => {
                                         setFormData({ ...formData, state: e.target.value })
                                     }} type="text" placeholder='Enter State' required />
                                 </div>

                                 <div className="col-12 mt-4">
                                     <button className='btn btn-navy w-100 py-3 font-bold mb-3 shadow-navy' data-bs-dismiss="modal" type='submit' style={{ borderRadius: '12px' }}>
                                         {Address.new ? 'ADD NEW ADDRESS' : 'SAVE CHANGES'}
                                     </button>
                                     <button className='btn btn-light w-100 py-2 text-muted border-0 bg-transparent' data-bs-dismiss="modal" type='button' style={{ fontSize: '0.9rem' }}>
                                         CANCEL
                                     </button>
                                 </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal