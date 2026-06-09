import React from 'react'
import style from './Loading.module.scss'

function Loading() {
    return (
        <div className={style.loadingScreen}>
            <span className={style.spineer}></span>
        </div>
    )
}

export default Loading