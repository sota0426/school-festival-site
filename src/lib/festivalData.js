import { DEFAULT_STALLS } from '../data/stalls'

export const CSV_HEADERS = [
  'id', 'name', 'org', 'cat', 'foodGenre', 'placeLabel',
  'type', 'building', 'floor', 'room', 'x', 'y', 'menu', 'pr',
]

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

  const headers = rows[0].map((value, index) => (index === 0 ? value.replace(/^\uFEFF/, '') : value).trim())
  return rows.slice(1).map((values, rowIndex) => {
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index]?.trim() || '']))
    if (!record.id || !record.name || !record.org || !record.cat) {
      throw new Error(`${rowIndex + 2}行目: id・name・org・catは必須です`)
    }
    const indoor = record.type === 'room'
    return {
      id: record.id,
      name: record.name,
      org: record.org,
      cat: record.cat,
      ...(record.foodGenre ? { foodGenre: record.foodGenre } : {}),
      loc: indoor
        ? {
            type: 'room',
            building: record.building,
            floor: record.floor,
            room: record.room,
          }
        : {
            type: 'out',
            x: Number(record.x) || 500,
            y: Number(record.y) || 350,
          },
      placeLabel: record.placeLabel,
      menu: parseMenu(record.menu),
      hours: '',
      pr: record.pr,
    }
  })
}

export function parseMenu(value) {
  if (!value) return []
  return value.split('|').map((entry) => {
    const separator = entry.lastIndexOf(':')
    if (separator < 0) return [entry.trim(), 0]
    return [entry.slice(0, separator).trim(), Number(entry.slice(separator + 1)) || 0]
  }).filter(([name]) => name)
}

export function menuToText(menu = []) {
  return menu.map(([name, price]) => `${name}:${price}`).join('|')
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
      stall.cat,
      stall.foodGenre || '',
      stall.placeLabel,
      stall.loc.type,
      stall.loc.building || '',
      stall.loc.floor || '',
      stall.loc.room || '',
      stall.loc.x ?? '',
      stall.loc.y ?? '',
      menuToText(stall.menu),
      stall.pr,
    ]),
  ]
  return lines.map((line) => line.map(csvEscape).join(',')).join('\n')
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
