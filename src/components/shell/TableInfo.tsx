'use client';
// src/components/shell/TableInfo.tsx
// Slim in-flow footer under every menu page: table number (when scanned from a stand),
// guest Wi-Fi, and the seating/house rules in one line. Bilingual, no popups.
import { useSyncExternalStore } from 'react';
import { parseTableCode, readTableCookie } from '@/lib/table';

const WIFI_SSID = 'Bei Yuan Tea & Boba';
const WIFI_PW = '8582688198';

export default function TableInfo() {
  // Cookie is set by /t/[code] before this page loads; read it once on the client, null on the server.
  const code = useSyncExternalStore(
    () => () => {},
    () => readTableCookie()?.code ?? null,
    () => null,
  );
  const table = parseTableCode(code);

  const line: React.CSSProperties = { margin: 0, lineHeight: 1.5 };
  return (
    <footer
      style={{
        margin: '28px 16px 8px',
        padding: '12px 14px',
        borderRadius: 12,
        fontSize: 12,
        opacity: 0.78,
        border: '1px solid color-mix(in srgb, currentColor 18%, transparent)',
      }}
    >
      {table && (
        <p style={{ ...line, fontWeight: 600 }}>
          桌号 Table {table.code}
          {table.seating === 'dining' ? ' · 用餐座位 Dining Seating' : ' · 自由座位 Open Seating'}
        </p>
      )}
      <p style={line}>
        Wi-Fi: <b>{WIFI_SSID}</b> · 密码 PW: <b>{WIFI_PW}</b>
      </p>
      <p style={line}>
        入座请消费 · 谢绝外食外饮 · 用餐座位优先供用餐顾客 · 请勿移动座椅
      </p>
      <p style={line}>
        Please order to be seated · No outside food or drinks · Dining Seating is prioritized for meal groups · Please don&apos;t move chairs
      </p>
    </footer>
  );
}
