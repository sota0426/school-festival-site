import { useState } from 'react'
import { FESTIVAL } from '../config'
import Access from './Access'
import { BackIcon } from './Icons'

const MENU = [
  { id: 'access', emoji: '🚗', title: '交通・アクセス', description: '駐車場、バス、電車での来場案内', color: 'from-blue-50 to-cyan-50' },
  { id: 'quest', emoji: '🔎', title: 'フロア謎探し', description: '校舎を巡って謎を見つけよう', color: 'from-violet-50 to-fuchsia-50' },
  { id: 'guide', emoji: 'ℹ️', title: 'ご来場案内', description: '開催時間や校内での注意事項', color: 'from-orange-50 to-amber-50' },
]

export default function More() {
  const [page, setPage] = useState(null)

  if (page === 'access') return <SubPage title="交通・アクセス" onBack={() => setPage(null)}><Access /></SubPage>
  if (page === 'quest') return <SubPage title="フロア謎探し" onBack={() => setPage(null)}><FloorQuest /></SubPage>
  if (page === 'guide') return <SubPage title="ご来場案内" onBack={() => setPage(null)}><VisitorGuide /></SubPage>

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
      <div className="rounded-3xl bg-gradient-to-br from-fest to-fest2 px-5 py-5 text-white shadow-lg shadow-orange-200">
        <p className="text-[10px] font-black tracking-[0.2em] text-white/75">MORE</p>
        <h2 className="mt-1 text-xl font-black">その他のメニュー</h2>
        <p className="mt-1 text-xs font-bold text-white/80">アクセス、企画、公式情報はこちら</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {MENU.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPage(item.id)}
            className={`fade-up min-h-36 rounded-3xl bg-gradient-to-br ${item.color} p-4 text-left shadow-sm transition-transform active:scale-95`}
            style={{ animationDelay: `${index * 0.07}s` }}
          >
            <span className="text-3xl">{item.emoji}</span>
            <h3 className="mt-3 text-sm font-black text-ink">{item.title}</h3>
            <p className="mt-1 text-[10px] font-bold leading-relaxed text-stone-500">{item.description}</p>
          </button>
        ))}

        <a
          href={FESTIVAL.instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="fade-up min-h-36 rounded-3xl bg-gradient-to-br from-pink-50 via-purple-50 to-orange-50 p-4 text-left shadow-sm transition-transform active:scale-95"
          style={{ animationDelay: '0.21s' }}
        >
          <span className="text-3xl">📸</span>
          <h3 className="mt-3 text-sm font-black text-ink">公式Instagram</h3>
          <p className="mt-1 text-[10px] font-bold leading-relaxed text-stone-500">最新情報や当日の様子を見る ↗</p>
        </a>
      </div>
    </div>
  )
}

function SubPage({ title, onBack, children }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b border-orange-100 bg-white px-4 py-3">
        <button type="button" onClick={onBack} className="rounded-full bg-stone-100 p-2 text-stone-600 active:scale-90" aria-label="その他のメニューへ戻る">
          <BackIcon width="18" height="18" />
        </button>
        <h2 className="text-base font-black text-ink">{title}</h2>
      </header>
      {children}
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
    <div className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
      <div className="rounded-2xl bg-violet-600 p-4 text-white">
        <p className="text-xs font-bold text-violet-200">見つけた謎</p>
        <p className="mt-1 text-3xl font-black">{found.length} / {clues.length}</p>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/20"><div className="h-full rounded-full bg-white transition-all" style={{ width: `${(found.length / clues.length) * 100}%` }} /></div>
      </div>
      <div className="mt-4 space-y-3">
        {clues.map((item) => {
          const complete = found.includes(item.id)
          return (
            <button key={item.id} type="button" onClick={() => setFound((current) => complete ? current.filter((id) => id !== item.id) : [...current, item.id])} className={`w-full rounded-2xl border p-4 text-left transition-all ${complete ? 'border-violet-300 bg-violet-50' : 'border-stone-200 bg-white'}`}>
              <div className="flex items-center gap-3">
                <span className={`grid h-9 w-9 place-items-center rounded-full font-black ${complete ? 'bg-violet-600 text-white' : 'bg-stone-100 text-stone-400'}`}>{complete ? '✓' : item.id}</span>
                <div><p className="text-xs font-black text-ink">{item.floor}</p><p className="mt-0.5 text-[11px] font-bold text-stone-500">{item.clue}</p></div>
              </div>
            </button>
          )
        })}
      </div>
      <p className="mt-4 text-center text-[10px] font-bold text-stone-400">現在はサンプル問題です。正式な謎へ差し替えられます</p>
    </div>
  )
}

function VisitorGuide() {
  return (
    <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-8 pt-4">
      <GuideRow emoji="🕘" title="開催時間" text={`${FESTIVAL.openHours}（${FESTIVAL.dateLabel}）`} />
      <GuideRow emoji="👟" title="上履き" text="上履きは不要です。校舎内もそのまま入れます" />
      <GuideRow emoji="🥤" title="熱中症対策" text="こまめな水分補給と休憩をお願いします" />
      <GuideRow emoji="🩹" title="体調不良" text="中央校舎1Fの保健室へお声がけください" />
      <GuideRow emoji="❓" title="落とし物・迷子" text="中央校舎1F、生徒玄関の本部までお越しください" />
    </div>
  )
}

function GuideRow({ emoji, title, text }) {
  return <div className="flex gap-3 rounded-2xl bg-white p-4 shadow-sm"><span className="text-2xl">{emoji}</span><div><h3 className="text-sm font-black text-ink">{title}</h3><p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{text}</p></div></div>
}
