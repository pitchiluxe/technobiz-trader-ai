'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useWatchlistStore } from '@/stores/useWatchlistStore'
import type { Quote } from '@/types/market'

export function useWatchlistTicker() {
  const { items, updateQuotes } = useWatchlistStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (items.length === 0) return
    const allSymbols = items.map(i => i.symbol)

    try {
      const promises = allSymbols.map(sym =>
        fetch(`/api/market/quote?symbol=${sym}`).then(r => r.ok ? r.json() : null)
      )
      const results = await Promise.all(promises)
      const quotes: Record<string, Quote> = {}
      results.forEach((q, i) => {
        if (q) quotes[allSymbols[i]] = q
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
