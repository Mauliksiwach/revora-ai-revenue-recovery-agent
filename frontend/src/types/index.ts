export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "ABANDONED" | "REFUNDED";

export type PaymentMethod =
  | "UPI"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "NETBANKING"
  | "WALLET"
  | "EMI";

export type IssuerBank =
  | "HDFC"
  | "ICICI"
  | "SBI"
  | "AXIS"
  | "KOTAK"
  | "YES_BANK"
  | "PNB"
  | "BOB"
  | "OTHER";

export type FailureCategory =
  | "ISSUER_OUTAGE"
  | "CUSTOMER_AUTHENTICATION"
  | "INSUFFICIENT_FUNDS"
  | "TECHNICAL_TIMEOUT"
  | "CHECKOUT_ABANDONMENT"
  | "MANDATE_SUBSCRIPTION_ERROR"
  | "CARD_LIMIT_EXCEEDED"
  | "NETWORK_DROP";

export interface Transaction {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  amountInr: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  issuerBank: IssuerBank;
  failureCategory?: FailureCategory;
  failureCode?: string;
  failureReason?: string;
  retryCount: number;
  isSubscription: boolean;
  isSynthetic: boolean;
  errorPayload?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface MetricsOverview {
  totalTransactions: number;
  successfulPayments: number;
  failedPayments: number;
  abandonedCheckouts: number;
  pendingPayments: number;
  successRatePct: number;
  failureRatePct: number;
  revenueProcessedInr: number;
  revenueLostInr: number;
  revenueAtRiskInr: number;
  estimatedRecoverableInr: number;
  currency: string;
  isSynthetic: boolean;
  timeRange: {
    from: string;
    to: string;
  };
}

export interface TrendPoint {
  timestamp: string;
  totalCount: number;
  successCount: number;
  failureCount: number;
  revenueProcessedInr: number;
  revenueLostInr: number;
  failureRatePct: number;
}

export interface MethodBreakdown {
  method: PaymentMethod;
  totalCount: number;
  successCount: number;
  failureCount: number;
  failureRatePct: number;
  totalVolumeInr: number;
  lostVolumeInr: number;
}

export interface IssuerBreakdown {
  bank: IssuerBank;
  totalCount: number;
  failureCount: number;
  failureRatePct: number;
  lostVolumeInr: number;
  isDegraded: boolean;
}

export interface FailureReasonBreakdown {
  category: FailureCategory;
  count: number;
  lostVolumeInr: number;
  percentageOfFailures: number;
  primaryCause: string;
}

export interface BreakdownsData {
  paymentMethods: MethodBreakdown[];
  issuers: IssuerBreakdown[];
  failureReasons: FailureReasonBreakdown[];
}

export interface TransactionFilterState {
  page: number;
  limit: number;
  search: string;
  status: string;
  method: string;
  issuer: string;
  failureCategory: string;
  sortBy: "createdAt" | "amountInr" | "retryCount";
  sortOrder: "asc" | "desc";
}
