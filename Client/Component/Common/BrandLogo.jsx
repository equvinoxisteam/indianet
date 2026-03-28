import Link from 'next/link'

/**
 * Indianet wordmark + logo for headers and auth screens.
 * @param {'default' | 'light'} variant - light: white text on blue/dark bars
 */
export default function BrandLogo({ href = '/', variant = 'default', className = '' }) {
  const isLight = variant === 'light'
  return (
    <Link
      href={href}
      className={`LinkTagNonDec d-inline-flex align-items-center gap-2 ${className}`}
      style={{ textDecoration: 'none' }}
    >
      <img
        src="/logo_bg.jpg"
        alt="Indianet"
        width={40}
        height={40}
        style={{ objectFit: 'contain', borderRadius: 8 }}
      />
      <span
        className={isLight ? '' : 'UserGreenMain'}
        style={{
          fontWeight: 700,
          fontSize: '1.2rem',
          margin: 0,
          color: isLight ? '#ffffff' : undefined,
        }}
      >
        Indianet
      </span>
    </Link>
  )
}
