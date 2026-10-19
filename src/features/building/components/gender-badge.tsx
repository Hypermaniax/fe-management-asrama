import { Badge } from '@/components/ui/badge'
import type { Gender } from '@/features/building/api'
import { cn } from '@/lib/utils'

export function GenderBadge({ gender }: { gender: Gender }) {
  const male = gender === 'MALE'
  return (
    <Badge
      className={cn(
        'font-heading tracking-wide uppercase',
        male
          ? 'bg-accent-teal text-foreground'
          : 'bg-accent-orange text-foreground',
      )}
    >
      {male ? 'Putra' : 'Putri'}
    </Badge>
  )
}
