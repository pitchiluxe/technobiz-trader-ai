import { NextRequest } from 'next/server'

const CRYPTO_SYMBOLS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto', exchange: 'Binance' },
  { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto', exchange: 'Binance' },
  { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto', exchange: 'Binance' },
  { symbol: 'BNBUSDT', name: 'BNB', type: 'crypto', exchange: 'Binance' },
  { symbol: 'XRPUSDT', name: 'Ripple', type: 'crypto', exchange: 'Binance' },
  { symbol: 'ADAUSDT', name: 'Cardano', type: 'crypto', exchange: 'Binance' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', type: 'crypto', exchange: 'Binance' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', type: 'crypto', exchange: 'Binance' },
  { symbol: 'DOTUSDT', name: 'Polkadot', type: 'crypto', exchange: 'Binance' },
  { symbol: 'MATICUSDT', name: 'Polygon', type: 'crypto', exchange: 'Binance' },
  { symbol: 'LINKUSDT', name: 'Chainlink', type: 'crypto', exchange: 'Binance' },
  { symbol: 'UNIUSDT', name: 'Uniswap', type: 'crypto', exchange: 'Binance' },
  { symbol: 'LTCUSDT', name: 'Litecoin', type: 'crypto', exchange: 'Binance' },
  { symbol: 'ATOMUSDT', name: 'Cosmos', type: 'crypto', exchange: 'Binance' },
  { symbol: 'NEARUSDT', name: 'NEAR Protocol', type: 'crypto', exchange: 'Binance' },
  { symbol: 'APTUSDT', name: 'Aptos', type: 'crypto', exchange: 'Binance' },
  { symbol: 'ARBUSDT', name: 'Arbitrum', type: 'crypto', exchange: 'Binance' },
  { symbol: 'OPUSDT', name: 'Optimism', type: 'crypto', exchange: 'Binance' },
  { symbol: 'SUIUSDT', name: 'Sui', type: 'crypto', exchange: 'Binance' },
  { symbol: 'PEPEUSDT', name: 'Pepe', type: 'crypto', exchange: 'Binance' },
]

const STOCK_SYMBOLS = [
  { symbol: 'SPY', name: 'S&P 500 ETF', type: 'indices', exchange: 'NYSE' },
  { symbol: 'QQQ', name: 'Nasdaq 100 ETF', type: 'indices', exchange: 'Nasdaq' },
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'AMZN', name: 'Amazon.com', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'META', name: 'Meta Platforms', type: 'stocks', exchange: 'Nasdaq' },
  { symbol: 'JPM', name: 'JPMorgan Chase', type: 'stocks', exchange: 'NYSE' },
  { symbol: 'GS', name: 'Goldman Sachs', type: 'stocks', exchange: 'NYSE' },
  { symbol: 'GLD', name: 'Gold ETF', type: 'commodities', exchange: 'NYSE' },
  { symbol: 'EURUSD=X', name: 'EUR/USD', type: 'forex', exchange: 'Forex' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD', type: 'forex', exchange: 'Forex' },
  { symbol: 'USDJPY=X', name: 'USD/JPY', type: 'forex', exchange: 'Forex' },
  { symbol: 'GC=F', name: 'Gold Futures', type: 'commodities', exchange: 'CME' },
  { symbol: 'CL=F', name: 'Crude Oil', type: 'commodities', exchange: 'CME' },
  { symbol: '^GSPC', name: 'S&P 500', type: 'indices', exchange: 'NYSE' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', type: 'indices', exchange: 'Nasdaq' },
  { symbol: '^DJI', name: 'Dow Jones', type: 'indices', exchange: 'NYSE' },
]

const ALL_SYMBOLS = [...CRYPTO_SYMBOLS, ...STOCK_SYMBOLS]

export async function GET(req: NextRequest) {
  const q = new URL(req.url).searchParams.get('q')?.toLowerCase() ?? ''

  if (!q || q.length < 1) {
    return Response.json(ALL_SYMBOLS.slice(0, 20))
  }

  const results = ALL_SYMBOLS.filter(s =>
    s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
  ).slice(0, 15)

  if (results.length < 5) {
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(q)}&quotesCount=10&newsCount=0`,
        { headers: { 'User-Agent': 'Mozilla/5.0' }, next: { revalidate: 300 } }
      )
      if (res.ok) {
        const data = await res.json()
        const yahoo = (data.quotes ?? []).map((item: { symbol: string; longname?: string; shortname?: string; quoteType?: string; exchange?: string }) => ({
          symbol: item.symbol,
          name: item.longname ?? item.shortname ?? item.symbol,
          type: item.quoteType?.toLowerCase() === 'cryptocurrency' ? 'crypto' : 'stocks',
          exchange: item.exchange,
        }))
        return Response.json([...results, ...yahoo].slice(0, 15))
      }
    } catch {}
  }

  return Response.json(results)
}
