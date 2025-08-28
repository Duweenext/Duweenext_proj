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

export interface Board {
  board_id: number;
  sensor_id: number;
  board_name: string;
  board_register_date: string;
  board_status: BoardStatusType;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BoardRelationship {
  board_name?: string;
  board_id: string;
  con_method: 'manual' | 'bluetooth';
  con_status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sensor_frequency: number;
}

export interface BoardStatus {
  id: number;
  board_id: number;
  status: string;
  last_seen: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Education {
  post_id: number;
  post_title: string;
  post_detail: string;
  image_url: string;
  quote: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PondHealth {
  pond_id: number;
  user_id: number;
  picture: string;
  result: string;
  data: any;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  user_id: number;
  user_name: string;
  email: string;
  phone_number: string;
  password: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type BoardStatusType = 'disconnected' | 'connected' | 'failed';