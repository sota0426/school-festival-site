import { useEffect, useMemo, useRef, useState } from 'react'
import { BUILDINGS, CAMPUS } from '../../data/campus'
import { FLOOR_PLANS, FLOOR_VIEW } from '../../data/floors'
import { STALLS, stallById } from '../../data/stalls'
import { CATEGORIES, CATEGORY_IDS } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import CampusMap from './CampusMap'
import FloorMap from './FloorMap'
import BottomSheet from './BottomSheet'
import { imageFromDb, readMapAnnotations } from '../../lib/mapEditorStorage'
import MapEditor from './MapEditor'

const GROUNDS_KEY = 'grounds'
const CAMPUS_KEY = 'campus'

export default function MapView({ mapTarget }) {
  const { openDetail } = useApp()
  const [filter, setFilter] = useState(null)
  const [sheetStall, setSheetStall] = useState(null)
  const [focusedStallId, setFocusedStallId] = useState(null)
  const [activeKey, setActiveKey] = useState(GROUNDS_KEY)
  const [editorOpen, setEditorOpen] = useState(false)
  const [customMaps, setCustomMaps] = useState({ annotations: {}, images: {} })
  const scroller = useRef(null)

  const floorSections = useMemo(
    () => BUILDINGS.flatMap((building) => {
      const plan = FLOOR_PLANS[building.id]
      if (!plan) return []
      return plan.floors.map((floor) => ({
        key: `${building.id}-${floor.id}`,
        building,
        plan,
        floor,
      }))
    }),
    [],
  )

  const visibleStalls = STALLS.filter((stall) => !filter || stall.cat === filter)
  const activeSection = floorSections.find((section) => section.key === activeKey)
  const currentMap = activeSection
    ? { eyebrow: 'フロアマップ', title: activeSection.plan.name, floor: activeSection.floor.label }
    : activeKey === CAMPUS_KEY
      ? { eyebrow: '校舎案内', title: '校舎全体', floor: null }
      : { eyebrow: 'キャンパスマップ', title: '敷地内全体', floor: null }

  const reloadCustomMaps = async () => {
    const keys = [GROUNDS_KEY, CAMPUS_KEY, ...floorSections.map((section) => section.key)]
    const loadedImages = await Promise.all(keys.map(async (key) => [key, await imageFromDb(key)]))
    setCustomMaps({
      annotations: readMapAnnotations(),
      images: Object.fromEntries(loadedImages.filter(([, value]) => value)),
    })
  }

  useEffect(() => {
    reloadCustomMaps()
    window.addEventListener('festival-map-editor-save', reloadCustomMaps)
    return () => window.removeEventListener('festival-map-editor-save', reloadCustomMaps)
    // Floor section keys are static for this build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToSection = (key, behavior = 'smooth') => {
    const target = scroller.current?.querySelector(`[data-map-section="${key}"]`)
    if (!target || !scroller.current) return
    scroller.current.scrollTo({ top: target.offsetTop, behavior })
  }

  const showStallOnMap = (stall, showSheet = false) => {
    setFocusedStallId(stall.id)
    setSheetStall(showSheet ? stall : null)
    const key = stall.loc.type === 'out'
      ? GROUNDS_KEY
      : `${stall.loc.building}-${stall.loc.floor}`
    setActiveKey(key)
    requestAnimationFrame(() => scrollToSection(key))
  }

  useEffect(() => {
    if (!mapTarget) return
    setFilter(null)
    if (mapTarget.type === 'stall') {
      const stall = stallById(mapTarget.id)
      if (stall) showStallOnMap(stall, true)
    } else if (mapTarget.type === 'point') {
      setSheetStall(null)
      setFocusedStallId(null)
      setActiveKey(GROUNDS_KEY)
      scrollToSection(GROUNDS_KEY)
    }
    // mapTarget.ts is the request identity; callbacks intentionally stay local.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTarget])

  const handlePageScroll = (event) => {
    const container = event.currentTarget
    const sectionIndex = Math.round(container.scrollTop / container.clientHeight)
    const key = container.children[sectionIndex]?.dataset.mapSection
    if (key) setActiveKey(key)
  }

  return (
    <div className="relative flex-1 overflow-hidden bg-[#f4f1e3]">
      <div className="absolute inset-x-0 top-0 z-40 flex gap-2 overflow-x-auto bg-gradient-to-b from-[#f4f1e3] via-[#f4f1e3]/95 to-transparent px-3 pb-5 pt-3 [scrollbar-width:none]">
        <FilterChip label="すべて" active={!filter} color="#6b6255" onClick={() => setFilter(null)} />
        {CATEGORY_IDS.map((id) => (
          <FilterChip
            key={id}
            label={`${CATEGORIES[id].emoji} ${CATEGORIES[id].label}`}
            active={filter === id}
            color={CATEGORIES[id].color}
            onClick={() => setFilter(filter === id ? null : id)}
          />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-3 top-[4.25rem] z-40">
        <div
          className="pointer-events-auto mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-2.5 shadow-lg shadow-stone-500/15 backdrop-blur-md"
          aria-live="polite"
          aria-label={`表示中：${currentMap.title}${currentMap.floor ? ` ${currentMap.floor}` : ''}`}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black tracking-[0.16em] text-fest">現在表示中 · {currentMap.eyebrow}</p>
            <h2 className="truncate text-lg font-black leading-tight text-ink">{currentMap.title}</h2>
          </div>
          {currentMap.floor && (
            <span className="grid h-11 min-w-14 shrink-0 place-items-center rounded-xl bg-ink px-3 text-xl font-black text-white shadow-sm">
              {currentMap.floor}
            </span>
          )}
          {activeKey !== GROUNDS_KEY && (
            <button
              type="button"
              onClick={() => scrollToSection(GROUNDS_KEY)}
              className="shrink-0 rounded-xl bg-stone-100 px-2.5 py-2 text-[10px] font-black text-stone-600 transition-transform active:scale-90"
              aria-label="敷地内全体マップへ戻る"
            >
              ↑ 全体へ
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setEditorOpen(true)}
        className="absolute bottom-[7.25rem] right-1.5 z-40 rounded-lg bg-black/45 px-2 py-1 text-[8px] font-black text-white/90 backdrop-blur-sm transition-transform active:scale-90"
        aria-label="開発用マップ編集"
      >
        DEV · 編集 ✎
      </button>

      <div
        ref={scroller}
        onScroll={handlePageScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain scroll-smooth [scrollbar-width:none]"
        aria-label="学校全体と全校舎のフロアマップ"
      >
        <section
          data-map-section={GROUNDS_KEY}
          className="relative flex h-full min-h-full snap-start snap-always items-center justify-center px-1 pb-32 pt-28"
          aria-label="敷地内全体マップ"
        >
          {customMaps.images[GROUNDS_KEY] ? (
            <CustomMapImage image={customMaps.images[GROUNDS_KEY]} annotations={customMaps.annotations[GROUNDS_KEY]} label="敷地内全体" />
          ) : (
            <svg viewBox={`0 0 ${CAMPUS.w} ${CAMPUS.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              <CampusMap
                scale={1}
                filter={filter}
                selectedStallId={focusedStallId}
                animationKey={activeKey === GROUNDS_KEY ? activeKey : 'inactive'}
                onPinTap={(stall) => showStallOnMap(stall, true)}
                onBuildingTap={(building) => {
                  const firstFloor = FLOOR_PLANS[building.id]?.floors[0]
                  if (!firstFloor) return
                  const key = `${building.id}-${firstFloor.id}`
                  setActiveKey(key)
                  scrollToSection(key)
                }}
              />
            </svg>
          )}
          <ScrollHint text="下へスクロール" destination="校舎全体の案内へ" />
        </section>

        <section
          data-map-section={CAMPUS_KEY}
          className="relative flex h-full min-h-full snap-start snap-always items-center justify-center px-2 pb-32 pt-28"
          aria-label="校舎全体マップ"
        >
          <CustomMapImage
            image={customMaps.images[CAMPUS_KEY] || `${import.meta.env.BASE_URL}images/campus-building-guide-dummy.png`}
            annotations={customMaps.annotations[CAMPUS_KEY]}
            label="校舎全体"
          />
          <ScrollHint text="そのまま下へスクロール" destination="各校舎のフロアへ" />
        </section>

        {floorSections.map((section, index) => {
          const { building, plan, floor, key } = section
          const next = floorSections[index + 1]
          return (
            <section
              key={key}
              data-map-section={key}
              className="relative flex h-full min-h-full snap-start snap-always flex-col items-center justify-center px-2 pb-32 pt-28"
              aria-label={`${plan.name} ${floor.label}`}
            >
              {customMaps.images[key] ? (
                <CustomMapImage image={customMaps.images[key]} annotations={customMaps.annotations[key]} label={`${plan.name} ${floor.label}`} />
              ) : (
                <svg
                  viewBox={`0 0 ${FLOOR_VIEW.w} ${FLOOR_VIEW.h}`}
                  className="max-h-full w-full drop-shadow-sm"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <FloorMap
                    buildingId={building.id}
                    floorId={floor.id}
                    filter={filter}
                    selectedStallId={activeKey === key ? focusedStallId : null}
                    animationKey={activeKey === key ? key : 'inactive'}
                    onPinTap={(stall) => showStallOnMap(stall, true)}
                  />
                </svg>
              )}
              {next ? (
                <ScrollHint text="下へスクロールして移動" destination={`${next.plan.name} · ${next.floor.label}`} />
              ) : (
                <p className="pointer-events-none absolute bottom-32 rounded-full bg-white/90 px-4 py-2 text-[10px] font-black text-stone-500 shadow-sm">すべてのフロアを表示しました</p>
              )}
            </section>
          )
        })}
      </div>

      <div className="absolute inset-x-0 bottom-0 z-30">
        <StallCarousel
          key={filter || 'all'}
          stalls={visibleStalls}
          activeId={focusedStallId}
          onActive={showStallOnMap}
          onDetail={openDetail}
        />
      </div>

      <BottomSheet stall={sheetStall} onClose={() => setSheetStall(null)} onDetail={openDetail} />
      {editorOpen && <MapEditor onClose={() => setEditorOpen(false)} />}
    </div>
  )
}

function CustomMapImage({ image, annotations = [], label }) {
  return (
    <div className="relative mx-auto aspect-[4/3] max-h-full w-full overflow-hidden rounded-2xl bg-white shadow-sm">
      <img src={image} alt={`${label}の登録済みマップ`} className="h-full w-full object-contain" />
      {annotations.map((item) => (
        <div
          key={item.id}
          className="pointer-events-none absolute grid place-items-center overflow-hidden rounded-md border-2 border-orange-400 bg-orange-50/80 px-1 text-center text-[10px] font-black text-ink backdrop-blur-[1px]"
          style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%` }}
        >
          {item.name}
        </div>
      ))}
    </div>
  )
}

function ScrollHint({ text, destination }) {
  return (
    <div className="pointer-events-none absolute bottom-32 flex animate-bounce items-center gap-2 rounded-2xl border border-orange-200 bg-white/95 px-4 py-2.5 text-left shadow-lg shadow-orange-200/60 backdrop-blur-sm">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-fest text-lg font-black text-white">↓</span>
      <span>
        <span className="block text-[10px] font-black text-fest">{text}</span>
        <span className="block text-xs font-black text-ink">{destination}</span>
      </span>
    </div>
  )
}

function StallCarousel({ stalls, activeId, onActive, onDetail }) {
  const scroller = useRef(null)
  const programmaticScroll = useRef(false)
  const scrollTimer = useRef(null)

  useEffect(() => () => clearTimeout(scrollTimer.current), [])

  useEffect(() => {
    if (!activeId || !scroller.current) return
    const card = scroller.current.querySelector(`[data-stall-id="${activeId}"]`)
    if (!card) return
    programmaticScroll.current = true
    card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
    const timeout = setTimeout(() => { programmaticScroll.current = false }, 450)
    return () => clearTimeout(timeout)
  }, [activeId])

  const handleScroll = () => {
    if (programmaticScroll.current || !scroller.current) return
    clearTimeout(scrollTimer.current)
    scrollTimer.current = setTimeout(() => {
      if (!scroller.current) return
      const center = scroller.current.scrollLeft + scroller.current.clientWidth / 2
      let closest = null
      let distance = Infinity
      for (const card of scroller.current.children) {
        const nextDistance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - center)
        if (nextDistance < distance) {
          distance = nextDistance
          closest = card
        }
      }
      const stall = stalls.find((item) => item.id === closest?.dataset.stallId)
      if (stall && stall.id !== activeId) onActive(stall)
    }, 100)
  }

  if (stalls.length === 0) {
    return <div className="bg-white/95 px-4 py-3 text-center text-xs font-bold text-stone-500">条件に合う模擬店がありません</div>
  }

  return (
    <section className="bg-white/95 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 shadow-[0_-5px_22px_rgba(51,38,31,0.12)] backdrop-blur-sm" aria-label="すべての模擬店">
      <div className="flex items-center justify-between px-4 pb-1.5">
        <h2 className="text-xs font-black text-ink">すべての模擬店</h2>
        <span className="text-[10px] font-bold text-stone-400">横にスワイプ · {stalls.length}店 · 場所へ自動移動</span>
      </div>
      <div ref={scroller} onScroll={handleScroll} className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-[8vw] [scrollbar-width:none]">
        {stalls.map((stall) => {
          const cat = CATEGORIES[stall.cat]
          const active = stall.id === activeId
          return (
            <article
              key={stall.id}
              data-stall-id={stall.id}
              onClick={() => onActive(stall, true)}
              className={`w-[78vw] max-w-[340px] shrink-0 snap-center rounded-2xl border bg-white px-3.5 py-2.5 transition-all ${active ? 'border-fest shadow-md' : 'border-stone-200'}`}
            >
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-xl" style={{ background: cat.soft }}>{cat.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-black text-ink">{stall.name}</p>
                  <p className="truncate text-[11px] font-bold text-stone-500">📍 {stall.placeLabel}</p>
                  <p className="truncate text-[10px] text-stone-400">{stall.org}</p>
                </div>
                <button
                  type="button"
                  onClick={(event) => { event.stopPropagation(); onDetail(stall.id) }}
                  className="shrink-0 rounded-full bg-fest px-3 py-2 text-[10px] font-black text-white active:scale-90"
                  aria-label={`${stall.name}の詳細を見る`}
                >
                  詳細
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function FilterChip({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-90"
      style={active ? { background: color, color: '#fff' } : { background: 'rgba(255,255,255,0.9)', color: '#6b6255' }}
    >
      {label}
    </button>
  )
}
