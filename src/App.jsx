import { useCallback, useEffect, useMemo, useState } from 'react'
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
import PosterPreloader from './components/stalls/PosterPreloader'

export default function App() {
  // splash → survey → app(アンケート回答済みなら直接app)
  const [stage, setStage] = useState(() => (needSurvey() ? 'splash' : 'app'))
  const [tab, setTab] = useState('map')
  const [detailId, setDetailId] = useState(null)
  const [mapTarget, setMapTarget] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['map']))

  const activateTab = useCallback((nextTab) => {
    setTab(nextTab)
    setVisitedTabs((current) => {
      if (current.has(nextTab)) return current
      const next = new Set(current)
      next.add(nextTab)
      return next
    })
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document.querySelectorAll(`[data-tab-scroll="${nextTab}"]`).forEach((element) => {
          element.scrollTo({ top: 0, left: 0, behavior: 'auto' })
        })
      })
    })
  }, [])

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
        activateTab('map')
        setMapTarget({ ...target, ts: Date.now() })
      },
      setTab: activateTab,
    }),
    [activateTab],
  )

  if (stage === 'splash') return <Splash onEnter={() => setStage('survey')} />
  if (stage === 'survey') return <Survey onDone={() => setStage('app')} />

  return (
    <AppContext.Provider value={ctx}>
      {/* ヘッダー */}
      <header className="flex shrink-0 items-center gap-2 border-b border-orange-100 bg-white/90 px-2 py-1.5 pt-2 backdrop-blur">
        <button
          type="button"
          onClick={() => {
            activateTab('map')
            setMapTarget({ type: 'point', ts: Date.now() })
          }}
          className="shrink-0 bg-gradient-to-r from-fest to-fest2 bg-clip-text px-1 text-xl font-black text-transparent transition-transform active:scale-95"
          aria-label="鶴東祭 キャンパスマップへ戻る"
        >
          {FESTIVAL.name}
        </button>
        <TabBar tab={tab} onChange={activateTab} />
      </header>

      {/* コンテンツ(タブはすべてマウントしたまま切替=マップの状態を保持) */}
      <main className="relative min-h-0 flex-1">
        <Section active={tab === 'map'}>
          <MapView mapTarget={mapTarget} dataVersion={dataVersion} />
        </Section>
        {visitedTabs.has('stalls') && (
          <Section active={tab === 'stalls'}>
            <StallList dataVersion={dataVersion} />
          </Section>
        )}
        {visitedTabs.has('events') && (
          <Section active={tab === 'events'}>
            <Events />
          </Section>
        )}
        {visitedTabs.has('more') && (
          <Section active={tab === 'more'}>
            <More />
          </Section>
        )}
      </main>

      <PosterPreloader />
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
