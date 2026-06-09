import React from 'react'
import { useContext } from 'react'
import { useRef } from 'react'
import { useEffect } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import { ServerId } from '../../../Config/Server'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs } from 'swiper'
import { useState } from 'react'
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { useRouter } from 'next/router'
import { userAxios } from '../../../Config/Server'
import { toast } from 'react-hot-toast'

function QuickView() {
    const { setQuickVw, QuickVw, setLoginModal, LogOut, userLogged } = useContext(ContentControl)

    const [images, setImages] = useState([])

    useEffect(() => {
       if(Array.isArray(QuickVw.product?.files)){
        setImages(QuickVw.product.files)
       }
    }, [QuickVw.product?.files])

    const [thumbsSwiper, setThumbsSwiper] = useState(null)

    var modalRef = useRef()
    const navigate = useRouter()

    useEffect(() => {
        if (QuickVw.btn === true) {
            setQuickVw({ ...QuickVw, btn: false })
        } else {
            const closePopUpBody = (event) => {
                if (modalRef.current && !modalRef.current.contains(event.target)) {
                    setQuickVw(prev => ({ ...prev, active: false }))
                }
            }
            if (typeof window !== 'undefined') {
                window.addEventListener('click', closePopUpBody);
                return () => window.removeEventListener('click', closePopUpBody)
            }
        }
    }, [QuickVw.btn])

    const [windowSize, setWindowSize] = useState({ windowWidth: typeof window !== 'undefined' ? window.innerWidth : 1200 });

    useEffect(() => {
        function handleWindowResize() {
            setWindowSize({ windowWidth: parseInt(window.innerWidth) });
        }
        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handleWindowResize);
            return () => {
                window.removeEventListener('resize', handleWindowResize);
            };
        }
    }, []);

    if (!QuickVw.active || !QuickVw.product) return null;
    const canRfq = QuickVw.product?.allowRfq === true;

    return (
        <div className='QuickView'>
            <div className='Item' ref={modalRef}>
                <div className='ItemHeader'>
                    <h6>Quick View</h6>
                    <button className='ExitBtn' onClick={() => {
                        setQuickVw({ ...QuickVw, active: false })
                    }}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>

                <div className="Main">
                    <div className="Product">
                        <div className="leftDiv">
                            <div className="gallery-wrapper" style={{ width: '100%' }}>

                                    <Swiper
                                        modules={[Thumbs]}
                                        grabCursor={true}
                                        loop={false}
                                        observer={true}
                                        observeParents={true}
                                        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }} >
                                        {
                                            images.map((item, key) => {
                                                return (
                                                    <SwiperSlide key={key}>
                                                        <div className="QuickMainImgDiv">
                                                            <img 
                                                                className='QuickMainImgs' 
                                                                src={`${ServerId}/product/${QuickVw.product.uni_id_1}${QuickVw.product.uni_id_2}/${item.filename}`} 
                                                                alt={QuickVw.product.name} 
                                                                loading='lazy' 
                                                            />
                                                        </div>
                                                    </SwiperSlide>
                                                )
                                            })
                                        }
                                    </Swiper>

                                    <Swiper
                                        modules={[Thumbs]}
                                        watchSlidesProgress
                                        slidesPerView={4}
                                        onSwiper={setThumbsSwiper}
                                        loop={false}
                                        observer={true}
                                        observeParents={true}
                                        className="QuickContainer"
                                    >
                                        {
                                            images.map((item, key) => {
                                                return (
                                                    <SwiperSlide key={key} className="QuickImgThumbDiv">
                                                        <img className='QuickImgThumb' src={ServerId + '/product/' + QuickVw.product.uni_id_1 + QuickVw.product.uni_id_2 + '/' + item.filename} alt={QuickVw.product.name} />
                                                    </SwiperSlide>
                                                )
                                            })
                                        }
                                    </Swiper>

                                </div>
                        </div>
                        <div className="rightDiv">
                            <h2 className='qName'>{QuickVw.product.name}</h2>
                            {!canRfq ? (
                                <div className='qPriceRow'>
                                    <span className='qPrice mrp'><del>₹{QuickVw.product.mrp}</del></span>
                                    <span className='qPrice sale'>₹{QuickVw.product.price}</span>
                                </div>
                            ) : (
                                <div>
                                    <span className='qPrice sale' style={{ fontSize: '1.2rem', display: 'block', marginBottom: '10px' }}>Customizable</span>
                                    {QuickVw.product.rfqTiers && QuickVw.product.rfqTiers.length > 0 ? (
                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                            {QuickVw.product.rfqTiers.map((tier, index) => (
                                                <div key={index} className="p-2 border rounded bg-light" style={{ minWidth: "120px" }}>
                                                    <div className="text-muted small" style={{ fontSize: '0.8rem' }}>
                                                        {tier.maxQty ? `${tier.minQty} - ${tier.maxQty} pieces` : `>= ${tier.minQty} pieces`}
                                                    </div>
                                                    <h6 className="text-primary mb-0 mt-1" style={{ fontSize: '1rem', fontWeight: 'bold' }}>₹{tier.price}</h6>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className='qPriceRow'>
                                            <span className='qPrice sale' style={{ fontSize: '1.1rem' }}>RFQ Price</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {(QuickVw.product.rfqAttributes?.length > 0 || QuickVw.product.rfqLeadTime || QuickVw.product.rfqCustomization) && (
                                <div className="mt-3 mb-3 p-3 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                                    {QuickVw.product.rfqAttributes?.length > 0 && (
                                        <div className="mb-2">
                                            <strong className="d-block mb-1">Key Attributes:</strong>
                                            {QuickVw.product.rfqAttributes.slice(0, 4).map((attr, index) => (
                                                <span key={index} className="me-2 text-muted">
                                                    {attr.key}: <span className="text-dark">{attr.value}</span>
                                                </span>
                                            ))}
                                            {QuickVw.product.rfqAttributes.length > 4 && <span className="text-secondary">...</span>}
                                        </div>
                                    )}
                                    
                                    {(QuickVw.product.rfqCustomization || QuickVw.product.rfqLeadTime) && (
                                        <div className="d-flex flex-wrap gap-3">
                                            {QuickVw.product.rfqCustomization && (
                                                <div>
                                                    <strong className="d-block">Customization:</strong>
                                                    <span className="text-muted">{QuickVw.product.rfqCustomizationDesc || 'Available'}</span>
                                                </div>
                                            )}
                                            {QuickVw.product.rfqLeadTime && (
                                                <div>
                                                    <strong className="d-block">Lead Time:</strong>
                                                    <span className="text-muted">{QuickVw.product.rfqLeadTime}</span>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                            
                            <div className='qDesc' dangerouslySetInnerHTML={{ __html: QuickVw.product.srtDescription }}></div>

                            <div className='qMeta'>
                                <div className='metaRow'>
                                    <span className='metaLbl'>AVAILABILITY:</span>
                                    {QuickVw.product.available === "true" ? (
                                        <span className='metaVal inStock'>AVAILABLE</span>
                                    ) : (
                                        <span className='metaVal outOfStock'>OUT OF STOCK</span>
                                    )}
                                </div>
                                <div className='metaRow'>
                                    <span className='metaLbl'>CATEGORY:</span>
                                    <span className='metaVal'>{QuickVw.product.category}</span>
                                </div>
                            </div>

                            <div className='qActions' style={{ display: 'flex', gap: '10px' }}>
                                {QuickVw.product.available === "true" && QuickVw.product.allowRfq !== true ? (
                                    <button onClick={() => {
                                        userAxios((server) => {
                                            server.post('/users/addToWishlist', {
                                                userId: userLogged?._id || '',
                                                item: { proId: QuickVw.product._id, price: QuickVw.product.price, mrp: QuickVw.product.mrp, variantSize: QuickVw.product.currVariantSize || '' }
                                            }).then((res) => {
                                                if (res.data.login) {
                                                    LogOut();
                                                    setLoginModal({ btn: true, active: true, member: true });
                                                } else {
                                                    toast.success("Added to wishlist");
                                                }
                                            }).catch(() => toast.error("Error"));
                                        });
                                    }} className='ShowMoreBtn' style={{ background: '#FF5722', borderColor: '#FF5722' }}>
                                        Add to Wishlist
                                    </button>
                                ) : QuickVw.product.allowRfq === true ? (
                                    <button onClick={() => {
                                        navigate.push(`/p/${QuickVw.product.slug}/${QuickVw.product._id}`)
                                        setQuickVw({ ...QuickVw, active: false })
                                    }} className='ShowMoreBtn' style={{ background: '#FF5722', borderColor: '#FF5722' }}>
                                        Send Enquiry
                                    </button>
                                ) : (
                                    <button className='ShowMoreBtn' style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled>
                                        Out of Stock
                                    </button>
                                )}

                                <button onClick={() => {
                                    navigate.push(`/p/${QuickVw.product.slug}/${QuickVw.product._id}`)
                                    setQuickVw({ ...QuickVw, active: false })
                                }} className='ShowMoreBtn'>
                                    View Full Details
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

export default QuickView