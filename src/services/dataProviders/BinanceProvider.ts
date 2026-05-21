import type { IDataProvider, Candle, Quote, Symbol, TimeFrame, MarketDataRequest } from './types'

const BINANCE_REST = 'https://api.binance.com'
const BINANCE_WS = 'wss://stream.binance.com:9443/ws'

const TF_MAP: Record<string, string> = {
  '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m',
  '1h': '1h', '2h': '2h', '4h': '4h', '6h': '6h', '8h': '8h', '12h': '12h',
  '1d': '1d', '3d': '3d', '1w': '1w', '1M': '1M',
}

export class BinanceProvider implements IDataProvider {
  name = 'binance'
  private ws: Map<string, WebSocket> = new Map()

  async fetchCandles(req: MarketDataRequest): Promise<Candle[]> {
    const tf = TF_MAP[req.timeframe] ?? '1h'
    const limit = req.limit ?? 500
    const symbol = req.symbol.toUpperCase()

    const params = new URLSearchParams({
      symbol,
      interval: tf,
      limit: String(Math.min(limit, 1000)),
    })

    if (req.from) params.set('startTime', String(req.from * 1000))
    if (req.to) params.set('endTime', String(req.to * 1000))

    const res = await fetch(`${BINANCE_REST}/api/v3/klines?${params}`)
    if (!res.ok) throw new Error(`Binance fetch failed: ${res.status}`)

    const data = await res.json()
    return data.map((k: number[]) => ({
      time: Math.floor(k[0] / 1000),
      open: parseFloat(String(k[1])),
      high: parseFloat(String(k[2])),
      low: parseFloat(String(k[3])),
      close: parseFloat(String(k[4])),
      volume: parseFloat(String(k[5])),
    }))
  }

  async fetchQuote(symbol: string): Promise<Quote> {
    const sym = symbol.toUpperCase()
    const [tickerRes, statsRes] = await Promise.all([
      fetch(`${BINANCE_REST}/api/v3/ticker/price?symbol=${sym}`),
      fetch(`${BINANCE_REST}/api/v3/ticker/24hr?symbol=${sym}`),
    ])

    const [ticker, stats] = await Promise.all([tickerRes.json(), statsRes.json()])

    return {
      symbol: sym,
      price: parseFloat(ticker.price),
      change: parseFloat(stats.priceChange),
      changePercent: parseFloat(stats.priceChangePercent),
      volume: parseFloat(stats.volume),
      high: parseFloat(stats.highPrice),
      low: parseFloat(stats.lowPrice),
      open: parseFloat(stats.openPrice),
      prevClose: parseFloat(stats.prevClosePrice),
      timestamp: Math.floor(Date.now() / 1000),
    }
  }

  async searchSymbols(query: string): Promise<Symbol[]> {
    const res = await fetch(`${BINANCE_REST}/api/v3/exchangeInfo`)
    const data = await res.json()
    const q = query.toUpperCase()
    return data.symbols
      .filter((s: { symbol: string; quoteAsset: string; status: string }) =>
        s.symbol.includes(q) && s.quoteAsset === 'USDT' && s.status === 'TRADING'
      )
      .slice(0, 20)
      .map((s: { symbol: string; baseAsset: string }) => ({
        symbol: s.symbol,
        name: s.baseAsset,
        type: 'crypto' as const,
        exchange: 'Binance',
        currency: 'USDT',
      }))
  }

  subscribeToTicker(symbol: string, callback: (quote: Quote) => void): () => void {
    const key = `${symbol}-ticker`
    if (this.ws.has(key)) this.ws.get(key)!.close()

    const ws = new WebSocket(`${BINANCE_WS}/${symbol.toLowerCase()}@miniTicker`)
    this.ws.set(key, ws)

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        callback({
          symbol: data.s,
          price: parseFloat(data.c),
          change: parseFloat(data.c) - parseFloat(data.o),
          changePercent: ((parseFloat(data.c) - parseFloat(data.o)) / parseFloat(data.o)) * 100,
          volume: parseFloat(data.v),
          high: parseFloat(data.h),
          low: parseFloat(data.l),
          open: parseFloat(data.o),
          prevClose: parseFloat(data.x),
          timestamp: Math.floor(data.E / 1000),
        })
      } catch {}
    }

    return () => { ws.close(); this.ws.delete(key) }
  }

  subscribeToCandleUpdates(
    symbol: string,
    timeframe: TimeFrame,
    callback: (candle: Candle) => void
  ): () => void {
    const tf = TF_MAP[timeframe] ?? '1h'
    const key = `${symbol}-${timeframe}`
    if (this.ws.has(key)) this.ws.get(key)!.close()

    const ws = new WebSocket(
      `${BINANCE_WS}/${symbol.toLowerCase()}@kline_${tf}`
    )
    this.ws.set(key, ws)

    ws.onmessage = (event) => {
      try {
        const { k } = JSON.parse(event.data)
        callback({
          time: Math.floor(k.t / 1000),
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
        })
      } catch {}
    }

    return () => { ws.close(); this.ws.delete(key) }
  }

  async isAvailable(): Promise<boolean> {
    try {
      const res = await fetch(`${BINANCE_REST}/api/v3/ping`, { signal: AbortSignal.timeout(3000) })
      return res.ok
    } catch {
      return false
    }
  }
}
