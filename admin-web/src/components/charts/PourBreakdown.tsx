import { formatNumber } from '../../utils/formatNumber'

interface Props {
  gross: number
  water: number
  bag: number
  other: number
}

/** "The pour": gross leaf weight with each deduction struck through, leaving the payable weight. */
export function PourBreakdown({ gross, water, bag, other }: Props) {
  const final = Math.max(0, gross - water - bag - other)
  const parts = [
    { label: 'Payable', v: final, color: 'var(--leaf)' },
    { label: 'Water', v: water, color: 'var(--steep-3)' },
    { label: 'Bags', v: bag, color: 'var(--steep-5)' },
    { label: 'Other', v: other, color: 'var(--margin)' },
  ]
  const pct = (v: number) => (gross ? (v / gross) * 100 : 0)

  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-[var(--paper-3)]">
        {parts.map((p) => (
          <span key={p.label} style={{ width: `${pct(p.v)}%`, background: p.color }} className="h-full transition-[width] duration-700" />
        ))}
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {parts.map((p, i) => (
          <div key={p.label}>
            <dt className="flex items-center gap-1.5 text-[12px] text-[var(--ink-2)]">
              <span className="size-2 rounded-[1px]" style={{ background: p.color }} />
              {p.label}
            </dt>
            <dd className={`figure mt-0.5 text-[15px] ${i > 0 ? 'text-[var(--ink-2)]' : ''}`}>
              {i > 0 && '−'}
              {formatNumber(p.v, 1)}
              <span className="ml-1 text-[11px] text-[var(--ink-3)]">{pct(p.v).toFixed(1)}%</span>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
