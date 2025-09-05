import { canResend, requestReset, resendCode, resetPassword, verifyResetCode } from '@/src/services/authService.mock';
import * as React from 'react';


export type ForgotState = 'request' | 'verify' | 'reset' | 'done';

type Options = {
  initialEmail?: string;
  autoStart?: boolean;   // if true and initialEmail present -> start at 'verify'
  onDone?: () => void;
};

export function useForgotPassword(opts: Options = {}) {
  const { initialEmail = '', autoStart = true, onDone } = opts;

  const [open, setOpen] = React.useState(false);
  const [state, setState] = React.useState<ForgotState>('request');

  const [email, setEmail] = React.useState(initialEmail);
  const [code, setCode] = React.useState('');
  const [newPw, setNewPw] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');

  const [errorTop, setErrorTop] = React.useState<string | undefined>();
  const [codeError, setCodeError] = React.useState<string | undefined>();
  const [pwdError, setPwdError] = React.useState<string | undefined>();

  const [resendIn, setResendIn] = React.useState(0);

  const openFlow = React.useCallback(() => {
    setOpen(true);
    setErrorTop(undefined);
    setCodeError(undefined);
    setPwdError(undefined);
    setCode('');
    setNewPw('');
    setConfirmPw('');
    setState(initialEmail && autoStart ? 'verify' : 'request');
    tickCooldown(initialEmail || '');
  }, [initialEmail, autoStart]);

  const closeFlow = React.useCallback(() => {
    setOpen(false);
    onDone?.();
  }, [onDone]);

  const tickCooldown = (targetEmail: string) => {
    const stat = canResend(targetEmail || email);
    setResendIn(stat.secs);
  };

  React.useEffect(() => {
    if (!open || resendIn <= 0) return;
    const id = setInterval(() => setResendIn((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [open, resendIn]);

  const sendCode = () => {
    const e = (email || '').trim();
    if (!e) { setErrorTop('Email required'); return; }
    requestReset(e);
    setErrorTop(undefined);
    setState('verify');
    tickCooldown(e);
  };

  const doResend = () => {
    const e = (email || '').trim();
    resendCode(e);
    tickCooldown(e);
    setCode('');
    setCodeError(undefined);
  };

  const confirmCode = () => {
    if (!code) { setErrorTop('Code required'); setCodeError('Code required'); return; }
    const result = verifyResetCode(email, code);
    if (result.ok) {
      setErrorTop(undefined);
      setCodeError(undefined);
      setState('reset');
      return;
    }
    if (result.code === 'invalid_code') { setErrorTop('Invalid code'); setCodeError('Invalid code'); return; }
    if (result.code === 'too_many_attempts') { setErrorTop(`Too many attempts. Try again in ${result.retryAfterSec}s.`); return; }
    if (result.code === 'expired') { setErrorTop('Code expired. Send again.'); return; }
  };

  const submitNewPassword = () => {
    if (!newPw || !confirmPw) { setPwdError('All fields are required'); return; }
    if (newPw !== confirmPw) { setPwdError('Passwords do not match'); return; }

    const result = resetPassword(email, code, newPw);
    if (result.ok) {
      setPwdError(undefined);
      setState('done');
      closeFlow();
      return;
    }
    if (result.code === 'weak_password') {
      setPwdError('Password too weak (min 8, use 3 of upper/lower/number/symbol).');
      return;
    }
  };

  return {
    open, state,
    email, setEmail,
    code, setCode,
    newPw, setNewPw,
    confirmPw, setConfirmPw,

    errorTop, codeError, pwdError,
    resendIn,

    openFlow, closeFlow,
    sendCode, confirmCode, submitNewPassword, doResend,
  };
}
