import LoginComp from '@/Component/Admin/Login/Login'
import Head from 'next/head'
import { Fragment } from 'react'

export default function Dashboard() {

  return (
    <Fragment>
      <Head>
        <title>Indianet - Admin Login</title>
        <meta name="description" content="Indianet Admin" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className='Admin'>
        <LoginComp />
      </main>
    </Fragment>
  )
}
