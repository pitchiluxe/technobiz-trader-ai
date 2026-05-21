'use client'

import { TrendingUp, TrendingDown, Clock } from 'lucide-react'
import { useAIStore } from '@/stores/useAIStore'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatPrice } from '@/lib/utils'

const STATUS_COLORS = {
  active: 'text-tv-green',
  triggered: 'text-tv-accent',
  stopped: 'text-tv-red',
  target_hit: 'text-tv-green',
  expired: 'text-tv-text-dim',
}

export default function AISignalsPanel() {
  const { signals } = useAIStore()

  if (signals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center gap-2 py-8">
        <TrendingUp className="w-8 h-8 text-tv-text-dim" />
        <p className="text-sm text-tv-text-dim">No signals yet</p>
        <p className="text-xs text-tv-text-dim">Use AI Analyze to generate trade signals</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2 space-y-2">
        {(signals as import('@/types/ai').AISignal[]).map(sig => {
          const isLong = sig.setup.direction === 'long'
          return (
            <div key={sig.id} className="bg-tv-surface border border-tv-border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isLong
                    ? <TrendingUp className="w-4 h-4 text-tv-green" />
                    : <TrendingDown className="w-4 h-4 text-tv-red" />}
                  <span className="font-bold text-white font-mono text-sm">{sig.symbol}</span>
                  <Badge variant={isLong ? 'green' : 'red'} className="text-xs">{sig.setup.direction.toUpperCase()}</Badge>
                </div>
                <span className={`text-xs font-semibold ${STATUS_COLORS[sig.status] ?? 'text-tv-text-dim'}`}>
                  {sig.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-tv-text-dim">Entry</div>
                  <div className="text-white font-mono">${formatPrice(sig.setup.entry)}</div>
                </div>
                <div>
                  <div className="text-tv-text-dim">SL</div>
                  <div className="text-tv-red font-mono">${formatPrice(sig.setup.stopLoss)}</div>
                </div>
                <div>
                  <div className="text-tv-text-dim">TP1</div>
                  <div className="text-tv-green font-mono">${formatPrice(sig.setup.takeProfit[0] ?? 0)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-tv-text-dim">
                <span>Conf: <span className="text-white">{sig.setup.confidence}%</span></span>
                <span>R/R: <span className="text-white">1:{sig.setup.riskReward.toFixed(2)}</span></span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(sig.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </ScrollArea>
  )
}
