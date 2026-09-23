/**
 * Modal to deposit fresh New Capital for an OLD recovering investor.
 * Business Rule (§4): Untouched recovery %, immediately 50/50 eligible, freely withdrawable up to 20%/month.
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Coins, ShieldCheck, X, AlertCircle } from 'lucide-react';

export const NewCapitalModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { investors, addFreshCapital, modalPayload } = useErp();
  const oldInvestors = investors.filter((i) => i.type === 'OLD');
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>(
    modalPayload?.investorId || (oldInvestors[0]?.id ?? '')
  );
  const [amountInput, setAmountInput] = useState<string>('10000');
  const [notes, setNotes] = useState<string>('Yangi depozit (bank o‘tkazmasi)');

  const selectedInvestor = investors.find((i) => i.id === selectedInvestorId);
  const parsedAmount = parseFloat(amountInput) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestor || parsedAmount <= 0) return;
    addFreshCapital(selectedInvestor.id, parsedAmount, notes);
    onClose();
  };

  return (
    <div
      id="new-capital-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="new-capital-modal-dialog"
        className="w-full max-w-lg bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-blue-400 uppercase font-semibold">
              Yangi Kapital Qo&apos;shish (New Capital)
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Fresh Capital Deposit (OLD Investor)
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-5">
          {/* Key Rule Callout */}
          <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs text-blue-300 flex items-start space-x-2.5 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">§4 Biznes qoidasi:</span> Ushbu depozit investorning eski zararini
              tiklashga hisoblanmaydi (tiklanish foizi o&apos;zgarmaydi). Yangi kiritilgan summa darhol 50/50 savdo
              foydasiga haqli bo&apos;ladi va eski zarar tiklanib bo&apos;lmagan taqdirda ham oylik 20% limit doirasida erkin
              yechib olinishi mumkin.
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Eski (OLD) Investorni tanlang
            </label>
            <select
              value={selectedInvestorId}
              onChange={(e) => setSelectedInvestorId(e.target.value)}
              className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-blue-400"
            >
              {oldInvestors.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.fullName} ({inv.code}) — Mavjud New Capital: ${inv.newCapital.toLocaleString()} | Tiklanish: {inv.recovery}%
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Yangi Kiritilayotgan Depozit Summasi (USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-mono text-sm">$</span>
              <input
                type="number"
                step="100"
                min="100"
                required
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl pl-8 pr-4 py-2.5 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Izoh yoki to&apos;lov hujjati rekviziti (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Masalan: Bank o'tkazmasi, kassa orderi #4102"
              className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-sans focus:outline-none focus:border-blue-400"
            />
          </div>

          {selectedInvestor && parsedAmount > 0 && (
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 font-mono text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Yangi New Capital jami:</span>
                <span className="font-bold text-blue-400">
                  ${(selectedInvestor.newCapital + parsedAmount).toLocaleString()} USD
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Ruxsat etilgan oylik yechish limiti (20%):</span>
                <span className="font-bold text-emerald-400">
                  ${((selectedInvestor.newCapital + parsedAmount) * 0.2).toLocaleString()} USD/oy
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Eski zarar tiklanish foizi:</span>
                <span className="font-bold text-slate-300">{selectedInvestor.recovery}% (o&apos;zgarmaydi)</span>
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
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs shadow-lg transition-colors disabled:opacity-50"
            >
              <Coins className="w-4 h-4" />
              <span>Depozitni Ro&apos;yxatga Olish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
