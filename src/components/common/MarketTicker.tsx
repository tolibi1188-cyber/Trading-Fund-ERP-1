/**
 * Persistent Real-Time Market Ticker Bar
 * Displays live XAUUSD, EURUSD, UZS/USD price movements and sparklines.
 */

import React from 'react';
import { useErp } from '../../context/ErpContext';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

export const MarketTicker: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { marketRates } = useErp();

  return (
    <div
      id="market-ticker-bar"
      className={`w-full bg-[#090d14] border-b border-white/[0.04] px-4 flex items-center justify-between text-xs overflow-x-auto shadow-inner ${
        compact ? 'py-1' : 'py-1.5'
      }`}
    >
      <div className="flex items-center space-x-5 shrink-0">
        <div className="flex items-center space-x-2 text-slate-400 font-medium">
          <Activity className="w-3.5 h-3.5 text-emerald-400 shadow-[0_0_6px_#10b981] animate-pulse" />
          <span className="tracking-wider uppercase font-semibold text-[10px] text-slate-400 font-mono">
            Live FX & Commodities:
          </span>
        </div>

        {marketRates.map((rate) => {
          const isPositive = rate.changePercent24h >= 0;
          return (
            <div
              key={rate.symbol}
              className="flex items-center space-x-2.5 px-2.5 py-1 rounded-lg neu-inset transition-all"
            >
              <span className="font-semibold text-slate-300 text-[11px]">{rate.symbol}</span>
              <span className="font-mono font-bold text-slate-100 tracking-tight text-[11px]">
                {rate.symbol === 'UZS/USD'
                  ? `${rate.price.toLocaleString()} UZS`
                  : rate.symbol === 'EURUSD'
                  ? rate.price.toFixed(4)
                  : `$${rate.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
              </span>
              <div
                className={`flex items-center space-x-0.5 font-mono text-[10px] font-bold ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>
                  {isPositive ? '+' : ''}
                  {rate.changePercent24h.toFixed(2)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="hidden lg:flex items-center space-x-3 text-slate-400 text-[11px] shrink-0 font-mono">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#00F5A0]"></span>
        <span>NY / London Interbank Feed (120ms)</span>
      </div>
    </div>
  );
};
