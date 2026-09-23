/**
 * Security & Audit Log View
 * Immutable administrative event stream capturing actors, IPs, before/after states.
 */

import React, { useState } from 'react';
import { useErp } from '../../../context/ErpContext';
import { ShieldAlert, Search, Filter, Lock } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLogs } = useErp();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="p-6 space-y-4 max-w-7xl mx-auto">
      {/* Search Bar */}
      <div className="flex items-center justify-between bg-[#161B22] p-4 rounded-2xl border border-white/10">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Audit log bo'yicha qidiruv (Amal, Shaxs, IP, Tafsilot)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D1117] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-400"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
          <Lock className="w-3.5 h-3.5" />
          <span>O&apos;ZGARMAS AUDIT (IMMUTABLE LOG)</span>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl border border-white/10 bg-[#161B22] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="bg-[#0D1117] border-b border-white/10 text-slate-400 text-[11px] uppercase tracking-wider select-none">
                <th className="py-3 px-4">Vaqt (Timestamp)</th>
                <th className="py-3 px-4">Amal (Action)</th>
                <th className="py-3 px-4">Ob&apos;yekt (Entity)</th>
                <th className="py-3 px-4">Bajaruvchi (Actor)</th>
                <th className="py-3 px-4">IP Manzil</th>
                <th className="py-3 px-4">Tafsilot (Details)</th>
                <th className="py-3 px-4">Oldingi Holat</th>
                <th className="py-3 px-4">Yangi Holat</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02]">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString('uz-UZ', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-400">{log.action}</span>
                  </td>

                  <td className="py-3 px-4 text-slate-300">
                    {log.category} ({log.targetName})
                  </td>

                  <td className="py-3 px-4 text-slate-200 font-sans font-semibold">
                    {log.actor}
                  </td>

                  <td className="py-3 px-4 text-slate-400 text-[11px]">
                    {log.ipAddress}
                  </td>

                  <td className="py-3 px-4 font-sans text-slate-300 max-w-sm truncate" title={log.details}>
                    {log.details}
                  </td>

                  <td className="py-3 px-4 text-slate-500 max-w-[120px] truncate">
                    {log.beforeState ? JSON.stringify(log.beforeState) : '—'}
                  </td>

                  <td className="py-3 px-4 text-slate-300 max-w-[120px] truncate">
                    {log.afterState ? JSON.stringify(log.afterState) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
