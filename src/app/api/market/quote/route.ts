import { NextRequest } from 'next/server'
import { toYahooSymbol, isCryptoSymbol } from '@/lib/symbolMap'

async function fetchBinanceQuote(symbol: string) {
  const sym = symbol.toUpperCase()
  const [priceRes, statsRes] = await Promise.all([
    fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${sym}`, { next: { revalidate: 10 } }),
    fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${sym}`, { next: { revalidate: 10 } }),
  ])

  if (!priceRes.ok || !statsRes.ok) throw new Error(`Binance quote failed`)
  const [price, stats] = await Promise.all([priceRes.json(), statsRes.json()])

  return {
    symbol: sym,
    price: parseFloat(price.price) || 0,
    change: parseFloat(stats.priceChange) || 0,
    changePercent: parseFloat(stats.priceChangePercent) || 0,
    volume: parseFloat(stats.volume) || 0,
    high: parseFloat(stats.highPrice) || 0,
    low: parseFloat(stats.lowPrice) || 0,
    open: parseFloat(stats.openPrice) || 0,
    prevClose: parseFloat(stats.prevClosePrice) || 0,
    timestamp: Math.floor(Date.now() / 1000),
  }
}

async function fetchYahooQuote(displaySymbol: string) {
  const yahooTicker = toYahooSymbol(displaySymbol)
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooTicker)}?interval=1d&range=1d`
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' },
    next: { revalidate: 30 },
  })

  if (!res.ok) throw new Error(`Yahoo quote failed: ${res.status}`)
  const data = await res.json()

  const meta = data.chart?.result?.[0]?.meta
  if (!meta) throw new Error('No meta data')

  const price = meta.regularMarketPrice ?? 0
  const prevClose = meta.previousClose ?? meta.chartPreviousClose ?? price
  const change = price - prevClose
  const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0

  return {
    symbol: displaySymbol.toUpperCase(),
    price,
    change,
    changePercent,
    volume: meta.regularMarketVolume ?? 0,
    high: meta.regularMarketDayHigh ?? price,
    low: meta.regularMarketDayLow ?? price,
    open: meta.regularMarketOpen ?? price,
    prevClose,
    timestamp: meta.regularMarketTime ?? Math.floor(Date.now() / 1000),
    marketCap: meta.marketCap,
  }
}

export async function GET(req: NextRequest) {
  const symbol = new URL(req.url).searchParams.get('symbol') ?? 'BTCUSDT'

  try {
    const quote = isCryptoSymbol(symbol)
      ? await fetchBinanceQuote(symbol)
      : await fetchYahooQuote(symbol)

    return Response.json(quote)
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
