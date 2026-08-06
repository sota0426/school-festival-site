// 2026年度 模擬店・展示データ
// loc: { type:'out', x, y }(敷地全体マップ座標) or { type:'guide' }(校舎案内マップ) or { type:'room', building, floor, room }
// poster: '/images/stalls/s01.webp' または
// poster: { thumbnail:'/images/stalls/s01-thumb.webp', src:'/images/stalls/s01.webp' }
// とすると、一覧は軽量版、詳細は高画質版を表示する。
// 各企画のメニューは1件のみ。価格情報は持たない。

export const DEFAULT_STALLS = [
  // --- 屋外 ---
  { id: 's03', name: 'もちもちタピオカ', org: '体3A', cat: 'food', foodGenre: 'drink', loc: { type: 'out', x: 274, y: 424 }, menu: [['タピオカ']], hours: '', pr: 'もちもち食感が楽しいタピオカドリンク。散策のお供にどうぞ！' },
  { id: 's13', name: 'アサイーボウル', org: '普3C', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 334, y: 424 }, menu: [['アサイーボウル']], hours: '', pr: 'フルーツと一緒に楽しむ、彩り豊かなアサイーボウルです。' },
  { id: 's21', name: 'フリフリポテト', org: '体2C', cat: 'food', foodGenre: 'fried', loc: { type: 'out', x: 394, y: 424 }, menu: [['フリフリポテト']], hours: '', pr: '好きな味を選んでフリフリ！揚げたてポテトをお楽しみください。' },
  { id: 's05', name: '鉄板焼きそば', org: '体3B', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 454, y: 424 }, menu: [['焼きそば']], hours: '', pr: '香ばしいソースの香りが食欲をそそる、文化祭定番の焼きそばです。' },
  { id: 's20', name: 'あつあつたこ焼き', org: '体2B', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 274, y: 478 }, menu: [['たこ焼き']], hours: '', pr: '外は香ばしく、中はとろっと。あつあつのたこ焼きをどうぞ！' },
  { id: 's14', name: '焼きたてワッフル', org: '特2A', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 334, y: 478 }, menu: [['ワッフル']], hours: '', pr: '甘い香りの焼きたてワッフルで、ほっとひと息つきませんか？' },
  { id: 's25', name: 'ほくほくじゃがバター', org: '特1A', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 394, y: 478 }, menu: [['じゃがバター']], hours: '', pr: 'ほくほくのじゃがいもとバターの相性が抜群です。' },
  { id: 's23', name: 'ひんやりかき氷', org: '普2B', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 454, y: 478 }, menu: [['かき氷']], hours: '', pr: '暑い文化祭にぴったり！ひんやりかき氷でクールダウン。' },
  { id: 's27', name: 'おにぎり処', org: '体1A', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 274, y: 532 }, menu: [['おにぎり']], hours: '', pr: '片手で食べやすいおにぎり。校内を巡る前の腹ごしらえにどうぞ。' },
  { id: 's06', name: 'ふわふわクレープ', org: '体3B', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 334, y: 532 }, menu: [['クレープ']], hours: '', pr: 'もちもちの生地で包んだ、文化祭限定のクレープです。' },
  { id: 's29', name: 'ソフトクリーム', org: '体1B', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 394, y: 532 }, menu: [['ソフトクリーム']], hours: '', pr: 'なめらかで冷たいソフトクリームをお楽しみください。' },
  { id: 's08', name: '香ばし焼き鳥', org: '普3A', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 454, y: 532 }, menu: [['焼き鳥']], hours: '', pr: '香ばしく焼き上げた焼き鳥。食欲をそそる香りが目印です！' },
  { id: 's31', name: 'ひんやり冷凍フルーツ', org: '普1A', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 274, y: 586 }, menu: [['冷凍フルーツ']], hours: '', pr: 'ひんやり爽やかな冷凍フルーツ。気軽に楽しめるデザートです。' },
  { id: 's18', name: 'ふわふわパンケーキ', org: '体2A', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 334, y: 586 }, menu: [['パンケーキ']], hours: '', pr: 'ふんわり焼き上げたパンケーキで、甘い時間をお届けします。' },
  { id: 's19', name: 'ジューススタンド', org: '体2A', cat: 'food', foodGenre: 'drink', loc: { type: 'out', x: 394, y: 586 }, menu: [['ジュース']], hours: '', pr: 'パンケーキと一緒に楽しめる、冷たいジュースをご用意します。' },
  { id: 's10', name: '一本きゅうり', org: '普3B', cat: 'food', foodGenre: 'snack', loc: { type: 'out', x: 454, y: 586 }, menu: [['きゅうり']], hours: '', pr: 'さっぱり食べられる一本きゅうり。食べ歩きにもおすすめです。' },
  { id: 's11', name: 'つるっと冷うどん', org: '普3B', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 520, y: 438 }, menu: [['冷うどん']], hours: '', pr: '暑い日にうれしい、つるっと食べられる冷たいうどんです。' },
  { id: 's07', name: 'サーターアンダギー', org: '体3C', cat: 'food', foodGenre: 'fried', loc: { type: 'out', x: 520, y: 500 }, menu: [['サーターアンダギー']], hours: '', pr: '外はさっくり、中はふんわり。沖縄のおやつを味わってください！' },
  { id: 's35', name: '教員企画', org: '教員', cat: 'exhibit', loc: { type: 'out', x: 520, y: 562 }, menu: [], hours: '', pr: '先生方による企画です。内容は決まり次第お知らせします。' },

  { id: 's41', name: 'フリーマーケット', org: '図書部', cat: 'exhibit', loc: { type: 'out', x: 475, y: 225 }, menu: [], hours: '', pr: '掘り出し物を探してみませんか？売り上げは震災支援のために寄付します。' },

  // --- 校舎案内 ---
  { id: 's40', name: '休けい所', org: '図書委員会', cat: 'exhibit', loc: { type: 'guide', x: 18, y: 27 }, menu: [['無料の水']], hours: '', pr: '無料の水があります。涼しい部屋でゆっくり休憩しましょう。' },

  // --- 中央校舎1F ---
  { id: 's15', name: 'りんご飴', org: '特2A', cat: 'food', foodGenre: 'sweets', loc: { type: 'room', building: 'honkan', floor: '1f', room: 'h1-1' }, menu: [['りんご飴']], hours: '', pr: 'つやつやの飴で包んだ、見た目にもかわいいりんご飴です。' },
  { id: 's37', name: '美術部作品展示', org: '美術部', cat: 'exhibit', loc: { type: 'guide', x: 35, y: 27 }, menu: [], hours: '', pr: '美術部員が心を込めて制作した作品を展示します。個性豊かな表現をお楽しみください。' },

  // --- 中央校舎2F ---
  { id: 's34', name: '生徒会オリジナルジュース', org: '生徒会', cat: 'food', foodGenre: 'drink', loc: { type: 'room', building: 'honkan', floor: '2f', room: 'h2-10' }, menu: [['オリジナルジュース']], hours: '', pr: '生徒会が考えた文化祭限定のオリジナルジュースをお楽しみください！' },

  // --- 中央校舎3F ---
  { id: 's01', name: 'ベビーカステラ', org: '特3A', cat: 'food', foodGenre: 'sweets', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-1' }, menu: [['ベビーカステラ']], hours: '', pr: 'ころんとかわいい、ふんわり甘いベビーカステラをどうぞ！' },
  { id: 's02', name: 'チーズボール', org: '特3A', cat: 'food', foodGenre: 'fried', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-1' }, menu: [['チーズボール']], hours: '', pr: '外はカリッ、中からチーズがとろり。熱々をお楽しみください。' },
  { id: 's09', name: 'ホットドッグ', org: '普3A', cat: 'food', foodGenre: 'meal', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-2' }, menu: [['ホットドッグ']], hours: '', pr: '食べ応えのあるホットドッグ。小腹が空いたときにもぴったりです。' },
  { id: 's16', name: '揚げたてチュロス', org: '特2B', cat: 'food', foodGenre: 'fried', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-3' }, menu: [['チュロス']], hours: '', pr: 'さくっと香ばしい揚げたてチュロス。甘い香りを目印にお越しください！' },
  { id: 's17', name: 'フルーツジュース', org: '特2B', cat: 'food', foodGenre: 'drink', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-3' }, menu: [['フルーツジュース']], hours: '', pr: 'フルーツのおいしさを楽しめる、爽やかなジュースです。' },
  { id: 's33', name: 'ちいかわカフェ', org: '普1B', cat: 'cafe', foodGenre: 'sweets', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-1' }, menu: [['カフェメニュー']], hours: '', pr: 'かわいい世界観に包まれたカフェで、楽しいひとときをお過ごしください。' },
  { id: 's36', name: '特進コース研究展示', org: '特進コース', cat: 'exhibit', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-9' }, menu: [], hours: '', pr: '特進コースで取り組んだ研究成果を展示します。日頃の学びをぜひご覧ください。' },

  // --- 南校舎2F ---
  { id: 's12', name: 'メイドカフェ', org: '普3C', cat: 'cafe', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-2' }, menu: [['カフェメニュー']], hours: '', pr: 'いつもの教室が特別なカフェに変身。心を込めてお迎えします！' },
  { id: 's22', name: 'ミッション制お化け屋敷', org: '普2A', cat: 'game', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-1' }, menu: [['入場']], hours: '', pr: '複数の教室を巡り、恐怖のミッションに挑戦！無事に脱出できるでしょうか。' },
  { id: 's24', name: 'わくわく射的', org: '普2B', cat: 'game', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-6' }, menu: [['射的']], hours: '', pr: '狙いを定めて景品をゲット！子どもから大人まで楽しめる射的です。' },
  { id: 's30', name: 'キッキングスナイパー＆ポップコーン', org: '体1C', cat: 'game', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-8' }, menu: [['キッキングスナイパー & ポップコーン']], hours: '', pr: 'キックの腕試しに挑戦！遊んだ後はポップコーンもお楽しみください。' },
  { id: 's32', name: 'ミッション制お化け屋敷', org: '普1B', cat: 'game', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-7' }, menu: [['入場']], hours: '', pr: '不気味な理科室でミッションに挑戦。勇気を出して最後まで進もう！' },

  // --- 南校舎3F ---
  { id: 's04', name: 'チョコバナナ', org: '体3A', cat: 'food', foodGenre: 'sweets', loc: { type: 'room', building: 'minami', floor: '3f', room: 'm3-1' }, menu: [['チョコバナナ']], hours: '', pr: 'バナナとチョコの王道コンビ。見た目も楽しい文化祭スイーツです。' },
  { id: 's26', name: 'ストラックアウト', org: '特1A', cat: 'game', loc: { type: 'room', building: 'minami', floor: '3f', room: 'm3-2' }, menu: [['ストライクアウト']], hours: '', pr: '的をめがけて全力投球！何枚抜けるか挑戦してみよう。' },
  { id: 's28', name: '映えスポット', org: '体1A', cat: 'exhibit', loc: { type: 'room', building: 'minami', floor: '3f', room: 'm3-3' }, menu: [], hours: '', pr: '文化祭の思い出を写真に残せるフォトスポットです。お気に入りの一枚をどうぞ！' },
  { id: 's39', name: 'eスポーツ体験会', org: 'eスポーツ部', cat: 'game', loc: { type: 'room', building: 'minami', floor: '3f', room: 'm3-5' }, menu: [['体験']], hours: '', pr: '初めての方も大歓迎！仲間と一緒にeスポーツを体験してみませんか？' },
]

const STALLS_STORAGE_KEY = 'festival-stalls-v2'

function readSavedStalls() {
  if (typeof window === 'undefined') return null
  try {
    const saved = JSON.parse(localStorage.getItem(STALLS_STORAGE_KEY) || 'null')
    if (!Array.isArray(saved) || saved.length === 0) return null
    const migrated = saved.map((stall) => {
      const normalized = stall.foodGenre === 'grill' ? { ...stall, foodGenre: 'meal' } : stall
      if (stall.id === 's37') return { ...normalized, loc: { type: 'guide', x: normalized.loc.x ?? 35, y: normalized.loc.y ?? 27 } }
      if (stall.id === 's40' && normalized.loc.type === 'guide') return { ...normalized, loc: { ...normalized.loc, x: normalized.loc.x ?? 18, y: normalized.loc.y ?? 27 } }
      return normalized
    })
    const savedIds = new Set(migrated.map((stall) => stall.id))
    const additions = DEFAULT_STALLS.filter((stall) => ['s40', 's41'].includes(stall.id) && !savedIds.has(stall.id))
    return [...migrated, ...structuredClone(additions)]
  } catch {
    return null
  }
}

export const STALLS = readSavedStalls() || structuredClone(DEFAULT_STALLS)

export function replaceStalls(nextStalls) {
  STALLS.splice(0, STALLS.length, ...structuredClone(nextStalls))
  localStorage.setItem(STALLS_STORAGE_KEY, JSON.stringify(STALLS))
  window.dispatchEvent(new CustomEvent('festival-data-save'))
}

export function resetStalls() {
  replaceStalls(DEFAULT_STALLS)
}

export const stallById = (id) => STALLS.find((stall) => stall.id === id)

export function stallsInBuilding(buildingId) {
  return STALLS.filter((stall) => stall.loc.type === 'room' && stall.loc.building === buildingId)
}

export function stallsOnFloor(buildingId, floorId) {
  return STALLS.filter(
    (stall) => stall.loc.type === 'room' && stall.loc.building === buildingId && stall.loc.floor === floorId,
  )
}

export const outdoorStalls = () => STALLS.filter((stall) => stall.loc.type === 'out')
