import { useRef, useState } from 'react'
import { CAMPUS } from '../../data/campus'
import { CATEGORIES } from '../../data/categories'
import { FLOOR_PLANS, FLOOR_VIEW } from '../../data/floors'
import { STALLS, replaceStalls } from '../../data/stalls'
import {
  downloadCsvTemplate,
  downloadText,
  menuToText,
  parseCsv,
  parseMenu,
  stallsToCsv,
} from '../../lib/festivalData'
import { readMapAnnotations, saveMapAnnotations } from '../../lib/mapEditorStorage'
import { CloseIcon } from '../Icons'
import FloorMap from '../map/FloorMap'
import MapEditor from '../map/MapEditor'

const ADMIN_PASSWORD = '1234'
const AUTH_KEY = 'festival-admin-auth'

const PIN_MAPS = [
  { key: 'grounds', label: '敷地内全体', type: 'out' },
  ...Object.entries(FLOOR_PLANS).flatMap(([building, plan]) =>
    plan.floors.map((floor) => ({
      key: `${building}-${floor.id}`,
      label: `${plan.name} ${floor.label}`,
      type: 'room',
      building,
      floor: floor.id,
    })),
  ),
]

export default function AdminEditor({ onClose }) {
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem(AUTH_KEY) === 'ok')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState('')
  const [showMapEditor, setShowMapEditor] = useState(false)
  const [stalls, setStalls] = useState(() => structuredClone(STALLS))
  const [mapKey, setMapKey] = useState('grounds')
  const [selectedId, setSelectedId] = useState(STALLS[0]?.id || '')
  const [message, setMessage] = useState('')
  const fileInput = useRef(null)
  const jsonInput = useRef(null)

  const selected = stalls.find((stall) => stall.id === selectedId)
  const map = PIN_MAPS.find((item) => item.key === mapKey) || PIN_MAPS[0]
  const mapStalls = stalls.filter((stall) => {
    if (map.type === 'out') return stall.loc.type === 'out'
    return stall.loc.type === 'room' && stall.loc.building === map.building && stall.loc.floor === map.floor
  })

  const authenticate = (event) => {
    event.preventDefault()
    if (password !== ADMIN_PASSWORD) {
      setAuthError('パスワードが違います')
      return
    }
    sessionStorage.setItem(AUTH_KEY, 'ok')
    setAuthenticated(true)
  }

  const updateSelected = (changes) => {
    setStalls((current) => current.map((stall) => stall.id === selectedId ? { ...stall, ...changes } : stall))
  }

  const placePin = (event) => {
    if (!selected) return
    const rect = event.currentTarget.getBoundingClientRect()
    const px = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width))
    const py = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height))
    setStalls((current) => current.map((stall) => {
      if (stall.id !== selected.id) return stall
      if (map.type === 'out') {
        return { ...stall, loc: { type: 'out', x: px * CAMPUS.w, y: py * CAMPUS.h } }
      }
      const floor = FLOOR_PLANS[map.building]?.floors.find((item) => item.id === map.floor)
      const room = stall.loc.type === 'room' && stall.loc.building === map.building && stall.loc.floor === map.floor
        ? stall.loc.room
        : floor?.rooms[0]?.id
      return {
        ...stall,
        loc: {
          type: 'room',
          building: map.building,
          floor: map.floor,
          room,
          pinX: px * FLOOR_VIEW.w,
          pinY: py * FLOOR_VIEW.h,
        },
      }
    }))
    setMessage(`${selected.name}のピン位置を変更しました（保存前）`)
  }

  const save = () => {
    replaceStalls(stalls)
    setMessage(`${stalls.length}件をこのブラウザに保存しました`)
  }

  const importCsv = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseCsv(reader.result)
        setStalls(imported)
        setSelectedId(imported[0]?.id || '')
        setMessage(`CSVから${imported.length}件を読み込みました。内容を確認して保存してください`)
      } catch (error) {
        setMessage(`CSVエラー: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  const exportJson = () => {
    const data = {
      version: 1,
      exportedAt: new Date().toISOString(),
      stalls,
      mapAnnotations: readMapAnnotations(),
    }
    downloadText('festival-admin-backup.json', JSON.stringify(data, null, 2), 'application/json')
  }

  const importJson = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.stalls)) throw new Error('stalls配列がありません')
        setStalls(data.stalls)
        setSelectedId(data.stalls[0]?.id || '')
        if (data.mapAnnotations) saveMapAnnotations(data.mapAnnotations)
        setMessage(`JSONから${data.stalls.length}件を復元しました。内容を確認して保存してください`)
      } catch (error) {
        setMessage(`JSONエラー: ${error.message}`)
      }
    }
    reader.readAsText(file)
  }

  if (!authenticated) {
    return (
      <div className="fixed inset-0 z-[100] grid place-items-center bg-black/55 p-5 backdrop-blur-sm">
        <form onSubmit={authenticate} className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-black tracking-wider text-fest">ADMIN LOGIN</p>
              <h2 className="text-xl font-black text-ink">管理者編集</h2>
            </div>
            <button type="button" onClick={onClose} className="rounded-full bg-stone-100 p-2 text-stone-500" aria-label="閉じる">
              <CloseIcon width="18" height="18" />
            </button>
          </div>
          <label className="mt-5 block text-xs font-black text-stone-500">
            パスワード
            <input type="password" inputMode="numeric" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-2xl border border-stone-200 px-4 py-3 text-lg font-black outline-none focus:border-fest" autoFocus />
          </label>
          {authError && <p className="mt-2 text-xs font-black text-red-600">{authError}</p>}
          <button type="submit" className="mt-4 w-full rounded-full bg-fest py-3 text-sm font-black text-white">ログイン</button>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-[10px] font-bold leading-relaxed text-amber-800">
            このパスワードは簡易ロックです。公開サイトのソースから確認できるため、個人情報や機密情報は保存しないでください。
          </p>
        </form>
      </div>
    )
  }

  if (showMapEditor) return <MapEditor onClose={() => setShowMapEditor(false)} />

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f1e3]">
      <header className="flex shrink-0 items-center gap-2 border-b border-orange-100 bg-white px-3 py-2">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black tracking-wider text-fest">ADMIN EDITOR</p>
          <h2 className="truncate text-base font-black text-ink">模擬店・ピン管理</h2>
        </div>
        <button type="button" onClick={() => setShowMapEditor(true)} className="rounded-full bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-600">校内図編集</button>
        <button type="button" onClick={onClose} className="rounded-full bg-stone-100 p-2 text-stone-500" aria-label="閉じる"><CloseIcon width="18" height="18" /></button>
      </header>

      <div className="shrink-0 border-b border-orange-100 bg-white px-3 py-2">
        <div className="flex gap-2 overflow-x-auto [scrollbar-width:none]">
          <button type="button" onClick={() => fileInput.current?.click()} className="shrink-0 rounded-full bg-emerald-50 px-3 py-2 text-[10px] font-black text-emerald-700">CSV読込</button>
          <button type="button" onClick={() => downloadText('festival-stalls.csv', stallsToCsv(stalls), 'text/csv;charset=utf-8')} className="shrink-0 rounded-full bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-600">CSV出力</button>
          <button type="button" onClick={downloadCsvTemplate} className="shrink-0 rounded-full bg-stone-100 px-3 py-2 text-[10px] font-black text-stone-600">CSV見本</button>
          <button type="button" onClick={exportJson} className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-700">JSONバックアップ</button>
          <button type="button" onClick={() => jsonInput.current?.click()} className="shrink-0 rounded-full bg-blue-50 px-3 py-2 text-[10px] font-black text-blue-700">JSON復元</button>
          <button type="button" onClick={save} className="shrink-0 rounded-full bg-fest px-4 py-2 text-[10px] font-black text-white">保存する</button>
        </div>
        <input ref={fileInput} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => importCsv(event.target.files?.[0])} />
        <input ref={jsonInput} type="file" accept=".json,application/json" className="hidden" onChange={(event) => importJson(event.target.files?.[0])} />
        {message && <p className="mt-2 text-[10px] font-bold text-stone-500">{message}</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 md:flex-row md:gap-4">
        <main className="min-h-[55dvh] flex-1">
          <div className="mb-2 flex gap-2 overflow-x-auto [scrollbar-width:none]">
            {PIN_MAPS.map((item) => (
              <button key={item.key} type="button" onClick={() => setMapKey(item.key)} className={`shrink-0 rounded-full px-3 py-2 text-[10px] font-black ${mapKey === item.key ? 'bg-ink text-white' : 'bg-white text-stone-500'}`}>{item.label}</button>
            ))}
          </div>
          <p className="mb-2 rounded-xl bg-orange-50 px-3 py-2 text-[10px] font-black text-orange-800">
            店舗を選び、地図上の置きたい位置をタップしてください。
          </p>
          <PinCanvas map={map} stalls={mapStalls} selectedId={selectedId} onPlace={placePin} />
        </main>

        <aside className="mt-3 shrink-0 rounded-2xl bg-white p-4 shadow-sm md:mt-0 md:w-80">
          <label className="text-[10px] font-black text-stone-400">
            編集する模擬店（{stalls.length}件）
            <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-black outline-none">
              {stalls.map((stall) => <option key={stall.id} value={stall.id}>{stall.name}（{stall.org}）</option>)}
            </select>
          </label>
          {selected && (
            <div className="mt-3 space-y-3">
              <AdminField label="店名" value={selected.name} onChange={(name) => updateSelected({ name })} />
              <AdminField label="クラス・団体" value={selected.org} onChange={(org) => updateSelected({ org })} />
              <label className="block text-[10px] font-black text-stone-400">
                カテゴリ
                <select value={selected.cat} onChange={(event) => updateSelected({ cat: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-black">
                  {Object.entries(CATEGORIES).map(([id, category]) => <option key={id} value={id}>{category.emoji} {category.label}</option>)}
                </select>
              </label>
              <label className="block text-[10px] font-black text-stone-400">
                メニュー（1店舗につき1つ）
                <input key={selected.id} defaultValue={menuToText(selected.menu)} onBlur={(event) => updateSelected({ menu: parseMenu(event.target.value) })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-bold outline-none focus:border-fest" />
              </label>
              <label className="block text-[10px] font-black text-stone-400">
                紹介文
                <textarea value={selected.pr} onChange={(event) => updateSelected({ pr: event.target.value })} rows="3" className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-xs font-bold outline-none focus:border-fest" />
              </label>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function PinCanvas({ map, stalls, selectedId, onPlace }) {
  const aspectRatio = map.type === 'out' ? `${CAMPUS.w} / ${CAMPUS.h}` : `${FLOOR_VIEW.w} / ${FLOOR_VIEW.h}`
  return (
    <div onClick={onPlace} className="relative mx-auto w-full cursor-crosshair overflow-hidden rounded-2xl border-2 border-fest bg-white shadow-inner" style={{ aspectRatio }}>
      {map.type === 'out' ? (
        <img src={`${import.meta.env.BASE_URL}images/campus-overall.png`} alt="敷地内全体" className="pointer-events-none h-full w-full object-cover" />
      ) : (
        <svg viewBox={`0 0 ${FLOOR_VIEW.w} ${FLOOR_VIEW.h}`} className="pointer-events-none h-full w-full">
          <FloorMap buildingId={map.building} floorId={map.floor} onPinTap={() => {}} showPins={false} />
        </svg>
      )}
      {stalls.map((stall) => {
        const x = map.type === 'out' ? stall.loc.x / CAMPUS.w * 100 : (stall.loc.pinX ?? FLOOR_VIEW.w / 2) / FLOOR_VIEW.w * 100
        const y = map.type === 'out' ? stall.loc.y / CAMPUS.h * 100 : (stall.loc.pinY ?? FLOOR_VIEW.h / 2) / FLOOR_VIEW.h * 100
        return (
          <button key={stall.id} type="button" onClick={(event) => event.stopPropagation()} className={`absolute grid h-7 w-7 -translate-x-1/2 -translate-y-full place-items-center rounded-full border-2 text-sm shadow-md ${stall.id === selectedId ? 'z-10 border-white bg-fest ring-4 ring-orange-300' : 'border-white bg-ink'}`} style={{ left: `${x}%`, top: `${y}%` }} title={stall.name}>
            📍
          </button>
        )
      })}
    </div>
  )
}

function AdminField({ label, value, onChange }) {
  return (
    <label className="block text-[10px] font-black text-stone-400">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-black outline-none focus:border-fest" />
    </label>
  )
}
