export function stallPrice(stall, menuPrice = '') {
  const value = String(stall?.price || menuPrice || stall?.menu?.[0]?.[1] || '').trim()
  if (!value) return ''
  return /^\d+(?:\.\d+)?$/.test(value) ? `${value}円` : value
}
