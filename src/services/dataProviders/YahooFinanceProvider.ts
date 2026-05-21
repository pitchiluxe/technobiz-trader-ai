import type { IDataProvider, Candle, Quote, Symbol, TimeFrame, MarketDataRequest } from './types'
import { toYahooSymbol } from '@/lib/symbolMap'

const TF_MAP: Record<string, string> = {
  '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '60m', '2h': '60m', '4h': '60m',
  '1d': '1d', '1w': '1wk', '1M': '1mo',
}

const HEADERS = {
  'Accept': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept-Language': 'en-US,en;q=0.9',
}

// Try both Yahoo Finance hosts — query1 is usually faster, query2 is a fallback
const HOSTS = ['query1.finance.yahoo.com', 'query2.finance.yahoo.com']

type YahooChartData = {
  chart?: {
    result?: Array<{
      timestamp: number[]
      meta: Record<string, number>
      indicators: { quote: Array<{ open: number[]; high: number[]; low: number[]; close: number[]; volume: number[] }> }
    }>
  }
}

export class YahooFinanceProvider implements IDataProvider {
  name = 'yahoo'

  async fetchCandles(req: MarketDataRequest): Promise<Candle[]> {
    const ticker = toYahooSymbol(req.symbol)
    const tf = TF_MAP[req.timeframe] ?? '1d'
    const range = this.getRange(req.timeframe, req.limit ?? 200)

    for (const host of HOSTS) {
      try {
        const url = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=${tf}&range=${range}`
        const res = await fetch(url, { headers: HEADERS })
        if (!res.ok) continue
        const data: YahooChartData = await res.json()
        return this.parseCandles(data)
      } catch {}
    }
    throw new Error(`No data for ${req.symbol}`)
  }

  async fetchQuote(symbol: string): Promise<Quote> {
    const ticker = toYahooSymbol(symbol)

    for (const host of HOSTS) {
      try {
        const url = `https://${host}/v8/finance/chart/${encodeURIComponent(ticker)}?interval=1d&range=1d`
        const res = await fetch(url, { headers: HEADERS })
        if (!res.ok) continue
        const data: YahooChartData = await res.json()
        const meta = data.chart?.result?.[0]?.meta
        if (!meta) continue
        const price = meta.regularMarketPrice ?? 0
        const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price
        const change = price - prevClose
        const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0
        return {
          symbol: symbol.toUpperCase(),
          price, change, changePercent,
          volume: meta.regularMarketVolume ?? 0,
          high: meta.regularMarketDayHigh ?? price,
          low: meta.regularMarketDayLow ?? price,
          open: meta.regularMarketOpen ?? price,
          prevClose,
          timestamp: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
        }
      } catch {}
    }
    throw new Error(`No quote for ${symbol}`)
  }

  async searchSymbols(query: string): Promise<Symbol[]> {
    try {
      const res = await fetch(`/api/market/search?q=${encodeURIComponent(query)}`)
      if (res.ok) return res.json()
    } catch {}
    return []
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/SPY?interval=1d&range=1d', {
        headers: HEADERS,
        signal: AbortSignal.timeout(4000),
      })
      return res.ok
    } catch {
      return false
    }
  }

  private parseCandles(data: YahooChartData): Candle[] {
    const result = data.chart?.result?.[0]
    if (!result) throw new Error('Empty response')
    const { timestamp, indicators } = result
    const { open, high, low, close, volume } = indicators.quote[0]
    return timestamp
      .map((t, i) => ({
        time: t,
        open: open[i] ?? 0,
        high: high[i] ?? 0,
        low: low[i] ?? 0,
        close: close[i] ?? 0,
        volume: volume[i] ?? 0,
      }))
      .filter(c => c.open > 0)
  }

  private getRange(tf: TimeFrame, limit: number): string {
    const msPerCandle: Record<string, number> = {
      '1m': 60000, '5m': 300000, '15m': 900000, '30m': 1800000,
      '1h': 3600000, '2h': 7200000, '4h': 14400000,
      '1d': 86400000, '1w': 604800000, '1M': 2592000000,
    }
    const days = Math.ceil((msPerCandle[tf] ?? 86400000) * limit / 86400000)
    if (days <= 1) return '1d'
    if (days <= 5) return '5d'
    if (days <= 30) return '1mo'
    if (days <= 90) return '3mo'
    if (days <= 180) return '6mo'
    if (days <= 365) return '1y'
    if (days <= 730) return '2y'
    return '5y'
  }
}
