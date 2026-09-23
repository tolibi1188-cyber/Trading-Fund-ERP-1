/**
 * Sticky Desktop Admin Header with Quick Actions & Notifications Menu
 */

import React, { useState } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  DollarSign,
  UserPlus,
  Coins,
  Bell,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Smartphone,
  Monitor,
  Download,
  FileText,
  Lock,
  LogOut,
  Sun,
  Moon,
} from 'lucide-react';

export const AdminHeader: React.FC = () => {
  const {
    activeView,
    openModal,
    notifications,
    markNotificationRead,
    activeTabMode,
    setActiveTabMode,
    erpTheme,
    toggleErpTheme,
  } = useErp();

  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const viewTitles: Record<string, { title: string; subtitle: string }> = {
    dashboard: { title: 'Asosiy Boshqaruv Markazi', subtitle: 'Umumiy fond balansi, tiklanish ko‘rsatkichlari va 24h SLA holati' },
    investors: { title: 'Investorlar Reestri (1C Dense Grid)', subtitle: 'To‘liq inline tahrirlash, tiklanish qayta hisobi va yangi kapital monitoringi' },
    withdrawals: { title: 'Pul Yechish Navbati & 24h SLA', subtitle: 'To‘langanlik holati, rasmiy kvitansiya generatsiyasi va majburiy tasdiq nazorati' },
    receipts: { title: 'Rasmiy Kvitansiyalar ("Chek") Arxiv', subtitle: 'Raqamli imzoli, QR-kodli va tasdiqlangan hujjatlar bazasi' },
    ledger: { title: 'Bosh Moliyaviy Ledger (Journal)', subtitle: 'Har bir tranzaksiyaning o‘zgarmas (immutable) auditi va oldingi/keyingi qoldiqlari' },
    notifications: { title: 'Push Bildirishnomalar Markazi', subtitle: 'Investorlarga yuborilgan tiklanish xabarlari va SLA signallari' },
    reports: { title: 'Fond Moliyaviy Hisobotlari', subtitle: 'AUM strukturasi, qoplangan zararlar va 50/50 foyda taqsimoti tahlili' },
    audit: { title: 'Xavfsizlik & Harakatlar Jurnali', subtitle: 'Ma‘muriy harakatlar, IP manzillar va oldingi/keyingi holatlar ro‘yxati' },
    market: { title: 'Jonli FX & Xomashyo Bozori', subtitle: 'XAUUSD, EURUSD, UZS/USD interaktiv grafiklari va orderbook' },
    docs: { title: 'Tizim Arxitekturasi & PostgreSQL DDL', subtitle: 'Ma‘lumotlar bazasi sxemasi, API spetsifikatsiyalari va xavfsizlik modeli' },
  };

  const currentMeta = viewTitles[activeView] || { title: 'Trading Fund ERP', subtitle: 'Enterprise Investment Ecosystem' };

  return (
    <header
      id="admin-header"
      className="h-16 bg-[#0e141f] border-b border-white/[0.06] px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 shadow-[0_4px_16px_#06080e]"
    >
      {/* Title & Context */}
      <div>
        <h2 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
          <span>{currentMeta.title}</span>
        </h2>
        <p className="text-xs text-slate-400 font-sans">{currentMeta.subtitle}</p>
      </div>

      {/* Quick Action Buttons & Controls */}
      <div className="flex items-center space-x-3">
        {/* Neumorphic Device Switcher Channel */}
        <div className="hidden md:flex items-center p-1 rounded-xl neu-sunken-well text-xs">
          <button
            onClick={() => setActiveTabMode('admin')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTabMode === 'admin'
                ? 'neu-segment-active font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop ERP</span>
          </button>
          <button
            onClick={() => setActiveTabMode('admin-mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTabMode === 'admin-mobile'
                ? 'neu-segment-active font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
            title="Admin uchun mobil ilova (ko'chada bo'lganda ishlatish)"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Admin Mobil</span>
          </button>
          <button
            onClick={() => setActiveTabMode('mobile')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTabMode === 'mobile'
                ? 'neu-segment-active font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Investor App</span>
          </button>
          <button
            onClick={() => setActiveTabMode('split')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTabMode === 'split'
                ? 'neu-segment-active font-bold text-blue-400'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Dual Split</span>
          </button>
          <button
            onClick={() => setActiveTabMode('auth')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
              activeTabMode === 'auth'
                ? 'neu-segment-active font-bold text-orange-500'
                : 'text-slate-400 hover:text-orange-400'
            }`}
            title="3D Neumorphic Kirish / Sign Up darchasini ochish"
          >
            <Lock className="w-3.5 h-3.5 text-orange-500" />
            <span>Kirish (3D)</span>
          </button>
        </div>

        {/* Mobile-only Quick Switcher to Admin Mobile */}
        <div className="flex md:hidden items-center space-x-1">
          <button
            onClick={() => setActiveTabMode('admin-mobile')}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg neu-btn text-orange-400 text-[11px] font-bold"
            title="Mobil ko'rinishga o'tish"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobil Rejim</span>
          </button>
        </div>

        {/* Global Action: + Trade Profit (Luminous Orange Neumorphic Button) */}
        <button
          onClick={() => openModal('trade-profit')}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl neu-btn-orange text-white text-xs font-bold transition-all active:scale-95 shadow-md"
        >
          <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">+ Daromad Taqsimlash</span>
          <span className="sm:hidden">+ Daromad</span>
        </button>

        {/* Global Action: + New Investor (Tactile Extruded Button) */}
        <button
          onClick={() => openModal('new-investor')}
          className="hidden sm:flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl neu-btn text-slate-200 text-xs font-semibold hover:text-white active:scale-95 transition-all"
        >
          <UserPlus className="w-3.5 h-3.5 text-orange-400" />
          <span>+ Investor</span>
        </button>

        {/* Global Download Button: Project ZIP & PDF */}
        <div className="relative">
          <a
            href="/TradingFund_ERP_Loyiha.zip"
            download="TradingFund_ERP_Loyiha.zip"
            title="Butun loyihani ZIP holatda yuklab olish (kodlar, PDF va promptlar tarixi bilan)"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl neu-btn text-blue-400 hover:text-blue-300 text-xs font-bold active:scale-95 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Loyihani Yuklab Olish (.ZIP)</span>
            <span className="lg:hidden">.ZIP</span>
          </a>
        </div>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotifDropdownOpen((prev) => !prev)}
            className="p-2 rounded-xl neu-btn text-slate-300 hover:text-white relative transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(244,63,94,0.6)]">
                {unreadCount}
              </span>
            )}
          </button>

          {notifDropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#161B22] border border-white/15 shadow-2xl glass-dropdown p-3 z-50 text-xs font-sans animate-in fade-in zoom-in-95 duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="font-bold text-white">Bildirishnomalar</span>
                <span className="font-mono text-[10px] text-slate-400">{unreadCount} yangi</span>
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-white/5 py-1">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`py-2.5 px-2 rounded-lg cursor-pointer transition-colors ${
                      !n.read ? 'bg-emerald-500/[0.08]' : 'hover:bg-white/[0.03]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-slate-200 text-xs">{n.title}</span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Neumorphic Theme Mode Switcher (Klassik Och #e8e8e8 vs Tungi Qora) */}
        <button
          onClick={toggleErpTheme}
          title={erpTheme === 'light' ? "Tungi Neumorphic rejimiga o'tish" : "Klassik Oqimtir Neumorphic (#e8e8e8) rejimiga o'tish"}
          className="p-2 rounded-xl neu-btn text-slate-400 hover:text-amber-400 transition-colors active:scale-95 flex items-center space-x-1.5"
        >
          {erpTheme === 'light' ? (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden lg:inline text-xs font-semibold text-slate-700">Tungi</span>
            </>
          ) : (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline text-xs font-semibold text-amber-400">Oqimtir</span>
            </>
          )}
        </button>

        {/* User Profile & Logout Button */}
        <button
          onClick={() => setActiveTabMode('auth')}
          title="Tizimdan chiqish / 3D Neumorphic Kirish oynasiga qaytish"
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl neu-btn text-slate-300 hover:text-white text-xs group active:scale-95 transition-all"
        >
          <div className="w-6 h-6 rounded-lg bg-orange-500/20 text-orange-500 border border-orange-500/30 flex items-center justify-center font-bold text-[10px]">
            TI
          </div>
          <span className="hidden xl:inline text-xs font-medium text-slate-300">Tolib I.</span>
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-orange-400 transition-colors" />
        </button>
      </div>
    </header>
  );
};
