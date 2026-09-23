/**
 * Global ERP State Management Provider
 * Connects Desktop Admin and Investor Mobile App into a unified, real-time ecosystem.
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Investor,
  WithdrawalRequest,
  OfficialReceipt,
  LedgerEntry,
  AuditLogItem,
  PushNotification,
  MarketRate,
  PaymentMethod,
  TradeSession,
} from '../types/erp';
import {
  INITIAL_INVESTORS,
  INITIAL_WITHDRAWALS,
  INITIAL_RECEIPTS,
  INITIAL_LEDGER,
  INITIAL_AUDIT_LOGS,
  INITIAL_NOTIFICATIONS,
  INITIAL_MARKET_RATES,
} from '../data/mockData';
import { FinancialEngine } from '../services/financialEngine';

export const INITIAL_TRADE_SESSIONS: TradeSession[] = [
  {
    id: 'ses-001',
    sessionNumber: 'SES-2026-001',
    date: '2026-09-20',
    totalProfit: 30000,
    investorPoolSharePercent: 50,
    investorPoolAmount: 15000,
    fundShareAmount: 15000,
    totalEligibleBalance: 327200,
    distributionMode: 'ALL_BALANCES_INCLUDING_OLD',
    status: 'ACTIVE',
    notes: 'Kechagi XAU/USD va EUR/USD savdo sessiyasi daromadi (50/50 barcha balanslarga taqsimot)',
    createdAt: '2026-09-20T16:30:00Z',
    updatedAt: '2026-09-20T16:30:00Z',
    allocations: [
      {
        investorId: 'inv-001',
        investorName: 'Dilshod Karimov',
        investorType: 'OLD',
        balanceBefore: 26000,
        eligibleBalance: 26000,
        isEligible: true,
        eligibilityReason: "Eski balans bo'yicha ulush (Zararni tiklash hisobiga)",
        weightPercent: 7.9462,
        allocatedShare: 1191.93,
        balanceAfter: 27191.93,
        newCapitalBefore: 0,
        newCapitalAfter: 0,
        recoveryBefore: 52.0,
        recoveryAfter: 54.38,
      },
      {
        investorId: 'inv-002',
        investorName: 'Jasur Alimov',
        investorType: 'OLD',
        balanceBefore: 47000,
        eligibleBalance: 47000,
        isEligible: true,
        eligibilityReason: 'Eski balans ($32,000) tiklanishiga + Yangi kapital ($15,000)',
        weightPercent: 14.3643,
        allocatedShare: 2154.65,
        balanceAfter: 49154.65,
        newCapitalBefore: 15000,
        newCapitalAfter: 15687.66,
        recoveryBefore: 40.0,
        recoveryAfter: 41.83,
      },
      {
        investorId: 'inv-003',
        investorName: 'Nilufar Umarova',
        investorType: 'NEW',
        balanceBefore: 64200,
        eligibleBalance: 64200,
        isEligible: true,
        eligibilityReason: "Yangi investor (Balansi bo'yicha to'liq ulush)",
        weightPercent: 19.6210,
        allocatedShare: 2943.15,
        balanceAfter: 67143.15,
        newCapitalBefore: 64200,
        newCapitalAfter: 67143.15,
        recoveryBefore: 100,
        recoveryAfter: 100,
      },
      {
        investorId: 'inv-004',
        investorName: 'Bobur Mirzayev',
        investorType: 'OLD',
        balanceBefore: 24500,
        eligibleBalance: 24500,
        isEligible: true,
        eligibilityReason: "Eski balans bo'yicha ulush (Zararni tiklash hisobiga)",
        weightPercent: 7.4878,
        allocatedShare: 1123.17,
        balanceAfter: 25623.17,
        newCapitalBefore: 0,
        newCapitalAfter: 0,
        recoveryBefore: 98.0,
        recoveryAfter: 100.0,
      },
      {
        investorId: 'inv-005',
        investorName: 'Otabek Rashidov',
        investorType: 'NEW',
        balanceBefore: 110500,
        eligibleBalance: 110500,
        isEligible: true,
        eligibilityReason: "Yangi investor (Balansi bo'yicha to'liq ulush)",
        weightPercent: 33.7714,
        allocatedShare: 5065.71,
        balanceAfter: 115565.71,
        newCapitalBefore: 110500,
        newCapitalAfter: 115565.71,
        recoveryBefore: 100,
        recoveryAfter: 100,
      },
      {
        investorId: 'inv-006',
        investorName: 'Ziyoda Yusupova',
        investorType: 'OLD',
        balanceBefore: 55000,
        eligibleBalance: 55000,
        isEligible: true,
        eligibilityReason: "100% tiklangan investor (Balansi bo'yicha to'liq ulush)",
        weightPercent: 16.8093,
        allocatedShare: 2521.39,
        balanceAfter: 57521.39,
        newCapitalBefore: 15000,
        newCapitalAfter: 17521.39,
        recoveryBefore: 100,
        recoveryAfter: 100,
      },
    ],
  },
];

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
}

interface ErpContextType {
  // Core Entities
  investors: Investor[];
  withdrawals: WithdrawalRequest[];
  receipts: OfficialReceipt[];
  ledger: LedgerEntry[];
  auditLogs: AuditLogItem[];
  notifications: PushNotification[];
  marketRates: MarketRate[];
  tradeSessions: TradeSession[];
  
  // Navigation & View State
  activeView: string;
  setActiveView: (view: string) => void;
  activeTabMode: 'admin' | 'admin-mobile' | 'mobile' | 'split';
  setActiveTabMode: (mode: 'admin' | 'admin-mobile' | 'mobile' | 'split') => void;
  
  // Active Investor for Mobile App
  activeMobileInvestorId: string;
  setActiveMobileInvestorId: (id: string) => void;
  activeMobileInvestor: Investor | undefined;
  
  // Modals & Panels
  selectedInvestorForDrawer: Investor | null;
  setSelectedInvestorForDrawer: (inv: Investor | null) => void;
  selectedReceiptForModal: OfficialReceipt | null;
  setSelectedReceiptForModal: (receipt: OfficialReceipt | null) => void;
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  activeModal: string | null;
  modalPayload: any;
  openModal: (modalName: string, payload?: any) => void;
  closeModal: () => void;
  
  // Toasts
  toasts: ToastItem[];
  addToast: (type: ToastItem['type'], message: string, title?: string) => void;
  removeToast: (id: string) => void;
  
  // Financial Actions
  addInvestor: (investorData: Omit<Investor, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'recoveredAmount' | 'recovery'>) => void;
  inlineUpdateBalance: (investorId: string, newBalance: number, notes?: string) => void;
  updateInitialLoss: (investorId: string, newInitialLoss: number) => void;
  addFreshCapital: (investorId: string, amount: number, notes?: string) => void;
  applyTradeProfitCredit: (investorId: string, profitAmount: number) => void;
  applyManualInjection: (investorId: string, amount: number, notes?: string) => void;

  // Fund-Level Trade Sessions (50/50 distribution & Correction)
  distributeTradeSession: (
    totalProfit: number,
    notes?: string,
    investorPoolPercent?: number,
    mode?: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY'
  ) => void;
  correctTradeSession: (sessionId: string, newTotalProfit: number, reason: string) => void;
  rollbackTradeSession: (sessionId: string, reason: string) => void;
  
  // Withdrawal Lifecycle Actions
  requestWithdrawal: (investorId: string, amount: number, method: PaymentMethod, destinationDetails: string) => boolean;
  markWithdrawalAsSent: (withdrawalId: string) => void;
  markWithdrawalSent: (withdrawalId: string) => void;
  submitProofOfReceipt: (withdrawalId: string, screenshotUrl: string, videoUrl: string, notes?: string) => void;
  submitWithdrawalProof: (withdrawalId: string, videoUrl: string, screenshotUrl: string, notes?: string) => void;
  finalizeWithdrawal: (withdrawalId: string) => void;
  rejectWithdrawal: (withdrawalId: string, reason: string) => void;
  
  // Utilities
  sendPushNotification: (investorId: string, title: string, message: string, type?: 'info' | 'success' | 'warning' | 'alert') => void;
  exportLedgerCsv: () => void;
  exportInvestorsCsv: () => void;
  markNotificationRead: (id: string) => void;
}

const ErpContext = createContext<ErpContextType | null>(null);

export const ErpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [investors, setInvestors] = useState<Investor[]>(INITIAL_INVESTORS);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(INITIAL_WITHDRAWALS);
  const [receipts, setReceipts] = useState<OfficialReceipt[]>(INITIAL_RECEIPTS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<PushNotification[]>(INITIAL_NOTIFICATIONS);
  const [marketRates, setMarketRates] = useState<MarketRate[]>(INITIAL_MARKET_RATES);
  const [tradeSessions, setTradeSessions] = useState<TradeSession[]>(INITIAL_TRADE_SESSIONS);

  // Layout View Controls
  const [activeView, setActiveView] = useState<string>('dashboard');
  const [activeTabMode, setActiveTabMode] = useState<'admin' | 'admin-mobile' | 'mobile' | 'split'>('admin');
  const [activeMobileInvestorId, setActiveMobileInvestorId] = useState<string>('inv-001');

  // Modals & Drawers
  const [selectedInvestorForDrawer, setSelectedInvestorForDrawer] = useState<Investor | null>(null);
  const [selectedReceiptForModal, setSelectedReceiptForModal] = useState<OfficialReceipt | null>(null);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalPayload, setModalPayload] = useState<any>(null);

  // Toasts
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string, title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const openModal = useCallback((name: string, payload?: any) => {
    setActiveModal(name);
    setModalPayload(payload || null);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setModalPayload(null);
  }, []);

  // Active investor object for mobile app
  const activeMobileInvestor = useMemo(() => {
    return investors.find((inv) => inv.id === activeMobileInvestorId) || investors[0];
  }, [investors, activeMobileInvestorId]);

  // Periodic Market Rate Fluctuation Simulation (Real-time feel)
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketRates((prev) =>
        prev.map((rate) => {
          const delta = (Math.random() - 0.49) * (rate.price * 0.0008);
          const newPrice = Number((rate.price + delta).toFixed(rate.symbol === 'EURUSD' ? 4 : rate.symbol === 'UZS/USD' ? 1 : 2));
          const newSparkline = [...rate.sparkline.slice(1), newPrice];
          return {
            ...rate,
            price: newPrice,
            sparkline: newSparkline,
            lastUpdated: 'Live',
          };
        })
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // 24-Hour SLA Auto-Expiry Checker (every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setWithdrawals((prev) =>
        prev.map((w) => {
          if (w.status === 'PENDING' && new Date(w.slaDeadline).getTime() <= now) {
            addToast('warning', `Withdrawal ${w.requestNumber} for ${w.investorName} has expired past the 24h SLA.`, 'SLA Expired');
            return {
              ...w,
              status: 'EXPIRED',
              rejectionReason: '24-hour SLA expired without execution',
            };
          }
          return w;
        })
      );
    }, 10000);
    return () => clearInterval(interval);
  }, [addToast]);

  // Keyboard shortcut for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Action: Add New Investor
  const addInvestor = useCallback(
    (data: Omit<Investor, 'id' | 'code' | 'createdAt' | 'updatedAt' | 'recoveredAmount' | 'recovery'>) => {
      const id = `inv-${(investors.length + 1).toString().padStart(3, '0')}`;
      const code = `INV-${(investors.length + 1).toString().padStart(3, '0')}`;
      const isOld = data.type === 'OLD';
      const initialLoss = isOld ? Math.max(0, data.initialLoss) : 0;
      const initialBalance = data.balance || 0;
      const initialNewCapital = isOld ? (data.newCapital || 0) : initialBalance;
      
      const newInvestor: Investor = {
        ...data,
        id,
        code,
        initialLoss,
        recoveredAmount: 0,
        balance: initialBalance,
        newCapital: initialNewCapital,
        recovery: isOld ? 0 : 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setInvestors((prev) => [newInvestor, ...prev]);

      // Write to Ledger if there's starting balance or loss
      const newLedgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId: id,
        investorName: newInvestor.fullName,
        timestamp: new Date().toISOString(),
        type: isOld ? 'INITIAL_LOSS_REGISTRATION' : 'NEW_CAPITAL_DEPOSIT',
        amount: initialBalance,
        balanceBefore: 0,
        balanceAfter: initialBalance,
        newCapitalBefore: 0,
        newCapitalAfter: initialNewCapital,
        recoveryBefore: 0,
        recoveryAfter: newInvestor.recovery,
        description: isOld
          ? `Boshlang'ich zarar ro'yxatga olindi: $${initialLoss.toLocaleString()} (Balans: $${initialBalance.toLocaleString()})`
          : `Yangi investor ro'yxatga olindi va boshlang'ich depozit kiritildi: $${initialBalance.toLocaleString()}`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [newLedgerEntry, ...prev]);

      // Write to Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'INVESTOR_CREATED',
        category: 'INVESTOR',
        targetId: id,
        targetName: newInvestor.fullName,
        details: `Investor ${newInvestor.fullName} (${code}, ${data.type}) created with initial balance $${initialBalance.toLocaleString()}.`,
        afterState: newInvestor,
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast('success', `${newInvestor.fullName} successfully registered into ERP.`, 'Investor Added');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Inline Balance Edit (Double-click in grid)
  const inlineUpdateBalance = useCallback(
    (investorId: string, newBalance: number, notes?: string) => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv) return;
      if (inv.balance === newBalance) return;

      const balanceDelta = Number((newBalance - inv.balance).toFixed(2));
      const oldBalance = inv.balance;

      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === investorId) {
            return {
              ...i,
              balance: newBalance,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Ledger Entry (Rule: Never silent edit)
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId,
        investorName: inv.fullName,
        timestamp: new Date().toISOString(),
        type: 'INLINE_BALANCE_CORRECTION',
        amount: balanceDelta,
        balanceBefore: oldBalance,
        balanceAfter: newBalance,
        newCapitalBefore: inv.newCapital,
        newCapitalAfter: inv.newCapital,
        recoveryBefore: inv.recovery,
        recoveryAfter: inv.recovery,
        description: `Jadvaldan to'g'ridan-to'g'ri o'zgartirish: ${notes || 'Kassaviy farq yoki admin qo\'lda to\'g\'rilashi'} ($${oldBalance.toLocaleString()} -> $${newBalance.toLocaleString()})`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'INLINE_BALANCE_CORRECTION',
        category: 'LEDGER',
        targetId: investorId,
        targetName: inv.fullName,
        details: `Balance updated directly in data grid from $${oldBalance.toLocaleString()} to $${newBalance.toLocaleString()} (delta: ${balanceDelta > 0 ? '+' : ''}$${balanceDelta.toLocaleString()}). Reason: ${notes || 'Manual correction'}`,
        beforeState: { balance: oldBalance },
        afterState: { balance: newBalance },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast('info', `Balance for ${inv.fullName} updated to $${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}.`, 'Balance Corrected');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Update Initial Loss (Editable with live recalculation preview preserving recovered dollars)
  const updateInitialLoss = useCallback(
    (investorId: string, newInitialLoss: number) => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv || inv.type !== 'OLD') return;

      const preview = FinancialEngine.previewInitialLossCorrection(inv, newInitialLoss);
      const oldLoss = inv.initialLoss;

      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === investorId) {
            return {
              ...i,
              initialLoss: newInitialLoss,
              recovery: preview.newRecoveryPercent,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Ledger Entry
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId,
        investorName: inv.fullName,
        timestamp: new Date().toISOString(),
        type: 'LOSS_CORRECTION_ADJUSTMENT',
        amount: 0,
        balanceBefore: inv.balance,
        balanceAfter: inv.balance,
        newCapitalBefore: inv.newCapital,
        newCapitalAfter: inv.newCapital,
        recoveryBefore: preview.oldRecoveryPercent,
        recoveryAfter: preview.newRecoveryPercent,
        description: `Boshlang'ich zarar to'g'rilandi: $${oldLoss.toLocaleString()} -> $${newInitialLoss.toLocaleString()}. Tiklanish foizi qayta hisoblandi: ${preview.oldRecoveryPercent}% -> ${preview.newRecoveryPercent}% (Mavjud $${preview.recoveredDollarAmount.toLocaleString()} saqlandi)`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'INITIAL_LOSS_CORRECTION',
        category: 'INVESTOR',
        targetId: investorId,
        targetName: inv.fullName,
        details: `Initial loss changed from $${oldLoss.toLocaleString()} to $${newInitialLoss.toLocaleString()}. Recovery % recalculated from ${preview.oldRecoveryPercent}% to ${preview.newRecoveryPercent}%.`,
        beforeState: { initialLoss: oldLoss, recovery: preview.oldRecoveryPercent },
        afterState: { initialLoss: newInitialLoss, recovery: preview.newRecoveryPercent },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast('success', `Initial loss updated. Recovery recalculated to ${preview.newRecoveryPercent}%.`, 'Loss Corrected');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Add Fresh New Capital to an OLD Investor
  const addFreshCapital = useCallback(
    (investorId: string, amount: number, notes?: string) => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv) return;

      const newCapitalBefore = inv.newCapital;
      const newCapitalAfter = Number((newCapitalBefore + amount).toFixed(2));
      const balanceBefore = inv.balance;
      const balanceAfter = Number((balanceBefore + amount).toFixed(2));

      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === investorId) {
            return {
              ...i,
              balance: balanceAfter,
              newCapital: newCapitalAfter,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Ledger Entry
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId,
        investorName: inv.fullName,
        timestamp: new Date().toISOString(),
        type: 'NEW_CAPITAL_DEPOSIT',
        amount,
        balanceBefore,
        balanceAfter,
        newCapitalBefore,
        newCapitalAfter,
        recoveryBefore: inv.recovery,
        recoveryAfter: inv.recovery, // Untouched!
        description: `Yangi depozit (New Capital): +$${amount.toLocaleString()} ${notes ? `(${notes})` : ''} - Tiklanish foiziga daxlsiz, 50/50 taqsimotga to'liq munosib`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'NEW_CAPITAL_ADDED',
        category: 'INVESTOR',
        targetId: investorId,
        targetName: inv.fullName,
        details: `Added $${amount.toLocaleString()} fresh new capital. Total new capital is now $${newCapitalAfter.toLocaleString()}. Recovery % untouched (${inv.recovery}%).`,
        beforeState: { newCapital: newCapitalBefore, balance: balanceBefore },
        afterState: { newCapital: newCapitalAfter, balance: balanceAfter },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // Push Notification to investor
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        investorId,
        title: "Yangi kapital (New Capital) qo'shildi",
        message: `Hisobingizga $${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} yangi kapital kiritildi. Ushbu mablag' 50/50 foyda taqsimotiga munosib va yechib olish mumkin.`,
        type: 'PROFIT_DISTRIBUTION',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      addToast('success', `+$${amount.toLocaleString()} New Capital added for ${inv.fullName}.`, 'New Capital Deposited');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Credit Trade Profit (Handles proportional split for mixed investors)
  const applyTradeProfitCredit = useCallback(
    (investorId: string, profitAmount: number) => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv) return;

      const calc = FinancialEngine.calculateProfitCredit(inv, profitAmount);

      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === investorId) {
            return {
              ...i,
              balance: calc.balanceAfter,
              newCapital: calc.newCapitalAfter,
              recoveredAmount: calc.recoveredAmountAfter,
              recovery: calc.recoveryPercentAfter,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Ledger Entry
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId,
        investorName: inv.fullName,
        timestamp: new Date().toISOString(),
        type: calc.isMixed
          ? 'PROFIT_SPLIT_INVESTOR'
          : inv.type === 'NEW' || inv.recovery >= 100
          ? 'PROFIT_SPLIT_INVESTOR'
          : 'RECOVERY_CREDIT',
        amount: calc.investorShare,
        balanceBefore: calc.balanceBefore,
        balanceAfter: calc.balanceAfter,
        newCapitalBefore: calc.newCapitalBefore,
        newCapitalAfter: calc.newCapitalAfter,
        recoveryBefore: calc.recoveryPercentBefore,
        recoveryAfter: calc.recoveryPercentAfter,
        description: calc.isMixed
          ? `Aralash investor daromad taqsimoti (Jami: $${profitAmount.toLocaleString()}): Tiklanishga 100% -> $${calc.recoveringProfitCredit.toLocaleString()}; Yangi kapitaldan 50/50 -> Investor $${calc.investorShare - calc.recoveringProfitCredit}, Fond $${calc.fundShare}`
          : inv.type === 'OLD' && inv.recovery < 100
          ? `Savdo daromadidan 100% tiklashga kreditlandi: +$${profitAmount.toLocaleString()} (Tiklanish: ${calc.recoveryPercentBefore}% -> ${calc.recoveryPercentAfter}%)`
          : `Savdo daromadi 50/50 taqsimlandi: Investor $${calc.investorShare.toLocaleString()}, Fond $${calc.fundShare.toLocaleString()}`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'TRADE_PROFIT_CREDITED',
        category: 'LEDGER',
        targetId: investorId,
        targetName: inv.fullName,
        details: `Trade profit of $${profitAmount.toLocaleString()} credited. Investor share: $${calc.investorShare.toLocaleString()}, Fund share: $${calc.fundShare.toLocaleString()}. Recovery % moved to ${calc.recoveryPercentAfter}%.`,
        beforeState: { balance: calc.balanceBefore, recovery: calc.recoveryPercentBefore },
        afterState: { balance: calc.balanceAfter, recovery: calc.recoveryPercentAfter },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // Push Notification if recovery increased
      if (calc.recoveryPercentAfter > calc.recoveryPercentBefore) {
        const notif: PushNotification = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toISOString(),
          investorId,
          title: 'Tiklanish foizi oshdi!',
          message: `Tabriklaymiz! Sizning zararni tiklash ko'rsatkichi ${calc.recoveryPercentAfter.toFixed(1)}% ga ko'tarildi ($${calc.recoveredAmountAfter.toLocaleString()} / $${inv.initialLoss.toLocaleString()}).`,
          type: 'RECOVERY_UPDATE',
          read: false,
        };
        setNotifications((prev) => [notif, ...prev]);
      }

      addToast('success', `Trade profit of $${profitAmount.toLocaleString()} processed for ${inv.fullName}.`, 'Profit Credited');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Apply Manual Capital Injection to OLD Investor recovering balance
  const applyManualInjection = useCallback(
    (investorId: string, amount: number, notes?: string) => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv) return;

      const res = FinancialEngine.applyManualInjection(inv, amount);

      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === investorId) {
            return {
              ...i,
              balance: res.balanceAfter,
              recoveredAmount: res.recoveredAmountAfter,
              recovery: res.recoveryPercentAfter,
              updatedAt: new Date().toISOString(),
            };
          }
          return i;
        })
      );

      // Ledger Entry
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId,
        investorName: inv.fullName,
        timestamp: new Date().toISOString(),
        type: 'MANUAL_INJECTION',
        amount,
        balanceBefore: inv.balance,
        balanceAfter: res.balanceAfter,
        newCapitalBefore: inv.newCapital,
        newCapitalAfter: inv.newCapital,
        recoveryBefore: inv.recovery,
        recoveryAfter: res.recoveryPercentAfter,
        description: `Qo'lda kapital inyeksiyasi: +$${amount.toLocaleString()} ${notes ? `(${notes})` : ''} - Tiklanish hisobiga qo'shildi (${inv.recovery}% -> ${res.recoveryPercentAfter}%)`,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'MANUAL_INJECTION',
        category: 'LEDGER',
        targetId: investorId,
        targetName: inv.fullName,
        details: `Manual capital injection of $${amount.toLocaleString()} applied to recovering balance. Recovery updated to ${res.recoveryPercentAfter}%.`,
        beforeState: { balance: inv.balance, recovery: inv.recovery },
        afterState: { balance: res.balanceAfter, recovery: res.recoveryPercentAfter },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // Push Notification
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        investorId,
        title: 'Kapital inyeksiyasi qabul qilindi',
        message: `Hisobingizga $${amount.toLocaleString()} qo'shildi. Tiklanish foizi: ${res.recoveryPercentAfter.toFixed(1)}%.`,
        type: 'RECOVERY_UPDATE',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      addToast('success', `+$${amount.toLocaleString()} injected into recovery balance for ${inv.fullName}.`, 'Injection Successful');
    },
    [investors, ledger.length, addToast]
  );

  // Action: Distribute Fund Trade Session (e.g. $40,000 profit: 50% fund, 50% proportional to investor balances)
  const distributeTradeSession = useCallback(
    (
      totalProfit: number,
      notes?: string,
      investorPoolPercent: number = 50,
      mode: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY' = 'ALL_BALANCES_INCLUDING_OLD'
    ) => {
      const calculation = FinancialEngine.calculateSessionDistribution(
        investors,
        totalProfit,
        investorPoolPercent,
        mode
      );

      const sessionNum = `SES-2026-00${tradeSessions.length + 1}`;
      const now = new Date();

      const newSession: TradeSession = {
        id: `ses-${Date.now()}`,
        sessionNumber: sessionNum,
        date: now.toISOString().slice(0, 10),
        totalProfit: calculation.totalProfit,
        investorPoolSharePercent: calculation.investorPoolPercent,
        investorPoolAmount: calculation.investorPoolAmount,
        fundShareAmount: calculation.fundShareAmount,
        totalEligibleBalance: calculation.totalEligibleBalance,
        distributionMode: calculation.distributionMode,
        status: 'ACTIVE',
        notes: notes || `${now.toLocaleDateString('uz-UZ')} savdo foydasi (50/50 taqsimot)`,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        allocations: calculation.allocations.map((a) => ({
          investorId: a.investorId,
          investorName: a.investorName,
          investorType: a.investorType,
          balanceBefore: a.balanceBefore,
          eligibleBalance: a.eligibleBalance,
          isEligible: a.isEligible,
          eligibilityReason: a.eligibilityReason,
          weightPercent: a.weightPercent,
          allocatedShare: a.allocatedShare,
          balanceAfter: a.balanceAfter,
          newCapitalBefore: a.newCapitalBefore,
          newCapitalAfter: a.newCapitalAfter,
          recoveryBefore: a.recoveryBefore,
          recoveryAfter: a.recoveryAfter,
        })),
      };

      // 1. Update investors balances & recovery
      setInvestors((prev) =>
        prev.map((inv) => {
          const alloc = calculation.allocations.find((a) => a.investorId === inv.id);
          if (!alloc) return inv;
          return {
            ...inv,
            balance: alloc.balanceAfter,
            newCapital: alloc.newCapitalAfter ?? inv.newCapital,
            recoveredAmount: alloc.recoveredAmountAfter,
            recovery: alloc.recoveryAfter,
            updatedAt: now.toISOString(),
          };
        })
      );

      // 2. Append session
      setTradeSessions((prev) => [newSession, ...prev]);

      // 3. Double-entry Ledger entries
      const newLedgerEntries: LedgerEntry[] = calculation.allocations.map((a, idx) => ({
        id: `led-${Date.now()}-${idx}`,
        entryNumber: `LED-2026-${String(ledger.length + idx + 1).padStart(4, '0')}`,
        investorId: a.investorId,
        investorName: a.investorName,
        timestamp: now.toISOString(),
        type: 'TRADE_SESSION_DISTRIBUTION',
        amount: a.allocatedShare,
        balanceBefore: a.balanceBefore,
        balanceAfter: a.balanceAfter,
        newCapitalBefore: a.newCapitalBefore ?? 0,
        newCapitalAfter: a.newCapitalAfter ?? 0,
        recoveryBefore: a.recoveryBefore,
        recoveryAfter: a.recoveryAfter,
        description: a.isEligible
          ? `Savdo sessiyasi ${sessionNum}: Jami $${calculation.totalProfit.toLocaleString()} foydadan: +$${a.allocatedShare.toLocaleString()} (${a.eligibilityReason})`
          : `Savdo sessiyasi ${sessionNum}: $0 foyda (${a.eligibilityReason})`,
        referenceId: newSession.id,
        performedBy: 'Treydor Admin (Tolib I.)',
      }));

      setLedger((prev) => [...newLedgerEntries, ...prev]);

      // 4. Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: 'Treydor Admin (Tolib I.)',
        action: 'TRADE_SESSION_DISTRIBUTED',
        category: 'LEDGER',
        targetId: newSession.id,
        targetName: sessionNum,
        details: `Umumiy savdo daromadi $${calculation.totalProfit.toLocaleString()} kiritildi. Investorlar hovuziga 50% ($${calculation.investorPoolAmount.toLocaleString()}), Treydor/Fondga 50% ($${calculation.fundShareAmount.toLocaleString()}) ajratildi. Jami ishtirok etuvchi kapital: $${calculation.totalEligibleBalance.toLocaleString()}.`,
        beforeState: { totalInvestorsBalance: calculation.totalInvestorsBalance },
        afterState: { newSession },
        ipAddress: '192.168.1.10',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // 5. Push notifications to eligible investors who received profit
      const notifs: PushNotification[] = calculation.allocations
        .filter((a) => a.allocatedShare > 0)
        .map((a, idx) => ({
          id: `notif-${Date.now()}-${idx}`,
          timestamp: now.toISOString(),
          investorId: a.investorId,
          title: `Savdo daromadi qo'shildi: +$${a.allocatedShare.toLocaleString()}`,
          message: `Bugungi savdo sessiyasidan hisobingizga $${a.allocatedShare.toLocaleString()} kreditlandi (${a.eligibilityReason}). Yangi balansingiz: $${a.balanceAfter.toLocaleString()}`,
          type: 'PROFIT_DISTRIBUTION',
          read: false,
        }));
      setNotifications((prev) => [...notifs, ...prev]);

      addToast(
        'success',
        `$${calculation.totalProfit.toLocaleString()} savdo foydasi muvaffaqiyatli taqsimlandi (50% investorlarga: $${calculation.investorPoolAmount.toLocaleString()}).`,
        'Sessiya Muvaffaqiyatli Taqsimlandi'
      );
    },
    [investors, tradeSessions.length, ledger.length, addToast]
  );

  // Action: Correct Trade Session (Trader mistake correction / tahrirlash)
  const correctTradeSession = useCallback(
    (sessionId: string, newTotalProfit: number, reason: string) => {
      const session = tradeSessions.find((s) => s.id === sessionId);
      if (!session) {
        addToast('error', 'Sessiya topilmadi.', 'Xatolik');
        return;
      }
      if (session.status === 'REVERSED') {
        addToast('error', "Bekor qilingan sessiyani to'g'irlab bo'lmaydi.", 'Xatolik');
        return;
      }

      const now = new Date();
      // Re-calculate distribution with new profit using original pre-session balances & new capital
      const reconstructedInvestors = investors.map((inv) => {
        const alloc = session.allocations.find((a) => a.investorId === inv.id);
        const baseBalance = alloc ? alloc.balanceBefore : inv.balance;
        const baseNewCapital = alloc && alloc.newCapitalBefore !== undefined ? alloc.newCapitalBefore : inv.newCapital;
        return {
          ...inv,
          balance: baseBalance,
          newCapital: baseNewCapital,
        };
      });

      const newCalculation = FinancialEngine.calculateSessionDistribution(
        reconstructedInvestors,
        newTotalProfit,
        session.investorPoolSharePercent,
        session.distributionMode || 'ALL_BALANCES_INCLUDING_OLD'
      );

      // Apply deltas to current investors
      setInvestors((prev) =>
        prev.map((inv) => {
          const oldAlloc = session.allocations.find((a) => a.investorId === inv.id);
          const newAlloc = newCalculation.allocations.find((a) => a.investorId === inv.id);
          if (!oldAlloc || !newAlloc) return inv;

          const delta = Number((newAlloc.allocatedShare - oldAlloc.allocatedShare).toFixed(2));
          const adjustedBalance = Number((inv.balance + delta).toFixed(2));
          const adjustedNewCapital = inv.newCapital > 0
            ? Math.max(0, Number((inv.newCapital + delta).toFixed(2)))
            : inv.newCapital;

          let adjustedRecovered = inv.recoveredAmount;
          let adjustedRecovery = inv.recovery;
          if (inv.type === 'OLD' && inv.recovery >= 100) {
            // Fully recovered investor
            adjustedRecovered = inv.recoveredAmount;
            adjustedRecovery = 100;
          }

          return {
            ...inv,
            balance: adjustedBalance,
            newCapital: adjustedNewCapital,
            recoveredAmount: adjustedRecovered,
            recovery: adjustedRecovery,
            updatedAt: now.toISOString(),
          };
        })
      );

      // Update session document
      const oldProfit = session.totalProfit;
      setTradeSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              previousProfit: oldProfit,
              totalProfit: newCalculation.totalProfit,
              investorPoolAmount: newCalculation.investorPoolAmount,
              fundShareAmount: newCalculation.fundShareAmount,
              totalEligibleBalance: newCalculation.totalEligibleBalance,
              status: 'CORRECTED',
              notes: `${s.notes} [To'g'irlandi: ${reason}]`,
              updatedAt: now.toISOString(),
              allocations: newCalculation.allocations.map((a) => ({
                investorId: a.investorId,
                investorName: a.investorName,
                investorType: a.investorType,
                balanceBefore: a.balanceBefore,
                eligibleBalance: a.eligibleBalance,
                isEligible: a.isEligible,
                eligibilityReason: a.eligibilityReason,
                weightPercent: a.weightPercent,
                allocatedShare: a.allocatedShare,
                balanceAfter: a.balanceAfter,
                newCapitalBefore: a.newCapitalBefore,
                newCapitalAfter: a.newCapitalAfter,
                recoveryBefore: a.recoveryBefore,
                recoveryAfter: a.recoveryAfter,
              })),
            };
          }
          return s;
        })
      );

      // Ledger correction entry
      const correctionLedgers: LedgerEntry[] = newCalculation.allocations.map((a, idx) => {
        const oldAlloc = session.allocations.find((o) => o.investorId === a.investorId);
        const delta = oldAlloc ? a.allocatedShare - oldAlloc.allocatedShare : a.allocatedShare;
        return {
          id: `led-corr-${Date.now()}-${idx}`,
          entryNumber: `LED-2026-${String(ledger.length + idx + 1).padStart(4, '0')}`,
          investorId: a.investorId,
          investorName: a.investorName,
          timestamp: now.toISOString(),
          type: 'TRADE_SESSION_CORRECTION',
          amount: delta,
          balanceBefore: oldAlloc ? oldAlloc.balanceAfter : a.balanceBefore,
          balanceAfter: a.balanceAfter,
          newCapitalBefore: a.newCapitalBefore ?? 0,
          newCapitalAfter: a.newCapitalAfter ?? 0,
          recoveryBefore: oldAlloc ? oldAlloc.recoveryAfter : a.recoveryBefore,
          recoveryAfter: a.recoveryAfter,
          description: `Sessiya ${session.sessionNumber} to'g'irlandi ($${oldProfit.toLocaleString()} -> $${newTotalProfit.toLocaleString()}): Sabab: ${reason}`,
          referenceId: session.id,
          performedBy: 'Treydor Admin (Tolib I.)',
        };
      });

      setLedger((prev) => [...correctionLedgers, ...prev]);

      // Audit log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: 'Treydor Admin (Tolib I.)',
        action: 'TRADE_SESSION_CORRECTED',
        category: 'LEDGER',
        targetId: session.id,
        targetName: session.sessionNumber,
        details: `Sessiya daromadi $${oldProfit.toLocaleString()} dan $${newTotalProfit.toLocaleString()} ga to'g'irlandi. Sabab: ${reason}. Barcha investorlar balansi avtomatik qayta hisoblandi.`,
        beforeState: { totalProfit: oldProfit },
        afterState: { totalProfit: newTotalProfit },
        ipAddress: '192.168.1.10',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast(
        'success',
        `Sessiya ${session.sessionNumber} $${newTotalProfit.toLocaleString()} summasiga to'g'irlandi va hisob-kitoblar yangilandi.`,
        "Muvaffaqiyatli To'g'irlandi"
      );
    },
    [tradeSessions, investors, ledger.length, addToast]
  );

  // Action: Rollback / Cancel Trade Session (Full reversal of mistake)
  const rollbackTradeSession = useCallback(
    (sessionId: string, reason: string) => {
      const session = tradeSessions.find((s) => s.id === sessionId);
      if (!session) {
        addToast('error', 'Sessiya topilmadi.', 'Xatolik');
        return;
      }
      if (session.status === 'REVERSED') {
        addToast('warning', 'Bu sessiya avvalroq bekor qilingan.', 'Ogohlantirish');
        return;
      }

      const now = new Date();

      // Deduct allocations from investors
      setInvestors((prev) =>
        prev.map((inv) => {
          const alloc = session.allocations.find((a) => a.investorId === inv.id);
          if (!alloc) return inv;

          const reversedBalance = Number((inv.balance - alloc.allocatedShare).toFixed(2));
          const reversedNewCapital = inv.newCapital > 0
            ? Math.max(0, Number((inv.newCapital - alloc.allocatedShare).toFixed(2)))
            : inv.newCapital;

          let reversedRecovered = inv.recoveredAmount;
          let reversedRecovery = inv.recovery;

          if (inv.type === 'OLD') {
            reversedRecovered = Math.max(
              0,
              Number((inv.recoveredAmount - (alloc.recoveryAfter > alloc.recoveryBefore ? alloc.allocatedShare : 0)).toFixed(2))
            );
            reversedRecovery = Math.min(
              100,
              Number(((reversedRecovered / Math.max(1, inv.initialLoss)) * 100).toFixed(2))
            );
          }

          return {
            ...inv,
            balance: Math.max(0, reversedBalance),
            newCapital: reversedNewCapital,
            recoveredAmount: reversedRecovered,
            recovery: reversedRecovery,
            updatedAt: now.toISOString(),
          };
        })
      );

      // Mark session as REVERSED
      setTradeSessions((prev) =>
        prev.map((s) => {
          if (s.id === sessionId) {
            return {
              ...s,
              status: 'REVERSED',
              reversalReason: reason,
              updatedAt: now.toISOString(),
            };
          }
          return s;
        })
      );

      // Ledger reversal entries
      const reversalLedgers: LedgerEntry[] = session.allocations.map((a, idx) => ({
        id: `led-rev-${Date.now()}-${idx}`,
        entryNumber: `LED-2026-${String(ledger.length + idx + 1).padStart(4, '0')}`,
        investorId: a.investorId,
        investorName: a.investorName,
        timestamp: now.toISOString(),
        type: 'TRADE_SESSION_REVERSAL',
        amount: -a.allocatedShare,
        balanceBefore: a.balanceAfter,
        balanceAfter: a.balanceBefore,
        newCapitalBefore: a.newCapitalAfter ?? 0,
        newCapitalAfter: a.newCapitalBefore ?? 0,
        recoveryBefore: a.recoveryAfter,
        recoveryAfter: a.recoveryBefore,
        description: `Sessiya ${session.sessionNumber} bekor qilindi ($${a.allocatedShare.toLocaleString()} qaytarildi): ${reason}`,
        referenceId: session.id,
        performedBy: 'Treydor Admin (Tolib I.)',
      }));

      setLedger((prev) => [...reversalLedgers, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: 'Treydor Admin (Tolib I.)',
        action: 'TRADE_SESSION_REVERSED',
        category: 'LEDGER',
        targetId: session.id,
        targetName: session.sessionNumber,
        details: `Sessiya ${session.sessionNumber} to'liq bekor qilindi (Rollback). Taqsimlangan $${session.investorPoolAmount.toLocaleString()} barcha investorlar hisobidan qaytarib olindi. Sabab: ${reason}`,
        beforeState: { session },
        afterState: { status: 'REVERSED', reason },
        ipAddress: '192.168.1.10',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast(
        'warning',
        `Sessiya ${session.sessionNumber} muvaffaqiyatli bekor qilindi va barcha balanslar avvalgi holatiga qaytarildi.`,
        'Sessiya Bekor Qilindi (Rollback)'
      );
    },
    [tradeSessions, ledger.length, addToast]
  );

  // Action: Request Withdrawal (Investor flow)
  const requestWithdrawal = useCallback(
    (investorId: string, amount: number, method: PaymentMethod, destinationDetails: string): boolean => {
      const inv = investors.find((i) => i.id === investorId);
      if (!inv) return false;

      // Validate according to §4 & §5
      const validation = FinancialEngine.validateWithdrawalRequest(inv, amount);
      if (!validation.allowed) {
        addToast('error', validation.reason || 'Withdrawal blocked by compliance rule.', 'Request Denied');
        return false;
      }

      const isOldAndRecovering = inv.type === 'OLD' && inv.recovery < 100;
      const deductedFromNewCapital = isOldAndRecovering ? amount : Math.min(amount, inv.newCapital);
      const deductedFromRecovering = amount - deductedFromNewCapital;

      const now = new Date();
      const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const reqId = `wth-${Date.now()}`;
      const reqNumber = `WTH-2026-${(withdrawals.length + 1).toString().padStart(3, '0')}`;

      const newRequest: WithdrawalRequest = {
        id: reqId,
        requestNumber: reqNumber,
        investorId,
        investorName: inv.fullName,
        amount,
        deductedFromNewCapital,
        deductedFromRecovering,
        method,
        destinationDetails,
        status: 'PENDING',
        requestedAt: now.toISOString(),
        slaDeadline: deadline.toISOString(),
      };

      setWithdrawals((prev) => [newRequest, ...prev]);

      // Push Notification to Admin
      const adminNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: now.toISOString(),
        title: `Yangi pul yechish so'rovi: ${reqNumber}`,
        message: `${inv.fullName} tomonidan $${amount.toLocaleString()} so'raldi (${method}). 24 soatlik SLA vaqti boshlandi.`,
        type: 'WITHDRAWAL_ALERT',
        read: false,
      };
      setNotifications((prev) => [adminNotif, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: `${inv.fullName} (Investor Mobile)`,
        action: 'WITHDRAWAL_REQUESTED',
        category: 'WITHDRAWAL',
        targetId: reqId,
        targetName: reqNumber,
        details: `Requested withdrawal of $${amount.toLocaleString()} via ${method}. SLA expires at ${deadline.toLocaleTimeString()}.`,
        afterState: newRequest,
        ipAddress: '185.139.137.99',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast('success', `Withdrawal request ${reqNumber} submitted. Admin will process within 24 hours.`, 'Request Submitted');
      return true;
    },
    [investors, withdrawals.length, addToast]
  );

  // Action: Mark Withdrawal as Sent ("To'landi") -> Generates Official Receipt & Locks Investor App!
  const markWithdrawalAsSent = useCallback(
    (withdrawalId: string) => {
      const w = withdrawals.find((item) => item.id === withdrawalId);
      if (!w || w.status !== 'PENDING') return;

      const inv = investors.find((i) => i.id === w.investorId);
      if (!inv) return;

      const now = new Date();
      const receiptNumber = `CHK-${(receipts.length + 4820).toString()}`;
      const receiptId = `chk-${Date.now()}`;
      const verificationCode = FinancialEngine.generateVerificationCode(receiptNumber, inv.id);
      const digitalSignature = FinancialEngine.generateDigitalSignature(receiptNumber, w.amount);

      const officialReceipt: OfficialReceipt = {
        id: receiptId,
        receiptNumber,
        withdrawalId,
        investorId: inv.id,
        investorName: inv.fullName,
        passportId: inv.passportId,
        amount: w.amount,
        method: w.method,
        maskedAddress: w.destinationDetails,
        issuedAt: now.toISOString(),
        status: 'ISSUED',
        verificationCode,
        digitalSignature,
        verificationUrl: `https://tradingfund.erp/verify/${receiptNumber}`,
        proofNote: 'Investor tomonidan tasdiqlanishi kutilmoqda (kutilmoqda)',
      };

      setReceipts((prev) => [officialReceipt, ...prev]);

      setWithdrawals((prev) =>
        prev.map((item) => {
          if (item.id === withdrawalId) {
            return {
              ...item,
              status: 'SENT',
              sentAt: now.toISOString(),
              receiptId,
            };
          }
          return item;
        })
      );

      // Push Notification to Investor
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: now.toISOString(),
        investorId: inv.id,
        title: "Mablag' yuborildi! Kvitansiyani tasdiqlang",
        message: `Admin $${w.amount.toLocaleString()} to'lovni yubordi (${receiptNumber}). Ilovadan to'liq foydalanish uchun kvitansiya skrinshoti va video tasdiq yuklang.`,
        type: 'RECEIPT_ISSUED',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'WITHDRAWAL_MARKED_SENT',
        category: 'WITHDRAWAL',
        targetId: withdrawalId,
        targetName: w.requestNumber,
        details: `Marked sent ("To'landi"). Official receipt ${receiptNumber} generated. Investor mobile app locked for mandatory proof of receipt.`,
        beforeState: { status: 'PENDING' },
        afterState: { status: 'SENT', receiptId },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast(
        'info',
        `Payment marked as Sent. Official Receipt ${receiptNumber} issued. Investor app locked for proof.`,
        'Payment Sent ("To\'landi")'
      );
    },
    [withdrawals, investors, receipts.length, addToast]
  );

  // Action: Submit Proof of Receipt (Executed in Investor App Lock Screen)
  const submitProofOfReceipt = useCallback(
    (withdrawalId: string, screenshotUrl: string, videoUrl: string, notes?: string) => {
      const w = withdrawals.find((item) => item.id === withdrawalId);
      if (!w) return;

      const now = new Date();

      setWithdrawals((prev) =>
        prev.map((item) => {
          if (item.id === withdrawalId) {
            return {
              ...item,
              status: 'PROOF_SUBMITTED',
              proofSubmittedAt: now.toISOString(),
              proofArtifacts: {
                receiptScreenshotUrl: screenshotUrl,
                videoConfirmationUrl: videoUrl,
                investorNotes: notes || 'Investor video va skrinshot yukladi',
                submittedAt: now.toISOString(),
              },
            };
          }
          return item;
        })
      );

      // Update the Receipt status in parallel!
      if (w.receiptId) {
        setReceipts((prev) =>
          prev.map((r) => {
            if (r.id === w.receiptId) {
              return {
                ...r,
                status: 'PROOF_SUBMITTED',
                proofNote: 'Video + screenshot investor tomonidan tasdiqlangan',
              };
            }
            return r;
          })
        );
      }

      // Push Notification to Admin
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: now.toISOString(),
        title: `Hisobot kelib tushdi: ${w.requestNumber}`,
        message: `${w.investorName} pul olganligini video va skrinshot bilan tasdiqladi. Yakuniy tekshirib yakunlang.`,
        type: 'WITHDRAWAL_ALERT',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: `${w.investorName} (Investor Mobile)`,
        action: 'RECEIPT_PROOF_SUBMITTED',
        category: 'RECEIPT',
        targetId: w.receiptId || withdrawalId,
        targetName: w.requestNumber,
        details: `Investor submitted screenshot and video proof for ${w.requestNumber}. App unlocked.`,
        beforeState: { status: 'SENT' },
        afterState: { status: 'PROOF_SUBMITTED' },
        ipAddress: '185.139.137.99',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      addToast('success', 'Proof of receipt verified and submitted! Mobile app unlocked.', 'Proof Submitted');
    },
    [withdrawals, addToast]
  );

  // Action: Finalize Withdrawal (Admin final step)
  const finalizeWithdrawal = useCallback(
    (withdrawalId: string) => {
      const w = withdrawals.find((item) => item.id === withdrawalId);
      if (!w || w.status !== 'PROOF_SUBMITTED') return;

      const inv = investors.find((i) => i.id === w.investorId);
      if (!inv) return;

      const now = new Date();
      const balanceBefore = inv.balance;
      const balanceAfter = Number((balanceBefore - w.amount).toFixed(2));
      const newCapitalBefore = inv.newCapital;
      const newCapitalAfter = Number(Math.max(0, newCapitalBefore - w.deductedFromNewCapital).toFixed(2));

      // 1. Deduct balance from investor
      setInvestors((prev) =>
        prev.map((i) => {
          if (i.id === inv.id) {
            return {
              ...i,
              balance: balanceAfter,
              newCapital: newCapitalAfter,
              updatedAt: now.toISOString(),
            };
          }
          return i;
        })
      );

      // 2. Mark withdrawal COMPLETED
      setWithdrawals((prev) =>
        prev.map((item) => {
          if (item.id === withdrawalId) {
            return {
              ...item,
              status: 'COMPLETED',
              completedAt: now.toISOString(),
            };
          }
          return item;
        })
      );

      // 3. Mark receipt CONFIRMED
      if (w.receiptId) {
        setReceipts((prev) =>
          prev.map((r) => {
            if (r.id === w.receiptId) {
              return {
                ...r,
                status: 'CONFIRMED',
                confirmedAt: now.toISOString(),
                proofNote: 'Video + screenshot rasman tekshirildi va tasdiqlandi (Admin yakunladi)',
              };
            }
            return r;
          })
        );
      }

      // 4. Write immutable LEDGER entry
      const ledgerEntry: LedgerEntry = {
        id: `led-${Date.now()}`,
        entryNumber: `LED-2026-${(ledger.length + 1).toString().padStart(4, '0')}`,
        investorId: inv.id,
        investorName: inv.fullName,
        timestamp: now.toISOString(),
        type: 'WITHDRAWAL_PAYOUT',
        amount: -w.amount,
        balanceBefore,
        balanceAfter,
        newCapitalBefore,
        newCapitalAfter,
        recoveryBefore: inv.recovery,
        recoveryAfter: inv.recovery,
        description: `Pul yechish yakunlandi: ${w.method} orqali $${w.amount.toLocaleString()} yechib olindi (${w.requestNumber})`,
        referenceId: w.receiptId || withdrawalId,
        performedBy: 'Trader Admin (Tolib I.)',
      };
      setLedger((prev) => [ledgerEntry, ...prev]);

      // 5. Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: now.toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'WITHDRAWAL_FINALIZED',
        category: 'WITHDRAWAL',
        targetId: withdrawalId,
        targetName: w.requestNumber,
        details: `Finalized payout of $${w.amount.toLocaleString()}. Balance deducted from $${balanceBefore.toLocaleString()} to $${balanceAfter.toLocaleString()}. Receipt confirmed.`,
        beforeState: { balance: balanceBefore, status: 'PROOF_SUBMITTED' },
        afterState: { balance: balanceAfter, status: 'COMPLETED' },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // 6. Push notification to investor
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: now.toISOString(),
        investorId: inv.id,
        title: "Pul yechish to'liq yakunlandi",
        message: `$${w.amount.toLocaleString()} muvaffaqiyatli to'landi va kvitansiyangiz tasdiqlangan arxivga joylandi.`,
        type: 'WITHDRAWAL_ALERT',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      addToast('success', `Withdrawal ${w.requestNumber} finalized. $${w.amount.toLocaleString()} deducted from balance.`, 'Payout Finalized');
    },
    [withdrawals, investors, ledger.length, addToast]
  );

  // Action: Reject Withdrawal
  const rejectWithdrawal = useCallback(
    (withdrawalId: string, reason: string) => {
      const w = withdrawals.find((item) => item.id === withdrawalId);
      if (!w || w.status !== 'PENDING') return;

      setWithdrawals((prev) =>
        prev.map((item) => {
          if (item.id === withdrawalId) {
            return {
              ...item,
              status: 'REJECTED',
              rejectionReason: reason,
            };
          }
          return item;
        })
      );

      // Audit Log
      const auditItem: AuditLogItem = {
        id: `aud-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor: 'admin@tradingfund.erp (Tolib I.)',
        action: 'WITHDRAWAL_REJECTED',
        category: 'WITHDRAWAL',
        targetId: withdrawalId,
        targetName: w.requestNumber,
        details: `Withdrawal rejected. Reason: ${reason}`,
        beforeState: { status: 'PENDING' },
        afterState: { status: 'REJECTED', reason },
        ipAddress: '185.139.137.42',
      };
      setAuditLogs((prev) => [auditItem, ...prev]);

      // Push notification
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        investorId: w.investorId,
        title: "Pul yechish so'rovi rad etildi",
        message: `So'rovingiz rad etildi. Sabab: ${reason}`,
        type: 'WITHDRAWAL_ALERT',
        read: false,
      };
      setNotifications((prev) => [notif, ...prev]);

      addToast('warning', `Withdrawal ${w.requestNumber} has been rejected.`, 'Request Rejected');
    },
    [withdrawals, addToast]
  );

  // Action: Export Ledger as CSV
  const exportLedgerCsv = useCallback(() => {
    const headers = ['Entry #', 'Date/Time', 'Investor', 'Type', 'Amount ($)', 'Balance Before', 'Balance After', 'Recovery %', 'Description', 'Operator'];
    const rows = ledger.map((l) => [
      l.entryNumber,
      `"${l.timestamp}"`,
      `"${l.investorName}"`,
      l.type,
      l.amount,
      l.balanceBefore,
      l.balanceAfter,
      `${l.recoveryAfter}%`,
      `"${l.description.replace(/"/g, '""')}"`,
      `"${l.performedBy}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `trading_fund_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Accounting Ledger exported to CSV.', 'Export Complete');
  }, [ledger, addToast]);

  // Action: Export Investors as CSV
  const exportInvestorsCsv = useCallback(() => {
    const headers = ['Code', 'Full Name', 'Type', 'Initial Loss ($)', 'Recovered ($)', 'Recovery %', 'Total Balance ($)', 'New Capital ($)', 'Payment Method', 'Account Mask'];
    const rows = investors.map((i) => [
      i.code,
      `"${i.fullName}"`,
      i.type,
      i.initialLoss,
      i.recoveredAmount,
      `${i.recovery}%`,
      i.balance,
      i.newCapital,
      i.paymentEndpoint.method,
      `"${i.paymentEndpoint.maskedDetail}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `investors_registry_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Investors registry exported to CSV.', 'Export Complete');
  }, [investors, addToast]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const sendPushNotification = useCallback(
    (
      investorId: string,
      title: string,
      message: string,
      type?: 'info' | 'success' | 'warning' | 'alert'
    ) => {
      const mappedType =
        type === 'success'
          ? 'PROFIT_DISTRIBUTION'
          : type === 'warning' || type === 'alert'
          ? 'WITHDRAWAL_ALERT'
          : 'SYSTEM_ALERT';

      const newNotif: PushNotification = {
        id: `notif-${Date.now()}`,
        timestamp: new Date().toISOString(),
        investorId,
        title,
        message,
        type: mappedType,
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      addToast('success', `Bildirishnoma yuborildi: ${title}`, 'Push Yuborildi');
    },
    [addToast]
  );

  const markWithdrawalSent = markWithdrawalAsSent;
  const submitWithdrawalProof = useCallback(
    (withdrawalId: string, videoUrl: string, screenshotUrl: string, notes?: string) => {
      submitProofOfReceipt(withdrawalId, screenshotUrl, videoUrl, notes || 'Investor video va skrinshot yukladi');
    },
    [submitProofOfReceipt]
  );

  return (
    <ErpContext.Provider
      value={{
        investors,
        withdrawals,
        receipts,
        ledger,
        auditLogs,
        notifications,
        marketRates,
        tradeSessions,
        activeView,
        setActiveView,
        activeTabMode,
        setActiveTabMode,
        activeMobileInvestorId,
        setActiveMobileInvestorId,
        activeMobileInvestor,
        selectedInvestorForDrawer,
        setSelectedInvestorForDrawer,
        selectedReceiptForModal,
        setSelectedReceiptForModal,
        commandPaletteOpen,
        setCommandPaletteOpen,
        activeModal,
        modalPayload,
        openModal,
        closeModal,
        toasts,
        addToast,
        removeToast,
        addInvestor,
        inlineUpdateBalance,
        updateInitialLoss,
        addFreshCapital,
        applyTradeProfitCredit,
        applyManualInjection,
        distributeTradeSession,
        correctTradeSession,
        rollbackTradeSession,
        requestWithdrawal,
        markWithdrawalAsSent,
        markWithdrawalSent,
        submitProofOfReceipt,
        submitWithdrawalProof,
        finalizeWithdrawal,
        rejectWithdrawal,
        sendPushNotification,
        exportLedgerCsv,
        exportInvestorsCsv,
        markNotificationRead,
      }}
    >
      {children}
    </ErpContext.Provider>
  );
};

export const useErp = () => {
  const context = useContext(ErpContext);
  if (!context) {
    throw new Error('useErp must be used within an ErpProvider');
  }
  return context;
};
