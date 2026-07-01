'use client';

import { useState } from 'react';
import {
  useCart, CartLine, lineUnitPrice, lineSubtotal,
  TeaBaseLabel, SweetLevel, IceLevel,
} from './CartContext';

const C = {
  brand: '#0D4A2E', text: '#1a1a1a', sub: '#888', faint: '#bbb',
  muted: '#F0EDE8', border: '#E8E4DE', gold: '#C9A84C',
};

// 选项英文显示映射(茶底/甜度/冰量是数据 key,本身不带英文)
const TEA_BASE_EN: Record<TeaBaseLabel, string> = { '红茶': 'Black', '绿茶': 'Green', '乌龙': 'Oolong' };
const SWEET_EN: Record<SweetLevel, string> = { '原糖': 'Full Sugar', '75%': '', '50%': '', '25%': '', '无糖': 'No Sugar' };
const ICE_EN: Record<IceLevel, string> = { '正常冰': 'Regular', '少冰': 'Less', '去冰': 'No Ice' };
const withEn = (cn: string, en?: string) => (en ? `${cn} ${en}` : cn);

/** 把一行的定制选项拼成一句可读描述 */
function lineSpec(l: CartLine): string[] {
  const parts: string[] = [];
  if (l.size && l.size !== '单一') parts.push(l.size === 'L' ? '大杯 Large' : '小杯 Small');
  if (l.variant) parts.push(withEn(l.variant.label, l.variant.labelEn));
  if (l.teaBase) parts.push(withEn(l.teaBase, TEA_BASE_EN[l.teaBase]));
  if (l.milkBase) parts.push(withEn(l.milkBase.label, l.milkBase.labelEn) + (l.milkBase.price ? ` +$${l.milkBase.price.toFixed(2)}` : ''));
  if (l.sweet) parts.push(withEn(l.sweet, SWEET_EN[l.sweet]));
  if (l.ice && l.ice !== '固定') parts.push(withEn(l.ice, ICE_EN[l.ice as IceLevel]));
  if (l.toppings && l.toppings.length) parts.push(...l.toppings.map(t => `+${t.nameCn} ${t.nameEn}`));
  if (l.freeDrink) parts.push(`赠饮 Free: ${l.freeDrink.nameCn} ${l.freeDrink.nameEn} (${l.freeDrink.sweet})${l.freeDrink.price ? ` +$${l.freeDrink.price.toFixed(2)}` : ''}`);
  if (l.addOns && l.addOns.length) parts.push(...l.addOns.map(a => `+${a.nameCn} ${a.nameEn}`));
  return parts;
}

function QtyStepper({ qty, onChange }: { qty: number; onChange: (q: number) => void }) {
  const btn: React.CSSProperties = {
    width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.border}`,
    background: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1,
    display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button style={btn} onClick={() => onChange(qty - 1)} aria-label="减少">−</button>
      <span style={{ fontSize: 15, fontWeight: 700, minWidth: 18, textAlign: 'center' }}>{qty}</span>
      <button style={btn} onClick={() => onChange(qty + 1)} aria-label="增加">+</button>
    </div>
  );
}

export default function CartBar() {
  const { lines, count, total, setQty, removeLine, clear } = useCart();
  const [open, setOpen] = useState(false);
  const [staffView, setStaffView] = useState(false);

  if (count === 0) return null;

  const closeAll = () => { setOpen(false); setStaffView(false); };

  return (
    <>
      {/* 悬浮购物车按钮 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'fixed', right: 16,
            bottom: 'calc(76px + env(safe-area-inset-bottom))',
            zIndex: 60, height: 52, padding: '0 20px 0 16px', borderRadius: 999,
            background: C.brand, color: '#fff', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 10,
            boxShadow: '0 6px 20px rgba(13,74,46,0.4)', fontSize: 15, fontWeight: 700,
          }}
        >
          <span style={{ position: 'relative', fontSize: 20 }}>
            🛒
            <span style={{
              position: 'absolute', top: -6, right: -10, minWidth: 18, height: 18,
              borderRadius: 999, background: C.gold, color: '#1a1a1a', fontSize: 11,
              fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px',
            }}>{count}</span>
          </span>
          <span>我的清单 · ${total.toFixed(2)}</span>
        </button>
      )}

      {/* 抽屉 */}
      {open && (
        <div
          onClick={closeAll}
          style={{
            position: 'fixed', inset: 0, zIndex: 70, display: 'flex',
            alignItems: 'flex-end', justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: '#fff', borderRadius: '24px 24px 0 0', width: '100%',
              maxWidth: 480, maxHeight: '90dvh', display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* 头部 */}
            <div style={{
              flexShrink: 0, padding: '18px 20px 12px', borderBottom: `1px solid ${C.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 18, fontWeight: 900, color: C.text }}>
                {staffView ? '请向店员出示此清单' : '我的清单'}
                <span style={{ fontSize: 13, fontWeight: 400, color: C.sub, marginLeft: 8 }}>
                  {staffView ? 'Show to Staff' : `${count} 件`}
                </span>
              </div>
              <button
                onClick={closeAll}
                style={{
                  width: 32, height: 32, borderRadius: '50%', border: `1px solid ${C.border}`,
                  background: '#fff', fontSize: 16, cursor: 'pointer', color: C.text,
                }}
              >✕</button>
            </div>

            {/* 清单内容 */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
              {lines.map(l => {
                const spec = lineSpec(l);
                return (
                  <div key={l.uid} style={{
                    padding: '14px 0', borderBottom: `1px solid ${C.muted}`,
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>
                          {l.nameCn}
                        </div>
                        {l.nameEn && (
                          <div style={{ fontSize: 12, fontWeight: 400, color: C.sub, marginTop: 1 }}>
                            {l.nameEn}
                          </div>
                        )}
                        {spec.length > 0 && (
                          <div style={{
                            fontSize: 12, color: C.sub, marginTop: 4, lineHeight: 1.5,
                          }}>
                            {spec.join(' · ')}
                          </div>
                        )}
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: C.brand }}>
                          ${lineSubtotal(l).toFixed(2)}
                        </div>
                        {l.qty > 1 && (
                          <div style={{ fontSize: 11, color: C.faint }}>
                            ${lineUnitPrice(l).toFixed(2)} × {l.qty}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 编辑区:只读视图下隐藏 */}
                    {!staffView && (
                      <div style={{
                        marginTop: 10, display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                      }}>
                        <QtyStepper qty={l.qty} onChange={q => setQty(l.uid, q)} />
                        <button
                          onClick={() => removeLine(l.uid)}
                          style={{
                            background: 'none', border: 'none', color: C.faint,
                            fontSize: 12, cursor: 'pointer', textDecoration: 'underline',
                          }}
                        >删除</button>
                      </div>
                    )}
                    {staffView && (
                      <div style={{ marginTop: 6, fontSize: 13, color: C.text, fontWeight: 600 }}>
                        数量 × {l.qty}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 底部 */}
            <div style={{
              flexShrink: 0, borderTop: `1px solid ${C.border}`,
              padding: '14px 20px calc(16px + env(safe-area-inset-bottom))',
            }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                marginBottom: 12,
              }}>
                <span style={{ fontSize: 14, color: C.sub }}>合计 Subtotal</span>
                <span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: C.text }}>
                    ${total.toFixed(2)}
                  </span>
                  <span style={{ fontSize: 11, color: C.faint, marginLeft: 4 }}>+Tax</span>
                </span>
              </div>

              {/* 免责声明 — 仅店员视图 */}
              {staffView && (
                <div style={{
                  fontSize: 11, color: C.faint, textAlign: 'center', marginBottom: 12,
                  lineHeight: 1.5,
                }}>
                  图片仅供参考,以实物为准<br />
                  Images are for reference only and may differ from the actual product.
                </div>
              )}

              {!staffView ? (
                <>
                  <button
                    onClick={() => setStaffView(true)}
                    style={{
                      width: '100%', height: 50, borderRadius: 14, border: 'none',
                      background: C.brand, color: '#fff', fontSize: 16, fontWeight: 800,
                      cursor: 'pointer',
                    }}
                  >给店员看 · Show to Staff</button>
                  <button
                    onClick={() => { if (confirm('清空清单?')) clear(); }}
                    style={{
                      width: '100%', marginTop: 8, height: 38, borderRadius: 12,
                      border: 'none', background: 'transparent', color: C.faint,
                      fontSize: 13, cursor: 'pointer',
                    }}
                  >清空清单</button>
                </>
              ) : (
                <button
                  onClick={() => setStaffView(false)}
                  style={{
                    width: '100%', height: 50, borderRadius: 14,
                    border: `1px solid ${C.border}`, background: '#fff', color: C.text,
                    fontSize: 15, fontWeight: 700, cursor: 'pointer',
                  }}
                >← 返回编辑</button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
