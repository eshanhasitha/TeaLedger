import { CornerDownLeft, Search } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useLedger } from '../../hooks/useLedger'
import { navigation } from '../sidebar/navigation'

interface Hit {
  id: string
  kind: string
  title: string
  meta: string
  to: string
}

/** Quick-find over farmers, collectors, entries and pages. Opens with Ctrl/⌘+K or "/". */
export function SearchBar({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { farmers, collectors, collections, farmerById } = useLedger()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const nav = useNavigate()
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = /input|textarea|select/i.test((e.target as HTMLElement).tagName)
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === '/' && !typing)) {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onOpenChange])

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 10)
  }, [open])

  const hits = useMemo<Hit[]>(() => {
    const s = q.trim().toLowerCase()
    const pages = navigation.map((n) => ({ id: n.path, kind: 'Page', title: n.label, meta: 'Go to folio', to: n.path }))
    if (!s) return pages
    const out: Hit[] = pages.filter((p) => p.title.toLowerCase().includes(s))
    for (const f of farmers)
      if (f.name.toLowerCase().includes(s) || f.code.toLowerCase().includes(s) || f.phone.replace(/\s/g, '').includes(s.replace(/\s/g, '')))
        out.push({ id: f.id, kind: 'Farmer', title: f.name, meta: `${f.code} · ${f.address}`, to: `/farmers/${f.id}` })
    for (const c of collectors)
      if (c.name.toLowerCase().includes(s) || c.area.toLowerCase().includes(s) || c.code.toLowerCase().includes(s))
        out.push({ id: c.id, kind: 'Collector', title: c.name, meta: `${c.code} · ${c.area}`, to: `/collectors?focus=${c.id}` })
    for (const c of collections)
      if (c.ref.toLowerCase().includes(s))
        out.push({ id: c.id, kind: 'Entry', title: c.ref, meta: `${farmerById.get(c.farmerId)?.name ?? ''} · ${c.final} kg`, to: `/collections?q=${c.ref}` })
    return out.slice(0, 9)
  }, [q, farmers, collectors, collections, farmerById])

  const close = () => {
    onOpenChange(false)
    setQ('')
    setI(0)
  }
  const go = (h?: Hit) => {
    if (!h) return
    nav(h.to)
    close()
  }

  if (!open) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-center px-4 pt-[14vh]" onKeyDown={(e) => e.key === 'Escape' && close()}>
      <div className="absolute inset-0 bg-[#1d221d]/30 backdrop-blur-[2px]" onClick={close} />
      <div role="dialog" aria-label="Quick find" className="rise relative h-fit w-full max-w-lg overflow-hidden rounded-2xl border border-[var(--hair)] bg-[var(--paper)] shadow-[var(--shadow)]">
        <div className="flex items-center gap-3 border-b border-[var(--hair)] px-5">
          <Search size={16} className="text-[var(--ink-3)]" />
          <input
            ref={input}
            value={q}
            onChange={(e) => {
              setQ(e.target.value)
              setI(0)
            }}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                setI((x) => Math.min(hits.length - 1, x + 1))
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setI((x) => Math.max(0, x - 1))
              } else if (e.key === 'Enter') go(hits[i])
            }}
            placeholder="Find a farmer, collector, entry ref…"
            className="h-14 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[var(--ink-3)]"
          />
          <kbd className="figure rounded border border-[var(--hair)] px-1.5 text-[10px] text-[var(--ink-3)]">esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-auto p-2">
          {hits.length === 0 && <li className="px-3 py-8 text-center text-[13px] text-[var(--ink-3)]">No line in the ledger matches “{q}”.</li>}
          {hits.map((h, k) => (
            <li key={h.kind + h.id}>
              <button
                onMouseEnter={() => setI(k)}
                onClick={() => go(h)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${k === i ? 'bg-[var(--leaf-soft)]' : ''}`}
              >
                <span className="eyebrow w-16 shrink-0">{h.kind}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px]">{h.title}</span>
                  <span className="block truncate text-[12px] text-[var(--ink-3)]">{h.meta}</span>
                </span>
                {k === i && <CornerDownLeft size={14} className="text-[var(--ink-3)]" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>,
    document.body,
  )
}
