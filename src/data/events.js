// タイムテーブル(ダミー)。本番はスプレッドシートから生成する。

export const VENUES = [
  { id: 'stage', name: 'メインステージ', place: '中央体育館', emoji: '🎤' },
  { id: 'MLab', name: 'eスポーツ大会', place: '南校舎３F・Mラボ', emoji: '💻' },
  // { id: 'arena1', name: '第1アリーナ', place: '第1アリーナ', emoji: '🏟' },
]

export const EVENTS = [
  { id: 'e02', venue: 'stage', title: 'ダンス部パフォーマンス', by: 'チアダンス部', start: '11:00', end: '12:00', description: '笑顔と迫力あふれるダンスで、会場を元気いっぱいに盛り上げます。' },
  { id: 'e03', venue: 'stage', title: '吹奏楽パフォーマンス', by: '吹奏楽部', start: '13:30', end: '14:20', description: '親しみやすい楽曲を、吹奏楽ならではの豊かな響きでお届けします。' },
  { id: 'e04', venue: 'stage', title: '（仮）イーストコレクション', by: '', start: '14:30', end: '15:00', description: '鶴東祭を彩る、個性豊かなステージ企画です。詳細は決まり次第お知らせします。' },
  { id: 'e08', venue: 'MLab', title: 'ロケットリーグ大会①', by: '', start: '09:30', end: '10:30', description: '車でサッカーに挑むロケットリーグ大会。午前最初の対戦です。' },
  { id: 'e09', venue: 'MLab', title: 'ロケットリーグ大会②', by: '', start: '11:00', end: '12:00', description: 'スピードとチームワークがぶつかる、白熱の第2試合をお楽しみください。' },
  { id: 'e10', venue: 'MLab', title: 'ロケットリーグ大会③', by: '', start: '12:30', end: '13:30', description: '大会を締めくくる最終枠。熱戦の行方をMラボで見届けよう！' },
]
