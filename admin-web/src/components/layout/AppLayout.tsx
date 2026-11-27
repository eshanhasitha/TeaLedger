import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Navbar } from '../navbar/Navbar';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
import { FarmersPage } from '../../pages/Farmers/FarmersPage';
import { FarmerCreatePage } from '../../pages/Farmers/FarmerCreatePage';
import { CollectorsPage } from '../../pages/Collectors/CollectorsPage';
import { CollectionsPage } from '../../pages/Collections/CollectionsPage';
import { TeaPricesPage } from '../../pages/TeaPrices/TeaPricesPage';
import { LoansAndDeductionsPage } from '../../pages/Loans/LoansAndDeductionsPage';
import { LoanCreatePage } from '../../pages/Loans/LoanCreatePage';
import { DeductionCreatePage } from '../../pages/Loans/DeductionCreatePage';
import { SettlementsPage } from '../../pages/Settlements/SettlementsPage';
import { ReportsPage } from '../../pages/Reports/ReportsPage';
import { ActivityLogsPage } from '../../pages/ActivityLogs/ActivityLogsPage';
import { SecondaryView } from '../../pages/SecondaryView';
import { useDashboard } from '../../hooks/useDashboard';
import { RecordCollectionModal } from '../modals/RecordCollectionModal';
import { AddFarmerModal } from '../modals/AddFarmerModal';
import { AddCollectorModal } from '../modals/AddCollectorModal';
import { CollectorDetailDrawer } from '../drawers/CollectorDetailDrawer';
import { MonthlySettlementModal } from '../modals/MonthlySettlementModal';
import { SendNotificationModal } from '../modals/SendNotificationModal';
import { ReviewSlipModal } from '../modals/ReviewSlipModal';
import { PrintSlipModal } from '../modals/PrintSlipModal';
import { AuditModal } from '../modals/AuditModal';
import { ToastContainer } from '../ui/ToastContainer';

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const {
    activeTab,
    setActiveTab,
    selectedCollectorForDetail,
    setSelectedCollectorForDetail,
    updateCollectorStatus,
  } = useDashboard();

  useEffect(() => {
    if (location.pathname === '/collectors' && activeTab !== 'collectors') {
      setActiveTab('collectors');
    } else if (location.pathname === '/collections' && activeTab !== 'collections') {
      setActiveTab('collections');
    } else if (location.pathname === '/tea-prices' && activeTab !== 'tea-prices') {
      setActiveTab('tea-prices');
    } else if (
      (location.pathname === '/deductions' ||
        location.pathname === '/deductions/loans/new' ||
        location.pathname === '/deductions/new') &&
      activeTab !== 'deductions'
    ) {
      setActiveTab('deductions');
    } else if (
      (location.pathname === '/farmers' || location.pathname === '/farmers/new') &&
      activeTab !== 'farmers'
    ) {
      setActiveTab('farmers');
    } else if (location.pathname === '/settlements' && activeTab !== 'settlements') {
      setActiveTab('settlements');
    } else if (location.pathname === '/reports' && activeTab !== 'reports') {
      setActiveTab('reports');
    } else if (location.pathname === '/audit-log' && activeTab !== 'audit-log') {
      setActiveTab('audit-log');
    } else if (location.pathname === '/dashboard' && activeTab !== 'dashboard') {
      setActiveTab('dashboard');
    }
  }, [location.pathname, activeTab, setActiveTab]);

  return (
    <div className="flex min-h-screen bg-surface-bg font-['Inter',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile top navigation header with drawer toggle */}
        <div className="lg:hidden">
          <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        </div>

        <main className="flex-1 w-full min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' ? (
            <DashboardPage />
          ) : location.pathname === '/farmers/new' ? (
            <FarmerCreatePage />
          ) : activeTab === 'farmers' ? (
            <FarmersPage />
          ) : activeTab === 'collectors' ? (
            <CollectorsPage />
          ) : activeTab === 'collections' ? (
            <CollectionsPage />
          ) : activeTab === 'tea-prices' ? (
            <TeaPricesPage />
          ) : location.pathname === '/deductions/loans/new' ? (
            <LoanCreatePage />
          ) : location.pathname === '/deductions/new' ? (
            <DeductionCreatePage />
          ) : activeTab === 'deductions' ? (
            <LoansAndDeductionsPage />
          ) : activeTab === 'settlements' ? (
            <SettlementsPage />
          ) : activeTab === 'reports' ? (
            <ReportsPage />
          ) : activeTab === 'audit-log' ? (
            <ActivityLogsPage />
          ) : (
            <SecondaryView />
          )}
        </main>
      </div>

      {/* Interactive Modals */}
      <RecordCollectionModal />
      <AddFarmerModal />
      <AddCollectorModal />
      <CollectorDetailDrawer
        collector={selectedCollectorForDetail}
        isOpen={Boolean(selectedCollectorForDetail)}
        onClose={() => setSelectedCollectorForDetail(null)}
        onUpdateStatus={updateCollectorStatus}
      />
      <MonthlySettlementModal />
      <SendNotificationModal />
      <ReviewSlipModal />
      <PrintSlipModal />
      <AuditModal />

      {/* Toast Alert System */}
      <ToastContainer />
    </div>
  );
};
