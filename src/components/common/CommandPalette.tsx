/**
 * Command Palette (Ctrl / Cmd + K)
 * Keyboard-first navigation and fuzzy search across investors, ledger, and ERP views.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useErp } from '../../context/ErpContext';
import {
  Search,
  User,
  DollarSign,
  FileText,
  Shield,
  Layers,
  TrendingUp,
  Download,
  Smartphone,
  CheckCircle,
  X,
} from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    investors,
    setActiveView,
    setActiveTabMode,
    setSelectedInvestorForDrawer,
    openModal,
    exportLedgerCsv,
    exportInvestorsCsv,
  } = useErp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Build items list
  const navActions = [
    { id: 'view-dashboard', label: 'Go to Dashboard Overview', category: 'Navigation', icon: Layers, action: () => { setActiveView('dashboard'); setActiveTabMode('admin'); } },
    { id: 'view-investors', label: 'Go to Investors Grid (1C Dense Table)', category: 'Navigation', icon: User, action: () => { setActiveView('investors'); setActiveTabMode('admin'); } },
    { id: 'view-withdrawals', label: 'Go to Withdrawals Queue & SLA', category: 'Navigation', icon: DollarSign, action: () => { setActiveView('withdrawals'); setActiveTabMode('admin'); } },
    { id: 'view-receipts', label: 'Go to Official Receipts ("Chek") Archive', category: 'Navigation', icon: FileText, action: () => { setActiveView('receipts'); setActiveTabMode('admin'); } },
    { id: 'view-ledger', label: 'Go to Full Accounting Ledger', category: 'Navigation', icon: FileText, action: () => { setActiveView('ledger'); setActiveTabMode('admin'); } },
    { id: 'view-reports', label: 'Go to Financial Reports & AUM Breakdown', category: 'Navigation', icon: TrendingUp, action: () => { setActiveView('reports'); setActiveTabMode('admin'); } },
    { id: 'view-audit', label: 'Go to Security Audit Log', category: 'Navigation', icon: Shield, action: () => { setActiveView('audit'); setActiveTabMode('admin'); } },
    { id: 'view-market', label: 'Go to Live FX & Commodity Markets', category: 'Navigation', icon: TrendingUp, action: () => { setActiveView('market'); setActiveTabMode('admin'); } },
    { id: 'view-docs', label: 'Go to DDL Schema, API Specs & Architecture', category: 'Navigation', icon: Layers, action: () => { setActiveView('docs'); setActiveTabMode('admin'); } },
    
    // Quick Actions
    { id: 'action-trade-profit', label: 'Action: Kunlik Savdo Foydasini Taqsimlash (50/50 Fond Taqsimoti, masalan $40,000)', category: 'Quick Action', icon: DollarSign, action: () => openModal('trade-profit') },
    { id: 'action-correct-session', label: "Action: Savdo Sessiyasini To'g'irlash yoki Bekor Qilish (Correct / Rollback Session)", category: 'Quick Action', icon: CheckCircle, action: () => openModal('correct-session') },
    { id: 'action-new-investor', label: 'Action: Register New Investor', category: 'Quick Action', icon: User, action: () => openModal('new-investor') },
    { id: 'action-new-capital', label: 'Action: Deposit Fresh New Capital (OLD Investor)', category: 'Quick Action', icon: DollarSign, action: () => openModal('new-capital') },
    { id: 'action-injection', label: 'Action: Manual Capital Injection (Recovery Nudge)', category: 'Quick Action', icon: CheckCircle, action: () => openModal('manual-injection') },
    { id: 'action-export-ledger', label: 'Action: Export Accounting Ledger to CSV', category: 'Quick Action', icon: Download, action: exportLedgerCsv },
    { id: 'action-export-investors', label: 'Action: Export Investors Directory to CSV', category: 'Quick Action', icon: Download, action: exportInvestorsCsv },

    // Device switches
    { id: 'mode-mobile', label: 'Switch to: Investor Mobile App Mockup', category: 'Mode', icon: Smartphone, action: () => setActiveTabMode('mobile') },
    { id: 'mode-split', label: 'Switch to: Split Dual View (Admin + Mobile Side-by-Side)', category: 'Mode', icon: Layers, action: () => setActiveTabMode('split') },
  ];

  // Investor items
  const investorItems = investors.map((inv) => ({
    id: `inv-${inv.id}`,
    label: `${inv.fullName} (${inv.code}) — Balance: $${inv.balance.toLocaleString()} | Type: ${inv.type} | Recovery: ${inv.recovery}%`,
    category: 'Investor Profile',
    icon: User,
    action: () => {
      setActiveView('investors');
      setActiveTabMode('admin');
      setSelectedInvestorForDrawer(inv);
    },
  }));

  const allItems = [...navActions, ...investorItems];

  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          filteredItems[selectedIndex].action();
          setCommandPaletteOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, filteredItems, selectedIndex, setCommandPaletteOpen]);

  if (!commandPaletteOpen) return null;

  return (
    <div
      id="command-palette-backdrop"
      className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-start justify-center pt-20 px-4 z-50 animate-in fade-in duration-150"
      onClick={() => setCommandPaletteOpen(false)}
    >
      <div
        id="command-palette-dialog"
        className="w-full max-w-2xl bg-[#161B22] border border-white/15 rounded-xl shadow-2xl overflow-hidden glass-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0D1117]/80">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search investors by name/code, or jump to view..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 focus:outline-none text-sm font-sans"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-200 p-1 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 divide-y divide-white/5 font-sans">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-sm">
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  onClick={() => {
                    item.action();
                    setCommandPaletteOpen(false);
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm transition-colors ${
                    isSelected ? 'bg-emerald-500/15 text-emerald-300' : 'text-slate-300 hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.06] text-slate-400 shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer hints */}
        <div className="px-4 py-2 bg-[#0D1117]/80 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center space-x-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">↵</kbd> to select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-slate-300">ESC</kbd> to close
            </span>
          </div>
          <span>Trading Fund ERP v2.6.4</span>
        </div>
      </div>
    </div>
  );
};
