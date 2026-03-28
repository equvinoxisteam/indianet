import LoginComp from '@/Component/Vendor/Login/LoginComp'
import ContentControl from '@/ContentControl/ContentControl'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect } from 'react'

export default function Login() {
    const { venderLogged } = useContext(ContentControl)
    const navigate = useRouter()

    useEffect(() => {
        if (venderLogged.status) {
            document.body.style.background = '#f0f5fa'
            navigate.push('/vendor/dashboard')
        }
    }, [venderLogged])
    return (
        <Fragment>
            <Head>
                <title>Indianet - Vendor Login</title>
                <meta name="description" content="Indianet Vendor" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='Vendor'>
                <LoginComp />
            </main>
        </Fragment>
    )
}
