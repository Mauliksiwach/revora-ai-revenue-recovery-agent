import { Request, Response } from "express";
import { outreachService } from "../services/outreachService.js";
import { OutreachPreviewRequest } from "../types/outreach.js";

export class OutreachController {
  public static async getTemplates(_req: Request, res: Response): Promise<void> {
    try {
      const templates = outreachService.getTemplates();
      res.status(200).json({ templates, total: templates.length });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to fetch outreach templates", details: error.message });
    }
  }

  public static async renderPreview(req: Request, res: Response): Promise<void> {
    try {
      const request: OutreachPreviewRequest = req.body;
      const preview = outreachService.renderPreview(request);
      res.status(200).json(preview);
    } catch (error: any) {
      res.status(500).json({ error: "Failed to generate outreach preview", details: error.message });
    }
  }
}
