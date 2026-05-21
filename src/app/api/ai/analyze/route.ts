import { NextRequest } from 'next/server'
import { aiService } from '@/services/ai/AIService'
import type { AIAnalysisRequest } from '@/types/ai'
import type { Candle } from '@/types/market'

function candlesToText(candles: Candle[]): string {
  const recent = candles.slice(-30)
  const last = recent[recent.length - 1]
  const prices = recent.map(c => c.close)
  const high = Math.max(...recent.map(c => c.high))
  const low = Math.min(...recent.map(c => c.low))
  const totalVolume = recent.reduce((s, c) => s + c.volume, 0)

  const rows = recent.slice(-10).map(c =>
    `O:${c.open.toFixed(4)} H:${c.high.toFixed(4)} L:${c.low.toFixed(4)} C:${c.close.toFixed(4)} V:${c.volume.toFixed(0)}`
  ).join('\n')

  const changeFrom = prices[0]
  const changePct = ((last.close - changeFrom) / changeFrom * 100).toFixed(2)

  return `Last 30 candles summary:
Current Price: ${last.close}
30-candle High: ${high}
30-candle Low: ${low}
Price Change: ${changePct}%
Total Volume: ${totalVolume.toFixed(0)}

Last 10 OHLCV candles:
${rows}`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      request: AIAnalysisRequest
      candles?: Candle[]
      model?: string
    }

    const { request, candles = [], model } = body
    const marketData = candles.length > 0
      ? candlesToText(candles)
      : `No candle data provided. Analyzing ${request.symbol} on ${request.timeframe} timeframe.`

    const encoder = new TextEncoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of aiService.streamAnalysis(request, marketData, model as string)) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`))
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
