import type { IDataProvider } from './types'
import { BinanceProvider } from './BinanceProvider'
import { YahooFinanceProvider } from './YahooFinanceProvider'
import { MockProvider } from './MockProvider'
import { isCrypto } from '@/lib/utils'

class ProviderRegistry {
  private providers: Map<string, IDataProvider> = new Map()
  private binance = new BinanceProvider()
  private yahoo = new YahooFinanceProvider()
  private mock = new MockProvider()

  getForSymbol(symbol: string): IDataProvider {
    if (isCrypto(symbol)) return this.binance
    return this.yahoo
  }

  get(name: string): IDataProvider {
    switch (name) {
      case 'binance': return this.binance
      case 'yahoo': return this.yahoo
      case 'mock': return this.mock
      default: return this.mock
    }
  }

  getBinance() { return this.binance }
  getYahoo() { return this.yahoo }
  getMock() { return this.mock }
}

export const providerFactory = new ProviderRegistry()
