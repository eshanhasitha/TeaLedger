import { Banknote, Check, FilePlus2, Printer } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/layout/PageHeader'
import { DataTable, type Column } from '../../components/tables/DataTable'
import { TableFilters } from '../../components/tables/TableFilters'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { EmptyState } from '../../components/ui/EmptyState'
import { Modal } from '../../components/ui/Modal'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import type { Settlement, SettlementStatus } from '../../types/ledger.types'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPeriod, periodOf, toISODate } from '../../utils/formatDate'
import { formatKg, formatNumber } from '../../utils/formatNumber'

type Show = 'all' | SettlementStatus

export default function SettlementsPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const periods = useMemo(() => {
    const now = new Date()
    return Array.from({ length: 3 }, (_, i) => periodOf(toISODate(new Date(now.getFullYear(), now.getMonth() - i, 1))))
  }, [])
  const [period, setPeriod] = useState(periods[1])
  const [show, setShow] = useState<Show>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [slip, setSlip] = useState<Settlement | null>(null)
  const [paying, setPaying] = useState(false)

  const inPeriod = L.settlements.filter((s) => s.period === period)
  const rows = show === 'all' ? inPeriod : inPeriod.filter((s) => s.status === show)
  const sum = (xs: Settlement[], k: 'net' | 'kg' | 'deductions' | 'grossAmount' | 'loanRepayments') => xs.reduce((a, s) => a + s[k], 0)
  const pendingLines = L.collections.filter((c) => c.status === 'Pending' && periodOf(toISODate(new Date(c.collectedAt))) === period).length

  const columns: Column<Settlement>[] = [
    { key: 'ref', header: 'Ref', sort: (s) => s.ref, render: (s) => <span className="figure text-[12px] text-[var(--ink-2)]">{s.ref}</span> },
    { key: 'farmer', header: 'Farmer', sort: (s) => L.farmerById.get(s.farmerId)?.name ?? '', render: (s) => L.farmerById.get(s.farmerId)?.name ?? 'Removed farmer' },
    { key: 'kg', header: 'Leaf', align: 'right', sort: (s) => s.kg, render: (s) => <span className="figure">{formatNumber(s.kg, 1)} kg</span> },
    { key: 'gross', header: 'Earned', align: 'right', sort: (s) => s.grossAmount, render: (s) => <span className="figure text-[var(--ink-2)]">{formatCurrency(s.grossAmount)}</span> },
    { key: 'ded', header: 'Less', align: 'right', sort: (s) => s.deductions, render: (s) => <span className="figure text-[var(--margin)]">âˆ’{formatNumber(s.deductions, 2)}</span> },
    { key: 'net', header: 'Net pay', align: 'right', sort: (s) => s.net, render: (s) => <span className="figure font-medium">{formatCurrency(s.net)}</span> },
    { key: 'st', header: 'Status', sort: (s) => s.status, render: (s) => <Badge status={s.status} /> },
  ]

  const act = (status: SettlementStatus) => {
    const ids = [...selected].filter((id) => {
      const s = L.settlements.find((x) => x.id === id)
      return s && (status === 'Approved' ? s.status === 'Draft' : s.status === 'Approved')
    })
    if (!ids.length) {
      notify(status === 'Approved' ? 'Only drafts can be approved' : 'Only approved settlements can be paid', 'info')
      return
    }
    L.setSettlementStatus(ids, status)
    setSelected(new Set())
    notify(`${ids.length} settlement${ids.length > 1 ? 's' : ''} ${status.toLowerCase()}`)
  }

  const selRows = inPeriod.filter((s) => selected.has(s.id))

  return (
    <>
      <PageHeader
        title="Settlements"
        lede="Close a month: draft settlements from verified leaf, approve them, then mark them paid. Paying a settlement locks its weigh-ins."
        actions={
          <Button
            icon={<FilePlus2 size={15} />}
            onClick={() => {
              const n = L.generateSettlements(period)
              notify(n ? `Drafted ${n} settlements for ${formatPeriod(period)}` : 'Every farmer with verified leaf is already settled for this month', n ? 'success' : 'info')
            }}
          >
            Draft for {formatPeriod(period).split(' ')[0]}
          </Button>
        }
      />

      <div className="rise mb-8 flex flex-wrap items-center gap-2" style={{ animationDelay: '60ms' }}>
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => {
              setPeriod(p)
              setSelected(new Set())
            }}
            className={`font-display rounded-full px-4 py-1 text-[22px] transition-colors ${p === period ? 'bg-[var(--ink)] text-[var(--paper)]' : 'text-[var(--ink-3)] hover:text-[var(--ink)]'}`}
          >
            {formatPeriod(p)}
          </button>
        ))}
      </div>

      <section className="rise mb-10 grid grid-cols-2 border-y border-[var(--ink)] lg:grid-cols-5" style={{ animationDelay: '100ms' }}>
        {[
          ['Leaf settled', formatKg(sum(inPeriod, 'kg'))],
          ['Earned', formatCurrency(sum(inPeriod, 'grossAmount'))],
          ['Deductions', formatCurrency(sum(inPeriod, 'deductions'))],
          ['Loan repayments', formatCurrency(sum(inPeriod, 'loanRepayments'))],
          ['Net payable', formatCurrency(sum(inPeriod, 'net'))],
        ].map(([k, v], i) => (
          <div key={k} className={`px-4 py-5 sm:px-6 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'max-lg:border-t' : ''} ${i === 2 ? 'lg:border-l' : ''} border-[var(--hair)]`}>
            <p className="eyebrow">{k}</p>
            <p className={`figure mt-2 whitespace-nowrap text-[16px] xl:text-[20px] ${i === 3 ? 'text-[var(--leaf)]' : ''}`}>{v}</p>
          </div>
        ))}
      </section>

      {pendingLines > 0 && (
        <p className="rise mb-6 border-l-2 border-[var(--amber)] pl-3 text-[13px] text-[var(--ink-2)]">
          {pendingLines} weigh-ins in {formatPeriod(period)} are still pending and wonâ€™t be included.{' '}
          <Link to="/collections?status=Pending" className="underline underline-offset-4">
            Verify them first
          </Link>
          .
        </p>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <TableFilters<Show>
          value={show}
          onChange={setShow}
          options={[
            { value: 'all', label: 'All', count: inPeriod.length },
            { value: 'Draft', label: 'Draft', count: inPeriod.filter((s) => s.status === 'Draft').length },
            { value: 'Approved', label: 'Approved', count: inPeriod.filter((s) => s.status === 'Approved').length },
            { value: 'Paid', label: 'Paid', count: inPeriod.filter((s) => s.status === 'Paid').length },
          ]}
        />
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            <span className="figure text-[12px] text-[var(--ink-3)]">{selected.size} selected</span>
            <Button size="sm" variant="line" icon={<Check size={13} />} onClick={() => act('Approved')}>
              Approve
            </Button>
            <Button size="sm" icon={<Banknote size={13} />} onClick={() => setPaying(true)}>
              Mark paid
            </Button>
          </div>
        )}
      </div>

      <DataTable
        rows={rows}
        columns={columns}
        rowKey={(s) => s.id}
        selectable
        selected={selected}
        onSelectedChange={setSelected}
        onRowClick={setSlip}
        initialSort={{ key: 'net', dir: 'desc' }}
        empty={
          <EmptyState
            title={`Nothing drafted for ${formatPeriod(period)}`}
            hint="Draft settlements to roll verified weigh-ins into a payslip per farmer."
            action={
              <Button variant="line" onClick={() => notify(`Drafted ${L.generateSettlements(period)} settlements`)}>
                Draft now
              </Button>
            }
          />
        }
      />

      <ConfirmDialog
        open={paying}
        title="Mark as paid?"
        message={`Approved settlements in your selection (${formatCurrency(sum(selRows.filter((s) => s.status === 'Approved'), 'net'))}) will be marked paid and their weigh-ins locked as settled.`}
        confirmLabel="Mark paid"
        onClose={() => setPaying(false)}
        onConfirm={() => act('Paid')}
      />

      <Modal open={!!slip} onClose={() => setSlip(null)} title="Payslip" eyebrow={slip?.ref} width={480}>
        {slip && (
          <div>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[16px]">{L.farmerById.get(slip.farmerId)?.name}</p>
                <p className="figure text-[12px] text-[var(--ink-3)]">
                  {L.farmerById.get(slip.farmerId)?.code} Â· {formatPeriod(slip.period)}
                </p>
              </div>
              <Badge status={slip.status} />
            </div>
            <dl className="figure mt-6 text-[13.5px]">
              {[
                ['Green leaf', formatKg(slip.kg)],
                ['Average tea price', `${formatCurrency(slip.averageTeaPricePerKg)} / kg`],
                ['Gross tea income', formatCurrency(slip.grossAmount)],
                ['Deduction quantity', formatKg(slip.totalDeductionQuantityKg)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between border-b border-dashed border-[var(--hair)] py-2.5">
                  <dt className="font-sans text-[var(--ink-2)]">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
              <div className="border-b border-dashed border-[var(--hair)] py-2.5">
                <p className="mb-1 font-sans text-[var(--ink-2)]">Material deductions</p>
                {slip.deductionBreakdown.map((deduction, index) => (
                  <div key={`${deduction.category}-${deduction.unit}-${index}`} className="flex justify-between gap-3 py-1">
                    <span>{deduction.category} - {formatNumber(deduction.quantity, 2)} {deduction.unit} x {formatCurrency(deduction.unitPrice)}</span>
                    <span>{formatCurrency(deduction.amount)}</span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between font-medium">
                  <span>Total material deductions</span>
                  <span>{formatCurrency(slip.deductions)}</span>
                </div>
              </div>
              <div className="flex justify-between border-b border-dashed border-[var(--hair)] py-2.5">
                <dt className="font-sans text-[var(--ink-2)]">Loan repayments</dt>
                <dd>{formatCurrency(slip.loanRepayments)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-b-[3px] border-double border-[var(--ink)] py-3">
                <dt className="font-sans">Net pay</dt>
                <dd className="font-display text-[34px]">{formatCurrency(slip.net)}</dd>
              </div>
            </dl>
            <div className="mt-6 flex justify-between gap-2">
              <Button variant="ghost" icon={<Printer size={14} />} onClick={() => window.print()}>
                Print
              </Button>
              <div className="flex gap-2">
                {slip.status === 'Draft' && (
                  <Button
                    onClick={() => {
                      L.setSettlementStatus([slip.id], 'Approved')
                      setSlip({ ...slip, status: 'Approved' })
                      notify('Settlement approved')
                    }}
                  >
                    Approve
                  </Button>
                )}
                {slip.status === 'Approved' && (
                  <Button
                    onClick={() => {
                      L.setSettlementStatus([slip.id], 'Paid')
                      setSlip({ ...slip, status: 'Paid' })
                      notify('Settlement paid')
                    }}
                  >
                    Mark paid
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}
