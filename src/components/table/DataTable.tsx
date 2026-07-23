import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type SortingState,
} from '@tanstack/react-table'
import { Button } from '@/components/shared/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Loader } from '@/components/shared/Loader'
import { TableWrapper } from '@/components/shared/TableWrapper'
import styles from './DataTable.module.css'

type DataTableProps<TData> = {
  columns: ColumnDef<TData>[]
  data: TData[]
  getRowId: (row: TData) => string
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
  isLoading?: boolean
  isError?: boolean
  errorMessage?: string
  onRetry?: () => void
  emptyTitle?: string
  emptyDescription?: string
  onRowClick?: (row: TData) => void
}

export function DataTable<TData>({
  columns,
  data,
  getRowId,
  sorting,
  onSortingChange,
  isLoading = false,
  isError = false,
  errorMessage = 'Unable to load data.',
  onRetry,
  emptyTitle = 'No results',
  emptyDescription,
  onRowClick,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => getRowId(row),
    state: sorting ? { sorting } : undefined,
    onSortingChange,
    manualSorting: Boolean(onSortingChange),
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  if (isError) {
    return (
      <ErrorState title="Something went wrong" description={errorMessage}>
        {onRetry ? <Button onClick={onRetry}>Retry</Button> : null}
      </ErrorState>
    )
  }

  if (isLoading) {
    return <Loader label="Loading data..." fullHeight />
  }

  if (data.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <TableWrapper>
      <table>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const canSort = header.column.getCanSort()
                const sortDirection = header.column.getIsSorted()

                return (
                  <th
                    key={header.id}
                    className={styles.headerCell}
                    aria-sort={sortDirection === 'asc' ? 'ascending' : sortDirection === 'desc' ? 'descending' : undefined}
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button type="button" className={styles.sortButton} onClick={header.column.getToggleSortingHandler()}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <span className={styles.sortIndicator}>
                          {sortDirection === 'asc' ? '▲' : sortDirection === 'desc' ? '▼' : ''}
                        </span>
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </th>
                )
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? styles.clickableRow : undefined}
              onClick={onRowClick ? () => onRowClick(row.original) : undefined}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className={styles.cell}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </TableWrapper>
  )
}
