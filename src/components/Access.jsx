import { useApp } from '../lib/AppContext'
import { buildingById, buildingCenter } from '../data/campus'

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

export default function Access() {
  const { showOnMap } = useApp()

  const focusBuilding = (id) => {
    const b = buildingById(id)
    if (b) showOnMap({ type: 'point', ...buildingCenter(b) })
  }

  return (
    <div className="flex-1 space-y-4 overflow-y-auto px-4 pb-6 pt-3">
      <Card emoji="🚗" title="臨時駐車場" delay={0.05}>
        <p>
          校内西側に<b>臨時駐車場(約150台)</b>をご用意しています。
        </p>
        <ul className="list-disc pl-5 text-[13px]">
          <li>利用時間: 8:30〜17:00</li>
          <li>満車の場合は係員が近隣の第2駐車場へご案内します</li>
          <li>校内は徐行運転にご協力ください</li>
        </ul>
        <button
          type="button"
          onClick={() => focusBuilding('parking')}
          className="mt-2 rounded-full bg-fest px-4 py-2 text-xs font-black text-white transition-transform active:scale-95"
        >
          🗺 マップで位置を見る
        </button>
      </Card>

      <Card emoji="🚌" title="スクールバス" delay={0.12}>
        <p>
          鶴東駅⇔学校間で<b>無料シャトルバス</b>を運行します(9:00〜16:30、約15分間隔)。
        </p>
        <p className="text-[13px]">
          乗降場所は第1グラウンド南側の「スクールバス乗降場」です。
        </p>
        <button
          type="button"
          onClick={() => focusBuilding('bus')}
          className="mt-2 rounded-full bg-fest px-4 py-2 text-xs font-black text-white transition-transform active:scale-95"
        >
          🗺 マップで位置を見る
        </button>
      </Card>

      <Card emoji="🚃" title="電車でお越しの方" delay={0.19}>
        <p>
          鶴東線「鶴東駅」下車、徒歩12分。
          <br />
          駅からの道順は案内看板とスタッフが誘導します。
        </p>
      </Card>

      <Card emoji="⚠️" title="ご来場にあたって" delay={0.26}>
        <ul className="list-disc pl-5 text-[13px]">
          <li>上履きは不要です(校舎内もそのままお入りいただけます)</li>
          <li>熱中症対策のため、水分補給をお忘れなく</li>
          <li>体調のすぐれない方は保健室(中央校舎1F)へお声がけください</li>
          <li>落とし物・迷子のご案内は本部(中央校舎1F 生徒玄関)まで</li>
        </ul>
      </Card>
    </div>
  )
}
