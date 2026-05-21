import type { IDataProvider, Candle, Quote, Symbol, TimeFrame, MarketDataRequest } from './types'
import { timeframeToMs } from '@/lib/utils'

function generateCandles(symbol: string, count: number, tf: string): Candle[] {
  const msPerCandle = timeframeToMs(tf)
  const now = Math.floor(Date.now() / 1000)
  const startTime = now - count * Math.floor(msPerCandle / 1000)

  const BASE_PRICES: Record<string, number> = {
    BTCUSDT: 67000, ETHUSDT: 3500, SOLUSDT: 185, BNBUSDT: 590,
    XRPUSDT: 0.58, ADAUSDT: 0.45, DOGEUSDT: 0.12, AVAXUSDT: 38,
    EURUSD: 1.085, GBPUSD: 1.265, USDJPY: 149.5, SPY: 520,
    AAPL: 185, MSFT: 415, NVDA: 875, TSLA: 195,
  }

  let price = BASE_PRICES[symbol.toUpperCase()] ?? 100
  const candles: Candle[] = []

  for (let i = 0; i < count; i++) {
    const volatility = price * 0.002
    const change = (Math.random() - 0.495) * volatility * 2
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.abs(Math.random() * volatility)
    const low = Math.min(open, close) - Math.abs(Math.random() * volatility)
    const volume = price * 1000 * (0.5 + Math.random())

    candles.push({
      time: startTime + i * Math.floor(msPerCandle / 1000),
      open: parseFloat(open.toFixed(8)),
      high: parseFloat(high.toFixed(8)),
      low: parseFloat(low.toFixed(8)),
      close: parseFloat(close.toFixed(8)),
      volume: parseFloat(volume.toFixed(2)),
    })

    price = close
  }

  return candles
}

export class MockProvider implements IDataProvider {
  name = 'mock'
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map()

  async fetchCandles(req: MarketDataRequest): Promise<Candle[]> {
    await new Promise(r => setTimeout(r, 100 + Math.random() * 200))
    return generateCandles(req.symbol, req.limit ?? 200, req.timeframe)
  }

  async fetchQuote(symbol: string): Promise<Quote> {
    const BASE: Record<string, number> = {
      BTCUSDT: 67000, ETHUSDT: 3500, SOLUSDT: 185, BNBUSDT: 590,
    }
    const price = (BASE[symbol] ?? 100) * (0.98 + Math.random() * 0.04)
    const change = price * (Math.random() * 0.04 - 0.02)
    return {
      symbol,
      price,
      change,
      changePercent: (change / price) * 100,
      volume: price * 50000 * Math.random(),
      high: price * 1.02,
      low: price * 0.98,
      open: price - change,
      prevClose: price - change,
      timestamp: Math.floor(Date.now() / 1000),
    }
  }

  async searchSymbols(query: string): Promise<Symbol[]> {
    const symbols = [
      { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto' as const },
      { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto' as const },
      { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto' as const },
      { symbol: 'BNBUSDT', name: 'BNB', type: 'crypto' as const },
      { symbol: 'XRPUSDT', name: 'Ripple', type: 'crypto' as const },
    ]
    const q = query.toLowerCase()
    return symbols.filter(s =>
      s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    )
  }

  subscribeToCandleUpdates(
    symbol: string,
    timeframe: TimeFrame,
    callback: (candle: Candle) => void
  ): () => void {
    const key = `${symbol}-${timeframe}`
    const msDelay = Math.max(timeframeToMs(timeframe) / 100, 2000)

    const id = setInterval(() => {
      const candles = generateCandles(symbol, 1, timeframe)
      callback(candles[0])
    }, msDelay)

    this.intervals.set(key, id)
    return () => { clearInterval(id); this.intervals.delete(key) }
  }

  subscribeToTicker(symbol: string, callback: (q: Quote) => void): () => void {
    const id = setInterval(async () => {
      callback(await this.fetchQuote(symbol))
    }, 2000)
    const key = `ticker-${symbol}`
    this.intervals.set(key, id)
    return () => { clearInterval(id); this.intervals.delete(key) }
  }

  async isAvailable(): Promise<boolean> { return true }
}
