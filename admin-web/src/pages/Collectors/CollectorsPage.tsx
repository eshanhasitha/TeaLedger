import { Pencil, Phone, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { TallyMarks } from '../../components/charts/TallyMarks'
import { CollectorForm } from '../../components/forms/CollectorForm'
import { PageHeader } from '../../components/layout/PageHeader'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Modal } from '../../components/ui/Modal'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import type { Collector } from '../../types/ledger.types'
import { periodOf, toISODate } from '../../utils/formatDate'
import { formatKg } from '../../utils/formatNumber'

export default function CollectorsPage() {
  const L = useLedger()
  const { notify } = useNotifications()
  const [params] = useSearchParams()
  const focus = params.get('focus')
  const [editing, setEditing] = useState<Collector | 'new' | null>(null)

  useEffect(() => {
    if (focus) document.getElementById(`col-${focus}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [focus])

  const stats = useMemo(() => {
    const today = toISODate(new Date())
    const period = periodOf(today)
    return new Map(
      L.collectors.map((c) => {
        const xs = L.collections.filter((x) => x.collectorId === c.id)
        const td = xs.filter((x) => toISODate(new Date(x.collectedAt)) === today)
        const mo = xs.filter((x) => periodOf(toISODate(new Date(x.collectedAt))) === period)
        return [
          c.id,
          {
            farmers: L.farmers.filter((f) => f.collectorId === c.id && f.active).length,
            today: td.length,
            todayKg: td.reduce((a, x) => a + x.final, 0),
            monthKg: mo.reduce((a, x) => a + x.final, 0),
            pending: xs.filter((x) => x.status === 'Pending').length,
          },
        ]
      }),
    )
  }, [L.collectors, L.collections, L.farmers])

  const maxMonth = Math.max(1, ...[...stats.values()].map((s) => s.monthKg))

  return (
    <>
      <PageHeader
        title="Collectors"
        lede="One collector per route. Each column is a route; the bar beneath shows its share of this month’s leaf."
        actions={
          <Button icon={<Plus size={15} />} onClick={() => setEditing('new')}>
            Add collector
          </Button>
        }
      />

      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 xl:grid-cols-3">
        {L.collectors.map((c, i) => {
          const s = stats.get(c.id)!
          return (
            <article
              id={`col-${c.id}`}
              key={c.id}
              className={`rise group relative border-t pt-4 ${focus === c.id ? 'border-[var(--leaf)]' : 'border-[var(--ink)]'} ${c.active ? '' : 'opacity-60'}`}
              style={{ animationDelay: `${60 + i * 50}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="eyebrow">
                    {c.code} · route {String(i + 1).padStart(2, '0')}
                  </p>
                  <h2 className="font-display mt-1 text-[40px] leading-none">{c.area}</h2>
                </div>
                <Badge status={c.active ? 'Active' : 'Inactive'} />
              </div>
              <p className="mt-3 text-[14px]">{c.name}</p>
              <a href={`tel:${c.phone.replace(/\s/g, '')}`} className="figure inline-flex items-center gap-1.5 text-[12px] text-[var(--ink-3)] hover:text-[var(--ink)]">
                <Phone size={11} /> {c.phone}
              </a>

              <dl className="mt-5 grid grid-cols-3 gap-3 text-[12px]">
                <div>
                  <dt className="text-[var(--ink-3)]">Farmers</dt>
                  <dd className="figure mt-0.5 text-[17px]">{s.farmers}</dd>
                </div>
                <div>
                  <dt className="text-[var(--ink-3)]">Today</dt>
                  <dd className="figure mt-0.5 text-[17px]">{formatKg(s.todayKg)}</dd>
                </div>
                <div>
                  <dt className="text-[var(--ink-3)]">Pending</dt>
                  <dd className={`figure mt-0.5 text-[17px] ${s.pending ? 'text-[var(--amber)]' : ''}`}>
                    {s.pending ? <Link to="/collections?status=Pending" className="underline decoration-dotted underline-offset-4">{s.pending}</Link> : 0}
                  </dd>
                </div>
              </dl>

              <div className="mt-5 min-h-6">
                {s.today ? <TallyMarks count={s.today} seed={i + 7} max={30} /> : <span className="text-[12px] italic text-[var(--ink-3)]">No rounds recorded today</span>}
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] text-[var(--ink-3)]">
                  <span>Month</span>
                  <span className="figure">{formatKg(s.monthKg)}</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-[var(--paper-3)]">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(s.monthKg / maxMonth) * 100}%`, background: `var(--steep-${Math.min(8, i + 3)})` }} />
                </div>
              </div>

              <div className="mt-5 flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100">
                <Button size="sm" variant="ghost" icon={<Pencil size={12} />} onClick={() => setEditing(c)}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    L.updateCollector(c.id, { active: !c.active })
                    notify(`${c.area} route ${c.active ? 'paused' : 'resumed'}`, 'info')
                  }}
                >
                  {c.active ? 'Pause route' : 'Resume route'}
                </Button>
              </div>
            </article>
          )
        })}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add collector' : 'Edit collector'} eyebrow={editing && editing !== 'new' ? editing.code : 'New route'}>
        <CollectorForm
          initial={editing && editing !== 'new' ? editing : undefined}
          onCancel={() => setEditing(null)}
          onSubmit={(v) => {
            if (editing === 'new') {
              const c = L.addCollector(v)
              notify(`${c.name} added for ${c.area}`)
            } else if (editing) {
              L.updateCollector(editing.id, v)
              notify('Collector saved')
            }
            setEditing(null)
          }}
        />
      </Modal>
    </>
  )
}
