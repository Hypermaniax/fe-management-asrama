import type { ComponentType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

const TONES = {
  teal: 'bg-accent-teal text-foreground',
  orange: 'bg-accent-orange text-foreground',
  cream: 'bg-background text-foreground',
  ink: 'bg-foreground text-background',
} as const

export type StatTone = keyof typeof TONES

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'teal',
}: {
  label: string
  value: ReactNode
  hint?: ReactNode
  icon?: ComponentType<{ className?: string }>
  tone?: StatTone
}) {
  return (
    <div className="flex flex-col gap-3 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <div className="flex items-start justify-between gap-3">
        <span className="label">{label}</span>
        {Icon ? (
          <span
            className={cn(
              'grid size-9 shrink-0 place-items-center rounded-base border-2 border-border',
              TONES[tone],
            )}
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div className="font-heading text-2xl leading-none tabular-nums">
        {value}
      </div>
      {hint ? (
        <p className="text-xs text-foreground/70">{hint}</p>
      ) : null}
    </div>
  )
}
