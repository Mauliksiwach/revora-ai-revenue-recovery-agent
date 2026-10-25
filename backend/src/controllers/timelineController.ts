import { Request, Response } from "express";
import { timelineService } from "../services/timelineService.js";
import { TimelineFilterParams } from "../types/timeline.js";

export class TimelineController {
  public static async getEvents(req: Request, res: Response): Promise<void> {
    try {
      const params: TimelineFilterParams = {
        eventType: req.query.eventType as string,
        actor: req.query.actor as string,
        search: req.query.search as string,
        transactionId: req.query.transactionId as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 20,
      };

      const result = timelineService.getEvents(params);
      res.status(200).json(result);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch timeline events", details: error.message });
    }
  }

  public static async getPerformanceProof(_req: Request, res: Response): Promise<void> {
    try {
      const proof = timelineService.getPerformanceProof();
      res.status(200).json(proof);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch AI performance proof", details: error.message });
    }
  }
}
