import { Construction } from 'lucide-react'

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

export function PagePlaceholder({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <Empty className={cn('min-h-[50svh]', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Construction />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>
          {description ?? 'Halaman ini dibangun pada fase berikutnya.'}
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  )
}
