import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import type { AdminDashboardData } from '../../types/dashboard.types';

interface DashboardHeaderProps {
  data?: AdminDashboardData;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ data }) => {
  const { setIsRecordModalOpen, addToast } = useDashboard();

  // Dynamic formatted date e.g. "Saturday, 14 November 2026"
  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleExport = async () => {
    try {
      await dashboardService.exportCollectionsReport(data);
      addToast({
        type: 'success',
        title: 'Report Exported',
        message: 'Collections summary report has been downloaded successfully.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Export Failed',
        message: 'Unable to export report at this time.',
      });
    }
  };

  return (
    <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 overflow-hidden">
      {/* Title & Subtitle */}
      <div className="flex-1 flex flex-col justify-start items-start gap-1 overflow-hidden">
        <h1 className="self-stretch justify-start text-text-primary text-2xl sm:text-3xl font-bold font-['Inter'] tracking-tight">
          Dashboard
        </h1>
        <div className="self-stretch justify-start text-text-secondary text-xs sm:text-sm font-normal font-['Inter']">
          {formattedDate} · Collections and settlements at a glance
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
        {/* Secondary: Export report */}
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-3.5 bg-surface-card rounded-xl outline outline-[1.50px] outline-offset-[-1.50px] outline-border-default hover:bg-slate-50 active:bg-slate-100 flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs"
        >
          <span className="text-brand-primary text-sm sm:text-base font-semibold font-['Inter']">
            Export report
          </span>
        </button>

        {/* Primary: Record collection */}
        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
          className="flex-1 sm:flex-initial px-4 sm:px-5 py-3 sm:py-3.5 bg-brand-primary hover:bg-brand-primary-hover active:bg-emerald-800 rounded-xl flex justify-center items-center gap-2 cursor-pointer transition-colors shadow-xs text-white"
        >
          <span className="text-text-on-primary text-sm sm:text-base font-semibold font-['Inter']">
            Record collection
          </span>
        </button>
      </div>
    </div>
  );
};
