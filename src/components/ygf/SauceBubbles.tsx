"use client";
// src/components/ygf/SauceBubbles.tsx
// Sauce Bar level 2 as bubbles that roam freely inside the frame: they drift, bounce off the
// walls and off each other, and can be grabbed and flicked. A tap grows that bubble
// (clip-path circle) into a full-screen panel with its content; closing shrinks it back.
// Reduced motion: bubbles sit still in a fixed layout, panel fades.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

export type Bubble = {
  key: string; emoji: string; titleEn: string; titleCn: string; hookCn?: string;
  /** tint of the bubble and a deeper shade for its rim / the panel header */
  color: string; deep: string;
};

// starting centre (fraction of field) and diameter (fraction of the shorter side)
const LAYOUT = [
  { x: .33, y: .28, d: .46 },
  { x: .72, y: .47, d: .37 },
  { x: .28, y: .70, d: .33 },
  { x: .72, y: .80, d: .29 },
];
const CRUISE = 22;        // px/s the bubbles settle back to
const MAX_THROW = 520;    // px/s cap on a flick
const TAP_SLOP = 7;       // px of movement still counted as a tap
const PAD = 6;            // keep this far from the frame edge

const CSS = `
.sbf{ position:relative; overflow:hidden; border-radius:24px; touch-action:pan-y;
  background:
    radial-gradient(60% 45% at 18% 12%, rgba(255,255,255,.75), transparent 70%),
    radial-gradient(70% 60% at 85% 95%, rgba(214,170,98,.22), transparent 70%),
    linear-gradient(165deg, #FFF8EC 0%, #F6EAD6 55%, #EFDFC5 100%);
  border:1.5px solid #E6D3B4; box-shadow: inset 0 1px 0 rgba(255,255,255,.8), inset 0 -18px 40px rgba(170,120,50,.08) }
.sbf::before{ content:""; position:absolute; inset:0; pointer-events:none; opacity:.35;
  background-image: radial-gradient(rgba(170,120,50,.18) 1px, transparent 1.2px); background-size:14px 14px }

.sbb{ position:absolute; left:0; top:0; border:0; padding:0; background:none; cursor:grab; touch-action:none;
  -webkit-tap-highlight-color:transparent; will-change:transform; border-radius:50% }
.sbb:active{ cursor:grabbing }
.sbb:focus-visible{ outline:3px solid #C8912A; outline-offset:4px }
.sbb-body{ position:absolute; inset:0; border-radius:50%; display:flex; flex-direction:column; align-items:center; justify-content:center;
  text-align:center; color:#fff; overflow:hidden; isolation:isolate;
  background:
    radial-gradient(circle at 50% 118%, color-mix(in srgb, var(--b-c) 70%, #fff) 0%, transparent 46%),
    radial-gradient(circle at 42% 38%, color-mix(in srgb, var(--b-c) 55%, transparent) 0%, color-mix(in srgb, var(--b-c) 88%, transparent) 62%, var(--b-d) 100%);
  box-shadow:
    inset 0 0 0 1.5px rgba(255,255,255,.55),
    inset 0 -14px 26px color-mix(in srgb, var(--b-d) 55%, transparent),
    inset 0 10px 22px rgba(255,255,255,.28),
    0 16px 30px -8px color-mix(in srgb, var(--b-d) 55%, transparent),
    0 4px 10px rgba(80,50,15,.12);
  backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px) }
/* thin-film iridescence round the rim */
.sbb-body::before{ content:""; position:absolute; inset:0; border-radius:50%; z-index:-1; mix-blend-mode:soft-light; opacity:.85;
  background: conic-gradient(from 210deg, #ffd1f0, #c8e7ff, #d4ffe0, #fff3b8, #ffd1f0);
  -webkit-mask: radial-gradient(circle, transparent 58%, #000 76%); mask: radial-gradient(circle, transparent 58%, #000 76%) }
/* specular highlight + small secondary glint */
.sbb-body::after{ content:""; position:absolute; left:18%; top:10%; width:34%; height:22%; border-radius:50%; transform:rotate(-28deg);
  background: radial-gradient(ellipse at 50% 50%, rgba(255,255,255,.95), rgba(255,255,255,.35) 55%, transparent 72%);
  box-shadow: calc(var(--b-s) * .5) calc(var(--b-s) * .52) 0 calc(var(--b-s) * -.06) rgba(255,255,255,.35) }
.sbb .e{ font-size:calc(var(--b-s) * .2); line-height:1; filter: drop-shadow(0 2px 3px rgba(0,0,0,.25)) }
.sbb b{ display:block; font-size:clamp(14px, calc(var(--b-s) * .13), 22px); font-weight:900; margin-top:5px; letter-spacing:.06em;
  text-shadow: 0 1px 2px rgba(0,0,0,.35), 0 0 12px color-mix(in srgb, var(--b-d) 60%, transparent) }
.sbb i{ display:block; font-style:normal; font-size:clamp(10.5px, calc(var(--b-s) * .072), 13px); margin-top:2px; padding:0 12px;
  line-height:1.25; opacity:.92; text-shadow: 0 1px 2px rgba(0,0,0,.35) }
.sbf-hint{ margin-top:8px; text-align:center; font-size:12px; color:#8A7B66 }

.sbp{ position:fixed; inset:0; z-index:80; display:flex; flex-direction:column; background:#FDFAF5; color:#1C1410;
  font-family:'Noto Sans SC','PingFang SC',sans-serif; -webkit-font-smoothing:antialiased }
.sbp-head{ position:relative; flex-shrink:0; color:#fff; padding:calc(14px + env(safe-area-inset-top, 0px)) 18px 20px;
  background: radial-gradient(120% 140% at 18% 0%, var(--b-c), var(--b-d)) }
.sbp-close{ display:inline-flex; align-items:center; gap:6px; padding:9px 14px 9px 11px; border-radius:999px; cursor:pointer;
  background:rgba(0,0,0,.22); border:1px solid rgba(255,255,255,.35); color:#fff; font:inherit; font-size:15px; font-weight:700 }
.sbp-close:focus-visible{ outline:2px solid #fff; outline-offset:3px }
.sbp-title{ display:flex; align-items:center; gap:12px; margin-top:16px }
.sbp-title .e{ font-size:34px; line-height:1 }
.sbp-title b{ display:block; font-size:24px; font-weight:900; line-height:1.15 }
.sbp-title s{ display:block; text-decoration:none; font-size:14px; opacity:.85; margin-top:2px }
.sbp-hook{ margin-top:10px; font-size:14px; opacity:.9 }
.sbp-body{ flex:1 1 auto; min-height:0; overflow-y:auto; padding:18px 16px calc(28px + env(safe-area-inset-bottom, 0px));
  -webkit-overflow-scrolling:touch; overscroll-behavior:contain; max-width:560px; width:100%; margin:0 auto }
`;

type Body = { x: number; y: number; vx: number; vy: number; r: number; m: number; held: boolean };
type Props = { bubbles: Bubble[]; renderContent: (key: string) => ReactNode };

export default function SauceBubbles({ bubbles, renderContent }: Props) {
  const field = useRef<HTMLDivElement>(null);
  const els = useRef<(HTMLButtonElement | null)[]>([]);
  const inner = useRef<(HTMLSpanElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const bodies = useRef<Body[]>([]);
  const st = useRef({
    reduced: false, busy: false, openIdx: -1, paused: false,
    tl: null as gsap.core.Timeline | null, inerted: [] as Element[],
  });

  /* field fills the screen below it: viewport − its top − bottom nav − hint + footer */
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    const nav = Array.from(document.querySelectorAll("nav")).find(n => getComputedStyle(n).position === "fixed");
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const navH = nav ? nav.getBoundingClientRect().height : 0;
      setSize({ w: el.clientWidth, h: Math.max(380, Math.floor(window.innerHeight - top - navH - 120)) });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  const place = (i: number) => {
    const b = bodies.current[i], el = els.current[i];
    if (b && el) el.style.transform = `translate3d(${(b.x - b.r).toFixed(2)}px, ${(b.y - b.r).toFixed(2)}px, 0)`;
  };

  /* seed bodies from the layout whenever the frame size changes */
  useLayoutEffect(() => {
    if (!size.w) return;
    const short = Math.min(size.w, size.h * .85);
    bodies.current = bubbles.map((_, i) => {
      const L = LAYOUT[i % LAYOUT.length];
      const r = Math.round(short * L.d / 2);
      const a = Math.random() * Math.PI * 2;
      const prev = bodies.current[i];
      return {
        x: clampNum(prev?.x ?? size.w * L.x, r + PAD, size.w - r - PAD),
        y: clampNum(prev?.y ?? size.h * L.y, r + PAD, size.h - r - PAD),
        vx: Math.cos(a) * CRUISE, vy: Math.sin(a) * CRUISE, r, m: r * r, held: false,
      };
    });
    bubbles.forEach((_, i) => place(i));
  }, [size.w, size.h, bubbles]);

  /* physics loop + a slow "breathing" wobble on each bubble's skin */
  useEffect(() => {
    if (!size.w) return;
    const s = st.current;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    let wobble: gsap.core.Tween[] = [];
    const startWobble = () => {
      wobble.forEach(t => t.kill());
      wobble = s.reduced ? [] : inner.current.map((el, i) => el
        ? gsap.to(el, { scaleX: 1.035, scaleY: .965, duration: 1.6 + i * .23, ease: "sine.inOut", yoyo: true, repeat: -1 })
        : null).filter(Boolean) as gsap.core.Tween[];
    };
    const applyMode = () => {
      s.reduced = mq.matches;
      if (s.reduced) {                       // hold still in the tidy layout
        bodies.current.forEach((b, i) => {
          const L = LAYOUT[i % LAYOUT.length];
          b.x = clampNum(size.w * L.x, b.r + PAD, size.w - b.r - PAD);
          b.y = clampNum(size.h * L.y, b.r + PAD, size.h - b.r - PAD);
          b.vx = b.vy = 0; place(i);
        });
      } else bodies.current.forEach(b => { if (!b.vx && !b.vy) { const a = Math.random() * 6.28; b.vx = Math.cos(a) * CRUISE; b.vy = Math.sin(a) * CRUISE; } });
      startWobble();
    };
    applyMode();
    mq.addEventListener("change", applyMode);

    const squash = (i: number, nx: number, ny: number) => {
      const el = inner.current[i];
      if (!el || s.reduced) return;
      const horiz = Math.abs(nx) > Math.abs(ny);
      gsap.fromTo(el, { scaleX: horiz ? .9 : 1.08, scaleY: horiz ? 1.08 : .9 },
        { scaleX: 1, scaleY: 1, duration: .5, ease: "elastic.out(1, .45)", overwrite: "auto" });
    };

    const tick = (_t: number, deltaMs: number) => {
      if (s.reduced || s.paused || document.hidden) return;
      const dt = Math.min(deltaMs, 50) / 1000;
      const B = bodies.current, W = size.w, H = size.h;
      for (let i = 0; i < B.length; i++) {
        const b = B[i];
        if (b.held) continue;
        // ease the speed back toward a calm cruise after a flick or a pile-up
        const sp = Math.hypot(b.vx, b.vy) || 1;
        const k = 1 + (CRUISE - sp) / sp * Math.min(1, dt * 1.6);
        b.vx *= k; b.vy *= k;
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < b.r + PAD)     { b.x = b.r + PAD;     if (b.vx < 0) { b.vx = -b.vx; if (sp > 60) squash(i, 1, 0); } }
        if (b.x > W - b.r - PAD) { b.x = W - b.r - PAD; if (b.vx > 0) { b.vx = -b.vx; if (sp > 60) squash(i, 1, 0); } }
        if (b.y < b.r + PAD)     { b.y = b.r + PAD;     if (b.vy < 0) { b.vy = -b.vy; if (sp > 60) squash(i, 0, 1); } }
        if (b.y > H - b.r - PAD) { b.y = H - b.r - PAD; if (b.vy > 0) { b.vy = -b.vy; if (sp > 60) squash(i, 0, 1); } }
      }
      // bubble ↔ bubble: push apart, then elastic bounce weighted by size
      for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) {
        const a = B[i], c = B[j];
        const dx = c.x - a.x, dy = c.y - a.y, dist = Math.hypot(dx, dy) || .01, min = a.r + c.r + 2;
        if (dist >= min) continue;
        const nx = dx / dist, ny = dy / dist, over = min - dist;
        const wa = a.held ? 0 : c.held ? 1 : c.m / (a.m + c.m), wc = 1 - wa;
        a.x -= nx * over * wa; a.y -= ny * over * wa;
        c.x += nx * over * wc; c.y += ny * over * wc;
        const rel = (c.vx - a.vx) * nx + (c.vy - a.vy) * ny;
        if (rel < 0) {
          const imp = (2 * rel) / (a.m + c.m);
          if (!a.held) { a.vx += imp * c.m * nx; a.vy += imp * c.m * ny; }
          if (!c.held) { c.vx -= imp * a.m * nx; c.vy -= imp * a.m * ny; }
          if (Math.abs(rel) > 70) { squash(i, nx, ny); squash(j, nx, ny); }
        }
      }
      for (let i = 0; i < B.length; i++) place(i);
    };
    gsap.ticker.add(tick);
    return () => { gsap.ticker.remove(tick); mq.removeEventListener("change", applyMode); wobble.forEach(t => t.kill()); };
  }, [size.w, size.h]);

  /* grab / flick / tap */
  const drag = useRef<{ i: number; id: number; ox: number; oy: number; sx: number; sy: number; moved: number;
    hist: { x: number; y: number; t: number }[] } | null>(null);

  const onDown = (i: number) => (e: React.PointerEvent<HTMLButtonElement>) => {
    const b = bodies.current[i], f = field.current;
    if (!b || !f || st.current.busy) return;
    const fr = f.getBoundingClientRect();
    const px = e.clientX - fr.left, py = e.clientY - fr.top;
    e.currentTarget.setPointerCapture(e.pointerId);
    b.held = true; b.vx = b.vy = 0;
    drag.current = { i, id: e.pointerId, ox: px - b.x, oy: py - b.y, sx: e.clientX, sy: e.clientY, moved: 0,
      hist: [{ x: px, y: py, t: e.timeStamp }] };
  };
  const onMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current, f = field.current;
    if (!d || d.id !== e.pointerId || !f) return;
    const b = bodies.current[d.i], fr = f.getBoundingClientRect();
    const px = e.clientX - fr.left, py = e.clientY - fr.top;
    d.moved = Math.max(d.moved, Math.hypot(e.clientX - d.sx, e.clientY - d.sy));
    b.x = clampNum(px - d.ox, b.r + PAD, size.w - b.r - PAD);
    b.y = clampNum(py - d.oy, b.r + PAD, size.h - b.r - PAD);
    d.hist.push({ x: px, y: py, t: e.timeStamp });
    if (d.hist.length > 6) d.hist.shift();
    if (st.current.reduced) place(d.i);
  };
  const onUp = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const b = bodies.current[d.i];
    b.held = false;
    if (d.moved < TAP_SLOP) { openBubble(d.i); return; }
    const h = d.hist, a = h[0], z = h[h.length - 1], dt = Math.max(16, z.t - a.t) / 1000;
    let vx = (z.x - a.x) / dt, vy = (z.y - a.y) / dt;
    const sp = Math.hypot(vx, vy);
    if (sp > MAX_THROW) { vx *= MAX_THROW / sp; vy *= MAX_THROW / sp; }
    if (st.current.reduced) { b.vx = b.vy = 0; return; }
    b.vx = vx || b.vx; b.vy = vy || b.vy;
  };

  const openBubble = useCallback((i: number) => {
    const s = st.current;
    if (s.busy || s.openIdx >= 0) return;
    s.busy = true; s.openIdx = i; s.paused = true;
    setOpen(i);
  }, []);

  /* grow the tapped bubble into the panel */
  useLayoutEffect(() => {
    if (open === null) return;
    const s = st.current, p = panel.current!, b = els.current[open]!;
    const r = b.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    s.inerted = Array.from(document.body.children).filter(el => el !== p && !el.hasAttribute("inert"));
    s.inerted.forEach(el => el.setAttribute("inert", ""));
    document.documentElement.style.overflow = "hidden";
    const q = gsap.utils.selector(p);
    const tl = gsap.timeline({ onComplete() { s.busy = false; (q(".sbp-close")[0] as HTMLElement)?.focus({ preventScroll: true }); } });
    s.tl = tl;
    if (s.reduced) tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 });
    else {
      tl.fromTo(inner.current[open], { scale: 1 }, { scale: 1.12, duration: .16, ease: "power2.out" })
        .fromTo(p, { clipPath: `circle(${r.width / 2}px at ${cx}px ${cy}px)` },
                   { clipPath: `circle(${far}px at ${cx}px ${cy}px)`, duration: .62, ease: "power3.inOut" }, .08)
        .fromTo(q(".sbp-title, .sbp-hook"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .45, stagger: .06, ease: "power2.out" }, .42)
        .fromTo(q(".sbp-body"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power2.out" }, .5)
        .set(inner.current[open], { scale: 1 });
    }
  }, [open]);

  const close = useCallback(() => {
    const s = st.current;
    if (s.openIdx < 0 || !s.tl || s.busy) return;
    s.busy = true;
    const i = s.openIdx;
    s.tl.eventCallback("onReverseComplete", () => {
      s.inerted.forEach(el => el.removeAttribute("inert")); s.inerted = [];
      document.documentElement.style.overflow = "";
      s.tl = null; s.openIdx = -1; s.busy = false; s.paused = false;
      setOpen(null);
      els.current[i]?.focus({ preventScroll: true });
    });
    s.tl.timeScale(1.5).reverse();
  }, []);

  useEffect(() => {
    if (open === null) return;
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [open, close]);

  useEffect(() => {
    const s = st.current;
    return () => {
      s.tl?.kill(); s.inerted.forEach(el => el.removeAttribute("inert"));
      document.documentElement.style.overflow = "";
    };
  }, []);

  const ob = open !== null ? bubbles[open] : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="sbf" ref={field} style={{ height: size.h || 440 }} role="group" aria-label="Sauce Bar 调料">
        {size.w > 0 && bubbles.map((b, i) => {
          const d = Math.round(Math.min(size.w, size.h * .85) * LAYOUT[i % LAYOUT.length].d);
          return (
            <button key={b.key} ref={el => { els.current[i] = el; }} className="sbb"
              onPointerDown={onDown(i)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}
              onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openBubble(i); } }}
              aria-haspopup="dialog" aria-label={`${b.titleEn} ${b.titleCn}`}
              style={{ width: d, height: d, ["--b-c" as string]: b.color, ["--b-d" as string]: b.deep, ["--b-s" as string]: `${d}px` }}>
              <span className="sbb-body" ref={el => { inner.current[i] = el; }}>
                <span className="e" aria-hidden="true">{b.emoji}</span>
                <b>{b.titleCn}</b>
                <i>{b.titleEn}</i>
              </span>
            </button>
          );
        })}
      </div>
      <div className="sbf-hint">点气泡看内容，也可以拖着甩 · Tap a bubble, or give it a flick</div>

      {ob && typeof document !== "undefined" && createPortal(
        <div className="sbp" ref={panel} role="dialog" aria-modal="true" aria-label={`${ob.titleEn} ${ob.titleCn}`}
          style={{ ["--b-c" as string]: ob.color, ["--b-d" as string]: ob.deep }}>
          <div className="sbp-head">
            <button className="sbp-close" onClick={close}>‹ 返回 Back</button>
            <div className="sbp-title">
              <span className="e" aria-hidden="true">{ob.emoji}</span>
              <span><b>{ob.titleCn}</b><s>{ob.titleEn}</s></span>
            </div>
            {ob.hookCn && <div className="sbp-hook">{ob.hookCn}</div>}
          </div>
          <div className="sbp-body">{renderContent(ob.key)}</div>
        </div>,
        document.body,
      )}
    </>
  );
}

function clampNum(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }
