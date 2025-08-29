export interface Sensor {
  sensor_id: number;
  sensor_name: string;
  sensor_type: string;
  sensor_status: string;
  sensor_threshold: number;
  sensor_frequency: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SensorDataCard extends SensorDataBackend {
    board_uuid: string;
}

export interface BackendSensorLogData {
  id: number;
  board_id: string;
  temperature: number;
  ec: number;
  ph: number;
  created_at: string;
}

export interface SensorDataBackend {
    id: number;
    sensor_type: string;
    sensor_threshold_max: number;
    sensor_threshold_min: number;
    board_id: number;
}

export interface AggregatedDataPoint {
  time_label: string;
  start_time: string;
  end_time: string;
  temperature?: number;
  ec?: number;
  ph?: number;
  record_count: number;
  has_data: boolean;
}

export interface SensorDataResponse {
  status: string;
  data: AggregatedDataPoint[];
  resolution: string;
  start_date: string;
  end_date: string;
  total_period: string;
  next_level: string;
  prev_level: string;
  zoom_levels: string[];
}