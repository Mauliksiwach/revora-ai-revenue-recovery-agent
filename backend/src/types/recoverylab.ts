export type StrategyType =
  | "DO_NOTHING"
  | "IMMEDIATE_NAIVE_RETRY"
  | "EMAIL_ONLY"
  | "WHATSAPP_DIRECT"
  | "PAYMENT_LINK_ONLY"
  | "REVORA_AI_ADAPTIVE";

export interface StrategySimulationResult {
  strategyType: StrategyType;
  name: string;
  description: string;
  recoveredRevenueInr: number;
  recoveryRatePct: number;
  contactsInitiatedCount: number;
  unnecessaryContactsPreventedCount: number;
  outreachCostInr: number;
  netRevenueRoiMultiplier: number;
  customerFrictionScore: "NONE" | "LOW" | "MODERATE" | "HIGH" | "SEVERE";
  isRecommended: boolean;
}

export interface SimulationParams {
  transactionCount?: number;
  outageSeverity?: "NONE" | "MILD" | "SEVERE";
  includeSmartSilence?: boolean;
}

export interface RecoveryLabRunResult {
  scenarioName: string;
  totalRevenueAtRiskInr: number;
  totalFailedTransactionsCount: number;
  strategyResults: StrategySimulationResult[];
  recommendedStrategy: StrategyType;
  revoraRevenueAdvantageInr: number; // Revora vs next best strategy
  simulationTimestamp: string;
  isSynthetic: boolean;
}