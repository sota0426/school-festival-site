// 模擬店データ(ダミー30店)。本番はGoogleスプレッドシートからビルド時に生成する。
// loc: { type:'out', x, y }(全体マップ座標) or { type:'room', building, floor, room }
// poster: '/images/stalls/s01.webp' を追加すると一覧・詳細に表示される。
// org: クラス・部活動・有志グループなどの団体名。foodGenre: フードの小ジャンル。
// ポスターはスマホで読みやすい横A4比率(297:210)、WebP/JPEG、横1600px程度を推奨。
// 縦長画像も切り抜かずに全体表示する。

export const DEFAULT_STALLS = [
  // --- 第1グラウンド(屋外フード) ---
  { id: 's01', name: '焼きそば鶴', org: '3年A組', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 292, y: 438 }, placeLabel: '第1グラウンド', menu: [['焼きそば', 300], ['大盛り', 400]], hours: '10:00〜15:00', pr: '鉄板で焼き上げる伝統の鶴東ソース焼きそば!' },
  { id: 's02', name: 'たこ焼き番長', org: '3年B組', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 350, y: 470 }, placeLabel: '第1グラウンド', menu: [['たこ焼き6個', 350], ['チーズトッピング', 50]], hours: '10:00〜15:00', pr: '外カリ中トロ。行列必至の人気店です。' },
  { id: 's03', name: 'フランクフルト工房', org: '野球部', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 296, y: 512 }, placeLabel: '第1グラウンド', menu: [['フランクフルト', 250], ['チーズドッグ', 350]], hours: '9:30〜15:30', pr: '野球部が心を込めて焼きます。ジューシーさ日本一!' },
  { id: 's04', name: 'かき氷 ひんやり堂', org: 'サッカー部', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 354, y: 548 }, placeLabel: '第1グラウンド', menu: [['いちご/ブルーハワイ', 200], ['練乳追加', 50]], hours: '10:00〜15:30', pr: '真夏の文化祭はこれがないと始まらない!' },
  { id: 's05', name: 'チュロスカフェ吹部', org: '吹奏楽部', cat: 'food', foodGenre: 'fried', loc: { type: 'out', x: 428, y: 438 }, placeLabel: '第1グラウンド', menu: [['シナモンチュロス', 300], ['チョコチュロス', 350]], hours: '10:00〜14:30', pr: '演奏の合間に揚げたてをどうぞ♪' },
  { id: 's06', name: '炭火焼き鳥 PTA亭', org: 'PTA', cat: 'food', foodGenre: 'meal', loc: { type: 'out', x: 470, y: 478 }, placeLabel: '第1グラウンド', menu: [['焼き鳥2本', 300], ['タレ/塩', 0]], hours: '10:30〜15:00', pr: '保護者の本気。炭火の香りに誘われて。' },
  { id: 's07', name: 'ベビーカステラ三組', org: '3年C組', cat: 'food', foodGenre: 'sweets', loc: { type: 'out', x: 432, y: 520 }, placeLabel: '第1グラウンド', menu: [['10個入り', 300], ['20個入り', 550]], hours: '10:00〜15:00', pr: 'ひとくちサイズの幸せ、揚げたてをどうぞ。' },
  { id: 's08', name: 'ドリンク&ラムネ売店', org: '生徒会', cat: 'food', foodGenre: 'drink', loc: { type: 'out', x: 472, y: 560 }, placeLabel: '第1グラウンド', menu: [['ラムネ', 150], ['お茶・ジュース', 120]], hours: '9:00〜16:00', pr: '熱中症対策はこまめな水分補給から!' },

  // --- 第2グラウンド(屋外ゲーム) ---
  { id: 's09', name: '射的 鶴東ガンマン', org: '2年E組', cat: 'game', loc: { type: 'out', x: 812, y: 300 }, placeLabel: '第2グラウンド', menu: [['5発', 200]], hours: '10:00〜15:30', pr: '景品多数!狙いを定めて一攫千金。' },
  { id: 's10', name: 'スーパーボールすくい', org: '2年F組', cat: 'game', loc: { type: 'out', x: 890, y: 370 }, placeLabel: '第2グラウンド', menu: [['1回', 150]], hours: '10:00〜15:30', pr: '夏祭り気分をもう一度。小さなお子様に大人気。' },

  // --- 中央校舎1F ---
  { id: 's11', name: '縁日コーナー', org: '1年A組', cat: 'game', loc: { type: 'room', building: 'honkan', floor: '1f', room: 'h1-7' }, placeLabel: '中央校舎1F 1年A組', menu: [['輪投げ・くじ 各', 100]], hours: '9:30〜15:30', pr: '初めての文化祭、全力でおもてなしします!' },
  { id: 's12', name: '写真部作品展', org: '写真部', cat: 'exhibit', loc: { type: 'room', building: 'honkan', floor: '1f', room: 'h1-8' }, placeLabel: '中央校舎1F 1年B組', menu: [], hours: '9:00〜16:00', pr: '一年間の傑作を一挙公開。フォトスポットもあります。' },
  { id: 's13', name: '書道部 大作展示', org: '書道部', cat: 'exhibit', loc: { type: 'room', building: 'honkan', floor: '1f', room: 'h1-10' }, placeLabel: '中央校舎1F 多目的室', menu: [], hours: '9:00〜16:00', pr: '畳一畳分の大作は圧巻。あなたの名前も書きます。' },

  // --- 中央校舎2F ---
  { id: 's14', name: 'お化け屋敷「鶴の呪い」', org: '2年A組', cat: 'game', loc: { type: 'room', building: 'honkan', floor: '2f', room: 'h2-1' }, placeLabel: '中央校舎2F 2年A組', menu: [['入場', 100]], hours: '10:00〜15:30', pr: '今年もやります学年最恐。心臓の弱い方はご注意を…' },
  { id: 's15', name: '謎解き脱出ゲーム', org: '2年B組', cat: 'game', loc: { type: 'room', building: 'honkan', floor: '2f', room: 'h2-2' }, placeLabel: '中央校舎2F 2年B組', menu: [['1チーム', 200]], hours: '10:00〜15:00', pr: '制限時間15分。教室から脱出できるか!?' },
  { id: 's16', name: '和カフェ 鶴屋', org: '2年C組', cat: 'cafe', loc: { type: 'room', building: 'honkan', floor: '2f', room: 'h2-3' }, placeLabel: '中央校舎2F 2年C組', menu: [['抹茶ラテ', 300], ['白玉あんみつ', 350]], hours: '10:00〜15:30', pr: '和の空間でほっとひと息。浴衣スタッフがお出迎え。' },
  { id: 's17', name: '科学部プラネタリウム', org: '科学部', cat: 'exhibit', loc: { type: 'room', building: 'honkan', floor: '2f', room: 'h2-6' }, placeLabel: '中央校舎2F 理科室', menu: [['観覧無料', 0]], hours: '上映 毎時00分/30分', pr: '手作りドームで満天の星空を。1回15分の癒やし体験。' },

  // --- 中央校舎3F ---
  { id: 's18', name: 'クレープ喫茶 ふわり', org: '家庭科部', cat: 'cafe', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-6' }, placeLabel: '中央校舎3F 家庭科室', menu: [['チョコバナナ', 350], ['いちごカスタード', 400]], hours: '10:00〜15:00', pr: '生地から手作り。焼きたてもちもちクレープ。' },
  { id: 's19', name: '鉄道模型ジオラマ運転会', org: '鉄道研究会', cat: 'exhibit', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-2' }, placeLabel: '中央校舎3F 3年B組', menu: [['運転体験', 100]], hours: '9:30〜15:30', pr: '全長10mの大ジオラマ。運転体験は先着順!' },
  { id: 's20', name: 'eスポーツ体験会', org: 'パソコン部', cat: 'game', loc: { type: 'room', building: 'honkan', floor: '3f', room: 'h3-7' }, placeLabel: '中央校舎3F コンピュータ室', menu: [['体験無料', 0]], hours: '10:00〜15:30', pr: '部員に勝ったら景品あり。初心者大歓迎!' },

  // --- 南校舎1F ---
  { id: 's21', name: '古本市', org: '図書委員会', cat: 'exhibit', loc: { type: 'room', building: 'minami', floor: '1f', room: 'm1-1' }, placeLabel: '南校舎1F 図書室', menu: [['文庫', 50], ['単行本', 100]], hours: '9:30〜15:30', pr: '掘り出し物多数。売上は図書室の新刊購入に使います。' },
  { id: 's22', name: '駄菓子屋 とうこう堂', org: '1年D組', cat: 'food', foodGenre: 'snack', loc: { type: 'room', building: 'minami', floor: '1f', room: 'm1-2' }, placeLabel: '南校舎1F 1年D組', menu: [['駄菓子詰め合わせ', 200]], hours: '10:00〜15:30', pr: '昭和レトロな教室で懐かしの駄菓子はいかが?' },
  { id: 's23', name: 'ボードゲームカフェ', org: '囲碁将棋部', cat: 'game', loc: { type: 'room', building: 'minami', floor: '1f', room: 'm1-7' }, placeLabel: '南校舎1F 食堂', menu: [['30分遊び放題', 100]], hours: '9:30〜15:30', pr: '囲碁・将棋からカードゲームまで50種類!' },

  // --- 南校舎2F ---
  { id: 's24', name: 'イラスト部展示&似顔絵', org: 'イラスト部', cat: 'exhibit', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-1' }, placeLabel: '南校舎2F 2年E組', menu: [['似顔絵', 200]], hours: '10:00〜15:00', pr: '待ち時間10分であなたをアニメ風に描きます!' },
  { id: 's25', name: 'タピオカスタンド', org: '1年E組', cat: 'cafe', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-2' }, placeLabel: '南校舎2F 2年F組', menu: [['ミルクティー', 300], ['黒糖ラテ', 350]], hours: '10:00〜15:00', pr: 'もちもちタピオカ、映えるカップでお待ちしてます。' },
  { id: 's26', name: 'ミニシアター上映会', org: '映画研究会', cat: 'exhibit', loc: { type: 'room', building: 'minami', floor: '2f', room: 'm2-5' }, placeLabel: '南校舎2F 講義室1', menu: [['観覧無料', 0]], hours: '上映 10:00/12:00/14:00', pr: '部員自主制作の短編3本立て。涙と笑いの30分。' },

  // --- 北校舎 ---
  { id: 's27', name: 'わたあめ工場', org: '中学3年A組', cat: 'food', foodGenre: 'sweets', loc: { type: 'room', building: 'chugaku', floor: '1f', room: 'c1-1' }, placeLabel: '北校舎1F 中1A組', menu: [['わたあめ', 200], ['カラフル', 300]], hours: '10:00〜15:00', pr: '虹色わたあめ、写真映え間違いなし!' },
  { id: 's28', name: 'ポップコーン屋台', org: '中学3年B組', cat: 'food', foodGenre: 'snack', loc: { type: 'room', building: 'chugaku', floor: '1f', room: 'c1-2' }, placeLabel: '北校舎1F 中1B組', menu: [['塩/キャラメル', 250]], hours: '10:00〜15:00', pr: 'できたてポンポン弾ける音もお楽しみ。' },
  { id: 's29', name: '中学美術部展', org: '中学美術部', cat: 'exhibit', loc: { type: 'room', building: 'chugaku', floor: '2f', room: 'c2-4' }, placeLabel: '北校舎2F 美術室', menu: [], hours: '9:00〜16:00', pr: '中学生の感性が爆発。体験コーナーもあります。' },
  { id: 's30', name: 'クイズラリー本部', org: '中学生徒会', cat: 'game', loc: { type: 'room', building: 'chugaku', floor: '2f', room: 'c2-5' }, placeLabel: '北校舎2F 多目的室', menu: [['参加無料・景品あり', 0]], hours: '9:30〜15:00', pr: '校内を巡ってクイズに挑戦。全問正解で豪華景品!' },
]

const STALLS_STORAGE_KEY = 'festival-stalls-v1'

function readSavedStalls() {
  if (typeof window === 'undefined') return null
  try {
    const saved = JSON.parse(localStorage.getItem(STALLS_STORAGE_KEY) || 'null')
    return Array.isArray(saved) && saved.length > 0
      ? saved.map((stall) => stall.foodGenre === 'grill' ? { ...stall, foodGenre: 'meal' } : stall)
      : null
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

export const stallById = (id) => STALLS.find((s) => s.id === id)

export function stallsInBuilding(buildingId) {
  return STALLS.filter((s) => s.loc.type === 'room' && s.loc.building === buildingId)
}

export function stallsOnFloor(buildingId, floorId) {
  return STALLS.filter(
    (s) => s.loc.type === 'room' && s.loc.building === buildingId && s.loc.floor === floorId,
  )
}

export const outdoorStalls = () => STALLS.filter((s) => s.loc.type === 'out')
