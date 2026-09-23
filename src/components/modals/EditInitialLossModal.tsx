/**
 * Modal to edit initialLoss with live recovery % recalculation preview.
 * Strictly preserves absolute recovered dollars and writes to ledger + audit.
 */

import React, { useState } from 'react';
import { Investor } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import { FinancialEngine } from '../../services/financialEngine';
import { AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';

interface EditInitialLossModalProps {
  investor: Investor;
  onClose: () => void;
}

export const EditInitialLossModal: React.FC<EditInitialLossModalProps> = ({ investor, onClose }) => {
  const { updateInitialLoss } = useErp();
  const [newLossInput, setNewLossInput] = useState<string>(investor.initialLoss.toString());

  const parsedNewLoss = parseFloat(newLossInput) || 0;
  const preview = FinancialEngine.previewInitialLossCorrection(investor, parsedNewLoss);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedNewLoss <= 0) return;
    updateInitialLoss(investor.id, parsedNewLoss);
    onClose();
  };

  return (
    <div
      id="edit-loss-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="edit-loss-modal-dialog"
        className="w-full max-w-lg bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-amber-400 uppercase font-semibold">
              Boshlang&apos;ich zararni to&apos;g&apos;rilash
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Edit Initial Loss — {investor.fullName}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Key Rule Callout */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start space-x-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Moliyaviy hisob qoidasi:</span> Hozirgacha tiklangan mutlaq summa{' '}
              <span className="font-mono font-bold text-white">
                ${investor.recoveredAmount.toLocaleString()}
              </span>{' '}
              to&apos;liq saqlab qolinadi. Zarar miqdori o&apos;zgarganda, tiklanish foizi avtomatik qayta hisoblanadi va
              Ledger hamda Audit jurnaliga qayd etiladi.
            </div>
          </div>

          {/* Current vs New Input */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">
                Amaldagi Boshlang&apos;ich Zarar (Current Initial Loss)
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-slate-400 font-mono text-sm">
                ${investor.initialLoss.toLocaleString()} USD
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Yangi Boshlang&apos;ich Zarar (New Initial Loss, USD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="100"
                  min="1"
                  required
                  value={newLossInput}
                  onChange={(e) => setNewLossInput(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* LIVE RECALCULATION PREVIEW BOX */}
          <div className="p-4 rounded-xl bg-[#0D1117]/80 border border-white/10 space-y-3 font-mono text-xs">
            <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
              <span>Qayta hisoblash jonli tekshiruvi (Live Preview)</span>
              <span className="text-emerald-400 font-bold">Saqlanadigan summa: ${preview.recoveredDollarAmount.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <div>
                <div className="text-[10px] text-slate-400">Oldingi Tiklanish %</div>
                <div className="text-base font-bold text-slate-300">{preview.oldRecoveryPercent}%</div>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-500" />

              <div>
                <div className="text-[10px] text-slate-400">Yangi Tiklanish %</div>
                <div className="text-base font-bold text-emerald-400">{preview.newRecoveryPercent}%</div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-slate-400">Farq (Delta)</div>
                <div className={`text-sm font-bold ${preview.recoveryDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {preview.recoveryDelta >= 0 ? '+' : ''}{preview.recoveryDelta}%
                </div>
              </div>
            </div>
          </div>

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
              disabled={parsedNewLoss <= 0}
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Tasdiqlash va Qayta Hisoblash</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
