import Loading from '@/Component/Loading/Loading'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Fragment, useEffect } from 'react'

export default function Orders() {
    const navigate = useRouter()

    useEffect(() => {
        // Orders view is hidden from vendor UI; send users to products.
        navigate.replace('/vendor/products')
    }, [])
    return (
        <Fragment>
            <Head>
                <title>Indianet - Vendor Orders</title>
                <meta name="description" content="Indianet Vendor" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='Vendor'>
                <Loading />
            </main>
        </Fragment>
    )
}
