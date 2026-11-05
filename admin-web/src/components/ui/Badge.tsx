const tones: Record<string, string> = {
  Pending: 'text-[var(--amber)]',
  Draft: 'text-[var(--amber)]',
  Verified: 'text-[var(--leaf)]',
  Approved: 'text-[var(--leaf)]',
  Active: 'text-[var(--leaf)]',
  Settled: 'text-[var(--ink-3)]',
  Paid: 'text-[var(--ink-2)]',
  Inactive: 'text-[var(--ink-3)]',
  Disputed: 'text-[var(--danger)]',
}

/** A rubber-stamp status mark, slightly rotated as if inked by hand. */
export function Badge({ status }: { status: string }) {
  return <span className={`stamp ${tones[status] ?? 'text-[var(--ink-2)]'}`}>{status}</span>
}
