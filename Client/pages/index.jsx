import Footer from '@/Component/User/Footer/Footer'
import Header from '@/Component/User/Header/Header'
import HomePost from '@/Component/User/HomePost/HomePost'
import QuickView from '@/Component/User/QuickView/QuickView'
import Slider from '@/Component/User/Slider/Slider'
import Server from '@/Config/Server'
import ContentControl from '@/ContentControl/ContentControl'
import Head from 'next/head'
import { Fragment, useContext, useState } from 'react'

/** API returns null for sliders/banner when unset; components expect { items, for } and banner { file, link }. */
function normalizeHomeLayout(raw) {
  const d = raw || {}
  const emptySection = { title: '', subTitle: '', items: [], items2: [] }
  const emptySlider = { items: [], for: 'product' }

  const coalesceSlider = (s) => {
    if (s && typeof s === 'object' && !Array.isArray(s)) {
      return {
        ...emptySlider,
        ...s,
        for: s.for || emptySlider.for,
        items: Array.isArray(s.items) ? s.items : [],
      }
    }
    return { ...emptySlider }
  }

  const coalesceSection = (key) => {
    const s = d[key]
    if (s && typeof s === 'object' && Array.isArray(s.items)) {
      return {
        title: s.title || '',
        subTitle: s.subTitle || '',
        items: s.items,
        items2: Array.isArray(s.items2) ? s.items2 : [],
      }
    }
    return { ...emptySection }
  }

  let banner = d.banner
  if (!banner || typeof banner !== 'object' || Array.isArray(banner)) {
    banner = { file: { filename: '' }, link: '' }
  } else if (!banner.file || typeof banner.file !== 'object') {
    banner = { ...banner, file: { filename: '' } }
  }

  return {
    ...d,
    sliderOne: coalesceSlider(d.sliderOne),
    sliderTwo: coalesceSlider(d.sliderTwo),
    banner,
    sectionone: coalesceSection('sectionone'),
    sectiontwo: coalesceSection('sectiontwo'),
    sectionthree: coalesceSection('sectionthree'),
    sectionfour: coalesceSection('sectionfour'),
  }
}

export async function getServerSideProps() {
  try {

    let layout = await Server.get('/users/getLayouts')

    return {
      props: {
        response: normalizeHomeLayout(layout.data)
      }
    }
  } catch (err) {
    console.log(`Facing An Error ${err}`)
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }

}

export default function Home({ response }) {
  const { QuickVw } = useContext(ContentControl)

  const [layout] = useState(response)
  return (
    <Fragment>
      <Head>
        <title>Indianet — B2B Marketplace</title>
        <meta name="description" content="Indianet — online shopping marketplace" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main>
        <Header />
        {QuickVw.active && <QuickView />}
        <Slider layout={layout} />
        <HomePost layout={layout} />
        <Footer />
      </main>
    </Fragment>
  )
}
