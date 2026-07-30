import { CATEGORIES } from '../../data/categories'
import { CloseIcon } from '../Icons'

export default function BottomSheet({ stall, onClose, onDetail }) {
  if (!stall) return null
  const cat = CATEGORIES[stall.cat]

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center p-3">
      <div
        key={stall.id}
        className="fade-up pointer-events-auto max-h-[72dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl shadow-stone-500/30"
      >
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-2xl" style={{ background: cat.soft }}>
            {cat.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="truncate text-base font-black text-ink">{stall.name}</h3>
              <span className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold text-white" style={{ background: cat.color }}>
                {cat.label}
              </span>
            </div>
            <p className="text-xs text-stone-500">{stall.org}</p>
            <p className="mt-1 text-xs text-stone-600">{stall.pr}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="閉じる" className="shrink-0 rounded-full p-1.5 text-stone-400 transition-colors active:bg-stone-100">
            <CloseIcon width="18" height="18" />
          </button>
        </div>

        <section className="mt-4" aria-label={`${stall.name}のメニュー`}>
          <p className="text-[10px] font-black tracking-[0.16em] text-fest">MENU</p>
          <h4 className="text-sm font-black text-ink">メニュー・料金</h4>
          {stall.menu.length > 0 ? (
            <ul className="mt-2 divide-y divide-orange-100 rounded-2xl bg-orange-50/60 px-4">
              {stall.menu.map(([item, price], index) => (
                <li key={index} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-bold text-ink">{item}</span>
                  <span className="shrink-0 text-sm font-black" style={{ color: cat.color }}>
                    {price > 0 ? `¥${price}` : price === 0 ? '無料' : '価格未定'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 rounded-2xl bg-stone-50 px-4 py-3 text-xs font-bold text-stone-500">無料でご覧いただけます</p>
          )}
        </section>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={onClose} className="rounded-full border border-stone-200 bg-white py-2.5 text-xs font-black text-stone-600 transition-transform active:scale-95">
            マップに戻る
          </button>
          <button type="button" onClick={() => onDetail(stall.id)} className="rounded-full bg-gradient-to-r from-fest to-fest2 py-2.5 text-xs font-black text-white transition-transform active:scale-95">
            詳細・行き方を見る
          </button>
        </div>
      </div>
    </div>
  )
}
