import type { IDataProvider } from './types'
import { BinanceProvider } from './BinanceProvider'
import { YahooFinanceProvider } from './YahooFinanceProvider'
import { isCryptoSymbol } from '@/lib/symbolMap'

class ProviderRegistry {
  private binance = new BinanceProvider()
  private yahoo = new YahooFinanceProvider()

  getForSymbol(symbol: string): IDataProvider {
    if (isCryptoSymbol(symbol)) return this.binance
    return this.yahoo
  }

  get(name: string): IDataProvider {
    switch (name) {
      case 'binance': return this.binance
      default: return this.yahoo
    }
  }

  getBinance() { return this.binance }
  getYahoo() { return this.yahoo }
}

export const providerFactory = new ProviderRegistry()
