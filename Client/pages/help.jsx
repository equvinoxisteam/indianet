import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import Link from 'next/link'
import React, { Fragment, useState } from 'react'
import style from './help.module.scss'

const faqs = {
    clients: {
        intro: 'Indianet helps buyers and procurement teams source industrial products, compare verified vendors, and manage enquiries in one place.',
        items: [
            {
                q: 'How do I find products on Indianet?',
                a: 'Browse categories from the homepage or use search to find machinery, tools, and equipment. Open a product page to view details, specifications, and seller information.',
            },
            {
                q: 'What is an RFQ and how does it work?',
                a: 'For RFQ-enabled products, submit a request for quotation with your quantity and requirements. Verified vendors review your enquiry and respond with pricing and terms directly through the platform.',
            },
            {
                q: 'How do I manage my account and wishlist?',
                a: 'Sign in to access My Account and Wishlist. Save products you are considering, update your profile, and track activity from your dashboard.',
            },
            {
                q: 'Is it safe to buy through Indianet?',
                a: 'We work with verified vendors and secure checkout flows. Always review product details and seller profiles before placing an order or sending an RFQ.',
            },
        ],
    },
    vendors: {
        intro: 'Indianet gives sellers a full vendor dashboard to list products, respond to RFQs, and grow visibility — subscription plans are managed inside your vendor account.',
        items: [
            {
                q: 'How do I become a vendor on Indianet?',
                a: 'Click Register as Vendor, complete business verification, and set up your store profile. Once approved, you can add products and start receiving buyer enquiries.',
            },
            {
                q: 'Where do I view and manage my subscription plan?',
                a: 'Seller plans are available only in the vendor dashboard under Plans. Log in at Vendor Login, then open Plans to compare tiers, features, and upgrade options.',
            },
            {
                q: 'What tools does the vendor dashboard include?',
                a: 'Manage your product catalogue, edit RFQ pricing blocks, respond to buyer enquiries, track orders, and update store settings — all from one vendor panel.',
            },
            {
                q: 'How do RFQ quotas and showcases work?',
                a: 'Each plan includes limits on RFQ responses and product showcases. View your current allowances and upgrade path in Vendor Dashboard → Plans.',
            },
        ],
    },
}

function Help() {
    const [activeTab, setActiveTab] = useState('clients')
    const section = faqs[activeTab]

    return (
        <Fragment>
            <Head>
                <title>Help &amp; FAQs — Indianet</title>
                <meta name="description" content="Contact Indianet support and find FAQs for buyers and vendors." />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main className={style.page}>
                <Header />

                <section className={style.hero}>
                    <div className="container">
                        <h2>Help &amp; FAQs</h2>
                        <p>Contact our team or browse answers for buyers and vendors.</p>
                    </div>
                </section>

                <div className={`container ${style.body}`}>
                    <div className={style.layout}>
                        <aside className={style.contactCard}>
                            <h5>Contact Us</h5>
                            <p className={style.intro}>
                                Reach out for account help, vendor onboarding, listing issues, or general questions about Indianet.
                            </p>

                            <div className={style.contactRow}>
                                <div className={style.contactIcon}>
                                    <i className="fa-solid fa-envelope"></i>
                                </div>
                                <div>
                                    <div className={style.contactLabel}>Email</div>
                                    <div className={style.contactValue}>
                                        <a href="mailto:team@equvinoxis.com">team@equvinoxis.com</a>
                                    </div>
                                </div>
                            </div>

                            <div className={style.contactRow}>
                                <div className={style.contactIcon}>
                                    <i className="fa-solid fa-phone"></i>
                                </div>
                                <div>
                                    <div className={style.contactLabel}>Phone</div>
                                    <div className={style.contactValue}>
                                        <a href="tel:+911800000000">+91 1800-000-000</a>
                                    </div>
                                </div>
                            </div>

                            <div className={style.contactRow}>
                                <div className={style.contactIcon}>
                                    <i className="fa-solid fa-clock"></i>
                                </div>
                                <div>
                                    <div className={style.contactLabel}>Support hours</div>
                                    <div className={style.contactValue}>Mon – Sat, 9:00 AM – 6:00 PM IST</div>
                                </div>
                            </div>

                            <div className={style.contactRow}>
                                <div className={style.contactIcon}>
                                    <i className="fa-solid fa-location-dot"></i>
                                </div>
                                <div>
                                    <div className={style.contactLabel}>Service region</div>
                                    <div className={style.contactValue}>India &amp; international B2B trade</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <Link href="/account" className="btn btn-primary w-100">
                                    Go to My Account
                                </Link>
                            </div>
                        </aside>

                        <div>
                            <div className={style.tabs} role="tablist">
                                <button
                                    type="button"
                                    className={`${style.tabBtn} ${activeTab === 'clients' ? style.active : ''}`}
                                    onClick={() => setActiveTab('clients')}
                                >
                                    For Buyers
                                </button>
                                <button
                                    type="button"
                                    className={`${style.tabBtn} ${activeTab === 'vendors' ? style.active : ''}`}
                                    onClick={() => setActiveTab('vendors')}
                                >
                                    For Vendors
                                </button>
                            </div>

                            <div className={style.faqPanel}>
                                <p className={style.faqIntro}>{section.intro}</p>
                                {section.items.map((item, i) => (
                                    <div className={style.faqItem} key={i}>
                                        <h6>
                                            <span>Q.</span>
                                            {item.q}
                                        </h6>
                                        <p>{item.a}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </Fragment>
    )
}

export default Help
