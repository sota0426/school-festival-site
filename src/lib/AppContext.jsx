import { createContext, useContext } from 'react'

// openDetail(stallId) / closeDetail() / showOnMap(target) / setTab(tabId)
// target: { type:'stall', id } | { type:'point', x, y, label }
export const AppContext = createContext(null)

export const useApp = () => useContext(AppContext)
