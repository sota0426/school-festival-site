import { useEffect, useMemo, useRef, useState } from 'react'
import { BUILDINGS, CAMPUS } from '../../data/campus'
import { FLOOR_PLANS, FLOOR_VIEW } from '../../data/floors'
import { STALLS, stallById } from '../../data/stalls'
import { CATEGORIES } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import { imageFromDb, readMapAnnotations } from '../../lib/mapEditorStorage'
import AdminEditor from '../admin/AdminEditor'
import IllustratedCampusMap from './IllustratedCampusMap'
import FloorMap from './FloorMap'

const GROUNDS_KEY = 'grounds'
const CAMPUS_KEY = 'campus'

export default function MapView({ mapTarget, dataVersion }) {
  const { openDetail } = useApp()
  const [selectedStall, setSelectedStall] = useState(null)
  const [focusedStallId, setFocusedStallId] = useState(null)
  const [activeKey, setActiveKey] = useState(GROUNDS_KEY)
  const [editorOpen, setEditorOpen] = useState(false)
  const [customMaps, setCustomMaps] = useState({ annotations: {}, images: {} })
  const mapScroller = useRef(null)
  void dataVersion

  const floorSections = useMemo(
    () => BUILDINGS.flatMap((building) => {
      const plan = FLOOR_PLANS[building.id]
      if (!plan) return []
      return plan.floors.map((floor) => ({
        key: `${building.id}-${floor.id}`,
        building,
        plan,
        floor,
        label: `${plan.name} · ${floor.label}`,
      }))
    }),
    [],
  )

  const mapOrder = [
    { key: GROUNDS_KEY, label: '敷地内全体' },
    { key: CAMPUS_KEY, label: '校舎全体の案内' },
    ...floorSections,
  ]

  const reloadCustomMaps = async () => {
    const keys = mapOrder.map((section) => section.key)
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
    const key = stall.loc.type === 'out' ? GROUNDS_KEY : `${stall.loc.building}-${stall.loc.floor}`
    setActiveKey(key)
    requestAnimationFrame(() => scrollToSection(key))
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
      scrollToSection(GROUNDS_KEY)
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
      if (selectedStall && mapKeyForStall(selectedStall) !== key) {
        setSelectedStall(null)
        setFocusedStallId(null)
      }
    }
  }

  const currentIndex = Math.max(0, mapOrder.findIndex((section) => section.key === activeKey))
  const currentMap = mapOrder[currentIndex]
  const nextMap = mapOrder[currentIndex + 1]
  const currentStalls = STALLS.filter((stall) => mapKeyForStall(stall) === activeKey)

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-[#f4f1e3]">
      <section className="relative h-1/2 min-h-0 shrink-0 border-b-2 border-white bg-[#f4f1e3]" aria-label="フロアマップ">
        <button
          type="button"
          onClick={() => setEditorOpen(true)}
          className="absolute right-1.5 top-1.5 z-40 rounded-lg bg-black/45 px-2 py-1 text-[8px] font-black text-white/90 backdrop-blur-sm active:scale-90"
          aria-label="管理者編集を開く"
        >
          管理者編集 ✎
        </button>

        <div
          ref={mapScroller}
          onScroll={handleMapScroll}
          className="map-scroll-area h-full snap-y snap-mandatory overflow-y-scroll overscroll-y-contain scroll-smooth"
          aria-label="学校全体と全校舎のフロアマップ"
        >
          <MapSection sectionKey={GROUNDS_KEY} label="敷地内全体マップ">
            {customMaps.images[GROUNDS_KEY] ? (
              <CustomMapImage image={customMaps.images[GROUNDS_KEY]} annotations={customMaps.annotations[GROUNDS_KEY]} label="敷地内全体" />
            ) : (
              <svg viewBox={`0 0 ${CAMPUS.w} ${CAMPUS.h}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
                <IllustratedCampusMap
                  selectedStallId={focusedStallId}
                  animationKey={activeKey === GROUNDS_KEY ? activeKey : 'inactive'}
                  onPinTap={showStallOnMap}
                />
              </svg>
            )}
          </MapSection>

          <MapSection sectionKey={CAMPUS_KEY} label="校舎全体マップ">
            <CustomMapImage
              image={customMaps.images[CAMPUS_KEY] || `${import.meta.env.BASE_URL}images/campus-building-guide-dummy.png`}
              annotations={customMaps.annotations[CAMPUS_KEY]}
              label="校舎全体"
            />
          </MapSection>

          {floorSections.map(({ building, plan, floor, key }) => (
            <MapSection key={key} sectionKey={key} label={`${plan.name} ${floor.label}`}>
              {customMaps.images[key] ? (
                <CustomMapImage image={customMaps.images[key]} annotations={customMaps.annotations[key]} label={`${plan.name} ${floor.label}`} />
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
          ))}
        </div>

        <MapScrollRail currentIndex={currentIndex} total={mapOrder.length} />
        <MapScrollStatus
          next={nextMap?.label}
          onNext={nextMap ? () => scrollToSection(nextMap.key) : undefined}
        />
      </section>

      <section className="flex min-h-0 flex-1 flex-col bg-white" aria-label="模擬店情報">
        <div className="shrink-0 border-b border-orange-100 px-4 py-2">
          <h2 className="text-xl font-black leading-tight text-ink">{currentMap.label}</h2>
          <p className="mt-0.5 text-[10px] font-bold text-stone-400">
            {currentStalls.length > 0 ? `この場所の模擬店 ${currentStalls.length}店` : 'この場所に模擬店はありません'}
          </p>
        </div>
        <div className="min-h-0 flex-1">
          {selectedStall ? (
            <SelectedStallPanel
              stall={selectedStall}
              onBack={() => setSelectedStall(null)}
              onDetail={() => openDetail(selectedStall.id)}
            />
          ) : (
            <StallVerticalList stalls={currentStalls} onSelect={showStallOnMap} />
          )}
        </div>
      </section>

      {editorOpen && <AdminEditor onClose={() => setEditorOpen(false)} />}
    </div>
  )
}

function MapSection({ sectionKey, label, children }) {
  return (
    <section
      data-map-section={sectionKey}
      className="relative flex h-full min-h-full snap-start snap-always items-center justify-center px-1 pb-14 pt-1"
      aria-label={label}
    >
      {children}
    </section>
  )
}

function MapScrollStatus({ next, onNext }) {
  return (
    <button
      type="button"
      onClick={onNext}
      disabled={!onNext}
      className="absolute inset-x-3 bottom-1.5 z-30 flex animate-bounce items-center gap-2 rounded-2xl border border-orange-200 bg-white/95 px-3 py-2 text-left shadow-lg shadow-orange-200/50 backdrop-blur-sm transition-transform active:scale-[0.98] disabled:animate-none"
      aria-label={next ? `次のマップ、${next}へスクロール` : '最後のフロアです'}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-fest text-base font-black text-white">
        {next ? '↕' : '↑'}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-black text-ink">
          {next ? '上下にスクロールしてフロア移動' : '最後のフロアです'}
        </p>
      </div>
    </button>
  )
}

function MapScrollRail({ currentIndex, total }) {
  const progress = total <= 1 ? 0 : currentIndex / (total - 1)
  return (
    <div className="pointer-events-none absolute bottom-16 right-1 top-3 z-30 flex w-4 flex-col items-center" aria-hidden="true">
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

function StallVerticalList({ stalls, onSelect }) {
  if (stalls.length === 0) {
    return <div className="grid h-full place-items-center px-6 text-center text-xs font-bold text-stone-400">このマップに表示する模擬店はありません</div>
  }
  return (
    <div className="h-full overflow-y-auto px-3 py-2">
        <div className="space-y-2">
          {stalls.map((stall) => {
            const cat = CATEGORIES[stall.cat]
            return (
              <button
                key={stall.id}
                type="button"
                onClick={() => onSelect(stall)}
                className="flex w-full items-center gap-3 rounded-2xl border border-stone-100 bg-stone-50 p-3 text-left transition-transform active:scale-[0.98]"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-xl" style={{ background: cat.soft }}>{cat.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-black text-ink">{stall.name}</span>
                  <span className="block truncate text-[11px] font-bold text-stone-500">{stall.org} · 📍 {stall.placeLabel}</span>
                </span>
                <span className="text-sm font-black text-fest">›</span>
              </button>
            )
          })}
        </div>
    </div>
  )
}

function mapKeyForStall(stall) {
  return stall.loc.type === 'out' ? GROUNDS_KEY : `${stall.loc.building}-${stall.loc.floor}`
}

function SelectedStallPanel({ stall, onBack, onDetail }) {
  const cat = CATEGORIES[stall.cat]
  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-3">
      <div className="flex items-start gap-3">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-2xl" style={{ background: cat.soft }}>{cat.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[9px] font-black text-white" style={{ background: cat.color }}>{cat.label}</span>
            <span className="truncate text-[10px] font-bold text-stone-400">{stall.org}</span>
          </div>
          <h2 className="mt-1 truncate text-base font-black text-ink">{stall.name}</h2>
          <p className="truncate text-[11px] font-bold text-stone-500">📍 {stall.placeLabel}</p>
        </div>
        <button type="button" onClick={onBack} className="shrink-0 rounded-full bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-600">一覧へ</button>
      </div>

      <p className="mt-2 text-xs leading-relaxed text-stone-600">{stall.pr}</p>
      <div className="mt-3">
        <p className="text-[9px] font-black tracking-[0.16em] text-fest">MENU</p>
        {stall.menu.length > 0 ? (
          <ul className="mt-1 divide-y divide-orange-100 rounded-2xl bg-orange-50/60 px-3">
            {stall.menu.map(([item, price], index) => (
              <li key={index} className="flex items-center justify-between gap-3 py-2">
                <span className="text-xs font-bold text-ink">{item}</span>
                <span className="shrink-0 text-xs font-black" style={{ color: cat.color }}>{price > 0 ? `¥${price}` : '無料'}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 rounded-xl bg-stone-50 px-3 py-2 text-xs font-bold text-stone-500">無料でご覧いただけます</p>
        )}
      </div>
      <button type="button" onClick={onDetail} className="mt-3 w-full rounded-full bg-fest py-2.5 text-xs font-black text-white">
        ポスター・行き方・フロア図を見る
      </button>
    </div>
  )
}
