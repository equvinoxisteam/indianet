import React from 'react'
import style from './HomePost.module.scss'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from "swiper";
import 'swiper/css';
import 'swiper/css/navigation';
import { useRef } from 'react';
import { useContext } from 'react';
import Link from 'next/link';
import Server, { ServerId, userAxios } from '@/Config/Server';
import ContentControl from '@/ContentControl/ContentControl';
import toast from 'react-hot-toast';

function HomePost({ layout }) {
    const sectionfour = layout?.sectionfour || { title: '', subTitle: '', items: [], items2: [] }
    const sectionone = layout?.sectionone || { title: '', subTitle: '', items: [] }
    const sectiontwo = layout?.sectiontwo || { title: '', subTitle: '', items: [], items2: [] }
    const sectionthree = layout?.sectionthree || { title: '', subTitle: '', items: [], items2: [] }
    const sliderTwo = layout?.sliderTwo || { items: [], for: 'product' }
    const banner = layout?.banner || { file: { filename: '' }, link: '' }

    const sliderTwoRef = useRef(null)

    const {
        setQuickVw, QuickVw,
        setUserLogged, setLoginModal, setCartTotal
    } = useContext(ContentControl)

    function LogOut() {
        setUserLogged({
            status: false
        })
        localStorage.removeItem('token')
    }

    return (
        <div className={style.HomePost}>
            {/* SECTION 1 - Categories - Full Width */}
            <div className={style.sectionFullWidth}>
                <div className={style.sectionHeader}>
                    <h2 className='text-center font-bold UserBlackMain mb-2'>{sectionone.title}</h2>
                    <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectionone.subTitle}</p>
                </div>
                <div className={style.categorySliderFullWidth}>
                    <div className={style.catNavPrev} id='cat-nav-prev'>
                        <i className="fa-solid fa-chevron-left"></i>
                    </div>
                    <div className={style.catNavNext} id='cat-nav-next'>
                        <i className="fa-solid fa-chevron-right"></i>
                    </div>
                    <Swiper
                        autoplay={{
                            delay: 5000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay, Navigation]}
                        navigation={{
                            prevEl: '#cat-nav-prev',
                            nextEl: '#cat-nav-next',
                        }}
                        spaceBetween={15}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            992: { slidesPerView: 4 },
                            1205: { slidesPerView: 6 },
                        }}
                    >
                        {
                            (sectionone.items || []).map((obj, key) => {
                                if (obj._id !== undefined) {
                                    return (
                                        <SwiperSlide key={key}>
                                            <div className={style.UserCateSlidCard}>
                                                <div className={style.InnerDiv}>
                                                    <Link href={`/c/${obj.slug}`} className="LinkTagNonDec">
                                                        <div className={style.UserCateSlidImgDiv}>
                                                            <img className={style.UserCateSlidImg}
                                                                src={`${ServerId}/category/${obj.uni_id1}${obj.uni_id2}/${obj.file.filename}`} alt={obj.name} loading="lazy" />
                                                        </div>
                                                        <div>
                                                            <h5 className='UserBlackMain font-bolder oneLineTxt'>{obj.name}</h5>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </div>
                                        </SwiperSlide>
                                    )
                                } else {
                                    return null
                                }

                            })
                        }
                    </Swiper>
                </div>
            </div>

            {/* SECTION 2 - Products */}
            <div className={style.sectionFullWidthBg}>
                <div className={style.fullWidthContainer}>
                    <div className={style.sectionHeader}>
                        <h2 className='text-center font-bold UserBlackMain mb-2'>{sectiontwo.title}</h2>
                        <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectiontwo.subTitle}</p>
                    </div>
                    <div className={style.productsGridFullWidth}>
                        <Swiper
                            autoplay={{
                                delay: 4000,
                                disableOnInteraction: false,
                            }}
                            modules={[Autoplay]}
                            spaceBetween={20}
                            breakpoints={{
                                0: { slidesPerView: 2 },
                                768: { slidesPerView: 3 },
                                992: { slidesPerView: 4 },
                                1205: { slidesPerView: 5 },
                            }}
                        >
                            {(sectiontwo.items || []).map((obj, key) => {
                                if (obj._id !== undefined) {
                                    return (
                                        <SwiperSlide key={key}>
                                            <div className={style.UserMainProCard}>
                                                <div className={style.UserMainProimgDiv}>
                                                    {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}% OFF</span>}
                                                    {obj.available === "true" && obj.allowRfq !== true ? (
                                                        <button className={style.cartBtn} onClick={() => {
                                                            userAxios((server) => {
                                                                server.post('/users/addToCart', {
                                                                    item: { quantity: 1, proId: obj._id, price: obj.price, mrp: obj.mrp }
                                                                }).then((res) => {
                                                                    if (res.data.login) {
                                                                        LogOut();
                                                                        setLoginModal({ btn: true, active: true, member: true });
                                                                    } else if (res.data.found) {
                                                                        toast.error("Already in cart");
                                                                    } else {
                                                                        toast.success("Added to cart");
                                                                        setCartTotal(amt => amt + parseInt(obj.price));
                                                                    }
                                                                }).catch(() => toast.error("Error"));
                                                            });
                                                        }}><i className="fa-solid fa-cart-plus"></i></button>
                                                    ) : (
                                                        <div className={style.cartBtn} style={{ opacity: 0.5, cursor: 'not-allowed' }}><i className="fa-solid fa-lock"></i></div>
                                                    )}
                                                    <Link href={`/p/${obj.slug}/${obj._id}`}>
                                                        <img
                                                            src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                            loading="lazy" alt={obj.name}
                                                        />
                                                    </Link>
                                                    <button className={style.QuickViewDiv} onClick={() => {
                                                        Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                                            setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product });
                                                        }).catch(() => toast.error('Error'));
                                                    }}>
                                                        QUICK VIEW
                                                    </button>
                                                </div>
                                                <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                                    <div className={style.textArea}>
                                                        <h6 className={style.category}>{obj.category}</h6>
                                                        <h6 className={style.proName + ' oneLineTxt'}>{obj.name}</h6>
                                                        <div className={style.PriceSpan}>
                                                            {obj.allowRfq === true ? (
                                                                <span className={style.sale}>Send Enquiry</span>
                                                            ) : (
                                                                <>
                                                                    <span className={style.sale}>₹ {obj.price}</span>
                                                                    <span className={style.mrp}>₹ {obj.mrp}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        </SwiperSlide>
                                    )
                                } else {
                                    return null
                                }
                            })}
                        </Swiper>
                    </div>
                </div>
            </div>

            {/* Slider Two - Full Width Banner Slider */}
            <div className={style.sliderTwoContainer}>
                <div className={style.sliderTwoNavPrev} id='slider2-nav-prev'>
                    <i className="fa-solid fa-chevron-left"></i>
                </div>
                <div className={style.sliderTwoNavNext} id='slider2-nav-next'>
                    <i className="fa-solid fa-chevron-right"></i>
                </div>
                <Swiper
                    ref={sliderTwoRef}
                    autoplay={{
                        delay: 4000,
                        disableOnInteraction: false,
                    }}
                    modules={[Autoplay, Navigation]}
                    navigation={{
                        prevEl: '#slider2-nav-prev',
                        nextEl: '#slider2-nav-next',
                    }}
                    spaceBetween={0}
                    slidesPerView={1}
                    loop={true}
                    className={style.sliderTwoSwiper}
                >
                    {(sliderTwo.items || []).map((obj, key) => {
                        return (
                            <SwiperSlide key={key}>
                                <div 
                                    className={style.sliderTwoSlide}
                                    style={{ 
                                        backgroundImage: obj.file ? `url(${ServerId}/${sliderTwo.for}/${obj.uni_id}/${obj.file.filename})` : 'none',
                                        backgroundColor: '#f8fafc'
                                    }}
                                    onClick={() => {
                                        if (obj.link) {
                                            window.open(obj.link, '_blank')
                                        }
                                    }}
                                >
                                </div>
                            </SwiperSlide>
                        )
                    })}
                </Swiper>
            </div>

            {
                banner?.file?.filename && (
                    <div className="UserMainBgGrey">
                        <div className="container p-4">
                            <div className={style.bannerContainer}>
                                <img 
                                    className={`${style.bannerImage} rounded`}
                                    src={`${ServerId}/banner/${banner.file.filename}`}
                                    onClick={() => {
                                        window.open(banner.link, '_blank')
                                    }}
                                    loading="lazy" 
                                    alt="banner"
                                />
                            </div>
                        </div>
                    </div>
                )
            }

            {/* SECTION 3 - Products - Full Width */}
            <div className={style.sectionFullWidthBg}>
                <div className={style.sectionHeader}>
                    <h2 className='text-center font-bold UserBlackMain mb-2'>{sectionthree.title}</h2>
                    <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectionthree.subTitle}</p>
                </div>
                <div className={style.productsGridFullWidth}>
                    <Swiper
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                        spaceBetween={20}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            992: { slidesPerView: 4 },
                            1205: { slidesPerView: 5 },
                        }}
                    >
                        {(sectionthree.items || []).map((obj, key) => {
                            if (obj._id !== undefined) {
                                return (
                                    <SwiperSlide key={key}>
                                        <div className={style.UserMainProCard}>
                                            <div className={style.UserMainProimgDiv}>
                                                {obj.discount > 0 && <span className={style.offerGreen}>{obj.discount}% OFF</span>}
                                                
                                                {obj.available === "true" && obj.allowRfq !== true ? (
                                                    <button className={style.cartBtn} onClick={() => {
                                                        userAxios((server) => {
                                                            server.post('/users/addToCart', {
                                                                item: { quantity: 1, proId: obj._id, price: obj.price, mrp: obj.mrp }
                                                            }).then((res) => {
                                                                if (res.data.login) {
                                                                    LogOut();
                                                                    setLoginModal({ btn: true, active: true, member: true });
                                                                } else if (res.data.found) {
                                                                    toast.error("Already in cart");
                                                                } else {
                                                                    toast.success("Added to cart");
                                                                    setCartTotal(amt => amt + parseInt(obj.price));
                                                                }
                                                            }).catch(() => toast.error("Error"));
                                                        });
                                                    }}><i className="fa-solid fa-cart-plus"></i></button>
                                                ) : (
                                                    <div className={style.cartBtn} style={{ opacity: 0.5, cursor: 'not-allowed' }}><i className="fa-solid fa-lock"></i></div>
                                                )}

                                                <Link href={`/p/${obj.slug}/${obj._id}`}>
                                                    <img
                                                        src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                        loading="lazy" alt={obj.name}
                                                    />
                                                </Link>
                                                
                                                <button className={style.QuickViewDiv} onClick={() => {
                                                    Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                                                        setQuickVw({ ...QuickVw, active: true, btn: true, product: item.data.product });
                                                    }).catch(() => toast.error('Error'));
                                                }}>
                                                    QUICK VIEW
                                                </button>
                                            </div>

                                            <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                                <div className={style.textArea}>
                                                    <h6 className={style.category}>{obj.category}</h6>
                                                    <h6 className={style.proName + ' oneLineTxt'}>{obj.name}</h6>
                                                    <div className={style.PriceSpan}>
                                                        {obj.allowRfq === true ? (
                                                            <span className={style.sale}>Send Enquiry</span>
                                                        ) : (
                                                            <>
                                                                <span className={style.sale}>₹ {obj.price}</span>
                                                                <span className={style.mrp}>₹ {obj.mrp}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </SwiperSlide>
                                )
                            } else {
                                return null
                            }

                        })}
                    </Swiper>
                </div>
            </div>

            {/* SECTION 4 - Products - Full Width */}
            <div className={style.sectionFullWidth}>
                <div className={style.sectionHeader}>
                    <h2 className='text-center font-bold UserBlackMain mb-2'>{sectionfour.title}</h2>
                    <p className='text-center UserGrayMain mx-auto' style={{ maxWidth: '600px' }}>{sectionfour.subTitle}</p>
                </div>
                <div className={style.productsGridFullWidth}>
                    <Swiper
                        autoplay={{
                            delay: 4000,
                            disableOnInteraction: false,
                        }}
                        modules={[Autoplay]}
                        spaceBetween={20}
                        breakpoints={{
                            0: { slidesPerView: 2 },
                            768: { slidesPerView: 3 },
                            992: { slidesPerView: 4 },
                            1205: { slidesPerView: 5 },
                        }}
                    >
                            {
                                (sectionfour.items || []).map((obj, key) => {
                                    if (obj._id !== undefined) {
                                        return (
                                            <SwiperSlide key={key}>
                                                <div className={style.usrLastHmMainDiv}>
                                                    <Link href={`/p/${obj.slug}/${obj._id}`} className="LinkTagNonDec">
                                                        <div className={style.usrLastHmGrid}>
                                                            <div>
                                                                <div className={style.UsrImgdivHomeLast}>
                                                                    <img
                                                                        src={`${ServerId}/product/${obj.uni_id_1}${obj.uni_id_2}/${obj.files[0].filename}`}
                                                                        loading="lazy" alt={obj.name}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <div className='flex-grow-1 p-2'>
                                                                <h6 className={style.category}>{obj.category}</h6>
                                                                <h6 className={style.proName + ' oneLineTxt'}>{obj.name}</h6>
                                                                <div className={style.PriceSpan}>
                                                                    {obj.allowRfq === true ? (
                                                                        <span className={style.sale}>Send Enquiry</span>
                                                                    ) : (
                                                                        <>
                                                                            <span className={style.sale}>₹ {obj.price}</span>
                                                                            <span className={style.mrp}>₹ {obj.mrp}</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </SwiperSlide>
                                        )
                                    } else {
                                        return null
                                    }

                                })
                            }

                        </Swiper>
                </div>
            </div>
        </div>
    )
}

export default HomePost