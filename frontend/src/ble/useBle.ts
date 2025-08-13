import { useEffect, useRef, useState } from 'react';
import { bleManager } from './manager';
import { requestBlePermissions } from './permissions.android';

export type DiscoveredDevice = {
  id: string;
  name: string | null;
  rssi: number | null;
};

export function useBle() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, DiscoveredDevice>>({});
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const sub = bleManager.onStateChange((_state) => {
      // 'PoweredOn', 'PoweredOff', etc. You could react here if needed.
    }, true);
    return () => {
      sub.remove();
      bleManager.stopDeviceScan();
      if (stopTimer.current) clearTimeout(stopTimer.current);
      // bleManager.destroy(); // uncomment if you want to fully tear down
    };
  }, []);

  const startScan = async (serviceUuids?: string[]) => {
    const ok = await requestBlePermissions();
    if (!ok) return;

    setDevices({});
    setIsScanning(true);

    bleManager.startDeviceScan(serviceUuids ?? null, { allowDuplicates: false }, (error, device) => {
      if (error) {
        console.warn('Scan error:', error);
        setIsScanning(false);
        return;
      }
      if (device) {
        setDevices((prev) =>
          prev[device.id]
            ? prev
            : { ...prev, [device.id]: { id: device.id, name: device.name ?? null, rssi: device.rssi ?? null } }
        );
      }
    });

    // Auto-stop after 10s
    stopTimer.current = setTimeout(() => {
      bleManager.stopDeviceScan();
      setIsScanning(false);
    }, 10000);
  };

  const stopScan = () => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
    if (stopTimer.current) {
      clearTimeout(stopTimer.current);
      stopTimer.current = null;
    }
  };

  const connect = async (deviceId: string) => {
    const device = await bleManager.connectToDevice(deviceId, { requestMTU: 185 });
    return await device.discoverAllServicesAndCharacteristics();
  };

  const readBase64 = async (deviceId: string, serviceUUID: string, charUUID: string) => {
    const dev = await bleManager.connectedDevices([serviceUUID]).then((arr) => arr.find((d) => d.id === deviceId));
    const ch = await dev?.readCharacteristicForService(serviceUUID, charUUID);
    return ch?.value ?? null; // base64 string
  };

  const writeBase64 = async (deviceId: string, serviceUUID: string, charUUID: string, base64Value: string) => {
    const dev = await bleManager.connectedDevices([serviceUUID]).then((arr) => arr.find((d) => d.id === deviceId));
    return await dev?.writeCharacteristicWithResponseForService(serviceUUID, charUUID, base64Value);
  };

  const monitor = async (
    deviceId: string,
    serviceUUID: string,
    charUUID: string,
    onValue: (base64: string) => void
  ) => {
    const dev = await bleManager.connectedDevices([serviceUUID]).then((arr) => arr.find((d) => d.id === deviceId));
    const sub = dev?.monitorCharacteristicForService(serviceUUID, charUUID, (error, ch) => {
      if (error) {
        console.warn('Notify error:', error);
        return;
      }
      if (ch?.value) onValue(ch.value);
    });
    return sub; // call sub?.remove() to unsubscribe
  };

  return { isScanning, devices, startScan, stopScan, connect, readBase64, writeBase64, monitor };
}
