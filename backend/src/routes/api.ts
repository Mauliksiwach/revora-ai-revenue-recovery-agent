import { Router } from "express";
import { TransactionController } from "../controllers/transactionController.js";
import { AnalyticsController } from "../controllers/analyticsController.js";
import { IncidentController } from "../controllers/incidentController.js";

export const apiRouter = Router();

// Health & System
apiRouter.get("/health", AnalyticsController.getHealth);

// Analytics
apiRouter.get("/analytics/overview", AnalyticsController.getOverview);
apiRouter.get("/analytics/trends", AnalyticsController.getTrends);
apiRouter.get("/analytics/breakdown", AnalyticsController.getBreakdowns);

// Transactions
apiRouter.get("/transactions", TransactionController.getTransactions);
apiRouter.get("/transactions/:id", TransactionController.getTransactionById);

// Simulation Management
apiRouter.post("/simulation/regenerate", TransactionController.regenerateSimulation);

// Phase 2: Revora Intelligence / AI Revenue Detective
apiRouter.get("/intelligence/detect", IncidentController.runDetection);
apiRouter.get("/intelligence/incidents/:id", IncidentController.getIncidentById);