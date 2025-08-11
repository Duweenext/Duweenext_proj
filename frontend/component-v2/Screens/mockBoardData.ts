import { Board } from '@/src/interfaces/board';

export interface SensorData {
  name: string;
  value: number;
  status: string;
}

export interface ExtendedBoardData extends Board {
  running_time?: number;
  last_connected?: string;
  sensors?: SensorData[];
}

export const mockSensors: SensorData[] = [
  { name: 'Ph sensor', value: 20, status: 'connected' },
  { name: 'Temp sensor', value: 25, status: 'connected' },
  { name: 'EC sensor', value: 20, status: 'connected' },
];

export const mockBoards: ExtendedBoardData[] = [
  {
    board_id: 1,
    sensor_id: 1,
    board_name: 'ESP32',
    board_register_date: '2024-08-01',
    board_status: 'connected',
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-08T13:22:00Z',
    deleted_at: null,
    running_time: 45, // in hours
    sensors: mockSensors
  },
  {
    board_id: 2,
    sensor_id: 2,
    board_name: 'ESP32',
    board_register_date: '2024-08-02',
    board_status: 'failed',
    created_at: '2024-08-02T00:00:00Z',
    updated_at: '2024-08-08T13:22:00Z',
    deleted_at: null,
    running_time: 0,
    sensors: []
  },
  {
    board_id: 3,
    sensor_id: 3,
    board_name: 'ESP32',
    board_register_date: '2024-08-03',
    board_status: 'disconnected',
    created_at: '2024-08-03T00:00:00Z',
    updated_at: '2024-08-05T11:09:00Z',
    deleted_at: null,
    running_time: 0,
    last_connected: '05 April 2024    11:09 PM',
    sensors: []
  },
];

export const formatRunningTime = (hours: number): string => {
  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);
  
  if (wholeHours === 0 && minutes === 0) {
    return '0 hours 0 minutes';
  }
  if (wholeHours === 0) {
    return `${minutes} minutes`;
  }
  if (minutes === 0) {
    return `${wholeHours} hours`;
  }
  return `${wholeHours} hours ${minutes} minutes`;
};
