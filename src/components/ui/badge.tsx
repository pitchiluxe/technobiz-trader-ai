import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-tv-accent text-white shadow',
        secondary: 'border-transparent bg-tv-surface text-tv-text',
        destructive: 'border-transparent bg-tv-red text-white shadow',
        outline: 'border-tv-border text-tv-text',
        green: 'border-transparent bg-tv-green-dim text-tv-green',
        red: 'border-transparent bg-tv-red-dim text-tv-red',
        yellow: 'border-transparent bg-yellow-900/30 text-tv-yellow',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
