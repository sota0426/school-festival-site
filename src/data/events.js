// タイムテーブル(ダミー)。本番はスプレッドシートから生成する。

export const VENUES = [
  { id: 'stage', name: 'メインステージ', place: '第1グラウンド特設', emoji: '🎤' },
  { id: 'hall', name: '講堂', place: '講堂', emoji: '🎭' },
  { id: 'arena1', name: '第1アリーナ', place: '第1アリーナ', emoji: '🏟' },
]

export const EVENTS = [
  { id: 'e01', venue: 'hall', title: 'オープニングセレモニー', by: '生徒会', start: '09:30', end: '10:00' },
  { id: 'e02', venue: 'stage', title: 'ダンス部パフォーマンス', by: 'ダンス部', start: '10:00', end: '10:40' },
  { id: 'e03', venue: 'arena1', title: '部活動体験会(バスケ・バド)', by: '運動部合同', start: '10:00', end: '11:00' },
  { id: 'e04', venue: 'hall', title: '吹奏楽部サマーコンサート', by: '吹奏楽部', start: '10:30', end: '11:30' },
  { id: 'e05', venue: 'stage', title: '軽音楽部ライブ', by: '軽音楽部', start: '11:00', end: '12:00' },
  { id: 'e06', venue: 'arena1', title: 'クイズ大会 決勝戦', by: '中学生徒会', start: '11:30', end: '12:15' },
  { id: 'e07', venue: 'hall', title: '演劇部公演「鶴の恩返し2026」', by: '演劇部', start: '13:00', end: '14:00' },
  { id: 'e08', venue: 'stage', title: '有志パフォーマンス大会', by: '有志', start: '13:30', end: '14:20' },
  { id: 'e09', venue: 'arena1', title: '中学合唱コンクール', by: '中学全学年', start: '14:00', end: '15:00' },
  { id: 'e10', venue: 'stage', title: '書道パフォーマンス', by: '書道部', start: '14:30', end: '15:00' },
  { id: 'e11', venue: 'hall', title: 'クロージング&大抽選会', by: '生徒会', start: '15:30', end: '16:00' },
]
