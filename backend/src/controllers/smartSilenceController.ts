import { Request, Response, NextFunction } from "express";
import { smartSilenceService } from "../services/smartSilenceService.js";
import { IssuerBank } from "../types/transaction.js";

export class SmartSilenceController {
  public static getStatusSummary(_req: Request, res: Response, next: NextFunction): void {
    try {
      const summary = smartSilenceService.getStatusSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  public static getEventHistory(_req: Request, res: Response, next: NextFunction): void {
    try {
      const events = smartSilenceService.getEventHistory();
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  }

  public static toggleOverride(req: Request, res: Response, next: NextFunction): void {
    try {
      const { bank, forceSuppressed } = req.body;
      if (!bank) {
        res.status(400).json({
          success: false,
          error: { code: "INVALID_BANK", message: "Issuer bank is required." },
        });
        return;
      }

      const updated = smartSilenceService.toggleOverride(bank as IssuerBank, forceSuppressed);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
}