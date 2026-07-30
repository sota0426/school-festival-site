import { useEffect } from 'react'
import { STALLS } from '../../data/stalls'

const INITIAL_DELAY = 3000
const BATCH_SIZE = 4
const BATCH_INTERVAL = 1400

function posterPreview(stall) {
  if (typeof stall.poster === 'string') return stall.poster
  return stall.poster?.thumbnail || stall.poster?.src
}

export default function PosterPreloader() {
  useEffect(() => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    const slowConnection = connection?.saveData || ['slow-2g', '2g'].includes(connection?.effectiveType)
    if (slowConnection) return undefined

    const urls = [...new Set(STALLS.map(posterPreview).filter(Boolean))]
    if (urls.length === 0) return undefined

    let cancelled = false
    const timers = new Set()
    let cursor = 0

    const schedule = (callback, delay) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer)
        if (!cancelled) callback()
      }, delay)
      timers.add(timer)
    }

    const loadBatch = () => {
      const batch = urls.slice(cursor, cursor + BATCH_SIZE)
      cursor += batch.length
      batch.forEach((url) => {
        const image = new Image()
        image.decoding = 'async'
        image.fetchPriority = 'low'
        image.src = url
      })
      if (cursor < urls.length) schedule(loadBatch, BATCH_INTERVAL)
    }

    const startWhenIdle = () => {
      if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadBatch, { timeout: 2000 })
      } else {
        loadBatch()
      }
    }

    schedule(startWhenIdle, INITIAL_DELAY)
    return () => {
      cancelled = true
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  return null
}
