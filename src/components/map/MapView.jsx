import { useEffect, useMemo, useRef, useState } from 'react'
import { BUILDINGS, CAMPUS } from '../../data/campus'
import { DEFAULT_FLOOR_MAPS, FLOOR_MAP_ASPECT_RATIOS, FLOOR_PLANS, FLOOR_VIEW, VISIBLE_FLOOR_KEYS } from '../../data/floors'
import { STALLS, stallById } from '../../data/stalls'
import { CATEGORIES } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import { readMapAnnotations } from '../../lib/mapEditorStorage'
import IllustratedCampusMap from './IllustratedCampusMap'
import FloorMap from './FloorMap'
import ImageMapPin from './ImageMapPin'
import { stallPrice } from '../../lib/stallPrice'

const GROUNDS_KEY = 'grounds'
const CAMPUS_KEY = 'campus'
const BUILDING_MAP_ORDER = ['honkan', 'minami', 'chugaku']

const MAP_TONES = {
  honkan: { background: '#eaf6e5', border: '#9dcf8d', badge: '#f1faed' },
  minami: { background: '#fff0e6', border: '#efb28d', badge: '#fff5ee' },
}

export default function MapView({ mapTarget, dataVersion }) {
  const { openDetail } = useApp()
  const [selectedStall, setSelectedStall] = useState(null)
  const [focusedStallId, setFocusedStallId] = useState(null)
  const [activeKey, setActiveKey] = useState(GROUNDS_KEY)
  const [mapAnnotations, setMapAnnotations] = useState(readMapAnnotations)
  const [stallListScrollByMap, setStallListScrollByMap] = useState({})
  const mapScroller = useRef(null)
  const mapSnapTimer = useRef(null)
  const pendingDetailMapKey = useRef(null)
  void dataVersion

  const floorSections = useMemo(
    () => [...BUILDINGS]
      .sort((a, b) => {
        const aIndex = BUILDING_MAP_ORDER.indexOf(a.id)
        const bIndex = BUILDING_MAP_ORDER.indexOf(b.id)
        return (aIndex === -1 ? BUILDING_MAP_ORDER.length : aIndex) - (bIndex === -1 ? BUILDING_MAP_ORDER.length : bIndex)
      })
      .flatMap((building) => {
        const plan = FLOOR_PLANS[building.id]
        if (!plan) return []
        return plan.floors
          .map((floor) => ({
            key: `${building.id}-${floor.id}`,
            building,
            plan,
            floor,
            label: `${plan.name} · ${floor.label}`,
          }))
          .filter((section) => VISIBLE_FLOOR_KEYS.has(section.key))
      }),
    [],
  )

  const mapOrder = [
    { key: GROUNDS_KEY, label: '敷地内全体' },
    { key: CAMPUS_KEY, label: '校舎案内' },
    ...floorSections,
  ]

  const reloadMapAnnotations = () => setMapAnnotations(readMapAnnotations())

  useEffect(() => {
    reloadMapAnnotations()
    window.addEventListener('festival-map-editor-save', reloadMapAnnotations)
    return () => {
      window.removeEventListener('festival-map-editor-save', reloadMapAnnotations)
      window.clearTimeout(mapSnapTimer.current)
    }
    // Map keys are static for this build.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const scrollToSection = (key, behavior = 'smooth') => {
    const target = mapScroller.current?.querySelector(`[data-map-section="${key}"]`)
    if (!target || !mapScroller.current) return
    mapScroller.current.scrollTo({ top: target.offsetTop, behavior })
  }

  const showStallOnMap = (stall) => {
    setFocusedStallId(stall.id)
    setSelectedStall(stall)
    const key = mapKeyForStall(stall)
    setActiveKey(key)
    requestAnimationFrame(() => scrollToSection(key))
  }

  const selectStallFromList = (stall, scrollTop) => {
    setStallListScrollByMap((current) => ({ ...current, [activeKey]: scrollTop }))
    showStallOnMap(stall)
  }

  useEffect(() => {
    if (!mapTarget) return
    if (mapTarget.type === 'stall') {
      const stall = stallById(mapTarget.id)
      if (stall) showStallOnMap(stall)
    } else if (mapTarget.type === 'point') {
      setSelectedStall(null)
      setFocusedStallId(null)
      setActiveKey(GROUNDS_KEY)
      scrollToSection(GROUNDS_KEY, 'auto')
    }
    // mapTarget.ts is the request identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTarget])

  const handleMapScroll = (event) => {
    const container = event.currentTarget
    const sectionIndex = Math.round(container.scrollTop / container.clientHeight)
    const key = container.children[sectionIndex]?.dataset.mapSection
    if (key) {
      setActiveKey(key)
      const detailNavigationTarget = pendingDetailMapKey.current
      const isDetailNavigation = Boolean(detailNavigationTarget)
      if (detailNavigationTarget === key) pendingDetailMapKey.current = null
      if (!isDetailNavigation && selectedStall && mapKeyForStall(selectedStall) !== key) {
        setSelectedStall(null)
        setFocusedStallId(null)
      }
    }
    window.clearTimeout(mapSnapTimer.current)
    mapSnapTimer.current = window.setTimeout(() => {
      const nearestIndex = Math.max(
        0,
        Math.min(container.children.length - 1, Math.round(container.scrollTop / container.clientHeight)),
      )
      const target = container.children[nearestIndex]
      if (!target) return
      if (Math.abs(container.scrollTop - target.offsetTop) > 1) {
        container.scrollTo({ top: target.offsetTop, behavior: 'smooth' })
      }
    }, 160)
  }

  const currentIndex = Math.max(0, mapOrder.findIndex((section) => section.key === activeKey))
  const currentMap = mapOrder[currentIndex]
  const currentTone = MAP_TONES[currentMap.building?.id]
  const currentStalls = STALLS.filter((stall) => mapKeyForStall(stall) === activeKey)
  const navigableStalls = mapOrder.flatMap(({ key }) =>
    STALLS.filter((stall) => mapKeyForStall(stall) === key),
  )
  const selectedStallIndex = selectedStall
    ? navigableStalls.findIndex((stall) => stall.id === selectedStall.id)
    : -1
  const nextMap = mapOrder[currentIndex + 1]

  const moveToNextMap = () => {
    if (!nextMap) return
    setSelectedStall(null)
    setFocusedStallId(null)
    setActiveKey(nextMap.key)
    setStallListScrollByMap((current) => ({ ...current, [nextMap.key]: 0 }))
    requestAnimationFrame(() => scrollToSection(nextMap.key))
  }

  const moveSelectedStall = (offset) => {
    const requestedIndex = selectedStallIndex + offset
    const nextIndex = offset > 0 && requestedIndex >= navigableStalls.length ? 0 : requestedIndex
    const nextStall = navigableStalls[nextIndex]
    if (!nextStall) return
    const nextMapKey = mapKeyForStall(nextStall)
    setSelectedStall(nextStall)
    setFocusedStallId(nextStall.id)
    if (nextMapKey !== activeKey) {
      pendingDetailMapKey.current = nextMapKey
      setActiveKey(nextMapKey)
      requestAnimationFrame(() => scrollToSection(nextMapKey))
    }
  }

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f4f1e3]">
      <section
        className="relative h-[70vw] min-h-56 max-h-[48dvh] shrink-0 border-b-2 border-white bg-[#f4f1e3]"
        aria-label="フロアマップ"
      >
        <div
          className="pointer-events-none absolute left-2 top-1.5 z-40 max-w-[38%] rounded-2xl border border-white/80 bg-white/95 px-3 py-2 shadow-md backdrop-blur-sm"
          style={currentTone ? { backgroundColor: currentTone.badge, borderColor: currentTone.border } : undefined}
          aria-live="polite"
        >
          <p className="text-[8px] font-black tracking-[0.16em] text-fest">現在のマップ</p>
          <h2 className="truncate text-lg font-black leading-tight text-ink">{currentMap.label}</h2>
        </div>
        <button
          type="button"
          onClick={() => scrollToSection(mapOrder[currentIndex - 1]?.key)}
          disabled={currentIndex === 0}
          className="absolute left-[44%] top-2 z-40 rounded-full border border-orange-200 bg-white/95 px-2.5 py-2 text-[14px] font-black text-fest shadow-md backdrop-blur-sm transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="一つ上のマップへ移動"
        >
          ▲ 上へ
        </button>
        <div
          ref={mapScroller}
          data-tab-scroll="map"
          onScroll={handleMapScroll}
          className="map-scroll-area h-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain scroll-smooth"
          aria-label="学校全体と全校舎のフロアマップ"
        >
          <MapSection sectionKey={GROUNDS_KEY} label="敷地内全体マップ">
            <svg viewBox={`0 0 ${CAMPUS.w} ${CAMPUS.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
              <IllustratedCampusMap
                selectedStallId={focusedStallId}
                animationKey={activeKey === GROUNDS_KEY ? activeKey : 'inactive'}
                onPinTap={showStallOnMap}
              />
            </svg>
          </MapSection>

          <MapSection sectionKey={CAMPUS_KEY} label="校舎案内図">
            <CustomMapImage
              image={`${import.meta.env.BASE_URL}images/campus-building-guide.png?v=4`}
              annotations={mapAnnotations[CAMPUS_KEY]}
              label="校舎案内"
              aspectRatio={4 / 3}
              stalls={STALLS.filter((stall) => stall.loc.type === 'guide')}
              selectedStallId={activeKey === CAMPUS_KEY ? focusedStallId : null}
              animationKey={activeKey === CAMPUS_KEY ? CAMPUS_KEY : 'inactive'}
              onPinTap={showStallOnMap}
            />
          </MapSection>

          {floorSections.map(({ building, plan, floor, key }) => {
            const tone = MAP_TONES[building.id]
            return (
            <MapSection key={key} sectionKey={key} label={`${plan.name} ${floor.label}`} tone={tone}>
              {DEFAULT_FLOOR_MAPS[key] ? (
                <CustomMapImage
                  image={`${import.meta.env.BASE_URL}${DEFAULT_FLOOR_MAPS[key]}`}
                  annotations={mapAnnotations[key]}
                  label={`${plan.name} ${floor.label}`}
                  accentColor={tone?.border}
                  aspectRatio={FLOOR_MAP_ASPECT_RATIOS[key]}
                  stalls={STALLS.filter((stall) => mapKeyForStall(stall) === key)}
                  selectedStallId={activeKey === key ? focusedStallId : null}
                  animationKey={activeKey === key ? key : 'inactive'}
                  onPinTap={showStallOnMap}
                />
              ) : (
                <svg viewBox={`0 0 ${FLOOR_VIEW.w} ${FLOOR_VIEW.h}`} className="max-h-full w-full drop-shadow-sm" preserveAspectRatio="xMidYMid meet">
                  <FloorMap
                    buildingId={building.id}
                    floorId={floor.id}
                    selectedStallId={activeKey === key ? focusedStallId : null}
                    animationKey={activeKey === key ? key : 'inactive'}
                    onPinTap={showStallOnMap}
                  />
                </svg>
              )}
            </MapSection>
            )
          })}
        </div>

        <MapScrollRail currentIndex={currentIndex} total={mapOrder.length} />
        <button
          type="button"
          onClick={() => scrollToSection(mapOrder[currentIndex + 1]?.key)}
          disabled={currentIndex === mapOrder.length - 1}
          className="absolute bottom-2 left-1/2 z-40 -translate-x-1/2 rounded-full border border-orange-200 bg-white/95 px-3 py-1 text-[14px] font-black text-fest shadow-md backdrop-blur-sm transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          aria-label="一つ下のマップへ移動"
        >
          ▼ 下のマップ
        </button>
      </section>

      <section className="flex min-h-0 flex-1 flex-col bg-white" aria-label="模擬店情報">
        <div className="shrink-0 border-b border-orange-100 px-4 py-2">
          <p className="text-[9px] font-black tracking-[0.16em] text-fest">STALLS ON THIS FLOOR</p>
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-black leading-tight text-ink">このフロアの模擬店</p>
              <p className="mt-0.5 truncate text-xs font-bold text-stone-500">{currentMap.label}</p>
            </div>
            {selectedStall && (
              <div className="flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedStall(null)}
                  className="rounded-full bg-fest px-3 py-2 text-[11px] font-black text-white shadow-sm transition-transform active:scale-95"
                >
                  ← 一覧へ
                </button>
                <button
                  type="button"
                  onClick={() => moveSelectedStall(-1)}
                  disabled={selectedStallIndex <= 0}
                  className="rounded-full bg-stone-100 px-3 py-2 text-[11px] font-black text-stone-600 transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-35"
                  aria-label="前の模擬店を見る"
                >
                  前へ
                </button>
                <button
                  type="button"
                  onClick={() => moveSelectedStall(1)}
                  disabled={selectedStallIndex < 0}
                  className="rounded-full bg-stone-100 px-3 py-2 text-[11px] font-black text-stone-600 transition-transform active:scale-95 disabled:pointer-events-none disabled:opacity-35"
                  aria-label={selectedStallIndex >= navigableStalls.length - 1 ? '最初の模擬店へ戻る' : '次の模擬店を見る'}
                >
                  {selectedStallIndex >= navigableStalls.length - 1 ? '最初へ戻る' : '次へ'}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="min-h-0 flex-1">
          {selectedStall ? (
            <SelectedStallPanel
              stall={selectedStall}
              onDetail={() => openDetail(selectedStall.id)}
            />
          ) : (
            <StallVerticalList
              key={`${activeKey}-${mapTarget?.ts || 'initial'}`}
              stalls={currentStalls}
              onSelect={selectStallFromList}
              initialScrollTop={stallListScrollByMap[activeKey] || 0}
              nextMapLabel={nextMap?.label}
              onNextMap={nextMap ? moveToNextMap : undefined}
            />
          )}
        </div>
      </section>
    </div>
  )
}

function MapSection({ sectionKey, label, children, tone }) {
  return (
    <section
      data-map-section={sectionKey}
      className="relative flex h-full min-h-full snap-start snap-always items-center justify-center [container-type:size] [scroll-snap-stop:always]"
      style={tone ? { backgroundColor: tone.background } : undefined}
      aria-label={label}
    >
      {children}
    </section>
  )
}

function MapScrollRail({ currentIndex, total }) {
  const progress = total <= 1 ? 0 : currentIndex / (total - 1)
  return (
    <div className="pointer-events-none absolute bottom-3 right-1 top-16 z-30 flex w-4 flex-col items-center" aria-hidden="true">
      <span className="text-[9px] font-black text-fest">▲</span>
      <div className="relative my-1 w-1 flex-1 rounded-full bg-stone-300/80 shadow-inner">
        <span
          className="absolute left-1/2 h-8 w-2.5 -translate-x-1/2 rounded-full bg-fest shadow-md transition-[top] duration-300"
          style={{ top: `calc(${progress * 100}% - ${progress * 2}rem)` }}
        />
      </div>
      <span className="text-[9px] font-black text-fest">▼</span>
    </div>
  )
}

function CustomMapImage({ image, annotations = [], label, accentColor, aspectRatio = 16 / 9, stalls = [], selectedStallId, animationKey, onPinTap }) {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-2xl border-2 bg-white shadow-sm"
      style={{
        borderColor: accentColor || 'rgba(255,255,255,0.9)',
        aspectRatio,
        width: `min(100cqw, ${aspectRatio * 100}cqh)`,
      }}
    >
      <img src={image} alt={`${label}のフロアマップ`} loading="lazy" decoding="async" className="block h-full w-full object-fill" />
      {stalls.map((stall, index) => {
        const x = stall.loc.type === 'room' ? ((stall.loc.pinX ?? FLOOR_VIEW.w / 2) / FLOOR_VIEW.w) * 100 : stall.loc.x ?? 50
        const y = stall.loc.type === 'room' ? ((stall.loc.pinY ?? FLOOR_VIEW.h / 2) / FLOOR_VIEW.h) * 100 : stall.loc.y ?? 50
        const category = CATEGORIES[stall.cat] || CATEGORIES.exhibit
        return (
          <ImageMapPin
            key={`${stall.id}-${animationKey || 'default'}`}
            x={x}
            y={y}
            color={category.color}
            emoji={category.emoji}
            selected={selectedStallId === stall.id}
            animate={animationKey !== 'inactive'}
            delay={0.18 + index * 0.28}
            label={`${stall.name}（${stall.org}）`}
            onClick={(event) => { event.stopPropagation(); onPinTap?.(stall) }}
          />
        )
      })}
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

function StallVerticalList({ stalls, onSelect, initialScrollTop = 0, nextMapLabel, onNextMap }) {
  const listRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: initialScrollTop, behavior: 'auto' })
  }, [initialScrollTop])

  if (stalls.length === 0) {
    return <div className="grid h-full place-items-center px-6 text-center text-xs font-bold text-stone-400">このマップに表示する模擬店はありません</div>
  }
  return (
    <div ref={listRef} data-tab-scroll="map" className="h-full overflow-y-auto px-3 py-2">
        <div className="space-y-2">
          {stalls.map((stall) => {
            const cat = CATEGORIES[stall.cat]
            return (
              <button
                key={stall.id}
                type="button"
                onClick={() => onSelect(stall, listRef.current?.scrollTop || 0)}
                className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3 text-left transition-transform active:scale-[0.98]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: cat.soft }}>{cat.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-ink">{stall.name}</span>
                  <span className="block truncate text-[11px] font-bold text-stone-500">{stall.org}</span>
                </span>
                {stall.menu?.length > 0 && stallPrice(stall) && (
                  <span className="shrink-0 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-black text-fest">
                    {stallPrice(stall)}
                  </span>
                )}
                <span className="text-sm font-black text-fest">›</span>
              </button>
            )
          })}

        </div>
    </div>
  )
}

function mapKeyForStall(stall) {
  if (stall.loc.type === 'out') return GROUNDS_KEY
  if (stall.loc.type === 'guide') return CAMPUS_KEY
  return `${stall.loc.building}-${stall.loc.floor}`
}

function SelectedStallPanel({ stall, onDetail }) {
  const cat = CATEGORIES[stall.cat]
  return (
    <div data-tab-scroll="map" className="flex h-full flex-col overflow-y-auto px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: cat.soft }}>{cat.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2.5 py-1 text-[10px] font-black text-white" style={{ background: cat.color }}>{cat.label}</span>
            <span className="truncate text-xs font-bold text-stone-500">{stall.org}</span>
          </div>
          <h2 className="mt-1 line-clamp-2 break-words text-xl font-black leading-tight text-ink">
            {stall.name}
          </h2>
        </div>
      </div>

      <p className="mt-2 text-sm font-medium leading-relaxed text-stone-600">{stall.pr}</p>
      <div className="mt-3">
        <p className="text-[10px] font-black tracking-[0.16em] text-fest">MENU</p>
        {stall.menu.length > 0 ? (
          <ul className="mt-1 divide-y divide-orange-100 rounded-2xl bg-orange-50/60 px-3">
            {stall.menu.slice(0, 1).map(([item, price], index) => (
              <li key={index} className="flex items-center justify-between gap-3 py-2">
                <span className="text-sm font-bold text-ink">{item}</span>
                {stallPrice(stall, price) && <span className="shrink-0 text-sm font-black text-fest">{stallPrice(stall, price)}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 rounded-xl bg-stone-50 px-3 py-2 text-sm font-bold text-stone-500">無料でご覧いただけます</p>
        )}
      </div>
      <button type="button" onClick={onDetail} className="mt-3 w-full rounded-full bg-fest py-2.5 text-sm font-black text-white">
        ポスター・行き方・フロア図を見る
      </button>
    </div>
  )
}
