import { useHealth } from '@/features/health/hooks'
import { cn } from '@/lib/utils'

export function ApiStatus() {
  const { data, isError, isPending } = useHealth()
  const online = !isPending && !isError && Boolean(data)

  const label = isPending ? 'Menghubungi' : online ? 'Terhubung' : 'Terputus'

  return (
    <span
      title={`Status server: ${label}`}
      className="inline-flex items-center gap-1.5 rounded-base border-2 border-border bg-secondary-background px-2 py-1 font-heading text-xs uppercase text-foreground"
    >
      <span
        aria-hidden="true"
        className={cn(
          'size-2 rounded-[2px]',
          isPending ? 'bg-accent-orange' : online ? 'bg-accent-teal' : 'bg-danger',
        )}
      />
      <span className="hidden sm:inline">{label}</span>
      <span className="sr-only">Status server: {label}</span>
    </span>
  )
}
