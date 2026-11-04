import { ArrowDown, ArrowUp } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'
import { usePagination } from '../../hooks/usePagination'
import { EmptyState } from '../ui/EmptyState'
import { TablePagination } from './TablePagination'

export interface Column<T> {
  key: string
  header: string
  render: (row: T) => ReactNode
  sort?: (row: T) => string | number
  align?: 'left' | 'right'
  className?: string
}

interface Props<T> {
  rows: T[]
  columns: Column<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
  initialSort?: { key: string; dir: 'asc' | 'desc' }
  pageSize?: number
  selectable?: boolean
  selected?: Set<string>
  onSelectedChange?: (s: Set<string>) => void
  empty?: ReactNode
  footer?: ReactNode
}

export function DataTable<T>({
  rows, columns, rowKey, onRowClick, initialSort, pageSize = 12, selectable, selected, onSelectedChange, empty, footer,
}: Props<T>) {
  const [sort, setSort] = useState(initialSort)

  const sorted = useMemo(() => {
    const col = columns.find((c) => c.key === sort?.key)
    if (!col?.sort || !sort) return rows
    const f = col.sort
    const m = sort.dir === 'asc' ? 1 : -1
    return [...rows].sort((a, b) => {
      const x = f(a)
      const y = f(b)
      return (x < y ? -1 : x > y ? 1 : 0) * m
    })
  }, [rows, columns, sort])

  const { page, setPage, pageCount, pageRows, total } = usePagination(sorted, pageSize)

  const toggleSort = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'desc' }))

  const pageIds = pageRows.map(rowKey)
  const allOnPage = selectable && pageIds.length > 0 && pageIds.every((id) => selected?.has(id))
  const toggle = (id: string) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onSelectedChange?.(next)
  }
  const togglePage = () => {
    const next = new Set(selected)
    pageIds.forEach((id) => (allOnPage ? next.delete(id) : next.add(id)))
    onSelectedChange?.(next)
  }

  if (rows.length === 0) return <>{empty ?? <EmptyState title="Nothing entered yet" />}</>

  return (
    <div>
      <div className="-mx-1 overflow-x-auto px-1">
        <table className="ledger-table min-w-[640px]">
          <thead>
            <tr>
              {selectable && (
                <th className="w-8 !pr-0">
                  <input type="checkbox" aria-label="Select page" checked={!!allOnPage} onChange={togglePage} className="accent-[var(--leaf)]" />
                </th>
              )}
              {columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? '!text-right' : ''}>
                  {c.sort ? (
                    <button
                      onClick={() => toggleSort(c.key)}
                      className={`inline-flex items-center gap-1 uppercase hover:text-[var(--ink)] ${sort?.key === c.key ? 'text-[var(--ink)]' : ''}`}
                    >
                      {c.header}
                      {sort?.key === c.key && (sort.dir === 'asc' ? <ArrowUp size={11} /> : <ArrowDown size={11} />)}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => {
              const id = rowKey(r)
              return (
                <tr
                  key={id}
                  data-clickable={!!onRowClick}
                  onClick={() => onRowClick?.(r)}
                  className={selected?.has(id) ? 'bg-[var(--leaf-soft)]' : ''}
                >
                  {selectable && (
                    <td className="!pr-0" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        aria-label="Select row"
                        checked={!!selected?.has(id)}
                        onChange={() => toggle(id)}
                        className="accent-[var(--leaf)]"
                      />
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className={`${c.align === 'right' ? 'text-right' : ''} ${c.className ?? ''}`}>
                      {c.render(r)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
          {footer}
        </table>
      </div>
      <TablePagination page={page} pageCount={pageCount} total={total} pageSize={pageSize} onPage={setPage} />
    </div>
  )
}
