import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
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
      const monitor = await MonitorService.createMonitor({ url, name });
      res.status(201).json(monitor);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ error: 'Invalid Monitor ID' });
      }

      const deleted = await MonitorService.deleteMonitor(id);
      if (!deleted) {
        return res.status(404).json({ error: 'Monitor not found' });
      }
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
