'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useChartData } from '@/hooks/useChartData'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { calcEMA, calcBollingerBands, calcVWAP } from '@/lib/indicators'
import { CHART_COLORS, INDICATOR_COLORS } from '@/lib/constants'
import type { ChartPane } from '@/types/chart'
import type { Candle } from '@/types/market'

// Lightweight charts types (inline to avoid static module resolution issues)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LC = any

interface Props {
  pane: ChartPane
  isActive: boolean
  onActivate: () => void
}

export default function ChartWidget({ pane, isActive, onActivate }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<LC>(null)
  const seriesRef = useRef<LC>(null)
  const volumeSeriesRef = useRef<LC>(null)
  const indicatorSeriesRef = useRef<Map<string, LC>>(new Map())
  const [chartReady, setChartReady] = useState(false)
  const cleanupRef = useRef<(() => void) | null>(null)
  const { updatePane } = useWorkspaceStore()

  const { candles, isLoading } = useChartData({
    symbol: pane.symbol,
    timeframe: pane.timeframe,
    limit: 300,
  })

  const initChart = useCallback(async () => {
    if (!containerRef.current) return
    if (chartRef.current) {
      try { chartRef.current.remove() } catch {}
      chartRef.current = null
      seriesRef.current = null
      volumeSeriesRef.current = null
    }

    const lc = await import('lightweight-charts' as string)
    const { createChart, CrosshairMode, LineStyle } = lc

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: CHART_COLORS.background },
        textColor: CHART_COLORS.text,
        fontSize: 11,
        fontFamily: 'JetBrains Mono, Fira Code, monospace',
      },
      grid: {
        vertLines: { color: CHART_COLORS.grid, style: LineStyle.Solid },
        horzLines: { color: CHART_COLORS.grid, style: LineStyle.Solid },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: '#787B86', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#2D3148' },
        horzLine: { color: '#787B86', width: 1, style: LineStyle.Dashed, labelBackgroundColor: '#2D3148' },
      },
      rightPriceScale: {
        borderColor: CHART_COLORS.grid,
        textColor: CHART_COLORS.text,
        scaleMargins: { top: 0.1, bottom: 0.2 },
      },
      timeScale: {
        borderColor: CHART_COLORS.grid,
        textColor: CHART_COLORS.text,
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: { mouseWheel: true, pressedMouseMove: true, horzTouchDrag: true, vertTouchDrag: false },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    })

    const candleSeries = chart.addCandlestickSeries({
      upColor: CHART_COLORS.upColor,
      downColor: CHART_COLORS.downColor,
      borderUpColor: CHART_COLORS.borderUpColor,
      borderDownColor: CHART_COLORS.borderDownColor,
      wickUpColor: CHART_COLORS.wickUpColor,
      wickDownColor: CHART_COLORS.wickDownColor,
    })

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    })

    chartRef.current = chart
    seriesRef.current = candleSeries
    volumeSeriesRef.current = volumeSeries
    setChartReady(true)

    const ro = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry && chartRef.current) {
        chartRef.current.applyOptions({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    ro.observe(containerRef.current)

    return () => {
      ro.disconnect()
      try { chart.remove() } catch {}
      chartRef.current = null
    }
  }, [])

  useEffect(() => {
    initChart().then(fn => {
      if (fn) cleanupRef.current = fn
    })
    return () => {
      if (cleanupRef.current) cleanupRef.current()
      cleanupRef.current = null
      chartRef.current = null
      seriesRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pane.id])

  const updateIndicators = useCallback(async (sorted: Candle[]) => {
    if (!chartRef.current) return

    // Volume: hidden when VOLUME indicator is in the list, shown by default
    const hasVolumeIndicator = pane.indicators.some(i => i.type === 'VOLUME')
    volumeSeriesRef.current?.applyOptions({ visible: !hasVolumeIndicator })

    indicatorSeriesRef.current.forEach(s => {
      try { chartRef.current?.removeSeries(s) } catch {}
    })
    indicatorSeriesRef.current.clear()

    for (const ind of pane.indicators) {
      if (!ind.visible || ind.type === 'VOLUME') continue
      try {
        if (ind.type === 'EMA') {
          const period = (ind.params.period as number) ?? 20
          const emas = calcEMA(sorted.map(c => c.close), period)
          const colorMap: Record<number, string> = { 9: INDICATOR_COLORS.EMA_9, 21: INDICATOR_COLORS.EMA_21, 50: INDICATOR_COLORS.EMA_50, 200: INDICATOR_COLORS.EMA_200 }
          const series = chartRef.current.addLineSeries({
            color: ind.color ?? colorMap[period] ?? '#2962FF',
            lineWidth: 1,
            priceLineVisible: false,
            lastValueVisible: false,
          })
          series.setData(sorted.map((c, i) => ({ time: c.time, value: emas[i] })).filter((d: LC) => !isNaN(d.value)))
          indicatorSeriesRef.current.set(ind.id, series)
        }

        if (ind.type === 'BB') {
          const bb = calcBollingerBands(sorted)
          for (const [key, data, color] of [
            ['upper', bb.upper, INDICATOR_COLORS.BB_upper],
            ['middle', bb.middle, INDICATOR_COLORS.BB_middle],
            ['lower', bb.lower, INDICATOR_COLORS.BB_lower],
          ] as [string, (number | null)[], string][]) {
            const s = chartRef.current.addLineSeries({ color, lineWidth: 1, priceLineVisible: false, lastValueVisible: false })
            s.setData(sorted.map((c, i) => ({ time: c.time, value: data[i] ?? 0 })).filter((_: LC, i: number) => data[i] !== null))
            indicatorSeriesRef.current.set(`${ind.id}-${key}`, s)
          }
        }

        if (ind.type === 'VWAP') {
          const vwap = calcVWAP(sorted)
          const s = chartRef.current.addLineSeries({ color: INDICATOR_COLORS.VWAP, lineWidth: 2, priceLineVisible: false, lastValueVisible: true })
          s.setData(sorted.map((c, i) => ({ time: c.time, value: vwap[i] })))
          indicatorSeriesRef.current.set(ind.id, s)
        }
      } catch {}
    }
  }, [pane.indicators])

  useEffect(() => {
    if (!chartReady || !seriesRef.current || !volumeSeriesRef.current || candles.length === 0) return

    const sorted = [...candles].sort((a, b) => a.time - b.time)

    seriesRef.current.setData(sorted.map((c: Candle) => ({
      time: c.time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    })))

    volumeSeriesRef.current.setData(sorted.map((c: Candle) => ({
      time: c.time,
      value: c.volume,
      color: c.close >= c.open ? `${CHART_COLORS.upColor}88` : `${CHART_COLORS.downColor}88`,
    })))

    updateIndicators(sorted)
    chartRef.current?.timeScale().fitContent()
  }, [candles, chartReady, updateIndicators])

  // Re-init chart when symbol/timeframe changes
  useEffect(() => {
    if (chartReady) {
      setChartReady(false)
      initChart().then(fn => {
        if (fn) {
          if (cleanupRef.current) cleanupRef.current()
          cleanupRef.current = fn
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pane.symbol, pane.timeframe])

  return (
    <div
      className={`relative w-full h-full flex flex-col overflow-hidden cursor-crosshair ${isActive ? 'ring-1 ring-tv-accent ring-inset' : ''}`}
      onClick={onActivate}
    >
      {/* Chart Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 px-2 pt-1 pointer-events-none">
        <span className="text-white font-bold text-sm font-mono drop-shadow">{pane.symbol}</span>
        <span className="text-tv-text-dim text-xs drop-shadow">{pane.timeframe.toUpperCase()}</span>
        {isLoading && (
          <span className="text-tv-text-dim text-xs animate-pulse drop-shadow">Loading...</span>
        )}
        {pane.indicators.map(ind => (
          <button
            key={ind.id}
            onClick={(e) => {
              e.stopPropagation()
              updatePane(pane.id, {
                indicators: pane.indicators.map(i =>
                  i.id === ind.id ? { ...i, visible: !i.visible } : i
                ),
              })
            }}
            title={ind.visible ? 'Click to hide' : 'Click to show'}
            className={`text-xs drop-shadow px-1 rounded transition-colors pointer-events-auto ${
              ind.visible
                ? 'text-tv-accent hover:text-tv-red'
                : 'text-tv-text-dim/40 line-through hover:text-tv-text-dim'
            }`}
          >
            {ind.type}{ind.params?.period ? ` ${ind.params.period}` : ''}
          </button>
        ))}
      </div>

      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
