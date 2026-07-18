import { stallById } from '../../data/stalls'
import { CATEGORIES, FOOD_GENRES } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import { CloseIcon, PinIcon } from '../Icons'
import StallPoster from './StallPoster'
import StallLocationGuide from './StallLocationGuide'

export default function StallDetail({ stallId }) {
  const { closeDetail } = useApp()
  const stall = stallById(stallId)
  if (!stall) return null
  const cat = CATEGORIES[stall.cat]
  const genre = stall.foodGenre ? FOOD_GENRES[stall.foodGenre] : null
  const hasPoster = Boolean(typeof stall.poster === 'string' ? stall.poster : stall.poster?.src)
  const stallWithFallback = { ...stall, posterFallback: cat.emoji }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        type="button"
        aria-label="閉じる"
        onClick={closeDetail}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
      />
      <div
        className="fade-up relative z-10 mx-auto max-h-[96dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white shadow-2xl"
        style={{ '--poster-soft': cat.soft }}
      >
        {hasPoster && (
          <StallPoster
            stall={stallWithFallback}
            eager
            className="h-[min(42dvh,360px)] w-full shrink-0 border-b border-stone-100"
          />
        )}

        {/* 店舗情報 */}
        <div
          className="relative shrink-0 px-6 pb-5 pt-6"
          style={{ background: `linear-gradient(135deg, ${cat.soft}, #fff8f0)` }}
        >
          <button
            type="button"
            onClick={closeDetail}
            aria-label="閉じる"
            className="absolute right-4 top-4 rounded-full bg-white/80 p-2 text-stone-500 shadow-sm transition-transform active:scale-90"
          >
            <CloseIcon width="18" height="18" />
          </button>
          {!hasPoster && <span className="pop-in inline-block text-5xl">{cat.emoji}</span>}
          <div className={`${hasPoster ? '' : 'mt-2'} flex flex-wrap items-center gap-2`}>
            <span
              className="rounded-full px-2.5 py-1 text-[10px] font-bold text-white"
              style={{ background: cat.color }}
            >
              {cat.label}
            </span>
            {genre && (
              <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-orange-700">
                {genre.emoji} {genre.label}
              </span>
            )}
            <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-bold text-stone-500">
              {stall.org}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-black text-ink">{stall.name}</h2>
          <p className="mt-1 text-sm text-stone-600">{stall.pr}</p>
        </div>

        {/* 本文 */}
        <div className="px-6 py-4 pb-[max(24px,env(safe-area-inset-bottom))]">
          <div className="space-y-2.5">
            <InfoRow icon={<PinIcon width="16" height="16" />} label="場所" value={stall.placeLabel} />
          </div>

          {stall.menu.length > 0 && (
            <div className="mt-5">
              <h3 className="text-xs font-black tracking-widest text-stone-400">MENU</h3>
              <ul className="mt-2 divide-y divide-orange-50 rounded-2xl bg-orange-50/50 px-4">
                {stall.menu.map(([item, price], i) => (
                  <li key={i} className="flex items-center justify-between py-2.5">
                    <span className="text-sm font-bold text-ink">{item}</span>
                    <span className="text-sm font-black" style={{ color: cat.color }}>
                      {price > 0 ? `¥${price}` : '無料'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <StallLocationGuide stall={stall} />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-2.5">
      <span className="text-stone-400">{icon}</span>
      <span className="w-16 shrink-0 text-xs font-bold text-stone-400">{label}</span>
      <span className="text-sm font-bold text-ink">{value}</span>
    </div>
  )
}
