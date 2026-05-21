'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Candle, TimeFrame } from '@/types/market'
import { isCryptoSymbol } from '@/lib/symbolMap'
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
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevKey = useRef('')

  const fetchCandles = useCallback(async () => {
    if (!symbol || !enabled) return
    setIsLoading(true)
    setError(null)

    try {
      const provider = providerFactory.getForSymbol(symbol)
      const data = await provider.fetchCandles({ symbol, timeframe, limit })
      setCandles(data)
      setLastUpdate(Date.now())
    } catch (err) {
      setError(String(err))
    } finally {
      setIsLoading(false)
    }
  }, [symbol, timeframe, limit, enabled])

  useEffect(() => {
    const key = `${symbol}-${timeframe}`
    if (prevKey.current === key) return
    prevKey.current = key

    if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }

    fetchCandles()

    if (isCryptoSymbol(symbol)) {
      // Binance WebSocket for real-time candle updates
      const provider = providerFactory.getForSymbol(symbol)
      if (provider.subscribeToCandleUpdates) {
        unsubRef.current = provider.subscribeToCandleUpdates(symbol, timeframe, (newCandle) => {
          setCandles(prev => {
            if (prev.length === 0) return [newCandle]
            const last = prev[prev.length - 1]
            if (last.time === newCandle.time) return [...prev.slice(0, -1), newCandle]
            return [...prev.slice(-limit + 1), newCandle]
          })
          setLastUpdate(Date.now())
        })
      }
    } else {
      // Yahoo Finance has no WebSocket — poll every 60s
      pollRef.current = setInterval(fetchCandles, 60000)
    }

    return () => {
      if (unsubRef.current) { unsubRef.current(); unsubRef.current = null }
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    }
  }, [symbol, timeframe, fetchCandles, limit])

  return { candles, isLoading, error, refetch: fetchCandles, lastUpdate }
}
