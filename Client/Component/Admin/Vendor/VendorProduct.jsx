import Loading from '@/Component/Loading/Loading'
import ContentControl from '@/ContentControl/ContentControl'
import { useRouter } from 'next/router'
import { useContext, useEffect, useState } from 'react'
import Server, { adminAxios, ServerId } from '../../../Config/Server'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function VendorProduct({ vendorId, loaded, setLoaded }) {
  let router = useRouter()

  const { setAdminLogged } = useContext(ContentControl)

  const logOut = () => {
    setAdminLogged({ status: false })
    localStorage.removeItem("adminToken")
    setLoaded(true)
    router.push('/admin/login')
  }

  const [search, setSearch] = useState('')

  const [total, setTotal] = useState(0)
  const [products, setProducts] = useState([])

  const getProducts = () => {
    adminAxios((server) => {
      server.get('/admin/getOneVendorProducts', {
        params: {
          vendorId: vendorId,
          search: search,
          skip: 0
        }
      }).then((res) => {
        if (res.data.login) {
          logOut()
        } else {
          setProducts(res.data.products)
          setTotal(res.data.total)
          setLoaded(true)
        }
      }).catch((err) => {
        if (err.response.data['status'] === 404) {
          toast.error("Vendor Not Found")
        } else {
          toast.error("Error")
        }
        setLoaded(true)
        router.push('/admin/vendors')
      })
    })
  }

  useEffect(() => {
    if (vendorId) {
      getProducts()
    }
  }, [vendorId])

  return (
    <>
      {
        loaded ? (
          <div className='VendorProduct AdminContainer pb-3'>
            <div className="BtnsSections text-center pt-3">
              <div className="row">
                <div className="col-12 col-md-4 pb-2">
                  <form onSubmit={(e) => {
                    e.preventDefault()
                    setLoaded(false)
                    getProducts()
                  }}>
                    <input type="text" value={search} onInput={(e) => {
                      setSearch(e.target.value)
                    }} placeholder='Search Name' name="" id="" />
                  </form>
                </div>

              </div>
            </div>

            <div className='MainTable text-center'>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Mrp</th>
                    <th>Discount</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {
                    products.map((obj, key) => {
                      return (
                        <tr key={key}>
                          <td>
                            <img
                              src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                              alt={obj.name}
                            />
                          </td>
                          <td className='oneLineTxtMax-300'>
                            {obj.name}
                          </td>
                          <td>
                            {obj.category}
                          </td>
                          <td>
                            ₹{obj.price}
                          </td>
                          <td>
                            ₹{obj.mrp}
                          </td>
                          <td>
                            {obj.discount} %
                          </td>
                          <td>
                            <button className="ActionBtn" onClick={() => {
                              window.open(`/p/${obj.slug}/${obj._id}`, '_blank')
                            }}>view</button>
                            <button className="ActionBtn" onClick={() => {
                              Swal.fire({
  title: `Do You Want Delete ${obj.name}`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
                                adminAxios((server) => {
                                  server.delete(`/admin/deleteProduct/${obj._id}`, {
                                    data: {
                                      folderId: obj.uni_id_1 + obj.uni_id_2
                                    }
                                  }).then((res) => {
                                    if (res.data.login) {
                                      logOut()
                                    } else {
                                      setLoaded(false)
                                      toast.success("Product Deleted")
                                      getProducts()
                                    }
                                  }).catch((err) => {
                                    toast.error("Sorry Server Has Some Problem")
                                  })
                                })
                              
  }
})
                            }}>delete</button>
                          </td>
                        </tr>
                      )
                    })
                  }
                </tbody>
              </table>
            </div>

            {
              total !== products.length && <div>
                <button data-for="loadMore" onClick={() => {
                  adminAxios((server) => {
                    server.get('/admin/getOneVendorProducts', {
                      params: {
                        vendorId: vendorId,
                        search: search,
                        skip: products.length
                      }
                    }).then((res) => {
                      if (res.data.login) {
                        logOut()
                      } else {
                        setProducts([...products, ...res.data.products])
                        setTotal(res.data.total)
                      }
                    }).catch(() => {
                      toast.error("Error")
                    })
                  })
                }}>Load More</button>
              </div>
            }

          </div>
        ) : <Loading />
      }
    </>
  )
}

export default VendorProduct