import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { Navbar } from '../navbar/Navbar';
import { DashboardPage } from '../../pages/Dashboard/DashboardPage';
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
    }
  }, [location.pathname, activeTab, setActiveTab]);

  return (
    <div className="flex min-h-screen bg-[#f7f5f0]">
      {/* Sidebar Navigation */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 lg:px-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' ? <DashboardPage /> : <SecondaryView />}
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

