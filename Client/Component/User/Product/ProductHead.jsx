import React, { Fragment } from 'react'
import { useContext, useMemo, useState } from 'react'
import ContentControl from '../../../ContentControl/ContentControl'
import { ServerId } from '../../../Config/Server'
import { useRouter } from 'next/router'
import RfqModal from './RfqModal'

function ProductHead() {
    const {
        OrderDetails, setOrderDetails, product, setLoginModal, userLogged
    } = useContext(ContentControl)

    let navigate = useRouter()
    const canRfq = product?.allowRfq === true
    const [rfqModalOpen, setRfqModalOpen] = useState(false)
    const [selectedVariantId, setSelectedVariantId] = useState('')
    const variants = Array.isArray(product?.variant) ? product.variant : []

    const selectedVariant = useMemo(() => {
        if (!variants.length) return null
        if (selectedVariantId) {
            const byId = variants.find((v) => (v.id || v._id) === selectedVariantId)
            if (byId) return byId
        }
        return variants.find((v) => v.active) || variants[0]
    }, [variants, selectedVariantId])

    const selectedVariantLabel = selectedVariant
        ? (selectedVariant.size === 'Other' ? (selectedVariant.customSize || 'Custom') : selectedVariant.size)
        : (product?.currVariantSize || '')

    if (canRfq) {
        return (
            <>
                {rfqModalOpen && (
                    <RfqModal
                        show={rfqModalOpen}
                        setShow={setRfqModalOpen}
                        product={product}
                        selectedVariant={selectedVariant}
                        selectedVariantLabel={selectedVariantLabel}
                    />
                )}
                <div className='ProductHead ProductHeadFloating'>
                    <div className="container">
                        <div className="ProductHeadFloatingInner d-flex align-items-center gap-2">
                            {variants.length > 0 && (
                                <select
                                    className='form-select form-select-sm rfqVariantSelect'
                                    value={selectedVariantId || (selectedVariant?.id || selectedVariant?._id || '')}
                                    onChange={(e) => setSelectedVariantId(e.target.value)}
                                >
                                    <option value="" disabled>Select Variant</option>
                                    {variants.map((v, idx) => {
                                        const variantId = v.id || v._id || `v-${idx}`
                                        const label = v.size === 'Other' ? (v.customSize || 'Custom') : v.size
                                        return (
                                            <option key={variantId} value={variantId}>
                                                {label}
                                            </option>
                                        )
                                    })}
                                </select>
                            )}
                            <button
                                className='BuyBtn rfqEnquiryBtn'
                                onClick={() => setRfqModalOpen(true)}
                                disabled={variants.length > 0 && !selectedVariant}
                            >
                                Request Quote
                            </button>
                        </div>
                    </div>
                </div>
            </>
        )
    }

    return (
        <div className='ProductHead'>
            <div className="container">
                <div className="row">

                    <div className="col-6">
                        <div className="ProMaiRow">
                            <div className="pt-1">
                                {product?.files?.[0] ? (
                                    <img src={ServerId + '/product/' + product.uni_id_1 + product.uni_id_2 + '/' + product.files[0].filename} className='ProImg' alt={product.name} loading='lazy' />
                                ) : (
                                    <div className="ProImg placeholder-img">No Image</div>
                                )}
                            </div>
                            <div className="pt-2">
                                <h6 className='font-bold UserBlackMain oneLineTxtMax-300'>{product?.name || 'Product'}</h6>
                                <div className='UserGrayMain text-small ProductHeadSubline'>
                                    {canRfq ? (
                                        <span>RFQ / Enquiry only</span>
                                    ) : (
                                        <span>{product?.available === "true" ? 'In stock' : 'Out of stock'}</span>
                                    )}
                                    {!canRfq && (
                                        <span className='ProductHeadPrice'>₹ {product?.price}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="col-6">
                        <div className="ProBuyRow pt-2">
                            {
                                product.available === "true" ? (
                                    product.allowRfq === true ? (
                                        <div className='UserDflex justify-content-end mb-3 w-100'>
                                            <button className='BuyBtn' disabled>Enquiry Only</button>
                                        </div>
                                    ) : (
                                        <Fragment>
                                            <div className='quantityDiv'>
                                                <button className='btnMinus' onClick={() => {
                                                    if (OrderDetails.quantity !== 1) {
                                                        setOrderDetails({
                                                            ...OrderDetails,
                                                            quantity: OrderDetails.quantity - 1
                                                        })
                                                    }
                                                }}>-</button>
                                                <input type="number" value={OrderDetails.quantity} onChange={(e) => {
                                                    if (parseInt(e.target.value) !== 0) {
                                                        setOrderDetails({
                                                            ...OrderDetails,
                                                            quantity: parseInt(e.target.value)
                                                        })
                                                    } else {
                                                        setOrderDetails({
                                                            ...OrderDetails,
                                                            quantity: 1
                                                        })
                                                    }
                                                }} name="" id="" />
                                                <button className='btnPlus' onClick={() => {
                                                    setOrderDetails({
                                                        ...OrderDetails,
                                                        quantity: OrderDetails.quantity + 1
                                                    })
                                                }}>+</button>
                                            </div>

                                            <div>
                                                <button className='BuyBtn' onClick={() => {
                                                    if (!userLogged.status) {
                                                        setLoginModal(obj => ({
                                                            ...obj,
                                                            btn: true,
                                                            active: true,
                                                            member: true,
                                                            forgot: false
                                                        }))
                                                        return
                                                    }
                                                    navigate.push('/wishlist')
                                                }}>Add to Wishlist</button>
                                            </div>
                                        </Fragment>
                                    )
                                ) : (
                                    <div>
                                        <button className='BuyBtn'>Out of Stock</button>
                                    </div>
                                )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProductHead