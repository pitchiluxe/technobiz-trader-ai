'use client'

import dynamic from 'next/dynamic'

const TradingApp = dynamic(() => import('@/components/TradingApp'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-screen items-center justify-center bg-[#0F1117]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-2 border-[#2962FF] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#787B86] text-sm tracking-wide">Initializing TechnoBiz Trader AI...</p>
      </div>
    </div>
  ),
})

export default function TradingTerminal() {
  return <TradingApp />
}
