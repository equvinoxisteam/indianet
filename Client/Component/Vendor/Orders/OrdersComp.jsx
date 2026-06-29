import { vendorAxios } from "@/Config/Server"
import ContentControl from "@/ContentControl/ContentControl"
import { useRouter } from "next/router"
import { useContext } from "react"

function OrdersComp({ search, setSearch, Orders, setOrders, setTotal, total }) {
  const navigate = useRouter()
  const { setVendorLogged } = useContext(ContentControl)

  const submitSearch = (e) => {
    e.preventDefault()
    vendorAxios((server) => {
      server.get('/vendor/getAllOrders', {
        params: { search: search, skip: 0 }
      }).then((res) => {
        if (res.data.login) {
          setVendorLogged({ status: false })
          localStorage.removeItem('vendorToken')
          navigate.push('/vendor/login')
        } else {
          setOrders(res.data.orders)
          setTotal(res.data.total)
        }
      }).catch(() => {})
    })
  }

  return (
    <div className='OrdersComp containerVendor'>
      <div className="vendorPageHeader">
        <h1 className="vendorPageTitle">Orders</h1>
        <p className="vendorPageSubtitle">Process orders, update shipping status — buyers get email & WhatsApp alerts</p>
      </div>

      <form className="vendorToolbar" onSubmit={submitSearch}>
        <div className="vendorSearchWrap" style={{ maxWidth: '100%' }}>
          <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
          <input
            className="vendorSearchInput"
            data-for="search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer name…"
            aria-label="Search orders"
          />
        </div>
        <button type="submit" className="vendorBtnSecondary">
          <i className="fa-solid fa-magnifying-glass me-1" /> Search
        </button>
      </form>

      <div className="vendorTableCard">
        <div className="table-responsive">
          <table className="vendorTable table mb-0">
            <thead>
              <tr>
                <th>Date</th>
                <th>Customer</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {Orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-5">No orders match your search.</td>
                </tr>
              ) : (
                Orders.map((obj, key) => (
                  <tr key={key}>
                    <td>{obj.date}</td>
                    <td className="fw-medium">{obj.customer}</td>
                    <td>₹{obj.price}</td>
                    <td>{obj.payType}</td>
                    <td><span className="badge bg-light text-dark border">{obj.OrderStatus}</span></td>
                    <td>
                      <button
                        type="button"
                        className="vendorBtnSecondary"
                        onClick={() => navigate.push(`/vendor/orders/${obj.secretOrderId}/${obj.userId}`)}
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {Orders.length !== total && (
        <div className="text-center mt-3">
          <button
            type="button"
            className="vendorBtnPrimary"
            data-for="loadMore"
            onClick={() => {
              vendorAxios((server) => {
                server.get('/vendor/getAllOrders', {
                  params: { search: search, skip: Orders.length }
                }).then((res) => {
                  if (res.data.login) {
                    setVendorLogged({ status: false })
                    localStorage.removeItem('vendorToken')
                    navigate.push('/vendor/login')
                  } else {
                    setOrders([...Orders, ...res.data.orders])
                    setTotal(res.data.total)
                  }
                }).catch(() => {})
              })
            }}
          >
            Load more
          </button>
        </div>
      )}
    </div>
  )
}

export default OrdersComp
