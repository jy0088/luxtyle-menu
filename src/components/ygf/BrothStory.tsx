"use client";
// src/components/ygf/BrothStory.tsx
// Full-screen reading view for one broth. The tapped banner unfolds (clip-path inset) into the page;
// the story reads top-down as the steps of making the pot: a "simmer line" draws down the left as you
// scroll and lights each step, English lines slide up out of masks, Chinese fades in whole sentences,
// a stat counts up, ingredient chips pop in, and the three "good broth" checks draw their ticks.
// Slow auto-scroll (Kevin 2026-09-26: both motion modes) stops for good on any touch.
// Reduced motion: page fades in, everything is already drawn / visible.

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import type { BrothStory as Story } from "@/app/menu/ygf/picksData";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger, SplitText);

export type BrothInfo = {
  id: string; en: string; zh: string; img?: string;
  spicy: string; spicyLevels: { zh: string; en: string; chilies: number }[]; surcharge?: number;
};

type Props = {
  broth: BrothInfo;
  story: Story;
  skin: { c: string; d: string };
  /** element the page unfolds from and hands focus back to */
  origin: HTMLElement | null;
  onClosed: () => void;
};

const CSS = `
.bs{ position:fixed; inset:0; z-index:80; color:#F7EFE3; font-family:'Noto Sans SC','PingFang SC',sans-serif;
  -webkit-font-smoothing:antialiased; background:#120B08 }
.bs button{ font:inherit; color:inherit; background:none; border:0; padding:0; cursor:pointer; -webkit-tap-highlight-color:transparent }
.bs button:focus-visible, .bs a:focus-visible{ outline:2px solid #fff; outline-offset:3px; border-radius:10px }
.bs-bg{ position:absolute; inset:0; pointer-events:none;
  background: radial-gradient(110% 60% at 50% 0%, color-mix(in srgb, var(--b-c) 70%, transparent), transparent 72%),
              linear-gradient(180deg, var(--b-d) 0%, #140C08 62%) }
.bs .bs-close{ position:absolute; z-index:4; left:14px; top:calc(12px + env(safe-area-inset-top, 0px)); display:flex; align-items:center; gap:6px;
  padding:9px 14px 9px 11px; border-radius:999px; background:rgba(10,6,4,.5); border:1px solid rgba(255,255,255,.28);
  backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); font-size:15px; font-weight:700 }
.bs-topfade{ position:absolute; z-index:3; left:0; right:0; top:0; height:calc(70px + env(safe-area-inset-top, 0px)); pointer-events:none;
  background:linear-gradient(180deg, color-mix(in srgb, var(--b-d) 92%, #000) 35%, transparent); opacity:0; transition:opacity .25s }
.bs[data-scrolled="1"] .bs-topfade{ opacity:1 }
.bs-scroll{ position:relative; height:100%; overflow-y:auto; -webkit-overflow-scrolling:touch; overscroll-behavior:contain }
.bs-inner{ max-width:560px; margin:0 auto; padding-bottom:calc(40px + env(safe-area-inset-bottom, 0px)) }
.bs-hero{ position:relative; aspect-ratio:1 / 1; max-height:54vh; width:100%; margin:0 auto; overflow:hidden; border-radius:0 0 30px 30px;
  background: radial-gradient(circle at 50% 60%, var(--b-c), var(--b-d)) }
/* Source images are cropped posters with title text clipped on the left; frame the bowl (right half) only. */
.bs-hero img{ position:absolute; width:172%; max-width:none; aspect-ratio:1 / 1; right:0; bottom:0; display:block; transform-origin:70% 70% }
.bs-hero::after{ content:""; position:absolute; inset:auto 0 0 0; height:18%; background:linear-gradient(transparent, rgba(0,0,0,.35)) }
.bs-hero .bowl{ position:absolute; inset:0; display:grid; place-items:center; font-size:88px; opacity:.9 }
.bs-head{ padding:22px 22px 4px }
.bs-name{ font-size:clamp(30px, 9vw, 40px); font-weight:900; line-height:1.05; letter-spacing:-.02em; margin:0; text-wrap:balance }
.bs-zh{ font-size:20px; font-weight:800; letter-spacing:.18em; margin-top:10px; color:rgba(247,239,227,.9) }
.bs-kick{ margin-top:14px; font-size:17px; line-height:1.5; color:#fff; text-wrap:pretty }
.bs-kick span{ display:block; font-size:15.5px; color:rgba(247,239,227,.78); margin-top:3px }

.bs-steps{ position:relative; margin:26px 22px 0; padding-left:34px }
.bs-rail, .bs-fire{ position:absolute; left:9px; top:6px; bottom:6px; width:2px; border-radius:2px }
.bs-rail{ background:rgba(255,255,255,.14) }
.bs-fire{ transform-origin:top center; background:linear-gradient(180deg, color-mix(in srgb, var(--b-c) 40%, #fff), var(--b-c));
  box-shadow:0 0 12px color-mix(in srgb, var(--b-c) 70%, transparent) }
.bs-step{ position:relative; padding-bottom:30px }
.bs-step:last-child{ padding-bottom:4px }
.bs-dot{ position:absolute; left:-34px; top:2px; width:20px; height:20px; border-radius:50%;
  border:2px solid rgba(255,255,255,.3); background:#1a110c; transition:background .35s, border-color .35s, box-shadow .35s }
.bs-step[data-lit="1"] .bs-dot{ background:var(--b-c); border-color:color-mix(in srgb, var(--b-c) 45%, #fff);
  box-shadow:0 0 0 5px color-mix(in srgb, var(--b-c) 22%, transparent) }
.bs-lbl{ font-size:12.5px; font-weight:800; letter-spacing:.22em; color:color-mix(in srgb, var(--b-c) 55%, #fff) }
.bs-lbl span{ letter-spacing:.12em; margin-left:6px; opacity:.85 }
.bs-stat{ display:flex; align-items:baseline; gap:10px; margin-top:8px }
.bs-stat b{ font-size:58px; font-weight:900; line-height:1; font-variant-numeric:tabular-nums; color:#fff }
.bs-stat i{ font-style:normal; font-size:15px; line-height:1.35; color:rgba(247,239,227,.85) }
.bs-en{ font-size:18px; line-height:1.55; margin:9px 0 0; color:#fff }
.bs-cn{ font-size:17px; line-height:1.75; margin:6px 0 0; color:rgba(247,239,227,.86); text-wrap:pretty }
.bs-chips{ display:flex; flex-wrap:wrap; gap:7px; margin-top:12px }
.bs-chip{ font-size:14px; padding:7px 12px; border-radius:999px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22) }
.bs-chip small{ font-size:12px; opacity:.75; margin-left:5px }

.bs-good{ margin:30px 22px 0; padding:18px 18px 8px; border-radius:20px; background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.14) }
.bs-good h3{ margin:0; font-size:17px; font-weight:900 }
.bs-good h3 span{ display:block; font-size:14px; font-weight:600; color:rgba(247,239,227,.75); margin-top:2px }
.bs-check{ display:flex; align-items:center; gap:12px; padding:12px 0; border-top:1px solid rgba(255,255,255,.1) }
.bs-check:first-of-type{ margin-top:12px }
.bs-check svg{ flex-shrink:0; width:28px; height:28px }
.bs-check b{ display:block; font-size:17px; font-weight:800 }
.bs-check i{ display:block; font-style:normal; font-size:14px; color:rgba(247,239,227,.75); margin-top:1px }

.bs-foot{ margin:24px 22px 0; display:flex; flex-direction:column; gap:14px }
.bs-heat{ display:flex; flex-wrap:wrap; gap:8px }
.bs-heat span{ font-size:14px; padding:7px 12px; border-radius:12px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.16) }
.bs-row{ display:flex; align-items:center; justify-content:space-between; gap:10px }
.bs-price{ font-size:14.5px; font-weight:800; padding:8px 12px; border-radius:10px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.2) }
.bs-combo{ text-decoration:none; color:#1a0f0a; background:#fff; font-weight:900; font-size:15px; padding:12px 18px; border-radius:14px; white-space:nowrap }
.bs-mask{ display:block; overflow:clip }
`;

export default function BrothStory({ broth, story, skin, origin, onClosed }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const st = useRef({ tl: null as gsap.core.Timeline | null, busy: true, inerted: [] as Element[],
    auto: null as gsap.core.Tween | null, abort: null as AbortController | null, ctx: null as gsap.Context | null });

  const stopAuto = useCallback(() => {
    const s = st.current;
    s.auto?.kill(); s.auto = null;
    s.abort?.abort(); s.abort = null;
  }, []);

  useLayoutEffect(() => {
    const s = st.current, el = root.current!, sc = scroller.current!;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    s.inerted = Array.from(document.body.children).filter(n => n !== el && !n.hasAttribute("inert"));
    s.inerted.forEach(n => n.setAttribute("inert", ""));
    document.documentElement.style.overflow = "hidden";

    const r = origin?.getBoundingClientRect();
    const from = r
      ? `inset(${r.top}px ${Math.max(0, innerWidth - r.right)}px ${Math.max(0, innerHeight - r.bottom)}px ${r.left}px round 18px)`
      : "inset(40% 8% 40% 8% round 18px)";

    s.ctx = gsap.context(() => {
      const q = gsap.utils.selector(el);
      const tl = gsap.timeline({
        onComplete() { s.busy = false; (q(".bs-close")[0] as HTMLElement)?.focus({ preventScroll: true }); startAuto(); },
      });
      s.tl = tl;

      if (reduced) {
        tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration: .25 });
        return;                                   // everything below stays in its drawn, visible end state
      }

      // 1. the banner unfolds into the page
      tl.fromTo(el, { clipPath: from }, { clipPath: "inset(0px 0px 0px 0px round 0px)", duration: .7, ease: "power3.inOut" })
        .from(q(".bs-hero img, .bs-hero .bowl"), { scale: 1.18, duration: 1.1, ease: "power2.out" }, .15)
        .fromTo(q(".bs-close"), { autoAlpha: 0 }, { autoAlpha: 1, duration: .3 }, .5);

      // 2. headline: English words rise out of masks, Chinese fades in whole
      const head = SplitText.create(q(".bs-name"), { type: "words", mask: "words" });
      tl.from(head.words, { yPercent: 110, duration: .7, ease: "power4.out", stagger: .07 }, .45)
        .from(q(".bs-zh, .bs-kick"), { autoAlpha: 0, y: 12, duration: .55, ease: "power2.out", stagger: .1 }, .6);

      // 3. the simmer line draws with the scroll; each step lights when the line reaches it
      gsap.fromTo(q(".bs-fire"), { scaleY: 0 }, {
        scaleY: 1, ease: "none",
        scrollTrigger: { scroller: sc, trigger: q(".bs-steps")[0], start: "top 72%", end: "bottom 62%", scrub: .4 },
      });
      q(".bs-step").forEach(step => {
        const en = step.querySelector(".bs-en"), cn = step.querySelector(".bs-cn");
        const lines = en ? SplitText.create(en, { type: "lines", mask: "lines" }).lines : [];
        const stepTl = gsap.timeline({ paused: true })
          .from(step.querySelector(".bs-lbl"), { autoAlpha: 0, x: -10, duration: .4, ease: "power2.out" })
          .from(lines, { yPercent: 105, duration: .6, ease: "power3.out", stagger: .08 }, .08)
          .from(cn, { autoAlpha: 0, y: 10, duration: .55, ease: "power2.out" }, .25);
        const stat = step.querySelector<HTMLElement>(".bs-stat b");
        if (stat) {
          const obj = { v: 0 }, n = Number(stat.dataset.n);
          stat.textContent = "0";                 // counts up when the step is reached
          stepTl.to(obj, { v: n, duration: 1.1, ease: "power2.out", onUpdate: () => { stat.textContent = String(Math.round(obj.v)); } }, 0);
        }
        const chips = step.querySelectorAll(".bs-chip");
        if (chips.length) stepTl.from(chips, { autoAlpha: 0, scale: .6, y: 8, duration: .45, ease: "back.out(2)", stagger: .07 }, .35);
        ScrollTrigger.create({
          scroller: sc, trigger: step, start: "top 78%", once: true,
          onEnter: () => { step.setAttribute("data-lit", "1"); stepTl.play(); },
        });
      });

      // 4. good-broth checks: ticks draw one after another
      const ticks = Array.from(el.querySelectorAll<SVGPathElement>(".bs-check path"));
      ticks.forEach(p => { const len = p.getTotalLength(); gsap.set(p, { strokeDasharray: len, strokeDashoffset: len }); });
      const goodTl = gsap.timeline({ paused: true })
        .from(q(".bs-good"), { autoAlpha: 0, y: 16, duration: .5, ease: "power2.out" })
        .from(q(".bs-check b, .bs-check i"), { autoAlpha: 0, x: 8, duration: .4, stagger: .08 }, .2)
        .to(ticks, { strokeDashoffset: 0, duration: .45, ease: "power2.inOut", stagger: .28 }, .25);
      ScrollTrigger.create({ scroller: sc, trigger: q(".bs-good")[0], start: "top 82%", once: true, onEnter: () => goodTl.play() });
    }, el);

    if (reduced) q2(el, ".bs-step").forEach(n => n.setAttribute("data-lit", "1"));

    function startAuto() {
      const max = sc.scrollHeight - sc.clientHeight;
      if (max < 12) return;
      s.abort = new AbortController();
      ["pointerdown", "touchstart", "wheel", "keydown"].forEach(ev => sc.addEventListener(ev, stopAuto, { passive: true, signal: s.abort!.signal }));
      s.auto = gsap.to(sc, { scrollTop: max, duration: max / 26, ease: "none", delay: 1.4, onComplete: stopAuto });
    }

    return () => { stopAuto(); s.ctx?.revert(); };
  }, [origin, stopAuto]);

  const close = useCallback(() => {
    const s = st.current;
    if (s.busy || !s.tl) return;
    s.busy = true;
    stopAuto();
    scroller.current?.scrollTo({ top: 0 });
    const done = () => {
      s.inerted.forEach(n => n.removeAttribute("inert")); s.inerted = [];
      document.documentElement.style.overflow = "";
      origin?.focus({ preventScroll: true });
      onClosed();
    };
    s.tl.eventCallback("onReverseComplete", done);
    s.tl.timeScale(1.6).reverse();
  }, [origin, onClosed, stopAuto]);

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onEsc);
    const s = st.current;
    return () => {
      document.removeEventListener("keydown", onEsc);
      s.inerted.forEach(n => n.removeAttribute("inert"));
      document.documentElement.style.overflow = "";
    };
  }, [close]);

  return createPortal(
    <div className="bs" ref={root} role="dialog" aria-modal="true" aria-label={`${broth.en} ${broth.zh}`}
      style={{ ["--b-c" as string]: skin.c, ["--b-d" as string]: skin.d }}>
      <style>{CSS}</style>
      <div className="bs-bg" />
      <div className="bs-topfade" aria-hidden="true" />
      <button className="bs-close" onClick={close}>‹ 返回 Back</button>
      <div className="bs-scroll" ref={scroller}
        onScroll={e => root.current?.setAttribute("data-scrolled", e.currentTarget.scrollTop > 40 ? "1" : "0")}>
        <div className="bs-inner">
          <div className="bs-hero">
            {broth.img ? <img src={broth.img} alt={`${broth.en} ${broth.zh}`} /> : <span className="bowl" aria-hidden="true">🍲</span>}
          </div>

          <div className="bs-head">
            <h2 className="bs-name">{broth.en}</h2>
            <div className="bs-zh">{broth.zh}</div>
            <p className="bs-kick">{story.kicker.en}<span>{story.kicker.cn}</span></p>
          </div>

          <div className="bs-steps">
            <span className="bs-rail" aria-hidden="true" />
            <span className="bs-fire" aria-hidden="true" />
            {story.steps.map((stp, k) => (
              <section key={k} className="bs-step" data-lit="0">
                <span className="bs-dot" aria-hidden="true" />
                <div className="bs-lbl">{stp.label.en}<span>{stp.label.cn}</span></div>
                {stp.stat && (
                  <div className="bs-stat">
                    <b data-n={stp.stat.n}>{stp.stat.n}</b>
                    <i>{stp.stat.unit.en}<br />{stp.stat.unit.cn}</i>
                  </div>
                )}
                <p className="bs-en">{stp.en}</p>
                <p className="bs-cn">{stp.cn}</p>
                {stp.chips && (
                  <div className="bs-chips">
                    {stp.chips.map(c => <span key={c.en} className="bs-chip">{c.cn}<small>{c.en}</small></span>)}
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="bs-good">
            <h3>{story.checkTitle.cn}<span>{story.checkTitle.en}</span></h3>
            {story.checks.map(ck => (
              <div key={ck.en} className="bs-check">
                <svg viewBox="0 0 28 28" aria-hidden="true">
                  <circle cx="14" cy="14" r="13" fill="none" stroke="rgba(255,255,255,.25)" strokeWidth="1.5" />
                  <path d="M8 14.5l4 4 8-9" fill="none" stroke={skin.c === "#2A86A6" ? "#8FD4EC" : "#fff"} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span><b>{ck.cn}</b><i>{ck.en}</i></span>
              </div>
            ))}
          </div>

          <div className="bs-foot">
            <div className="bs-heat" aria-label="Heat 辣度">
              {broth.spicyLevels.length === 0
                ? <span>🍃 {broth.spicy}</span>
                : broth.spicyLevels.map(lv => <span key={lv.en}>{lv.zh} {lv.en} {"🌶".repeat(lv.chilies)}</span>)}
            </div>
            <div className="bs-row">
              <span className="bs-price">{broth.surcharge ? `+$${broth.surcharge.toFixed(2)} / bowl` : "Included 免费"}</span>
              <Link href={`/menu/ygf/broth/${broth.id}`} className="bs-combo">查看搭配 Combos ›</Link>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function q2(el: HTMLElement, sel: string) { return Array.from(el.querySelectorAll(sel)); }
