/** Hand-ruled tally: four strokes and a slash per gate. Jitter is seeded so it doesn't twitch on rerender. */
export function TallyMarks({ count, seed = 1, color = 'var(--ink)', max = 40 }: { count: number; seed?: number; color?: string; max?: number }) {
  const n = Math.min(count, max)
  const gates = Math.ceil(n / 5)
  const gateW = 26
  const h = 22
  let s = seed * 9301
  const j = () => {
    s = (s * 9301 + 49297) % 233280
    return (s / 233280 - 0.5) * 2.2
  }

  const strokes: { x1: number; y1: number; x2: number; y2: number; i: number }[] = []
  let i = 0
  for (let g = 0; g < gates; g++) {
    const inGate = Math.min(5, n - g * 5)
    const x0 = g * gateW + 3
    for (let k = 0; k < Math.min(4, inGate); k++) {
      const x = x0 + k * 5
      strokes.push({ x1: x + j(), y1: 3 + j() * 0.6, x2: x + j(), y2: h - 2 + j() * 0.6, i: i++ })
    }
    if (inGate === 5) strokes.push({ x1: x0 - 3 + j(), y1: h - 5 + j(), x2: x0 + 19 + j(), y2: 5 + j(), i: i++ })
  }

  return (
    <svg width={gates * gateW + 4} height={h + 2} aria-label={`${count} tallies`} className="overflow-visible">
      {strokes.map((l) => (
        <line
          key={l.i}
          {...l}
          stroke={color}
          strokeWidth="1.4"
          strokeLinecap="round"
          className="tally-stroke"
          style={{ ['--len' as string]: 30, animationDelay: `${l.i * 18}ms` }}
        />
      ))}
      {count > max && (
        <text x={gates * gateW + 2} y={h - 4} fontSize="11" fill="var(--ink-3)" className="figure">
          +
        </text>
      )}
    </svg>
  )
}
