type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

export const getPasswordStrength = (password: string): PasswordStrength => {
  const length = password.length;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);  // any non-alphanumeric

  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;

  // Strong: long or very well-mixed
  if (length >= 12 && variety >= 3) return 'Strong';
  if (length >= 16) return 'Strong';  // long passphrase

  // Medium: decent, but not top tier
  if (length >= 8 && variety >= 2) return 'Medium';

  // Weak: everything else
  return 'Weak';
};
