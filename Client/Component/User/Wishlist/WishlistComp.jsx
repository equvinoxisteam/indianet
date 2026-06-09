import React from 'react'
import { useContext } from 'react';
import Link from 'next/link';
import ContentControl from '../../../ContentControl/ContentControl';
import WishlistEmpty from '../../../Assets/WishlistEmpty'
import Server, { userAxios, ServerId } from '../../../Config/Server';
import toast from 'react-hot-toast';
import Swal from 'sweetalert2';

function WishlistComp({ products, setUpdate }) {
    const { setQuickVw, QuickVw, userLogged, setUserLogged, setCartTotal } = useContext(ContentControl)
    return (
        <>
            {
                products.length !== 0 ? (
                    <div className='WishlistComp container pt-4'>
                        <div className='text-center'>
                            <h1 className='UserBlackMain font-bold'>Wishlist</h1>
                            <h6 className='font-bolder UserGrayMain'>Products saved for later</h6>
                        </div>

                        <div className="row pt-4">
                            {products.map((obj, key) => {
                                return (
                                    <div className="col-6 col-md-4 col-lg-3" key={key}>
                                        <div className="UserMainProCard">
                                            <div className='UserMainProimgDiv text-center'>
                                                <div>
                                                    <button className='offerGreen'>{obj.discount}%</button>
                                                    {
                                                        obj.item.available === "true" && obj.item.allowRfq !== true ? (
                                                            <button className='cartBtn' onClick={() => {
                                                                var formData = {
                                                                    item: {
                                                                        quantity: 1,
                                                                        proId: obj.item._id,
                                                                        price: obj.price,
                                                                        mrp: obj.mrp,
                                                                        variantSize: obj.currVariantSize
                                                                    }
                                                                }

                                                                userAxios((server) => {
                                                                    server.post('/users/addToCart', formData).then((res) => {
                                                                        if (res.data.login) {
                                                                            setUserLogged(user => ({
                                                                                ...user,
                                                                                status: false,
                                                                            }))
                                                                            localStorage.removeItem('token')
                                                                        } else {
                                                                            if (res.data.found) {
                                                                                toast.error("Already in cart")
                                                                            } else {
                                                                                toast.success("Product added to cart")
                                                                                setCartTotal(amt => amt + obj.price)
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
                                                <Link className='LinkTagNonDec' href={`/p/${obj.item.slug}/${obj.item._id}`}>
                                                    <img src={`${ServerId}/product/${obj.item.uni_id_1}${obj.item.uni_id_2}/${obj.item.files[0].filename}`} alt={obj.item.name} />
                                                </Link>
                                                <button className='QuickViewDiv' onClick={() => {
                                                    Server.get('/users/product/' + obj.item.slug + '/' + obj.item._id).then((item) => {
                                                        setQuickVw({
                                                            ...QuickVw, active: true,
                                                            btn: true,
                                                            product: item.data.product
                                                        })
                                                    }).catch(() => {
                                                        toast.error('Facing An Error')
                                                    })
                                                }}>
                                                    QUICK VIEW
                                                </button>
                                            </div>
                                                    <Link className='LinkTagNonDec' href={`/p/${obj.item.slug}/${obj.item._id}`}>
                                                <div className='pt-2'>
                                                    <h6 className='UserGrayMain text-small oneLineTxt'><small>{obj.item.category}</small></h6>
                                                    <h6 className='UserBlackMain oneLineTxt'>{obj.item.name}</h6>
                                                    {obj.item.allowRfq === true ? (
                                                        <h6><span className='UserBlackMain'>RFQ</span></h6>
                                                    ) : (
                                                        <h6><small className='UserGrayMain text-small'><del>₹ {obj.mrp}</del></small> <span className='UserBlackMain'>₹ {obj.price}</span></h6>
                                                    )}
                                                </div>
                                            </Link>

                                            <button className='RemoveBtn' onClick={() => {
                                                Swal.fire({
  title: `Do you want remove ${obj.item.name}`,
  icon: 'warning',
  showCancelButton: true,
  confirmButtonColor: '#3085d6',
  cancelButtonColor: '#d33',
  confirmButtonText: 'Yes'
}).then((result) => {
  if (result.isConfirmed) {
                                                    userAxios((server) => {
                                                        server.put('/users/removeItemWihslist', {
                                                            proId: obj.item._id
                                                        }).then((res) => {
                                                            if (res.data.login) {
                                                                setUserLogged(user => ({
                                                                    ...user,
                                                                    status: false,
                                                                }))
                                                                localStorage.removeItem('token')
                                                            } else {
                                                                console.log("DONE")
                                                                setUpdate(update => !update)
                                                            }
                                                        }).catch(() => {
                                                            toast.error("Sorry for facing error")
                                                        })
                                                    })
                                                
  }
})
                                            }}>
                                                REMOVE
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="container container-fluid pt-3 pb-2">
                        <div className='text-center'>
                            <div className='ErrorSection'>
                                <WishlistEmpty />
                                <h5 className='UserGrayMain pt-5'>Your wishlist is empty</h5>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    )
}

export default WishlistComp