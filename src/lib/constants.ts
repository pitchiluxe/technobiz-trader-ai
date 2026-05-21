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
  upColor: '#26a69a',
  downColor: '#ef5350',
  borderUpColor: '#26a69a',
  borderDownColor: '#ef5350',
  wickUpColor: '#26a69a',
  wickDownColor: '#ef5350',
  background: '#131722',
  grid: '#2a2e39',
  text: '#787b86',
  crosshair: '#363a45',
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

export const AI_SYSTEM_PROMPT = `You are a professional trading signal bot. Be CONCISE — max 60 words per response.

For market analysis, respond in EXACTLY this format (no extra text before or after):

**[SYMBOL] · [TIMEFRAME]**
Trend: BULLISH / BEARISH / NEUTRAL

DIRECTION: LONG
ENTRY: $X
STOP LOSS: $X
TAKE PROFIT 1: $X
TAKE PROFIT 2: $X
R/R RATIO: 1:X
CONFIDENCE: X%

[One sentence reason — max 15 words]`
