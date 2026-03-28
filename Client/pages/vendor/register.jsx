import RegisterComp from '@/Component/Vendor/Register/RegisterComp'
import ContentControl from '@/ContentControl/ContentControl'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect } from 'react'

export default function Register() {
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
                <title>Indianet - Vendor Register</title>
                <meta name="description" content="Indianet Vendor" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='Vendor'>
                <RegisterComp />
            </main>
        </Fragment>
    )
}
