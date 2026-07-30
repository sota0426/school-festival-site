import { MapIcon, StallIcon, CalendarIcon, MoreIcon } from './Icons'

const TABS = [
  { id: 'map', label: 'マップ', Icon: MapIcon, inactive: 'bg-blue-50 text-blue-600' },
  { id: 'stalls', label: '模擬店', Icon: StallIcon, inactive: 'bg-orange-50 text-orange-600' },
  { id: 'events', label: 'イベント', Icon: CalendarIcon, inactive: 'bg-violet-50 text-violet-600' },
  { id: 'more', label: 'その他', Icon: MoreIcon, inactive: 'bg-teal-50 text-teal-600' },
]

export default function TabBar({ tab, onChange }) {
  return (
    <nav className="min-w-0 flex-1" aria-label="メインメニュー">
      <div className="grid w-full grid-cols-4 items-center">
        {TABS.map(({ id, label, Icon, inactive }) => {
          const active = tab === id
          return (
            <button
              key={id}
              type="button"
              onClick={() => onChange(id)}
              aria-label={label}
              aria-current={active ? 'page' : undefined}
              className={`group flex h-11 shrink-0 items-center justify-center justify-self-center rounded-full ring-1 ring-black/5 transition-all duration-300 active:scale-90 ${
                active
                  ? 'z-10 gap-1 bg-fest px-2 text-white shadow-md shadow-orange-200'
                  : `w-11 ${inactive} shadow-sm`
              }`}
            >
              <Icon width="22" height="22" />
              {active && <span className="whitespace-nowrap text-[10px] font-black">{label}</span>}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
