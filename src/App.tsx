/**
 * Trading Fund ERP — Investment & Trading Management Ecosystem
 * Dual Architecture: Desktop Admin ERP + Investor Mobile App
 * 2026 Dark Fintech Design System
 */

import React, { useEffect } from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { AdminLayout } from './components/layout/AdminLayout';
import { AdminMobileApp } from './components/mobile/AdminMobileApp';
import { InvestorMobileApp } from './components/mobile/InvestorMobileApp';
import { CommandPalette } from './components/common/CommandPalette';
import { ToastContainer } from './components/common/ToastContainer';
import { NeumorphicAuthScreen } from './components/auth/NeumorphicAuthScreen';

// Modals
import { OfficialChekModal } from './components/receipt/OfficialChekModal';
import { EditInitialLossModal } from './components/modals/EditInitialLossModal';
import { CreditTradeProfitModal } from './components/modals/CreditTradeProfitModal';
import { NewCapitalModal } from './components/modals/NewCapitalModal';
import { ManualInjectionModal } from './components/modals/ManualInjectionModal';
import { NewInvestorModal } from './components/modals/NewInvestorModal';
import { CorrectTradeSessionModal } from './components/modals/CorrectTradeSessionModal';

const ErpAppContent: React.FC = () => {
  const {
    activeTabMode,
    setActiveTabMode,
    activeModal,
    closeModal,
    modalPayload,
    selectedReceiptForModal,
    setSelectedReceiptForModal,
    investors,
    erpTheme,
  } = useErp();

  // Auto-switch to Admin Mobile if loaded on smartphone screen (< 768px)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveTabMode('admin-mobile');
    }
  }, [setActiveTabMode]);

  // Find target investor for edit-loss modal if triggered
  const editLossInvestor =
    modalPayload?.investorId
      ? investors.find((i) => i.id === modalPayload.investorId)
      : null;

  return (
    <div className={`w-screen h-screen overflow-hidden ${erpTheme === 'light' ? 'theme-light bg-[#e8e8e8] text-[#2d3748]' : 'theme-dark bg-[#0D1117] text-slate-100'} flex flex-col font-sans transition-colors duration-200`}>
      {/* View Router based on activeTabMode: 'admin' | 'admin-mobile' | 'mobile' | 'split' | 'auth' */}
      {activeTabMode === 'auth' && (
        <NeumorphicAuthScreen
          onSuccessLogin={(role) => {
            if (role === 'investor') {
              setActiveTabMode('mobile');
            } else {
              setActiveTabMode('admin');
            }
          }}
        />
      )}

      {activeTabMode === 'admin' && <AdminLayout />}

      {activeTabMode === 'admin-mobile' && (
        <div className="w-full h-full relative">
          <AdminMobileApp onBackToDesktop={() => setActiveTabMode('admin')} />
        </div>
      )}

      {activeTabMode === 'mobile' && (
        <div className="w-full h-full relative">
          <InvestorMobileApp onBackToDesktop={() => setActiveTabMode('admin')} />
        </div>
      )}

      {activeTabMode === 'split' && (
        <div className="w-full h-full flex flex-row overflow-hidden relative">
          {/* Left: Desktop ERP */}
          <div className="flex-1 h-full overflow-hidden border-r border-white/10">
            <AdminLayout />
          </div>

          {/* Right: Investor Phone Mockup for live side-by-side interactive testing */}
          <div className="w-[440px] h-full overflow-hidden bg-[#07090D] flex flex-col items-center justify-center p-3 relative shrink-0">
            <div className="absolute top-2 left-4 text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Real-time Investor App Mirror</span>
            </div>
            <InvestorMobileApp />
          </div>
        </div>
      )}

      {/* Global Interactive Command Palette (Cmd/Ctrl + K) */}
      <CommandPalette />

      {/* Official Chek (Receipt) Modal with QR Code, Print, and HMAC-SHA256 */}
      {selectedReceiptForModal && (
        <OfficialChekModal
          receipt={selectedReceiptForModal}
          onClose={() => setSelectedReceiptForModal(null)}
        />
      )}

      {/* Action Modals */}
      {activeModal === 'edit-loss' && editLossInvestor && (
        <EditInitialLossModal
          investor={editLossInvestor}
          onClose={closeModal}
        />
      )}

      {activeModal === 'trade-profit' && (
        <CreditTradeProfitModal onClose={closeModal} />
      )}

      {activeModal === 'new-capital' && (
        <NewCapitalModal onClose={closeModal} />
      )}

      {activeModal === 'manual-injection' && (
        <ManualInjectionModal onClose={closeModal} />
      )}

      {activeModal === 'new-investor' && (
        <NewInvestorModal onClose={closeModal} />
      )}

      {activeModal === 'correct-session' && (
        <CorrectTradeSessionModal onClose={closeModal} />
      )}

      {/* Global Toast Alerts */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <ErpProvider>
      <ErpAppContent />
    </ErpProvider>
  );
}
