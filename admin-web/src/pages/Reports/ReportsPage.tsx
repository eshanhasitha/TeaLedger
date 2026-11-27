import React, { useState } from 'react';
import { ChevronDown, Check, Clock, AlertCircle, Loader2, Download } from 'lucide-react';
import { useDashboard } from '../../hooks/useDashboard';
import { reportService, INITIAL_RECENT_EXPORTS } from '../../services/reportService';
import type {
  ReportAreaOption,
  ReportCardType,
  ReportExportFormat,
  ReportExportRecord,
  ReportPeriodOption,
} from '../../types/report.types';

interface ReportCardConfig {
  type: ReportCardType;
  title: string;
  description: string;
}

const REPORT_CARDS: ReportCardConfig[] = [
  {
    type: 'collections',
    title: 'Collections summary',
    description: 'Daily leaf weights, wet reductions, and net kg collected',
  },
  {
    type: 'farmer-statement',
    title: 'Farmer statement',
    description: 'Individual passbook balances and payment history',
  },
  {
    type: 'settlement',
    title: 'Settlement report',
    description: 'Monthly payout breakdown across all farmers',
  },
  {
    type: 'loan-outstanding',
    title: 'Loan outstanding',
    description: 'Active loan balances and recovery forecast',
  },
];

const PERIOD_OPTIONS: ReportPeriodOption[] = [
  'October 2026',
  'September 2026',
  'August 2026',
  'All dates',
];

const AREA_OPTIONS: ReportAreaOption[] = [
  'All areas',
  'North zone',
  'South zone',
  'Central hill',
];

const FORMAT_OPTIONS: ReportExportFormat[] = ['CSV', 'PDF', 'Excel'];

export const ReportsPage: React.FC = () => {
  const { addToast } = useDashboard();

  const [period, setPeriod] = useState<ReportPeriodOption>('October 2026');
  const [area, setArea] = useState<ReportAreaOption>('All areas');
  const [format, setFormat] = useState<ReportExportFormat>('CSV');
  const [recentExports, setRecentExports] = useState<ReportExportRecord[]>(() => {
    const existing = reportService.getRecentExports();
    return existing.length > 0 ? existing : INITIAL_RECENT_EXPORTS;
  });
  const [generatingType, setGeneratingType] = useState<ReportCardType | null>(null);

  const handleGenerate = async (card: ReportCardConfig) => {
    setGeneratingType(card.type);
    try {
      await reportService.generateReport({
        reportType: card.type,
        period,
        area,
        format,
      });
      setRecentExports(reportService.getRecentExports());
      addToast({
        type: 'success',
        title: 'Report Generated',
        message: `${card.title} (${format}) generated for ${period}.`,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : `Failed to generate ${card.title}.`;
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: msg,
      });
    } finally {
      setGeneratingType(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary tracking-tight">Reports</h1>
        <p className="text-sm text-text-muted mt-0.5">
          Generate and download formatted estate reports
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-surface-card border border-border-default rounded-xl p-4 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)]">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Period */}
          <div>
            <label
              htmlFor="report-period"
              className="block text-xs font-medium text-text-muted mb-1.5"
            >
              Period
            </label>
            <div className="relative">
              <select
                id="report-period"
                value={period}
                onChange={(e) => setPeriod(e.target.value as ReportPeriodOption)}
                className="w-full appearance-none bg-surface-card border border-border-default rounded-lg px-3.5 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                {PERIOD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Area */}
          <div>
            <label
              htmlFor="report-area"
              className="block text-xs font-medium text-text-muted mb-1.5"
            >
              Area
            </label>
            <div className="relative">
              <select
                id="report-area"
                value={area}
                onChange={(e) => setArea(e.target.value as ReportAreaOption)}
                className="w-full appearance-none bg-surface-card border border-border-default rounded-lg px-3.5 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                {AREA_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Format */}
          <div>
            <label
              htmlFor="report-format"
              className="block text-xs font-medium text-text-muted mb-1.5"
            >
              Format
            </label>
            <div className="relative">
              <select
                id="report-format"
                value={format}
                onChange={(e) => setFormat(e.target.value as ReportExportFormat)}
                className="w-full appearance-none bg-surface-card border border-border-default rounded-lg px-3.5 py-2 pr-9 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary"
              >
                {FORMAT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-text-muted pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* 2x2 Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REPORT_CARDS.map((card) => {
          const isCardGenerating = generatingType === card.type;
          return (
            <div
              key={card.type}
              className="bg-surface-card border border-border-default rounded-xl p-5 shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] flex items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <h2 className="text-[15px] font-semibold text-text-primary">{card.title}</h2>
                <p className="text-sm text-text-muted mt-1 leading-relaxed">
                  {card.description}
                </p>
              </div>

              <button
                type="button"
                disabled={generatingType !== null}
                onClick={() => handleGenerate(card)}
                className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-text-primary bg-surface-card border border-border-default rounded-lg hover:bg-surface-muted transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isCardGenerating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Generate
              </button>
            </div>
          );
        })}
      </div>

      {/* Recent Exports Table */}
      <div className="bg-surface-card border border-border-default rounded-xl shadow-[0px_1px_2px_0px_rgba(16,24,40,0.04)] overflow-hidden">
        <div className="px-5 py-4 border-b border-border-subtle">
          <h2 className="text-[15px] font-semibold text-text-primary">Recent exports</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[720px]">
            <thead>
              <tr className="border-b border-border-subtle text-xs font-medium text-text-muted">
                <th className="py-3 px-5 font-medium">Report</th>
                <th className="py-3 px-4 font-medium">Period</th>
                <th className="py-3 px-4 font-medium">Area</th>
                <th className="py-3 px-4 font-medium">Format</th>
                <th className="py-3 px-4 font-medium">Generated</th>
                <th className="py-3 px-5 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle text-sm">
              {recentExports.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted/40 transition-colors">
                  <td className="py-4 px-5 font-semibold text-text-primary whitespace-nowrap">
                    {row.reportName}
                  </td>
                  <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                    {row.periodLabel}
                  </td>
                  <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                    {row.areaLabel}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="inline-block px-2 py-0.5 rounded-md bg-surface-muted text-text-secondary text-xs font-medium">
                      {row.format}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-text-secondary whitespace-nowrap">
                    {row.generatedLabel}
                  </td>
                  <td className="py-4 px-5 whitespace-nowrap">
                    {row.status === 'Ready' ? (
                      <button
                        type="button"
                        onClick={() => reportService.downloadRecord(row)}
                        title="Download report"
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-success-bg text-status-success-text hover:opacity-90 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        Ready
                        <Download className="w-3 h-3 ml-0.5 opacity-70" />
                      </button>
                    ) : row.status === 'Generating' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-warning-bg text-status-warning-text">
                        <Clock className="w-3 h-3" />
                        Generating
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-status-error-bg text-status-error-text">
                        <AlertCircle className="w-3 h-3" />
                        Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReportsPage;
