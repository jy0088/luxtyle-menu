import Link from 'next/link';
import { VENDORS } from '@/data/types';

// L$ staff home. Entries by channel: A vendor delivery · C local runs · D warehouse (inbound / pickup) · weekly stats.
const card = (bg: string) => ({ display: 'block', background: bg, color: '#fff', padding: '14px 18px', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: 18 } as const);
const h2 = { fontSize: 13, letterSpacing: '.12em', color: '#6f6a5e', margin: '26px 0 8px', textTransform: 'uppercase' as const, fontWeight: 500 };
const sub = { display: 'block', fontSize: 13, fontWeight: 400, opacity: .85, marginTop: 2 };

export default function StaffHome() {
  return (
    <main style={{ maxWidth: 560, margin: '0 auto', padding: '28px 20px 48px', fontSize: 17, lineHeight: 1.5, color: '#1d1b17' }}>
      <h1 style={{ fontSize: 26, margin: '0 0 2px' }}>L$ 员工 / Luxtyle Staff</h1>
      <p style={{ color: '#6f6a5e', margin: 0 }}>叫货 · 采买 · 仓库 · 统计 — Ordering · Purchasing · Warehouse · Stats</p>

      <h2 style={h2}>① 供应商直配到店 / Vendor delivery</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        {VENDORS.filter(v => v.channel === 'A').map(v => (
          <Link key={v.id} href={`/staff/order/${v.id}`} style={card('#b4461c')}>{v.shortName} 叫货 / {v.name}<span style={sub}>{v.terms}</span></Link>
        ))}
      </div>

      <h2 style={h2}>② 周边采买 / Local runs</h2>
      <Link href="/staff/shopping" style={card('#8a6d1f')}>采买清单 / Shopping list<span style={sub}>Costco · Restaurant Depot · 超市 — 出门前勾清单，回来填小票 / tick before you go, log the receipt after</span></Link>

      <h2 style={h2}>③ 仓库 / Warehouse — 9863 Pacific Heights</h2>
      <div style={{ display: 'grid', gap: 10 }}>
        <Link href="/staff/warehouse" style={card('#1f5f8b')}>进货 / Inbound（Jason）<span style={sub}>60 天盘点 · 红日 / JFC / 总仓 / 杰克兄弟 / 壹禾 补货 — count &amp; replenish</span></Link>
        <Link href="/staff/pickup" style={card('#2e7d4f')}>提货 / Pickup（门店）<span style={sub}>门店向仓库领料，生成图发 Jason — store requisition</span></Link>
      </div>

      <h2 style={h2}>④ 周统计 / Weekly stats</h2>
      <Link href="/staff/stats" style={card('#1d1b17')}>每店周统计 / Per-store weekly summary<span style={sub}>叫货 · 采买 · 领料 · 收货差异 · 实付 vs 参考价</span></Link>

      <h2 style={h2}>安装到手机桌面 / Add to Home Screen</h2>
      <ol style={{ paddingLeft: 22, margin: 0, fontSize: 15, listStyle: 'decimal' }}>
        <li>微信里打开的链接不能安装 — 点右上角 ··· → <b>在 Safari / 浏览器中打开</b><br /><span style={{ color: '#6f6a5e' }}>Links opened inside WeChat can&apos;t be installed — tap ··· → Open in Safari / Browser</span></li>
        <li>iPhone：Safari 底部 <b>分享</b> → <b>添加到主屏幕</b><br /><span style={{ color: '#6f6a5e' }}>iPhone: Share → Add to Home Screen</span></li>
        <li>Android：Chrome 右上角 ⋮ → <b>添加到主屏幕 / 安装应用</b><br /><span style={{ color: '#6f6a5e' }}>Android: ⋮ → Add to Home screen / Install app</span></li>
        <li>桌面出现 <b>「L$」</b> 图标，以后从图标进入本页。<br /><span style={{ color: '#6f6a5e' }}>An &ldquo;L$&rdquo; icon appears; open this page from it.</span></li>
      </ol>
      <p style={{ color: '#6f6a5e', fontSize: 14, marginTop: 16 }}>店内 PIN 向店长索取 / Ask your manager for the store PIN.</p>
    </main>
  );
}
