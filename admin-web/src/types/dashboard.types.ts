import type { Farmer } from './farmer.types';
import type { SettlementSummary } from './settlement.types';
import type { TeaCollector, CollectorFormData, CollectorStatus } from './collector.types';

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

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message?: string;
}

export interface DashboardContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Data
  slips: IntakeSlip[];
  requests: UrgentCollectionRequest[];
  farmers: Farmer[];
  collectors: TeaCollector[];
  settlement: SettlementSummary;
  stationStatus: WeighbridgeStationStatus;
  isScaleSyncing: boolean;
  
  // Actions
  addSlip: (slip: Omit<IntakeSlip, 'id' | 'timestamp' | 'status'> & { status?: IntakeSlip['status'] }) => void;
  verifySlip: (id: string) => void;
  reviewSlip: (id: string, newTareKg: number, newRate?: number) => void;
  addFarmer: (farmer: Omit<Farmer, 'id' | 'status' | 'joinedDate' | 'totalDeliveredKgMonth'>) => void;
  addCollector: (collector: CollectorFormData) => void;
  updateCollectorStatus: (id: string, status: CollectorStatus) => void;
  assignCollectorToRequest: (requestId: string, collector: string) => void;
  triggerScaleSync: () => void;

  // Modals
  isRecordModalOpen: boolean;
  setIsRecordModalOpen: (open: boolean) => void;
  isAddFarmerModalOpen: boolean;
  setIsAddFarmerModalOpen: (open: boolean) => void;
  isAddCollectorModalOpen: boolean;
  setIsAddCollectorModalOpen: (open: boolean) => void;
  isSettlementModalOpen: boolean;
  setIsSettlementModalOpen: (open: boolean) => void;
  isNotificationModalOpen: boolean;
  setIsNotificationModalOpen: (open: boolean) => void;
  isAuditModalOpen: boolean;
  setIsAuditModalOpen: (open: boolean) => void;
  selectedSlipForReview: IntakeSlip | null;
  setSelectedSlipForReview: (slip: IntakeSlip | null) => void;
  selectedSlipForPrint: IntakeSlip | null;
  setSelectedSlipForPrint: (slip: IntakeSlip | null) => void;
  selectedCollectorForDetail: TeaCollector | null;
  setSelectedCollectorForDetail: (collector: TeaCollector | null) => void;

  // Toasts
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
}
