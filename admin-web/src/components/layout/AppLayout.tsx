import { LogOut, Monitor, Moon, Search, Sun } from 'lucide-react'
import { useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import logo from '../../assets/logo.png'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../hooks/useTheme'
import { SearchBar } from '../navbar/SearchBar'
import { navigation } from '../sidebar/navigation'

const ink = (steep: number) => (steep >= 5 ? '#f5f0e6' : '#2a2a1f')

function ThemeCycle() {
  const { pref, setPref } = useTheme()
  const next = pref === 'light' ? 'dark' : pref === 'dark' ? 'system' : 'light'
  const Icon = pref === 'light' ? Sun : pref === 'dark' ? Moon : Monitor
  return (
    <button
      onClick={() => setPref(next)}
      title={`Theme: ${pref} (click for ${next})`}
      aria-label={`Theme: ${pref}. Switch to ${next}`}
      className="grid size-9 place-items-center rounded-full text-current opacity-70 hover:bg-white/10 hover:opacity-100"
    >
      <Icon size={16} />
    </button>
  )
}

export function AppLayout() {
  const { user, signOut } = useAuth()
  const [finding, setFinding] = useState(false)
  const { pathname } = useLocation()
  const initials = (user?.name ?? 'A').split(' ').map((w) => w[0]).join('').slice(0, 2)

  return (
    <div className="flex min-h-full bg-[var(--spine)]">
      {/* ── Spine (desktop) ── */}
      <aside className="sticky top-0 hidden h-screen w-[68px] shrink-0 flex-col items-center justify-between py-5 text-[var(--spine-ink)] md:flex">
        <div className="flex flex-col items-center gap-6">
          <img src={logo} alt="" className="size-9 rounded-full bg-[#f5f0e6] p-1" />
          <p className="font-display select-none text-[22px] tracking-wide [writing-mode:vertical-rl] rotate-180 opacity-90">
            TeaLedger <span className="italic opacity-60">— vol. {new Date().getFullYear()}</span>
          </p>
        </div>
        <div className="flex flex-col items-center gap-2">
          <button
            onClick={() => setFinding(true)}
            aria-label="Quick find (Ctrl+K)"
            title="Quick find  ·  Ctrl K"
            className="grid size-9 place-items-center rounded-full opacity-70 hover:bg-white/10 hover:opacity-100"
          >
            <Search size={16} />
          </button>
          <ThemeCycle />
          <button
            onClick={signOut}
            title="Sign out"
            aria-label="Sign out"
            className="grid size-9 place-items-center rounded-full opacity-70 hover:bg-white/10 hover:opacity-100"
          >
            <LogOut size={16} />
          </button>
          <span title={user?.name} className="figure mt-2 grid size-9 place-items-center rounded-full border border-white/25 text-[11px]">
            {initials}
          </span>
        </div>
      </aside>

      {/* ── The page ── */}
      <div className="ledger-paper relative min-w-0 flex-1 md:my-3 md:rounded-l-[18px] md:shadow-[var(--shadow)]">
        {/* mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--hair)] bg-[var(--paper)]/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="size-7" />
            <span className="font-display text-[22px]">TeaLedger</span>
          </div>
          <div className="flex items-center text-[var(--ink)]">
            <button onClick={() => setFinding(true)} aria-label="Quick find" className="grid size-9 place-items-center">
              <Search size={17} />
            </button>
            <ThemeCycle />
            <button onClick={signOut} aria-label="Sign out" className="grid size-9 place-items-center">
              <LogOut size={17} />
            </button>
          </div>
        </div>

        <main key={pathname} className="mx-auto max-w-[1180px] px-4 pb-28 pt-8 sm:px-8 md:pb-16 md:pl-20 md:pr-10 md:pt-12">
          <Outlet />
        </main>
      </div>

      {/* ── Thumb-index tabs (desktop) ── */}
      <nav aria-label="Folios" className="sticky top-0 hidden h-screen w-[50px] shrink-0 flex-col justify-center gap-[3px] py-6 md:flex">
        {navigation.map((n, i) => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === '/'}
            className="index-tab relative flex items-center justify-center gap-2 rounded-r-[10px] px-2 py-4 text-[12px] font-medium tracking-wide"
            style={{ background: `var(--steep-${n.steep})`, color: ink(n.steep) }}
          >
            <span className="figure text-[10px] opacity-60">{String(i + 1).padStart(2, '0')}</span>
            {n.label}
          </NavLink>
        ))}
      </nav>

      {/* ── Tab strip (mobile) ── */}
      <nav aria-label="Folios" className="fixed inset-x-0 bottom-0 z-30 flex overflow-x-auto border-t border-[var(--hair)] bg-[var(--paper)] md:hidden">
        {navigation.map((n) => (
          <NavLink
            key={n.path}
            to={n.path}
            end={n.path === '/'}
            className={({ isActive }) =>
              `flex min-w-[76px] flex-1 flex-col items-center gap-1 px-2 pb-3 pt-2 text-[11px] ${isActive ? 'text-[var(--ink)]' : 'text-[var(--ink-3)]'}`
            }
          >
            {({ isActive }) => (
              <>
                <span className="h-1.5 w-full rounded-b" style={{ background: `var(--steep-${n.steep})`, opacity: isActive ? 1 : 0.45 }} />
                {n.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <SearchBar open={finding} onOpenChange={setFinding} />
    </div>
  )
}
