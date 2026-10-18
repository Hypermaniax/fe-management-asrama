import { Link } from 'react-router'

import { IslandMark } from '@/components/shared/island-mark'
import { buttonVariants } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-6 text-foreground">
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <IslandMark className="size-16" decorative />
          </EmptyMedia>
          <EmptyTitle>Halaman tidak ditemukan</EmptyTitle>
          <EmptyDescription>
            Alamat yang kamu buka tidak tersedia atau sudah dipindahkan.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Link to="/" className={cn(buttonVariants())}>
            Kembali ke beranda
          </Link>
        </EmptyContent>
      </Empty>
    </div>
  )
}
