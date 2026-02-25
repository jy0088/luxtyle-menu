import Link from 'next/link';

const brands = [
  {
    href: '/menu/beiyuan',
    nameCn: '北苑南家',
    nameEn: 'Bei Yuan Tea & Boba',
    tagline: 'Taiwanese Tea · Food · Boba',
    logo: '/beiyuan-logo.png',
    color: '#C9A84C',
    glow: 'rgba(201,168,76,0.35)',
    border: 'rgba(201,168,76,0.5)',
    bg: 'rgba(13,74,46,0.6)',
  },
  {
    href: '/menu/ygf',
    nameCn: '杨国福麻辣烫',
    nameEn: 'Yang Guo Fu Malatang',
    tagline: 'Authentic Malatang · San Diego #1',
    logo: '/ygf-logo.png',
    color: '#FF7A30',
    glow: 'rgba(217,95,26,0.4)',
    border: 'rgba(217,95,26,0.6)',
    bg: 'rgba(180,60,10,0.5)',
  },
  {
    href: '/menu/tomo',
    nameCn: 'Tomo 意式冰淇淋',
    nameEn: 'Tomo Gelato',
    tagline: 'Artisan Italian Gelato',
    logo: null,
    emoji: '🍦',
    color: '#67E8F9',
    glow: 'rgba(14,116,144,0.4)',
    border: 'rgba(103,232,249,0.5)',
    bg: 'rgba(8,90,120,0.5)',
  },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#0A0A0A',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle background grid */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.03,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        pointerEvents: 'none',
      }} />

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
        <div style={{ fontSize: 11, color: '#555', letterSpacing: 5, fontWeight: 600, textTransform: 'uppercase', marginBottom: 12 }}>
          Digital Menu
        </div>
        <div style={{
          fontSize: 42, fontWeight: 900, letterSpacing: 8, textTransform: 'uppercase',
          background: 'linear-gradient(135deg, #fff 0%, #aaa 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          LUXTYLE
        </div>
        <div style={{ width: 40, height: 1, background: 'linear-gradient(90deg, transparent, #555, transparent)', margin: '16px auto 0' }} />
      </div>

      {/* Brand cards */}
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {brands.map(brand => (
          <Link key={brand.href} href={brand.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: brand.bg,
              borderRadius: 20,
              border: `1px solid ${brand.border}`,
              padding: '18px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: `0 0 30px ${brand.glow}, 0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`,
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Inner glow top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: 1,
                background: `linear-gradient(90deg, transparent, ${brand.color}55, transparent)`,
              }} />

              {/* Logo */}
              <div style={{
                width: 54, height: 54, borderRadius: '50%',
                background: 'rgba(0,0,0,0.3)',
                border: `1.5px solid ${brand.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, overflow: 'hidden',
                boxShadow: `0 0 12px ${brand.glow}`,
              }}>
                {brand.logo ? (
                  <img src={brand.logo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 26 }}>{brand.emoji}</span>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: brand.color, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', opacity: 0.9, marginBottom: 4 }}>
                  {brand.tagline}
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1.2 }}>
                  {brand.nameCn}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 18, color: brand.color, flexShrink: 0, opacity: 0.8 }}>›</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 48, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#333' }}>7315 Clairemont Mesa Blvd, San Diego, CA</div>
        <div style={{ fontSize: 10, color: '#2a2a2a', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </div>
  );
}
