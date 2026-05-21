'use client'

import { useState, useEffect } from 'react'
import { PanelLeft, PanelRight, Wifi, WifiOff, Zap } from 'lucide-react'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import LayoutSelector from './LayoutSelector'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

export default function TopBar() {
  const { toggleSidebarLeft, toggleSidebarRight, sidebarLeft, sidebarRight, setRightTab } = useWorkspaceStore()
  const [isOnline, setIsOnline] = useState(true)
  const [time, setTime] = useState('')

  useEffect(() => {
    const tick = () => setTime(new Date().toUTCString().slice(17, 25) + ' UTC')
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const up = () => setIsOnline(true)
    const down = () => setIsOnline(false)
    window.addEventListener('online', up)
    window.addEventListener('offline', down)
    return () => { window.removeEventListener('online', up); window.removeEventListener('offline', down) }
  }, [])

  return (
    <header className="h-11 flex items-center justify-between px-3 bg-tv-surface border-b border-tv-border shrink-0 z-30">
      {/* Left: Logo + Layout */}
      <div className="flex items-center gap-3">
        {/* Logo */}
        <div className="flex items-center gap-2 select-none">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-tv-accent to-blue-700 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-white font-bold text-xs tracking-tight">TechnoBiz</span>
            <span className="text-tv-accent text-[10px] font-mono tracking-widest">TRADER AI</span>
          </div>
        </div>

        <div className="h-5 w-px bg-tv-border mx-0.5" />

        <LayoutSelector />
      </div>

      {/* Center: UTC Clock */}
      <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-tv-text-dim">
        <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-tv-green animate-pulse' : 'bg-tv-red'}`} />
        <span className="tabular-nums">{time}</span>
      </div>

      {/* Right: Controls */}
      <div className="flex items-center gap-0.5">
        {/* Connectivity badge */}
        <div className={`hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono ${isOnline ? 'text-tv-green' : 'text-tv-red'}`}>
          {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
          <span>{isOnline ? 'LIVE' : 'OFFLINE'}</span>
        </div>

        <div className="h-4 w-px bg-tv-border mx-1" />

        {/* AI Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setRightTab('ai')}
              className="h-7 px-2 text-xs gap-1 text-tv-accent hover:bg-tv-accent/10 hover:text-tv-accent font-mono"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">AI</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Open AI Analyst</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              size="icon-sm"
              variant="ghost"
              onClick={toggleSidebarLeft}
              className={`h-7 w-7 transition-colors ${sidebarLeft ? 'text-white bg-tv-border/50' : 'text-tv-text-dim hover:text-white'}`}
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
              className={`h-7 w-7 transition-colors ${sidebarRight ? 'text-white bg-tv-border/50' : 'text-tv-text-dim hover:text-white'}`}
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
