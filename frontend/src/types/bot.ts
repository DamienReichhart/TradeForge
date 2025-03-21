export interface Bot {
  id: number;
  name: string;
  pair: string;
  timeframe: string;
  is_active: boolean;
  is_running: boolean;
  created_at: string;
  updated_at?: string;
  description?: string;
  strategy?: string;
  user_id?: number;
} 