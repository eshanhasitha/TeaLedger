import { ArrowLeft, Pencil, Power, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { TallyMarks } from '../../components/charts/TallyMarks'
import { FarmerForm } from '../../components/forms/FarmerForm'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable } from '../../components/tables/DataTable'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatDate, formatDateShort, formatPeriod, periodOf, toISODate } from '../../utils/formatDate'
import { formatKg, formatNumber } from '../../utils/formatNumber'

export default function FarmerDetailsPage() {
  const { id } = useParams()
  const L = useLedger()
  const { notify } = useNotifications()
  const nav = useNavigate()
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState(false)
  const f = id ? L.farmerById.get(id) : undefined

  const data = useMemo(() => {
    const mine = L.collections.filter((c) => c.farmerId === id).sort((a, b) => b.collectedAt.localeCompare(a.collectedAt))
    const period = periodOf(toISODate(new Date()))
    const month = mine.filter((c) => periodOf(toISODate(new Date(c.collectedAt))) === period)
    const total = mine.reduce((a, c) => a + c.final, 0)
    const water = mine.reduce((a, c) => a + c.water, 0)
    const gross = mine.reduce((a, c) => a + c.gross, 0)
    return {
      mine,
      month,
      monthKg: month.reduce((a, c) => a + c.final, 0),
      monthAmt: month.reduce((a, c) => a + c.amount, 0),
      avg: mine.length ? total / mine.length : 0,
      waterPct: gross ? (water / gross) * 100 : 0,
      settlements: L.settlements.filter((s) => s.farmerId === id).sort((a, b) => b.period.localeCompare(a.period)),
    }
  }, [L.collections, L.settlements, id])

  if (!f) {
    return <EmptyState title="Farmer not found" hint="They may have been removed from the ledger." action={<Link to="/farmers"><Button variant="line">Back to farmers</Button></Link>} />
  }
  const col = L.collectorById.get(f.collectorId)

  return (
    <>
      <PageHeader
        crumb={
          <Link to="/farmers" className="inline-flex items-center gap-1 hover:text-[var(--ink)]">
            <ArrowLeft size={11} /> Farmers
          </Link>
        }
        title={
          <>
            {f.name} <span className="figure align-middle text-[14px] text-[var(--ink-3)]">{f.code}</span>
          </>
        }
        lede={`${f.address} · ${f.phone} · on the ${col?.area ?? '—'} route with ${col?.name ?? '—'} since ${formatDate(f.joinedAt)}.`}
        actions={
          <>
            <Badge status={f.active ? 'Active' : 'Inactive'} />
            <Button variant="line" icon={<Pencil size={13} />} onClick={() => setEditing(true)}>
              Edit
            </Button>
            <Button
              variant="line"
              icon={<Power size={13} />}
              onClick={() => {
                L.updateFarmer(f.id, { active: !f.active })
                notify(`${f.name} ${f.active ? 'deactivated' : 'reactivated'}`, f.active ? 'info' : 'success')
              }}
            >
              {f.active ? 'Deactivate' : 'Reactivate'}
            </Button>
            <Button variant="ghost" className="!text-[var(--danger)]" icon={<Trash2 size={14} />} onClick={() => setRemoving(true)} aria-label="Remove farmer" />
          </>
        }
      />

      <section className="rise grid grid-cols-2 border-y border-[var(--ink)] lg:grid-cols-4" style={{ animationDelay: '60ms' }}>
        {[
          ['This month', formatKg(data.monthKg)],
          ['Earned this month', formatCurrency(data.monthAmt)],
          ['Avg. per weigh-in', formatKg(data.avg)],
          ['Water deducted', `${data.waterPct.toFixed(1)}%`],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-5 sm:px-6 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'max-lg:border-t' : ''} ${i === 2 ? 'lg:border-l' : ''} border-[var(--hair)]`}>
            <p className="eyebrow">{k}</p>
            <p className="figure mt-2 whitespace-nowrap text-[17px] xl:text-[22px]">{v}</p>
          </div>
        ))}
      </section>

      <section className="rise mt-10 flex flex-wrap items-center gap-4" style={{ animationDelay: '100ms' }}>
        <p className="font-display text-[24px]">Weigh-ins this month</p>
        <TallyMarks count={data.month.length} seed={f.code.length + data.month.length} color="var(--leaf)" />
        <span className="figure text-[12px] text-[var(--ink-3)]">{data.month.length}</span>
      </section>

      <section className="mt-12 grid gap-14 xl:grid-cols-[1.6fr_1fr]">
        <div className="rise min-w-0" style={{ animationDelay: '140ms' }}>
          <h2 className="font-display mb-4 text-[30px] leading-none">Passbook</h2>
          <DataTable
            rows={data.mine}
            rowKey={(c) => c.id}
            pageSize={10}
            onRowClick={(c) => nav(`/collections?q=${c.ref}`)}
            columns={[
              { key: 'd', header: 'Date', render: (c) => <span className="figure text-[12.5px]">{formatDateShort(c.collectedAt)}</span> },
              { key: 'r', header: 'Ref', render: (c) => <span className="figure text-[12.5px] text-[var(--ink-3)]">{c.ref}</span> },
              { key: 'k', header: 'kg', align: 'right', render: (c) => <span className="figure">{formatNumber(c.final, 1)}</span> },
              { key: 'a', header: 'Amount', align: 'right', render: (c) => <span className="figure">{formatCurrency(c.amount)}</span> },
              { key: 's', header: '', render: (c) => <Badge status={c.status} /> },
            ]}
            empty={<EmptyState title="No weigh-ins yet" />}
          />
        </div>
        <div className="rise" style={{ animationDelay: '200ms' }}>
          <h2 className="font-display mb-4 text-[30px] leading-none">Settlements</h2>
          {data.settlements.length === 0 ? (
            <p className="text-[13px] text-[var(--ink-3)]">No settlements drafted yet.</p>
          ) : (
            <ul className="border-t border-[var(--ink)]">
              {data.settlements.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 border-b border-[var(--hair)] py-3">
                  <span>
                    <span className="block text-[13.5px]">{formatPeriod(s.period)}</span>
                    <span className="figure block text-[11.5px] text-[var(--ink-3)]">{formatKg(s.kg)}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="figure text-[13px]">{formatCurrency(s.net)}</span>
                    <Badge status={s.status} />
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit farmer" eyebrow={f.code} width={580}>
        <FarmerForm
          initial={f}
          onCancel={() => setEditing(false)}
          onSubmit={(v) => {
            L.updateFarmer(f.id, v)
            setEditing(false)
            notify('Farmer details saved')
          }}
        />
      </Modal>

      <ConfirmDialog
        open={removing}
        title="Remove farmer?"
        message={`${f.name} will be removed from the farmer list. Their past weigh-ins stay in the ledger. Consider deactivating instead.`}
        confirmLabel="Remove"
        danger
        onClose={() => setRemoving(false)}
        onConfirm={() => {
          L.deleteFarmer(f.id)
          notify(`${f.name} removed`, 'danger')
          nav('/farmers')
        }}
      />
    </>
  )
}
