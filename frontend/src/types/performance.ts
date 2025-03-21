export interface PerformanceData {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  profit_factor: number;
  total_profit_loss: number;
  average_profit_loss: number;
  time_series: TimeSeriesPoint[];
}

export interface TimeSeriesPoint {
  time: string;
  equity: number;
} 