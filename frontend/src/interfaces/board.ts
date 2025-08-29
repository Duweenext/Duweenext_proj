export interface Board {
  board_id: number;
  sensor_id: number;
  board_name: string;
  board_register_date: string;
  board_status: BoardConnectionStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BoardRelationship {
  board_name?: string;
  board_id: string;
  con_method: 'manual' | 'bluetooth';
  con_status: BoardConnectionStatus;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  sensor_frequency: number;
  id: number; //relationship id
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

export type BoardConnectionStatus =  'active' | 'inactive';
