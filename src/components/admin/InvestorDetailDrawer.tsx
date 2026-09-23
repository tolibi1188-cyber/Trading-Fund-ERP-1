/**
 * Investor Detail Drawer (Right Slide-over Panel)
 * Comprehensive 360-degree financial profile, ledger audit, and sub-balances.
 * Enhanced with Neumorphic Dark FinTech styling and crisp typography.
 */

import React, { useState } from 'react';
import { Investor } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import {
  X,
  User,
  Shield,
  CreditCard,
  History,
  TrendingUp,
  DollarSign,
  Coins,
  Edit2,
  Check,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronRight,
  FileCheck,
} from 'lucide-react';

interface InvestorDetailDrawerProps {
  investor: Investor;
  onClose: () => void;
}

export const InvestorDetailDrawer: React.FC<InvestorDetailDrawerProps> = ({ investor, onClose }) => {
  const { ledger, withdrawals, openModal, inlineUpdateBalance, setSelectedReceiptForModal, receipts } = useErp();

  const [isEditingBalance, setIsEditingBalance] = useState(false);
  const [balanceInput, setBalanceInput] = useState(investor.balance.toString());
  const [inlineReason, setInlineReason] = useState('Admin panel orqali balans to‘g‘rilash');

  const investorLedger = ledger.filter((l) => l.investorId === investor.id);
  const investorWithdrawals = withdrawals.filter((w) => w.investorId === investor.id);

  const handleSaveBalance = () => {
    const val = parseFloat(balanceInput);
    if (!isNaN(val) && val >= 0) {
      inlineUpdateBalance(investor.id, val, inlineReason);
      setIsEditingBalance(false);
    }
  };

  const isOld = investor.type === 'OLD';
  const recoveringBalance = Math.max(0, investor.balance - investor.newCapital);

  return (
    <div
      id="investor-drawer-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 flex justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="investor-drawer-panel"
        className="w-full max-w-2xl h-full bg-[#0d121b] border-l border-white/[0.08] shadow-2xl flex flex-col overflow-hidden text-slate-100 animate-in slide-in-from-right duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="p-6 bg-[#090d14] border-b border-white/[0.08] flex items-start justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl neu-inset border-l-2 border-emerald-500/80 flex items-center justify-center font-bold text-lg text-emerald-400 font-mono">
              {investor.code.replace('INV-', '#')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-white tracking-tight">{investor.fullName}</h2>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    isOld
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                  }`}
                >
                  {investor.type} INVESTOR
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full neu-inset text-slate-400">
                  {investor.status}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono mt-1 flex items-center space-x-2.5">
                <span>ID: {investor.passportId}</span>
                <span className="text-slate-600">•</span>
                <span>{investor.phone}</span>
                <span className="text-slate-600">•</span>
                <span>{investor.email}</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl neu-btn text-slate-400 hover:text-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Actions Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => openModal('trade-profit', { investorId: investor.id })}
              className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl neu-btn text-emerald-400 text-xs font-bold active:scale-95 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Daromad qo‘shish</span>
            </button>

            {isOld && (
              <>
                <button
                  onClick={() => openModal('new-capital', { investorId: investor.id })}
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl neu-btn text-blue-400 text-xs font-bold active:scale-95 transition-all"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span>+ New Capital</span>
                </button>

                <button
                  onClick={() => openModal('manual-injection', { investorId: investor.id })}
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl neu-btn text-purple-400 text-xs font-bold active:scale-95 transition-all"
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Inyeksiya</span>
                </button>

                <button
                  onClick={() => openModal('edit-loss', { investorId: investor.id })}
                  className="flex items-center justify-center space-x-1.5 p-2.5 rounded-xl neu-btn text-amber-300 text-xs font-bold active:scale-95 transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Zarar tahriri</span>
                </button>
              </>
            )}
          </div>

          {/* Sub-balances breakdown (§4) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Total Balance */}
            <div className="p-4 rounded-2xl neu-card relative">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                JAMI BALANS (TOTAL AUM)
              </span>
              {!isEditingBalance ? (
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black font-mono text-white tracking-tight tabular-nums drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
                    ${investor.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    onClick={() => {
                      setBalanceInput(investor.balance.toString());
                      setIsEditingBalance(true);
                    }}
                    title="Inline Edit Balance"
                    className="p-1 rounded-lg text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-2 mt-1">
                  <input
                    type="number"
                    value={balanceInput}
                    onChange={(e) => setBalanceInput(e.target.value)}
                    className="w-full neu-inset rounded-lg px-2.5 py-1 text-sm font-mono text-white focus:outline-none ring-1 ring-emerald-400"
                  />
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={handleSaveBalance}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs flex items-center space-x-1"
                    >
                      <Check className="w-3 h-3" />
                      <span>Saqlash</span>
                    </button>
                    <button
                      onClick={() => setIsEditingBalance(false)}
                      className="px-2.5 py-1 rounded-lg neu-btn text-slate-300 text-xs"
                    >
                      Bekor
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Recovering vs New Capital */}
            {isOld ? (
              <>
                <div className="p-4 rounded-2xl neu-card border-l-2 border-amber-500/50">
                  <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block mb-1">
                    TIKLANAYOTGAN QISM (LOCKED)
                  </span>
                  <span className="text-xl font-black font-mono text-amber-200 tracking-tight tabular-nums">
                    ${recoveringBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    Tiklanish: <span className="font-bold text-white font-mono">{investor.recovery.toFixed(0)}%</span> (100% gacha yechish cheklangan)
                  </div>
                </div>

                <div className="p-4 rounded-2xl neu-card border-l-2 border-blue-500/50">
                  <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider block mb-1">
                    NEW CAPITAL (ERKIN QISM)
                  </span>
                  <span className="text-xl font-black font-mono text-blue-300 tracking-tight tabular-nums">
                    ${investor.newCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1 font-sans">
                    50/50 taqsimot, har oy 20% gacha erkin yechish
                  </div>
                </div>
              </>
            ) : (
              <div className="col-span-2 p-4 rounded-2xl neu-card border-l-2 border-emerald-500/60">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block mb-1">
                  NEW INVESTOR PORTFELI
                </span>
                <span className="text-xl font-black font-mono text-emerald-300 tracking-tight tabular-nums">
                  ${investor.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">
                  100% yangi erkin kapital, barcha savdolardan doimiy 50/50 foyda
                </div>
              </div>
            )}
          </div>

          {/* Recovery Progress Ring & Loss Details (for OLD investors) */}
          {isOld && (
            <div className="p-5 rounded-2xl neu-card space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white">Boshlang‘ich Zararni Qoplash Ko‘rsatkichi</h4>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Boshlang&apos;ich zarar: <span className="font-mono font-bold text-slate-200">${investor.initialLoss.toLocaleString()} USD</span>
                  </p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-2xl font-black text-emerald-400 tabular-nums">
                    {investor.recovery.toFixed(1)}%
                  </span>
                  <span className="text-[11px] text-slate-400 block font-sans">Tiklandi</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[#080c13] h-3 rounded-full overflow-hidden p-0.5 neu-inset">
                <div
                  className="bg-gradient-to-r from-amber-500 via-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(2, investor.recovery))}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-1">
                <span>Tiklandi: <strong className="text-slate-200">${investor.recoveredAmount.toLocaleString()}</strong></span>
                <span>Qolgan zarar: <strong className="text-rose-300">${(Math.max(0, investor.initialLoss - investor.recoveredAmount)).toLocaleString()}</strong></span>
              </div>
            </div>
          )}

          {/* Payment Endpoint Details */}
          <div className="p-4 rounded-2xl neu-card space-y-2">
            <div className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-400" />
              <span>To‘lov Rekvizitlari (Payment Endpoint)</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs font-sans pt-1">
              <div className="p-2.5 rounded-xl neu-inset">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">To‘lov Metodi</span>
                <span className="font-bold text-white font-mono">{investor.paymentEndpoint.method}</span>
              </div>
              <div className="p-2.5 rounded-xl neu-inset">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Maskalangan Rekvizit</span>
                <span className="font-mono text-emerald-400 font-bold">{investor.paymentEndpoint.maskedDetail}</span>
              </div>
              <div className="col-span-2 p-2.5 rounded-xl neu-inset">
                <span className="text-[10px] text-slate-500 uppercase block font-semibold">Qayd / Bank nomi</span>
                <span className="text-slate-300 font-sans">{investor.paymentEndpoint.notes || 'Asosiy karta / Hamyon'}</span>
              </div>
            </div>
          </div>

          {/* Withdrawal History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Pul Yechish Tarixi ({investorWithdrawals.length})</span>
              </h4>
            </div>

            {investorWithdrawals.length === 0 ? (
              <div className="text-xs text-slate-500 py-4 text-center neu-inset rounded-xl font-sans">
                Pul yechish so‘rovlari mavjud emas.
              </div>
            ) : (
              <div className="space-y-2 font-mono text-xs">
                {investorWithdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="p-3.5 rounded-xl neu-card flex items-center justify-between hover:border-emerald-500/30 transition-all"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{w.requestNumber}</span>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-sans font-bold border ${
                            w.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : w.status === 'SENT'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              : w.status === 'PROOF_SUBMITTED'
                              ? 'bg-blue-500/10 text-blue-300 border-blue-500/20'
                              : 'bg-slate-500/10 text-slate-300 border-slate-500/20'
                          }`}
                        >
                          {w.status}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        ${w.amount.toLocaleString()} ({w.method}) • {new Date(w.requestedAt).toLocaleDateString()}
                      </div>
                    </div>

                    {w.receiptId && (
                      <button
                        onClick={() => {
                          const r = receipts.find((rec) => rec.id === w.receiptId);
                          if (r) setSelectedReceiptForModal(r);
                        }}
                        className="px-3 py-1.5 rounded-xl neu-btn text-emerald-400 text-xs font-semibold flex items-center space-x-1 active:scale-95 transition-all"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>Chek</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Ledger History (Immutable accounting records) */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-slate-400 uppercase font-semibold flex items-center space-x-1.5">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <span>Moliyaviy Ledger Yozuvlari ({investorLedger.length})</span>
            </h4>

            <div className="space-y-2 font-mono text-xs">
              {investorLedger.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-xl neu-card space-y-2"
                >
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="font-bold text-emerald-400 font-mono">{entry.entryNumber}</span>
                    <span className="text-slate-500">
                      {new Date(entry.timestamp).toLocaleString('uz-UZ', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-200 font-sans">{entry.type}</span>
                    <span
                      className={`font-black tabular-nums text-sm ${
                        entry.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {entry.amount >= 0 ? '+' : ''}${Math.abs(entry.amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    {entry.description}
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 pt-1.5 border-t border-white/[0.06] font-mono">
                    <span>Balans: ${entry.balanceBefore.toLocaleString()} → ${entry.balanceAfter.toLocaleString()}</span>
                    <span>Tiklanish: {entry.recoveryAfter}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
