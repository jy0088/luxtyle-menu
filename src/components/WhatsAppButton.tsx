'use client';

/**
 * WhatsApp 留言入口 — 顾客点击直接打开与店家的 WhatsApp 对话框。
 * 纯前端 wa.me 深链接,不经后端、不涉及订单。仅作客服咨询/留言用。
 */

const STORE_WHATSAPP = '18582688225'; // 北苑南家商业 WhatsApp 号

// 预填到对话框的开场白(顾客可自行修改后发送)
const PREFILL = '您好,我想咨询北苑南家 Bei Yuan Tea & Boba:';

export default function WhatsAppButton() {
  if (STORE_WHATSAPP.includes('X')) return null;

  const href = `https://wa.me/${STORE_WHATSAPP}?text=${encodeURIComponent(PREFILL)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Message us on WhatsApp"
      style={{
        position: 'fixed', right: 16,
        bottom: 'calc(138px + env(safe-area-inset-bottom))',
        zIndex: 59, height: 48, width: 48, borderRadius: '50%',
        background: '#25D366',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 4px 14px rgba(37,211,102,0.45)',
        textDecoration: 'none',
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
        <path d="M17.47 14.38c-.3-.15-1.74-.86-2-.96-.27-.1-.47-.15-.66.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.66-1.6-.9-2.18-.24-.57-.48-.5-.66-.5l-.56-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.01-1.04 2.47s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.69.63.71.22 1.36.2 1.87.12.57-.08 1.74-.71 1.99-1.4.24-.69.24-1.28.17-1.4-.07-.12-.27-.2-.56-.34M12 2C6.48 2 2 6.48 2 12c0 1.77.46 3.45 1.27 4.91L2 22l5.25-1.38A9.93 9.93 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2"/>
      </svg>
    </a>
  );
}
