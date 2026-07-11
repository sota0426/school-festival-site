import { useEffect, useMemo, useRef, useState } from 'react'
import { FLOOR_PLANS } from '../../data/floors'
import { imageFromDb, readMapAnnotations, saveImageToDb, saveMapAnnotations } from '../../lib/mapEditorStorage'
import { CloseIcon } from '../Icons'

const MAPS = [
  { key: 'grounds', label: '敷地内全体' },
  { key: 'campus', label: '校舎全体' },
  ...Object.entries(FLOOR_PLANS).flatMap(([buildingId, plan]) =>
    plan.floors.map((floor) => ({ key: `${buildingId}-${floor.id}`, label: `${plan.name} ${floor.label}` })),
  ),
]

export default function MapEditor({ onClose }) {
  const [mapKey, setMapKey] = useState('grounds')
  const [allAnnotations, setAllAnnotations] = useState(readMapAnnotations)
  const [imageUrl, setImageUrl] = useState(null)
  const [selectedId, setSelectedId] = useState(null)
  const [addMode, setAddMode] = useState(false)
  const [saved, setSaved] = useState(true)
  const canvas = useRef(null)
  const drag = useRef(null)

  const annotations = allAnnotations[mapKey] || []
  const selected = annotations.find((item) => item.id === selectedId)
  const mapLabel = MAPS.find((item) => item.key === mapKey)?.label

  useEffect(() => {
    let active = true
    imageFromDb(mapKey).then((value) => {
      if (active) setImageUrl(value || (mapKey === 'campus' ? '/images/campus-building-guide-dummy.png' : null))
    })
    return () => { active = false }
  }, [mapKey])

  const setAnnotations = (next) => {
    setAllAnnotations((current) => ({ ...current, [mapKey]: typeof next === 'function' ? next(current[mapKey] || []) : next }))
    setSaved(false)
  }

  const updateSelected = (changes) => {
    setAnnotations((items) => items.map((item) => item.id === selectedId ? { ...item, ...changes } : item))
  }

  const pointInCanvas = (event) => {
    const rect = canvas.current.getBoundingClientRect()
    return {
      x: Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100)),
    }
  }

  const addRoom = (event) => {
    if (!addMode || event.target.closest('[data-annotation]')) return
    const point = pointInCanvas(event)
    const room = {
      id: `room-${Date.now()}`,
      name: `教室 ${annotations.length + 1}`,
      x: Math.max(0, point.x - 8),
      y: Math.max(0, point.y - 5),
      w: 16,
      h: 10,
    }
    setAnnotations((items) => [...items, room])
    setSelectedId(room.id)
    setAddMode(false)
  }

  const startDrag = (event, item) => {
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    setSelectedId(item.id)
    drag.current = { id: item.id, start: pointInCanvas(event), x: item.x, y: item.y }
  }

  const moveDrag = (event) => {
    if (!drag.current) return
    const point = pointInCanvas(event)
    const current = annotations.find((item) => item.id === drag.current.id)
    if (!current) return
    const x = Math.max(0, Math.min(100 - current.w, drag.current.x + point.x - drag.current.start.x))
    const y = Math.max(0, Math.min(100 - current.h, drag.current.y + point.y - drag.current.start.y))
    setAnnotations((items) => items.map((item) => item.id === current.id ? { ...item, x, y } : item))
  }

  const save = () => {
    saveMapAnnotations(allAnnotations)
    window.dispatchEvent(new CustomEvent('festival-map-editor-save', { detail: allAnnotations }))
    setSaved(true)
  }

  const uploadImage = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      await saveImageToDb(mapKey, reader.result)
      setImageUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(allAnnotations, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'festival-map-annotations.json'
    link.click()
    URL.revokeObjectURL(url)
  }

  const mapOptions = useMemo(() => MAPS, [])

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-[#f4f1e3]">
      <header className="flex shrink-0 items-center gap-3 border-b border-orange-100 bg-white px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black tracking-wider text-fest">MAP EDITOR</p>
          <h2 className="truncate text-base font-black text-ink">校内マップを編集</h2>
        </div>
        <button type="button" onClick={() => { if (!saved) save(); onClose() }} aria-label="編集画面を閉じる" className="rounded-full bg-stone-100 p-2 text-stone-500">
          <CloseIcon width="20" height="20" />
        </button>
      </header>

      <div className="flex shrink-0 gap-2 overflow-x-auto bg-white px-3 pb-3 [scrollbar-width:none]">
        {mapOptions.map((map) => (
          <button
            key={map.key}
            type="button"
            onClick={() => { setMapKey(map.key); setSelectedId(null); setAddMode(false) }}
            className={`shrink-0 rounded-full px-3 py-2 text-xs font-black ${mapKey === map.key ? 'bg-ink text-white' : 'bg-stone-100 text-stone-500'}`}
          >
            {map.label}
          </button>
        ))}
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-3 md:flex-row md:gap-4">
        <main className="min-h-[52dvh] flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-full bg-white px-3 py-2 text-xs font-black text-stone-600 shadow-sm">
              🖼 画像を選択
              <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(event.target.files?.[0])} />
            </label>
            <button type="button" onClick={() => setAddMode((value) => !value)} className={`rounded-full px-3 py-2 text-xs font-black shadow-sm ${addMode ? 'bg-fest text-white' : 'bg-white text-stone-600'}`}>
              {addMode ? '画像上をタップ' : '＋ 教室を追加'}
            </button>
            <span className="text-[10px] font-bold text-stone-400">{mapLabel} · {annotations.length}教室</span>
          </div>

          <div
            ref={canvas}
            onPointerDown={addRoom}
            onPointerMove={moveDrag}
            onPointerUp={() => { drag.current = null }}
            onPointerCancel={() => { drag.current = null }}
            className={`relative mx-auto aspect-[4/3] max-h-[65dvh] w-full overflow-hidden rounded-2xl border-2 bg-white shadow-inner ${addMode ? 'cursor-crosshair border-fest' : 'border-stone-200'}`}
          >
            {imageUrl ? (
              <img src={imageUrl} alt={`${mapLabel}の編集用背景`} className="pointer-events-none h-full w-full object-contain" />
            ) : (
              <div className="grid h-full place-items-center px-8 text-center text-sm font-bold text-stone-400">「画像を選択」から{mapLabel}の地図を登録してください</div>
            )}
            {annotations.map((item) => (
              <button
                key={item.id}
                type="button"
                data-annotation
                onPointerDown={(event) => startDrag(event, item)}
                className={`absolute touch-none overflow-hidden rounded-md border-2 bg-orange-100/75 px-1 text-[10px] font-black text-ink backdrop-blur-[1px] ${selectedId === item.id ? 'z-10 border-fest ring-2 ring-white' : 'border-orange-400'}`}
                style={{ left: `${item.x}%`, top: `${item.y}%`, width: `${item.w}%`, height: `${item.h}%` }}
              >
                {item.name}
              </button>
            ))}
          </div>
        </main>

        <aside className="mt-3 shrink-0 rounded-2xl bg-white p-4 shadow-sm md:mt-9 md:w-72">
          {selected ? (
            <div className="space-y-3">
              <div>
                <label htmlFor="room-name" className="text-[10px] font-black text-stone-400">教室名</label>
                <input id="room-name" value={selected.name} onChange={(event) => updateSelected({ name: event.target.value })} className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 text-sm font-black outline-none focus:border-fest" />
              </div>
              <SizeSlider label="横幅" value={selected.w} onChange={(w) => updateSelected({ w })} />
              <SizeSlider label="高さ" value={selected.h} onChange={(h) => updateSelected({ h })} />
              <div className="rounded-xl bg-stone-50 px-3 py-2 text-[10px] font-bold text-stone-500">
                位置 X {selected.x.toFixed(1)}% · Y {selected.y.toFixed(1)}%
              </div>
              <button type="button" onClick={() => { setAnnotations((items) => items.filter((item) => item.id !== selected.id)); setSelectedId(null) }} className="w-full rounded-full bg-red-50 py-2.5 text-xs font-black text-red-600">
                この教室を削除
              </button>
            </div>
          ) : (
            <p className="py-6 text-center text-xs font-bold leading-relaxed text-stone-400">教室を選択すると、名前・大きさ・位置を編集できます</p>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-stone-100 pt-4">
            <button type="button" onClick={exportJson} className="rounded-full bg-stone-100 py-2.5 text-xs font-black text-stone-600">JSON出力</button>
            <button type="button" onClick={save} className={`rounded-full py-2.5 text-xs font-black text-white ${saved ? 'bg-teal' : 'bg-fest'}`}>{saved ? '保存済み' : '保存する'}</button>
          </div>
        </aside>
      </div>
    </div>
  )
}

function SizeSlider({ label, value, onChange }) {
  return (
    <label className="block text-[10px] font-black text-stone-400">
      <span className="flex justify-between"><span>{label}</span><span>{value.toFixed(0)}%</span></span>
      <input type="range" min="5" max="50" value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-1 w-full accent-[#e8442e]" />
    </label>
  )
}
