// utils/input.ts
export type Strength = 'Weak' | 'Medium' | 'Strong';

export const getPasswordStrength = (text: string): Strength => {
  const hasNumber = /\d/.test(text);
  const hasUpper = /[A-Z]/.test(text);
  const hasLower = /[a-z]/.test(text);
  const hasSpecial = /[^A-Za-z0-9]/.test(text);
  const isLongEnough = text.length >= 8;

  const score = [hasNumber, hasUpper, hasLower, hasSpecial, isLongEnough].filter(Boolean).length;

  if (score === 5) return 'Strong';
  if (score >= 3) return 'Medium';
  return 'Weak';
};

export const strengthColorMap: Record<Strength, string> = {
  Weak: '#F77979',
  Medium: '#F2BC79',
  Strong: '#A6F98D',
};

export const strengthPercentMap: Record<Strength, number> = {
  Weak: 0.25,
  Medium: 0.66,
  Strong: 1,
};

export const validateText = (text: string): string => {
  const onlyLettersAndNumbers = /^[A-Za-z0-9\s\-_]+$/;
  return text && !onlyLettersAndNumbers.test(text) ? 'Should be letters and number only.' : '';
};

export const validateEmail = (
  text: string
): { error: string; cleaned: string } => {
  const trimmed = text.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (trimmed && !emailRegex.test(trimmed)) {
    return { error: 'Invalid email format.', cleaned: trimmed };
  }
  return { error: '', cleaned: trimmed };
};

export const sanitizeDecimalInput = (text: string): string => {
  const sanitized = text.replace(/[^0-9.]/g, '');
  return sanitized.split('.').length > 2
    ? sanitized.slice(0, -1)
    : sanitized;
};

// utils/input.ts
export const sanitizeIntegerInput = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};

export const calculateRunningTime = (updatedAt: string): number => {
  try {
    // Parse the updated_at timestamp
    const updatedTime = new Date(updatedAt);
    const currentTime = new Date();
    
    // Calculate difference in milliseconds
    const diffInMs = currentTime.getTime() - updatedTime.getTime();
    
    // Convert to seconds
    const diffInSeconds = Math.floor(diffInMs / 1000);
    
    // Return 0 if negative (shouldn't happen, but safety check)
    return Math.max(0, diffInSeconds);
  } catch (error) {
    console.error('Error calculating running time:', error);
    return 0;
  }
};

export const formatRunningTimeFromTimestamp = (updatedAt: string): string => {
  const totalSeconds = calculateRunningTime(updatedAt);
  
  const days = Math.floor(totalSeconds / 86400); // 86400 seconds = 24 hours
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  
  // If 24+ hours (1+ days), show only days
  if (days >= 1) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  // If less than 24 hours, show hours/minutes/seconds
  else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
};

// Alternative: More human-readable format
export const formatRunningTimeHumanReadable = (updatedAt: string): string => {
  const totalSeconds = calculateRunningTime(updatedAt);
  
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}, ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${totalSeconds}s`;
  }
};


