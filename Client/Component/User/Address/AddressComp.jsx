import UserIcon from '../../../Assets/UserIcon'
import TruckIcon from '../../../Assets/TruckIcon'
import HeartIcon from '../../../Assets/HeartIcon'
import CartIcon from '../../../Assets/CartIcon'
import LocationIcon from '../../../Assets/LocationIcon'
import EllipsisIcon from '../../../Assets/ellipsisIcon'
import LogoutIcon from '../../../Assets/logoutIcon'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import Modal from './Modal'
import { userAxios } from '@/Config/Server'
import toast from 'react-hot-toast';

function AddressComp({ address, setUpdate }) {
    const [editAddress, setEditAddress] = useState({})
    const { setUserLogged } = useContext(ContentControl)
    const navigate = useRouter()

    const savedAddresses = address?.saved || null

    return (
        <div className='AddressComp'>
            <Modal Address={editAddress} setUpdate={setUpdate} setUserLogged={setUserLogged} />
            <div className="container container-fluid pt-5 pb-5">

                <div>
                    <div className='pb-4 MobNon'>
                        <h3 className='UserBlackMain font-bold'>My Account</h3>
                    </div>

                    <div className="row">

                        <div className="col-12 col-md-3">
                            <div className="Menu">

                                <div className='BtnDiv'>
                                    <button onClick={() => {
                                        navigate.push('/account')
                                    }}>
                                        <span><UserIcon color={'#1A3C5E'} /></span>
                                        <span className='span2'>My Details</span>
                                    </button>
                                </div>

                                <div className='BtnDiv'>
                                    <button className='active'>
                                        <span><LocationIcon color={'#ffffff'} /></span>
                                        <span className='span2'>My Address</span>
                                    </button>
                                </div>

                                <div className='BtnDiv'>
                                    <button onClick={() => {
                                        navigate.push('/orders')
                                    }}>
                                        <span><TruckIcon color={'#1A3C5E'} /></span>
                                        <span className='span2'>My Orders</span>
                                    </button>
                                </div>

                                <div className='BtnDiv'>
                                    <button onClick={() => {
                                        navigate.push('/wishlist')
                                    }}>
                                        <span><HeartIcon color={'#1A3C5E'} /></span>
                                        <span className='span2'>My Wishlist</span>
                                    </button>
                                </div>

                                <div className='BtnDiv'>
                                    <button onClick={() => {
                                        navigate.push('/cart')
                                    }}>
                                        <span><CartIcon color={'#1A3C5E'} /></span>
                                        <span className='span2'>My Cart</span>
                                    </button>
                                </div>

                                <div className='BtnDiv'>
                                    <button onClick={() => {
                                        localStorage.removeItem('token')
                                        setUserLogged({ status: false })
                                        navigate.push('/')
                                    }}>
                                        <span><LogoutIcon color={'#1A3C5E'} /></span>
                                        <span className='span2'>Logout</span>
                                    </button>
                                </div>

                            </div>
                        </div>

                        <div className="col-12 col-md-9">
                            <div className="MainCard" style={{ borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>
                                <div className='d-flex justify-content-between align-items-center mb-4'>
                                    <h4 className='UserBlackMain font-bold mb-0'>Saved Addresses</h4>
                                    <button 
                                        className='btn btn-navy d-flex align-items-center gap-2 px-4 shadow-navy' 
                                        type='button'
                                        data-bs-toggle="modal" 
                                        data-bs-target="#addressModal"
                                        onClick={() => {
                                            setEditAddress({
                                                new: true
                                            })
                                        }}>
                                        <i className="fa-solid fa-plus font-bold"></i>
                                        Add New Address
                                    </button>
                                </div>

                                <div className="row g-4">
                                    {
                                        savedAddresses === null ? (
                                            <div className="col-12 text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <p className="text-muted mt-3">Loading addresses...</p>
                                            </div>
                                        ) : savedAddresses.map((obj, key) => {
                                            return (
                                                <div className="col-12" key={key}>
                                                    <div className="AddressCard p-4 border rounded-4 bg-light transition-all hover-shadow" style={{ transition: 'all 0.3s ease' }}>
                                                        <div className='row align-items-center'>
                                                            <div className="col-md-10">
                                                                <div className='d-flex align-items-center gap-2 mb-2'>
                                                                    <span className='badge badge-primary'>HOME</span>
                                                                    <h6 className='font-bold UserBlackMain mb-0'>{obj.name}</h6>
                                                                    <span className='text-muted mx-2'>|</span>
                                                                    <h6 className='font-bold UserBlackMain mb-0'>{obj.countryCode} {obj.number}</h6>
                                                                </div>
                                                                <div className='text-muted' style={{ fontSize: '0.9rem' }}>
                                                                    <p className='mb-1'>{obj.address}, {obj.locality}</p>
                                                                    <p className='mb-0'>{obj.city}, {obj.state} — <span className='font-bold text-dark'>{obj.pin}</span></p>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-2 text-end">
                                                                <div className="dropdown">
                                                                    <button
                                                                        className="btn btn-light rounded-circle shadow-sm"
                                                                        style={{ width: '40px', height: '40px', padding: 0 }}
                                                                        type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                                                        <i className="fa-solid fa-ellipsis-vertical text-muted"></i>
                                                                    </button>
                                                                    <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3">
                                                                        <li><a className="dropdown-item py-2 d-flex align-items-center gap-2" type='button'
                                                                            data-bs-toggle="modal" data-bs-target="#addressModal" onClick={() => {
                                                                                setEditAddress(obj)
                                                                            }}><i className="fa-solid fa-pencil text-primary"></i> Edit</a></li>
                                                                        <li><hr className="dropdown-divider" /></li>
                                                                        <li><a className="dropdown-item py-2 d-flex align-items-center gap-2 text-danger" type='button'
                                                                            onClick={() => {
                                                                                userAxios((server) => {
                                                                                    server.delete('/users/deleteAddress', {
                                                                                        data: {
                                                                                            id: obj.id
                                                                                        }
                                                                                    }).then((res) => {
                                                                                        if (res.data.login) {
                                                                                            setUserLogged({ status: false })
                                                                                            localStorage.removeItem('token')
                                                                                        } else {
                                                                                            setUpdate(update => !update)
                                                                                            toast.success("Address Removed")
                                                                                        }
                                                                                    }).catch(() => {
                                                                                        toast.error("Error deleting address")
                                                                                    })
                                                                                })
                                                                            }} ><i className="fa-solid fa-trash"></i> Delete</a></li>
                                                                    </ul>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    {savedAddresses !== null && savedAddresses.length === 0 && (
                                        <div className="col-12 text-center py-5">
                                            <div className='mb-4 opacity-25'>
                                                <i className="fa-solid fa-map-location-dot fa-4x text-muted"></i>
                                            </div>
                                            <h5 className='text-muted'>No addresses found</h5>
                                            <p className='text-muted text-small'>Please add your shipping address to proceed with checkout.</p>
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    )
}

export default AddressComp