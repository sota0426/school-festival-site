import { useState } from 'react'
import Timetable from './Timetable'

export default function Events() {
  return (
    <div data-tab-scroll="events" className="flex-1 overflow-y-auto px-4 pb-8">
      <Timetable className="" />
      <section className="mt-8 border-t border-violet-100 pt-6" aria-labelledby="floor-quest-title">
        <p className="text-[10px] font-black tracking-[0.18em] text-violet-500">FLOOR QUEST</p>
        <h2 id="floor-quest-title" className="mt-0.5 text-xl font-black text-ink">🔎 フロア謎探し</h2>
        <p className="mb-3 mt-1 text-xs font-bold text-stone-500">校舎を巡って、隠された謎を見つけよう</p>
        <FloorQuest />
      </section>
    </div>
  )
}

function FloorQuest() {
  const [found, setFound] = useState([])
  const clues = [
    { id: 1, floor: '中央校舎 1F', clue: '生徒玄関の近くにある「祭」の文字を探そう' },
    { id: 2, floor: '北校舎 2F', clue: '一番北にある教室の近くを調べよう' },
    { id: 3, floor: '南校舎 4F', clue: '最上階に隠されたマークを見つけよう' },
  ]

  return (
    <div>
      <div className="rounded-2xl bg-violet-600 p-4 text-white shadow-sm">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-bold text-violet-200">見つけた謎</p>
            <p className="mt-1 text-3xl font-black">{found.length} / {clues.length}</p>
          </div>
          <span className="text-4xl" aria-hidden="true">🗝️</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20">
          <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(found.length / clues.length) * 100}%` }} />
        </div>
      </div>
      <div className="mt-3 space-y-3">
        {clues.map((item) => {
          const complete = found.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setFound((current) => complete ? current.filter((id) => id !== item.id) : [...current, item.id])}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${complete ? 'border-violet-300 bg-violet-50' : 'border-stone-200 bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-black ${complete ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{complete ? '✓' : item.id}</span>
                <div>
                  <p className="text-xs font-black text-ink">{item.floor}</p>
                  <p className="mt-0.5 text-[11px] font-bold text-stone-500">{item.clue}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-[10px] font-bold text-stone-400">現在はサンプル問題です。正式な謎へ差し替えられます</p>
    </div>
  )
}
