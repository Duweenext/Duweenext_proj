import { useState } from 'react';
import { Alert } from 'react-native';

export type DiscoveredDevice = { id: string; name: string | null; rssi: number | null };

const warn = (msg: string) => {
  try { Alert.alert('Bluetooth (web)', msg); } catch { console.warn(msg); }
};

export function useBle() {
  const [isScanning] = useState(false);
  const [devices] = useState<Record<string, DiscoveredDevice>>({});

  return {
    isScanning,
    devices,
    startScan: async () => warn('BLE is disabled on web build (use the mobile app).'),
    stopScan: () => {},
    connect: async () => { throw new Error('BLE connect disabled on web.'); },
    readBase64: async () => { throw new Error('BLE read disabled on web.'); },
    writeBase64: async () => { throw new Error('BLE write disabled on web.'); },
    monitor: async () => { throw new Error('BLE notifications disabled on web.'); },
  };
}
