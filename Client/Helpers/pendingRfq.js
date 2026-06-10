import { userAxios } from '@/Config/Server'
import toast from 'react-hot-toast'

export const PENDING_RFQ_KEY = 'indianet_pending_rfq'

export function flushPendingRfq(user) {
    if (!user?.status || !user?._id) return
    const raw = sessionStorage.getItem(PENDING_RFQ_KEY)
    if (!raw) return

    try {
        const pending = JSON.parse(raw)
        sessionStorage.removeItem(PENDING_RFQ_KEY)
        userAxios((server) => {
            server.post('/users/submitRfq', {
                ...pending,
                userId: user._id,
                userName: user.name,
                userEmail: user.email,
            }).then(() => {
                toast.success('Quote request submitted successfully!')
            }).catch(() => {
                toast.error('Could not submit your saved quote request. Please try again from the product page.')
            })
        })
    } catch {
        sessionStorage.removeItem(PENDING_RFQ_KEY)
    }
}
