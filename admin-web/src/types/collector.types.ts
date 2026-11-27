export type CollectorStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended';

export type CollectorSyncStatus = 'Synced' | 'Pending' | 'Failed' | 'No data';

export interface TeaCollector {
  id: string;
  collectorCode?: string;
  fullName: string;
  nicNumber: string;
  phoneNumber: string;
  email: string;
  assignedRoute: string;
  assignedDivision: string;
  address?: string;
  activeFarmersCount: number;
  todayIntakeKg: number;
  status: CollectorStatus;
  syncStatus?: CollectorSyncStatus;
  pendingSyncCount?: number;
  failedSyncCount?: number;
  registeredDate: string;
  vehicleNumber: string;
  scaleDeviceId: string;
  batteryLevel?: number;
  scaleStatus?: 'Online' | 'Offline' | 'Calibrating';
}

export interface BackendCollectorDto {
  id: string;
  userId: string;
  collectorCode: string;
  fullName: string;
  phoneNumber: string;
  address: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface BackendCollectorPagedResponse {
  items: BackendCollectorDto[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface CreateCollectorApiPayload {
  fullName: string;
  phoneNumber: string;
  password: string;
  address?: string;
  area?: string;
}

export interface UpdateCollectorApiPayload {
  fullName: string;
  phoneNumber: string;
  address?: string;
  area?: string;
}

export interface CollectorQueryFilters {
  search?: string;
  status?: CollectorStatus | 'All';
  area?: string;
  page?: number;
  pageSize?: number;
}

export interface CollectorListResponse {
  items: TeaCollector[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CollectorFilters {
  searchQuery: string;
  status: CollectorStatus | 'All';
  division: string;
}

export interface CollectorStats {
  totalCollectors: number;
  activeToday: number;
  todayIntakeKg: number;
  onLeave: number;
}

export interface CollectorFormData {
  fullName: string;
  nicNumber: string;
  phoneNumber: string;
  email: string;
  assignedRoute: string;
  assignedDivision: string;
  vehicleNumber: string;
  scaleDeviceId: string;
  status: CollectorStatus;
}

export interface AssignedSmallholder {
  code: string;
  name: string;
  division: string;
  acreage: number;
  estDailyKg: number;
  lastCollectionTime?: string;
  phone: string;
}

export interface RecentScaleLog {
  id: string;
  slipId: string;
  timestamp: string;
  farmerName: string;
  farmerCode: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  status: 'Verified' | 'Flagged Wt' | 'Pending';
}

export interface CollectorRoutePerformance {
  monthlyIntakeTons: number;
  onTimeIntakeRate: number;
  routeCoveragePercentage: number;
  fuelEfficiencyKmPerL: number;
}
