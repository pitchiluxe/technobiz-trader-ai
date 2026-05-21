import type { Candle, Quote, Symbol, TimeFrame, MarketDataRequest, MarketDataResponse } from '@/types/market'

export interface IDataProvider {
  name: string
  fetchCandles(req: MarketDataRequest): Promise<Candle[]>
  fetchQuote(symbol: string): Promise<Quote>
  searchSymbols(query: string): Promise<Symbol[]>
  subscribeToTicker?(symbol: string, callback: (quote: Quote) => void): () => void
  subscribeToCandleUpdates?(
    symbol: string,
    timeframe: TimeFrame,
    callback: (candle: Candle) => void
  ): () => void
  isAvailable(): Promise<boolean>
}

export type { MarketDataRequest, MarketDataResponse, Candle, Quote, Symbol, TimeFrame }
