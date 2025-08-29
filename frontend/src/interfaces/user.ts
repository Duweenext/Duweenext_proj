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