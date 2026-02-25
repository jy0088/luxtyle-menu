import Link from 'next/link';

const brands = [
  {
    href: '/menu/beiyuan',
    nameEn: 'Bei Yuan Tea & Boba',
    nameCn: '北苑南家',
    desc: '传统台式餐点与奶茶',
    descEn: 'Taiwanese Tea · Food · Boba',
    bg: '#0D4A2E',
    accent: '#C9A84C',
    accentLight: '#F0D98A',
    border: '#1a6640',
    logo: '/beiyuan-logo.png',
    emoji: null,
  },
  {
    href: '/menu/ygf',
    nameEn: 'Yang Guo Fu Malatang',
    nameCn: '杨国福麻辣烫',
    desc: '真骨汤底麻辣烫',
    descEn: 'YGF Malatang · San Diego #1',
    bg: '#D95F1A',
    accent: '#FFFFFF',
    accentLight: 'rgba(255,255,255,0.85)',
    border: '#c05010',
    logo: '/ygf-logo.png',
    emoji: null,
  },
  {
    href: '/menu/tomo',
    nameEn: 'Tomo Gelato',
    nameCn: 'Tomo 意式冰淇淋',
    desc: '手工意式冰淇淋',
    descEn: 'Artisan Italian Gelato',
    bg: '#0E7490',
    accent: '#FFFFFF',
    accentLight: 'rgba(255,255,255,0.85)',
    border: '#0a5f78',
    logo: null,
    emoji: '🍦',
  },
];

export default function HomePage() {
  return (
    <div style={{
      minHeight: '100dvh',
      background: '#F5F2EC',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 20px',
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <div style={{ fontSize: 11, color: '#aaa', letterSpacing: 4, fontWeight: 600, textTransform: 'uppercase', marginBottom: 8 }}>
          Digital Menu
        </div>
        <div style={{ fontSize: 38, fontWeight: 900, color: '#1a1a1a', letterSpacing: 6, textTransform: 'uppercase' }}>
          LUXTYLE
        </div>
        <div style={{ width: 48, height: 2, background: '#ccc', margin: '12px auto 0' }} />
      </div>

      {/* Brand cards */}
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 14 }}>
        {brands.map(brand => (
          <Link key={brand.href} href={brand.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: brand.bg,
              borderRadius: 20,
              border: `1px solid ${brand.border}`,
              padding: '20px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: `0 4px 20px ${brand.bg}44`,
              cursor: 'pointer',
              transition: 'transform 0.1s',
            }}>
              {/* Logo / Emoji */}
              <div style={{
                width: 58,
                height: 58,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                border: `2px solid ${brand.accent}44`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                overflow: 'hidden',
              }}>
                {brand.logo ? (
                  <img src={brand.logo} alt={brand.nameCn} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 28 }}>{brand.emoji}</span>
                )}
              </div>

              {/* Text */}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: brand.accentLight, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 3 }}>
                  {brand.descEn}
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: brand.accent, lineHeight: 1.2 }}>
                  {brand.nameCn}
                </div>
                <div style={{ fontSize: 12, color: brand.accentLight, marginTop: 3 }}>
                  {brand.desc}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ fontSize: 20, color: brand.accentLight, flexShrink: 0 }}>›</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer */}
      <div style={{ marginTop: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 11, color: '#bbb' }}>7315 Clairemont Mesa Blvd, San Diego, CA</div>
        <div style={{ fontSize: 10, color: '#ccc', marginTop: 4 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </div>
  );
}
