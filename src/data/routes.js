import { FLOOR_PLANS } from './floors'

const BUILDING_NAMES = {
  honkan: '中央校舎',
  chugaku: '北校舎',
  minami: '南校舎',
}

const BRANCH_GUIDE = {
  honkan: '生徒玄関から中央校舎内の階段へ進みます',
  chugaku: '生徒玄関を入り、中央校舎から北校舎方面へ進みます',
  minami: '生徒玄関を入り、中央校舎から南校舎方面へ進みます',
}

export function routeForStall(stall) {
  if (stall.loc.type === 'guide') {
    return {
      type: 'guide',
      start: '中央校舎・生徒玄関',
      destination: stall.placeLabel,
      summary: `生徒玄関 → ${stall.placeLabel}`,
      instruction: '校舎案内マップで場所をご確認ください',
    }
  }

  if (stall.loc.type === 'out') {
    return {
      type: 'outdoor',
      start: '中央校舎・生徒玄関',
      destination: stall.placeLabel,
      summary: `生徒玄関 → ${stall.placeLabel}`,
      instruction: `生徒玄関を出て、校内案内の「${stall.placeLabel}」方面へ進みます`,
    }
  }

  const plan = FLOOR_PLANS[stall.loc.building]
  const floor = plan?.floors.find((item) => item.id === stall.loc.floor)
  const room = floor?.rooms.find((item) => item.id === stall.loc.room)
  const building = BUILDING_NAMES[stall.loc.building] || plan?.name || '校舎'

  return {
    type: 'indoor',
    start: '中央校舎・生徒玄関',
    building,
    floor: floor?.label || stall.loc.floor.toUpperCase(),
    room: room?.name || stall.loc.room,
    summary: `生徒玄関 → ${building} → ${floor?.label || stall.loc.floor.toUpperCase()}`,
    instruction: BRANCH_GUIDE[stall.loc.building] || `${building}方面へ進みます`,
  }
}
