import { apiClient } from './api';
import type { Farmer, FarmerFilters, FarmerListResponse, FarmerStatus } from '../types/farmer.types';

export const INITIAL_FARMERS: Farmer[] = [
  {
    id: '8492',
    code: 'TR-8492',
    name: 'Kamal Perera',
    area: 'Block 03',
    division: 'Norwood Central',
    collectorName: 'Nimal Silva',
    lastCollectionDate: '14 Oct 2026',
    advanceLkr: 30000,
    status: 'Active',
    phone: '+94 77 234 5678',
    nic: '198412304921',
    teaLandAcreage: 2.5,
    bankName: 'Commercial Bank of Ceylon',
    accountNumber: '8004192049',
    joinedDate: '2023-01-15',
    totalDeliveredKgMonth: 1240,
  },
  {
    id: '8510',
    code: 'TR-8510',
    name: 'Sunil Fernando',
    area: 'Block 04',
    division: 'Norwood Central',
    collectorName: 'Nimal Silva',
    lastCollectionDate: '13 Oct 2026',
    advanceLkr: 0,
    status: 'Active',
    phone: '+94 71 876 5432',
    nic: '197920491024',
    teaLandAcreage: 1.8,
    bankName: 'Bank of Ceylon',
    accountNumber: '7049102410',
    joinedDate: '2023-03-22',
    totalDeliveredKgMonth: 890,
  },
  {
    id: '8451',
    code: 'TR-8451',
    name: 'Priya Kumari',
    area: 'Block 05',
    division: 'Maskeliya Valley',
    collectorName: 'Rohan Dias',
    lastCollectionDate: '14 Oct 2026',
    advanceLkr: 12500,
    status: 'Active',
    phone: '+94 76 345 6789',
    nic: '199051204851',
    teaLandAcreage: 3.2,
    bankName: 'Hatton National Bank',
    accountNumber: '0284910284',
    joinedDate: '2022-11-10',
    totalDeliveredKgMonth: 1450,
  },
  {
    id: '8333',
    code: 'TR-8333',
    name: 'Ajith Bandara',
    area: 'Block 03',
    division: 'Maskeliya Valley',
    collectorName: 'Rohan Dias',
    lastCollectionDate: '11 Oct 2026',
    advanceLkr: 42000,
    status: 'Active',
    phone: '+94 70 987 6543',
    nic: '198210308333',
    teaLandAcreage: 4.0,
    bankName: 'People\'s Bank',
    accountNumber: '1948102941',
    joinedDate: '2021-08-05',
    totalDeliveredKgMonth: 1780,
  },
  {
    id: '8602',
    code: 'TR-8602',
    name: 'Mala Jayasinghe',
    area: 'Block 05',
    division: 'Bogawantalawa Valley',
    collectorName: 'Nimal Silva',
    lastCollectionDate: '02 Oct 2026',
    advanceLkr: 18000,
    status: 'Inactive',
    phone: '+94 77 456 7890',
    nic: '198760208602',
    teaLandAcreage: 1.5,
    bankName: 'Commercial Bank of Ceylon',
    accountNumber: '8005910284',
    joinedDate: '2023-06-18',
    totalDeliveredKgMonth: 410,
  },
];

export const farmerService = {
  /**
   * Fetches the paginated list of farmers with optional search and status filters.
   * Endpoint: GET /api/admin/farmers
   */
  async getFarmers(filters?: FarmerFilters): Promise<FarmerListResponse> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      try {
        const queryParams: Record<string, string | number | undefined> = {
          search: filters?.search?.trim() || undefined,
          status: filters?.status !== 'All' ? filters?.status : undefined,
          page: filters?.page ?? 1,
          pageSize: filters?.pageSize ?? 5,
        };

        const response = await apiClient.get<FarmerListResponse>('/admin/farmers', {
          params: queryParams,
        });
        return response;
      } catch (err: unknown) {
        console.warn('Backend GET /api/admin/farmers failed, using fallback:', err);
        throw err;
      }
    }

    // Realistic API network latency simulation
    await new Promise((resolve) => setTimeout(resolve, 350));

    let items = [...INITIAL_FARMERS];

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          (f.phone && f.phone.includes(q))
      );
    }

    if (filters?.status && filters.status !== 'All') {
      items = items.filter((f) => f.status === filters.status);
    }

    return {
      items,
      total: 1428, // Matches Figma "Showing 1–5 of 1,428"
      page: filters?.page ?? 1,
      pageSize: filters?.pageSize ?? 5,
    };
  },

  /**
   * Fetches a single farmer by ID.
   * Endpoint: GET /api/admin/farmers/{id}
   */
  async getFarmerById(id: string): Promise<Farmer> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      return apiClient.get<Farmer>(`/admin/farmers/${id}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 200));
    const found = INITIAL_FARMERS.find((f) => f.id === id);
    if (!found) throw new Error(`Farmer ${id} not found`);
    return found;
  },

  /**
   * Enrolls a new farmer.
   * Endpoint: POST /api/admin/farmers
   */
  async createFarmer(farmerData: Partial<Farmer>): Promise<Farmer> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      return apiClient.post<Farmer>('/admin/farmers', farmerData);
    }

    await new Promise((resolve) => setTimeout(resolve, 400));
    const newFarmer: Farmer = {
      id: String(8700 + Math.floor(Math.random() * 100)),
      code: farmerData.code || `TR-${Date.now().toString().slice(-4)}`,
      name: farmerData.name || 'New Grower',
      area: farmerData.area || 'Block 01',
      division: farmerData.division || 'Norwood Central',
      collectorName: farmerData.collectorName || 'Unassigned',
      lastCollectionDate: 'Pending first intake',
      advanceLkr: farmerData.advanceLkr || 0,
      status: farmerData.status || 'Active',
      phone: farmerData.phone || '',
      nic: farmerData.nic || '',
      teaLandAcreage: farmerData.teaLandAcreage || 1.0,
      bankName: farmerData.bankName || 'Commercial Bank',
      accountNumber: farmerData.accountNumber || '',
      joinedDate: new Date().toISOString().split('T')[0],
      totalDeliveredKgMonth: 0,
    };

    INITIAL_FARMERS.unshift(newFarmer);
    return newFarmer;
  },

  /**
   * Updates an existing farmer's details.
   * Endpoint: PUT /api/admin/farmers/{id}
   */
  async updateFarmer(id: string, farmerData: Partial<Farmer>): Promise<Farmer> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      return apiClient.put<Farmer>(`/admin/farmers/${id}`, farmerData);
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
    const index = INITIAL_FARMERS.findIndex((f) => f.id === id);
    if (index === -1) throw new Error(`Farmer ${id} not found`);

    INITIAL_FARMERS[index] = { ...INITIAL_FARMERS[index], ...farmerData };
    return INITIAL_FARMERS[index];
  },

  /**
   * Updates a farmer's status (Active / Inactive).
   * Endpoint: PATCH /api/admin/farmers/{id}/status
   */
  async updateFarmerStatus(id: string, status: FarmerStatus): Promise<Farmer> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      return apiClient.patch<Farmer>(`/admin/farmers/${id}/status`, { status });
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
    const index = INITIAL_FARMERS.findIndex((f) => f.id === id);
    if (index === -1) throw new Error(`Farmer ${id} not found`);

    INITIAL_FARMERS[index] = { ...INITIAL_FARMERS[index], status };
    return INITIAL_FARMERS[index];
  },

  /**
   * Exports the farmers registry as a CSV file.
   */
  async exportFarmersReport(farmers: Farmer[] = INITIAL_FARMERS): Promise<void> {
    const headers = ['Farmer ID', 'Name', 'Area', 'Collector', 'Last Collection', 'Advance (LKR)', 'Status'];
    const rows = farmers.map((f) => [
      f.id,
      `"${f.name}"`,
      `"${f.area}"`,
      `"${f.collectorName || 'Unassigned'}"`,
      `"${f.lastCollectionDate || 'N/A'}"`,
      f.advanceLkr ?? 0,
      f.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tealedger_farmers_roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
