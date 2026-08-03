export const FESTIVAL = {
  name: '鶴東祭',
  romaji: 'TSURUTO FESTIVAL',
  year: 2026,
  dateISO: '2026-08-30',
  dateLabel: '2026.8.30 SUN',
  dateDisplayLabel: '2026年8月30日（日）',
  openHours: '9:00〜15:00',
  // Google Apps Script WebアプリのURL。未設定なら送信をスキップ(ローカル保存のみ)
  gasUrl: import.meta.env.VITE_SURVEY_GAS_URL || '',
  // 模擬店データ用Google Apps Script Webアプリ。
  stallsGasUrl: import.meta.env.VITE_STALLS_GAS_URL || '',
  // DEV管理画面からの書き込み用。簡易保護のため公開サイトでは完全な秘匿にはならない。
  stallsWriteToken: import.meta.env.VITE_STALLS_WRITE_TOKEN || '',
  // 公式Instagramが決まったら、このURLをアカウントURLへ変更してください。
  instagramUrl: 'https://www.instagram.com/tsuruoka_higashi/',
}

export const PARKING = {
  name: '切添グラウンド',
  address: '〒997-0022 山形県鶴岡市切添町10',
  latitude: 38.732017,
  longitude: 139.843653,
  googleMapUrl: 'https://www.google.com/maps/search/?api=1&query=38.732017%2C139.843653',
  googleEmbedUrl: 'https://www.google.com/maps?q=38.732017%2C139.843653&z=17&output=embed',
  androidMapUrl: 'geo:0,0?q=38.732017%2C139.843653(%E5%88%87%E6%B7%BB%E3%82%B0%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89)',
  appleMapUrl: 'https://maps.apple.com/?ll=38.732017%2C139.843653&q=%E5%88%87%E6%B7%BB%E3%82%B0%E3%83%A9%E3%82%A6%E3%83%B3%E3%83%89',
  streetViewUrl: 'https://maps.app.goo.gl/stj5BevyDW4JtWof8',
}

export function isFestivalDay(d = new Date()) {
  const [y, m, day] = FESTIVAL.dateISO.split('-').map(Number)
  return d.getFullYear() === y && d.getMonth() === m - 1 && d.getDate() === day
}

export function isBeforeFestivalDay(d = new Date()) {
  const [y, m, day] = FESTIVAL.dateISO.split('-').map(Number)
  const festivalDay = new Date(y, m - 1, day)
  const targetDay = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  return targetDay < festivalDay
}
