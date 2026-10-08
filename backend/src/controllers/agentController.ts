import { Request, Response, NextFunction } from "express";
import { revoraAgentService } from "../services/revoraAgentService.js";
import { AgentPolicyStatus, DecisionExecutionState } from "../types/agent.js";

export class AgentController {
  public static getDecisions(req: Request, res: Response, next: NextFunction): void {
    try {
      const policyStatus = req.query.policyStatus as AgentPolicyStatus | undefined;
      const executionState = req.query.executionState as DecisionExecutionState | undefined;
      const search = req.query.search as string | undefined;

      const summary = revoraAgentService.getDecisions({
        policyStatus,
        executionState,
        search,
      });

      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  public static runAgentCycle(_req: Request, res: Response, next: NextFunction): void {
    try {
      const summary = revoraAgentService.runAgentCycle();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  public static approveDecision(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      const approved = revoraAgentService.approveDecision(id);
      if (!approved) {
        res.status(404).json({
          success: false,
          error: { code: "DECISION_NOT_FOUND", message: `Decision '${id}' not found.` },
        });
        return;
      }
      res.json({ success: true, data: approved });
    } catch (err) {
      next(err);
    }
  }

  public static rejectDecision(req: Request, res: Response, next: NextFunction): void {
    try {
      const { id } = req.params;
      const rejected = revoraAgentService.rejectDecision(id);
      if (!rejected) {
        res.status(404).json({
          success: false,
          error: { code: "DECISION_NOT_FOUND", message: `Decision '${id}' not found.` },
        });
        return;
      }
      res.json({ success: true, data: rejected });
    } catch (err) {
      next(err);
    }
  }
}