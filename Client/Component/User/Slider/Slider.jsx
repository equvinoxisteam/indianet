import React from 'react'
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from "swiper";
import { ServerId } from '@/Config/Server';
import style from './Slider.module.scss'

function Slider({ layout }) {
    const sliderOne = layout?.sliderOne || { items: [], for: 'product' }
    const items = Array.isArray(sliderOne.items) ? sliderOne.items : []

    return (
        <div className={style.UserSlider}>
            <Swiper
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: false,
                }}
                modules={[Autoplay]}
                slidesPerView={1}
                spaceBetween={0}
                loop={true}
                className={style.mySwiper}
            >
                {
                    items.map((obj, key) => (
                        <SwiperSlide key={key}>
                            <div 
                                className={style.SlideImgDiv} 
                                style={{ 
                                    backgroundImage: obj.file ? `url(${ServerId}/${sliderOne.for}/${obj.uni_id}/${obj.file.filename})` : 'none',
                                    backgroundColor: '#f8fafc'
                                }}
                            >
                                <div className="container h-100">
                                    <div className={style.SlideContentWrapper}>
                                        <div className={style.SlideTextDiv}>
                                            <h5 className={style.SlideSmallText}>{obj.title}</h5>
                                            <div className={style.SlideMainText} dangerouslySetInnerHTML={{ __html: obj.content }}></div>
                                            <h6 className={style.SlideSubContent}>{obj.subContent}</h6>
                                            <button 
                                                onClick={() => window.open(obj.btnLink, '_blank')} 
                                                className={style.shopNowBtn}
                                            >
                                                {obj.btn || 'Shop Now'}
                                                <i className="fa-solid fa-arrow-right ms-2"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))
                }
            </Swiper>
        </div>
    )
}

export default Slider

