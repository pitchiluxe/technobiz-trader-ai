'use client'

import { useState } from 'react'
import { ChevronDown, TrendingUp, BarChart2, LineChart, Activity, Plus, Trash2, Search, RotateCcw } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useChartData } from '@/hooks/useChartData'
import { Button } from '@/components/ui/button'
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
  const { layout, setActivePane, updatePane, setPaneTimeframe } = useWorkspaceStore()
  const [showIndicators, setShowIndicators] = useState(false)
  const [showSymbolInput, setShowSymbolInput] = useState(false)
  const [symbolInput, setSymbolInput] = useState('')

  const activePane = (layout.panes as import('@/types/chart').ChartPane[]).find(p => p.id === layout.activePane)
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
    const periodMatch = label.match(/\d+/)
    const period = periodMatch ? parseInt(periodMatch[0]) : 14
    const existing = activePane.indicators.find(i => i.type === type && i.params.period === period)
    if (existing) return

    const ind = { id: generateId(), type, params: { period }, visible: true }
    updatePane(activePane.id, { indicators: [...activePane.indicators, ind] })
    setShowIndicators(false)
  }

  const handleAIAnalysis = () => {
    analyzeMarket({
      symbol: activePane.symbol,
      timeframe: activePane.timeframe,
      candles,
      includeTradeSetup: true,
    })
  }

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-tv-surface border-b border-tv-border overflow-x-auto scrollbar-hide">
      {/* Symbol */}
      <div className="flex items-center gap-1 mr-1">
        {showSymbolInput ? (
          <form onSubmit={handleSymbolSubmit} className="flex items-center gap-1">
            <input
              className="bg-tv-bg border border-tv-accent rounded px-2 py-0.5 text-sm text-white w-24 focus:outline-none"
              value={symbolInput}
              onChange={e => setSymbolInput(e.target.value)}
              placeholder={activePane.symbol}
              autoFocus
              onBlur={() => { setShowSymbolInput(false); setSymbolInput('') }}
            />
          </form>
        ) : (
          <button
            className="flex items-center gap-1 text-white font-bold text-sm px-2 py-1 rounded hover:bg-tv-border transition-colors"
            onClick={() => setShowSymbolInput(true)}
          >
            <Search className="w-3 h-3 text-tv-text-dim" />
            <span className="font-mono">{activePane.symbol}</span>
            <ChevronDown className="w-3 h-3 text-tv-text-dim" />
          </button>
        )}
      </div>

      <div className="w-px h-5 bg-tv-border mx-1" />

      {/* Timeframes */}
      <div className="flex items-center gap-0.5">
        {TIMEFRAMES.map(tf => (
          <button
            key={tf.value}
            onClick={() => handleTimeframe(tf.value)}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              activePane.timeframe === tf.value
                ? 'bg-tv-accent text-white'
                : 'text-tv-text-dim hover:text-white hover:bg-tv-border'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-tv-border mx-1" />

      {/* Chart Type */}
      <div className="flex items-center gap-0.5">
        {(Object.keys(CHART_TYPE_ICONS) as (keyof typeof CHART_TYPE_ICONS)[]).map(type => {
          const Icon = CHART_TYPE_ICONS[type]
          return (
            <button
              key={type}
              onClick={() => updatePane(activePane.id, { chartType: type })}
              className={`p-1.5 rounded transition-colors ${
                activePane.chartType === type
                  ? 'bg-tv-accent text-white'
                  : 'text-tv-text-dim hover:text-white hover:bg-tv-border'
              }`}
              title={type}
            >
              <Icon className="w-4 h-4" />
            </button>
          )
        })}
      </div>

      <div className="w-px h-5 bg-tv-border mx-1" />

      {/* Indicators */}
      <div className="relative">
        <button
          onClick={() => setShowIndicators(!showIndicators)}
          className="flex items-center gap-1 text-tv-text-dim hover:text-white hover:bg-tv-border px-2 py-1 rounded text-xs transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Indicators</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {showIndicators && (
          <div className="absolute top-full left-0 mt-1 bg-tv-surface border border-tv-border rounded-lg shadow-xl z-50 min-w-[180px] py-1">
            {INDICATORS_LIST.map(({ type, label }) => (
              <button
                key={label}
                onClick={() => addIndicator(type, label)}
                className="w-full text-left px-3 py-1.5 text-sm text-tv-text hover:bg-tv-border hover:text-white transition-colors"
              >
                {label}
              </button>
            ))}
            {activePane.indicators.length > 0 && (
              <>
                <div className="h-px bg-tv-border my-1" />
                <button
                  onClick={() => {
                    updatePane(activePane.id, { indicators: [] })
                    setShowIndicators(false)
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-tv-red hover:bg-tv-border transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear all
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* AI Analyze Button */}
      <Button
        size="sm"
        variant="default"
        onClick={handleAIAnalysis}
        className="text-xs h-7 gap-1.5 shrink-0"
      >
        <Activity className="w-3.5 h-3.5" />
        AI Analyze
      </Button>
    </div>
  )
}
