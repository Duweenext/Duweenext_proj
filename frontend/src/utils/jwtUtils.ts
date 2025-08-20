import { jwtDecode } from 'jwt-decode';

export interface JWTPayload {
  sub: string; // subject (usually user ID)
  email?: string;
  name?: string;
  iat: number; // issued at
  exp: number; // expiration time
  [key: string]: any; // additional claims
}

/**
 * Decode JWT token and return payload
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    return jwtDecode<JWTPayload>(token);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    
    const currentTime = Date.now() / 1000; // Convert to seconds
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true;
  }
}

/**
 * Get user data from JWT token
 */
export function getUserFromToken(token: string): { id: string; email?: string; name?: string } | null {
  try {
    const payload = decodeJWT(token);
    if (!payload) return null;
    
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
}

/**
 * Get token expiration time in milliseconds
 */
export function getTokenExpirationTime(token: string): number | null {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return null;
    
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
}

/**
 * Check if token will expire within specified minutes
 */
export function willTokenExpireSoon(token: string, minutesBeforeExpiry: number = 5): boolean {
  try {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return true;
    
    const timeUntilExpiry = expirationTime - Date.now();
    const minutesUntilExpiry = timeUntilExpiry / (1000 * 60);
    
    return minutesUntilExpiry <= minutesBeforeExpiry;
  } catch (error) {
    console.error('Error checking token expiry soon:', error);
    return true;
  }
}

/**
 * Get human-readable time remaining for JWT token
 */
export function getTokenTimeRemaining(token: string): string {
  try {
    const expirationTime = getTokenExpirationTime(token);
    if (!expirationTime) return 'Invalid token';
    
    const timeUntilExpiry = expirationTime - Date.now();
    
    if (timeUntilExpiry <= 0) return 'Expired';
    
    const days = Math.floor(timeUntilExpiry / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeUntilExpiry % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes`;
    return `${minutes} minutes`;
  } catch (error) {
    console.error('Error getting token time remaining:', error);
    return 'Error';
  }
}

/**
 * Get detailed token information for debugging
 */
export function getTokenInfo(token: string): {
  isValid: boolean;
  isExpired: boolean;
  timeRemaining: string;
  expirationDate: string;
  payload: JWTPayload | null;
} {
  try {
    const payload = decodeJWT(token);
    const expired = isTokenExpired(token);
    const timeRemaining = getTokenTimeRemaining(token);
    const expirationTime = getTokenExpirationTime(token);
    
    return {
      isValid: !!payload,
      isExpired: expired,
      timeRemaining,
      expirationDate: expirationTime ? new Date(expirationTime).toISOString() : 'Unknown',
      payload
    };
  } catch (error) {
    return {
      isValid: false,
      isExpired: true,
      timeRemaining: 'Error',
      expirationDate: 'Error',
      payload: null
    };
  }
}
