import { useState } from 'react'
import { formatDateShort } from '../../utils/formatDate'
import { formatKg } from '../../utils/formatNumber'

/** Daily intake drawn as tea stems — each stem a day, the bud at its tip coloured by steep depth. */
export function LeafStrip({ days, target }: { days: { date: string; kg: number }[]; target: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(target * 1.15, ...days.map((d) => d.kg))
  const H = 150
  const W = 100 / days.length
  const ty = H - (target / max) * H

  const h = hover ?? days.length - 1
  const sel = days[h]

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <p className="figure text-[12px] text-[var(--ink-3)]">
          {sel ? formatDateShort(sel.date) : ''} <span className="ml-2 text-[var(--ink)]">{sel ? formatKg(sel.kg) : ''}</span>
        </p>
        <p className="figure text-[11px] text-[var(--ink-3)]">target {formatKg(target)}</p>
      </div>
      <div className="relative" style={{ height: H }} onMouseLeave={() => setHover(null)}>
        <div className="absolute inset-x-0 border-t border-dashed border-[var(--margin)] opacity-60" style={{ top: ty }} />
        <div className="absolute inset-0 flex items-end">
          {days.map((d, i) => {
            const bh = d.kg === 0 ? 0 : Math.max(6, (d.kg / max) * H)
            const hit = d.kg >= target
            const on = i === h
            return (
              <button
                key={d.date}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                aria-label={`${formatDateShort(d.date)}: ${formatKg(d.kg)}`}
                className="group relative flex h-full items-end justify-center"
                style={{ width: `${W}%` }}
              >
                {d.kg === 0 ? (
                  <span className="mb-0.5 size-1 rounded-full bg-[var(--hair)]" />
                ) : (
                  <span className="relative flex flex-col items-center" style={{ height: bh }}>
                    <span
                      className="block size-[7px] rounded-[0_70%_0_70%] transition-transform"
                      style={{
                        background: hit ? 'var(--leaf)' : 'var(--steep-4)',
                        transform: on ? 'scale(1.6) rotate(-10deg)' : 'rotate(-10deg)',
                      }}
                    />
                    <span className={`w-px flex-1 ${on ? 'bg-[var(--ink)]' : 'bg-[var(--ink-3)]'} opacity-80`} />
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>
      <div className="figure mt-2 flex justify-between border-t border-[var(--ink)] pt-2 text-[10.5px] text-[var(--ink-3)]">
        <span>{days[0] && formatDateShort(days[0].date)}</span>
        <span>today</span>
      </div>
    </div>
  )
}
