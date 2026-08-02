import { FESTIVAL } from '../config'

const CATEGORY_FROM_SHEET = {
  フード: 'food',
  カフェ: 'cafe',
  ゲーム: 'game',
  '展示など': 'exhibit',
}
const CATEGORY_TO_SHEET = reverseMap(CATEGORY_FROM_SHEET)
const GENRE_FROM_SHEET = {
  ごはん: 'meal',
  揚げ物: 'fried',
  デザート: 'sweets',
  ドリンク: 'drink',
  おやつ: 'snack',
}
const GENRE_TO_SHEET = reverseMap(GENRE_FROM_SHEET)
const MAP_FROM_SHEET = {
  敷地内全体: { type: 'out' },
  校舎案内: { type: 'guide' },
  中央校舎1F: { type: 'room', building: 'honkan', floor: '1f' },
  中央校舎2F: { type: 'room', building: 'honkan', floor: '2f' },
  中央校舎3F: { type: 'room', building: 'honkan', floor: '3f' },
  南校舎2F: { type: 'room', building: 'minami', floor: '2f' },
  南校舎3F: { type: 'room', building: 'minami', floor: '3f' },
  南校舎4F: { type: 'room', building: 'minami', floor: '4f' },
  北校舎1F: { type: 'room', building: 'chugaku', floor: '1f' },
  北校舎2F: { type: 'room', building: 'chugaku', floor: '2f' },
  北校舎3F: { type: 'room', building: 'chugaku', floor: '3f' },
}

export const isStallsApiConfigured = () => Boolean(FESTIVAL.stallsGasUrl)

export async function loadStallsFromSheet() {
  if (!isStallsApiConfigured()) return null
  const response = await fetch(`${FESTIVAL.stallsGasUrl}?t=${Date.now()}`, { cache: 'no-store' })
  if (!response.ok) throw new Error(`模擬店データの取得に失敗しました（${response.status}）`)
  const payload = await response.json()
  if (!payload.ok || !Array.isArray(payload.stalls)) throw new Error(payload.error || '模擬店データを確認できません')
  return payload.stalls.map(stallFromSheet)
}

export async function saveStallsToSheet(stalls) {
  if (!isStallsApiConfigured()) return null
  const response = await fetch(FESTIVAL.stallsGasUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({
      action: 'replaceAll',
      writeToken: FESTIVAL.stallsWriteToken,
      stalls: stalls.map(stallToSheet),
    }),
  })
  if (!response.ok) throw new Error(`模擬店データの保存に失敗しました（${response.status}）`)
  const payload = await response.json()
  if (!payload.ok) throw new Error(payload.error || '模擬店データを保存できません')
  return payload
}

export function driveImageUrl(value) {
  const url = String(value || '').trim()
  if (!url) return ''
  const fileId = url.match(/\/file\/d\/([^/]+)/)?.[1] || new URLSearchParams(url.split('?')[1] || '').get('id')
  return fileId ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w1600` : url
}

function stallFromSheet(row) {
  const map = MAP_FROM_SHEET[row['配置マップ']] || { type: 'out' }
  const x = numberOrFallback(row['X座標'], map.type === 'out' ? 500 : map.type === 'guide' ? 50 : 450)
  const y = numberOrFallback(row['Y座標'], map.type === 'out' ? 350 : map.type === 'guide' ? 50 : 215)
  const loc = map.type === 'room'
    ? { ...map, room: String(row['場所名'] || ''), pinX: x, pinY: y }
    : { ...map, x, y }
  return {
    id: String(row.ID || '').trim(),
    name: String(row['店名'] || '').trim(),
    org: String(row['クラス・団体'] || '').trim(),
    cat: CATEGORY_FROM_SHEET[row['カテゴリ']] || row['カテゴリ'] || 'exhibit',
    ...(row['ジャンル'] ? { foodGenre: GENRE_FROM_SHEET[row['ジャンル']] || row['ジャンル'] } : {}),
    loc,
    placeLabel: String(row['場所名'] || row['配置マップ'] || ''),
    menu: row['メニュー'] ? [[String(row['メニュー']), String(row['価格'] || '')]] : [],
    price: String(row['価格'] || ''),
    hours: '',
    pr: String(row['説明文'] || ''),
    poster: driveImageUrl(row['画像ＵＲＬ']),
    imageUrl: String(row['画像ＵＲＬ'] || ''),
  }
}

function stallToSheet(stall) {
  return {
    ID: stall.id,
    店名: stall.name,
    'クラス・団体': stall.org,
    メニュー: stall.menu?.[0]?.[0] || '',
    価格: stall.price || stall.menu?.[0]?.[1] || '未定',
    カテゴリ: CATEGORY_TO_SHEET[stall.cat] || stall.cat,
    ジャンル: stall.cat === 'food' ? (GENRE_TO_SHEET[stall.foodGenre] || stall.foodGenre || '') : '',
    説明文: stall.pr || '',
    '画像ＵＲＬ': stall.imageUrl || sourceImageUrl(stall.poster),
    配置マップ: mapNameForStall(stall),
    場所名: stall.loc.type === 'room' ? stall.loc.room : stall.placeLabel,
    X座標: stall.loc.type === 'room' ? stall.loc.pinX ?? 450 : stall.loc.x ?? 50,
    Y座標: stall.loc.type === 'room' ? stall.loc.pinY ?? 215 : stall.loc.y ?? 50,
    更新日時: new Date().toISOString(),
  }
}

function mapNameForStall(stall) {
  if (stall.loc.type === 'out') return '敷地内全体'
  if (stall.loc.type === 'guide') return '校舎案内'
  const building = { honkan: '中央校舎', minami: '南校舎', chugaku: '北校舎' }[stall.loc.building] || stall.loc.building
  return `${building}${stall.loc.floor.toUpperCase()}`
}

function sourceImageUrl(poster) {
  if (typeof poster !== 'string') return poster?.src || ''
  return poster
}

function numberOrFallback(value, fallback) {
  if (value === '' || value === null || value === undefined) return fallback
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function reverseMap(value) {
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [item, key]))
}
