import {
  Transaction,
  MetricsOverview,
  TrendPoint,
  MethodBreakdown,
  IssuerBreakdown,
  FailureReasonBreakdown,
  PaymentMethod,
  IssuerBank,
  FailureCategory,
} from "../types/transaction.js";
import { dbService } from "./databaseService.js";

export class AnalyticsService {
  public getOverview(transactions?: Transaction[]): MetricsOverview {
    const txs = transactions || dbService.getAllRawTransactions();
    const totalTransactions = txs.length;

    let successfulPayments = 0;
    let failedPayments = 0;
    let abandonedCheckouts = 0;
    let pendingPayments = 0;
    let revenueProcessedInr = 0;
    let revenueLostInr = 0;

    let minTime = Infinity;
    let maxTime = -Infinity;

    for (const tx of txs) {
      const txTime = new Date(tx.createdAt).getTime();
      if (txTime < minTime) minTime = txTime;
      if (txTime > maxTime) maxTime = txTime;

      if (tx.status === "SUCCESS") {
        successfulPayments++;
        revenueProcessedInr += tx.amountInr;
      } else if (tx.status === "FAILED") {
        failedPayments++;
        revenueLostInr += tx.amountInr;
      } else if (tx.status === "ABANDONED") {
        abandonedCheckouts++;
        revenueLostInr += tx.amountInr;
      } else if (tx.status === "PENDING") {
        pendingPayments++;
      }
    }

    const totalResolved = successfulPayments + failedPayments + abandonedCheckouts;
    const successRatePct = totalResolved > 0 ? Number(((successfulPayments / totalResolved) * 100).toFixed(1)) : 0;
    const failureRatePct = totalResolved > 0 ? Number((((failedPayments + abandonedCheckouts) / totalResolved) * 100).toFixed(1)) : 0;

    // Revenue at risk comprises failed + abandoned checkouts (where recovery is actionable)
    const revenueAtRiskInr = revenueLostInr;
    // Estimated recoverable revenue based on recoverable heuristics (e.g. ~52.8% estimated recovery potential across intent buckets)
    const estimatedRecoverableInr = Math.round(revenueAtRiskInr * 0.528);

    return {
      totalTransactions,
      successfulPayments,
      failedPayments,
      abandonedCheckouts,
      pendingPayments,
      successRatePct,
      failureRatePct,
      revenueProcessedInr: Math.round(revenueProcessedInr),
      revenueLostInr: Math.round(revenueLostInr),
      revenueAtRiskInr: Math.round(revenueAtRiskInr),
      estimatedRecoverableInr,
      currency: "INR",
      isSynthetic: true,
      timeRange: {
        from: minTime !== Infinity ? new Date(minTime).toISOString() : new Date().toISOString(),
        to: maxTime !== -Infinity ? new Date(maxTime).toISOString() : new Date().toISOString(),
      },
    };
  }

  public getTrends(bucketHours = 2): TrendPoint[] {
    const txs = dbService.getAllRawTransactions();
    if (txs.length === 0) return [];

    // Group transactions into time buckets
    const bucketMs = bucketHours * 3600 * 1000;
    const buckets = new Map<number, {
      totalCount: number;
      successCount: number;
      failureCount: number;
      revenueProcessedInr: number;
      revenueLostInr: number;
    }>();

    for (const tx of txs) {
      const time = new Date(tx.createdAt).getTime();
      const bucketKey = Math.floor(time / bucketMs) * bucketMs;

      if (!buckets.has(bucketKey)) {
        buckets.set(bucketKey, {
          totalCount: 0,
          successCount: 0,
          failureCount: 0,
          revenueProcessedInr: 0,
          revenueLostInr: 0,
        });
      }

      const b = buckets.get(bucketKey)!;
      b.totalCount++;
      if (tx.status === "SUCCESS") {
        b.successCount++;
        b.revenueProcessedInr += tx.amountInr;
      } else if (tx.status === "FAILED" || tx.status === "ABANDONED") {
        b.failureCount++;
        b.revenueLostInr += tx.amountInr;
      }
    }

    const sortedKeys = Array.from(buckets.keys()).sort((a, b) => a - b);

    return sortedKeys.map((key) => {
      const b = buckets.get(key)!;
      const totalResolved = b.successCount + b.failureCount;
      const failureRatePct = totalResolved > 0 ? Number(((b.failureCount / totalResolved) * 100).toFixed(1)) : 0;

      return {
        timestamp: new Date(key).toISOString(),
        totalCount: b.totalCount,
        successCount: b.successCount,
        failureCount: b.failureCount,
        revenueProcessedInr: Math.round(b.revenueProcessedInr),
        revenueLostInr: Math.round(b.revenueLostInr),
        failureRatePct,
      };
    });
  }

  public getMethodBreakdown(): MethodBreakdown[] {
    const txs = dbService.getAllRawTransactions();
    const methods: PaymentMethod[] = ["UPI", "CREDIT_CARD", "DEBIT_CARD", "NETBANKING", "WALLET", "EMI"];

    const map = new Map<PaymentMethod, MethodBreakdown>();
    for (const m of methods) {
      map.set(m, {
        method: m,
        totalCount: 0,
        successCount: 0,
        failureCount: 0,
        failureRatePct: 0,
        totalVolumeInr: 0,
        lostVolumeInr: 0,
      });
    }

    for (const tx of txs) {
      const entry = map.get(tx.paymentMethod);
      if (!entry) continue;

      entry.totalCount++;
      entry.totalVolumeInr += tx.amountInr;

      if (tx.status === "SUCCESS") {
        entry.successCount++;
      } else if (tx.status === "FAILED" || tx.status === "ABANDONED") {
        entry.failureCount++;
        entry.lostVolumeInr += tx.amountInr;
      }
    }

    return Array.from(map.values()).map((entry) => {
      const totalResolved = entry.successCount + entry.failureCount;
      entry.failureRatePct = totalResolved > 0 ? Number(((entry.failureCount / totalResolved) * 100).toFixed(1)) : 0;
      entry.totalVolumeInr = Math.round(entry.totalVolumeInr);
      entry.lostVolumeInr = Math.round(entry.lostVolumeInr);
      return entry;
    });
  }

  public getIssuerBreakdown(): IssuerBreakdown[] {
    const txs = dbService.getAllRawTransactions();
    const banks: IssuerBank[] = ["HDFC", "ICICI", "SBI", "AXIS", "KOTAK", "YES_BANK", "PNB", "BOB"];

    const map = new Map<IssuerBank, { total: number; failed: number; lost: number }>();
    for (const b of banks) {
      map.set(b, { total: 0, failed: 0, lost: 0 });
    }

    for (const tx of txs) {
      const entry = map.get(tx.issuerBank);
      if (!entry) continue;

      entry.total++;
      if (tx.status === "FAILED" || tx.status === "ABANDONED") {
        entry.failed++;
        entry.lost++;
      }
    }

    return Array.from(map.entries()).map(([bank, data]) => {
      const failureRatePct = data.total > 0 ? Number(((data.failed / data.total) * 100).toFixed(1)) : 0;
      return {
        bank,
        totalCount: data.total,
        failureCount: data.failed,
        failureRatePct,
        lostVolumeInr: Math.round(data.lost),
        isDegraded: failureRatePct >= 35.0, // Highlight if failure rate is abnormal
      };
    }).sort((a, b) => b.failureCount - a.failureCount);
  }

  public getFailureReasonBreakdown(): FailureReasonBreakdown[] {
    const txs = dbService.getAllRawTransactions();
    const failedTxs = txs.filter((t) => t.status === "FAILED" || t.status === "ABANDONED");
    const totalFailed = failedTxs.length;

    const map = new Map<FailureCategory, { count: number; lostVolumeInr: number; sampleReason: string }>();

    for (const tx of failedTxs) {
      const cat = tx.failureCategory || "TECHNICAL_TIMEOUT";
      if (!map.has(cat)) {
        map.set(cat, {
          count: 0,
          lostVolumeInr: 0,
          sampleReason: tx.failureReason || "Uncategorized transaction failure",
        });
      }
      const item = map.get(cat)!;
      item.count++;
      item.lostVolumeInr += tx.amountInr;
    }

    return Array.from(map.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      lostVolumeInr: Math.round(data.lostVolumeInr),
      percentageOfFailures: totalFailed > 0 ? Number(((data.count / totalFailed) * 100).toFixed(1)) : 0,
      primaryCause: data.sampleReason,
    })).sort((a, b) => b.count - a.count);
  }
}

export const analyticsService = new AnalyticsService();
