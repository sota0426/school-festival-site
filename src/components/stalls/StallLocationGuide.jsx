import { CAMPUS } from '../../data/campus'
import { DEFAULT_FLOOR_MAPS, FLOOR_VIEW } from '../../data/floors'
import { routeForStall } from '../../data/routes'
import IllustratedCampusMap from '../map/IllustratedCampusMap'
import FloorMap from '../map/FloorMap'

const noop = () => {}

export default function StallLocationGuide({ stall }) {
  const route = routeForStall(stall)
  const indoor = route.type === 'indoor'
  const campusGuide = route.type === 'guide'
  const floorKey = indoor ? `${stall.loc.building}-${stall.loc.floor}` : null
  const floorImage = floorKey ? DEFAULT_FLOOR_MAPS[floorKey] : null

  return (
    <section className="mt-6 border-t border-orange-100 pt-5" aria-labelledby="location-guide-title">
      <p className="text-[10px] font-black tracking-[0.16em] text-fest">LOCATION GUIDE</p>
      <h3 id="location-guide-title" className="mt-0.5 text-lg font-black text-ink">
        {indoor ? `${route.building}への行き方` : `${route.destination}への行き方`}
      </h3>
      <p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{route.instruction}</p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-orange-100 bg-[#faf7ef] shadow-sm">
        <img
          src={`${import.meta.env.BASE_URL}images/campus-building-guide.png?v=4`}
          alt="生徒玄関から各校舎への案内図"
          className="h-auto w-full"
        />
      </div>

      {indoor ? (
        <>
          <div className="mt-5 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[0.16em] text-fest">FLOOR MAP</p>
              <h3 className="text-lg font-black text-ink">{route.building} {route.floor}</h3>
            </div>
          </div>
          <div className="mt-2 overflow-hidden rounded-2xl border border-stone-200 bg-[#fbf8ee] shadow-sm">
            {floorImage ? (
              <div className="relative aspect-video w-full">
                <img
                  src={`${import.meta.env.BASE_URL}${floorImage}`}
                  alt={`${route.building} ${route.floor}のフロアマップ`}
                  className="h-full w-full object-contain"
                />
                <span
                  className="absolute grid h-8 w-8 -translate-x-1/2 -translate-y-full place-items-center rounded-full border-2 border-white bg-fest text-base shadow-md"
                  style={{
                    left: `${((stall.loc.pinX ?? FLOOR_VIEW.w / 2) / FLOOR_VIEW.w) * 100}%`,
                    top: `${((stall.loc.pinY ?? FLOOR_VIEW.h / 2) / FLOOR_VIEW.h) * 100}%`,
                  }}
                  aria-label={`${stall.name}の位置`}
                >
                  📍
                </span>
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
