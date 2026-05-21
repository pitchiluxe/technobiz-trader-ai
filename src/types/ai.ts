export type AIProvider = 'openrouter' | 'ollama' | 'anthropic'

export type AIModel =
  | 'deepseek/deepseek-v4-flash:free'
  | 'deepseek/deepseek-chat'
  | 'anthropic/claude-3.5-sonnet'
  | 'anthropic/claude-3-haiku'
  | 'meta-llama/llama-3.2-90b-vision-instruct'
  | 'mistralai/mixtral-8x7b-instruct'
  | 'google/gemma-2-9b-it'
  | 'qwen/qwen-2.5-72b-instruct'
  | string

export interface AIModelConfig {
  id: AIModel
  name: string
  provider: AIProvider
  contextWindow: number
  supportsStreaming: boolean
  costPer1kTokens?: number
  description?: string
}

export type TradeDirection = 'long' | 'short' | 'neutral'
export type ConfidenceLevel = 'low' | 'medium' | 'high' | 'very_high'

export interface TradeSetup {
  symbol: string
  direction: TradeDirection
  entry: number
  stopLoss: number
  takeProfit: number[]
  riskReward: number
  confidence: number
  confidenceLevel: ConfidenceLevel
  timeframe: string
  bias: string
  reasoning: string
  keyLevels: { price: number; type: string; description: string }[]
  multiTimeframeAnalysis: {
    timeframe: string
    trend: string
    signal: string
  }[]
  marketStructure: {
    trend: 'uptrend' | 'downtrend' | 'ranging' | 'breakout'
    phase: string
    description: string
  }
  indicators: {
    name: string
    value: string
    signal: 'bullish' | 'bearish' | 'neutral'
  }[]
  orderBlocks?: { price: number; type: 'bullish' | 'bearish'; strength: 'strong' | 'moderate' }[]
  fairValueGaps?: { top: number; bottom: number; filled: boolean }[]
  liquidityLevels?: { price: number; type: 'buy' | 'sell'; strength: number }[]
  generatedAt: number
}

export interface AIMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: number
  tradeSetup?: TradeSetup
  isStreaming?: boolean
}

export interface AIAnalysisRequest {
  symbol: string
  timeframe: string
  question?: string
  includeTradeSetup?: boolean
  streamResponse?: boolean
}

export interface AIAnalysisResponse {
  content: string
  tradeSetup?: TradeSetup
  model: string
  provider: AIProvider
  tokensUsed?: number
}

export interface AISignal {
  id: string
  symbol: string
  setup: TradeSetup
  status: 'active' | 'triggered' | 'stopped' | 'target_hit' | 'expired'
  emailSent?: boolean
  emailRecipient?: string
  createdAt: number
  updatedAt: number
}

export const AVAILABLE_MODELS: AIModelConfig[] = [
  {
    id: 'deepseek/deepseek-v4-flash:free',
    name: 'DeepSeek V4 Flash (Free)',
    provider: 'openrouter',
    contextWindow: 128000,
    supportsStreaming: true,
    costPer1kTokens: 0,
  },
  {
    id: 'deepseek/deepseek-chat',
    name: 'DeepSeek Chat',
    provider: 'openrouter',
    contextWindow: 64000,
    supportsStreaming: true,
    costPer1kTokens: 0.00014,
  },
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'openrouter',
    contextWindow: 200000,
    supportsStreaming: true,
    costPer1kTokens: 0.003,
  },
  {
    id: 'anthropic/claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'openrouter',
    contextWindow: 200000,
    supportsStreaming: true,
    costPer1kTokens: 0.00025,
  },
  {
    id: 'meta-llama/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B',
    provider: 'openrouter',
    contextWindow: 131072,
    supportsStreaming: true,
    costPer1kTokens: 0.0009,
  },
  {
    id: 'mistralai/mixtral-8x7b-instruct',
    name: 'Mixtral 8x7B',
    provider: 'openrouter',
    contextWindow: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0.00024,
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct',
    name: 'Qwen 2.5 72B',
    provider: 'openrouter',
    contextWindow: 32768,
    supportsStreaming: true,
    costPer1kTokens: 0.00035,
  },
]
