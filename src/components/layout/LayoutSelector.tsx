'use client'

import { useWorkspaceStore } from '@/stores/useWorkspaceStore'
import type { LayoutType } from '@/types/chart'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

const LAYOUTS: { type: LayoutType; label: string; grid: string[][] }[] = [
  { type: 'single', label: '1 Chart', grid: [['a']] },
  { type: 'dual', label: '2 Charts', grid: [['a', 'b']] },
  { type: 'quad', label: '4 Charts', grid: [['a', 'b'], ['c', 'd']] },
  { type: 'hexa', label: '6 Charts', grid: [['a', 'b', 'c'], ['d', 'e', 'f']] },
  { type: 'octa', label: '8 Charts', grid: [['a', 'b', 'c', 'd'], ['e', 'f', 'g', 'h']] },
]

function LayoutIcon({ grid, active }: { grid: string[][]; active: boolean }) {
  const rows = grid.length
  const cols = grid[0].length
  return (
    <div
      className={`grid gap-[2px] w-6 h-5`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1fr)`, gridTemplateRows: `repeat(${rows}, 1fr)` }}
    >
      {grid.flat().map((_, i) => (
        <div
          key={i}
          className={`rounded-[1px] ${active ? 'bg-tv-accent' : 'bg-tv-text-dim'}`}
        />
      ))}
    </div>
  )
}

export default function LayoutSelector() {
  const { layout, setLayout } = useWorkspaceStore()

  return (
    <div className="flex items-center gap-1">
      {LAYOUTS.map(l => (
        <Tooltip key={l.type}>
          <TooltipTrigger asChild>
            <button
              onClick={() => setLayout(l.type)}
              className={`p-1.5 rounded transition-colors ${
                layout.type === l.type
                  ? 'bg-tv-accent/20 ring-1 ring-tv-accent'
                  : 'hover:bg-tv-surface'
              }`}
            >
              <LayoutIcon grid={l.grid} active={layout.type === l.type} />
            </button>
          </TooltipTrigger>
          <TooltipContent>{l.label}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
