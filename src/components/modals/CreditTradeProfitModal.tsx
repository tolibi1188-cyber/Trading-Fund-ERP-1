/**
 * Modal to credit trade profit.
 * Mode 1: All balances including old balances (Barcha Balanslarga 50/50).
 * Mode 2: Dedicated profit session for newly added balances only (Faqat Yangi Balanslar Uchun Alohida).
 * Mode 3: Single investor individual profit credit.
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { FinancialEngine } from '../../services/financialEngine';
import {
  DollarSign,
  ArrowRight,
  X,
  PieChart,
  User,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Coins,
} from 'lucide-react';

type TabMode = 'all_balances' | 'new_balances' | 'single';

export const CreditTradeProfitModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const {
    investors,
    distributeTradeSession,
    applyTradeProfitCredit,
    modalPayload,
  } = useErp();

  // Initial tab resolution based on payload
  const initialTab: TabMode =
    modalPayload?.defaultTab === 'new_balances' || modalPayload?.defaultMode === 'FRESH_CAPITAL_ONLY'
      ? 'new_balances'
      : modalPayload?.investorId
      ? 'single'
      : 'all_balances';

  const [activeTab, setActiveTab] = useState<TabMode>(initialTab);

  // Profit Inputs for General / New Balances
  const [allProfitInput, setAllProfitInput] = useState<string>('40000');
  const [allPoolPercent, setAllPoolPercent] = useState<number>(50);
  const [allNotes, setAllNotes] = useState<string>(
    'Bugungi savdo sessiyasi: XAU/USD va EUR/USD savdo foydasi (Barcha balanslarga 50/50)'
  );

  const [newProfitInput, setNewProfitInput] = useState<string>('20000');
  const [newPoolPercent, setNewPoolPercent] = useState<number>(50);
  const [newNotes, setNewNotes] = useState<string>(
    'Yangi qo\'shilgan balanslar (New Capital) bo\'yicha alohida savdo foydasi'
  );

  // Single Mode States
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    modalPayload?.investorId || (investors[0]?.id ?? '')
  );
  const [singleProfitInput, setSingleProfitInput] = useState<string>('5000');

  // Stats for New Balances
  const totalNewBalances = investors.reduce(
    (sum, i) => sum + (i.type === 'NEW' ? i.balance : i.newCapital || 0),
    0
  );
  const eligibleNewCount = investors.filter(
    (i) => (i.type === 'NEW' && i.balance > 0) || (i.type === 'OLD' && (i.newCapital || 0) > 0)
  ).length;
  const excludedCount = investors.length - eligibleNewCount;

  // Calculations for Mode 1: ALL_BALANCES_INCLUDING_OLD
  const parsedAllProfit = parseFloat(allProfitInput) || 0;
  const allCalc =
    parsedAllProfit > 0
      ? FinancialEngine.calculateSessionDistribution(
          investors,
          parsedAllProfit,
          allPoolPercent,
          'ALL_BALANCES_INCLUDING_OLD'
        )
      : null;

  // Calculations for Mode 2: FRESH_CAPITAL_ONLY (Dedicated for newly added balances)
  const parsedNewProfit = parseFloat(newProfitInput) || 0;
  const newCalc =
    parsedNewProfit > 0
      ? FinancialEngine.calculateSessionDistribution(
          investors,
          parsedNewProfit,
          newPoolPercent,
          'FRESH_CAPITAL_ONLY'
        )
      : null;

  // Calculations for Mode 3: SINGLE
  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId) || investors[0];
  const parsedSingleProfit = parseFloat(singleProfitInput) || 0;
  const singleCalc =
    selectedInvestor && parsedSingleProfit > 0
      ? FinancialEngine.calculateProfitCredit(selectedInvestor, parsedSingleProfit)
      : null;

  // Submits
  const handleAllSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedAllProfit <= 0) return;
    distributeTradeSession(
      parsedAllProfit,
      allNotes.trim() || undefined,
      allPoolPercent,
      'ALL_BALANCES_INCLUDING_OLD'
    );
    onClose();
  };

  const handleNewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedNewProfit <= 0) return;
    distributeTradeSession(
      parsedNewProfit,
      newNotes.trim() || undefined,
      newPoolPercent,
      'FRESH_CAPITAL_ONLY'
    );
    onClose();
  };

  const handleSingleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor || parsedSingleProfit <= 0) return;
    applyTradeProfitCredit(selectedInvestor.id, parsedSingleProfit);
    onClose();
  };

  return (
    <div
      id="trade-profit-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="trade-profit-modal-dialog"
        className="w-full max-w-2xl bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase font-semibold flex items-center space-x-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Savdo Daromadini Kiritish & Taqsimlash</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Trading Profit Allocation Center
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Primary Navigation Tabs */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-1.5 p-1 rounded-xl bg-[#0D1117] border border-white/10">
          {/* Tab 1: All Balances */}
          <button
            type="button"
            onClick={() => setActiveTab('all_balances')}
            className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-lg text-xs transition-all text-center ${
              activeTab === 'all_balances'
                ? 'bg-blue-600 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <PieChart className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">Barcha Balanslar</span>
            </div>
            <span className="text-[10px] opacity-80 mt-0.5 font-normal">
              Eski + Yangi Balanslarga
            </span>
          </button>

          {/* Tab 2: Dedicated New Balances */}
          <button
            type="button"
            onClick={() => setActiveTab('new_balances')}
            className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-lg text-xs transition-all text-center relative ${
              activeTab === 'new_balances'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md'
                : 'text-emerald-400 hover:text-emerald-300 hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="font-bold text-xs">Yangi Balanslar Uchun</span>
            </div>
            <span className="text-[10px] opacity-90 mt-0.5 font-medium">
              Faqat Yangi Kapitalga (Alohida)
            </span>
          </button>

          {/* Tab 3: Single Investor */}
          <button
            type="button"
            onClick={() => setActiveTab('single')}
            className={`flex flex-col items-center justify-center py-2 px-2.5 rounded-lg text-xs transition-all text-center ${
              activeTab === 'single'
                ? 'bg-white/15 text-white font-bold shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/[0.03]'
            }`}
          >
            <div className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5" />
              <span className="font-semibold text-xs">Yakka Investorga</span>
            </div>
            <span className="text-[10px] opacity-80 mt-0.5 font-normal">
              1 ta hisobga to&apos;g&apos;ridan-to&apos;g&apos;ri
            </span>
          </button>
        </div>

        {/* ================= TAB 1: BARCHA BALANSLAR (ESKI + YANGI) ================= */}
        {activeTab === 'all_balances' && (
          <form onSubmit={handleAllSubmit} className="mt-4 space-y-4">
            {/* Banner */}
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed font-sans">
                <span className="font-bold text-blue-300 uppercase tracking-wider text-[11px] block">
                  Barcha Balanslarga Taqsimlash Qoidasi:
                </span>
                <p className="text-[11px] text-blue-200/90">
                  Ushbu rejimda foyda fonddagi barcha faol mablag&apos;larga, shu jumladan <b>eski balansga ham</b> proporsional taqsimlanadi. Eski investorlarning ulushi ularning umumiy balansini oshirib, zararni tiklash (recovery %) darajasini oshiradi.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gross Profit Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Umumiy Ishlangan Foyda (Gross Trade Profit, USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="100"
                    min="10"
                    required
                    value={allProfitInput}
                    onChange={(e) => setAllProfitInput(e.target.value)}
                    placeholder="Masalan: 40000"
                    className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                  />
                </div>
              </div>

              {/* Pool % Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Investorlar Ulushi (50% qoidasi)
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-400">
                    {allPoolPercent}%
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={allPoolPercent}
                    onChange={(e) => setAllPoolPercent(Number(e.target.value))}
                    className="w-full accent-blue-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Fond: {100 - allPoolPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sessiya Izohi
              </label>
              <input
                type="text"
                value={allNotes}
                onChange={(e) => setAllNotes(e.target.value)}
                placeholder="Savdo tafsilotlari"
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Live Preview */}
            {allCalc && (
              <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-white/10 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
                  <span>Barcha Balanslar Bo&apos;yicha Taqsimot</span>
                  <span className="text-blue-400 font-bold">
                    Jami Asos Balans: ${allCalc.totalEligibleBalance.toLocaleString()} USD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Investorlar Ulushi ({allPoolPercent}%):
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      +${allCalc.investorPoolAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-blue-300/80 mt-1">
                      Barcha balanslarga proporsional
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/40 border border-white/10">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Treydor / Fond Ulushi ({100 - allPoolPercent}%):
                    </span>
                    <span className="text-lg font-bold text-white">
                      +${allCalc.fundShareAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Fond hisobiga o&apos;tadi
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="max-h-52 overflow-y-auto divide-y divide-white/5 font-mono text-xs rounded-lg border border-white/5 bg-black/20">
                  {allCalc.allocations.map((alloc) => (
                    <div
                      key={alloc.investorId}
                      className="p-2.5 flex items-center justify-between hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-white text-xs">{alloc.investorName}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                              alloc.investorType === 'OLD'
                                ? 'bg-amber-500/20 text-amber-300'
                                : 'bg-emerald-500/20 text-emerald-300'
                            }`}
                          >
                            {alloc.investorType}
                          </span>
                          <span className="text-[9px] text-blue-400 font-sans">
                            {alloc.weightPercent.toFixed(1)}% ulush
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Balans: ${alloc.balanceBefore.toLocaleString()} • {alloc.eligibilityReason}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-sm text-blue-400">
                          +${alloc.allocatedShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          Natija: ${alloc.balanceAfter.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={parsedAllProfit <= 0}
                className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Barcha Balanslarga Taqsimlash (50/50)</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 2: FAQAT YANGI BALANSLAR UCHUN (ALOHIDA) ================= */}
        {activeTab === 'new_balances' && (
          <form onSubmit={handleNewSubmit} className="mt-4 space-y-4">
            {/* Banner */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-200 text-xs space-y-2">
              <div className="flex items-start space-x-2.5">
                <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-relaxed font-sans">
                  <span className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] block">
                    Yangi Qo&apos;shilgan Balanslar Uchun Alohida Taqsimot:
                  </span>
                  <p className="text-[11px] text-emerald-200/90">
                    Ushbu savdo sessiyasi daromadi <b>FAQAT yangi qo&apos;shilgan balanslar</b> (yangi investorlar va eski investorlarning yangi kiritgan yangi kapitali) bo&apos;yicha proporsional taqsimlanadi. Eski tiklanayotgan balanslarga ($0) foyda berilmaydi va ularning tiklanish foiziga ta&apos;sir qilmaydi.
                  </p>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-emerald-500/20 font-mono text-[11px]">
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 font-bold flex items-center space-x-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Jami Yangi Balanslar: ${totalNewBalances.toLocaleString()}</span>
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-300">
                  {eligibleNewCount} ta munosib investor
                </div>
                <div className="px-2.5 py-1 rounded-lg bg-white/5 text-slate-400">
                  {excludedCount} ta eski balans (ishtirok etmaydi)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gross Profit Input */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Yangi Balanslar Uchun Savdo Foydasi (Gross Trade Profit, USD) *
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                  <input
                    type="number"
                    step="100"
                    min="10"
                    required
                    value={newProfitInput}
                    onChange={(e) => setNewProfitInput(e.target.value)}
                    placeholder="Masalan: 20000"
                    className="w-full bg-[#0D1117] border border-emerald-500/40 rounded-xl pl-8 pr-4 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400 ring-1 ring-emerald-500/20"
                  />
                </div>
              </div>

              {/* Pool % Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-slate-300">
                    Yangi Balans Egalari Ulushi
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {newPoolPercent}%
                  </span>
                </div>
                <div className="flex items-center space-x-3 bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2">
                  <input
                    type="range"
                    min="10"
                    max="90"
                    step="5"
                    value={newPoolPercent}
                    onChange={(e) => setNewPoolPercent(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                  <span className="text-[11px] font-mono text-slate-400 shrink-0">
                    Fond: {100 - newPoolPercent}%
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Sessiya Izohi
              </label>
              <input
                type="text"
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                placeholder="Masalan: Yangi depozitlar bo'yicha maxsus savdo daromadi"
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-xs text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Live Preview for New Balances */}
            {newCalc && (
              <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-emerald-500/20 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
                  <span className="text-emerald-400 font-bold flex items-center space-x-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Yangi Balanslar Taqsimot Natijasi</span>
                  </span>
                  <span className="text-white font-bold">
                    Asos Yangi Kapital: ${newCalc.totalEligibleBalance.toLocaleString()} USD
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Yangi Balans Egalariga ({newPoolPercent}%):
                    </span>
                    <span className="text-lg font-bold text-emerald-400">
                      +${newCalc.investorPoolAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-emerald-300/80 mt-1">
                      Faqat yangi kiritilgan kapitaliga qo&apos;shiladi
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="text-[10px] text-slate-400 block mb-0.5">
                      Treydor / Fond Ulushi ({100 - newPoolPercent}%):
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      +${newCalc.fundShareAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="text-[10px] text-blue-300/80 mt-1">
                      Fond operatsion hisobiga
                    </div>
                  </div>
                </div>

                {/* Table for New Balances */}
                <div className="space-y-1 pt-1">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
                    <span>Ishtirokchi Investorlar & Yangi Balans Ulushi:</span>
                    <span>Taqsimlanadi ($)</span>
                  </div>

                  <div className="max-h-56 overflow-y-auto divide-y divide-white/5 font-mono text-xs rounded-lg border border-white/5 bg-black/20">
                    {newCalc.allocations.map((alloc) => (
                      <div
                        key={alloc.investorId}
                        className={`p-2.5 flex items-center justify-between transition-colors ${
                          alloc.isEligible ? 'hover:bg-white/[0.02]' : 'bg-white/[0.01] opacity-60'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-xs">{alloc.investorName}</span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                                alloc.investorType === 'OLD'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}
                            >
                              {alloc.investorType}
                            </span>
                            <span
                              className={`text-[9px] px-1.5 py-0.2 rounded font-sans font-bold ${
                                alloc.isEligible
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-slate-700/50 text-slate-400'
                              }`}
                            >
                              {alloc.isEligible
                                ? `✓ Munosib ($${alloc.eligibleBalance.toLocaleString()} yangi kapital)`
                                : '— Yangi balans yo‘q ($0)'}
                            </span>
                          </div>

                          <div className="text-[10px] text-slate-400 space-y-0.5">
                            <div>
                              Jami balansi: ${alloc.balanceBefore.toLocaleString()} 
                              {alloc.isEligible && (
                                <span className="text-emerald-400 font-semibold ml-1.5">
                                  [Yangi Balansi: ${alloc.eligibleBalance.toLocaleString()} — {alloc.weightPercent.toFixed(1)}% ulush]
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-500 italic">
                              {alloc.eligibilityReason}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            className={`font-bold text-sm ${
                              alloc.allocatedShare > 0 ? 'text-emerald-400' : 'text-slate-500'
                            }`}
                          >
                            {alloc.allocatedShare > 0
                              ? `+$${alloc.allocatedShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}`
                              : '$0.00'}
                          </span>
                          <div className="text-[10px] text-slate-400">
                            Yangi balans: ${alloc.balanceAfter.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={parsedNewProfit <= 0}
                className="flex items-center space-x-1.5 px-6 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Yangi Balanslarga Taqsimlash ({newPoolPercent}%)</span>
              </button>
            </div>
          </form>
        )}

        {/* ================= TAB 3: SINGLE INVESTOR INDIVIDUAL ================= */}
        {activeTab === 'single' && (
          <form onSubmit={handleSingleSubmit} className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Investorni tanlang (Select Investor)
              </label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
              >
                {investors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.fullName} ({inv.code}) — {inv.type} [Balans: ${inv.balance.toLocaleString()} | Tiklanish: {inv.recovery}% {inv.newCapital > 0 ? `| Yangi kapital: $${inv.newCapital.toLocaleString()}` : ''}]
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Kreditlanayotgan Savdo Foydasi (Gross Trade Profit, USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="100"
                  min="10"
                  required
                  value={singleProfitInput}
                  onChange={(e) => setSingleProfitInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* Single Preview */}
            {singleCalc && selectedInvestor && (
              <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-white/10 space-y-3 font-sans text-xs">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 pb-2 border-b border-white/5">
                  <span>Yakka Taqsimot Qoidasi</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {singleCalc.isMixed
                      ? 'ARALASH (PROPORTIONAL)'
                      : selectedInvestor.type === 'NEW' || selectedInvestor.recovery >= 100
                      ? '50/50 TAQSIMOT'
                      : '100% ZARARNI TIKLASH'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs pt-1">
                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-slate-400 text-[10px] block mb-0.5">
                      Investor hisobiga o&apos;tadi:
                    </span>
                    <span className="text-base font-bold text-emerald-400">
                      +${singleCalc.investorShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                    <span className="text-slate-400 text-[10px] block mb-0.5">Fond ulushi:</span>
                    <span className="text-base font-bold text-blue-400">
                      +${singleCalc.fundShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {selectedInvestor.type === 'OLD' && (
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.02] border border-white/5 font-mono text-xs">
                    <span className="text-slate-400">Tiklanish ko&apos;rsatkichi:</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-slate-300 font-bold">{singleCalc.recoveryPercentBefore}%</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-emerald-400 font-bold">{singleCalc.recoveryPercentAfter}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={parsedSingleProfit <= 0}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
              >
                <DollarSign className="w-4 h-4" />
                <span>Kreditlash</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
