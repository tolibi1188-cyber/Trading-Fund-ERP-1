/**
 * Push Notifications View
 * History of notifications sent to investor mobile apps, and direct dispatch tool.
 */

import React, { useState } from 'react';
import { useErp } from '../../../context/ErpContext';
import { Bell, Send, CheckCircle2, AlertTriangle, Info, User } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const { notifications, investors, sendPushNotification } = useErp();

  const [targetInvestorId, setTargetInvestorId] = useState(investors[0]?.id || '');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    sendPushNotification(targetInvestorId, title, message, type);
    setTitle('');
    setMessage('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dispatch New Notification Form */}
        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-4">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Yangi Push Bildirishnoma Yuborish</h3>
          </div>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Investor mobil ilovasiga tezkor bildirishnoma jo‘natish.
          </p>

          <form onSubmit={handleSend} className="space-y-4 font-sans text-xs">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Qabul qiluvchi investor</label>
              <select
                value={targetInvestorId}
                onChange={(e) => setTargetInvestorId(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              >
                {investors.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.fullName} ({inv.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Toifa</label>
              <div className="grid grid-cols-4 gap-2">
                {(['info', 'success', 'warning', 'alert'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    className={`py-1.5 rounded-lg font-mono text-[10px] uppercase font-bold border transition-colors ${
                      type === t
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-white/[0.02] border-white/10 text-slate-400'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Sarlavha</label>
              <input
                type="text"
                required
                placeholder="Masalan: Daromad kreditlandi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Xabar matni</label>
              <textarea
                rows={3}
                required
                placeholder="Xabar tafsilotlarini yozing..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full bg-[#0D1117] border border-white/20 rounded-xl px-3 py-2 text-slate-200 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-colors flex items-center justify-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Bildirishnomani Yuborish</span>
            </button>
          </form>
        </div>

        {/* Right: History of Sent Notifications */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-white flex items-center space-x-2">
              <Bell className="w-4 h-4 text-blue-400" />
              <span>Bildirishnomalar Jurnali ({notifications.length})</span>
            </h3>
          </div>

          <div className="space-y-3 font-sans text-xs">
            {notifications.map((n) => {
              const targetInv = investors.find((i) => i.id === n.investorId);

              return (
                <div
                  key={n.id}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-bold text-sm text-white">{n.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center space-x-2">
                        <span>Qabul qiluvchi: {targetInv?.fullName || 'Barcha Investorlar'}</span>
                        <span>•</span>
                        <span>{new Date(n.timestamp).toLocaleString('uz-UZ')}</span>
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold border ${
                        n.type === 'PROFIT_DISTRIBUTION'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : n.type === 'WITHDRAWAL_ALERT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : n.type === 'SYSTEM_ALERT'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {n.type}
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed text-xs">{n.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
