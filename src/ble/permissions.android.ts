import { PermissionsAndroid, Platform } from 'react-native';

export async function requestBlePermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const api = Number(Platform.Version); // Android API level number

  if (api >= 31) {
    // Android 12+ : request Bluetooth Scan + Connect
    const scan = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: 'Bluetooth permission',
        message: 'We need Bluetooth permission to scan for nearby devices.',
        buttonPositive: 'OK',
      }
    );
    const connect = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: 'Bluetooth permission',
        message: 'We need Bluetooth permission to connect to devices.',
        buttonPositive: 'OK',
      }
    );
    return scan === PermissionsAndroid.RESULTS.GRANTED &&
           connect === PermissionsAndroid.RESULTS.GRANTED;
  } else {
    // Android 11 and below: scanning requires fine location permission
    const fine = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location permission',
        message: 'Location is required to scan for BLE devices on Android 11 or lower.',
        buttonPositive: 'OK',
      }
    );
    return fine === PermissionsAndroid.RESULTS.GRANTED;
  }
}
