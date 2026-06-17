import { Request, Response, NextFunction } from 'express';
import { MonitorService } from '../services/MonitorService';

export class MonitorController {
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const monitors = await MonitorService.getAllMonitors();
      res.json(monitors);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { url, name } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }
      const monitor = await MonitorService.createMonitor({ url, name });
      res.status(201).json(monitor);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await MonitorService.deleteMonitor(id);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
