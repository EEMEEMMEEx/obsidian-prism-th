// Upstream: ATtacK030130/antigrative-dashboard v0.9.1 (MIT License — Copyright (c) 2026 AG Pulse contributors)
// Integrated & adapted for Obsidian Prism under GPL-3.0-only compatibility terms.
export function percent(fraction) {
  return typeof fraction === 'number' && Number.isFinite(fraction) ? `${(fraction * 100).toFixed(1)}%` : '—';
}
export function rate(number) {
  return typeof number === 'number' && Number.isFinite(number) ? number.toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 }) : '—';
}
export function count(number) {
  return typeof number === 'number' && Number.isFinite(number) ? number.toLocaleString('en-US') : '—';
}
export function elapsed(seconds, lang = 'th') {
  if (typeof seconds !== 'number' || !Number.isFinite(seconds)) return '—';
  const isEn = lang === 'en';
  if (seconds < 60) return isEn ? `${seconds.toFixed(2)}s` : `${seconds.toFixed(2)} วินาที`;
  const whole = Math.round(seconds), h = Math.floor(whole / 3600), m = Math.floor(whole % 3600 / 60), s = whole % 60;
  return isEn
    ? `${h ? `${h}h ` : ''}${m}m ${s}s`
    : `${h ? `${h} ชม. ` : ''}${m} นาที ${s} วินาที`;
}
export function countdown(resetAt, now = Date.now(), compact = false, lang = 'th') {
  const end = Date.parse(resetAt);
  if (!Number.isFinite(end)) return '—';
  const isEn = lang === 'en';
  if (end <= now) return isEn ? 'Waiting for refresh' : 'รอรีเฟรช';
  const left = Math.ceil((end - now) / 1000), d = Math.floor(left / 86400), h = Math.floor(left % 86400 / 3600), m = Math.floor(left % 3600 / 60), s = left % 60;
  const pad = n => String(n).padStart(2, '0');
  const dayUnit = isEn ? 'd ' : ' วัน ';
  return `${d ? `${d}${dayUnit}` : ''}${pad(h)}:${pad(m)}${compact && d ? '' : `:${pad(s)}`}`;
}
export function resetDate(value, lang = 'th') {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'th-TH', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Bangkok' }).format(date) : '—';
}
