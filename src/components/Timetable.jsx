import { useEffect, useState } from 'react'
import { VENUES, EVENTS } from '../data/events'
import { FESTIVAL, isFestivalDay } from '../config'

const toMin = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function useNowMinutes() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  return { minutes: now.getHours() * 60 + now.getMinutes(), festivalDay: isFestivalDay(now) }
}

function statusOf(ev, minutes, festivalDay) {
  if (!festivalDay) return 'upcoming'
  if (minutes >= toMin(ev.start) && minutes < toMin(ev.end)) return 'now'
  if (minutes >= toMin(ev.end)) return 'past'
  if (toMin(ev.start) - minutes <= 30) return 'soon'
  return 'upcoming'
}

export default function Timetable() {
  const { minutes, festivalDay } = useNowMinutes()

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-6">
      <div className="fade-up mt-3 rounded-2xl bg-gradient-to-r from-fest to-fest2 px-5 py-4 text-white shadow-md">
        <p className="text-xs font-bold opacity-90">イベントタイムテーブル</p>
        <p className="text-lg font-black">
          {FESTIVAL.dateLabel} <span className="text-sm font-bold">{FESTIVAL.openHours}</span>
        </p>
        {!festivalDay && (
          <p className="mt-1 text-[11px] opacity-90">当日は進行中のイベントがここで光ります✨</p>
        )}
      </div>

      {VENUES.map((venue, vi) => {
        const events = EVENTS.filter((e) => e.venue === venue.id)
        return (
          <section key={venue.id} className="fade-up mt-5" style={{ animationDelay: `${0.1 + vi * 0.08}s` }}>
            <h2 className="flex items-center gap-2 text-base font-black text-ink">
              <span>{venue.emoji}</span>
              {venue.name}
              <span className="text-[11px] font-bold text-stone-400">({venue.place})</span>
            </h2>
            <div className="mt-2 space-y-2">
              {events.map((ev) => {
                const st = statusOf(ev, minutes, festivalDay)
                return (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-sm transition-all ${
                      st === 'now'
                        ? 'bg-white ring-2 ring-fest'
                        : st === 'past'
                          ? 'bg-white/60 opacity-55'
                          : 'bg-white'
                    }`}
                  >
                    <div className="w-[76px] shrink-0 text-center">
                      <p className="text-sm font-black text-ink">{ev.start}</p>
                      <p className="text-[10px] font-bold text-stone-400">〜{ev.end}</p>
                    </div>
                    <span className="h-8 w-px bg-stone-200" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-black leading-snug text-ink">{ev.title}</p>
                      <p className="text-[11px] text-stone-500">{ev.by}</p>
                    </div>
                    {st === 'now' && (
                      <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-fest px-2.5 py-1 text-[10px] font-black text-white">
                        <span className="live-dot inline-block h-1.5 w-1.5 rounded-full bg-white" />
                        開催中
                      </span>
                    )}
                    {st === 'soon' && (
                      <span className="shrink-0 rounded-full bg-fest2/15 px-2.5 py-1 text-[10px] font-black text-fest2">
                        まもなく
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
