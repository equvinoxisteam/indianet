import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import style from './Footer.module.scss'
import BrandLogo from '@/Component/Common/BrandLogo';

function Footer() {
    const [year, setYear] = useState('')

    useEffect(() => {
        setYear(new Date().getFullYear())
    }, [])

    return (
        <>
            <footer className={style.FooterWrapper}>
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-lg-4 mb-4">
                            <div className={style.FooterBrand}>
                                <BrandLogo variant="light" href="/" />
                                <p className={style.brandDesc}>
                                    Indianet is the B2B marketplace where your brand meets serious buyers.
                                    Source industrial machinery, list with confidence, and scale with verified partners worldwide.
                                </p>
                                <ul className={style.brandHighlights}>
                                    <li><i className="fa-solid fa-check"></i> Verified sellers &amp; secure sourcing</li>
                                    <li><i className="fa-solid fa-check"></i> Built for manufacturers &amp; distributors</li>
                                    <li><i className="fa-solid fa-check"></i> Global reach, professional support</li>
                                </ul>
                            </div>
                        </div>

                        <div className="col-6 col-md-4 col-lg-2 mb-4">
                            <h6 className={style.FooterHeading}>Your Account</h6>
                            <ul className={style.FooterItems}>
                                <li><Link href="/account">My Account</Link></li>
                                <li><Link href="/wishlist">Wishlist</Link></li>
                            </ul>
                        </div>

                        <div className="col-6 col-md-4 col-lg-3 mb-4">
                            <h6 className={style.FooterHeading}>Sell on Indianet</h6>
                            <ul className={style.FooterItems}>
                                <li><Link href="/vendor/register">Register as Vendor</Link></li>
                                <li><Link href="/vendor/login">Vendor Login</Link></li>
                            </ul>
                        </div>

                        <div className="col-6 col-md-4 col-lg-3 mb-4">
                            <h6 className={style.FooterHeading}>Company</h6>
                            <ul className={style.FooterItems}>
                                <li><Link href="/help">Help &amp; FAQs</Link></li>
                                <li><Link href="/company">About Indianet</Link></li>
                                <li><Link href="/categories">Browse Categories</Link></li>
                                <li><Link href="/privacy-policy">Privacy Policy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className={style.FooterSocialRow}>
                        <div>
                            <h6 className={style.FooterHeading}>Connect With Us</h6>
                            <p className={style.socialNote}>Follow Indianet for product updates, industry news, and seller success stories.</p>
                        </div>
                        <ul className={style.FooterSMicons}>
                            <li>
                                <a
                                    href="https://www.instagram.com/equvinoxis?utm_source=qr"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Instagram"
                                >
                                    <i className="fa-brands fa-instagram" />
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://www.linkedin.com/company/equvinoxis/?viewAsMember=true"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="LinkedIn"
                                >
                                    <i className="fa-brands fa-linkedin-in" />
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className={style.FooterDivider} />
                <div className="container">
                    <div className={style.CopyRightArea}>
                        <p className={style.copyMain}>&#169; {year} Indianet. All rights reserved.</p>
                        <p className={style.copySub}>
                            By using this site you agree to our policies. For questions about your account or listings, visit{' '}
                            <Link href="/help">Help &amp; FAQs</Link>.
                        </p>
                        <div className={style.footerLinks}>
                            <Link href="/terms">Terms &amp; Conditions</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer
