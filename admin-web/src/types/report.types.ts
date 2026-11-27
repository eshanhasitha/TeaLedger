export type ReportExportFormat = 'CSV' | 'PDF' | 'Excel';

export type ReportPeriodOption =
  | 'October 2026'
  | 'September 2026'
  | 'August 2026'
  | 'All dates';

export type ReportAreaOption =
  | 'All areas'
  | 'North zone'
  | 'South zone'
  | 'Central hill';

export type ReportCardType =
  | 'collections'
  | 'farmer-statement'
  | 'settlement'
  | 'loan-outstanding';

export type ReportExportStatus = 'Ready' | 'Generating' | 'Failed';

export interface ReportExportRecord {
  id: string;
  reportName: string;
  periodLabel: string;
  areaLabel: string;
  format: ReportExportFormat;
  generatedLabel: string;
  status: ReportExportStatus;
  reportType: ReportCardType;
  csvContent?: string;
}

export interface BackendPagedReport<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface BackendCollectionReportRow {
  collectionId: string;
  farmerId: string;
  farmerName: string;
  collectorId: string | null;
  collectorName: string | null;
  grossWeight: number;
  finalWeight: number;
  pricePerKg: number;
  totalAmount: number;
  status: string;
  collectedAt: string;
}

export interface BackendEarningsReportRow {
  ledgerEntryId: string;
  farmerId: string;
  farmerName: string;
  amount: number;
  description: string;
  reference: string | null;
  occurredAt: string;
}

export interface BackendDeductionReportRow {
  deductionId: string;
  farmerId: string;
  farmerName: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  amount: number;
  occurredAt: string;
}
