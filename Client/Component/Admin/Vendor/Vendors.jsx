import Loading from '@/Component/Loading/Loading'
import ContentControl from '@/ContentControl/ContentControl'
import { useRouter } from 'next/router'
import { useContext, useState } from 'react'
import { useEffect } from 'react'
import { adminAxios, apiUnreachableMessage } from '../../../Config/Server'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import VendorSubscriptions from './VendorSubscriptions'

function Vendors({ loaded, setLoaded }) {

  const { setAdminLogged } = useContext(ContentControl)

  const navigate = useRouter()

  const [vendors, setVendors] = useState([])

  const [total, setTotal] = useState(0)

  const [accepted, setAccepted] = useState(true)
  const [view, setView] = useState('vendors')

  const logOut = () => {
    setAdminLogged({ status: false })
    localStorage.removeItem("adminToken")
    setLoaded(true)
    navigate.push('/admin/login')
  }

  const getVendors = (type) => {
    setLoaded(false)
    adminAxios((server) => {
      server.get('/admin/getVendors', {
        params: {
          accept: type,
          skip: 0
        }
      }).then((res) => {
        setLoaded(true)
        if (res.data.login) {
          logOut()
        } else {
          setVendors(res.data.vendors)
          setTotal(res.data.total)
        }
      }).catch((err) => {
        setLoaded(true)
        toast.error(apiUnreachableMessage(err) || 'Error')
      })
    })
  }
  useEffect(() => {
    getVendors(true)
  }, [])
  return (
    <>
      {
        loaded ? (
          <div className='vendorsComp' >
            <div className='AdminContainer pb-3'>
              <div className="adminPageHeader mb-3 pt-3">
                <h1>Vendors</h1>
                <p>Manage accepted and pending seller accounts</p>
              </div>

              <div className="BtnsSections text-center pt-3">
                <div className="row">
                  <div className="col-12 col-md-4 pb-2">
                    <button onClick={() => {
                      setView('vendors')
                      getVendors(true)
                      setAccepted(true)
                    }}>Accepted Vendors</button>
                  </div>
                  <div className="col-12 col-md-4 pb-2">
                    <button onClick={() => {
                      setView('vendors')
                      getVendors(false)
                      setAccepted(false)
                    }}>Pending Vendors</button>
                  </div>
                  <div className="col-12 col-md-4 pb-2">
                    <button onClick={() => setView('plans')}>Vendor Subscriptions</button>
                  </div>
                </div>
              </div>

              {view === 'plans' ? (
                <VendorSubscriptions logOut={logOut} onPlanChanged={() => getVendors(true)} />
              ) : (
              <div className='MainTable text-center'>
                <table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Company</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Number</th>
                      <th>Account</th>
                      <th>Plan</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {
                      vendors.map((obj, key) => {
                        return (
                          <tr key={key}>
                            <td>{obj.companyName || '—'}</td>
                            <td>{obj.adharName}</td>
                            <td>{obj.email}</td>
                            <td>{obj.number}</td>
                            <td>
                              {obj.accept ? 'Accepted' : 'Pending'}
                            </td>
                            <td>
                              {obj.planStatus === 'active' ? (obj.plan ? obj.plan.charAt(0).toUpperCase() + obj.plan.slice(1) : 'Active') : obj.planStatus === 'pending' ? `Pending (${obj.planRequested || '—'})` : '—'}
                            </td>
                            <td>
                              <button className='ActionBtn' onClick={() => {
                                navigate.push(`/admin/vendor/details/${obj._id}`)
                              }}>Details</button>

                              {obj.accept ? <button className='ActionBtn' onClick={() => {
                                navigate.push(`/admin/vendor/products/${obj._id}`)
                              }}>Products</button>
                                : <button className='ActionBtn' onClick={() => {
                                  adminAxios((server) => {
                                    server.put('/admin/acceptVendor', {
                                      email: obj.email,
                                      address: {
                                        pickup_location: obj._id,
                                        name: obj.adharName,
                                        email: obj.email,
                                        phone: obj.number,
                                        address: `${obj.address} pin code ${obj.pinCode}`,
                                        address_2: "",
                                        pin_code: obj.pinCode,
                                        city: obj.city,
                                        state: obj.state,
                                        country: "India",
                                      }
                                    }).then((res) => {
                                      if (res.data.login) {
                                        logOut()
                                      } else {
                                        toast.success("Done")
                                        getVendors(false)
                                      }
                                    }).catch((err) => {
                                      toast.error(apiUnreachableMessage(err) || 'Error')
                                    })
                                  })
                                }}>Accept</button>}

                              {
                                obj.accept ? <button className='ActionBtn' onClick={() => {
                                  Swal.fire({
  title: `Do you want delete vendor ${obj.adharName}`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
                                    adminAxios((server) => {
                                      server.delete('/admin/deleteVendor', {
                                        data: {
                                          email: obj.email,
                                          vendorId: obj._id
                                        }
                                      }).then((res) => {
                                        if (res.data.login) {
                                          logOut()
                                        } else {
                                          toast.success("Done")
                                          getVendors(true)
                                        }
                                      }).catch((err) => {
                                        toast.error(apiUnreachableMessage(err) || 'Error')
                                      })
                                    })
                                  
  }
})
                                }}>Delete</button> : <button className='ActionBtn' onClick={() => {
                                  Swal.fire({
  title: `Do you want delete vendor ${obj.adharName}`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
                                    adminAxios((server) => {
                                      server.delete('/admin/deleteVendor', {
                                        data: {
                                          email: obj.email,
                                          vendorId: obj._id
                                        }
                                      }).then((res) => {
                                        if (res.data.login) {
                                          logOut()
                                        } else {
                                          toast.success("Done")
                                          getVendors(false)
                                        }
                                      }).catch((err) => {
                                        toast.error(apiUnreachableMessage(err) || 'Error')
                                      })
                                    })
                                  
  }
})
                                }}>Delete</button>
                              }
                            </td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </table>
              </div>

              )}

              {view === 'vendors' && vendors.length !== total && <div>
                  <button data-for="loadMore" onClick={() => {
                    if (accepted) {
                      setLoaded(false)
                      adminAxios((server) => {
                        server.get('/admin/getVendors', {
                          params: {
                            accept: true,
                            skip: vendors.length
                          }
                        }).then((res) => {
                          if (res.data.login) {
                            logOut()
                          } else {
                            setTotal(res.data.total)
                            setVendors([...vendors, ...res.data.vendors])
                            setLoaded(true)
                          }
                        }).catch((err) => {
                          toast.error(apiUnreachableMessage(err) || 'Error')
                          setLoaded(true)
                        })
                      })
                    } else {
                      setLoaded(false)
                      adminAxios((server) => {
                        server.get('/admin/getVendors', {
                          params: {
                            accept: false,
                            skip: vendors.length
                          }
                        }).then((res) => {
                          if (res.data.login) {
                            logOut()
                          } else {
                            setTotal(res.data.total)
                            setVendors([...vendors, ...res.data.vendors])
                            setLoaded(true)
                          }
                        }).catch((err) => {
                          toast.error(apiUnreachableMessage(err) || 'Error')
                          setLoaded(true)
                        })
                      })
                    }
                  }}>Load More</button>
                </div>
              }

            </div>
          </div>
        ) : <Loading />
      }
    </>
  )
}

export default Vendors