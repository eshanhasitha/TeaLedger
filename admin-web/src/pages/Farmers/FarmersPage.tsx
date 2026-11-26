import { Download, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FarmerForm } from '../../components/forms/FarmerForm'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { TableFilters } from '../../components/tables/TableFilters'
import { TableSearch } from '../../components/tables/TableSearch'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useDebounce } from '../../hooks/useDebounce'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import type { Farmer } from '../../types/ledger.types'
import { exportToCsv } from '../../utils/exportToCsv'
import { formatDate, periodOf, toISODate } from '../../utils/formatDate'
import { formatNumber } from '../../utils/formatNumber'

type Show = 'all' | 'active' | 'inactive'

/** A 6-month sparkline drawn as tiny ink ticks, one per month. */
function Ticks({ values }: { values: number[] }) {
  const max = Math.max(1, ...values)
  return (
    <svg width={values.length * 7} height="18" aria-hidden>
      {values.map((v, i) => (
        <line key={i} x1={i * 7 + 3} x2={i * 7 + 3} y1={18} y2={18 - Math.max(1.5, (v / max) * 16)} stroke={i === values.length - 1 ? 'var(--leaf)' : 'var(--ink-3)'} strokeWidth="3" strokeLinecap="round" />
      ))}
    </svg>
  )
}

export default function FarmersPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [show, setShow] = useState<Show>('active')
  const [route, setRoute] = useState('')
  const [adding, setAdding] = useState(false)
  const dq = useDebounce(q.trim().toLowerCase())

  const stats = useMemo(() => {
    const now = new Date()
    const months = Array.from({ length: 6 }, (_, i) => periodOf(toISODate(new Date(now.getFullYear(), now.getMonth() - 5 + i, 1))))
    const m = new Map<string, { kg: number; months: number[]; last: string }>()
    for (const c of L.collections) {
      const e = m.get(c.farmerId) ?? { kg: 0, months: months.map(() => 0), last: '' }
      const idx = months.indexOf(periodOf(toISODate(new Date(c.collectedAt))))
      if (idx >= 0) e.months[idx] += c.final
      if (idx === 5) e.kg += c.final
      if (c.collectedAt > e.last) e.last = c.collectedAt
      m.set(c.farmerId, e)
    }
    return m
  }, [L.collections])

  const base = useMemo(
    () =>
      L.farmers.filter(
        (f) =>
          (!route || f.collectorId === route) &&
          (!dq || f.name.toLowerCase().includes(dq) || f.code.toLowerCase().includes(dq) || f.address.toLowerCase().includes(dq) || f.phone.replace(/\s/g, '').includes(dq.replace(/\s/g, ''))),
      ),
    [L.farmers, route, dq],
  )
  const rows = show === 'all' ? base : base.filter((f) => f.active === (show === 'active'))

  const columns: Column<Farmer>[] = [
    { key: 'code', header: 'Code', sort: (f) => f.code, render: (f) => <span className="figure text-[12.5px] text-[var(--ink-2)]">{f.code}</span> },
    {
      key: 'name',
      header: 'Farmer',
      sort: (f) => f.name,
      render: (f) => (
        <span>
          <span className="block text-[13.5px]">{f.name}</span>
          <span className="block text-[11.5px] text-[var(--ink-3)]">{f.phone}</span>
        </span>
      ),
    },
    { key: 'route', header: 'Route', sort: (f) => L.collectorById.get(f.collectorId)?.area ?? '', render: (f) => L.collectorById.get(f.collectorId)?.area ?? '—' },
    { key: 'land', header: 'Land', align: 'right', sort: (f) => f.landSize, render: (f) => <span className="figure">{f.landSize.toFixed(2)} ac</span> },
    { key: 'trend', header: '6 months', render: (f) => <Ticks values={stats.get(f.id)?.months ?? [0, 0, 0, 0, 0, 0]} /> },
    { key: 'kg', header: 'This month', align: 'right', sort: (f) => stats.get(f.id)?.kg ?? 0, render: (f) => <span className="figure">{formatNumber(stats.get(f.id)?.kg ?? 0, 1)} kg</span> },
    { key: 'status', header: 'Status', sort: (f) => (f.active ? 1 : 0), render: (f) => <Badge status={f.active ? 'Active' : 'Inactive'} /> },
  ]

  return (
    <>
      <PageHeader
        title="Farmers"
        lede="The growers on your routes, their land, and what they’ve brought in lately."
        actions={
          <>
            <Button
              variant="line"
              icon={<Download size={14} />}
              onClick={() => {
                exportToCsv(
                  'farmers',
                  rows.map((f) => ({ code: f.code, name: f.name, phone: f.phone, address: f.address, land_acres: f.landSize, route: L.collectorById.get(f.collectorId)?.area ?? '', active: f.active, joined: formatDate(f.joinedAt) })),
                )
                notify(`Exported ${rows.length} farmers`, 'info')
              }}
            >
              Export
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setAdding(true)}>
              Register farmer
            </Button>
          </>
        }
      />

      <div className="rise mb-6 flex flex-wrap items-end justify-between gap-5" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-wrap items-end gap-6">
          <TableSearch value={q} onChange={setQ} placeholder="Name, code, phone, village" />
          <label className="w-44">
            <span className="eyebrow">Route</span>
            <select value={route} onChange={(e) => setRoute(e.target.value)} className="field mt-1">
              <option value="">All routes</option>
              {L.collectors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.area}
                </option>
              ))}
            </select>
          </label>
        </div>
        <TableFilters<Show>
          value={show}
          onChange={setShow}
          options={[
            { value: 'active', label: 'Active', count: base.filter((f) => f.active).length },
            { value: 'inactive', label: 'Inactive', count: base.filter((f) => !f.active).length },
            { value: 'all', label: 'All', count: base.length },
          ]}
        />
      </div>

      <div className="rise" style={{ animationDelay: '120ms' }}>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(f) => f.id}
          onRowClick={(f) => nav(`/farmers/${f.id}`)}
          initialSort={{ key: 'kg', dir: 'desc' }}
          empty={<EmptyState title="No farmers here" hint="Nobody matches that search." action={<Button variant="line" onClick={() => setAdding(true)}>Register one</Button>} />}
        />
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Register farmer" eyebrow="New account" width={580}>
        <FarmerForm
          onCancel={() => setAdding(false)}
          onSubmit={(v) => {
            const f = L.addFarmer(v)
            setAdding(false)
            notify(`${f.name} registered as ${f.code}`)
          }}
        />
      </Modal>
    </>
  )
}
