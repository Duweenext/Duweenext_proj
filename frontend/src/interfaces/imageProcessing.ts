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