/**
 * Financial Reports & AUM Breakdown View
 * High-precision financial statements, recovery performance, and exportable reports.
 */

import React from 'react';
import { useErp } from '../../../context/ErpContext';
import { BarChart3, Printer, Download, TrendingUp, ShieldCheck, PieChart } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { investors, ledger, withdrawals } = useErp();

  const totalAum = investors.reduce((sum, i) => sum + i.balance, 0);
  const totalInitialLoss = investors.reduce((sum, i) => sum + i.initialLoss, 0);
  const totalRecovered = investors.reduce((sum, i) => sum + i.recoveredAmount, 0);
  const remainingLoss = Math.max(0, totalInitialLoss - totalRecovered);
  const totalNewCapital = investors.reduce((sum, i) => sum + i.newCapital, 0);

  const totalWithdrawn = withdrawals
    .filter((w) => w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header toolbar */}
      <div className="flex items-center justify-between bg-[#161B22] p-4 rounded-2xl border border-white/10 no-print">
        <div>
          <h3 className="font-bold text-white text-base">Fondning Konsolidatsiyalangan Hisoboti</h3>
          <p className="text-xs text-slate-400">
            {new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })} holatiga ko‘ra
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Hisobotni Chop Etish (PDF)</span>
        </button>
      </div>

      {/* High-level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 block">JAMI BOSHQARUVDAGI MABLAG‘ (AUM)</span>
          <div className="text-2xl font-black text-white">
            ${totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-emerald-400 font-sans">
            Faol investitsiyalar balansi
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 block">TIKLANGAN ZARARLAR JAMI</span>
          <div className="text-2xl font-black text-emerald-400">
            ${totalRecovered.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Boshlang‘ich zararning {((totalRecovered / totalInitialLoss) * 100).toFixed(1)}% qismi
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 block">QOLGAN ZARAR (RECOVERY GAP)</span>
          <div className="text-2xl font-black text-amber-300">
            ${remainingLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            100% tiklashga yo‘naltiriladigan summa
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-2">
          <span className="text-xs text-slate-400 block">YANGI KAPITAL (§4 NEW CAPITAL)</span>
          <div className="text-2xl font-black text-blue-300">
            ${totalNewCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-blue-400 font-sans">
            50/50 taqsimotdagi erkin summa
          </div>
        </div>
      </div>

      {/* Consolidated Investor Breakdown Table */}
      <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-4">
        <h4 className="font-bold text-white text-sm">Investorlar Bo‘yicha Taqsimot Reestri</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0D1117] border-b border-white/10 text-slate-400 text-[11px] uppercase">
                <th className="py-3 px-4">Investor</th>
                <th className="py-3 px-4">Toifa</th>
                <th className="py-3 px-4 text-right">Zarar ($)</th>
                <th className="py-3 px-4 text-right">Tiklandi ($)</th>
                <th className="py-3 px-4 text-center">Tiklanish %</th>
                <th className="py-3 px-4 text-right">New Capital</th>
                <th className="py-3 px-4 text-right">Jami Balans ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {investors.map((inv) => (
                <tr key={inv.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 font-bold text-slate-200 font-sans">
                    {inv.fullName} ({inv.code})
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        inv.type === 'OLD' ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {inv.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-400">
                    ${inv.initialLoss.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">
                    ${inv.recoveredAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-400">
                    {inv.recovery.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-right text-blue-300 font-bold">
                    ${inv.newCapital.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right text-white font-black text-sm">
                    ${inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-[#0D1117] border-t-2 border-white/20 font-bold text-slate-100">
              <tr>
                <td className="py-3 px-4" colSpan={2}>
                  JAMI / TOTAL
                </td>
                <td className="py-3 px-4 text-right text-amber-300">${totalInitialLoss.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-slate-300">${totalRecovered.toLocaleString()}</td>
                <td className="py-3 px-4 text-center text-emerald-400">
                  {((totalRecovered / totalInitialLoss) * 100).toFixed(1)}%
                </td>
                <td className="py-3 px-4 text-right text-blue-300">${totalNewCapital.toLocaleString()}</td>
                <td className="py-3 px-4 text-right text-white text-base">
                  ${totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
