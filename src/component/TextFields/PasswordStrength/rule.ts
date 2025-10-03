export const usernameRules = {
  title: "Username Rules",
  description: "Choose a unique name to identify your account.",
  rules: [
    "3–20 characters long",
    "Letters, numbers, and underscores only",
    "No spaces or special characters",
    "Must not be already taken",
  ],
};
export const emailRules = {
  title: "Email Rules",
  description: "Use a valid email address for verification and recovery.",
  rules: [
    "Must be in a valid format (name@example.com)",
    "Must be an active and accessible email",
    "Cannot already be linked to another account",
  ],
};
export const passwordRules = {
  title: "Password Rules",
  description: "Create a strong password to protect your account.",
  rules: [
    "At least 8 characters long",
    "Must contain uppercase and lowercase letters",
    "Include at least 1 number",
    "Include at least 1 special character (!@#$%^&*)",
    "Should not match your username or email",
  ],
};
