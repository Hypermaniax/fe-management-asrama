import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string
  onRetry?: () => void
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <TriangleAlert />
        </EmptyMedia>
        <EmptyTitle>Terjadi kesalahan</EmptyTitle>
        <EmptyDescription>{message ?? 'Data gagal dimuat.'}</EmptyDescription>
      </EmptyHeader>
      {onRetry ? (
        <EmptyContent>
          <Button variant="neutral" onClick={onRetry}>
            Coba lagi
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  )
}
