import { useMemo, useState } from 'react'
import { STALLS } from '../../data/stalls'
import { CATEGORIES, CATEGORY_IDS } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import { SearchIcon } from '../Icons'

export default function StallList() {
  const { openDetail } = useApp()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState(null)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return STALLS.filter((s) => {
      if (filter && s.cat !== filter) return false
      if (!q) return true
      return [s.name, s.org, s.placeLabel, s.pr].join(' ').toLowerCase().includes(q)
    })
  }, [query, filter])

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
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2.5 shadow-sm">
          <SearchIcon width="18" height="18" className="shrink-0 text-stone-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="お店・団体・場所をさがす"
            className="w-full bg-transparent text-sm font-bold text-ink outline-none placeholder:text-stone-400"
          />
        </div>
        <div className="mt-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <Chip label="すべて" active={!filter} color="#6b6255" onClick={() => setFilter(null)} />
          {CATEGORY_IDS.map((id) => (
            <Chip
              key={id}
              label={`${CATEGORIES[id].emoji} ${CATEGORIES[id].label}`}
              active={filter === id}
              color={CATEGORIES[id].color}
              onClick={() => setFilter(filter === id ? null : id)}
            />
          ))}
        </div>
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
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {group.stalls.map((s, index) => {
                const cat = CATEGORIES[s.cat]
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => openDetail(s.id)}
                    className="fade-up overflow-hidden rounded-2xl bg-white text-left shadow-sm transition-transform active:scale-95"
                    style={{ animationDelay: `${Math.min(index * 0.04, 0.3)}s` }}
                  >
                    <div className="flex h-20 items-center justify-center text-4xl" style={{ background: `linear-gradient(135deg, ${cat.soft}, #fff)` }}>{cat.emoji}</div>
                    <div className="p-3">
                      <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold text-white" style={{ background: cat.color }}>{cat.label}</span>
                      <h3 className="mt-1 line-clamp-1 text-sm font-black text-ink">{s.name}</h3>
                      <p className="mt-0.5 line-clamp-1 text-[11px] text-stone-500">{s.org}</p>
                      <p className="line-clamp-1 text-[11px] text-stone-400">📍 {s.placeLabel}</p>
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
