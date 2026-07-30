import { PARKING } from '../config'

function Card({ emoji, title, children, delay = 0 }) {
  return (
    <section
      className="fade-up rounded-2xl bg-white p-5 shadow-sm"
      style={{ animationDelay: `${delay}s` }}
    >
      <h2 className="flex items-center gap-2 text-base font-black text-ink">
        <span className="text-xl">{emoji}</span>
        {title}
      </h2>
      <div className="mt-2 space-y-1.5 text-sm leading-relaxed text-stone-600">{children}</div>
    </section>
  )
}

export default function Access({ embedded = false }) {
  return (
    <div className={embedded ? 'space-y-4' : 'flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-3'}>
      <Card emoji="🚗" title="臨時駐車場" delay={0.05}>
        <p>
          臨時駐車場は<b>{PARKING.name}</b>です。
        </p>
        <p className="text-[13px] font-bold text-stone-500">{PARKING.address}</p>
        <ul className="list-disc pl-5 text-[13px]">
          <li>利用時間: 8:30〜15:00</li>
          <li>会場周辺では徐行運転にご協力ください</li>
        </ul>

        <ParkingMap />

        <div className="mt-3 grid grid-cols-2 gap-2">
          <MapLink
            href={PARKING.googleMapUrl}
            onClick={openParkingMap}
            emoji="🗺️"
            title="地図で見る"
            provider="スマホは地図アプリ"
            primary
          />
          <MapLink
            href={PARKING.streetViewUrl}
            emoji="📷"
            title="現地写真を見る"
            provider="Google Street View"
          />
        </div>
        <p className="pt-1 text-center text-[10px] font-bold text-stone-400">
          スマホでは端末の地図アプリ、パソコンではGoogleマップが開きます
        </p>
      </Card>

    </div>
  )
}

function openParkingMap(event) {
  const userAgent = navigator.userAgent
  const isIPad = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1

  if (/Android/i.test(userAgent)) {
    event.preventDefault()
    window.location.href = PARKING.androidMapUrl
  } else if (/iPhone|iPad|iPod/i.test(userAgent) || isIPad) {
    event.preventDefault()
    window.location.href = PARKING.appleMapUrl
  }
}

function MapLink({ href, onClick, emoji, title, provider, primary = false }) {
  return (
    <a
      href={href}
      onClick={onClick}
      target="_blank"
      rel="noreferrer"
      className={`flex min-h-16 flex-col items-center justify-center rounded-2xl px-2 py-2.5 text-center shadow-sm transition-transform active:scale-95 ${primary ? 'bg-fest text-white' : 'border border-stone-200 bg-white text-ink'}`}
    >
      <span className="text-base font-black">{emoji} {title}</span>
      <span className={`mt-0.5 text-[9px] font-bold ${primary ? 'text-white/75' : 'text-stone-400'}`}>
        {provider} ↗
      </span>
    </a>
  )
}

function ParkingMap() {
  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-stone-200 bg-stone-100 shadow-inner">
      <div className="flex items-center gap-3 bg-ink px-3.5 py-3 text-white">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/15 text-xl" aria-hidden="true">
          📍
        </span>
        <div className="min-w-0">
          <p className="text-[9px] font-black tracking-[0.16em] text-orange-200">臨時駐車場</p>
          <p className="text-base font-black leading-tight">{PARKING.name}</p>
          <p className="mt-0.5 truncate text-[10px] font-bold text-white/65">{PARKING.address}</p>
        </div>
      </div>
      <div className="relative aspect-[4/3] w-full">
        <iframe
          src={PARKING.googleEmbedUrl}
          title={`${PARKING.name}の地図`}
          className="absolute inset-0 h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <div className="bg-white px-3 py-2 text-center">
        <p className="text-[10px] font-black text-ink">赤いピンが臨時駐車場の位置です</p>
        <p className="mt-0.5 text-[9px] font-bold text-stone-400">
          Googleマップ上では「切添グラウンド」の名称が表示されない場合があります
        </p>
      </div>
    </div>
  )
}
