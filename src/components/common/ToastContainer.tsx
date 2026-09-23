/**
 * Toast Container for system feedback and alerts
 */

import React from 'react';
import { useErp } from '../../context/ErpContext';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useErp();

  if (toasts.length === 0) return null;

  return (
    <div
      id="erp-toast-container"
      className="fixed bottom-12 right-6 flex flex-col space-y-2 z-50 pointer-events-none max-w-md w-full"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-xl border backdrop-blur-xl shadow-2xl transition-all animate-in slide-in-from-bottom-3 duration-200 ${
              isSuccess
                ? 'bg-[#0D1117]/95 border-emerald-500/30 text-emerald-300'
                : isError
                ? 'bg-[#0D1117]/95 border-rose-500/30 text-rose-300'
                : isWarning
                ? 'bg-[#0D1117]/95 border-amber-500/30 text-amber-300'
                : 'bg-[#0D1117]/95 border-blue-500/30 text-blue-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
              {isError && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />}

              <div className="text-xs">
                {toast.title && <div className="font-semibold text-slate-100 mb-0.5">{toast.title}</div>}
                <div className="text-slate-300 leading-relaxed font-sans">{toast.message}</div>
              </div>
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-100 p-1 ml-3 rounded transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
