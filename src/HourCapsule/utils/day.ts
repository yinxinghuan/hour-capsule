// Cooldown + timestamp formatting + relative-time helpers.
//
// CRITICAL: hourly quota MUST be derived ONLY from comparing local
// `lastCollectAt` to `Date.now()`. NEVER OR with platform aggregate
// stats — they get stuck server-side and lock users out permanently.
// (Same daily-lock-trap principle, applied to hourly.)

import { COLLECT_COOLDOWN_MS } from '../types';

export function msUntilNextCollect(lastCollectAt?: number): number {
  if (!lastCollectAt) return 0;
  return Math.max(0, lastCollectAt + COLLECT_COOLDOWN_MS - Date.now());
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '0m';
  const totalMin = Math.ceil(ms / 60000);
  if (totalMin >= 60) {
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    return `${h}h ${m}m`;
  }
  if (totalMin <= 1) {
    // For final minute, show seconds so countdown feels alive.
    const s = Math.ceil(ms / 1000);
    return `${s}s`;
  }
  return `${totalMin}m`;
}

/** "2026.06.06  19:45" — matches the MFG dot-matrix stamp inside the bag image. */
export function formatStamp(ts: number): string {
  const d = new Date(ts);
  const p = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}.${p(d.getMonth() + 1)}.${p(d.getDate())}  ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/** "#00042" — matches the dot-matrix owner serial inside the bag image. */
export function formatSerial(n: number): string {
  return '#' + n.toString().padStart(5, '0');
}

export function relativeAgo(ts: number, locale: 'zh' | 'en'): string {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (locale === 'zh') {
    if (d > 0) return `${d}天前`;
    if (h > 0) return `${h}小时前`;
    if (m > 0) return `${m}分前`;
    return '刚刚';
  }
  if (d > 0) return `${d}d`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m`;
  return 'just now';
}
