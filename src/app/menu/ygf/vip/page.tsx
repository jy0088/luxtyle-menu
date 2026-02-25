'use client';

import Link from 'next/link';

// ⚠️  Replace with your WhatsApp Business number (digits only, no +)
const WA_NUMBER = '18582688225';
const WA_VIP_URL = `https://wa.me/${WA_NUMBER}?text=Hi%20YGF%21%20I%27d%20like%20to%20join%20the%20VIP%20list.`;

export default function YGFVIPPage() {
  return (
    <main style={styles.page}>
      <Link href="/menu/ygf" style={styles.back}>← Back to Menu</Link>

      <div style={styles.card}>
        {/* Header */}
        <div style={styles.badge}>YGF VIP</div>
        <h1 style={styles.heading}>Be the First to Know</h1>
        <p style={styles.sub}>
          Join our WhatsApp VIP list for early access to new dishes,
          limited-time offers, and member-only events.
        </p>

        {/* Perks */}
        <div style={styles.perks}>
          {[
            ['🍜', 'New dish announcements'],
            ['🎉', 'Member events & tastings'],
            ['🔥', 'Limited-time seasonal specials'],
            ['📢', 'Store updates & hours changes'],
          ].map(([icon, text]) => (
            <div key={text} style={styles.perkRow}>
              <span style={styles.perkIcon}>{icon}</span>
              <span style={styles.perkText}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <a
          href={WA_VIP_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={styles.btn}
        >
          💬 Join on WhatsApp
        </a>

        <p style={styles.note}>
          No spam. No purchase required. Unsubscribe anytime by messaging "STOP".
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: '#fff8f8',
    padding: '24px 16px 40px',
    fontFamily: "'Segoe UI', sans-serif",
  },
  back: {
    display: 'inline-block',
    marginBottom: '24px',
    color: '#555',
    textDecoration: 'none',
    fontSize: '14px',
  },
  card: {
    maxWidth: '480px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '20px',
    padding: '32px 24px',
    boxShadow: '0 4px 24px rgba(200,16,46,0.08)',
    textAlign: 'center',
  },
  badge: {
    display: 'inline-block',
    background: '#C8102E',
    color: '#fff',
    fontSize: '12px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    padding: '4px 14px',
    borderRadius: '100px',
    marginBottom: '16px',
  },
  heading: {
    fontSize: '24px',
    fontWeight: 700,
    margin: '0 0 10px',
    color: '#1a1a1a',
  },
  sub: {
    fontSize: '15px',
    color: '#555',
    margin: '0 0 24px',
    lineHeight: 1.6,
  },
  perks: {
    background: '#fafafa',
    borderRadius: '14px',
    padding: '16px',
    marginBottom: '24px',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  perkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  perkIcon: { fontSize: '20px' },
  perkText: { fontSize: '14px', color: '#333' },
  btn: {
    display: 'block',
    background: '#25D366',
    color: '#fff',
    borderRadius: '14px',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 700,
    textDecoration: 'none',
    marginBottom: '16px',
  },
  note: {
    fontSize: '12px',
    color: '#aaa',
    lineHeight: 1.5,
  },
};
