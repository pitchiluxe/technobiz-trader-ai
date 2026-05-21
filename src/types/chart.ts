import type { TimeFrame } from './market'

export type ChartType = 'candlestick' | 'line' | 'area' | 'bar' | 'baseline'

export type IndicatorType =
  | 'RSI' | 'MACD' | 'EMA' | 'SMA' | 'VWAP'
  | 'BB' | 'ATR' | 'STOCH' | 'VOLUME' | 'OBV'

export interface IndicatorConfig {
  id: string
  type: IndicatorType
  params: Record<string, number | string>
  visible: boolean
  color?: string
  pane?: 'main' | 'separate'
}

export interface DrawingTool {
  id: string
  type: 'trendline' | 'horizontal' | 'fibonacci' | 'rectangle' | 'text' | 'arrow'
  points: { time: number; value: number }[]
  color: string
  width: number
  text?: string
}

export interface ChartPane {
  id: string
  symbol: string
  timeframe: TimeFrame
  chartType: ChartType
  indicators: IndicatorConfig[]
  drawings: DrawingTool[]
}

export type LayoutType = 'single' | 'dual' | 'quad' | 'hexa' | 'octa'

export interface LayoutConfig {
  type: LayoutType
  panes: ChartPane[]
  activePane: string
}

export const LAYOUT_GRID: Record<LayoutType, { cols: number; rows: number; count: number }> = {
  single: { cols: 1, rows: 1, count: 1 },
  dual:   { cols: 2, rows: 1, count: 2 },
  quad:   { cols: 2, rows: 2, count: 4 },
  hexa:   { cols: 3, rows: 2, count: 6 },
  octa:   { cols: 4, rows: 2, count: 8 },
}

export interface ChartAnnotation {
  type: 'entry' | 'sl' | 'tp' | 'label'
  price: number
  color: string
  label?: string
  time?: number
}
