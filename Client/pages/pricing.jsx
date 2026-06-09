import { useEffect } from 'react'
import { useRouter } from 'next/router'

/** Public seller plans removed — available in vendor dashboard only. */
export default function Pricing() {
    const router = useRouter()
    useEffect(() => {
        router.replace('/vendor/plans')
    }, [router])
    return null
}
