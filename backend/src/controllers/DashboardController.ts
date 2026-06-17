import { Request, Response, NextFunction } from 'express';
import { MonitorService } from '../services/MonitorService';

export class DashboardController {
  static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await MonitorService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }
}
