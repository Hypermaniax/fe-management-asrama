import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type SummaryItem = {
  label: string
  value: ReactNode
  hint?: ReactNode
  tone?: 'default' | 'teal' | 'orange' | 'danger'
}

const TONES = {
  default: 'bg-secondary-background',
  teal: 'bg-accent-teal',
  orange: 'bg-accent-orange',
  danger: 'bg-danger text-main-foreground',
} as const

export function ReportSummary({ items }: { items: SummaryItem[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className={cn(
            'flex flex-col gap-1 rounded-base border-2 border-border p-4',
            TONES[item.tone ?? 'default'],
          )}
        >
          <span className="text-xs uppercase tracking-wide text-foreground/60">
            {item.label}
          </span>
          <span className="font-heading text-lg tabular-nums">{item.value}</span>
          {item.hint ? (
            <span className="text-xs text-foreground/60">{item.hint}</span>
          ) : null}
        </div>
      ))}
    </div>
  )
}
