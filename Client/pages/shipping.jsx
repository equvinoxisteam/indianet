import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'

function Shipping() {
    return (
        <Fragment>
            <Head>
                <title>Indianet - Shipping & Delivery</title>
                <meta name="description" content="Shipping & Delivery information for Indianet customers." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ background: '#f4f7fa', minHeight: '100vh' }}>
                <Header />
                
                <section style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #102A43 100%)', padding: '50px 0' }}>
                    <div className="container">
                        <h1 className="text-white font-bold mb-0">Shipping & Delivery</h1>
                        <p className="text-white opacity-75 mt-2">Connecting Indian products to the global market.</p>
                    </div>
                </section>

                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ borderRadius: '16px' }}>
                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>1. Delivery Coverage</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Indianet offers worldwide shipping to over 150 countries. We work with leading international 
                                        logistics partners (DHL, FedEx, UPS) to ensure your bulk orders are delivered safely and efficiently 
                                        to your doorstep or closest port of entry.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>2. Estimated Shipping Times</h4>
                                    <p className="text-muted text-small d-block mb-3" style={{ lineHeight: '1.7' }}>
                                        Shipping times vary based on shipping method and destination:
                                    </p>
                                    <ul className="text-muted text-small" style={{ lineHeight: '2' }}>
                                        <li><strong>Domestic (India):</strong> 3-5 business days.</li>
                                        <li><strong>International Air:</strong> 7-10 business days.</li>
                                        <li><strong>Sea Freight:</strong> 15-45 business days depending on port destination.</li>
                                    </ul>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>3. Shipping Costs</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Costs are calculated at checkout based on weight, dimensions, and the final destination. 
                                        For bulk e-commerce orders, we offer consolidated shipping to minimize expenses. 
                                        Custom duties and taxes are typically the responsibility of the importer.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>4. Order Tracking</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Once your order is dispatched, a unique tracking identifier will be shared via email and 
                                        available in your "My Orders" dashboard. Real-time updates bridge the gap between manufacturer 
                                        and international buyer.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>5. Inspection & Claims</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        We recommend inspecting all shipments upon arrival. Any damages or missing items must 
                                        be reported within 48 hours for insurance claims to be processed efficiently.
                                    </p>
                                </div>

                                <div className="p-4 rounded text-center" style={{ background: 'rgba(26, 60, 94, 0.04)', border: '1px dashed #1A3C5E' }}>
                                    <p className="text-muted text-small mb-0">
                                        Need shipping assistance? Reach our logistics desk at <a href="mailto:team@equvinoxis.com" style={{ color: '#1A3C5E', fontWeight: 'bold' }}>team@equvinoxis.com</a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </main>

            <style jsx>{`
                .policy-section h4 { border-bottom: 2px solid #f0f4f8; padding-bottom: 0.5rem; }
            `}</style>
        </Fragment>
    )
}

export default Shipping