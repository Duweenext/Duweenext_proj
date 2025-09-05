import React from 'react';
import { Linking, Image } from 'react-native';
import { themeStyle } from '@/src/theme';
import {
  canResend,
  requestDeleteCode,
  resendDeleteCode,
  verifyDeleteCode,
} from '../../src/services/authService.mock';
import ModalChangeInformation from '../component/Modals/ModalChangeInformation';
import ModalSuccessTemplate from '../component/Modals/ModalVerificationComplete';

type Step = 'confirm' | 'password' | 'code' | 'complete' | 'locked';

type Props = {
  visible: boolean;
  onClose: () => void;
  email: string;
  onForgotPassword?: () => void;
  tempCurrentPassword?: string;        // dev only; replace with server call
  onFinished?: (result: 'completed' | 'locked' | 'cancel') => void; // ← report back to parent
};

const hexToRgba = (hex: string, alpha: number) => {
  const c = hex.replace('#', '');
  const f = c.length === 3 ? c.split('').map(x => x + x).join('') : c;
  const n = parseInt(f, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const DeleteAccountFlow: React.FC<Props> = ({
  visible,
  onClose,
  email,
  onForgotPassword,
  tempCurrentPassword = 'Test@1234',
  onFinished,
}) => {
  const [step, setStep] = React.useState<Step>('confirm');

  const [pwd, setPwd] = React.useState('');
  const [pwdErr, setPwdErr] = React.useState<string | undefined>();

  const [code, setCode] = React.useState('');
  const [codeErr, setCodeErr] = React.useState<string | undefined>();

  const [resendIn, setResendIn] = React.useState(0);

  // reset on open/close
  React.useEffect(() => {
    if (!visible) return;
    setStep('confirm');
    setPwd(''); setPwdErr(undefined);
    setCode(''); setCodeErr(undefined);
    setResendIn(0);
  }, [visible]);

  const handleDismissAnd = (result: 'completed' | 'locked' | 'cancel') => {
    onFinished?.(result);
    onClose();
  };

  // actions
  const nextFromConfirm = () => setStep('password');

  const nextFromPassword = () => {
    setPwdErr(undefined);
    if (!pwd) { setPwdErr('Password required'); return; }
    if (pwd !== tempCurrentPassword) { setPwdErr('Incorrect password'); return; }

    requestDeleteCode(email);
    const stat = canResend(email);
    setResendIn(stat.secs);
    setStep('code');
  };

  React.useEffect(() => {
    if (resendIn <= 0) return;
    const id = setInterval(() => setResendIn(s => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [resendIn]);

  const resend = () => {
    if (resendIn > 0) return;
    resendDeleteCode(email);
    const stat = canResend(email);
    setResendIn(stat.secs);
    setCode('');
    setCodeErr(undefined);
  };

  const confirmDelete = () => {
    if (!code) { setCodeErr('Code required'); return; }
    const res = verifyDeleteCode(email, code);
    if (res.ok) { setStep('complete'); return; }
    if (res.code === 'invalid_code') { setCodeErr('Incorrect code'); return; }
    if (res.code === 'expired') { setCodeErr('Code expired. Send again.'); return; }
    if (res.code === 'too_many_attempts') { setStep('locked'); return; }
  };

  if (!visible) return null;

  if (step === 'confirm') {
    return (
      <ModalChangeInformation
        visible
        title="Delete Account"
        titleColor={themeStyle.colors.fail}
        titleIcon={
            <Image
            source={{ uri: 'https://png.pngtree.com/png-vector/20220813/ourmid/pngtree-rounded-flat-vector-icon-of-a-red-trash-can-vector-png-image_19495792.png' }}
            style={{ width: 50, height: 50, tintColor: themeStyle.colors.fail }}
            resizeMode="contain"
            />
        }
        descriptionText="Are you sure you want to delete this account?"
        button={{
          text: 'Continue',
          onPress: nextFromConfirm,
          filledColor: themeStyle.colors.fail,
          textColor: themeStyle.colors.white,
        }}
        onClose={() => handleDismissAnd('cancel')}
      />
    );
  }

  if (step === 'password') {
    return (
      <ModalChangeInformation
        visible
        title="Delete account"
        titleColor={themeStyle.colors.fail}
        descriptionText="To perform email change please verify yourself"
        instructionText="Enter password below"
        errorMessage={pwdErr}
        fields={[
          {
            type: 'password',
            mode: 'password-old',
            placeholder: 'Enter password',
            value: pwd,
            onChangeText: setPwd,
          },
        ]}
        underlineButton={{
          text: 'Forgot password',
          onPress: onForgotPassword || (() => {}),
        }}
        button={{
          text: 'Next',
          onPress: nextFromPassword,
          filledColor: '#000000',
          textColor: '#FFFFFF',
        }}
        onClose={() => handleDismissAnd('cancel')}
      />
    );
  }

  if (step === 'code') {
    return (
      <ModalChangeInformation
        visible
        title="Are you sure you want to delete your account ?"
        titleColor={themeStyle.colors.fail}
        descriptionText="The verification code has been sent to"
        email={email}
        errorMessage={codeErr}
        fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
        underlineButton={{
          text: resendIn > 0 ? `Send again (${resendIn}s)` : 'Send again',
          onPress: resend,
        }}
        button={{
          text: 'Delete',
          onPress: confirmDelete,
          filledColor: themeStyle.colors.fail,
          textColor: themeStyle.colors.white,
        }}
        onClose={() => handleDismissAnd('cancel')}
      />
    );
  }

  if (step === 'complete') {
    return (
     <ModalSuccessTemplate
        visible
        title="Account deletion complete"
        subtitle="Your account will be deleted within 7 days. You can still recover it during this time."
        primaryColor={themeStyle.colors.primary}
        autoDismissMs={2000}
        onClose={() => handleDismissAnd('completed')} 
        />

    );
  }

  // locked
  return (
    <ModalChangeInformation
      visible
      title="You have input the wrong verification code more than 5 times"
      titleColor={themeStyle.colors.fail}
      descriptionText="You won't be able to delete this account for the next 24 hours."
      underlineButton={{
        text: 'Contact our team',
        onPress: () => Linking.openURL('https://example.com/support'),
      }}
      button={{
        text: 'Dismiss',
        onPress: () => handleDismissAnd('locked'),
        filledColor: themeStyle.colors.fail,
        textColor: themeStyle.colors.white,
      }}
      onClose={() => handleDismissAnd('locked')}
    />
  );
};

export default DeleteAccountFlow;
