'use client'

import { useCallback } from 'react'
import { useAIStore } from '@/stores/useAIStore'
import type { Candle } from '@/types/market'

interface AnalysisOptions {
  symbol: string
  timeframe: string
  candles?: Candle[]
  question?: string
  includeTradeSetup?: boolean
}

export function useAIAnalysis() {
  const {
    addMessage,
    updateMessage,
    appendToStream,
    setAnalyzing,
    setStreamingId,
    selectedModel,
    addSignal,
  } = useAIStore()

  const analyzeMarket = useCallback(async (opts: AnalysisOptions) => {
    const { symbol, timeframe, candles = [], question, includeTradeSetup = true } = opts

    const userContent = question
      ? question
      : `Analyze ${symbol} on the ${timeframe} timeframe and provide a trade setup.`

    addMessage({ role: 'user', content: userContent })

    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    setAnalyzing(true)
    setStreamingId(assistantId)

    let fullContent = ''

    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          request: { symbol, timeframe, question, includeTradeSetup },
          candles: candles.slice(-50),
          model: selectedModel,
        }),
      })

      if (!res.ok) throw new Error(`AI API error: ${res.status}`)
      if (!res.body) throw new Error('No response body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const text = decoder.decode(value)
        const lines = text.split('\n').filter(l => l.startsWith('data:'))

        for (const line of lines) {
          const data = line.slice(5).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) {
              fullContent += parsed.content
              appendToStream(assistantId, parsed.content)
            }
            if (parsed.error) throw new Error(parsed.error)
          } catch {}
        }
      }

      // Try to parse a trade setup from the full content
      const { aiService } = await import('@/services/ai/AIService')
      const tradeSetup = includeTradeSetup
        ? aiService.parseTradeSetup(fullContent, symbol)
        : undefined

      updateMessage(assistantId, { isStreaming: false, tradeSetup })

      if (tradeSetup) {
        addSignal({
          symbol,
          setup: tradeSetup,
          status: 'active',
        })
      }
    } catch (err) {
      updateMessage(assistantId, {
        content: fullContent || `Error: ${String(err)}`,
        isStreaming: false,
      })
    } finally {
      setAnalyzing(false)
      setStreamingId(null)
    }
  }, [addMessage, updateMessage, appendToStream, setAnalyzing, setStreamingId, selectedModel, addSignal])

  const sendMessage = useCallback(async (content: string, conversationHistory: { role: 'user' | 'assistant'; content: string }[]) => {
    addMessage({ role: 'user', content })

    const assistantId = addMessage({
      role: 'assistant',
      content: '',
      isStreaming: true,
    })

    setAnalyzing(true)
    setStreamingId(assistantId)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...conversationHistory.slice(-10),
            { role: 'user', content },
          ],
          model: selectedModel,
        }),
      })

      if (!res.body) throw new Error('No response body')
      const reader = res.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const lines = decoder.decode(value).split('\n').filter(l => l.startsWith('data:'))
        for (const line of lines) {
          const data = line.slice(5).trim()
          if (data === '[DONE]') break
          try {
            const parsed = JSON.parse(data)
            if (parsed.content) appendToStream(assistantId, parsed.content)
          } catch {}
        }
      }

      updateMessage(assistantId, { isStreaming: false })
    } catch (err) {
      updateMessage(assistantId, { content: `Error: ${String(err)}`, isStreaming: false })
    } finally {
      setAnalyzing(false)
      setStreamingId(null)
    }
  }, [addMessage, updateMessage, appendToStream, setAnalyzing, setStreamingId, selectedModel])

  return { analyzeMarket, sendMessage }
}
