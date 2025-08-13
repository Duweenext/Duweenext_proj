import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';
import type { Subscription, BleManager } from 'react-native-ble-plx';
import { bleManager as _bleManager, isExpoGo, isWeb } from './manager';
import { requestBlePermissions } from './permissions.android';

export type DiscoveredDevice = { id: string; name: string | null; rssi: number | null };

const requireSupportedRuntime = () => {
  const msg = isWeb
    ? 'BLE is disabled on web.'
    : 'BLE requires a Development/production build (not Expo Go).';
  try { Alert.alert('Bluetooth', msg); } catch {}
};

export function useBle() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, DiscoveredDevice>>({});
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // subscribe to state changes only when a manager exists
  useEffect(() => {
    // ✅ use a local alias so TS can narrow the union
    const ble: BleManager | null = _bleManager;
    if (!ble) return;

    const sub = ble.onStateChange(() => {}, true);
    return () => {
      sub.remove();
      ble.stopDeviceScan();
      if (stopTimer.current) { clearTimeout(stopTimer.current); stopTimer.current = null; }
    };
  }, []);

  const startScan = async (serviceUuids?: string[]) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return; }

    const ok = await requestBlePermissions();
    if (!ok) return;

    setDevices({});
    setIsScanning(true);

    ble.startDeviceScan(serviceUuids ?? null, { allowDuplicates: false }, (error, device) => {
      if (error) { console.warn('Scan error:', error); setIsScanning(false); return; }
      if (device) {
        setDevices(prev =>
          prev[device.id]
            ? prev
            : {
                ...prev,
                [device.id]: {
                  id: device.id,
                  name: device.name ?? null,
                  rssi: device.rssi ?? null,
                },
              }
        );
      }
    });

    stopTimer.current = setTimeout(() => {
      ble.stopDeviceScan();
      setIsScanning(false);
    }, 10_000);
  };

  const stopScan = () => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return;
    ble.stopDeviceScan();
    setIsScanning(false);
    if (stopTimer.current) { clearTimeout(stopTimer.current); stopTimer.current = null; }
  };

  const connect = async (deviceId: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) {
      requireSupportedRuntime();
      throw new Error(isExpoGo ? 'Expo Go not supported' : 'Web not supported');
    }
    const device = await ble.connectToDevice(deviceId, { requestMTU: 185 });
    return device.discoverAllServicesAndCharacteristics();
  };

  const readBase64 = async (deviceId: string, serviceUUID: string, charUUID: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return null; }
    const dev = await ble.connectedDevices([serviceUUID]).then(arr => arr.find(d => d.id === deviceId));
    const ch = await dev?.readCharacteristicForService(serviceUUID, charUUID);
    return ch?.value ?? null;
  };

  const writeBase64 = async (deviceId: string, serviceUUID: string, charUUID: string, base64Value: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return; }
    const dev = await ble.connectedDevices([serviceUUID]).then(arr => arr.find(d => d.id === deviceId));
    await dev?.writeCharacteristicWithResponseForService(serviceUUID, charUUID, base64Value);
  };

  const monitor = async (
    deviceId: string,
    serviceUUID: string,
    charUUID: string,
    onValue: (base64: string) => void
  ): Promise<Subscription | undefined> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return undefined; }
    const dev = await ble.connectedDevices([serviceUUID]).then(arr => arr.find(d => d.id === deviceId));
    const sub = dev?.monitorCharacteristicForService(serviceUUID, charUUID, (error, ch) => {
      if (error) { console.warn('Notify error:', error); return; }
      if (ch?.value) onValue(ch.value);
    });
    return sub;
  };

  return { isScanning, devices, startScan, stopScan, connect, readBase64, writeBase64, monitor };
}
