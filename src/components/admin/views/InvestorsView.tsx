/**
 * 1C-Style Advanced Investors Management Console
 * Features:
 * - Perfectly fitted layout with zero overflow on standard screens
 * - Passport and Phone numbers securely hidden from the main view and revealed upon click (modal & drawer)
 * - Executive Neumorphic KPI Summary Header
 * - Dual view modes: 1C Dense Tabular Grid & 3D Neumorphic Cards
 * - Double-click inline balance editing with instant recalculation
 * - Rapid modal actions (+Daromad, +New Capital, Zarar tahriri)
 * - 360-degree Slide-over Drawer for Ledger history & audits
 */

import React, { useState, useMemo } from 'react';
import { Investor, InvestorType } from '../../../types/erp';
import { useErp } from '../../../context/ErpContext';
import {
  Search,
  UserPlus,
  Download,
  Filter,
  ArrowUpDown,
  Edit2,
  DollarSign,
  Coins,
  History,
  Check,
  X,
  ShieldCheck,
  AlertCircle,
  LayoutGrid,
  List,
  Users,
  Wallet,
  TrendingUp,
  CreditCard,
  Phone,
  Mail,
  ChevronRight,
  Sparkles,
  ArrowUpRight,
  Eye,
  Copy,
  IdCard,
} from 'lucide-react';

export const InvestorsView: React.FC = () => {
  const {
    investors,
    openModal,
    setSelectedInvestorForDrawer,
    inlineUpdateBalance,
    exportInvestorsCsv,
  } = useErp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'OLD' | 'NEW' | 'RECOVERING' | 'NEW_CAPITAL'>('ALL');
  const [sortField, setSortField] = useState<keyof Investor>('code');
  const [sortAsc, setSortAsc] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Contact & Passport Modal State (Ustiga bosganda ochiladigan pasport va telefon oynasi)
  const [contactModalInvestor, setContactModalInvestor] = useState<Investor | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Inline editing state: { investorId, currentInput }
  const [editingCellId, setEditingCellId] = useState<string | null>(null);
  const [inlineValue, setInlineValue] = useState<string>('');

  // Top Global Metrics
  const oldInvestorsCount = useMemo(() => investors.filter((i) => i.type === 'OLD').length, [investors]);
  const newInvestorsCount = useMemo(() => investors.filter((i) => i.type === 'NEW').length, [investors]);
  const allTotalInitialLoss = useMemo(() => investors.reduce((sum, i) => sum + i.initialLoss, 0), [investors]);
  const allTotalRecovered = useMemo(() => investors.reduce((sum, i) => sum + i.recoveredAmount, 0), [investors]);
  const allTotalBalance = useMemo(() => investors.reduce((sum, i) => sum + i.balance, 0), [investors]);
  const allTotalNewCapital = useMemo(() => investors.reduce((sum, i) => sum + i.newCapital, 0), [investors]);
  const overallRecoveryPercent = useMemo(() => {
    return allTotalInitialLoss > 0
      ? Math.min(100, (allTotalRecovered / allTotalInitialLoss) * 100)
      : 100;
  }, [allTotalInitialLoss, allTotalRecovered]);

  const filteredInvestors = useMemo(() => {
    return investors.filter((inv) => {
      const matchSearch =
        inv.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.passportId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.phone.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (filterType === 'OLD') return inv.type === 'OLD';
      if (filterType === 'NEW') return inv.type === 'NEW';
      if (filterType === 'RECOVERING') return inv.type === 'OLD' && inv.recovery < 100;
      if (filterType === 'NEW_CAPITAL') return inv.newCapital > 0;

      return true;
    }).sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortAsc ? valA - valB : valB - valA;
      }
      return sortAsc
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [investors, searchTerm, filterType, sortField, sortAsc]);

  const handleSort = (field: keyof Investor) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const startInlineEdit = (inv: Investor, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCellId(inv.id);
    setInlineValue(inv.balance.toString());
  };

  const saveInlineEdit = (investorId: string) => {
    const parsed = parseFloat(inlineValue);
    if (!isNaN(parsed) && parsed >= 0) {
      inlineUpdateBalance(investorId, parsed, '1C Jadvaldan inline to‘g‘rilangan');
    }
    setEditingCellId(null);
  };

  // Footer totals for filtered list
  const totalInitialLoss = filteredInvestors.reduce((sum, i) => sum + i.initialLoss, 0);
  const totalRecovered = filteredInvestors.reduce((sum, i) => sum + i.recoveredAmount, 0);
  const totalBalance = filteredInvestors.reduce((sum, i) => sum + i.balance, 0);
  const totalNewCapital = filteredInvestors.reduce((sum, i) => sum + i.newCapital, 0);

  return (
    <div className="p-3 sm:p-5 space-y-4 w-full max-w-[1440px] mx-auto overflow-hidden">
      {/* ================================================================= */}
      {/* 1. COMPACT EXECUTIVE KPI ROW (FITS ON ANY SCREEN)                 */}
      {/* ================================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* KPI 1: Total Investors */}
        <div className="p-3.5 rounded-2xl neu-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Jami Investorlar
            </span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-emerald-400">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums tracking-tight">
              {investors.length} <span className="text-xs font-sans font-medium text-slate-400">ta hisob</span>
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5 flex items-center space-x-1.5">
              <span className="text-amber-300 font-semibold">{oldInvestorsCount} OLD</span>
              <span className="text-slate-600">•</span>
              <span className="text-emerald-400 font-semibold">{newInvestorsCount} NEW</span>
            </div>
          </div>
        </div>

        {/* KPI 2: Total Balance (AUM) */}
        <div className="p-3.5 rounded-2xl neu-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Jami Portfel (AUM)
            </span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-emerald-400">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums tracking-tight">
              ${allTotalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              Amaldagi umumiy balans
            </div>
          </div>
        </div>

        {/* KPI 3: Overall Recovery Progress */}
        <div className="p-3.5 rounded-2xl neu-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Zarar Tiklanishi
            </span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-amber-400">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline justify-between">
              <div className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums tracking-tight">
                {overallRecoveryPercent.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-400 font-mono tabular-nums">
                ${allTotalRecovered.toLocaleString()}
              </span>
            </div>
            <div className="w-full bg-[#080c13] h-1.5 rounded-full overflow-hidden border border-white/5 mt-1 neu-inset">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${Math.min(100, Math.max(3, overallRecoveryPercent))}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: New Capital (§4) */}
        <div className="p-3.5 rounded-2xl neu-card flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Yangi Kapital (§4)
            </span>
            <div className="w-7 h-7 rounded-lg neu-inset flex items-center justify-center text-blue-400">
              <Coins className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono tabular-nums tracking-tight">
              ${allTotalNewCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-[10px] text-slate-400 font-sans mt-0.5">
              100% erkin yechiladigan qism
            </div>
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 2. ACTION & FILTER CONTROL BAR                                   */}
      {/* ================================================================= */}
      <div className="p-3 rounded-2xl neu-card flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="flex items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Qidiruv: Ism, Kod, Pasport yoki Telefon..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full neu-inset rounded-xl pl-8 pr-8 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-sans"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Segmented Filter Controls */}
          <div className="hidden sm:flex items-center space-x-1 neu-inset p-1 rounded-xl text-xs">
            {(
              [
                { id: 'ALL', label: 'Barchasi' },
                { id: 'OLD', label: 'OLD' },
                { id: 'NEW', label: 'NEW' },
                { id: 'RECOVERING', label: 'Tiklanmoqda' },
                { id: 'NEW_CAPITAL', label: '§4 Kapital' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id)}
                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all text-[11px] ${
                  filterType === tab.id
                    ? 'neu-btn text-emerald-400 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Switch & Main Action Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="neu-inset p-1 rounded-xl flex items-center space-x-0.5">
            <button
              onClick={() => setViewMode('table')}
              title="Jadval ko‘rinishi"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'neu-btn text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              title="Kartalar ko‘rinishi"
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'cards' ? 'neu-btn text-emerald-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={exportInvestorsCsv}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-xl neu-btn text-xs font-semibold text-slate-300 active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={() => openModal('new-investor')}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl neu-btn-emerald text-slate-950 text-xs font-bold active:scale-95 transition-all shadow-md"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-950" />
            <span>+ Yangi</span>
          </button>
        </div>
      </div>

      {/* ================================================================= */}
      {/* 3. VIEW MODE A: 1C DENSE DATA GRID (TABLE) - FITS IN VIEWPORT    */}
      {/* ================================================================= */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl neu-card overflow-hidden">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-[#090d14] border-b border-white/[0.08] text-slate-400 font-mono text-[11px] uppercase tracking-wider select-none">
                <th onClick={() => handleSort('code')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors w-20">
                  <div className="flex items-center space-x-1">
                    <span>Kod</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('fullName')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors">
                  <div className="flex items-center space-x-1">
                    <span>Investor Ismi (Pasport & Tel ustiga bosing)</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
                <th className="py-3 px-2.5 w-24">Toifa</th>
                <th onClick={() => handleSort('initialLoss')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-right w-28">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Zarar</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('recoveredAmount')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-right w-28">
                  <div className="flex items-center justify-end space-x-1">
                    <span>Tiklandi</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('recovery')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-center w-28">
                  <div className="flex items-center justify-center space-x-1">
                    <span>Tiklanish %</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleSort('balance')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-right w-36">
                  <div className="flex items-center justify-end space-x-1">
                    <span className="text-emerald-400 font-bold">Jami Balans</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-emerald-500/70" />
                  </div>
                </th>
                <th onClick={() => handleSort('newCapital')} className="py-3 px-3 cursor-pointer hover:text-white transition-colors text-right w-32">
                  <div className="flex items-center justify-end space-x-1">
                    <span className="text-blue-400 font-bold">New Capital</span>
                    <ArrowUpDown className="w-2.5 h-2.5 text-blue-500/70" />
                  </div>
                </th>
                <th className="py-3 px-3 text-center w-28">Amallar</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.04] font-mono text-xs">
              {filteredInvestors.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500 font-sans">
                    <AlertCircle className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    Hech qanday investor topilmadi.
                  </td>
                </tr>
              ) : (
                filteredInvestors.map((inv) => {
                  const isOld = inv.type === 'OLD';
                  const isEditingThis = editingCellId === inv.id;

                  return (
                    <tr
                      key={inv.id}
                      onClick={() => setSelectedInvestorForDrawer(inv)}
                      className="hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                      {/* Code */}
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className="px-2 py-0.5 rounded-lg neu-inset text-emerald-400 text-[11px] font-mono border-l-2 border-emerald-500/60 inline-block">
                          {inv.code}
                        </span>
                      </td>

                      {/* Full Name & Clickable Details Button (Ustiga bosganda pasport va tel chiqadi) */}
                      <td className="py-2.5 px-3 font-sans">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactModalInvestor(inv);
                            }}
                            title="Pasport va telefon ma'lumotlarini ko‘rish"
                            className="font-bold text-white text-xs sm:text-sm group-hover:text-emerald-300 transition-colors tracking-tight text-left hover:underline flex items-center space-x-1.5"
                          >
                            <span>{inv.fullName}</span>
                          </button>

                          {/* Quick details trigger chip */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setContactModalInvestor(inv);
                            }}
                            title="Pasport & Telefon ma'lumotlarini ko‘rish"
                            className="px-2 py-0.5 rounded-md neu-inset text-[10px] font-mono text-slate-400 hover:text-emerald-400 hover:border-emerald-500/40 flex items-center space-x-1 transition-colors shrink-0"
                          >
                            <Eye className="w-2.5 h-2.5 text-emerald-400" />
                            <span>Pasport/Tel</span>
                          </button>
                        </div>
                      </td>

                      {/* Type Badge */}
                      <td className="py-2.5 px-2.5 font-sans">
                        {isOld ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            <span>OLD</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>NEW 50/50</span>
                          </span>
                        )}
                      </td>

                      {/* Initial Loss */}
                      <td className="py-2.5 px-3 text-right">
                        {isOld ? (
                          <div className="flex items-center justify-end space-x-1">
                            <span className="text-slate-300 font-bold tabular-nums">
                              ${inv.initialLoss.toLocaleString()}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal('edit-loss', { investorId: inv.id });
                              }}
                              title="Zararni to'g'rilash"
                              className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-amber-400 transition-opacity"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                      {/* Recovered Amount */}
                      <td className="py-2.5 px-3 text-right text-slate-300 font-bold tabular-nums">
                        {isOld ? `$${inv.recoveredAmount.toLocaleString()}` : <span className="text-slate-600">—</span>}
                      </td>

                      {/* Recovery % Progress */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center justify-center space-x-1.5">
                          <div className="w-12 bg-[#080c13] h-1.5 rounded-full overflow-hidden border border-white/5 neu-inset">
                            <div
                              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                              style={{ width: `${Math.min(100, Math.max(3, inv.recovery))}%` }}
                            />
                          </div>
                          <span className="text-white font-black text-[11px] w-9 text-right tabular-nums">
                            {inv.recovery.toFixed(0)}%
                          </span>
                        </div>
                      </td>

                      {/* Jami Balans (Inline Editable) */}
                      <td
                        onDoubleClick={(e) => startInlineEdit(inv, e)}
                        className="py-2.5 px-3 text-right relative"
                      >
                        {isEditingThis ? (
                          <div
                            className="flex items-center justify-end space-x-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="number"
                              value={inlineValue}
                              onChange={(e) => setInlineValue(e.target.value)}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveInlineEdit(inv.id);
                                if (e.key === 'Escape') setEditingCellId(null);
                              }}
                              className="w-24 neu-inset rounded px-1.5 py-0.5 text-xs text-white text-right focus:outline-none ring-1 ring-emerald-400 font-mono"
                            />
                            <button
                              onClick={() => saveInlineEdit(inv.id)}
                              className="p-1 rounded bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400"
                            >
                              <Check className="w-2.5 h-2.5" />
                            </button>
                            <button
                              onClick={() => setEditingCellId(null)}
                              className="p-1 rounded bg-white/10 text-slate-300 hover:bg-white/20"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1 group/cell">
                            <span className="font-extrabold text-white text-xs sm:text-sm tabular-nums tracking-tight">
                              ${inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                            <span
                              onClick={(e) => startInlineEdit(inv, e)}
                              title="Tahrirlash uchun bosing"
                              className="opacity-0 group-hover/cell:opacity-100 text-slate-500 hover:text-emerald-400 cursor-pointer p-0.5"
                            >
                              <Edit2 className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                      </td>

                      {/* New Capital (§4) */}
                      <td className="py-2.5 px-3 text-right font-mono">
                        {inv.newCapital > 0 ? (
                          <span className="font-bold text-blue-400 neu-inset px-2 py-0.5 rounded text-[11px] tabular-nums">
                            ${inv.newCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </span>
                        ) : (
                          <span className="text-slate-600 font-mono text-[11px]">$0.00</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-3 text-center">
                        <div
                          className="flex items-center justify-center space-x-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => openModal('trade-profit', { investorId: inv.id })}
                            title="Savdo daromadini kreditlash"
                            className="p-1 rounded-lg neu-btn text-emerald-400 hover:text-emerald-300 active:scale-95 transition-all"
                          >
                            <DollarSign className="w-3.5 h-3.5" />
                          </button>

                          {isOld && (
                            <button
                              onClick={() => openModal('new-capital', { investorId: inv.id })}
                              title="+ New Capital qo'shish (§4)"
                              className="p-1 rounded-lg neu-btn text-blue-400 hover:text-blue-300 active:scale-95 transition-all"
                            >
                              <Coins className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => setSelectedInvestorForDrawer(inv)}
                            title="Tafsilotlar va Ledger tarixi"
                            className="p-1 rounded-lg neu-btn text-slate-300 hover:text-white active:scale-95 transition-all"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* 1C Totals Footer Row */}
            <tfoot className="bg-[#090d14] border-t-2 border-white/[0.12] font-mono text-xs font-bold text-slate-200">
              <tr>
                <td className="py-3 px-3" colSpan={3}>
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400 uppercase tracking-wider text-[11px]">JAMI:</span>
                    <span className="neu-inset px-2 py-0.5 rounded text-white text-[10px]">
                      {filteredInvestors.length} hisob
                    </span>
                  </div>
                </td>
                <td className="py-3 px-3 text-right text-amber-300 tabular-nums">
                  ${totalInitialLoss.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-slate-300 tabular-nums">
                  ${totalRecovered.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-center text-emerald-400 tabular-nums font-black">
                  {totalInitialLoss > 0
                    ? `${((totalRecovered / totalInitialLoss) * 100).toFixed(1)}%`
                    : '100%'}
                </td>
                <td className="py-3 px-3 text-right text-white text-sm font-black tabular-nums">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right text-blue-300 font-black tabular-nums">
                  ${totalNewCapital.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        /* =============================================================== */
        /* VIEW MODE B: 3D NEUMORPHIC CARDS GRID                          */
        /* =============================================================== */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredInvestors.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 rounded-2xl neu-card">
              <AlertCircle className="w-8 h-8 mx-auto mb-1 text-slate-600" />
              Hech qanday investor topilmadi.
            </div>
          ) : (
            filteredInvestors.map((inv) => {
              const isOld = inv.type === 'OLD';
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedInvestorForDrawer(inv)}
                  className="rounded-2xl neu-card p-4 space-y-3 hover:border-emerald-500/30 transition-all cursor-pointer group"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-white text-sm group-hover:text-emerald-300 transition-colors">
                        {inv.fullName}
                      </h3>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        {inv.code}
                      </div>
                    </div>

                    <span
                      className={`text-[9px] font-sans font-bold px-2 py-0.5 rounded-full border ${
                        isOld
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                      }`}
                    >
                      {inv.type}
                    </span>
                  </div>

                  {/* Main Balance Display */}
                  <div className="p-3 rounded-xl neu-inset border-l-2 border-emerald-500/60 flex items-center justify-between">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">
                        Jami Balans
                      </div>
                      <div className="text-lg font-black text-white font-mono tabular-nums tracking-tight mt-0.5">
                        ${inv.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                    {inv.newCapital > 0 && (
                      <div className="text-right">
                        <div className="text-[9px] text-blue-400 font-semibold uppercase">
                          New Capital
                        </div>
                        <div className="text-xs font-bold text-blue-300 font-mono tabular-nums mt-0.5">
                          ${inv.newCapital.toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recovery Progress for OLD */}
                  {isOld && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-mono">
                        <span className="text-slate-400">Zarar Tiklanishi:</span>
                        <span className="text-white font-bold tabular-nums">
                          {inv.recovery.toFixed(0)}% (${inv.recoveredAmount.toLocaleString()})
                        </span>
                      </div>
                      <div className="w-full bg-[#080c13] h-1.5 rounded-full overflow-hidden border border-white/5 neu-inset">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 rounded-full"
                          style={{ width: `${Math.min(100, Math.max(3, inv.recovery))}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Pasport & Telefon Trigger Tugmasi */}
                  <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setContactModalInvestor(inv);
                      }}
                      className="px-2.5 py-1 rounded-lg neu-inset text-xs font-mono text-emerald-400 hover:text-white flex items-center space-x-1.5 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Pasport & Telefonni ko‘rish</span>
                    </button>

                    <button
                      onClick={() => setSelectedInvestorForDrawer(inv)}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-0.5"
                    >
                      <span>Profil</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================================================================= */}
      {/* 4. INVESTOR PASSPORT & TELEFON DETAILS MODAL (USTIGA BOSGANDA)   */}
      {/* ================================================================= */}
      {contactModalInvestor && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => setContactModalInvestor(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl neu-card p-5 space-y-4 border border-white/10 shadow-2xl relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-xl neu-inset border-l-2 border-emerald-500 flex items-center justify-center font-bold text-base text-emerald-400 font-mono">
                  {contactModalInvestor.code}
                </div>
                <div>
                  <h3 className="font-bold text-white text-base tracking-tight">
                    {contactModalInvestor.fullName}
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full neu-inset text-emerald-400 font-semibold">
                    {contactModalInvestor.type} INVESTOR
                  </span>
                </div>
              </div>

              <button
                onClick={() => setContactModalInvestor(null)}
                className="p-1.5 rounded-xl neu-btn text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Passport & Contact Fields */}
            <div className="space-y-2.5 font-mono text-xs">
              {/* Passport Box */}
              <div className="p-3 rounded-xl neu-inset space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Pasport Ma‘lumotlari</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-white tracking-wider">{contactModalInvestor.passportId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(contactModalInvestor.passportId);
                      setCopiedKey('passport');
                      setTimeout(() => setCopiedKey(null), 1500);
                    }}
                    className="px-2 py-1 rounded neu-btn text-slate-300 hover:text-white text-[10px] flex items-center space-x-1"
                  >
                    {copiedKey === 'passport' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'passport' ? 'Nusxalandi' : 'Nusxa olish'}</span>
                  </button>
                </div>
              </div>

              {/* Phone Box */}
              <div className="p-3 rounded-xl neu-inset space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Telefon Raqami</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-emerald-400">{contactModalInvestor.phone}</span>
                  <div className="flex items-center space-x-1.5">
                    <a
                      href={`tel:${contactModalInvestor.phone}`}
                      className="px-2 py-1 rounded neu-btn text-emerald-300 hover:text-white text-[10px] flex items-center space-x-1"
                    >
                      <Phone className="w-3 h-3" />
                      <span>Qo‘ng‘iroq</span>
                    </a>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(contactModalInvestor.phone);
                        setCopiedKey('phone');
                        setTimeout(() => setCopiedKey(null), 1500);
                      }}
                      className="px-2 py-1 rounded neu-btn text-slate-300 hover:text-white text-[10px] flex items-center space-x-1"
                    >
                      {copiedKey === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'phone' ? 'Nusxalandi' : 'Nusxa'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Email Box */}
              <div className="p-3 rounded-xl neu-inset space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">Elektron Pochta</div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-200">{contactModalInvestor.email}</span>
                  <a
                    href={`mailto:${contactModalInvestor.email}`}
                    className="px-2 py-1 rounded neu-btn text-slate-300 hover:text-white text-[10px] flex items-center space-x-1"
                  >
                    <Mail className="w-3 h-3" />
                    <span>Yozish</span>
                  </a>
                </div>
              </div>

              {/* Payment details */}
              <div className="p-3 rounded-xl neu-inset space-y-1">
                <div className="text-[10px] text-slate-400 uppercase font-sans font-medium">To‘lov Rekviziti</div>
                <div className="text-xs text-slate-200 flex items-center space-x-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="font-bold text-white">{contactModalInvestor.paymentEndpoint.method}:</span>
                  <span className="text-slate-300 truncate">{contactModalInvestor.paymentEndpoint.maskedDetail}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="pt-2 flex items-center space-x-2">
              <button
                onClick={() => {
                  setSelectedInvestorForDrawer(contactModalInvestor);
                  setContactModalInvestor(null);
                }}
                className="w-full py-2.5 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs active:scale-95 transition-all text-center"
              >
                To‘liq Profil va Ledgerni Ko‘rish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
