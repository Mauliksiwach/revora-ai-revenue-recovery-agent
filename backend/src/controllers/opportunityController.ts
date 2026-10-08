import { Request, Response, NextFunction } from "express";
import { recoveryScoringService } from "../services/recoveryScoringService.js";
import { OpportunityPriority } from "../types/opportunity.js";

export class OpportunityController {
  public static getOpportunities(req: Request, res: Response, next: NextFunction): void {
    try {
      const priority = req.query.priority as OpportunityPriority | undefined;
      const minScore = req.query.minScore ? Number(req.query.minScore) : undefined;
      const search = req.query.search as string | undefined;

      const summary = recoveryScoringService.getOpportunities({
        priority,
        minScore,
        search,
      });

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  public static getOpportunityById(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      const opportunity = recoveryScoringService.getOpportunityById(id);
      if (!opportunity) {
        res.status(404).json({
          success: false,
          error: {
            code: "OPPORTUNITY_NOT_FOUND",
            message: `Recovery opportunity '${id}' not found.`,
          },
        });
        return;
      }
      res.json({ success: true, data: opportunity });
    } catch (err) {
      next(err);
    }
  }
}