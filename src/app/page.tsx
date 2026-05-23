import Link from 'next/link';

const brands = [
  {
    href: '/menu/beiyuan',
    nameCn: '北苑南家',
    nameEn: 'Bei Yuan Tea & Boba',
    tagline: 'Taiwanese Tea · Food · Boba',
    logo: '/beiyuan-logo.png',
    color: '#0D4A2E',
    accent: '#C9A84C',
    cardBg: '#FFFFFF',
  },
  {
    href: '/menu/ygf',
    nameCn: '杨国福麻辣烫',
    nameEn: 'Yang Guo Fu Malatang',
    tagline: 'Authentic Malatang · San Diego',
    logo: '/ygf-logo.png',
    color: '#C2410C',
    accent: '#EA580C',
    cardBg: '#FFFFFF',
  },
  {
    href: '/menu/tomo',
    nameCn: 'Tomo 意式冰淇淋',
    nameEn: 'Tomo Gelato',
    tagline: 'Artisan Italian Gelato',
    logo: null,
    emoji: '🍦',
    color: '#0E7490',
    accent: '#06B6D4',
    cardBg: '#FFFFFF',
  },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'linear-gradient(180deg, #FBF7F0 0%, #F4ECDF 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Soft warm glow accents */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-15%', width: 320, height: 320,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,168,76,0.18), transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-12%', right: '-15%', width: 340, height: 340,
        borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,74,46,0.10), transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 44, position: 'relative' }}>
        <div style={{ fontSize: 11, color: '#A89B82', letterSpacing: 5, fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>
          Digital Menu
        </div>
        <div style={{
          fontSize: 42, fontWeight: 900, letterSpacing: 8, textTransform: 'uppercase',
          color: '#1F2A24',
        }}>
          LUXTYLE
        </div>
        <div style={{ width: 44, height: 2, background: 'linear-gradient(90deg, transparent, #C9A84C, transparent)', margin: '16px auto 0' }} />
      </div>

      {/* Brand cards */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {brands.map(brand => (
          <Link key={brand.href} href={brand.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: brand.cardBg,
              borderRadius: 20,
              border: '1px solid rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${brand.accent}`,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 6px 20px rgba(120,100,60,0.12), 0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Logo */}
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: '#FBF7F0',
                border: `1.5px solid ${brand.accent}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
              }}>
                {brand.logo ? (
                  <img src={brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26 }}>{brand.emoji}</span>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 9.5, color: brand.accent, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 4 }}>
                  {brand.tagline}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: brand.color, lineHeight: 1.2 }}>
                  {brand.nameCn}
                </div>
                <div style={{ fontSize: 11, color: '#9A8F7C', fontWeight: 500, marginTop: 2 }}>
                  {brand.nameEn}
                </div>
              </div>

              {/* Arrow */}
              <div style={{
                fontSize: 18, color: '#fff', flexShrink: 0,
                width: 26, height: 26, borderRadius: '50%', background: brand.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>›</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 44, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#9A8F7C', fontWeight: 500 }}>7315 Clairemont Mesa Blvd, San Diego, CA</div>
        <div style={{ fontSize: 10, color: '#B8AC97', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </div>
  );
}
