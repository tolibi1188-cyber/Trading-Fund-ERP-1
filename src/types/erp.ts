/**
 * Trading Fund ERP - Core Financial & System Type Definitions
 */

export type InvestorType = 'OLD' | 'NEW';

export type PaymentMethod = 'VISA' | 'MASTERCARD' | 'CRYPTO' | 'CASH';

export interface PaymentEndpoint {
  method: PaymentMethod;
  maskedDetail: string; // e.g., "•••• 4821" or "0x7a3...f9b2 (USDT TRC20)"
  recipientName?: string;
  notes?: string;
}

export interface Investor {
  id: string;
  code: string; // e.g. "INV-001"
  fullName: string;
  passportId: string; // e.g. "AA 7894561"
  email: string;
  phone: string;
  type: InvestorType;
  initialLoss: number; // For OLD investors; editable with recalculation
  recoveredAmount: number; // Derived/stored absolute dollar recovered
  balance: number; // Current total balance
  newCapital: number; // Fresh capital not subject to recovery
  recovery: number; // % of initialLoss recovered (0-100)
  paymentEndpoint: PaymentEndpoint;
  status: 'ACTIVE' | 'FROZEN' | 'SETTLED' | 'PENDING_APPROVAL' | 'REJECTED';
  registrationNumber?: string; // e.g. "REG-2026-0081"
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export type LedgerEntryType =
  | 'INITIAL_LOSS_REGISTRATION'
  | 'TRADE_PROFIT_CREDIT'
  | 'TRADE_SESSION_DISTRIBUTION'
  | 'TRADE_SESSION_CORRECTION'
  | 'TRADE_SESSION_REVERSAL'
  | 'RECOVERY_CREDIT'
  | 'PROFIT_SPLIT_INVESTOR'
  | 'PROFIT_SPLIT_FUND'
  | 'NEW_CAPITAL_DEPOSIT'
  | 'MANUAL_INJECTION'
  | 'WITHDRAWAL_PAYOUT'
  | 'INLINE_BALANCE_CORRECTION'
  | 'LOSS_CORRECTION_ADJUSTMENT';

export interface LedgerEntry {
  id: string;
  entryNumber: string; // e.g. "LED-2026-0042"
  investorId: string;
  investorName: string;
  timestamp: string;
  type: LedgerEntryType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  newCapitalBefore: number;
  newCapitalAfter: number;
  recoveryBefore: number;
  recoveryAfter: number;
  description: string;
  referenceId?: string; // e.g., withdrawal request ID or receipt ID
  performedBy: string; // e.g. "Trader Admin (Tolib I.)"
}

export type WithdrawalStatus =
  | 'PENDING'
  | 'SENT' // Marked as sent ("To'landi"), triggers official receipt & lock overlay
  | 'PROOF_SUBMITTED' // Investor submitted receipt screenshot & video
  | 'COMPLETED' // Admin verified proof and finalized deduction
  | 'REJECTED'
  | 'EXPIRED'; // Passed 24-hour SLA without action

export interface WithdrawalRequest {
  id: string;
  requestNumber: string; // e.g. "WTH-2026-018"
  investorId: string;
  investorName: string;
  amount: number;
  deductedFromNewCapital: number;
  deductedFromRecovering: number;
  method: PaymentMethod;
  destinationDetails: string;
  status: WithdrawalStatus;
  requestedAt: string;
  slaDeadline: string; // 24 hours from requestedAt
  sentAt?: string;
  proofSubmittedAt?: string;
  completedAt?: string;
  receiptId?: string;
  rejectionReason?: string;
  proofArtifacts?: {
    receiptScreenshotUrl?: string;
    videoConfirmationUrl?: string;
    investorNotes?: string;
    submittedAt: string;
  };
}

export type ReceiptStatus = 'ISSUED' | 'PROOF_SUBMITTED' | 'CONFIRMED';

export interface OfficialReceipt {
  id: string;
  receiptNumber: string; // e.g. "CHK-4819"
  withdrawalId: string;
  investorId: string;
  investorName: string;
  passportId: string;
  amount: number;
  method: PaymentMethod;
  maskedAddress: string;
  issuedAt: string;
  confirmedAt?: string;
  status: ReceiptStatus;
  verificationCode: string; // e.g. "A3F2-9B01-C7D4-11E6"
  digitalSignature: string; // e.g. "HMAC-SHA256:7e82b...9a41c"
  verificationUrl: string;
  proofNote: string; // e.g. "Olinganlik dalili: Video + screenshot tasdiqlangan"
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  category: 'INVESTOR' | 'LEDGER' | 'WITHDRAWAL' | 'RECEIPT' | 'SYSTEM' | 'SECURITY';
  targetId: string;
  targetName: string;
  details: string;
  beforeState?: Record<string, any>;
  afterState?: Record<string, any>;
  ipAddress: string;
}

export interface PushNotification {
  id: string;
  timestamp: string;
  investorId?: string; // null means broadcast / admin alert
  title: string;
  message: string;
  type: 'RECOVERY_UPDATE' | 'WITHDRAWAL_ALERT' | 'RECEIPT_ISSUED' | 'SYSTEM_ALERT' | 'PROFIT_DISTRIBUTION';
  read: boolean;
  actionLink?: string;
}

export interface MarketRate {
  symbol: 'XAUUSD' | 'EURUSD' | 'UZS/USD';
  displayName: string;
  price: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume: string;
  lastUpdated: string;
  sparkline: number[];
}

export interface TradeSessionAllocation {
  investorId: string;
  investorName: string;
  investorType: 'OLD' | 'NEW';
  balanceBefore: number;
  eligibleBalance?: number; // Capital amount eligible for profit share
  isEligible?: boolean; // Whether investor is eligible under fund rules
  eligibilityReason?: string; // Clear description of eligibility status
  weightPercent: number; // e.g. 24.5% of total pool
  allocatedShare: number; // e.g. $4,900.00
  balanceAfter: number;
  newCapitalBefore?: number;
  newCapitalAfter?: number;
  recoveryBefore: number;
  recoveryAfter: number;
}

export interface TradeSession {
  id: string;
  sessionNumber: string; // e.g. "SES-2026-001"
  date: string; // YYYY-MM-DD
  totalProfit: number; // e.g. 40,000
  investorPoolSharePercent: number; // 50%
  investorPoolAmount: number; // 20,000
  fundShareAmount: number; // 20,000
  totalEligibleBalance?: number; // Sum of balances eligible for profit sharing
  distributionMode?: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY';
  status: 'ACTIVE' | 'CORRECTED' | 'REVERSED';
  notes: string;
  allocations: TradeSessionAllocation[];
  createdAt: string;
  updatedAt: string;
  reversalReason?: string;
  previousProfit?: number;
}

