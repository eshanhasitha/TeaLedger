import { useMemo, useState } from 'react'

export function usePagination<T>(rows: T[], pageSize = 12) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize))
  const current = Math.min(page, pageCount)
  const pageRows = useMemo(
    () => rows.slice((current - 1) * pageSize, current * pageSize),
    [rows, current, pageSize],
  )
  return { page: current, setPage, pageCount, pageRows, total: rows.length, pageSize }
}
