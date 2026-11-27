export type TeaPriceStatus = 'Scheduled' | 'Current' | 'Past';

export interface TeaPriceRecord {
  id: string;
  collectorId?: string;
  year: number;
  month: number;
  effectiveFromIso: string;
  effectiveFromLabel: string;
  pricePerKg: number;
  setBy: string;
  changedOnLabel: string;
  status: TeaPriceStatus;
  appliesTo: string;
}

export interface BackendTeaPriceDto {
  id: string;
  collectorId: string;
  year: number;
  month: number;
  pricePerKg: number;
  effectiveFrom: string;
  createdAt: string;
  updatedAt: string;
}

export interface SetMonthlyTeaPricePayload {
  year: number;
  month: number;
  pricePerKg: number;
  effectiveFrom: string;
}
