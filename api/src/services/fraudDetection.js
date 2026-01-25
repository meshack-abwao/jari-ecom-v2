// ============================================================================
// FRAUD DETECTION SERVICE
// Phase F1: Security & Fraud Detection
// ============================================================================

/**
 * Fraud detection for Jari.Ecom transactions
 * 
 * Phases:
 * - Beta (0-50 merchants): Manual review, email alerts
 * - Growth (50-500): Automated velocity checks, flagging
 * - Scale (500+): ML-based scoring (future)
 */

// Risk levels
export const RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

// Flag types
export const FLAG_TYPES = {
  HIGH_AMOUNT: 'HIGH_AMOUNT',
  HIGH_FREQUENCY: 'HIGH_FREQUENCY',
  NEW_MERCHANT_HIGH_VALUE: 'NEW_MERCHANT_HIGH_VALUE',
  UNUSUAL_PATTERN: 'UNUSUAL_PATTERN',
  MULTIPLE_FAILED_PAYMENTS: 'MULTIPLE_FAILED_PAYMENTS',
  HIGH_REFUND_RATE: 'HIGH_REFUND_RATE',
  VELOCITY_SPIKE: 'VELOCITY_SPIKE'
};

// Thresholds (configurable per phase)
const THRESHOLDS = {
  beta: {
    highAmountMultiplier: 5,        // 5x average = flag
    maxTransactionsPerHour: 20,
    newMerchantDays: 14,
    newMerchantHighValue: 50000,
    maxFailedPayments24h: 5,
    refundRateWarning: 0.10,        // 10%
    refundRateCritical: 0.20        // 20%
  },
  growth: {
    highAmountMultiplier: 3,
    maxTransactionsPerHour: 15,
    newMerchantDays: 7,
    newMerchantHighValue: 30000,
    maxFailedPayments24h: 3,
    refundRateWarning: 0.05,
    refundRateCritical: 0.10
  },
  scale: {
    highAmountMultiplier: 2.5,
    maxTransactionsPerHour: 10,
    newMerchantDays: 7,
    newMerchantHighValue: 20000,
    maxFailedPayments24h: 3,
    refundRateWarning: 0.03,
    refundRateCritical: 0.05
  }
};

/**
 * Analyze a transaction for fraud signals
 */
export function analyzeTransaction(transaction, merchant, recentActivity) {
  const flags = [];
  const phase = getCurrentPhase();
  const thresholds = THRESHOLDS[phase];
  
  // 1. High Amount Check
  if (merchant.avg_transaction_amount && merchant.avg_transaction_amount > 0) {
    if (transaction.amount > merchant.avg_transaction_amount * thresholds.highAmountMultiplier) {
      flags.push({
        type: FLAG_TYPES.HIGH_AMOUNT,
        severity: 'medium',
        detail: `Amount ${transaction.amount} is ${(transaction.amount / merchant.avg_transaction_amount).toFixed(1)}x average`
      });
    }
  }
  
  // 2. Velocity/Frequency Check
  const recentTxCount = recentActivity?.transactionsLastHour || 0;
  if (recentTxCount > thresholds.maxTransactionsPerHour) {
    flags.push({
      type: FLAG_TYPES.HIGH_FREQUENCY,
      severity: 'high',
      detail: `${recentTxCount} transactions in last hour (limit: ${thresholds.maxTransactionsPerHour})`
    });
  }
  
  // 3. New Merchant + High Value
  const merchantAgeDays = merchant.created_at 
    ? (Date.now() - new Date(merchant.created_at).getTime()) / (1000 * 60 * 60 * 24)
    : 999;
    
  if (merchantAgeDays < thresholds.newMerchantDays && transaction.amount > thresholds.newMerchantHighValue) {
    flags.push({
      type: FLAG_TYPES.NEW_MERCHANT_HIGH_VALUE,
      severity: 'high',
      detail: `Merchant is ${Math.floor(merchantAgeDays)} days old with KES ${transaction.amount} transaction`
    });
  }
  
  // 4. Multiple Failed Payments
  const failedPayments = recentActivity?.failedPayments24h || 0;
  if (failedPayments >= thresholds.maxFailedPayments24h) {
    flags.push({
      type: FLAG_TYPES.MULTIPLE_FAILED_PAYMENTS,
      severity: 'medium',
      detail: `${failedPayments} failed payments in 24 hours`
    });
  }
  
  // 5. Velocity Spike (sudden increase vs normal)
  const normalHourlyRate = merchant.avg_hourly_transactions || 2;
  if (recentTxCount > normalHourlyRate * 5) {
    flags.push({
      type: FLAG_TYPES.VELOCITY_SPIKE,
      severity: 'high',
      detail: `${recentTxCount} txns/hour vs normal ${normalHourlyRate}/hour`
    });
  }
  
  // Calculate overall risk level
  const riskLevel = calculateRiskLevel(flags);
  
  return {
    transactionId: transaction.id,
    storeId: merchant.id,
    flags,
    riskLevel,
    requiresReview: riskLevel === RISK_LEVELS.HIGH || riskLevel === RISK_LEVELS.CRITICAL,
    autoBlock: riskLevel === RISK_LEVELS.CRITICAL && phase !== 'beta',
    timestamp: new Date().toISOString()
  };
}

/**
 * Analyze merchant for ongoing fraud patterns
 */
export function analyzeMerchant(merchant, metrics) {
  const flags = [];
  const phase = getCurrentPhase();
  const thresholds = THRESHOLDS[phase];
  
  // Refund rate check
  const refundRate = metrics.totalRefunds / Math.max(metrics.totalOrders, 1);
  if (refundRate >= thresholds.refundRateCritical) {
    flags.push({
      type: FLAG_TYPES.HIGH_REFUND_RATE,
      severity: 'critical',
      detail: `Refund rate ${(refundRate * 100).toFixed(1)}% exceeds critical threshold`
    });
  } else if (refundRate >= thresholds.refundRateWarning) {
    flags.push({
      type: FLAG_TYPES.HIGH_REFUND_RATE,
      severity: 'medium',
      detail: `Refund rate ${(refundRate * 100).toFixed(1)}% exceeds warning threshold`
    });
  }
  
  // Complaint rate (if complaint system active)
  if (metrics.totalComplaints && metrics.totalOrders > 10) {
    const complaintRate = metrics.totalComplaints / metrics.totalOrders;
    if (complaintRate > 0.05) {
      flags.push({
        type: 'HIGH_COMPLAINT_RATE',
        severity: complaintRate > 0.10 ? 'critical' : 'high',
        detail: `Complaint rate ${(complaintRate * 100).toFixed(1)}%`
      });
    }
  }
  
  return {
    storeId: merchant.id,
    flags,
    riskLevel: calculateRiskLevel(flags),
    recommendedAction: getRecommendedAction(flags),
    timestamp: new Date().toISOString()
  };
}

/**
 * Calculate overall risk level from flags
 */
function calculateRiskLevel(flags) {
  if (flags.length === 0) return RISK_LEVELS.LOW;
  
  const hasCritical = flags.some(f => f.severity === 'critical');
  const highCount = flags.filter(f => f.severity === 'high').length;
  const mediumCount = flags.filter(f => f.severity === 'medium').length;
  
  if (hasCritical) return RISK_LEVELS.CRITICAL;
  if (highCount >= 2) return RISK_LEVELS.CRITICAL;
  if (highCount >= 1) return RISK_LEVELS.HIGH;
  if (mediumCount >= 2) return RISK_LEVELS.MEDIUM;
  
  return RISK_LEVELS.LOW;
}

/**
 * Get recommended action based on flags
 */
function getRecommendedAction(flags) {
  const riskLevel = calculateRiskLevel(flags);
  
  switch (riskLevel) {
    case RISK_LEVELS.CRITICAL:
      return 'SUSPEND_REVIEW';  // Suspend and require manual review
    case RISK_LEVELS.HIGH:
      return 'MANUAL_REVIEW';   // Flag for review but don't suspend
    case RISK_LEVELS.MEDIUM:
      return 'MONITOR';         // Add to watchlist
    default:
      return 'NONE';
  }
}

/**
 * Get current operational phase based on merchant count
 * (In production, this would query the database)
 */
function getCurrentPhase() {
  // TODO: Query actual merchant count
  // For now, default to beta
  return 'beta';
}

export default {
  analyzeTransaction,
  analyzeMerchant,
  RISK_LEVELS,
  FLAG_TYPES
};
