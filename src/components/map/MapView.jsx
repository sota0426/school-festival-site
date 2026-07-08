import { useEffect, useRef, useState } from 'react'
import { CAMPUS, buildingById, buildingCenter } from '../../data/campus'
import { FLOOR_PLANS, FLOOR_VIEW, roomCenter } from '../../data/floors'
import { stallById } from '../../data/stalls'
import { CATEGORIES, CATEGORY_IDS } from '../../data/categories'
import { useApp } from '../../lib/AppContext'
import { BackIcon } from '../Icons'
import PanZoom from './PanZoom'
import CampusMap from './CampusMap'
import FloorMap from './FloorMap'
import BottomSheet from './BottomSheet'

export default function MapView({ mapTarget }) {
  const { openDetail } = useApp()
  // campus | zooming(建物へズーム中) | floor(フロア図) | leaving(全体へ戻り中)
  const [phase, setPhase] = useState('campus')
  const [buildingId, setBuildingId] = useState(null)
  const [floorId, setFloorId] = useState(null)
  const [filter, setFilter] = useState(null)
  const [sheetStall, setSheetStall] = useState(null)
  const [campusFocus, setCampusFocus] = useState(null)
  const [floorFocus, setFloorFocus] = useState(null)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const building = buildingId ? buildingById(buildingId) : null
  const plan = buildingId ? FLOOR_PLANS[buildingId] : null

  const enterBuilding = (b) => {
    setSheetStall(null)
    setBuildingId(b.id)
    setFloorId(FLOOR_PLANS[b.id].floors[0].id)
    setFloorFocus(null)
    setPhase('zooming')
    setCampusFocus({ ...buildingCenter(b), s: 3, key: `in-${b.id}-${Date.now()}` })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setPhase('floor'), 420)
  }

  const exitBuilding = () => {
    setSheetStall(null)
    setPhase('leaving')
    setCampusFocus({ x: CAMPUS.w / 2, y: CAMPUS.h / 2, s: 1, key: `out-${Date.now()}` })
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setPhase('campus')
      setBuildingId(null)
    }, 420)
  }

  // 詳細ページ「マップで見る」やアクセスページからのフォーカス要求
  useEffect(() => {
    if (!mapTarget) return
    if (mapTarget.type === 'stall') {
      const stall = stallById(mapTarget.id)
      if (!stall) return
      setFilter(null)
      if (stall.loc.type === 'out') {
        clearTimeout(timer.current)
        setBuildingId(null)
        setPhase('campus')
        setCampusFocus({ x: stall.loc.x, y: stall.loc.y, s: 2.2, key: `tg-${mapTarget.ts}` })
        setSheetStall(stall)
      } else {
        clearTimeout(timer.current)
        setBuildingId(stall.loc.building)
        setFloorId(stall.loc.floor)
        setPhase('floor')
        setFloorFocus({
          ...roomCenter(stall.loc.building, stall.loc.floor, stall.loc.room),
          s: 1.5,
          key: `tg-${mapTarget.ts}`,
        })
        setSheetStall(stall)
      }
    } else if (mapTarget.type === 'point') {
      clearTimeout(timer.current)
      setBuildingId(null)
      setPhase('campus')
      setSheetStall(null)
      setCampusFocus({ x: mapTarget.x, y: mapTarget.y, s: 2, key: `tg-${mapTarget.ts}` })
    }
  }, [mapTarget])

  const campusHidden = phase === 'floor'
  const campusFading = phase === 'zooming'
  const floorVisible = phase === 'floor'

  return (
    <div className="relative flex-1 overflow-hidden bg-[#f4f1e3]">
      {/* カテゴリフィルタ */}
      <div className="absolute inset-x-0 top-0 z-20 flex gap-2 overflow-x-auto px-3 pb-1 pt-3 [scrollbar-width:none]">
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

      {/* 全体マップ */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          campusHidden
            ? 'pointer-events-none opacity-0'
            : campusFading
              ? 'pointer-events-none opacity-0 [transition-delay:180ms]'
              : 'opacity-100'
        }`}
      >
        <PanZoom viewW={CAMPUS.w} viewH={CAMPUS.h} focus={campusFocus} maxScale={5}>
          {(scale) => (
            <CampusMap
              scale={scale}
              filter={filter}
              selectedStallId={sheetStall?.id}
              onPinTap={(s) => setSheetStall(s)}
              onBuildingTap={enterBuilding}
            />
          )}
        </PanZoom>
        {phase === 'campus' && (
          <p className="pointer-events-none absolute bottom-2 left-3 z-10 rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold text-stone-500">
            🔴点線の建物をタップすると館内マップ
          </p>
        )}
      </div>

      {/* フロアマップ */}
      {building && plan && (
        <div
          className={`absolute inset-0 flex flex-col transition-all duration-300 ${
            floorVisible ? 'scale-100 opacity-100' : 'pointer-events-none scale-90 opacity-0'
          }`}
        >
          <div className="z-10 flex items-center gap-2 px-3 pt-14">
            <button
              type="button"
              onClick={exitBuilding}
              className="flex items-center gap-1 rounded-full bg-white px-3 py-2 text-xs font-bold text-ink shadow-md transition-transform active:scale-90"
            >
              <BackIcon width="14" height="14" />
              全体マップ
            </button>
            <span className="rounded-full bg-ink px-4 py-2 text-xs font-black text-white shadow-md">
              {plan.name}
            </span>
            <div className="ml-auto flex gap-1.5">
              {plan.floors.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setFloorId(f.id)
                    setSheetStall(null)
                  }}
                  className={`h-9 w-9 rounded-full text-xs font-black shadow-md transition-all active:scale-90 ${
                    floorId === f.id ? 'bg-fest text-white' : 'bg-white text-stone-500'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="min-h-0 flex-1">
            <PanZoom
              key={`${buildingId}-${floorId}`}
              viewW={FLOOR_VIEW.w}
              viewH={FLOOR_VIEW.h}
              focus={floorFocus}
              maxScale={3}
            >
              {() => (
                <FloorMap
                  buildingId={buildingId}
                  floorId={floorId}
                  filter={filter}
                  selectedStallId={sheetStall?.id}
                  onPinTap={(s) => setSheetStall(s)}
                />
              )}
            </PanZoom>
          </div>
        </div>
      )}

      <BottomSheet
        stall={sheetStall}
        onClose={() => setSheetStall(null)}
        onDetail={(id) => openDetail(id)}
      />
    </div>
  )
}

function FilterChip({ label, active, color, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-90"
      style={
        active
          ? { background: color, color: '#fff' }
          : { background: 'rgba(255,255,255,0.9)', color: '#6b6255' }
      }
    >
      {label}
    </button>
  )
}
