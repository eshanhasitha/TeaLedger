import React from 'react';
import { useDashboard } from '../../hooks/useDashboard';
import { dashboardService } from '../../services/dashboardService';
import type { AdminDashboardData } from '../../types/dashboard.types';

interface DashboardHeaderProps {
  data?: AdminDashboardData;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ data }) => {
  const { setIsRecordModalOpen, addToast } = useDashboard();

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
    <div className="self-stretch flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex-1 flex flex-col justify-start items-start gap-1">
        <h1 className="text-[#17201B] text-2xl sm:text-[26px] font-bold tracking-tight">
          Dashboard
        </h1>
        <div className="text-[#56625B] text-[13px] font-normal">
          {formattedDate} · Collections and settlements at a glance
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
        <button
          type="button"
          onClick={handleExport}
          className="flex-1 sm:flex-initial px-4 py-2.5 bg-white border border-[#DCE2DC] hover:bg-[#F4F6F3] rounded-lg flex justify-center items-center gap-2 cursor-pointer transition-colors"
        >
          <span className="text-[#17201B] text-sm font-semibold">
            Export report
          </span>
        </button>

        <button
          type="button"
          onClick={() => setIsRecordModalOpen(true)}
          className="flex-1 sm:flex-initial px-4 py-2.5 bg-[#0B5D3B] hover:bg-[#08472D] rounded-lg flex justify-center items-center gap-2 cursor-pointer transition-colors text-white"
        >
          <span className="text-white text-sm font-semibold">
            Record collection
          </span>
        </button>
      </div>
    </div>
  );
};
