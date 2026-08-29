import { Request, Response, NextFunction } from "express";
import { analyticsService } from "../services/analyticsService.js";
import { dbService } from "../services/databaseService.js";

export class AnalyticsController {
  public static async getOverview(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const overview = analyticsService.getOverview();
      res.json({
        success: true,
        data: overview,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTrends(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bucketHours = Number(req.query.bucketHours) || 2;
      const trends = analyticsService.getTrends(bucketHours);
      res.json({
        success: true,
        data: trends,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getBreakdowns(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const methods = analyticsService.getMethodBreakdown();
      const issuers = analyticsService.getIssuerBreakdown();
      const failureReasons = analyticsService.getFailureReasonBreakdown();

      res.json({
        success: true,
        data: {
          paymentMethods: methods,
          issuers,
          failureReasons,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getHealth(_req: Request, res: Response): Promise<void> {
    res.json({
      status: "HEALTHY",
      service: "Revora — AI Revenue Recovery Agent",
      version: "1.0.0 (Phase 1)",
      environment: process.env.NODE_ENV || "development",
      database: {
        type: dbService.isSupabaseConnected() ? "SUPABASE_POSTGRES" : "IN_MEMORY_SIMULATION",
        status: "CONNECTED",
      },
      timestamp: new Date().toISOString(),
    });
  }
}
