import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number | null | undefined, decimals = 2): string {
  if (price == null || !isFinite(price)) return '—'
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (price >= 1) return price.toFixed(decimals)
  if (price >= 0.01) return price.toFixed(4)
  return price.toFixed(8)
}

export function formatChange(change: number, isPercent = false): string {
  const sign = change >= 0 ? '+' : ''
  if (isPercent) return `${sign}${change.toFixed(2)}%`
  return `${sign}${formatPrice(Math.abs(change))}`
}

export function formatVolume(volume: number): string {
  if (volume >= 1e12) return `${(volume / 1e12).toFixed(2)}T`
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`
  return volume.toFixed(0)
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export function getChangeColor(change: number): string {
  if (change > 0) return 'text-tv-green'
  if (change < 0) return 'text-tv-red'
  return 'text-tv-text-dim'
}

export function getChangeBg(change: number): string {
  if (change > 0) return 'bg-tv-green-dim'
  if (change < 0) return 'bg-tv-red-dim'
  return 'bg-tv-surface'
}

export function timeframeToMs(tf: string): number {
  const map: Record<string, number> = {
    '1m': 60000, '3m': 180000, '5m': 300000, '15m': 900000,
    '30m': 1800000, '1h': 3600000, '2h': 7200000, '4h': 14400000,
    '6h': 21600000, '8h': 28800000, '12h': 43200000,
    '1d': 86400000, '3d': 259200000, '1w': 604800000, '1M': 2592000000,
  }
  return map[tf] ?? 86400000
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function debounce<T extends (...args: unknown[]) => unknown>(fn: T, ms: number) {
  let timer: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function isCrypto(symbol: string): boolean {
  const cryptoSuffixes = ['USD', 'USDT', 'USDC', 'BTC', 'ETH', 'BNB']
  return cryptoSuffixes.some(suffix => symbol.endsWith(suffix))
}

export function getSymbolProvider(symbol: string): 'binance' | 'yahoo' | 'finnhub' {
  if (isCrypto(symbol)) return 'binance'
  return 'yahoo'
}
