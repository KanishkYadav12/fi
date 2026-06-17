import cron from 'node-cron';
import Monitor from '../models/Monitor';
import CheckLog from '../models/CheckLog';
import { PingService } from './PingService';

export class SchedulerService {
  static init() {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      console.log(`[Scheduler] Starting heartbeat check: ${new Date().toISOString()}`);
      await this.checkAllMonitors();
    });
  }

  private static async checkAllMonitors() {
    const monitors = await Monitor.find({ isActive: true });

    const pingPromises = monitors.map(async (monitor) => {
      const result = await PingService.ping(monitor.url);

      // Update Monitor status
      await Monitor.findByIdAndUpdate(monitor._id, {
        status: result.isUp ? 'UP' : 'DOWN',
        lastResponseTime: result.responseTime,
        lastChecked: new Date(),
      });

      // Log the check
      await CheckLog.create({
        monitorId: monitor._id,
        statusCode: result.statusCode,
        responseTime: result.responseTime,
        error: result.error,
        timestamp: new Date(),
      });
    });

    await Promise.allSettled(pingPromises);
    console.log(`[Scheduler] Heartbeat check complete.`);
  }
}
