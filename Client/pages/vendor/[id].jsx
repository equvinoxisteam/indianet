import Server from '@/Config/Server'
import PublicVendorPage from '@/Component/User/VendorStore/PublicVendorPage'

export const getServerSideProps = async ({ params }) => {
  const id = params?.id
  if (!id || typeof id !== 'string' || id.length !== 24) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }
  try {
    const response = await Server.get(`/vendor/public/${id}`)
    return {
      props: {
        vendorId: id,
        initialVendor: response.data || { status: false },
      },
    }
  } catch {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    }
  }
}

export default function VendorStoreRoute({ vendorId, initialVendor }) {
  return <PublicVendorPage vendorId={vendorId} initialVendor={initialVendor} />
}
