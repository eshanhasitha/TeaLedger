import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  page: number
  pageCount: number
  total: number
  pageSize: number
  onPage: (p: number) => void
}

export function TablePagination({ page, pageCount, total, pageSize, onPage }: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)
  return (
    <div className="flex items-center justify-between gap-4 pt-4">
      <p className="figure text-[12px] text-[var(--ink-3)]">
        lines {from}–{to} of {total}
      </p>
      {pageCount > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(page - 1)}
            disabled={page === 1}
            aria-label="Previous page"
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--leaf-soft)] disabled:opacity-30"
          >
            <ChevronLeft size={15} />
          </button>
          <span className="figure min-w-16 text-center text-[12px]">
            folio {page}/{pageCount}
          </span>
          <button
            onClick={() => onPage(page + 1)}
            disabled={page === pageCount}
            aria-label="Next page"
            className="grid size-8 place-items-center rounded-full hover:bg-[var(--leaf-soft)] disabled:opacity-30"
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}
    </div>
  )
}
