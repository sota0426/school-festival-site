import { FESTIVAL } from '../config'
import Access from './Access'

export default function More({ onOpenSurvey, onOpenExitSurvey }) {
  return (
    <div data-tab-scroll="more" className="flex-1 overflow-y-auto px-4 pb-8 pt-4">
      <section aria-labelledby="visitor-guide-title">
        <div className="rounded-3xl bg-gradient-to-br from-fest to-fest2 px-5 py-5 text-white shadow-lg shadow-orange-200">
          <p className="text-[10px] font-black tracking-[0.2em] text-white/75">VISITOR GUIDE</p>
          <h2 id="visitor-guide-title" className="mt-1 text-xl font-black">ご来場案内</h2>
          <p className="mt-1 text-xs font-bold text-white/80">ご来場前にご確認ください</p>
        </div>
        <VisitorGuide />
      </section>

      <a
        href={FESTIVAL.instagramUrl}
        target="_blank"
        rel="noreferrer"
        className="mt-5 block overflow-hidden rounded-3xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 p-[1px] shadow-lg shadow-pink-200 transition-transform active:scale-[0.98]"
        aria-label="鶴東祭公式Instagramを開く"
      >
        <div className="rounded-[calc(1.5rem-1px)] bg-white/10 p-5 text-white backdrop-blur-sm">
          <div className="flex items-center gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-3xl shadow-md" aria-hidden="true">📸</span>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black tracking-[0.18em] text-white/75">OFFICIAL INSTAGRAM</p>
              <h2 className="mt-0.5 text-lg font-black">公式Instagram</h2>
              <p className="mt-1 text-xs font-bold leading-relaxed text-white/85">今後も文化祭の最新情報や当日の様子を投稿していきます。</p>
              <p className="mt-1 text-sm font-black">ぜひフォローをお願いします！</p>
            </div>
          </div>
          <div className="mt-4 rounded-full bg-white py-2.5 text-center text-xs font-black text-pink-600 shadow-sm">
            Instagramを開く ↗
          </div>
        </div>
      </a>

      <section className="mt-8 border-t border-orange-100 pt-6" aria-labelledby="access-title">
        <p className="text-[10px] font-black tracking-[0.18em] text-fest">ACCESS</p>
        <h2 id="access-title" className="mt-0.5 text-xl font-black text-ink">🚗 交通・アクセス</h2>
        <p className="mb-3 mt-1 text-xs font-bold text-stone-500">臨時駐車場と来場方法のご案内</p>
        <Access embedded />
      </section>

      <section className="mt-8 border-t border-stone-200 pt-6" aria-labelledby="dev-tools-title">
        <p className="text-[10px] font-black tracking-[0.18em] text-stone-400">DEVELOPMENT</p>
        <h2 id="dev-tools-title" className="mt-0.5 text-base font-black text-ink">開発用メニュー</h2>
        <button
          type="button"
          onClick={onOpenSurvey}
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-orange-200 bg-orange-50 px-4 py-3 text-sm font-black text-fest transition-transform active:scale-[0.98]"
        >
          アンケートに答える（DEV用）
        </button>
        <button
          type="button"
          onClick={onOpenExitSurvey}
          className="mt-3 w-full rounded-2xl border-2 border-dashed border-teal-200 bg-teal-50 px-4 py-3 text-sm font-black text-teal-700 transition-transform active:scale-[0.98]"
        >
          帰り際アンケートに答える（DEV用）
        </button>
      </section>
    </div>
  )
}

function VisitorGuide() {
  return (
    <div className="mt-4 space-y-3">
      <GuideRow emoji="🕘" title="開催時間" text={`${FESTIVAL.openHours}（${FESTIVAL.dateLabel}）`} />
      <GuideRow emoji="👟" title="上履き" text="上履きをご持参ください" />
      <GuideRow
        icon={<img src={`${import.meta.env.BASE_URL}images/paypay-logo.jpg`} alt="PayPay" className="h-16 w-16 rounded-xl object-cover" />}
        title="キャッシュレス決済"
        text="PayPayの利用が可能です。ぜひご活用ください！"
        accent
      />
    </div>
  )
}

function GuideRow({ emoji, icon, title, text, accent = false }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl p-4 shadow-sm ${accent ? 'border border-[#ff0033]/20 bg-[#fff5f7]' : 'bg-white'}`}>
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-stone-50">
        {icon || <span className="text-3xl" aria-hidden="true">{emoji}</span>}
      </div>
      <div className="min-w-0">
        <h3 className="text-sm font-black text-ink">{title}</h3>
        <p className="mt-1 text-xs font-bold leading-relaxed text-stone-500">{text}</p>
      </div>
    </div>
  )
}
