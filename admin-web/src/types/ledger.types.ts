export type CollectionStatus = 'Pending' | 'Verified' | 'Settled' | 'Disputed'
export type SettlementStatus = 'Draft' | 'Approved' | 'Paid'

export interface Collector {
  id: string
  code: string
  name: string
  phone: string
  area: string
  active: boolean
  joinedAt: string
}

export interface Farmer {
  id: string
  code: string
  name: string
  phone: string
  address: string
  landSize: number
  collectorId: string
  active: boolean
  joinedAt: string
}

export interface Collection {
  id: string
  ref: string
  farmerId: string
  collectorId: string
  collectedAt: string
  gross: number
  water: number
  bag: number
  other: number
  final: number
  pricePerKg: number
  amount: number
  status: CollectionStatus
}

export interface Settlement {
  id: string
  ref: string
  farmerId: string
  period: string // YYYY-MM
  kg: number
  averageTeaPricePerKg: number
  grossAmount: number
  deductions: number
  totalDeductionQuantityKg: number
  deductionBreakdown: SettlementDeduction[]
  loanRepayments: number
  net: number
  status: SettlementStatus
  createdAt: string
}

export interface SettlementDeduction {
  category: string
  quantity: number
  unit: string
  unitPrice: number
  amount: number
}

export interface TeaPrice {
  period: string
  pricePerKg: number
}

export interface Activity {
  id: string
  at: string
  actor: string
  action: string
  detail: string
}

export interface LedgerState {
  collectors: Collector[]
  farmers: Farmer[]
  collections: Collection[]
  settlements: Settlement[]
  prices: TeaPrice[]
  activity: Activity[]
  dailyTargetKg: number
}
