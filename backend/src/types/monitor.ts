export type MonitorStatus = 'UP' | 'DOWN' | 'PENDING';

export interface MonitorDTO {
  id: string;
  url: string;
  name?: string;
  status: MonitorStatus;
  lastResponseTime?: number;
  lastChecked?: Date;
  isActive: boolean;
}

export interface DashboardStats {
  total: number;
  up: number;
  down: number;
}
