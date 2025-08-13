// src/flows/ForgotPasswordFlow.tsx
import React from 'react';
import { Alert } from 'react-native';
import { themeStyle } from '@/src/theme';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';
import { useForgotPassword } from '../hooks/useForgotPassword';

type StartStep = 'email' | 'verify' | 'reset';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;       // email from login screen
  startAtVerify?: boolean;     // legacy flag
  startStep?: StartStep;       // 'verify' to skip email step
  onDone?: () => void;
};

const looksLikeEmail = (s?: string) =>
  !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const ForgotPasswordFlow: React.FC<Props> = ({
  visible,
  onClose,
  initialEmail,
  startAtVerify = false,
  startStep, // 'verify' | 'reset' | 'email'
  onDone,
}) => {
  // Lock the email from parent (login field)
  const lockedEmail = React.useMemo(
    () => (initialEmail ? initialEmail.trim() : ''),
    [initialEmail]
  );

  // Null-safe check for verify step
  const isVerifyStep = (startStep ?? '') === 'verify';

  // Should we auto-start by sending code immediately?
  const autoStart = isVerifyStep || !!startAtVerify;

  const {
    state,
    email, setEmail,
    code, setCode,
    newPw, setNewPw,
    confirmPw, setConfirmPw,
    errorTop, pwdError, resendIn,
    openFlow, closeFlow,
    sendCode, confirmCode, submitNewPassword, doResend,
  } = useForgotPassword({
    initialEmail: lockedEmail,
    autoStart,
    onDone,
  });

  // Open/close lifecycle
  React.useEffect(() => {
    if (visible) openFlow();
    else closeFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // Ensure we have a valid email and auto-send code when needed
  const sentOnceRef = React.useRef(false);

  React.useEffect(() => {
    if (!visible) return;

    // Validate email from parent field
    if (!looksLikeEmail(lockedEmail)) {
      Alert.alert(
        'Email required',
        'Please enter a valid email in the Email field on the login screen before resetting your password.'
      );
      onClose?.();
      return;
    }

    // Keep hook email in sync with lockedEmail
    if (email !== lockedEmail) setEmail(lockedEmail);

    // Auto-send code once per open
    if ((autoStart || isVerifyStep) && !sentOnceRef.current) {
      sentOnceRef.current = true;
      sendCode(); // any error will surface via errorTop
    }

    // Reset flag when modal closes
    if (!visible) sentOnceRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, lockedEmail, email, autoStart, isVerifyStep]);

  if (!visible) return null;

  // ---- RENDERING ----
  // Force the Verify UI if caller requested startStep="verify"
  // (or legacy startAtVerify=true), regardless of internal state,
  // so the user immediately sees the code input modal.
  const showVerifyUI = isVerifyStep || state === 'verify';

  if (showVerifyUI) {
    return (
      <ModalChangeInformation
        visible
        title="Verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="The verification code has been sent to"
        email={lockedEmail}
        errorMessage={errorTop}
        fields={[
          { type: 'code', placeholder: '', value: code, onChangeText: setCode },
        ]}
        underlineButton={{
          text: resendIn > 0 ? `Send again (${resendIn}s)` : 'Send again',
          onPress: resendIn > 0 ? () => {} : doResend,
        }}
        button={{
          text: 'Confirm',
          onPress: confirmCode,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={onClose}
      />
    );
  }

  // If not forcing verify and the hook is still preparing/sending,
  // show a minimal "sending" screen (no inputs).
  if (state === 'request') {
    return (
      <ModalChangeInformation
        visible
        title="Sending verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="We’re sending a verification code to:"
        email={lockedEmail}
        instructionText={errorTop ? 'We could not send the code. Please try again.' : 'Please wait...'}
        errorMessage={undefined}
        fields={[]}
        button={
          errorTop
            ? {
                text: 'Try again',
                onPress: sendCode,
                filledColor: themeStyle.colors.primary,
                textColor: themeStyle.colors.white,
              }
            : undefined
        }
        onClose={onClose}
      />
    );
  }

  // RESET STATE
  return (
    <ModalChangeInformation
      visible
      title="Change password"
      titleColor={themeStyle.colors.fail}
      descriptionText="To perform password change please enter information below"
      errorMessage={pwdError}
      fields={[
        {
          type: 'password',
          mode: 'password-new',
          name: 'Enter new password',
          placeholder: '••••••••••••',
          value: newPw,
          onChangeText: setNewPw,
        },
        {
          type: 'password',
          mode: 'password-confirm',
          name: 'Confirm new password',
          placeholder: '••••••••••••',
          value: confirmPw,
          onChangeText: setConfirmPw,
          confirmAgainst: newPw,
        },
      ]}
      button={{
        text: 'Confirm',
        onPress: submitNewPassword,
        filledColor: themeStyle.colors.primary,
        textColor: themeStyle.colors.white,
      }}
      onClose={onClose}
    />
  );
};

export default ForgotPasswordFlow;
