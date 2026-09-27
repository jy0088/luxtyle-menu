"use client";
// src/components/ygf/SauceBubbles.tsx
// Sauce Bar level 2 as floating bubbles instead of banners. Each bubble drifts gently; a tap
// grows that bubble (clip-path circle) into a full-screen panel with its content, and closing
// shrinks it back into the same bubble. Reduced motion: bubbles hold still, panel fades.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") gsap.registerPlugin(useGSAP);

export type Bubble = {
  key: string; emoji: string; titleEn: string; titleCn: string; hookCn?: string;
  /** bubble body colour and its darker rim */
  color: string; deep: string;
};

// centre (fraction of field width / height) and diameter (fraction of the shorter side)
// (y stays above .82 so the bottom hint line is never covered)
const LAYOUT = [
  { x: .34, y: .245, d: .47 },
  { x: .72, y: .45,  d: .37 },
  { x: .29, y: .64,  d: .33 },
  { x: .71, y: .755, d: .29 },
];
const AMBIENT = 12;

const CSS = `
.sbf{ position:relative; overflow:hidden; border-radius:22px;
  background:radial-gradient(80% 60% at 50% 35%, #FFF6E6 0%, #F7EBD8 60%, #EFE0C8 100%); border:2px solid #E8D9C4 }
.sbf-amb{ position:absolute; bottom:-20px; border-radius:50%; pointer-events:none;
  background:radial-gradient(circle at 32% 30%, rgba(255,255,255,.9), rgba(255,255,255,.25) 45%, rgba(200,145,42,.18) 70%, transparent 72%) }
.sbb{ position:absolute; border-radius:50%; border:0; padding:0; cursor:pointer; -webkit-tap-highlight-color:transparent;
  display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff;
  background:
    radial-gradient(circle at 30% 26%, rgba(255,255,255,.55) 0 9%, rgba(255,255,255,0) 22%),
    radial-gradient(circle at 50% 55%, var(--b-c) 0%, var(--b-d) 100%);
  box-shadow: inset 0 -10px 22px rgba(0,0,0,.28), inset 0 6px 14px rgba(255,255,255,.18), 0 14px 30px rgba(60,35,10,.28);
  will-change:transform }
.sbb:focus-visible{ outline:3px solid #C8912A; outline-offset:4px }
.sbb .e{ font-size:calc(var(--b-s) * .2); line-height:1 }
.sbb b{ display:block; font-size:clamp(14px, calc(var(--b-s) * .135), 22px); font-weight:900; margin-top:6px; letter-spacing:.04em }
.sbb i{ display:block; font-style:normal; font-size:clamp(10.5px, calc(var(--b-s) * .075), 13px); opacity:.85; margin-top:2px; padding:0 10px; line-height:1.25 }
.sbb s{ display:block; text-decoration:none; font-size:clamp(10px, calc(var(--b-s) * .068), 12px); opacity:.75; margin-top:5px; padding:0 14%; line-height:1.3 }
.sbf-hint{ position:absolute; left:0; right:0; bottom:10px; text-align:center; font-size:12px; color:#8A7B66; pointer-events:none }

.sbp{ position:fixed; inset:0; z-index:80; display:flex; flex-direction:column; background:#FDFAF5; color:#1C1410;
  font-family:'Noto Sans SC','PingFang SC',sans-serif; -webkit-font-smoothing:antialiased }
.sbp-head{ position:relative; flex-shrink:0; color:#fff; padding:calc(14px + env(safe-area-inset-top, 0px)) 18px 20px;
  background:radial-gradient(120% 140% at 20% 0%, var(--b-c), var(--b-d)) }
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

type Props = { bubbles: Bubble[]; renderContent: (key: string) => ReactNode };

export default function SauceBubbles({ bubbles, renderContent }: Props) {
  const field = useRef<HTMLDivElement>(null);
  const bubbleEls = useRef<(HTMLButtonElement | null)[]>([]);
  const panel = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [open, setOpen] = useState<number | null>(null);
  const st = useRef({ reduced: false, busy: false, openIdx: -1, tl: null as gsap.core.Timeline | null, inerted: [] as Element[] });

  /* field fills the screen below it: viewport − its top − bottom nav − footer line */
  useLayoutEffect(() => {
    const el = field.current;
    if (!el) return;
    const nav = Array.from(document.querySelectorAll("nav")).find(n => getComputedStyle(n).position === "fixed");
    const fit = () => {
      const top = el.getBoundingClientRect().top + window.scrollY;
      const navH = nav ? nav.getBoundingClientRect().height : 0;
      const h = Math.max(380, Math.floor(window.innerHeight - top - navH - 96));
      setSize({ w: el.clientWidth, h });
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  /* idle drift + rising ambient bubbles */
  useGSAP(() => {
    if (!size.w) return;
    const mm = gsap.matchMedia();
    mm.add({ reduce: "(prefers-reduced-motion: reduce)", full: "(prefers-reduced-motion: no-preference)" }, ctx => {
      st.current.reduced = !!ctx.conditions?.reduce;
      if (ctx.conditions?.reduce) return;
      bubbleEls.current.forEach((b, i) => {
        if (!b) return;
        gsap.to(b, { x: gsap.utils.random(-9, 9), y: gsap.utils.random(-12, 12), rotation: gsap.utils.random(-3, 3),
          duration: gsap.utils.random(3.2, 4.8), ease: "sine.inOut", yoyo: true, repeat: -1, delay: i * .35 });
      });
      gsap.utils.toArray<HTMLElement>(".sbf-amb", field.current).forEach(a => {
        gsap.fromTo(a, { y: 0, autoAlpha: 0 }, {
          y: -(size.h + 60), autoAlpha: 1, duration: gsap.utils.random(9, 16), ease: "none", repeat: -1,
          delay: gsap.utils.random(0, 10),
          keyframes: { autoAlpha: [0, .9, .9, 0] },
        });
      });
    });
    return () => mm.revert();
  }, { dependencies: [size.w, size.h], scope: field });

  const openBubble = useCallback((i: number) => {
    const s = st.current;
    if (s.busy || s.openIdx >= 0) return;
    s.busy = true; s.openIdx = i;
    setOpen(i);
  }, []);

  /* grow the tapped bubble into the panel */
  useLayoutEffect(() => {
    if (open === null) return;
    const s = st.current, p = panel.current!, b = bubbleEls.current[open]!;
    const r = b.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    s.inerted = Array.from(document.body.children).filter(el => el !== p && !el.hasAttribute("inert"));
    s.inerted.forEach(el => el.setAttribute("inert", ""));
    document.documentElement.style.overflow = "hidden";
    const q = gsap.utils.selector(p);
    const tl = gsap.timeline({ onComplete() { s.busy = false; (q(".sbp-close")[0] as HTMLElement)?.focus({ preventScroll: true }); } });
    s.tl = tl;
    if (s.reduced) {
      tl.fromTo(p, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 });
    } else {
      tl.to(b, { scale: 1.12, duration: .16, ease: "power2.out" })
        .fromTo(p, { clipPath: `circle(${r.width / 2}px at ${cx}px ${cy}px)` },
                   { clipPath: `circle(${far}px at ${cx}px ${cy}px)`, duration: .62, ease: "power3.inOut" }, .08)
        .fromTo(q(".sbp-title, .sbp-hook"), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: .45, stagger: .06, ease: "power2.out" }, .42)
        .fromTo(q(".sbp-body"), { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .5, ease: "power2.out" }, .5)
        .set(b, { scale: 1 });
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
      s.tl = null; s.openIdx = -1; s.busy = false;
      setOpen(null);
      bubbleEls.current[i]?.focus({ preventScroll: true });
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

  const short = Math.min(size.w, size.h * .85);
  const ob = open !== null ? bubbles[open] : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="sbf" ref={field} style={{ height: size.h || 440 }} role="group" aria-label="Sauce Bar 调料">
        {Array.from({ length: AMBIENT }, (_, k) => {
          const d = 6 + ((k * 7) % 14);
          return <span key={k} className="sbf-amb" aria-hidden="true"
            style={{ left: `${(k * 83) % 100}%`, width: d, height: d, opacity: 0 }} />;
        })}
        {size.w > 0 && bubbles.map((b, i) => {
          const L = LAYOUT[i % LAYOUT.length];
          const d = Math.round(short * L.d);
          return (
            <button key={b.key} ref={el => { bubbleEls.current[i] = el; }} className="sbb"
              onClick={() => openBubble(i)} aria-haspopup="dialog" aria-label={`${b.titleEn} ${b.titleCn}`}
              style={{
                width: d, height: d, left: size.w * L.x - d / 2, top: size.h * L.y - d / 2,
                ["--b-c" as string]: b.color, ["--b-d" as string]: b.deep, ["--b-s" as string]: `${d}px`,
              }}>
              <span className="e" aria-hidden="true">{b.emoji}</span>
              <b>{b.titleCn}</b>
              <i>{b.titleEn}</i>
              {i === 0 && b.hookCn && d > 150 && <s>{b.hookCn}</s>}
            </button>
          );
        })}
        <div className="sbf-hint">点气泡看内容 · Tap a bubble</div>
      </div>

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
