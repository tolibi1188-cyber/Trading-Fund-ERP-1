/**
 * Investor Mobile App Ecosystem (Ultra-modern 2026 Fintech Mobile)
 * Rendered inside a realistic phone mockup with status bar, dynamic island, and tab navigation.
 * Includes the mandatory lock-screen proof-of-receipt flow (§5 & §6).
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { Investor, WithdrawalRequest, PaymentMethod } from '../../types/erp';
import {
  Smartphone,
  Wifi,
  Battery,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  ArrowDownLeft,
  Clock,
  FileCheck,
  User,
  History,
  AlertCircle,
  Video,
  Image as ImageIcon,
  CheckCircle2,
  ChevronRight,
  Send,
  Lock,
  ExternalLink,
  X,
  CreditCard,
  Sparkles,
  Coins,
} from 'lucide-react';

interface InvestorMobileAppProps {
  onBackToDesktop?: () => void;
}

export const InvestorMobileApp: React.FC<InvestorMobileAppProps> = ({ onBackToDesktop }) => {
  const {
    investors,
    activeMobileInvestorId,
    setActiveMobileInvestorId,
    withdrawals,
    receipts,
    ledger,
    submitWithdrawalProof,
    requestWithdrawal,
    setSelectedReceiptForModal,
    addToast,
  } = useErp();

  // Active investor
  const currentInvestor =
    investors.find((i) => i.id === activeMobileInvestorId) || investors[0];

  const [activeTab, setActiveTab] = useState<'home' | 'withdrawals' | 'history' | 'profile'>('home');
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const [withdrawSource, setWithdrawSource] = useState<'NEW_BALANCE' | 'OLD_BALANCE'>('NEW_BALANCE');
  const [withdrawAmount, setWithdrawAmount] = useState('2000');
  const [withdrawMethod, setWithdrawMethod] = useState<PaymentMethod>(
    currentInvestor?.paymentEndpoint.method || 'VISA'
  );

  // Mandatory Lock-screen Proof Form State
  const activeSentWithdrawal = withdrawals.find(
    (w) => w.investorId === currentInvestor?.id && w.status === 'SENT'
  );

  const [proofVideo, setProofVideo] = useState('video_confirmation_rec_491.mp4');
  const [proofScreenshot, setProofScreenshot] = useState('bank_app_receipt_491.jpg');
  const [proofConfirmedCheck, setProofConfirmedCheck] = useState(false);
  const [isSubmittingProof, setIsSubmittingProof] = useState(false);

  // Handle proof submission
  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSentWithdrawal || !proofConfirmedCheck) return;
    setIsSubmittingProof(true);

    setTimeout(() => {
      submitWithdrawalProof(activeSentWithdrawal.id, proofVideo, proofScreenshot);
      setIsSubmittingProof(false);
      addToast('success', 'Mablag‘ qabul qilinganligi tasdiqlandi. Rahmat!', 'Tasdiq Yuborildi');
    }, 600);
  };

  const isOld = currentInvestor?.type === 'OLD';
  const investorLedger = ledger.filter((l) => l.investorId === currentInvestor?.id);
  const investorWithdrawals = withdrawals.filter((w) => w.investorId === currentInvestor?.id);

  // Explicit separation of Old Balance and New Balance
  const oldBalance = isOld
    ? Math.max(0, Number((currentInvestor.balance - (currentInvestor.newCapital || 0)).toFixed(2)))
    : 0;

  const newBalance = isOld
    ? Number((currentInvestor.newCapital || 0).toFixed(2))
    : currentInvestor.balance;

  const oldPercent = currentInvestor.balance > 0
    ? ((oldBalance / currentInvestor.balance) * 100).toFixed(0)
    : '0';

  const newPercent = currentInvestor.balance > 0
    ? ((newBalance / currentInvestor.balance) * 100).toFixed(0)
    : '0';

  // Max withdrawable amount calculation (§4: 20% limit for New Capital if recovery < 100%)
  const maxMonthlyWithdrawable = isOld && currentInvestor.recovery < 100
    ? Number((currentInvestor.newCapital * 0.2).toFixed(2))
    : currentInvestor.balance;

  // Handle Withdrawal Request Submission
  const handleRequestWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(withdrawAmount);
    if (!currentInvestor || isNaN(amount) || amount <= 0) return;

    if (withdrawSource === 'OLD_BALANCE' && isOld && currentInvestor.recovery < 100) {
      addToast('error', 'Eski balans faqat zarar 100% tiklangandan so‘ng yechilishi mumkin (§4).', 'Bloklangan');
      return;
    }

    const availableForSource = withdrawSource === 'OLD_BALANCE'
      ? oldBalance
      : (isOld && currentInvestor.recovery < 100 ? maxMonthlyWithdrawable : newBalance);

    if (amount > availableForSource) {
      addToast('error', `Tanlangan balansda yetarli erkin mablag‘ mavjud emas (Maks: $${availableForSource.toLocaleString()}).`, 'Xatolik');
      return;
    }

    if (amount > currentInvestor.balance) {
      addToast('error', 'Balansda yetarli mablag‘ mavjud emas.', 'Xatolik');
      return;
    }

    requestWithdrawal(
      currentInvestor.id,
      amount,
      withdrawMethod,
      currentInvestor.paymentEndpoint.maskedDetail
    );
    setIsWithdrawModalOpen(false);
    setActiveTab('withdrawals');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-3 sm:p-6 overflow-y-auto bg-[#07090D]">
      {/* Top Switcher Bar (Outside mockup) */}
      <div className="w-full max-w-sm mb-3 flex items-center justify-between no-print">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 font-sans">Investor simulyatori:</span>
          <select
            value={currentInvestor?.id}
            onChange={(e) => setActiveMobileInvestorId(e.target.value)}
            className="bg-[#161B22] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-emerald-400 font-semibold focus:outline-none"
          >
            {investors.map((inv) => (
              <option key={inv.id} value={inv.id}>
                {inv.fullName} ({inv.type}) {withdrawals.some((w) => w.investorId === inv.id && w.status === 'SENT') ? '⚠️ [BLOKLANGAN]' : ''}
              </option>
            ))}
          </select>
        </div>

        {onBackToDesktop && (
          <button
            onClick={onBackToDesktop}
            className="text-xs text-slate-400 hover:text-white px-2 py-1 rounded-lg bg-white/5"
          >
            Desktop ERP
          </button>
        )}
      </div>

      {/* Realistic Mobile Device Frame (iPhone 16 Pro mockup) */}
      <div
        id="mobile-phone-mockup"
        className="w-[380px] h-[780px] bg-[#0D1117] rounded-[52px] border-[10px] border-[#22272E] shadow-[0_0_50px_rgba(0,0,0,0.8)] relative flex flex-col overflow-hidden text-slate-100 select-none"
      >
        {/* Phone Notch / Dynamic Island */}
        <div className="pt-3 px-6 flex items-center justify-between text-[11px] font-mono text-slate-400 z-30 shrink-0">
          <span>09:41</span>
          <div className="w-24 h-5 bg-black rounded-full flex items-center justify-center space-x-1 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <span className="text-[9px] text-slate-400 font-sans">TradingFund</span>
          </div>
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* ============================================================== */}
        {/* MANDATORY PROOF-OF-RECEIPT LOCK SCREEN OVERLAY (§5 & §6)       */}
        {/* Non-dismissible if withdrawal is in SENT state                  */}
        {/* ============================================================== */}
        {activeSentWithdrawal ? (
          <div className="absolute inset-0 bg-[#0D1117]/95 backdrop-blur-xl z-40 p-5 flex flex-col justify-between overflow-y-auto animate-in fade-in duration-200">
            <div className="space-y-4 pt-8">
              {/* Header Warning */}
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 animate-pulse">
                  <Lock className="w-7 h-7" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                  Majburiy Tasdiqlash Kerak
                </div>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  Mablag&apos;ingiz Yuborildi!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-sans px-2">
                  Fond administratori so&apos;ralgan mablag&apos;ni to&apos;liq o&apos;tkazib berdi. Ilovadan foydalanishni
                  davom ettirish uchun to&apos;lovni olganingizni tasdiqlashingiz shart.
                </p>
              </div>

              {/* Amount & Destination Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center font-mono space-y-1">
                <span className="text-[10px] text-slate-400 uppercase">Qabul qilinishi kerak:</span>
                <div className="text-3xl font-extrabold text-emerald-400">
                  ${activeSentWithdrawal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-xs text-slate-400 font-sans">
                  {activeSentWithdrawal.method} • {activeSentWithdrawal.destinationDetails}
                </div>

                {/* Inspect Official Chek link */}
                {activeSentWithdrawal.receiptId && (
                  <div className="pt-2 mt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        const rec = receipts.find((r) => r.id === activeSentWithdrawal.receiptId);
                        if (rec) setSelectedReceiptForModal(rec);
                      }}
                      className="text-xs font-mono text-emerald-400 hover:text-emerald-300 flex items-center justify-center space-x-1 mx-auto"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>Rasmiy Chekni Ko&apos;rish (PDF / QR)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Proof Form */}
              <form onSubmit={handleSubmitProof} className="space-y-3 font-sans text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <Video className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tasdiqlovchi Video Dalil *</span>
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#161B22] border border-white/10 flex items-center justify-between text-slate-300">
                    <span className="font-mono text-[11px] truncate">{proofVideo}</span>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      Yozib olingan
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Bank ilovasiga kirib mablag‘ tushganini ko‘rsatuvchi video
                  </span>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1 flex items-center space-x-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Bank Kvitansiyasi Skrinshoti *</span>
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#161B22] border border-white/10 flex items-center justify-between text-slate-300">
                    <span className="font-mono text-[11px] truncate">{proofScreenshot}</span>
                    <span className="text-[10px] text-blue-400 font-bold bg-blue-500/10 px-2 py-0.5 rounded">
                      Yuklangan
                    </span>
                  </div>
                </div>

                {/* Confirm Checkbox */}
                <label className="flex items-start space-x-2.5 p-3 rounded-xl bg-white/[0.02] border border-white/10 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={proofConfirmedCheck}
                    onChange={(e) => setProofConfirmedCheck(e.target.checked)}
                    className="mt-0.5 accent-emerald-500 rounded"
                  />
                  <span className="text-[11px] text-slate-300 leading-snug">
                    Mablag&apos;ni to&apos;liq hajmda hisobimga qabul qilib olganimni va hech qanday e&apos;tirozim yo&apos;qligini
                    rasman tasdiqlayman.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={!proofConfirmedCheck || isSubmittingProof}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {isSubmittingProof ? 'Yuborilmoqda...' : 'Tasdiqni Yuborish va Ilovani Ochish'}
                  </span>
                </button>
              </form>
            </div>
          </div>
        ) : null}

        {/* Main Scrollable Mobile App Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Top Investor Header */}
          <div className="flex items-center justify-between pt-2">
            <div>
              <div className="text-[11px] font-mono text-slate-400">Xush kelibsiz,</div>
              <h2 className="text-lg font-bold text-white tracking-tight flex items-center space-x-1.5">
                <span>{currentInvestor.fullName}</span>
              </h2>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                  isOld
                    ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                    : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                }`}
              >
                {currentInvestor.type} INVESTOR
              </span>
            </div>
          </div>

          {/* TAB 1: HOME / DASHBOARD */}
          {activeTab === 'home' && (
            <div className="space-y-3.5">
              {/* Grand Total Summary Header */}
              <div className="p-3.5 rounded-2xl bg-[#161B22] border border-white/10 flex items-center justify-between font-mono text-xs shadow-md">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Jami Portfel (Umumiy)</span>
                  <div className="text-xl font-extrabold text-white tracking-tight">
                    ${currentInvestor.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">USD</span>
                  </div>
                </div>

                <div className="text-right text-[10px] font-mono space-y-0.5">
                  <div className="text-slate-400">
                    Eski: <span className="text-amber-300 font-bold">${oldBalance.toLocaleString()}</span> ({oldPercent}%)
                  </div>
                  <div className="text-slate-400">
                    Yangi: <span className="text-emerald-400 font-bold">${newBalance.toLocaleString()}</span> ({newPercent}%)
                  </div>
                </div>
              </div>

              {/* SEPARATE CARD 1: ESKI BALANS (Tiklanayotgan Balans) */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-amber-500/10 to-[#12100d] border border-amber-500/30 shadow-lg space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Clock className="w-3 h-3" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-amber-300 uppercase tracking-wider">
                      Eski Balans
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      isOld
                        ? currentInvestor.recovery >= 100
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {isOld
                      ? currentInvestor.recovery >= 100
                        ? '100% Tiklandi'
                        : `${currentInvestor.recovery.toFixed(1)}% Tiklanmoqda`
                      : '0.00 USD'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono text-2xl font-extrabold text-amber-100 tracking-tight">
                    ${oldBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-amber-400/80 ml-1.5">USD</span>
                  </div>
                  <div className="text-[10px] text-amber-200/70 font-sans">
                    {isOld
                      ? "Oldingi yo'qotishdan tiklanayotgan kapital"
                      : "Yangi investor hisobida eski balans mavjud emas"}
                  </div>
                </div>

                {isOld && (
                  <div className="pt-2 border-t border-amber-500/20 space-y-1.5">
                    <div className="w-full bg-[#0D1117] h-2 rounded-full overflow-hidden border border-amber-500/20">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(3, currentInvestor.recovery))}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-amber-300/80">
                      <span>Boshlang&apos;ich: ${currentInvestor.initialLoss.toLocaleString()}</span>
                      <span>Tiklandi: ${currentInvestor.recoveredAmount.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* SEPARATE CARD 2: YANGI BALANS (New Capital) */}
              <div className="p-4 rounded-3xl bg-gradient-to-b from-emerald-500/10 to-[#0a120e] border border-emerald-500/30 shadow-lg space-y-2.5 relative overflow-hidden">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                    </div>
                    <span className="font-mono text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                      Yangi Balans
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                      newBalance > 0
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-white/5 text-slate-400 border-white/10'
                    }`}
                  >
                    {newBalance > 0 ? 'Erkin Balans' : '0.00 USD'}
                  </span>
                </div>

                <div className="space-y-0.5">
                  <div className="font-mono text-2xl font-extrabold text-emerald-200 tracking-tight">
                    ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    <span className="text-xs font-normal text-emerald-400/80 ml-1.5">USD</span>
                  </div>
                  <div className="text-[10px] text-emerald-200/70 font-sans">
                    {isOld
                      ? newBalance > 0
                        ? "Yangi kiritilgan kapital va yangi savdo sessiyalari foydasi"
                        : "Hali yangi balans kiritilmagan"
                      : "100% yangi kiritilgan mablag' va savdo foydasi"}
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-500/20 flex items-center justify-between text-[10px] font-mono text-emerald-300/80">
                  <span>Savdo daromad ulushi:</span>
                  <span className="font-bold text-emerald-300">
                    {newBalance > 0 ? '✓ To‘liq ishtirok etadi' : '— Yangi balans yo‘q'}
                  </span>
                </div>
              </div>

              {/* Action Buttons: Withdraw */}
              <div className="pt-0.5 flex items-center space-x-2">
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="w-full py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span>Mablag&apos; Yechish</span>
                </button>
              </div>

              {/* Recent Activity Mini-List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 font-sans">So&apos;nggi Amallar</span>
                  <button
                    onClick={() => setActiveTab('history')}
                    className="text-emerald-400 font-mono text-[11px]"
                  >
                    Barchasi
                  </button>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {investorLedger.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-slate-200 font-sans text-xs">{l.type}</div>
                        <div className="text-[10px] text-slate-500 font-sans truncate max-w-[170px]">
                          {l.description}
                        </div>
                      </div>
                      <div
                        className={`font-bold ${
                          l.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {l.amount >= 0 ? '+' : ''}${Math.abs(l.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WITHDRAWALS & RECEIPTS */}
          {activeTab === 'withdrawals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Pul Yechish Tarixi</h3>
                <button
                  onClick={() => setIsWithdrawModalOpen(true)}
                  className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  + Yangi So&apos;rov
                </button>
              </div>

              {investorWithdrawals.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500">
                  Hozircha pul yechish so&apos;rovlari yo&apos;q.
                </div>
              ) : (
                <div className="space-y-2.5 font-mono text-xs">
                  {investorWithdrawals.map((w) => {
                    const r = receipts.find((rec) => rec.id === w.receiptId);

                    return (
                      <div
                        key={w.id}
                        className="p-3.5 rounded-2xl neu-card space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-200 font-mono">{w.requestNumber}</span>
                          <span
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold font-sans ${
                              w.status === 'COMPLETED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : w.status === 'SENT'
                                ? 'bg-amber-500/20 text-amber-300 animate-pulse'
                                : 'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            {w.status}
                          </span>
                        </div>

                        {/* Uniformly aligned amount box */}
                        <div className="flex items-center justify-between p-2.5 rounded-xl neu-inset border-l-2 border-emerald-500/50">
                          <span className="text-[10px] text-slate-400 font-sans uppercase font-medium">So‘ralgan Summa</span>
                          <span className="text-lg font-black text-white font-mono tabular-nums tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            ${w.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-center justify-between font-sans px-1">
                          <span>To‘lov usuli: {w.method}</span>
                          <span className="font-mono text-[10px] text-slate-500">{new Date(w.requestedAt).toLocaleDateString()}</span>
                        </div>

                        {r && (
                          <button
                            onClick={() => setSelectedReceiptForModal(r)}
                            className="w-full py-2 rounded-xl neu-btn text-emerald-400 font-mono text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
                          >
                            <FileCheck className="w-3.5 h-3.5" />
                            <span>Rasmiy Chekni Ko&apos;rish ({r.receiptNumber})</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HISTORY & LEDGER */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-white">Buxgalteriya Jurnali</h3>
              <div className="space-y-2 font-mono text-xs">
                {investorLedger.map((l) => (
                  <div key={l.id} className="p-3 rounded-xl bg-[#161B22] border border-white/5 space-y-1">
                    <div className="flex justify-between text-slate-400 text-[10px]">
                      <span>{l.entryNumber}</span>
                      <span>{new Date(l.timestamp).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-100">
                      <span className="font-sans text-xs">
                        {l.type === 'TRADE_SESSION_DISTRIBUTION'
                          ? 'Savdo Daromadi Taqsimoti'
                          : l.type === 'TRADE_SESSION_CORRECTION'
                          ? 'Sessiya Daromadi To‘g‘rilanishi'
                          : l.type === 'TRADE_SESSION_REVERSAL'
                          ? 'Sessiya Bekor Qilindi (Rollback)'
                          : l.type === 'TRADE_PROFIT_CREDIT'
                          ? 'Savdo Foydasi'
                          : l.type === 'NEW_CAPITAL_DEPOSIT'
                          ? 'Yangi Kapital Depoziti'
                          : l.type === 'WITHDRAWAL_PAYOUT'
                          ? 'Mablag‘ Yechish'
                          : l.type}
                      </span>
                      <span className={l.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {l.amount >= 0 ? '+' : ''}${Math.abs(l.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">{l.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="p-4 rounded-2xl bg-[#161B22] border border-white/10 space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center font-bold text-emerald-400 text-lg">
                    {currentInvestor.fullName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm">{currentInvestor.fullName}</h4>
                    <div className="text-slate-400 text-[11px] font-mono">{currentInvestor.passportId}</div>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5 font-mono text-[11px]">
                  <div className="flex justify-between text-slate-400">
                    <span>Telefon:</span>
                    <span className="text-slate-200">{currentInvestor.phone}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Email:</span>
                    <span className="text-slate-200">{currentInvestor.email}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>To&apos;lov rekviziti:</span>
                    <span className="text-slate-200">{currentInvestor.paymentEndpoint.maskedDetail}</span>
                  </div>
                </div>
              </div>

              {/* Explicit Balances Summary in Profile */}
              <div className="p-4 rounded-2xl bg-[#161B22] border border-white/10 space-y-2.5 font-mono text-[11px]">
                <div className="text-xs font-bold text-white font-sans flex items-center justify-between pb-1 border-b border-white/5">
                  <span>Balanslar Taqsimoti</span>
                  <span className="text-[10px] text-emerald-400">Faol Portfel</span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center space-x-1.5 text-amber-300">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Eski Balans (Tiklanish):</span>
                  </span>
                  <span className="text-amber-200 font-bold">
                    ${oldBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center space-x-1.5 text-emerald-300">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Yangi Balans (New Capital):</span>
                  </span>
                  <span className="text-emerald-300 font-bold">
                    ${newBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-white font-bold pt-2 border-t border-white/10 text-xs">
                  <span>Jami Balans:</span>
                  <span className="text-emerald-400">
                    ${currentInvestor.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Withdrawal Request Modal (Inside Phone Frame) */}
        {isWithdrawModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-40 p-5 flex flex-col justify-end animate-in fade-in">
            <div className="bg-[#161B22] rounded-3xl p-5 border border-white/10 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <h4 className="font-bold text-white text-sm">Yangi Pul Yechish So&apos;rovi</h4>
                <button onClick={() => setIsWithdrawModalOpen(false)} className="text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRequestWithdrawal} className="space-y-3">
                {/* Source Selection: Yangi Balans vs Eski Balans */}
                <div>
                  <label className="block text-slate-400 mb-1.5 font-sans font-medium">Qaysi balansdan yechmoqchisiz?</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setWithdrawSource('NEW_BALANCE')}
                      className={`p-2 rounded-xl border text-left font-mono transition-all ${
                        withdrawSource === 'NEW_BALANCE'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] block font-sans text-slate-400">✨ Yangi Balans</span>
                      <span className="text-xs font-bold text-emerald-300">${newBalance.toLocaleString()}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setWithdrawSource('OLD_BALANCE')}
                      className={`p-2 rounded-xl border text-left font-mono transition-all ${
                        withdrawSource === 'OLD_BALANCE'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                          : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                      }`}
                    >
                      <span className="text-[10px] block font-sans text-slate-400">🕒 Eski Balans</span>
                      <span className="text-xs font-bold text-amber-300">${oldBalance.toLocaleString()}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Yechish summasi (USD)</label>
                  <input
                    type="number"
                    min="50"
                    max={currentInvestor.balance}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3 py-2 text-white font-mono text-sm focus:outline-none"
                  />
                  <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                    <span>
                      Tanlangan balans: $
                      {(withdrawSource === 'NEW_BALANCE' ? newBalance : oldBalance).toLocaleString()}
                    </span>
                    {withdrawSource === 'NEW_BALANCE' && isOld && currentInvestor.recovery < 100 && (
                      <span className="text-blue-400">20% oylik limit: ${maxMonthlyWithdrawable.toLocaleString()}</span>
                    )}
                    {withdrawSource === 'OLD_BALANCE' && isOld && currentInvestor.recovery < 100 && (
                      <span className="text-amber-400 font-semibold">100% tiklangunga qadar qulflangan</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">To&apos;lov usuli</label>
                  <select
                    value={withdrawMethod}
                    onChange={(e) => setWithdrawMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
                  >
                    <option value="VISA">VISA Karta ({currentInvestor.paymentEndpoint.maskedDetail})</option>
                    <option value="MASTERCARD">Mastercard Karta</option>
                    <option value="CRYPTO">Kriptovalyuta (USDT TRC20)</option>
                    <option value="CASH">Kassadan Naqd Pul</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]">
                  24 soat ichida to‘lov amalga oshiriladi. Mablag‘ tushganidan so‘ng rasmiy chek va tasdiqlovchi dalil talab qilinadi.
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-lg"
                >
                  So&apos;rovni Yuborish
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile App Bottom Tab Navigation Bar */}
        <div className="h-16 bg-[#161B22] border-t border-white/10 px-6 flex items-center justify-between text-[10px] font-sans text-slate-400 shrink-0 z-20">
          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              activeTab === 'home' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Asosiy</span>
          </button>

          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              activeTab === 'withdrawals' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Yechish</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              activeTab === 'history' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Tarix</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              activeTab === 'profile' ? 'text-emerald-400 font-bold' : 'hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
