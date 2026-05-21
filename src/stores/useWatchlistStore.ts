'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { DEFAULT_WATCHLIST } from '@/lib/constants'
import type { WatchlistItem, Quote } from '@/types/market'

interface WatchlistState {
  items: WatchlistItem[]
  quotes: Record<string, Quote>
  addSymbol: (symbol: string, name: string, type?: string) => void
  removeSymbol: (symbol: string) => void
  updateQuote: (symbol: string, quote: Quote) => void
  updateQuotes: (quotes: Record<string, Quote>) => void
  reorderItems: (from: number, to: number) => void
  hasSymbol: (symbol: string) => boolean
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    immer((set, get) => ({
      items: DEFAULT_WATCHLIST.map(sym => ({
        symbol: sym,
        name: sym.replace('USDT', '').replace('USD', ''),
        type: 'crypto' as const,
        addedAt: Date.now(),
      })),
      quotes: {},

      addSymbol: (symbol, name, type = 'crypto') =>
        set(state => {
          if (!state.items.find(i => i.symbol === symbol)) {
            state.items.push({ symbol, name, type: type as WatchlistItem['type'], addedAt: Date.now() })
          }
        }),

      removeSymbol: (symbol) =>
        set(state => { state.items = state.items.filter(i => i.symbol !== symbol) }),

      updateQuote: (symbol, quote) =>
        set(state => { state.quotes[symbol] = quote }),

      updateQuotes: (quotes) =>
        set(state => { Object.assign(state.quotes, quotes) }),

      reorderItems: (from, to) =>
        set(state => {
          const [item] = state.items.splice(from, 1)
          state.items.splice(to, 0, item)
        }),

      hasSymbol: (symbol) => !!get().items.find(i => i.symbol === symbol),
    })),
    { name: 'technobiz-watchlist', version: 1 }
  )
)
