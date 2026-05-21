'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { generateId } from '@/lib/utils'
import type { LayoutType, ChartPane, LayoutConfig } from '@/types/chart'
import type { TimeFrame } from '@/types/market'

function makePane(symbol: string, timeframe: TimeFrame = '1h'): ChartPane {
  return {
    id: generateId(),
    symbol,
    timeframe,
    chartType: 'candlestick',
    indicators: [],
    drawings: [],
  }
}

const DEFAULT_PANES = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT']

function makeDefaultLayout(type: LayoutType = 'quad'): LayoutConfig {
  const counts = { single: 1, dual: 2, quad: 4, hexa: 6, octa: 8 }
  const count = counts[type]
  const panes = DEFAULT_PANES.slice(0, count).map((sym, i) =>
    makePane(sym, i === 0 ? '1h' : '4h')
  )
  while (panes.length < count) panes.push(makePane('BTCUSDT'))
  return { type, panes, activePane: panes[0].id }
}

interface WorkspaceState {
  layout: LayoutConfig
  sidebarLeft: boolean
  sidebarRight: boolean
  bottomPanel: boolean
  activeTab: 'watchlist' | 'signals' | 'news'
  rightTab: 'ai' | 'signals' | 'overview'

  setLayout: (type: LayoutType) => void
  setActivePane: (id: string) => void
  updatePane: (id: string, updates: Partial<ChartPane>) => void
  setPaneSymbol: (id: string, symbol: string) => void
  setPaneTimeframe: (id: string, tf: TimeFrame) => void
  toggleSidebarLeft: () => void
  toggleSidebarRight: () => void
  toggleBottomPanel: () => void
  setActiveTab: (tab: WorkspaceState['activeTab']) => void
  setRightTab: (tab: WorkspaceState['rightTab']) => void
  resetWorkspace: () => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    immer((set) => ({
      layout: makeDefaultLayout('single'),
      sidebarLeft: true,
      sidebarRight: true,
      bottomPanel: false,
      activeTab: 'watchlist',
      rightTab: 'ai',

      setLayout: (type) =>
        set((state) => {
          const counts = { single: 1, dual: 2, quad: 4, hexa: 6, octa: 8 }
          const count = counts[type]
          const current = state.layout.panes

          const newPanes: ChartPane[] = []
          for (let i = 0; i < count; i++) {
            newPanes.push(current[i] ?? makePane(DEFAULT_PANES[i % DEFAULT_PANES.length]))
          }
          state.layout.type = type
          state.layout.panes = newPanes
          state.layout.activePane = newPanes[0].id
        }),

      setActivePane: (id) =>
        set((state) => { state.layout.activePane = id }),

      updatePane: (id, updates) =>
        set((state) => {
          const pane = state.layout.panes.find(p => p.id === id)
          if (pane) Object.assign(pane, updates)
        }),

      setPaneSymbol: (id, symbol) =>
        set((state) => {
          const pane = state.layout.panes.find(p => p.id === id)
          if (pane) pane.symbol = symbol
        }),

      setPaneTimeframe: (id, tf) =>
        set((state) => {
          const pane = state.layout.panes.find(p => p.id === id)
          if (pane) pane.timeframe = tf
        }),

      toggleSidebarLeft: () => set(s => { s.sidebarLeft = !s.sidebarLeft }),
      toggleSidebarRight: () => set(s => { s.sidebarRight = !s.sidebarRight }),
      toggleBottomPanel: () => set(s => { s.bottomPanel = !s.bottomPanel }),
      setActiveTab: (tab) => set(s => { s.activeTab = tab }),
      setRightTab: (tab) => set(s => { s.rightTab = tab }),
      resetWorkspace: () => set(s => { s.layout = makeDefaultLayout('quad') }),
    })),
    {
      name: 'technobiz-workspace',
      version: 2,
      partialize: (state: WorkspaceState) => ({
        sidebarLeft: state.sidebarLeft,
        sidebarRight: state.sidebarRight,
        bottomPanel: state.bottomPanel,
        activeTab: state.activeTab,
        rightTab: state.rightTab,
      }),
    }
  )
)
