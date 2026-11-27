export type FarmerStatus = 'Active' | 'Inactive' | 'Suspended';

export interface Farmer {
  id: string;
  code: string;
  name: string;
  division: string;
  area?: string; // e.g. "Block 03"
  collectorName?: string;
  lastCollectionDate?: string;
  advanceLkr?: number;
  phone?: string;
  nic?: string;
  teaLandAcreage?: number;
  bankName?: string;
  accountNumber?: string;
  status: FarmerStatus;
  joinedDate?: string;
  totalDeliveredKgMonth?: number;
}

export interface FarmerFilters {
  search?: string;
  status?: FarmerStatus | 'All';
  page?: number;
  pageSize?: number;
}

export interface FarmerListResponse {
  items: Farmer[];
  total: number;
  page: number;
  pageSize: number;
}
