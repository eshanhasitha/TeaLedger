import React from 'react';
import { DashboardHeader } from '../../components/dashboard/DashboardHeader';
import { NoticeBanner } from '../../components/dashboard/NoticeBanner';
import { MetricCardsGrid } from '../../components/dashboard/MetricCardsGrid';
import { DailyLeafTrendChart } from '../../components/charts/DailyLeafTrendChart';
import { OctoberFinancialStream } from '../../components/dashboard/OctoberFinancialStream';
import { RecentIntakeLogsTable } from '../../components/dashboard/RecentIntakeLogsTable';
import { UrgentCollectionRequests } from '../../components/dashboard/UrgentCollectionRequests';
import { EstateLogisticsGrid } from '../../components/dashboard/EstateLogisticsGrid';

export const DashboardPage: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* 1. Header greeting & Action Buttons */}
      <DashboardHeader />

      {/* 2. Notice Banner & Moisture Gauge */}
      <NoticeBanner />

      {/* 3. 8 KPI Metric Cards Grid */}
      <MetricCardsGrid />

      {/* 4. Visualizations: Daily Collection Trend & October Financial Stream */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <DailyLeafTrendChart />
        </div>
        <div className="lg:col-span-5">
          <OctoberFinancialStream />
        </div>
      </div>

      {/* 5. Recent Tea Leaf Intake Logs Table */}
      <RecentIntakeLogsTable />

      {/* 6. Bottom Row: Urgent Field Collection Requests & Estate Logistics Grid */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <UrgentCollectionRequests />
        </div>
        <div className="lg:col-span-5">
          <EstateLogisticsGrid />
        </div>
      </div>
    </div>
  );
};

