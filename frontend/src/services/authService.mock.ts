// TEMP backend for development only (RESET + DELETE flows)

export type ResultOK = { ok: true };
export type ResetError =
  | { ok: false; code: 'invalid_code' }
  | { ok: false; code: 'too_many_attempts'; retryAfterSec: number }
  | { ok: false; code: 'expired' }
  | { ok: false; code: 'weak_password' };

const TEMP_CODE = '123456'; // the dev code you’ll use in screenshots

// ===== Password reset timing =====
const MAX_BAD_ATTEMPTS_RESET = 5;
const LOCK_MS_RESET = 2 * 60 * 1000;       // 2 minutes
const CODE_TTL_MS = 10 * 60 * 1000;        // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;      // 60s

// ===== Account delete timing =====
const MAX_BAD_ATTEMPTS_DELETE = 5;
const LOCK_MS_DELETE = 24 * 60 * 60 * 1000; // 24 hours

type Session = {
  email: string;
  code: string;
  sentAt: number;
  badTries: number;
  lockedUntil?: number;
  lastResentAt?: number;
};

const resetSessions = new Map<string, Session>();  // key=email
const deleteSessions = new Map<string, Session>(); // key=email

const now = () => Date.now();

// ------------------ RESET FLOW ------------------
export function requestReset(emailRaw: string): ResultOK {
  const email = emailRaw.trim().toLowerCase();
  const t = now();
  const s = resetSessions.get(email);
  if (s) {
    Object.assign(s, { code: TEMP_CODE, sentAt: t, lastResentAt: t, badTries: 0, lockedUntil: undefined });
    return { ok: true };
  }
  resetSessions.set(email, { email, code: TEMP_CODE, sentAt: t, badTries: 0, lastResentAt: t });
  return { ok: true };
}

export function canResend(emailRaw: string) {
  const email = emailRaw.trim().toLowerCase();
  const s = resetSessions.get(email) ?? deleteSessions.get(email);
  if (!s) return { can: true, secs: 0 };
  const remain = (s.lastResentAt ?? 0) + RESEND_COOLDOWN_MS - now();
  return { can: remain <= 0, secs: Math.max(0, Math.ceil(remain / 1000)) };
}

export function resendCode(emailRaw: string): ResultOK {
  const email = emailRaw.trim().toLowerCase();
  const t = now();
  const s = resetSessions.get(email);
  if (!s) {
    resetSessions.set(email, { email, code: TEMP_CODE, sentAt: t, badTries: 0, lastResentAt: t });
    return { ok: true };
  }
  Object.assign(s, { code: TEMP_CODE, sentAt: t, lastResentAt: t });
  return { ok: true };
}

export function verifyResetCode(emailRaw: string, code: string): ResultOK | ResetError {
  const email = emailRaw.trim().toLowerCase();
  const s = resetSessions.get(email);
  const t = now();
  if (!s) return { ok: false, code: 'expired' };
  if (s.lockedUntil && t < s.lockedUntil) {
    return { ok: false, code: 'too_many_attempts', retryAfterSec: Math.ceil((s.lockedUntil - t) / 1000) };
  }
  if (s.sentAt + CODE_TTL_MS < t) return { ok: false, code: 'expired' };
  if (code !== s.code) {
    s.badTries += 1;
    if (s.badTries >= MAX_BAD_ATTEMPTS_RESET) {
      s.lockedUntil = t + LOCK_MS_RESET;
      return { ok: false, code: 'too_many_attempts', retryAfterSec: Math.ceil(LOCK_MS_RESET / 1000) };
    }
    return { ok: false, code: 'invalid_code' };
  }
  s.badTries = 0;
  return { ok: true };
}

export function resetPassword(emailRaw: string, _code: string, newPwd: string): ResultOK | ResetError {
  const hasLower = /[a-z]/.test(newPwd);
  const hasUpper = /[A-Z]/.test(newPwd);
  const hasNum = /\d/.test(newPwd);
  const hasSym = /[^A-Za-z0-9]/.test(newPwd);
  const lenOK = newPwd.length >= 8;
  const score = [hasLower, hasUpper, hasNum, hasSym].filter(Boolean).length;
  if (!(lenOK && score >= 3)) return { ok: false, code: 'weak_password' };
  resetSessions.delete(emailRaw.trim().toLowerCase());
  return { ok: true };
}

// ------------------ DELETE FLOW ------------------
export function requestDeleteCode(emailRaw: string): ResultOK {
  const email = emailRaw.trim().toLowerCase();
  const t = now();
  const s = deleteSessions.get(email);
  if (s) {
    Object.assign(s, { code: TEMP_CODE, sentAt: t, lastResentAt: t, badTries: 0, lockedUntil: undefined });
    return { ok: true };
  }
  deleteSessions.set(email, { email, code: TEMP_CODE, sentAt: t, badTries: 0, lastResentAt: t });
  return { ok: true };
}

export function resendDeleteCode(emailRaw: string): ResultOK {
  const email = emailRaw.trim().toLowerCase();
  const t = now();
  const s = deleteSessions.get(email);
  if (!s) {
    deleteSessions.set(email, { email, code: TEMP_CODE, sentAt: t, badTries: 0, lastResentAt: t });
    return { ok: true };
  }
  Object.assign(s, { code: TEMP_CODE, sentAt: t, lastResentAt: t });
  return { ok: true };
}

export function verifyDeleteCode(emailRaw: string, code: string):
  | ResultOK
  | { ok: false; code: 'invalid_code' | 'too_many_attempts' | 'expired'; retryAfterSec?: number } {
  const email = emailRaw.trim().toLowerCase();
  const s = deleteSessions.get(email);
  const t = now();
  if (!s) return { ok: false, code: 'expired' };
  if (s.lockedUntil && t < s.lockedUntil) {
    return { ok: false, code: 'too_many_attempts', retryAfterSec: Math.ceil((s.lockedUntil - t) / 1000) };
  }
  if (s.sentAt + CODE_TTL_MS < t) return { ok: false, code: 'expired' };
  if (code !== s.code) {
    s.badTries += 1;
    if (s.badTries >= MAX_BAD_ATTEMPTS_DELETE) {
      s.lockedUntil = t + LOCK_MS_DELETE; // 24h lock
      return { ok: false, code: 'too_many_attempts', retryAfterSec: Math.ceil(LOCK_MS_DELETE / 1000) };
    }
    return { ok: false, code: 'invalid_code' };
  }
  s.badTries = 0;
  return { ok: true };
}
