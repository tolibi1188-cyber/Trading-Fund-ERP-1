/**
 * 1C Enterprise Bottom Status Bar
 * Displays live system telemetry, connection metrics, SLA counters, and clocks.
 */

import React, { useState, useEffect } from 'react';
import { useErp } from '../../context/ErpContext';
import { ShieldCheck, Database, Clock, AlertTriangle, Users } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { investors, withdrawals } = useErp();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const pendingWithdrawalsCount = withdrawals.filter((w) => w.status === 'PENDING').length;
  const sentAwaitingProofCount = withdrawals.filter((w) => w.status === 'SENT').length;
  const proofSubmittedCount = withdrawals.filter((w) => w.status === 'PROOF_SUBMITTED').length;

  const totalAum = investors.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <footer
      id="admin-status-bar"
      className="h-8 bg-[#0D1117] border-t border-white/10 px-4 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none z-30"
    >
      <div className="flex items-center space-x-5 overflow-hidden">
        {/* User & Auth State */}
        <div className="flex items-center space-x-1.5 text-slate-300">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Tolib I.</span>
          <span className="text-slate-500">(Senior Trader & Fund Admin)</span>
        </div>

        {/* Database & Connection */}
        <div className="hidden sm:flex items-center space-x-1.5 text-emerald-400">
          <Database className="w-3.5 h-3.5" />
          <span className="flex items-center space-x-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
            <span>PostgreSQL Tx Engine: CONNECTED</span>
          </span>
        </div>

        {/* Investor Count */}
        <div className="hidden md:flex items-center space-x-1.5">
          <Users className="w-3.5 h-3.5 text-slate-400" />
          <span>Active Investors:</span>
          <span className="text-slate-200 font-bold">{investors.length}</span>
        </div>

        {/* Total AUM */}
        <div className="hidden lg:flex items-center space-x-1.5">
          <span>Total AUM:</span>
          <span className="text-emerald-400 font-bold">
            ${totalAum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Pending SLA Warning */}
        {pendingWithdrawalsCount > 0 && (
          <div className="flex items-center space-x-1 text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            <AlertTriangle className="w-3 h-3 text-amber-400 animate-bounce" />
            <span className="font-bold">
              {pendingWithdrawalsCount} Pending SLA
            </span>
          </div>
        )}

        {/* Awaiting proof */}
        {sentAwaitingProofCount > 0 && (
          <span className="hidden xl:inline-block text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            {sentAwaitingProofCount} Sent (Awaiting Proof)
          </span>
        )}

        {/* Proof submitted awaiting final review */}
        {proofSubmittedCount > 0 && (
          <span className="hidden xl:inline-block text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            {proofSubmittedCount} Proof Ready
          </span>
        )}

        {/* Live Clock */}
        <div className="flex items-center space-x-1.5 text-slate-300">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold">{timeStr}</span>
          <span className="text-slate-500 text-[10px]">UZT</span>
        </div>
      </div>
    </footer>
  );
};
