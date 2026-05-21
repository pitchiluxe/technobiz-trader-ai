'use client'

import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import TopBar from '@/components/layout/TopBar'
import ChartContainer from '@/components/charts/ChartContainer'
import WatchlistPanel from '@/components/watchlist/WatchlistPanel'
import AIAssistant from '@/components/ai/AIAssistant'

export default function TradingApp() {
  const { sidebarLeft, sidebarRight } = useWorkspaceStore()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-tv-bg select-none">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        {sidebarLeft && (
          <div className="w-[252px] shrink-0 flex flex-col border-r border-tv-border overflow-hidden bg-tv-surface">
            <WatchlistPanel />
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <ChartContainer />
        </div>
        {sidebarRight && (
          <div className="w-[280px] shrink-0 flex flex-col border-l border-tv-border overflow-hidden bg-tv-surface">
            <AIAssistant />
          </div>
        )}
      </div>
      <div className="h-[22px] flex items-center px-3 gap-3 bg-tv-surface border-t border-tv-border shrink-0">
        <span className="flex items-center gap-1.5 text-[11px] font-mono text-tv-green">
          <span className="w-1.5 h-1.5 rounded-full bg-tv-green animate-pulse inline-block" />
          Connected
        </span>
        <span className="text-[11px] text-tv-text-dim">TechnoBiz Trader AI</span>
        <span className="ml-auto text-[11px] text-tv-text-dim opacity-60">Not financial advice</span>
      </div>
    </div>
  )
}
