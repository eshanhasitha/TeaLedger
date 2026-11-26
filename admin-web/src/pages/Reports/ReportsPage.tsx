import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/layout/PageHeader'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import { exportToCsv } from '../../utils/exportToCsv'
import { formatCurrency } from '../../utils/formatCurrency'
import { formatPeriod, periodOf, toISODate } from '../../utils/formatDate'
import { formatNumber, round2 } from '../../utils/formatNumber'

export default function ReportsPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const periods = useMemo(() => [...new Set(L.collections.map((c) => periodOf(toISODate(new Date(c.collectedAt)))))].sort().reverse(), [L.collections])
  const [period, setPeriod] = useState(periods[0] ?? periodOf(toISODate(new Date())))

  const lines = useMemo(() => L.collections.filter((c) => periodOf(toISODate(new Date(c.collectedAt))) === period), [L.collections, period])

  const byRoute = useMemo(
    () =>
      L.collectors.map((c) => {
        const xs = lines.filter((x) => x.collectorId === c.id)
        const gross = xs.reduce((a, x) => a + x.gross, 0)
        const water = xs.reduce((a, x) => a + x.water, 0)
        return {
          route: c.area,
          collector: c.name,
          weigh_ins: xs.length,
          farmers: new Set(xs.map((x) => x.farmerId)).size,
          gross_kg: round2(gross),
          payable_kg: round2(xs.reduce((a, x) => a + x.final, 0)),
          water_pct: gross ? round2((water / gross) * 100) : 0,
          amount: round2(xs.reduce((a, x) => a + x.amount, 0)),
        }
      }),
    [L.collectors, lines],
  )
  const total = byRoute.reduce((a, r) => ({ kg: a.kg + r.payable_kg, amt: a.amt + r.amount, n: a.n + r.weigh_ins }), { kg: 0, amt: 0, n: 0 })
  const maxKg = Math.max(1, ...byRoute.map((r) => r.payable_kg))

  const reports = [
    {
      title: 'Route summary',
      body: 'Weigh-ins, payable leaf, water ratio and value for each route.',
      run: () => exportToCsv(`route-summary-${period}`, byRoute),
    },
    {
      title: 'Farmer statement',
      body: 'One line per farmer: leaf supplied, value and number of deliveries.',
      run: () => {
        const m = new Map<string, { kg: number; amt: number; n: number }>()
        lines.forEach((x) => {
          const e = m.get(x.farmerId) ?? { kg: 0, amt: 0, n: 0 }
          m.set(x.farmerId, { kg: e.kg + x.final, amt: e.amt + x.amount, n: e.n + 1 })
        })
        exportToCsv(
          `farmer-statement-${period}`,
          [...m].map(([id, e]) => ({ code: L.farmerById.get(id)?.code ?? id, name: L.farmerById.get(id)?.name ?? '', deliveries: e.n, kg: round2(e.kg), amount: round2(e.amt) })),
        )
      },
    },
    {
      title: 'Raw weigh-in journal',
      body: 'Every line for the month with all deductions. Good for audit.',
      run: () =>
        exportToCsv(
          `journal-${period}`,
          lines.map((c) => ({ ref: c.ref, at: c.collectedAt, farmer: L.farmerById.get(c.farmerId)?.code ?? '', gross: c.gross, water: c.water, bag: c.bag, other: c.other, final: c.final, price: c.pricePerKg, amount: c.amount, status: c.status })),
        ),
    },
    {
      title: 'Tea price history',
      body: 'The green-leaf rate set for each month.',
      run: () => exportToCsv('tea-prices', L.prices.map((p) => ({ period: p.period, price_per_kg: p.pricePerKg }))),
    },
  ]

  return (
    <>
      <PageHeader
        title="Reports"
        lede="Month-end figures at a glance, and clean CSVs for the accountant."
        actions={
          <label className="w-48">
            <span className="eyebrow">Month</span>
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="field mt-1">
              {periods.map((p) => (
                <option key={p} value={p}>
                  {formatPeriod(p)}
                </option>
              ))}
            </select>
          </label>
        }
      />

      <section className="rise" style={{ animationDelay: '60ms' }}>
        <div className="flex flex-wrap items-baseline gap-x-8 gap-y-2">
          <p className="font-display text-[56px] leading-none">
            {formatNumber(total.kg, 0)}
            <span className="figure ml-1 text-[14px] text-[var(--ink-3)]">kg</span>
          </p>
          <p className="figure text-[15px] text-[var(--ink-2)]">
            {formatCurrency(total.amt)} · {total.n} weigh-ins
          </p>
        </div>
        <ul className="mt-8 border-t border-[var(--ink)]">
          {byRoute
            .slice()
            .sort((a, b) => b.payable_kg - a.payable_kg)
            .map((r) => (
              <li key={r.route} className="grid grid-cols-[110px_1fr_90px] items-center gap-4 border-b border-[var(--hair)] py-3 sm:grid-cols-[140px_1fr_110px_130px]">
                <span className="text-[13.5px]">{r.route}</span>
                <span className="relative h-2 rounded-full bg-[var(--paper-3)]">
                  <span className="absolute inset-y-0 left-0 rounded-full bg-[var(--leaf)] transition-[width] duration-700" style={{ width: `${(r.payable_kg / maxKg) * 100}%` }} />
                </span>
                <span className="figure text-right text-[13px]">{formatNumber(r.payable_kg, 1)} kg</span>
                <span className="figure text-right text-[12px] text-[var(--ink-3)] max-sm:hidden">water {r.water_pct}%</span>
              </li>
            ))}
        </ul>
      </section>

      <section className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[var(--hair)] bg-[var(--hair)] sm:grid-cols-2">
        {reports.map((r, i) => (
          <button
            key={r.title}
            onClick={() => {
              r.run()
              notify(`${r.title} for ${formatPeriod(period)} downloaded`, 'info')
            }}
            className="rise group flex items-start justify-between gap-6 bg-[var(--paper)] p-6 text-left transition-colors hover:bg-[var(--paper-2)]"
            style={{ animationDelay: `${120 + i * 50}ms` }}
          >
            <span>
              <span className="eyebrow">Report {String(i + 1).padStart(2, '0')}</span>
              <span className="font-display mt-1 block text-[28px] leading-none">{r.title}</span>
              <span className="mt-2 block text-[13px] text-[var(--ink-2)]">{r.body}</span>
            </span>
            <span className="grid size-10 shrink-0 place-items-center rounded-full border border-[var(--hair)] transition-all group-hover:border-[var(--ink)] group-hover:bg-[var(--ink)] group-hover:text-[var(--paper)]">
              <Download size={15} />
            </span>
          </button>
        ))}
      </section>
    </>
  )
}
