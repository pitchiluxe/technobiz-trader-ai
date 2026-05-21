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
    // Binance REST does not send CORS headers — must route through server proxy
    const params = new URLSearchParams({
      symbol: req.symbol.toUpperCase(),
      timeframe: req.timeframe,
      limit: String(Math.min(req.limit ?? 500, 1000)),
    })
    const res = await fetch(`/api/market/candles?${params}`)
    if (!res.ok) throw new Error(`Candles failed: ${res.status}`)
    return res.json()
  }

  async fetchQuote(symbol: string): Promise<Quote> {
    const res = await fetch(`/api/market/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}`)
    if (!res.ok) throw new Error(`Quote failed: ${res.status}`)
    return res.json()
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
