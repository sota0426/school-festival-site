import { useState } from 'react'
import { CATEGORIES } from '../../data/categories'
import { routeForStall } from '../../data/routes'
import { CloseIcon } from '../Icons'

export default function BottomSheet({ stall, onClose, onDetail }) {
  const [showBuildingGuide, setShowBuildingGuide] = useState(false)
  if (!stall) return null
  const cat = CATEGORIES[stall.cat]
  const route = routeForStall(stall)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-center p-3">
      <div
        key={stall.id}
        className="fade-up pointer-events-auto max-h-[78dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl shadow-stone-500/30"
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
        <section className="mt-4 rounded-2xl bg-stone-50 p-3" aria-label="生徒玄関からの経路案内">
          <p className="text-[10px] font-black tracking-wider text-fest">SIMPLE GUIDE</p>
          <h4 className="text-sm font-black text-ink">生徒玄関からの行き方</h4>

          <div className="mt-3 flex items-stretch gap-1.5" aria-label={route.summary}>
            <RouteBox emoji="🚪" label="スタート" value="生徒玄関" />
            <RouteArrow />
            <RouteBox
              emoji={route.type === 'indoor' ? '🏫' : '🚶'}
              label={route.type === 'indoor' ? '校舎をタップ' : '進む方向'}
              value={route.type === 'indoor' ? route.building : route.destination}
              active
              onClick={route.type === 'indoor' ? () => setShowBuildingGuide((open) => !open) : undefined}
            />
            {route.type === 'indoor' && (
              <>
                <RouteArrow />
                <RouteBox emoji="⬆️" label="到着階" value={route.floor} active />
              </>
            )}
          </div>

          <p className="mt-3 rounded-xl bg-white px-3 py-2 text-[11px] font-bold leading-relaxed text-stone-600 shadow-sm">
            {route.instruction}
          </p>
          {route.type === 'indoor' && (
            <>
              {showBuildingGuide && <BuildingGuide selectedBuilding={route.building} />}
              <p className="mt-2 text-center text-xs font-black text-ink">
                {route.floor}に着いたら「{route.room}」へ
              </p>
            </>
          )}
        </section>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-stone-200 bg-white py-2.5 text-xs font-black text-stone-600 transition-transform active:scale-95"
          >
            マップに戻る
          </button>
          <button
            type="button"
            onClick={() => onDetail(stall.id)}
            className="rounded-full bg-gradient-to-r from-fest to-fest2 py-2.5 text-xs font-black text-white transition-transform active:scale-95"
          >
            店舗詳細を見る
          </button>
        </div>
      </div>
    </div>
  )
}

function RouteBox({ emoji, label, value, active = false, onClick }) {
  const Component = onClick ? 'button' : 'div'
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center rounded-xl px-1.5 py-2 text-center transition-transform ${active ? 'bg-orange-50 ring-1 ring-orange-200' : 'bg-white'} ${onClick ? 'active:scale-95' : ''}`}
    >
      <span className="text-lg">{emoji}</span>
      <span className="mt-0.5 text-[8px] font-bold text-stone-400">{label}</span>
      <span className={`mt-0.5 text-[10px] font-black leading-tight ${active ? 'text-fest' : 'text-ink'}`}>{value}</span>
    </Component>
  )
}

function RouteArrow() {
  return <span className="self-center text-sm font-black text-orange-300">→</span>
}

function BuildingGuide({ selectedBuilding }) {
  return (
    <div className="fade-up mt-3 rounded-2xl border border-orange-100 bg-white p-3 shadow-sm" aria-label="生徒玄関から各校舎への説明図">
      <div className="flex items-center justify-between">
        <h5 className="text-xs font-black text-ink">校舎への行き方</h5>
        <span className="text-[9px] font-bold text-stone-400">選択中：{selectedBuilding}</span>
      </div>
      <div className="mt-3 overflow-hidden rounded-xl border border-stone-200 bg-[#faf7ef]">
        <img
          src="/images/campus-building-guide-dummy.png"
          alt="生徒玄関から南校舎、中央校舎、職員室を経由した北校舎への矢印付き案内図"
          className="h-auto w-full"
        />
      </div>
      <p className="mt-2 text-center text-[9px] font-bold text-stone-400">
        仮の案内図です。本番画像へ差し替えて使用できます
      </p>
    </div>
  )
}
