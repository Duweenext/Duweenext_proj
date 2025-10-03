// ForgotPasswordFlow.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '../api/hooks/useUser';
import { VerifyCredentialResponse } from '../api/hooks/useAuth';
import ModalChangeInformation from '../component/Modals/ModalChangeInformation';
import { themeStyle } from '@/src/theme';
import { useAuth } from '../auth/context/auth_context';

type Step = 'email' | 'verify' | 'reset-password';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
  startStep?: Step;        // <-- can be 'email' | 'verify' | 'reset-password'
  emailOverride?: string;  // highest precedence if provided
};

const ForgotPasswordFlow: React.FC<Props> = ({
  visible,
  onClose,
  initialEmail,
  startStep = 'verify',
  emailOverride,
}) => {
  const {
    userData,
    sendOtpForgotPassword,
    verifyForgotPasswordOtpCode,
    resetForgotPassword,
    sendOTPForgotPasswordPending,
    verifyForgotPasswordOtpPending,
    resetForgotPasswordPending,
  } = useUser();

  const [localEmail, setLocalEmail] = useState('');
  const [emailError, setEmailError] = useState<string | undefined>();

  // effective email priorities: override > user email > initialEmail > localEmail
  const effectiveEmail = useMemo(
    () => emailOverride || userData?.email || initialEmail || localEmail || '',
    [emailOverride, userData?.email, initialEmail, localEmail]
  );

  const { logout } = useAuth();

  const [step, setStep] = useState<Step>(startStep);
  const [verificationResponse, setVerificationResponse] =
    useState<VerifyCredentialResponse | null>(null);

  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | undefined>();

  const [challengeToken, setChallengeToken] = useState<string | null>(null);

  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [newPwError, setNewPwError] = useState<string | undefined>();
  const [confirmPwError, setConfirmPwError] = useState<string | undefined>();

  // guard against Strict Mode double-fire when auto-sending OTP
  const sentOnceRef = useRef(false);

  // Reset all state on open
  useEffect(() => {
    if (visible) {
      setStep(startStep);
      setVerificationResponse(null);
      setCode('');
      setCodeError(undefined);
      setChallengeToken(null);
      setNewPw('');
      setConfirmPw('');
      setNewPwError(undefined);
      setConfirmPwError(undefined);
      setEmailError(undefined);
      // Keep localEmail so a user can reopen without losing what they typed.
      sentOnceRef.current = false;
    }
  }, [visible, startStep]);

  // If we’re not on the email step and there’s no email, force prompt
  useEffect(() => {
    if (!visible) return;
    if (step === 'email') return;
    if (!effectiveEmail) setStep('email');
  }, [visible, step, effectiveEmail]);

  // Auto-send OTP when on "verify" and we have an email
  useEffect(() => {
    if (!visible) return;
    if (step !== 'verify') return;
    if (!effectiveEmail) return;

    if (sentOnceRef.current) return;
    sentOnceRef.current = true;

    (async () => {
      try {
        if (sendOTPForgotPasswordPending) return;
        const res = await sendOtpForgotPassword(effectiveEmail);
        setVerificationResponse(res);
      } catch (e) {
        console.error('Failed to send forgot password OTP:', e);
        // allow retry if user goes back/forward
        sentOnceRef.current = false;
      }
    })();
  }, [visible, step, effectiveEmail, sendOtpForgotPassword, sendOTPForgotPasswordPending]);

  const onEmailSubmit = async () => {
    setEmailError(undefined);
    const email = localEmail.trim();

    // Simple validation (replace with your own validation/i18n)
    if (!email) { setEmailError('Email is required'); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setEmailError('Invalid email'); return; }

    try {
      if (sendOTPForgotPasswordPending) return;
      // Make localEmail part of effectiveEmail by setting state first
      // (effectiveEmail derives from localEmail at the end of this tick)
      // Then send OTP immediately:
      const res = await sendOtpForgotPassword(email);
      setVerificationResponse(res);
      setStep('verify');
      sentOnceRef.current = true; // prevent the verify-effect from re-sending
    } catch (e) {
      console.error('Failed to send OTP from email submit:', e);
    }
  };

  const onVerifyForgotPasswordOTP = async () => {
    setCodeError(undefined);
    if (!code) { setCodeError('Required'); return; }
    if (!effectiveEmail) { setCodeError('No email associated with account'); return; }
    if (!verificationResponse) { setCodeError('No verification in progress'); return; }

    try {
      const res = await verifyForgotPasswordOtpCode({
        verification_id: verificationResponse.verification_id,
        code,
        email: effectiveEmail,
      });
      setChallengeToken(res.token);
      setCode('');
      setStep('reset-password');
    } catch (error) {
      console.error('Error verifying forgot password OTP:', error);
      setCodeError('Invalid or expired code');
    }
  };

  const onPasswordSubmit = async () => {
    setNewPwError(undefined);
    setConfirmPwError(undefined);

    if (!effectiveEmail) return;
    if (!newPw) { setNewPwError('Required'); return; }
    if (!confirmPw) { setConfirmPwError('Required'); return; }
    if (newPw !== confirmPw) { setConfirmPwError('Passwords do not match'); return; }
    if (!challengeToken) return;

    try {
      await resetForgotPassword({
        email: effectiveEmail,
        newPassword: newPw,
        challenge: challengeToken,
      });
      onClose();
    } catch (error) {
      console.error('Error resetting password:', error);
      setConfirmPwError('Failed to reset password');
    }
  };

  return (
    <>
      {/* STEP 1: Email prompt (only shown if step==='email') */}
      <ModalChangeInformation
        visible={visible && step === 'email'}
        title="Forgot your password?"
        titleColor={themeStyle.colors.primary}
        descriptionText="Enter your account email to receive a verification code."
        email={undefined}
        errorMessage={emailError}
        fields={[
          {
            type: 'text',           // if your component doesn’t support 'email', use 'text'
            name: 'Email',
            placeholder: 'name@example.com',
            value: localEmail,
            onChangeText: (v: string) => {
              setLocalEmail(v);
              if (emailError) setEmailError(undefined);
            },
          },
        ]}
        buttonLoading={sendOTPForgotPasswordPending}
        button={{
          text: 'Send code',
          onPress: onEmailSubmit,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={onClose}
      />

      {/* STEP 2: Verify code */}
      <ModalChangeInformation
        visible={visible && step === 'verify'}
        title="Verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="The verification code has been sent to"
        email={effectiveEmail}
        errorMessage={codeError}
        buttonLoading={verifyForgotPasswordOtpPending}
        fields={[
          { type: 'code', placeholder: '', value: code, onChangeText: setCode },
        ]}
        button={{
          text: 'Confirm',
          onPress: onVerifyForgotPasswordOTP,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={onClose}
      />

      <ModalChangeInformation
        visible={visible && step === 'reset-password'}
        title="Change password"
        titleColor={themeStyle.colors.fail}
        descriptionText="To perform password change please enter information below"
        fields={[
          {
            type: 'password',
            mode: 'password-new',
            name: 'Enter new password',
            placeholder: '••••••••••••',
            value: newPw,
            onChangeText: setNewPw,
            passwordStrengthVisible: true,
          },
          {
            type: 'password',
            mode: 'password-confirm',
            name: 'Confirm new password',
            placeholder: '••••••••••••',
            value: confirmPw,
            onChangeText: setConfirmPw,
            confirmAgainst: newPw,
            passwordStrengthVisible: false,
          },
        ]}
        buttonLoading={resetForgotPasswordPending}
        button={{
          text: 'Confirm',
          onPress: onPasswordSubmit,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={() => {
          logout();  
          onClose();

        }}
      />
    </>
  );
};

export default ForgotPasswordFlow;
