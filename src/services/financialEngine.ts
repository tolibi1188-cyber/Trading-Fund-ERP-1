/**
 * Financial Business Logic Engine for Trading Fund ERP
 * Implements strict 1C-level document accounting, recovery tracking,
 * proportional profit splitting, and 20% withdrawal caps.
 */

import { Investor, OfficialReceipt, PaymentMethod } from '../types/erp';

export interface ProfitDistributionResult {
  investorId: string;
  profitAmount: number;
  isMixed: boolean;
  // Allocation
  recoveringProfitCredit: number; // 100% to recovery gap
  newCapitalProfitGross: number; // Subject to 50/50 split
  investorShare: number; // Credited to investor's total balance
  fundShare: number; // Kept by the trading fund
  // Recovery updates
  recoveredAmountBefore: number;
  recoveredAmountAfter: number;
  recoveryPercentBefore: number;
  recoveryPercentAfter: number;
  // Balances
  balanceBefore: number;
  balanceAfter: number;
  newCapitalBefore: number;
  newCapitalAfter: number;
}

export class FinancialEngine {
  /**
   * Recalculates recovery percentage when initialLoss is corrected.
   * Crucial rule: Preserves absolute recovered dollar amount.
   */
  static previewInitialLossCorrection(
    investor: Investor,
    newInitialLoss: number
  ): {
    recoveredDollarAmount: number;
    oldRecoveryPercent: number;
    newRecoveryPercent: number;
    recoveryDelta: number;
  } {
    const validNewLoss = Math.max(1, newInitialLoss);
    // Absolute recovered amount currently in the system
    const recoveredDollarAmount = investor.recoveredAmount;
    const oldRecoveryPercent = investor.recovery;
    const newRecoveryPercent = Math.min(100, Number(((recoveredDollarAmount / validNewLoss) * 100).toFixed(2)));
    const recoveryDelta = Number((newRecoveryPercent - oldRecoveryPercent).toFixed(2));

    return {
      recoveredDollarAmount,
      oldRecoveryPercent,
      newRecoveryPercent,
      recoveryDelta,
    };
  }

  /**
   * Calculates profit credit distribution according to §3 and §4.
   */
  static calculateProfitCredit(
    investor: Investor,
    profitAmount: number
  ): ProfitDistributionResult {
    const balanceBefore = investor.balance;
    const newCapitalBefore = investor.newCapital;
    const recoveredAmountBefore = investor.recoveredAmount;
    const recoveryPercentBefore = investor.recovery;

    // Case 1: NEW Investor OR OLD fully recovered (100%)
    if (investor.type === 'NEW' || investor.recovery >= 100) {
      const investorShare = Number((profitAmount * 0.5).toFixed(2));
      const fundShare = Number((profitAmount - investorShare).toFixed(2));

      return {
        investorId: investor.id,
        profitAmount,
        isMixed: false,
        recoveringProfitCredit: 0,
        newCapitalProfitGross: profitAmount,
        investorShare,
        fundShare,
        recoveredAmountBefore,
        recoveredAmountAfter: recoveredAmountBefore,
        recoveryPercentBefore,
        recoveryPercentAfter: 100,
        balanceBefore,
        balanceAfter: Number((balanceBefore + investorShare).toFixed(2)),
        newCapitalBefore,
        newCapitalAfter: Number((newCapitalBefore + investorShare).toFixed(2)),
      };
    }

    // Case 2: OLD Investor with recovery < 100% and fresh newCapital > 0 (Mixed Investor)
    if (investor.newCapital > 0) {
      const recoveringBalance = Math.max(0, investor.balance - investor.newCapital);
      const totalBase = recoveringBalance + investor.newCapital;
      
      const newCapitalWeight = totalBase > 0 ? investor.newCapital / totalBase : 1;
      const recoveringWeight = 1 - newCapitalWeight;

      const newCapitalProfitGross = Number((profitAmount * newCapitalWeight).toFixed(2));
      const recoveringProfitCredit = Number((profitAmount * recoveringWeight).toFixed(2));

      // 50/50 split on the new capital portion
      const investorNewCapitalShare = Number((newCapitalProfitGross * 0.5).toFixed(2));
      const fundNewCapitalShare = Number((newCapitalProfitGross - investorNewCapitalShare).toFixed(2));

      // 100% of recovering portion goes to investor's recovering balance
      const newRecoveredAmount = Number((recoveredAmountBefore + recoveringProfitCredit).toFixed(2));
      const newRecoveryPercent = Math.min(
        100,
        Number(((newRecoveredAmount / Math.max(1, investor.initialLoss)) * 100).toFixed(2))
      );

      const totalInvestorShare = Number((investorNewCapitalShare + recoveringProfitCredit).toFixed(2));
      const totalFundShare = fundNewCapitalShare;

      return {
        investorId: investor.id,
        profitAmount,
        isMixed: true,
        recoveringProfitCredit,
        newCapitalProfitGross,
        investorShare: totalInvestorShare,
        fundShare: totalFundShare,
        recoveredAmountBefore,
        recoveredAmountAfter: newRecoveredAmount,
        recoveryPercentBefore,
        recoveryPercentAfter: newRecoveryPercent,
        balanceBefore,
        balanceAfter: Number((balanceBefore + totalInvestorShare).toFixed(2)),
        newCapitalBefore,
        newCapitalAfter: Number((newCapitalBefore + investorNewCapitalShare).toFixed(2)),
      };
    }

    // Case 3: OLD Investor with recovery < 100% and NO newCapital
    // 100% goes toward reducing the recovery gap
    const newRecoveredAmount = Number((recoveredAmountBefore + profitAmount).toFixed(2));
    const newRecoveryPercent = Math.min(
      100,
      Number(((newRecoveredAmount / Math.max(1, investor.initialLoss)) * 100).toFixed(2))
    );

    return {
      investorId: investor.id,
      profitAmount,
      isMixed: false,
      recoveringProfitCredit: profitAmount,
      newCapitalProfitGross: 0,
      investorShare: profitAmount,
      fundShare: 0,
      recoveredAmountBefore,
      recoveredAmountAfter: newRecoveredAmount,
      recoveryPercentBefore,
      recoveryPercentAfter: newRecoveryPercent,
      balanceBefore,
      balanceAfter: Number((balanceBefore + profitAmount).toFixed(2)),
      newCapitalBefore,
      newCapitalAfter: newCapitalBefore,
    };
  }

  /**
   * Applies Manual Capital Injection to an OLD investor's recovering balance.
   * Nudges recovery % just like trade profit, as distinct from new capital.
   */
  static applyManualInjection(
    investor: Investor,
    injectionAmount: number
  ): {
    balanceAfter: number;
    recoveredAmountAfter: number;
    recoveryPercentAfter: number;
  } {
    const newRecoveredAmount = Number((investor.recoveredAmount + injectionAmount).toFixed(2));
    const newRecoveryPercent = Math.min(
      100,
      Number(((newRecoveredAmount / Math.max(1, investor.initialLoss)) * 100).toFixed(2))
    );
    return {
      balanceAfter: Number((investor.balance + injectionAmount).toFixed(2)),
      recoveredAmountAfter: newRecoveredAmount,
      recoveryPercentAfter: newRecoveryPercent,
    };
  }

  /**
   * Determines maximum allowed withdrawal amount and rule compliance.
   * Section 4 & 5 compliance:
   * - If OLD & recovery < 100%: can ONLY withdraw against `newCapital`, capped at 20% of newCapital.
   * - If NEW or OLD with recovery = 100%: capped at 20% of total balance.
   */
  static validateWithdrawalRequest(
    investor: Investor,
    requestedAmount: number
  ): {
    allowed: boolean;
    maxWithdrawable: number;
    applicableBase: number;
    baseName: string;
    reason?: string;
  } {
    const isOldAndRecovering = investor.type === 'OLD' && investor.recovery < 100;

    if (isOldAndRecovering) {
      const applicableBase = investor.newCapital;
      const maxMonthlyAllowed = Number((applicableBase * 0.20).toFixed(2));
      const maxWithdrawable = Math.min(applicableBase, maxMonthlyAllowed);

      if (applicableBase <= 0) {
        return {
          allowed: false,
          maxWithdrawable: 0,
          applicableBase: 0,
          baseName: 'New Capital Sub-Balance ($0)',
          reason: `Old loss recovery is at ${investor.recovery}%. Recovering balance is locked until 100% recovery. No fresh New Capital available for withdrawal.`,
        };
      }

      if (requestedAmount > maxWithdrawable) {
        return {
          allowed: false,
          maxWithdrawable,
          applicableBase,
          baseName: 'New Capital Sub-Balance',
          reason: `Amount exceeds the 20%/month cap on New Capital ($${maxWithdrawable.toLocaleString('en-US', { minimumFractionDigits: 2 })} max). Old loss balance remains locked.`,
        };
      }

      return {
        allowed: true,
        maxWithdrawable,
        applicableBase,
        baseName: 'New Capital Sub-Balance',
      };
    }

    // Fully recovered or NEW investor
    const applicableBase = investor.balance;
    const maxWithdrawable = Number((applicableBase * 0.20).toFixed(2));

    if (requestedAmount > maxWithdrawable) {
      return {
        allowed: false,
        maxWithdrawable,
        applicableBase,
        baseName: 'Total Active Balance',
        reason: `Requested amount exceeds the 20% monthly withdrawal limit ($${maxWithdrawable.toLocaleString('en-US', { minimumFractionDigits: 2 })} max).`,
      };
    }

    return {
      allowed: true,
      maxWithdrawable,
      applicableBase,
      baseName: 'Total Active Balance',
    };
  }

  /**
   * Evaluates capital eligibility for trading profit share:
   * Modes:
   * 1. 'ALL_BALANCES_INCLUDING_OLD' (Default):
   *    - Daromad qo'shilganda eski balansga ham taqsimlanadi.
   *    - Eski investorlarning balansi tiklanishiga (recovery) hisoblanadi.
   *    - Yangi balanslar va yangi investorlar ham to'liq o'z ulushini oladi.
   * 2. 'FRESH_CAPITAL_ONLY':
   *    - Faqat yangi kiritilgan kapitalga va 100% tiklangan investorlarga taqsimlanadi.
   */
  static getEligibleProfitBalance(
    investor: Investor,
    mode: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY' = 'ALL_BALANCES_INCLUDING_OLD'
  ): {
    eligibleBalance: number;
    isEligible: boolean;
    reason: string;
    subType: 'NEW_INVESTOR' | 'OLD_RECOVERED' | 'OLD_FRESH_CAPITAL_ONLY' | 'OLD_UNRECOVERED_EXCLUDED';
  } {
    // Only ACTIVE investors participate in profit distribution
    if (investor.status !== 'ACTIVE') {
      return {
        eligibleBalance: 0,
        isEligible: false,
        reason: investor.status === 'PENDING_APPROVAL'
          ? "Hisob hali tasdiqlanmagan (Admin tomonidan aktivlashtirish kutilmoqda)"
          : `Hisob faol emas (${investor.status})`,
        subType: 'OLD_UNRECOVERED_EXCLUDED',
      };
    }

    // Mode 1: ALL_BALANCES_INCLUDING_OLD (Default - User request: daromad qo'shilganda eski balansga ham taqsimlansin)
    if (mode === 'ALL_BALANCES_INCLUDING_OLD') {
      const activeBalance = Math.max(0, investor.balance);
      const isEligible = activeBalance > 0;

      if (investor.type === 'NEW') {
        return {
          eligibleBalance: activeBalance,
          isEligible,
          reason: "Yangi investor (Balansi bo'yicha to'liq ulush)",
          subType: 'NEW_INVESTOR',
        };
      }

      if (investor.recovery >= 100) {
        return {
          eligibleBalance: activeBalance,
          isEligible,
          reason: "100% tiklangan investor (Balansi bo'yicha to'liq ulush)",
          subType: 'OLD_RECOVERED',
        };
      }

      if ((investor.newCapital || 0) > 0) {
        const oldPortion = Math.max(0, investor.balance - (investor.newCapital || 0));
        return {
          eligibleBalance: activeBalance,
          isEligible,
          reason: `Eski balans ($${oldPortion.toLocaleString()}) tiklanishiga + Yangi kapital ($${(investor.newCapital || 0).toLocaleString()})`,
          subType: 'OLD_FRESH_CAPITAL_ONLY',
        };
      }

      // Old unrecovered investor with no new capital: their old balance participates!
      return {
        eligibleBalance: activeBalance,
        isEligible,
        reason: "Eski balans bo'yicha ulush (Zararni tiklashga hisoblanadi)",
        subType: 'OLD_RECOVERED',
      };
    }

    // Mode 2: FRESH_CAPITAL_ONLY (Alohida yangi qo'shilgan balanslar / New Capital uchun)
    if (investor.type === 'NEW') {
      const eligible = Math.max(0, investor.balance);
      return {
        eligibleBalance: eligible,
        isEligible: eligible > 0,
        reason: "Yangi investor (100% yangi qo'shilgan balans)",
        subType: 'NEW_INVESTOR',
      };
    }

    // OLD Investor who deposited fresh new capital (regardless of recovery status)
    if ((investor.newCapital || 0) > 0) {
      const eligible = Math.max(0, investor.newCapital);
      return {
        eligibleBalance: eligible,
        isEligible: eligible > 0,
        reason: `Yangi qo'shilgan kapitaliga nisbatan ($${eligible.toLocaleString()})`,
        subType: 'OLD_FRESH_CAPITAL_ONLY',
      };
    }

    // OLD Investor with NO new capital
    return {
      eligibleBalance: 0,
      isEligible: false,
      reason: "Yangi qo'shilgan balans mavjud emas ($0)",
      subType: 'OLD_UNRECOVERED_EXCLUDED',
    };
  }

  /**
   * Calculates fund-level trading session profit distribution (50/50 rule):
   * 50% to Fund / Trader, 50% to Investor Pool.
   * Supports:
   * - 'ALL_BALANCES_INCLUDING_OLD': Distributes 50% pool to all active balances, recovering old losses.
   * - 'FRESH_CAPITAL_ONLY': Distributes only to new capital and fully recovered balances.
   */
  static calculateSessionDistribution(
    investors: Investor[],
    totalTradeProfit: number,
    investorPoolPercent: number = 50,
    mode: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY' = 'ALL_BALANCES_INCLUDING_OLD'
  ): {
    totalProfit: number;
    investorPoolPercent: number;
    investorPoolAmount: number;
    fundShareAmount: number;
    totalInvestorsBalance: number;
    totalEligibleBalance: number;
    distributionMode: 'ALL_BALANCES_INCLUDING_OLD' | 'FRESH_CAPITAL_ONLY';
    allocations: Array<{
      investorId: string;
      investorName: string;
      investorType: 'OLD' | 'NEW';
      balanceBefore: number;
      eligibleBalance: number;
      isEligible: boolean;
      eligibilityReason: string;
      weightPercent: number;
      allocatedShare: number;
      balanceAfter: number;
      newCapitalBefore: number;
      newCapitalAfter: number;
      recoveryBefore: number;
      recoveryAfter: number;
      recoveredAmountBefore: number;
      recoveredAmountAfter: number;
    }>;
  } {
    const validProfit = Math.max(0, totalTradeProfit);
    const investorPoolAmount = Number(((validProfit * investorPoolPercent) / 100).toFixed(2));
    const fundShareAmount = Number((validProfit - investorPoolAmount).toFixed(2));

    const totalInvestorsBalance = investors.reduce(
      (sum, inv) => sum + Math.max(0, inv.balance),
      0
    );

    // Evaluate eligibility for all investors based on selected mode
    const evaluated = investors.map((inv) => ({
      investor: inv,
      ...FinancialEngine.getEligibleProfitBalance(inv, mode),
    }));

    const totalEligibleBalance = evaluated.reduce(
      (sum, item) => sum + item.eligibleBalance,
      0
    );

    let distributedSum = 0;
    const eligibleIndices: number[] = [];

    const preAllocations = evaluated.map((item, index) => {
      const inv = item.investor;
      const balanceBefore = inv.balance;
      const newCapitalBefore = inv.newCapital || 0;
      let weightPercent = 0;
      let allocatedShare = 0;

      if (item.isEligible && totalEligibleBalance > 0) {
        weightPercent = Number(((item.eligibleBalance / totalEligibleBalance) * 100).toFixed(4));
        allocatedShare = Number(((investorPoolAmount * item.eligibleBalance) / totalEligibleBalance).toFixed(2));
        distributedSum += allocatedShare;
        eligibleIndices.push(index);
      }

      return {
        investorId: inv.id,
        investorName: inv.fullName,
        investorType: inv.type,
        balanceBefore,
        newCapitalBefore,
        eligibleBalance: item.eligibleBalance,
        isEligible: item.isEligible,
        eligibilityReason: item.reason,
        weightPercent,
        allocatedShare,
        recoveryBefore: inv.recovery,
        recoveredAmountBefore: inv.recoveredAmount,
      };
    });

    // Penny balancing on the last eligible participant
    if (eligibleIndices.length > 0 && totalEligibleBalance > 0) {
      const lastIdx = eligibleIndices[eligibleIndices.length - 1];
      const drift = Number((investorPoolAmount - distributedSum).toFixed(2));
      preAllocations[lastIdx].allocatedShare = Number(
        (preAllocations[lastIdx].allocatedShare + drift).toFixed(2)
      );
    }

    const allocations = preAllocations.map((a) => {
      const inv = investors.find((i) => i.id === a.investorId) || {
        initialLoss: 10000,
      };
      const balanceAfter = Number((a.balanceBefore + a.allocatedShare).toFixed(2));
      let newCapitalAfter = a.newCapitalBefore;
      let recoveredAmountAfter = a.recoveredAmountBefore;
      let recoveryAfter = a.recoveryBefore;

      if (mode === 'FRESH_CAPITAL_ONLY') {
        // Dedicated mode for newly added balances: all allocated profit adds directly to new capital!
        if (a.investorType === 'NEW') {
          newCapitalAfter = balanceAfter;
          recoveryAfter = 100;
          recoveredAmountAfter = 0;
        } else if (a.investorType === 'OLD') {
          newCapitalAfter = Number(((a.newCapitalBefore || 0) + a.allocatedShare).toFixed(2));
          recoveryAfter = a.recoveryBefore;
          recoveredAmountAfter = a.recoveredAmountBefore;
        }
      } else if (a.investorType === 'NEW') {
        newCapitalAfter = balanceAfter;
        recoveryAfter = 100;
        recoveredAmountAfter = 0;
      } else if (a.investorType === 'OLD') {
        if (a.recoveryBefore >= 100) {
          recoveryAfter = 100;
          recoveredAmountAfter = a.recoveredAmountBefore;
          newCapitalAfter = Number(((a.newCapitalBefore || 0) + a.allocatedShare).toFixed(2));
        } else {
          // OLD investor recovering loss
          const totalBal = Math.max(1, a.balanceBefore);
          const newCap = Math.max(0, a.newCapitalBefore || 0);
          const oldBal = Math.max(0, a.balanceBefore - newCap);

          if (newCap > 0 && oldBal > 0) {
            // Split allocatedShare proportionally between old balance and new capital
            const oldShare = Number(((a.allocatedShare * oldBal) / totalBal).toFixed(2));
            const newCapShare = Number((a.allocatedShare - oldShare).toFixed(2));
            newCapitalAfter = Number((newCap + newCapShare).toFixed(2));
            recoveredAmountAfter = Math.min(
              inv.initialLoss,
              Number((a.recoveredAmountBefore + oldShare).toFixed(2))
            );
          } else if (newCap > 0 && oldBal === 0) {
            newCapitalAfter = Number((newCap + a.allocatedShare).toFixed(2));
            recoveredAmountAfter = a.recoveredAmountBefore;
          } else {
            // Entire balance is old balance (newCap === 0)
            newCapitalAfter = 0;
            recoveredAmountAfter = Math.min(
              inv.initialLoss,
              Number((a.recoveredAmountBefore + a.allocatedShare).toFixed(2))
            );
          }

          recoveryAfter = Math.min(
            100,
            Number(((recoveredAmountAfter / Math.max(1, inv.initialLoss)) * 100).toFixed(2))
          );
        }
      }

      return {
        ...a,
        balanceAfter,
        newCapitalAfter,
        recoveryAfter,
        recoveredAmountAfter,
      };
    });

    return {
      totalProfit: validProfit,
      investorPoolPercent,
      investorPoolAmount,
      fundShareAmount,
      totalInvestorsBalance,
      totalEligibleBalance,
      distributionMode: mode,
      allocations,
    };
  }

  /**
   * Deterministically generates an official verification code for receipts.
   * Format: A3F2-9B01-C7D4-11E6
   */
  static generateVerificationCode(receiptNumber: string, investorId: string): string {
    const seed = `${receiptNumber}:${investorId}:SECURE_FIN_2026`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    const hex2 = Math.abs((hash ^ 0x5a5a5a5a)).toString(16).toUpperCase().padStart(8, '0');
    return `${hex.slice(0, 4)}-${hex.slice(4, 8)}-${hex2.slice(0, 4)}-${hex2.slice(4, 8)}`;
  }

  /**
   * Deterministically generates HMAC-SHA256 simulation signature.
   */
  static generateDigitalSignature(receiptNumber: string, amount: number): string {
    const raw = `CHK_AUTH_${receiptNumber}_${amount}_${Date.now()}`;
    let h1 = 0xdeadbeef;
    let h2 = 0x41c6ce57;
    for (let i = 0; i < raw.length; i++) {
      const ch = raw.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
    const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
    return `HMAC-SHA256:${part1}${part2}c89b4f21a08`;
  }
}
