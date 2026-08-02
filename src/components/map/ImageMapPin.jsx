export default function ImageMapPin({ x, y, color, emoji, selected = false, label, onClick, size = 'normal', delay = 0, animate = false }) {
  const dimensions = size === 'small' ? 'h-10 w-8' : 'h-12 w-9'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`absolute z-10 -translate-x-1/2 -translate-y-full origin-bottom transition-transform active:scale-95 ${dimensions} ${selected ? 'z-20 scale-125' : ''}`}
      style={{ left: `${x}%`, top: `${y}%` }}
      aria-label={label}
      title={label}
    >
      <span className={`block h-full w-full ${animate ? 'pin-drop' : ''}`} style={animate ? { animationDelay: `${delay}s` } : undefined}>
        <svg viewBox="-18 -43 36 46" className="h-full w-full overflow-visible drop-shadow-md" aria-hidden="true">
          {selected && (
            <circle
              cx="0"
              cy="-25"
              r="17"
              fill="none"
              stroke={color}
              strokeWidth="2.5"
              strokeDasharray="5 4"
              className="selected-pin-focus"
            />
          )}
          <ellipse cx="0" cy="1" rx="7" ry="2.5" fill="rgba(0,0,0,0.2)" />
          <path
            d="M0,0 C-8,-13 -13,-18 -13,-26 a13,13 0 1,1 26,0 C13,-18 8,-13 0,0 Z"
            fill={color}
            stroke="#fff"
            strokeWidth="2"
          />
          <circle cx="0" cy="-26" r="8.5" fill="#fff" />
          <text x="0" y="-25.5" textAnchor="middle" dominantBaseline="central" fontSize="11">{emoji}</text>
        </svg>
      </span>
    </button>
  )
}
