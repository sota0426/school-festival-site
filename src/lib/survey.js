import { FESTIVAL, isFestivalDay } from '../config'

const KEY = 'tsuruto2026_survey'
const PENDING_KEY = 'tsuruto2026_survey_pending'

export function loadSurvey() {
  try {
    return JSON.parse(localStorage.getItem(KEY))
  } catch {
    return null
  }
}

// 初回は必須回答。事前に「見るだけ」と答えた端末には当日もう一度出す。
export function needSurvey() {
  const saved = loadSurvey()
  if (!saved) return true
  if (isFestivalDay() && saved.visiting === 'online') {
    const answered = new Date(saved.answeredAt)
    return !isFestivalDay(answered)
  }
  return false
}

export function saveSurvey(answer) {
  const record = { ...answer, answeredAt: new Date().toISOString() }
  localStorage.setItem(KEY, JSON.stringify(record))
  sendToGas(record)
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
