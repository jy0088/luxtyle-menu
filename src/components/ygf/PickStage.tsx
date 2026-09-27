"use client";
// src/components/ygf/PickStage.tsx
// Manager's Picks as a product stage: drag/flick drinks with inertia, live depth + parallax,
// odometer counter, Pair It ingredient chip, and a Flip hero transition into the detail view.
// Snacks stay a quiet reading list. All motion respects prefers-reduced-motion via gsap.matchMedia.

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { Flip } from "gsap/Flip";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import type { ResolvedPick, PairGlyph } from "@/app/menu/ygf/picksData";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP, Draggable, InertiaPlugin, Flip, SplitText);

const FONT_HREF =
  "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,500;1,6..96,500&family=Noto+Serif+SC:wght@500;700&display=swap";

const DEFAULT_TINT = { accent: "#C8912A", deep: "#3A2A14" };

const GLYPH: Record<PairGlyph, string> = {
  aloe: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="11" width="8" height="8" rx="2" fill="#F4FFF0" fill-opacity=".85"/><rect x="12" y="9" width="8" height="8" rx="2" fill="#F4FFF0" fill-opacity=".65"/><rect x="8" y="4" width="7" height="7" rx="2" fill="#F4FFF0"/></svg>',
  milk: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c3.2 4.2 5.5 7.4 5.5 10.3A5.5 5.5 0 0 1 6.5 13.3C6.5 10.4 8.8 7.2 12 3z" fill="#FFFDF7"/><path d="M9.5 13.8a2.6 2.6 0 0 0 2.4 2.6" stroke="#E8C9A8" stroke-width="1.4" stroke-linecap="round"/></svg>',
  cream: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 15.5c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/><path d="M8.5 15.5c0-1.9 1.6-3.4 3.5-3.4s3.5 1.5 3.5 3.4" stroke="#FFFDF7" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="15.6" r="1.5" fill="#FFFDF7"/></svg>',
};

const money = (v: number) => `$${v.toFixed(2)}`;
const clamp = gsap.utils.clamp;

const CSS = `
.ps{ --ps-ink:#140E0A; --ps-ink2:#1E1611; --ps-paper:#F6EEE2; --ps-dim:#B9AB97; --ps-gold:#D8B36A; --ps-line:rgba(246,238,226,.12);
  --ps-en:"Bodoni Moda","Didot","Bodoni 72",Georgia,serif; --ps-cn:"Noto Serif SC","Songti SC","STSong",serif;
  background:var(--ps-ink); color:var(--ps-paper); border-radius:18px; overflow:hidden; padding:14px 0 16px;
  -webkit-font-smoothing:antialiased }
.ps [hidden]{ display:none !important }
.ps button{ font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; -webkit-tap-highlight-color:transparent }
.ps button:focus-visible{ outline:2px solid var(--ps-gold); outline-offset:3px; border-radius:10px }
.ps-top{ display:flex; align-items:center; gap:12px; padding:0 14px }
.ps-seg{ flex:1; display:grid; grid-template-columns:1fr 1fr; background:var(--ps-ink2); border:1px solid var(--ps-line); border-radius:999px; padding:3px; position:relative }
.ps-seg button{ position:relative; z-index:1; padding:9px 0; font-size:14px; white-space:nowrap; font-weight:700; color:var(--ps-dim); transition:color .25s }
.ps-seg button[aria-pressed="true"]{ color:var(--ps-ink) }
.ps-knob{ position:absolute; top:3px; bottom:3px; left:3px; width:calc(50% - 3px); border-radius:999px; background:var(--ps-paper); transition:transform .35s cubic-bezier(.3,.7,.2,1) }
.ps-seg[data-tab="snacks"] .ps-knob{ transform:translateX(100%) }
.ps-odo{ display:flex; align-items:baseline; gap:5px; font-family:var(--ps-en); font-size:26px; line-height:1; font-variant-numeric:lining-nums tabular-nums; transition:opacity .25s }
.ps-odo .n{ display:inline-flex; align-items:flex-start }
.ps-odo .w{ display:inline-block; height:1em; overflow:hidden; vertical-align:top }
.ps-odo .c{ display:block; will-change:transform }
.ps-odo .c span{ display:block; height:1em }
.ps-odo .of{ font-family:inherit; font-size:13px; color:var(--ps-dim) }
.ps-note{ padding:10px 14px 0; font-size:13px; line-height:1.5; color:var(--ps-dim) }

.ps-stage{ position:relative; margin-top:6px; perspective:950px; overflow:hidden; cursor:grab; user-select:none; -webkit-user-select:none;
  background:radial-gradient(60% 52% at 50% 48%, rgba(216,179,106,.16), transparent 70%) }
.ps-stage:focus{ outline:none }
.ps-stage:focus-visible{ outline:2px solid var(--ps-gold); outline-offset:-2px }
.ps-card{ position:absolute; left:50%; top:50%; width:var(--cw); height:var(--ch); margin-left:calc(var(--cw) / -2); margin-top:calc(var(--ch) / -2);
  border-radius:22px; overflow:hidden; background:var(--ps-ink2); box-shadow:0 24px 50px rgba(0,0,0,.55); will-change:transform,opacity,filter }
.ps-card .bg{ position:absolute; top:0; bottom:0; left:-80%; width:260%; opacity:.9; will-change:transform;
  background:linear-gradient(90deg, transparent 0 18%, var(--c-deep) 40%, var(--c-accent) 50%, var(--c-deep) 60%, transparent 82%), var(--ps-ink2) }
.ps-media{ position:absolute; left:0; right:0; top:0; height:72%; overflow:hidden; border-radius:22px 22px 0 0; background:#2a2019 }
.ps-media img{ position:absolute; top:0; height:100%; left:-30%; width:160%; max-width:none; object-fit:cover; pointer-events:none; will-change:transform }
.ps-card .shade{ position:absolute; left:0; right:0; top:52%; height:22%; background:linear-gradient(to bottom, transparent, var(--c-deep)); pointer-events:none }
.ps-card .txt{ position:absolute; left:0; right:0; bottom:0; height:28%; padding:12px 18px 0; background:var(--c-deep); will-change:transform }
.ps-card .en{ font-family:var(--ps-en); font-weight:500; font-size:clamp(22px, 6.6vw, 28px); line-height:1.05; letter-spacing:-.01em; text-wrap:balance }
.ps-card .cn{ font-family:var(--ps-cn); font-weight:500; font-size:15.5px; color:rgba(246,238,226,.8); margin-top:6px; letter-spacing:.12em }
.ps-chip{ position:absolute; display:flex; align-items:center; gap:8px; padding:6px 12px 6px 6px; border-radius:999px; white-space:nowrap;
  background:rgba(20,14,10,.8); border:1px solid rgba(246,238,226,.22); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);
  visibility:hidden; opacity:0 }
.ps-card .ps-chip{ right:10px; top:54% }
.ps-chip .g{ width:30px; height:30px; border-radius:50%; background:var(--c-accent); display:grid; place-items:center; flex-shrink:0 }
.ps-chip .g svg{ width:20px; height:20px }
.ps-chip b{ display:block; font-size:14px; font-weight:700; line-height:1.15 }
.ps-chip i{ display:block; font-style:normal; font-size:12px; color:var(--ps-dim); line-height:1.2 }

.ps-info{ padding:6px 14px 0; display:flex; flex-direction:column; gap:10px }
.ps-pair{ display:flex; align-items:center; gap:10px; width:100%; text-align:left; padding:8px 12px 8px 8px; border-radius:16px;
  border:1px solid var(--ps-line); background:var(--ps-ink2); transition:border-color .25s, background .25s }
.ps-pair[aria-pressed="true"]{ border-color:var(--c-accent); background:color-mix(in srgb, var(--c-accent) 14%, var(--ps-ink2)) }
.ps-pair .g{ width:34px; height:34px; border-radius:50%; background:var(--c-accent); display:grid; place-items:center; flex-shrink:0 }
.ps-pair .g svg{ width:22px; height:22px }
.ps-pair .l{ display:block; font-size:11px; font-weight:700; letter-spacing:.2em; color:var(--ps-gold) }
.ps-pair .v{ display:block; font-size:16px; font-weight:700; margin-top:2px }
.ps-pair .go{ margin-left:auto; white-space:nowrap; font-size:13px; color:var(--ps-dim) }
.ps-why{ text-wrap:pretty; font-size:15.5px; line-height:1.55; color:rgba(246,238,226,.88) }
.ps-why span{ display:block; font-size:14px; color:var(--ps-dim); margin-top:2px }
.ps-row{ display:flex; align-items:baseline; justify-content:space-between; gap:12px }
.ps-price{ font-family:var(--ps-en); font-size:30px; font-variant-numeric:lining-nums }
.ps-price small{ font-family:inherit; font-size:13px; color:var(--ps-dim); margin-left:6px }
.ps-hint{ font-size:13.5px; color:var(--ps-dim) }

.ps-snacks{ padding:14px 14px 0; display:flex; flex-direction:column; gap:12px }
.ps-sn{ display:grid; grid-template-columns:92px 1fr; gap:14px; align-items:start; width:100%; text-align:left; padding:10px; border-radius:18px; background:var(--ps-ink2); border:1px solid var(--ps-line) }
.ps-sn img, .ps-sn .ph{ width:92px; height:92px; border-radius:12px; object-fit:cover; background:#2a2019 }
.ps-sn h4{ font-family:var(--ps-en); font-weight:500; font-size:20px; line-height:1.15; margin:0 }
.ps-sn .cn{ font-family:var(--ps-cn); font-size:15px; color:var(--ps-dim); margin-top:3px; letter-spacing:.08em }
.ps-sn p{ font-size:14.5px; line-height:1.55; color:rgba(246,238,226,.84); margin:7px 0 0; text-wrap:pretty }
.ps-sn .p2{ color:var(--ps-gold) }
.ps-sn .pr{ font-family:var(--ps-en); font-size:19px; margin-top:6px }
.ps-sn .more{ font-size:13px; color:var(--ps-dim); margin-top:4px }

/* detail (portal) */
.psd{ position:fixed; inset:0; z-index:80; display:flex; flex-direction:column; color:#F6EEE2; -webkit-font-smoothing:antialiased;
  --ps-en:"Bodoni Moda","Didot","Bodoni 72",Georgia,serif; --ps-cn:"Noto Serif SC","Songti SC","STSong",serif; font-family:'Noto Sans SC','PingFang SC',sans-serif }
.psd button{ font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; -webkit-tap-highlight-color:transparent }
.psd button:focus-visible{ outline:2px solid #D8B36A; outline-offset:3px; border-radius:10px }
.psd-bg{ position:absolute; inset:0; background:
  radial-gradient(90% 55% at 50% 20%, color-mix(in srgb, var(--c-accent) 38%, transparent), transparent 70%),
  linear-gradient(180deg, var(--c-deep), #0E0906 78%) }
.psd-inner{ position:relative; height:100%; max-width:560px; margin:0 auto; width:100%; display:flex; flex-direction:column }
.psd-hero{ position:relative; flex-shrink:0; height:clamp(280px, 44vh, 420px) }
.psd-hero .ps-media{ position:absolute; inset:0; height:auto; border-radius:0 0 30px 30px }
.psd-hero .ps-chip{ right:16px; bottom:-18px; z-index:3; padding:7px 14px 7px 7px; background:rgba(20,14,10,.86) }
.psd-hero .ps-chip .g{ width:36px; height:36px; background:var(--c-accent) }
.psd-close{ position:absolute; z-index:4; left:14px; top:calc(12px + env(safe-area-inset-top, 0px)); display:flex; align-items:center; gap:6px;
  padding:9px 14px 9px 11px; border-radius:999px; background:rgba(14,9,6,.62); border:1px solid rgba(246,238,226,.25);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); font-size:15px; font-weight:700 }
.psd-body{ position:relative; flex:1 1 auto; min-height:0; overflow-y:auto; padding:26px 22px calc(28px + env(safe-area-inset-bottom, 0px)); -webkit-overflow-scrolling:touch; overscroll-behavior:contain }
.psd-name{ font-family:var(--ps-en); font-weight:500; font-size:clamp(38px, 11.5vw, 50px); line-height:1; letter-spacing:-.015em; text-wrap:balance; margin:0 }
.psd-cn{ font-family:var(--ps-cn); font-weight:700; font-size:21px; letter-spacing:.2em; margin-top:10px; color:rgba(246,238,226,.88) }
.psd-sec{ margin-top:28px }
.psd-lbl{ font-size:12.5px; font-weight:700; letter-spacing:.24em; color:#D8B36A }
.psd-lbl span{ letter-spacing:.12em; margin-left:6px; font-weight:600; opacity:.8 }
.psd-en{ font-size:18.5px; line-height:1.55; margin:10px 0 0; max-width:30em }
.psd-zh{ text-wrap:pretty; font-family:var(--ps-cn); font-size:18px; line-height:1.75; margin:8px 0 0; color:rgba(246,238,226,.9) }
.psd-pn{ font-family:var(--ps-en); font-style:italic; font-size:27px; margin-top:8px }
.psd-pn span{ font-family:var(--ps-cn); font-style:normal; font-size:18px; margin-left:8px; color:rgba(246,238,226,.82) }
.psd-mods{ display:flex; flex-wrap:wrap; gap:6px; margin-top:10px }
.psd-mods span{ font-size:14.5px; padding:7px 12px; border-radius:999px; border:1px solid rgba(246,238,226,.22); background:rgba(0,0,0,.18) }
.psd-price{ margin-top:24px; display:flex; align-items:baseline; gap:10px; flex-wrap:wrap }
.psd-price b{ font-family:var(--ps-en); font-weight:500; font-size:36px }
.psd-price span{ font-size:14px; color:#B9AB97 }
`;

type Props = {
  drinks: ResolvedPick[];
  snacks: ResolvedPick[];
  onOpenSnack: (key: string) => void;
};

export default function PickStage({ drinks, snacks, onOpenSnack }: Props) {
  const N = drinks.length;
  const root = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const info = useRef<HTMLDivElement>(null);
  const odoCol = useRef<HTMLSpanElement>(null);
  const cardEls = useRef<(HTMLDivElement | null)[]>([]);
  const chipEls = useRef<(HTMLDivElement | null)[]>([]);
  const drinksPanel = useRef<HTMLDivElement>(null);
  const snacksPanel = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const heroMedia = useRef<HTMLDivElement>(null);
  const dBody = useRef<HTMLDivElement>(null);

  const [tab, setTab] = useState<"drinks" | "snacks">("drinks");
  const [cur, setCur] = useState(0);
  const [chipOn, setChipOn] = useState<boolean[]>(() => drinks.map(() => false));
  const [open, setOpen] = useState<number | null>(null);

  // imperative state shared by handlers (no re-render per frame)
  const s = useRef({
    gap: 190, reduced: false, cur: 0, busy: false, openIdx: -1,
    goTo: null as ((i: number, dur?: number) => void) | null,
    reinit: null as (() => void) | null,
    requestOpen: null as ((i: number) => void) | null,
    scrollAbort: null as AbortController | null,
    inerted: [] as Element[],
    proxy: null as HTMLDivElement | null, drag: null as Draggable | null,
    flipState: null as Flip.FlipState | null, tl: null as gsap.core.Timeline | null,
    splits: [] as SplitText[], autoScroll: null as gsap.core.Tween | null,
  });

  /* ── stage: depth + parallax each frame, Draggable + Inertia, wheel, resize ── */
  useGSAP(() => {
    const st = s.current;
    const stageEl = stage.current!;
    const proxy = document.createElement("div");
    proxy.style.cssText = "position:absolute;width:1px;height:1px;visibility:hidden;pointer-events:none";
    stageEl.appendChild(proxy);
    st.proxy = proxy;

    const cards = cardEls.current.map(el => {
      const c = el!;
      return {
        el: c,
        setX: gsap.quickSetter(c, "x", "px") as (v: number) => void,
        setSX: gsap.quickSetter(c, "scaleX") as (v: number) => void,
        setSY: gsap.quickSetter(c, "scaleY") as (v: number) => void,
        setR: gsap.quickSetter(c, "rotationY", "deg") as (v: number) => void,
        setO: gsap.quickSetter(c, "opacity") as (v: number) => void,
        setBg: gsap.quickSetter(c.querySelector(".bg"), "x", "px") as (v: number) => void,
        setImg: gsap.quickSetter(c.querySelector(".ps-media img"), "x", "px") as (v: number) => void,
        setTxt: gsap.quickSetter(c.querySelector(".txt"), "x", "px") as (v: number) => void,
      };
    });

    const posNow = () => -(gsap.getProperty(proxy, "x") as number) / st.gap;

    const render = () => {
      const pos = posNow(), rm = st.reduced;
      for (let i = 0; i < cards.length; i++) {
        const c = cards[i], d = i - pos, a = Math.abs(d);
        const o = a <= .5 ? 1 : a <= 1 ? 1.5 - a : Math.max(0, .5 - .3 * (a - 1));   // opaque while crossing centre
        let sc: number, r = 0, blur = 0, br: number;
        if (rm) { sc = 1 - .1 * Math.min(a, 1.5); br = 1 - .25 * Math.min(a, 1.5); }
        else {
          sc = a <= 1 ? 1 - .2 * a : Math.max(.55, .8 - .15 * (a - 1));
          r = -8 * clamp(-1.5, 1.5, d);
          blur = Math.min(a, 1.5) * 1.1;
          br = 1 - .32 * Math.min(a, 1.5);
        }
        c.setX(d * st.gap); c.setSX(sc); c.setSY(sc); c.setR(r); c.setO(o);
        c.el.style.filter = a < .02 ? "none" : (blur > .05 ? `blur(${blur.toFixed(2)}px) ` : "") + `brightness(${br.toFixed(3)})`;
        c.el.style.zIndex = String(100 - Math.round(a * 10));
        // parallax: bg ~30%, photo ~65%, text ~85% of the card's own screen travel
        const t = clamp(-1.5, 1.5, d) * st.gap;
        if (rm) { c.setBg(0); c.setImg(0); c.setTxt(0); }
        else { c.setBg(-.7 * t); c.setImg(-.35 * t); c.setTxt(-.15 * t); }
      }
      const idx = clamp(0, cards.length - 1, Math.round(pos));
      if (idx !== st.cur) { st.cur = idx; setCur(idx); }
    };

    const measure = () => {
      const w = stageEl.clientWidth || 360;
      const cw = Math.round(Math.min(w * .68, 290));
      const ch = Math.round(cw * 1.38);
      st.gap = Math.round(cw * .74);
      stageEl.style.setProperty("--cw", cw + "px");
      stageEl.style.setProperty("--ch", ch + "px");
      stageEl.style.height = ch + 36 + "px";
    };

    const goTo = (i: number, dur?: number) => {
      i = clamp(0, cards.length - 1, i);
      gsap.to(proxy, {
        x: -i * st.gap, duration: dur ?? (st.reduced ? .25 : .6), ease: "power3.out", overwrite: true,
        onUpdate: render, onComplete() { render(); st.drag?.update(); },
      });
    };
    st.goTo = goTo;

    const makeDrag = () => {
      st.drag?.kill();
      const rm = st.reduced, g = st.gap, n = cards.length;
      st.drag = Draggable.create(proxy, {
        type: "x", trigger: stageEl, inertia: !rm,
        bounds: { minX: -(n - 1) * g, maxX: 0 }, edgeResistance: .8, dragResistance: 0, minimumMovement: 6,
        allowNativeTouchScrolling: true,               // the page still scrolls vertically over the stage
        snap: rm ? undefined : { x: (v: number) => Math.round(clamp(-(n - 1) * g, 0, v) / g) * g },
        maxDuration: .9, minDuration: .3,
        onPress() { gsap.killTweensOf(proxy); },
        onDrag: render, onThrowUpdate: render, onThrowComplete: render,
        onRelease() { if (st.reduced) goTo(Math.round(posNow())); },
        onClick(e: PointerEvent) {
          const card = (e.target as HTMLElement).closest?.(".ps-card") as HTMLElement | null;
          if (!card) return;
          const i = Number(card.dataset.i);
          if (i === st.cur && Math.abs(posNow() - i) < .05) st.requestOpen?.(i); else goTo(i);
        },
      })[0];
    };

    const mm = gsap.matchMedia();
    mm.add({ reduce: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" }, ctx => {
      st.reduced = !!ctx.conditions?.reduce;
      makeDrag(); render();
    });

    // desktop: horizontal wheel / trackpad flips cups; vertical wheel keeps scrolling the page
    let lock = false;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 18) return;
      e.preventDefault();
      if (lock || st.busy) return;
      lock = true; goTo(st.cur + (e.deltaX > 0 ? 1 : -1)); gsap.delayedCall(.5, () => { lock = false; });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goTo(st.cur + 1);
      if (e.key === "ArrowLeft") goTo(st.cur - 1);
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); st.requestOpen?.(st.cur); }
    };
    stageEl.addEventListener("wheel", onWheel, { passive: false });
    stageEl.addEventListener("keydown", onKey);

    const ro = new ResizeObserver(() => {
      if (st.openIdx >= 0) return;
      const i = st.cur; measure(); gsap.set(proxy, { x: -i * st.gap }); makeDrag(); render();
    });
    ro.observe(stageEl);

    measure(); gsap.set(proxy, { x: 0 }); gsap.set(odoCol.current, { yPercent: -10 });
    st.reinit = () => { const i = st.cur; measure(); gsap.set(proxy, { x: -i * st.gap }); makeDrag(); render(); };

    return () => {
      ro.disconnect(); mm.revert(); st.drag?.kill();
      stageEl.removeEventListener("wheel", onWheel); stageEl.removeEventListener("keydown", onKey);
      proxy.remove();
    };
  }, { scope: root });

  /* ── odometer + info crossfade on index change ── */
  const firstCur = useRef(true);
  useGSAP(() => {
    if (firstCur.current) { firstCur.current = false; return; }
    const digit = cur + 1;
    if (s.current.reduced) {
      gsap.timeline().to(odoCol.current, { autoAlpha: 0, scale: .9, duration: .12 })
        .set(odoCol.current, { yPercent: -10 * digit }).to(odoCol.current, { autoAlpha: 1, scale: 1, duration: .18 });
    } else gsap.to(odoCol.current, { yPercent: -10 * digit, duration: .55, ease: "power3.out", overwrite: true });
    gsap.fromTo(info.current, { autoAlpha: 0, y: 4 }, { autoAlpha: 1, y: 0, duration: .25, ease: "power2.out", overwrite: true });
  }, { dependencies: [cur], scope: root });

  /* ── Pair It chip beside the cup ── */
  const togglePair = useCallback(() => {
    const i = s.current.cur, el = chipEls.current[i];
    if (!el) return;
    const on = !chipOn[i];
    setChipOn(prev => prev.map((v, k) => (k === i ? on : v)));
    gsap.killTweensOf(el);
    if (s.current.reduced) gsap.to(el, { autoAlpha: on ? 1 : 0, duration: .2 });
    else if (on) gsap.fromTo(el, { autoAlpha: 0, x: 28, y: 22, scale: .92 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: .6, ease: "back.out(1.6)" });
    else gsap.to(el, { autoAlpha: 0, x: 16, y: 8, duration: .25, ease: "power2.in" });
  }, [chipOn]);

  /* ── detail: capture the card photo, then Flip the hero from exactly there ── */
  const openDetail = useCallback((i: number) => {
    const st = s.current;
    if (st.busy || st.openIdx >= 0) return;
    st.busy = true; st.openIdx = i;
    const media = cardEls.current[i]?.querySelector(".ps-media") as HTMLElement | null;
    gsap.set(cardEls.current[i]?.querySelector(".ps-media img") ?? [], { x: 0 });
    st.flipState = !st.reduced && media ? Flip.getState(media, { props: "borderRadius" }) : null;
    setOpen(i);
  }, []);

  useEffect(() => { s.current.requestOpen = openDetail; });

  const stopAutoScroll = useCallback(() => {
    const st = s.current;
    st.autoScroll?.kill(); st.autoScroll = null;
    st.scrollAbort?.abort(); st.scrollAbort = null;   // drops the touch/wheel listeners that stop it
  }, []);

  useLayoutEffect(() => {
    if (open === null) return;
    const st = s.current, rm = st.reduced;
    const card = cardEls.current[open], det = detailRef.current!, body = dBody.current!;
    st.drag?.disable();
    document.documentElement.style.overflow = "hidden";
    // modal: everything behind the dialog (a direct child of <body> via the portal) is inert, so Tab
    // and VoiceOver can't wander into the covered page
    st.inerted = Array.from(document.body.children).filter(el => el !== det && !el.hasAttribute("inert"));
    st.inerted.forEach(el => el.setAttribute("inert", ""));
    body.scrollTop = 0;
    gsap.set(card, { autoAlpha: 0 });                 // the photo is "lifted" out of this card

    const q = gsap.utils.selector(det);
    const bits = q(".psd-cn, .psd-zh, .psd-lbl, .psd-pn, .psd-mods, .psd-price");
    const chip = q(".psd-hero .ps-chip");
    const tl = gsap.timeline({
      paused: true,
      onComplete() { st.busy = false; (q(".psd-close")[0] as HTMLElement)?.focus({ preventScroll: true }); startAutoScroll(); },
    });
    st.tl = tl;
    tl.fromTo(q(".psd-bg"), { autoAlpha: 0 }, { autoAlpha: 1, duration: rm ? .25 : .6, ease: "power2.out" }, 0);
    tl.fromTo(q(".psd-close"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, rm ? 0 : .35);

    const run = () => {
      if (rm || !st.flipState) {
        tl.fromTo(q(".psd-inner"), { autoAlpha: 0, scale: .98 }, { autoAlpha: 1, scale: 1, duration: .3, ease: "power2.out" }, 0);
        tl.fromTo([...q(".psd-name, .psd-en"), ...bits], { autoAlpha: 0 }, { autoAlpha: 1, duration: .25, stagger: .015 }, .1);
        tl.fromTo(chip, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 }, .15);
        tl.play();
        return;
      }
      tl.add(Flip.from(st.flipState, {
        targets: heroMedia.current, duration: .85, ease: "power3.inOut", scale: false, absolute: true, props: "borderRadius",
      }), 0);
      // English headline: word stagger. English body: line mask reveal. Chinese: whole sentence fade + rise.
      const head = SplitText.create(q(".psd-name"), { type: "words", mask: "words" });
      const lines = q(".psd-en").map(el => SplitText.create(el, { type: "lines", mask: "lines" }));
      st.splits = [head, ...lines];
      tl.from(head.words, { yPercent: 110, duration: .7, ease: "power4.out", stagger: .07 }, .5);
      tl.fromTo(bits, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: .55, ease: "power2.out", stagger: .05 }, .62);
      lines.forEach((sp, k) => tl.from(sp.lines, { yPercent: 105, duration: .65, ease: "power3.out", stagger: .08 }, .68 + k * .12));
      tl.fromTo(chip, { autoAlpha: 0, x: 60, y: 10, scale: .9 }, { autoAlpha: 1, x: 0, y: 0, scale: 1, duration: .7, ease: "back.out(1.5)" }, .8);
      tl.play();
    };
    // split once the display fonts are in (line breaks final) — but never keep the guest waiting more than 300ms
    if (!rm && document.fonts?.ready) {
      let started = false;
      const go = () => { if (!started) { started = true; run(); } };
      document.fonts.ready.then(go); setTimeout(go, 300);
    } else run();

    // Auto-scroll runs in BOTH motion modes — Kevin's call (2026-09-26). It is slow (~26px/s),
    // waits 1.4s, and any touch / wheel / key stops it for the rest of this open.
    function startAutoScroll() {
      const max = body.scrollHeight - body.clientHeight;
      if (max < 12) return;
      st.scrollAbort = new AbortController();
      const signal = st.scrollAbort.signal;
      ["pointerdown", "touchstart", "wheel", "keydown"].forEach(ev => body.addEventListener(ev, stopAutoScroll, { passive: true, signal }));
      st.autoScroll = gsap.to(body, { scrollTop: max, duration: max / 26, ease: "none", delay: 1.4, onComplete: stopAutoScroll });
    }
  }, [open, stopAutoScroll]);

  const closeDetail = useCallback(() => {
    const st = s.current;
    if (st.openIdx < 0 || !st.tl) return;
    st.busy = true;
    stopAutoScroll();
    if (dBody.current) dBody.current.scrollTop = 0;
    const i = st.openIdx;
    st.tl.eventCallback("onReverseComplete", () => {
      st.splits.forEach(sp => sp.revert()); st.splits = [];
      st.tl = null; st.flipState = null;
      gsap.set(cardEls.current[i], { autoAlpha: 1 });
      document.documentElement.style.overflow = "";
      st.inerted.forEach(el => el.removeAttribute("inert")); st.inerted = [];
      st.drag?.enable();
      stage.current?.focus({ preventScroll: true });   // hand focus back to where the guest came from
      st.openIdx = -1;
      setOpen(null);
      st.busy = false;
    });
    st.tl.timeScale(st.reduced ? 1.4 : 1.5).reverse();
  }, [stopAutoScroll]);

  useEffect(() => {
    if (open === null) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") closeDetail(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, closeDetail]);

  useEffect(() => {
    const st = s.current, el = root.current;
    return () => {
      document.documentElement.style.overflow = "";
      st.tl?.kill(); st.autoScroll?.kill(); st.scrollAbort?.abort();
      st.inerted.forEach(n => n.removeAttribute("inert"));
      st.splits.forEach(sp => sp.revert());
      if (el) gsap.killTweensOf(el.querySelectorAll("*"));
    };
  }, []);

  /* ── Drinks / Snacks: quiet switch ── */
  const switchTab = useCallback((next: "drinks" | "snacks") => {
    if (next === tab || s.current.openIdx >= 0) return;
    const from = next === "snacks" ? drinksPanel.current : snacksPanel.current;
    gsap.to(from, {
      scale: .97, autoAlpha: 0, y: -8, duration: .22, ease: "power2.in",
      onComplete() { gsap.set(from, { clearProps: "all" }); setTab(next); },
    });
  }, [tab]);
  const firstTab = useRef(true);
  useGSAP(() => {
    if (firstTab.current) { firstTab.current = false; return; }
    const st = s.current;
    if (tab === "drinks") st.reinit?.();
    const kids = tab === "snacks" ? snacksPanel.current?.children : drinksPanel.current?.children;
    if (kids) gsap.from(kids, { autoAlpha: 0, y: st.reduced ? 0 : 14, duration: .4, ease: "power2.out", stagger: .07 });
  }, { dependencies: [tab], scope: root });

  const d = drinks[cur];
  const tint = d?.tint ?? DEFAULT_TINT;
  const od = open !== null ? drinks[open] : null;
  const odTint = od?.tint ?? DEFAULT_TINT;

  return (
    <>
      {/* React 19 hoists this into <head>; fonts swap in when ready */}
      <link rel="stylesheet" href={FONT_HREF} precedence="default" />
      <style>{CSS}</style>
      <div className="ps" ref={root} style={{ ["--c-accent" as string]: tint.accent, ["--c-deep" as string]: tint.deep }}>
        <div className="ps-top">
          <div className="ps-seg" data-tab={tab} role="group" aria-label="Drinks or snacks">
            <span className="ps-knob" aria-hidden="true" />
            <button aria-pressed={tab === "drinks"} onClick={() => switchTab("drinks")}>Drinks 饮品</button>
            <button aria-pressed={tab === "snacks"} onClick={() => switchTab("snacks")}>Snacks 小吃</button>
          </div>
          <div className="ps-odo" aria-live="polite" aria-label={`${cur + 1} of ${N}`} style={{ opacity: tab === "drinks" ? 1 : 0 }}>
            <span className="n">
              <span className="w"><span className="c"><span>0</span></span></span>
              <span className="w"><span className="c" ref={odoCol}>
                {Array.from({ length: 10 }, (_, k) => <span key={k}>{k}</span>)}
              </span></span>
            </span>
            <span className="of">/ {String(N).padStart(2, "0")}</span>
          </div>
        </div>
        <p className="ps-note">甜度、茶底、加料都替你配好了，出自隔壁北苑南家，同一个收银台。<br />Sugar, tea base and toppings are preset. From Bei Yuan next door, same register.</p>

        <div ref={drinksPanel} hidden={tab !== "drinks"}>
          <div className="ps-stage" ref={stage} tabIndex={0} aria-roledescription="carousel" aria-label="Drinks 饮品">
            {drinks.map((p, i) => {
              const t = p.tint ?? DEFAULT_TINT;
              return (
                <div key={p.key} className="ps-card" data-i={i} ref={el => { cardEls.current[i] = el; }}
                  role="group" aria-label={`${p.nameEn} ${p.nameCn}`}
                  style={{ ["--c-accent" as string]: t.accent, ["--c-deep" as string]: t.deep }}>
                  <div className="bg" />
                  <div className="ps-media" data-flip-id={`pm-${p.key}`}>
                    {p.img && <img src={p.img} alt={`${p.nameEn} ${p.nameCn}`} draggable={false} />}
                  </div>
                  <div className="shade" />
                  {p.pairItem && (
                    <div className="ps-chip" ref={el => { chipEls.current[i] = el; }}>
                      <span className="g" dangerouslySetInnerHTML={{ __html: GLYPH[p.pairItem.glyph] }} />
                      <span><b>{p.pairItem.en}</b><i>{p.pairItem.cn} · 已配好 Added</i></span>
                    </div>
                  )}
                  <div className="txt"><div className="en">{p.nameEn}</div><div className="cn">{p.nameCn}</div></div>
                </div>
              );
            })}
          </div>

          <div className="ps-info" ref={info}>
            {d?.pairItem && (
              <button className="ps-pair" aria-pressed={chipOn[cur]} onClick={togglePair}>
                <span className="g" dangerouslySetInnerHTML={{ __html: GLYPH[d.pairItem.glyph] }} />
                <span><span className="l">PAIR IT · 配麻辣烫</span><span className="v">{d.pairItem.en} {d.pairItem.cn}</span></span>
                <span className="go">{chipOn[cur] ? "Hide 收起" : "Show 看搭配"}</span>
              </button>
            )}
            {d && (chipOn[cur] || !d.pairItem) && (d.pairCn || d.pairEn) && (
              <div className="ps-why">{d.pairCn}{d.pairEn && <span>{d.pairEn}</span>}</div>
            )}
            {d && (
              <div className="ps-row">
                <div className="ps-price">{money(d.total)}<small>+Tax</small></div>
                <div className="ps-hint">点杯子看故事 · Tap the cup</div>
              </div>
            )}
          </div>
        </div>

        <div ref={snacksPanel} hidden={tab !== "snacks"} className="ps-snacks">
          {snacks.map(p => (
            <button key={p.key} className="ps-sn" onClick={() => onOpenSnack(p.key)}>
              {p.img ? <img src={p.img} alt={`${p.nameEn} ${p.nameCn}`} /> : <span className="ph" />}
              <span>
                <h4>{p.nameEn}</h4>
                <span className="cn" style={{ display: "block" }}>{p.nameCn}</span>
                {(p.storyCn || p.tasteCn) && <p>{p.storyCn ?? p.tasteCn}<br />{p.storyEn ?? p.tasteEn}</p>}
                {(p.pairCn || p.pairEn) && <p className="p2">{p.pairCn}<br />{p.pairEn}</p>}
                <span className="pr" style={{ display: "block" }}>{money(p.total)}</span>
                <span className="more" style={{ display: "block" }}>详情 Details ›</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {od && typeof document !== "undefined" && createPortal(   /* client-only: page loads this with ssr:false */
        <div className="psd" ref={detailRef} role="dialog" aria-modal="true" aria-label={`${od.nameEn} ${od.nameCn}`}
          style={{ ["--c-accent" as string]: odTint.accent, ["--c-deep" as string]: odTint.deep }}>
          <div className="psd-bg" />
          <div className="psd-inner">
            <button className="psd-close" onClick={closeDetail}>‹ 返回 Back</button>
            <div className="psd-hero">
              <div className="ps-media" ref={heroMedia} data-flip-id={`pm-${od.key}`}>
                {od.img && <img src={od.img} alt={`${od.nameEn} ${od.nameCn}`} />}
              </div>
              {od.pairItem && (
                <div className="ps-chip">
                  <span className="g" dangerouslySetInnerHTML={{ __html: GLYPH[od.pairItem.glyph] }} />
                  <span><b>{od.pairItem.en}</b><i>{od.pairItem.cn} · 已配好 Added</i></span>
                </div>
              )}
            </div>
            <div className="psd-body" ref={dBody} key={od.key}>
              <h2 className="psd-name">{od.nameEn}</h2>
              <div className="psd-cn">{od.nameCn}</div>
              {(od.storyEn || od.storyCn) && (
                <div className="psd-sec"><div className="psd-lbl">STORY<span>故事</span></div>
                  {od.storyEn && <p className="psd-en">{od.storyEn}</p>}{od.storyCn && <p className="psd-zh">{od.storyCn}</p>}</div>
              )}
              {(od.tasteEn || od.tasteCn) && (
                <div className="psd-sec"><div className="psd-lbl">TASTE<span>口味</span></div>
                  {od.tasteEn && <p className="psd-en">{od.tasteEn}</p>}{od.tasteCn && <p className="psd-zh">{od.tasteCn}</p>}</div>
              )}
              {(od.pairEn || od.pairCn) && (
                <div className="psd-sec"><div className="psd-lbl">PAIR IT<span>配麻辣烫</span></div>
                  {od.pairItem && <div className="psd-pn">{od.pairItem.en}<span>{od.pairItem.cn}</span></div>}
                  {od.pairEn && <p className="psd-en">{od.pairEn}</p>}{od.pairCn && <p className="psd-zh">{od.pairCn}</p>}</div>
              )}
              {od.mods.length > 0 && (
                <div className="psd-sec"><div className="psd-lbl">ALREADY SET<span>已替你配好</span></div>
                  <div className="psd-mods">{od.mods.map(m => <span key={m}>{m}</span>)}</div></div>
              )}
              <div className="psd-price"><b>{money(od.total)}</b><span>+Tax · 到柜台加点 Order at the counter</span></div>
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
