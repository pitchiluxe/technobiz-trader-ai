'use client'

import { useState } from 'react'
import { Search, Plus, X } from 'lucide-react'
import { useWatchlistStore } from '@/stores/useWatchlistStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useWatchlistTicker } from '@/hooks/useMarketData'
import { formatPrice } from '@/lib/utils'
import type { Symbol } from '@/types/market'

export default function WatchlistPanel() {
  const { items, quotes, addSymbol, removeSymbol } = useWatchlistStore()
  const { layout, setPaneSymbol } = useWorkspaceStore()
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [searchResults, setSearchResults] = useState<Symbol[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useWatchlistTicker()

  const activeSymbol = (layout.panes as import('@/types/chart').ChartPane[])?.find(p => p.id === layout.activePane)?.symbol

  const handleSearch = async (val: string) => {
    setSearch(val)
    if (!val.trim()) { setSearchResults([]); return }
    setIsSearching(true)
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(val)}`)
      if (res.ok) setSearchResults(await res.json())
    } catch {} finally { setIsSearching(false) }
  }

  const handleSelectSymbol = (symbol: string, name: string, type: string) => {
    addSymbol(symbol, name, type)
    setPaneSymbol(layout.activePane, symbol)
    setSearch('')
    setSearchResults([])
    setShowSearch(false)
  }

  const handleClickItem = (symbol: string) => {
    setPaneSymbol(layout.activePane, symbol)
  }

  return (
    <div className="flex flex-col h-full bg-tv-surface text-tv-text select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 shrink-0 border-b border-tv-border">
        <span className="text-[11px] font-semibold text-tv-text-dim uppercase tracking-widest">Watchlist</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => { setShowSearch(!showSearch); if (showSearch) { setSearch(''); setSearchResults([]) } }}
            className={`p-1 rounded transition-colors ${showSearch ? 'text-tv-accent' : 'text-tv-text-dim hover:text-tv-text'}`}
          >
            <Search className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowSearch(true)}
            className="p-1 rounded text-tv-text-dim hover:text-tv-text transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="relative px-2 py-1.5 border-b border-tv-border shrink-0">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-tv-text-dim" />
            <input
              className="w-full bg-tv-bg border border-tv-border rounded pl-6 pr-2 py-1 text-xs text-tv-text placeholder:text-tv-text-dim focus:outline-none focus:border-tv-accent"
              placeholder="Search symbol..."
              value={search}
              onChange={e => handleSearch(e.target.value)}
              autoFocus
            />
          </div>
          {(searchResults.length > 0 || isSearching) && (
            <div className="absolute left-2 right-2 top-full mt-0.5 bg-[#1e222d] border border-tv-border rounded shadow-xl z-50 overflow-hidden">
              {isSearching && <div className="px-3 py-2 text-xs text-tv-text-dim">Searching...</div>}
              {searchResults.map(r => (
                <button key={r.symbol} onClick={() => handleSelectSymbol(r.symbol, r.name, r.type)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-tv-surface-2 text-left">
                  <div>
                    <div className="text-xs text-white font-semibold font-mono">{r.symbol}</div>
                    <div className="text-[10px] text-tv-text-dim">{r.name}</div>
                  </div>
                  <span className="text-[10px] text-tv-text-dim capitalize">{r.type}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Column Headers */}
      <div className="flex items-center justify-between px-3 h-7 shrink-0 border-b border-tv-border">
        <span className="text-[10px] text-tv-text-dim uppercase tracking-wider">Symbol</span>
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-tv-text-dim uppercase tracking-wider">Last</span>
          <span className="text-[10px] text-tv-text-dim uppercase tracking-wider w-12 text-right">Chg%</span>
        </div>
      </div>

      {/* Watchlist Items */}
      <div className="flex-1 overflow-y-auto">
        {items.map(item => {
          const q = quotes[item.symbol]
          const pct = q?.changePercent ?? 0
          const isUp = pct >= 0
          const isActive = item.symbol === activeSymbol
          const borderColor = isUp ? '#26a69a' : '#ef5350'
          const pctColor = isUp ? 'text-[#26a69a]' : 'text-[#ef5350]'
          const displaySymbol = item.symbol
            .replace('USDT', '')
            .replace('USDC', '')
            .replace('=F', '')
            .replace('=X', '')
            .replace('^', '')

          return (
            <div
              key={item.symbol}
              onClick={() => handleClickItem(item.symbol)}
              className={`group relative flex items-center px-3 h-[44px] cursor-pointer border-b border-tv-border/40 transition-colors ${
                isActive ? 'bg-tv-accent-dim' : 'hover:bg-tv-surface-2'
              }`}
            >
              {/* Left color bar */}
              <div
                className="absolute left-0 top-0 bottom-0 w-[2px]"
                style={{ backgroundColor: q ? borderColor : '#2a2e39' }}
              />

              {/* Symbol info */}
              <div className="flex-1 min-w-0 pl-2">
                <div className="text-[13px] font-semibold text-tv-text leading-tight truncate font-mono">
                  {displaySymbol}
                </div>
                <div className="text-[10px] text-tv-text-dim leading-tight truncate">
                  {item.name}
                </div>
              </div>

              {/* Price info */}
              <div className="text-right shrink-0 ml-2">
                <div className="text-[12px] font-mono text-tv-text tabular-nums leading-tight">
                  {q ? formatPrice(q.price) : '—'}
                </div>
                <div className={`text-[11px] font-mono tabular-nums leading-tight ${q ? pctColor : 'text-tv-text-dim'}`}>
                  {q ? `${isUp ? '+' : ''}${pct.toFixed(2)}%` : '—'}
                </div>
              </div>

              {/* Remove button */}
              <button
                onClick={e => { e.stopPropagation(); removeSymbol(item.symbol) }}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded text-tv-text-dim hover:text-tv-red opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
