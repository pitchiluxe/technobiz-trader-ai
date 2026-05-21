'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import type { ChartPane } from '@/types/chart'
import { Send, Bot, User, Zap, Settings, Trash2, TrendingUp } from 'lucide-react'
import { useAIStore } from '@/stores/useAIStore'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import { useAIAnalysis } from '@/hooks/useAIAnalysis'
import { useChartData } from '@/hooks/useChartData'
import { AVAILABLE_MODELS } from '@/types/ai'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import AISignalCard from './AISignalCard'
import { cn } from '@/lib/utils'

const QUICK_COMMANDS = [
  { label: 'Analyze', icon: TrendingUp, prompt: (s: string) => `Analyze ${s} and give me a full trade setup` },
  { label: 'Bias', icon: Zap, prompt: (s: string) => `What is the current market bias on ${s}?` },
]

export default function AIAssistant() {
  const { messages, clearMessages, isAnalyzing, selectedModel, setModel, emailRecipient, setEmailRecipient } = useAIStore()
  const { layout } = useWorkspaceStore()
  const [input, setInput] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [emailInput, setEmailInput] = useState(emailRecipient)
  const scrollRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const activePane = layout.panes.find((p: ChartPane) => p.id === layout.activePane)
  const activeSymbol = activePane?.symbol ?? 'BTCUSDT'
  const activeTimeframe = activePane?.timeframe ?? '1h'

  const { candles } = useChartData({
    symbol: activeSymbol,
    timeframe: activeTimeframe,
    limit: 50,
  })

  const { analyzeMarket, sendMessage } = useAIAnalysis()

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSubmit = async () => {
    if (!input.trim() || isAnalyzing) return

    const msg = input.trim()
    setInput('')

    const isAnalysisRequest =
      msg.toLowerCase().includes('analyze') ||
      msg.toLowerCase().includes('setup') ||
      msg.toLowerCase().includes('trade') ||
      msg.toLowerCase().includes('signal') ||
      msg.toLowerCase().includes('buy') ||
      msg.toLowerCase().includes('sell') ||
      msg.toLowerCase().includes('entry')

    if (isAnalysisRequest) {
      await analyzeMarket({
        symbol: activeSymbol,
        timeframe: activeTimeframe,
        candles,
        question: msg,
        includeTradeSetup: true,
      })
    } else {
      const history = messages.slice(-10).map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))
      await sendMessage(msg, history)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="flex flex-col h-full bg-tv-bg">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-tv-border">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-tv-green rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-white">AI Analyst</span>
          <span className="text-xs text-tv-text-dim">{activeSymbol}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded text-tv-text-dim hover:text-white hover:bg-tv-surface transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearMessages}
            className="p-1.5 rounded text-tv-text-dim hover:text-tv-red hover:bg-tv-surface transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="border-b border-tv-border bg-tv-surface p-3 space-y-3">
          <div>
            <label className="text-xs text-tv-text-dim mb-1 block">AI Model</label>
            <select
              className="w-full bg-tv-bg border border-tv-border rounded px-2 py-1.5 text-xs text-tv-text focus:outline-none focus:border-tv-accent"
              value={selectedModel}
              onChange={e => setModel(e.target.value)}
            >
              {AVAILABLE_MODELS.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-tv-text-dim mb-1 block">Signal Email</label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-tv-bg border border-tv-border rounded px-2 py-1.5 text-xs text-tv-text focus:outline-none focus:border-tv-accent"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="email@example.com"
              />
              <Button size="sm" className="text-xs h-7 shrink-0" onClick={() => { setEmailRecipient(emailInput); setShowSettings(false) }}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Commands */}
      <div className="flex gap-1 p-2 border-b border-tv-border">
        {QUICK_COMMANDS.map(cmd => (
          <button
            key={cmd.label}
            onClick={() => analyzeMarket({
              symbol: activeSymbol,
              timeframe: activeTimeframe,
              candles,
              question: cmd.prompt(activeSymbol),
              includeTradeSetup: true,
            })}
            disabled={isAnalyzing}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-tv-surface border border-tv-border rounded hover:bg-tv-border hover:text-white text-tv-text-dim transition-colors disabled:opacity-50"
          >
            <cmd.icon className="w-3 h-3" />
            {cmd.label}
          </button>
        ))}
        <span className="text-xs text-tv-text-dim ml-auto self-center font-mono">{selectedModel.split('/').pop()?.split(':')[0]}</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-8">
            <div className="w-12 h-12 rounded-full bg-tv-surface border border-tv-border flex items-center justify-center">
              <Bot className="w-6 h-6 text-tv-accent" />
            </div>
            <div>
              <p className="text-sm text-white font-semibold">AI Trading Analyst</p>
              <p className="text-xs text-tv-text-dim mt-1">Ask me to analyze any market or find trade setups</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center max-w-[240px]">
              {[`Analyze ${activeSymbol}`, 'Find a setup', 'Market bias', 'Support levels'].map(prompt => (
                <button
                  key={prompt}
                  onClick={() => setInput(prompt)}
                  className="text-xs bg-tv-surface border border-tv-border rounded-full px-3 py-1 text-tv-text hover:text-white hover:border-tv-accent transition-colors"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {(messages as import('@/types/ai').AIMessage[]).map(msg => (
          <div key={msg.id} className={cn('flex gap-2', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
            <div className={cn(
              'w-7 h-7 rounded-full flex items-center justify-center shrink-0 border',
              msg.role === 'user'
                ? 'bg-tv-accent/20 border-tv-accent/30'
                : 'bg-tv-surface border-tv-border'
            )}>
              {msg.role === 'user'
                ? <User className="w-4 h-4 text-tv-accent" />
                : <Bot className="w-4 h-4 text-tv-text-dim" />}
            </div>

            <div className={cn('flex-1 max-w-[85%]', msg.role === 'user' ? 'text-right' : 'text-left')}>
              <div className={cn(
                'inline-block rounded-lg px-3 py-2 text-xs leading-relaxed',
                msg.role === 'user'
                  ? 'bg-tv-accent/20 text-white rounded-tr-sm'
                  : 'bg-tv-surface text-tv-text rounded-tl-sm'
              )}>
                {msg.content || (msg.isStreaming && <span className="inline-flex gap-0.5">
                  <span className="w-1.5 h-1.5 bg-tv-text-dim rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-tv-text-dim rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-tv-text-dim rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>)}
                {msg.isStreaming && msg.content && (
                  <span className="inline-block w-1 h-3 bg-tv-accent ml-0.5 animate-pulse" />
                )}
              </div>

              {msg.tradeSetup && (
                <div className="mt-2">
                  <AISignalCard setup={msg.tradeSetup} analysis={msg.content} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-2 border-t border-tv-border">
        <div className="flex gap-2 items-end">
          <Textarea
            ref={textareaRef}
            className="flex-1 min-h-[60px] max-h-[120px] text-xs resize-none"
            placeholder={`Ask about ${activeSymbol}... (Enter to send, Shift+Enter for newline)`}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isAnalyzing}
            className="shrink-0 h-9 w-9"
          >
            {isAnalyzing
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  )
}
