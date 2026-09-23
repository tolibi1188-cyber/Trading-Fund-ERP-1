/**
 * Immutable Accounting Ledger Journal ("Moliyaviy Ledger")
 * Complete audit trail of every credit, debit, loss correction, injection, and balance shift.
 */

import React, { useState } from 'react';
import { useErp } from '../../../context/ErpContext';
import { LedgerEntryType } from '../../../types/erp';
import { BookOpen, Search, Download, ArrowUpDown, Shield } from 'lucide-react';

export const LedgerView: React.FC = () => {
  const { ledger, investors } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const filtered = ledger.filter((l) => {
    const matchSearch =
      l.entryNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.description.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (typeFilter === 'ALL') return true;
    return l.type === typeFilter;
  });

  const exportCsv = () => {
    const headers = ['Entry Number', 'Timestamp', 'Investor', 'Type', 'Amount (USD)', 'Balance Before', 'Balance After', 'Recovery %', 'Description'];
    const rows = filtered.map((l) => [
      l.entryNumber,
      new Date(l.timestamp).toISOString(),
      `"${l.investorName}"`,
      l.type,
      l.amount,
      l.balanceBefore,
      l.balanceAfter,
      l.recoveryAfter,
      `"${l.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fund_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Search & Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161B22] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Ledger bo'yicha qidiruv (Entry#, Investor, Tavsif)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-[#0D1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none"
          >
            <option value="ALL">Barcha Amallar (All)</option>
            <option value="TRADE_SESSION_DISTRIBUTION">Savdo Sessiyasi (50/50 Session)</option>
            <option value="TRADE_SESSION_CORRECTION">Sessiyani To‘g‘rilash (Correction)</option>
            <option value="TRADE_SESSION_REVERSAL">Sessiyani Bekor Qilish (Rollback)</option>
            <option value="TRADE_PROFIT_CREDIT">Savdo Foydasi (Trade Profit)</option>
            <option value="NEW_CAPITAL_DEPOSIT">Yangi Kapital (New Capital)</option>
            <option value="MANUAL_INJECTION">Qo‘lda Inyeksiya (Injection)</option>
            <option value="WITHDRAWAL_PAYOUT">Pul Yechish (Withdrawal)</option>
            <option value="LOSS_CORRECTION_ADJUSTMENT">Zararni To‘g‘rilash (Loss Correction)</option>
            <option value="INLINE_BALANCE_CORRECTION">Inline To‘g‘rilash (Inline Edit)</option>
          </select>

          <button
            onClick={exportCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV Yuklab Olish</span>
          </button>
        </div>
      </div>

      {/* 1C Dense Ledger Table */}
      <div className="rounded-2xl border border-white/10 bg-[#161B22] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-[#0D1117] border-b border-white/10 text-slate-400 font-mono text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-4">Yozuv #</th>
                <th className="py-3 px-4">Vaqt (Timestamp)</th>
                <th className="py-3 px-4">Investor</th>
                <th className="py-3 px-4">Turi</th>
                <th className="py-3 px-4 text-right">Summa (USD)</th>
                <th className="py-3 px-4 text-right">Oldingi Balans</th>
                <th className="py-3 px-4 text-right">Yangi Balans</th>
                <th className="py-3 px-4 text-center">Tiklanish %</th>
                <th className="py-3 px-4">Izoh / Tranzaksiya Tafsiloti</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 font-mono text-xs">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-bold text-slate-200">{l.entryNumber}</td>

                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(l.timestamp).toLocaleString('uz-UZ', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4 font-sans font-semibold text-slate-100">
                    {l.investorName}
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        l.type === 'TRADE_SESSION_DISTRIBUTION'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : l.type === 'TRADE_SESSION_CORRECTION'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : l.type === 'TRADE_SESSION_REVERSAL'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : l.type.includes('PROFIT') || l.type.includes('RECOVERY')
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : l.type.includes('WITHDRAWAL')
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : l.type.includes('CAPITAL')
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : l.type.includes('LOSS')
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}
                    >
                      {l.type}
                    </span>
                  </td>

                  <td
                    className={`py-3 px-4 text-right font-bold ${
                      l.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {l.amount >= 0 ? '+' : ''}${Math.abs(l.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-right text-slate-400">
                    ${l.balanceBefore.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-white">
                    ${l.balanceAfter.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-center text-slate-300">
                    {l.recoveryAfter}%
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-300 max-w-xs truncate" title={l.description}>
                    {l.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
