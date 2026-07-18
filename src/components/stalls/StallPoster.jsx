import { useEffect, useState } from 'react'

export default function StallPoster({ stall, className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  const poster = typeof stall.poster === 'string' ? stall.poster : stall.poster?.src

  useEffect(() => {
    setFailed(false)
  }, [poster])

  if (!poster || failed) {
    return (
      <div
        className={`flex items-center justify-center ${className}`}
        style={{ background: `linear-gradient(135deg, var(--poster-soft), #fff)` }}
        aria-hidden="true"
      >
        <span className="text-5xl drop-shadow-sm">{stall.posterFallback}</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center justify-center overflow-hidden bg-stone-100 ${className}`}>
      <img
        src={poster}
        alt={`${stall.name}のポスター`}
        className="h-full w-full object-contain"
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onError={() => setFailed(true)}
      />
    </div>
  )
}
