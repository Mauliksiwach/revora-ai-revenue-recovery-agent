import { Request, Response, NextFunction } from "express";
import { revenueDetectiveService } from "../services/revenueDetectiveService.js";

export class IncidentController {
  public static runDetection(_req: Request, res: Response, next: NextFunction): void {
    try {
      const result = revenueDetectiveService.runDetection();
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  public static getIncidentById(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      const incident = revenueDetectiveService.getIncidentById(id);
      if (!incident) {
        res.status(404).json({
          success: false,
          error: { code: "INCIDENT_NOT_FOUND", message: `Incident '${id}' not found.` },
        });
        return;
      }
      res.json({ success: true, data: incident });
    } catch (err) {
      next(err);
    }
  }
}