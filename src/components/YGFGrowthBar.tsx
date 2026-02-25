'use client';

import Link from 'next/link';

export default function YGFGrowthBar() {
  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="h-16" />

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(8px)',
          borderTop: '1px solid #e5e7eb',
          padding: '10px 12px',
          display: 'flex',
          gap: '8px',
        }}
      >
        <Link
          href="/menu/ygf/review"
          style={btnStyle('#1a1a1a', '#fff')}
        >
          ⭐ Leave a Review
        </Link>

        <Link
          href="/menu/ygf/vip"
          style={btnStyle('#C8102E', '#fff')}
        >
          💬 Join VIP Updates
        </Link>

        <Link
          href="/menu/ygf/share"
          style={btnStyle('#E1306C', '#fff')}
        >
          📸 Share Your Bowl
        </Link>
      </div>
    </>
  );
}

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    flex: 1,
    background: bg,
    color,
    borderRadius: '10px',
    padding: '10px 6px',
    fontSize: '12px',
    fontWeight: 600,
    textAlign: 'center',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    letterSpacing: '0.01em',
    lineHeight: 1.3,
  };
}
