/**
 * Modal to register a brand new investor (OLD or NEW archetype).
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import { InvestorType, PaymentMethod } from '../../types/erp';
import { UserPlus, X } from 'lucide-react';

export const NewInvestorModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addInvestor } = useErp();

  const [fullName, setFullName] = useState('');
  const [passportId, setPassportId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+998 ');
  const [type, setType] = useState<InvestorType>('OLD');
  const [initialLoss, setInitialLoss] = useState<string>('30000');
  const [balance, setBalance] = useState<string>('0');
  const [newCapital, setNewCapital] = useState<string>('0');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('VISA');
  const [maskedDetail, setMaskedDetail] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !passportId) return;

    const parsedLoss = parseFloat(initialLoss) || 0;
    const parsedBalance = parseFloat(balance) || 0;
    const parsedNewCapital = parseFloat(newCapital) || 0;

    addInvestor({
      fullName,
      passportId,
      email: email || `${fullName.toLowerCase().replace(/\s+/g, '.')}@investor.uz`,
      phone,
      type,
      initialLoss: type === 'OLD' ? parsedLoss : 0,
      balance: parsedBalance,
      newCapital: type === 'OLD' ? parsedNewCapital : parsedBalance,
      paymentEndpoint: {
        method: paymentMethod,
        maskedDetail: maskedDetail || (paymentMethod === 'CRYPTO' ? '0x... (USDT TRC20)' : '•••• 0000'),
        recipientName: fullName.toUpperCase(),
        notes,
      },
      status: 'ACTIVE',
    });

    onClose();
  };

  return (
    <div
      id="new-investor-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="new-investor-modal-dialog"
        className="w-full max-w-xl my-6 bg-[#161B22] border border-white/15 rounded-2xl shadow-2xl p-6 glass-dropdown text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div>
            <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">
              Investor Ro&apos;yxatdan O&apos;tkazish
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Register Investor in ERP
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Identity fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                To&apos;liq Ism-Sharif (Full Name) *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Aziz Rahimov"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Pasport / ID Seriya *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: AA 1234567"
                value={passportId}
                onChange={(e) => setPassportId(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Telefon raqam
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-mono focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email manzil
              </label>
              <input
                type="email"
                placeholder="aziz@investor.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Investor Type */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Investor Toifasi (Type)
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-colors ${
                  type === 'OLD'
                    ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="investorType"
                    checked={type === 'OLD'}
                    onChange={() => setType('OLD')}
                    className="accent-amber-400"
                  />
                  <span className="font-bold text-xs uppercase">OLD (Eski Investor)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Krizisgacha bo&apos;lgan zarar tiklanishi kerak. 100% tiklanguncha daromad tiklashga ketadi.
                </span>
              </label>

              <label
                className={`flex flex-col p-3 rounded-xl border cursor-pointer transition-colors ${
                  type === 'NEW'
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : 'bg-white/[0.02] border-white/10 text-slate-400 hover:border-white/20'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="investorType"
                    checked={type === 'NEW'}
                    onChange={() => setType('NEW')}
                    className="accent-emerald-400"
                  />
                  <span className="font-bold text-xs uppercase">NEW (Yangi Investor)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-1">
                  Boshlang&apos;ich zarar yo&apos;q. Birinchi kundan boshlab daromad 50/50 standart taqsimotda.
                </span>
              </label>
            </div>
          </div>

          {/* Financials based on Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {type === 'OLD' ? (
              <div>
                <label className="block text-xs font-medium text-amber-300 mb-1">
                  Boshlang&apos;ich Zarar (Initial Loss, USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialLoss}
                  onChange={(e) => setInitialLoss(e.target.value)}
                  className="w-full bg-[#0D1117] border border-amber-500/30 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  Boshlang&apos;ich Depozit (Initial Balance, USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={balance}
                  onChange={(e) => setBalance(e.target.value)}
                  className="w-full bg-[#0D1117] border border-emerald-500/30 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-emerald-400"
                />
              </div>
            )}

            {type === 'OLD' && (
              <div>
                <label className="block text-xs font-medium text-blue-300 mb-1">
                  Boshlang&apos;ich New Capital (agar kiritgan bo&apos;lsa, USD)
                </label>
                <input
                  type="number"
                  min="0"
                  value={newCapital}
                  onChange={(e) => setNewCapital(e.target.value)}
                  className="w-full bg-[#0D1117] border border-blue-500/30 rounded-xl px-3.5 py-2 text-sm font-mono text-white focus:outline-none focus:border-blue-400"
                />
              </div>
            )}
          </div>

          {/* Payment endpoint */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="text-xs font-mono text-slate-400 uppercase font-semibold">
              To&apos;lov Rekvizitlari (Hech qachon to&apos;liq PAN saqlanmaydi)
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  To&apos;lov Usuli (Method)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm text-slate-200 font-sans focus:outline-none"
                >
                  <option value="VISA">VISA Karta</option>
                  <option value="MASTERCARD">Mastercard Karta</option>
                  <option value="CRYPTO">Kripto (USDT TRC20 / ERC20)</option>
                  <option value="CASH">Naqd pul (Kassa / Bank)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Maskalangan Rekvizit (Oxirgi 4 ta raqam yoki qisqartma)
                </label>
                <input
                  type="text"
                  placeholder="•••• 4821 yoki 0x71e...9b"
                  value={maskedDetail}
                  onChange={(e) => setMaskedDetail(e.target.value)}
                  className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3.5 py-2 text-sm font-mono text-slate-200 focus:outline-none"
                />
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
              className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Ro&apos;yxatga Kiritish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
