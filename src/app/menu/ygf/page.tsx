"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { BROTHS, SAUCE_CATEGORIES, ALLERGEN_COLOR, PRICING, getItem, type Allergen } from "./menuData";
import AppShell from "@/components/shell/AppShell";
import PsstWidget from "@/components/ygf/PsstWidget";
import {
  DRINK_PICKS, SNACK_PICKS, NEW_ARRIVALS, CAMPAIGN, MEMBER_PERKS,
  SPOTLIGHTS, TIER_META, SAUCE_RECIPES, SAUCE_NOTES, SECRET_MIX,
  ENTRY_CARDS, resolvePick, type SpotlightTier, type EntryId,
} from "./picksData";

// 杨国福 WhatsApp 频道
const YGF_CHANNEL = "https://whatsapp.com/channel/0029VbDtDTY9RZAO8pD1k33z";

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:       "#FDFAF5",       // warm white
  bgCard:   "#FFFFFF",
  bgSoft:   "#FFF4E6",
  gold:     "#C8912A",       // sand gold
  goldLight:"#F5D98A",
  goldPale: "#FFF1CC",
  red:      "#B91C1C",       // deep crimson
  redLight: "#FEE2E2",
  ink:      "#1C1410",       // near-black warm
  inkMid:   "#6B5B4E",
  inkLight: "#8A7B66",
  border:   "#E8D9C4",
  borderStrong: "#C8A878",
};

const YGF_CSS = `
/* 横向手风琴 —— 选中的汤底撑开,其余收成彩条 */
.ygf-acc{ display:flex; gap:7px; height:248px }
.ygf-bar{
  position:relative; overflow:hidden; cursor:pointer; padding:0;
  border:2px solid rgba(0,0,0,.06); border-radius:14px;
  transition: flex-grow .3s cubic-bezier(.22,1,.36,1),
              flex-basis .3s cubic-bezier(.22,1,.36,1),
              box-shadow .25s ease, border-color .25s ease;
}
.ygf-bar[data-on="0"]{ flex:0 0 50px; box-shadow:none }
.ygf-bar[data-on="1"]{ flex:1 1 auto; box-shadow:0 4px 16px rgba(0,0,0,.18); border-color:rgba(0,0,0,.14) }
.ygf-bar-vert{
  position:absolute; inset:0; display:grid; place-items:center;
  writing-mode:vertical-rl; text-orientation:mixed;
  font-size:15px; font-weight:800; color:#fff; letter-spacing:3px;
  text-shadow:0 1px 4px rgba(0,0,0,.45);
  transition:opacity .2s ease;
}
.ygf-bar[data-on="1"] .ygf-bar-vert{ opacity:0; pointer-events:none }
.ygf-bar-wide{
  position:absolute; left:0; right:0; bottom:0; padding:13px 14px;
  background:linear-gradient(to top, rgba(0,0,0,.72), transparent);
  text-align:left; opacity:0; transition:opacity .25s ease .08s;
}
.ygf-bar[data-on="1"] .ygf-bar-wide{ opacity:1 }

/* ══ 一级入口:环形牌桌 ══ */
.ring-wrap{
  min-height:calc(100dvh - 210px);
  display:flex; flex-direction:column; align-items:center; justify-content:center;
  padding:26px 0 30px;
  background:
    radial-gradient(120% 70% at 50% 8%, rgba(200,145,42,.16), transparent 60%),
    linear-gradient(170deg,#1B0F08,#0C0705 62%,#140A06);
}
.ring-eyebrow{
  font-size:9.5px; font-weight:800; letter-spacing:3.5px;
  color:rgba(245,217,138,.66); text-align:center;
}
.ring-title{
  font-size:26px; font-weight:900; color:#fff; margin-top:9px;
  letter-spacing:-.4px; text-align:center;
}
.ring-sub{
  font-size:11.5px; color:rgba(255,255,255,.44); margin-top:5px;
  letter-spacing:.8px; text-align:center;
}
.ring-stage{
  position:relative; width:100%; height:328px; margin-top:16px;
  touch-action:pan-y; overflow:hidden;
  -webkit-tap-highlight-color:transparent;
}
/* 扑克牌:5:7,金边,满幅图 + 底部渐变压字 */
.ring-card{
  position:absolute; top:50%; left:50%;
  width:186px; height:260px; margin:0;
  border-radius:17px; overflow:hidden; cursor:pointer;
  border:2px solid; background:#140A06;
  box-shadow:0 14px 34px rgba(0,0,0,.5);
  will-change:transform,opacity,filter;
  transform:translate(-50%,-50%);
}
.ring-shot{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; display:block;
}
.ring-card::after{
  content:""; position:absolute; inset:0;
  background:linear-gradient(to top, rgba(8,4,2,.95) 34%, rgba(8,4,2,.35) 62%, transparent 86%);
}
.ring-mark{
  position:absolute; z-index:2; font-size:15px; line-height:1;
  text-shadow:0 1px 5px rgba(0,0,0,.7);
}
.ring-mark-tl{ top:10px; left:11px }
.ring-mark-br{ bottom:10px; right:11px; transform:rotate(180deg) }
.ring-face{
  position:absolute; left:0; right:0; bottom:0; z-index:3;
  padding:0 13px 14px; text-align:left;
}
.ring-name{ font-size:17px; font-weight:900; color:#fff; line-height:1.15; letter-spacing:-.3px }
.ring-name-cn{ font-size:10.5px; color:rgba(245,217,138,.9); margin-top:3px; font-weight:700 }
.ring-hook{ font-size:12px; color:#fff; margin-top:8px; line-height:1.4; font-weight:700 }
.ring-hook-en{ font-size:9.5px; color:rgba(255,255,255,.58); margin-top:2px; line-height:1.35 }
.ring-go{
  display:inline-block; margin-top:10px; border-radius:8px;
  padding:5px 11px; font-size:10.5px; font-weight:900; color:#fff;
}
.ring-hint{
  margin-top:18px; font-size:11px; color:rgba(255,255,255,.4);
  letter-spacing:.5px; text-align:center;
}
/* 减弱动态:不转,竖排铺开 */
.ring-stage.is-static{
  height:auto; display:flex; flex-direction:column; align-items:center; gap:14px; padding:4px 16px;
}
.ring-stage.is-static .ring-card{
  position:relative; top:auto; left:auto;
  transform:none!important; opacity:1!important; filter:none!important;
  width:100%; max-width:300px; height:190px;
}

/* ── Ma-Fans:当季活动 ── */
.mf-season{ display:flex; align-items:center; gap:11px }
.mf-season-line{ flex:1; height:1px; background:linear-gradient(90deg,transparent,#C8912A,transparent) }
.mf-season-en{
  font-size:12px; font-weight:900; color:#C8912A; letter-spacing:3.5px; white-space:nowrap;
}
.mf-season-cn{
  text-align:center; font-size:23px; font-weight:900; color:#1C1410;
  margin-top:7px; letter-spacing:1px;
}
.mf-offer{
  display:flex; gap:0; margin-top:15px; border-radius:20px; overflow:hidden;
  background:linear-gradient(135deg,#7B1113,#4A0A0B);
  border:2px solid #C8912A; box-shadow:0 8px 26px rgba(74,10,11,.28);
}
.mf-offer-shot{
  flex:0 0 40%; position:relative; display:grid; place-items:center;
  background:#5E0D0E; overflow:hidden;
}
.mf-offer-shot img{ width:100%; height:100%; object-fit:cover; display:block }
.mf-offer-info{ flex:1; padding:15px 15px 16px; display:flex; flex-direction:column; min-width:0 }
.mf-excl{
  display:inline-block; align-self:flex-start;
  font-size:9.5px; font-weight:900; letter-spacing:.8px;
  color:#4A0A0B; background:linear-gradient(160deg,#FFE9AE,#F2C14E);
  border-radius:6px; padding:3px 8px; white-space:nowrap;
}
.mf-offer-name{ display:block; font-size:19px; font-weight:900; color:#fff; margin-top:9px; line-height:1.15 }
.mf-offer-cn{ display:block; font-size:13px; color:rgba(255,255,255,.7); margin-top:2px }
.mf-offer-price{ display:flex; align-items:baseline; gap:8px; margin-top:auto; padding-top:12px }
.mf-offer-price s{ font-size:13px; color:rgba(255,255,255,.45); font-weight:700 }
.mf-offer-price b{ font-size:34px; font-weight:900; color:#F2C14E; letter-spacing:-1px; line-height:1 }
.mf-rules{
  display:flex; flex-direction:column; gap:7px;
  margin-top:12px; padding:13px 15px;
  background:#FFF1CC; border:1.5px solid #F5D98A; border-radius:14px;
}
.mf-rule{ display:flex; align-items:flex-start; gap:9px }
.mf-rule-dot{ flex-shrink:0; width:6px; height:6px; margin-top:6px; border-radius:50%; background:#C8912A }
.mf-rule b{ display:block; font-size:12.5px; font-weight:800; color:#1C1410 }
.mf-rule i{ display:block; font-style:normal; font-size:11px; color:#8A7B66; margin-top:1px }

/* ── Ma-Fans:入会 ── */
.mf-join{
  border-radius:20px; overflow:hidden;
  background:linear-gradient(160deg,#7B1113,#4A0A0B);
  border:2px solid #C8912A; padding:18px 17px 16px;
  box-shadow:0 8px 26px rgba(74,10,11,.3);
}
.mf-join-top{ display:flex; align-items:center; gap:12px }
.mf-join-emoji{
  flex-shrink:0; width:44px; height:44px; border-radius:13px;
  display:grid; place-items:center; font-size:23px;
  background:linear-gradient(160deg,#FFF1CC,#F5D98A);
}
.mf-join-t{ display:block; font-size:20px; font-weight:900; color:#F5D98A; letter-spacing:-.3px }
.mf-join-cn{ display:block; font-size:11.5px; font-weight:600; color:rgba(255,255,255,.72); margin-top:2px }
.mf-perks{ display:flex; flex-direction:column; gap:9px; margin-top:15px }
.mf-perk{ display:flex; align-items:flex-start; gap:10px }
.mf-perk-emoji{ flex-shrink:0; font-size:15px; width:19px; text-align:center; margin-top:1px }
.mf-perk b{ display:block; font-size:13px; font-weight:800; color:#fff }
.mf-perk i{ display:block; font-style:normal; font-size:11px; color:rgba(255,255,255,.66); margin-top:1px }
.mf-cta{
  display:block; width:100%; margin-top:17px;
  background:#1FA855; color:#fff; border:none;
  border-radius:15px; padding:14px 0 12px;
  font-size:16px; font-weight:900; cursor:pointer;
  box-shadow:0 4px 0 #17803F;
}
.mf-cta span{ display:block; font-size:11px; font-weight:600; opacity:.9; margin-top:2px }

/* ── 分组小标题(食材精选 / 饮品 / 小吃 共用) ── */
.sp-head{ display:flex; align-items:center; gap:9px }
.sp-head-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0 }
.sp-head-en{ font-size:12px; font-weight:900; letter-spacing:2px; white-space:nowrap }
.sp-head-cn{ font-size:11.5px; color:#8A7B66; font-weight:700; white-space:nowrap }

/* 食材详情 */
.sp-sheet{
  width:100%; max-width:400px; background:#FFFDF8;
  border-radius:22px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.4);
  margin:auto;
}

/* ── Sauce Bar:配方卡 ── */
.sb-card{
  border:2px solid #E8D9C4; border-radius:18px; overflow:hidden;
  background:#fff; transition:border-color .22s ease;
}
.sb-head{
  width:100%; display:flex; align-items:flex-start; gap:12px;
  padding:14px 15px; background:none; border:none; cursor:pointer; text-align:left;
  font:inherit; color:inherit;
}
.sb-emoji{
  flex-shrink:0; width:42px; height:42px; border-radius:13px;
  display:grid; place-items:center; font-size:21px; border:1.5px solid;
}
.sb-name{ display:block; font-size:16px; font-weight:900; letter-spacing:-.2px }
.sb-name-cn{ display:block; font-size:12.5px; font-weight:700; color:#1C1410; margin-top:2px }
.sb-note{ display:block; font-size:11.5px; color:#8A7B66; margin-top:4px; line-height:1.5 }
.sb-body{
  display:grid; grid-template-rows:0fr;
  transition:grid-template-rows .28s cubic-bezier(.22,1,.36,1);
}
.sb-card[data-open="1"] .sb-body{ grid-template-rows:1fr }
.sb-card[data-open="1"] .lx-chev{ transform:rotate(180deg) }
.sb-body > div{ overflow:hidden }
.sb-inner{ padding:2px 15px 16px }
.sb-steps{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px }
.sb-steps li{ display:flex; align-items:center; gap:11px }
.sb-n{
  flex-shrink:0; width:22px; height:22px; border-radius:50%;
  display:grid; place-items:center; color:#fff; font-size:11px; font-weight:900;
}
.sb-s{ flex:1; min-width:0 }
.sb-s b{ display:block; font-size:13.5px; font-weight:800; color:#1C1410 }
.sb-s i{ display:block; font-style:normal; font-size:10.5px; color:#8A7B66; margin-top:1px }
.sb-amt{
  flex-shrink:0; font-size:11.5px; font-weight:800; color:#6B5B4E;
  background:#F5EFE6; border-radius:7px; padding:4px 9px; white-space:nowrap;
}

/* Secret Mixes */
.sb-secret{
  margin-top:24px; padding:20px 18px 18px; border-radius:20px; text-align:center;
  background:linear-gradient(160deg,#241A14,#0E0A08);
  border:2px solid #C8912A; box-shadow:0 8px 26px rgba(14,10,8,.3);
}
.sb-secret-emoji{ font-size:32px; margin-bottom:6px }

/* 海报全屏 */
.mf-lightbox{
  position:fixed; inset:0; z-index:999; display:flex;
  align-items:center; justify-content:center; padding:20px;
  background:rgba(12,6,4,.9);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
  overflow-y:auto;
}
.mf-lightbox img{ width:100%; max-width:440px; height:auto; border-radius:14px; display:block }
.mf-lightbox-x{
  position:fixed; top:calc(14px + env(safe-area-inset-top)); right:14px;
  width:38px; height:38px; border-radius:50%; border:none; cursor:pointer;
  background:rgba(255,255,255,.18); color:#fff; font-size:22px; line-height:1;
}

/* ── 店长推荐 lookbook ── */
.pk-rail{
  display:flex; gap:14px; overflow-x:auto; padding:16px 0 4px 16px;
  scroll-snap-type:x mandatory; -webkit-overflow-scrolling:touch;
  scrollbar-width:none;
}
.pk-rail::-webkit-scrollbar{ display:none }
.pk-rail-end{ flex:0 0 2px }          /* 让最后一张也能滑到位 */
.pk-card{
  flex:0 0 76vw; max-width:288px; scroll-snap-align:center;
  background:#fff; border:2px solid #E8D9C4; border-radius:20px;
  overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,.07);
}
.pk-tile{
  background:#fff; border:2px solid #E8D9C4; border-radius:18px;
  overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.05);
  display:flex; flex-direction:column;
}
.pk-shot{
  position:relative; aspect-ratio:1; background:#F5EFE6; overflow:hidden;
  display:grid; place-items:center;
}
.pk-shot img{ width:100%; height:100%; object-fit:cover; display:block }
.pk-shot-fb{ font-size:40px; opacity:.32 }
.pk-no{
  position:absolute; top:10px; left:10px;
  background:rgba(28,20,16,.62); color:#F5D98A;
  font-size:11px; font-weight:900; letter-spacing:1.5;
  padding:4px 9px; border-radius:7px;
  -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px);
}
.pk-body{ padding:14px 15px 16px }
.pk-name{ font-size:17px; font-weight:900; color:#1C1410; line-height:1.2; letter-spacing:-.2px }
.pk-name-cn{ font-size:12.5px; font-weight:600; color:#8A7B66; margin-top:3px }
.pk-mods{ display:flex; flex-wrap:wrap; gap:5px; margin-top:9px }
.pk-mod{
  font-size:10.5px; font-weight:700; color:#C8912A;
  background:#FFF1CC; border:1px solid #F5D98A;
  border-radius:7px; padding:3px 8px; line-height:1.35;
}
.pk-note{ font-size:12px; color:#6B5B4E; margin-top:8px; line-height:1.5 }
.pk-note-cn{ font-size:11.5px; color:#8A7B66; margin-top:2px; line-height:1.5 }
.pk-pair{
  margin-top:9px; padding:8px 10px; border-radius:10px;
  background:#FFF6E4; border:1px solid #F0E0BC;
}
.pk-pair b{ display:block; font-size:9.5px; font-weight:900; color:#C8912A; letter-spacing:1.2px }
.pk-pair i{ display:block; font-style:normal; font-size:11.5px; color:#6B5B4E; margin-top:3px; line-height:1.5 }
.pk-price{
  margin-top:10px; font-size:23px; font-weight:900; color:#B91C1C; letter-spacing:-.5px;
}
.pk-price span{ font-size:10px; font-weight:600; color:#8A7B66; margin-left:4px }

/* 详情随选中切换 */
@keyframes ygf-panel-in{ from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:none } }
.ygf-panel{ animation:ygf-panel-in .26s cubic-bezier(.22,1,.36,1) both }

/* 按下反馈 */
.ygf-root button, .ygf-root a[data-press], .ygf-root [data-press]{
  -webkit-tap-highlight-color:transparent;
  transition:transform .06s ease-out, filter .06s ease-out;
}
.ygf-root button:active, .ygf-root a[data-press]:active, .ygf-root [data-press]:active{
  transform:scale(.955); filter:brightness(.90);
}
@media (prefers-reduced-motion: reduce){
  .ygf-bar, .ygf-bar-vert, .ygf-bar-wide, .ygf-panel{ transition:none; animation:none }
  .ygf-root button, .ygf-root [data-press]{ transition:none }
  .ygf-root button:active, .ygf-root [data-press]:active{ transform:none; filter:none }
}
`;


/* ══════════════════════════════════════════════════════════
   一级入口 —— 环形扑克牌
   四张牌 90° 均分在一个圆环上,始终正面朝向顾客,靠前后大小与明暗
   拉开纵深。按住停转、松开继续;拖动可以自己拨。
   transform 直接写 DOM,不走 React 重渲染 —— 老安卓也稳。
   ══════════════════════════════════════════════════════════ */
function EntryRing({ onPick }: { onPick: (id: EntryId) => void }) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const angle = useRef(0);
  const paused = useRef(false);
  const drag = useRef<{ x: number; a: number; t: number; moved: number } | null>(null);
  const [reduced, setReduced] = useState(false);

  const N = ENTRY_CARDS.length;
  const R = 116;              // 轨道半径
  const SPEED = 360 / 18000;  // 一圈 18 秒 —— 慢到能读,又始终在动

  const layout = () => {
    for (let i = 0; i < N; i++) {
      const el = cards.current[i];
      if (!el) continue;
      const th = ((angle.current + i * (360 / N)) * Math.PI) / 180;
      const x = R * Math.sin(th);
      const z = R * Math.cos(th);
      const d = (z + R) / (2 * R);                 // 0 = 最后, 1 = 最前
      const scale = 0.60 + 0.40 * d;
      el.style.transform = `translate(-50%,-50%) translateX(${x.toFixed(1)}px) scale(${scale.toFixed(3)})`;
      el.style.opacity = (0.22 + 0.78 * d).toFixed(3);
      el.style.zIndex = String(Math.round(d * 100));
      el.style.filter = `brightness(${(0.55 + 0.45 * d).toFixed(2)})`;
    }
  };

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    layout();
    if (mq.matches) return;

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (last && !paused.current && !drag.current) angle.current += (t - last) * SPEED;
      last = t;
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 按住停住 · 拖动拨动 · 松手继续 */
  const down = (e: React.PointerEvent) => {
    paused.current = true;
    drag.current = { x: e.clientX, a: angle.current, t: Date.now(), moved: 0 };
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    angle.current = drag.current.a + dx * 0.55;
    layout();
  };
  const up = () => { drag.current = null; paused.current = false; };

  /* 拖过就不算点击 —— 避免拨牌时误进 */
  const tap = (id: EntryId) => {
    if (drag.current && drag.current.moved > 8) return;
    onPick(id);
  };

  return (
    <div className="ring-wrap">
      <div className="ring-eyebrow">YGF MALATANG · SAN DIEGO</div>
      <div className="ring-title">今天想看点什么？</div>
      <div className="ring-sub">Tap a card to explore</div>

      <div
        ref={stage}
        className={`ring-stage${reduced ? ' is-static' : ''}`}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        onPointerLeave={up}
      >
        {ENTRY_CARDS.map((c, i) => (
          <div
            key={c.id}
            ref={el => { cards.current[i] = el; }}
            className="ring-card"
            style={{ borderColor: c.color }}
            onClick={() => tap(c.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onPick(c.id); }}
          >
            <img className="ring-shot" src={c.img} alt=""
              onError={e => { (e.target as HTMLImageElement).style.opacity = '0'; }} />
            <span className="ring-mark ring-mark-tl">{c.mark}</span>
            <span className="ring-mark ring-mark-br">{c.mark}</span>
            <div className="ring-face">
              <div className="ring-name">{c.titleEn}</div>
              <div className="ring-name-cn">{c.titleCn}</div>
              <div className="ring-hook">{c.hookCn}</div>
              <div className="ring-hook-en">{c.hookEn}</div>
              <div className="ring-go" style={{ background: c.color }}>进入 Enter ›</div>
            </div>
          </div>
        ))}
      </div>

      <div className="ring-hint">
        {reduced ? '点击卡片进入' : '按住暂停 · 左右拖动拨牌 · 点击进入'}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN MENU
// ══════════════════════════════════════════════════════════
export default function YGFPage() {
  // 四个入口,各答一个问题:今天有什么福利 / 我该选什么汤 / 有什么值得拿 / 这碗怎么调
  // ring = 落地的环形牌桌;进了某张牌才显示对应内容
  const [view, setView] = useState<"ring" | EntryId>("ring");
  const activeSection = view;
  const [spot, setSpot] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<string | null>(SAUCE_RECIPES[0]?.key ?? null);
  const [allSauce, setAllSauce] = useState(false);
  const spotItem = spot ? SPOTLIGHTS.find(x => x.key === spot) ?? null : null;
  const [brothIdx, setBrothIdx] = useState(0);

  // 小福有话说 —— 进菜单后延时弹出,当天只弹一次
  const [psst, setPsst] = useState(false);
  useEffect(() => {
    const today = new Date().toDateString();
    try {
      if (localStorage.getItem("ygf_psst") === today) return;
    } catch { return; }
    const t = setTimeout(() => {
      setPsst(true);
      try { localStorage.setItem("ygf_psst", today); } catch {}
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
    <style>{YGF_CSS}</style>
    <div className="ygf-root">
    <AppShell
      nav={
        <>
      {/* Allergen bar (rendered inside sticky header) */}
      <div style={{
        background: "#7C1D1D", padding: "10px 16px",
        display: "flex", alignItems: "center", gap: 10,
        borderBottom: "2px solid #9B2222" }}>
        <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>过敏源提示 · Allergen Notice</div>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, lineHeight: 1.5 }}>
            含：鱼 · 贝 · 大豆 · 麸质 · 芝麻 · 蛋 · 乳 · 花生 &nbsp;|&nbsp; Contains: Fish · Shellfish · Soy · Wheat · Sesame · Egg · Milk · Peanuts
          </div>
        </div>
      </div>
      {/* ── 进了内容页:返回牌桌 + 当前位置;牌桌本身不显示 ── */}
      {view !== "ring" && (() => {
        const cur = ENTRY_CARDS.find(c => c.id === view);
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: C.bg, borderBottom: `2px solid ${C.border}` }}>
            <button onClick={() => setView("ring")} aria-label="返回 Back"
              style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, cursor: "pointer",
                background: C.bgCard, border: `2px solid ${C.border}`, fontSize: 19, color: C.ink,
                display: "grid", placeItems: "center" }}>‹</button>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>
                {cur?.titleEn}
              </div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 1 }}>{cur?.titleCn}</div>
            </div>
            <span style={{ flexShrink: 0, fontSize: 20, opacity: 0.85 }}>{cur?.mark}</span>
          </div>
        );
      })()}
        </>
      }
    >
      <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>

        {/* ═══ 落地:环形牌桌 ═══ */}
        {view === "ring" && <EntryRing onPick={id => setView(id)} />}

        {/* 午餐特惠 —— 只在内容页顶部出现,牌桌保持干净 */}
        {view !== "ring" && (
        <div style={{ background: C.gold, padding: "12px 20px",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>🥤</span>
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Lunch Special · 午餐特惠</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>
              11:30 AM – 3:00 PM &nbsp;·&nbsp; Free drink with purchase 购麻辣烫送饮料 · Dine-in only 仅限堂食
            </div>
          </div>
        </div>
        )}

      {/* ═══════════════════════════════════════════════
          SECTION: 汤品介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "broth" && (
        <div style={{ padding: "20px 16px 48px", display: "flex", flexDirection: "column", gap: 14 }}>

          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 3 }}>OUR BROTHS</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, marginTop: 5, lineHeight: 1.2, letterSpacing: -0.5 }}>
              汤底 · 一碗的灵魂
            </div>
          </div>

          {/* 称重定价 —— 先让顾客知道怎么算钱 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
            background: C.bgCard, border: `2px solid ${C.borderStrong}`, borderRadius: 14, padding: "12px 16px" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{PRICING.buildYourOwnEn}</div>
              <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>{PRICING.buildYourOwnZh} · 汤底另见下方</div>
            </div>
            <div style={{ fontSize: 20, fontWeight: 900, color: C.red, whiteSpace: "nowrap" }}>{PRICING.perLbLabel}</div>
          </div>

          {/* 手风琴选择条 —— 五款一屏看完,点哪款哪款撑开 */}
          <div className="ygf-acc">
            {BROTHS.map((b, i) => {
              const on = i === brothIdx;
              return (
                <button key={b.id} className="ygf-bar" data-on={on ? "1" : "0"}
                  onClick={() => setBrothIdx(i)} aria-label={b.zh}
                  style={{ background: b.color }}>
                  {b.img && (
                    <img src={b.img} alt="" aria-hidden="true"
                      style={{ position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", opacity: on ? 1 : 0.34, transition: "opacity .28s ease" }}
                      onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  )}
                  <span className="ygf-bar-vert">{b.zh}</span>
                  <span className="ygf-bar-wide">
                    <span style={{ display: "block", fontSize: 18, fontWeight: 900, color: "#fff", lineHeight: 1.2 }}>{b.zh}</span>
                    <span style={{ display: "block", fontSize: 11, color: "rgba(255,255,255,0.86)", marginTop: 3, lineHeight: 1.3 }}>{b.en}</span>
                  </span>
                  <span style={{ position: "absolute", top: 8, left: 8, background: C.gold, color: "#fff",
                    fontSize: 9.5, fontWeight: 800, padding: "3px 8px", borderRadius: 6,
                    opacity: on ? 1 : 0, transition: "opacity .2s ease", whiteSpace: "nowrap" }}>{b.badge}</span>
                </button>
              );
            })}
          </div>

          {/* 选中汤底的详情 —— 全宽,读得清 */}
          {(() => {
            const b = BROTHS[brothIdx];
            return (
              <div key={b.id} className="ygf-panel"
                style={{ background: C.bgCard, borderRadius: 18, border: `2px solid ${C.border}`,
                  padding: "16px 16px 14px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{b.zh}</div>
                <div style={{ fontSize: 12, color: C.inkLight, marginTop: 3 }}>{b.en}</div>
                <div style={{ fontSize: 13.5, color: C.inkMid, marginTop: 9, lineHeight: 1.55 }}>{b.taglineEn}</div>
                <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 3, lineHeight: 1.55 }}>{b.tagline}</div>

                {/* 辣度 —— 每档单独一行 */}
                <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                  {b.spicyLevels.length === 0
                    ? <span style={{ fontSize: 12.5, color: C.inkMid }}>🍃 {b.spicy}</span>
                    : b.spicyLevels.map(lv => (
                        <span key={lv.en} style={{ fontSize: 12.5, color: C.inkMid, display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ minWidth: 88 }}>{lv.en} {lv.zh}</span>
                          <span style={{ letterSpacing: -1 }}>{"🌶".repeat(lv.chilies)}</span>
                        </span>
                      ))}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14, gap: 10 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap",
                    color: b.surcharge ? "#fff" : C.inkMid,
                    background: b.surcharge ? C.red : "transparent",
                    border: b.surcharge ? "none" : `1px solid ${C.border}`,
                    borderRadius: 8, padding: "5px 11px" }}>
                    {b.surcharge ? `+$${b.surcharge.toFixed(2)} / bowl` : "Included 免费"}
                  </span>
                  <Link href={`/menu/ygf/broth/${b.id}`} data-press
                    style={{ textDecoration: "none", background: C.red, color: "#fff",
                      fontSize: 13, fontWeight: 800, borderRadius: 10, padding: "9px 16px", whiteSpace: "nowrap" }}>
                    查看搭配 Combos ›
                  </Link>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ═══════════════════════════════════════════════
          SECTION: 菜品介绍
      ═══════════════════════════════════════════════ */}
      {activeSection === "items" && (
        <div style={{ padding: "20px 16px 48px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 3 }}>INGREDIENTS</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, marginTop: 5, lineHeight: 1.2, letterSpacing: -0.5 }}>
            食材 · 今天吃什么
          </div>
          <div style={{ fontSize: 13, color: C.inkMid, marginTop: 9, lineHeight: 1.6 }}>
            Over 100 items at the bar. These are the ones worth a closer look.
          </div>
          <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.6 }}>
            台上一百多种,这几样值得看一眼。
          </div>

          {(["new", "favorite", "try"] as SpotlightTier[]).map(tier => {
            const list = SPOTLIGHTS.filter(sp => sp.tier === tier);
            if (list.length === 0) return null;
            const meta = TIER_META[tier];
            return (
              <section key={tier} style={{ marginTop: 26 }}>
                <div className="sp-head">
                  <span className="sp-head-dot" style={{ background: meta.color }} />
                  <span className="sp-head-en" style={{ color: meta.color }}>{meta.emoji} {meta.en}</span>
                  <span className="sp-head-cn">{meta.cn}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginTop: 12 }}>
                  {list.map(sp => {
                    const it = sp.itemId ? getItem(sp.itemId) : undefined;
                    const img = sp.img ?? it?.img;
                    return (
                      <article key={sp.key} className="pk-tile" data-press
                        onClick={() => setSpot(sp.key)} style={{ cursor: "pointer" }}>
                        <div className="pk-shot">
                          {img
                            ? <img src={img} alt={sp.nameEn}
                                onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                            : <span className="pk-shot-fb">🥬</span>}
                          <span className="pk-no" style={{ background: meta.color, color: "#fff" }}>{meta.emoji}</span>
                        </div>
                        <div className="pk-body" style={{ padding: "11px 12px 13px" }}>
                          <div className="pk-name" style={{ fontSize: 14.5 }}>{sp.nameEn}</div>
                          <div className="pk-name-cn">{sp.nameCn}</div>
                          {sp.whatCn && (
                            <div style={{ fontSize: 11.5, color: C.inkMid, marginTop: 6, lineHeight: 1.5 }}>
                              {sp.whatCn}
                            </div>
                          )}
                          <div style={{ fontSize: 11, fontWeight: 800, color: meta.color, marginTop: 8 }}>
                            详情 Details ›
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            );
          })}

          <div style={{ marginTop: 26, textAlign: "center", fontSize: 11.5, color: C.inkLight, lineHeight: 1.7 }}>
            Full selection and allergen labels are posted at the bar.<br />
            全部食材与过敏源标示以自助台现场为准。
          </div>
        </div>
      )}

      {/* 食材详情 */}
      {spotItem && (
        <div className="mf-lightbox" onClick={() => setSpot(null)}>
          <div className="sp-sheet" onClick={e => e.stopPropagation()}>
            {(() => {
              const it = spotItem.itemId ? getItem(spotItem.itemId) : undefined;
              const img = spotItem.img ?? it?.img;
              const meta = TIER_META[spotItem.tier];
              return (
                <>
                  <div className="pk-shot" style={{ borderRadius: "20px 20px 0 0" }}>
                    {img
                      ? <img src={img} alt={spotItem.nameEn} />
                      : <span className="pk-shot-fb">🥬</span>}
                    <span className="pk-no" style={{ background: meta.color, color: "#fff" }}>
                      {meta.emoji} {meta.en}
                    </span>
                  </div>
                  <div style={{ padding: "18px 20px 24px" }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{spotItem.nameEn}</div>
                    <div style={{ fontSize: 14, color: C.inkLight, marginTop: 3 }}>{spotItem.nameCn}</div>

                    {([
                      ["What it is 是什么",        spotItem.whatEn,    spotItem.whatCn],
                      ["Texture 什么口感",         spotItem.textureEn, spotItem.textureCn],
                      ["How to cook 怎么煮好吃",   spotItem.cookEn,    spotItem.cookCn],
                      ["Best broth 配什么汤底",    spotItem.brothEn,   spotItem.brothCn],
                    ] as const).map(([label, en, cn]) => (en || cn) ? (
                      <div key={label} style={{ marginTop: 15 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, letterSpacing: 1.2 }}>{label}</div>
                        {en && <div style={{ fontSize: 13.5, color: C.inkMid, marginTop: 4, lineHeight: 1.55 }}>{en}</div>}
                        {cn && <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 2, lineHeight: 1.55 }}>{cn}</div>}
                      </div>
                    ) : null)}

                    {it?.allergens?.length ? (
                      <div style={{ marginTop: 17 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.red, letterSpacing: 1.2, marginBottom: 7 }}>
                          ALLERGENS 过敏源
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {it.allergens.map(a => <AllergenTag key={a} a={a} />)}
                        </div>
                      </div>
                    ) : null}

                    <button onClick={() => setSpot(null)} style={{
                      width: "100%", marginTop: 22, padding: "15px 0", borderRadius: 14, border: "none",
                      background: C.ink, color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                      关闭 Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}


      {activeSection === "sauce" && (
        <div style={{ padding: "20px 16px 48px" }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 3 }}>SAUCE BAR</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: C.ink, marginTop: 5, lineHeight: 1.2, letterSpacing: -0.5 }}>
            调料 · 调出你的味道
          </div>
          <div style={{ fontSize: 13, color: C.inkMid, marginTop: 9, lineHeight: 1.6 }}>
            The sauce bar is free and unlimited. Start with one of these.
          </div>
          <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.6 }}>
            调料台免费、不限量。不知道怎么调,照着下面来。
          </div>

          {/* ① 先给配方 —— 顾客站在调料台前要的是答案,不是目录 */}
          <div style={{ display: "flex", flexDirection: "column", gap: 13, marginTop: 20 }}>
            {SAUCE_RECIPES.map(r => {
              const open = recipe === r.key;
              return (
                <div key={r.key} className="sb-card" data-open={open ? "1" : "0"}
                  style={{ borderColor: open ? r.color : C.border }}>
                  <button className="sb-head" onClick={() => setRecipe(open ? null : r.key)}>
                    <span className="sb-emoji" style={{ background: `${r.color}18`, borderColor: `${r.color}44` }}>
                      {r.emoji}
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span className="sb-name" style={{ color: r.color }}>{r.nameEn}</span>
                      <span className="sb-name-cn">{r.nameCn}</span>
                      {r.noteCn && <span className="sb-note">{r.noteCn}</span>}
                    </span>
                    <span className="lx-chev" style={{ color: r.color }}>▼</span>
                  </button>
                  <div className="sb-body"><div><div className="sb-inner">
                    {r.noteEn && (
                      <div style={{ fontSize: 12.5, color: C.inkMid, lineHeight: 1.55, marginBottom: 11 }}>
                        {r.noteEn}
                      </div>
                    )}
                    <ol className="sb-steps">
                      {r.steps.map((st, i) => (
                        <li key={st.cn}>
                          <span className="sb-n" style={{ background: r.color }}>{i + 1}</span>
                          <span className="sb-s">
                            <b>{st.cn}</b>
                            <i>{st.en}</i>
                          </span>
                          {st.amount && <span className="sb-amt">{st.amount}</span>}
                        </li>
                      ))}
                    </ol>
                  </div></div></div>
                </div>
              );
            })}
          </div>

          {/* ② 认识一下 */}
          {SAUCE_NOTES.length > 0 && (
            <section style={{ marginTop: 30 }}>
              <div className="sp-head">
                <span className="sp-head-dot" style={{ background: C.inkMid }} />
                <span className="sp-head-en" style={{ color: C.inkMid }}>KNOW YOUR SAUCES</span>
                <span className="sp-head-cn">认识一下</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
                {SAUCE_NOTES.map(sn => (
                  <div key={sn.key} style={{ background: C.bgCard, border: `2px solid ${C.border}`,
                    borderRadius: 15, padding: "13px 15px" }}>
                    <div style={{ fontSize: 15, fontWeight: 900, color: C.ink }}>{sn.nameEn}</div>
                    <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{sn.nameCn}</div>
                    <div style={{ fontSize: 12.5, color: C.inkMid, marginTop: 7, lineHeight: 1.55 }}>{sn.descEn}</div>
                    <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.55 }}>{sn.descCn}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ③ 全部调料 —— 折叠,想看的人自己展开 */}
          <div className="lx-tray" data-open={allSauce ? "1" : "0"} style={{ marginTop: 20 }}>
            <button className="lx-tray-head" onClick={() => setAllSauce(o => !o)}>
              <span style={{ minWidth: 0 }}>
                <span className="lx-tray-title">ALL SAUCES 全部调料</span>
                <span className="lx-tray-sum" style={{ display: "block" }}>
                  {SAUCE_CATEGORIES.reduce((s, c) => s + c.items.length, 0)} 种 · tap to browse
                </span>
              </span>
              <span className="lx-chev">▼</span>
            </button>
            <div className="lx-tray-body"><div><div className="lx-tray-inner">
              {SAUCE_CATEGORIES.map(cat => (
                <div key={cat.zh} style={{ marginTop: 10 }}>
                  <div style={{ fontSize: 11, fontWeight: 800, color: C.gold, letterSpacing: 1 }}>
                    {cat.en} · {cat.zh}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7 }}>
                    {cat.items.map(it => (
                      <span key={it.zh} style={{ fontSize: 11.5, fontWeight: 700, color: C.inkMid,
                        background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8, padding: "5px 9px" }}>
                        {it.zh} <span style={{ color: C.inkLight, fontWeight: 500 }}>{it.en}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div></div></div>
          </div>

          {/* ④ Secret Mixes —— 不在 App 里公布,指向频道 */}
          <div className="sb-secret">
            <div className="sb-secret-emoji">🤫</div>
            <div style={{ fontSize: 17, fontWeight: 900, color: "#F5D98A" }}>{SECRET_MIX.titleEn}</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.66)", marginTop: 2 }}>{SECRET_MIX.titleCn}</div>
            <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.82)", marginTop: 10, lineHeight: 1.6 }}>
              {SECRET_MIX.bodyEn}
            </div>
            <div style={{ fontSize: 11.5, color: "rgba(255,255,255,0.6)", marginTop: 3, lineHeight: 1.6 }}>
              {SECRET_MIX.bodyCn}
            </div>
            <button className="mf-cta" style={{ marginTop: 15 }}
              onClick={() => window.open(YGF_CHANNEL, "_blank", "noopener,noreferrer")}>
              Join Ma-Fans<span>关注频道看隐藏配方</span>
            </button>
          </div>

          <div style={{ marginTop: 16, background: C.goldPale, borderRadius: 14,
            padding: "14px 16px", border: `1px solid ${C.goldLight}` }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>🥣 Free &amp; unlimited</div>
            <div style={{ fontSize: 11.5, color: C.inkMid, marginTop: 3 }}>
              调料台完全免费,不限量,随时可以再去添加。
            </div>
          </div>
        </div>
      )}


      {activeSection === "mafans" && (
        <div style={{ paddingBottom: 48 }}>

          {/* ① 当季活动大标题 */}
          {CAMPAIGN.active && (
            <div style={{ padding: "22px 16px 0" }}>
              <div className="mf-season">
                <span className="mf-season-line" />
                <span className="mf-season-en">{CAMPAIGN.seasonEn}</span>
                <span className="mf-season-line" />
              </div>
              <div className="mf-season-cn">{CAMPAIGN.seasonCn}</div>

              {/* ② 具体福利 */}
              <div className="mf-offer">
                <div className="mf-offer-shot">
                  {CAMPAIGN.img
                    ? <img src={CAMPAIGN.img} alt={CAMPAIGN.nameEn}
                        onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                    : <span style={{ fontSize: 44 }}>🍗</span>}
                </div>
                <div className="mf-offer-info">
                  <span className="mf-excl">Ma-Fans Exclusive · 会员专享</span>
                  <span className="mf-offer-name">{CAMPAIGN.nameEn}</span>
                  <span className="mf-offer-cn">{CAMPAIGN.nameCn}</span>
                  <span className="mf-offer-price">
                    {CAMPAIGN.wasPrice && <s>${CAMPAIGN.wasPrice.toFixed(2)}</s>}
                    <b>${CAMPAIGN.price.toFixed(2)}</b>
                  </span>
                </div>
              </div>

              <div className="mf-rules">
                {CAMPAIGN.rulesEn.map((r, i) => (
                  <div key={r} className="mf-rule">
                    <span className="mf-rule-dot" />
                    <span>
                      <b>{r}</b>
                      <i>{CAMPAIGN.rulesCn[i]}</i>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ③ 立即加入 + ④ 三条权益 */}
          <div style={{ padding: "16px 16px 0" }}>
            <div className="mf-join">
              <div className="mf-join-top">
                <span className="mf-join-emoji">🧧</span>
                <span>
                  <span className="mf-join-t">Join Ma-Fans</span>
                  <span className="mf-join-cn">立即加入 · 免费</span>
                </span>
              </div>
              <div className="mf-perks">
                {MEMBER_PERKS.map(p => (
                  <div key={p.en} className="mf-perk">
                    <span className="mf-perk-emoji">{p.emoji}</span>
                    <span>
                      <b>{p.en}</b>
                      <i>{p.cn}</i>
                    </span>
                  </div>
                ))}
              </div>
              <button className="mf-cta"
                onClick={() => window.open(YGF_CHANNEL, "_blank", "noopener,noreferrer")}>
                Follow on WhatsApp<span>关注频道 · 领取会员价</span>
              </button>
            </div>
          </div>

          {/* ⑤ Drinks */}
          <div style={{ padding: "30px 16px 0" }}>
            <div className="sp-head">
              <span className="sp-head-dot" style={{ background: C.gold }} />
              <span className="sp-head-en" style={{ color: C.gold }}>🧋 DRINKS</span>
              <span className="sp-head-cn">饮品 · {DRINK_PICKS.length} 款</span>
            </div>
            <div style={{ fontSize: 12.5, color: C.inkMid, marginTop: 9, lineHeight: 1.6 }}>
              Sweetness, tea base and toppings already chosen — just show the counter.
            </div>
            <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.6 }}>
              甜度、茶底、加料都替你配好了。出自隔壁北苑南家,同一个收银台。
            </div>
          </div>

          <div className="pk-rail">
            {DRINK_PICKS.map((raw, i) => {
              const p = resolvePick(raw);
              return (
                <article key={p.key} className="pk-card">
                  <div className="pk-shot">
                    {p.img
                      ? <img src={p.img} alt={p.nameEn}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      : <span className="pk-shot-fb">🧋</span>}
                    <span className="pk-no">{String(i + 1).padStart(2, "0")}</span>
                  </div>
                  <div className="pk-body">
                    <div className="pk-name">{p.nameEn}</div>
                    <div className="pk-name-cn">{p.nameCn}</div>
                    {p.tasteEn && <div className="pk-note">{p.tasteEn}</div>}
                    {p.tasteCn && <div className="pk-note-cn">{p.tasteCn}</div>}
                    {p.pairCn && (
                      <div className="pk-pair">
                        <b>配麻辣烫</b>
                        <i>{p.pairCn}</i>
                      </div>
                    )}
                    <div className="pk-mods">
                      {p.mods.map(m => <span key={m} className="pk-mod">{m}</span>)}
                    </div>
                    <div className="pk-price">${p.total.toFixed(2)}<span>+Tax</span></div>
                  </div>
                </article>
              );
            })}
            <div className="pk-rail-end" aria-hidden="true" />
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: C.inkLight, marginTop: 8 }}>
            ← 左右滑动 swipe →
          </div>

          {/* ⑥ Snacks */}
          <div style={{ padding: "30px 16px 0" }}>
            <div className="sp-head">
              <span className="sp-head-dot" style={{ background: C.red }} />
              <span className="sp-head-en" style={{ color: C.red }}>🍗 SNACKS</span>
              <span className="sp-head-cn">小吃 · {SNACK_PICKS.length} 款</span>
            </div>
          </div>
          <div style={{ padding: "14px 16px 0", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
            {SNACK_PICKS.map(raw => {
              const p = resolvePick(raw);
              return (
                <article key={p.key} className="pk-tile">
                  <div className="pk-shot">
                    {p.img
                      ? <img src={p.img} alt={p.nameEn}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      : <span className="pk-shot-fb">🍽</span>}
                  </div>
                  <div className="pk-body" style={{ padding: "11px 12px 13px" }}>
                    <div className="pk-name" style={{ fontSize: 14.5 }}>{p.nameEn}</div>
                    <div className="pk-name-cn">{p.nameCn}</div>
                    {p.tasteCn && <div className="pk-note-cn" style={{ marginTop: 5 }}>{p.tasteCn}</div>}
                    {p.mods.length > 0 && (
                      <div className="pk-mods">
                        {p.mods.map(m => <span key={m} className="pk-mod">{m}</span>)}
                      </div>
                    )}
                    <div className="pk-price" style={{ fontSize: 19, marginTop: 7 }}>
                      ${p.total.toFixed(2)}<span>+Tax</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* ⑦ 新品 / 限时 —— 空时整块不出现 */}
          {NEW_ARRIVALS.length > 0 && (
            <>
              <div style={{ padding: "30px 16px 0" }}>
                <div className="sp-head">
                  <span className="sp-head-dot" style={{ background: "#0F766E" }} />
                  <span className="sp-head-en" style={{ color: "#0F766E" }}>🆕 NEW &amp; LIMITED</span>
                  <span className="sp-head-cn">新品 · 限时</span>
                </div>
              </div>
              <div style={{ padding: "14px 16px 0", display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {NEW_ARRIVALS.map(a => (
                  <article key={a.key} className="pk-tile">
                    <div className="pk-shot">
                      {a.img
                        ? <img src={a.img} alt={a.nameEn}
                            onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                        : <span className="pk-shot-fb">🆕</span>}
                      {a.tag && <span className="pk-no">{a.tag}</span>}
                    </div>
                    <div className="pk-body" style={{ padding: "11px 12px 13px" }}>
                      <div className="pk-name" style={{ fontSize: 14.5 }}>{a.nameEn}</div>
                      <div className="pk-name-cn">{a.nameCn}</div>
                      {a.blurbCn && <div className="pk-note-cn" style={{ marginTop: 5 }}>{a.blurbCn}</div>}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div style={{ margin: "24px 16px 0", background: C.goldPale, borderRadius: 16,
            padding: "16px", border: `1.5px solid ${C.goldLight}`, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: C.gold }}>Order at the counter</div>
            <div style={{ fontSize: 12.5, color: C.inkMid, marginTop: 4, lineHeight: 1.6 }}>
              到柜台加点即可 · 和麻辣烫一起上
            </div>
          </div>

          <div style={{ marginTop: 12, textAlign: "center", fontSize: 10.5, color: C.inkLight, lineHeight: 1.6 }}>
            图片仅供参考、以实物为准<br />Pictures are for reference only
          </div>
        </div>
      )}




      </div>
    </AppShell>
    </div>

    <PsstWidget open={psst} onClose={() => setPsst(false)} channelUrl={YGF_CHANNEL} />
    </>
  );
}

function AllergenTag({ a, large }: { a: Allergen; large?: boolean }) {
  const color = ALLERGEN_COLOR[a] ?? "#888";
  return (
    <span style={{ fontSize: large ? 13 : 10, padding: large ? "5px 12px" : "3px 7px", borderRadius: 20,
      background: color + "18", color, fontWeight: 700, border: `1.5px solid ${color}50`,
      letterSpacing: 0.3 }}>
      {a}
    </span>
  );
}
