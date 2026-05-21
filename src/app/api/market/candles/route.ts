import { NextRequest } from 'next/server'
import type { TimeFrame } from '@/types/market'
import { toYahooSymbol, isCryptoSymbol } from '@/lib/symbolMap'

async function fetchYahooCandles(displaySymbol: string, interval: string, range: string) {
  const yahooTicker = toYahooSymbol(displaySymbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=${interval}&range=${range}`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    cache: 'no-store',
  })

  if (!res.ok) throw new Error(`Yahoo Finance error: ${res.status}`)
  const data = await res.json()

  const chart = data.chart?.result?.[0]
  if (!chart) throw new Error('No chart data')

  const { timestamp, indicators } = chart
  const { open, high, low, close, volume } = indicators.quote[0]

  return timestamp.map((t: number, i: number) => ({
    time: t,
    open: open[i] ?? 0,
    high: high[i] ?? 0,
    low: low[i] ?? 0,
    close: close[i] ?? 0,
    volume: volume[i] ?? 0,
  })).filter((c: { open: number }) => c.open > 0)
}

async function fetchBinanceCandles(symbol: string, interval: string, limit: number) {
  const sym = symbol.toUpperCase()
  const res = await fetch(
    `https://api.binance.com/api/v3/klines?symbol=${sym}&interval=${interval}&limit=${limit}`,
    { cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`Binance error: ${res.status}`)
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

const TF_TO_BINANCE: Record<string, string> = {
  '1m':'1m','3m':'3m','5m':'5m','15m':'15m','30m':'30m',
  '1h':'1h','2h':'2h','4h':'4h','6h':'6h','12h':'12h',
  '1d':'1d','1w':'1w','1M':'1M',
}

const TF_TO_YAHOO_INTERVAL: Record<string, string> = {
  '1m':'1m','5m':'5m','15m':'15m','30m':'30m',
  '1h':'60m','2h':'60m','4h':'60m',
  '1d':'1d','1w':'1wk','1M':'1mo',
}

const TF_TO_YAHOO_RANGE: Record<string, string> = {
  '1m':'1d','5m':'5d','15m':'5d','30m':'1mo',
  '1h':'3mo','2h':'6mo','4h':'1y',
  '1d':'2y','1w':'5y','1M':'10y',
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const symbol = searchParams.get('symbol') ?? 'BTCUSDT'
  const timeframe = (searchParams.get('timeframe') ?? searchParams.get('interval') ?? '1h') as TimeFrame
  const limit = parseInt(searchParams.get('limit') ?? '200')
  const range = searchParams.get('range')

  try {
    let candles

    if (isCryptoSymbol(symbol)) {
      const interval = TF_TO_BINANCE[timeframe] ?? '1h'
      candles = await fetchBinanceCandles(symbol.toUpperCase(), interval, Math.min(limit, 1000))
    } else {
      const interval = TF_TO_YAHOO_INTERVAL[timeframe] ?? '1d'
      const r = range ?? TF_TO_YAHOO_RANGE[timeframe] ?? '1y'
      candles = await fetchYahooCandles(symbol, interval, r)
    }

    return Response.json(candles)
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
