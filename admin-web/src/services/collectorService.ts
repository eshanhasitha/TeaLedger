import { apiClient } from './api';
import type {
  TeaCollector,
  CollectorFormData,
  CollectorStatus,
  AssignedSmallholder,
  RecentScaleLog,
  CollectorRoutePerformance,
  BackendCollectorDto,
  BackendCollectorPagedResponse,
  UpdateCollectorApiPayload,
  CollectorQueryFilters,
  CollectorListResponse,
} from '../types/collector.types';
import {
  COLLECTOR_SMALLHOLDERS_MAP,
  COLLECTOR_SCALE_LOGS_MAP,
} from './mockData';

export const INITIAL_FIGMA_COLLECTORS: TeaCollector[] = [
  {
    id: 'C-02',
    collectorCode: 'C-02',
    fullName: 'Nimal Silva',
    nicNumber: '821290455V',
    phoneNumber: '077 555 0102',
    email: 'nimal.s@tealedger.lk',
    assignedRoute: 'Highland Block 03 - Route 02',
    assignedDivision: 'Nuwara Eliya Central',
    activeFarmersCount: 42,
    todayIntakeKg: 142.5,
    status: 'Active',
    syncStatus: 'Synced',
    registeredDate: '2023-01-15',
    vehicleNumber: 'WP LD-8842 (Isuzu Lorry)',
    scaleDeviceId: 'DIGI-SCALE-02',
    batteryLevel: 94,
    scaleStatus: 'Online',
  },
  {
    id: 'C-04',
    collectorCode: 'C-04',
    fullName: 'Rohan Dias',
    nicNumber: '861098234V',
    phoneNumber: '077 555 0104',
    email: 'roshan.d@tealedger.lk',
    assignedRoute: 'Maskeliya Valley - Route 04',
    assignedDivision: 'Maskeliya',
    activeFarmersCount: 38,
    todayIntakeKg: 118.0,
    status: 'Active',
    syncStatus: 'Pending',
    pendingSyncCount: 3,
    registeredDate: '2022-11-04',
    vehicleNumber: 'WP LD-5532 (Mahindra Bolero)',
    scaleDeviceId: 'DIGI-SCALE-04',
    batteryLevel: 84,
    scaleStatus: 'Online',
  },
  {
    id: 'C-07',
    collectorCode: 'C-07',
    fullName: 'Dilani Perera',
    nicNumber: '895123456V',
    phoneNumber: '077 555 0107',
    email: 'dilani.p@tealedger.lk',
    assignedRoute: 'Norwood Div 02 & Agrapatana Link',
    assignedDivision: 'Norwood',
    activeFarmersCount: 45,
    todayIntakeKg: 96.4,
    status: 'Active',
    syncStatus: 'Failed',
    failedSyncCount: 1,
    registeredDate: '2021-05-18',
    vehicleNumber: 'WP LC-9031 (Tata 407)',
    scaleDeviceId: 'DIGI-SCALE-07',
    batteryLevel: 76,
    scaleStatus: 'Online',
  },
  {
    id: 'C-09',
    collectorCode: 'C-09',
    fullName: 'Kasun Wickrama',
    nicNumber: '921123490V',
    phoneNumber: '077 555 0109',
    email: 'kasun.w@tealedger.lk',
    assignedRoute: 'Haputale Upper Basin - Post C',
    assignedDivision: 'Haputale',
    activeFarmersCount: 40,
    todayIntakeKg: 0,
    status: 'On Leave',
    syncStatus: 'No data',
    registeredDate: '2023-06-22',
    vehicleNumber: 'WP LF-1120 (Isuzu Elf)',
    scaleDeviceId: 'DIGI-SCALE-09',
    batteryLevel: 0,
    scaleStatus: 'Offline',
  },
];

// In-memory store for development/mocking
let collectorsStore: TeaCollector[] = [...INITIAL_FIGMA_COLLECTORS];

function mapBackendDtoToCollector(dto: BackendCollectorDto): TeaCollector {
  return {
    id: dto.id,
    collectorCode: dto.collectorCode,
    fullName: dto.fullName,
    nicNumber: 'N/A',
    phoneNumber: dto.phoneNumber,
    email: `${dto.collectorCode.toLowerCase()}@tealedger.lk`,
    assignedRoute: dto.address || 'Assigned Estate Route',
    assignedDivision: dto.address || 'Central Division',
    address: dto.address ?? undefined,
    activeFarmersCount: 0,
    todayIntakeKg: 0,
    status: dto.isActive ? 'Active' : 'On Leave',
    syncStatus: dto.isActive ? 'Synced' : 'No data',
    registeredDate: dto.createdAt.split('T')[0],
    vehicleNumber: 'Assigned Fleet',
    scaleDeviceId: `DIGI-${dto.collectorCode}`,
    batteryLevel: dto.isActive ? 95 : 0,
    scaleStatus: dto.isActive ? 'Online' : 'Offline',
  };
}

export const collectorService = {
  /**
   * Fetches paginated collectors from GET /api/admin/collectors with search and status filters.
   */
  async getCollectorsList(filters?: CollectorQueryFilters): Promise<CollectorListResponse> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';
    const page = filters?.page ?? 1;
    const pageSize = filters?.pageSize ?? 4;

    if (!isMock) {
      const isActiveParam =
        filters?.status === 'Active'
          ? true
          : filters?.status === 'On Leave' || filters?.status === 'Inactive'
          ? false
          : undefined;

      const response = await apiClient.get<BackendCollectorPagedResponse>('/admin/collectors', {
        params: {
          page,
          pageSize,
          search: filters?.search?.trim() || undefined,
          area: filters?.area || undefined,
          isActive: isActiveParam,
        },
      });

      return {
        items: response.items.map(mapBackendDtoToCollector),
        totalCount: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
      };
    }

    await new Promise((resolve) => setTimeout(resolve, 250));

    let items = [...collectorsStore];

    if (filters?.search?.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          (c.collectorCode || c.id).toLowerCase().includes(q) ||
          c.phoneNumber.toLowerCase().includes(q) ||
          c.assignedRoute.toLowerCase().includes(q)
      );
    }

    if (filters?.status && filters.status !== 'All') {
      items = items.filter((c) => c.status === filters.status);
    }

    const isDefaultUnfiltered = !filters?.search?.trim() && (!filters?.status || filters.status === 'All');

    return {
      items,
      totalCount: isDefaultUnfiltered && collectorsStore.length === 4 ? 26 : items.length,
      page,
      pageSize,
    };
  },

  async getCollectors(): Promise<TeaCollector[]> {
    const res = await this.getCollectorsList({ page: 1, pageSize: 50 });
    return res.items;
  },

  /**
   * Fetches a single collector by ID via GET /api/admin/collectors/{id}.
   */
  async getCollectorById(id: string): Promise<TeaCollector | null> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const dto = await apiClient.get<BackendCollectorDto>(`/admin/collectors/${id}`);
      return mapBackendDtoToCollector(dto);
    }

    const collector = collectorsStore.find((c) => c.id === id || c.collectorCode === id);
    return Promise.resolve(collector ? { ...collector } : null);
  },

  /**
   * Registers a new collector via POST /api/admin/collectors.
   */
  async createCollector(
    data: CollectorFormData & { password?: string; address?: string; area?: string }
  ): Promise<TeaCollector> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const dto = await apiClient.post<BackendCollectorDto>('/admin/collectors', {
        fullName: data.fullName.trim(),
        phoneNumber: data.phoneNumber.trim(),
        password: data.password || 'TeaLedger@123',
        address: data.address || data.assignedRoute,
        area: data.area || data.assignedDivision,
      });
      return mapBackendDtoToCollector(dto);
    }

    const nextNumber = 10 + collectorsStore.length;
    const code = `C-${String(nextNumber).padStart(2, '0')}`;
    const newCollector: TeaCollector = {
      id: code,
      collectorCode: code,
      ...data,
      activeFarmersCount: 0,
      todayIntakeKg: 0,
      syncStatus: data.status === 'Active' ? 'Synced' : 'No data',
      registeredDate: new Date().toISOString().split('T')[0],
      batteryLevel: 100,
      scaleStatus: data.status === 'Active' ? 'Online' : 'Offline',
    };

    collectorsStore = [newCollector, ...collectorsStore];
    return Promise.resolve(newCollector);
  },

  /**
   * Updates an existing collector via PUT /api/admin/collectors/{id}.
   */
  async updateCollector(id: string, data: UpdateCollectorApiPayload): Promise<TeaCollector> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      const dto = await apiClient.put<BackendCollectorDto>(`/admin/collectors/${id}`, data);
      return mapBackendDtoToCollector(dto);
    }

    const index = collectorsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Collector with id ${id} not found`);
    }

    const updated: TeaCollector = {
      ...collectorsStore[index],
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      address: data.address,
      assignedDivision: data.area || collectorsStore[index].assignedDivision,
    };

    collectorsStore[index] = updated;
    return updated;
  },

  /**
   * Updates collector active/inactive status via PATCH /api/admin/collectors/{id}/status.
   */
  async updateCollectorStatus(id: string, newStatus: CollectorStatus): Promise<TeaCollector> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      await apiClient.patch<{ collectorId: string; isActive: boolean; message: string }>(
        `/admin/collectors/${id}/status`,
        { isActive: newStatus === 'Active' }
      );
      const existing = collectorsStore.find((c) => c.id === id);
      return {
        ...(existing || {
          id,
          collectorCode: id,
          fullName: 'Collector',
          nicNumber: 'N/A',
          phoneNumber: '',
          email: '',
          assignedRoute: '',
          assignedDivision: '',
          activeFarmersCount: 0,
          todayIntakeKg: 0,
          registeredDate: '',
          vehicleNumber: '',
          scaleDeviceId: '',
        }),
        status: newStatus,
        syncStatus: newStatus === 'Active' ? 'Synced' : 'No data',
        scaleStatus: newStatus === 'Active' ? 'Online' : 'Offline',
      };
    }

    const index = collectorsStore.findIndex((c) => c.id === id);
    if (index === -1) {
      throw new Error(`Collector with id ${id} not found`);
    }

    const updated: TeaCollector = {
      ...collectorsStore[index],
      status: newStatus,
      syncStatus: newStatus === 'Active' ? 'Synced' : 'No data',
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
    return Promise.resolve(this.getAssignedSmallholdersSync(collectorId));
  },

  async getCollectorScaleLogs(collectorId: string): Promise<RecentScaleLog[]> {
    return Promise.resolve(this.getCollectorScaleLogsSync(collectorId));
  },

  async getRoutePerformance(collectorId: string): Promise<CollectorRoutePerformance> {
    return Promise.resolve(this.getRoutePerformanceSync(collectorId));
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
      c.collectorCode || c.id,
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
