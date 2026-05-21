import type { Candle } from '@/types/market'

export function calcEMA(values: number[], period: number): number[] {
  const k = 2 / (period + 1)
  const result: number[] = []
  let ema = values[0]
  result.push(ema)
  for (let i = 1; i < values.length; i++) {
    ema = values[i] * k + ema * (1 - k)
    result.push(ema)
  }
  return result
}

export function calcSMA(values: number[], period: number): (number | null)[] {
  const result: (number | null)[] = []
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) { result.push(null); continue }
    const slice = values.slice(i - period + 1, i + 1)
    result.push(slice.reduce((a, b) => a + b, 0) / period)
  }
  return result
}

export function calcRSI(candles: Candle[], period = 14): (number | null)[] {
  const closes = candles.map(c => c.close)
  const result: (number | null)[] = new Array(period).fill(null)

  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff >= 0) gains += diff
    else losses -= diff
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  const pushRSI = () => {
    if (avgLoss === 0) return result.push(100)
    const rs = avgGain / avgLoss
    result.push(100 - 100 / (1 + rs))
  }

  pushRSI()

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    const gain = diff > 0 ? diff : 0
    const loss = diff < 0 ? -diff : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period
    pushRSI()
  }

  return result
}

export interface MACDResult {
  macd: (number | null)[]
  signal: (number | null)[]
  histogram: (number | null)[]
}

export function calcMACD(
  candles: Candle[],
  fast = 12,
  slow = 26,
  signal = 9
): MACDResult {
  const closes = candles.map(c => c.close)
  const emaFast = calcEMA(closes, fast)
  const emaSlow = calcEMA(closes, slow)

  const macdLine = emaFast.map((f, i) => f - emaSlow[i])
  const signalLine = calcEMA(macdLine.slice(slow - 1), signal)

  const result: MACDResult = { macd: [], signal: [], histogram: [] }

  for (let i = 0; i < closes.length; i++) {
    if (i < slow - 1) {
      result.macd.push(null)
      result.signal.push(null)
      result.histogram.push(null)
    } else {
      const m = macdLine[i]
      const si = i - (slow - 1)
      const s = si < signal - 1 ? null : signalLine[si - (signal - 1)]
      result.macd.push(m)
      result.signal.push(s)
      result.histogram.push(m !== null && s !== null ? m - s : null)
    }
  }

  return result
}

export interface BollingerBands {
  upper: (number | null)[]
  middle: (number | null)[]
  lower: (number | null)[]
}

export function calcBollingerBands(
  candles: Candle[],
  period = 20,
  multiplier = 2
): BollingerBands {
  const closes = candles.map(c => c.close)
  const result: BollingerBands = { upper: [], middle: [], lower: [] }

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      result.upper.push(null)
      result.middle.push(null)
      result.lower.push(null)
      continue
    }
    const slice = closes.slice(i - period + 1, i + 1)
    const mean = slice.reduce((a, b) => a + b, 0) / period
    const variance = slice.reduce((a, b) => a + (b - mean) ** 2, 0) / period
    const std = Math.sqrt(variance)
    result.upper.push(mean + multiplier * std)
    result.middle.push(mean)
    result.lower.push(mean - multiplier * std)
  }

  return result
}

export function calcATR(candles: Candle[], period = 14): (number | null)[] {
  const result: (number | null)[] = [null]

  const trs: number[] = []
  for (let i = 1; i < candles.length; i++) {
    const { high, low } = candles[i]
    const prevClose = candles[i - 1].close
    trs.push(Math.max(high - low, Math.abs(high - prevClose), Math.abs(low - prevClose)))
  }

  let atr = trs.slice(0, period).reduce((a, b) => a + b, 0) / period

  for (let i = 0; i < period - 1; i++) result.push(null)
  result.push(atr)

  for (let i = period; i < trs.length; i++) {
    atr = (atr * (period - 1) + trs[i]) / period
    result.push(atr)
  }

  return result
}

export function calcVWAP(candles: Candle[]): number[] {
  let cumPV = 0
  let cumVol = 0
  return candles.map(c => {
    const tp = (c.high + c.low + c.close) / 3
    cumPV += tp * c.volume
    cumVol += c.volume
    return cumVol > 0 ? cumPV / cumVol : c.close
  })
}

export interface StochasticResult {
  k: (number | null)[]
  d: (number | null)[]
}

export function calcStochastic(
  candles: Candle[],
  kPeriod = 14,
  dPeriod = 3
): StochasticResult {
  const kValues: (number | null)[] = []

  for (let i = 0; i < candles.length; i++) {
    if (i < kPeriod - 1) { kValues.push(null); continue }
    const slice = candles.slice(i - kPeriod + 1, i + 1)
    const highest = Math.max(...slice.map(c => c.high))
    const lowest = Math.min(...slice.map(c => c.low))
    const range = highest - lowest
    kValues.push(range === 0 ? 50 : ((candles[i].close - lowest) / range) * 100)
  }

  const dValues = calcSMA(kValues.filter(v => v !== null) as number[], dPeriod)
  const dPadded: (number | null)[] = new Array(kValues.filter(v => v === null).length).fill(null)

  return { k: kValues, d: [...dPadded, ...dValues] }
}
