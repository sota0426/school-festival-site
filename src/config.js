export const FESTIVAL = {
  name: '鶴東祭',
  romaji: 'TSURUTO FESTIVAL',
  year: 2026,
  dateISO: '2026-08-30',
  dateLabel: '2026.8.30 SUN',
  openHours: '9:00〜16:00',
  // Google Apps Script WebアプリのURL。空ならアンケート送信はスキップ(ローカル保存のみ)
  gasUrl: '',
}

export function isFestivalDay(d = new Date()) {
  const [y, m, day] = FESTIVAL.dateISO.split('-').map(Number)
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day
}
