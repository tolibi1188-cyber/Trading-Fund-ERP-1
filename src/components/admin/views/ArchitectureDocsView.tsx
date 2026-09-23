/**
 * Architecture & PostgreSQL DDL Documentation View
 * Full database schema, foreign keys, check constraints, immutable triggers, and business logic specs.
 * Includes direct download cards for Project ZIP, Requirements PDF, and Prompts History.
 */

import React, { useState } from 'react';
import {
  Code2,
  Copy,
  Check,
  Database,
  Shield,
  BookOpen,
  Download,
  FileText,
  Archive,
  History,
  CheckCircle,
  ExternalLink,
  Bot,
  Sparkles,
  X,
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showClaudeModal, setShowClaudeModal] = useState(false);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const claudeProjectPromptText = `# TRADING FUND ERP — CLAUDE PROJECT MASTER PROMPT & SYSTEM CONTEXT

> LOYIHA: TRADING FUND ERP (FinTech Buxgalteriya, Investorlar Portfeli va Kapital Boshqaruvi Tizimi)
> VERSIYA: 1.0.0 Production Ready
> TEXNOLOGIK STACK: React 19, TypeScript, Tailwind CSS, Vite, Electron (Windows Portable .exe), Lucide React
> FOYDALANUVCHI / EGASI: Tolib I. (tolibi1188@gmail.com)

---

## 1. TIZIM VA RO‘L (SYSTEM PERSONA)
Sen Trading Fund ERP tizimining bosh arxitektori, Senior FinTech Dasturchi va Buxgalteriya Dvigatellari Mutaxassisisan.
Sening vazifang — foydalanuvchining (Trading Fond rahbari/treyderi) barcha talablarini qat'iy moliyaviy aniqlik, 1C buxgalteriya intizomi, yuqori xavfsizlik va zamonaviy Neumorphic Dark FinTech uslubida amalga oshirishdir.

Tizim quyidagi 3 ta asosiy interfeysni yagona ilovada birlashtiradi:
1. Admin ERP Boshqaruv Paneli (Desktop & Web): 1C uslubidagi ixcham jadvallar, inline tahrirlash, 72h SLA, o'zgarmas Ledger va audit loglar.
2. Investor Shaxsiy Kabineti (Mobile WebApp / Telegram Bot Formati): Balans, tiklanish foizi, yangi kapital va pul yechish arizalari.
3. Admin Mobil Ilovasi: Smartfon orqali yo'lda yurib arizalarni tasdiqlash, chek ko'rish va aylanmani monitoring qilish.

---

## 2. ASOSIY TALABLAR VA MOLIYAVIY ALGORITMLAR

A) OLD INVESTORLAR (Eski Zararni Qoplash Dasturi):
- Ko'rsatkichlar: initialLoss, recoveredAmount, recovery % = min(100, (recoveredAmount / initialLoss) * 100).
- 100% ga qadar qoida: Savdo foydasining 100%i eski zararni qoplashga yo'naltiriladi (Fond = 0%).
- Bu tiklanayotgan balans qat'iy bloklangan (locked) bo'ladi, yechib olinmaydi.
- 100% tiklangandan so'ng: Avtomatik tarzda NEW (50/50) modeliga o'tadi va foydalar teng bo'linadi.
- §4 Yangi Kapital (New Active Capital): Agar OLD investor yangi depozit kiritsa, bu summa eski zararga aralashmaydi! Alohida newCapital sub-balansida yuritiladi, 50/50 foyda beradi va oyiga 20% limitda erkin yechilishi mumkin.
- Invariant: Agar admin initialLoss miqdorini o'zgartirsa, oldin tiklangan naqd dollar miqdori (recoveredAmount) saqlanib qoladi! Faqat yangi foiz qayta hisoblanadi.

B) NEW INVESTORLAR (50/50 Standart Modeli):
- Boshlang'ich zarari yo'q ($0). Sof foydaning 50%i investorga, 50%i fondga taqsimlanadi. Balans to'liq erkin.

C) PUL YECHISH VA 72-SOATLIK QAT'IY SLA:
- PENDING (72h geri sanash boshlanadi, balans hold qilinadi) -> SENT (To'lov yuborildi) -> PROOF_SUBMITTED (To'lov cheki va TXID kvitansiyasi) -> COMPLETED (Tasdiqlanadi, SLA yopiladi).
- Rad etilsa (REJECTED): Zaxiralangan summa to'liq avtomatik tarzda investor balansiga qaytadi.

D) O'ZGARMAS LEDGER VA AUDIT:
- Barcha amallar: entryNumber, timestamp (ISO), type, amount, balanceBefore, balanceAfter, recoveryBefore, recoveryAfter, performedBy qayd etiladi. Hech narsa o'chirilmaydi.

---

## 3. DIZAYN VA UI/UX STANDARTLARI
- Neumorphic Dark FinTech: Chuqur bo'rtma va botiq soyalar (neu-card, neu-inset, neu-btn, neu-btn-emerald).
- Sonlar va Shriftlar: Barcha raqamlar JetBrains Mono va tabular-nums da qat'iy vertikal bitta chiziqda tekislangan. Sarlavhalar Plus Jakarta Sans.
- Maxfiylik: Pasport va telefon raqamlari ochiq jadvalda ko'rsatilmaydi, faqat ustiga bosganda ochiluvchi maxsus modalda chiqadi.
- Gorizontal skrollga yo'l qo'yilmaydi (100% ekranga sig'adi).`;

  const postgresDdl = `-- ============================================================================
-- TRADING FUND ERP — PRODUCTION POSTGRESQL 16 DDL SCHEMA
-- Implements immutable ledger, audit trails, and strict balance invariants.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. ENUMS
CREATE TYPE investor_type_enum AS ENUM ('OLD', 'NEW');
CREATE TYPE investor_status_enum AS ENUM ('ACTIVE', 'SUSPENDED', 'CLOSED');
CREATE TYPE withdrawal_status_enum AS ENUM ('PENDING', 'SENT', 'PROOF_SUBMITTED', 'COMPLETED', 'REJECTED');
CREATE TYPE receipt_status_enum AS ENUM ('ISSUED', 'PROOF_SUBMITTED', 'CONFIRMED');
CREATE TYPE ledger_type_enum AS ENUM (
    'TRADE_PROFIT', 'NEW_CAPITAL', 'INJECTION', 'WITHDRAWAL', 'LOSS_CORRECTION', 'INLINE_EDIT'
);

-- 2. INVESTORS TABLE
CREATE TABLE investors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(16) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    passport_id VARCHAR(32) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(32) NOT NULL,
    type investor_type_enum NOT NULL DEFAULT 'OLD',
    status investor_status_enum NOT NULL DEFAULT 'ACTIVE',
    
    -- Financial Columns (Stored as NUMERIC(18, 4) to prevent IEEE-754 float drift)
    initial_loss NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (initial_loss >= 0),
    recovered_amount NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (recovered_amount >= 0),
    recovery_percent NUMERIC(7, 4) NOT NULL DEFAULT 0.0000 CHECK (recovery_percent >= 0 AND recovery_percent <= 100),
    balance NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (balance >= 0),
    new_capital NUMERIC(18, 4) NOT NULL DEFAULT 0.0000 CHECK (new_capital >= 0),
    
    -- Payment Destination (Zero full PAN storage for PCI compliance)
    payment_method VARCHAR(32) NOT NULL,
    payment_masked_detail VARCHAR(128) NOT NULL,
    payment_recipient_name VARCHAR(255) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. WITHDRAWAL REQUESTS TABLE (With 72h SLA Enforcement)
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(32) UNIQUE NOT NULL,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    method VARCHAR(32) NOT NULL,
    destination_details VARCHAR(255) NOT NULL,
    status withdrawal_status_enum NOT NULL DEFAULT 'PENDING',
    
    -- SLA Enforcement
    requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sla_deadline TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '72 hours'),
    sent_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    -- Proof Submissions (Verification)
    proof_submitted_at TIMESTAMPTZ,
    proof_video_url TEXT,
    proof_screenshot_url TEXT,
    
    receipt_id UUID
);

-- 4. OFFICIAL RECEIPTS TABLE ("CHEK")
CREATE TABLE official_receipts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    receipt_number VARCHAR(32) UNIQUE NOT NULL,
    withdrawal_id UUID NOT NULL REFERENCES withdrawal_requests(id) ON DELETE RESTRICT,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE RESTRICT,
    amount NUMERIC(18, 4) NOT NULL CHECK (amount > 0),
    method VARCHAR(32) NOT NULL,
    masked_address VARCHAR(128) NOT NULL,
    status receipt_status_enum NOT NULL DEFAULT 'ISSUED',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ,
    
    -- Cryptographic Verification
    hmac_signature VARCHAR(64) NOT NULL,
    qr_payload TEXT NOT NULL,
    proof_screenshot_url TEXT
);

-- 5. IMMUTABLE ACCOUNTING LEDGER (Append-Only)
CREATE TABLE accounting_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entry_number VARCHAR(32) UNIQUE NOT NULL,
    investor_id UUID NOT NULL REFERENCES investors(id) ON DELETE RESTRICT,
    type ledger_type_enum NOT NULL,
    amount NUMERIC(18, 4) NOT NULL,
    balance_before NUMERIC(18, 4) NOT NULL,
    balance_after NUMERIC(18, 4) NOT NULL,
    recovery_before NUMERIC(7, 4) NOT NULL,
    recovery_after NUMERIC(7, 4) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. IMMUTABLE AUDIT LOG (Security & Admin Operations)
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    actor VARCHAR(128) NOT NULL,
    ip_address VARCHAR(64) NOT NULL,
    details TEXT NOT NULL,
    before_state JSONB,
    after_state JSONB
);

-- 7. PERFORMANCE INDEXES
CREATE INDEX idx_investors_code ON investors(code);
CREATE INDEX idx_investors_type ON investors(type);
CREATE INDEX idx_withdrawals_investor ON withdrawal_requests(investor_id);
CREATE INDEX idx_withdrawals_status ON withdrawal_requests(status);
CREATE INDEX idx_ledger_investor ON accounting_ledger(investor_id);
CREATE INDEX idx_ledger_timestamp ON accounting_ledger(timestamp DESC);`;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* ================================================================= */}
      {/* PROJECT PACKAGING & DOWNLOADS SECTION (ZIP, PDF, PROMPTS)         */}
      {/* ================================================================= */}
      <div className="p-5 rounded-2xl neu-card space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl neu-inset flex items-center justify-center text-emerald-400">
              <Archive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">
                Loyiha To‘plami & Yuklab Olish (Artifacts Hub)
              </h2>
              <p className="text-xs text-slate-400">
                To‘liq loyiha arxiv (.ZIP), Talablar va Algoritmlar (.PDF) hamda Promptlar tarixi (.MD)
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 rounded-full neu-inset text-emerald-400 font-mono text-[11px] font-bold">
            V1.0.0 Production Ready
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          {/* Item 1: Complete Project ZIP */}
          <div className="p-4 rounded-xl neu-inset space-y-3 flex flex-col justify-between border-l-2 border-emerald-500">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold tracking-wider">
                  TO‘LIQ ARXIV
                </span>
                <Archive className="w-4 h-4 text-emerald-400" />
              </div>
              <h3 className="font-bold text-white text-sm mt-1">TradingFund_ERP_Loyiha.zip</h3>
              <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                Barcha frontend (React, TSX, CSS), Electron desktop, bat skriptlar, PDF qo‘llanma va promptlar tarixi bilan.
              </p>
            </div>
            <a
              href="/TradingFund_ERP_Loyiha.zip"
              download="TradingFund_ERP_Loyiha.zip"
              className="w-full py-2.5 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all shadow-md"
            >
              <Download className="w-3.5 h-3.5 text-slate-950" />
              <span>ZIP Yuklab Olish</span>
            </a>
          </div>

          {/* Item 2: Claude Project Master Prompt */}
          <div className="p-4 rounded-xl neu-inset space-y-3 flex flex-col justify-between border-l-2 border-purple-500 bg-purple-500/5">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-purple-400 uppercase font-bold tracking-wider">
                  CLAUDE PROJECT
                </span>
                <Bot className="w-4 h-4 text-purple-400" />
              </div>
              <h3 className="font-bold text-white text-sm mt-1">CLAUDE_PROJECT_PROMPT.md</h3>
              <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                Claude-da yangi Project ochish uchun tayyor Master Prompt: chat tarixi, barcha talablar va arxitektura.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setShowClaudeModal(true)}
                className="py-2.5 rounded-xl neu-btn text-purple-300 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ko‘rish</span>
              </button>
              <button
                onClick={() => copyToClipboard(claudeProjectPromptText, 'claude-prompt')}
                className="py-2.5 rounded-xl neu-btn text-slate-200 font-bold text-xs flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
              >
                {copiedSection === 'claude-prompt' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Nusxa</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Item 3: Requirements PDF */}
          <div className="p-4 rounded-xl neu-inset space-y-3 flex flex-col justify-between border-l-2 border-amber-500">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 uppercase font-bold tracking-wider">
                  RASMIY HUJJAT (PDF)
                </span>
                <FileText className="w-4 h-4 text-amber-400" />
              </div>
              <h3 className="font-bold text-white text-sm mt-1">Talablar & Algoritmlar.pdf</h3>
              <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                Eski va yangi investorlar qoidalari, 72h SLA, 50/50 taqsimot va o‘zgarmas Ledger hisoblash formulalari.
              </p>
            </div>
            <a
              href="/LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf"
              download="LOYIHA_TALABLARI_VA_ALGORITMLAR.pdf"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl neu-btn text-amber-300 font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDF O‘qish / Yuklash</span>
            </a>
          </div>

          {/* Item 4: Prompts History MD */}
          <div className="p-4 rounded-xl neu-inset space-y-3 flex flex-col justify-between border-l-2 border-blue-500">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold tracking-wider">
                  BUYRUQLAR XRONOLOGIYASI
                </span>
                <History className="w-4 h-4 text-blue-400" />
              </div>
              <h3 className="font-bold text-white text-sm mt-1">PROMPTLAR_TARIXI.md</h3>
              <p className="text-xs text-slate-400 font-sans mt-1 leading-relaxed">
                Loyiha boshidan to yakuniy holatigacha yuborilgan barcha topshiriqlar, talablar va bajarilish xronologiyasi.
              </p>
            </div>
            <a
              href="/PROMPTLAR_TARIXI.md"
              download="PROMPTLAR_TARIXI.md"
              target="_blank"
              rel="noreferrer"
              className="w-full py-2.5 rounded-xl neu-btn text-blue-300 font-bold text-xs flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <History className="w-3.5 h-3.5" />
              <span>Promptlar Tarixi</span>
            </a>
          </div>
        </div>
      </div>

      {/* Claude Master Prompt Modal */}
      {showClaudeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl max-h-[85vh] rounded-2xl neu-card border border-purple-500/30 flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/[0.08] bg-slate-900/80">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl neu-inset flex items-center justify-center text-purple-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm sm:text-base flex items-center space-x-2">
                    <span>CLAUDE PROJECT MASTER PROMPT</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Production Context
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Claude Project Knowledge yoki Custom Instructions ga to‘g‘ridan-to‘g‘ri joylashtirish uchun tayyor matn
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(claudeProjectPromptText, 'modal-claude')}
                  className="px-3 py-1.5 rounded-xl neu-btn-emerald text-slate-950 font-bold text-xs flex items-center space-x-1.5 active:scale-95 transition-all"
                >
                  {copiedSection === 'modal-claude' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Nusxalandi!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Butun Matnni Nusxalash</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowClaudeModal(false)}
                  className="w-8 h-8 rounded-xl neu-btn flex items-center justify-center text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 font-mono text-xs text-slate-300 bg-[#0a0d14] leading-relaxed select-text space-y-4">
              <pre className="whitespace-pre-wrap">{claudeProjectPromptText}</pre>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/[0.08] flex items-center justify-between bg-slate-900/60 text-xs">
              <span className="text-slate-400">
                Fayl nomi: <strong className="text-purple-300 font-mono">CLAUDE_PROJECT_PROMPT.md</strong>
              </span>
              <a
                href="/CLAUDE_PROJECT_PROMPT.md"
                download="CLAUDE_PROJECT_PROMPT.md"
                className="px-4 py-2 rounded-xl neu-btn text-purple-300 font-bold flex items-center space-x-2"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Fayl sifatida yuklab olish (.md)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SQL DDL Schema Card */}
      <div className="p-5 rounded-2xl neu-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>PostgreSQL 16 Production DDL Skripti</span>
          </div>

          <button
            onClick={() => copyToClipboard(postgresDdl, 'ddl')}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl neu-btn text-xs font-mono text-slate-300 hover:text-white"
          >
            {copiedSection === 'ddl' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Nusxalandi</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>SQL Nusxa olish</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl neu-inset overflow-x-auto text-[11px] font-mono text-slate-300 leading-relaxed max-h-96">
          <code>{postgresDdl}</code>
        </pre>
      </div>

      {/* Mathematical and Business Logic Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl neu-card space-y-3 font-sans text-xs">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>§4: OLD vs NEW Investorlar Mantig‘i</span>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed">
            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-emerald-400 font-bold">1. Standart OLD Investor (Yangi depozitsiz):</div>
              <div className="text-[11px] text-slate-400">
                Agar Recovery &lt; 100% bo‘lsa: Investor Share = 100% savdo daromadi (Fond = 0%).
                Yangi tiklangan summa = oldingi tiklangan + daromad.
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-blue-400 font-bold">2. Aralash OLD Investor (New Capital mavjud):</div>
              <div className="text-[11px] text-slate-400">
                W_new = New Capital / (New Capital + Recovering Balance)
                <br />
                P_new = Gross Profit * W_new → 50% Investorga, 50% Fondga
                <br />
                P_rec = Gross Profit * (1 - W_new) → 100% Zararni tiklashga
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-emerald-400 font-bold">3. Initial Loss To‘g‘rilanganda:</div>
              <div className="text-[11px] text-slate-400">
                Recovered Dollars saqlanadi.
                <br />
                New Recovery % = (Preserved Recovered Dollars / New Initial Loss) * 100
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl neu-card space-y-3 font-sans text-xs">
          <div className="flex items-center space-x-2 font-bold text-white text-sm">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>§5 & §6: Pul Yechish va Kvitansiya Tsikli</span>
          </div>

          <div className="space-y-2 text-slate-300 leading-relaxed">
            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-amber-400 font-bold">72-Hour SLA Timer:</div>
              <div className="text-[11px] text-slate-400">
                So‘rov tushgan daqiqadan boshlab orqaga 72 soat sanaydi. Muddat o‘tsa ogohlantirish beradi.
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-blue-400 font-bold">Rasmiy Chek va Kvitansiya Tsikli:</div>
              <div className="text-[11px] text-slate-400">
                Admin &quot;To‘landi&quot; deb belgilashi bilan rasmiy Chek generatsiya bo‘ladi va kvitansiya biriktiriladi.
                Tranzaksiya tasdiqlangach SLA muvaffaqiyat bilan yopiladi.
              </div>
            </div>

            <div className="p-2.5 rounded-xl neu-inset font-mono">
              <div className="text-emerald-400 font-bold">HMAC-SHA256 Raqamli Imzo:</div>
              <div className="text-[11px] text-slate-400">
                Chekdagi barcha rekvizitlar xeshlangan imzo bilan tasdiqlanadi va haqiqiy QR-kod orqali tekshiriladi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
