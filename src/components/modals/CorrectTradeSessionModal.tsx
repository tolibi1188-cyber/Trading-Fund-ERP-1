/**
 * Modal to correct or rollback a previously entered trade session profit distribution.
 * Implements full audit compliance, recalculating deltas for all investors and writing correction ledger entries.
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { FinancialEngine } from '../../services/financialEngine';
import { TradeSession } from '../../types/erp';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  X,
  FileEdit,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const CorrectTradeSessionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { tradeSessions, investors, correctTradeSession, rollbackTradeSession, modalPayload } = useErp();

  // Find target session
  const targetSessionId = modalPayload?.sessionId || tradeSessions[0]?.id;
  const [selectedSessionId, setSelectedSessionId] = useState<string>(targetSessionId || '');
  const activeSession: TradeSession | undefined = tradeSessions.find((s) => s.id === selectedSessionId) || tradeSessions[0];

  const [newProfitInput, setNewProfitInput] = useState<string>(
    activeSession ? String(activeSession.totalProfit) : '35000'
  );
  const [reasonInput, setReasonInput] = useState<string>(
    'Savdo sessiyasi daromadida raqam xato kiritilgan edi'
  );
  const [isConfirmingRollback, setIsConfirmingRollback] = useState<boolean>(false);

  // When changing selected session, update input
  const handleSelectSession = (id: string) => {
    setSelectedSessionId(id);
    const s = tradeSessions.find((item) => item.id === id);
    if (s) {
      setNewProfitInput(String(s.totalProfit));
    }
  };

  const parsedNewProfit = parseFloat(newProfitInput) || 0;

  // Calculate live preview of delta
  const preview = activeSession && parsedNewProfit > 0
    ? (() => {
        // Reconstruct base balances and new capital before this session
        const reconstructed = investors.map((inv) => {
          const alloc = activeSession.allocations.find((a) => a.investorId === inv.id);
          const baseBalance = alloc ? alloc.balanceBefore : inv.balance;
          const baseNewCapital = alloc && alloc.newCapitalBefore !== undefined ? alloc.newCapitalBefore : inv.newCapital;
          return {
            ...inv,
            balance: baseBalance,
            newCapital: baseNewCapital,
          };
        });

        const newCalc = FinancialEngine.calculateSessionDistribution(
          reconstructed,
          parsedNewProfit,
          activeSession.investorPoolSharePercent,
          activeSession.distributionMode || 'ALL_BALANCES_INCLUDING_OLD'
        );

        const deltaTotalProfit = parsedNewProfit - activeSession.totalProfit;
        const deltaInvestorPool = newCalc.investorPoolAmount - activeSession.investorPoolAmount;
        const deltaFundShare = newCalc.fundShareAmount - activeSession.fundShareAmount;

        const investorDiffs = newCalc.allocations.map((newA) => {
          const oldA = activeSession.allocations.find((o) => o.investorId === newA.investorId);
          const oldShare = oldA ? oldA.allocatedShare : 0;
          const shareDelta = Number((newA.allocatedShare - oldShare).toFixed(2));
          return {
            investorId: newA.investorId,
            investorName: newA.investorName,
            investorType: newA.investorType,
            isEligible: newA.isEligible,
            eligibleBalance: newA.eligibleBalance,
            eligibilityReason: newA.eligibilityReason,
            oldShare,
            newShare: newA.allocatedShare,
            shareDelta,
            newBalanceAfter: newA.balanceAfter,
            recoveryAfter: newA.recoveryAfter,
          };
        });

        return {
          deltaTotalProfit,
          deltaInvestorPool,
          deltaFundShare,
          newCalc,
          investorDiffs,
        };
      })()
    : null;

  const handleCorrectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || parsedNewProfit <= 0) return;
    correctTradeSession(activeSession.id, parsedNewProfit, reasonInput.trim() || "Xatolik to'g'irlandi");
    onClose();
  };

  const handleRollbackConfirm = () => {
    if (!activeSession) return;
    rollbackTradeSession(activeSession.id, reasonInput.trim() || 'Treydor tomonidan toliq bekor qilindi');
    onClose();
  };

  if (!activeSession) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className="bg-[#161B22] p-6 rounded-2xl border border-white/10 text-center space-y-4 max-w-sm">
          <p className="text-sm text-slate-300">To&apos;g&apos;irlash uchun hech qanday savdo sessiyasi topilmadi.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            Yopish
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="correct-session-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="correct-session-modal-dialog"
        className="w-full max-w-2xl bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileEdit className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-amber-400 uppercase font-semibold">
                Xatolikni Tuzatish & Qayta Hisoblash
              </div>
              <h3 className="text-base font-bold text-white">
                Savdo Sessiyasini To&apos;g&apos;irlash (Rollback / Edit)
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Session selector */}
        {tradeSessions.length > 1 && (
          <div className="mt-4">
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              To&apos;g&apos;irlanadigan Sessiyani Tanlang:
            </label>
            <select
              value={selectedSessionId}
              onChange={(e) => handleSelectSession(e.target.value)}
              className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-amber-400"
            >
              {tradeSessions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sessionNumber} ({s.date}) — Jami: ${s.totalProfit.toLocaleString()} | 50% Inv: ${s.investorPoolAmount.toLocaleString()} [{s.status}]
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Active Session Baseline Information */}
        <div className="mt-4 p-3.5 rounded-xl bg-[#0D1117] border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Sessiya Raqami</span>
            <span className="font-bold text-white">{activeSession.sessionNumber}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Kiritilgan Sana</span>
            <span className="text-slate-300">{activeSession.date}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Avvalgi Daromad</span>
            <span className="font-bold text-amber-400">${activeSession.totalProfit.toLocaleString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase block">Holat</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${activeSession.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400' : activeSession.status === 'CORRECTED' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
              {activeSession.status}
            </span>
          </div>
        </div>

        {activeSession.status === 'REVERSED' ? (
          <div className="mt-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>Bu sessiya to&apos;liq bekor qilingan (Reversed). Uni qayta tahrirlab bo&apos;lmaydi. Yangi sessiya ochishingiz mumkin.</span>
          </div>
        ) : (
          <form onSubmit={handleCorrectSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* New Profit Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  To&apos;g&apos;ri Umumiy Savdo Daromadi (USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="100"
                    min="1"
                    required
                    value={newProfitInput}
                    onChange={(e) => setNewProfitInput(e.target.value)}
                    placeholder="Masalan: 35000"
                    className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Correction Reason */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  To&apos;g&apos;irlash Sababi (Audit & Jurnal uchun) *
                </label>
                <input
                  type="text"
                  required
                  value={reasonInput}
                  onChange={(e) => setReasonInput(e.target.value)}
                  placeholder="Xatolik sababi..."
                  className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-sans focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* LIVE CALCULATION DIFF & COMPARISON */}
            {preview && (
              <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-white/10 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pb-2 border-b border-white/5">
                  <span>Qayta Taqsimot Farqi (Comparison)</span>
                  <span className={`font-bold flex items-center space-x-1 ${preview.deltaTotalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {preview.deltaTotalProfit >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{preview.deltaTotalProfit >= 0 ? `+$${preview.deltaTotalProfit.toLocaleString()}` : `-$${Math.abs(preview.deltaTotalProfit).toLocaleString()}`}</span>
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 font-mono text-center">
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-500 block">Yangi Jami Foyda</span>
                    <span className="font-bold text-white text-xs">${parsedNewProfit.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-500 block">50% Investorlar Hovuzi</span>
                    <span className="font-bold text-emerald-400 text-xs">${preview.newCalc.investorPoolAmount.toLocaleString()}</span>
                    <span className={`text-[9px] block ${preview.deltaInvestorPool >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ({preview.deltaInvestorPool >= 0 ? `+${preview.deltaInvestorPool}` : preview.deltaInvestorPool})
                    </span>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-[10px] text-slate-500 block">50% Treydor / Fond</span>
                    <span className="font-bold text-blue-400 text-xs">${preview.newCalc.fundShareAmount.toLocaleString()}</span>
                    <span className={`text-[9px] block ${preview.deltaFundShare >= 0 ? 'text-blue-400' : 'text-rose-400'}`}>
                      ({preview.deltaFundShare >= 0 ? `+${preview.deltaFundShare}` : preview.deltaFundShare})
                    </span>
                  </div>
                </div>

                {/* Individual Investor Delta Table */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Investorlar balansi va tiklanishiga tuzatish:
                  </span>
                  <div className="max-h-52 overflow-y-auto divide-y divide-white/5 font-mono text-[11px] rounded-lg border border-white/5 bg-black/20">
                    {preview.investorDiffs.map((diff) => (
                      <div key={diff.investorId} className="p-2.5 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <div className="flex items-center space-x-1.5">
                            <span className="font-bold text-white">{diff.investorName}</span>
                            <span className="text-slate-500 text-[10px]">({diff.investorType})</span>
                            <span
                              className={`text-[9px] px-1 py-0.2 rounded font-sans font-bold ${
                                diff.isEligible
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : 'bg-rose-500/15 text-rose-300'
                              }`}
                            >
                              {diff.isEligible ? 'Ulush oladi' : 'Ulushsiz (0%)'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {diff.eligibilityReason}
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-right">
                          <div className="text-slate-400 text-[10px]">
                            ${diff.oldShare.toLocaleString()} <ArrowRight className="w-2.5 h-2.5 inline mx-0.5 text-slate-600" /> ${diff.newShare.toLocaleString()}
                          </div>
                          <div className={`font-bold min-w-[70px] ${diff.shareDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {diff.shareDelta >= 0 ? `+$${diff.shareDelta.toLocaleString()}` : `-$${Math.abs(diff.shareDelta).toLocaleString()}`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Rollback confirmation box */}
            {isConfirmingRollback && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-3">
                <div className="flex items-start space-x-2 text-rose-300 text-xs">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block text-sm text-white">Sessiyani to&apos;liq bekor qilish (Rollback)?</span>
                    Bu sessiya orqali barcha investorlarga taqsimlangan <b>${activeSession.investorPoolAmount.toLocaleString()}</b> mablag&apos; ularning balansidan qaytarib olinadi va tiklanish foizlari avvalgi holatiga qaytariladi.
                  </div>
                </div>
                <div className="flex items-center justify-end space-x-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsConfirmingRollback(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="button"
                    onClick={handleRollbackConfirm}
                    className="px-4 py-1.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg transition-colors flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Ha, To&apos;liq Bekor Qilish (Rollback)</span>
                  </button>
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              {!isConfirmingRollback ? (
                <button
                  type="button"
                  onClick={() => setIsConfirmingRollback(true)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-rose-500/20 transition-colors flex items-center space-x-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Sessiyani To&apos;liq Bekor Qilish</span>
                </button>
              ) : <div />}

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  Yopish
                </button>
                <button
                  type="submit"
                  disabled={parsedNewProfit <= 0 || !reasonInput.trim()}
                  className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Tuzatishni Saqlash & Qayta Taqsimlash</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
