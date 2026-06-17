import Monitor, { IMonitor } from '../models/Monitor';
import CheckLog from '../models/CheckLog';

export class MonitorService {
  static async getAllMonitors() {
    return Monitor.find().sort({ createdAt: -1 });
  }

  static async createMonitor(data: { url: string; name?: string }) {
    const monitor = new Monitor(data);
    return monitor.save();
  }

  static async deleteMonitor(id: string) {
    await CheckLog.deleteMany({ monitorId: id });
    return Monitor.findByIdAndDelete(id);
  }

  static async getStats() {
    const total = await Monitor.countDocuments();
    const up = await Monitor.countDocuments({ status: 'UP' });
    const down = await Monitor.countDocuments({ status: 'DOWN' });
    return { total, up, down };
  }

  static async updateMonitorStatus(id: string, update: Partial<IMonitor>) {
    return Monitor.findByIdAndUpdate(id, update, { new: true });
  }
}
