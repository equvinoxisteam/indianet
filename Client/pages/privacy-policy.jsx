import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import React, { Fragment } from 'react'

function PrivacyPolicy() {
    return (
        <Fragment>
            <Head>
                <title>Indianet - Privacy Policy</title>
                <meta name="description" content="Privacy Policy for Indianet platform." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main style={{ background: '#f4f7fa', minHeight: '100vh' }}>
                <Header />
                
                <section style={{ background: 'linear-gradient(135deg, #1A3C5E 0%, #102A43 100%)', padding: '50px 0' }}>
                    <div className="container">
                        <h1 className="text-white font-bold mb-0">Privacy Policy</h1>
                        <p className="text-white opacity-75 mt-2">Your data security is our top priority.</p>
                    </div>
                </section>

                <div className="container py-5">
                    <div className="row">
                        <div className="col-12 col-lg-10 mx-auto">
                            <div className="bg-white p-4 p-md-5 rounded shadow-sm border" style={{ borderRadius: '16px' }}>
                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>1. Data Collection</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Indianet collects information that you provide when creating an account, such as your name, business details, email, and billing address. 
                                        We also gather data on how you interact with our platform to improve your experience.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>2. How We Use Your Information</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Your information is used to process orders, facilitate communication between buyers and sellers, 
                                        and personalize your e-commerce experience. We prioritize data privacy and use advanced encryption 
                                        to protect your sensitive business data.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>3. Third-Party Sharing</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        We do not sell your personal data to non-affiliated third parties. Information may be shared with logistic partners, 
                                        payment processors, or as required by law to fulfill transactions securely.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>4. Security Measures</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        Indianet employs industry-standard SSL encryption and multi-factor authentication protocols. Our databases 
                                        are monitored 24/7 to prevent unauthorized access and data breaches.
                                    </p>
                                </div>

                                <div className="policy-section mb-5">
                                    <h4 className="font-bold mb-3" style={{ color: '#1A3C5E' }}>5. Your Privacy Rights</h4>
                                    <p className="text-muted text-small" style={{ lineHeight: '1.7' }}>
                                        You have the right to request access to your data, correction of inaccuracies, or deletion of your account. 
                                        Please contact our data protection officer for assistance.
                                    </p>
                                </div>

                                <div className="p-4 rounded text-center" style={{ background: 'rgba(26, 60, 94, 0.04)', border: '1px dashed #1A3C5E' }}>
                                    <p className="text-muted text-small mb-0">
                                        For questions regarding your privacy, contact <a href="mailto:team@equvinoxis.com" style={{ color: '#1A3C5E', fontWeight: 'bold' }}>team@equvinoxis.com</a>
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

export default PrivacyPolicy