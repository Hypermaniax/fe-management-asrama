import { cn } from '@/lib/utils'

export function IslandMark({
  className,
  decorative = false,
}: {
  className?: string
  decorative?: boolean
}) {
  return (
    <svg
      viewBox="0 0 48 48"
      role={decorative ? undefined : 'img'}
      aria-hidden={decorative ? true : undefined}
      aria-label={decorative ? undefined : 'Asrama Kepri'}
      className={cn('shrink-0', className)}
    >
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="6"
        fill="var(--main)"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <path
        d="M24 9c3 0 5 2 5 5 0 3.2-2.2 6.5-5 6.5S19 17.2 19 14c0-3 2-5 5-5Z"
        fill="var(--accent-orange)"
        stroke="var(--border)"
        strokeWidth="3"
      />
      <path
        d="M9 31c4.2 0 4.2-3 8.4-3s4.2 3 8.4 3 4.2-3 8.4-3"
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M9 38c4.2 0 4.2-3 8.4-3s4.2 3 8.4 3 4.2-3 8.4-3"
        fill="none"
        stroke="var(--border)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  )
}
