export function timeAgo(ms: number): string {
  const d = Date.now() - ms
  const m = Math.floor(d / 60000)
  if (m < 2)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const dy = Math.floor(h / 24)
  if (dy < 7) return `${dy}d ago`
  const w = Math.floor(dy / 7)
  if (w < 5)  return `${w}w ago`
  return `${Math.floor(dy / 30)}mo ago`
}

export function trunc(s: string, max: number): string {
  return s.length > max ? s.slice(0, max - 1) + '…' : s
}

export function plural(n: number, singular: string, plural = singular + 's'): string {
  return n === 1 ? singular : plural
}
