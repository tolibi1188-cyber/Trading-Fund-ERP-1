/**
 * Dashboard Overview View
 * Real-time financial telemetry, AUM, recovery tracking, and 24h SLA queue.
 */

import React, { useState } from 'react';
import { useErp } from '../../../context/ErpContext';
import {
  TrendingUp,
  ShieldAlert,
  Users,
  DollarSign,
  Clock,
  ArrowUpRight,
  FileCheck,
  Coins,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  FileEdit,
  RotateCcw,
  PieChart,
  History,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    investors,
    withdrawals,
    receipts,
    tradeSessions,
    openModal,
    setActiveView,
    setSelectedInvestorForDrawer,
    setSelectedReceiptForModal,
  } = useErp();

  const [expandedSessionId, setExpandedSessionId] = useState<string | null>(null);

  // Metrics calculations
  const totalAum = investors.reduce((sum, i) => sum + i.balance, 0);
  const totalInitialLoss = investors.reduce((sum, i) => sum + i.initialLoss, 0);
  const totalRecovered = investors.reduce((sum, i) => sum + i.recoveredAmount, 0);
  const totalNewCapital = investors.reduce((sum, i) => sum + i.newCapital, 0);

  const overallRecoveryPercent =
    totalInitialLoss > 0 ? Number(((totalRecovered / totalInitialLoss) * 100).toFixed(1)) : 100;

  const pendingWithdrawals = withdrawals.filter((w) => w.status === 'PENDING');
  const sentAwaitingProof = withdrawals.filter((w) => w.status === 'SENT');
  const proofSubmitted = withdrawals.filter((w) => w.status === 'PROOF_SUBMITTED');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 4 Core Financial KPI Cards (Neumorphic Elevated 3D Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total AUM */}
        <div className="p-5 rounded-2xl neu-card neu-card-hover group cursor-default">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="tracking-wider text-slate-400 font-semibold">TOTAL FUND AUM</span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            ${totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 text-xs text-emerald-400 font-sans flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
            <span className="font-medium">{investors.length} ta faol investor hisobi</span>
          </div>
        </div>

        {/* Total Initial Loss & Recovery % */}
        <div className="p-5 rounded-2xl neu-card neu-card-hover group cursor-default">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="tracking-wider text-slate-400 font-semibold">RECOVERY GAP</span>
            <span className="font-bold text-amber-400 px-2 py-0.5 rounded-lg neu-inset text-[11px] shadow-sm">
              {overallRecoveryPercent}%
            </span>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            ${totalRecovered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 text-xs text-slate-400 font-mono flex items-center justify-between">
            <span>Zarar: ${totalInitialLoss.toLocaleString()}</span>
            <span className="text-amber-400/80 font-bold">Tiklanmoqda</span>
          </div>
        </div>

        {/* Fresh New Capital */}
        <div className="p-5 rounded-2xl neu-card neu-card-hover group cursor-default">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="tracking-wider text-slate-400 font-semibold">FRESH CAPITAL (§4)</span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center">
              <Coins className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-extrabold text-blue-300 tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            ${totalNewCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="mt-2.5 text-xs text-blue-400 font-sans font-medium">
            50/50 taqsimotga munosib erkin qism
          </div>
        </div>

        {/* Pending SLA Queue */}
        <div
          onClick={() => setActiveView('withdrawals')}
          className="p-5 rounded-2xl neu-card neu-card-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="tracking-wider text-slate-400 font-semibold">24H WITHDRAWAL SLA</span>
            <div className="w-8 h-8 rounded-xl neu-inset flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4 text-rose-400 group-hover:animate-spin" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-baseline space-x-2 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <span>{pendingWithdrawals.length}</span>
            <span className="text-xs font-normal text-slate-400 font-sans">so&apos;rov navbatda</span>
          </div>
          <div className="mt-2.5 text-xs text-amber-400 font-sans flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping inline-block mr-0.5 shadow-[0_0_6px_#f59e0b]" />
            <span>{proofSubmitted.length} ta tasdiq tekshirishga tayyor</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Pending Action Center & Investor Recovery Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Urgent Withdrawal Actions & Live SLA */}
        <div className="lg:col-span-2 space-y-6">
          {/* Urgent Actions Panel */}
          <div className="p-6 rounded-2xl neu-card space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-bold text-sm text-white">
                  Kutilayotgan Pul Yechish Navbati (24h SLA Countdown)
                </h3>
              </div>
              <button
                onClick={() => setActiveView('withdrawals')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 neu-btn px-2.5 py-1 rounded-lg"
              >
                <span>Barchasini ko‘rish</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {withdrawals.slice(0, 4).length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                Pul yechish so&apos;rovlari mavjud emas.
              </div>
            ) : (
              <div className="divide-y divide-white/5 font-mono text-xs">
                {withdrawals.slice(0, 4).map((w) => {
                  const deadlineMs = new Date(w.slaDeadline).getTime();
                  const remainingMs = Math.max(0, deadlineMs - Date.now());
                  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
                  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

                  return (
                    <div
                      key={w.id}
                      className="py-3 flex items-center justify-between hover:bg-white/[0.02] px-2.5 rounded-xl transition-colors"
                    >
                      <div className="space-y-1 min-w-0 flex-1 pr-3">
                        <div className="flex items-center space-x-2 truncate">
                          <span className="font-bold text-slate-200 truncate">{w.investorName}</span>
                          <span className="text-[10px] text-slate-500 font-mono shrink-0">({w.requestNumber})</span>
                          <span
                            className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              w.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : w.status === 'SENT'
                                ? 'bg-blue-500/20 text-blue-300'
                                : w.status === 'PROOF_SUBMITTED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans truncate">
                          {w.method} • {w.destinationDetails}
                        </div>
                      </div>

                      {/* Uniformly aligned amount column from top to bottom */}
                      <div className="text-right space-y-1 shrink-0 w-44">
                        <div className="font-extrabold text-white text-base font-mono tabular-nums drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                          ${w.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        {w.status === 'PENDING' && (
                          <div className="text-[10px] text-rose-400 font-bold flex items-center justify-end space-x-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping inline-block" />
                            <span className="tabular-nums">SLA: {hours}s {minutes}daq qoldi</span>
                          </div>
                        )}
                        {w.status === 'SENT' && (
                          <div className="text-[10px] text-blue-400">
                            Ilova bloklangan
                          </div>
                        )}
                        {w.status === 'PROOF_SUBMITTED' && (
                          <div className="text-[10px] text-emerald-400 font-bold">
                            Video va skrinshot yuklangan!
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Fund Trade Sessions & 50/50 Profit Distribution Manager (Neumorphic) */}
          <div className="p-6 rounded-2xl neu-card space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.06] pb-4">
              <div>
                <div className="text-[11px] font-mono text-emerald-400 uppercase font-semibold flex items-center space-x-1.5">
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Fond Savdo Sessiyalari & 50/50 Taqsimot</span>
                </div>
                <h3 className="font-bold text-sm text-white mt-0.5">
                  Kunlik Savdo Daromadi & Balanslarga Taqsimlash
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={() => openModal('correct-session')}
                  className="px-3 py-1.5 rounded-xl neu-btn text-amber-300 text-xs font-semibold flex items-center space-x-1.5 active:scale-95"
                  title="Agar daromad summasi xato kiritilgan bo'lsa, to'g'irlash yoki bekor qilish"
                >
                  <FileEdit className="w-3.5 h-3.5" />
                  <span>To&apos;g&apos;irlash</span>
                </button>

                <button
                  onClick={() => openModal('trade-profit', { defaultTab: 'new_balances', defaultMode: 'FRESH_CAPITAL_ONLY' })}
                  className="px-3 py-1.5 rounded-xl neu-btn text-teal-300 font-bold text-xs flex items-center space-x-1.5 active:scale-95"
                  title="Yangi qo'shilgan balanslar (New Capital) uchun alohida savdo daromadini kirgizish"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>+ Yangi Balanslar</span>
                </button>

                <button
                  onClick={() => openModal('trade-profit', { defaultTab: 'all_balances' })}
                  className="px-3.5 py-1.5 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs transition-all active:scale-95 flex items-center space-x-1.5"
                >
                  <DollarSign className="w-4 h-4 stroke-[2.5]" />
                  <span>+ Barcha Balanslarga (50/50)</span>
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl neu-inset text-xs text-emerald-200/90 font-sans leading-relaxed space-y-1.5">
              <span className="font-bold text-emerald-400 flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Foyda Taqsimlash Qoidalari:</span>
              </span>
              <p className="text-slate-300 text-[11px]">
                <b>1. Barcha Balanslarga:</b> Savdo daromadi qo&apos;shilganda barcha faol balanslarga, shu jumladan <b>eski balansga ham</b> proporsional taqsimlanadi (zararni tiklash recovery % oshadi).
              </p>
              <p className="text-slate-300 text-[11px]">
                <b>2. Yangi Balanslar Uchun:</b> Faqat <b>yangi qo&apos;shilgan balanslar</b> (New Capital) uchun alohida daromad kiritish imkoni mavjud.
              </p>
            </div>

            {/* Sessions List */}
            {tradeSessions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-white/[0.01] rounded-xl border border-dashed border-white/10">
                Hali savdo sessiyasi kiritilmagan. Yuqoridagi &ldquo;+ Savdo Daromadi Kiritish&rdquo; tugmasini bosing.
              </div>
            ) : (
              <div className="space-y-3 font-sans">
                {tradeSessions.map((session) => {
                  const isExpanded = expandedSessionId === session.id;

                  return (
                    <div
                      key={session.id}
                      className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/15 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center space-x-2.5">
                          <span className="font-mono text-xs font-bold text-white">
                            {session.sessionNumber}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400">
                            {session.date}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              session.status === 'ACTIVE'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : session.status === 'CORRECTED'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {session.status === 'ACTIVE' ? 'FAOL' : session.status === 'CORRECTED' ? 'TUZATILGAN' : 'BEKOR QILINGAN (ROLLBACK)'}
                          </span>

                          {session.distributionMode === 'FRESH_CAPITAL_ONLY' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center space-x-1">
                              <Sparkles className="w-3 h-3 text-amber-400" />
                              <span>Faqat Yangi Balanslar</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center space-x-1">
                              <span>🌐 Barcha Balanslar</span>
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center space-x-2">
                          {session.status !== 'REVERSED' && (
                            <button
                              onClick={() => openModal('correct-session', { sessionId: session.id })}
                              className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-amber-300 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                            >
                              <FileEdit className="w-3 h-3" />
                              <span>To&apos;g&apos;irlash</span>
                            </button>
                          )}

                          <button
                            onClick={() => setExpandedSessionId(isExpanded ? null : session.id)}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 text-[11px] font-semibold transition-colors flex items-center space-x-1"
                          >
                            <span>Tafsilotlar</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>

                      {/* Financial amounts grid */}
                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-black/30 border border-white/5 font-mono text-xs text-center">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase block">Jami Foyda</span>
                          <span className="font-bold text-white text-xs sm:text-sm">
                            ${session.totalProfit.toLocaleString()}
                          </span>
                          {session.previousProfit && (
                            <span className="line-through text-slate-500 text-[9px] block">
                              ${session.previousProfit.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] text-emerald-400/80 uppercase block">50% Investorlar</span>
                          <span className="font-bold text-emerald-400 text-xs sm:text-sm">
                            +${session.investorPoolAmount.toLocaleString()}
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-blue-400/80 uppercase block">50% Treydor / Fond</span>
                          <span className="font-bold text-blue-400 text-xs sm:text-sm">
                            +${session.fundShareAmount.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {session.notes && (
                        <div className="text-[11px] text-slate-400 italic">
                          Izoh: {session.notes}
                        </div>
                      )}

                      {/* Expandable Breakdown per Investor */}
                      {isExpanded && (
                        <div className="pt-2 border-t border-white/5 space-y-2 animate-in fade-in">
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                            <span>Qoida asosida taqsimlangan mablag&apos;lar:</span>
                            {session.totalEligibleBalance && (
                              <span className="text-emerald-400">
                                Asos Kapital: ${session.totalEligibleBalance.toLocaleString()}
                              </span>
                            )}
                          </div>

                          <div className="divide-y divide-white/5 font-mono text-[11px] rounded-lg border border-white/5 bg-black/20 overflow-hidden">
                            {session.allocations.map((alloc) => (
                              <div
                                key={alloc.investorId}
                                className={`p-2.5 flex items-center justify-between ${
                                  alloc.isEligible ? 'hover:bg-white/[0.01]' : 'opacity-70 bg-white/[0.01]'
                                }`}
                              >
                                <div className="space-y-0.5">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-bold text-slate-200">{alloc.investorName}</span>
                                    <span
                                      className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                                        alloc.isEligible
                                          ? 'bg-emerald-500/20 text-emerald-300'
                                          : 'bg-rose-500/20 text-rose-300'
                                      }`}
                                    >
                                      {alloc.isEligible ? 'Ulush oladi' : 'Ulushsiz (0%)'}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-slate-400">
                                    Balans: ${alloc.balanceBefore.toLocaleString()}
                                    {alloc.isEligible && (
                                      <span className="text-emerald-400 ml-1">
                                        [Asos: ${alloc.eligibleBalance?.toLocaleString() ?? alloc.balanceBefore.toLocaleString()} • {alloc.weightPercent.toFixed(1)}%]
                                      </span>
                                    )}
                                    <span className="text-slate-500 ml-1 italic">
                                      ({alloc.eligibilityReason || (alloc.isEligible ? 'Qoidaga muvofiq' : 'Eski balansi tiklanmaguncha foydadan ulush berilmaydi')})
                                    </span>
                                  </div>
                                </div>

                                <div className="text-right">
                                  <span
                                    className={`font-bold ${
                                      alloc.allocatedShare > 0 ? 'text-emerald-400' : 'text-slate-500'
                                    }`}
                                  >
                                    {alloc.allocatedShare > 0
                                      ? `+$${alloc.allocatedShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                                      : '$0.00'}
                                  </span>
                                  {alloc.investorType === 'OLD' && (
                                    <span className="text-slate-400 text-[10px] ml-2 block">
                                      (Tiklanish: {alloc.recoveryAfter}%)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Investor Recovery Ranks & Fast Jump (Neumorphic) */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl neu-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="font-bold text-sm text-white">Investorlar Holati</h3>
              </div>
              <button
                onClick={() => setActiveView('investors')}
                className="text-xs font-mono text-emerald-400 hover:text-emerald-300 neu-btn px-2.5 py-1 rounded-lg"
              >
                1C Jadval
              </button>
            </div>

            <div className="space-y-3 font-sans">
              {investors.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvestorForDrawer(inv)}
                  className="p-3.5 rounded-xl neu-flat hover:border-emerald-500/30 cursor-pointer transition-all space-y-2 group active:scale-[0.99]"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-200 group-hover:text-emerald-300 transition-colors">
                        {inv.fullName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 ml-2">
                        {inv.code} • {inv.type}
                      </span>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-100">
                      ${inv.balance.toLocaleString()}
                    </span>
                  </div>

                  {inv.type === 'OLD' ? (
                    <div className="space-y-1.5">
                      <div className="w-full neu-progress-track h-2 rounded-full overflow-hidden p-0.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"
                          style={{ width: `${Math.min(100, Math.max(3, inv.recovery))}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-slate-400">
                        <span>Tiklanish: {inv.recovery}%</span>
                        {inv.newCapital > 0 && (
                          <span className="text-blue-400 font-bold">
                            +${inv.newCapital.toLocaleString()} Yangi
                          </span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] font-mono text-emerald-400 flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#10b981]" />
                      <span>100% tiklangan • Doimiy 50/50 taqsimotda</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
