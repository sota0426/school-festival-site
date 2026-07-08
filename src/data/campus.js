// 敷地全体マップの定義(ダミー校舎配置。本番のイラストマップに合わせて調整する)
// 座標は viewBox 0 0 1000 700 上の値

export const CAMPUS = { w: 1000, h: 700 }

// kind: main(オレンジ校舎) / school(青校舎) / arena(ピンク) / ground(グラウンド) /
//       green(コート・緑地) / pool / infra(グレー設備)
// indoor: true のものはタップでフロア図にズームインできる
export const BUILDINGS = [
  { id: 'tennis', num: 14, name: '女子テニスコート', kind: 'green', x: 420, y: 20, w: 195, h: 95 },
  { id: 'tokubetsu-w', num: 9, name: '特別教室棟西館', kind: 'school', x: 385, y: 118, w: 190, h: 52, rot: -7 },
  { id: 'tokubetsu-e', num: 8, name: '特別教室棟東館', kind: 'school', x: 560, y: 150, w: 215, h: 58, rot: -7 },
  { id: 'kinenkan', num: 4, name: '100周年記念館', kind: 'main', x: 172, y: 196, w: 108, h: 100 },
  { id: 'kodo', num: 2, name: '講堂', kind: 'main', x: 330, y: 188, w: 88, h: 94 },
  { id: 'tosho', num: 3, name: '図書室', kind: 'main', x: 432, y: 190, w: 86, h: 88 },
  { id: 'kita', num: 5, name: '高校北館', kind: 'school', x: 28, y: 240, w: 152, h: 92 },
  { id: 'minami', num: 6, name: '高校南館', kind: 'school', x: 28, y: 348, w: 178, h: 92, indoor: true },
  { id: 'honkan', num: 1, name: '本館', kind: 'main', x: 196, y: 252, w: 224, h: 132, indoor: true },
  { id: 'chugaku', num: 7, name: '中学館', kind: 'school', x: 442, y: 250, w: 282, h: 88, indoor: true },
  { id: 'g2', num: 13, name: '第2グラウンド', kind: 'ground', x: 748, y: 216, w: 238, h: 246, round: 46 },
  { id: 'arena1', num: 10, name: '第1アリーナ', kind: 'arena', x: 578, y: 352, w: 150, h: 96 },
  { id: 'arena2', num: 11, name: '第2アリーナ', kind: 'arena', x: 578, y: 458, w: 166, h: 110 },
  { id: 'g1', num: 12, name: '第1グラウンド', kind: 'ground', x: 256, y: 396, w: 252, h: 212, round: 30 },
  { id: 'pool', num: 15, name: '50mプール', kind: 'pool', x: 76, y: 446, w: 76, h: 136 },
  { id: 'bus', num: 16, name: 'スクールバス乗降場', kind: 'infra', x: 330, y: 628, w: 182, h: 40 },
  { id: 'parking', num: null, name: '臨時駐車場', kind: 'infra', x: 58, y: 602, w: 224, h: 72 },
]

export const KIND_STYLE = {
  main: { fill: '#f6b352', stroke: '#e09a2f', text: '#5c3d05' },
  school: { fill: '#9dc3ea', stroke: '#7ba7d6', text: '#1e3a5f' },
  arena: { fill: '#f3aac8', stroke: '#e089b0', text: '#6b1f44' },
  ground: { fill: '#f8e3bd', stroke: '#e5c98f', text: '#7a5c1e' },
  green: { fill: '#a8d878', stroke: '#8bc25a', text: '#33591a' },
  pool: { fill: '#9edcf0', stroke: '#6cc3e0', text: '#0f4c63' },
  infra: { fill: '#cfcfcf', stroke: '#b3b3b3', text: '#444' },
}

export const buildingById = (id) => BUILDINGS.find((b) => b.id === id)

export const buildingCenter = (b) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 })
