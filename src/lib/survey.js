import { FESTIVAL, isFestivalDay } from '../config'

const KEY = 'tsuruto2026_survey'
const EXIT_KEY = 'tsuruto2026_exit_survey'
const PENDING_KEY = 'tsuruto2026_survey_pending'

export function loadSurvey() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

export function loadExitSurvey() {
  try {
    return JSON.parse(localStorage.getItem(EXIT_KEY))
  } catch {
    return null
  }
}

// アンケートは開催日のみ表示し、当日にまだ回答していない場合だけ必須にする。
export function needSurvey() {
  if (!isFestivalDay()) return false

  const saved = loadSurvey()
  if (!saved) return true

  const answered = new Date(saved.answeredAt)
  return Number.isNaN(answered.getTime()) || !isFestivalDay(answered)
}

export function saveSurvey(answer) {
  const record = { ...answer, surveyType: 'entry', answeredAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify(record))
  sendToGas(record)
}

export function saveExitSurvey(answer) {
  if (loadExitSurvey()) return false

  const record = {
    ...answer,
    surveyType: 'exit',
    responseId: crypto.randomUUID(),
    answeredAt: new Date().toISOString(),
  }
  localStorage.setItem(EXIT_KEY, JSON.stringify(record))
  sendToGas(record)
  return true
}

async function sendToGas(record) {
  if (!FESTIVAL.gasUrl) {
    console.info('[survey] gasUrl未設定のため送信スキップ:', record)
    return
  }
  try {
    await fetch(FESTIVAL.gasUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify({ ...record, ua: navigator.userAgent }),
    })
  } catch {
    // 送信失敗分は退避して次回アクセス時に再送
    const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')
    pending.push(record)
    localStorage.setItem(PENDING_KEY, JSON.stringify(pending))
  }
}

export async function flushPendingSurveys() {
  if (!FESTIVAL.gasUrl) return
  const pending = JSON.parse(localStorage.getItem(PENDING_KEY) || '[]')
  if (pending.length === 0) return
  localStorage.removeItem(PENDING_KEY)
  for (const record of pending) await sendToGas(record)
}
