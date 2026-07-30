const SPREADSHEET_ID = '1wDIO_MeLV8o9ZM44BgvTqb_ZIHksMdkGRzdG73nCcHk'
const SHEET_NAME = 'アンケート回答'
const EXIT_SHEET_NAME = '帰り際アンケート'

const HEADERS = [
  '回答日時',
  '来場状況',
  '属性',
  '出身中学',
  '鶴東祭を知ったきっかけ',
  'ユーザーエージェント',
  '来場回数',
  '中学生の学年',
  '誰と来たか',
]

const EXIT_HEADERS = [
  '回答日時',
  '属性',
  '出身中学',
  '中学生の学年',
  '面白かった企画1',
  '面白かった企画2',
  '面白かった企画3',
  '満足度',
  '困ったこと',
  '来年も来たいか',
  '公式サイトの有用性',
  '鶴岡東高校への興味・関心',
  '改善点',
  'ユーザーエージェント',
  '回答ID',
]

const VISITING_LABELS = {
  onsite: '文化祭に来場している',
  online: 'サイトを見ているだけ',
}

const ROLE_LABELS = {
  parent: '保護者',
  student: '他校の生徒',
  jhs: '中学生',
  other: 'その他',
}

const DISCOVERY_LABELS = {
  family_or_friends: '家族や友達から',
  poster: 'ポスター',
  instagram: 'Instagram',
  returning_visitor: '去年も来た',
  other: 'その他',
}

const VISIT_COUNT_LABELS = {
  first: '初めて',
  second: '2回目',
  three_or_more: '3回以上',
}

const GRADE_LABELS = {
  jhs1: '中学1年生',
  jhs2: '中学2年生',
  jhs3: '中学3年生',
}

const COMPANION_LABELS = {
  alone: 'ひとり',
  family: '家族',
  friends: '友達',
  school_or_club: '学校・部活動の仲間',
  other: 'その他',
}

const SATISFACTION_LABELS = {
  5: 'とても満足',
  4: '満足',
  3: 'どちらともいえない',
  2: 'あまり満足していない',
  1: '満足していない',
}

const ISSUE_LABELS = {
  none: '特になかった',
  crowded: '会場が混雑していた',
  hard_to_find: '企画の場所が分かりにくかった',
  long_wait: '待ち時間が長かった',
  transport: '駐車場・交通が分かりにくかった',
  payment: '支払い方法が分かりにくかった',
  few_rest_areas: '休憩場所が少なかった',
  not_enough_info: '案内・情報が不足していた',
  other: 'その他',
}

const REVISIT_LABELS = {
  definitely: 'ぜひ来たい',
  probably: 'できれば来たい',
  neutral: 'どちらともいえない',
  unlikely: 'あまり来たいと思わない',
}

const SITE_USEFULNESS_LABELS = {
  very_helpful: 'とても役に立った',
  helpful: '役に立った',
  neutral: 'どちらともいえない',
  not_helpful: 'あまり役に立たなかった',
  not_used: '使っていない',
}

const SCHOOL_INTEREST_LABELS = {
  greatly_increased: 'とても高まった',
  increased: '少し高まった',
  unchanged: '変わらなかった',
  decreased: 'あまり高まらなかった',
  unsure: 'わからない',
}

// ウェブアプリURLをブラウザで開いたときの動作確認用。
function doGet() {
  return jsonResponse_({
    ok: true,
    message: '鶴東祭アンケートの受信準備ができています。',
  })
}

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error('回答データがありません。')
    }

    const answer = JSON.parse(e.postData.contents)
    if (answer.surveyType === 'exit') validateExitAnswer_(answer)
    else validateAnswer_(answer)

    const lock = LockService.getScriptLock()
    lock.waitLock(10000)

    try {
      const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
      if (answer.surveyType === 'exit') {
        appendExitAnswer_(spreadsheet, answer)
        return jsonResponse_({ ok: true })
      }

      let sheet = spreadsheet.getSheetByName(SHEET_NAME)

      if (!sheet) {
        sheet = spreadsheet.insertSheet(SHEET_NAME)
      }

      ensureHeader_(sheet)

      sheet.appendRow([
        new Date(answer.answeredAt),
        VISITING_LABELS[answer.visiting],
        answer.role ? ROLE_LABELS[answer.role] : '',
        safeText_(answer.school),
        DISCOVERY_LABELS[answer.discovery],
        safeText_(answer.ua),
        answer.visitCount ? VISIT_COUNT_LABELS[answer.visitCount] : '',
        answer.grade ? GRADE_LABELS[answer.grade] : '',
        answer.companion ? COMPANION_LABELS[answer.companion] : '',
      ])

      const lastRow = sheet.getLastRow()
      sheet.getRange(lastRow, 1).setNumberFormat('yyyy/mm/dd hh:mm:ss')
    } finally {
      lock.releaseLock()
    }

    return jsonResponse_({ ok: true })
  } catch (error) {
    console.error(error)
    return jsonResponse_({ ok: false, error: String(error.message || error) })
  }
}

function appendExitAnswer_(spreadsheet, answer) {
  let sheet = spreadsheet.getSheetByName(EXIT_SHEET_NAME)
  if (!sheet) sheet = spreadsheet.insertSheet(EXIT_SHEET_NAME)

  ensureExitHeader_(sheet)

  // 通信の再試行などで同じ回答IDが届いた場合も、同じ行を重複追加しない。
  const responseIdColumn = EXIT_HEADERS.indexOf('回答ID') + 1
  if (
    sheet.getLastRow() > 1 &&
    sheet
      .getRange(2, responseIdColumn, sheet.getLastRow() - 1, 1)
      .createTextFinder(answer.responseId)
      .matchEntireCell(true)
      .findNext()
  ) {
    return
  }

  const projects = answer.favoriteProjects.map((project) =>
    safeText_(project.resultLabel || project.label)
  )
  sheet.appendRow([
    new Date(answer.answeredAt),
    answer.role ? ROLE_LABELS[answer.role] : '',
    safeText_(answer.school),
    answer.grade ? GRADE_LABELS[answer.grade] : '',
    projects[0] || '',
    projects[1] || '',
    projects[2] || '',
    SATISFACTION_LABELS[answer.satisfaction],
    answer.issues.map((issue) => ISSUE_LABELS[issue]).join(' / '),
    REVISIT_LABELS[answer.revisitIntent],
    SITE_USEFULNESS_LABELS[answer.siteUsefulness],
    answer.schoolInterest ? SCHOOL_INTEREST_LABELS[answer.schoolInterest] : '',
    safeText_(answer.improvement),
    safeText_(answer.ua),
    answer.responseId,
  ])
  sheet.getRange(sheet.getLastRow(), 1).setNumberFormat('yyyy/mm/dd hh:mm:ss')
}

function validateExitAnswer_(answer) {
  if (!answer || typeof answer !== 'object') {
    throw new Error('回答形式が正しくありません。')
  }
  if (typeof answer.responseId !== 'string' || answer.responseId.length < 16) {
    throw new Error('回答IDが正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(ROLE_LABELS, answer.role)) {
    throw new Error('属性が正しくありません。')
  }
  if (
    !Array.isArray(answer.favoriteProjects) ||
    answer.favoriteProjects.length < 1 ||
    answer.favoriteProjects.length > 3 ||
    answer.favoriteProjects.some((project) => !project || typeof project.label !== 'string')
  ) {
    throw new Error('面白かった企画が正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(SATISFACTION_LABELS, answer.satisfaction)) {
    throw new Error('満足度が正しくありません。')
  }
  if (
    !Array.isArray(answer.issues) ||
    answer.issues.length < 1 ||
    answer.issues.some((issue) => !Object.prototype.hasOwnProperty.call(ISSUE_LABELS, issue))
  ) {
    throw new Error('困ったことが正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(REVISIT_LABELS, answer.revisitIntent)) {
    throw new Error('再来場意向が正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(SITE_USEFULNESS_LABELS, answer.siteUsefulness)) {
    throw new Error('公式サイトの評価が正しくありません。')
  }
  if (
    answer.role === 'jhs' &&
    !Object.prototype.hasOwnProperty.call(SCHOOL_INTEREST_LABELS, answer.schoolInterest)
  ) {
    throw new Error('鶴岡東高校への興味・関心が正しくありません。')
  }
  if (String(answer.improvement || '').length > 500) {
    throw new Error('改善点は500文字以内で入力してください。')
  }
  if (!answer.answeredAt || Number.isNaN(new Date(answer.answeredAt).getTime())) {
    throw new Error('回答日時が正しくありません。')
  }
}

function validateAnswer_(answer) {
  if (!answer || typeof answer !== 'object') {
    throw new Error('回答形式が正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(VISITING_LABELS, answer.visiting)) {
    throw new Error('来場状況が正しくありません。')
  }
  if (
    answer.visiting === 'onsite' &&
    !Object.prototype.hasOwnProperty.call(ROLE_LABELS, answer.role)
  ) {
    throw new Error('属性が正しくありません。')
  }
  if (answer.role === 'jhs' && !answer.school) {
    throw new Error('出身中学が入力されていません。')
  }
  if (
    answer.role === 'jhs' &&
    !Object.prototype.hasOwnProperty.call(GRADE_LABELS, answer.grade)
  ) {
    throw new Error('中学生の学年が正しくありません。')
  }
  if (
    answer.visiting === 'onsite' &&
    !Object.prototype.hasOwnProperty.call(VISIT_COUNT_LABELS, answer.visitCount)
  ) {
    throw new Error('来場回数が正しくありません。')
  }
  if (
    answer.visiting === 'onsite' &&
    !Object.prototype.hasOwnProperty.call(COMPANION_LABELS, answer.companion)
  ) {
    throw new Error('同伴者が正しくありません。')
  }
  if (!Object.prototype.hasOwnProperty.call(DISCOVERY_LABELS, answer.discovery)) {
    throw new Error('知ったきっかけが正しくありません。')
  }
  if (!answer.answeredAt || Number.isNaN(new Date(answer.answeredAt).getTime())) {
    throw new Error('回答日時が正しくありません。')
  }
}

function ensureHeader_(sheet) {
  ensureSheetHeader_(sheet, HEADERS)
}

function ensureExitHeader_(sheet) {
  // 旧形式の「3企画を1セル」から、新形式の3列へ既存回答を移行する。
  if (sheet.getLastRow() > 0 && sheet.getRange(1, 5).getValue() === '面白かった企画（最大3つ）') {
    const lastRow = sheet.getLastRow()
    const oldValues = lastRow > 1 ? sheet.getRange(2, 5, lastRow - 1, 1).getValues() : []
    sheet.insertColumnsAfter(5, 2)
    if (oldValues.length > 0) {
      const splitValues = oldValues.map(([value]) => {
        const projects = String(value || '').split(' / ').slice(0, 3)
        return [projects[0] || '', projects[1] || '', projects[2] || '']
      })
      sheet.getRange(2, 5, splitValues.length, 3).setValues(splitValues)
    }
  }
  ensureSheetHeader_(sheet, EXIT_HEADERS)
}

function ensureSheetHeader_(sheet, headers) {
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#f97316')
    .setFontColor('#ffffff')
  sheet.setFrozenRows(1)
}

// スプレッドシートの数式として解釈される文字から始まる場合は無害化する。
function safeText_(value) {
  const text = String(value || '')
  return /^[=+\-@]/.test(text) ? `'${text}` : text
}

function jsonResponse_(body) {
  return ContentService
    .createTextOutput(JSON.stringify(body))
    .setMimeType(ContentService.MimeType.JSON)
}
