export interface Candle {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface Quote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  prevClose: number
  timestamp: number
  marketCap?: number
  pe?: number
}

export interface Ticker {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
}

export type TimeFrame = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M'

export type MarketType = 'crypto' | 'stocks' | 'forex' | 'futures' | 'indices' | 'commodities'

export interface Symbol {
  symbol: string
  name: string
  type: MarketType
  exchange?: string
  currency?: string
  logo?: string
}

export type DataProvider = 'binance' | 'yahoo' | 'finnhub' | 'polygon' | 'alpaca' | 'twelvedata' | 'mock'

export interface MarketDataRequest {
  symbol: string
  timeframe: TimeFrame
  limit?: number
  from?: number
  to?: number
  provider?: DataProvider
}

export interface MarketDataResponse {
  symbol: string
  timeframe: TimeFrame
  candles: Candle[]
  provider: DataProvider
}

export interface WatchlistItem {
  symbol: string
  name: string
  type: MarketType
  price?: number
  change?: number
  changePercent?: number
  addedAt: number
}

export interface MarketNews {
  id: string
  headline: string
  summary: string
  url: string
  source: string
  datetime: number
  related?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
}

export interface OrderBookEntry {
  price: number
  quantity: number
}

export interface OrderBook {
  symbol: string
  bids: OrderBookEntry[]
  asks: OrderBookEntry[]
  timestamp: number
}
