'use client';

import Link from 'next/link';

const GOOGLE_PLACE_ID = 'ChIJkdiUucL_24AR6wPCvJavwWU';

function openGoogleReview() {
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isAndroid = /Android/i.test(navigator.userAgent);

  if (isIOS || isAndroid) {
    window.location.href = `https://www.google.com/maps/place/?q=place_id:${GOOGLE_PLACE_ID}`;
  } else {
    window.open(
      `https://search.google.com/local/writereview?placeid=${GOOGLE_PLACE_ID}`,
      '_blank'
    );
  }
}

const WA_NUMBER = '18582688225';
const WA_FEEDBACK_URL = `https://wa.me/${WA_NUMBER}?text=Hi%20YGF%2C%20I%27d%20like%20to%20share%20some%20feedback.`;

export default function YGFReviewPage() {
  return (
    <main style={styles.page}>
      <Link href="/menu/ygf" style={styles.back}>← Back to Menu</Link>
      <div style={styles.card}>
        <h1 style={styles.heading}>Your Voice Matters</h1>
        <p style={styles.sub}>We appreciate every bit of feedback. Choose what feels right for you.</p>

        <div style={styles.grid}>
          <button onClick={openGoogleReview}
            style={{ ...styles.btn, background: '#1a1a1a', color: '#fff', border: 'none', cursor: 'pointer' }}>
            <span style={styles.icon}>⭐</span>
            <span style={styles.btnLabel}>Write a Review on Google</span>
            <span style={styles.btnSub}>在 Google Maps 打开 → 点 Write a review</span>
          </button>
          <a href={WA_FEEDBACK_URL} target="_blank" rel="noopener noreferrer"
            style={{ ...styles.btn, background: '#fff', color: '#1a1a1a', border: '2px solid #1a1a1a' }}>
            <span style={styles.icon}>💬</span>
            <span style={styles.btnLabel}>Send Feedback to Us</span>
            <span style={styles.btnSub}>Message us directly on WhatsApp</span>
          </a>
        </div>

        <div style={styles.hint}>
          <div style={styles.hintStep}><span style={styles.hintNum}>1</span> Tap "Write a Review on Google"</div>
          <div style={styles.hintStep}><span style={styles.hintNum}>2</span> Google Maps opens our store page</div>
          <div style={styles.hintStep}><span style={styles.hintNum}>3</span> Tap "Write a review" button in the app</div>
        </div>

        <p style={styles.note}>Both options are equally valued. We read every message.</p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#f9f9f9', padding: '24px 16px 40px', fontFamily: "'Segoe UI', sans-serif" },
  back: { display: 'inline-block', marginBottom: '24px', color: '#555', textDecoration: 'none', fontSize: '14px' },
  card: { maxWidth: '480px', margin: '0 auto', background: '#fff', borderRadius: '20px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(0,0,0,0.07)', textAlign: 'center' },
  heading: { fontSize: '24px', fontWeight: 700, margin: '0 0 10px', color: '#1a1a1a' },
  sub: { fontSize: '15px', color: '#555', margin: '0 0 28px', lineHeight: 1.5 },
  grid: { display: 'flex', flexDirection: 'column', gap: '14px' },
  btn: { borderRadius: '14px', padding: '18px 20px', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', width: '100%', boxSizing: 'border-box' },
  icon: { fontSize: '28px' },
  btnLabel: { fontSize: '16px', fontWeight: 700 },
  btnSub: { fontSize: '13px', opacity: 0.75 },
  hint: { marginTop: '20px', background: '#f5f5f5', borderRadius: '14px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left' },
  hintStep: { display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: '#444' },
  hintNum: { background: '#1a1a1a', color: '#fff', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700, flexShrink: 0 },
  note: { marginTop: '20px', fontSize: '12px', color: '#aaa' },
};
