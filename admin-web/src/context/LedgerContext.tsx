import { createContext, useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { basePrice, buildSeed, buildSettlements, uid } from '../data/mock'
import type {
  Collection, CollectionStatus, Collector, Farmer, LedgerState, SettlementStatus,
} from '../types/ledger.types'
import { STORAGE_KEY } from '../utils/constants'
import { periodOf } from '../utils/formatDate'
import { round2 } from '../utils/formatNumber'

export type NewCollection = Pick<Collection, 'farmerId' | 'gross' | 'water' | 'bag' | 'other'> & { collectedAt?: string }

export interface LedgerApi extends LedgerState {
  farmerById: Map<string, Farmer>
  collectorById: Map<string, Collector>
  priceFor: (period: string) => number
  addFarmer: (f: Omit<Farmer, 'id' | 'code' | 'joinedAt' | 'active'>) => Farmer
  updateFarmer: (id: string, patch: Partial<Farmer>) => void
  deleteFarmer: (id: string) => void
  addCollector: (c: Omit<Collector, 'id' | 'code' | 'joinedAt' | 'active'>) => Collector
  updateCollector: (id: string, patch: Partial<Collector>) => void
  addCollection: (c: NewCollection) => Collection
  setCollectionStatus: (ids: string[], status: CollectionStatus) => void
  deleteCollection: (id: string) => void
  generateSettlements: (period: string) => number
  setSettlementStatus: (ids: string[], status: SettlementStatus) => void
  setPrice: (period: string, price: number) => void
  setDailyTarget: (kg: number) => void
  reset: () => void
}

// eslint-disable-next-line react-refresh/only-export-components
export const LedgerContext = createContext<LedgerApi | null>(null)

function load(): LedgerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LedgerState
  } catch {
    /* storage unavailable – fall through to seed */
  }
  return buildSeed()
}

const withLog = (s: LedgerState, action: string, detail: string): LedgerState => ({
  ...s,
  activity: [{ id: uid(), at: new Date().toISOString(), actor: 'Admin', action, detail }, ...s.activity].slice(0, 300),
})

export function LedgerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LedgerState>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      /* ignore quota / privacy mode */
    }
  }, [state])

  const priceFor = useCallback(
    (period: string) => state.prices.find((p) => p.period === period)?.pricePerKg ?? basePrice(period),
    [state.prices],
  )

  const api = useMemo<LedgerApi>(() => {
    const farmerById = new Map(state.farmers.map((f) => [f.id, f]))
    const collectorById = new Map(state.collectors.map((c) => [c.id, c]))

    return {
      ...state,
      farmerById,
      collectorById,
      priceFor,
      addFarmer: (f) => {
        const max = Math.max(1000, ...state.farmers.map((x) => Number(x.code.split('-')[1]) || 0))
        const farmer: Farmer = { ...f, id: uid(), code: `FRM-${max + 1}`, joinedAt: new Date().toISOString(), active: true }
        setState((s) => withLog({ ...s, farmers: [farmer, ...s.farmers] }, 'Farmer', `Registered ${farmer.name} (${farmer.code})`))
        return farmer
      },
      updateFarmer: (id, patch) =>
        setState((s) => {
          const f = s.farmers.find((x) => x.id === id)
          const suffix = patch.active === undefined ? '' : patch.active ? ' — reactivated' : ' — deactivated'
          return withLog({ ...s, farmers: s.farmers.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, 'Farmer', `Updated ${f?.name ?? id}${suffix}`)
        }),
      deleteFarmer: (id) =>
        setState((s) => {
          const f = s.farmers.find((x) => x.id === id)
          return withLog({ ...s, farmers: s.farmers.filter((x) => x.id !== id) }, 'Farmer', `Removed ${f?.name ?? id}`)
        }),
      addCollector: (c) => {
        const collector: Collector = {
          ...c,
          id: uid(),
          code: `COL-${String(state.collectors.length + 1).padStart(3, '0')}`,
          joinedAt: new Date().toISOString(),
          active: true,
        }
        setState((s) => withLog({ ...s, collectors: [...s.collectors, collector] }, 'Collector', `Added ${collector.name} for ${collector.area}`))
        return collector
      },
      updateCollector: (id, patch) =>
        setState((s) => {
          const c = s.collectors.find((x) => x.id === id)
          return withLog({ ...s, collectors: s.collectors.map((x) => (x.id === id ? { ...x, ...patch } : x)) }, 'Collector', `Updated ${c?.name ?? id}`)
        }),
      addCollection: (c) => {
        const at = c.collectedAt ?? new Date().toISOString()
        const farmer = farmerById.get(c.farmerId)!
        const final = round2(Math.max(0, c.gross - c.water - c.bag - c.other))
        const pricePerKg = priceFor(periodOf(at))
        const maxRef = Math.max(0, ...state.collections.map((x) => Number(x.ref.slice(3)) || 0))
        const entry: Collection = {
          id: uid(),
          ref: `TL-${maxRef + 1}`,
          farmerId: c.farmerId,
          collectorId: farmer.collectorId,
          collectedAt: at,
          gross: c.gross,
          water: c.water,
          bag: c.bag,
          other: c.other,
          final,
          pricePerKg,
          amount: round2(final * pricePerKg),
          status: 'Pending',
        }
        setState((s) => withLog({ ...s, collections: [...s.collections, entry] }, 'Collection', `${entry.ref} · ${final} kg from ${farmer.name}`))
        return entry
      },
      setCollectionStatus: (ids, status) =>
        setState((s) =>
          withLog(
            { ...s, collections: s.collections.map((x) => (ids.includes(x.id) ? { ...x, status } : x)) },
            'Collection',
            `Marked ${ids.length} ${ids.length === 1 ? 'entry' : 'entries'} ${status.toLowerCase()}`,
          ),
        ),
      deleteCollection: (id) =>
        setState((s) => {
          const c = s.collections.find((x) => x.id === id)
          return withLog({ ...s, collections: s.collections.filter((x) => x.id !== id) }, 'Collection', `Voided ${c?.ref ?? id}`)
        }),
      generateSettlements: (period) => {
        const existing = new Set(state.settlements.filter((x) => x.period === period).map((x) => x.farmerId))
        const fresh = buildSettlements(state.collections, state.farmers, period).filter((x) => !existing.has(x.farmerId))
        if (fresh.length) {
          setState((s) => withLog({ ...s, settlements: [...fresh, ...s.settlements] }, 'Settlement', `Drafted ${fresh.length} settlements for ${period}`))
        }
        return fresh.length
      },
      setSettlementStatus: (ids, status) =>
        setState((s) => {
          const next = { ...s, settlements: s.settlements.map((x) => (ids.includes(x.id) ? { ...x, status } : x)) }
          if (status === 'Paid') {
            const keys = new Set(s.settlements.filter((x) => ids.includes(x.id)).map((p) => `${p.farmerId}|${p.period}`))
            next.collections = s.collections.map((c) =>
              keys.has(`${c.farmerId}|${periodOf(c.collectedAt)}`) && c.status === 'Verified' ? { ...c, status: 'Settled' } : c,
            )
          }
          return withLog(next, 'Settlement', `Marked ${ids.length} ${status.toLowerCase()}`)
        }),
      setPrice: (period, price) =>
        setState((s) =>
          withLog(
            {
              ...s,
              prices: [...s.prices.filter((p) => p.period !== period), { period, pricePerKg: price }].sort((a, b) =>
                a.period.localeCompare(b.period),
              ),
            },
            'Tea price',
            `Rs ${price}/kg for ${period}`,
          ),
        ),
      setDailyTarget: (kg) => setState((s) => withLog({ ...s, dailyTargetKg: kg }, 'Settings', `Daily target set to ${kg} kg`)),
      reset: () => setState(buildSeed()),
    }
  }, [state, priceFor])

  return <LedgerContext.Provider value={api}>{children}</LedgerContext.Provider>
}
