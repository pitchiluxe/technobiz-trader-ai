'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWatchlistStore } from '@/stores/useWatchlistStore'
import { providerFactory } from '@/services/dataProviders/ProviderFactory'
import type { Quote } from '@/types/market'

export function useWatchlistTicker() {
  const { items, updateQuotes } = useWatchlistStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (items.length === 0) return
    try {
      const results = await Promise.allSettled(
        items.map(item => providerFactory.getForSymbol(item.symbol).fetchQuote(item.symbol))
      )
      const quotes: Record<string, Quote> = {}
      results.forEach((r, i) => {
        if (r.status === 'fulfilled') quotes[items[i].symbol] = r.value
      })
      updateQuotes(quotes)
    } catch {}
  }, [items, updateQuotes])

  useEffect(() => {
    fetchQuotes()
    timerRef.current = setInterval(fetchQuotes, 5000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [fetchQuotes])
}

export function useTickerPrice(symbol: string) {
  const quotes = useWatchlistStore(s => s.quotes)
  return quotes[symbol] ?? null
}
