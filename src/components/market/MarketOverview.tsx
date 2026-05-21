'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice } from '@/lib/utils'

interface MarketItem {
  symbol: string
  name: string
  price: number
  changePercent: number
}

const MARKET_GROUPS = [
  {
    label: 'Crypto',
    symbols: [
      { symbol: 'BTCUSDT', name: 'Bitcoin' },
      { symbol: 'ETHUSDT', name: 'Ethereum' },
      { symbol: 'SOLUSDT', name: 'Solana' },
      { symbol: 'BNBUSDT', name: 'BNB' },
    ],
  },
  {
    label: 'Forex',
    symbols: [
      { symbol: 'EURUSD', name: 'EUR/USD' },
      { symbol: 'GBPUSD', name: 'GBP/USD' },
      { symbol: 'USDJPY', name: 'USD/JPY' },
      { symbol: 'AUDUSD', name: 'AUD/USD' },
    ],
  },
  {
    label: 'Metals & Energy',
    symbols: [
      { symbol: 'XAUUSD', name: 'Gold' },
      { symbol: 'XAGUSD', name: 'Silver' },
      { symbol: 'USOIL', name: 'WTI Oil' },
    ],
  },
  {
    label: 'Indices',
    symbols: [
      { symbol: 'NAS100', name: 'NASDAQ 100' },
      { symbol: 'US500', name: 'S&P 500' },
      { symbol: 'US30', name: 'Dow Jones' },
      { symbol: 'GER40', name: 'DAX 40' },
    ],
  },
]

const ALL_SYMBOLS = MARKET_GROUPS.flatMap(g => g.symbols)

export default function MarketOverview() {
  const [quotes, setQuotes] = useState<Record<string, MarketItem>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled(
          ALL_SYMBOLS.map(async ({ symbol, name }) => {
            const res = await fetch(`/api/market/quote?symbol=${symbol}`)
            if (!res.ok) return null
            const q = await res.json()
            if (q.error || q.price == null) return null
            return {
              symbol,
              name,
              price: q.price ?? 0,
              changePercent: q.changePercent ?? 0,
            } as MarketItem
          })
        )
        const map: Record<string, MarketItem> = {}
        results.forEach((r, i) => {
          if (r.status === 'fulfilled' && r.value) {
            map[ALL_SYMBOLS[i].symbol] = r.value
          }
        })
        setQuotes(map)
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    const id = setInterval(fetchAll, 15000)
    return () => clearInterval(id)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-6 h-6 border-2 border-tv-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-3">
        {MARKET_GROUPS.map(group => (
          <div key={group.label}>
            <div className="text-xs font-semibold text-tv-text-dim uppercase tracking-wider px-1 pb-1">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.symbols.map(({ symbol, name }) => {
                const item = quotes[symbol]
                const pct = item?.changePercent ?? 0
                const isUp = pct >= 0
                return (
                  <div
                    key={symbol}
                    className="flex items-center justify-between px-2 py-1.5 rounded hover:bg-tv-surface transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      {isUp
                        ? <TrendingUp className="w-3 h-3 text-tv-green shrink-0" />
                        : <TrendingDown className="w-3 h-3 text-tv-red shrink-0" />}
                      <div>
                        <div className="text-xs text-white font-mono font-semibold">{name}</div>
                        <div className="text-[10px] text-tv-text-dim">{symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-white">
                        {item ? `$${formatPrice(item.price)}` : '—'}
                      </div>
                      <div className={`text-[10px] font-mono ${isUp ? 'text-tv-green' : 'text-tv-red'}`}>
                        {isUp ? '+' : ''}{pct.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
