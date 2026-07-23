import { Select } from '@/components/shared/Select'
import styles from './Pagination.module.css'

type PaginationProps = {
  page: number
  pageSize: number
  totalItems: number
  onPageChange: (page: number) => void
  onPageSizeChange?: (pageSize: number) => void
  pageSizeOptions?: number[]
}

const ELLIPSIS = 'ellipsis' as const

function getPageNumbers(current: number, total: number): Array<number | typeof ELLIPSIS> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = new Set<number>([1, total, current, current - 1, current + 1])
  const sorted = Array.from(pages)
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b)

  const result: Array<number | typeof ELLIPSIS> = []
  sorted.forEach((page, index) => {
    if (index > 0 && page - sorted[index - 1] > 1) {
      result.push(ELLIPSIS)
    }
    result.push(page)
  })

  return result
}

export function Pagination({ page, pageSize, totalItems, onPageChange, onPageSizeChange, pageSizeOptions = [10, 25, 50, 100] }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(totalItems, page * pageSize)

  return (
    <nav aria-label="Pagination" className={styles.pagination}>
      <p className={styles.summary}>
        {totalItems === 0 ? 'No results' : `Showing ${rangeStart}-${rangeEnd} of ${totalItems}`}
      </p>

      <div className={styles.controls}>
        {onPageSizeChange ? (
          <Select
            aria-label="Rows per page"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            className={styles.pageSizeSelect}
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </Select>
        ) : null}

        <button type="button" className={styles.navButton} disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </button>

        <ul className={styles.pageList}>
          {getPageNumbers(page, totalPages).map((entry, index) =>
            entry === ELLIPSIS ? (
              <li key={`ellipsis-${index}`} className={styles.ellipsis}>
                …
              </li>
            ) : (
              <li key={entry}>
                <button
                  type="button"
                  className={[styles.pageButton, entry === page ? styles.active : ''].filter(Boolean).join(' ')}
                  aria-current={entry === page ? 'page' : undefined}
                  onClick={() => onPageChange(entry)}
                >
                  {entry}
                </button>
              </li>
            ),
          )}
        </ul>

        <button type="button" className={styles.navButton} disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          Next
        </button>
      </div>
    </nav>
  )
}
