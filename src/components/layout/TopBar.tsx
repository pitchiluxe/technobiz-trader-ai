'use client'

import { useState, useEffect, useRef } from 'react'
import { PanelLeft, PanelRight, ChevronDown, TrendingUp, BarChart2, LineChart, Activity, Trash2, Search, Wifi, WifiOff } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useChartData } from '@/hooks/useChartData'
import { generateId } from '@/lib/utils'
import LayoutSelector from './LayoutSelector'
import type { TimeFrame } from '@/types/market'
import type { IndicatorType, ChartPane } from '@/types/chart'

const CHART_TYPE_ICONS = {
  candlestick: BarChart2,
  line: LineChart,
  area: Activity,
} as const

const INDICATORS_LIST: { type: IndicatorType; label: string }[] = [
  { type: 'EMA', label: 'EMA 9' },
  { type: 'EMA', label: 'EMA 21' },
  { type: 'EMA', label: 'EMA 50' },
  { type: 'EMA', label: 'EMA 200' },
  { type: 'BB', label: 'Bollinger Bands' },
  { type: 'VWAP', label: 'VWAP' },
  { type: 'RSI', label: 'RSI 14' },
  { type: 'MACD', label: 'MACD' },
  { type: 'VOLUME', label: 'Volume' },
]

const COMPACT_TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
]

export default function TopBar() {
  const {
    layout, updatePane, setPaneTimeframe,
    toggleSidebarLeft, toggleSidebarRight,
    sidebarLeft, sidebarRight,
  } = useWorkspaceStore()

  const [isOnline, setIsOnline] = useState(true)
  const [showSymbolInput, setShowSymbolInput] = useState(false)
  const [symbolInput, setSymbolInput] = useState('')
  const [showIndicators, setShowIndicators] = useState(false)
  const indicatorRef = useRef<HTMLDivElement>(null)

  const activePane = (layout.panes as ChartPane[] | undefined)?.find(p => p.id === layout.activePane)
  const { analyzeMarket } = useAIAnalysis()
  const { candles } = useChartData({
    symbol: activePane?.symbol ?? 'BTCUSDT',
    timeframe: activePane?.timeframe ?? '1h',
    enabled: !!activePane,
  })

  useEffect(() => {
    const up = () => setIsOnline(true)
    const down = () => setIsOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (indicatorRef.current && !indicatorRef.current.contains(e.target as Node)) {
        setShowIndicators(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbolInput.trim() && activePane) {
      updatePane(activePane.id, { symbol: symbolInput.trim().toUpperCase() })
      setShowSymbolInput(false)
      setSymbolInput('')
    }
  }

  const addIndicator = (type: IndicatorType, label: string) => {
    if (!activePane) return
    setShowIndicators(false)

    if (type === 'VOLUME') {
      const existing = activePane.indicators.find(i => i.type === 'VOLUME')
      if (existing) {
        updatePane(activePane.id, { indicators: activePane.indicators.filter(i => i.id !== existing.id) })
      } else {
        updatePane(activePane.id, { indicators: [...activePane.indicators, { id: generateId(), type, params: { period: 0 }, visible: false }] })
      }
      return
    }
    if (type === 'MACD') {
      const existing = activePane.indicators.find(i => i.type === 'MACD')
      if (existing) {
        updatePane(activePane.id, { indicators: activePane.indicators.map(i => i.id === existing.id ? { ...i, visible: !i.visible } : i) })
      } else {
        updatePane(activePane.id, { indicators: [...activePane.indicators, { id: generateId(), type, params: { period: 0 }, visible: true }] })
      }
      return
    }
    const periodMatch = label.match(/\d+/)
    const period = periodMatch ? parseInt(periodMatch[0]) : 14
    const existing = activePane.indicators.find(i => i.type === type && i.params.period === period)
    if (existing) {
      updatePane(activePane.id, { indicators: activePane.indicators.map(i => i.id === existing.id ? { ...i, visible: !i.visible } : i) })
    } else {
      updatePane(activePane.id, { indicators: [...activePane.indicators, { id: generateId(), type, params: { period }, visible: true }] })
    }
  }

  const activeIndicatorCount = activePane?.indicators.filter(i => i.visible).length ?? 0

  return (
    <header className="h-9 flex items-center gap-0.5 px-2 bg-tv-surface border-b border-tv-border shrink-0 z-30 overflow-x-auto scrollbar-hide">
      {/* Logo */}
      <div className="flex items-center gap-1.5 mr-2 shrink-0">
        <div className="w-6 h-6 rounded bg-tv-accent flex items-center justify-center shrink-0">
          <TrendingUp className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-white font-bold text-xs tracking-wide hidden sm:block">TechnoBiz</span>
      </div>

      {/* Layout selector */}
      <LayoutSelector />

      <div className="w-px h-5 bg-tv-border mx-1 shrink-0" />

      {/* Symbol button */}
      {activePane && (
        <>
          {showSymbolInput ? (
            <form onSubmit={handleSymbolSubmit} className="flex items-center shrink-0">
              <input
                className="bg-tv-bg border border-tv-accent rounded px-2 py-0.5 text-xs text-tv-text w-24 focus:outline-none font-mono"
                value={symbolInput}
                onChange={e => setSymbolInput(e.target.value)}
                placeholder={activePane.symbol}
                autoFocus
                onBlur={() => { setShowSymbolInput(false); setSymbolInput('') }}
              />
            </form>
          ) : (
            <button
              onClick={() => setShowSymbolInput(true)}
              className="flex items-center gap-1 px-2 py-1 rounded text-white font-bold text-xs hover:bg-tv-surface-2 transition-colors shrink-0 font-mono"
            >
              <Search className="w-3 h-3 text-tv-text-dim" />
              {activePane.symbol}
              <ChevronDown className="w-3 h-3 text-tv-text-dim" />
            </button>
          )}

          <div className="w-px h-5 bg-tv-border mx-1 shrink-0" />

          {/* Timeframes */}
          <div className="flex items-center gap-px shrink-0">
            {COMPACT_TIMEFRAMES.map(tf => (
              <button
                key={tf.value}
                onClick={() => setPaneTimeframe(activePane.id, tf.value)}
                className={`px-1.5 py-0.5 text-[11px] rounded font-mono transition-colors ${
                  activePane.timeframe === tf.value
                    ? 'text-tv-accent font-bold'
                    : 'text-tv-text-dim hover:text-tv-text hover:bg-tv-surface-2'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-tv-border mx-1 shrink-0" />

          {/* Chart Type */}
          <div className="flex items-center gap-px shrink-0">
            {(Object.keys(CHART_TYPE_ICONS) as (keyof typeof CHART_TYPE_ICONS)[]).map(type => {
              const Icon = CHART_TYPE_ICONS[type]
              return (
                <button
                  key={type}
                  onClick={() => updatePane(activePane.id, { chartType: type })}
                  title={type}
                  className={`p-1 rounded transition-colors ${
                    activePane.chartType === type
                      ? 'text-tv-accent bg-tv-accent-dim'
                      : 'text-tv-text-dim hover:text-tv-text hover:bg-tv-surface-2'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              )
            })}
          </div>

          <div className="w-px h-5 bg-tv-border mx-1 shrink-0" />

          {/* Indicators */}
          <div className="relative shrink-0" ref={indicatorRef}>
            <button
              onClick={() => setShowIndicators(!showIndicators)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
                showIndicators || activeIndicatorCount > 0
                  ? 'text-tv-text bg-tv-surface-2'
                  : 'text-tv-text-dim hover:text-tv-text hover:bg-tv-surface-2'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Indicators</span>
              {activeIndicatorCount > 0 && (
                <span className="ml-0.5 text-tv-accent font-mono font-bold">({activeIndicatorCount})</span>
              )}
            </button>
            {showIndicators && (
              <div className="absolute top-full left-0 mt-0.5 bg-[#1e222d] border border-tv-border rounded shadow-2xl z-50 w-52 py-1">
                <div className="px-3 py-1 text-[10px] text-tv-text-dim uppercase tracking-widest font-semibold">Overlays</div>
                {INDICATORS_LIST.filter(i => !['RSI','MACD'].includes(i.type)).map(({ type, label }) => {
                  const periodMatch = label.match(/\d+/)
                  const period = periodMatch ? parseInt(periodMatch[0]) : 14
                  const active = type === 'VOLUME'
                    ? activePane.indicators.some(i => i.type === 'VOLUME')
                    : activePane.indicators.some(i => i.type === type && (i.params.period === period || type === 'BB' || type === 'VWAP') && i.visible)
                  return (
                    <button key={label} onClick={() => addIndicator(type, label)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[12px] hover:bg-tv-surface-2 transition-colors ${active ? 'text-tv-accent' : 'text-tv-text'}`}>
                      <span>{label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-tv-accent" />}
                    </button>
                  )
                })}
                <div className="h-px bg-tv-border my-1 mx-2" />
                <div className="px-3 py-1 text-[10px] text-tv-text-dim uppercase tracking-widest font-semibold">Oscillators</div>
                {INDICATORS_LIST.filter(i => ['RSI','MACD'].includes(i.type)).map(({ type, label }) => {
                  const active = activePane.indicators.some(i => i.type === type && i.visible)
                  return (
                    <button key={label} onClick={() => addIndicator(type, label)}
                      className={`w-full flex items-center justify-between px-3 py-1.5 text-[12px] hover:bg-tv-surface-2 transition-colors ${active ? 'text-tv-accent' : 'text-tv-text'}`}>
                      <span>{label}</span>
                      {active && <span className="w-1.5 h-1.5 rounded-full bg-tv-accent" />}
                    </button>
                  )
                })}
                {activePane.indicators.length > 0 && (
                  <>
                    <div className="h-px bg-tv-border my-1 mx-2" />
                    <button
                      onClick={() => { updatePane(activePane.id, { indicators: [] }); setShowIndicators(false) }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[12px] text-tv-red hover:bg-tv-surface-2 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear all
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* AI Analyze button */}
      {activePane && (
        <button
          onClick={() => analyzeMarket({ symbol: activePane.symbol, timeframe: activePane.timeframe, candles, includeTradeSetup: true })}
          className="flex items-center gap-1.5 px-2.5 py-1 mr-2 rounded text-[11px] font-semibold bg-tv-accent hover:bg-tv-accent-hover text-white transition-colors shrink-0"
        >
          <Activity className="w-3 h-3" />
          Analyze
        </button>
      )}

      {/* Connection */}
      <div className={`flex items-center gap-1 mr-1 text-[11px] font-mono shrink-0 ${isOnline ? 'text-tv-green' : 'text-tv-red'}`}>
        {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
        <span className="hidden md:inline">{isOnline ? 'Live' : 'Off'}</span>
      </div>

      <div className="w-px h-5 bg-tv-border mx-1 shrink-0" />

      {/* Panel toggles */}
      <button
        onClick={toggleSidebarLeft}
        title="Toggle Watchlist"
        className={`p-1 rounded transition-colors ${sidebarLeft ? 'text-tv-text bg-tv-surface-2' : 'text-tv-text-dim hover:text-tv-text hover:bg-tv-surface-2'}`}
      >
        <PanelLeft className="w-4 h-4" />
      </button>
      <button
        onClick={toggleSidebarRight}
        title="Toggle AI Panel"
        className={`p-1 rounded transition-colors ${sidebarRight ? 'text-tv-text bg-tv-surface-2' : 'text-tv-text-dim hover:text-tv-text hover:bg-tv-surface-2'}`}
      >
        <PanelRight className="w-4 h-4" />
      </button>
    </header>
  )
}
