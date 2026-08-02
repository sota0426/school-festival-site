import fs from 'node:fs/promises'
import path from 'node:path'
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool'

const sourcePath = 'C:/Users/User/.codex/attachments/048ddc9d-0c74-4fa7-a9fa-928faffd8e96/pasted-text.txt'
const outputDir = 'C:/プログラミング学習/school-festival-site/outputs/stalls-export'
const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'))

const headers = ['ID', '店名', 'クラス・団体', 'メニュー', '価格', 'カテゴリ', 'ジャンル', '説明文', '画像ＵＲＬ', '配置マップ', '場所名', 'X座標', 'Y座標', '更新日時']
const categoryNames = {
  food: 'フード',
  cafe: 'カフェ',
  game: 'ゲーム',
  exhibit: '展示など',
}
const genreNames = {
  meal: 'ごはん',
  fried: '揚げ物',
  sweets: 'デザート',
  drink: 'ドリンク',
  snack: 'おやつ',
}
const buildingNames = {
  honkan: '中央校舎',
  minami: '南校舎',
  chugaku: '北校舎',
}
const exportedAt = new Date(source.exportedAt)
const updatedAt = new Intl.DateTimeFormat('ja-JP', {
  timeZone: 'Asia/Tokyo', year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hour12: false,
}).format(exportedAt).replaceAll('/', '/').replace(' ', ' ')

const mapName = (loc) => {
  if (loc.type === 'out') return '敷地内全体'
  if (loc.type === 'guide') return '校舎案内'
  return `${buildingNames[loc.building] ?? loc.building}${loc.floor.toUpperCase()}`
}

const placeName = (stall) => stall.loc.type === 'room' ? stall.loc.room : stall.placeLabel
const xCoordinate = (loc) => loc.type === 'room' ? (loc.pinX ?? '') : (loc.x ?? '')
const yCoordinate = (loc) => loc.type === 'room' ? (loc.pinY ?? '') : (loc.y ?? '')
const menuText = (menu) => Array.isArray(menu) && menu.length ? menu[0]?.[0] ?? '' : ''
const imageUrls = {
  s03: 'https://drive.google.com/file/d/101bH4O0Dgali5sqAM-atR3Rv5kZQ89Pv/view?usp=drive_link',
}

const rows = source.stalls.map((stall) => [
  stall.id,
  stall.name,
  stall.org,
  menuText(stall.menu),
  '未定',
  categoryNames[stall.cat] ?? stall.cat,
  stall.cat === 'food' ? (genreNames[stall.foodGenre] ?? stall.foodGenre ?? '') : '',
  stall.pr?.trim() || `${stall.name}をお楽しみください。詳しい内容は当日会場でご確認ください。`,
  imageUrls[stall.id] ?? '',
  mapName(stall.loc),
  placeName(stall),
  xCoordinate(stall.loc),
  yCoordinate(stall.loc),
  updatedAt,
])

const workbook = Workbook.create()
const dataSheet = workbook.worksheets.add('模擬店データ')

dataSheet.getRangeByIndexes(0, 0, rows.length + 1, headers.length).values = [headers, ...rows]

for (const sheet of [dataSheet]) {
  sheet.showGridLines = false
  sheet.freezePanes.freezeRows(1)
  sheet.getUsedRange().format.font = { name: 'Yu Gothic', size: 10 }
  sheet.getRange('1:1').format = {
    fill: '#1F4E78',
    font: { name: 'Yu Gothic', size: 10, bold: true, color: '#FFFFFF' },
    rowHeight: 28,
    verticalAlignment: 'center',
  }
}

dataSheet.getRange(`A1:N${rows.length + 1}`).format.borders = { preset: 'inside', style: 'thin', color: '#D9E2F3' }
dataSheet.getRange(`L2:M${rows.length + 1}`).format.numberFormat = '0.00'
dataSheet.getRange(`N2:N${rows.length + 1}`).format.numberFormat = '@'
dataSheet.getRange(`A2:A${rows.length + 1}`).format.numberFormat = '@'
dataSheet.getRange(`H2:K${rows.length + 1}`).format.numberFormat = '@'
dataSheet.getRange(`A1:N${rows.length + 1}`).format.autofitColumns()
dataSheet.getRange('B:B').format.columnWidthPx = 180
dataSheet.getRange('D:D').format.columnWidthPx = 170
dataSheet.getRange('H:H').format.columnWidthPx = 420
dataSheet.getRange('I:I').format.columnWidthPx = 320
dataSheet.getRange('J:K').format.columnWidthPx = 150
dataSheet.getRange('N:N').format.columnWidthPx = 145
dataSheet.getRange(`H2:I${rows.length + 1}`).format.wrapText = true
dataSheet.tables.add(`A1:N${rows.length + 1}`, true, 'StallsTable').style = 'TableStyleMedium2'
dataSheet.getRange(`F2:F${rows.length + 1}`).dataValidation = {
  rule: { type: 'list', values: ['フード', 'カフェ', 'ゲーム', '展示など'] },
}
dataSheet.getRange(`G2:G${rows.length + 1}`).dataValidation = {
  rule: { type: 'list', values: ['', 'ごはん', '揚げ物', 'デザート', 'ドリンク', 'おやつ'] },
}
dataSheet.getRange(`J2:J${rows.length + 1}`).dataValidation = {
  rule: { type: 'list', values: ['敷地内全体', '校舎案内', '中央校舎1F', '中央校舎2F', '中央校舎3F', '南校舎2F', '南校舎3F', '南校舎4F'] },
}

await fs.mkdir(outputDir, { recursive: true })
const xlsx = await SpreadsheetFile.exportXlsx(workbook)
await xlsx.save(path.join(outputDir, '模擬店データ.xlsx'))

const escapeCsv = (value) => {
  const text = String(value ?? '')
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}
const csv = [headers, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\r\n')
await fs.writeFile(path.join(outputDir, '模擬店データ.csv'), `\uFEFF${csv}`, 'utf8')

const preview = await workbook.render({ sheetName: '模擬店データ', range: `A1:N${Math.min(rows.length + 1, 12)}`, scale: 1.2, format: 'png' })
await fs.writeFile(path.join(outputDir, 'preview.png'), new Uint8Array(await preview.arrayBuffer()))

const inspection = await workbook.inspect({
  kind: 'table',
  range: `模擬店データ!A1:N${Math.min(rows.length + 1, 8)}`,
  include: 'values,formulas',
  tableMaxRows: 8,
  tableMaxCols: 14,
})
console.log(inspection.ndjson)
console.log(JSON.stringify({ rows: rows.length, outputDir }))
