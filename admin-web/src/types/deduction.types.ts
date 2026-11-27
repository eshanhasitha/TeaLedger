export type DeductionStatus = 'Posted' | 'Reversed';

export type DeductionFilterCategory = 'All' | 'Materials' | 'Loan repayment' | 'Other';

export interface AdminDeductionRecord {
  id: string;
  deductionCode: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  collectorId: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  occurredAtIso: string;
  occurredAtLabel: string;
  postedBy: string;
  status: DeductionStatus;
  notes?: string;
}

export interface BackendDeductionDto {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  collectorId: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  occurredAt: string;
  notes?: string | null;
  createdAt: string;
}

export interface CreateDeductionPayload {
  farmerId: string;
  farmerName: string;
  categoryLabel: string;
  amount: number;
  occurredAt: string;
  referenceCode?: string;
  reason?: string;
  postedBy: string;
}

export interface DeductionListResponse {
  items: AdminDeductionRecord[];
  totalCount: number;
}

export interface DeductionCategorySummaryItem {
  category: string;
  count: number;
  totalAmount: number;
}

export interface DeductionSummaryData {
  from: string;
  to: string;
  deductionCount: number;
  totalAmount: number;
  categories: DeductionCategorySummaryItem[];
}
