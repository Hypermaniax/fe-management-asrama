import type { ReactNode } from 'react'

export function Panel({
  label,
  title,
  action,
  children,
}: {
  label?: string
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-4 rounded-base border-2 border-border bg-background p-5 shadow-shadow">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {label ? <span className="label">{label}</span> : null}
          <h2 className="mt-2 font-heading text-xl">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
