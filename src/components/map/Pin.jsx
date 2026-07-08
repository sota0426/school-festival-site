// マップ上の模擬店ピン。scale(現在のズーム率)に応じて少しだけ小さくして
// ズームインしてもピンが巨大化しないようにする
export default function Pin({ x, y, color, emoji, selected, delay = 0, onTap }) {
  return (
    <g
      transform={`translate(${x} ${y})`}
      onClick={onTap}
      className="cursor-pointer"
      role="button"
    >
      <g className="pin-drop" style={{ animationDelay: `${delay}s` }}>
        <g transform={`scale(${selected ? 1.25 : 1})`}>
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
              r="17"
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              className="live-dot"
            />
          )}
        </g>
      </g>
    </g>
  )
}
