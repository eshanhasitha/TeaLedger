export interface MetricCardData {
  id: string;
  title: string;
  value: string;
  unit?: string;
  badge?: string;
  badgeType?: 'success' | 'warning' | 'info' | 'danger';
  trend?: {
    value: string;
    isPositive: boolean;
  };
  subtext?: string;
  highlighted?: boolean;
}

export interface DailyLeafDataPoint {
  date: string;
  grossIntake: number;
  netUsable: number;
  isPeak?: boolean;
}

export interface IntakeSlip {
  id: string;
  farmerName: string;
  farmerCode: string;
  division: string;
  collectorId: string;
  collectorName: string;
  grossKg: number;
  tareKg: number;
  netKg: number;
  ratePerKg: number;
  totalPayable: number;
  status: 'Verified' | 'Flagged Wt' | 'Pending';
  timestamp: string;
  weighbridgeId?: string;
  moisturePercentage?: number;
}

export interface UrgentCollectionRequest {
  id: string;
  sector: string;
  postOrShed: string;
  farmerName: string;
  farmerCode: string;
  bagsCount: number;
  estimatedKg: number;
  assignedCollector?: string;
  status: 'En Route' | 'Pending' | 'Accepted' | 'Completed';
  createdAt: string;
}

export interface WeighbridgeStationStatus {
  id: string;
  name: string;
  capacityPercentage: number;
  dehumidifierStatus: 'Run' | 'Standby' | 'Off';
  optimalTemp: string;
  activeBatch?: {
    batchNumber: string;
    driverName: string;
    grossWeightTons: number;
    status: 'Weighing' | 'Discharging' | 'Verified';
  };
}

