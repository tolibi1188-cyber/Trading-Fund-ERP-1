/**
 * Withdrawals Queue View & 24h SLA Countdown Engine
 * Full lifecycle: Request -> Pending (SLA) -> Sent (Locks App) -> Proof Submitted -> Completed.
 */

import React, { useState, useEffect } from 'react';
import { WithdrawalRequest, WithdrawalStatus } from '../../../types/erp';
import { useErp } from '../../../context/ErpContext';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Send,
  Eye,
  ShieldCheck,
  Filter,
  DollarSign,
  XCircle,
  Check,
  Video,
  Image as ImageIcon,
} from 'lucide-react';

export const WithdrawalsView: React.FC = () => {
  const {
    withdrawals,
    markWithdrawalSent,
    finalizeWithdrawal,
    rejectWithdrawal,
    receipts,
    setSelectedReceiptForModal,
  } = useErp();

  const [activeFilter, setActiveFilter] = useState<'ALL' | WithdrawalStatus>('ALL');
  const [now, setNow] = useState(Date.now());
  const [inspectingProofItem, setInspectingProofItem] = useState<WithdrawalRequest | null>(null);

  // Live timer tick every second for real-time SLA countdown
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const filtered = withdrawals.filter((w) => {
    if (activeFilter === 'ALL') return true;
    return w.status === activeFilter;
  });

  // Aggregate stats
  const pendingCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const sentCount = withdrawals.filter((w) => w.status === 'SENT').length;
  const proofCount = withdrawals.filter((w) => w.status === 'PROOF_SUBMITTED').length;
  const completedTotal = withdrawals
    .filter((w) => w.status === 'COMPLETED')
    .reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* 4 Stats Cards (Neumorphic) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl neu-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-semibold text-slate-400">24H SLA KUTILMOQDA</span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {pendingCount} ta so&apos;rov
          </div>
          <div className="text-[11px] text-slate-400 mt-1">24 soatlik muddat hisoblanmoqda</div>
        </div>

        <div className="p-4 rounded-2xl neu-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-semibold text-slate-400">YUBORILDI (ILOVA BLOKLANDI)</span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
              <Send className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-blue-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {sentCount} ta investor
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Investor dalil yuklashi shart</div>
        </div>

        <div className="p-4 rounded-2xl neu-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-semibold text-slate-400">TASDIQLASHGA TAYYOR</span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-300 drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            {proofCount} ta dalil
          </div>
          <div className="text-[11px] text-emerald-400 mt-1">Video va kvitansiya tekshiruvda</div>
        </div>

        <div className="p-4 rounded-2xl neu-card">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span className="font-semibold text-slate-400">JAMI TO&apos;LANGAN</span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold font-mono text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            ${completedTotal.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Rasmiy chek bilan tasdiqlangan</div>
        </div>
      </div>

      {/* Filter Tabs (Neumorphic) */}
      <div className="flex items-center space-x-1.5 p-1.5 rounded-xl neu-sunken-well text-xs overflow-x-auto">
        {(
          [
            { id: 'ALL', label: 'Barchasi' },
            { id: 'PENDING', label: `Kutilmoqda (${pendingCount})` },
            { id: 'SENT', label: `Yuborildi (${sentCount})` },
            { id: 'PROOF_SUBMITTED', label: `Dalil Yuklandi (${proofCount})` },
            { id: 'COMPLETED', label: 'Yakunlangan' },
            { id: 'REJECTED', label: 'Rad Etilgan' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-all active:scale-95 ${
              activeFilter === tab.id
                ? 'neu-segment-active text-emerald-300 font-bold shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Desktop Column Header: Ensures columns are explicitly aligned from top to bottom */}
      <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2.5 text-[11px] font-mono font-semibold text-slate-400 uppercase tracking-wider neu-inset rounded-xl">
        <div className="col-span-4 flex items-center space-x-2">
          <span>So&apos;rov & Investor</span>
        </div>
        <div className="col-span-3 text-right pr-2">
          <span>Summa (USD)</span>
        </div>
        <div className="col-span-3 pl-2">
          <span>24h SLA / Holat</span>
        </div>
        <div className="col-span-2 text-right">
          <span>Amallar</span>
        </div>
      </div>

      {/* Withdrawals List / Queue Table */}
      <div className="space-y-3 font-sans">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-500 rounded-2xl neu-card">
            Ushbu toifada so&apos;rovlar mavjud emas.
          </div>
        ) : (
          filtered.map((w) => {
            const receipt = receipts.find((r) => r.id === w.receiptId);
            const deadlineMs = new Date(w.slaDeadline).getTime();
            const diffMs = deadlineMs - now;
            const isExpired = diffMs <= 0;
            const hours = Math.max(0, Math.floor(Math.abs(diffMs) / (1000 * 60 * 60)));
            const minutes = Math.max(0, Math.floor((Math.abs(diffMs) % (1000 * 60 * 60)) / (1000 * 60)));
            const seconds = Math.max(0, Math.floor((Math.abs(diffMs) % (1000 * 60)) / 1000));

            return (
              <div
                key={w.id}
                className="p-5 rounded-2xl neu-card neu-card-hover transition-all grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
              >
                {/* Col 1 (span 4): Investor & Request Details */}
                <div className="lg:col-span-4 space-y-1.5 min-w-0">
                  <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                    <span className="font-mono font-bold text-emerald-400 text-xs px-2 py-0.5 rounded-md neu-inset shrink-0">
                      {w.requestNumber}
                    </span>
                    <span className="font-bold text-white text-base truncate">
                      {w.investorName}
                    </span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        w.status === 'PENDING'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : w.status === 'SENT'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : w.status === 'PROOF_SUBMITTED'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : w.status === 'COMPLETED'
                          ? 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                          : 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                      }`}
                    >
                      {w.status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 font-mono flex items-center space-x-2 truncate">
                    <span className="text-slate-300">{w.method}</span>
                    <span>•</span>
                    <span className="truncate">{w.destinationDetails}</span>
                    <span>•</span>
                    <span className="shrink-0">{new Date(w.requestedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Col 2 (span 3): DEDICATED SUMMA COLUMN (Bir tekis tepadan pastga joylashgan) */}
                <div className="lg:col-span-3">
                  <div className="neu-inset p-3 rounded-xl flex flex-col justify-center text-left lg:text-right border-l-2 border-emerald-500/50">
                    <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider block font-medium">
                      Summa (USD)
                    </span>
                    <span className="text-xl lg:text-2xl font-black text-white font-mono tabular-nums tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                      ${w.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Col 3 (span 3): Live SLA Countdown or Status details */}
                <div className="lg:col-span-3">
                  <div className="neu-inset p-3 rounded-xl flex flex-col justify-center min-h-[60px] font-mono text-xs">
                    {w.status === 'PENDING' && (
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">
                          24h SLA Countdown
                        </span>
                        <div
                          className={`font-bold flex items-center space-x-1.5 mt-0.5 ${
                            isExpired ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping inline-block shadow-[0_0_6px_currentColor]" />
                          <span className="tabular-nums">
                            {isExpired ? 'MUDDAT O‘TGAN (-' : ''}
                            {hours}h {minutes}m {seconds}s{isExpired ? ')' : ''}
                          </span>
                        </div>
                      </div>
                    )}

                    {w.status === 'SENT' && (
                      <div>
                        <span className="text-[10px] text-blue-400 block uppercase font-semibold">Holat</span>
                        <span className="text-slate-300 font-sans text-xs">
                          Mablag&apos; yuborilgan. Ilova bloklangan.
                        </span>
                      </div>
                    )}

                    {w.status === 'PROOF_SUBMITTED' && (
                      <div>
                        <span className="text-[10px] text-emerald-400 block uppercase font-semibold">Dalil</span>
                        <span className="text-emerald-300 font-sans font-bold text-xs flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Video & Skrinshot Yuklandi</span>
                        </span>
                      </div>
                    )}

                    {w.status === 'COMPLETED' && (
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">
                          Yakunlangan
                        </span>
                        <span className="text-slate-300 font-sans text-xs">
                          {w.completedAt ? new Date(w.completedAt).toLocaleDateString() : 'Bajarildi'}
                        </span>
                      </div>
                    )}

                    {w.status === 'REJECTED' && (
                      <div>
                        <span className="text-[10px] text-rose-400 block uppercase font-semibold">Rad etilgan</span>
                        <span className="text-rose-300 font-sans text-xs">
                          {w.rejectionReason || 'Talabga javob bermadi'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Col 4 (span 2): Action Buttons */}
                <div className="lg:col-span-2 flex items-center justify-start lg:justify-end space-x-2 shrink-0 flex-wrap gap-y-2">
                  {/* PENDING ACTIONS */}
                  {w.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => markWithdrawalSent(w.id)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs active:scale-95 transition-all shadow-md"
                        title="Mablag' yuborilganini tasdiqlash va kvitansiya generatsiya qilish"
                      >
                        <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Yuborildi</span>
                      </button>

                      <button
                        onClick={() => {
                          const reason = window.prompt("Rad etish sababi:");
                          if (reason) rejectWithdrawal(w.id, reason);
                        }}
                        className="p-2 rounded-xl neu-btn text-rose-400 active:scale-95 transition-all"
                        title="Rad etish"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </>
                  )}

                  {/* PROOF_SUBMITTED ACTIONS */}
                  {w.status === 'PROOF_SUBMITTED' && (
                    <>
                      <button
                        onClick={() => setInspectingProofItem(w)}
                        className="flex items-center space-x-1.5 px-2.5 py-2 rounded-xl neu-btn text-blue-300 font-semibold text-xs active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dalil</span>
                      </button>

                      <button
                        onClick={() => finalizeWithdrawal(w.id)}
                        className="flex items-center space-x-1.5 px-3 py-2 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs active:scale-95 transition-all"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Tasdiq</span>
                      </button>
                    </>
                  )}

                  {/* VIEW OFFICIAL CHEK */}
                  {receipt && (
                    <button
                      onClick={() => setSelectedReceiptForModal(receipt)}
                      className="flex items-center space-x-1.5 px-3 py-2 rounded-xl neu-btn text-slate-300 hover:text-white font-mono text-xs active:scale-95 transition-all"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{receipt.receiptNumber}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Proof Inspection Dialog */}
      {inspectingProofItem && inspectingProofItem.proofArtifacts && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setInspectingProofItem(null)}
        >
          <div
            className="w-full max-w-lg bg-[#161B22] border border-white/15 rounded-2xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-bold text-white text-base flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Investor Yuklagan Dalil Hujjatlari</span>
              </h3>
              <button
                onClick={() => setInspectingProofItem(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-sans text-xs">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                <span className="text-slate-400">Investor:</span>
                <div className="font-bold text-white">{inspectingProofItem.investorName}</div>
                <div className="text-slate-400 font-mono">
                  Summa: ${inspectingProofItem.amount.toLocaleString()} USD
                </div>
              </div>

              {/* Video Proof Card */}
              {inspectingProofItem.proofArtifacts.videoConfirmationUrl && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-300">
                    <Video className="w-4 h-4" />
                    <span>Tasdiqlovchi Video Fayl</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">
                    {inspectingProofItem.proofArtifacts.videoConfirmationUrl} (Yuklangan)
                  </span>
                </div>
              )}

              {/* Screenshot Proof Card */}
              {inspectingProofItem.proofArtifacts.receiptScreenshotUrl && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-blue-300">
                    <ImageIcon className="w-4 h-4" />
                    <span>Bank / Karta Skrinshoti</span>
                  </div>
                  <span className="text-[11px] font-mono text-blue-400 font-bold">
                    {inspectingProofItem.proofArtifacts.receiptScreenshotUrl} (Tekshirilgan)
                  </span>
                </div>
              )}

              <div className="text-slate-400 text-[11px] italic">
                Yuklangan vaqt: {new Date(inspectingProofItem.proofArtifacts.submittedAt).toLocaleString()}
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 flex justify-end space-x-2">
              <button
                onClick={() => setInspectingProofItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:text-white"
              >
                Yopish
              </button>
              <button
                onClick={() => {
                  finalizeWithdrawal(inspectingProofItem.id);
                  setInspectingProofItem(null);
                }}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
              >
                Tasdiqlash va Yakunlash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
