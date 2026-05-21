'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, BarChart2, LineChart, Activity, Trash2, Search, Zap } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useChartData } from '@/hooks/useChartData'
import { TIMEFRAMES } from '@/lib/constants'
import type { TimeFrame } from '@/types/market'
import type { IndicatorType } from '@/types/chart'
import { generateId } from '@/lib/utils'

const CHART_TYPE_ICONS = {
  candlestick: BarChart2,
  line: LineChart,
  area: Activity,
}

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

export default function ChartToolbar() {
  const { layout, updatePane, setPaneTimeframe } = useWorkspaceStore()
  const [showIndicators, setShowIndicators] = useState(false)
  const [showSymbolInput, setShowSymbolInput] = useState(false)
  const [symbolInput, setSymbolInput] = useState('')

  const activePane = (layout.panes as import('@/types/chart').ChartPane[] | undefined)?.find(p => p.id === layout.activePane)
  const { analyzeMarket } = useAIAnalysis()
  const { candles } = useChartData({
    symbol: activePane?.symbol ?? 'BTCUSDT',
    timeframe: activePane?.timeframe ?? '1h',
    enabled: !!activePane,
  })

  if (!activePane) return null

  const handleTimeframe = (tf: TimeFrame) => setPaneTimeframe(activePane.id, tf)

  const handleSymbolSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (symbolInput.trim()) {
      updatePane(activePane.id, { symbol: symbolInput.trim().toUpperCase() })
      setShowSymbolInput(false)
      setSymbolInput('')
    }
  }

  const addIndicator = (type: IndicatorType, label: string) => {
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
        updatePane(activePane.id, {
          indicators: activePane.indicators.map(i => i.id === existing.id ? { ...i, visible: !i.visible } : i),
        })
      } else {
        updatePane(activePane.id, { indicators: [...activePane.indicators, { id: generateId(), type, params: { period: 0 }, visible: true }] })
      }
      return
    }

    const periodMatch = label.match(/\d+/)
    const period = periodMatch ? parseInt(periodMatch[0]) : 14
    const existing = activePane.indicators.find(i => i.type === type && i.params.period === period)
    if (existing) {
      updatePane(activePane.id, {
        indicators: activePane.indicators.map(i => i.id === existing.id ? { ...i, visible: !i.visible } : i),
      })
      return
    }

    updatePane(activePane.id, {
      indicators: [...activePane.indicators, { id: generateId(), type, params: { period }, visible: true }],
    })
  }

  const handleAIAnalysis = () => {
    analyzeMarket({ symbol: activePane.symbol, timeframe: activePane.timeframe, candles, includeTradeSetup: true })
  }

  return (
    <div className="flex items-center gap-0.5 px-2 h-9 bg-tv-surface border-b border-tv-border overflow-x-auto scrollbar-hide shrink-0">
      {/* Symbol */}
      <div className="flex items-center mr-1">
        {showSymbolInput ? (
          <form onSubmit={handleSymbolSubmit} className="flex items-center gap-1">
            <input
              className="bg-tv-bg border border-tv-accent rounded px-2 py-0.5 text-xs text-white w-24 focus:outline-none font-mono"
              value={symbolInput}
              onChange={e => setSymbolInput(e.target.value)}
              placeholder={activePane.symbol}
              autoFocus
              onBlur={() => { setShowSymbolInput(false); setSymbolInput('') }}
            />
          </form>
        ) : (
          <button
            className="flex items-center gap-1 text-white font-bold text-xs px-2 py-1 rounded hover:bg-tv-border transition-colors font-mono"
            onClick={() => setShowSymbolInput(true)}
          >
            <Search className="w-3 h-3 text-tv-text-dim" />
            <span>{activePane.symbol}</span>
            <ChevronDown className="w-3 h-3 text-tv-text-dim" />
          </button>
        )}
      </div>

      <div className="w-px h-4 bg-tv-border mx-1 shrink-0" />

      {/* Timeframes */}
      <div className="flex items-center gap-px">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => handleTimeframe(tf.value)}
            className={`px-1.5 py-0.5 text-[11px] rounded font-mono transition-colors ${
              activePane.timeframe === tf.value
                ? 'bg-tv-accent text-white font-semibold'
                : 'text-tv-text-dim hover:text-white hover:bg-tv-border'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="w-px h-4 bg-tv-border mx-1 shrink-0" />

      {/* Chart Type */}
      <div className="flex items-center gap-px">
        {(Object.keys(CHART_TYPE_ICONS) as (keyof typeof CHART_TYPE_ICONS)[]).map(type => {
          const Icon = CHART_TYPE_ICONS[type]
          return (
            <button
              key={type}
              onClick={() => updatePane(activePane.id, { chartType: type })}
              className={`p-1 rounded transition-colors ${
                activePane.chartType === type
                  ? 'bg-tv-accent text-white'
                  : 'text-tv-text-dim hover:text-white hover:bg-tv-border'
              }`}
              title={type}
            >
              <Icon className="w-3.5 h-3.5" />
            </button>
          )
        })}
      </div>

      <div className="w-px h-4 bg-tv-border mx-1 shrink-0" />

      {/* Indicators */}
      <div className="relative">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] transition-colors ${
            showIndicators ? 'bg-tv-border text-white' : 'text-tv-text-dim hover:text-white hover:bg-tv-border'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Indicators</span>
          {activePane.indicators.length > 0 && (
            <span className="bg-tv-accent text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-mono">
              {activePane.indicators.filter(i => i.visible).length}
            </span>
          )}
          <ChevronDown className={`w-3 h-3 transition-transform ${showIndicators ? 'rotate-180' : ''}`} />
        </button>

        {showIndicators && (
          <div className="absolute top-full left-0 mt-1 bg-tv-surface-2 border border-tv-border rounded-lg shadow-2xl z-50 min-w-[200px] py-1 backdrop-blur-sm">
            <div className="px-3 py-1.5 text-[10px] text-tv-text-dim uppercase tracking-wider font-semibold border-b border-tv-border mb-1">
              Overlay Indicators
            </div>
            {INDICATORS_LIST.filter(i => !['RSI', 'MACD'].includes(i.type)).map(({ type, label }) => {
              const periodMatch = label.match(/\d+/)
              const period = periodMatch ? parseInt(periodMatch[0]) : 0
              const isActive = type === 'VOLUME'
                ? activePane.indicators.some(i => i.type === 'VOLUME')
                : activePane.indicators.some(i => i.type === type && i.params.period === period && i.visible)
              return (
                <button
                  key={label}
                  onClick={() => addIndicator(type, label)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                    isActive ? 'text-tv-accent' : 'text-tv-text hover:bg-tv-border hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-tv-accent" />}
                </button>
              )
            })}
            <div className="px-3 py-1.5 text-[10px] text-tv-text-dim uppercase tracking-wider font-semibold border-t border-b border-tv-border my-1">
              Oscillators
            </div>
            {INDICATORS_LIST.filter(i => ['RSI', 'MACD'].includes(i.type)).map(({ type, label }) => {
              const isActive = activePane.indicators.some(i => i.type === type && i.visible)
              return (
                <button
                  key={label}
                  onClick={() => addIndicator(type, label)}
                  className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                    isActive ? 'text-tv-accent' : 'text-tv-text hover:bg-tv-border hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-tv-accent" />}
                </button>
              )
            })}
            {activePane.indicators.length > 0 && (
              <>
                <div className="h-px bg-tv-border my-1" />
                <button
                  onClick={() => { updatePane(activePane.id, { indicators: [] }); setShowIndicators(false) }}
                  className="w-full text-left px-3 py-1.5 text-xs text-tv-red hover:bg-tv-border transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all indicators
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* AI Analyze */}
      <button
        onClick={handleAIAnalysis}
        className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-tv-accent hover:bg-tv-accent-hover text-white transition-colors shrink-0"
      >
        <Zap className="w-3.5 h-3.5" fill="white" />
        AI Analyze
      </button>
    </div>
  )
}
