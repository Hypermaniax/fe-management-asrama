import { useState, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { EmptyState } from '@/components/shared/empty-state'
import { ErrorState } from '@/components/shared/error-state'
import { SkeletonTable } from '@/components/shared/skeletons'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-sm text-foreground/70">
        Menampilkan {start + 1}–{end} dari {total}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="neutral"
          size="icon-sm"
          aria-label="Halaman sebelumnya"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft />
        </Button>
        <span className="font-heading text-sm">
          {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="neutral"
          size="icon-sm"
          aria-label="Halaman berikutnya"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <ChevronRight />
        </Button>
      </div>
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
