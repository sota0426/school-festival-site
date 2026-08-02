const DEFAULT_SPREADSHEET_ID = '1PJ7D12GpgpU-nofwlrBiCWimxmaw5-4JE8AED-bIiMs'
const STALLS_SHEET_NAME = '模擬店データ'
const CACHE_KEY = 'festival-stalls-v1'
const STALL_HEADERS = [
  'ID', '店名', 'クラス・団体', 'メニュー', '価格', 'カテゴリ', 'ジャンル',
  '説明文', '画像ＵＲＬ', '配置マップ', '場所名', 'X座標', 'Y座標', '更新日時',
]

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('文化祭サイト管理')
    .addItem('模擬店シートを初期設定', 'setupStallsSheet')
    .addItem('API設定を確認', 'showApiSettings')
    .addToUi()
}

function onEdit(event) {
  if (event?.range?.getSheet()?.getName() === STALLS_SHEET_NAME) {
    CacheService.getScriptCache().remove(CACHE_KEY)
  }
}

function setupStallsSheet() {
  const sheet = getStallsSheet_(true)
  const existing = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
    : []
  if (sheet.getLastRow() > 1 && existing.join('|') !== STALL_HEADERS.join('|')) {
    throw new Error('既存データを保護するため停止しました。シート名と見出し行を確認してください。')
  }

  sheet.getRange(1, 1, 1, STALL_HEADERS.length).setValues([STALL_HEADERS])
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, STALL_HEADERS.length)
    .setBackground('#1f6b8c')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
  const count = Math.max(sheet.getMaxRows() - 1, 1)
  setListValidation_(sheet.getRange(2, 6, count, 1), ['フード', 'カフェ', 'ゲーム', '展示など'])
  setListValidation_(sheet.getRange(2, 7, count, 1), ['', 'ごはん', '揚げ物', 'デザート', 'ドリンク', 'おやつ'])
  setListValidation_(sheet.getRange(2, 10, count, 1), [
    '敷地内全体', '校舎案内', '中央校舎1F', '中央校舎2F', '中央校舎3F',
    '南校舎2F', '南校舎3F', '南校舎4F',
  ])
  sheet.setColumnWidth(2, 190)
  sheet.setColumnWidth(8, 360)
  sheet.setColumnWidth(9, 300)
  sheet.getRange('H:I').setWrap(true)
  if (!sheet.getFilter()) sheet.getDataRange().createFilter()
  SpreadsheetApp.getUi().alert('模擬店データシートの設定が完了しました。')
}

function showApiSettings() {
  const properties = PropertiesService.getScriptProperties()
  const spreadsheetId = properties.getProperty('STALLS_SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID
  const hasToken = Boolean(properties.getProperty('STALLS_WRITE_TOKEN'))
  SpreadsheetApp.getUi().alert(
    `スプレッドシートID: ${spreadsheetId}\n書き込みトークン: ${hasToken ? '設定済み' : '未設定'}`,
  )
}

function doGet() {
  try {
    const cache = CacheService.getScriptCache()
    const cached = cache.get(CACHE_KEY)
    if (cached) return jsonResponse_(JSON.parse(cached))
    const payload = { ok: true, stalls: readStalls_(), fetchedAt: new Date().toISOString() }
    cache.put(CACHE_KEY, JSON.stringify(payload), 60)
    return jsonResponse_(payload)
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message })
  }
}

function doPost(event) {
  try {
    const body = JSON.parse(event?.postData?.contents || '{}')
    validateWriteToken_(body.writeToken)
    if (body.action !== 'replaceAll' || !Array.isArray(body.stalls)) {
      throw new Error('action=replaceAll と stalls 配列が必要です。')
    }
    const lock = LockService.getScriptLock()
    lock.waitLock(10000)
    try {
      replaceAllStalls_(body.stalls)
      CacheService.getScriptCache().remove(CACHE_KEY)
    } finally {
      lock.releaseLock()
    }
    return jsonResponse_({ ok: true, count: body.stalls.length, updatedAt: new Date().toISOString() })
  } catch (error) {
    return jsonResponse_({ ok: false, error: error.message })
  }
}

function readStalls_() {
  const sheet = getStallsSheet_(false)
  if (sheet.getLastRow() < 2) return []
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, STALL_HEADERS.length).getValues()
  return values
    .filter((row) => String(row[0]).trim())
    .map((row) => Object.fromEntries(STALL_HEADERS.map((header, index) => [
      header,
      row[index] instanceof Date ? row[index].toISOString() : row[index],
    ])))
}

function replaceAllStalls_(stalls) {
  const sheet = getStallsSheet_(true)
  const now = new Date()
  const rows = stalls.map((stall) => STALL_HEADERS.map((header) => {
    if (header === '更新日時') return now
    return stall[header] ?? ''
  }))
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, STALL_HEADERS.length).clearContent()
  }
  if (rows.length) sheet.getRange(2, 1, rows.length, STALL_HEADERS.length).setValues(rows)
}

function getStallsSheet_(create) {
  const properties = PropertiesService.getScriptProperties()
  const spreadsheetId = properties.getProperty('STALLS_SPREADSHEET_ID') || DEFAULT_SPREADSHEET_ID
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId)
  const sheet = spreadsheet.getSheetByName(STALLS_SHEET_NAME)
  if (sheet) return sheet
  if (create) return spreadsheet.insertSheet(STALLS_SHEET_NAME)
  throw new Error(`「${STALLS_SHEET_NAME}」シートがありません。`)
}

function validateWriteToken_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('STALLS_WRITE_TOKEN')
  if (!expected) throw new Error('Apps ScriptのSTALLS_WRITE_TOKENが未設定です。')
  if (!token || token !== expected) throw new Error('書き込み権限を確認できません。')
}

function setListValidation_(range, values) {
  range.setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(values, true)
      .setAllowInvalid(false)
      .build(),
  )
}

function jsonResponse_(value) {
  return ContentService
    .createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON)
}
