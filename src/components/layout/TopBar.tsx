'use client'

import { useState, useEffect } from 'react'
import { LayoutDashboard, PanelLeft, PanelRight, Activity, Settings, Wifi, WifiOff } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import LayoutSelector from './LayoutSelector'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function TopBar() {
  const { toggleSidebarLeft, toggleSidebarRight, sidebarLeft, sidebarRight, setRightTab } = useWorkspaceStore()
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline) }
  }, [])

  return (
    <header className="h-10 flex items-center justify-between px-3 bg-tv-surface border-b border-tv-border shrink-0 z-30">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-tv-accent rounded flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">
            TechnoBiz <span className="text-tv-accent">Trader</span>
          </span>
        </div>

        <div className="h-4 w-px bg-tv-border" />

        {/* Layout Selector */}
        <LayoutSelector />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1">
        {/* Connectivity */}
        <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${isOnline ? 'text-tv-green' : 'text-tv-red'}`}>
          {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{isOnline ? 'Live' : 'Offline'}</span>
        </div>

        <div className="h-4 w-px bg-tv-border mx-1" />

        {/* AI Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={() => { setRightTab('ai') }}
              className="text-tv-accent hover:bg-tv-accent/10"
            >
              <Activity className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>AI Analyst</TooltipContent>
        </Tooltip>

        {/* Panel Toggles */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={toggleSidebarLeft}
              className={sidebarLeft ? 'text-white' : 'text-tv-text-dim'}
            >
              <PanelLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle Watchlist</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={toggleSidebarRight}
              className={sidebarRight ? 'text-white' : 'text-tv-text-dim'}
            >
              <PanelRight className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle AI Panel</TooltipContent>
        </Tooltip>
      </div>
    </header>
  )
}
