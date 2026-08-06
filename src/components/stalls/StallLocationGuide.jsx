import { CAMPUS } from '../../data/campus'
import { CATEGORIES, pinEmojiForStall } from '../../data/categories'
import { DEFAULT_FLOOR_MAPS, FLOOR_MAP_ASPECT_RATIOS, FLOOR_VIEW } from '../../data/floors'
import { routeForStall } from '../../data/routes'
import IllustratedCampusMap from '../map/IllustratedCampusMap'
import FloorMap from '../map/FloorMap'
import ImageMapPin from '../map/ImageMapPin'

const noop = () => {}

const BUILDING_FOCUS = {
  honkan: { label: '中央校舎', color: '#5f962f', x: 54.8, y: 10.8, w: 15.7, h: 48 },
  minami: { label: '南校舎', color: '#ef3f2f', x: 25.8, y: 42.3, w: 20, h: 14.5 },
  chugaku: { label: '北校舎', color: '#327fbd', x: 84.8, y: 18.4, w: 11.4, h: 50.5 },
}

export default function StallLocationGuide({ stall }) {
  const route = routeForStall(stall)
  const indoor = route.type === 'indoor'
  const campusGuide = route.type === 'guide'
  const floorKey = indoor ? `${stall.loc.building}-${stall.loc.floor}` : null
  const floorImage = floorKey ? DEFAULT_FLOOR_MAPS[floorKey] : null
  const category = CATEGORIES[stall.cat] || CATEGORIES.exhibit
  const buildingFocus = indoor ? BUILDING_FOCUS[stall.loc.building] : null

  return (
    <section className="mt-6 border-t border-orange-100 pt-5" aria-labelledby="location-guide-title">
      <p className="text-[10px] font-black tracking-[0.16em] text-fest">LOCATION GUIDE</p>
      <h3 id="location-guide-title" className="mt-0.5 text-lg font-black text-ink">
        {indoor ? `${route.building}への行き方` : `${route.destination}への行き方`}
      </h3>
      <p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{route.instruction}</p>

      <div className="relative mt-3 overflow-hidden rounded-2xl border border-orange-100 bg-[#faf7ef] shadow-sm">
        <img
          src={`${import.meta.env.BASE_URL}images/campus-building-guide.png?v=4`}
          alt="生徒玄関から各校舎への案内図"
          className="h-auto w-full"
        />
        {buildingFocus && (
          <div
            className="building-focus pointer-events-none absolute rounded-xl border-[3px]"
            style={{
              '--building-focus-color': buildingFocus.color,
              borderColor: buildingFocus.color,
              left: `${buildingFocus.x}%`,
              top: `${buildingFocus.y}%`,
              width: `${buildingFocus.w}%`,
              height: `${buildingFocus.h}%`,
            }}
            aria-label={`目的地：${buildingFocus.label}`}
          >
            <span
              className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[115%] whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-black text-white shadow-md"
              style={{ backgroundColor: buildingFocus.color }}
            >
              目的地：{buildingFocus.label}
            </span>
          </div>
        )}
        {campusGuide && (
          <ImageMapPin
            x={stall.loc.x ?? 50}
            y={stall.loc.y ?? 50}
            color={category.color}
            emoji={pinEmojiForStall(stall)}
            selected
            animate
            delay={0.15}
            label={`${stall.name}の位置`}
            onClick={noop}
          />
        )}
      </div>

      {indoor ? (
        <>
          <div className="my-4 flex flex-col items-center" aria-label={`${route.building} ${route.floor}へ移動`}>
            <span className="text-2xl font-black leading-none text-fest" aria-hidden="true">↓</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.16em] text-fest">FLOOR MAP</p>
              <h3 className="text-lg font-black text-ink">{route.building} {route.floor}</h3>
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-[#fbf8ee] shadow-sm">
            {floorImage ? (
              <div className="relative w-full" style={{ aspectRatio: FLOOR_MAP_ASPECT_RATIOS[floorKey] || 16 / 9 }}>
                <img
                  src={`${import.meta.env.BASE_URL}${floorImage}`}
                  alt={`${route.building} ${route.floor}のフロアマップ`}
                  className="h-full w-full object-fill"
                />
                <ImageMapPin
                  x={((stall.loc.pinX ?? FLOOR_VIEW.w / 2) / FLOOR_VIEW.w) * 100}
                  y={((stall.loc.pinY ?? FLOOR_VIEW.h / 2) / FLOOR_VIEW.h) * 100}
                  color={category.color}
                  emoji={pinEmojiForStall(stall)}
                  selected
                  animate
                  delay={0.15}
                  label={`${stall.name}の位置`}
                  onClick={noop}
                />
              </div>
            ) : (
              <svg viewBox={`0 0 ${FLOOR_VIEW.w} ${FLOOR_VIEW.h}`} className="h-auto w-full" aria-label={`${route.building} ${route.floor}のフロアマップ`}>
                <FloorMap
                  buildingId={stall.loc.building}
                  floorId={stall.loc.floor}
                  selectedStallId={stall.id}
                  onPinTap={noop}
                />
              </svg>
            )}
          </div>
        </>
      ) : campusGuide ? null : (
        <>
          <div className="mt-5">
            <p className="text-[10px] font-black tracking-[0.16em] text-fest">CAMPUS MAP</p>
            <h3 className="text-lg font-black text-ink">敷地内の場所</h3>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-[#fbf8ee] shadow-sm">
            <svg viewBox={`0 0 ${CAMPUS.w} ${CAMPUS.h}`} className="h-auto w-full" aria-label={`${stall.name}の敷地内マップ`}>
              <IllustratedCampusMap
                selectedStallId={stall.id}
                onPinTap={noop}
              />
            </svg>
          </div>
        </>
      )}
    </section>
  )
}
