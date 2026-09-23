/**
 * Modal to apply Manual Capital Injection to an OLD investor's recovering balance.
 * Direct injection toward recovery gap (nudges recovery % just like trade profit).
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { FinancialEngine } from '../../services/financialEngine';
import { ArrowRight, CheckCircle2, ShieldCheck, X } from 'lucide-react';

export const ManualInjectionModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { investors, applyManualInjection, modalPayload } = useErp();
  const oldInvestors = investors.filter((i) => i.type === 'OLD');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    modalPayload?.investorId || (oldInvestors[0]?.id ?? '')
  );
  const [amountInput, setAmountInput] = useState<string>('3000');
  const [notes, setNotes] = useState<string>("Qo'lda kiritilgan kompensatsiya mablag'i");

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const parsedAmount = parseFloat(amountInput) || 0;

  const preview = selectedInvestor && parsedAmount > 0
    ? FinancialEngine.applyManualInjection(selectedInvestor, parsedAmount)
    : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor || parsedAmount <= 0) return;
    applyManualInjection(selectedInvestor.id, parsedAmount, notes);
    onClose();
  };

  return (
    <div
      id="manual-injection-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="manual-injection-modal-dialog"
        className="w-full max-w-lg bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">
              Qo&apos;lda Kapital Inyeksiyasi
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Manual Capital Injection (Recovery Nudge)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Eski (OLD) Investorni tanlang
            </label>
            <select
              value={selectedInvestorId}
              onChange={(e) => setSelectedInvestorId(e.target.value)}
              className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
            >
              {oldInvestors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.fullName} ({inv.code}) — Amaldagi tiklanish: {inv.recovery}% (Zarar: ${inv.initialLoss.toLocaleString()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Inyeksiya Summasi (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
              <input
                type="number"
                step="100"
                min="50"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Izoh (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Maxsus kompensatsiya, tashqi kassa tushumi"
              className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-emerald-400"
            />
          </div>

          {selectedInvestor && preview && (
            <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-white/10 font-mono text-xs space-y-2.5">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                Jonli Tiklanish Ta&apos;siri:
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/5">
                <span className="text-slate-400">Tiklanish ko&apos;rsatkichi:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-slate-300 font-bold">{selectedInvestor.recovery}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-emerald-400 font-bold">{preview.recoveryPercentAfter}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-slate-400 px-1">
                <span>Yangi tiklangan jami dollar:</span>
                <span className="text-slate-200 font-bold">
                  ${preview.recoveredAmountAfter.toLocaleString()} / ${selectedInvestor.initialLoss.toLocaleString()}
                </span>
              </div>
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
              disabled={parsedAmount <= 0}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Inyeksiyani Qo&apos;llash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
