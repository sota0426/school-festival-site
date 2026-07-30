const STALLS_SPREADSHEET_ID = '1PJ7D12GpgpU-nofwlrBiCWimxmaw5-4JE8AED-bIiMs'
const POSTER_FOLDER_ID = '1jntdWcCMDtOJ6vkJUtf7ov1IawtAedTp'
const STALLS_SHEET_NAME = '模擬店'

const STALL_HEADERS = [
  'id',
  '表示',
  '表示順',
  '模擬店名',
  'クラス・団体',
  '大分類',
  'フード分類',
  '紹介文',
  '場所表示',
  '場所種別',
  '校舎ID',
  '階ID',
  '教室ID',
  '屋外番号',
  'ピンX',
  'ピンY',
  'メニュー1',
  '価格1',
  '価格表示1',
  'メニュー2',
  '価格2',
  '価格表示2',
  'メニュー3',
  '価格3',
  '価格表示3',
  'メニュー4',
  '価格4',
  '価格表示4',
  'メニュー5',
  '価格5',
  '価格表示5',
  'ポスターFileID',
  'ポスターファイル名',
  'Drive閲覧URL',
  'サイト用画像URL',
  '画像説明',
  '画像更新日時',
  '管理メモ',
  'データ更新日時',
]

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('文化祭サイト管理')
    .addItem('模擬店シートを初期設定', 'setupStallsSheet')
    .addSeparator()
    .addItem('選択中の模擬店へ画像を登録', 'showPosterUploader')
    .addItem('画像フォルダと再同期', 'syncPosterFolder')
    .addToUi()
}

function setupStallsSheet() {
  const spreadsheet = SpreadsheetApp.openById(STALLS_SPREADSHEET_ID)
  const sheet = spreadsheet.getSheetByName(STALLS_SHEET_NAME) || spreadsheet.insertSheet(STALLS_SHEET_NAME)
  const existingHeaders = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0]
    : []

  if (sheet.getLastRow() > 1 && existingHeaders.join('|') !== STALL_HEADERS.join('|')) {
    throw new Error('既存データを保護するため初期設定を停止しました。見出し行を確認してください。')
  }

  sheet.getRange(1, 1, 1, STALL_HEADERS.length).setValues([STALL_HEADERS])
  sheet.setFrozenRows(1)
  sheet.getRange(1, 1, 1, STALL_HEADERS.length)
    .setBackground('#e8442e')
    .setFontColor('#ffffff')
    .setFontWeight('bold')
    .setWrap(true)

  const rowCount = Math.max(sheet.getMaxRows() - 1, 1)
  sheet.getRange(2, 2, rowCount, 1).insertCheckboxes()
  sheet.getRange(2, 6, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['food', 'cafe', 'game', 'exhibit'], true)
      .setAllowInvalid(false)
      .build(),
  )
  sheet.getRange(2, 7, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['', 'meal', 'fried', 'sweets', 'drink', 'snack'], true)
      .setAllowInvalid(false)
      .build(),
  )
  sheet.getRange(2, 10, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['out', 'room'], true)
      .setAllowInvalid(false)
      .build(),
  )
  sheet.getRange(2, 11, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['', 'honkan', 'minami', 'chugaku'], true)
      .setAllowInvalid(false)
      .build(),
  )
  sheet.getRange(2, 12, rowCount, 1).setDataValidation(
    SpreadsheetApp.newDataValidation()
      .requireValueInList(['', '1f', '2f', '3f', '4f'], true)
      .setAllowInvalid(false)
      .build(),
  )

  sheet.setColumnWidth(1, 70)
  sheet.setColumnWidth(2, 55)
  sheet.setColumnWidth(4, 190)
  sheet.setColumnWidth(5, 130)
  sheet.setColumnWidth(8, 300)
  sheet.setColumnWidth(9, 190)
  sheet.setColumnWidths(17, 15, 110)
  sheet.setColumnWidths(32, 5, 190)
  sheet.getRange('H:H').setWrap(true)
  sheet.getRange('AI:AI').setWrap(true)
  sheet.getRange('AK:AK').setWrap(true)
  sheet.getRange('AM:AM').setWrap(true)
  if (!sheet.getFilter()) sheet.getDataRange().createFilter()
  SpreadsheetApp.getUi().alert('「模擬店」シートの初期設定が完了しました。')
}

function showPosterUploader() {
  const sheet = SpreadsheetApp.getActiveSheet()
  const row = sheet.getActiveRange().getRow()
  if (sheet.getName() !== STALLS_SHEET_NAME || row < 2) {
    SpreadsheetApp.getUi().alert('「模擬店」シートで、画像を登録する模擬店の行を選択してください。')
    return
  }
  const id = String(sheet.getRange(row, 1).getDisplayValue()).trim()
  const name = String(sheet.getRange(row, 4).getDisplayValue()).trim()
  if (!id || !name) {
    SpreadsheetApp.getUi().alert('先にIDと模擬店名を入力してください。')
    return
  }

  const template = HtmlService.createTemplateFromFile('PosterUploader')
  template.row = row
  template.stallId = id
  template.stallName = name
  SpreadsheetApp.getUi().showSidebar(template.evaluate().setTitle('模擬店ポスター登録'))
}

function uploadPoster(payload) {
  if (!payload || !payload.row || !payload.base64 || !payload.mimeType) {
    throw new Error('画像データを確認できませんでした。')
  }
  if (!/^image\/(jpeg|png|webp)$/.test(payload.mimeType)) {
    throw new Error('JPEG、PNG、WebP画像を選択してください。')
  }

  const spreadsheet = SpreadsheetApp.openById(STALLS_SPREADSHEET_ID)
  const sheet = spreadsheet.getSheetByName(STALLS_SHEET_NAME)
  const row = Number(payload.row)
  const stallId = String(sheet.getRange(row, 1).getDisplayValue()).trim()
  if (!stallId || stallId !== payload.stallId) throw new Error('選択行が変更されています。もう一度開いてください。')

  const extension = extensionForMimeType(payload.mimeType)
  const filename = `${stallId}.${extension}`
  const folder = DriveApp.getFolderById(POSTER_FOLDER_ID)
  trashFilesWithName(folder, filename)

  const bytes = Utilities.base64Decode(payload.base64)
  const file = folder.createFile(Utilities.newBlob(bytes, payload.mimeType, filename))
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW)
  } catch (error) {
    throw new Error(`画像は保存されましたが、一般公開を設定できませんでした。Workspaceの共有制限を確認してください: ${error.message}`)
  }

  const fileId = file.getId()
  const viewUrl = file.getUrl()
  const imageUrl = `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`
  const now = new Date()
  sheet.getRange(row, 32, 1, 7).setValues([[
    fileId,
    filename,
    viewUrl,
    imageUrl,
    payload.altText || `${sheet.getRange(row, 4).getDisplayValue()}のポスター`,
    now,
    sheet.getRange(row, 38).getValue(),
  ]])
  sheet.getRange(row, 39).setValue(now)
  return { filename, viewUrl, imageUrl }
}

function syncPosterFolder() {
  const spreadsheet = SpreadsheetApp.openById(STALLS_SPREADSHEET_ID)
  const sheet = spreadsheet.getSheetByName(STALLS_SHEET_NAME)
  if (!sheet || sheet.getLastRow() < 2) return

  const folder = DriveApp.getFolderById(POSTER_FOLDER_ID)
  const filesByStem = {}
  const files = folder.getFiles()
  while (files.hasNext()) {
    const file = files.next()
    if (!file.getMimeType().startsWith('image/')) continue
    const stem = file.getName().replace(/\.[^.]+$/, '')
    filesByStem[stem] = file
  }

  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, STALL_HEADERS.length).getValues()
  values.forEach((row, index) => {
    const stallId = String(row[0]).trim()
    const file = filesByStem[stallId]
    if (!stallId || !file) return
    const fileId = file.getId()
    sheet.getRange(index + 2, 32, 1, 5).setValues([[
      fileId,
      file.getName(),
      file.getUrl(),
      `https://drive.google.com/uc?export=view&id=${encodeURIComponent(fileId)}`,
      row[35] || `${row[3]}のポスター`,
    ]])
    sheet.getRange(index + 2, 37).setValue(file.getLastUpdated())
  })
  SpreadsheetApp.getUi().alert('画像フォルダとの同期が完了しました。')
}

function trashFilesWithName(folder, filename) {
  const files = folder.getFilesByName(filename)
  while (files.hasNext()) files.next().setTrashed(true)
}

function extensionForMimeType(mimeType) {
  return {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }[mimeType]
}
