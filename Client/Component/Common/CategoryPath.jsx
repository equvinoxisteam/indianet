import React, { Fragment } from 'react'
import style from './CategoryPath.module.scss'

export function splitCategoryPath(category) {
    if (!category || typeof category !== 'string') return []
    return category.split('>').map((part) => part.trim()).filter(Boolean)
}

export default function CategoryPath({ category, className = '', variant = 'inline' }) {
    const parts = splitCategoryPath(category)
    if (!parts.length) return null

    const variantClass = style[variant] || style.inline

    return (
        <div className={`${style.path} ${variantClass} ${className}`.trim()} title={category}>
            {parts.map((part, index) => (
                <Fragment key={`${part}-${index}`}>
                    {index > 0 && (
                        <span className={style.separator} aria-hidden="true">
                            <i className="fa-solid fa-chevron-right" />
                        </span>
                    )}
                    <span className={style.segment}>{part}</span>
                </Fragment>
            ))}
        </div>
    )
}
