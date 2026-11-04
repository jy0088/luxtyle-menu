import Link from 'next/link';

// Install landing page: WeChat's in-app browser cannot "Add to Home Screen",
// so staff are told to open this link in Safari / Chrome first.
export default function StaffHome() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '32px 20px', fontSize: 17, lineHeight: 1.6 }}>
      <h1 style={{ fontSize: 24, margin: '0 0 6px' }}>Luxtyle 员工工具 / Staff Tools</h1>
      <p style={{ color: '#6f6a5e', margin: '0 0 24px' }}>7315 Clairemont Mesa Blvd</p>

      <Link
        href="/staff/order"
        style={{ display: 'block', background: '#b4461c', color: '#fff', padding: '16px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 19 }}
      >
        SJ 叫货单 / SJ Order Sheet →
      </Link>
      <Link
        href="/staff/warehouse"
        style={{ display: 'block', background: '#1f5f8b', color: '#fff', padding: '16px 20px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 19, marginTop: 12 }}
      >
        仓库：盘点 · 领料 · 补货 / Warehouse →
      </Link>

      <h2 style={{ fontSize: 17, margin: '32px 0 8px' }}>安装到手机桌面 / Add to Home Screen</h2>
      <ol style={{ paddingLeft: 22, margin: 0 }}>
        <li>微信里打开的链接不能安装 — 点右上角 ··· → <b>在 Safari / 浏览器中打开</b><br /><span style={{ color: '#6f6a5e' }}>Links opened inside WeChat can&apos;t be installed — tap ··· → Open in Safari / Browser</span></li>
        <li>iPhone：Safari 底部 <b>分享</b> → <b>添加到主屏幕</b><br /><span style={{ color: '#6f6a5e' }}>iPhone: Share → Add to Home Screen</span></li>
        <li>Android：Chrome 右上角 ⋮ → <b>添加到主屏幕 / 安装应用</b><br /><span style={{ color: '#6f6a5e' }}>Android: ⋮ → Add to Home screen / Install app</span></li>
        <li>桌面会出现 <b>「SJ 叫货」</b> 图标，以后从图标进入。<br /><span style={{ color: '#6f6a5e' }}>An &ldquo;SJ 叫货&rdquo; icon appears; use it from now on.</span></li>
      </ol>
    </main>
  );
}
