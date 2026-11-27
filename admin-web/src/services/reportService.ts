import { apiClient } from './api';
import { settlementService } from './settlementService';
import type {
  BackendCollectionReportRow,
  BackendDeductionReportRow,
  BackendEarningsReportRow,
  BackendPagedReport,
  ReportAreaOption,
  ReportCardType,
  ReportExportFormat,
  ReportExportRecord,
  ReportPeriodOption,
} from '../types/report.types';

export const INITIAL_RECENT_EXPORTS: ReportExportRecord[] = [
  {
    id: 'exp-01',
    reportName: 'Settlement report',
    periodLabel: 'September 2026',
    areaLabel: 'All areas',
    format: 'CSV',
    generatedLabel: '14 Nov, 09:40',
    status: 'Ready',
    reportType: 'settlement',
  },
  {
    id: 'exp-02',
    reportName: 'Collections summary',
    periodLabel: 'October 2026',
    areaLabel: 'North zone',
    format: 'PDF',
    generatedLabel: '14 Nov, 09:12',
    status: 'Generating',
    reportType: 'collections',
  },
  {
    id: 'exp-03',
    reportName: 'Loan outstanding',
    periodLabel: 'All dates',
    areaLabel: 'All areas',
    format: 'CSV',
    generatedLabel: '13 Nov, 17:45',
    status: 'Ready',
    reportType: 'loan-outstanding',
  },
  {
    id: 'exp-04',
    reportName: 'Farmer statement',
    periodLabel: 'September 2026',
    areaLabel: 'South zone',
    format: 'Excel',
    generatedLabel: '12 Nov, 16:20',
    status: 'Failed',
    reportType: 'farmer-statement',
  },
];

let recentExportsStore: ReportExportRecord[] = [...INITIAL_RECENT_EXPORTS];

const REPORT_TITLES: Record<ReportCardType, string> = {
  collections: 'Collections summary',
  'farmer-statement': 'Farmer statement',
  settlement: 'Settlement report',
  'loan-outstanding': 'Loan outstanding',
};

function getPeriodDateRange(period: ReportPeriodOption): {
  from?: string;
  to?: string;
  year?: number;
  month?: number;
} {
  switch (period) {
    case 'October 2026':
      return { from: '2026-10-01', to: '2026-10-31', year: 2026, month: 10 };
    case 'September 2026':
      return { from: '2026-09-01', to: '2026-09-30', year: 2026, month: 9 };
    case 'August 2026':
      return { from: '2026-08-01', to: '2026-08-31', year: 2026, month: 8 };
    case 'All dates':
    default:
      return {};
  }
}

function formatNowShort(): string {
  const now = new Date();
  const datePart = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
  }).format(now);
  const timePart = new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(now);
  return `${datePart}, ${timePart}`;
}

export function triggerCsvDownload(fileName: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildFallbackCsv(
  reportType: ReportCardType,
  period: ReportPeriodOption,
  area: ReportAreaOption
): string {
  const lines = [
    `"Report","Period","Area","GeneratedAt"`,
    `"${REPORT_TITLES[reportType]}","${period}","${area}","${new Date().toISOString()}"`,
  ];
  return lines.join('\n');
}

export const reportService = {
  getRecentExports(): ReportExportRecord[] {
    return [...recentExportsStore];
  },

  async getCollectionsReport(params?: {
    from?: string;
    to?: string;
    farmerId?: string;
    collectorId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BackendPagedReport<BackendCollectionReportRow>> {
    return apiClient.get<BackendPagedReport<BackendCollectionReportRow>>('/reports/collections', {
      params,
    });
  },

  async getEarningsReport(params?: {
    from?: string;
    to?: string;
    farmerId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BackendPagedReport<BackendEarningsReportRow>> {
    return apiClient.get<BackendPagedReport<BackendEarningsReportRow>>('/reports/earnings', {
      params,
    });
  },

  async getDeductionsReport(params?: {
    from?: string;
    to?: string;
    farmerId?: string;
    page?: number;
    pageSize?: number;
  }): Promise<BackendPagedReport<BackendDeductionReportRow>> {
    return apiClient.get<BackendPagedReport<BackendDeductionReportRow>>('/reports/deductions', {
      params,
    });
  },

  async generateReport(options: {
    reportType: ReportCardType;
    period: ReportPeriodOption;
    area: ReportAreaOption;
    format: ReportExportFormat;
  }): Promise<ReportExportRecord> {
    const { reportType, period, area, format } = options;
    const range = getPeriodDateRange(period);
    const id = `exp-${Date.now()}`;
    const reportName = REPORT_TITLES[reportType];

    if (import.meta.env.VITE_USE_MOCK === 'true') {
      const csvContent = buildFallbackCsv(reportType, period, area);
      const record: ReportExportRecord = {
        id,
        reportName,
        periodLabel: period,
        areaLabel: area,
        format,
        generatedLabel: formatNowShort(),
        status: 'Ready',
        reportType,
        csvContent,
      };
      recentExportsStore = [record, ...recentExportsStore];
      if (format === 'CSV') {
        triggerCsvDownload(
          `${reportType}-${period.toLowerCase().replace(/\s+/g, '-')}.csv`,
          csvContent
        );
      }
      return record;
    }

    let csvContent: string | undefined;

    if (reportType === 'collections') {
      const csvText = await apiClient.get<string>('/reports/collections/export', {
        params: { from: range.from, to: range.to },
      });
      csvContent = csvText || buildFallbackCsv(reportType, period, area);
      triggerCsvDownload('collections-report.csv', csvContent);
    } else if (reportType === 'farmer-statement') {
      const csvText = await apiClient.get<string>('/reports/earnings/export', {
        params: { from: range.from, to: range.to },
      });
      csvContent = csvText || buildFallbackCsv(reportType, period, area);
      triggerCsvDownload('earnings-report.csv', csvContent);
    } else if (reportType === 'loan-outstanding') {
      const csvText = await apiClient.get<string>('/reports/deductions/export', {
        params: { from: range.from, to: range.to },
      });
      csvContent = csvText || buildFallbackCsv(reportType, period, area);
      triggerCsvDownload('deductions-report.csv', csvContent);
    } else {
      const history = await settlementService.getMonthlySettlements({
        year: range.year,
        month: range.month,
      });
      settlementService.exportSettlementsCSV(history.items);
    }

    const record: ReportExportRecord = {
      id,
      reportName,
      periodLabel: period,
      areaLabel: area,
      format,
      generatedLabel: formatNowShort(),
      status: 'Ready',
      reportType,
      csvContent,
    };

    recentExportsStore = [record, ...recentExportsStore];
    return record;
  },

  downloadRecord(record: ReportExportRecord): void {
    const csv =
      record.csvContent ??
      buildFallbackCsv(
        record.reportType,
        (record.periodLabel as ReportPeriodOption) || 'All dates',
        (record.areaLabel as ReportAreaOption) || 'All areas'
      );
    triggerCsvDownload(
      `${record.reportType}-${record.periodLabel.toLowerCase().replace(/\s+/g, '-')}.csv`,
      csv
    );
  },
};
