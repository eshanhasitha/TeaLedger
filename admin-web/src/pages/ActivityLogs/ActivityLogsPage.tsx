import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader'
import { TableFilters } from '../../components/tables/TableFilters'
import { TableSearch } from '../../components/tables/TableSearch'
import { EmptyState } from '../../components/ui/EmptyState'
import { useLedger } from '../../hooks/useLedger'
import { formatDate, formatTime, timeAgo, toISODate } from '../../utils/formatDate'

export default function ActivityLogsPage() {
  const { activity } = useLedger()
  const [kind, setKind] = useState('all')
  const [q, setQ] = useState('')
  const kinds = useMemo(() => [...new Set(activity.map((a) => a.action))], [activity])

  const rows = activity.filter((a) => (kind === 'all' || a.action === kind) && (!q || a.detail.toLowerCase().includes(q.toLowerCase())))
  const groups = rows.reduce<Record<string, typeof rows>>((g, a) => {
    const d = toISODate(new Date(a.at))
    ;(g[d] ??= []).push(a)
    return g
  }, {})

  return (
    <>
      <PageHeader title="Activity" lede="A margin note for everything that changes the ledger — who, what, and when." />
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <TableFilters value={kind} onChange={setKind} options={[{ value: 'all', label: 'Everything', count: activity.length }, ...kinds.map((k) => ({ value: k, label: k, count: activity.filter((a) => a.action === k).length }))]} />
        <TableSearch value={q} onChange={setQ} placeholder="Search notes" />
      </div>

      {rows.length === 0 && <EmptyState title="No notes" hint="Changes you make will be written here." />}

      {Object.entries(groups).map(([day, items]) => (
        <section key={day} className="rise mb-10">
          <h2 className="font-display mb-2 text-[26px]">{formatDate(day)}</h2>
          <ol className="relative border-l border-[var(--margin)]/50 pl-6">
            {items.map((a) => (
              <li key={a.id} className="relative py-3">
                <span className="absolute -left-[29px] top-[18px] size-[9px] rounded-full border border-[var(--margin)] bg-[var(--paper)]" />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="figure text-[12px] text-[var(--ink-3)]">{formatTime(a.at)}</span>
                  <span className="eyebrow !text-[var(--leaf)]">{a.action}</span>
                  <span className="text-[14px]">{a.detail}</span>
                </div>
                <p className="mt-0.5 text-[12px] text-[var(--ink-3)]">
                  {a.actor} · {timeAgo(a.at)}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}
