"use client";
// src/components/ygf/PsstWidget.tsx
// 杨国福 · 小福有话说 (Psst… from YGF)
// 频道引流挂件 —— 碗吉祥物「小福」从卡片上沿探头 + 对话气泡。
//
// 设计约束(已定稿):
//   · 名字不点破优惠内容 —— 挂件只负责邀请,优惠实体只存在于 WhatsApp 频道
//   · 开放不排他 —— 不出现「会员」「专属」这类让新客觉得与己无关的词
//   · 英文为主、中文为辅
//   · 内容区(children)留空给运营填,空着时退回通用邀请文案,不会显示占位残留
//
// 用法见文件底部注释。

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ---------- 小福的配色 ---------- */
/* 取自麻辣烫本身:汤底琥珀、辣油朱红、葱花青、瓷碗月白蓝 */
const F = {
  broth: '#E7A33E',       // 汤底琥珀
  chili: '#C4321F',       // 辣油朱红
  chiliLt: '#E05437',
  scallion: '#6FA860',    // 葱花青
  porcelain: '#F6F1E7',   // 瓷白
  rim: '#8FB0CC',         // 碗沿月白蓝
  rimDark: '#6E93B2',
  ink: '#2A1F1A',
  inkSoft: '#7A6A5E',
  cream: '#FFFDF8',
  wa: '#1FA855',          // WhatsApp 绿(仅按钮)
};

/* ================================================================
   小福 —— Q 版麻辣烫碗,从卡片上沿探头
   两只小手扒住卡片边缘,碗身下半截被卡片挡住
   ================================================================ */
function XiaoFu({ size = 132 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size * 0.78}
      viewBox="0 0 132 103"
      fill="none"
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      {/* 热气 */}
      <g className="pw-steam" stroke={F.broth} strokeWidth="3" strokeLinecap="round" opacity="0.55">
        <path d="M50 22c-4-5 4-9 0-14" />
        <path d="M66 17c-4-6 4-10 0-15" />
        <path d="M82 22c-4-5 4-9 0-14" />
      </g>

      {/* 碗身 */}
      <path
        d="M16 50c0 26 22 44 50 44s50-18 50-44z"
        fill={F.porcelain}
        stroke={F.rimDark}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {/* 碗沿 */}
      <rect x="10" y="41" width="112" height="13" rx="6.5" fill={F.rim} />
      <rect x="10" y="41" width="112" height="5.5" rx="2.75" fill="#A6C2D8" />

      {/* 汤面 + 料 */}
      <clipPath id="pw-broth">
        <rect x="16" y="30" width="100" height="12" rx="5" />
      </clipPath>
      <rect x="16" y="30" width="100" height="12" rx="5" fill={F.broth} />
      <g clipPath="url(#pw-broth)">
        <circle cx="38" cy="36" r="3.4" fill={F.chili} />
        <circle cx="94" cy="35" r="3" fill={F.chiliLt} />
        <rect x="54" y="31" width="9" height="4" rx="2" fill={F.scallion} />
        <rect x="72" y="36" width="8" height="3.6" rx="1.8" fill={F.scallion} />
      </g>

      {/* 表情 */}
      <g className="pw-face">
        <ellipse cx="50" cy="68" rx="4.6" ry="5.4" fill={F.ink} />
        <ellipse cx="82" cy="68" rx="4.6" ry="5.4" fill={F.ink} />
        <circle cx="51.6" cy="66" r="1.7" fill="#fff" />
        <circle cx="83.6" cy="66" r="1.7" fill="#fff" />
        <ellipse cx="37" cy="76" rx="6" ry="3.6" fill={F.chiliLt} opacity="0.35" />
        <ellipse cx="95" cy="76" rx="6" ry="3.6" fill={F.chiliLt} opacity="0.35" />
        {/* 抿嘴笑 —— 有点神秘,配合「悄悄话」 */}
        <path d="M59 79c3.4 3.4 10.6 3.4 14 0" stroke={F.ink} strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>

      {/* 两只小手扒住卡片边缘 */}
      <g fill={F.porcelain} stroke={F.rimDark} strokeWidth="2.6" strokeLinejoin="round">
        <path d="M18 88c-6 0-10 3-10 7h20c0-4-4-7-10-7z" />
        <path d="M114 88c-6 0-10 3-10 7h20c0-4-4-7-10-7z" />
      </g>
    </svg>
  );
}

/* ================================================================
   挂件本体
   ================================================================ */
export interface PsstWidgetProps {
  open: boolean;
  onClose: () => void;
  /** 杨国福 WhatsApp 频道链接 */
  channelUrl: string;
  /** 内容区 —— 留空时显示通用邀请文案 */
  children?: ReactNode;
}

export default function PsstWidget({ open, onClose, channelUrl, children }: PsstWidgetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!open) return;
    setMounted(true);
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  function follow() {
    window.open(channelUrl, '_blank', 'noopener,noreferrer');
    onClose();
  }

  return (
    <>
      <style>{PW_CSS}</style>

      <div
        className="pw-scrim"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pw-title"
        onClick={onClose}
      >
        <div className={`pw-wrap${mounted ? ' pw-in' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* 小福 + 气泡 */}
          <div className="pw-mascot">
            <div className="pw-bubble" aria-hidden="true">
              Psst…
              <span className="pw-bubble-tail" />
            </div>
            <XiaoFu />
          </div>

          {/* 卡片 */}
          <div className="pw-card">
            <button ref={closeRef} className="pw-x" onClick={onClose} aria-label="关闭 Close">
              ×
            </button>

            <h2 id="pw-title" className="pw-title">
              Psst… from YGF
              <span className="pw-title-cn">小福有话说</span>
            </h2>

            <div className="pw-body">
              {children ?? (
                <p className="pw-default">
                  There&apos;s a bit more going on than what&apos;s in your bowl.
                  Follow us on WhatsApp and you&apos;ll be the first to know.
                  <span>碗里之外还有点别的,关注频道第一时间知道。</span>
                </p>
              )}
            </div>

            <button className="pw-cta" onClick={follow}>
              Follow on WhatsApp
              <span>关注频道</span>
            </button>
            <button className="pw-later" onClick={onClose}>
              Maybe later 下次再说
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   样式
   ================================================================ */
const PW_CSS = `
.pw-scrim{
  position:fixed; inset:0; z-index:70;
  display:flex; align-items:center; justify-content:center;
  padding:24px 20px calc(24px + env(safe-area-inset-bottom));
  background:rgba(36,24,18,.52);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
}
.pw-wrap{ width:100%; max-width:340px; }

/* 小福探头 —— 负边距让碗压在卡片上沿 */
.pw-mascot{
  position:relative; display:flex; justify-content:center;
  margin-bottom:-15px; pointer-events:none;
}
.pw-bubble{
  position:absolute; top:-6px; right:2px;
  background:${F.cream}; color:${F.ink};
  font-size:15px; font-weight:800; letter-spacing:.2px;
  padding:7px 13px 8px; border-radius:16px;
  border:2.5px solid ${F.rimDark};
  box-shadow:0 4px 0 rgba(110,147,178,.28);
}
.pw-bubble-tail{
  position:absolute; left:12px; bottom:-9px;
  width:13px; height:13px; background:${F.cream};
  border-left:2.5px solid ${F.rimDark};
  border-bottom:2.5px solid ${F.rimDark};
  transform:rotate(-45deg) skew(-6deg,-6deg); border-radius:0 0 0 4px;
}

.pw-card{
  position:relative; background:${F.cream};
  border:3px solid ${F.rimDark}; border-radius:26px;
  padding:26px 22px 20px;
  box-shadow:0 18px 44px rgba(42,31,26,.30);
}
.pw-x{
  position:absolute; top:11px; right:12px;
  width:30px; height:30px; border-radius:50%;
  border:none; background:rgba(42,31,26,.07); color:${F.inkSoft};
  font-size:19px; line-height:1; cursor:pointer;
}
.pw-x:hover{ background:rgba(42,31,26,.14); }

.pw-title{
  margin:0 0 14px; text-align:center;
  font-size:23px; font-weight:900; letter-spacing:-.3px; color:${F.chili};
}
.pw-title-cn{
  display:block; margin-top:3px;
  font-size:13px; font-weight:700; color:${F.inkSoft}; letter-spacing:.6px;
}

.pw-body{ min-height:34px; }
.pw-default{
  margin:0; text-align:center; font-size:13.5px; line-height:1.62; color:${F.ink};
}
.pw-default span{
  display:block; margin-top:6px; font-size:12px; color:${F.inkSoft};
}

.pw-cta{
  display:block; width:100%; margin-top:18px;
  background:${F.wa}; color:#fff; border:none;
  border-radius:16px; padding:13px 0 11px;
  font-size:15px; font-weight:800; cursor:pointer;
  box-shadow:0 4px 0 #17803F;
  transition:transform .1s, box-shadow .1s;
}
.pw-cta span{ display:block; font-size:11px; font-weight:600; opacity:.9; margin-top:1px; }
.pw-cta:active{ transform:translateY(3px); box-shadow:0 1px 0 #17803F; }

.pw-later{
  display:block; width:100%; margin-top:9px;
  background:none; border:none; cursor:pointer;
  font-size:12px; font-weight:600; color:${F.inkSoft};
}

/* 入场:小福从下方顶上来,气泡随后弹出 —— 一次性,不循环 */
@keyframes pw-rise{ from{ transform:translateY(26px); opacity:0 } to{ transform:none; opacity:1 } }
@keyframes pw-pop { 0%{ transform:scale(.4); opacity:0 } 70%{ transform:scale(1.08) } 100%{ transform:scale(1); opacity:1 } }
@keyframes pw-steam{ 0%{ opacity:.55; transform:translateY(0) } 100%{ opacity:0; transform:translateY(-9px) } }

.pw-in .pw-card  { animation:pw-rise .34s cubic-bezier(.22,1.2,.4,1) both; }
.pw-in .pw-mascot{ animation:pw-rise .40s cubic-bezier(.22,1.4,.4,1) both; }
.pw-in .pw-bubble{ animation:pw-pop .30s cubic-bezier(.3,1.6,.5,1) .30s both; transform-origin:12px bottom; }
.pw-steam        { animation:pw-steam 2.6s ease-out infinite; }

@media (prefers-reduced-motion: reduce){
  .pw-in .pw-card, .pw-in .pw-mascot, .pw-in .pw-bubble{ animation:none; }
  .pw-steam{ animation:none; }
  .pw-cta{ transition:none; }
}
`;

/* ================================================================
   接入方式
   ================================================================

   1) src/app/menu/ygf/page.tsx 顶部:

      import PsstWidget from '@/components/ygf/PsstWidget';
      const YGF_CHANNEL = 'https://whatsapp.com/channel/0029VbDtDTY9RZAO8pD1k33z';

   2) 组件内加状态 —— 进入菜单阶段后延时弹出,当天只弹一次:

      const [psst, setPsst] = useState(false);
      useEffect(() => {
        if (phase !== 'menu') return;                      // 走完启动引导再弹
        const today = new Date().toDateString();
        if (localStorage.getItem('ygf-psst') === today) return;
        const t = setTimeout(() => {
          setPsst(true);
          localStorage.setItem('ygf-psst', today);
        }, 1200);
        return () => clearTimeout(t);
      }, [phase]);

   3) JSX 里(AppShell 之外,与 CartBar 同级):

      <PsstWidget open={psst} onClose={() => setPsst(false)} channelUrl={YGF_CHANNEL} />

   4) 以后要放具体内容,把文案作为 children 传进去即可,不必改组件:

      <PsstWidget open={psst} onClose={() => setPsst(false)} channelUrl={YGF_CHANNEL}>
        <p style={{ margin:0, textAlign:'center', fontSize:14, lineHeight:1.6 }}>
          这周频道里有点好东西。
        </p>
      </PsstWidget>

   ================================================================ */
