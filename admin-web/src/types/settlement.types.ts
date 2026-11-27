export interface SettlementSummary {
  period: string;
  totalGrossValue: number;
  netFarmerPayout: number;
  fertilizerDeduction: number;
  cashLoansDeduction: number;
  teaPacketsDeduction: number;
  factoryGrossMarginPercentage: number;
  disbursalDate: string;
  disbursalStatus: 'Pending' | 'Ready' | 'Processed';
  bankPartner: string;
  unresolvedClaimsCount: number;
  unresolvedClaimsAmount: number;
}

export type BackendSettlementStatus = 1 | 2 | 3 | 'Draft' | 'Paid' | 'Cancelled';

export interface BackendSettlementDeductionBreakdownDto {
  category: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface BackendSettlementDto {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  year: number;
  month: number;
  periodStart: string;
  periodEnd: string;
  grossTeaIncome: number;
  totalTeaQuantityKg: number;
  averageTeaPricePerKg: number;
  materialDeductions: number;
  totalDeductionQuantityKg: number;
  deductionBreakdown: BackendSettlementDeductionBreakdownDto[];
  loanRepayments: number;
  remainingLoanBalance: number;
  netSettlementAmount: number;
  status: BackendSettlementStatus;
  createdAt: string;
  paidAt: string | null;
}

export interface CreateSettlementPayload {
  farmerId: string;
  year: number;
  month: number;
  loanRepaymentAmount: number;
}

export type MonthlyPeriodSettlementStatus = 'Draft' | 'Finalized';

export interface MonthlySettlementPeriodRow {
  id: string;
  year: number;
  month: number;
  periodLabel: string;
  farmersCount: number;
  verifiedKg: number;
  grossLkr: number;
  netPayableLkr: number;
  finalizedOnLabel: string;
  status: MonthlyPeriodSettlementStatus;
  settlementIds: string[];
  draftSettlementIds: string[];
}

export interface SettlementHistoryResponse {
  items: MonthlySettlementPeriodRow[];
  totalCount: number;
  rawSettlements: BackendSettlementDto[];
}


