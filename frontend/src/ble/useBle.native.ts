import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import type { Subscription, BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { bleManager as _bleManager, isExpoGo, isWeb } from './manager';
import { requestBlePermissions } from './permissions.android';

// --- Using the definitive UUIDs from your firmware ---
const PROV_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const WIFI_SSID_CHAR_UUID = "1c95d5e1-d8f0-4f0a-8f2a-a5f4044e4aea";
const WIFI_PASS_CHAR_UUID = "2d85a5e1-d8f0-4f0a-8f2a-a5f4044e4aeb";
const CONTROL_POINT_CHAR_UUID = "3e43c9e1-d8f0-4f0a-8f2a-a5f4044e4aec";
const STATUS_CHAR_UUID = "5f6a09e1-d8f0-4f0a-8f2a-a5f4044e4aed";
const BOARD_ID_CHAR_UUID = "6e400001-b5a3-f393-e0a9-e50e24dcca9e";

const ANDROID_TARGET_MTU = 185;
const ACK_TIMEOUT_MS = 15_000; // Increased timeout for Wi-Fi connection attempt

export type DiscoveredDevice = { id: string; name: string | null; rssi: number | null };
export type WifiCreds = { ssid: string; wifiPassword: string; };

// --- Helper to convert a string to a Base64 encoded string ---
const utf8ToBase64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const base64ToUtf8 = (b64: string) => Buffer.from(b64, 'base64').toString('utf8');

export function useBle() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, DiscoveredDevice>>({});
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return;
    const sub = ble.onStateChange(() => {}, true);
    return () => {
      sub.remove();
      ble.stopDeviceScan();
      if (stopTimer.current) { clearTimeout(stopTimer.current); }
    };
  }, []);

  const startScan = useCallback(async (serviceUuids?: string[], durationMs = 10000) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return;
    const ok = await requestBlePermissions();
    if (!ok) return;

    setDevices({});
    setIsScanning(true);

    ble.startDeviceScan(serviceUuids ?? null, { allowDuplicates: true }, (error, device) => {
      if (error || !device) return;
      // FIX: Made the check case-insensitive to correctly find the device
      if (!device.name || !device.name.toLowerCase().startsWith("iotbox-")) return;
      
      setDevices(prev => ({
        ...prev,
        [device.id]: { id: device.id, name: device.name, rssi: device.rssi },
      }));
    });

    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      ble.stopDeviceScan();
      setIsScanning(false);
    }, durationMs);
  }, []);

  const stopScan = useCallback(() => {
    _bleManager?.stopDeviceScan();
    setIsScanning(false);
  }, []);

  const connectAndReadBoardId = useCallback(async (deviceId: string): Promise<string | null> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return null;

    let device: Device | null = null;
    try {
      device = await ble.connectToDevice(deviceId, { timeout: 10000 });
      await device.discoverAllServicesAndCharacteristics();
      const characteristic = await device.readCharacteristicForService(
        PROV_SERVICE_UUID,
        BOARD_ID_CHAR_UUID
      );
      if (characteristic?.value) {
        return base64ToUtf8(characteristic.value);
      }
      return null;
    } catch (error) {
      console.error("Failed to read Board ID characteristic:", error);
      return null;
    } finally {
      if (device) await device.cancelConnection();
    }
  }, []);

  const provisionWifi = useCallback(async (deviceId: string, creds: WifiCreds): Promise<void> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) throw new Error('BLE manager not available');

    let dev: Device | null = null;
    let sub: Subscription | undefined;
    try {
      dev = await ble.connectToDevice(deviceId, {
        autoConnect: false,
        timeout: 10_000,
        requestMTU: Platform.OS === 'android' ? ANDROID_TARGET_MTU : undefined,
      });
      await dev.discoverAllServicesAndCharacteristics();

      let ackResolve: ((v: boolean) => void) | null = null;
      let ackReject: ((e: any) => void) | null = null;
      const ackPromise = new Promise<boolean>((res, rej) => { ackResolve = res; ackReject = rej; });
      
      sub = dev.monitorCharacteristicForService(PROV_SERVICE_UUID, STATUS_CHAR_UUID, (error, ch) => {
        if (error) return ackReject?.(error);
        if (!ch?.value) return;
        const statusByte = Buffer.from(ch.value, 'base64')[0];
        if (statusByte > 0) ackResolve?.(true);
        else ackReject?.(new Error('Device reported Wi-Fi connection failed'));
      });

      await dev.writeCharacteristicWithoutResponseForService(
        PROV_SERVICE_UUID,
        WIFI_SSID_CHAR_UUID,
        utf8ToBase64(creds.ssid)
      );
      await dev.writeCharacteristicWithoutResponseForService(
        PROV_SERVICE_UUID,
        WIFI_PASS_CHAR_UUID,
        utf8ToBase64(creds.wifiPassword)
      );
      const connectCommand = Buffer.from([0x01]).toString('base64');
      await dev.writeCharacteristicWithoutResponseForService(
        PROV_SERVICE_UUID,
        CONTROL_POINT_CHAR_UUID,
        connectCommand
      );

      await Promise.race([
        ackPromise,
        new Promise((_, rej) => setTimeout(() => rej(new Error('Provisioning ACK timeout')), ACK_TIMEOUT_MS)),
      ]);
    } catch (err) {
      console.error("Wi-Fi provisioning failed:", err);
      throw err;
    } finally {
      sub?.remove();
      if (dev) await dev.cancelConnection();
    }
  }, []);

  return {
    isScanning,
    devices,
    startScan,
    stopScan,
    connectAndReadBoardId,
    provisionWifi,
  };
}
