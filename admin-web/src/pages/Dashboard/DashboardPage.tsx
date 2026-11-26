import { ArrowUpRight, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LeafStrip } from '../../components/charts/LeafStrip'
import { PourBreakdown } from '../../components/charts/PourBreakdown'
import { SteepCup } from '../../components/charts/SteepCup'
import { TallyMarks } from '../../components/charts/TallyMarks'
import { CollectionForm } from '../../components/forms/CollectionForm'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import { formatCurrency, formatCurrencyCompact } from '../../utils/formatCurrency'
import { formatTime, periodOf, toISODate } from '../../utils/formatDate'
import { formatKg, formatNumber } from '../../utils/formatNumber'

const dayOf = (iso: string) => toISODate(new Date(iso))

export default function DashboardPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const nav = useNavigate()
  const [adding, setAdding] = useState(false)

  const d = useMemo(() => {
    const today = toISODate(new Date())
    const period = periodOf(today)
    const todays = L.collections.filter((c) => dayOf(c.collectedAt) === today)
    const sum = (k: 'gross' | 'water' | 'bag' | 'other' | 'final' | 'amount', xs = todays) => xs.reduce((a, c) => a + c[k], 0)
    const month = L.collections.filter((c) => dayOf(c.collectedAt).startsWith(period))

    const byDay = new Map<string, number>()
    for (const c of L.collections) byDay.set(dayOf(c.collectedAt), (byDay.get(dayOf(c.collectedAt)) ?? 0) + c.final)
    const now = new Date()
    const days = Array.from({ length: 30 }, (_, i) => {
      const date = toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (29 - i)))
      return { date, kg: byDay.get(date) ?? 0 }
    })

    const yesterday = days[28].kg
    const perCollector = L.collectors
      .map((c) => {
        const xs = todays.filter((x) => x.collectorId === c.id)
        return { c, n: xs.length, kg: xs.reduce((a, x) => a + x.final, 0) }
      })
      .sort((a, b) => b.kg - a.kg)

    return {
      todays,
      kg: sum('final'),
      gross: sum('gross'),
      water: sum('water'),
      bag: sum('bag'),
      other: sum('other'),
      yesterday,
      monthKg: sum('final', month),
      monthAmt: sum('amount', month),
      pending: L.collections.filter((c) => c.status === 'Pending').length,
      disputed: L.collections.filter((c) => c.status === 'Disputed').length,
      activeFarmers: L.farmers.filter((f) => f.active).length,
      suppliedToday: new Set(todays.map((c) => c.farmerId)).size,
      days,
      perCollector,
      recent: [...L.collections].sort((a, b) => b.collectedAt.localeCompare(a.collectedAt)).slice(0, 7),
      price: L.priceFor(period),
    }
  }, [L])

  const delta = d.yesterday ? ((d.kg - d.yesterday) / d.yesterday) * 100 : 0
  const hour = new Date().getHours()
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <>
      <PageHeader
        title={
          <>
            {greet}, <span className="italic text-[var(--leaf)]">the leaf is in.</span>
          </>
        }
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setAdding(true)}>
            New weigh-in
          </Button>
        }
      />

      {/* ── Today ── */}
      <section className="rise grid items-center gap-8 lg:grid-cols-[1fr_auto]" style={{ animationDelay: '60ms' }}>
        <div>
          <p className="eyebrow">Payable leaf today</p>
          <p className="font-display mt-2 text-[88px] leading-[0.85] sm:text-[120px]">
            {formatNumber(d.kg, 1)}
            <span className="figure ml-2 align-top text-[18px] text-[var(--ink-3)]">kg</span>
          </p>
          <p className="mt-4 max-w-md text-[14.5px] leading-6 text-[var(--ink-2)]">
            From <b className="font-medium text-[var(--ink)]">{d.suppliedToday}</b> of {d.activeFarmers} farmers across{' '}
            {d.perCollector.filter((x) => x.n).length} routes.{' '}
            <span className={delta >= 0 ? 'text-[var(--leaf)]' : 'text-[var(--margin)]'}>
              {delta >= 0 ? '▲' : '▼'} {Math.abs(delta).toFixed(1)}%
            </span>{' '}
            on yesterday. Worth <span className="figure text-[var(--ink)]">{formatCurrency(d.kg * d.price)}</span> at Rs {d.price}/kg.
          </p>
        </div>
        <div className="flex items-center gap-4 justify-self-center lg:justify-self-end">
          <SteepCup value={d.kg} target={L.dailyTargetKg} />
          <div className="max-w-[120px]">
            <p className="eyebrow">Daily target</p>
            <p className="figure mt-1 text-[15px]">{formatKg(L.dailyTargetKg)}</p>
            <p className="mt-2 text-[12px] leading-5 text-[var(--ink-3)]">The brew darkens as the day fills.</p>
          </div>
        </div>
      </section>

      {/* ── Ledger figures ── */}
      <section className="rise mt-12 grid grid-cols-2 border-y border-[var(--ink)] lg:grid-cols-4" style={{ animationDelay: '120ms' }}>
        {[
          { k: 'Month to date', v: formatKg(d.monthKg), s: `${formatCurrencyCompact(d.monthAmt)} payable`, to: '/collections' },
          { k: 'Awaiting verification', v: String(d.pending), s: 'weigh-ins pending', to: '/collections?status=Pending', warn: d.pending > 0 },
          { k: 'Disputed', v: String(d.disputed), s: 'need a second look', to: '/collections?status=Disputed', danger: d.disputed > 0 },
          { k: 'Price this month', v: `Rs ${d.price}`, s: 'per kg, green leaf', to: '/settings' },
        ].map((f, i) => (
          <Link
            key={f.k}
            to={f.to}
            className={`group relative px-4 py-5 transition-colors hover:bg-[var(--leaf-soft)] sm:px-6 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'max-lg:border-t' : ''} ${i === 2 ? 'lg:border-l' : ''} border-[var(--hair)]`}
          >
            <p className="eyebrow">{f.k}</p>
            <p className={`figure mt-2 whitespace-nowrap text-[22px] sm:text-[26px] ${f.danger ? 'text-[var(--danger)]' : f.warn ? 'text-[var(--amber)]' : ''}`}>{f.v}</p>
            <p className="mt-1 text-[12px] text-[var(--ink-3)]">{f.s}</p>
            <ArrowUpRight size={14} className="absolute right-4 top-5 opacity-0 transition-opacity group-hover:opacity-60" />
          </Link>
        ))}
      </section>

      {/* ── Trend + tallies ── */}
      <section className="mt-14 grid gap-14 lg:grid-cols-[1.25fr_1fr]">
        <div className="rise" style={{ animationDelay: '180ms' }}>
          <h2 className="font-display text-[30px] leading-none">Thirty days of leaf</h2>
          <p className="mb-6 mt-1 text-[13px] text-[var(--ink-3)]">Each stem is a day. Green buds cleared the target.</p>
          <LeafStrip days={d.days} target={L.dailyTargetKg} />
        </div>
        <div className="rise" style={{ animationDelay: '240ms' }}>
          <h2 className="font-display text-[30px] leading-none">Tally by route</h2>
          <p className="mb-5 mt-1 text-[13px] text-[var(--ink-3)]">One stroke per weigh-in today.</p>
          <ul>
            {d.perCollector.map(({ c, n, kg }, i) => (
              <li key={c.id}>
                <Link to={`/collectors?focus=${c.id}`} className="grid grid-cols-[96px_1fr_auto] items-center gap-3 border-b border-[var(--hair)] py-3 hover:bg-[var(--leaf-soft)]">
                  <span>
                    <span className="block text-[13.5px]">{c.area}</span>
                    <span className="block text-[11.5px] text-[var(--ink-3)]">{c.name.split(' ')[0]}</span>
                  </span>
                  <span className="min-w-0 overflow-hidden">
                    {n ? <TallyMarks count={n} seed={i + 3} color={i === 0 ? 'var(--leaf)' : 'var(--ink)'} max={25} /> : <span className="text-[12px] italic text-[var(--ink-3)]">no rounds yet</span>}
                  </span>
                  <span className="figure text-right text-[13px]">{formatNumber(kg, 1)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Pour + recent ── */}
      <section className="mt-14 grid gap-14 lg:grid-cols-[1fr_1.25fr]">
        <div className="rise" style={{ animationDelay: '300ms' }}>
          <h2 className="font-display text-[30px] leading-none">The pour</h2>
          <p className="mb-6 mt-1 text-[13px] text-[var(--ink-3)]">
            Today’s <span className="figure">{formatKg(d.gross)}</span> gross, less what doesn’t get paid.
          </p>
          <PourBreakdown gross={d.gross} water={d.water} bag={d.bag} other={d.other} />
        </div>
        <div className="rise" style={{ animationDelay: '360ms' }}>
          <div className="flex items-end justify-between">
            <h2 className="font-display text-[30px] leading-none">Latest lines</h2>
            <Link to="/collections" className="text-[12.5px] text-[var(--ink-2)] underline decoration-[var(--hair)] underline-offset-4 hover:text-[var(--ink)]">
              Open the book →
            </Link>
          </div>
          <ul className="mt-5 border-t border-[var(--ink)]">
            {d.recent.map((c) => (
              <li
                key={c.id}
                onClick={() => nav(`/collections?q=${c.ref}`)}
                className="grid cursor-pointer grid-cols-[52px_1fr_auto_auto] items-center gap-3 border-b border-[var(--hair)] py-2.5 hover:bg-[var(--leaf-soft)]"
              >
                <span className="figure text-[12px] text-[var(--ink-3)]">{formatTime(c.collectedAt)}</span>
                <span className="min-w-0 truncate text-[13.5px]">{L.farmerById.get(c.farmerId)?.name ?? '—'}</span>
                <Badge status={c.status} />
                <span className="figure w-20 text-right text-[13px]">{formatNumber(c.final, 1)} kg</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
