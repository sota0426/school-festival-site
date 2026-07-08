import { useCallback, useEffect, useRef, useState } from 'react'

const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// ピンチズーム/ドラッグ/ホイールに対応した地図ビュー。
// focus: { x, y, s, key } を渡すとそのSVG座標へアニメーションで移動する。
// children は関数 (scale) => SVG要素
export default function PanZoom({ viewW, viewH, focus, minScale = 1, maxScale = 5, children }) {
  const outerRef = useRef(null)
  const [t, setT] = useState({ x: 0, y: 0, s: 1 })
  const [animating, setAnimating] = useState(false)
  const pointers = useRef(new Map())
  const gesture = useRef(null)
  const movedRef = useRef(0)
  const animTimer = useRef(null)

  const clampT = useCallback(
    (nt) => {
      const el = outerRef.current
      if (!el) return nt
      const cw = el.clientWidth
      const ch = el.clientHeight
      const s = clamp(nt.s, minScale, maxScale)
      return {
        s,
        x: clamp(nt.x, cw - cw * s, 0),
        y: clamp(nt.y, ch - ch * s, 0),
      }
    },
    [minScale, maxScale],
  )

  // SVG座標 → コンテナpx(scale=1時)
  const svgToPx = useCallback(
    (p) => {
      const el = outerRef.current
      if (!el) return { x: 0, y: 0 }
      const cw = el.clientWidth
      const ch = el.clientHeight
      const base = Math.min(cw / viewW, ch / viewH)
      return {
        x: (cw - viewW * base) / 2 + p.x * base,
        y: (ch - viewH * base) / 2 + p.y * base,
      }
    },
    [viewW, viewH],
  )

  useEffect(() => {
    if (!focus) return
    const el = outerRef.current
    if (!el) return
    const px = svgToPx(focus)
    const s = clamp(focus.s, minScale, maxScale)
    setAnimating(true)
    setT(clampT({ s, x: el.clientWidth / 2 - s * px.x, y: el.clientHeight / 2 - s * px.y }))
    clearTimeout(animTimer.current)
    animTimer.current = setTimeout(() => setAnimating(false), 600)
    // focus.key の変化だけに反応させる
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.key])

  // ホイールズーム(preventDefaultのためネイティブ登録)
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const onWheel = (e) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      setT((prev) => {
        const factor = Math.exp(-e.deltaY * 0.002)
        const s = clamp(prev.s * factor, minScale, maxScale)
        const wx = (cx - prev.x) / prev.s
        const wy = (cy - prev.y) / prev.s
        return clampT({ s, x: cx - s * wx, y: cy - s * wy })
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [clampT, minScale, maxScale])

  const startGesture = () => {
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      gesture.current = { type: 'pan', p0: pts[0], t0: t }
    } else if (pts.length >= 2) {
      const [a, b] = pts
      gesture.current = {
        type: 'pinch',
        d0: Math.hypot(a.x - b.x, a.y - b.y),
        m0: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        t0: t,
      }
    } else {
      gesture.current = null
    }
  }

  const onPointerDown = (e) => {
    outerRef.current?.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) movedRef.current = 0
    setAnimating(false)
    startGesture()
  }

  const onPointerMove = (e) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const g = gesture.current
    if (!g) return
    const pts = [...pointers.current.values()]
    if (g.type === 'pan' && pts.length === 1) {
      const dx = pts[0].x - g.p0.x
      const dy = pts[0].y - g.p0.y
      movedRef.current = Math.max(movedRef.current, Math.hypot(dx, dy))
      setT(clampT({ s: g.t0.s, x: g.t0.x + dx, y: g.t0.y + dy }))
    } else if (g.type === 'pinch' && pts.length >= 2) {
      const [a, b] = pts
      const d = Math.hypot(a.x - b.x, a.y - b.y)
      const m = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      movedRef.current = 99
      const s = clamp((g.t0.s * d) / g.d0, minScale, maxScale)
      const wx = (g.m0.x - g.t0.x) / g.t0.s
      const wy = (g.m0.y - g.t0.y) / g.t0.s
      setT(clampT({ s, x: m.x - s * wx, y: m.y - s * wy }))
    }
  }

  const onPointerEnd = (e) => {
    pointers.current.delete(e.pointerId)
    startGesture()
  }

  // ドラッグ後のclickを抑制
  const onClickCapture = (e) => {
    if (movedRef.current > 8) {
      e.stopPropagation()
      e.preventDefault()
    }
  }

  return (
    <div
      ref={outerRef}
      className="map-surface relative h-full w-full overflow-hidden"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
      onClickCapture={onClickCapture}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${t.x}px, ${t.y}px) scale(${t.s})`,
          transformOrigin: '0 0',
          transition: animating ? 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1)' : 'none',
          willChange: 'transform',
        }}
      >
        <svg
          viewBox={`0 0 ${viewW} ${viewH}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {children(t.s)}
        </svg>
      </div>
    </div>
  )
}
