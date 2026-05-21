'use client'

import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import TopBar from '@/components/layout/TopBar'
import ChartContainer from '@/components/charts/ChartContainer'
import ChartToolbar from '@/components/charts/ChartToolbar'
import WatchlistPanel from '@/components/watchlist/WatchlistPanel'
import AIAssistant from '@/components/ai/AIAssistant'
import AISignalsPanel from '@/components/ai/AISignalsPanel'
import MarketOverview from '@/components/market/MarketOverview'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'

export default function TradingTerminal() {
  const { sidebarLeft, sidebarRight, rightTab, setRightTab } = useWorkspaceStore()

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-tv-bg select-none">
      {/* Top Navigation Bar */}
      <TopBar />

      {/* Chart Toolbar */}
      <ChartToolbar />

      {/* Main Trading Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar — Watchlist */}
        {sidebarLeft && (
          <>
            <div className="w-52 shrink-0 flex flex-col border-r border-tv-border overflow-hidden">
              <Tabs defaultValue="watchlist" className="flex flex-col h-full">
                <TabsList className="mx-2 mt-2 mb-0 h-8 shrink-0">
                  <TabsTrigger value="watchlist" className="text-xs flex-1">Watchlist</TabsTrigger>
                  <TabsTrigger value="overview" className="text-xs flex-1">Market</TabsTrigger>
                </TabsList>
                <TabsContent value="watchlist" className="flex-1 overflow-hidden m-0 mt-1">
                  <WatchlistPanel />
                </TabsContent>
                <TabsContent value="overview" className="flex-1 overflow-hidden m-0 mt-1">
                  <MarketOverview />
                </TabsContent>
              </Tabs>
            </div>
            <Separator orientation="vertical" className="shrink-0" />
          </>
        )}

        {/* Charts Area */}
        <div className="flex-1 overflow-hidden">
          <ChartContainer />
        </div>

        {/* Right Sidebar — AI Panel */}
        {sidebarRight && (
          <>
            <Separator orientation="vertical" className="shrink-0" />
            <div className="w-72 shrink-0 flex flex-col border-l border-tv-border overflow-hidden">
              <Tabs
                value={rightTab}
                onValueChange={(v) => setRightTab(v as 'ai' | 'signals' | 'overview')}
                className="flex flex-col h-full"
              >
                <TabsList className="mx-2 mt-2 mb-0 h-8 shrink-0">
                  <TabsTrigger value="ai" className="text-xs flex-1">AI Chat</TabsTrigger>
                  <TabsTrigger value="signals" className="text-xs flex-1">Signals</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="flex-1 overflow-hidden m-0">
                  <AIAssistant />
                </TabsContent>
                <TabsContent value="signals" className="flex-1 overflow-hidden m-0">
                  <AISignalsPanel />
                </TabsContent>
              </Tabs>
            </div>
          </>
        )}
      </div>

      {/* Status Bar */}
      <div className="h-6 flex items-center px-3 gap-4 bg-tv-surface border-t border-tv-border shrink-0 text-xs text-tv-text-dim">
        <span className="text-tv-green font-mono flex items-center gap-1">
          <div className="w-1.5 h-1.5 bg-tv-green rounded-full animate-pulse" />
          Connected
        </span>
        <span>TechnoBiz Trader AI</span>
        <span className="ml-auto">Powered by DeepSeek + OpenRouter</span>
        <span className="text-tv-text-dim">Not financial advice</span>
      </div>
    </div>
  )
}
