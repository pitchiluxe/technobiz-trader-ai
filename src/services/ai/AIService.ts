import OpenAI from 'openai'
import type { AIAnalysisRequest, AIAnalysisResponse, TradeSetup, AIModel } from '@/types/ai'
import { AI_SYSTEM_PROMPT } from '@/lib/constants'

function buildOpenRouterClient(): OpenAI {
  const baseURL = process.env.ANTHROPIC_BASE_URL
    ? `${process.env.ANTHROPIC_BASE_URL.replace(/\/$/, '')}/v1`
    : 'https://openrouter.ai/api/v1'

  return new OpenAI({
    apiKey: process.env.ANTHROPIC_AUTH_TOKEN ?? '',
    baseURL,
    defaultHeaders: {
      'HTTP-Referer': 'https://technobiz-trader.ai',
      'X-Title': 'TechnoBiz Trader AI',
    },
  })
}

function buildOllamaClient(): OpenAI {
  return new OpenAI({
    apiKey: 'ollama',
    baseURL: `${process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434'}/v1`,
  })
}

export class AIService {
  private openRouter: OpenAI
  private ollama: OpenAI
  private defaultModel: AIModel

  constructor() {
    this.openRouter = buildOpenRouterClient()
    this.ollama = buildOllamaClient()
    this.defaultModel = (process.env.ANTHROPIC_MODEL as AIModel) ?? 'deepseek/deepseek-v4-flash:free'
  }

  async analyzeMarket(
    req: AIAnalysisRequest,
    marketData: string,
    model?: AIModel
  ): Promise<AIAnalysisResponse> {
    const selectedModel = model ?? this.defaultModel
    const isOllama = selectedModel.startsWith('llama') || selectedModel.startsWith('mistral') || !selectedModel.includes('/')
    const client = isOllama ? this.ollama : this.openRouter

    const userPrompt = this.buildAnalysisPrompt(req, marketData)

    const completion = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    })

    const content = completion.choices[0]?.message?.content ?? ''
    const tradeSetup = req.includeTradeSetup ? this.parseTradeSetup(content, req.symbol) : undefined

    return {
      content,
      tradeSetup,
      model: selectedModel,
      provider: isOllama ? 'ollama' : 'openrouter',
      tokensUsed: completion.usage?.total_tokens,
    }
  }

  async *streamAnalysis(
    req: AIAnalysisRequest,
    marketData: string,
    model?: AIModel
  ): AsyncGenerator<string> {
    const selectedModel = model ?? this.defaultModel
    const isOllama = selectedModel.startsWith('llama') || selectedModel.startsWith('mistral') || !selectedModel.includes('/')
    const client = isOllama ? this.ollama : this.openRouter

    const userPrompt = this.buildAnalysisPrompt(req, marketData)

    const stream = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }

  chat(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    model?: AIModel
  ): AsyncGenerator<string> {
    return this.streamChat(messages, model)
  }

  async *streamChat(
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    model?: AIModel
  ): AsyncGenerator<string> {
    const selectedModel = model ?? this.defaultModel
    const isOllama = selectedModel.startsWith('llama') || selectedModel.startsWith('mistral') || !selectedModel.includes('/')
    const client = isOllama ? this.ollama : this.openRouter

    const stream = await client.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: AI_SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.4,
      max_tokens: 1500,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (delta) yield delta
    }
  }

  private buildAnalysisPrompt(req: AIAnalysisRequest, marketData: string): string {
    const question = req.question ?? `Provide a complete institutional-grade trade analysis for ${req.symbol} on the ${req.timeframe} timeframe.`

    return `SYMBOL: ${req.symbol}
TIMEFRAME: ${req.timeframe}

MARKET DATA (Recent OHLCV):
${marketData}

REQUEST: ${question}

${req.includeTradeSetup ? `
Please provide:
1. Market structure analysis
2. Trend direction and momentum
3. Key levels (support, resistance, order blocks, FVGs)
4. Liquidity analysis
5. Trade setup with EXACT entry, stop loss, and take profit levels
6. Confidence score (0-100%)
7. Risk/reward ratio
8. Multi-timeframe confirmation
9. Institutional reasoning

Format the trade setup clearly with:
DIRECTION: LONG/SHORT
ENTRY: $X
STOP LOSS: $X
TAKE PROFIT 1: $X
TAKE PROFIT 2: $X
TAKE PROFIT 3: $X
CONFIDENCE: X%
R/R RATIO: 1:X
` : ''}`
  }

  parseTradeSetup(content: string, symbol: string): TradeSetup | undefined {
    try {
      const dirMatch = content.match(/DIRECTION:\s*(LONG|SHORT)/i)
      const entryMatch = content.match(/ENTRY:\s*\$?([\d,]+\.?\d*)/i)
      const slMatch = content.match(/STOP\s*LOSS:\s*\$?([\d,]+\.?\d*)/i)
      const tp1Match = content.match(/TAKE\s*PROFIT\s*1:\s*\$?([\d,]+\.?\d*)/i)
      const tp2Match = content.match(/TAKE\s*PROFIT\s*2:\s*\$?([\d,]+\.?\d*)/i)
      const tp3Match = content.match(/TAKE\s*PROFIT\s*3:\s*\$?([\d,]+\.?\d*)/i)
      const confMatch = content.match(/CONFIDENCE:\s*(\d+)%?/i)
      const rrMatch = content.match(/R\/R\s*RATIO:\s*1:([\d.]+)/i)

      if (!dirMatch || !entryMatch || !slMatch) return undefined

      const entry = parseFloat(entryMatch[1].replace(/,/g, ''))
      const sl = parseFloat(slMatch[1].replace(/,/g, ''))
      const tp1 = tp1Match ? parseFloat(tp1Match[1].replace(/,/g, '')) : 0
      const tp2 = tp2Match ? parseFloat(tp2Match[1].replace(/,/g, '')) : 0
      const tp3 = tp3Match ? parseFloat(tp3Match[1].replace(/,/g, '')) : 0
      const confidence = confMatch ? parseInt(confMatch[1]) : 65
      const rr = rrMatch ? parseFloat(rrMatch[1]) : tp1 ? Math.abs(tp1 - entry) / Math.abs(entry - sl) : 2

      const direction = dirMatch[1].toUpperCase() === 'LONG' ? 'long' : 'short'
      const takeProfit = [tp1, tp2, tp3].filter(t => t > 0)

      return {
        symbol,
        direction,
        entry,
        stopLoss: sl,
        takeProfit: takeProfit.length > 0 ? takeProfit : [entry + (entry - sl) * 2],
        riskReward: rr,
        confidence,
        confidenceLevel: confidence >= 80 ? 'very_high' : confidence >= 65 ? 'high' : confidence >= 50 ? 'medium' : 'low',
        timeframe: 'multiple',
        bias: content.substring(0, 200),
        reasoning: content,
        keyLevels: [],
        multiTimeframeAnalysis: [],
        marketStructure: { trend: 'uptrend', phase: 'unknown', description: '' },
        indicators: [],
        generatedAt: Date.now(),
      }
    } catch {
      return undefined
    }
  }
}

export const aiService = new AIService()
