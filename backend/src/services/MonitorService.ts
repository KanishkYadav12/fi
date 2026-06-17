import Monitor, { IMonitor } from '../models/Monitor';
import CheckLog from '../models/CheckLog';
import { DashboardStats } from '../types/monitor';

export class MonitorService {
  static async getAllMonitors(): Promise<IMonitor[]> {
    return Monitor.find().sort({ createdAt: -1 });
  }

  static async createMonitor(data: { url: string; name?: string }): Promise<IMonitor> {
    const monitor = new Monitor(data);
    return monitor.save();
  }

  static async deleteMonitor(id: string): Promise<IMonitor | null> {
    const monitor = await Monitor.findById(id);
    if (!monitor) return null;

    await CheckLog.deleteMany({ monitorId: id });
    return Monitor.findByIdAndDelete(id);
  }

  static async getStats(): Promise<DashboardStats> {
    const total = await Monitor.countDocuments();
    const up = await Monitor.countDocuments({ status: 'UP' });
    const down = await Monitor.countDocuments({ status: 'DOWN' });
    return { total, up, down };
  }
}
