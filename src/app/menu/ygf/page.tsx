"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { BROTHS, SAUCE_CATEGORIES, ALLERGEN_COLOR, PRICING, getItem, type Allergen } from "./menuData";
import AppShell from "@/components/shell/AppShell";
import PsstWidget from "@/components/ygf/PsstWidget";
import {
  DRINK_PICKS, SNACK_PICKS, NEW_ARRIVALS, CAMPAIGN, MEMBER_PERKS,
  SPOTLIGHTS, TIER_META, SAUCE_RECIPES, SAUCE_NOTES, SECRET_MIX,
  ENTRY_CARDS, MAFANS_BANNERS, ITEM_BANNERS, SAUCE_BANNERS,
  SECTION_INTRO, BROTH_NOTES,
  resolvePick, type SpotlightTier, type EntryId, type Pick,
} from "./picksData";

// 杨国福 WhatsApp 频道
const YGF_CHANNEL = "https://whatsapp.com/channel/0029VbDtDTY9RZAO8pD1k33z";

// ── Color tokens ──────────────────────────────────────────
const C = {
  bg:       "#FDFAF5",
  bgCard:   "#FFFFFF",
  bgSoft:   "#FFF4E6",
  gold:     "#C8912A",
  goldLight:"#F5D98A",
  goldPale: "#FFF1CC",
  red:      "#B91C1C",
  redLight: "#FEE2E2",
  ink:      "#1C1410",
  inkMid:   "#6B5B4E",
  inkLight: "#8A7B66",
  border:   "#E8D9C4",
  borderStrong: "#C8A878",
};

const YGF_CSS = `
/* ══════════════════════════════════════════════════════════
   一级入口 —— 轨道(卫星环绕)
   四张牌 90° 均分在一条椭圆轨道上,始终正面朝向顾客。
   前面的大、亮、压在上面;后面的小、暗、从上缘露出来。
   ══════════════════════════════════════════════════════════ */
.orb-wrap{
  min-height:calc(100dvh - 190px);
  display:flex; flex-direction:column; overflow:hidden;
  background:
    radial-gradient(120% 55% at 50% 4%, rgba(200,145,42,.17), transparent 62%),
    linear-gradient(170deg,#1B0F08,#0B0604);
}
.orb-eyebrow{
  padding:15px 0 0; text-align:center;
  font-size:10px; font-weight:800; letter-spacing:3.5px; color:rgba(245,217,138,.55);
}
.orb-title{
  text-align:center; margin-top:9px;
  font-size:20px; font-weight:900; color:#fff; letter-spacing:.5px;
}
.orb-stage{
  position:relative; flex:1 1 auto;
  min-height:clamp(348px,49vh,466px);
  touch-action:pan-y; -webkit-tap-highlight-color:transparent;
}
.orb-card{
  position:absolute; top:50%; left:50%;
  width:min(60vw,238px); height:clamp(258px,37vh,338px);
  border-radius:22px; overflow:hidden; cursor:pointer;
  border:2px solid; box-shadow:0 18px 44px rgba(0,0,0,.52);
  display:flex; flex-direction:column; justify-content:flex-end;
  will-change:transform,opacity;
}
/* 巨大的半透明角标做底纹,纯色牌面不发空 */
.orb-wm{
  position:absolute; top:-12px; right:-16px;
  font-size:150px; line-height:1; opacity:.10;
  transform:rotate(-12deg); pointer-events:none; user-select:none;
}
.orb-mark{
  position:absolute; z-index:2; font-size:15px; line-height:1;
  text-shadow:0 1px 6px rgba(0,0,0,.6);
}
.orb-mark-tl{ top:12px; left:13px }
.orb-mark-br{ bottom:12px; right:13px; transform:rotate(180deg) }
.orb-face{ position:relative; z-index:3; padding:0 17px 19px }
.orb-name{ font-size:27px; font-weight:900; color:#fff; line-height:1.04; letter-spacing:-.8px }
.orb-name-cn{ font-size:12.5px; font-weight:800; color:rgba(255,255,255,.84); margin-top:6px; letter-spacing:.4px }
.orb-rule{ width:34px; height:3px; border-radius:2px; margin:12px 0 10px; background:rgba(255,255,255,.55) }
.orb-hook{ font-size:13.5px; font-weight:800; color:#fff; line-height:1.4 }
.orb-hook-en{ font-size:10.5px; color:rgba(255,255,255,.6); margin-top:4px; line-height:1.38 }
.orb-go{
  display:inline-block; margin-top:13px;
  background:rgba(255,255,255,.95); color:#14100C;
  border-radius:9px; padding:8px 14px;
  font-size:12px; font-weight:900; letter-spacing:.3px;
}
/* 轨道指示 + 提示 */
.orb-foot{ padding:2px 0 14px; display:flex; flex-direction:column; align-items:center; gap:11px }
.orb-dots{ display:flex; align-items:center; gap:9px }
.orb-dot{
  width:8px; height:8px; padding:0; border-radius:50%; cursor:pointer;
  border:none; background:rgba(245,217,138,.28); transition:all .25s ease;
}
.orb-dot[data-on="1"]{ width:22px; border-radius:4px; background:#F5D98A }
.orb-hint{ font-size:10.5px; color:rgba(255,255,255,.38); letter-spacing:.4px }
.orb-step{
  width:40px; height:40px; border-radius:50%; cursor:pointer;
  border:1.5px solid rgba(245,217,138,.4); background:rgba(255,255,255,.07);
  color:#F5D98A; font-size:19px; line-height:1;
}
/* 午餐横幅 —— 钉在落地页最下面 */
.orb-lunch{
  margin-top:auto; background:#C8912A;
  padding:11px 18px calc(11px + env(safe-area-inset-bottom));
  display:flex; align-items:center; justify-content:center; gap:10px;
}

/* ══════════════════════════════════════════════════════════
   二级横幅 —— 点开在同页展开,其他退让缩小
   ══════════════════════════════════════════════════════════ */
.acc2{ display:flex; flex-direction:column; gap:12px }
.acc2-item{
  border-radius:18px; overflow:hidden; border:2px solid;
  box-shadow:0 4px 16px rgba(0,0,0,.09);
  scroll-margin-top:132px;
  transition:transform .26s cubic-bezier(.22,1,.36,1), opacity .26s ease, box-shadow .26s ease;
}
.acc2-item[data-on="0"]{ transform:scale(.978); opacity:.9 }
.acc2-item[data-on="1"]{ box-shadow:0 12px 32px rgba(0,0,0,.17) }
.acc2-bar{
  width:100%; display:flex; align-items:center; gap:13px;
  padding:15px 16px; border:none; cursor:pointer; text-align:left;
  font:inherit; color:#fff; position:relative; overflow:hidden;
}
.acc2-item[data-on="0"] .acc2-bar{ padding:13px 16px }
.acc2-chip{
  flex-shrink:0; width:42px; height:42px; border-radius:13px;
  display:grid; place-items:center; font-size:21px;
  background:rgba(255,255,255,.17); border:1px solid rgba(255,255,255,.22);
}
.acc2-t{ min-width:0; flex:1 }
.acc2-t b{ display:block; font-size:17px; font-weight:900; letter-spacing:-.2px; line-height:1.15 }
.acc2-t s{ display:block; text-decoration:none; font-size:12px; font-weight:700; color:rgba(255,255,255,.82); margin-top:2px }
.acc2-t i{
  display:block; font-style:normal; font-size:11px;
  color:rgba(255,255,255,.72); margin-top:5px; line-height:1.4;
}
.acc2-item[data-on="1"] .acc2-t i{ display:none }
.acc2-chev{
  flex-shrink:0; font-size:12px; color:rgba(255,255,255,.8);
  transition:transform .26s cubic-bezier(.22,1,.36,1);
}
.acc2-item[data-on="1"] .acc2-chev{ transform:rotate(180deg) }
.acc2-panel{
  background:#FFFDF8; display:grid; grid-template-rows:0fr;
  transition:grid-template-rows .3s cubic-bezier(.22,1,.36,1);
}
.acc2-item[data-on="1"] .acc2-panel{ grid-template-rows:1fr }
.acc2-panel > div{ overflow:hidden }
.acc2-inner{ padding:15px 15px 18px }

/* 三级切换(饮品 / 小吃) */
.acc3{ display:flex; gap:8px; margin-bottom:14px }
.acc3 button{
  flex:1; padding:11px 0; border-radius:12px; cursor:pointer;
  border:2px solid #E8D9C4; background:#fff;
  font-size:13.5px; font-weight:800; color:#8A7B66; font-family:inherit;
}
.acc3 button[data-on="1"]{ border-color:#C8912A; background:#FFF1CC; color:#C8912A }

/* ── Ma-Fans:当季活动 ── */
.mf-season{ display:flex; align-items:center; gap:11px }
.mf-season-line{ flex:1; height:1px; background:linear-gradient(90deg,transparent,#C8912A,transparent) }
.mf-season-en{ font-size:11.5px; font-weight:900; color:#C8912A; letter-spacing:3.5px; white-space:nowrap }
.mf-season-cn{ text-align:center; font-size:21px; font-weight:900; color:#1C1410; margin-top:7px; letter-spacing:1px }
.mf-offer{
  display:flex; gap:0; margin-top:14px; border-radius:18px; overflow:hidden;
  background:linear-gradient(135deg,#7B1113,#4A0A0B);
  border:2px solid #C8912A; box-shadow:0 8px 26px rgba(74,10,11,.28);
}
.mf-offer-shot{ flex:0 0 40%; position:relative; display:grid; place-items:center; background:#5E0D0E; overflow:hidden }
.mf-offer-shot img{ width:100%; height:100%; object-fit:cover; display:block }
.mf-offer-info{ flex:1; padding:14px 14px 15px; display:flex; flex-direction:column; min-width:0 }
.mf-excl{
  display:inline-block; align-self:flex-start;
  font-size:9.5px; font-weight:900; letter-spacing:.8px;
  color:#4A0A0B; background:linear-gradient(160deg,#FFE9AE,#F2C14E);
  border-radius:6px; padding:3px 8px; white-space:nowrap;
}
.mf-offer-name{ display:block; font-size:18px; font-weight:900; color:#fff; margin-top:8px; line-height:1.15 }
.mf-offer-cn{ display:block; font-size:12.5px; color:rgba(255,255,255,.7); margin-top:2px }
.mf-offer-price{ display:flex; align-items:baseline; gap:8px; margin-top:auto; padding-top:11px }
.mf-offer-price s{ font-size:12.5px; color:rgba(255,255,255,.45); font-weight:700 }
.mf-offer-price b{ font-size:31px; font-weight:900; color:#F2C14E; letter-spacing:-1px; line-height:1 }
.mf-rules{
  display:flex; flex-direction:column; gap:7px; margin-top:12px; padding:13px 15px;
  background:#FFF1CC; border:1.5px solid #F5D98A; border-radius:14px;
}
.mf-rule{ display:flex; align-items:flex-start; gap:9px }
.mf-rule-dot{ flex-shrink:0; width:6px; height:6px; margin-top:6px; border-radius:50%; background:#C8912A }
.mf-rule b{ display:block; font-size:12.5px; font-weight:800; color:#1C1410 }
.mf-rule i{ display:block; font-style:normal; font-size:11px; color:#8A7B66; margin-top:1px }

/* ── Ma-Fans:入会 ── */
.mf-join{
  border-radius:18px; overflow:hidden;
  background:linear-gradient(160deg,#7B1113,#4A0A0B);
  border:2px solid #C8912A; padding:17px 16px 15px;
  box-shadow:0 8px 26px rgba(74,10,11,.3);
}
.mf-join-top{ display:flex; align-items:center; gap:12px }
.mf-join-emoji{
  flex-shrink:0; width:44px; height:44px; border-radius:13px;
  display:grid; place-items:center; font-size:23px;
  background:linear-gradient(160deg,#FFF1CC,#F5D98A);
}
.mf-join-t{ display:block; font-size:19px; font-weight:900; color:#F5D98A; letter-spacing:-.3px }
.mf-join-cn{ display:block; font-size:11.5px; font-weight:600; color:rgba(255,255,255,.72); margin-top:2px }
.mf-perks{ display:flex; flex-direction:column; gap:9px; margin-top:14px }
.mf-perk{ display:flex; align-items:flex-start; gap:10px }
.mf-perk-emoji{ flex-shrink:0; font-size:15px; width:19px; text-align:center; margin-top:1px }
.mf-perk b{ display:block; font-size:13px; font-weight:800; color:#fff }
.mf-perk i{ display:block; font-style:normal; font-size:11px; color:rgba(255,255,255,.66); margin-top:1px }
.mf-cta{
  display:block; width:100%; margin-top:16px;
  background:#1FA855; color:#fff; border:none; font-family:inherit;
  border-radius:15px; padding:14px 0 12px;
  font-size:16px; font-weight:900; cursor:pointer;
  box-shadow:0 4px 0 #17803F;
}
.mf-cta span{ display:block; font-size:11px; font-weight:600; opacity:.9; margin-top:2px }

/* ── 分组小标题 ── */
.sp-head{ display:flex; align-items:center; gap:9px }
.sp-head-dot{ width:7px; height:7px; border-radius:50%; flex-shrink:0 }
.sp-head-en{ font-size:12px; font-weight:900; letter-spacing:2px; white-space:nowrap }
.sp-head-cn{ font-size:11.5px; color:#8A7B66; font-weight:700; white-space:nowrap }

/* 详情弹层 */
.sp-sheet{
  width:100%; max-width:400px; background:#FFFDF8;
  border-radius:22px; overflow:hidden; box-shadow:0 20px 60px rgba(0,0,0,.4); margin:auto;
}

/* ── Sauce Bar:配方卡 ── */
.sb-card{ border:2px solid #E8D9C4; border-radius:16px; overflow:hidden; background:#fff; transition:border-color .22s ease }
.sb-head{
  width:100%; display:flex; align-items:flex-start; gap:12px;
  padding:13px 14px; background:none; border:none; cursor:pointer; text-align:left;
  font:inherit; color:inherit;
}
.sb-emoji{
  flex-shrink:0; width:40px; height:40px; border-radius:12px;
  display:grid; place-items:center; font-size:20px; border:1.5px solid;
}
.sb-name{ display:block; font-size:15.5px; font-weight:900; letter-spacing:-.2px }
.sb-name-cn{ display:block; font-size:12.5px; font-weight:700; color:#1C1410; margin-top:2px }
.sb-note{ display:block; font-size:11.5px; color:#8A7B66; margin-top:4px; line-height:1.5 }
.sb-chev{ flex-shrink:0; font-size:11px; transition:transform .26s cubic-bezier(.22,1,.36,1) }
.sb-card[data-open="1"] .sb-chev{ transform:rotate(180deg) }
.sb-body{ display:grid; grid-template-rows:0fr; transition:grid-template-rows .28s cubic-bezier(.22,1,.36,1) }
.sb-card[data-open="1"] .sb-body{ grid-template-rows:1fr }
.sb-body > div{ overflow:hidden }
.sb-inner{ padding:2px 14px 15px }
.sb-steps{ list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:9px }
.sb-steps li{ display:flex; align-items:center; gap:11px }
.sb-n{ flex-shrink:0; width:22px; height:22px; border-radius:50%; display:grid; place-items:center; color:#fff; font-size:11px; font-weight:900 }
.sb-s{ flex:1; min-width:0 }
.sb-s b{ display:block; font-size:13.5px; font-weight:800; color:#1C1410 }
.sb-s i{ display:block; font-style:normal; font-size:10.5px; color:#8A7B66; margin-top:1px }
.sb-amt{
  flex-shrink:0; font-size:11.5px; font-weight:800; color:#6B5B4E;
  background:#F5EFE6; border-radius:7px; padding:4px 9px; white-space:nowrap;
}

/* Secret Mixes */
.sb-secret{ text-align:center; padding:4px 0 2px }
.sb-secret-emoji{ font-size:30px; margin-bottom:6px }

/* 海报 / 详情全屏 */
.mf-lightbox{
  position:fixed; inset:0; z-index:999; display:flex;
  align-items:center; justify-content:center; padding:20px;
  background:rgba(12,6,4,.9);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
  overflow-y:auto;
}

/* ── 店长推荐 lookbook ── */
.pk-rail{
  display:flex; gap:12px; overflow-x:auto; padding:2px 15px 6px;
  margin:0 -15px; scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch; scrollbar-width:none;
}
.pk-rail::-webkit-scrollbar{ display:none }
.pk-rail-end{ flex:0 0 3px }
.pk-card{
  flex:0 0 62vw; max-width:216px; scroll-snap-align:center;
  background:#fff; border:2px solid #E8D9C4; border-radius:18px;
  overflow:hidden; box-shadow:0 4px 18px rgba(0,0,0,.07); cursor:pointer;
}
.pk-tile{
  background:#fff; border:2px solid #E8D9C4; border-radius:16px;
  overflow:hidden; box-shadow:0 2px 10px rgba(0,0,0,.05);
  display:flex; flex-direction:column; cursor:pointer;
}
.pk-shot{ position:relative; aspect-ratio:1; background:#F5EFE6; overflow:hidden; display:grid; place-items:center }
.pk-shot img{ width:100%; height:100%; object-fit:cover; display:block }
.pk-shot-fb{ font-size:38px; opacity:.32 }
.pk-no{
  position:absolute; top:9px; left:9px;
  background:rgba(28,20,16,.62); color:#F5D98A;
  font-size:10.5px; font-weight:900; letter-spacing:1.2px;
  padding:4px 8px; border-radius:7px;
  -webkit-backdrop-filter:blur(4px); backdrop-filter:blur(4px);
}
.pk-body{ padding:12px 13px 14px }
.pk-name{ font-size:15px; font-weight:900; color:#1C1410; line-height:1.2; letter-spacing:-.2px }
.pk-name-cn{ font-size:12px; font-weight:600; color:#8A7B66; margin-top:3px }
.pk-mods{ display:flex; flex-wrap:wrap; gap:5px; margin-top:8px }
.pk-mod{
  font-size:10.5px; font-weight:700; color:#C8912A;
  background:#FFF1CC; border:1px solid #F5D98A;
  border-radius:7px; padding:3px 8px; line-height:1.35;
}
.pk-note{ font-size:12px; color:#6B5B4E; margin-top:7px; line-height:1.5 }
.pk-note-cn{ font-size:11.5px; color:#8A7B66; margin-top:2px; line-height:1.5 }
.pk-clamp{
  display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;
  overflow:hidden;
}
.pk-pair{ margin-top:9px; padding:9px 11px; border-radius:10px; background:#FFF6E4; border:1px solid #F0E0BC }
.pk-pair b{ display:block; font-size:9.5px; font-weight:900; color:#C8912A; letter-spacing:1.2px }
.pk-pair i{ display:block; font-style:normal; font-size:11.5px; color:#6B5B4E; margin-top:3px; line-height:1.5 }
.pk-price{ margin-top:9px; font-size:20px; font-weight:900; color:#B91C1C; letter-spacing:-.5px }
.pk-price span{ font-size:10px; font-weight:600; color:#8A7B66; margin-left:4px }
.pk-more{ font-size:11px; font-weight:800; color:#C8912A; margin-top:7px }

/* 面板内容淡入 */
@keyframes ygf-panel-in{ from{ opacity:0; transform:translateY(8px) } to{ opacity:1; transform:none } }
.ygf-panel{ animation:ygf-panel-in .24s cubic-bezier(.22,1,.36,1) both }

/* 按下反馈 */
.ygf-root button, .ygf-root a[data-press], .ygf-root [data-press]{
  -webkit-tap-highlight-color:transparent;
  transition:transform .06s ease-out, filter .06s ease-out;
}
.ygf-root button:active, .ygf-root a[data-press]:active, .ygf-root [data-press]:active{
  transform:scale(.955); filter:brightness(.90);
}
.ygf-root .acc2-bar:active, .ygf-root .orb-card:active, .ygf-root .orb-dot:active{
  transform:none; filter:none;
}
@media (prefers-reduced-motion: reduce){
  .acc2-item, .acc2-panel, .acc2-chev, .sb-body, .sb-chev, .ygf-panel, .orb-dot{
    transition:none; animation:none;
  }
  .ygf-root button, .ygf-root [data-press]{ transition:none }
  .ygf-root button:active, .ygf-root [data-press]:active{ transform:none; filter:none }
}
`;


/* ══════════════════════════════════════════════════════════
   一级入口 —— 轨道
   四张牌均分在一条椭圆轨道上:x = Rx·sinθ,y = Ky·cosθ。
   θ=0 在最前(靠下、最大、最亮),θ=180° 在最后(靠上、最小、最暗),
   所以后面那张会从前面那张的上缘露出来 —— 四张同时看得见。
   按住停、拖动拨、松开继续转;点圆点直接转到那张。
   transform 直接写 DOM,零 React 重渲染(只有换头牌时更新一次指示器)。
   ══════════════════════════════════════════════════════════ */
const ORB_N = ENTRY_CARDS.length;
const ORB_STEP = 360 / ORB_N;
const ORB_RX = 100;              // 轨道横半径
const ORB_KY = 56;               // 纵向压扁量 —— 决定后面那张露出多少
const ORB_SPEED = 360 / 20000;   // 一圈 20 秒

function EntryOrbit({ onPick }: { onPick: (id: EntryId) => void }) {
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const angle = useRef(0);
  const goal = useRef<number | null>(null);
  const resumeAt = useRef(0);
  const paused = useRef(false);
  const drag = useRef<{ x: number; a: number; moved: number } | null>(null);
  const frontRef = useRef(0);
  const [front, setFront] = useState(0);
  const [reduced, setReduced] = useState(false);
  const reducedRef = useRef(false);

  const layout = useCallback(() => {
    for (let i = 0; i < ORB_N; i++) {
      const el = cards.current[i];
      if (!el) continue;
      const th = ((angle.current + i * ORB_STEP) * Math.PI) / 180;
      const x = ORB_RX * Math.sin(th);
      const y = ORB_KY * Math.cos(th);
      const d = (Math.cos(th) + 1) / 2;            // 0 = 最后, 1 = 最前
      const s = 0.60 + 0.40 * d;
      el.style.transform =
        `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${s.toFixed(3)})`;
      el.style.opacity = (0.30 + 0.70 * d).toFixed(3);
      el.style.filter = `brightness(${(0.52 + 0.48 * d).toFixed(2)})`;
      el.style.zIndex = String(Math.round(d * 100));
    }
    const f = ((Math.round(-angle.current / ORB_STEP) % ORB_N) + ORB_N) % ORB_N;
    if (f !== frontRef.current) { frontRef.current = f; setFront(f); }
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    reducedRef.current = mq.matches;
    layout();

    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      const dt = last ? t - last : 0;
      last = t;
      if (goal.current !== null) {
        const diff = goal.current - angle.current;
        if (Math.abs(diff) < 0.4) {
          angle.current = goal.current;
          goal.current = null;
          resumeAt.current = t + 2200;             // 停一下让他看清这张
        } else {
          angle.current += diff * 0.16;
        }
      } else if (!reducedRef.current && !paused.current && !drag.current && t > resumeAt.current) {
        angle.current += dt * ORB_SPEED;
      }
      layout();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layout]);

  /* 转到第 i 张 —— 走最近的一边 */
  const goTo = (i: number) => {
    const target = -i * ORB_STEP;
    const k = Math.round((angle.current - target) / 360);
    const g = target + k * 360;
    if (reducedRef.current) { angle.current = g; goal.current = null; layout(); }
    else goal.current = g;
  };

  const down = (e: React.PointerEvent) => {
    paused.current = true;
    goal.current = null;
    drag.current = { x: e.clientX, a: angle.current, moved: 0 };
  };
  const move = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current.moved = Math.max(drag.current.moved, Math.abs(dx));
    angle.current = drag.current.a - dx * 0.45;     // 往左拨,下一张转到前面
    layout();
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    paused.current = false;
    if (reducedRef.current && d && d.moved > 6) {   // 关了动效就吸附到最近一张
      goTo(((Math.round(-angle.current / ORB_STEP) % ORB_N) + ORB_N) % ORB_N);
    }
  };

  const tap = (id: EntryId) => {
    if (drag.current && drag.current.moved > 8) return;   // 拨牌不算点击
    onPick(id);
  };

  return (
    <div className="orb-wrap">
      <div className="orb-eyebrow">YGF MALATANG · SAN DIEGO</div>
      <div className="orb-title">今天想看点什么？</div>

      <div
        className="orb-stage"
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
            className="orb-card"
            style={{ background: c.grad, borderColor: c.edge }}
            onClick={() => tap(c.id)}
            role="button"
            tabIndex={0}
            aria-label={`${c.titleEn} ${c.titleCn}`}
            onKeyDown={e => { if (e.key === "Enter" || e.key === " ") onPick(c.id); }}
          >
            <span className="orb-wm" aria-hidden="true">{c.mark}</span>
            <span className="orb-mark orb-mark-tl" aria-hidden="true">{c.mark}</span>
            <span className="orb-mark orb-mark-br" aria-hidden="true">{c.mark}</span>
            <div className="orb-face">
              <div className="orb-name">{c.titleEn}</div>
              <div className="orb-name-cn">{c.titleCn}</div>
              <div className="orb-rule" />
              <div className="orb-hook">{c.hookCn}</div>
              <div className="orb-hook-en">{c.hookEn}</div>
              <div className="orb-go">进入 Enter ›</div>
            </div>
          </div>
        ))}
      </div>

      <div className="orb-foot">
        <div className="orb-dots">
          {reduced && (
            <button className="orb-step" onClick={() => goTo((front - 1 + ORB_N) % ORB_N)} aria-label="上一张">‹</button>
          )}
          {ENTRY_CARDS.map((c, i) => (
            <button key={c.id} className="orb-dot" data-on={i === front ? "1" : "0"}
              onClick={() => goTo(i)} aria-label={`转到 ${c.titleEn}`} />
          ))}
          {reduced && (
            <button className="orb-step" onClick={() => goTo((front + 1) % ORB_N)} aria-label="下一张">›</button>
          )}
        </div>
        <div className="orb-hint">
          {reduced ? "左右滑动 · 点击进入" : "按住暂停 · 左右拨动 · 点击进入"}
        </div>
      </div>

      {/* 午餐特惠 —— 钉在最下面 */}
      <div className="orb-lunch">
        <span style={{ fontSize: 16 }}>🥤</span>
        <div style={{ textAlign: "left" }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>Lunch Special · 午餐特惠</div>
          <div style={{ fontSize: 10.5, color: "rgba(255,255,255,0.88)", lineHeight: 1.4 }}>
            11:30 AM – 3:00 PM · 购麻辣烫送饮料 Free drink · 仅限堂食 Dine-in
          </div>
        </div>
      </div>
    </div>
  );
}


/* ══════════════════════════════════════════════════════════
   二级横幅 —— 一个开,其余退让缩小
   ══════════════════════════════════════════════════════════ */
function AccItem({
  open, onToggle, emoji, titleEn, titleCn, hookCn, grad, edge, children,
}: {
  open: boolean; onToggle: () => void;
  emoji: string; titleEn: string; titleCn: string; hookCn?: string;
  grad: string; edge: string; children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const click = () => {
    onToggle();
    if (!open) {
      setTimeout(() => {
        box.current?.scrollIntoView({
          block: "start",
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        });
      }, 320);
    }
  };
  return (
    <div ref={box} className="acc2-item" data-on={open ? "1" : "0"} style={{ borderColor: edge }}>
      <button className="acc2-bar" style={{ background: grad }} onClick={click} aria-expanded={open}>
        <span className="acc2-chip">{emoji}</span>
        <span className="acc2-t">
          <b>{titleEn}</b>
          <s>{titleCn}</s>
          {hookCn && <i>{hookCn}</i>}
        </span>
        <span className="acc2-chev">▼</span>
      </button>
      <div className="acc2-panel">
        <div><div className="acc2-inner">{children}</div></div>
      </div>
    </div>
  );
}

/* 加点单品卡 —— 列表只放钩子,详情进弹层 */
function PickCard({ raw, idx, tile, onOpen }: {
  raw: Pick; idx?: number; tile?: boolean; onOpen: () => void;
}) {
  const p = resolvePick(raw);
  return (
    <article className={tile ? "pk-tile" : "pk-card"} data-press onClick={onOpen}>
      <div className="pk-shot">
        {p.img
          ? <img src={p.img} alt={p.nameEn}
              onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
          : <span className="pk-shot-fb">{tile ? "🍽" : "🧋"}</span>}
        {idx !== undefined && <span className="pk-no">{String(idx + 1).padStart(2, "0")}</span>}
      </div>
      <div className="pk-body">
        <div className="pk-name">{p.nameEn}</div>
        <div className="pk-name-cn">{p.nameCn}</div>
        {p.tasteCn && <div className="pk-note-cn pk-clamp" style={{ marginTop: 6 }}>{p.tasteCn}</div>}
        <div className="pk-price">${p.total.toFixed(2)}<span>+Tax</span></div>
        <div className="pk-more">详情 Details ›</div>
      </div>
    </article>
  );
}


// ══════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════
export default function YGFPage() {
  // 落地是轨道;进了某张牌才显示对应内容
  const [view, setView] = useState<"ring" | EntryId>("ring");

  // 每个一级下,当前展开的那个二级横幅(默认第一个)
  const [openMf, setOpenMf] = useState<string | null>("picks");
  const [openBr, setOpenBr] = useState<string | null>(BROTHS[0]?.id ?? null);
  const [openIt, setOpenIt] = useState<SpotlightTier | null>("new");
  const [openSa, setOpenSa] = useState<string | null>("recipes");

  // 三级:店长推荐落在饮品
  const [pickTab, setPickTab] = useState<"drink" | "snack">("drink");
  // 三级:调料配方
  const [recipe, setRecipe] = useState<string | null>(SAUCE_RECIPES[0]?.key ?? null);

  // 详情弹层
  const [sheet, setSheet] = useState<{ k: "spot" | "pick"; id: string } | null>(null);
  const spotItem = sheet?.k === "spot" ? SPOTLIGHTS.find(x => x.key === sheet.id) ?? null : null;
  const pickRaw = sheet?.k === "pick"
    ? [...DRINK_PICKS, ...SNACK_PICKS].find(x => x.key === sheet.id) ?? null
    : null;

  // 小福有话说 —— 进页面后延时弹出,当天只弹一次
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

  // 换一级时回到该级的第一个二级
  const enter = (id: EntryId) => {
    setView(id);
    if (id === "mafans") setOpenMf("picks");
    if (id === "broth")  setOpenBr(BROTHS[0]?.id ?? null);
    if (id === "items")  setOpenIt("new");
    if (id === "sauce")  setOpenSa("recipes");
    window.scrollTo({ top: 0 });
  };

  const cur = ENTRY_CARDS.find(c => c.id === view);

  return (
    <>
    <style>{YGF_CSS}</style>
    <div className="ygf-root">
    <AppShell
      nav={
        <>
      {/* 过敏源 —— 落地页压成一行半,进了内容页给完整版 */}
      {view === "ring" ? (
        <div style={{ background: "#7C1D1D", padding: "7px 16px",
          borderBottom: "2px solid #9B2222", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, flexShrink: 0 }}>⚠️</span>
          <div style={{ fontSize: 10, color: "rgba(255,255,255,0.9)", lineHeight: 1.45 }}>
            <b style={{ color: "#fff", fontWeight: 800 }}>过敏源 Allergens ·</b>{" "}
            鱼 · 贝 · 大豆 · 麸质 · 芝麻 · 蛋 · 乳 · 花生 · Fish · Shellfish · Soy · Wheat · Sesame · Egg · Milk · Peanuts
          </div>
        </div>
      ) : (
        <div style={{ background: "#7C1D1D", padding: "10px 16px",
          display: "flex", alignItems: "center", gap: 10, borderBottom: "2px solid #9B2222" }}>
          <span style={{ fontSize: 18, flexShrink: 0 }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: "#fff", letterSpacing: 0.5 }}>过敏源提示 · Allergen Notice</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.8)", marginTop: 2, lineHeight: 1.5 }}>
              含：鱼 · 贝 · 大豆 · 麸质 · 芝麻 · 蛋 · 乳 · 花生 &nbsp;|&nbsp; Contains: Fish · Shellfish · Soy · Wheat · Sesame · Egg · Milk · Peanuts
            </div>
          </div>
        </div>
      )}

      {/* 内容页:返回轨道 + 当前位置 */}
      {view !== "ring" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
          background: C.bg, borderBottom: `2px solid ${C.border}` }}>
          <button onClick={() => setView("ring")} aria-label="返回 Back"
            style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 13, cursor: "pointer",
              background: C.bgCard, border: `2px solid ${C.border}`, fontSize: 19, color: C.ink,
              display: "grid", placeItems: "center" }}>‹</button>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{cur?.titleEn}</div>
            <div style={{ fontSize: 11, color: C.inkLight, marginTop: 1 }}>{cur?.titleCn}</div>
          </div>
          <span style={{ flexShrink: 0, fontSize: 20, opacity: 0.85 }}>{cur?.mark}</span>
        </div>
      )}
        </>
      }
    >
      <div style={{ fontFamily: "'Noto Sans SC','PingFang SC',sans-serif", color: C.ink }}>

        {/* ═══ 落地:轨道 ═══ */}
        {view === "ring" && <EntryOrbit onPick={enter} />}

        {/* ═══ 内容页 ═══ */}
        {view !== "ring" && (
          <div style={{ padding: "16px 16px 44px" }}>

            {/* 这页干什么用 —— 两行说完 */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12.5, color: C.inkMid, lineHeight: 1.55 }}>
                {SECTION_INTRO[view].en}
              </div>
              <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 2, lineHeight: 1.55 }}>
                {SECTION_INTRO[view].cn}
              </div>
            </div>

            {/* ── 汤底:称重先说清怎么算钱 ── */}
            {view === "broth" && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                background: C.bgCard, border: `2px solid ${C.borderStrong}`, borderRadius: 14,
                padding: "12px 15px", marginBottom: 14 }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: C.ink }}>{PRICING.buildYourOwnEn}</div>
                  <div style={{ fontSize: 11, color: C.inkLight, marginTop: 2 }}>{PRICING.buildYourOwnZh} · 汤底另计</div>
                </div>
                <div style={{ fontSize: 20, fontWeight: 900, color: C.red, whiteSpace: "nowrap" }}>{PRICING.perLbLabel}</div>
              </div>
            )}

            <div className="acc2">

              {/* ══════════ Ma-Fans ══════════ */}
              {view === "mafans" && MAFANS_BANNERS.map(b => {
                if (b.key === "new" && NEW_ARRIVALS.length === 0) return null;
                if (b.key === "campaign" && !CAMPAIGN.active) return null;
                const open = openMf === b.key;
                return (
                  <AccItem key={b.key} open={open} onToggle={() => setOpenMf(open ? null : b.key)}
                    emoji={b.emoji} titleEn={b.titleEn} titleCn={b.titleCn} hookCn={b.hookCn}
                    grad={b.grad} edge={b.edge}>

                    {/* ── 三级:饮品 / 小吃 ── */}
                    {b.key === "picks" && (
                      <>
                        <div className="acc3">
                          <button data-on={pickTab === "drink" ? "1" : "0"} onClick={() => setPickTab("drink")}>
                            🧋 Drinks 饮品 · {DRINK_PICKS.length}
                          </button>
                          <button data-on={pickTab === "snack" ? "1" : "0"} onClick={() => setPickTab("snack")}>
                            🍗 Snacks 小吃 · {SNACK_PICKS.length}
                          </button>
                        </div>

                        {pickTab === "drink" ? (
                          <>
                            <div style={{ fontSize: 11.5, color: C.inkLight, lineHeight: 1.55, marginBottom: 4 }}>
                              甜度、茶底、加料都替你配好了。出自隔壁北苑南家,同一个收银台。
                            </div>
                            <div className="pk-rail">
                              {DRINK_PICKS.map((raw, i) => (
                                <PickCard key={raw.key} raw={raw} idx={i}
                                  onOpen={() => setSheet({ k: "pick", id: raw.key })} />
                              ))}
                              <div className="pk-rail-end" aria-hidden="true" />
                            </div>
                            <div style={{ textAlign: "center", fontSize: 10.5, color: C.inkLight, marginTop: 4 }}>
                              ← 左右滑动 swipe →
                            </div>
                          </>
                        ) : (
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11 }}>
                            {SNACK_PICKS.map(raw => (
                              <PickCard key={raw.key} raw={raw} tile
                                onOpen={() => setSheet({ k: "pick", id: raw.key })} />
                            ))}
                          </div>
                        )}

                        <div style={{ marginTop: 14, background: C.goldPale, borderRadius: 13,
                          padding: "12px 14px", border: `1px solid ${C.goldLight}`, textAlign: "center" }}>
                          <div style={{ fontSize: 13.5, fontWeight: 900, color: C.gold }}>Order at the counter</div>
                          <div style={{ fontSize: 11.5, color: C.inkMid, marginTop: 3 }}>到柜台加点即可 · 和麻辣烫一起上</div>
                        </div>
                      </>
                    )}

                    {/* ── 三级:当季活动 ── */}
                    {b.key === "campaign" && (
                      <>
                        <div className="mf-season">
                          <span className="mf-season-line" />
                          <span className="mf-season-en">{CAMPAIGN.seasonEn}</span>
                          <span className="mf-season-line" />
                        </div>
                        <div className="mf-season-cn">{CAMPAIGN.seasonCn}</div>

                        <div className="mf-offer">
                          <div className="mf-offer-shot">
                            {CAMPAIGN.img
                              ? <img src={CAMPAIGN.img} alt={CAMPAIGN.nameEn}
                                  onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                              : <span style={{ fontSize: 42 }}>🍗</span>}
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
                              <span><b>{r}</b><i>{CAMPAIGN.rulesCn[i]}</i></span>
                            </div>
                          ))}
                        </div>

                        <button className="mf-cta"
                          onClick={() => window.open(YGF_CHANNEL, "_blank", "noopener,noreferrer")}>
                          Join Ma-Fans<span>关注频道 · 领取会员价</span>
                        </button>
                      </>
                    )}

                    {/* ── 三级:会员福利 ── */}
                    {b.key === "perks" && (
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
                              <span><b>{p.en}</b><i>{p.cn}</i></span>
                            </div>
                          ))}
                        </div>
                        <button className="mf-cta"
                          onClick={() => window.open(YGF_CHANNEL, "_blank", "noopener,noreferrer")}>
                          Follow on WhatsApp<span>关注频道 · 领取会员价</span>
                        </button>
                      </div>
                    )}

                    {/* ── 三级:新品 / 限时 ── */}
                    {b.key === "new" && (
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11 }}>
                        {NEW_ARRIVALS.map(a => (
                          <article key={a.key} className="pk-tile" style={{ cursor: "default" }}>
                            <div className="pk-shot">
                              {a.img
                                ? <img src={a.img} alt={a.nameEn}
                                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                                : <span className="pk-shot-fb">🆕</span>}
                              {a.tag && <span className="pk-no">{a.tag}</span>}
                            </div>
                            <div className="pk-body">
                              <div className="pk-name">{a.nameEn}</div>
                              <div className="pk-name-cn">{a.nameCn}</div>
                              {a.blurbCn && <div className="pk-note-cn" style={{ marginTop: 5 }}>{a.blurbCn}</div>}
                            </div>
                          </article>
                        ))}
                      </div>
                    )}
                  </AccItem>
                );
              })}

              {/* ══════════ Our Broths —— 五款各一个横幅 ══════════ */}
              {view === "broth" && BROTHS.map(br => {
                const open = openBr === br.id;
                const note = BROTH_NOTES[br.id];
                const rows: [string, string | undefined, string | undefined][] = [
                  ["Character 特点",    note?.charEn,  note?.charCn],
                  ["What's in it 原料", note?.madeEn,  note?.madeCn],
                  ["Taste 风味",        note?.tasteEn, note?.tasteCn],
                  ["Goes with 适合配",  note?.forEn,   note?.forCn],
                ];
                return (
                  <AccItem key={br.id} open={open} onToggle={() => setOpenBr(open ? null : br.id)}
                    emoji="🍲" titleEn={br.en} titleCn={br.zh} hookCn={br.badge}
                    grad={`linear-gradient(120deg,${br.color},rgba(0,0,0,.55))`} edge={br.color}>

                    {br.img && (
                      <div style={{ position: "relative", borderRadius: 14, overflow: "hidden",
                        aspectRatio: "16 / 9", background: br.color, marginBottom: 13 }}>
                        <img src={br.img} alt={br.zh}
                          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                          onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                      </div>
                    )}

                    <div style={{ fontSize: 13.5, color: C.inkMid, lineHeight: 1.55 }}>{br.taglineEn}</div>
                    <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 3, lineHeight: 1.55 }}>{br.tagline}</div>

                    {/* 店里确认可公开的内容,填了才出现 */}
                    {rows.map(([label, en, cn]) => (en || cn) ? (
                      <div key={label} style={{ marginTop: 14 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, letterSpacing: 1.2 }}>{label}</div>
                        {en && <div style={{ fontSize: 13, color: C.inkMid, marginTop: 4, lineHeight: 1.55 }}>{en}</div>}
                        {cn && <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 2, lineHeight: 1.55 }}>{cn}</div>}
                      </div>
                    ) : null)}

                    {/* 辣度 */}
                    <div style={{ marginTop: 14 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, letterSpacing: 1.2, marginBottom: 6 }}>
                        Heat 辣度
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {br.spicyLevels.length === 0
                          ? <span style={{ fontSize: 12.5, color: C.inkMid }}>🍃 {br.spicy}</span>
                          : br.spicyLevels.map(lv => (
                              <span key={lv.en} style={{ fontSize: 12.5, color: C.inkMid, display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ minWidth: 92 }}>{lv.en} {lv.zh}</span>
                                <span style={{ letterSpacing: -1 }}>{"🌶".repeat(lv.chilies)}</span>
                              </span>
                            ))}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 15, gap: 10 }}>
                      <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: "nowrap",
                        color: br.surcharge ? "#fff" : C.inkMid,
                        background: br.surcharge ? C.red : "transparent",
                        border: br.surcharge ? "none" : `1px solid ${C.border}`,
                        borderRadius: 8, padding: "6px 11px" }}>
                        {br.surcharge ? `+$${br.surcharge.toFixed(2)} / bowl` : "Included 免费"}
                      </span>
                      <Link href={`/menu/ygf/broth/${br.id}`} data-press
                        style={{ textDecoration: "none", background: C.red, color: "#fff",
                          fontSize: 13, fontWeight: 800, borderRadius: 10, padding: "9px 15px", whiteSpace: "nowrap" }}>
                        查看搭配 Combos ›
                      </Link>
                    </div>
                  </AccItem>
                );
              })}

              {/* ══════════ Ingredients —— 三档 ══════════ */}
              {view === "items" && (["new", "favorite", "try"] as SpotlightTier[]).map(tier => {
                const list = SPOTLIGHTS.filter(sp => sp.tier === tier);
                if (list.length === 0) return null;
                const meta = TIER_META[tier];
                const skin = ITEM_BANNERS[tier];
                const open = openIt === tier;
                return (
                  <AccItem key={tier} open={open} onToggle={() => setOpenIt(open ? null : tier)}
                    emoji={meta.emoji} titleEn={meta.en} titleCn={`${meta.cn} · ${list.length} 款`}
                    hookCn={skin.hookCn} grad={skin.grad} edge={skin.edge}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 11 }}>
                      {list.map(sp => {
                        const it = sp.itemId ? getItem(sp.itemId) : undefined;
                        const img = sp.img ?? it?.img;
                        return (
                          <article key={sp.key} className="pk-tile" data-press
                            onClick={() => setSheet({ k: "spot", id: sp.key })}>
                            <div className="pk-shot">
                              {img
                                ? <img src={img} alt={sp.nameEn}
                                    onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                                : <span className="pk-shot-fb">🥬</span>}
                              <span className="pk-no" style={{ background: meta.color, color: "#fff" }}>{meta.emoji}</span>
                            </div>
                            <div className="pk-body">
                              <div className="pk-name">{sp.nameEn}</div>
                              <div className="pk-name-cn">{sp.nameCn}</div>
                              {sp.whatCn && <div className="pk-note-cn pk-clamp" style={{ marginTop: 6 }}>{sp.whatCn}</div>}
                              <div className="pk-more" style={{ color: meta.color }}>详情 Details ›</div>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  </AccItem>
                );
              })}

              {/* ══════════ Sauce Bar ══════════ */}
              {view === "sauce" && SAUCE_BANNERS.map(b => {
                const open = openSa === b.key;
                return (
                  <AccItem key={b.key} open={open} onToggle={() => setOpenSa(open ? null : b.key)}
                    emoji={b.emoji} titleEn={b.titleEn} titleCn={b.titleCn} hookCn={b.hookCn}
                    grad={b.grad} edge={b.edge}>

                    {/* 三级:三个配方 */}
                    {b.key === "recipes" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                        {SAUCE_RECIPES.map(r => {
                          const on = recipe === r.key;
                          return (
                            <div key={r.key} className="sb-card" data-open={on ? "1" : "0"}
                              style={{ borderColor: on ? r.color : C.border }}>
                              <button className="sb-head" onClick={() => setRecipe(on ? null : r.key)}>
                                <span className="sb-emoji" style={{ background: `${r.color}18`, borderColor: `${r.color}44` }}>
                                  {r.emoji}
                                </span>
                                <span style={{ minWidth: 0, flex: 1 }}>
                                  <span className="sb-name" style={{ color: r.color }}>{r.nameEn}</span>
                                  <span className="sb-name-cn">{r.nameCn}</span>
                                  {r.noteCn && <span className="sb-note">{r.noteCn}</span>}
                                </span>
                                <span className="sb-chev" style={{ color: r.color }}>▼</span>
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
                                      <span className="sb-s"><b>{st.cn}</b><i>{st.en}</i></span>
                                      {st.amount && <span className="sb-amt">{st.amount}</span>}
                                    </li>
                                  ))}
                                </ol>
                              </div></div></div>
                            </div>
                          );
                        })}
                        <div style={{ background: C.goldPale, borderRadius: 13, padding: "12px 14px",
                          border: `1px solid ${C.goldLight}` }}>
                          <div style={{ fontSize: 13, fontWeight: 800, color: C.gold }}>🥣 Free &amp; unlimited</div>
                          <div style={{ fontSize: 11.5, color: C.inkMid, marginTop: 3 }}>
                            调料台完全免费,不限量,随时可以再去添加。
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 三级:认识调料 */}
                    {b.key === "know" && (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {SAUCE_NOTES.map(sn => (
                          <div key={sn.key} style={{ background: C.bgCard, border: `2px solid ${C.border}`,
                            borderRadius: 14, padding: "13px 14px" }}>
                            <div style={{ fontSize: 15, fontWeight: 900, color: C.ink }}>{sn.nameEn}</div>
                            <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{sn.nameCn}</div>
                            <div style={{ fontSize: 12.5, color: C.inkMid, marginTop: 7, lineHeight: 1.55 }}>{sn.descEn}</div>
                            <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.55 }}>{sn.descCn}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 三级:全部调料 */}
                    {b.key === "all" && (
                      <div>
                        <div style={{ fontSize: 11.5, color: C.inkLight, marginBottom: 4 }}>
                          {SAUCE_CATEGORIES.reduce((s, c) => s + c.items.length, 0)} 种 · 以调料台现场为准
                        </div>
                        {SAUCE_CATEGORIES.map(cat => (
                          <div key={cat.zh} style={{ marginTop: 13 }}>
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
                      </div>
                    )}

                    {/* 三级:隐藏配方 → 频道 */}
                    {b.key === "secret" && (
                      <div className="sb-secret">
                        <div className="sb-secret-emoji">🤫</div>
                        <div style={{ fontSize: 16.5, fontWeight: 900, color: C.ink }}>{SECRET_MIX.titleEn}</div>
                        <div style={{ fontSize: 12, color: C.inkLight, marginTop: 2 }}>{SECRET_MIX.titleCn}</div>
                        <div style={{ fontSize: 12.5, color: C.inkMid, marginTop: 10, lineHeight: 1.6 }}>
                          {SECRET_MIX.bodyEn}
                        </div>
                        <div style={{ fontSize: 11.5, color: C.inkLight, marginTop: 3, lineHeight: 1.6 }}>
                          {SECRET_MIX.bodyCn}
                        </div>
                        <button className="mf-cta"
                          onClick={() => window.open(YGF_CHANNEL, "_blank", "noopener,noreferrer")}>
                          Join Ma-Fans<span>关注频道看隐藏配方</span>
                        </button>
                      </div>
                    )}
                  </AccItem>
                );
              })}

            </div>

            {/* 页脚 */}
            <div style={{ marginTop: 22, textAlign: "center", fontSize: 10.5, color: C.inkLight, lineHeight: 1.7 }}>
              {view === "items" && <>Full selection and allergen labels are posted at the bar.<br />全部食材与过敏源标示以自助台现场为准。<br /></>}
              图片仅供参考、以实物为准 · Pictures are for reference only
            </div>
          </div>
        )}

      </div>
    </AppShell>
    </div>

    {/* ═══ 详情:食材 ═══ */}
    {spotItem && (
      <div className="mf-lightbox" onClick={() => setSheet(null)}>
        <div className="sp-sheet" onClick={e => e.stopPropagation()}>
          {(() => {
            const it = spotItem.itemId ? getItem(spotItem.itemId) : undefined;
            const img = spotItem.img ?? it?.img;
            const meta = TIER_META[spotItem.tier];
            return (
              <>
                <div className="pk-shot" style={{ borderRadius: "20px 20px 0 0" }}>
                  {img ? <img src={img} alt={spotItem.nameEn} /> : <span className="pk-shot-fb">🥬</span>}
                  <span className="pk-no" style={{ background: meta.color, color: "#fff" }}>
                    {meta.emoji} {meta.en}
                  </span>
                </div>
                <div style={{ padding: "18px 20px 24px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{spotItem.nameEn}</div>
                  <div style={{ fontSize: 14, color: C.inkLight, marginTop: 3 }}>{spotItem.nameCn}</div>

                  {([
                    ["What it is 是什么",      spotItem.whatEn,    spotItem.whatCn],
                    ["Texture 什么口感",       spotItem.textureEn, spotItem.textureCn],
                    ["How to cook 怎么煮好吃", spotItem.cookEn,    spotItem.cookCn],
                    ["Best broth 配什么汤底",  spotItem.brothEn,   spotItem.brothCn],
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

                  <button onClick={() => setSheet(null)} style={{
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

    {/* ═══ 详情:饮品 / 小吃 ═══ */}
    {pickRaw && (
      <div className="mf-lightbox" onClick={() => setSheet(null)}>
        <div className="sp-sheet" onClick={e => e.stopPropagation()}>
          {(() => {
            const p = resolvePick(pickRaw);
            return (
              <>
                <div className="pk-shot" style={{ borderRadius: "20px 20px 0 0" }}>
                  {p.img ? <img src={p.img} alt={p.nameEn} /> : <span className="pk-shot-fb">🧋</span>}
                </div>
                <div style={{ padding: "18px 20px 24px" }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: C.ink, lineHeight: 1.2 }}>{p.nameEn}</div>
                  <div style={{ fontSize: 14, color: C.inkLight, marginTop: 3 }}>{p.nameCn}</div>

                  {(p.tasteEn || p.tasteCn) && (
                    <div style={{ marginTop: 15 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, letterSpacing: 1.2 }}>Taste 什么味道</div>
                      {p.tasteEn && <div style={{ fontSize: 13.5, color: C.inkMid, marginTop: 4, lineHeight: 1.55 }}>{p.tasteEn}</div>}
                      {p.tasteCn && <div style={{ fontSize: 12.5, color: C.inkLight, marginTop: 2, lineHeight: 1.55 }}>{p.tasteCn}</div>}
                    </div>
                  )}

                  {(p.pairEn || p.pairCn) && (
                    <div className="pk-pair" style={{ marginTop: 15 }}>
                      <b>WITH MALATANG 配麻辣烫</b>
                      {p.pairEn && <i>{p.pairEn}</i>}
                      {p.pairCn && <i>{p.pairCn}</i>}
                    </div>
                  )}

                  {p.mods.length > 0 && (
                    <div style={{ marginTop: 15 }}>
                      <div style={{ fontSize: 10.5, fontWeight: 800, color: C.gold, letterSpacing: 1.2, marginBottom: 7 }}>
                        Already set 已替你配好
                      </div>
                      <div className="pk-mods" style={{ marginTop: 0 }}>
                        {p.mods.map(m => <span key={m} className="pk-mod">{m}</span>)}
                      </div>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 17 }}>
                    <span style={{ fontSize: 30, fontWeight: 900, color: C.red, letterSpacing: -1 }}>
                      ${p.total.toFixed(2)}
                    </span>
                    <span style={{ fontSize: 11, color: C.inkLight }}>+Tax · 到柜台加点</span>
                  </div>

                  <button onClick={() => setSheet(null)} style={{
                    width: "100%", marginTop: 20, padding: "15px 0", borderRadius: 14, border: "none",
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
