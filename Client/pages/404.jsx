import ErrorComp from '@/Component/Error/ErrorComp'
import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import Head from 'next/head'
import { Fragment } from 'react'

function Error() {
  return (
    <Fragment>
      <Head>
        <title>Indianet - 404</title>
        <meta name="description" content="Indianet — online shopping marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Header />
        <ErrorComp />
        <Footer />
      </main>
    </Fragment>
  )
}

export default Error
