import Link from 'next/link';

type Brand = {
  href: string;
  nameCn: string;
  nameEn: string;
  /** 门店 —— 两家北苑靠这行区分,视觉上必须最先被扫到 */
  location: string;
  logo: string | null;
  emoji?: string;
  color: string;
  accent: string;
};

const brands: Brand[] = [
  {
    href: '/menu/beiyuan?store=clairemont',
    nameCn: '北苑南家',
    nameEn: 'Bei Yuan Tea & Boba',
    location: 'Clairemont Mesa',
    logo: '/beiyuan-logo.png',
    color: '#0D4A2E',
    accent: '#C9A84C',
  },
  {
    href: '/menu/beiyuan?store=miramesa',
    nameCn: '北苑南家',
    nameEn: 'Bei Yuan Tea & Boba',
    location: 'Mira Mesa',
    logo: '/beiyuan-logo.png',
    color: '#0D4A2E',
    accent: '#C9A84C',
  },
  {
    href: '/menu/ygf',
    nameCn: '杨国福麻辣烫',
    nameEn: 'Yang Guo Fu Malatang',
    location: 'Clairemont Mesa',
    logo: '/ygf-logo.png',
    color: '#C2410C',
    accent: '#EA580C',
  },
  {
    href: '/menu/tomo',
    nameCn: 'Tomo 意式冰淇淋',
    nameEn: 'Tomo Gelato',
    location: 'Clairemont Mesa',
    logo: null,
    emoji: '🍦',
    color: '#0E7490',
    accent: '#06B6D4',
  },
];

const stores = [
  { name: 'Clairemont Mesa', addr: '7315 Clairemont Mesa Blvd, San Diego, CA' },
  { name: 'Mira Mesa', addr: '9003 Mira Mesa Blvd, San Diego, CA' },
];

function PinIcon({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
        fill={color}
        opacity="0.18"
      />
      <path
        d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.6" fill={color} />
    </svg>
  );
}

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
      padding: '36px 24px',
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
      <div style={{ textAlign: 'center', marginBottom: 34, position: 'relative' }}>
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
      <div style={{ width: '100%', maxWidth: 400, display: 'flex', flexDirection: 'column', gap: 13 }}>
        {brands.map(brand => (
          <Link key={brand.href} href={brand.href} style={{ textDecoration: 'none' }}>
            <div style={{
              background: '#FFFFFF',
              borderRadius: 20,
              border: '1px solid rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${brand.accent}`,
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 15,
              boxShadow: '0 6px 20px rgba(120,100,60,0.12), 0 1px 3px rgba(0,0,0,0.05)',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Logo */}
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
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
                <div style={{ fontSize: 19, fontWeight: 900, color: brand.color, lineHeight: 1.2 }}>
                  {brand.nameCn}
                </div>

                {/* 门店 —— 两家北苑的唯一区分点,加重处理 */}
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  marginTop: 5,
                  background: `${brand.accent}1F`,
                  borderRadius: 7,
                  padding: '3px 8px 3px 6px',
                }}>
                  <PinIcon color={brand.accent} />
                  <span style={{ fontSize: 13.5, fontWeight: 800, color: brand.color, letterSpacing: 0.1 }}>
                    {brand.location}
                  </span>
                </div>

                <div style={{ fontSize: 11, color: '#9A8F7C', fontWeight: 500, marginTop: 4 }}>
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
      <div style={{ marginTop: 34, textAlign: 'center' }}>
        {stores.map(s => (
          <div key={s.name} style={{ fontSize: 11, color: '#9A8F7C', fontWeight: 500, marginBottom: 3 }}>
            <span style={{ fontWeight: 800, color: '#7E735F' }}>{s.name}</span>
            {'  ·  '}
            {s.addr}
          </div>
        ))}
        <div style={{ fontSize: 10, color: '#B8AC97', marginTop: 7 }}>© 2026 Luxtyle Creations Inc.</div>
      </div>
    </div>
  );
}
