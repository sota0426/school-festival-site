const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const MapIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" />
    <path d="M9 4v14M15 6v14" />
  </svg>
)

export const StallIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M4 10 5.5 4h13L20 10" />
    <path d="M4 10c0 1.4 1.2 2.5 2.7 2.5S9.3 11.4 9.3 10c0 1.4 1.2 2.5 2.7 2.5s2.7-1.1 2.7-2.5c0 1.4 1.2 2.5 2.7 2.5S20 11.4 20 10" />
    <path d="M5.5 13v7h13v-7" />
    <path d="M9.5 20v-4.5h5V20" />
  </svg>
)

export const ClockIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const CalendarIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
    <path d="M7.5 3.5v4M16.5 3.5v4M3.5 10h17" />
    <path d="M8 14h.01M12 14h.01M16 14h.01M8 17.5h.01M12 17.5h.01" strokeWidth="3" />
  </svg>
)

export const CarIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M5 12 6.5 7h11L19 12" />
    <path d="M4 12h16v5h-2M4 17h2m12 0H6" />
    <circle cx="7.5" cy="17" r="1.8" />
    <circle cx="16.5" cy="17" r="1.8" />
  </svg>
)

export const MoreIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <circle cx="6" cy="6" r="1.5" />
    <circle cx="12" cy="6" r="1.5" />
    <circle cx="18" cy="6" r="1.5" />
    <circle cx="6" cy="12" r="1.5" />
    <circle cx="12" cy="12" r="1.5" />
    <circle cx="18" cy="12" r="1.5" />
    <circle cx="6" cy="18" r="1.5" />
    <circle cx="12" cy="18" r="1.5" />
    <circle cx="18" cy="18" r="1.5" />
  </svg>
)

export const BackIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
)

export const CloseIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const SearchIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.5 15.5 21 21" />
  </svg>
)

export const PinIcon = (props) => (
  <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
    <path d="M12 21s-6.5-5.7-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.3 12 21 12 21z" />
    <circle cx="12" cy="10.5" r="2.5" />
  </svg>
)

export const CategoryIcon = ({ category, ...props }) => {
  const paths = {
    food: (
      <>
        <path d="M7 3v7M4.5 3v4.5A2.5 2.5 0 0 0 7 10a2.5 2.5 0 0 0 2.5-2.5V3M7 10v11" />
        <path d="M16.5 3c-2 1.8-3 4-3 6.5 0 1.7 1.3 3 3 3V21M16.5 3V12.5" />
      </>
    ),
    cafe: (
      <>
        <path d="M5 8h11v6.5A4.5 4.5 0 0 1 11.5 19h-2A4.5 4.5 0 0 1 5 14.5V8z" />
        <path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2M12 3.5v2" />
      </>
    ),
    game: (
      <>
        <circle cx="12" cy="12" r="8.5" />
        <circle cx="12" cy="12" r="4.5" />
        <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
      </>
    ),
    exhibit: (
      <>
        <rect x="4" y="4.5" width="16" height="13" rx="2" />
        <path d="m7 14 3.5-3.5 2.5 2 2.5-3 2.5 4M9 21h6M12 17.5V21" />
      </>
    ),
  }

  return (
    <svg viewBox="0 0 24 24" width="24" height="24" {...base} {...props}>
      {paths[category] || paths.exhibit}
    </svg>
  )
}
