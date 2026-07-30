import { useCallback, useEffect, useMemo, useState } from 'react'
import { FESTIVAL, PARKING, isBeforeFestivalDay } from './config'
import { AppContext } from './lib/AppContext'
import { needSurvey, flushPendingSurveys } from './lib/survey'
import Splash from './components/Splash'
import Survey from './components/Survey'
import ExitSurvey from './components/ExitSurvey'
import TabBar from './components/TabBar'
import MapView from './components/map/MapView'
import StallList from './components/stalls/StallList'
import StallDetail from './components/stalls/StallDetail'
import Events from './components/Events'
import More, { VisitorGuide } from './components/More'
import PosterPreloader from './components/stalls/PosterPreloader'
import AdminEditor from './components/admin/AdminEditor'

export default function App() {
  const isExitSurveyUrl = new URLSearchParams(window.location.search).has('exit-survey')
  // 開催日かつ当日未回答の場合だけ survey → splash → app
  const [stage, setStage] = useState(() => {
    if (isExitSurveyUrl) return 'exit-survey'
    return needSurvey() ? 'survey' : 'app'
  })
  const [showPreVisitGuide, setShowPreVisitGuide] = useState(
    () => !isExitSurveyUrl && isBeforeFestivalDay(),
  )
  const [tab, setTab] = useState('map')
  const [detailId, setDetailId] = useState(null)
  const [mapTarget, setMapTarget] = useState(null)
  const [dataVersion, setDataVersion] = useState(0)
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['map']))
  const [editorOpen, setEditorOpen] = useState(false)
  const [mapEditorAvailable, setMapEditorAvailable] = useState(false)

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

  useEffect(() => {
    const media = window.matchMedia('(min-width: 1024px) and (pointer: fine)')
    const updateAvailability = () => {
      setMapEditorAvailable(media.matches)
      if (!media.matches) setEditorOpen(false)
    }
    updateAvailability()
    media.addEventListener('change', updateAvailability)
    return () => media.removeEventListener('change', updateAvailability)
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

  if (stage === 'survey') return <Survey onDone={() => setStage('splash')} />
  if (stage === 'splash') return <Splash onEnter={() => setStage('app')} />
  if (stage === 'exit-survey') return <ExitSurvey onDone={() => setStage('app')} />

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
            <More
              onOpenSurvey={() => setStage('survey')}
              onOpenExitSurvey={() => setStage('exit-survey')}
              onOpenMapEditor={() => {
                if (mapEditorAvailable) setEditorOpen(true)
              }}
              mapEditorAvailable={mapEditorAvailable}
            />
          </Section>
        )}
      </main>

      <PosterPreloader />
      {detailId && <StallDetail stallId={detailId} />}
      {showPreVisitGuide && (
        <PreVisitGuideModal onClose={() => setShowPreVisitGuide(false)} />
      )}
      {editorOpen && mapEditorAvailable && (
        <AdminEditor onClose={() => setEditorOpen(false)} />
      )}
    </AppContext.Provider>
  )
}

function PreVisitGuideModal({ onClose }) {
  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/45 p-3 backdrop-blur-[2px] sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pre-visit-guide-title"
    >
      <div className="max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-3xl bg-[#fffaf2] p-5 shadow-2xl">
        <div className="rounded-3xl bg-gradient-to-br from-fest to-fest2 px-5 py-5 text-white shadow-lg shadow-orange-200">
          <p className="text-[10px] font-black tracking-[0.2em] text-white/75">BEFORE YOUR VISIT</p>
          <h2 id="pre-visit-guide-title" className="mt-1 text-2xl font-black">ご来場案内</h2>
          <p className="mt-1 text-xs font-bold text-white/80">ご来場前にご確認ください</p>
        </div>

        <VisitorGuide />

        <div className="mt-3 rounded-2xl border border-teal-100 bg-white p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <span
              className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-teal-50 text-2xl"
              aria-hidden="true"
            >
              🅿️
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="mt-0.5 text-sm font-black text-ink">臨時駐車場：{PARKING.name}</h3>
              <p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{PARKING.address}</p>
              <a
                href={PARKING.googleMapUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex rounded-full bg-teal-600 px-4 py-2 text-xs font-black text-white shadow-sm transition-transform active:scale-95"
              >
                マップで見る ↗
              </a>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-gradient-to-r from-fest to-fest2 py-3.5 text-base font-black text-white shadow-lg shadow-orange-200 transition-transform active:scale-95"
        >
          確認しました
        </button>
      </div>
    </div>
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
