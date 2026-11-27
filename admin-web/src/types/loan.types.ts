export type LoanRecordStatus = 'Active' | 'Overdue' | 'Repaid' | 'Closed' | 'Cancelled';

export interface LoanRepaymentItem {
  id: string;
  amount: number;
  paidAt: string;
}

export interface AdminLoanRecord {
  id: string;
  loanCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode?: string;
  collectorId?: string;
  principalAmount: number;
  totalRepaid: number;
  outstandingBalance: number;
  nextRepaymentLabel: string;
  issuedAtIso: string;
  status: LoanRecordStatus;
  notes?: string;
}

export interface BackendLoanDto {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  collectorId: string;
  principalAmount: number;
  totalRepaid: number;
  outstandingBalance: number;
  issuedAt: string;
  status: string | number;
  notes?: string | null;
  createdAt: string;
  repayments?: LoanRepaymentItem[];
}

export interface CreateLoanPayload {
  farmerId: string;
  farmerName: string;
  principalAmount: number;
  issuedAt?: string;
  notes?: string;
}

export interface LoansOverviewResponse {
  items: AdminLoanRecord[];
  activeLoansCount: number;
  totalFarmersCount: number;
  outstandingTotalLkr: number;
  outstandingFormatted: string;
  repaidThisMonthLkr: number;
  repaidThisMonthFormatted: string;
  asOfLabel: string;
  totalCount: number;
}
