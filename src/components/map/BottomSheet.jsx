import { CATEGORIES } from '../../data/categories'
import { CloseIcon } from '../Icons'

export default function BottomSheet({ stall, onClose, onDetail }) {
  if (!stall) return null
  const cat = CATEGORIES[stall.cat]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center p-3">
      <div
        key={stall.id}
        className="fade-up pointer-events-auto w-full max-w-md rounded-2xl bg-white p-4 shadow-xl shadow-stone-400/30"
      >
        <div className="flex items-start gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl"
            style={{ background: cat.soft }}
          >
            {cat.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-black text-ink">{stall.name}</h3>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                style={{ background: cat.color }}
              >
                {cat.label}
              </span>
            </div>
            <p className="text-xs text-stone-500">
              {stall.org}・{stall.placeLabel}
            </p>
            <p className="mt-1 line-clamp-1 text-xs text-stone-600">{stall.pr}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors active:bg-stone-100"
          >
            <CloseIcon width="18" height="18" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onDetail(stall.id)}
          className="mt-3 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-2.5 text-sm font-black text-white transition-transform active:scale-95"
        >
          くわしく見る →
        </button>
      </div>
    </div>
  )
}
