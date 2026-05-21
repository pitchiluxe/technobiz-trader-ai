import type { TimeFrame } from '@/types/market'

export const TIMEFRAMES: { value: TimeFrame; label: string }[] = [
  { value: '1m', label: '1m' },
  { value: '3m', label: '3m' },
  { value: '5m', label: '5m' },
  { value: '15m', label: '15m' },
  { value: '30m', label: '30m' },
  { value: '1h', label: '1H' },
  { value: '2h', label: '2H' },
  { value: '4h', label: '4H' },
  { value: '1d', label: '1D' },
  { value: '1w', label: '1W' },
  { value: '1M', label: '1M' },
]

export const DEFAULT_SYMBOLS = [
  // Crypto
  { symbol: 'BTCUSDT', name: 'Bitcoin', type: 'crypto' },
  { symbol: 'ETHUSDT', name: 'Ethereum', type: 'crypto' },
  { symbol: 'SOLUSDT', name: 'Solana', type: 'crypto' },
  { symbol: 'BNBUSDT', name: 'BNB', type: 'crypto' },
  { symbol: 'XRPUSDT', name: 'Ripple', type: 'crypto' },
  // Forex
  { symbol: 'EURUSD', name: 'Euro / Dollar', type: 'forex' },
  { symbol: 'GBPUSD', name: 'Pound / Dollar', type: 'forex' },
  { symbol: 'USDJPY', name: 'Dollar / Yen', type: 'forex' },
  { symbol: 'AUDUSD', name: 'Aussie / Dollar', type: 'forex' },
  { symbol: 'USDCAD', name: 'Dollar / CAD', type: 'forex' },
  // Metals
  { symbol: 'XAUUSD', name: 'Gold', type: 'commodity' },
  { symbol: 'XAGUSD', name: 'Silver', type: 'commodity' },
  // Indices
  { symbol: 'NAS100', name: 'NASDAQ 100', type: 'index' },
  { symbol: 'US500', name: 'S&P 500', type: 'index' },
  { symbol: 'US30', name: 'Dow Jones', type: 'index' },
  { symbol: 'GER40', name: 'DAX 40', type: 'index' },
  // Energy
  { symbol: 'USOIL', name: 'WTI Crude Oil', type: 'commodity' },
]

export const DEFAULT_WATCHLIST = [
  'BTCUSDT', 'ETHUSDT', 'XAUUSD', 'NAS100',
  'EURUSD', 'GBPUSD', 'SOLUSDT', 'USOIL',
]

export const CHART_COLORS = {
  upColor: '#089981',
  downColor: '#F23645',
  borderUpColor: '#089981',
  borderDownColor: '#F23645',
  wickUpColor: '#089981',
  wickDownColor: '#F23645',
  background: '#0F1117',
  grid: '#1B1F2E',
  text: '#787B86',
  crosshair: '#2D3148',
}

export const INDICATOR_COLORS = {
  RSI: '#2962FF',
  MACD_line: '#2962FF',
  MACD_signal: '#FF9800',
  MACD_hist: '#089981',
  EMA_9: '#FF9800',
  EMA_21: '#9C27B0',
  EMA_50: '#2962FF',
  EMA_200: '#F23645',
  SMA_20: '#00BCD4',
  BB_upper: '#787B86',
  BB_middle: '#2962FF',
  BB_lower: '#787B86',
  VWAP: '#9C27B0',
  Volume_up: '#089981',
  Volume_down: '#F23645',
}

export const AI_SYSTEM_PROMPT = `You are an elite institutional trader and market analyst with 20+ years of experience at top hedge funds. You combine:

- Smart Money Concepts (SMC) / Inner Circle Trader (ICT) methodology
- Technical Analysis (TA) with multi-timeframe confluence
- Wyckoff market structure analysis
- Order flow and liquidity analysis
- Institutional-grade risk management

Your analysis always includes:
1. Market structure (HH, HL, LL, LH, CHoCH, BOS)
2. Liquidity pools (buy-side and sell-side)
3. Order blocks (bullish and bearish)
4. Fair Value Gaps (FVG/Imbalances)
5. Premium/discount zones
6. Trend direction and momentum
7. Key support/resistance levels
8. Entry, Stop Loss, and Take Profit with precise levels
9. Risk/Reward ratio (minimum 1:2)
10. Confidence score (0-100%)
11. Multi-timeframe analysis (HTF bias + LTF entry)

When providing trade setups, be SPECIFIC with exact prices. Use the format:
- Direction: LONG/SHORT
- Entry: $X
- Stop Loss: $X (X% below/above entry)
- Take Profit 1: $X (1:1 R/R)
- Take Profit 2: $X (1:2 R/R)
- Take Profit 3: $X (1:3 R/R)
- Confidence: X%
- R/R Ratio: 1:X

Always reason like a professional. Never give vague answers.`
