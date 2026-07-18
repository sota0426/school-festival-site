import { MapIcon, StallIcon, ClockIcon, MoreIcon } from './Icons'

const TABS = [
  { id: 'map', label: 'マップ', Icon: MapIcon },
  { id: 'stalls', label: '模擬店', Icon: StallIcon },
  { id: 'events', label: 'イベント', Icon: ClockIcon },
  { id: 'more', label: 'その他', Icon: MoreIcon },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="min-w-0 flex-1" aria-label="メインメニュー">
      <div className="flex justify-end gap-0.5">
        {TABS.map(({ id, label, Icon }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              className="group relative flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1"
              aria-current={active ? 'page' : undefined}
            >
              <span
                className={`flex h-7 w-9 items-center justify-center rounded-full transition-all duration-300 ${
                  active
                    ? 'bg-fest text-white shadow-md shadow-orange-200 -translate-y-0.5'
                    : 'text-stone-400 group-active:scale-90'
                }`}
              >
                <Icon width="18" height="18" />
              </span>
              <span
                className={`whitespace-nowrap text-[9px] font-bold leading-none transition-colors ${
                  active ? 'text-fest' : 'text-stone-400'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
