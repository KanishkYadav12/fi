import axios from 'axios';

export interface PingResult {
  statusCode?: number;
  responseTime?: number;
  error?: string;
  isUp: boolean;
}

export class PingService {
  private static TIMEOUT = 10000; // 10 seconds

  static async ping(url: string): Promise<PingResult> {
    const start = Date.now();
    try {
      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        validateStatus: () => true, // Treat all status codes as "received" for monitoring
      });

      const duration = Date.now() - start;
      return {
        statusCode: response.status,
        responseTime: duration,
        isUp: response.status >= 200 && response.status < 400,
      };
    } catch (error: any) {
      const duration = Date.now() - start;
      return {
        error: error.message,
        responseTime: duration,
        isUp: false,
      };
    }
  }
}
