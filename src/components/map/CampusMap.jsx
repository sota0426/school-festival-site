import { CAMPUS, BUILDINGS, KIND_STYLE } from '../../data/campus'
import { CATEGORIES, pinEmojiForStall } from '../../data/categories'
import { outdoorStalls, stallsInBuilding } from '../../data/stalls'
import { FLOOR_PLANS } from '../../data/floors'
import Pin from './Pin'

const TREES = [
  [230, 400], [230, 430], [510, 415], [510, 450], [510, 490], [510, 530],
  [246, 460], [246, 500], [246, 545], [560, 300], [740, 250], [122, 340],
  [60, 440], [60, 480], [430, 120], [330, 120], [560, 590], [740, 590],
]

export default function CampusMap({ scale, filter, selectedStallId, animationKey, onPinTap, onBuildingTap }) {
  const pins = outdoorStalls().filter((s) => !filter || s.cat === filter)

  return (
    <>
      {/* 敷地 */}
      <rect x="0" y="0" width={CAMPUS.w} height={CAMPUS.h} fill="#f4f1e3" />
      <path
        d={`M20 690 L14 200 L120 130 L420 20 L640 10 L990 60 L992 640 L700 692 Z`}
        fill="#fbf8ee"
        stroke="#d8d2bd"
        strokeWidth="3"
      />

      {/* 通路 */}
      <path d="M510 30 L510 400" stroke="#e7e1cc" strokeWidth="18" fill="none" />
      <path d="M60 595 L940 595" stroke="#e7e1cc" strokeWidth="16" fill="none" />

      {/* 木々 */}
      {TREES.map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <circle r="8" fill="#7fbf5a" />
          <circle r="5" cy="-6" fill="#95cf70" />
        </g>
      ))}

      {/* 建物 */}
      {BUILDINGS.map((b) => {
        const st = KIND_STYLE[b.kind]
        const cx = b.x + b.w / 2
        const cy = b.y + b.h / 2
        const clickable = b.indoor && FLOOR_PLANS[b.id]
        return (
          <g
            key={b.id}
            transform={b.rot ? `rotate(${b.rot} ${cx} ${cy})` : undefined}
            onClick={clickable ? () => onBuildingTap(b) : undefined}
            className={clickable ? 'cursor-pointer' : undefined}
          >
            <rect
              x={b.x}
              y={b.y}
              width={b.w}
              height={b.h}
              rx={b.round || 10}
              fill={st.fill}
              stroke={clickable ? '#e8442e' : st.stroke}
              strokeWidth={clickable ? 3 : 2}
              strokeDasharray={clickable ? '7 4' : undefined}
            />
            {b.num != null && (
              <g transform={`translate(${cx - (b.name.length * 13) / 2 - 4} ${cy})`}>
                <circle r="11" fill="#1c5e3c" />
                <text
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="12"
                  fontWeight="700"
                  fill="#fff"
                >
                  {b.num}
                </text>
              </g>
            )}
            <text
              x={b.num != null ? cx + 10 : cx}
              y={cy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="15"
              fontWeight="700"
              fill={st.text}
              style={{ pointerEvents: 'none' }}
            >
              {b.name}
            </text>
          </g>
        )
      })}

      {/* 館内出店バッジ(建物に隠れないよう最前面に描画) */}
      {BUILDINGS.filter((b) => b.indoor && FLOOR_PLANS[b.id]).map((b) => {
        const count = stallsInBuilding(b.id).filter((s) => !filter || s.cat === filter).length
        if (count === 0) return null
        return (
          <g
            key={`badge-${b.id}`}
            transform={`translate(${b.x + b.w - 4} ${b.y + 4})`}
            onClick={() => onBuildingTap(b)}
            className="cursor-pointer"
          >
            {/* CSSアニメのtransformがSVGのtransform属性を上書きするため入れ子にする */}
            <g className="badge-bounce">
              <circle r="14" fill="#e8442e" stroke="#fff" strokeWidth="2.5" />
              <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="11"
                fontWeight="800"
                fill="#fff"
              >
                {count}店
              </text>
            </g>
          </g>
        )
      })}

      {/* プール水面 */}
      <rect x="86" y="458" width="56" height="112" rx="4" fill="#c9ecf7" stroke="#8fd4ea" />

      {/* 屋外模擬店ピン */}
      {pins.map((s, i) => (
        <Pin
          key={`${s.id}-${animationKey || 'default'}`}
          x={s.loc.x}
          y={s.loc.y}
          color={CATEGORIES[s.cat].color}
          emoji={pinEmojiForStall(s)}
          selected={selectedStallId === s.id}
          delay={0.12 * i}
          onTap={(e) => {
            e.stopPropagation()
            onPinTap(s)
          }}
        />
      ))}
      {/* scaleは将来ピンのサイズ調整に使用 */}
      {void scale}
    </>
  )
}
