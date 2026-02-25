'use client';

import Link from 'next/link';
import { useState } from 'react';

const IG_HANDLE = 'jy00884973';
const IG_URL = `https://www.instagram.com/${IG_HANDLE}/`;

const HASHTAGS = ['#YGFSD', '#YGFBowlCode', '#MalatangSD', '#ConvoyEats', '#SanDiegoFood'];
const ALL_TAGS = `@${IG_HANDLE} ${HASHTAGS.join(' ')}`;

export default function YGFSharePage() {
  const [copied, setCopied] = useState<string | null>(null);

  async function copyTag(tag: string) {
    await navigator.clipboard.writeText(tag);
    setCopied(tag);
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyAllAndOpen() {
    await navigator.clipboard.writeText(ALL_TAGS);
    setCopied('all');
    setTimeout(() => {
      window.open(IG_URL, '_blank');
    }, 800);
  }

  return (
    <main style={styles.page}>
      <Link href="/menu/ygf" style={styles.back}>← Back to Menu</Link>
      <div style={styles.card}>
        <div style={styles.heroEmoji}>📸</div>
        <h1 style={styles.heading}>Show Off Your Bowl</h1>
        <p style={styles.sub}>Post your YGF creation and tag us — we love seeing what you build.</p>

        {/* Tag us */}
        <div style={styles.tagBox} onClick={() => copyTag(`@${IG_HANDLE}`)}>
          <span style={styles.tagLabel}>TAG US</span>
          <span style={styles.tagValue}>@{IG_HANDLE}</span>
          <span style={styles.tagCopy}>{copied === `@${IG_HANDLE}` ? '✅ Copied!' : 'tap to copy'}</span>
        </div>

        {/* Hashtags — tap any to copy individually */}
        <div style={styles.hashSection}>
          <span style={styles.tagLabel}>HASHTAGS · tap any to copy</span>
          <div style={styles.hashGrid}>
            {HASHTAGS.map((tag) => (
              <div key={tag}
                style={{ ...styles.hashChip, background: copied === tag ? '#fce4ec' : '#fafafa', borderColor: copied === tag ? '#E1306C' : '#eee' }}
                onClick={() => copyTag(tag)}>
                <span style={styles.hashText}>{tag}</span>
                <span style={styles.hashCopy}>{copied === tag ? '✅' : 'copy'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main CTA: copy all + open IG in one tap */}
        <button onClick={copyAllAndOpen} style={styles.btn}>
          {copied === 'all'
            ? '✅ Copied! Opening Instagram...'
            : '📋 Copy All Tags & Open Instagram'}
        </button>

        <p style={styles.note}>
          Tap the button above → paste into your Instagram caption → done!{'\n'}
          We repost our favorite bowls 🔥
        </p>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: '#fff5f8', padding: '24px 16px 40px', fontFamily: "'Segoe UI', sans-serif" },
  back: { display: 'inline-block', marginBottom: '24px', color: '#555', textDecoration: 'none', fontSize: '14px' },
  card: { maxWidth: '480px', margin: '0 auto', background: '#fff', borderRadius: '20px', padding: '32px 24px', boxShadow: '0 4px 24px rgba(225,48,108,0.08)', textAlign: 'center' },
  heroEmoji: { fontSize: '52px', marginBottom: '12px' },
  heading: { fontSize: '24px', fontWeight: 700, margin: '0 0 10px', color: '#1a1a1a' },
  sub: { fontSize: '15px', color: '#555', margin: '0 0 20px', lineHeight: 1.6 },
  tagBox: { background: '#fafafa', borderRadius: '14px', padding: '14px 16px', marginBottom: '16px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px', border: '2px solid #eee' },
  tagLabel: { fontSize: '10px', color: '#bbb', textTransform: 'uppercase' as const, letterSpacing: '0.1em' },
  tagValue: { fontSize: '18px', fontWeight: 700, color: '#E1306C' },
  tagCopy: { fontSize: '11px', color: '#ccc' },
  hashSection: { marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '10px' },
  hashGrid: { display: 'flex', flexWrap: 'wrap' as const, gap: '8px', justifyContent: 'center' },
  hashChip: { border: '2px solid #eee', borderRadius: '100px', padding: '8px 14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  hashText: { fontSize: '13px', fontWeight: 600, color: '#333' },
  hashCopy: { fontSize: '11px', color: '#ccc' },
  btn: { display: 'block', width: '100%', background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', color: '#fff', borderRadius: '14px', padding: '16px', fontSize: '15px', fontWeight: 700, textDecoration: 'none', marginBottom: '16px', border: 'none', cursor: 'pointer', boxSizing: 'border-box' as const },
  note: { fontSize: '12px', color: '#aaa', lineHeight: 1.6, whiteSpace: 'pre-line' as const },
};
