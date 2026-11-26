import { apiClient } from './api';
import type { AdminDashboardData } from '../types/dashboard.types';

export const INITIAL_DASHBOARD_DATA: AdminDashboardData = {
  stats: {
    collectedTodayKg: 1240,
    verifiedSlipsCount: 184,
    openRequestsCount: 14,
    activeCollectorsCount: 24,
    totalCollectorsCount: 26,
    onLeaveCollectorsCount: 2,
    monthlySettlementAmountLkr: 4600000,
    monthlySettlementFormatted: '4.6M',
    monthlySettlementMonth: 'Nov',
    isSettlementEstimated: true,
  },
  weeklyTrend: [
    { day: 'Sat 8', kg: 980 },
    { day: 'Sun 9', kg: 420 },
    { day: 'Mon 10', kg: 1120 },
    { day: 'Tue 11', kg: 1050 },
    { day: 'Wed 12', kg: 1240 },
    { day: 'Thu 13', kg: 900 },
    { day: 'Fri 14', kg: 1180 },
  ],
  openRequests: [
    {
      id: 'req-01',
      farmerName: 'Kamal Perera',
      locationOrBlock: 'Block 03',
      bagsCount: 6,
      status: 'Pending',
    },
    {
      id: 'req-02',
      farmerName: 'Sunil Fernando',
      locationOrBlock: 'Block 04',
      bagsCount: 4,
      status: 'Pending',
    },
    {
      id: 'req-03',
      farmerName: 'Priya Kumari',
      locationOrBlock: 'Block 05',
      bagsCount: 9,
      status: 'Assigned',
    },
    {
      id: 'req-04',
      farmerName: 'Ajith Bandara',
      locationOrBlock: 'Block 03',
      bagsCount: 5,
      status: 'Assigned',
    },
  ],
  recentCollections: [
    {
      id: 'L-4819',
      farmerName: 'Kamal Perera',
      collectorName: 'Nimal Silva',
      grossKg: 26.4,
      reductionsKg: -2.4,
      finalKg: 24.0,
      status: 'Verified',
      createdAt: '11:42 AM',
    },
    {
      id: 'L-4818',
      farmerName: 'Sunil Fernando',
      collectorName: 'Nimal Silva',
      grossKg: 20.1,
      reductionsKg: -1.6,
      finalKg: 18.5,
      status: 'Verified',
      createdAt: '11:28 AM',
    },
    {
      id: 'L-4817',
      farmerName: 'Priya Kumari',
      collectorName: 'Rohan Dias',
      grossKg: 33.0,
      reductionsKg: -2.8,
      finalKg: 30.2,
      status: 'Pending sync',
      createdAt: '11:15 AM',
    },
    {
      id: 'L-4816',
      farmerName: 'Ajith Bandara',
      collectorName: 'Rohan Dias',
      grossKg: 24.5,
      reductionsKg: -2.5,
      finalKg: 22.0,
      status: 'Verified',
      createdAt: '10:55 AM',
    },
    {
      id: 'L-4815',
      farmerName: 'Mala Jayasinghe',
      collectorName: 'Nimal Silva',
      grossKg: 41.0,
      reductionsKg: -3.2,
      finalKg: 37.8,
      status: 'Needs review',
      createdAt: '10:30 AM',
    },
  ],
  totalCollectionsCount: 184,
};

export const dashboardService = {
  /**
   * Fetches the complete admin dashboard overview data.
   * Endpoint: GET /api/admin/dashboard
   */
  async getDashboardData(): Promise<AdminDashboardData> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      try {
        const response = await apiClient.get<AdminDashboardData>('/admin/dashboard');
        return response;
      } catch (err: unknown) {
        console.warn('Backend GET /api/admin/dashboard failed, using fallback:', err);
        throw err;
      }
    }

    // Realistic API network latency simulation
    await new Promise((resolve) => setTimeout(resolve, 450));
    return INITIAL_DASHBOARD_DATA;
  },

  /**
   * Generates and downloads the collections CSV summary report.
   * Target endpoint: GET /api/reports/collections/export
   */
  async exportCollectionsReport(data: AdminDashboardData = INITIAL_DASHBOARD_DATA): Promise<void> {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true';

    if (!isMock) {
      try {
        // Trigger file download via API endpoint if supported
        window.open(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/reports/collections/export`, '_blank');
        return;
      } catch (err: unknown) {
        console.warn('Backend export failed, falling back to local CSV generator:', err);
      }
    }

    // Local CSV generation fallback
    const headers = ['Slip ID', 'Farmer Name', 'Collector Name', 'Gross Weight (kg)', 'Reductions (kg)', 'Final Weight (kg)', 'Status'];
    const rows = data.recentCollections.map((c) => [
      c.id,
      `"${c.farmerName}"`,
      `"${c.collectorName}"`,
      c.grossKg.toFixed(2),
      c.reductionsKg.toFixed(2),
      c.finalKg.toFixed(2),
      c.status,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `tealedger_collections_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
