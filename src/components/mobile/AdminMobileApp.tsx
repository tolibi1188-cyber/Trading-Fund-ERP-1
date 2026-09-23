/**
 * Admin Mobile App (Boshqaruvchi Mobil Ilovasi / Pocket Fund Manager)
 * Designed specifically for the fund manager / senior trader to manage the fund on the go.
 * Fast actions: Credit profit, approve withdrawals, inspect investors, view live market and ledger.
 */

import React, { useState, useMemo } from 'react';
import { useErp } from '../../context/ErpContext';
import { Investor, WithdrawalRequest, PaymentMethod, OfficialReceipt } from '../../types/erp';
import {
  Smartphone,
  Monitor,
  Layers,
  TrendingUp,
  DollarSign,
  UserPlus,
  Coins,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Phone,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  FileText,
  Download,
  Bell,
  RefreshCw,
  PlusCircle,
  X,
  CreditCard,
  Building2,
  ArrowUpRight,
  ArrowDownLeft,
  Check,
  Ban,
  Activity,
  UserCheck,
  Settings,
  QrCode,
  FileCheck,
} from 'lucide-react';

interface AdminMobileAppProps {
  onBackToDesktop?: () => void;
}

export const AdminMobileApp: React.FC<AdminMobileAppProps> = ({ onBackToDesktop }) => {
  const {
    investors,
    withdrawals,
    receipts,
    ledger,
    marketRates,
    tradeSessions,
    notifications,
    openModal,
    markWithdrawalAsSent,
    finalizeWithdrawal,
    rejectWithdrawal,
    setSelectedReceiptForModal,
    setSelectedInvestorForDrawer,
    activeTabMode,
    setActiveTabMode,
    addToast,
    exportLedgerCsv,
    exportInvestorsCsv,
  } = useErp();

  // Bottom navigation tab: 'dashboard' | 'investors' | 'withdrawals' | 'ledger' | 'menu'
  const [mobileTab, setMobileTab] = useState<'dashboard' | 'investors' | 'withdrawals' | 'ledger' | 'menu'>('dashboard');

  // Investors search & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [investorFilter, setInvestorFilter] = useState<'ALL' | 'RECOVERING' | 'RECOVERED' | 'NEW'>('ALL');

  // Ledger / Receipts subtab
  const [ledgerSubTab, setLedgerSubTab] = useState<'ledger' | 'receipts'>('ledger');

  // Selected investor bottom sheet for mobile preview
  const [quickInvestorSheet, setQuickInvestorSheet] = useState<Investor | null>(null);

  // Quick reject prompt modal
  const [rejectingWithdrawalId, setRejectingWithdrawalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Notifications drawer
  const [showNotifications, setShowNotifications] = useState(false);

  // Financial aggregates
  const totalFundAum = useMemo(() => {
    return investors.reduce((sum, inv) => sum + inv.balance, 0);
  }, [investors]);

  const totalInitialLoss = useMemo(() => {
    return investors.reduce((sum, inv) => sum + (inv.initialLoss || 0), 0);
  }, [investors]);

  const totalRecoveredAmount = useMemo(() => {
    return investors.reduce((sum, inv) => sum + (inv.recoveredAmount || 0), 0);
  }, [investors]);

  const totalFreshCapital = useMemo(() => {
    return investors.reduce((sum, inv) => sum + (inv.newCapital || 0), 0);
  }, [investors]);

  const recoveryGap = Math.max(0, totalInitialLoss - totalRecoveredAmount);
  const recoveryPercent = totalInitialLoss > 0
    ? Math.min(100, (totalRecoveredAmount / totalInitialLoss) * 100)
    : 100;

  // Urgent pending withdrawals requiring action
  const pendingWithdrawals = useMemo(() => {
    return withdrawals.filter((w) => w.status === 'PENDING' || w.status === 'PROOF_SUBMITTED');
  }, [withdrawals]);

  // Filtered investors
  const filteredInvestors = useMemo(() => {
    return investors.filter((inv) => {
      const matchesSearch =
        inv.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.phone.includes(searchQuery);

      if (!matchesSearch) return false;

      if (investorFilter === 'RECOVERING') {
        return inv.type === 'OLD' && (inv.recovery || 0) < 100;
      }
      if (investorFilter === 'RECOVERED') {
        return inv.type === 'OLD' && (inv.recovery || 0) >= 100;
      }
      if (investorFilter === 'NEW') {
        return inv.type === 'NEW';
      }
      return true;
    });
  }, [investors, searchQuery, investorFilter]);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="w-full h-full bg-[#07090E] text-slate-100 flex flex-col justify-between overflow-hidden font-sans select-none relative">
      
      {/* 1. TOP MOBILE HEADER (Neumorphic) */}
      <header className="bg-[#0b1017] border-b border-white/[0.06] px-4 pt-3.5 pb-2.5 shrink-0 z-30 shadow-[0_4px_16px_rgba(0,0,0,0.4)]">
        {/* Row 1: App Title, Mode Switchers & Profile Bell */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl neu-btn-emerald flex items-center justify-center font-bold text-slate-950 text-xs">
              TF
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-sm text-white tracking-tight">Trading Fund</span>
                <span className="px-1.5 py-0.5 rounded-md neu-inset text-emerald-400 text-[9px] font-mono font-bold uppercase">
                  Admin
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Tolib I. (Senior Trader)</p>
            </div>
          </div>

          {/* Quick Actions & Navigation Switcher */}
          <div className="flex items-center space-x-2">
            {/* View switcher dropdown / buttons */}
            <div className="flex items-center neu-inset p-0.5 rounded-xl text-[11px]">
              <button
                onClick={() => onBackToDesktop ? onBackToDesktop() : setActiveTabMode('admin')}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
                title="Desktop ERP rejimiga qaytish"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">PC</span>
              </button>
              <button
                onClick={() => setActiveTabMode('mobile')}
                className="px-2 py-1 rounded-lg text-slate-300 hover:text-white flex items-center space-x-1 transition-all"
                title="Investor ilovasini ko'rish"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Investor</span>
              </button>
            </div>

            {/* Notification bell */}
            <button
              onClick={() => setShowNotifications(true)}
              className="p-2 rounded-xl neu-btn text-slate-300 relative active:scale-95 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-[0_0_6px_#f43f5e]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Row 2: Live FX Ticker (XAU/USD, EUR/USD, UZS/USD) */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono neu-inset px-3 py-1.5 rounded-xl overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1.5 shrink-0 text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="font-sans text-[10px] uppercase font-bold text-slate-300">Bozor:</span>
          </div>

          {marketRates.slice(0, 3).map((rate) => {
            const isUp = rate.changePercent24h >= 0;
            return (
              <div key={rate.symbol} className="flex items-center space-x-1 shrink-0 px-1.5">
                <span className="text-slate-400 font-bold">{rate.symbol.replace('/USD', '')}:</span>
                <span className="text-white font-semibold">
                  {rate.symbol === 'UZS/USD' ? '12 887' : rate.price.toFixed(2)}
                </span>
                <span className={`text-[10px] font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isUp ? '+' : ''}{rate.changePercent24h.toFixed(1)}%
                </span>
              </div>
            );
          })}
        </div>
      </header>

      {/* 2. MAIN SCROLLABLE CONTENT */}
      <main className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4">
        
        {/* ======================================================== */}
        {/* TAB 1: DASHBOARD (ASOSIY BOSHQARUV)                      */}
        {/* ======================================================== */}
        {mobileTab === 'dashboard' && (
          <div className="space-y-4">
            
            {/* Quick Action Buttons on the Go */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => openModal('trade-profit')}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs active:scale-95 transition-all shadow-md"
              >
                <DollarSign className="w-4 h-4 stroke-[2.5]" />
                <span>+ Daromad</span>
              </button>

              <button
                onClick={() => openModal('new-investor')}
                className="flex items-center justify-center space-x-2 py-3 px-3 rounded-xl neu-btn text-white font-bold text-xs active:scale-95 transition-all"
              >
                <UserPlus className="w-4 h-4 text-emerald-400" />
                <span>+ Yangi Investor</span>
              </button>
            </div>

            {/* Total Fund AUM Card (Neumorphic Card) */}
            <div className="p-4 rounded-2xl neu-card space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="font-semibold text-slate-300">Jami Fond Balansi (AUM)</span>
                <span className="font-mono text-emerald-400 neu-inset px-2 py-0.5 rounded-md text-[10px] font-bold">
                  {investors.length} ta investor
                </span>
              </div>

              <div className="text-2xl font-black font-mono text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                ${totalFundAum.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Progress & Submetrics */}
              <div className="pt-2.5 border-t border-white/[0.06] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Qolgan Zarar (Gap)</div>
                  <div className="text-amber-400 font-mono font-bold text-sm">
                    ${recoveryGap.toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    Tiklanish: {recoveryPercent.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 font-medium">Yangi Erkin Kapital</div>
                  <div className="text-blue-400 font-mono font-bold text-sm">
                    ${totalFreshCapital.toLocaleString('en-US')}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    50/50 ulushga loyiq
                  </div>
                </div>
              </div>

              {/* Recovery Progress Bar */}
              <div className="pt-1">
                <div className="w-full h-2 rounded-full neu-progress-track p-0.5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    style={{ width: `${recoveryPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Shoshilinch 24h SLA Pul Yechish Navbati */}
            {pendingWithdrawals.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                    <Clock className="w-4 h-4 animate-spin" />
                    <span>24h SLA: Tasdiq Kutilayotgan Pul Yechish</span>
                  </div>
                  <span className="font-mono text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full">
                    {pendingWithdrawals.length} ta
                  </span>
                </div>

                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Ko‘chada yoki safarda bo‘lsangiz ham, investorlarning pul yechishini shu yerdan 1 ta bosishda tasdiqlashingiz mumkin.
                </p>

                <div className="space-y-2">
                  {pendingWithdrawals.slice(0, 2).map((w) => (
                    <div
                      key={w.id}
                      className="p-3 rounded-xl bg-[#0F141C] border border-white/10 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{w.investorName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-1.5 mt-0.5">
                          <span className="font-mono text-emerald-400 font-bold">
                            ${w.amount.toLocaleString()}
                          </span>
                          <span>•</span>
                          <span className="text-slate-300">{w.method}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {w.status === 'PENDING' && (
                          <button
                            onClick={() => {
                              markWithdrawalAsSent(w.id);
                              addToast('success', `${w.investorName} ga to'lov yuborildi deb belgilandi`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-500 text-slate-950 text-xs font-bold shadow active:scale-95"
                          >
                            To‘landi
                          </button>
                        )}

                        {w.status === 'PROOF_SUBMITTED' && (
                          <button
                            onClick={() => {
                              finalizeWithdrawal(w.id);
                              addToast('success', `${w.investorName} kvitansiyasi tasdiqlandi va hisobdan yechildi!`);
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-500 text-white text-xs font-bold shadow active:scale-95"
                          >
                            Tasdiqlash
                          </button>
                        )}

                        <button
                          onClick={() => setMobileTab('withdrawals')}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Secondary Actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => openModal('new-capital')}
                className="p-3 rounded-xl bg-[#141B26] hover:bg-[#1A2332] border border-white/10 text-slate-200 font-semibold flex items-center space-x-2 text-left"
              >
                <Coins className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">+ Yangi Kapital</div>
                  <div className="text-[10px] text-slate-400">Investorga depozit</div>
                </div>
              </button>

              <button
                onClick={() => openModal('manual-injection')}
                className="p-3 rounded-xl bg-[#141B26] hover:bg-[#1A2332] border border-white/10 text-slate-200 font-semibold flex items-center space-x-2 text-left"
              >
                <PlusCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-xs text-white">Manual Injection</div>
                  <div className="text-[10px] text-slate-400">To‘g‘ridan-to‘g‘ri kiritish</div>
                </div>
              </button>
            </div>

            {/* Today's Trade Session Summary */}
            {tradeSessions.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-[#131A26] border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center space-x-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span>Oxirgi Savdo Sessiyasi</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold">
                    {tradeSessions[0].sessionNumber}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-center">
                  <div className="p-2 rounded-xl bg-[#090C12] border border-white/5">
                    <div className="text-[9px] text-slate-400 font-sans">Jami Foyda</div>
                    <div className="text-white font-bold text-xs mt-0.5">
                      ${tradeSessions[0].totalProfit.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090C12] border border-white/5">
                    <div className="text-[9px] text-slate-400 font-sans">Investorlar (50%)</div>
                    <div className="text-emerald-400 font-bold text-xs mt-0.5">
                      +${tradeSessions[0].investorPoolAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-[#090C12] border border-white/5">
                    <div className="text-[9px] text-slate-400 font-sans">Fond (50%)</div>
                    <div className="text-blue-400 font-bold text-xs mt-0.5">
                      +${tradeSessions[0].fundShareAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: INVESTORLAR (INVESTORS DIRECTORY)                 */}
        {/* ======================================================== */}
        {mobileTab === 'investors' && (
          <div className="space-y-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Ism, INV kod yoki telefon qidirish..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131A26] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none pb-1">
              <button
                onClick={() => setInvestorFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  investorFilter === 'ALL'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-[#141B26] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Hammasi ({investors.length})
              </button>
              <button
                onClick={() => setInvestorFilter('RECOVERING')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  investorFilter === 'RECOVERING'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-[#141B26] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Tiklanayotganlar
              </button>
              <button
                onClick={() => setInvestorFilter('RECOVERED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  investorFilter === 'RECOVERED'
                    ? 'bg-teal-500 text-slate-950 shadow'
                    : 'bg-[#141B26] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                100% Tiklangan
              </button>
              <button
                onClick={() => setInvestorFilter('NEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                  investorFilter === 'NEW'
                    ? 'bg-blue-500 text-white shadow'
                    : 'bg-[#141B26] text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                Yangi Kapital
              </button>
            </div>

            {/* Investors List */}
            <div className="space-y-2.5">
              {filteredInvestors.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-[#121824] border border-white/10 hover:border-white/20 transition-all space-y-3"
                >
                  {/* Top: Name, Code & Badge */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center font-bold text-xs text-emerald-400 font-mono">
                        {inv.code.replace('INV-', '')}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-white">{inv.fullName}</div>
                        <div className="text-[10px] text-slate-400 flex items-center space-x-2">
                          <span className="font-mono">{inv.code}</span>
                          <span>•</span>
                          <span>{inv.passportId}</span>
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                        inv.type === 'NEW'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : inv.recovery >= 100
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {inv.type === 'NEW'
                        ? 'Yangi Investor'
                        : inv.recovery >= 100
                        ? '100% Tiklangan'
                        : `${inv.recovery.toFixed(0)}% Tiklanishda`}
                    </span>
                  </div>

                  {/* Middle: Balances & Progress */}
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#090D14] p-2.5 rounded-xl border border-white/5 font-mono">
                    <div>
                      <div className="text-[9px] font-sans text-slate-400">Jami Balans</div>
                      <div className="font-bold text-white text-sm">
                        ${inv.balance.toLocaleString('en-US')}
                      </div>
                    </div>

                    <div>
                      <div className="text-[9px] font-sans text-slate-400">Yangi Kapital</div>
                      <div className="font-bold text-blue-400 text-sm">
                        ${(inv.newCapital || 0).toLocaleString('en-US')}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar if OLD */}
                  {inv.type === 'OLD' && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                        <span>Zararni tiklash:</span>
                        <span className="text-emerald-400 font-bold">{inv.recovery.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, inv.recovery)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Bottom: Fast Mobile Call / Action Buttons */}
                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <div className="flex items-center space-x-2">
                      <a
                        href={`tel:${inv.phone}`}
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 transition-colors border border-white/5"
                        title="Telefon qilish"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>
                      <a
                        href={`https://t.me/+998${inv.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-xl bg-white/[0.04] hover:bg-blue-500/20 text-slate-300 hover:text-blue-400 transition-colors border border-white/5"
                        title="Telegram ochish"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => openModal('new-capital', { investorId: inv.id })}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/20 text-[11px] font-bold transition-colors"
                      >
                        + Kapital
                      </button>
                    </div>

                    <button
                      onClick={() => setQuickInvestorSheet(inv)}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/10 text-slate-200 text-[11px] font-semibold flex items-center space-x-1"
                    >
                      <span>Batafsil</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 3: PUL YECHISH & 24H SLA (WITHDRAWALS QUEUE)         */}
        {/* ======================================================== */}
        {mobileTab === 'withdrawals' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Pul Yechish Navbati (24h SLA)</span>
              <span className="font-mono text-[10px] text-slate-400">
                {withdrawals.length} ta umumiy so‘rov
              </span>
            </div>

            <div className="space-y-3">
              {withdrawals.map((w) => {
                const isPending = w.status === 'PENDING';
                const isSent = w.status === 'SENT';
                const isProofSubmitted = w.status === 'PROOF_SUBMITTED';
                const isCompleted = w.status === 'COMPLETED';

                return (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-2xl neu-card space-y-3"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="font-bold text-xs text-white">{w.investorName}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {w.requestNumber} • {w.method}
                        </div>
                      </div>

                      {/* Status badge */}
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isProofSubmitted
                            ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
                            : isSent
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                        }`}
                      >
                        {w.status}
                      </span>
                    </div>

                    {/* Amount & Destination (Bir tekis joylashgan summa) */}
                    <div className="p-3 rounded-xl neu-inset flex items-center justify-between font-mono border-l-2 border-emerald-500/50">
                      <div>
                        <div className="text-[10px] font-sans text-slate-400 font-medium">So‘ralgan Summa</div>
                        <div className="text-lg font-black text-white font-mono tabular-nums tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                          ${w.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] font-sans text-slate-400 font-medium">To‘lov manzili</div>
                        <div className="text-xs text-slate-300 font-mono max-w-[140px] truncate">
                          {w.destinationDetails}
                        </div>
                      </div>
                    </div>

                    {/* Proof note if submitted */}
                    {w.proofArtifacts && (
                      <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-200 space-y-1">
                        <div className="font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Investor Isbot Yuklagan:</span>
                        </div>
                        <div className="text-[11px] text-blue-300 font-mono">
                          {w.proofArtifacts.receiptScreenshotUrl || 'Screenshot mavjud'}
                        </div>
                      </div>
                    )}

                    {/* Direct Admin Action Buttons */}
                    <div className="flex items-center space-x-2 pt-1 border-t border-white/[0.06]">
                      {isPending && (
                        <button
                          onClick={() => {
                            markWithdrawalAsSent(w.id);
                            addToast('success', `${w.investorName} ga to'lov yuborildi deb belgilandi!`);
                          }}
                          className="flex-1 py-2.5 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs active:scale-95 transition-all text-center shadow-md"
                        >
                          To‘landi deb belgilash
                        </button>
                      )}

                      {isProofSubmitted && (
                        <button
                          onClick={() => {
                            finalizeWithdrawal(w.id);
                            addToast('success', `${w.investorName} kvitansiyasi tasdiqlandi va hisobdan yechildi!`);
                          }}
                          className="flex-1 py-2.5 rounded-xl neu-btn text-blue-300 font-bold text-xs active:scale-95 transition-all text-center"
                        >
                          Tasdiqlash & Yakunlash
                        </button>
                      )}

                      {isSent && (
                        <div className="flex-1 py-2 text-center text-xs text-amber-300 font-mono neu-inset rounded-xl">
                          Investor kvitansiya yuklashi kutilmoqda
                        </div>
                      )}

                      {isCompleted && w.receiptId && (
                        <button
                          onClick={() => {
                            const rec = receipts.find((r) => r.id === w.receiptId);
                            if (rec) setSelectedReceiptForModal(rec);
                          }}
                          className="flex-1 py-2.5 rounded-xl neu-btn text-white font-semibold text-xs flex items-center justify-center space-x-1 active:scale-95"
                        >
                          <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Rasmiy Chek</span>
                        </button>
                      )}

                      {!isCompleted && (
                        <button
                          onClick={() => {
                            setRejectingWithdrawalId(w.id);
                            setRejectReason('Noto‘g‘ri rekvizitlar yoki vaqtinchalik cheklov');
                          }}
                          className="px-3 py-2 rounded-xl neu-btn text-rose-400 text-xs font-semibold active:scale-95 transition-all"
                        >
                          Rad etish
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 4: LEDGER & CHEKLAR (JOURNAL & RECEIPTS)             */}
        {/* ======================================================== */}
        {mobileTab === 'ledger' && (
          <div className="space-y-3">
            {/* Subtab selector */}
            <div className="flex p-1 bg-[#121824] rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setLedgerSubTab('ledger')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  ledgerSubTab === 'ledger'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Bosh Ledger ({ledger.length})
              </button>
              <button
                onClick={() => setLedgerSubTab('receipts')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                  ledgerSubTab === 'receipts'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Rasmiy Cheklar ({receipts.length})
              </button>
            </div>

            {ledgerSubTab === 'ledger' && (
              <div className="space-y-2.5">
                {ledger.slice(0, 20).map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-xl bg-[#121824] border border-white/10 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{entry.investorName}</span>
                      <span className="font-mono text-emerald-400 font-bold text-sm">
                        +${entry.amount.toLocaleString()}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400">{entry.description}</p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-white/5">
                      <span>{entry.entryNumber}</span>
                      <span>
                        ${entry.balanceBefore.toLocaleString()} → ${entry.balanceAfter.toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {ledgerSubTab === 'receipts' && (
              <div className="space-y-2.5">
                {receipts.map((rec) => (
                  <div
                    key={rec.id}
                    onClick={() => setSelectedReceiptForModal(rec)}
                    className="p-3.5 rounded-xl bg-[#121824] border border-white/10 hover:border-emerald-500/40 cursor-pointer space-y-2 transition-all active:scale-98"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-emerald-400">{rec.receiptNumber}</span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rec.issuedAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-white">{rec.investorName}</div>
                        <div className="text-[10px] text-slate-400">{rec.maskedAddress}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-black text-white text-base">
                          ${rec.amount.toLocaleString()}
                        </div>
                        <div className="text-[9px] font-mono text-emerald-400 font-bold">HMAC-SHA256</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 5: SOZLAMALAR & MA'LUMOT (MENU)                     */}
        {/* ======================================================== */}
        {mobileTab === 'menu' && (
          <div className="space-y-4">
            {/* Admin Profile Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#141B26] to-[#0D121B] border border-white/10 flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center font-bold text-slate-950 text-base shadow-lg">
                TI
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Tolib Ibrohimov</h3>
                <p className="text-xs text-emerald-400 font-medium">Bosh Treydor & Fond Boshqaruvchisi</p>
                <p className="text-[10px] text-slate-400 mt-0.5">tolibi1188@gmail.com</p>
              </div>
            </div>

            {/* Quick Export Tools */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hisobotlar & Eksport:</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={exportInvestorsCsv}
                  className="p-3 rounded-xl bg-[#121824] border border-white/10 hover:border-white/20 text-slate-200 font-semibold flex items-center space-x-2"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span>Investorlar (CSV)</span>
                </button>
                <button
                  onClick={exportLedgerCsv}
                  className="p-3 rounded-xl bg-[#121824] border border-white/10 hover:border-white/20 text-slate-200 font-semibold flex items-center space-x-2"
                >
                  <Download className="w-4 h-4 text-blue-400" />
                  <span>Bosh Ledger (CSV)</span>
                </button>
              </div>
            </div>

            {/* System Status */}
            <div className="p-3.5 rounded-2xl bg-[#121824] border border-white/10 space-y-2 text-xs">
              <h4 className="font-bold text-white flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Tizim & Xavfsizlik Holati</span>
              </h4>
              <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">PostgreSQL Tx Engine:</span>
                  <span className="text-emerald-400 font-bold">CONNECTED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">24h SLA Avtomatik Monitoring:</span>
                  <span className="text-emerald-400 font-bold">ACTIVE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Interbank Feed Latency:</span>
                  <span className="text-slate-200">120ms (London)</span>
                </div>
              </div>
            </div>

            {/* Switch to Desktop Button */}
            <button
              onClick={() => onBackToDesktop ? onBackToDesktop() : setActiveTabMode('admin')}
              className="w-full py-3.5 rounded-2xl bg-[#1A2230] hover:bg-[#222D3E] border border-white/15 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all active:scale-98"
            >
              <Monitor className="w-4 h-4 text-emerald-400" />
              <span>To‘liq Desktop ERP Rejimiga O‘tish</span>
            </button>
          </div>
        )}

      </main>

      {/* 3. BOTTOM MOBILE NAVIGATION BAR (Neumorphic) */}
      <nav className="bg-[#0b1018] border-t border-white/[0.06] px-3 py-2 shrink-0 z-30 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        <button
          onClick={() => setMobileTab('dashboard')}
          className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
            mobileTab === 'dashboard'
              ? 'neu-segment-active text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-4 h-4" />
          <span className="text-[10px] font-bold">Boshqaruv</span>
        </button>

        <button
          onClick={() => setMobileTab('investors')}
          className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
            mobileTab === 'investors'
              ? 'neu-segment-active text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span className="text-[10px] font-bold">Investorlar</span>
        </button>

        <button
          onClick={() => setMobileTab('withdrawals')}
          className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl relative transition-all active:scale-95 ${
            mobileTab === 'withdrawals'
              ? 'neu-segment-active text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span className="text-[10px] font-bold">Pul Yechish</span>
          {pendingWithdrawals.length > 0 && (
            <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b] animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setMobileTab('ledger')}
          className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
            mobileTab === 'ledger'
              ? 'neu-segment-active text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span className="text-[10px] font-bold">Jurnal</span>
        </button>

        <button
          onClick={() => setMobileTab('menu')}
          className={`flex flex-col items-center space-y-1 px-3 py-1.5 rounded-xl transition-all active:scale-95 ${
            mobileTab === 'menu'
              ? 'neu-segment-active text-emerald-400 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span className="text-[10px] font-bold">Profil</span>
        </button>
      </nav>

      {/* 4. MODALS & BOTTOM SHEETS */}
      {/* Quick Investor Bottom Sheet */}
      {quickInvestorSheet && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end p-0 sm:p-4">
          <div className="bg-[#121824] border-t sm:border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-lg mx-auto p-5 space-y-4 shadow-2xl animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-bold text-sm text-white">{quickInvestorSheet.fullName}</h3>
                <p className="text-[11px] text-slate-400 font-mono">
                  {quickInvestorSheet.code} • {quickInvestorSheet.phone}
                </p>
              </div>
              <button
                onClick={() => setQuickInvestorSheet(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#090D14] border border-white/5">
                <span className="text-slate-400 text-[10px] font-sans">Joriy Balans:</span>
                <div className="text-base font-bold text-white mt-0.5">
                  ${quickInvestorSheet.balance.toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#090D14] border border-white/5">
                <span className="text-slate-400 text-[10px] font-sans">Yangi Kapital:</span>
                <div className="text-base font-bold text-blue-400 mt-0.5">
                  ${quickInvestorSheet.newCapital.toLocaleString()}
                </div>
              </div>
            </div>

            {quickInvestorSheet.type === 'OLD' && (
              <div className="p-3 rounded-xl bg-[#090D14] border border-white/5 space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Boshlang‘ich Zarar:</span>
                  <span className="text-rose-400 font-bold">
                    ${quickInvestorSheet.initialLoss.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Qoplangan Miqdor:</span>
                  <span className="text-emerald-400 font-bold">
                    ${quickInvestorSheet.recoveredAmount.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-400">Tiklanish Foizi:</span>
                  <span className="text-emerald-400 font-bold">
                    {quickInvestorSheet.recovery.toFixed(1)}%
                  </span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  const id = quickInvestorSheet.id;
                  setQuickInvestorSheet(null);
                  openModal('new-capital', { investorId: id });
                }}
                className="py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xs"
              >
                + Yangi Kapital
              </button>
              {quickInvestorSheet.type === 'OLD' && (
                <button
                  onClick={() => {
                    const id = quickInvestorSheet.id;
                    setQuickInvestorSheet(null);
                    openModal('edit-loss', { investorId: id });
                  }}
                  className="py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-slate-200 font-semibold text-xs border border-white/10"
                >
                  Zararni Tahrirlash
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Withdrawal Prompt Sheet */}
      {rejectingWithdrawalId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121824] border border-white/10 rounded-2xl w-full max-w-sm p-4 space-y-3">
            <h4 className="font-bold text-sm text-white">Pul Yechishni Rad Etish</h4>
            <p className="text-xs text-slate-400">Investorga ko‘rinadigan sababni kiriting:</p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#090D14] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setRejectingWithdrawalId(null)}
                className="flex-1 py-2 rounded-xl bg-white/[0.05] text-slate-300 text-xs font-semibold"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => {
                  rejectWithdrawal(rejectingWithdrawalId, rejectReason);
                  setRejectingWithdrawalId(null);
                  addToast('info', 'Pul yechish so‘rovi rad etildi');
                }}
                className="flex-1 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
              >
                Rad etish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Drawer */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-[#121824] border-t border-white/10 rounded-t-3xl max-h-[80vh] flex flex-col p-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="font-bold text-sm text-white">Bildirishnomalar ({notifications.length})</span>
              <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto space-y-2 py-3">
              {notifications.map((n) => (
                <div key={n.id} className="p-3 rounded-xl bg-[#090D14] border border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{n.title}</span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400">{n.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
