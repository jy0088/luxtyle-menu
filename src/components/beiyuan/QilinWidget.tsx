"use client";
// src/components/beiyuan/QilinWidget.tsx
// 北苑南家 · 小麒麟有话说 (Psst… from Bei Yuan)
// WhatsApp 频道引流挂件 —— 小麒麟从卡片上沿探出来。
//
// 与杨国福「小福有话说」(components/ygf/PsstWidget.tsx) 是同一套机制,
// 刻意保持成对:顾客在两个品牌看到同样的形态,会认得出这是同一件事。
// 差异只在吉祥物与配色 —— 北苑走墨绿 + 鎏金,杨国福走瓷碗蓝。
//
// 设计约束(沿用已定稿的那几条):
//   · 名字不点破优惠内容 —— 挂件只负责邀请
//   · 开放不排他 —— 不出现「会员」「专属」这类让新客觉得与己无关的词
//   · 英文为主、中文为辅
//   · 内容区(children)留空给运营填,空着时退回通用邀请文案
//
// 用法见文件底部注释。

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* ---------- 北苑配色 ---------- */
const B = {
  brand: '#0D4A2E',      // 墨绿(品牌主色)
  brandDark: '#092E1C',
  gold: '#C9A84C',       // 鎏金
  goldLight: '#F0D98A',
  goldPale: '#FAF3DF',
  cream: '#FFFDF8',
  ink: '#1A1A1A',
  inkSoft: '#7A736A',
  wa: '#1FA855',         // WhatsApp 绿(仅按钮)
};

/** 小麒麟立绘 —— 放在 public/ 下 */
const QILIN_SRC = '/beiyuan-qilin-teal-drink.webp';

export interface QilinWidgetProps {
  open: boolean;
  onClose: () => void;
  /** 北苑 WhatsApp 频道链接 */
  channelUrl: string;
  /** 内容区 —— 留空时显示通用邀请文案 */
  children?: ReactNode;
}

export default function QilinWidget({ open, onClose, channelUrl, children }: QilinWidgetProps) {
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
      <style>{QW_CSS}</style>

      <div
        className="qw-scrim"
        role="dialog"
        aria-modal="true"
        aria-labelledby="qw-title"
        onClick={onClose}
      >
        <div className={`qw-wrap${mounted ? ' qw-in' : ''}`} onClick={(e) => e.stopPropagation()}>
          {/* 小麒麟 + 气泡 */}
          <div className="qw-mascot">
            <div className="qw-bubble" aria-hidden="true">
              Psst…
              <span className="qw-bubble-tail" />
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="qw-qilin" src={QILIN_SRC} alt="" aria-hidden="true" />
          </div>

          {/* 卡片 */}
          <div className="qw-card">
            <button ref={closeRef} className="qw-x" onClick={onClose} aria-label="关闭 Close">
              ×
            </button>

            <h2 id="qw-title" className="qw-title">
              Psst… from Bei Yuan
              <span className="qw-title-cn">小麒麟有话说</span>
            </h2>

            <div className="qw-body">
              {children ?? (
                <p className="qw-default">
                  New drinks, seasonal picks and the odd surprise — we post them on
                  WhatsApp first. Follow along and you&apos;ll hear it before the menu changes.
                  <span>新品、季节限定和一些小惊喜，都先发在频道里。</span>
                </p>
              )}
            </div>

            <button className="qw-cta" onClick={follow}>
              Follow on WhatsApp
              <span>关注频道</span>
            </button>
            <button className="qw-later" onClick={onClose}>
              Maybe later 下次再说
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ================================================================
   样式 —— 只动 transform / opacity,老机器上不会掉帧
   ================================================================ */
const QW_CSS = `
.qw-scrim{
  position:fixed; inset:0; z-index:70;
  display:flex; align-items:center; justify-content:center;
  padding:24px 20px calc(24px + env(safe-area-inset-bottom));
  background:rgba(12,32,22,.55);
  -webkit-backdrop-filter:blur(6px); backdrop-filter:blur(6px);
}
.qw-wrap{ width:100%; max-width:340px; }

/* 小麒麟探头 —— 负边距让他压在卡片上沿 */
.qw-mascot{
  position:relative; display:flex; justify-content:center;
  margin-bottom:-34px; pointer-events:none;
}
.qw-qilin{
  display:block; width:auto; height:158px;
  filter:drop-shadow(0 6px 10px rgba(9,46,28,.28));
}
.qw-bubble{
  position:absolute; top:4px; right:-2px;
  background:${B.cream}; color:${B.brand};
  font-size:15px; font-weight:800; letter-spacing:.2px;
  padding:7px 13px 8px; border-radius:16px;
  border:2.5px solid ${B.brand};
  box-shadow:0 4px 0 rgba(13,74,46,.22);
}
.qw-bubble-tail{
  position:absolute; left:14px; bottom:-9px;
  width:13px; height:13px; background:${B.cream};
  border-left:2.5px solid ${B.brand};
  border-bottom:2.5px solid ${B.brand};
  transform:rotate(-45deg) skew(-6deg,-6deg); border-radius:0 0 0 4px;
}

.qw-card{
  position:relative; background:${B.cream};
  border:3px solid ${B.brand}; border-radius:26px;
  padding:30px 22px 20px;
  box-shadow:0 18px 44px rgba(9,46,28,.32);
}
.qw-x{
  position:absolute; top:11px; right:12px;
  width:30px; height:30px; border-radius:50%;
  border:none; background:rgba(13,74,46,.08); color:${B.inkSoft};
  font-size:19px; line-height:1; cursor:pointer;
}
.qw-x:hover{ background:rgba(13,74,46,.16); }

.qw-title{
  margin:0 0 14px; text-align:center;
  font-size:22px; font-weight:900; letter-spacing:-.3px; color:${B.brand};
}
.qw-title-cn{
  display:block; margin-top:4px;
  font-size:13px; font-weight:700; color:${B.gold}; letter-spacing:.8px;
}

.qw-body{ min-height:34px; }
.qw-default{
  margin:0; text-align:center; font-size:13.5px; line-height:1.62; color:${B.ink};
}
.qw-default span{
  display:block; margin-top:6px; font-size:12px; color:${B.inkSoft};
}

.qw-cta{
  display:block; width:100%; margin-top:18px;
  background:${B.wa}; color:#fff; border:none;
  border-radius:16px; padding:13px 0 11px;
  font-size:15px; font-weight:800; cursor:pointer;
  box-shadow:0 4px 0 #17803F;
  transition:transform .1s, box-shadow .1s;
}
.qw-cta span{ display:block; font-size:11px; font-weight:600; opacity:.9; margin-top:1px; }
.qw-cta:active{ transform:translateY(3px); box-shadow:0 1px 0 #17803F; }

.qw-later{
  display:block; width:100%; margin-top:9px;
  background:none; border:none; cursor:pointer;
  font-size:12px; font-weight:600; color:${B.inkSoft};
}

/* 入场:卡片与小麒麟顶上来,气泡随后弹出 —— 一次性,不循环 */
@keyframes qw-rise{ from{ transform:translateY(26px); opacity:0 } to{ transform:none; opacity:1 } }
@keyframes qw-pop { 0%{ transform:scale(.4); opacity:0 } 70%{ transform:scale(1.08) } 100%{ transform:scale(1); opacity:1 } }

.qw-in .qw-card  { animation:qw-rise .34s cubic-bezier(.22,1.2,.4,1) both; }
.qw-in .qw-mascot{ animation:qw-rise .42s cubic-bezier(.22,1.4,.4,1) both; }
.qw-in .qw-bubble{ animation:qw-pop .30s cubic-bezier(.3,1.6,.5,1) .32s both; transform-origin:14px bottom; }

@media (prefers-reduced-motion: reduce){
  .qw-in .qw-card, .qw-in .qw-mascot, .qw-in .qw-bubble{ animation:none; }
  .qw-cta{ transition:none; }
}

/* 小屏:压低立绘,别把卡片顶出屏幕 */
@media (max-height: 700px){
  .qw-qilin{ height:124px; }
  .qw-mascot{ margin-bottom:-26px; }
  .qw-card{ padding-top:26px; }
}
`;

/* ================================================================
   接入方式(北苑 page.tsx 已接好,这里留档)
   ================================================================

   import QilinWidget from '@/components/beiyuan/QilinWidget';
   const BY_CHANNEL = 'https://whatsapp.com/channel/0029VbDcqctLtOjDUnCzoe2c';

   <QilinWidget open={qilin} onClose={() => setQilin(false)} channelUrl={BY_CHANNEL} />

   以后要放具体内容,当 children 传进去即可,不必改组件:

   <QilinWidget open={qilin} onClose={() => setQilin(false)} channelUrl={BY_CHANNEL}>
     <p style={{ margin:0, textAlign:'center', fontSize:14, lineHeight:1.6 }}>
       这周频道里有点好东西。
     </p>
   </QilinWidget>

   立绘换姿态:改文件顶部的 QILIN_SRC。可选
     /beiyuan-qilin-teal-drink.webp  (青绿·捧杯,默认)
     /beiyuan-qilin-teal-sit.webp    (青绿·坐姿举杯)
     /beiyuan-qilin-blue-drink.webp  (蓝紫·捧杯)
     /beiyuan-qilin-blue-sit.webp    (蓝紫·坐姿举杯)

   ================================================================ */
