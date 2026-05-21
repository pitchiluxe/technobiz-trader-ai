'use client'

import dynamic from 'next/dynamic'
import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { ChartPane } from '@/types/chart'
import { LAYOUT_GRID } from '@/types/chart'

const ChartWidget = dynamic(() => import('./ChartWidget'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-tv-bg">
      <div className="flex flex-col items-center gap-2">
        <div className="w-8 h-8 border-2 border-tv-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-tv-text-dim text-xs">Loading chart...</span>
      </div>
    </div>
  ),
})

const GRID_STYLES: Record<string, string> = {
  single: 'grid-cols-1 grid-rows-1',
  dual:   'grid-cols-2 grid-rows-1',
  quad:   'grid-cols-2 grid-rows-2',
  hexa:   'grid-cols-3 grid-rows-2',
  octa:   'grid-cols-4 grid-rows-2',
}

export default function ChartContainer() {
  const { layout, setActivePane } = useWorkspaceStore()
  const { type, panes, activePane } = layout
  const gridStyle = GRID_STYLES[type] ?? GRID_STYLES.quad

  return (
    <div className={`grid ${gridStyle} w-full h-full gap-[1px] bg-tv-border`}>
      {panes.map((pane: ChartPane) => (
        <div
          key={pane.id}
          className="bg-tv-bg overflow-hidden"
        >
          <ChartWidget
            pane={pane}
            isActive={pane.id === activePane}
            onActivate={() => setActivePane(pane.id)}
          />
        </div>
      ))}
    </div>
  )
}
