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

const PATH_TO_TAB: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/farmers': 'farmers',
  '/farmers/new': 'farmers',
  '/collectors': 'collectors',
  '/collections': 'collections',
  '/tea-prices': 'tea-prices',
  '/deductions': 'deductions',
  '/deductions/loans/new': 'deductions',
  '/deductions/new': 'deductions',
  '/settlements': 'settlements',
  '/reports': 'reports',
  '/audit-log': 'audit-log',
};

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
    const matchedTab = PATH_TO_TAB[location.pathname];
    if (matchedTab && activeTab !== matchedTab) {
      setActiveTab(matchedTab);
    }
  }, [location.pathname, activeTab, setActiveTab]);

  const renderMainContent = () => {
    if (location.pathname === '/farmers/new') return <FarmerCreatePage />;
    if (location.pathname === '/deductions/loans/new') return <LoanCreatePage />;
    if (location.pathname === '/deductions/new') return <DeductionCreatePage />;
    switch (activeTab) {
      case 'dashboard':
        return <DashboardPage />;
      case 'farmers':
        return <FarmersPage />;
      case 'collectors':
        return <CollectorsPage />;
      case 'collections':
        return <CollectionsPage />;
      case 'tea-prices':
        return <TeaPricesPage />;
      case 'deductions':
        return <LoansAndDeductionsPage />;
      case 'settlements':
        return <SettlementsPage />;
      case 'reports':
        return <ReportsPage />;
      case 'audit-log':
        return <ActivityLogsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F4F6F3] font-['Inter',sans-serif]">
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
          {renderMainContent()}
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
