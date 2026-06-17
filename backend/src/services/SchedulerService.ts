import cron from 'node-cron';
import Monitor from '../models/Monitor';
import CheckLog from '../models/CheckLog';
import { PingService } from './PingService';

export class SchedulerService {
  private static isProcessing = false;

  static init(): void {
    // Run every minute
    cron.schedule('* * * * *', async () => {
      if (this.isProcessing) {
        console.warn(`[Scheduler] Previous run still in progress, skipping...`);
        return;
      }

      this.isProcessing = true;
      console.log(`[Scheduler] Starting heartbeat check: ${new Date().toISOString()}`);

      try {
        await this.checkAllMonitors();
      } catch (error) {
        console.error(`[Scheduler] Error during heartbeat check:`, error);
      } finally {
        this.isProcessing = false;
        console.log(`[Scheduler] Heartbeat check complete.`);
      }
    });
  }

  private static async checkAllMonitors(): Promise<void> {
    const monitors = await Monitor.find({ isActive: true });

    const pingPromises = monitors.map(async (monitor) => {
      const result = await PingService.ping(monitor.url);

      // Atomic update of Monitor status and state
      await Monitor.findOneAndUpdate(
        { _id: monitor._id },
        {
          $set: {
            status: result.isUp ? 'UP' : 'DOWN',
            lastResponseTime: result.responseTime,
            lastChecked: new Date(),
          },
        }
      );

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
  }
}
