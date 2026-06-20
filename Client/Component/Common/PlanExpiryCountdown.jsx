import { useEffect, useState } from 'react'

function formatCountdown(expiresAt) {
    if (!expiresAt) return null
    const ms = new Date(expiresAt).getTime() - Date.now()
    if (ms <= 0) return 'Expired'
    const days = Math.floor(ms / (24 * 60 * 60 * 1000))
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    const minutes = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000))
    if (days > 0) return `${days}d ${hours}h remaining`
    if (hours > 0) return `${hours}h ${minutes}m remaining`
    return `${minutes}m remaining`
}

export default function PlanExpiryCountdown({ expiresAt, className = '' }) {
    const [label, setLabel] = useState(() => formatCountdown(expiresAt))

    useEffect(() => {
        const tick = () => setLabel(formatCountdown(expiresAt))
        tick()
        const id = setInterval(tick, 60000)
        return () => clearInterval(id)
    }, [expiresAt])

    if (!expiresAt || !label) return null

    const urgent = label !== 'Expired' && new Date(expiresAt).getTime() - Date.now() <= 24 * 60 * 60 * 1000

    return (
        <span className={`badge ${urgent ? 'bg-warning text-dark' : 'bg-light text-dark border'} ${className}`.trim()}>
            <i className="fa-regular fa-clock me-1" />
            {label}
        </span>
    )
}
