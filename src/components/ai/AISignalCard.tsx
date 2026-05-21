'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Send, Check } from 'lucide-react'
import type { TradeSetup } from '@/types/ai'
import { formatPrice } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAIStore } from '@/stores/useAIStore'

interface Props {
  setup: TradeSetup
  analysis?: string
}

export default function AISignalCard({ setup, analysis = '' }: Props) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const { emailRecipient } = useAIStore()

  const isLong = setup.direction === 'long'
  const dirColor = isLong ? 'text-tv-green' : 'text-tv-red'
  const dirBg = isLong ? 'bg-tv-green-dim' : 'bg-tv-red-dim'
  const dirBorder = isLong ? 'border-tv-green/30' : 'border-tv-red/30'

  const confColor = setup.confidence >= 75 ? 'text-tv-green' : setup.confidence >= 55 ? 'text-tv-yellow' : 'text-tv-red'

  const sendEmail = async (email: string) => {
    setSending(true)
    try {
      const res = await fetch('/api/email/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, setup, analysis }),
      })
      if (res.ok) { setSent(true); setTimeout(() => setSent(false), 3000) }
    } finally { setSending(false); setShowEmailInput(false) }
  }

  return (
    <div className={`rounded-lg border ${dirBorder} bg-tv-surface/60 p-3 space-y-3 text-sm`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${dirBg}`}>
            {isLong ? <TrendingUp className={`w-4 h-4 ${dirColor}`} /> : <TrendingDown className={`w-4 h-4 ${dirColor}`} />}
          </div>
          <div>
            <span className="text-white font-bold font-mono">{setup.symbol}</span>
            <Badge variant={isLong ? 'green' : 'red'} className="ml-2 text-xs">{setup.direction.toUpperCase()}</Badge>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${confColor}`}>{setup.confidence}%</div>
          <div className="text-xs text-tv-text-dim">confidence</div>
        </div>
      </div>

      {/* Levels Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-tv-bg rounded p-2">
          <div className="text-xs text-tv-text-dim mb-0.5">Entry</div>
          <div className="text-white font-mono font-semibold">${formatPrice(setup.entry)}</div>
        </div>
        <div className="bg-tv-bg rounded p-2">
          <div className="text-xs text-tv-text-dim mb-0.5">Stop Loss</div>
          <div className="text-tv-red font-mono font-semibold">${formatPrice(setup.stopLoss)}</div>
        </div>
        {setup.takeProfit.slice(0, 2).map((tp, i) => (
          <div key={i} className="bg-tv-bg rounded p-2">
            <div className="text-xs text-tv-text-dim mb-0.5">TP {i + 1}</div>
            <div className="text-tv-green font-mono font-semibold">${formatPrice(tp)}</div>
          </div>
        ))}
      </div>

      {/* R/R Bar */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-tv-text-dim">Risk/Reward</span>
        <span className="text-white font-mono">1:{setup.riskReward.toFixed(2)}</span>
      </div>

      {/* Confidence Bar */}
      <div>
        <div className="h-1.5 bg-tv-bg rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${setup.confidence >= 75 ? 'bg-tv-green' : setup.confidence >= 55 ? 'bg-tv-yellow' : 'bg-tv-red'}`}
            style={{ width: `${setup.confidence}%` }}
          />
        </div>
      </div>

      {/* Email Section */}
      {showEmailInput ? (
        <div className="flex gap-2">
          <input
            className="flex-1 bg-tv-bg border border-tv-border rounded px-2 py-1 text-xs text-tv-text placeholder:text-tv-text-dim focus:outline-none focus:border-tv-accent"
            placeholder="Enter email address..."
            value={customEmail}
            onChange={e => setCustomEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && customEmail && sendEmail(customEmail)}
            autoFocus
          />
          <Button size="icon-sm" onClick={() => customEmail && sendEmail(customEmail)} disabled={!customEmail || sending}>
            {sending ? <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-3 h-3" />}
          </Button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 text-xs h-7"
            onClick={() => sendEmail(emailRecipient)}
            disabled={sending || sent}
          >
            {sent ? <><Check className="w-3 h-3 mr-1 text-tv-green" />Sent!</> : sending ? 'Sending...' : <><Send className="w-3 h-3 mr-1" />Email Signal</>}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7 px-2"
            onClick={() => setShowEmailInput(true)}
          >
            Custom
          </Button>
        </div>
      )}
    </div>
  )
}
