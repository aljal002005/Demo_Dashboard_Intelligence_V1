export type CategoryTheme = 'orange' | 'green' | 'purple';

export type ViewTab = 'overview' | 'analytics' | 'reports' | 'copilot' | 'flightrisk' | 'scenarios' | 'construction';
export type ViewMode = 'global' | 'team';

export interface DashboardItem {
  id: string;
  title: string;
  theme: CategoryTheme;
  iconName: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  target?: number;
}

export interface MetricData {
  value: string | number;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  status: 'critical' | 'warning' | 'good' | 'neutral';
  subtitle?: string;
}

export interface AlertData {
  id: string;
  title: string;
  metric: MetricData;
  iconName: string;
  theme: CategoryTheme;
}

export interface InsightResponse {
  analysis: string;
}
