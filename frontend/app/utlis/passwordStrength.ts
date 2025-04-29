type PasswordStrength = 'Weak' | 'Medium' | 'Strong';

export const getPasswordStrength = (password: string): PasswordStrength => {
  const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const mediumRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/;

  if (strongRegex.test(password)) return 'Strong';
  if (mediumRegex.test(password)) return 'Medium';
  return 'Weak';
};