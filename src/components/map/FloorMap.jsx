import { FLOOR_PLANS, FLOOR_VIEW } from '../../data/floors'
import { CATEGORIES } from '../../data/categories'
import { stallsOnFloor } from '../../data/stalls'
import Pin from './Pin'

export default function FloorMap({ buildingId, floorId, filter, selectedStallId, onPinTap }) {
  const plan = FLOOR_PLANS[buildingId]
  const floor = plan?.floors.find((f) => f.id === floorId)
  if (!floor) return null

  const stalls = stallsOnFloor(buildingId, floorId)
  const stallByRoom = Object.fromEntries(stalls.map((s) => [s.loc.room, s]))
  const visiblePins = stalls.filter((s) => !filter || s.cat === filter)

  return (
    <>
      <rect x="0" y="0" width={FLOOR_VIEW.w} height={FLOOR_VIEW.h} fill="#fbf8ee" />

      {/* 廊下 */}
      <rect x="40" y="182" width={FLOOR_VIEW.w - 80} height="60" rx="6" fill="#eee7d8" />
      <text
        x={FLOOR_VIEW.w / 2}
        y="212"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="14"
        fill="#a99e88"
        fontWeight="700"
        letterSpacing="8"
      >
        ろ う か
      </text>

      {/* 階段 */}
      {[
        [46, 62],
        [FLOOR_VIEW.w - 106, 62],
        [46, 250],
        [FLOOR_VIEW.w - 106, 250],
      ].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="60" height="112" rx="6" fill="#e3dccb" stroke="#cfc5ad" />
          <text x={x + 30} y={y + 56} textAnchor="middle" dominantBaseline="central" fontSize="12" fill="#8d8264" fontWeight="700">
            階段
          </text>
        </g>
      ))}

      {/* 教室 */}
      {floor.rooms.map((r) => {
        const stall = stallByRoom[r.id]
        const cat = stall ? CATEGORIES[stall.cat] : null
        const dimmed = stall && filter && stall.cat !== filter
        return (
          <g
            key={r.id}
            onClick={stall ? (e) => { e.stopPropagation(); onPinTap(stall) } : undefined}
            className={stall ? 'cursor-pointer' : undefined}
            opacity={dimmed ? 0.45 : 1}
          >
            <rect
              x={r.x}
              y={r.y}
              width={r.w}
              height={r.h}
              rx="8"
              fill={cat ? cat.soft : '#ffffff'}
              stroke={cat ? cat.color : '#d9cfc0'}
              strokeWidth={cat ? 2.5 : 1.5}
            />
            <text
              x={r.x + r.w / 2}
              y={r.y + r.h - 16}
              textAnchor="middle"
              fontSize="14"
              fontWeight="700"
              fill={cat ? cat.color : '#8d8264'}
              style={{ pointerEvents: 'none' }}
            >
              {r.name}
            </text>
            {stall && (
              <text
                x={r.x + r.w / 2}
                y={r.y + 22}
                textAnchor="middle"
                fontSize="11"
                fontWeight="700"
                fill={cat.color}
                style={{ pointerEvents: 'none' }}
              >
                {stall.name.length > 9 ? `${stall.name.slice(0, 8)}…` : stall.name}
              </text>
            )}
          </g>
        )
      })}

      {/* ピン */}
      {visiblePins.map((s, i) => {
        const room = floor.rooms.find((r) => r.id === s.loc.room)
        if (!room) return null
        return (
          <Pin
            key={s.id}
            x={room.x + room.w / 2}
            y={room.y + room.h / 2 + 14}
            color={CATEGORIES[s.cat].color}
            emoji={CATEGORIES[s.cat].emoji}
            selected={selectedStallId === s.id}
            delay={0.06 * i}
            onTap={(e) => {
              e.stopPropagation()
              onPinTap(s)
            }}
          />
        )
      })}
    </>
  )
}
