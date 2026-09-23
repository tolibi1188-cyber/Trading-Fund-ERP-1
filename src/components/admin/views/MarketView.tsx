/**
 * Live Market Data View (XAU/USD, EUR/USD, UZS/USD, Crypto)
 * Interactive candlestick/line chart, real-time depth orderbook, and market analytics.
 */

import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, DollarSign, RefreshCw } from 'lucide-react';

interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high: number;
  low: number;
  volume: string;
  digits: number;
}

export const MarketView: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState('XAU/USD');
  const [timeframe, setTimeframe] = useState<'1m' | '5m' | '1h' | '1d'>('1h');

  const [assets, setAssets] = useState<AssetData[]>([
    { symbol: 'XAU/USD', name: 'Oltin (Gold Spot)', price: 2924.50, change24h: 1.42, high: 2938.10, low: 2908.40, volume: '$4.2B', digits: 2 },
    { symbol: 'EUR/USD', name: 'Euro / US Dollar', price: 1.0845, change24h: -0.18, high: 1.0880, low: 1.0830, volume: '$12.8B', digits: 4 },
    { symbol: 'UZS/USD', name: 'US Dollar / O‘zbekiston So‘mi', price: 12920.00, change24h: 0.08, high: 12940.00, low: 12900.00, volume: '$180M', digits: 0 },
    { symbol: 'BTC/USD', name: 'Bitcoin Spot', price: 96420.00, change24h: 3.15, high: 97800.00, low: 94100.00, volume: '$28.4B', digits: 2 },
    { symbol: 'ETH/USD', name: 'Ethereum Spot', price: 2840.50, change24h: 2.10, high: 2890.00, low: 2790.00, volume: '$14.1B', digits: 2 },
  ]);

  // Minor live micro-fluctuations for realistic fintech feel
  useEffect(() => {
    const interval = setInterval(() => {
      setAssets((prev) =>
        prev.map((item) => {
          const delta = (Math.random() - 0.49) * (item.price * 0.0006);
          const newPrice = Number((item.price + delta).toFixed(item.digits));
          return {
            ...item,
            price: newPrice,
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const activeAsset = assets.find((a) => a.symbol === selectedSymbol) || assets[0];

  // SVG Chart points generator
  const chartPoints = [
    30, 35, 32, 45, 42, 50, 48, 60, 58, 70, 68, 85, 80, 92, 88, 105, 98, 115, 110, 125, 120, 140
  ];
  const maxVal = Math.max(...chartPoints);
  const minVal = Math.min(...chartPoints);
  const width = 600;
  const height = 180;

  const pointsString = chartPoints
    .map((val, idx) => {
      const x = (idx / (chartPoints.length - 1)) * width;
      const y = height - ((val - minVal) / (maxVal - minVal)) * (height - 30) - 15;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Assets Selector Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 font-mono">
        {assets.map((asset) => {
          const isSelected = asset.symbol === selectedSymbol;
          const isPositive = asset.change24h >= 0;

          return (
            <div
              key={asset.symbol}
              onClick={() => setSelectedSymbol(asset.symbol)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-lg'
                  : 'bg-[#161B22] border-white/10 hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">{asset.symbol}</span>
                <span
                  className={`text-[10px] font-bold ${
                    isPositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isPositive ? '+' : ''}
                  {asset.change24h}%
                </span>
              </div>
              <div className="text-base font-extrabold text-slate-100 mt-1.5">
                ${asset.price.toLocaleString('en-US', { minimumFractionDigits: asset.digits })}
              </div>
              <div className="text-[10px] text-slate-400 font-sans truncate mt-0.5">
                {asset.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Chart + Order Book Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Interactive Chart */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-mono text-emerald-400 uppercase font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Jonli Savdo Bozorlari (Trading Terminal)</span>
              </div>
              <h3 className="text-xl font-bold font-mono text-white mt-1">
                {activeAsset.symbol} — ${activeAsset.price.toLocaleString('en-US', { minimumFractionDigits: activeAsset.digits })}
              </h3>
            </div>

            <div className="flex items-center space-x-1 bg-[#0D1117] p-1 rounded-xl border border-white/10 text-xs font-mono">
              {(['1m', '5m', '1h', '1d'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${
                    timeframe === tf
                      ? 'bg-emerald-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line / Gradient Chart */}
          <div className="p-4 rounded-xl bg-[#0D1117] border border-white/5 relative overflow-hidden">
            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full h-48 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00F5A0" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00F5A0" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Area */}
              <polygon
                points={`0,${height} ${pointsString} ${width},${height}`}
                fill="url(#chartGradient)"
              />

              {/* Line */}
              <polyline
                fill="none"
                stroke="#00F5A0"
                strokeWidth="2.5"
                points={pointsString}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>

            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 pt-3 border-t border-white/5">
              <span>24h Min: ${activeAsset.low.toLocaleString()}</span>
              <span>Hajm (24h): {activeAsset.volume}</span>
              <span>24h Max: ${activeAsset.high.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Right (1 col): Simulated Order Book */}
        <div className="p-5 rounded-2xl bg-[#161B22] border border-white/10 space-y-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="font-bold text-white uppercase text-[11px]">Order Book (Stakan)</span>
            <span className="text-[10px] text-slate-400">Spread: 0.02%</span>
          </div>

          {/* Asks (Sellers - Red) */}
          <div className="space-y-1">
            {[
              { price: (activeAsset.price * 1.003).toFixed(activeAsset.digits), size: '4.2', depth: '70%' },
              { price: (activeAsset.price * 1.002).toFixed(activeAsset.digits), size: '8.5', depth: '55%' },
              { price: (activeAsset.price * 1.001).toFixed(activeAsset.digits), size: '12.1', depth: '30%' },
            ].map((ask, idx) => (
              <div key={idx} className="relative flex justify-between px-2 py-1 text-rose-400 text-[11px]">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-rose-500/10 pointer-events-none rounded"
                  style={{ width: ask.depth }}
                />
                <span className="font-bold">${ask.price}</span>
                <span className="text-slate-400">{ask.size} lot</span>
              </div>
            ))}
          </div>

          {/* Current Spread divider */}
          <div className="py-2 text-center bg-white/[0.03] rounded-lg border border-white/5 font-bold text-white text-sm">
            ${activeAsset.price.toLocaleString('en-US', { minimumFractionDigits: activeAsset.digits })}
          </div>

          {/* Bids (Buyers - Green) */}
          <div className="space-y-1">
            {[
              { price: (activeAsset.price * 0.999).toFixed(activeAsset.digits), size: '15.4', depth: '40%' },
              { price: (activeAsset.price * 0.998).toFixed(activeAsset.digits), size: '9.2', depth: '65%' },
              { price: (activeAsset.price * 0.997).toFixed(activeAsset.digits), size: '21.0', depth: '85%' },
            ].map((bid, idx) => (
              <div key={idx} className="relative flex justify-between px-2 py-1 text-emerald-400 text-[11px]">
                <div
                  className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 pointer-events-none rounded"
                  style={{ width: bid.depth }}
                />
                <span className="font-bold">${bid.price}</span>
                <span className="text-slate-400">{bid.size} lot</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
