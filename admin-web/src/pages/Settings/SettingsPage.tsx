import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react'
import { useState } from 'react'
import { SteepCup } from '../../components/charts/SteepCup'
import { PageHeader } from '../../components/layout/PageHeader'
import { Button } from '../../components/ui/Button'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { useAuth } from '../../hooks/useAuth'
import { useLedger } from '../../hooks/useLedger'
import { useNotifications } from '../../hooks/useNotifications'
import { useTheme } from '../../hooks/useTheme'
import type { ThemePref } from '../../context/ThemeContext'
import { formatPeriod, periodOf, toISODate } from '../../utils/formatDate'

function PriceRow({ period, current, onSave }: { period: string; current: number; onSave: (p: number) => void }) {
  const [v, setV] = useState(String(current))
  const n = Number(v)
  const valid = v !== '' && n >= 50 && n <= 1000
  const dirty = n !== current
  return (
    <li className="grid grid-cols-[1fr_120px_auto] items-end gap-4 border-b border-[var(--hair)] py-3">
      <span className="pb-2 text-[14px]">{formatPeriod(period)}</span>
      <label>
        <span className="sr-only">Price for {period}</span>
        <span className="relative flex items-baseline">
          <input type="number" value={v} onChange={(e) => setV(e.target.value)} aria-invalid={!valid} className="field figure !pr-12 text-right" />
          <span className="figure pointer-events-none absolute right-1 text-[11px] text-[var(--ink-3)]">Rs/kg</span>
        </span>
      </label>
      <Button size="sm" variant={dirty ? 'ink' : 'ghost'} disabled={!dirty || !valid} onClick={() => onSave(n)}>
        {dirty ? 'Save' : 'Saved'}
      </Button>
    </li>
  )
}

export default function SettingsPage() {
  const L = useLedger()
  const { user } = useAuth()
  const { pref, setPref } = useTheme()
  const { notify } = useNotifications()
  const [target, setTarget] = useState(String(L.dailyTargetKg))
  const [resetting, setResetting] = useState(false)

  const now = new Date()
  const periods = [-1, 0, 1].map((d) => periodOf(toISODate(new Date(now.getFullYear(), now.getMonth() + d, 1))))

  return (
    <>
      <PageHeader title="Settings" lede="Rates, targets and how the ledger looks." />

      <div className="grid gap-16 lg:grid-cols-2">
        <section className="rise">
          <h2 className="font-display text-[30px] leading-none">Green-leaf rate</h2>
          <p className="mb-4 mt-1 text-[13px] text-[var(--ink-3)]">New weigh-ins use the rate for the month they’re collected in.</p>
          <ul className="border-t border-[var(--ink)]">
            {periods.map((p) => (
              <PriceRow
                key={p}
                period={p}
                current={L.priceFor(p)}
                onSave={(v) => {
                  L.setPrice(p, v)
                  notify(`Rate for ${formatPeriod(p)} set to Rs ${v}/kg`)
                }}
              />
            ))}
          </ul>
        </section>

        <section className="rise" style={{ animationDelay: '60ms' }}>
          <h2 className="font-display text-[30px] leading-none">Daily target</h2>
          <p className="mb-4 mt-1 text-[13px] text-[var(--ink-3)]">Fills the cup on the overview.</p>
          <div className="flex items-center gap-6">
            <SteepCup value={Number(target) * 0.65} target={Number(target) || 1} size={150} />
            <form
              className="flex flex-1 items-end gap-3"
              onSubmit={(e) => {
                e.preventDefault()
                const n = Math.round(Number(target))
                if (!(n >= 50 && n <= 50000)) return notify('Target must be between 50 and 50,000 kg', 'danger')
                L.setDailyTarget(n)
                notify(`Daily target set to ${n} kg`)
              }}
            >
              <label className="flex-1">
                <span className="eyebrow">Kilograms per day</span>
                <input type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="field figure mt-1" />
              </label>
              <Button size="sm" type="submit" disabled={Number(target) === L.dailyTargetKg}>
                Save
              </Button>
            </form>
          </div>
        </section>

        <section className="rise" style={{ animationDelay: '120ms' }}>
          <h2 className="font-display text-[30px] leading-none">Paper</h2>
          <p className="mb-4 mt-1 text-[13px] text-[var(--ink-3)]">Day ledger, night ledger, or follow the device.</p>
          <div role="radiogroup" className="grid grid-cols-3 gap-3">
            {(
              [
                ['light', 'Day', Sun],
                ['dark', 'Night', Moon],
                ['system', 'Device', Monitor],
              ] as [ThemePref, string, typeof Sun][]
            ).map(([v, label, Icon]) => (
              <button
                key={v}
                role="radio"
                aria-checked={pref === v}
                onClick={() => setPref(v)}
                className={`flex flex-col items-start gap-6 rounded-xl border p-4 text-left transition-colors ${pref === v ? 'border-[var(--ink)] bg-[var(--paper-2)]' : 'border-[var(--hair)] hover:border-[var(--ink-3)]'}`}
              >
                <Icon size={16} />
                <span className="text-[13px]">{label}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rise" style={{ animationDelay: '180ms' }}>
          <h2 className="font-display text-[30px] leading-none">Account</h2>
          <dl className="mt-4 border-t border-[var(--ink)] text-[13.5px]">
            {[
              ['Signed in as', user?.name],
              ['Mobile', user?.phone],
              ['Role', user?.role],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-[var(--hair)] py-3">
                <dt className="text-[var(--ink-3)]">{k}</dt>
                <dd className="figure">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 rounded-xl border border-dashed border-[var(--hair)] p-4">
            <p className="text-[13px] text-[var(--ink-2)]">Demo data lives in this browser only. Reset it to the original sample ledger.</p>
            <Button size="sm" variant="line" className="mt-3" icon={<RotateCcw size={13} />} onClick={() => setResetting(true)}>
              Reset demo data
            </Button>
          </div>
        </section>
      </div>

      <ConfirmDialog
        open={resetting}
        title="Reset demo data?"
        message="Every change you've made in this browser — farmers, weigh-ins, settlements, rates — will be replaced with the sample ledger."
        confirmLabel="Reset"
        danger
        onClose={() => setResetting(false)}
        onConfirm={() => {
          L.reset()
          notify('Demo ledger restored', 'info')
        }}
      />
    </>
  )
}
