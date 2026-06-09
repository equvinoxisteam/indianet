import { useRouter } from 'next/router'
import { useContext } from 'react'
import { vendorAxios, ServerId } from '../../../Config/Server'
import ContentControl from '../../../ContentControl/ContentControl'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function ProductsComp({
  responseServer, setResponse,
  setSearch, search,
  pages, setPages,
  products, setProducts,
  setUpdate }) {

  const navigate = useRouter()

  const { setVendorLogged } = useContext(ContentControl)

  function searchProduct(e) {
    e.preventDefault()
    navigate.push(`/vendor/products?search=${encodeURIComponent(search || '')}`)
  }

  const loadPage = (pageNum) => {
    const sp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    vendorAxios((server) => {
      server.get('/vendor/getProducts', {
        params: {
          page: pageNum,
          search: sp.get('search') || undefined
        }
      }).then((response) => {
        if (response.data.login) {
          setVendorLogged({ status: false })
          localStorage.removeItem('vendorToken')
          navigate.push('/vendor/login')
        } else {
          setProducts(response.data.data)
          setResponse(response.data)
          setPages(response.data.pages)
        }
      }).catch(() => {
        toast.error('Could not load products')
      })
    })
  }

  return (
    <div className='ProductsComp containerVendor'>
      <div className="vendorPageHeader">
        <h1 className="vendorPageTitle">My products</h1>
        <p className="vendorPageSubtitle">Manage catalogue, pricing, and visibility</p>
      </div>

      <div className="vendorToolbar">
        <form className="vendorSearchWrap noIcon" onSubmit={searchProduct}>
          <input
            className="vendorSearchInput"
            value={search}
            type="search"
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name…"
            aria-label="Search products"
          />
        </form>
        <button type="button" className="vendorBtnSecondary" onClick={() => {
          vendorAxios((server) => {
            server.get('/vendor/exportProductsExcel', { responseType: 'blob' }).then((res) => {
              const url = window.URL.createObjectURL(new Blob([res.data]))
              const a = document.createElement('a')
              a.href = url
              a.download = 'vendor-products.xlsx'
              document.body.appendChild(a)
              a.click()
              a.remove()
              window.URL.revokeObjectURL(url)
            }).catch(() => toast.error('Export failed'))
          })
        }}>
          Download Excel
        </button>
        <button type="button" className="vendorBtnPrimary" onClick={() => navigate.push('/vendor/products/add')}>
          Add product
        </button>
      </div>

      <div className="vendorTableCard">
        <div className="table-responsive">
          <table className="vendorTable table mb-0">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>MRP</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-5">
                    No products yet. Add your first product to get started.
                  </td>
                </tr>
              ) : (
                products.map((obj, key) => (
                  <tr key={key}>
                    <td className="vendorThumbCell">
                      {obj.files?.[0] ? (
                        <img
                          src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                          alt=""
                        />
                      ) : (
                        <span className="text-muted small">—</span>
                      )}
                    </td>
                    <td className="oneLineTxtMax-300 fw-medium text-dark">{obj.name}</td>
                    <td>{obj.category}</td>
                    <td>₹{obj.price}</td>
                    <td className="text-muted text-decoration-line-through">₹{obj.mrp}</td>
                    <td><span className="badge bg-danger-subtle text-danger">{obj.discount}%</span></td>
                    <td>
                      <span className="badge bg-light text-dark text-capitalize">{obj.publishStatus || 'published'}</span>
                    </td>
                    <td>
                      <div className="vendorTableActions">
                        <button type="button" className="vendorBtnSecondary" onClick={() => window.open(`/p/${obj.slug}/${obj._id}`, '_blank')}>
                          View
                        </button>
                        <button type="button" className="vendorBtnSecondary" onClick={() => navigate.push(`/vendor/products/edit/${obj._id}`)}>
                          Edit
                        </button>
                        <button type="button" className="vendorBtnSecondary" onClick={() => navigate.push(`/vendor/products/add?copyFrom=${obj._id}`)}>
                          Copy
                        </button>
                        <button type="button" className="vendorBtnDanger" onClick={() => {
                          Swal.fire({
                            title: `Delete ${obj.name}?`,
                            icon: 'warning',
                            showCancelButton: true,
                            confirmButtonColor: '#3085d6',
                            cancelButtonColor: '#d33',
                            confirmButtonText: 'Yes, delete'
                          }).then((result) => {
                            if (result.isConfirmed) {
                              vendorAxios((server) => {
                                server.delete('/vendor/deleteProduct', {
                                  data: {
                                    proId: obj._id,
                                    folderId: `${obj.uni_id_1}${obj.uni_id_2}/`
                                  }
                                }).then((res) => {
                                  if (res.data.login) {
                                    setVendorLogged({ status: false })
                                    localStorage.removeItem('vendorToken')
                                    navigate.push('/vendor/login')
                                  } else {
                                    setUpdate(u => !u)
                                    toast.success('Product deleted')
                                  }
                                }).catch(() => toast.error('Delete failed'))
                              })
                            }
                          })
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {responseServer.pagination && pages?.length > 0 && (
        <div className="vendorTableCard">
          <div className="vendorPagination">
            {pages.map((obj, key) => (
              <button
                key={key}
                type="button"
                className={responseServer.currentPage === obj ? 'active' : ''}
                onClick={() => loadPage(obj)}
              >
                {obj}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductsComp
