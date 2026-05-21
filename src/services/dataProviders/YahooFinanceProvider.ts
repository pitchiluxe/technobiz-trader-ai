import type { IDataProvider, Candle, Quote, Symbol, TimeFrame, MarketDataRequest } from './types'

const PROXY_BASE = '/api/market'

const TF_MAP: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '60m', '2h': '60m', '4h': '60m',
  '1d': '1d', '1w': '1wk', '1M': '1mo',
}

export class YahooFinanceProvider implements IDataProvider {
  name = 'yahoo'

  async fetchCandles(req: MarketDataRequest): Promise<Candle[]> {
    const tf = TF_MAP[req.timeframe] ?? '1d'
    const limit = req.limit ?? 200
    const params = new URLSearchParams({
      symbol: req.symbol,
      interval: tf,
      range: this.getRangeForInterval(req.timeframe, limit),
    })

    const res = await fetch(`${PROXY_BASE}/candles?${params}`)
    if (!res.ok) throw new Error(`Yahoo fetch failed: ${res.status}`)
    return res.json()
  }

  private getRangeForInterval(tf: TimeFrame, limit: number): string {
    const msPerCandle: Record<string, number> = {
      '1m': 60000, '5m': 300000, '15m': 900000, '30m': 1800000,
      '1h': 3600000, '2h': 7200000, '4h': 14400000,
      '1d': 86400000, '1w': 604800000, '1M': 2592000000,
    }
    const ms = (msPerCandle[tf] ?? 86400000) * limit
    const days = Math.ceil(ms / 86400000)
    if (days <= 1) return '1d'
    if (days <= 5) return '5d'
    if (days <= 30) return '1mo'
    if (days <= 90) return '3mo'
    if (days <= 180) return '6mo'
    if (days <= 365) return '1y'
    if (days <= 730) return '2y'
    return '5y'
  }

  async fetchQuote(symbol: string): Promise<Quote> {
    const res = await fetch(`${PROXY_BASE}/quote?symbol=${encodeURIComponent(symbol)}`)
    if (!res.ok) throw new Error(`Yahoo quote failed: ${res.status}`)
    return res.json()
  }

  async searchSymbols(query: string): Promise<Symbol[]> {
    const res = await fetch(`${PROXY_BASE}/search?q=${encodeURIComponent(query)}`)
    if (!res.ok) return []
    return res.json()
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${PROXY_BASE}/quote?symbol=SPY`, {
        signal: AbortSignal.timeout(3000),
      })
      return res.ok
    } catch {
      return false
    }
  }
}
