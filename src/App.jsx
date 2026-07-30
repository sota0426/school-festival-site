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
import Events from './components/Events'
import More from './components/More'

export default function App() {
  // splash → survey → app(アンケート回答済みなら直接app)
  const [stage, setStage] = useState(() => (needSurvey() ? 'splash' : 'app'))
  const [tab, setTab] = useState('map')
  const [detailId, setDetailId] = useState(null)
  const [mapTarget, setMapTarget] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)

  useEffect(() => {
    flushPendingSurveys()
    const refreshData = () => setDataVersion((version) => version + 1)
    window.addEventListener('festival-data-save', refreshData)
    return () => window.removeEventListener('festival-data-save', refreshData)
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
      <header className="flex shrink-0 items-center gap-2 border-b border-orange-100 bg-white/90 px-2 py-1.5 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            setTab('map')
            setMapTarget({ type: 'point', ts: Date.now() })
          }}
          className="shrink-0 bg-gradient-to-r from-fest to-fest2 bg-clip-text px-1 text-xl font-black text-transparent transition-transform active:scale-95"
          aria-label="鶴東祭 キャンパスマップへ戻る"
        >
          {FESTIVAL.name}
        </button>
        <TabBar tab={tab} onChange={setTab} />
      </header>

      {/* コンテンツ(タブはすべてマウントしたまま切替=マップの状態を保持) */}
      <main className="relative min-h-0 flex-1">
        <Section active={tab === 'map'}>
          <MapView mapTarget={mapTarget} dataVersion={dataVersion} />
        </Section>
        <Section active={tab === 'stalls'}>
          <StallList dataVersion={dataVersion} />
        </Section>
        <Section active={tab === 'events'}>
          <Events />
        </Section>
        <Section active={tab === 'more'}>
          <More />
        </Section>
      </main>

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
