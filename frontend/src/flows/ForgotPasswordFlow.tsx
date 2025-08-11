import React from 'react';
import { themeStyle } from '@/src/theme';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';
import { useForgotPassword } from '../hooks/useForgotPassword';

type Props = {
  visible: boolean;
  onClose: () => void;
  initialEmail?: string;
  startAtVerify?: boolean;  // pass true when you already know the email
  onDone?: () => void;
};

const ForgotPasswordFlow: React.FC<Props> = ({
  visible,
  onClose,
  initialEmail,
  startAtVerify = false,
  onDone,
}) => {
  const {
    state,
    email, setEmail,
    code, setCode,
    newPw, setNewPw,
    confirmPw, setConfirmPw,
    errorTop, pwdError, resendIn,
    openFlow, closeFlow,
    sendCode, confirmCode, submitNewPassword, doResend,
  } = useForgotPassword({ initialEmail, autoStart: startAtVerify, onDone });

  React.useEffect(() => {
    if (visible) openFlow();
    else closeFlow();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  if (state === 'request') {
    return (
      <ModalChangeInformation
        visible
        title="Forgot password"
        titleColor={themeStyle.colors.fail}
        descriptionText="Enter your email to receive a verification code."
        errorMessage={errorTop}
        fields={[
          {
            type: 'text',
            mode: 'text',
            inputKind: 'email',
            name: 'Email',
            placeholder: 'you@example.com',
            value: email,
            onChangeText: setEmail,
          },
        ]}
        button={{
          text: 'Send code',
          onPress: sendCode,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
        onClose={onClose}
      />
    );
  }

  if (state === 'verify') {
    return (
      <ModalChangeInformation
        visible
        title="Verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="The verification code has been sent to"
        email={email}
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
