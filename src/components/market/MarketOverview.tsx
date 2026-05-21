'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { formatPrice } from '@/lib/utils'

interface MarketItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const MARKET_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', isCrypto: true },
  { symbol: 'ETHUSDT', name: 'Ethereum', isCrypto: true },
  { symbol: 'SOLUSDT', name: 'Solana', isCrypto: true },
  { symbol: 'BNBUSDT', name: 'BNB', isCrypto: true },
]

export default function MarketOverview() {
  const [items, setItems] = useState<MarketItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.all(
          MARKET_SYMBOLS.map(async ({ symbol, name }) => {
            const res = await fetch(`/api/market/quote?symbol=${symbol}`)
            if (!res.ok) return null
            const q = await res.json()
            return {
              symbol,
              name,
              price: q.price,
              change: q.change,
              changePercent: q.changePercent,
            }
          })
        )
        setItems(results.filter(Boolean) as MarketItem[])
      } finally {
        setLoading(false)
      }
    }

    fetchAll()
    const id = setInterval(fetchAll, 10000)
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
      <div className="p-2 space-y-1">
        <div className="text-xs font-semibold text-tv-text-dim uppercase tracking-wider px-1 pb-1">Crypto</div>
        {items.map(item => (
          <div key={item.symbol} className="flex items-center justify-between px-2 py-2 rounded hover:bg-tv-surface transition-colors">
            <div className="flex items-center gap-2">
              {item.changePercent >= 0
                ? <TrendingUp className="w-3.5 h-3.5 text-tv-green shrink-0" />
                : <TrendingDown className="w-3.5 h-3.5 text-tv-red shrink-0" />}
              <div>
                <div className="text-sm text-white font-mono font-semibold">{item.symbol.replace('USDT', '')}</div>
                <div className="text-xs text-tv-text-dim">{item.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-mono text-white">${formatPrice(item.price)}</div>
              <div className={`text-xs font-mono ${(item.changePercent ?? 0) >= 0 ? 'text-tv-green' : 'text-tv-red'}`}>
                {(item.changePercent ?? 0) >= 0 ? '+' : ''}{(item.changePercent ?? 0).toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
