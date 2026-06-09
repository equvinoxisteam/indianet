import Server from '@/Config/Server'
import ContentControl from '@/ContentControl/ContentControl'
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { useRouter } from 'next/router'
import { Fragment, useContext, useEffect, useState } from 'react'
const QuickView = dynamic(() => import('@/Component/User/QuickView/QuickView'))
const Footer = dynamic(() => import('@/Component/User/Footer/Footer'))
const Header = dynamic(() => import('@/Component/User/Header/Header'))
const Result = dynamic(() => import('@/Component/User/Result/ResultComp'))

export const getServerSideProps = async ({ query }) => {
    try {
        let response = await Server.get(`/users/getCategoryProducts/${query.category}`, {
            params: {
                page: 1,
                sort: { '_id': -1 },
                min: 0,
                max: 10000000,
            }
        })

        return {
            props: {
                res: response.data
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

function Categories({ res }) {

    let router = useRouter()

    const { QuickVw } = useContext(ContentControl)

    const [products, setProducts] = useState(res.products)
    const [response, setResponse] = useState(res)
    const [pageNum, setPageNum] = useState(1)
    const [filter, setFilter] = useState({
        sort: { '_id': -1 },
        min: 0,
        max: 10000000,
        seCategory: router.query.category
    })

    useEffect(() => {
        async function getData() {
            try {
                let response = await Server.get(`/users/getCategoryProducts/${router.query.category}`, {
                    params: {
                        page: 1,
                        sort: { '_id': -1 },
                        min: 0,
                        max: 10000000
                    }
                })

                setProducts(response.data.products)
                setResponse(response.data)
                setFilter({
                    sort: { '_id': -1 },
                    min: 0,
                    max: 10000000,
                    category: router.query.category
                })
                setPageNum(1)
            } catch (err) {
                console.log(`Facing An Error ${err}`)
            }
        }
        getData()
    }, [router.query.category])

    useEffect(() => {
        async function getData() {
            try {
                let response = await Server.get(`/users/getCategoryProducts/${router.query.category}`, {
                    params: {
                        page: pageNum,
                        sort: filter.sort,
                        min: filter.min,
                        max: filter.max
                    }
                })

                setProducts(response.data.products)
                setResponse(response.data)
            } catch (err) {
                console.log(`Facing An Error ${err}`)
            }
        }

        getData()
    }, [filter, pageNum])

    return (
        <Fragment>
            <Head>
                <title>{`Indianet - ${router.query.category}`}</title>
                <meta name="description" content="Indianet — online shopping marketplace" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Head>

            <main>
                <Header />
                {QuickVw.active && <QuickView />}
                <section className="container pt-3 pb-1">
                    <div className="card-flat" style={{ borderRadius: '16px', border: '1px solid #e6edf5', boxShadow: '0 10px 24px rgba(15,23,42,0.06)', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)' }}>
                        <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
                            <div>
                                <div className="small text-muted text-uppercase" style={{ letterSpacing: '.08em' }}>Category</div>
                                <h1 className="h4 mb-1 text-capitalize">{String(router.query.category || '').replace(/-/g, ' ')}</h1>
                                <p className="mb-0 text-muted small">Explore curated products with smart filters and premium sorting</p>
                            </div>
                            <div className="small text-muted">
                                <i className="fa-solid fa-layer-group me-1" />
                                {response?.total || products.length} items
                            </div>
                        </div>
                    </div>
                </section>
                <Result
                    setPageNum={setPageNum}
                    products={products}
                    response={response}
                    filter={filter}
                    setFilter={setFilter}
                    setProducts={setProducts}
                    setResponse={setResponse}
                    pageNum={pageNum}
                    category={router.query.category}
                    search={router.query.name}
                />
                <Footer />
            </main>
        </Fragment>
    )
}

export default Categories