'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Candle, TimeFrame } from '@/types/market'
import { providerFactory } from '@/services/dataProviders/ProviderFactory'

interface UseChartDataOptions {
  symbol: string
  timeframe: TimeFrame
  limit?: number
  enabled?: boolean
}

interface UseChartDataResult {
  candles: Candle[]
  isLoading: boolean
  error: string | null
  refetch: () => void
  lastUpdate: number
}

export function useChartData({
  symbol,
  timeframe,
  limit = 300,
  enabled = true,
}: UseChartDataOptions): UseChartDataResult {
  const [candles, setCandles] = useState<Candle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState(0)
  const unsubRef = useRef<(() => void) | null>(null)
  const prevKey = useRef('')

  const fetchCandles = useCallback(async () => {
    if (!symbol || !enabled) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(
        `/api/market/candles?symbol=${encodeURIComponent(symbol)}&timeframe=${timeframe}&limit=${limit}`
      )
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data: Candle[] = await res.json()
      setCandles(data)
      setLastUpdate(Date.now())
    } catch (err) {
      setError(String(err))
      // fallback to mock
      try {
        const mock = providerFactory.getMock()
        const data = await mock.fetchCandles({ symbol, timeframe, limit })
        setCandles(data)
        setLastUpdate(Date.now())
      } catch {}
    } finally {
      setIsLoading(false)
    }
  }, [symbol, timeframe, limit, enabled])

  useEffect(() => {
    const key = `${symbol}-${timeframe}`
    if (prevKey.current === key) return
    prevKey.current = key

    // Clean up previous subscription
    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }

    fetchCandles()

    // Subscribe to live updates (only for crypto/binance)
    const provider = providerFactory.getForSymbol(symbol)
    if (provider.subscribeToCandleUpdates) {
      unsubRef.current = provider.subscribeToCandleUpdates(symbol, timeframe, (newCandle) => {
        setCandles(prev => {
          if (prev.length === 0) return [newCandle]
          const last = prev[prev.length - 1]
          if (last.time === newCandle.time) {
            return [...prev.slice(0, -1), newCandle]
          }
          return [...prev.slice(-limit + 1), newCandle]
        })
        setLastUpdate(Date.now())
      })
    }

    return () => { if (unsubRef.current) { unsubRef.current(); unsubRef.current = null } }
  }, [symbol, timeframe, fetchCandles, limit])

  return { candles, isLoading, error, refetch: fetchCandles, lastUpdate }
}
