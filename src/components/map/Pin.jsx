// マップ上の模擬店ピン。スマホでも見つけやすい大きさを基準にし、
// 選択中のピンはさらに大きくして位置を強調する。
export default function Pin({ x, y, color, emoji, selected, delay = 0, animate = true, onTap }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={onTap}
      className="cursor-pointer"
      role="button"
    >
      <g
        className={animate ? 'pin-drop' : undefined}
        style={animate ? { animationDelay: `${delay}s` } : { opacity: 0 }}
      >
        <g transform={`scale(${selected ? 1.9 : 1.3})`} className="transition-transform duration-300">
          <ellipse cx="0" cy="2" rx="7" ry="2.5" fill="rgba(0,0,0,0.18)" />
          <path
            d="M0,0 C-8,-13 -13,-18 -13,-26 a13,13 0 1,1 26,0 C13,-18 8,-13 0,0 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="0" cy="-26" r="8.5" fill="#fff" />
          <text x="0" y="-25.5" textAnchor="middle" dominantBaseline="central" fontSize="11">
            {emoji}
          </text>
          {selected && (
            <circle
              cx="0"
              cy="-26"
              r="19"
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeDasharray="5 4"
              className="selected-pin-focus"
            />
          )}
        </g>
      </g>
    </g>
  )
}
