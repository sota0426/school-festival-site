import { CAMPUS } from '../../data/campus'
import { CATEGORIES, pinEmojiForStall } from '../../data/categories'
import { outdoorStalls } from '../../data/stalls'
import Pin from './Pin'

export default function IllustratedCampusMap({ filter, selectedStallId, animationKey, onPinTap }) {
  const stalls = outdoorStalls().filter((stall) => !filter || stall.cat === filter)

  return (
    <>
      <image
        href={`${import.meta.env.BASE_URL}images/campus-overall.png`}
        x="0"
        y="0"
        width={CAMPUS.w}
        height={CAMPUS.h}
        preserveAspectRatio="xMidYMid slice"
      />
      {stalls.map((stall, index) => (
        <Pin
          key={`${stall.id}-${animationKey || 'default'}`}
          x={stall.loc.x}
          y={stall.loc.y}
          color={CATEGORIES[stall.cat].color}
          emoji={pinEmojiForStall(stall)}
          selected={selectedStallId === stall.id}
          animate={animationKey !== 'inactive'}
          delay={0.12 * index}
          onTap={(event) => {
            event.stopPropagation()
            onPinTap(stall)
          }}
        />
      ))}
    </>
  )
}
