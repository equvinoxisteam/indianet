import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Fragment, useState } from 'react'
const Header = dynamic(() => import('@/Component/Admin/Header/Header'))
const RfqComp = dynamic(() => import('@/Component/Admin/Rfq/RfqComp'))

export default function Rfq() {
    const [loaded, setLoaded] = useState(false)
    return (
        <Fragment>
            <Head>
                <title>Indianet - Admin RFQ</title>
                <meta name="description" content="Indianet Admin RFQ Manager" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>
            <main className='Admin'>
                {
                    loaded && <Header />
                }
                <RfqComp setLoaded={setLoaded} loaded={loaded} />
            </main>
        </Fragment>
    )
}
