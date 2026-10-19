import { useState, type MouseEvent, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { SkeletonTable } from '@/components/shared/skeletons'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from '@/components/ui/pagination'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export type Column<T> = {
  key: string
  header: ReactNode
  cell: (row: T) => ReactNode
  className?: string
  headClassName?: string
}

export type DataTableProps<T> = {
  columns: Column<T>[]
  data: T[]
  getRowId: (row: T) => string
  isLoading?: boolean
  error?: string
  onRetry?: () => void
  emptyTitle?: ReactNode
  emptyDescription?: ReactNode
  emptyAction?: ReactNode
  toolbar?: ReactNode
  pageSize?: number
}

function TableHeaderRow<T>({ columns }: { columns: Column<T>[] }) {
  return (
    <TableHeader>
      <TableRow className="bg-accent-teal hover:bg-accent-teal">
        {columns.map((column) => (
          <TableHead key={column.key} className={column.headClassName}>
            {column.header}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  )
}

function TableRows<T>({
  columns,
  rows,
  getRowId,
}: {
  columns: Column<T>[]
  rows: T[]
  getRowId: (row: T) => string
}) {
  return (
    <TableBody>
      {rows.map((row) => (
        <TableRow key={getRowId(row)}>
          {columns.map((column) => (
            <TableCell key={column.key} className={column.className}>
              {column.cell(row)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  )
}

function DataTableContent<T>({
  columns,
  data,
  rows,
  getRowId,
  isLoading,
  error,
  onRetry,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: Pick<
  DataTableProps<T>,
  | 'columns'
  | 'data'
  | 'getRowId'
  | 'isLoading'
  | 'error'
  | 'onRetry'
  | 'emptyTitle'
  | 'emptyDescription'
  | 'emptyAction'
> & { rows: T[] }) {
  if (isLoading) {
    return <SkeletonTable rows={5} cols={columns.length} />
  }

  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    )
  }

  return (
    <Table>
      <TableHeaderRow columns={columns} />
      <TableRows columns={columns} rows={rows} getRowId={getRowId} />
    </Table>
  )
}

type PageItem = number | 'ellipsis'

function pageItems(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const items: PageItem[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)

  if (start > 2) items.push('ellipsis')
  for (let page = start; page <= end; page += 1) items.push(page)
  if (end < total - 1) items.push('ellipsis')
  items.push(total)

  return items
}

function TablePagination({
  page,
  totalPages,
  start,
  end,
  total,
  onPageChange,
}: {
  page: number
  totalPages: number
  start: number
  end: number
  total: number
  onPageChange: (page: number) => void
}) {
  const goTo = (next: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    if (next < 1 || next > totalPages || next === page) return
    onPageChange(next)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-foreground/70">
        Menampilkan {start + 1}–{end} dari {total}
      </p>
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Halaman sebelumnya"
              aria-disabled={page <= 1}
              className={cn(
                'gap-1 pl-2.5',
                page <= 1 && 'pointer-events-none opacity-50',
              )}
              onClick={goTo(page - 1)}
            >
              <ChevronLeft className="size-4" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </PaginationLink>
          </PaginationItem>

          {pageItems(page, totalPages).map((item, index) =>
            item === 'ellipsis' ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={item}>
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  aria-label={`Halaman ${item}`}
                  onClick={goTo(item)}
                >
                  {item}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          <PaginationItem>
            <PaginationLink
              href="#"
              size="default"
              aria-label="Halaman berikutnya"
              aria-disabled={page >= totalPages}
              className={cn(
                'gap-1 pr-2.5',
                page >= totalPages && 'pointer-events-none opacity-50',
              )}
              onClick={goTo(page + 1)}
            >
              <span className="hidden sm:inline">Berikutnya</span>
              <ChevronRight className="size-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}

export function DataTable<T>({
  columns,
  data,
  getRowId,
  isLoading = false,
  error,
  onRetry,
  emptyTitle = 'Belum ada data',
  emptyDescription,
  emptyAction,
  toolbar,
  pageSize,
}: DataTableProps<T>) {
  const [page, setPage] = useState(1)

  const perPage = pageSize && pageSize > 0 ? pageSize : data.length
  const totalPages = Math.max(1, Math.ceil(data.length / perPage))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * perPage
  const rows = data.slice(start, start + perPage)
  const showPagination = Boolean(pageSize) && data.length > perPage
  const end = Math.min(start + perPage, data.length)

  return (
    <div className="flex flex-col gap-4">
      {toolbar ? (
        <div className="flex flex-wrap items-center gap-3">{toolbar}</div>
      ) : null}

      <DataTableContent
        columns={columns}
        data={data}
        rows={rows}
        getRowId={getRowId}
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        emptyTitle={emptyTitle}
        emptyDescription={emptyDescription}
        emptyAction={emptyAction}
      />

      {showPagination ? (
        <TablePagination
          page={currentPage}
          totalPages={totalPages}
          start={start}
          end={end}
          total={data.length}
          onPageChange={setPage}
        />
      ) : null}
    </div>
  )
}
