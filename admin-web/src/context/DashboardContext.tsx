/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import type {
  IntakeSlip,
  UrgentCollectionRequest,
  WeighbridgeStationStatus,
  ToastMessage,
  DashboardContextType,
} from '../types/dashboard.types';
import type { Farmer } from '../types/farmer.types';
import type { SettlementSummary } from '../types/settlement.types';
import type { TeaCollector, CollectorFormData, CollectorStatus } from '../types/collector.types';
import {
  INITIAL_SLIPS,
  INITIAL_REQUESTS,
  INITIAL_FARMERS,
  INITIAL_COLLECTORS,
  SETTLEMENT_SUMMARY,
  WEIGHBRIDGE_STATUS,
} from '../services/mockData';

export const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [slips, setSlips] = useState<IntakeSlip[]>(INITIAL_SLIPS);
  const [requests, setRequests] = useState<UrgentCollectionRequest[]>(INITIAL_REQUESTS);
  const [farmers, setFarmers] = useState<Farmer[]>(INITIAL_FARMERS);
  const [collectors, setCollectors] = useState<TeaCollector[]>(INITIAL_COLLECTORS);
  const [settlement] = useState<SettlementSummary>(SETTLEMENT_SUMMARY);
  const [stationStatus] = useState<WeighbridgeStationStatus>(WEIGHBRIDGE_STATUS);
  const [isScaleSyncing, setIsScaleSyncing] = useState<boolean>(false);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isAddFarmerModalOpen, setIsAddFarmerModalOpen] = useState(false);
  const [isAddCollectorModalOpen, setIsAddCollectorModalOpen] = useState(false);
  const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [selectedSlipForReview, setSelectedSlipForReview] = useState<IntakeSlip | null>(null);
  const [selectedSlipForPrint, setSelectedSlipForPrint] = useState<IntakeSlip | null>(null);
  const [selectedCollectorForDetail, setSelectedCollectorForDetail] = useState<TeaCollector | null>(null);

  // Toast state
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastIdRef = useRef(0);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    toastIdRef.current += 1;
    const id = `toast-${toastIdRef.current}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const addSlip = (slipData: Omit<IntakeSlip, 'id' | 'timestamp' | 'status'> & { status?: IntakeSlip['status'] }) => {
    const nextSlipNumber = 8921 + slips.length - INITIAL_SLIPS.length + 1;
    const newId = `SLIP-${nextSlipNumber}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSlip: IntakeSlip = {
      ...slipData,
      id: newId,
      timestamp: timeStr,
      status: slipData.status || 'Verified',
      weighbridgeId: slipData.weighbridgeId || 'WB-01',
      moisturePercentage: slipData.moisturePercentage || 11.2,
    };

    setSlips((prev) => [newSlip, ...prev]);
    addToast({
      type: 'success',
      title: `Intake Slip ${newId} Created`,
      message: `${newSlip.farmerName} - ${newSlip.netKg} kg (LKR ${newSlip.totalPayable.toLocaleString()}) logged successfully.`,
    });
  };

  const verifySlip = (id: string) => {
    setSlips((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'Verified' as const } : s))
    );
    addToast({
      type: 'success',
      title: 'Weight Verified',
      message: `Intake slip ${id} has been verified and passed to factory batch intake.`,
    });
  };

  const reviewSlip = (id: string, newTareKg: number, newRate = 250.0) => {
    setSlips((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const netKg = Number((s.grossKg - Math.abs(newTareKg)).toFixed(1));
          const totalPayable = Number((netKg * newRate).toFixed(2));
          return {
            ...s,
            tareKg: -Math.abs(newTareKg),
            netKg,
            ratePerKg: newRate,
            totalPayable,
            status: 'Verified' as const,
          };
        }
        return s;
      })
    );
    setSelectedSlipForReview(null);
    addToast({
      type: 'info',
      title: 'Weight Deduction Adjusted',
      message: `Slip ${id} revised and marked as Verified.`,
    });
  };

  const addFarmer = (farmerData: Omit<Farmer, 'id' | 'status' | 'joinedDate' | 'totalDeliveredKgMonth'>) => {
    const newFarmer: Farmer = {
      ...farmerData,
      id: `f-${Date.now()}`,
      status: 'Active',
      joinedDate: new Date().toISOString().split('T')[0],
      totalDeliveredKgMonth: 0,
    };
    setFarmers((prev) => [newFarmer, ...prev]);
    addToast({
      type: 'success',
      title: 'New Grower Registered',
      message: `${newFarmer.name} (${newFarmer.code}) enrolled under ${newFarmer.division}.`,
    });
  };

  const addCollector = (collectorData: CollectorFormData) => {
    const nextNumber = 400 + collectors.length + 1;
    const newCollector: TeaCollector = {
      id: `COL-${nextNumber}`,
      ...collectorData,
      activeFarmersCount: 0,
      todayIntakeKg: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      batteryLevel: 100,
      scaleStatus: collectorData.status === 'Active' ? 'Online' : 'Offline',
    };

    setCollectors((prev) => [newCollector, ...prev]);
    addToast({
      type: 'success',
      title: 'Collector Registered',
      message: `Collector ${newCollector.fullName} (${newCollector.id}) registered successfully.`,
    });
  };

  const updateCollectorStatus = (id: string, newStatus: CollectorStatus) => {
    setCollectors((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: newStatus,
              scaleStatus: newStatus === 'Active' ? 'Online' : 'Offline',
            }
          : c
      )
    );
    addToast({
      type: 'info',
      title: 'Collector Status Updated',
      message: `Collector ${id} status set to ${newStatus}.`,
    });
  };

  const assignCollectorToRequest = (requestId: string, collector: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? { ...r, assignedCollector: collector, status: 'En Route' as const }
          : r
      )
    );
    addToast({
      type: 'success',
      title: 'Collector Assigned',
      message: `${collector} assigned to pickup ${requestId}.`,
    });
  };

  const triggerScaleSync = () => {
    setIsScaleSyncing(true);
    addToast({
      type: 'info',
      title: 'Syncing Scales...',
      message: 'Connecting to Weighbridge 01, 02, and 03 digital scale telemetry.',
    });

    setTimeout(() => {
      setIsScaleSyncing(false);
      addToast({
        type: 'success',
        title: 'Scales Synchronized',
        message: 'All 3 weighbridge scales calibrated and synchronized (Zero drift: 0.02 kg).',
      });
    }, 1500);
  };

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        slips,
        requests,
        farmers,
        collectors,
        settlement,
        stationStatus,
        isScaleSyncing,
        addSlip,
        verifySlip,
        reviewSlip,
        addFarmer,
        addCollector,
        updateCollectorStatus,
        assignCollectorToRequest,
        triggerScaleSync,
        isRecordModalOpen,
        setIsRecordModalOpen,
        isAddFarmerModalOpen,
        setIsAddFarmerModalOpen,
        isAddCollectorModalOpen,
        setIsAddCollectorModalOpen,
        isSettlementModalOpen,
        setIsSettlementModalOpen,
        isNotificationModalOpen,
        setIsNotificationModalOpen,
        isAuditModalOpen,
        setIsAuditModalOpen,
        selectedSlipForReview,
        setSelectedSlipForReview,
        selectedSlipForPrint,
        setSelectedSlipForPrint,
        selectedCollectorForDetail,
        setSelectedCollectorForDetail,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
