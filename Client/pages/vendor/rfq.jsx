import dynamic from 'next/dynamic'
import Head from 'next/head'
import { Fragment, useState } from 'react'

const Header = dynamic(() => import('@/Component/Vendor/Header/Header'))
const RfqComp = dynamic(() => import('@/Component/Vendor/Rfq/RfqComp'))

export default function VendorRfq() {
  const [loaded, setLoaded] = useState(false)

  return (
    <Fragment>
      <Head>
        <title>Indianet - Vendor RFQ</title>
        <meta name="description" content="Indianet Vendor RFQ Manager" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className='Vendor'>
        {loaded && <Header />}
        <RfqComp loaded={loaded} setLoaded={setLoaded} />
      </main>
    </Fragment>
  )
}

