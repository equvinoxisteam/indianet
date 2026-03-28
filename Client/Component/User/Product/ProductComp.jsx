import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Autoplay, Pagination } from 'swiper'
import 'swiper/css';
import { useContext } from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Thumbs, Autoplay, Pagination } from 'swiper'
import 'swiper/css';
import { useContext } from 'react'
import Link from 'next/link'
import ContentControl from '../../../ContentControl/ContentControl'
import Server, { ServerId, userAxios } from '../../../Config/Server'
import ReviewModal from './ReviewModal'
import CheckPinModal from './CheckPinModal'
import { useRouter } from 'next/router'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';
import RfqModal from './RfqModal';

function ProductComp() {

  const {
    OrderDetails, setOrderDetails,
    setQuickVw, QuickVw,
    ImgModal, setImgModal,
    product, similar, userLogged, setUserLogged,
    setLoginModal, setCartTotal, setOrderType, setProduct
  } = useContext(ContentControl)

  const [showDesReview, setDesReview] = useState({
    description: true,
    review: false
  })

  const [showReviewModal, setShowReviewModal] = useState({
    btn: false,
    active: false
  })

  const [reviews, setReviews] = useState({
    total: 0,
    reviews: [],
    userReview: false,
    stars: {
      one: 0,
      two: 0,
      three: 0,
      four: 0,
      five: 0,
      onePerc: 0,
      twoPerc: 0,
      threePerc: 0,
      fourPerc: 0,
      fivePerc: 0,
      rating: 0
    }
  })

  const images = product.files
  const [thumbsSwiper, setThumbsSwiper] = useState(null)

  const [magnifier, setMagnifier] = useState(false)
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);

  var magnifierHeight = 150
  var magnifieWidth = 150
  var zoomLevel = 2

  const [rfqModalOpen, setRfqModalOpen] = useState(false)

  const canBuyOnline = product.allowOnline !== false;
  const canBuyCod = product.allowCod !== false;
  const canRfq = product.allowRfq === true;
  const canPurchase = canBuyOnline || canBuyCod;

  function copyURL() {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Text copied');
  }

  function LogOut() {
    setUserLogged(user => ({
      ...user,
      status: false,
    }))
    localStorage.removeItem('token')
  }

  function getReviews() {
    Server.get('/users/getReviews', {
      params: {
        proId: product._id,
        userId: userLogged._id || '',
      }
    }).then((res) => {
      setReviews({
        total: res.data.total,
        reviews: res.data.reviews,
        userReview: res.data.userReview,
        stars: res.data.stars
      })
    }).catch(() => {
      setDesReview({
        ...showDesReview, description: true,
        review: false
      })
      toast.error('Error to Get Reviews')
    })
  }

  useEffect(() => {
    getReviews()
  }, [userLogged])

  function loadMoreReviews() {
    Server.get('/users/loadMoreReviews', {
      params: {
        proId: product._id,
        skip: reviews['reviews'].length
      }
    }).then((res) => {
      setReviews({
        ...reviews,
        total: res.data.total,
        reviews: [...reviews.reviews, ...res.data.reviews]
      })
    }).catch(() => {
      toast.error('Error to Load More Reviews')
    })
  }

  function deleteReview() {
    Swal.fire({
  title: 'Do you want delete review',
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
      userAxios((server) => {
        server.delete('/users/deleteReview', {
          data: {
            proId: product._id
          }
        }).then((res) => {
          if (res.data.login) {
            setUserLogged({ status: false })
            localStorage.removeItem('token')
            toast.error('Please Login')
          } else {
            getReviews()
            toast.success("Review Deleted")
          }
        }).catch(() => {
          toast.error("Error to delete review")
        })
      })
    
  }
          <div className='DescAndReviews'>
            <div className='btns'>
              <button className={showDesReview.description ? 'active-btn' : ''} onClick={() => {
                setDesReview({
                  ...showDesReview, description: true,
                  review: false
                })
              }}>Description</button>
              <button className={showDesReview.review ? 'active-btn' : ''} onClick={() => {
                setDesReview({
                  ...showDesReview, description: false,
                  review: true
                })
                getReviews()
              }}>Reviews</button>
            </div>

            <div className='description' style={{ display: showDesReview.description ? 'block' : 'none' }} dangerouslySetInnerHTML={{ __html: product.description }}>
            </div>

            <div className='reviews' style={{ display: showDesReview.review ? 'block' : 'none' }}>

              <div className="ReviewRating">
                <div className="row">

                  <div className="col-4 text-center">
                    <h2 className='UserBlackMain font-bold pt-2'>
                      {reviews['stars'].rating}
                      &nbsp;
                      <span className='fa fa-star'></span>
                    </h2>
                    <h6 className='text-small UserGrayMain'>{reviews.total} Reviews</h6>

                    {
                      userLogged.status ? (
                        <>
                          {
                            reviews['userReview'] ? <button className='LoginBtn text-small'>
                              To add new review
                              <span className='UserGreenMain' onClick={() => {
                                deleteReview()
                              }}>
                                &nbsp;delete&nbsp;
                              </span>
                              old review
                            </button>
                              : <button className='AddReview'
                                onClick={() => {
                                  setShowReviewModal({
                                    btn: true,
                                    active: true
                                  })
                                }} >
                                Add Review
                              </button>
                          }
                        </>
                      )

                        : <button className='LoginBtn text-small'>
                          Must&nbsp;
                          <span className='UserGreenMain' onClick={() => {
                            setLoginModal(obj => ({
                              ...obj,
                              btn: true,
                              active: true,
                              member: true,
                              forgot: false
                            }))
                          }}>
                            logged
                          </span> to post a review
                        </button>
                    }

                  </div>

                  <div className="col-8">
                    <div className="RatingBars">

                      <div className="row">
                        <div className="col-3">
                          <small className='UserBlackMain text-smaller'>
                            5
                            &nbsp;
                            <span className='fa fa-star'></span>
                          </small>
                        </div>
                        <div className="col-7">
                          <div className="barBody">
                            <div className="bar-5" style={{ maxWidth: `${reviews['stars'].fivePerc}%` }}></div>
                          </div>
                        </div>
                        <div className="col-2">
                          <small className='UserGrayMain text-smaller'>
                            {reviews['stars'].five}
                          </small>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-3">
                          <small className='UserBlackMain text-smaller'>
                            4
                            &nbsp;
                            <span className='fa fa-star'></span>
                          </small>
                        </div>
                        <div className="col-7">
                          <div className="barBody">
                            <div className="bar-4" style={{ maxWidth: `${reviews['stars'].fourPerc}%` }}></div>
                          </div>
                        </div>
                        <div className="col-2">
                          <small className='UserGrayMain text-smaller'>
                            {reviews['stars'].four}
                          </small>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-3">
                          <small className='UserBlackMain text-smaller'>
                            3
                            &nbsp;
                            <span className='fa fa-star'></span>
                          </small>
                        </div>
                        <div className="col-7">
                          <div className="barBody">
                            <div className="bar-3" style={{ maxWidth: `${reviews['stars'].threePerc}%` }}></div>
                          </div>
                        </div>
                        <div className="col-2">
                          <small className='UserGrayMain text-smaller'>
                            {reviews['stars'].three}
                          </small>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-3">
                          <small className='UserBlackMain text-smaller'>
                            2
                            &nbsp;
                            <span className='fa fa-star'></span>
                          </small>
                        </div>
                        <div className="col-7">
                          <div className="barBody">
                            <div className="bar-2" style={{ maxWidth: `${reviews['stars'].twoPerc}%` }}></div>
                          </div>
                        </div>
                        <div className="col-2">
                          <small className='UserGrayMain text-smaller'>
                            {reviews['stars'].two}
                          </small>
                        </div>
                      </div>

                      <div className="row">
                        <div className="col-3">
                          <small
                            className='UserBlackMain text-smaller'>
                            1
                            &nbsp;&nbsp;
                            <span className='fa fa-star'></span>
                          </small>
                        </div>
                        <div className="col-7">
                          <div className="barBody">
                            <div className="bar-1" style={{ maxWidth: `${reviews['stars'].onePerc}%` }}></div>
                          </div>
                        </div>
                        <div className="col-2">
                          <small className='UserGrayMain text-smaller'>
                            {reviews['stars'].one}
                          </small>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                <div className="Reviews">
                  {
                    reviews['reviews'] && reviews['reviews'].length !== 0 ? (
                      <>
                        {
                          reviews['reviews'].map((obj, key) => {
                            if (userLogged.status && userLogged._id === obj.userId) {
                              return (
                                <div key={key} className="cardReview">

                                  <div className="rowCardOwnReview">
                                    <div>
                                      <button className='rating'>
                                        {obj.starInNum}
                                        &nbsp;
                                        <span className='fa fa-star'></span>
                                      </button>
                                    </div>

                                    <div className='reviewTitle'>
                                      <h6 className='UserBlackMain font-bold'>
                                        <small>{obj.title}</small>
                                      </h6>
                                    </div>

                                    <div>
                                      <button className='delete' onClick={() => {
                                        deleteReview()
                                      }}>
                                        delete
                                      </button>
                                    </div>
                                  </div>

                                  <div className="reviewContent" style={{ whiteSpace: 'pre-wrap' }} >
                                    {obj.review}
                                  </div>

                                </div>
                              )
                            } else {
                              return (
                                <div key={key} className="cardReview">

                                  <div className="rowCard">
                                    <div>
                                      <button className='rating'>
                                        {obj.starInNum}
                                        &nbsp;
                                        <span className='fa fa-star'></span>
                                      </button>
                                    </div>

                                    <div className='reviewTitle'>
                                      <h6 className='UserBlackMain font-bold'>
                                        <small>{obj.title}</small>
                                      </h6>
                                    </div>
                                  </div>

                                  <div className="reviewContent" style={{ whiteSpace: 'pre-wrap' }} >
                                    {obj.review}
                                  </div>

                                </div>
                              )
                            }
                          })
                        }
                        {
                          parseInt(reviews.total) !== reviews['reviews'].length ? <button className='loadMore' onClick={() => {
                            loadMoreReviews()
                          }}>load more</button>
                            : (
                              <div className="pt-1"></div>
                            )
                        }
                      </>
                    ) : (
                      <div style={{ paddingLeft: '10px', paddingTop: '10px' }}>
                        <p className='UserGrayMain text-small'>There are no reviews yet.</p>
                      </div>
                    )
                  }
                </div>

              </div>

            </div>
          </div>

        </div>

        <div className="relatedproducts">

          <div className='heading'>
            <h5>RELATED PRODUCTS</h5>
          </div>

          <Swiper
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
            modules={[Autoplay]}
            spaceBetween={20}
            breakpoints={{
              0: {
                slidesPerView: '2',
              },
              768: {
                slidesPerView: '3',
              },
              992: {
                slidesPerView: '4',
              },
              1205: {
                slidesPerView: '5',
              },
            }}
          >
            {
              similar.map((obj, key) => {
                return (
                  <SwiperSlide key={key}>
                    <div className="UserMainProCard">
                      <div className='UserMainProimgDiv text-center'>
                        <div>
                          <button className='offerGreen'>{obj.discount}%</button>
                          {
                            obj.available === "true" ? (
                              <button className='cartBtn' onClick={() => {
                                userAxios((server) => {
                                  server.post('/users/addToCart', {
                                    item: {
                                      quantity: 1,
                                      proId: obj._id,
                                      price: obj.price,
                                      mrp: obj.mrp,
                                      variantSize: obj.currVariantSize
                                    }
                                  }).then((res) => {
                                    if (res.data.login) {
                                      LogOut()
                                      setLoginModal(obj => ({
                                        ...obj,
                                        btn: true,
                                        active: true,
                                        member: true,
                                        forgot: false
                                      }))
                                    } else {
                                      if (res.data.found) {
                                        toast.error("Already in cart")
                                      } else {
                                        toast.success("Product added to cart")
                                        setCartTotal(amt => amt + parseInt(obj.price))
                                      }
                                    }
                                  }).catch((err) => {
                                    toast.error("Something Wrong")
                                  })
                                })
                              }}><i className="fa-solid fa-cart-plus"></i></button>
                            ) : (
                              <button className='cartBtn'><i className="fa-solid fa-exclamation"></i></button>
                            )
                          }
                        </div>
                        <Link href={'/p/' + obj.slug + '/' + obj._id}>
                          <img src={ServerId + '/product/' + obj.uni_id_1 + obj.uni_id_2 + '/' + obj.files[0].filename} alt={obj.name} loading="lazy" />
                        </Link>
                        <button className='QuickViewDiv' onClick={() => {
                          Server.get('/users/product/' + obj.slug + '/' + obj._id).then((item) => {
                            setQuickVw({
                              ...QuickVw, active: true,
                              btn: true,
                              product: item.data.product
                            })
                            setImgModal({ ...ImgModal, active: false })
                          }).catch(() => {
                            toast.error('Facing An Error')
                          })

                        }}>
                          QUICK VIEW
                        </button>
                      </div>
                      <Link href={'/p/' + obj.slug + '/' + obj._id} className="LinkTagNonDec">
                        <div className='pt-2'>
                          <h6 className='UserGrayMain text-small oneLineTxt'><small>{obj.category}</small></h6>
                          <h6 className='UserBlackMain oneLineTxt'>{obj.name}</h6>
                          <h6><small className='UserGrayMain text-small'><del>₹ {obj.mrp}</del></small> <span className='UserBlackMain'>₹ {obj.price}</span></h6>
                        </div>
                      </Link>
                    </div>
                  </SwiperSlide>
                )

              })
            }

          </Swiper>
        </div>
      </div>
    </>
  )
}

export default ProductComp