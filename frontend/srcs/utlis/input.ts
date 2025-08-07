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
  const onlyLetters = /^[A-Za-z\s\\-]+$/;
  return text && !onlyLetters.test(text) ? 'Should be letters only.' : '';
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


