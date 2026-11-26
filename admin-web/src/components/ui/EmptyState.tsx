import type { ReactNode } from 'react'

export function EmptyState({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-16 text-center">
      <svg width="56" height="40" viewBox="0 0 56 40" fill="none" className="text-[var(--ink-3)]" aria-hidden>
        <path d="M6 34c10-2 34-2 44 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M14 30c0-10 6-18 14-22 8 4 14 12 14 22" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 3" />
        <path d="M28 8v22" stroke="currentColor" strokeWidth="1.2" />
      </svg>
      <p className="font-display mt-4 text-[26px] leading-none">{title}</p>
      {hint && <p className="mt-2 max-w-xs text-[13px] text-[var(--ink-3)]">{hint}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
