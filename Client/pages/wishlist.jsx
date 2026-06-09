import Head from "next/head"
import { Fragment, useContext, useEffect, useState } from "react"
import dynamic from "next/dynamic"
import ContentControl from "@/ContentControl/ContentControl"
import { userAxios } from "@/Config/Server"
import LoginError from "@/Component/Error/LoginError"
import Loading from "@/Component/Loading/Loading"
import toast from 'react-hot-toast';

const Footer = dynamic(() => import('@/Component/User/Footer/Footer'))
const Header = dynamic(() => import('@/Component/User/Header/Header'))
const WishlistComp = dynamic(() => import('@/Component/User/Wishlist/WishlistComp'))
const QuickView = dynamic(() => import('@/Component/User/QuickView/QuickView'))

function Wishlist() {
    const { QuickVw, userLogged, setUserLogged, setLoginModal } = useContext(ContentControl)

    const [loaded, setLoaded] = useState(userLogged.status)
    const [update, setUpdate] = useState(false)
    const [logError, setLogError] = useState(false)

    const [products, setProducts] = useState([])

    useEffect(() => {
        const token = localStorage.getItem('token')
        setLogError(false)
        if (token) {
            userAxios((server) => {
                server.get(`/users/getWishlistItems`).then((res) => {
                    if (res.data.login) {
                        setUserLogged({ status: false })
                        localStorage.removeItem('token')
                        setLogError(true)
                        setLoaded(true)
                        setLoginModal(loginModal => ({
                            ...loginModal,
                            btn: true,
                            member: true,
                            forgot: false,
                            active: true
                        }))
                    } else {
                        setProducts(res.data)
                        setLoaded(true)
                    }
                }).catch((err) => {
                    toast.error("Sorry for facing error")
                    setLoaded(true)
                })
            })
        } else {
            setLoaded(true)
            setLogError(true)
            setLoginModal(loginModal => ({
                ...loginModal,
                btn: true,
                member: true,
                forgot: false,
                active: true
            }))
        }
    }, [userLogged, update])

    return (
        <Fragment>
            <Head>
                <title>Indianet - Wishlist</title>
                <meta name="description" content="Indianet — online shopping marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main>
                <Header />
                {QuickVw.active && <QuickView />}
                {
                    logError ? <LoginError />
                        : <WishlistComp products={products} setUpdate={setUpdate} />
                }
                <Footer />
            </main>
        </Fragment>
    )
}

export default Wishlist