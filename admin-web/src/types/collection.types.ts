export type CollectionRecordStatus = 'Verified' | 'Pending sync' | 'Needs review';

export interface ServerRecalculation {
  grossKg: number;
  reductionsKg: number;
  finalKg: number;
  discrepancyKg: number;
}

export interface TeaCollectionRecord {
  id: string;
  slipId: string;
  dateLabel: string;
  collectedAtIso: string;
  farmerId?: string;
  farmerName: string;
  farmerCode?: string;
  collectorId?: string;
  collectorName: string;
  grossKg: number;
  reductionsKg: number;
  finalKg: number;
  waterReductionKg?: number;
  bagWeightKg?: number;
  otherReductionKg?: number;
  pricePerKg?: number;
  totalAmountLkr?: number;
  status: CollectionRecordStatus;
  serverReview?: ServerRecalculation;
}

export type BackendCollectionStatus = 'Pending' | 'Collected' | 'Cancelled' | 'Synced' | number;

export interface BackendCollectionDto {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerCode: string;
  requestId: string;
  collectorId: string | null;
  collectorName?: string;
  grossWeight: number;
  waterReduction: number;
  bagWeight: number;
  otherReduction: number;
  finalWeight: number;
  pricePerKg: number;
  totalAmount: number;
  status: BackendCollectionStatus;
  collectedAt: string;
}

export interface CollectionQueryFilters {
  search?: string;
  status?: CollectionRecordStatus | 'All';
  from?: string;
  to?: string;
  farmerId?: string;
  page?: number;
  pageSize?: number;
}

export interface CollectionListResponse {
  items: TeaCollectionRecord[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface VerifyWeightPayload {
  grossWeight: number;
  waterReduction: number;
  bagWeight: number;
  otherReduction: number;
}
