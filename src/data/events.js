// タイムテーブル(ダミー)。本番はスプレッドシートから生成する。

export const VENUES = [
  { id: 'stage', name: 'メインステージ', place: '中央体育館', emoji: '🎤' },
  { id: 'south-gym', name: '熊本地震チャリティーバザー', place: '南体育館', emoji: '🛍️' },
  { id: 'MLab', name: 'eスポーツ大会', place: '南校舎３F・Mラボ', emoji: '💻' },
  // { id: 'arena1', name: '第1アリーナ', place: '第1アリーナ', emoji: '🏟' },
]

export const EVENTS = [
  { id: 'e02', venue: 'stage', title: 'ダンス部パフォーマンス', by: 'チアダンス部', start: '11:00', end: '12:00', description: '笑顔と迫力あふれるダンスで、会場を元気いっぱいに盛り上げます。' },
  { id: 'e05', venue: 'south-gym', title: '熊本地震チャリティーバザー', by: '奉仕部', start: '9:00', end: '15:00', description: '教員や保護者の皆さまからご提供いただいた商品を販売します。売上の一部は、熊本地震に関わる義援金として寄付します。' },
  { id: 'e03', venue: 'stage', title: '吹奏楽パフォーマンス', by: '吹奏楽部', start: '13:30', end: '14:20', description: '親しみやすい楽曲を、吹奏楽ならではの豊かな響きでお届けします。' },
  { id: 'e04', venue: 'stage', title: '（仮）イーストコレクション', by: '', start: '14:30', end: '15:00', description: '鶴東祭を彩る、個性豊かなステージ企画です。詳細は決まり次第お知らせします。' },
  { id: 'e08', venue: 'MLab', title: 'eスポーツ体験', by: 'eスポーツ部', start: '10:00', end: '13:00', description: '10:00から13:00まで、30分おきに開催します。参加をご希望の方は、南校舎３FのMラボにお越しください。初めての方も大歓迎！車でサッカーに挑む「ロケットリーグ」のeスポーツ体験を行います。お友達と一緒に高性能PCでゲームを体験してみましょう！' },
]
