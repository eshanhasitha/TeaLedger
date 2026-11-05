export type CollectorStatus = 'Active' | 'Inactive' | 'On Leave' | 'Suspended';

export interface TeaCollector {
  id: string;
  fullName: string;
  nicNumber: string;
  phoneNumber: string;
  email: string;
  assignedRoute: string;
  assignedDivision: string;
  activeFarmersCount: number;
  todayIntakeKg: number;
  status: CollectorStatus;
  registeredDate: string;
  vehicleNumber: string;
  scaleDeviceId: string;
  batteryLevel?: number;
  scaleStatus?: 'Online' | 'Offline' | 'Calibrating';
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
