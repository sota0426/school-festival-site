import { useEffect, useMemo, useState } from 'react'
import { FESTIVAL } from './config'
import { AppContext } from './lib/AppContext'
import { needSurvey, flushPendingSurveys } from './lib/survey'
import Splash from './components/Splash'
import Survey from './components/Survey'
import TabBar from './components/TabBar'
import MapView from './components/map/MapView'
import StallList from './components/stalls/StallList'
import StallDetail from './components/stalls/StallDetail'
import Timetable from './components/Timetable'
import Access from './components/Access'

export default function App() {
  // splash → survey → app(アンケート回答済みなら直接app)
  const [stage, setStage] = useState(() => (needSurvey() ? 'splash' : 'app'))
  const [tab, setTab] = useState('map')
  const [detailId, setDetailId] = useState(null)
  const [mapTarget, setMapTarget] = useState(null)

  useEffect(() => {
    flushPendingSurveys()
  }, [])

  const ctx = useMemo(
    () => ({
      openDetail: (id) => setDetailId(id),
      closeDetail: () => setDetailId(null),
      showOnMap: (target) => {
        setDetailId(null)
        setTab('map')
        setMapTarget({ ...target, ts: Date.now() })
      },
      setTab,
    }),
    [],
  )

  if (stage === 'splash') return <Splash onEnter={() => setStage('survey')} />
  if (stage === 'survey') return <Survey onDone={() => setStage('app')} />

  return (
    <AppContext.Provider value={ctx}>
      {/* ヘッダー */}
      <header className="flex shrink-0 items-center justify-between border-b border-orange-100 bg-white/90 px-4 py-2.5 backdrop-blur">
        <h1 className="bg-gradient-to-r from-fest to-fest2 bg-clip-text text-lg font-black text-transparent">
          {FESTIVAL.name}
        </h1>
        <span className="rounded-full bg-orange-50 px-3 py-1 text-[11px] font-black text-fest">
          {FESTIVAL.dateLabel}
        </span>
      </header>

      {/* コンテンツ(タブはすべてマウントしたまま切替=マップの状態を保持) */}
      <main className="relative min-h-0 flex-1">
        <Section active={tab === 'map'}>
          <MapView mapTarget={mapTarget} />
        </Section>
        <Section active={tab === 'stalls'}>
          <StallList />
        </Section>
        <Section active={tab === 'timetable'}>
          <Timetable />
        </Section>
        <Section active={tab === 'access'}>
          <Access />
        </Section>
      </main>

      <TabBar tab={tab} onChange={setTab} />

      {detailId && <StallDetail stallId={detailId} />}
    </AppContext.Provider>
  )
}

function Section({ active, children }) {
  return (
    <div
      className={`absolute inset-0 flex flex-col transition-all duration-300 ${
        active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0'
      }`}
      aria-hidden={!active}
    >
      {children}
    </div>
  )
}
