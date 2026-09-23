/**
 * Desktop Admin Fixed Left Sidebar Navigation
 * Grouped navigation with real-time badges and counts.
 */

import React from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Layers,
  Users,
  DollarSign,
  FileCheck,
  BookOpen,
  Bell,
  BarChart3,
  ShieldAlert,
  TrendingUp,
  Code2,
  Smartphone,
  Command,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    activeTabMode,
    setActiveTabMode,
    investors,
    withdrawals,
    receipts,
    ledger,
    notifications,
    setCommandPaletteOpen,
  } = useErp();

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const navItems = [
    {
      id: 'dashboard',
      label: 'Asosiy Boshqaruv (Dashboard)',
      icon: Layers,
      badge: null,
    },
    {
      id: 'investors',
      label: 'Investorlar Ro‘yxati (1C Grid)',
      icon: Users,
      badge: investors.length.toString(),
      badgeColor: 'bg-white/10 text-slate-300',
    },
    {
      id: 'withdrawals',
      label: 'Pul Yechish & 24h SLA',
      icon: DollarSign,
      badge: pendingWithdrawalsCount > 0 ? `${pendingWithdrawalsCount} SLA` : null,
      badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse',
    },
    {
      id: 'receipts',
      label: 'Rasmiy Kvitansiyalar (Chek)',
      icon: FileCheck,
      badge: receipts.length.toString(),
      badgeColor: 'bg-emerald-500/15 text-emerald-300',
    },
    {
      id: 'ledger',
      label: 'Moliyaviy Ledger (Buxgalteriya)',
      icon: BookOpen,
      badge: ledger.length.toString(),
      badgeColor: 'bg-white/10 text-slate-300',
    },
    {
      id: 'notifications',
      label: 'Bildirishnomalar (Push)',
      icon: Bell,
      badge: unreadNotifsCount > 0 ? unreadNotifsCount.toString() : null,
      badgeColor: 'bg-blue-500/20 text-blue-300',
    },
    {
      id: 'reports',
      label: 'Moliyaviy Hisobotlar (AUM)',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'audit',
      label: 'Xavfsizlik & Audit Log',
      icon: ShieldAlert,
      badge: null,
    },
    {
      id: 'market',
      label: 'Jonli Bozor (FX / Gold)',
      icon: TrendingUp,
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 font-mono text-[9px]',
    },
    {
      id: 'docs',
      label: 'Arxitektura & PostgreSQL DDL',
      icon: Code2,
      badge: 'DOCS',
      badgeColor: 'bg-purple-500/20 text-purple-300 font-mono text-[9px]',
    },
  ];

  return (
    <aside
      id="admin-sidebar"
      className="w-64 bg-[#0b0f16] border-r border-white/[0.06] flex flex-col justify-between select-none shrink-0 h-full z-20 shadow-[4px_0_16px_#05070c]"
    >
      <div>
        {/* Brand Header */}
        <div className="p-4 border-b border-white/[0.06] bg-[#0e141f]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl neu-btn-orange flex items-center justify-center">
              <span className="font-mono font-black text-white text-sm">TF</span>
            </div>
            <div>
              <h1 className="font-bold text-sm text-white tracking-tight leading-none flex items-center space-x-1.5">
                <span>Trading Fund ERP</span>
              </h1>
              <div className="text-[10px] font-mono text-orange-400 mt-1 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse" />
                <span>v2.6.4 • Neumorphic</span>
              </div>
            </div>
          </div>
        </div>

        {/* Command Palette Trigger Button */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl neu-inset text-xs text-slate-400 hover:text-slate-200 transition-all group"
          >
            <span className="flex items-center space-x-2">
              <Command className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
              <span>Tezkor qidiruv...</span>
            </span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 border border-white/10 text-slate-400 shadow-inner">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Group Navigation Links */}
        <nav className="p-3 space-y-1.5 overflow-y-auto max-h-[calc(100vh-270px)]">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-3 py-1 font-semibold">
            Boshqaruv Paneli
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id && activeTabMode === 'admin';
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setActiveTabMode('admin');
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'neu-segment-active font-semibold shadow-[0_0_14px_rgba(249,115,22,0.25)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03] neu-card-hover'
                }`}
              >
                <div className="flex items-center space-x-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0 shadow-sm ${item.badgeColor || 'bg-white/10'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher: Mobile Companion Apps */}
      <div className="p-3 border-t border-white/[0.06] bg-[#0c111a] space-y-2">
        <div className="text-[10px] font-mono text-slate-400 uppercase font-semibold px-2 flex items-center justify-between">
          <span>Mobil Ilovalar</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_6px_#f97316] animate-pulse" />
        </div>

        {/* Primary Admin Mobile Button */}
        <button
          onClick={() => setActiveTabMode('admin-mobile')}
          className={`w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-bold transition-all active:scale-95 ${
            activeTabMode === 'admin-mobile'
              ? 'neu-segment-active text-orange-400'
              : 'neu-btn text-orange-400'
          }`}
          title="Ko'chada bo'lganda ishlatish uchun Admin Mobil Ilovasi"
        >
          <Smartphone className="w-4 h-4 text-orange-400" />
          <span>Admin Mobil (Ko‘chada)</span>
        </button>

        <div className="grid grid-cols-2 gap-2 pt-0.5">
          <button
            onClick={() => setActiveTabMode('mobile')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
              activeTabMode === 'mobile'
                ? 'neu-segment-active font-bold'
                : 'neu-btn text-slate-300'
            }`}
            title="Investor portfeli ko'rinishi"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Investor</span>
          </button>

          <button
            onClick={() => setActiveTabMode('split')}
            className={`flex items-center justify-center space-x-1.5 py-2 px-2 rounded-xl text-[11px] font-semibold transition-all active:scale-95 ${
              activeTabMode === 'split'
                ? 'neu-segment-active text-blue-400 font-bold'
                : 'neu-btn text-slate-300'
            }`}
            title="Ikkala ilovani yonma-yon ko'rish"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual Split</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
