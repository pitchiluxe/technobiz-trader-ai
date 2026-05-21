'use client'

import { useState, useEffect } from 'react'
import { Search, Plus, X, Star } from 'lucide-react'
import { useWatchlistStore } from '@/stores/useWatchlistStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useWatchlistTicker } from '@/hooks/useMarketData'
import { formatPrice, getChangeColor } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Symbol } from '@/types/market'

interface SearchResult extends Symbol {}

export default function WatchlistPanel() {
  const { items, quotes, addSymbol, removeSymbol } = useWatchlistStore()
  const { layout, setPaneSymbol } = useWorkspaceStore()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useWatchlistTicker()

  useEffect(() => {
    if (!search.trim()) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/market/search?q=${encodeURIComponent(search)}`)
        if (res.ok) setSearchResults(await res.json())
      } catch {} finally { setIsSearching(false) }
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const handleSelectSymbol = (symbol: string, name: string, type: string) => {
    addSymbol(symbol, name, type)
    const activePane = layout.activePane
    setPaneSymbol(activePane, symbol)
    setSearch('')
    setSearchResults([])
  }

  const handleClickItem = (symbol: string) => {
    const activePane = layout.activePane
    setPaneSymbol(activePane, symbol)
  }

  return (
    <div className="flex flex-col h-full bg-tv-bg">
      {/* Search */}
      <div className="p-2 border-b border-tv-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tv-text-dim" />
          <input
            className="w-full bg-tv-surface border border-tv-border rounded-md pl-8 pr-3 py-1.5 text-xs text-tv-text placeholder:text-tv-text-dim focus:outline-none focus:border-tv-accent"
            placeholder="Search symbol..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Search Results Dropdown */}
        {(searchResults.length > 0 || isSearching) && (
          <div className="absolute z-50 left-0 right-0 mt-1 bg-tv-surface border border-tv-border rounded-lg shadow-xl overflow-hidden mx-2">
            {isSearching && (
              <div className="px-3 py-2 text-xs text-tv-text-dim">Searching...</div>
            )}
            {searchResults.map(r => (
              <button
                key={r.symbol}
                onClick={() => handleSelectSymbol(r.symbol, r.name, r.type)}
                className="w-full flex items-center justify-between px-3 py-2 hover:bg-tv-border text-left"
              >
                <div>
                  <div className="text-sm text-white font-mono font-medium">{r.symbol}</div>
                  <div className="text-xs text-tv-text-dim">{r.name}</div>
                </div>
                <span className="text-xs text-tv-text-dim capitalize">{r.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Watchlist Header */}
      <div className="flex items-center justify-between px-2 py-1 text-tv-text-dim border-b border-tv-border">
        <div className="grid grid-cols-[1fr_auto_auto] w-full text-xs gap-2">
          <span>SYMBOL</span>
          <span className="text-right">PRICE</span>
          <span className="text-right w-14">CHG%</span>
        </div>
      </div>

      {/* Watchlist Items */}
      <ScrollArea className="flex-1">
        <div className="py-1">
          {items.map(item => {
            const q = quotes[item.symbol]
            return (
              <div
                key={item.symbol}
                className="group flex items-center px-2 py-1.5 hover:bg-tv-surface cursor-pointer transition-colors"
                onClick={() => handleClickItem(item.symbol)}
              >
                <div className="grid grid-cols-[1fr_auto_auto] w-full gap-2 items-center">
                  <div className="min-w-0">
                    <div className="text-sm text-white font-mono font-semibold truncate">{item.symbol.replace('USDT', '')}</div>
                    <div className="text-xs text-tv-text-dim truncate">{item.name}</div>
                  </div>
                  <div className="text-right text-sm font-mono text-white tabular-nums">
                    {q ? formatPrice(q.price) : '—'}
                  </div>
                  <div className={`text-right text-xs font-mono w-14 tabular-nums ${q ? getChangeColor(q.changePercent) : 'text-tv-text-dim'}`}>
                    {q ? `${q.changePercent >= 0 ? '+' : ''}${q.changePercent.toFixed(2)}%` : '—'}
                  </div>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); removeSymbol(item.symbol) }}
                  className="ml-1 p-1 rounded opacity-0 group-hover:opacity-100 text-tv-text-dim hover:text-tv-red transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
