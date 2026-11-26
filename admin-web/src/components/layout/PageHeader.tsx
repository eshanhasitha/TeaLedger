import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { folioOf, navigation } from '../sidebar/navigation'

interface Props {
  title: ReactNode
  lede?: ReactNode
  actions?: ReactNode
  crumb?: ReactNode
}

export function PageHeader({ title, lede, actions, crumb }: Props) {
  const { pathname } = useLocation()
  const i = folioOf(pathname)
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="rise mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="eyebrow flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-[var(--margin)]">Folio {String(i + 1).padStart(2, '0')}</span>
          <span className="h-px w-6 bg-[var(--hair)]" />
          {crumb ?? navigation[i].label}
          <span className="h-px w-6 bg-[var(--hair)] max-sm:hidden" />
          <span className="max-sm:hidden">{today}</span>
        </p>
        <h1 className="font-display mt-3 text-[44px] leading-[0.95] sm:text-[60px]">{title}</h1>
        {lede && <p className="mt-3 max-w-xl text-[14.5px] leading-6 text-[var(--ink-2)]">{lede}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  )
}
