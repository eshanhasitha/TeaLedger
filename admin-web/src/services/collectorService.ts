import type {
  TeaCollector,
  CollectorFormData,
  CollectorStatus,
  AssignedSmallholder,
  RecentScaleLog,
  CollectorRoutePerformance,
} from '../types/collector.types';
import {
  INITIAL_COLLECTORS,
  COLLECTOR_SMALLHOLDERS_MAP,
  COLLECTOR_SCALE_LOGS_MAP,
} from './mockData';

// In-memory store for development/mocking
let collectorsStore: TeaCollector[] = [...INITIAL_COLLECTORS];

export const collectorService = {
  async getCollectors(): Promise<TeaCollector[]> {
    return Promise.resolve([...collectorsStore]);
  },

  async getCollectorById(id: string): Promise<TeaCollector | null> {
    const collector = collectorsStore.find((c) => c.id === id);
    return Promise.resolve(collector ? { ...collector } : null);
  },

  async createCollector(data: CollectorFormData): Promise<TeaCollector> {
    const nextNumber = 400 + collectorsStore.length + 1;
    const newCollector: TeaCollector = {
      id: `COL-${nextNumber}`,
      ...data,
      activeFarmersCount: 0,
      todayIntakeKg: 0,
      registeredDate: new Date().toISOString().split('T')[0],
      batteryLevel: 100,
      scaleStatus: data.status === 'Active' ? 'Online' : 'Offline',
    };

    collectorsStore = [newCollector, ...collectorsStore];
    return Promise.resolve(newCollector);
  },

  async updateCollectorStatus(id: string, newStatus: CollectorStatus): Promise<TeaCollector> {
    const index = collectorsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Collector with id ${id} not found`);
    }

    const updated: TeaCollector = {
      ...collectorsStore[index],
      status: newStatus,
      scaleStatus: newStatus === 'Active' ? 'Online' : 'Offline',
    };

    collectorsStore[index] = updated;
    return Promise.resolve(updated);
  },

  getAssignedSmallholdersSync(collectorId: string): AssignedSmallholder[] {
    return COLLECTOR_SMALLHOLDERS_MAP[collectorId] || [
      {
        code: 'TR-1080',
        name: 'M. Seneviratne',
        division: 'Haputale Gap Div 1',
        acreage: 2.5,
        estDailyKg: 200,
        lastCollectionTime: '08:30 AM',
        phone: '+94 71 889 2211',
      },
      {
        code: 'TR-1134',
        name: 'A. Tharmalingam',
        division: 'Hatton Ridge',
        acreage: 3.8,
        estDailyKg: 310,
        lastCollectionTime: '10:00 AM',
        phone: '+94 77 221 4455',
      },
    ];
  },

  getCollectorScaleLogsSync(collectorId: string): RecentScaleLog[] {
    return COLLECTOR_SCALE_LOGS_MAP[collectorId] || [
      {
        id: `LOG-${collectorId}-01`,
        slipId: 'SLIP-8922',
        timestamp: '10:15 AM',
        farmerName: 'K. M. Bandara',
        farmerCode: 'TR-1042',
        grossKg: 135.0,
        tareKg: -7.0,
        netKg: 128.0,
        status: 'Verified',
      },
    ];
  },

  getRoutePerformanceSync(collectorId: string): CollectorRoutePerformance {
    const hash = collectorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const monthlyIntakeTons = 40 + (hash % 25);
    const onTimeIntakeRate = 92 + (hash % 7);
    const routeCoveragePercentage = 88 + (hash % 11);
    const fuelEfficiencyKmPerL = Number((6.2 + (hash % 10) * 0.15).toFixed(1));

    return {
      monthlyIntakeTons,
      onTimeIntakeRate,
      routeCoveragePercentage,
      fuelEfficiencyKmPerL,
    };
  },

  async getAssignedSmallholders(collectorId: string): Promise<AssignedSmallholder[]> {
    const smallholders = COLLECTOR_SMALLHOLDERS_MAP[collectorId] || [
      {
        code: 'TR-1080',
        name: 'M. Seneviratne',
        division: 'Haputale Gap Div 1',
        acreage: 2.5,
        estDailyKg: 200,
        lastCollectionTime: '08:30 AM',
        phone: '+94 71 889 2211',
      },
      {
        code: 'TR-1134',
        name: 'A. Tharmalingam',
        division: 'Hatton Ridge',
        acreage: 3.8,
        estDailyKg: 310,
        lastCollectionTime: '10:00 AM',
        phone: '+94 77 221 4455',
      },
    ];
    return Promise.resolve(smallholders);
  },

  async getCollectorScaleLogs(collectorId: string): Promise<RecentScaleLog[]> {
    const logs = COLLECTOR_SCALE_LOGS_MAP[collectorId] || [
      {
        id: `LOG-${collectorId}-01`,
        slipId: 'SLIP-8922',
        timestamp: '10:15 AM',
        farmerName: 'K. M. Bandara',
        farmerCode: 'TR-1042',
        grossKg: 135.0,
        tareKg: -7.0,
        netKg: 128.0,
        status: 'Verified',
      },
    ];
    return Promise.resolve(logs);
  },

  async getRoutePerformance(collectorId: string): Promise<CollectorRoutePerformance> {
    // Deterministic realistic calculation based on collector id
    const hash = collectorId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const monthlyIntakeTons = 40 + (hash % 25);
    const onTimeIntakeRate = 92 + (hash % 7);
    const routeCoveragePercentage = 88 + (hash % 11);
    const fuelEfficiencyKmPerL = Number((6.2 + (hash % 10) * 0.15).toFixed(1));

    return Promise.resolve({
      monthlyIntakeTons,
      onTimeIntakeRate,
      routeCoveragePercentage,
      fuelEfficiencyKmPerL,
    });
  },

  exportRouteRosterCSV(collectors: TeaCollector[]): void {
    const headers = [
      'Collector ID',
      'Full Name',
      'NIC Number',
      'Phone',
      'Email',
      'Assigned Route',
      'Division',
      'Assigned Farmers',
      'Today Intake (kg)',
      'Scale Device ID',
      'Vehicle Number',
      'Status',
      'Registered Date',
    ];

    const rows = collectors.map((c) => [
      c.id,
      `"${c.fullName.replace(/"/g, '""')}"`,
      c.nicNumber,
      c.phoneNumber,
      c.email,
      `"${c.assignedRoute.replace(/"/g, '""')}"`,
      `"${c.assignedDivision.replace(/"/g, '""')}"`,
      c.activeFarmersCount,
      c.todayIntakeKg,
      c.scaleDeviceId,
      `"${c.vehicleNumber.replace(/"/g, '""')}"`,
      c.status,
      c.registeredDate,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `TeaLedger_Collectors_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
