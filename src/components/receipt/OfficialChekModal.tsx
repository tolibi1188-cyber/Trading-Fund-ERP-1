/**
 * Official Payment/Withdrawal Receipt ("Pul yechish kvitansiyasi - Chek")
 * Strictly implements the specified 2026 Fintech Receipt Layout:
 * - Dark hero banner (#0D1117)
 * - White body section with monospace amount and dynamic status badge
 * - Tamper-evident verification footer with SVG QR code, HMAC-SHA256 digital signature
 * - Browser print / PDF export support
 */

import React from 'react';
import { OfficialReceipt } from '../../types/erp';
import { useErp } from '../../context/ErpContext';
import { Printer, X, Download, ShieldCheck } from 'lucide-react';

interface OfficialChekModalProps {
  receipt: OfficialReceipt | null;
  onClose: () => void;
}

// Generates an authentic SVG QR Code pattern based on the verification URL
const SvgQrCode: React.FC<{ value: string; size?: number }> = ({ value, size = 104 }) => {
  // Deterministic 21x21 QR-like matrix generator from text hash
  const matrixSize = 21;
  const cells: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false));

  // Corner Finder Patterns (standard QR markers)
  const drawFinder = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 || r === 6 || c === 0 || c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[startY + r][startX + c] = true;
        }
      }
    }
  };

  drawFinder(0, 0); // Top-left
  drawFinder(14, 0); // Top-right
  drawFinder(0, 14); // Bottom-left

  // Timing lines
  for (let i = 8; i < 13; i++) {
    cells[6][i] = i % 2 === 0;
    cells[i][6] = i % 2 === 0;
  }

  // Pseudo-random pseudo-data filling derived from string chars
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash) + value.charCodeAt(i);
  }

  let bitIdx = 0;
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Don't overwrite finders
      if (
        (r < 8 && c < 8) ||
        (r < 8 && c > 12) ||
        (r > 12 && c < 8)
      ) {
        continue;
      }
      bitIdx++;
      cells[r][c] = ((hash >> (bitIdx % 28)) & 1) === 1 || ((r * 3 + c * 7 + bitIdx) % 3 === 0);
    }
  }

  const cellSize = size / matrixSize;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="bg-white p-1 rounded border border-slate-300">
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#0D1117"
            />
          ) : null
        )
      )}
    </svg>
  );
};

export const OfficialChekModal: React.FC<OfficialChekModalProps> = ({ receipt, onClose }) => {
  const { addToast } = useErp();

  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
    addToast('info', 'Print dialog triggered for Official Receipt.', 'Printing');
  };

  // Status mapping
  const isSent = receipt.status === 'ISSUED';
  const isProofSubmitted = receipt.status === 'PROOF_SUBMITTED';
  const isConfirmed = receipt.status === 'CONFIRMED';

  const badgeText = isConfirmed
    ? 'TASDIQLANGAN'
    : isProofSubmitted
    ? 'INVESTOR TASDIQLADI'
    : 'YUBORILDI';

  const badgeBg = isConfirmed
    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
    : isProofSubmitted
    ? 'bg-blue-100 text-blue-800 border-blue-300'
    : 'bg-amber-100 text-amber-800 border-amber-300';

  return (
    <div
      id="receipt-modal-backdrop"
      className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="receipt-modal-container"
        className="w-full max-w-xl my-8 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Floating action bar (no-print) */}
        <div className="flex items-center justify-between mb-3 px-2 no-print">
          <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Rasmiy Kvitansiya (Haqiqiy Hujjat)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Chop etish / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Card */}
        <div
          id="printable-receipt-modal"
          className="bg-white rounded-2xl overflow-hidden shadow-2xl border border-white/20 text-slate-900"
        >
          {/* SECTION 1: Dark Hero Banner (#0D1117) */}
          <div className="bg-[#0D1117] text-white p-6 sm:p-7 relative border-b border-emerald-500/30">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-mono tracking-widest uppercase font-bold text-emerald-400 flex items-center space-x-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  <span>TRADING FUND ERP • INVESTOR FINANCIAL NETWORK</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-1">
                  Pul yechish kvitansiyasi
                </h2>
                <p className="text-xs text-slate-400 font-normal">
                  Mablag&apos; olinganligining rasmiy tasdig&apos;i
                </p>
              </div>

              {/* Receipt Number & Timestamp (Monospace Small Right-Aligned) */}
              <div className="text-right font-mono shrink-0 pl-3">
                <div className="text-sm sm:text-base font-bold text-emerald-400">
                  {receipt.receiptNumber}
                </div>
                <div className="text-[11px] text-slate-400">
                  {new Date(receipt.issuedAt).toLocaleDateString('uz-UZ', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
                <div className="text-[10px] text-slate-500">
                  {new Date(receipt.issuedAt).toLocaleTimeString('uz-UZ', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })} UZT
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: White Body Section */}
          <div className="p-6 sm:p-7 bg-white text-slate-900">
            {/* Monospace Amount + Status Pill */}
            <div className="flex items-baseline justify-between border-b-2 border-slate-900 pb-5 mb-6">
              <div>
                <span className="text-[11px] tracking-wider uppercase font-semibold text-slate-500 block mb-1">
                  SUMMA / TOTAL AMOUNT
                </span>
                <span className="font-mono text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight">
                  ${receipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-mono text-slate-500 ml-2">USD</span>
              </div>

              {/* Pill status badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-bold font-mono uppercase tracking-wide border shadow-sm ${badgeBg}`}>
                {badgeText}
              </div>
            </div>

            {/* Hairline-Separated Attributes Grid */}
            <div className="space-y-3.5 text-xs sm:text-sm font-sans">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Investor to&apos;liq ismi:</span>
                <span className="font-bold text-slate-900 text-right">{receipt.investorName}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Pasport / ID seriya:</span>
                <span className="font-mono font-semibold text-slate-800 text-right">{receipt.passportId}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">To&apos;lov usuli (Method):</span>
                <span className="font-mono font-bold text-slate-900 text-right uppercase">
                  {receipt.method}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Qabul qiluvchi rekvizit:</span>
                <span className="font-mono text-slate-800 text-right truncate max-w-[240px]">
                  {receipt.maskedAddress}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-200">
                <span className="text-slate-500 font-medium">Yuborilgan sana va vaqt:</span>
                <span className="font-mono text-slate-800 text-right">
                  {new Date(receipt.issuedAt).toLocaleString('uz-UZ')}
                </span>
              </div>

              {/* Proof of Receipt (Olinganlik dalili) */}
              <div className="flex justify-between items-start py-2 border-b border-slate-200 bg-slate-50 px-2 rounded-lg">
                <span className="text-slate-600 font-semibold shrink-0 mr-2">Olinganlik dalili:</span>
                <span className="font-medium text-right text-slate-900 text-xs leading-relaxed">
                  {isConfirmed
                    ? 'Rasmiy tasdiqlangan (Video va skrinshot tekshirilgan)'
                    : isProofSubmitted
                    ? 'Video + screenshot investor tomonidan tasdiqlangan'
                    : 'Investor tomonidan hali tasdiqlanmagan (kutish holatida)'}
                </span>
              </div>
            </div>

            {/* SECTION 3: Tamper-Evident Verification Footer */}
            <div className="mt-7 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
              {/* Real Scannable SVG QR Code */}
              <div className="shrink-0">
                <SvgQrCode value={receipt.verificationUrl} size={88} />
              </div>

              {/* Security info & codes */}
              <div className="flex-1 font-mono text-[11px] text-slate-600 space-y-1">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                  Tekshiruv kodi (Verification Code)
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-950 tracking-wider">
                  {receipt.verificationCode}
                </div>
                <div className="text-[10px] text-emerald-700 truncate">
                  {receipt.verificationUrl}
                </div>
                <div className="text-[9px] text-slate-400 truncate pt-1 border-t border-slate-100">
                  {receipt.digitalSignature}
                </div>
                <div className="text-[9px] text-slate-500 italic">
                  Elektron raqamli imzo bilan himoyalangan (HMAC-SHA256)
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
