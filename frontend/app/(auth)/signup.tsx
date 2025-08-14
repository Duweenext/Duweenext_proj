// app/auth/signup.tsx
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ImageBackground, Alert } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { themeStyle } from '@/src/theme';
import { images } from '@/constants/images';

import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import ModalChangeInformation from '@/component-v2/Modals/ModalChangeInformation';
import ModalVerificationComplete from '@/component-v2/Modals/ModalVerificationComplete';

const looksLikeEmail = (s?: string) =>
  !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

// ------- Mock API wiring (replace with your real API) -------
async function apiRegister(payload: { username: string; email: string; password: string }) {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
async function apiSendVerifyCode(email: string) {
  await new Promise((r) => setTimeout(r, 400));
  return { ok: true };
}
async function apiVerifyCode(email: string, code: string) {
  await new Promise((r) => setTimeout(r, 400));
  const ok = /^\d{6}$/.test(code);
  if (!ok) throw new Error('Invalid code');
  return { ok: true };
}
// -----------------------------------------------------------

const SignUpScreen: React.FC = () => {
  const router = useRouter();

  // form state
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // errors
  const [usernameErr, setUsernameErr] = React.useState<string | undefined>();
  const [emailErr,    setEmailErr]    = React.useState<string | undefined>();
  const [passwordErr, setPasswordErr] = React.useState<string | undefined>();

  // verification modal state
  const [verifyOpen, setVerifyOpen] = React.useState(false);
  const [sending, setSending] = React.useState(false);
  const [verifyError, setVerifyError] = React.useState<string | undefined>();
  const [resendIn, setResendIn] = React.useState(0);

  // type-safe timer ref
  const resendTimerRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const RESEND_SEC = 30;

  // success modal
  const [doneOpen, setDoneOpen] = React.useState(false);

  // resend timer
  const startResendTimer = React.useCallback(() => {
    setResendIn(RESEND_SEC);
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
      resendTimerRef.current = null;
    }
    resendTimerRef.current = setInterval(() => {
      setResendIn((s) => {
        if (s <= 1) {
          if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
            resendTimerRef.current = null;
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
        resendTimerRef.current = null;
      }
    };
  }, []);

  // validation
  const validate = () => {
    let ok = true;
    setUsernameErr(undefined);
    setEmailErr(undefined);
    setPasswordErr(undefined);

    if (!username.trim()) {
      setUsernameErr('Required');
      ok = false;
    }
    if (!email.trim()) {
      setEmailErr('Required');
      ok = false;
    } else if (!looksLikeEmail(email)) {
      setEmailErr('Invalid email');
      ok = false;
    }
    if (!password.trim()) {
      setPasswordErr('Required');
      ok = false;
    }
    return ok;
  };

  // register -> send code -> open verify modal
  const onRegister = async () => {
    if (!validate()) return;
    try {
      await apiRegister({ username: username.trim(), email: email.trim(), password });
      setSending(true);
      setVerifyError(undefined);
      await apiSendVerifyCode(email.trim());
      startResendTimer();
      setVerifyOpen(true);
    } catch (e: any) {
      Alert.alert('Registration failed', e?.message || 'Please try again.');
    } finally {
      setSending(false);
    }
  };

  // resend handler
  const onPressResend = async () => {
    if (resendIn > 0) return;
    try {
      setVerifyError(undefined);
      await apiSendVerifyCode(email.trim());
      startResendTimer();
    } catch (e: any) {
      setVerifyError(e?.message || 'Failed to resend code.');
    }
  };

  // confirm code
  const [code, setCode] = React.useState('');
  const onConfirmCode = async () => {
    try {
      setVerifyError(undefined);
      await apiVerifyCode(email.trim(), code.trim());
      setVerifyOpen(false);
      setDoneOpen(true);
    } catch (e: any) {
      setVerifyError(e?.message || 'Invalid code');
    }
  };

  // ✅ helper: choose placement based on message (must return 'below', not 'bottom')
  const getErrorPlacement = (err?: string) => (err === 'Required' ? 'topRight' : 'below');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 200 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginTop: 8, marginBottom: 6 }}>
          <Animated.Image
            entering={FadeIn.duration(600)}
            source={images.logo}
            style={{ width: 280, height: 280, borderRadius: 130 }}
          />
        </View>

        {/* Fields */}
        <View style={{ gap: 12, alignItems: 'center' }}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <TextFieldPrimary
              name="Username"
              type="text"
              placeholder="Username"
              value={username}
              onChangeText={(t) => {
                setUsername(t);
                if (usernameErr) setUsernameErr(undefined);
              }}
              strengthIndicator={false}
              showStrengthRules={false}
              errorPlacement={getErrorPlacement(usernameErr)}
              externalError={usernameErr}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(500)}>
            <TextFieldPrimary
              name="Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailErr) setEmailErr(undefined);
              }}
              strengthIndicator={false}
              showStrengthRules={false}
              errorPlacement={getErrorPlacement(emailErr)}
              externalError={emailErr}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <TextFieldPrimary
              name="Password"
              type="password"
              passwordVariant="default"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (passwordErr) setPasswordErr(undefined);
              }}
              strengthIndicator={true}
              showStrengthRules={true}
              errorPlacement={getErrorPlacement(passwordErr)}
              externalError={passwordErr}
            />
          </Animated.View>
        </View>

        {/* Register */}
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Animated.View entering={FadeInDown.delay(180).duration(500)}>
            <ButtonPrimary
              text={sending ? 'Sending…' : 'Register'}
              filledColor={themeStyle.colors.primary}
              borderColor={themeStyle.colors.white}
              textColor={themeStyle.colors.white}
              width={240}
              onPress={onRegister}
            />
          </Animated.View>
        </View>

        {/* Inline login link */}
        <Animated.View
          entering={FadeInDown.delay(220).duration(500)}
          style={{ marginTop: 6, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
        >
          <Text style={{ color: themeStyle.colors.white, marginRight: 4 }}>
            Already have an account?
          </Text>
          <ButtonUnderline text="Log In" onPress={() => router.push('/(auth)/login')} />
          <Text style={{ color: themeStyle.colors.white, marginLeft: 4 }}>
            here.
          </Text>
        </Animated.View>

        {/* Divider */}
        <Animated.Text
          entering={FadeInDown.delay(260).duration(500)}
          style={{ marginTop: 20, textAlign: 'center', color: themeStyle.colors.white, opacity: 0.9 }}
        >
          ——————————— or ———————————
        </Animated.Text>

        {/* Google button */}
        <View style={{ alignItems: 'center', marginTop: 30 }}>
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <ButtonGoogle
              text="Sign up with Google"
              width={280}
              onPress={() => console.log('Google sign up')}
            />
          </Animated.View>
        </View>

        <View style={{ height: 16 }} />
      </View>

      {/* Verification Modal (no email input; uses form email) */}
      <ModalChangeInformation
        visible={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="We have sent a verification code to"
        email={email.trim()}
        errorMessage={verifyError}
        fields={[{ type: 'code', placeholder: '', value: code, onChangeText: setCode }]}
        underlineButton={{
          text: resendIn > 0 ? `Send again (${resendIn}s)` : 'Send again',
          onPress: resendIn > 0 ? () => {} : onPressResend,
        }}
        button={{
          text: 'Confirm',
          onPress: onConfirmCode,
          filledColor: themeStyle.colors.primary,
          textColor: themeStyle.colors.white,
        }}
      />

      {/* Success modal */}
      <ModalVerificationComplete
        title='Verification Complete!'
        subtitle='You will be redirected to Homepage next'
        visible={doneOpen}
        onClose={() => {
          setDoneOpen(false);
          router.replace('/'); // navigate to home/tabs
        }}
      />
    </SafeAreaView>
  );
};

export default SignUpScreen;
