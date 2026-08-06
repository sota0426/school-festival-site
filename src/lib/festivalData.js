import { DEFAULT_STALLS } from '../data/stalls'
import { CATEGORIES, FOOD_GENRES } from '../data/categories'
import { FLOOR_PLANS } from '../data/floors'

export const CSV_HEADERS = [
  'ID', '模擬店名', 'クラス・団体', 'カテゴリ', '食品ジャンル',
  '場所種別', '校舎', '階', '教室', 'X座標', 'Y座標', 'メニュー', '紹介文',
]

const HEADER_KEYS = {
  ID: 'id',
  模擬店名: 'name',
  'クラス・団体': 'org',
  カテゴリ: 'cat',
  食品ジャンル: 'foodGenre',
  場所種別: 'type',
  校舎: 'building',
  階: 'floor',
  教室: 'room',
  X座標: 'x',
  Y座標: 'y',
  メニュー: 'menu',
  紹介文: 'pr',
}

const CATEGORY_TO_JA = Object.fromEntries(
  Object.entries(CATEGORIES).map(([id, category]) => [id, category.label]),
)
const CATEGORY_FROM_JA = reverseMap(CATEGORY_TO_JA)
const FOOD_GENRE_TO_JA = Object.fromEntries(
  Object.entries(FOOD_GENRES).map(([id, category]) => [id, category.label]),
)
const FOOD_GENRE_FROM_JA = reverseMap(FOOD_GENRE_TO_JA)
const TYPE_TO_JA = { out: '屋外', room: '校内' }
const TYPE_FROM_JA = reverseMap(TYPE_TO_JA)
const BUILDING_TO_JA = Object.fromEntries(
  Object.entries(FLOOR_PLANS).map(([id, plan]) => [id, plan.name]),
)
const BUILDING_FROM_JA = reverseMap(BUILDING_TO_JA)

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        field += '"'
        index += 1
      } else {
        quoted = !quoted
      }
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[index + 1] === '\n') index += 1
      row.push(field)
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
      field = ''
    } else {
      field += char
    }
  }
  row.push(field)
  if (row.some((value) => value.trim())) rows.push(row)
  if (rows.length < 2) throw new Error('CSVにデータ行がありません')

  const headers = rows[0].map((value, index) => {
    const header = (index === 0 ? value.replace(/^\uFEFF/, '') : value).trim()
    return HEADER_KEYS[header] || header
  })
  return rows.slice(1).map((values, rowIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || '']))
    if (!record.id || !record.name || !record.org || !record.cat) {
      throw new Error(`${rowIndex + 2}行目: ID・模擬店名・クラス／団体・カテゴリは必須です`)
    }
    const cat = CATEGORY_FROM_JA[record.cat] || record.cat
    const foodGenre = FOOD_GENRE_FROM_JA[record.foodGenre] || record.foodGenre
    const type = TYPE_FROM_JA[record.type] || record.type
    const building = BUILDING_FROM_JA[record.building] || record.building
    const floor = floorIdFromLabel(building, record.floor)
    const room = roomIdFromName(building, floor, record.room, record.id)
    const indoor = type === 'room'
    return {
      id: record.id,
      name: record.name,
      org: record.org,
      cat,
      ...(foodGenre ? { foodGenre } : {}),
      loc: indoor
        ? {
            type: 'room',
            building,
            floor,
            room,
          }
        : {
            type: 'out',
            x: Number(record.x) || 500,
            y: Number(record.y) || 350,
          },
      menu: parseMenu(record.menu),
      hours: '',
      pr: record.pr,
    }
  })
}

export function parseMenu(value) {
  if (!value) return []
  const firstEntry = value.split('|')[0].trim()
  const legacySeparator = firstEntry.lastIndexOf(':')
  const name =
    legacySeparator >= 0 && /^-?\d+$/.test(firstEntry.slice(legacySeparator + 1).trim())
      ? firstEntry.slice(0, legacySeparator).trim()
      : firstEntry
  return name ? [[name]] : []
}

export function menuToText(menu = []) {
  return menu[0]?.[0] || ''
}

function csvEscape(value) {
  const text = String(value ?? '')
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function stallsToCsv(stalls) {
  const lines = [
    CSV_HEADERS,
    ...stalls.map((stall) => [
      stall.id,
      stall.name,
      stall.org,
      CATEGORY_TO_JA[stall.cat] || stall.cat,
      FOOD_GENRE_TO_JA[stall.foodGenre] || stall.foodGenre || '',
      TYPE_TO_JA[stall.loc.type] || stall.loc.type,
      BUILDING_TO_JA[stall.loc.building] || stall.loc.building || '',
      floorLabel(stall.loc.building, stall.loc.floor),
      csvRoomName(stall),
      stall.loc.x ?? '',
      stall.loc.y ?? '',
      menuToText(stall.menu),
      stall.pr,
    ]),
  ]
  return lines.map((line) => line.map(csvEscape).join(',')).join('\n')
}

function reverseMap(map) {
  return Object.fromEntries(Object.entries(map).map(([key, value]) => [value, key]))
}

function floorLabel(buildingId, floorId) {
  const label = FLOOR_PLANS[buildingId]?.floors.find((floor) => floor.id === floorId)?.label
  return label ? label.replace(/F$/i, '階') : floorId || ''
}

function floorIdFromLabel(buildingId, value) {
  return FLOOR_PLANS[buildingId]?.floors.find(
    (floor) =>
      floor.label === value ||
      floor.label.replace(/F$/i, '階') === value ||
      floor.id === value,
  )?.id || value
}

function roomName(buildingId, floorId, roomId) {
  return FLOOR_PLANS[buildingId]?.floors
    .find((floor) => floor.id === floorId)?.rooms
    .find((room) => room.id === roomId)?.name || roomId || ''
}

function csvRoomName(stall) {
  if (stall.loc.type !== 'room') return ''
  return roomName(stall.loc.building, stall.loc.floor, stall.loc.room)
}

function roomIdFromName(buildingId, floorId, value, stallId) {
  const existingStall = DEFAULT_STALLS.find(
    (stall) =>
      stall.id === stallId &&
      stall.loc.type === 'room' &&
      stall.loc.building === buildingId &&
      stall.loc.floor === floorId,
  )
  if (existingStall) return existingStall.loc.room

  const stallWithSameRoomName = DEFAULT_STALLS.find(
    (stall) =>
      stall.loc.type === 'room' &&
      stall.loc.building === buildingId &&
      stall.loc.floor === floorId &&
      csvRoomName(stall) === value,
  )
  if (stallWithSameRoomName) return stallWithSameRoomName.loc.room

  return FLOOR_PLANS[buildingId]?.floors
    .find((floor) => floor.id === floorId)?.rooms
    .find((room) => room.name === value || room.id === value)?.id || value
}

export function downloadText(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadCsvTemplate() {
  downloadText(
    'festival-stalls-template.csv',
    stallsToCsv(DEFAULT_STALLS.slice(0, 2)),
    'text/csv;charset=utf-8',
  )
}
