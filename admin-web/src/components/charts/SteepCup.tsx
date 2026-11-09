const STEEP = ['--steep-1', '--steep-2', '--steep-3', '--steep-4', '--steep-5', '--steep-6', '--steep-7', '--steep-8']

/**
 * A tea cup seen from above. The liquor deepens in colour (pale first flush → dark brew)
 * and the progress arc runs round the rim as the day's intake approaches target.
 */
export function SteepCup({ value, target, size = 220 }: { value: number; target: number; size?: number }) {
  const p = Math.max(0, Math.min(1, target ? value / target : 0))
  const shade = STEEP[Math.min(STEEP.length - 1, Math.floor(p * STEEP.length))]
  const c = 110
  const rimR = 74
  const arcR = 86
  const circ = 2 * Math.PI * arcR
  const liquorR = 20 + p * 46

  return (
    <svg width={size} height={size} viewBox="0 0 240 220" role="img" aria-label={`${Math.round(p * 100)}% of daily target`}>
      {/* saucer */}
      <circle cx={c} cy={c} r={102} fill="none" stroke="var(--hair)" />
      <circle cx={c} cy={c} r={96} fill="var(--paper-2)" opacity="0.6" />
      {/* handle */}
      <path d="M182 92 q34 -2 34 18 q0 20 -34 18" fill="none" stroke="var(--ink)" strokeWidth="1.2" />
      <path d="M182 100 q22 0 22 10 q0 10 -22 10" fill="none" stroke="var(--ink)" strokeWidth="1" opacity=".4" />
      {/* progress arc */}
      <circle cx={c} cy={c} r={arcR} fill="none" stroke="var(--hair)" strokeWidth="1" strokeDasharray="1 5" />
      <circle
        cx={c}
        cy={c}
        r={arcR}
        fill="none"
        stroke="var(--leaf)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={`${circ * p} ${circ}`}
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray 1s cubic-bezier(.2,.8,.2,1)' }}
      />
      {/* cup */}
      <circle cx={c} cy={c} r={rimR} fill="var(--paper)" stroke="var(--ink)" strokeWidth="1.2" />
      <circle cx={c} cy={c} r={rimR - 6} fill="none" stroke="var(--hair)" />
      {/* liquor */}
      <circle
        cx={c}
        cy={c}
        r={liquorR}
        fill={`var(${shade})`}
        style={{ transition: 'r 1s cubic-bezier(.2,.8,.2,1), fill .6s', transformOrigin: 'center', animation: 'fill-up 1s cubic-bezier(.2,.8,.2,1) both' }}
      />
      <circle cx={c - liquorR * 0.35} cy={c - liquorR * 0.4} r={liquorR * 0.18} fill="#fff" opacity="0.18" />
      <text x={c} y={c + 2} textAnchor="middle" dominantBaseline="middle" className="font-display" fontSize="40" fill={p > 0.55 ? '#f5f0e6' : 'var(--ink)'}>
        {Math.round(p * 100)}
        <tspan fontSize="18" dx="1">%</tspan>
      </text>
    </svg>
  )
}
