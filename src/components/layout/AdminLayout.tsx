/**
 * Admin Desktop Layout Component
 * Houses top Market Ticker, left Admin Sidebar, Topbar, Active View, Detail Drawer, and bottom Status Bar.
 */

import React from 'react';
import { useErp } from '../../context/ErpContext';
import { MarketTicker } from '../common/MarketTicker';
import { StatusBar } from '../common/StatusBar';
import { AdminSidebar } from '../admin/AdminSidebar';
import { AdminHeader } from '../admin/AdminHeader';
import { InvestorDetailDrawer } from '../admin/InvestorDetailDrawer';

// Views
import { DashboardView } from '../admin/views/DashboardView';
import { InvestorsView } from '../admin/views/InvestorsView';
import { WithdrawalsView } from '../admin/views/WithdrawalsView';
import { ReceiptsView } from '../admin/views/ReceiptsView';
import { LedgerView } from '../admin/views/LedgerView';
import { NotificationsView } from '../admin/views/NotificationsView';
import { ReportsView } from '../admin/views/ReportsView';
import { AuditLogView } from '../admin/views/AuditLogView';
import { MarketView } from '../admin/views/MarketView';
import { ArchitectureDocsView } from '../admin/views/ArchitectureDocsView';

export const AdminLayout: React.FC = () => {
  const { activeView, selectedInvestorForDrawer, setSelectedInvestorForDrawer } = useErp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
      case 'investors':
        return <InvestorsView />;
      case 'withdrawals':
        return <WithdrawalsView />;
      case 'receipts':
        return <ReceiptsView />;
      case 'ledger':
        return <LedgerView />;
      case 'notifications':
        return <NotificationsView />;
      case 'reports':
        return <ReportsView />;
      case 'audit':
        return <AuditLogView />;
      case 'market':
        return <MarketView />;
      case 'docs':
        return <ArchitectureDocsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#0D1117] text-slate-100 overflow-hidden select-none">
      {/* 1. Top Real-time Market Ticker */}
      <MarketTicker />

      {/* 2. Middle Body: Left Sidebar + Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Fixed Sidebar */}
        <AdminSidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col overflow-hidden bg-[#0D1117]/95">
          {/* Sticky Header */}
          <AdminHeader />

          {/* Active View Scroll Container */}
          <div className="flex-1 overflow-y-auto">
            {renderActiveView()}
          </div>
        </main>

        {/* Right Slide-over Investor Detail Drawer */}
        {selectedInvestorForDrawer && (
          <InvestorDetailDrawer
            investor={selectedInvestorForDrawer}
            onClose={() => setSelectedInvestorForDrawer(null)}
          />
        )}
      </div>

      {/* 3. Bottom Sticky Telemetry Status Bar */}
      <StatusBar />
    </div>
  );
};
