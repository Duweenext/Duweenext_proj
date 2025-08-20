/**
 * BLE UUID/MAC Address utility functions
 */

/**
 * Normalizes a MAC address by removing colons and converting to uppercase
 * @param macAddress - MAC address in format like "F4:65:0B:4A:8A:C6"
 * @returns Normalized MAC address like "F4650B4A8AC6"
 */
export function normalizeMacAddress(macAddress: string): string {
  return macAddress.replace(/:/g, '').toUpperCase();
}

/**
 * Formats a MAC address with colons
 * @param macAddress - MAC address without colons like "F4650B4A8AC6"
 * @returns Formatted MAC address like "F4:65:0B:4A:8A:C6"
 */
export function formatMacAddress(macAddress: string): string {
  const normalized = macAddress.replace(/:/g, '').toUpperCase();
  return normalized.match(/.{1,2}/g)?.join(':') || normalized;
}

/**
 * Validates if a string looks like a MAC address
 * @param address - String to validate
 * @returns True if it looks like a MAC address
 */
export function isValidMacAddress(address: string): boolean {
  // With colons: F4:65:0B:4A:8A:C6
  const withColonsPattern = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;
  // Without colons: F4650B4A8AC6
  const withoutColonsPattern = /^[0-9A-F]{12}$/i;
  
  return withColonsPattern.test(address) || withoutColonsPattern.test(address);
}

/**
 * Converts BLE device ID to the expected format for your application
 * @param bleDeviceId - Device ID from BLE manager
 * @returns Formatted device ID for your application
 */
export function convertBleDeviceId(bleDeviceId: string): string {
  if (!bleDeviceId) return '';
  
  // Remove colons and convert to uppercase
  const normalized = normalizeMacAddress(bleDeviceId);
  
  // Log for debugging
  console.log('BLE Device ID conversion:', {
    original: bleDeviceId,
    normalized: normalized
  });
  
  return normalized;
}

/**
 * Gets display-friendly MAC address (with colons for readability)
 * @param macAddress - MAC address in any format
 * @returns Display-friendly MAC address with colons
 */
export function getDisplayMacAddress(macAddress: string): string {
  if (!macAddress) return 'Unknown';
  
  const normalized = normalizeMacAddress(macAddress);
  return formatMacAddress(normalized);
}

/**
 * Compares two MAC addresses regardless of format
 * @param mac1 - First MAC address
 * @param mac2 - Second MAC address  
 * @returns True if MAC addresses are the same
 */
export function compareMacAddresses(mac1: string, mac2: string): boolean {
  if (!mac1 || !mac2) return false;
  
  const normalized1 = normalizeMacAddress(mac1);
  const normalized2 = normalizeMacAddress(mac2);
  
  return normalized1 === normalized2;
}
