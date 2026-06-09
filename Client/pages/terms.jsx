import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'

function Terms() {
    return (
        <Fragment>
            <Head>
                <title>Indianet - Terms & Conditions</title>
                <meta name="description" content="Terms & Conditions for using Indianet platform." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ background: '#f4f7fa', minHeight: '100vh' }}>
                <Header />
                
                <section style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #102A43 100%)', padding: '50px 0' }}>
                    <div className="container">
                        <h1 className="text-white font-bold mb-0">Terms & Conditions</h1>
                        <p className="text-white opacity-75 mt-2">Effective as of March 2024</p>
                    </div>
                </section>

                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ borderRadius: '16px' }}>
                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>1. Introduction</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Welcome to Indianet. By accessing our platform, you agree to comply with and be bound by the following terms. 
                                        Indianet is a B2B marketplace facilitating global trade between manufacturers, wholesale distributors, and importers.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>2. Account Responsibilities</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Users are responsible for maintaining the confidentiality of their account credentials. 
                                        All transactions conducted through an account are the responsibility of the account holder. 
                                        Indianet reserves the right to terminate accounts that violate our safety policies or engage in fraudulent activity.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>3. Seller & Product Policies</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Verified sellers must ensure that all product listings are accurate, authentic, and comply with international trade regulations. 
                                        Prohibited items, counterfeit goods, or misleading descriptions will result in immediate suspension and potential legal action.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>4. Payments & Disputes</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        All payments processed through Indianet are secured with industry-standard encryption. 
                                        In event of a dispute, our arbitration team will review documentation before releasing funds. 
                                        Chargebacks without prior communication with support are prohibited.
                                    </p>
                                </div>

                                <div className="p-4 rounded text-center" style={{ background: 'rgba(26, 60, 94, 0.04)', border: '1px dashed #1A3C5E' }}>
                                    <p className="text-muted text-small mb-0">
                                        For questions regarding these terms, please contact us at <a href="mailto:team@equvinoxis.com" style={{ color: '#1A3C5E', fontWeight: 'bold' }}>team@equvinoxis.com</a>
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

export default Terms