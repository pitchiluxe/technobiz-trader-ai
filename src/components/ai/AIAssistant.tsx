'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { ChartPane } from '@/types/chart'
import { Send, Bot, User, Zap, Trash2 } from 'lucide-react'
import { useAIStore } from '@/stores/useAIStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useChartData } from '@/hooks/useChartData'
import AISignalCard from './AISignalCard'
import { cn } from '@/lib/utils'

export default function AIAssistant() {
  const { messages, clearMessages, isAnalyzing } = useAIStore()
  const { layout } = useWorkspaceStore()
  const [input, setInput] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const activePane = layout.panes?.find((p: ChartPane) => p.id === layout.activePane)
  const activeSymbol = activePane?.symbol ?? 'BTCUSDT'
  const activeTimeframe = activePane?.timeframe ?? '1h'

  const { candles } = useChartData({ symbol: activeSymbol, timeframe: activeTimeframe, limit: 50 })
  const { analyzeMarket, sendMessage } = useAIAnalysis()

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages])

  const handleAnalyze = useCallback(() => {
    analyzeMarket({ symbol: activeSymbol, timeframe: activeTimeframe, candles, includeTradeSetup: true })
  }, [analyzeMarket, activeSymbol, activeTimeframe, candles])

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing) return
    const msg = input.trim()
    setInput('')
    const history = messages.slice(-6).map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }))
    await sendMessage(msg, history)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit() }
  }

  return (
    <div className="flex flex-col h-full bg-tv-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-3 h-9 shrink-0 border-b border-tv-border">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isAnalyzing ? 'bg-tv-yellow animate-pulse' : 'bg-tv-green'}`} />
          <span className="text-[11px] font-semibold text-tv-text-dim uppercase tracking-widest">AI Signals</span>
          <span className="text-[11px] font-mono text-tv-accent">{activeSymbol}</span>
        </div>
        <button onClick={clearMessages} className="p-1 rounded text-tv-text-dim hover:text-tv-red transition-colors">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Quick Analyze */}
      <div className="px-2 py-2 border-b border-tv-border shrink-0">
        <button
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full flex items-center justify-center gap-2 py-1.5 rounded text-[12px] font-semibold bg-tv-accent hover:bg-tv-accent-hover text-white transition-colors disabled:opacity-60"
        >
          {isAnalyzing ? (
            <>
              <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="w-3.5 h-3.5" />
              Analyze {activeSymbol} · {activeTimeframe.toUpperCase()}
            </>
          )}
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-2 py-2 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="w-10 h-10 rounded-full bg-tv-surface-2 border border-tv-border flex items-center justify-center">
              <Bot className="w-5 h-5 text-tv-text-dim" />
            </div>
            <p className="text-[12px] text-tv-text-dim">Click Analyze to get a signal</p>
          </div>
        )}

        {(messages as import('@/types/ai').AIMessage[]).map(msg => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn(
              'w-6 h-6 rounded-full flex items-center justify-center shrink-0 border',
              msg.role === 'user' ? 'bg-tv-accent-dim border-tv-accent/30' : 'bg-tv-surface-2 border-tv-border'
            )}>
              {msg.role === 'user'
                ? <User className="w-3 h-3 text-tv-accent" />
                : <Bot className="w-3 h-3 text-tv-text-dim" />}
            </div>

            <div className={cn('flex-1 min-w-0', msg.role === 'user' ? 'text-right' : 'text-left')}>
              {msg.content && (
                <div className={cn(
                  'inline-block rounded px-2.5 py-1.5 text-[12px] leading-relaxed max-w-full',
                  msg.role === 'user'
                    ? 'bg-tv-accent-dim text-white rounded-tr-sm'
                    : 'bg-tv-surface-2 text-tv-text rounded-tl-sm'
                )}>
                  <span className="whitespace-pre-wrap break-words">{msg.content}</span>
                  {msg.isStreaming && <span className="inline-block w-1 h-3 bg-tv-accent ml-0.5 animate-pulse" />}
                </div>
              )}
              {!msg.content && msg.isStreaming && (
                <div className="inline-flex gap-1 px-2.5 py-2 bg-tv-surface-2 rounded">
                  {[0,150,300].map(d => (
                    <span key={d} className="w-1 h-1 bg-tv-text-dim rounded-full animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              )}
              {msg.tradeSetup && (
                <div className="mt-1.5">
                  <AISignalCard setup={msg.tradeSetup} analysis={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-tv-border shrink-0">
        <div className="flex gap-1.5 items-center">
          <input
            className="flex-1 bg-tv-bg border border-tv-border rounded px-2 py-1.5 text-[12px] text-tv-text placeholder:text-tv-text-dim focus:outline-none focus:border-tv-accent"
            placeholder="Ask about market..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
          />
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isAnalyzing}
            className="p-1.5 rounded bg-tv-accent hover:bg-tv-accent-hover text-white transition-colors disabled:opacity-50 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
