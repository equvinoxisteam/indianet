import Server, { ServerId } from '@/Config/Server'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import Link from 'next/link'
import { Fragment, useCallback, useEffect, useState } from 'react'

const Footer = dynamic(() => import('@/Component/User/Footer/Footer'))
const Header = dynamic(() => import('@/Component/User/Header/Header'))

const inr = (n) => {
  if (n === undefined || n === null || n === '') return '—'
  const num = Number(n)
  if (Number.isNaN(num)) return String(n)
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(num)
}

function tierPriceRange(tiers) {
  if (!tiers || !tiers.length) return null
  const prices = tiers.map((t) => Number(t.price)).filter((p) => !Number.isNaN(p))
  if (!prices.length) return null
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  if (min === max) return inr(min)
  return `${inr(min)} – ${inr(max)}`
}

function minOrderText(tiers) {
  if (!tiers || !tiers.length) return 'Contact for MOQ'
  const m = tiers.map((t) => Number(t.minQty)).filter((x) => !Number.isNaN(x) && x > 0)
  if (!m.length) return 'Contact for MOQ'
  return `Min. order ${Math.min(...m)}`
}

export default function PublicVendorPage({ vendorId, initialVendor }) {
  const [vendor, setVendor] = useState(initialVendor || {})
  const [tab, setTab] = useState('home')
  const [search, setSearch] = useState('')
  const [products, setProducts] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loadingProducts, setLoadingProducts] = useState(false)

  const loadProducts = useCallback(
    async (p = 1, q = '') => {
      if (!vendorId || vendorId.length !== 24) return
      setLoadingProducts(true)
      try {
        const res = await Server.get(`/vendor/public/${vendorId}/products`, {
          params: { page: p, search: q || undefined, limit: 12 },
        })
        if (res.data?.data) {
          setProducts(res.data.data)
          setPage(res.data.page || 1)
          setTotalPages(res.data.totalPages || 1)
        }
      } catch {
        setProducts([])
      } finally {
        setLoadingProducts(false)
      }
    },
    [vendorId]
  )

  useEffect(() => {
    if (!vendorId || vendorId.length !== 24) return
    Server.get(`/vendor/public/${vendorId}`)
      .then((res) => setVendor(res.data))
      .catch(() => {})
  }, [vendorId])

  useEffect(() => {
    if (tab === 'products') {
      loadProducts(1, search)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload products tab on enter; search uses explicit submit
  }, [tab, vendorId, loadProducts])

  useEffect(() => {
    if (tab === 'company' && vendor.showCompanyProfile !== true) setTab('home')
  }, [tab, vendor.showCompanyProfile])

  const runSearch = (e) => {
    e.preventDefault()
    loadProducts(1, search)
  }

  if (!vendor?.status && !initialVendor?.status) {
    return (
      <Fragment>
        <Head>
          <title>Vendor Not Found - Indianet</title>
        </Head>
        <main>
          <Header />
          <div className="vendorStorePage">
            <div className="container py-5 text-center">
              <h3>Vendor not found</h3>
              <p className="text-muted">This store does not exist or is no longer available.</p>
              <Link href="/" className="btn btn-primary rounded-pill mt-2">
                Back to home
              </Link>
            </div>
          </div>
          <Footer />
        </main>
      </Fragment>
    )
  }

  const displayName = vendor.companyInfo || vendor.name
  const logoUrl = vendor.logo ? `${ServerId}${vendor.logo}` : null
  const bannerUrl = vendor.backgroundImage ? `${ServerId}${vendor.backgroundImage}` : null
  const vendorPhone = vendor.number || vendor.phone || ''
  const vendorAddress = [vendor.locality, vendor.address, vendor.city, vendor.state, vendor.pinCode, vendor.country]
    .filter(Boolean)
    .join(', ')
  const showCompanyProfile = vendor.showCompanyProfile === true
  const verifiedVendorBadge = vendor.verifiedVendorBadge === true
  const highlights = showCompanyProfile && Array.isArray(vendor.companyHighlights) ? vendor.companyHighlights : []
  const verifications = verifiedVendorBadge && Array.isArray(vendor.verificationTags) ? vendor.verificationTags : []
  const markets = showCompanyProfile && Array.isArray(vendor.mainMarkets) ? vendor.mainMarkets : []
  const certs = showCompanyProfile ? (Array.isArray(vendor.certificateImages) ? vendor.certificateImages : []).slice(0, 5) : []
  const navTabs = ['home', 'products', ...(showCompanyProfile ? ['company', 'contacts'] : [])]

  return (
    <Fragment>
      <Head>
        <title>{`${displayName} — Store | Indianet`}</title>
        <meta name="description" content={vendor.description || vendor.companyIntroduction || ''} />
      </Head>
      <main>
        <Header />
        <div className="vendorStorePage">
          <div
            className="vendorStoreHero"
            style={{
              backgroundImage: bannerUrl ? `linear-gradient(105deg, rgba(15,37,61,0.88) 0%, rgba(15,37,61,0.55) 45%, rgba(15,37,61,0.35) 100%), url(${bannerUrl})` : undefined,
            }}
          >
            <div className="container py-4 py-md-5">
              <div className="row align-items-end g-4">
                <div className="col-lg-8">
                  <div className="d-flex align-items-start gap-3">
                    <div className="vendorStoreLogo flex-shrink-0">
                      {logoUrl ? (
                        <img src={logoUrl} alt="" />
                      ) : (
                        <i className="fa-solid fa-store" />
                      )}
                    </div>
                    <div className="text-white">
                      <p className="small text-white-50 mb-1">{vendor.businessType || 'Supplier'}</p>
                      <h1 className="h3 fw-bold mb-2 d-flex flex-wrap align-items-center gap-2">
                        {displayName}
                        {verifiedVendorBadge && (
                          <span className="verifiedVendorBadge verifiedVendorBadge--light">
                            <i className="fa-solid fa-circle-check" aria-hidden="true" />
                            Verified vendor
                          </span>
                        )}
                      </h1>
                      <div className="d-flex flex-wrap gap-2 small">
                        {vendor.countryRegion && (
                          <span className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25">
                            <i className="fa-solid fa-location-dot me-1" />
                            {vendor.countryRegion}
                          </span>
                        )}
                        {vendor.yearsInIndustry && (
                          <span className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25">
                            Years in industry: {vendor.yearsInIndustry}
                          </span>
                        )}
                        {vendor.cooperatedSuppliers && (
                          <span className="badge rounded-pill bg-white bg-opacity-10 border border-white border-opacity-25">
                            Cooperated suppliers: {vendor.cooperatedSuppliers}
                          </span>
                        )}
                      </div>
                      {vendor.mainCategories && (
                        <p className="small mt-3 mb-0 text-white-75">
                          <strong className="text-white">Main categories:</strong> {vendor.mainCategories}
                        </p>
                      )}
                      <div className="d-flex flex-wrap gap-2 mt-3">
                        {vendor.designCustomization && (
                          <span className="badge bg-warning text-dark">Design-based customization</span>
                        )}
                        {vendor.fullCustomization && <span className="badge bg-info text-dark">Full customization</span>}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4 text-lg-end">
                  {showCompanyProfile && vendor.email && (
                    <a className="btn btn-light btn-sm rounded-pill px-3 me-2 mb-2" href={`mailto:${vendor.email}`}>
                      <i className="fa-solid fa-envelope me-1" /> Contact supplier
                    </a>
                  )}
                  {showCompanyProfile && vendorPhone && (
                    <a className="btn btn-outline-light btn-sm rounded-pill px-3 mb-2" href={`tel:${vendorPhone}`}>
                      <i className="fa-solid fa-phone me-1" /> Call
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="vendorStoreNav border-bottom bg-white sticky-top shadow-sm" style={{ top: 0, zIndex: 50 }}>
            <div className="container">
              <div className="d-flex flex-wrap align-items-center gap-1 py-2">
                {navTabs.map((key) => (
                  <button
                    key={key}
                    type="button"
                    className={`btn btn-sm rounded-pill px-3 ${tab === key ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setTab(key)}
                  >
                    {key === 'home' && 'Home'}
                    {key === 'products' && 'Products'}
                    {key === 'company' && 'Company profile'}
                    {key === 'contacts' && 'Contacts'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="container py-4">
            {tab === 'home' && (
              <div className="row g-4">
                <div className="col-lg-8">
                  {!showCompanyProfile && (
                    <div className="alert alert-light border mb-4">
                      <p className="mb-0 small text-muted">
                        Company profile is not available for this supplier.
                      </p>
                    </div>
                  )}
                  {highlights.length > 0 && (
                    <div className="card border-0 shadow-sm mb-4">
                      <div className="card-body">
                        <h5 className="fw-bold mb-3">Why work with us</h5>
                        <ul className="list-unstyled mb-0">
                          {highlights.map((h, i) => (
                            <li key={i} className="d-flex gap-2 mb-2">
                              <i className="fa-solid fa-circle-check text-success mt-1" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                  {showCompanyProfile && (
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">About</h5>
                      {vendor.companyIntroduction ? (
                        <div className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                          {vendor.companyIntroduction}
                        </div>
                      ) : vendor.description ? (
                        <p className="text-secondary mb-0">{vendor.description}</p>
                      ) : (
                        <p className="text-muted mb-0">This supplier has not added a detailed introduction yet.</p>
                      )}
                    </div>
                  </div>
                  )}
                </div>
                <div className="col-lg-4">
                  {showCompanyProfile && (
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold text-uppercase small text-muted mb-3">Quick facts</h6>
                      <dl className="row small mb-0">
                        {vendor.yearEstablished && (
                          <>
                            <dt className="col-5 text-muted">Established</dt>
                            <dd className="col-7">{vendor.yearEstablished}</dd>
                          </>
                        )}
                        {vendor.employeesRange && (
                          <>
                            <dt className="col-5 text-muted">Team size</dt>
                            <dd className="col-7">{vendor.employeesRange}</dd>
                          </>
                        )}
                        {vendor.factorySizeRange && (
                          <>
                            <dt className="col-5 text-muted">Facility</dt>
                            <dd className="col-7">{vendor.factorySizeRange}</dd>
                          </>
                        )}
                        {vendor.annualOutputRange && (
                          <>
                            <dt className="col-5 text-muted">Output</dt>
                            <dd className="col-7">{vendor.annualOutputRange}</dd>
                          </>
                        )}
                        {vendor.annualRevenueNote && (
                          <>
                            <dt className="col-5 text-muted">Revenue</dt>
                            <dd className="col-7">{vendor.annualRevenueNote}</dd>
                          </>
                        )}
                        {vendor.exhibitionsNote && (
                          <>
                            <dt className="col-5 text-muted">Exhibitions</dt>
                            <dd className="col-7">{vendor.exhibitionsNote}</dd>
                          </>
                        )}
                      </dl>
                    </div>
                  </div>
                  )}
                  <button type="button" className="btn btn-primary w-100 rounded-pill" onClick={() => setTab('products')}>
                    View products
                  </button>
                </div>
              </div>
            )}

            {tab === 'products' && (
              <div>
                <form onSubmit={runSearch} className="row g-2 mb-4">
                  <div className="col-md-8">
                    <input
                      type="search"
                      className="form-control rounded-pill"
                      placeholder="Search in this store"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <div className="col-md-4">
                    <button type="submit" className="btn btn-dark rounded-pill w-100">
                      Search
                    </button>
                  </div>
                </form>
                {loadingProducts ? (
                  <p className="text-muted">Loading products…</p>
                ) : products.length === 0 ? (
                  <p className="text-muted">No products match your search.</p>
                ) : (
                  <div className="row g-4">
                    {products.map((p) => {
                      const img = p.files?.[0]
                      const imgSrc = img
                        ? `${ServerId}/product/${p.uni_id_1}${p.uni_id_2}/${img.filename}`
                        : null
                      const priceLabel = p.allowRfq ? tierPriceRange(p.rfqTiers) : inr(p.price)
                      return (
                        <div key={p._id} className="col-12 col-sm-6 col-md-4 col-lg-3">
                          <Link href={`/p/${p.slug}/${p._id}`} className="text-decoration-none text-dark">
                            <div className="card h-100 border-0 shadow-sm vendorStoreProductCard">
                              <div className="ratio ratio-1x1 bg-light">
                                {imgSrc ? (
                                  <img src={imgSrc} alt="" className="vendorStoreProductImg" />
                                ) : (
                                  <div className="d-flex align-items-center justify-content-center h-100 text-muted">
                                    <i className="fa-solid fa-image fa-2x opacity-50" />
                                  </div>
                                )}
                              </div>
                              <div className="card-body">
                                <h6 className="small fw-bold text-truncate-2" style={{ minHeight: '2.5rem' }}>
                                  {p.name}
                                  {(p.verifiedVendorBadge || verifiedVendorBadge) && (
                                    <span className="verifiedVendorBadge verifiedVendorBadge--sm d-inline-flex ms-1">
                                      <i className="fa-solid fa-circle-check" aria-hidden="true" />
                                    </span>
                                  )}
                                </h6>
                                <div className="fw-bold text-primary small">{priceLabel || 'RFQ'}</div>
                                <div className="text-muted small mt-1">
                                  {p.allowRfq ? minOrderText(p.rfqTiers) : p.available === 'true' ? 'In stock' : 'Unavailable'}
                                </div>
                              </div>
                            </div>
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}
                {totalPages > 1 && (
                  <div className="d-flex justify-content-center gap-2 mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      disabled={page <= 1}
                      onClick={() => loadProducts(page - 1, search)}
                    >
                      Previous
                    </button>
                    <span className="align-self-center small text-muted">
                      Page {page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm rounded-pill"
                      disabled={page >= totalPages}
                      onClick={() => loadProducts(page + 1, search)}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}

            {tab === 'company' && (
              <div className="row g-4">
                <div className="col-lg-7">
                  <div className="card border-0 shadow-sm mb-4">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Company introduction</h5>
                      {vendor.companyIntroduction ? (
                        <div className="text-secondary" style={{ whiteSpace: 'pre-wrap' }}>
                          {vendor.companyIntroduction}
                        </div>
                      ) : (
                        <p className="text-muted">{vendor.description || 'No introduction provided.'}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-lg-5">
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Verification</h6>
                      {verifications.length ? (
                        <ul className="list-unstyled small mb-0">
                          {verifications.map((v, i) => (
                            <li key={i} className="mb-2">
                              <i className="fa-solid fa-shield-halved text-success me-2" />
                              {v}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted small mb-0">Verification details not listed.</p>
                      )}
                    </div>
                  </div>
                  <div className="card border-0 shadow-sm mb-3">
                    <div className="card-body">
                      <h6 className="fw-bold mb-3">Main markets</h6>
                      {markets.length ? (
                        <div className="d-flex flex-wrap gap-1">
                          {markets.map((m, i) => (
                            <span key={i} className="badge bg-light text-dark border">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">—</p>
                      )}
                    </div>
                  </div>
                  {certs.length > 0 && (
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h6 className="fw-bold mb-3">Certificates</h6>
                        <div className="row g-2">
                          {certs.map((src, i) => (
                            <div key={i} className="col-6">
                              <a href={`${ServerId}${src}`} target="_blank" rel="noopener noreferrer">
                                <img src={`${ServerId}${src}`} alt="" className="img-fluid rounded border" />
                              </a>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'contacts' && (
              <div className="row g-4">
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Contact</h5>
                      {vendor.email && (
                        <p className="mb-2">
                          <i className="fa-solid fa-envelope text-primary me-2" />
                          <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                        </p>
                      )}
                      {vendorPhone && (
                        <p className="mb-2">
                          <i className="fa-solid fa-phone text-success me-2" />
                          <a href={`tel:${vendorPhone}`}>{vendorPhone}</a>
                        </p>
                      )}
                      {vendorAddress && (
                        <p className="mb-2">
                          <i className="fa-solid fa-location-dot text-danger me-2" />
                          <span>{vendorAddress}</span>
                        </p>
                      )}
                      {vendor.website && (
                        <p className="mb-0">
                          <i className="fa-solid fa-globe text-info me-2" />
                          <a href={vendor.website} target="_blank" rel="noopener noreferrer">
                            {vendor.website.replace(/^https?:\/\//, '')}
                          </a>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="card border-0 shadow-sm h-100">
                    <div className="card-body">
                      <h5 className="fw-bold mb-3">Social</h5>
                      {vendor.socialLinks && Object.keys(vendor.socialLinks).length > 0 ? (
                        <div className="d-flex flex-wrap gap-2">
                          {vendor.socialLinks.facebook && (
                            <a className="btn btn-outline-primary btn-sm rounded-pill" href={vendor.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                              Facebook
                            </a>
                          )}
                          {vendor.socialLinks.instagram && (
                            <a className="btn btn-outline-danger btn-sm rounded-pill" href={vendor.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                              Instagram
                            </a>
                          )}
                          {vendor.socialLinks.linkedin && (
                            <a className="btn btn-outline-primary btn-sm rounded-pill" href={vendor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                              LinkedIn
                            </a>
                          )}
                          {vendor.socialLinks.twitter && (
                            <a className="btn btn-outline-info btn-sm rounded-pill" href={vendor.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                              Twitter
                            </a>
                          )}
                        </div>
                      ) : (
                        <p className="text-muted small mb-0">No social links added.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Footer />
      </main>
    </Fragment>
  )
}
