import { useState } from 'react'
import { STALLS } from '../../data/stalls'
import { CATEGORIES, CATEGORY_IDS, FOOD_GENRES, FOOD_GENRE_IDS } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import StallPoster from './StallPoster'

export default function StallList({ dataVersion }) {
  const { openDetail } = useApp()
  const [filter, setFilter] = useState(null)
  const [foodGenre, setFoodGenre] = useState(null)
  const [organization, setOrganization] = useState('')
  const [organizationMode, setOrganizationMode] = useState(true)
  const list = STALLS.filter((stall) => {
    if (filter && stall.cat !== filter) return false
    if (organization && !matchesOrganizationFilter(stall.org, organization)) return false
    return true
  })
  void dataVersion

  const selectCategory = (id) => {
    const nextFilter = filter === id ? null : id
    setFilter(nextFilter)
    setOrganization('')
    setOrganizationMode(false)
    setFoodGenre(nextFilter === 'food' ? 'meal' : null)
  }

  const selectOrganizationMode = () => {
    setFilter(null)
    setFoodGenre(null)
    setOrganizationMode(true)
  }

  const scrollToFoodGenre = (id) => {
    setFoodGenre(id)
    requestAnimationFrame(() => {
      document.getElementById(`food-genre-${id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    })
  }

  const definitions = [
    { id: 'outdoor', label: '屋外・グラウンド', emoji: '🌳', matches: (stall) => stall.loc.type === 'out' },
    { id: 'honkan', label: '中央校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'honkan' },
    { id: 'chugaku', label: '北校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'chugaku' },
    { id: 'minami', label: '南校舎', emoji: '🏫', matches: (stall) => stall.loc.building === 'minami' },
  ]
  const groups = (filter === 'food'
    ? FOOD_GENRE_IDS.map((id) => ({
        id: `food-genre-${id}`,
        label: FOOD_GENRES[id].label,
        emoji: FOOD_GENRES[id].emoji,
        color: FOOD_GENRES[id].color,
        soft: FOOD_GENRES[id].soft,
        stalls: list.filter((stall) => stall.foodGenre === id),
      }))
    : definitions.map((group) => ({ ...group, stalls: list.filter(group.matches) }))
  ).filter((group) => group.stalls.length > 0)

  return (
    <div data-tab-scroll="stalls" className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-paper/95 px-4 pb-2 pt-3 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <Chip
            icon="すべて"
            label="すべて"
            alwaysLabel
            active={!filter && !organizationMode}
            color="#6b6255"
            onClick={() => {
              setFilter(null)
              setFoodGenre(null)
              setOrganization('')
              setOrganizationMode(false)
            }}
          />
          <Chip
            icon="👥"
            label="クラス・団体"
            active={organizationMode}
            color="#4f766b"
            onClick={selectOrganizationMode}
          />
          {CATEGORY_IDS.map((id) => (
            <Chip
              key={id}
              icon={CATEGORIES[id].emoji}
              label={CATEGORIES[id].label}
              active={filter === id}
              color={CATEGORIES[id].color}
              onClick={() => selectCategory(id)}
            />
          ))}
        </div>
        {filter === 'food' && (
          <div className="mt-3 rounded-2xl border border-orange-200 bg-white/90 p-3 shadow-sm" aria-label="フードの種類">
            <div className="mb-2 flex items-end justify-between gap-2 border-b border-orange-100 pb-2">
              <div>
                <p className="text-[8px] font-black tracking-[0.16em] text-fest">FOOD TYPE NAVIGATION</p>
                <h2 className="text-sm font-black text-ink">フードの種類へ移動</h2>
              </div>
              <p className="text-[8px] font-bold text-stone-400">タップでその場所へ</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {FOOD_GENRE_IDS.map((id) => (
                <Chip
                  key={id}
                  icon={FOOD_GENRES[id].emoji}
                  label={FOOD_GENRES[id].label}
                  active={foodGenre === id}
                  color={FOOD_GENRES[id].color}
                  softColor={FOOD_GENRES[id].soft}
                  showLabel
                  fullWidth
                  onClick={() => scrollToFoodGenre(id)}
                />
              ))}
            </div>
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
              <option value="">すべてのクラス・団体</option>
              <optgroup label="学年">
                <option value="grade:1">1年</option>
                <option value="grade:2">2年</option>
                <option value="grade:3">3年</option>
              </optgroup>
              <optgroup label="コース">
                <option value="course:特">特進コース</option>
                <option value="course:体">体育コース</option>
                <option value="course:普">普通コース</option>
              </optgroup>
              <optgroup label="団体">
                <option value="kind:club">部活動</option>
                <option value="kind:other">その他</option>
              </optgroup>
            </select>
          </label>
        )}
      </div>

      <p className="px-4 pt-1 text-[11px] font-bold text-stone-400">{list.length}店みつかりました</p>

      <div className="space-y-5 px-4 pb-6 pt-2">
        {groups.map((group) => (
          <section
            key={group.id}
            id={group.id}
            className="scroll-mt-28"
            aria-labelledby={`stall-group-${group.id}`}
          >
            <div className="mb-2 flex items-center gap-2 border-b border-orange-100 pb-2">
              <span
                className="grid h-8 w-8 place-items-center rounded-full text-base"
                style={{ background: group.soft || '#fff7ed' }}
              >
                {group.emoji}
              </span>
              <h2
                id={`stall-group-${group.id}`}
                className="text-sm font-black"
                style={{ color: group.color || '#33261f' }}
              >
                {group.label}
              </h2>
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

function matchesOrganizationFilter(org, filterValue) {
  const classMatch = org.match(/^([体普特])([1-3])(.+)$/)
  if (filterValue.startsWith('grade:')) return classMatch?.[2] === filterValue.slice('grade:'.length)
  if (filterValue === 'kind:club') return !classMatch && org.includes('部')
  if (filterValue === 'kind:other') return !classMatch && !org.includes('部')
  if (filterValue.startsWith('course:')) {
    const course = filterValue.slice('course:'.length)
    return classMatch?.[1] === course
  }
  return true
}

function Chip({
  icon,
  label,
  active,
  color,
  softColor,
  onClick,
  alwaysLabel = false,
  showLabel = false,
  fullWidth = false,
}) {
  const expanded = active || alwaysLabel || showLabel
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-10 shrink-0 items-center justify-center rounded-full text-xs font-black shadow-sm ring-1 ring-black/5 transition-all active:scale-90 ${
        expanded ? 'gap-1.5 px-2.5' : 'w-10'
      } ${fullWidth ? 'w-full' : ''
      }`}
      style={
        active
          ? { background: color, color: '#fff' }
          : { background: softColor || '#fff', color: softColor ? color : '#6b6255' }
      }
    >
      <span className={alwaysLabel ? '' : 'text-lg'} aria-hidden="true">{icon}</span>
      {(active || showLabel) && !alwaysLabel && <span className="whitespace-nowrap">{label}</span>}
    </button>
  )
}
