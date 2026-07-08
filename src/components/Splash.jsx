import { useMemo } from 'react'
import { FESTIVAL } from '../config'

const CONFETTI_COLORS = ['#e8442e', '#ff8a00', '#12a5a0', '#f6b352', '#e64ba0', '#2f7de1']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        size: 6 + ((i * 13) % 8),
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        duration: 4 + ((i * 7) % 40) / 10,
        delay: ((i * 11) % 30) / 10,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: p.left,
            width: p.size,
            height: p.size * 1.6,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  )
}

export default function Splash({ onEnter }) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-paper via-orange-50 to-orange-100">
      <Confetti />

      <p className="fade-up text-sm font-bold tracking-[0.35em] text-teal" style={{ animationDelay: '0.9s' }}>
        {FESTIVAL.romaji} {FESTIVAL.year}
      </p>

      <h1 className="my-4 flex items-end gap-1" aria-label={FESTIVAL.name}>
        {[...FESTIVAL.name].map((ch, i) => (
          <span
            key={i}
            className="char-pop inline-block text-[72px] font-black leading-none text-fest drop-shadow-[0_4px_0_rgba(232,68,46,0.25)]"
            style={{ animationDelay: `${0.15 + i * 0.18}s` }}
          >
            {ch}
          </span>
        ))}
      </h1>

      <div
        className="fade-up flex items-center gap-3 rounded-full bg-white/80 px-5 py-2 shadow-sm"
        style={{ animationDelay: '1.1s' }}
      >
        <span className="text-sm font-bold text-ink">{FESTIVAL.dateLabel}</span>
        <span className="h-4 w-px bg-stone-300" />
        <span className="text-sm font-bold text-ink">{FESTIVAL.openHours}</span>
      </div>

      <button
        type="button"
        onClick={onEnter}
        className="fade-up mt-12 rounded-full bg-gradient-to-r from-fest to-fest2 px-10 py-4 text-lg font-black text-white shadow-lg shadow-orange-300 transition-transform active:scale-95"
        style={{ animationDelay: '1.4s' }}
      >
        入場する 🎉
      </button>
      <p className="fade-up mt-3 text-xs text-stone-500" style={{ animationDelay: '1.6s' }}>
        かんたんなアンケートのあと、サイトをご覧いただけます
      </p>
    </div>
  )
}
