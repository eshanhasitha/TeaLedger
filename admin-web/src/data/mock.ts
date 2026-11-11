import type { Collection, Collector, Farmer, LedgerState, Settlement, TeaPrice } from '../types/ledger.types'
import { periodOf, toISODate } from '../utils/formatDate'
import { round2 } from '../utils/formatNumber'

// Deterministic PRNG so the demo ledger looks the same on every fresh load.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)

const FIRST = ['Nimal', 'Kamala', 'Sunil', 'Chandrika', 'Ruwan', 'Malini', 'Ajith', 'Dilani', 'Saman', 'Nadeesha',
  'Pradeep', 'Anoma', 'Lalith', 'Shanthi', 'Kasun', 'Iresha', 'Mahinda', 'Thushari', 'Gamini', 'Rasika',
  'Chaminda', 'Sriyani', 'Upul', 'Priyanka', 'Janaka', 'Wasana', 'Rohan', 'Kumari', 'Asanka', 'Menaka']
const LAST = ['Perera', 'Fernando', 'Silva', 'Jayasuriya', 'Bandara', 'Wickramasinghe', 'Rathnayake', 'Herath',
  'Dissanayake', 'Kumara', 'Gunawardena', 'Senanayake', 'Wijesinghe', 'Ekanayake', 'Karunaratne']
const AREAS = ['Deniyaya', 'Morawaka', 'Kotapola', 'Rakwana', 'Neluwa', 'Pitabeddara']
const VILLAGES = ['Ensalwatta', 'Kiriweldola', 'Pallegama', 'Udugama', 'Batadura', 'Siyambalagoda', 'Mederipitiya',
  'Viharahena', 'Kalubowitiyana', 'Horagala']

export function basePrice(period: string) {
  const [, m] = period.split('-').map(Number)
  return 205 + ((m * 7) % 18)
}

export function buildSeed(): LedgerState {
  const r = mulberry32(20261105)
  const pick = <T,>(a: T[]) => a[Math.floor(r() * a.length)]
  const phone = () => `07${Math.floor(r() * 9)} ${String(Math.floor(r() * 9000000) + 1000000).replace(/(\d{3})(\d{4})/, '$1 $2')}`
  const now = new Date()
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000)

  const collectors: Collector[] = AREAS.map((area, i) => ({
    id: `c${i + 1}`,
    code: `COL-${String(i + 1).padStart(3, '0')}`,
    name: `${pick(FIRST)} ${pick(LAST)}`,
    phone: phone(),
    area,
    active: i !== 5,
    joinedAt: daysAgo(400 + i * 37).toISOString(),
  }))

  const farmers: Farmer[] = Array.from({ length: 42 }, (_, i) => {
    const col = collectors[i % 5]
    return {
      id: `f${i + 1}`,
      code: `FRM-${String(1001 + i)}`,
      name: `${pick(FIRST)} ${pick(LAST)}`,
      phone: phone(),
      address: `${Math.floor(r() * 180) + 1}, ${pick(VILLAGES)}, ${col.area}`,
      landSize: round2(0.5 + r() * 4.5),
      collectorId: col.id,
      active: r() > 0.08,
      joinedAt: daysAgo(60 + Math.floor(r() * 900)).toISOString(),
    }
  })

  const collections: Collection[] = []
  let refN = 48120
  for (let d = 44; d >= 0; d--) {
    const day = daysAgo(d)
    if (day.getDay() === 0) continue // no plucking on Sundays
    for (const f of farmers) {
      if (!f.active || r() < (d === 0 ? 0.45 : 0.3)) continue
      const gross = round2(f.landSize * (5 + r() * 9))
      const water = round2(gross * (0.02 + r() * 0.05))
      const bag = 0.4
      const other = r() < 0.15 ? round2(r() * 1.2) : 0
      const final = round2(Math.max(0, gross - water - bag - other))
      const period = periodOf(toISODate(day))
      const pricePerKg = basePrice(period)
      const at = new Date(day)
      at.setHours(6 + Math.floor(r() * 9), Math.floor(r() * 60))
      if (at > now) at.setTime(now.getTime() - Math.floor(r() * 5 * 3600000)) // nothing collected in the future
      const status: Collection['status'] =
        d > 30 ? 'Settled' : d > 2 ? (r() < 0.008 ? 'Disputed' : 'Verified') : r() < 0.6 ? 'Pending' : 'Verified'
      collections.push({
        id: uid() + collections.length,
        ref: `TL-${refN++}`,
        farmerId: f.id,
        collectorId: f.collectorId,
        collectedAt: at.toISOString(),
        gross,
        water,
        bag,
        other,
        final,
        pricePerKg,
        amount: round2(final * pricePerKg),
        status,
      })
    }
  }

  const prices: TeaPrice[] = []
  for (let i = 3; i >= 0; i--) {
    const p = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const period = periodOf(toISODate(p))
    prices.push({ period, pricePerKg: basePrice(period) })
  }

  // settlements for last month
  const lastPeriod = periodOf(toISODate(new Date(now.getFullYear(), now.getMonth() - 1, 1)))
  const settlements: Settlement[] = buildSettlements(collections, farmers, lastPeriod, 7710).map((s, i) => ({
    ...s,
    status: i % 4 === 0 ? 'Approved' : 'Paid',
  }))

  return {
    collectors,
    farmers,
    collections,
    settlements,
    prices,
    dailyTargetKg: 900,
    activity: [
      { id: uid(), at: daysAgo(0.02).toISOString(), actor: 'System', action: 'Sync', detail: 'Mobile collections synced from 5 collectors' },
      { id: uid(), at: daysAgo(1.1).toISOString(), actor: 'Admin', action: 'Settlement', detail: `Approved ${settlements.length} settlements for ${lastPeriod}` },
      { id: uid(), at: daysAgo(3.4).toISOString(), actor: 'Admin', action: 'Tea price', detail: `Set price for ${prices[prices.length - 1].period}` },
    ],
  }
}

export function buildSettlements(
  collections: Collection[],
  farmers: Farmer[],
  period: string,
  startRef = Date.now() % 10000,
): Settlement[] {
  const byFarmer = new Map<string, { kg: number; amt: number }>()
  for (const c of collections) {
    if (periodOf(c.collectedAt) !== period || c.status === 'Disputed' || c.status === 'Pending') continue
    const e = byFarmer.get(c.farmerId) ?? { kg: 0, amt: 0 }
    e.kg += c.final
    e.amt += c.amount
    byFarmer.set(c.farmerId, e)
  }
  let n = startRef
  return farmers
    .filter((f) => byFarmer.has(f.id))
    .map((f) => {
      const e = byFarmer.get(f.id)!
      const transportDeduction = round2(e.kg * 3)
      const fertilizerAdvance = Number(f.id.slice(1)) % 3 === 0 ? 1500 : 0
      const loanRepayments = Number(f.id.slice(1)) % 4 === 0 ? 500 : 0
      const deductionBreakdown = [
        {
          category: 'Transport',
          quantity: round2(e.kg),
          unit: 'kg',
          unitPrice: 3,
          amount: transportDeduction,
        },
        ...(fertilizerAdvance > 0
          ? [{
              category: 'Fertilizer',
              quantity: 1,
              unit: 'item',
              unitPrice: fertilizerAdvance,
              amount: fertilizerAdvance,
            }]
          : []),
      ]
      const deductions = round2(transportDeduction + fertilizerAdvance)
      const totalDeductionQuantityKg = deductionBreakdown
        .filter((deduction) => ['kg', 'kgs', 'kilogram', 'kilograms'].includes(deduction.unit.toLowerCase()))
        .reduce((total, deduction) => total + deduction.quantity, 0)
      return {
        id: uid() + f.id,
        ref: `ST-${period.replace('-', '')}-${n++}`,
        farmerId: f.id,
        period,
        kg: round2(e.kg),
        averageTeaPricePerKg: e.kg > 0 ? round2(e.amt / e.kg) : 0,
        grossAmount: round2(e.amt),
        deductions,
        totalDeductionQuantityKg,
        deductionBreakdown,
        loanRepayments,
        net: round2(e.amt - deductions - loanRepayments),
        status: 'Draft' as const,
        createdAt: new Date().toISOString(),
      }
    })
}
