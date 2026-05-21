import type { TradeSetup } from '@/types/ai'

export function parseTradeSetup(content: string, symbol: string): TradeSetup | undefined {
  try {
    const dirMatch = content.match(/DIRECTION:\s*(LONG|SHORT)/i)
    const entryMatch = content.match(/ENTRY:\s*\$?([\d,]+\.?\d*)/i)
    const slMatch = content.match(/STOP\s*LOSS:\s*\$?([\d,]+\.?\d*)/i)
    const tp1Match = content.match(/TAKE\s*PROFIT\s*1:\s*\$?([\d,]+\.?\d*)/i)
    const tp2Match = content.match(/TAKE\s*PROFIT\s*2:\s*\$?([\d,]+\.?\d*)/i)
    const tp3Match = content.match(/TAKE\s*PROFIT\s*3:\s*\$?([\d,]+\.?\d*)/i)
    const confMatch = content.match(/CONFIDENCE:\s*(\d+)%?/i)
    const rrMatch = content.match(/R\/R\s*RATIO:\s*1:([\d.]+)/i)

    if (!dirMatch || !entryMatch || !slMatch) return undefined

    const entry = parseFloat(entryMatch[1].replace(/,/g, ''))
    const sl = parseFloat(slMatch[1].replace(/,/g, ''))
    const tp1 = tp1Match ? parseFloat(tp1Match[1].replace(/,/g, '')) : 0
    const tp2 = tp2Match ? parseFloat(tp2Match[1].replace(/,/g, '')) : 0
    const tp3 = tp3Match ? parseFloat(tp3Match[1].replace(/,/g, '')) : 0
    const confidence = confMatch ? parseInt(confMatch[1]) : 65
    const rr = rrMatch
      ? parseFloat(rrMatch[1])
      : tp1
      ? Math.abs(tp1 - entry) / Math.abs(entry - sl)
      : 2
    const direction = dirMatch[1].toUpperCase() === 'LONG' ? 'long' : 'short'
    const takeProfit = [tp1, tp2, tp3].filter(t => t > 0)

    return {
      symbol,
      direction,
      entry,
      stopLoss: sl,
      takeProfit: takeProfit.length > 0 ? takeProfit : [entry + (entry - sl) * 2],
      riskReward: rr,
      confidence,
      confidenceLevel:
        confidence >= 80 ? 'very_high' : confidence >= 65 ? 'high' : confidence >= 50 ? 'medium' : 'low',
      timeframe: 'multiple',
      bias: content.substring(0, 200),
      reasoning: content,
      keyLevels: [],
      multiTimeframeAnalysis: [],
      marketStructure: { trend: 'uptrend', phase: 'unknown', description: '' },
      indicators: [],
      generatedAt: Date.now(),
    }
  } catch {
    return undefined
  }
}
