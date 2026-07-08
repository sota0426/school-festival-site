// 建物ごとのフロア配置図(ダミー。本番のフロア図に合わせて差し替える)
// 座標は viewBox 0 0 900 430 上の値

export const FLOOR_VIEW = { w: 900, h: 430 }

const ROOM_W = 128
const ROOM_H = 112
const GAP = 8
const TOP_Y = 62
const BOTTOM_Y = 250

const row = (y, x0, defs) =>
  defs.map(([id, name], i) => ({
    id,
    name,
    x: x0 + i * (ROOM_W + GAP),
    y,
    w: ROOM_W,
    h: ROOM_H,
  }))

export const FLOOR_PLANS = {
  honkan: {
    name: '本館',
    floors: [
      {
        id: '1f',
        label: '1F',
        rooms: [
          ...row(TOP_Y, 96, [
            ['h1-1', '職員室'],
            ['h1-2', '事務室'],
            ['h1-3', '保健室'],
            ['h1-4', '会議室'],
            ['h1-5', '放送室'],
          ]),
          ...row(BOTTOM_Y, 96, [
            ['h1-6', '昇降口'],
            ['h1-7', '1年A組'],
            ['h1-8', '1年B組'],
            ['h1-9', '1年C組'],
            ['h1-10', '多目的室'],
          ]),
        ],
      },
      {
        id: '2f',
        label: '2F',
        rooms: [
          ...row(TOP_Y, 96, [
            ['h2-1', '2年A組'],
            ['h2-2', '2年B組'],
            ['h2-3', '2年C組'],
            ['h2-4', '2年D組'],
            ['h2-5', '視聴覚室'],
          ]),
          ...row(BOTTOM_Y, 96, [
            ['h2-6', '理科室'],
            ['h2-7', '美術室'],
            ['h2-8', '音楽室'],
            ['h2-9', '図書コーナー'],
            ['h2-10', '生徒会室'],
          ]),
        ],
      },
      {
        id: '3f',
        label: '3F',
        rooms: [
          ...row(TOP_Y, 96, [
            ['h3-1', '3年A組'],
            ['h3-2', '3年B組'],
            ['h3-3', '3年C組'],
            ['h3-4', '3年D組'],
            ['h3-5', '資料室'],
          ]),
          ...row(BOTTOM_Y, 96, [
            ['h3-6', '家庭科室'],
            ['h3-7', 'コンピュータ室'],
            ['h3-8', '作法室'],
            ['h3-9', '空き教室'],
            ['h3-10', '倉庫'],
          ]),
        ],
      },
    ],
  },
  minami: {
    name: '高校南館',
    floors: [
      {
        id: '1f',
        label: '1F',
        rooms: [
          ...row(TOP_Y, 165, [
            ['m1-1', '図書室'],
            ['m1-2', '1年D組'],
            ['m1-3', '1年E組'],
            ['m1-4', '進路指導室'],
          ]),
          ...row(BOTTOM_Y, 165, [
            ['m1-5', '昇降口'],
            ['m1-6', '購買部'],
            ['m1-7', '食堂'],
            ['m1-8', '和室'],
          ]),
        ],
      },
      {
        id: '2f',
        label: '2F',
        rooms: [
          ...row(TOP_Y, 165, [
            ['m2-1', '2年E組'],
            ['m2-2', '2年F組'],
            ['m2-3', '3年E組'],
            ['m2-4', '3年F組'],
          ]),
          ...row(BOTTOM_Y, 165, [
            ['m2-5', '講義室1'],
            ['m2-6', '講義室2'],
            ['m2-7', '自習室'],
            ['m2-8', '準備室'],
          ]),
        ],
      },
    ],
  },
  chugaku: {
    name: '中学館',
    floors: [
      {
        id: '1f',
        label: '1F',
        rooms: [
          ...row(TOP_Y, 165, [
            ['c1-1', '中1A組'],
            ['c1-2', '中1B組'],
            ['c1-3', '中2A組'],
            ['c1-4', '中2B組'],
          ]),
          ...row(BOTTOM_Y, 165, [
            ['c1-5', '昇降口'],
            ['c1-6', '中職員室'],
            ['c1-7', '理科室'],
            ['c1-8', '技術室'],
          ]),
        ],
      },
      {
        id: '2f',
        label: '2F',
        rooms: [
          ...row(TOP_Y, 165, [
            ['c2-1', '中3A組'],
            ['c2-2', '中3B組'],
            ['c2-3', '音楽室'],
            ['c2-4', '美術室'],
          ]),
          ...row(BOTTOM_Y, 165, [
            ['c2-5', '多目的室'],
            ['c2-6', '会議室'],
            ['c2-7', '準備室'],
            ['c2-8', '倉庫'],
          ]),
        ],
      },
    ],
  },
}

export function roomCenter(buildingId, floorId, roomId) {
  const floor = FLOOR_PLANS[buildingId]?.floors.find((f) => f.id === floorId)
  const room = floor?.rooms.find((r) => r.id === roomId)
  if (!room) return { x: FLOOR_VIEW.w / 2, y: FLOOR_VIEW.h / 2 }
  return { x: room.x + room.w / 2, y: room.y + room.h / 2 }
}
