import { useEffect, useRef, useState, useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import type { Subscription, BleManager, Device } from 'react-native-ble-plx';
import { Buffer } from 'buffer';
import { bleManager as _bleManager, isExpoGo, isWeb } from './manager';
import { requestBlePermissions } from './permissions.android';

export type DiscoveredDevice = { id: string; name: string | null; rssi: number | null };

const requireSupportedRuntime = () => {
  const msg = isWeb
    ? 'BLE is disabled on web.'
    : 'BLE requires a Development/production build (not Expo Go).';
  try { Alert.alert('Bluetooth', msg); } catch { }
};

/** ---- Config you will replace when firmware shares UUIDs ---- */
const DEFAULTS = {
  PROV_SERVICE_UUID: '00000000-0000-0000-0000-000000000000', // TODO: replace
  PROV_WRITE_CHAR_UUID: '11111111-1111-1111-1111-111111111111', // TODO: replace (Write or WriteWithoutResponse)
  PROV_NOTIFY_CHAR_UUID: undefined as string | undefined, // e.g., '2222-...'; leave undefined if unused
  SCAN_DURATION_MS: 10_000,
  ANDROID_TARGET_MTU: 185,
  CHUNK_SIZE_ANDROID: 180, // leave a few bytes below MTU
  CHUNK_SIZE_IOS: 20,      // iOS classic GATT default
  ACK_TIMEOUT_MS: 4_000,   // only used if notify UUID provided
};

export type WifiCreds = {
  ssid: string;
  wifiPassword: string;   // <-- no connectionPassword here
};


export type ProvisionCfg = Partial<{
  serviceUUID: string;
  writeCharUUID: string;
  notifyCharUUID?: string;
  requestMtu: number;
  chunkSize: number;
  useWriteWithResponse: boolean; // default = false (faster)
  ackTimeoutMs: number;
}>;

/** small helpers */
const utf8ToBase64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');
const base64ToUtf8 = (b64: string) => Buffer.from(b64, 'base64').toString('utf8');

export function useBle() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Record<string, DiscoveredDevice>>({});
  const stopTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return;

    const sub = ble.onStateChange(() => { }, true);
    return () => {
      sub.remove();
      ble.stopDeviceScan();
      if (stopTimer.current) { clearTimeout(stopTimer.current); stopTimer.current = null; }
    };
  }, []);

  const startScan = useCallback(async (serviceUuids?: string[], durationMs = DEFAULTS.SCAN_DURATION_MS) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return; }

    const ok = await requestBlePermissions();
    if (!ok) return;

    setDevices({});
    setIsScanning(true);

    ble.startDeviceScan(serviceUuids ?? null, { allowDuplicates: true, scanMode: 2 }, (error, device) => {
      if (error) {
        console.warn('Scan error:', error);
        setIsScanning(false);
        return;
      }
      if (!device) return;

      setDevices(prev => {
        const existing = prev[device.id];
        // Insert new OR update RSSI/name when they change
        if (!existing || existing.rssi !== device.rssi || existing.name !== (device.name ?? null)) {
          return {
            ...prev,
            [device.id]: {
              id: device.id,
              name: device.name ?? null,
              rssi: device.rssi ?? null,
            },
          };
        }
        return prev;
      });
    });

    if (stopTimer.current) clearTimeout(stopTimer.current);
    stopTimer.current = setTimeout(() => {
      ble.stopDeviceScan();
      setIsScanning(false);
    }, durationMs);
  }, []);

  const stopScan = useCallback(() => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return;
    ble.stopDeviceScan();
    setIsScanning(false);
    if (stopTimer.current) { clearTimeout(stopTimer.current); stopTimer.current = null; }
  }, []);

  const connect = useCallback(async (deviceId: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) {
      requireSupportedRuntime();
      throw new Error(isExpoGo ? 'Expo Go not supported' : 'Web not supported');
    }
    const device = await ble.connectToDevice(deviceId, {
      requestMTU: Platform.OS === 'android' ? DEFAULTS.ANDROID_TARGET_MTU : undefined,
      timeout: 10_000,
      autoConnect: false,
    });
    return device.discoverAllServicesAndCharacteristics();
  }, []);

  /** helper to obtain a connected device handle, connecting if necessary */
  const getConnectedDeviceForService = useCallback(async (deviceId: string, serviceUUID: string): Promise<Device | undefined> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) return undefined;

    const existing = await ble.connectedDevices([serviceUUID]).then(arr => arr.find(d => d.id === deviceId));
    if (existing) return existing;

    // Fallback: try to connect (no MTU here; caller may have already negotiated)
    try {
      const dev = await ble.connectToDevice(deviceId, { timeout: 10_000, autoConnect: false });
      await dev.discoverAllServicesAndCharacteristics();
      const services = await dev.services();
      for (const s of services) {
        const chars = await dev.characteristicsForService(s.uuid);
        console.log('Service', s.uuid);
        chars.forEach(c => console.log('  Char', c.uuid, {
          read: c.isReadable, w: c.isWritableWithResponse, wwr: c.isWritableWithoutResponse, n: c.isNotifiable,
        }));
      }
      return dev;
    } catch (e) {
      console.warn('Reconnect failed:', e);
      return undefined;
    }
  }, []);

  const readBase64Ble = useCallback(async (deviceId: string, serviceUUID: string, charUUID: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return null; }
    const dev = await getConnectedDeviceForService(deviceId, serviceUUID);
    const ch = await dev?.readCharacteristicForService(serviceUUID, charUUID);
    return ch?.value ?? null;
  }, [getConnectedDeviceForService]);

  const writeBase64Ble = useCallback(async (deviceId: string, serviceUUID: string, charUUID: string, base64Value: string) => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return; }
    const dev = await getConnectedDeviceForService(deviceId, serviceUUID);
    await dev?.writeCharacteristicWithResponseForService(serviceUUID, charUUID, base64Value);
  }, [getConnectedDeviceForService]);

  const monitor = useCallback(async (
    deviceId: string,
    serviceUUID: string,
    charUUID: string,
    onValue: (base64: string) => void
  ): Promise<Subscription | undefined> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); return undefined; }
    const dev = await getConnectedDeviceForService(deviceId, serviceUUID);
    const sub = dev?.monitorCharacteristicForService(serviceUUID, charUUID, (error, ch) => {
      if (error) { console.warn('Notify error:', error); return; }
      if (ch?.value) onValue(ch.value);
    });
    return sub;
  }, [getConnectedDeviceForService]);

  /** chunked UTF-8 write helper (choose With/Without Response) */
  const writeUtf8Chunked = useCallback(async (dev: Device, serviceUUID: string, charUUID: string, text: string, chunkSize: number, withResponse: boolean) => {
    const bytes = Buffer.from(text, 'utf8');
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      const b64 = Buffer.from(chunk).toString('base64');
      if (withResponse) {
        await dev.writeCharacteristicWithResponseForService(serviceUUID, charUUID, b64);
      } else {
        await dev.writeCharacteristicWithoutResponseForService(serviceUUID, charUUID, b64);
      }
      // small pacing helps some stacks
      await new Promise(r => setTimeout(r, 12));
    }
  }, []);

  /**
   * Send Wi-Fi credentials to a connected device.
   * - Connects (or reuses connection), negotiates MTU on Android
   * - Optionally subscribes to a notify char for ACK
   * - Writes JSON payload in chunks
   */
  const provisionWifi = useCallback(async (
    deviceId: string,
    creds: WifiCreds,
    cfg: ProvisionCfg = {}
  ): Promise<void> => {
    const ble: BleManager | null = _bleManager;
    if (!ble) { requireSupportedRuntime(); throw new Error('BLE manager not available'); }

    const serviceUUID = cfg.serviceUUID ?? DEFAULTS.PROV_SERVICE_UUID;
    const writeCharUUID = cfg.writeCharUUID ?? DEFAULTS.PROV_WRITE_CHAR_UUID;
    const notifyCharUUID = cfg.notifyCharUUID ?? DEFAULTS.PROV_NOTIFY_CHAR_UUID;
    const ackTimeoutMs = cfg.ackTimeoutMs ?? DEFAULTS.ACK_TIMEOUT_MS;

    // (Re)connect
    let dev: Device = await ble.connectToDevice(deviceId, {
      autoConnect: false,
      timeout: 10_000,
      requestMTU: Platform.OS === 'android'
        ? (cfg.requestMtu ?? DEFAULTS.ANDROID_TARGET_MTU)
        : undefined,
    });

    let sub: Subscription | undefined;
    try {
      await dev.discoverAllServicesAndCharacteristics();

      const chunkSize = cfg.chunkSize ?? (Platform.OS === 'android'
        ? DEFAULTS.CHUNK_SIZE_ANDROID
        : DEFAULTS.CHUNK_SIZE_IOS);

      const useWWR = cfg.useWriteWithResponse === true ? false : true; // default WWR for speed

      // Optional ACK
      let ackResolve: ((v?: unknown) => void) | null = null;
      let ackReject: ((e: any) => void) | null = null;
      let ackPromise: Promise<unknown> | null = null;

      if (notifyCharUUID) {
        ackPromise = new Promise((res, rej) => { ackResolve = res; ackReject = rej; });
        sub = dev.monitorCharacteristicForService(
          serviceUUID,
          notifyCharUUID,
          (error, ch) => {
            if (error) { console.warn('Provision notify error:', error); return; }
            if (!ch?.value) return;
            const msg = base64ToUtf8(ch.value);
            if (msg.startsWith('OK')) ackResolve?.(true);
            else if (msg.startsWith('ERROR')) ackReject?.(new Error(msg));
          }
        );
      }

      const payload = JSON.stringify({
        ssid: creds.ssid,
        pass: creds.wifiPassword,
      });

      await writeUtf8Chunked(
        dev,
        serviceUUID,
        writeCharUUID,
        payload,
        chunkSize,
        !useWWR // withResponse flag
      );

      if (ackPromise) {
        await Promise.race([
          ackPromise,
          new Promise((_, rej) =>
            setTimeout(() => rej(new Error('Provision ACK timeout')), ackTimeoutMs)
          ),
        ]);
      }
    } finally {
      try { sub?.remove?.(); } catch { }
      try { await dev.cancelConnection(); } catch { }
    }
  }, []);

  return {
    isScanning,
    devices,
    startScan,
    stopScan,
    connect,
    readBase64Ble,
    writeBase64Ble,
    monitor,
    provisionWifi,         // <-- use this from your WifiConfigModal submit
    utf8ToBase64,
    base64ToUtf8,
  };
}
