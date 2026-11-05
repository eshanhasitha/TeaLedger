import { Check, Download, Flag, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { PourBreakdown } from '../../components/charts/PourBreakdown'
import { CollectionForm } from '../../components/forms/CollectionForm'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { TableFilters } from '../../components/tables/TableFilters'
import { TableSearch } from '../../components/tables/TableSearch'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useDebounce } from '../../hooks/useDebounce'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import type { Collection, CollectionStatus } from '../../types/ledger.types'
import { exportToCsv } from '../../utils/exportToCsv'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, formatDateShort, formatTime, toISODate } from '../../utils/formatDate'
import { formatKg, formatNumber } from '../../utils/formatNumber'

type StatusFilter = 'all' | CollectionStatus

export default function CollectionsPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const [params, setParams] = useSearchParams()
  const [q, setQ] = useState(params.get('q') ?? '')
  const status = (params.get('status') as StatusFilter) || 'all'
  const [route, setRoute] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [open, setOpen] = useState<Collection | null>(null)
  const [adding, setAdding] = useState(false)
  const [voiding, setVoiding] = useState<Collection | null>(null)
  const dq = useDebounce(q.trim().toLowerCase())

  // keep the search box in step when quick-find navigates here with a new ?q=
  const urlQ = params.get('q') ?? ''
  const [lastUrlQ, setLastUrlQ] = useState(urlQ)
  if (urlQ !== lastUrlQ) {
    setLastUrlQ(urlQ)
    setQ(urlQ)
  }

  const setStatus = (s: StatusFilter) => {
    const p = new URLSearchParams(params)
    if (s === 'all') p.delete('status')
    else p.set('status', s)
    setParams(p, { replace: true })
    setSelected(new Set())
  }

  const base = useMemo(
    () =>
      L.collections.filter((c) => {
        const day = toISODate(new Date(c.collectedAt))
        if (route && c.collectorId !== route) return false
        if (from && day < from) return false
        if (to && day > to) return false
        if (dq) {
          const f = L.farmerById.get(c.farmerId)
          if (!c.ref.toLowerCase().includes(dq) && !f?.name.toLowerCase().includes(dq) && !f?.code.toLowerCase().includes(dq)) return false
        }
        return true
      }),
    [L.collections, L.farmerById, route, from, to, dq],
  )
  const rows = useMemo(() => (status === 'all' ? base : base.filter((c) => c.status === status)), [base, status])
  const count = (s: CollectionStatus) => base.filter((c) => c.status === s).length
  const totals = rows.reduce((a, c) => ({ kg: a.kg + c.final, amt: a.amt + c.amount }), { kg: 0, amt: 0 })

  const columns: Column<Collection>[] = [
    {
      key: 'date',
      header: 'Date',
      sort: (c) => c.collectedAt,
      render: (c) => (
        <span className="figure whitespace-nowrap text-[12.5px]">
          {formatDateShort(c.collectedAt)} <span className="text-[var(--ink-3)]">{formatTime(c.collectedAt)}</span>
        </span>
      ),
    },
    { key: 'ref', header: 'Ref', sort: (c) => c.ref, render: (c) => <span className="figure whitespace-nowrap text-[12.5px] text-[var(--ink-2)]">{c.ref}</span> },
    {
      key: 'farmer',
      header: 'Farmer',
      sort: (c) => L.farmerById.get(c.farmerId)?.name ?? '',
      render: (c) => {
        const f = L.farmerById.get(c.farmerId)
        return (
          <span>
            <span className="block text-[13.5px]">{f?.name ?? 'Removed farmer'}</span>
            <span className="block text-[11.5px] text-[var(--ink-3)]">{L.collectorById.get(c.collectorId)?.area}</span>
          </span>
        )
      },
    },
    { key: 'gross', header: 'Gross', align: 'right', sort: (c) => c.gross, render: (c) => <span className="figure text-[var(--ink-3)]">{formatNumber(c.gross, 1)}</span> },
    { key: 'final', header: 'Payable kg', align: 'right', sort: (c) => c.final, render: (c) => <span className="figure">{formatNumber(c.final, 1)}</span> },
    { key: 'amount', header: 'Amount', align: 'right', sort: (c) => c.amount, render: (c) => <span className="figure">{formatCurrency(c.amount)}</span> },
    { key: 'status', header: 'Status', sort: (c) => c.status, render: (c) => <Badge status={c.status} /> },
  ]

  const bulk = (s: CollectionStatus) => {
    const ids = [...selected].filter((id) => L.collections.find((c) => c.id === id)?.status !== 'Settled')
    if (!ids.length) return notify('Settled lines are locked and were skipped', 'info')
    L.setCollectionStatus(ids, s)
    setSelected(new Set())
    notify(`${ids.length} ${ids.length === 1 ? 'line' : 'lines'} marked ${s.toLowerCase()}`)
  }

  const setOne = (c: Collection, s: CollectionStatus) => {
    L.setCollectionStatus([c.id], s)
    setOpen({ ...c, status: s })
    notify(`${c.ref} marked ${s.toLowerCase()}`)
  }

  return (
    <>
      <PageHeader
        title="Collections"
        lede="Every weigh-in from every route. Verify the pending ones before they roll into the month’s settlement."
        actions={
          <>
            <Button
              variant="line"
              icon={<Download size={14} />}
              onClick={() => {
                exportToCsv(
                  `collections-${toISODate(new Date())}`,
                  rows.map((c) => ({
                    ref: c.ref, date: formatDate(c.collectedAt), farmer: L.farmerById.get(c.farmerId)?.name ?? '', route: L.collectorById.get(c.collectorId)?.area ?? '',
                    gross_kg: c.gross, water_kg: c.water, bag_kg: c.bag, other_kg: c.other, final_kg: c.final, price_per_kg: c.pricePerKg, amount: c.amount, status: c.status,
                  })),
                )
                notify(`Exported ${rows.length} lines to CSV`, 'info')
              }}
            >
              Export
            </Button>
            <Button icon={<Plus size={15} />} onClick={() => setAdding(true)}>
              New weigh-in
            </Button>
          </>
        }
      />

      <div className="rise mb-6 flex flex-col gap-5" style={{ animationDelay: '60ms' }}>
        <TableFilters<StatusFilter>
          value={status}
          onChange={setStatus}
          options={[
            { value: 'all', label: 'All', count: base.length },
            { value: 'Pending', label: 'Pending', count: count('Pending') },
            { value: 'Verified', label: 'Verified', count: count('Verified') },
            { value: 'Disputed', label: 'Disputed', count: count('Disputed') },
            { value: 'Settled', label: 'Settled', count: count('Settled') },
          ]}
        />
        <div className="flex flex-wrap items-end gap-x-6 gap-y-4">
          <TableSearch value={q} onChange={setQ} placeholder="Ref, farmer or code" />
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
          <label className="w-36">
            <span className="eyebrow">From</span>
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field mt-1" />
          </label>
          <label className="w-36">
            <span className="eyebrow">To</span>
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field mt-1" />
          </label>
          {(q || route || from || to) && (
            <button
              onClick={() => {
                setQ('')
                setRoute('')
                setFrom('')
                setTo('')
              }}
              className="pb-2 text-[12.5px] text-[var(--margin)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="rise sticky top-16 z-10 mb-4 flex flex-wrap items-center gap-3 rounded-full bg-[var(--ink)] py-2 pl-5 pr-2 text-[var(--paper)] md:top-4">
          <span className="figure flex-1 text-[12.5px]">{selected.size} selected</span>
          <button onClick={() => bulk('Verified')} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] hover:bg-white/10">
            <Check size={14} /> Verify
          </button>
          <button onClick={() => bulk('Disputed')} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] hover:bg-white/10">
            <Flag size={13} /> Dispute
          </button>
          <button onClick={() => setSelected(new Set())} className="rounded-full px-3 py-1.5 text-[12.5px] opacity-70 hover:bg-white/10">
            Clear
          </button>
        </div>
      )}

      <div className="rise" style={{ animationDelay: '120ms' }}>
        <DataTable
          rows={rows}
          columns={columns}
          rowKey={(c) => c.id}
          onRowClick={setOpen}
          initialSort={{ key: 'date', dir: 'desc' }}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          pageSize={14}
          empty={<EmptyState title="No lines match" hint="Try widening the dates or clearing the search." />}
          footer={
            <tfoot>
              <tr>
                <td colSpan={5} className="!border-b-0 !border-t !border-t-[var(--ink)] text-right">
                  <span className="eyebrow">Carried forward</span>
                </td>
                <td className="figure !border-b-0 !border-t !border-t-[var(--ink)] text-right">{formatNumber(totals.kg, 1)}</td>
                <td className="figure !border-b-0 !border-t !border-t-[var(--ink)] text-right">{formatCurrency(totals.amt)}</td>
                <td className="!border-b-0 !border-t !border-t-[var(--ink)]" />
              </tr>
            </tfoot>
          }
        />
      </div>

      {/* detail sheet */}
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.ref ?? ''} eyebrow={open ? formatDate(open.collectedAt) + ' · ' + formatTime(open.collectedAt) : ''} width={600}>
        {open && (
          <div className="grid gap-7">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Farmer</p>
                <Link to={`/farmers/${open.farmerId}`} className="mt-1 block text-[16px] underline decoration-[var(--hair)] underline-offset-4 hover:decoration-[var(--ink)]">
                  {L.farmerById.get(open.farmerId)?.name ?? 'Removed farmer'}
                </Link>
                <p className="text-[12.5px] text-[var(--ink-3)]">
                  via {L.collectorById.get(open.collectorId)?.name} · {L.collectorById.get(open.collectorId)?.area}
                </p>
              </div>
              <Badge status={open.status} />
            </div>
            <PourBreakdown gross={open.gross} water={open.water} bag={open.bag} other={open.other} />
            <div className="flex items-end justify-between border-y border-dashed border-[var(--hair)] py-4">
              <div>
                <p className="eyebrow">Payable</p>
                <p className="font-display text-[40px] leading-none">{formatKg(open.final)}</p>
              </div>
              <div className="text-right">
                <p className="eyebrow">@ Rs {open.pricePerKg}/kg</p>
                <p className="figure text-[20px]">{formatCurrency(open.amount)}</p>
              </div>
            </div>
            {open.status === 'Settled' ? (
              <p className="text-[13px] text-[var(--ink-3)]">This line was paid out in a settlement and is locked.</p>
            ) : (
              <div className="flex flex-wrap justify-between gap-2">
                <Button variant="ghost" className="!text-[var(--danger)]" icon={<Trash2 size={14} />} onClick={() => setVoiding(open)}>
                  Void line
                </Button>
                <div className="flex gap-2">
                  {open.status !== 'Disputed' && (
                    <Button variant="line" icon={<Flag size={13} />} onClick={() => setOne(open, 'Disputed')}>
                      Dispute
                    </Button>
                  )}
                  {open.status !== 'Verified' && (
                    <Button icon={<Check size={14} />} onClick={() => setOne(open, 'Verified')}>
                      Verify
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={!!voiding}
        title="Void this line?"
        message={`${voiding?.ref} (${voiding ? formatKg(voiding.final) : ''}) will be removed from the ledger. This can't be undone.`}
        confirmLabel="Void line"
        danger
        onClose={() => setVoiding(null)}
        onConfirm={() => {
          if (!voiding) return
          L.deleteCollection(voiding.id)
          setOpen(null)
          notify(`${voiding.ref} voided`, 'danger')
        }}
      />

      <Modal open={adding} onClose={() => setAdding(false)} title="New weigh-in" eyebrow="Enter a line" width={620}>
        <CollectionForm
          onCancel={() => setAdding(false)}
          onSubmit={(v) => {
            const e = L.addCollection({ ...v, collectedAt: new Date(`${v.date}T${new Date().toTimeString().slice(0, 8)}`).toISOString() })
            setAdding(false)
            notify(`${e.ref} entered — ${formatKg(e.final)} for ${L.farmerById.get(e.farmerId)?.name}`)
          }}
        />
      </Modal>
    </>
  )
}
