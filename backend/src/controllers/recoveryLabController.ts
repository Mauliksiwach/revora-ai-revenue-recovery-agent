import { Request, Response, NextFunction } from "express";
import { recoveryLabService } from "../services/recoveryLabService.js";

export class RecoveryLabController {
  public static runSimulation(req: Request, res: Response, next: NextFunction): void {
    try {
      const { outageSeverity, includeSmartSilence } = req.body || {};
      const result = recoveryLabService.runSimulation({
        outageSeverity,
        includeSmartSilence,
      });
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static getStrategies(_req: Request, res: Response, next: NextFunction): void {
    try {
      const result = recoveryLabService.runSimulation();
      res.json({ success: true, data: result.strategyResults });
    } catch (err) {
      next(err);
    }
  }
}