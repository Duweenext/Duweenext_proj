import i18next, { t, TFunction } from "i18next";

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

export const sanitizeIntegerInput = (text: string): string => {
  return text.replace(/[^0-9]/g, '');
};

export const calculateRunningTime = (updatedAt: string): number => {
  try {
    const updatedTime = new Date(updatedAt);
    const currentTime = new Date();

    const diffInMs = currentTime.getTime() - updatedTime.getTime();

    const diffInSeconds = Math.floor(diffInMs / 1000);

    return Math.max(0, diffInSeconds);
  } catch (error) {
    console.error('Error calculating running time:', error);
    return 0;
  }
};

export function formatRunningTimeFromTimestamp(timestamp: string | null | undefined, t: TFunction): string {
    if (!timestamp) {
        return 'N/A';
    }

    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.round((now.getTime() - past.getTime()) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
    };

    if (diffInSeconds < 60) {
        return t('time.justNow');
    }

    let counter;
    if ((counter = Math.floor(diffInSeconds / intervals.year)) > 0) {
        const time = t('time.year', { count: counter }); // e.g., "1 year" or "2 years"
        return t('time.timeAgo', { time }); // e.g., "1 year ago"
    }
    if ((counter = Math.floor(diffInSeconds / intervals.month)) > 0) {
        const time = t('time.month', { count: counter });
        return t('time.timeAgo', { time });
    }
    if ((counter = Math.floor(diffInSeconds / intervals.week)) > 0) {
        const time = t('time.week', { count: counter });
        return t('time.timeAgo', { time });
    }
    if ((counter = Math.floor(diffInSeconds / intervals.day)) > 0) {
        const time = t('time.day', { count: counter });
        return t('time.timeAgo', { time });
    }
    if ((counter = Math.floor(diffInSeconds / intervals.hour)) > 0) {
        const time = t('time.hour', { count: counter });
        return t('time.timeAgo', { time });
    }
    if ((counter = Math.floor(diffInSeconds / intervals.minute)) > 0) {
        const time = t('time.minute', { count: counter });
        return t('time.timeAgo', { time });
    }
    
    // Fallback for seconds, though the < 60 check should catch it.
    const time = t('time.second', { count: diffInSeconds });
    return t('time.timeAgo', { time });
}

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


