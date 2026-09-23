/**
 * Official Receipts Archive ("Rasmiy Kvitansiyalar - Chek")
 * Search, filter, inspect digital signature, and launch official Chek modal for print/PDF.
 */

import React, { useState } from 'react';
import { useErp } from '../../../context/ErpContext';
import { OfficialReceipt } from '../../../types/erp';
import {
  FileCheck,
  Search,
  Printer,
  ShieldCheck,
  QrCode,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

export const ReceiptsView: React.FC = () => {
  const { receipts, setSelectedReceiptForModal } = useErp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const filtered = receipts.filter((r) => {
    const matchSearch =
      r.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.investorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.verificationCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.passportId.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchSearch) return false;
    if (filterStatus === 'ALL') return true;
    return r.status === filterStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#161B22] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Qidiruv: Chek raqami (CHK-####), Ism yoki Tekshiruv kodi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        {/* Status filters */}
        <div className="flex items-center space-x-1.5 text-xs">
          {['ALL', 'CONFIRMED', 'PROOF_SUBMITTED', 'ISSUED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'Barchasi'
                : st === 'CONFIRMED'
                ? 'Tasdiqlangan'
                : st === 'PROOF_SUBMITTED'
                ? 'Dalil Yuklangan'
                : 'Yuborilgan (Kutilmoqda)'}
            </button>
          ))}
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((receipt) => {
          const isConfirmed = receipt.status === 'CONFIRMED';
          const isProofSubmitted = receipt.status === 'PROOF_SUBMITTED';

          return (
            <div
              key={receipt.id}
              onClick={() => setSelectedReceiptForModal(receipt)}
              className="p-5 rounded-2xl bg-[#161B22] border border-white/10 hover:border-emerald-500/30 cursor-pointer transition-all space-y-4 group glass-card relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Rasmiy Kvitansiya</span>
                  </div>
                  <h3 className="text-lg font-bold font-mono text-white mt-0.5 group-hover:text-emerald-300 transition-colors">
                    {receipt.receiptNumber}
                  </h3>
                </div>

                <span
                  className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isConfirmed
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      : isProofSubmitted
                      ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                      : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                  }`}
                >
                  {isConfirmed ? 'TASDIQLANGAN' : isProofSubmitted ? 'DALIL YUKLANDI' : 'YUBORILDI'}
                </span>
              </div>

              {/* Amount & Investor */}
              <div className="p-3 rounded-xl bg-[#0D1117] border border-white/5 space-y-1">
                <div className="text-slate-400 text-xs font-sans">Investor:</div>
                <div className="font-bold text-white text-sm font-sans">{receipt.investorName}</div>
                <div className="text-xl font-bold font-mono text-white pt-1">
                  ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-500 font-mono ml-1.5">USD</span>
                </div>
              </div>

              {/* Security info */}
              <div className="space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>To&apos;lov usuli:</span>
                  <span className="text-slate-200 font-bold uppercase">{receipt.method}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tekshiruv kodi:</span>
                  <span className="text-emerald-400 font-bold">{receipt.verificationCode}</span>
                </div>
                <div className="flex justify-between">
                  <span>Sana:</span>
                  <span className="text-slate-300">
                    {new Date(receipt.issuedAt).toLocaleDateString('uz-UZ')}
                  </span>
                </div>
              </div>

              {/* Open Action bar */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 group-hover:text-emerald-300">
                <span className="flex items-center space-x-1 font-sans">
                  <Printer className="w-3.5 h-3.5" />
                  <span>Kvitansiyani ko&apos;rish va chop etish</span>
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
