import { useEffect } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { ServerId } from '../../../Config/Server'
import style from './Categories.module.scss'

function CategoriesComp({ categories }) {
    return (
        <div className={style.CategoriesFullWidth}>
            {/* Hero Section */}
            <div className={style.CategoriesHero}>
                <div className="container">
                    <div className="row align-items-center py-5">
                        <div className="col-12 text-center">
                            <h1 className="display-4 font-bold mb-2">Product Categories</h1>
                            <p className="text-muted lead mb-0">Browse through our wide range of high-quality products</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Grid */}
            <div className="py-5">
                <div className="container-fluid px-4 px-md-5">
                    {
                        categories === null || categories === undefined || categories.length === 0 ? (
                            <div className="text-center py-5">
                                <h1 className='UserBlackMain font-bold display-1'>!</h1>
                                <h2 className='UserBlackMain font-bold h3 mt-3'>No Categories Found</h2>
                                <p className="text-muted mt-2">Please check back later for new categories</p>
                            </div>
                        ) : (
                            <div className="row g-4">
                                {
                                    categories.map((obj, key) => {
                                        return (
                                            <div className="col-6 col-md-4 col-lg-3 col-xl-2" key={key}>
                                                <Link className='LinkTagNonDec' href={`/c/${obj.slug}`}>
                                                    <div className={style.CategoryCard}>
                                                        <div className={style.CategoryImage}>
                                                            <img 
                                                                src={`${ServerId}/category/${obj.uni_id1}${obj.uni_id2}/${obj.file.filename}`} 
                                                                alt={obj.name}
                                                                className="img-fluid"
                                                            />
                                                            <div className={style.CategoryOverlay}>
                                                                <i className="fa-solid fa-arrow-right"></i>
                                                            </div>
                                                        </div>
                                                        <div className={style.CategoryInfo}>
                                                            <h5 className="mb-0 font-bold">{obj.name}</h5>
                                                            {obj.productCount && (
                                                                <small className="text-muted">{obj.productCount} products</small>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default CategoriesComp