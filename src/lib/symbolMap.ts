// Maps platform symbols to Yahoo Finance ticker format
const DIRECT_MAP: Record<string, string> = {
  // Metals
  XAUUSD: 'GC=F', GOLD: 'GC=F',
  XAGUSD: 'SI=F', SILVER: 'SI=F',
  XPTUSD: 'PL=F', PLATINUM: 'PL=F',
  XPDUSD: 'PA=F',

  // Energy
  USOIL: 'CL=F', OIL: 'CL=F', WTIUSD: 'CL=F', WTI: 'CL=F',
  UKOIL: 'BZ=F', BRENTUSD: 'BZ=F', BRENT: 'BZ=F',
  NATGAS: 'NG=F',

  // US Indices
  NAS100: 'NQ=F', NASDAQ: 'NQ=F', NDX: 'NQ=F', US100: 'NQ=F',
  US30: 'YM=F', DJI: 'YM=F', DOW: 'YM=F',
  US500: 'ES=F', SP500: 'ES=F', SPX: 'ES=F',
  US2000: 'RTY=F', RUSSELL: 'RTY=F',
  VIX: '^VIX',

  // European Indices
  GER40: '^GDAXI', DAX: '^GDAXI',
  UK100: '^FTSE', FTSE: '^FTSE',
  FRA40: '^FCHI', CAC40: '^FCHI',
  EU50: '^STOXX50E',

  // Asian Indices
  JPN225: '^N225', NIKKEI: '^N225',
  HK50: '^HSI', HANGSENG: '^HSI',
  AUS200: '^AXJO',

  // Crypto on Yahoo (non-Binance format)
  BTCUSD: 'BTC-USD',
  ETHUSD: 'ETH-USD',
  SOLUSD: 'SOL-USD',
}

const CURRENCIES = new Set(['USD','EUR','GBP','JPY','CHF','CAD','AUD','NZD','SGD','HKD','CNH','MXN','NOK','SEK','DKK','ZAR','TRY'])

export function toYahooSymbol(symbol: string): string {
  const upper = symbol.toUpperCase().replace('/', '')

  if (DIRECT_MAP[upper]) return DIRECT_MAP[upper]

  // Forex: 6-char currency pairs → EURUSD=X
  if (upper.length === 6 && CURRENCIES.has(upper.slice(0, 3)) && CURRENCIES.has(upper.slice(3))) {
    return `${upper}=X`
  }

  // Stock tickers pass through as-is
  return upper
}

export function isCryptoSymbol(symbol: string): boolean {
  return /USDT$|USDC$|BUSD$/.test(symbol.toUpperCase())
}
