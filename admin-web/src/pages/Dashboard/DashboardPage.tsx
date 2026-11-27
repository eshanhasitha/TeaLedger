import React, { useEffect, useState } from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { MetricCardsGrid } from '../../components/dashboard/MetricCardsGrid';
import { WeeklyCollectionsChart } from '../../components/dashboard/WeeklyCollectionsChart';
import { OpenRequestsPanel } from '../../components/dashboard/OpenRequestsPanel';
import { RecentCollectionsTable } from '../../components/dashboard/RecentCollectionsTable';
import { dashboardService, INITIAL_DASHBOARD_DATA } from '../../services/dashboardService';
import type { AdminDashboardData } from '../../types/dashboard.types';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>(INITIAL_DASHBOARD_DATA);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboard = () => {
    setIsLoading(true);
    setErrorMessage(null);

    dashboardService
      .getDashboardData()
      .then((data) => {
        setDashboardData(data);
        setIsLoading(false);
      })
      .catch((err: unknown) => {
        const msg =
          err instanceof Error
            ? err.message
            : 'Failed to connect to backend dashboard service.';
        setErrorMessage(msg);
        setDashboardData(INITIAL_DASHBOARD_DATA);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;

    dashboardService
      .getDashboardData()
      .then((data) => {
        if (!ignore) {
          setDashboardData(data);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg =
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend dashboard service.';
          setErrorMessage(msg);
          setDashboardData(INITIAL_DASHBOARD_DATA);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <div className="w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-start items-start gap-6 font-['Inter',sans-serif]">
      {/* Backend Connection Error Banner */}
      {errorMessage && (
        <div className="w-full p-4 rounded-xl border border-amber-200 bg-amber-50/90 text-amber-900 flex items-center justify-between text-xs sm:text-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="size-4 sm:size-5 text-amber-700 shrink-0" />
            <div>
              <span className="font-semibold">Notice:</span> {errorMessage} Displaying offline cached estate data.
            </div>
          </div>
          <button
            type="button"
            onClick={fetchDashboard}
            disabled={isLoading}
            className="px-3 py-1.5 bg-amber-200/60 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Retry
          </button>
        </div>
      )}

      {/* 1. Header (Greeting, Date & Action Buttons) */}
      <DashboardHeader data={dashboardData} />

      {/* 2. Top Metric Cards (4 Quick Stat Cards) */}
      <MetricCardsGrid stats={dashboardData.stats} />

      {/* 3. Middle Section: Verified Collections 7-Day Chart & Open Requests */}
      <div className="self-stretch flex flex-col lg:flex-row justify-start items-stretch gap-4 overflow-hidden">
        {/* Verified Collections, Last 7 Days (kg) */}
        <WeeklyCollectionsChart trend={dashboardData.weeklyTrend} />

        {/* Open Tea-Ready Requests */}
        <OpenRequestsPanel requests={dashboardData.openRequests} />
      </div>

      {/* 4. Bottom Section: Recent Collections Table */}
      <RecentCollectionsTable
        collections={dashboardData.recentCollections}
        totalCount={dashboardData.totalCollectionsCount}
      />
    </div>
  );
};
