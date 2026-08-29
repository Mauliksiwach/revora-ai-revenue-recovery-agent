import { Request, Response, NextFunction } from "express";
import { TransactionFilterSchema } from "../types/transaction.js";
import { dbService } from "../services/databaseService.js";

export class TransactionController {
  public static async getTransactions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsedQuery = TransactionFilterSchema.parse(req.query);
      const result = await dbService.getTransactions(parsedQuery);
      res.json({
        success: true,
        meta: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages,
        },
        data: result.data,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getTransactionById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const transaction = await dbService.getTransactionById(id);

      if (!transaction) {
        res.status(404).json({
          success: false,
          error: {
            code: "TRANSACTION_NOT_FOUND",
            message: `Transaction with ID '${id}' was not found.`,
          },
        });
        return;
      }

      res.json({
        success: true,
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async regenerateSimulation(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const count = Number(req.body?.count) || 1200;
      dbService.seedInMemoryStore(count);
      res.json({
        success: true,
        message: `Successfully regenerated ${count} synthetic transactions with realistic Indian failure patterns.`,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
}
