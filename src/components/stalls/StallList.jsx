import { useMemo, useState } from 'react'
import { STALLS } from '../../data/stalls'
import { CATEGORIES, CATEGORY_IDS, FOOD_GENRES, FOOD_GENRE_IDS } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import StallPoster from './StallPoster'

const ORGANIZATIONS = [...new Set(STALLS.map((stall) => stall.org))]

export default function StallList() {
  const { openDetail } = useApp()
  const [filter, setFilter] = useState(null)
  const [foodGenre, setFoodGenre] = useState(null)
  const [organization, setOrganization] = useState('')
  const [organizationMode, setOrganizationMode] = useState(false)

  const list = useMemo(() => {
    return STALLS.filter((s) => {
      if (filter && s.cat !== filter) return false
      if (foodGenre && s.foodGenre !== foodGenre) return false
      if (organization && s.org !== organization) return false
      return true
    })
  }, [filter, foodGenre, organization])

  const selectCategory = (id) => {
    const nextFilter = filter === id ? null : id
    setFilter(nextFilter)
    setOrganization('')
    setOrganizationMode(false)
    if (nextFilter !== 'food') setFoodGenre(null)
  }

  const selectOrganizationMode = () => {
    setFilter(null)
    setFoodGenre(null)
    setOrganizationMode(true)
  }

  const groups = useMemo(() => {
    const definitions = [
      { id: 'outdoor', label: '屋外・グラウンド', emoji: '🌳', matches: (stall) => stall.loc.type === 'out' },
      { id: 'honkan', label: '中央校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'honkan' },
      { id: 'chugaku', label: '北校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'chugaku' },
      { id: 'minami', label: '南校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'minami' },
    ]
    return definitions
      .map((group) => ({ ...group, stalls: list.filter(group.matches) }))
      .filter((group) => group.stalls.length > 0)
  }, [list])

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-paper/95 px-4 pb-2 pt-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <Chip
            label="すべて"
            active={!filter && !organizationMode}
            color="#6b6255"
            onClick={() => {
              setFilter(null)
              setFoodGenre(null)
              setOrganization('')
              setOrganizationMode(false)
            }}
          />
          {CATEGORY_IDS.map((id) => (
            <Chip
              key={id}
              label={`${CATEGORIES[id].emoji} ${CATEGORIES[id].label}`}
              active={filter === id}
              color={CATEGORIES[id].color}
              onClick={() => selectCategory(id)}
            />
          ))}
          <Chip
            label="👥 クラス・団体"
            active={organizationMode}
            color="#4f766b"
            onClick={selectOrganizationMode}
          />
        </div>
        {filter === 'food' && (
          <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]" aria-label="フードジャンル">
            <Chip label="フードすべて" active={!foodGenre} color="#d65b26" onClick={() => setFoodGenre(null)} />
            {FOOD_GENRE_IDS.map((id) => (
              <Chip
                key={id}
                label={`${FOOD_GENRES[id].emoji} ${FOOD_GENRES[id].label}`}
                active={foodGenre === id}
                color="#d65b26"
                onClick={() => setFoodGenre(foodGenre === id ? null : id)}
              />
            ))}
          </div>
        )}
        {organizationMode && (
          <label className="mt-2 flex items-center gap-2 rounded-xl border border-emerald-100 bg-white px-3 py-2 shadow-sm">
            <span className="text-base" aria-hidden="true">👥</span>
            <span className="shrink-0 text-[11px] font-black text-stone-500">絞り込む団体</span>
            <select
              value={organization}
              onChange={(event) => setOrganization(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-xs font-black text-ink outline-none"
              aria-label="クラス・団体で絞り込む"
            >
              <option value="">選択してください</option>
              {ORGANIZATIONS.map((org) => <option key={org} value={org}>{org}</option>)}
            </select>
          </label>
        )}
      </div>

      <p className="px-4 pt-1 text-[11px] font-bold text-stone-400">{list.length}店みつかりました</p>

      <div className="space-y-5 px-4 pb-6 pt-2">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`stall-group-${group.id}`}>
            <div className="mb-2 flex items-center gap-2 border-b border-orange-100 pb-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-orange-50 text-base">{group.emoji}</span>
              <h2 id={`stall-group-${group.id}`} className="text-sm font-black text-ink">{group.label}</h2>
              <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-stone-400">{group.stalls.length}店</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {group.stalls.map((s, index) => {
                const cat = CATEGORIES[s.cat]
                const genre = s.foodGenre ? FOOD_GENRES[s.foodGenre] : null
                const stall = { ...s, posterFallback: cat.emoji }
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openDetail(s.id)}
                    className="fade-up group overflow-hidden rounded-2xl bg-white text-left shadow-sm ring-1 ring-stone-900/5 transition-all active:scale-[0.98]"
                    style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s`, '--poster-soft': cat.soft }}
                  >
                    <StallPoster stall={stall} className="aspect-[297/210] w-full border-b border-stone-100" />
                    <div className="p-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full px-2 py-0.5 text-[9px] font-bold text-white" style={{ background: cat.color }}>{cat.label}</span>
                        {genre && (
                          <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[9px] font-bold text-orange-700">
                            {genre.emoji} {genre.label}
                          </span>
                        )}
                        <span className="line-clamp-1 text-[11px] font-bold text-stone-400">{s.org}</span>
                      </div>
                      <h3 className="mt-1.5 text-base font-black leading-snug text-ink">{s.name}</h3>
                      <p className="mt-1 line-clamp-1 text-xs text-stone-500">📍 {s.placeLabel}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>
        ))}
      </div>

      {list.length === 0 && (
        <p className="px-4 py-10 text-center text-sm text-stone-400">
          条件にあうお店がありません 🥲
        </p>
      )}
    </div>
  )
}

function Chip({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-90"
      style={
        active ? { background: color, color: '#fff' } : { background: '#fff', color: '#6b6255' }
      }
    >
      {label}
    </button>
  )
}
