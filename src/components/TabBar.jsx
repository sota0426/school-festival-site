import { MapIcon, StallIcon, ClockIcon, CarIcon } from './Icons'

const TABS = [
  { id: 'map', label: 'マップ', Icon: MapIcon },
  { id: 'stalls', label: '模擬店', Icon: StallIcon },
  { id: 'timetable', label: 'タイム\nテーブル', short: '時間割', Icon: ClockIcon },
  { id: 'access', label: 'アクセス', Icon: CarIcon },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="shrink-0 border-t border-orange-100 bg-white/90 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-xl">
        {TABS.map(({ id, label, short, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="group relative flex flex-1 flex-col items-center gap-0.5 py-2"
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={`flex h-8 w-14 items-center justify-center rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-fest text-white shadow-md shadow-orange-200 -translate-y-0.5'
                    : 'text-stone-400 group-active:scale-90'
                }`}
              >
                <Icon width="22" height="22" />
              </span>
              <span
                className={`text-[10px] font-bold transition-colors ${
                  active ? 'text-fest' : 'text-stone-400'
                }`}
              >
                {short || label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
