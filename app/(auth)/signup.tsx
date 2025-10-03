// app/auth/signup.tsx
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, SafeAreaView, StatusBar, ImageBackground, Alert, ScrollView, Platform } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { themeStyle } from '@/src/theme';
import { images } from '@/src/constants/images';

import { useAuth } from '@/src/auth/context/auth_context';
import { useAuthentication } from '@/src/api/hooks/useAuth';
import TextFieldPrimary from '@/src/component/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import ButtonUnderline from '@/src/component/Buttons/ButtonUnderline';
import ButtonGoogle from '@/src/component/Buttons/ButtonGoogle';
import ModalChangeInformation from '@/src/component/Modals/ModalChangeInformation';
import ModalVerificationComplete from '@/src/component/Modals/ModalVerificationComplete';
import PasswordStrengthMeter, { usePasswordStrength } from '@/src/component/TextFields/PasswordStrength/PasswordStrength';
import { emailRules, passwordRules, usernameRules } from '@/src/component/TextFields/PasswordStrength/rule';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDeviceStore } from './_local';

const looksLikeEmail = (s?: string) =>
  !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const SignUpScreen: React.FC = () => {
  const router = useRouter();
  const deviceToken = useDeviceStore(state => state.deviceToken);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [usernameErr, setUsernameErr] = useState<string | undefined>();
  const [emailErr, setEmailErr] = useState<string | undefined>();
  const [passwordErr, setPasswordErr] = useState<string | undefined>();

  const [verifyOpen, setVerifyOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>();
  const [resendIn, setResendIn] = useState(0);

  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const RESEND_SEC = 30;

  const [doneOpen, setDoneOpen] = useState(false);
  const { login: authLogin } = useAuth();
  const { register: apiRegister, verificationResponse, verifyEmail, verifyEmailError, resendVerificationEmail, googleLogin } = useAuthentication();

  const { strength, color, percent } = usePasswordStrength(password);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '17967520741-mkjuqt3486ft1lhhlv65qp6lujhvot5g.apps.googleusercontent.com',
      iosClientId: '17967520741-5bcdj687vhnv0knbhhtaa0q5a3pph35t.apps.googleusercontent.com',
    });
  }, []);

  async function onGoogleButtonPress() {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    await GoogleSignin.signOut();

    const signInResult = await GoogleSignin.signIn().then((user) => {
      return user;
    }).catch((error) => {
      console.error('Google Sign-In error:', error);
      throw error;
    });

    const idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token found');
    }

    const googleCredential = GoogleAuthProvider.credential(idToken);

    const res = await googleLogin({
      id_token: idToken,
      device_token: deviceToken,
      platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });

    await authLogin(res.token);

    return signInWithCredential(getAuth(), googleCredential);
  }

  const startResendTimer = useCallback(() => {
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
    if (strength === 'Weak') {
      setPasswordErr('Password too weak');
      ok = false;
    }
    return ok;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setVerifyOpen(true);
    const res = await apiRegister({ 
      UserName: username.trim(), 
      Email: email.trim(), 
      Password: password,
      DeviceToken: deviceToken,
      Platform: Platform.OS === 'ios' ? 'ios' : 'android',
    });
  }

  const onPressResend = async () => {
    if (resendIn > 0) return;
    try {
      setVerifyError(undefined);
      const res = await resendVerificationEmail(email.trim());
      startResendTimer();
    } catch (e: any) {
      setVerifyError(e?.message || 'Failed to resend code.');
    }
  };

  const [code, setCode] = React.useState('');
  const onConfirmCode = async () => {
    if (!code.trim()) {
      setVerifyError('Please enter the code');
      return;
    }
    if (verificationResponse?.verification_id === undefined) {
      setVerifyError('No verification ID found. Please register again.');
      return;
    }
    try {
      setVerifyError(undefined);
      const res = await verifyEmail({ verification_id: verificationResponse?.verification_id, code });
      if (res?.token) {
        const token = res.token;
        setVerifyOpen(false);
        setDoneOpen(true);
        await authLogin(token);
      } else {
        console.log('Registration successful but no token returned - might need verification');
      }
    } catch (e: any) {
      setVerifyError(verifyEmailError || 'Invalid code');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
      <ImageBackground
        source={require('@/assets/images/background.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 16,
          paddingTop: 50,
          paddingBottom: 50
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
              showStrengthRules={false}
              errorPlacement={'topRight'}
              externalError={usernameErr}
              ruleData={usernameRules}
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
              showStrengthRules={false}
              errorPlacement={'topRight'}
              externalError={emailErr}
              ruleData={emailRules}
            />
          </Animated.View>
          <View style={{ alignItems: 'center', width: '100%' }}>
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
                showStrengthRules={true}
                errorPlacement={'topRight'}
                externalError={passwordErr}
                ruleData={passwordRules}
              />
            </Animated.View>
            {!!password && (
              <PasswordStrengthMeter
                strength={strength}
                color={color}
                percent={percent}
                width={325}
                showLabel
              />
            )}
          </View>
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
              onPress={onSubmit}
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
              onPress={() => onGoogleButtonPress()}
            />
          </Animated.View>
        </View>

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* Verification Modal (no email input; uses form email) */}
      <ModalChangeInformation
        visible={verifyOpen}
        onClose={() => setVerifyOpen(false)}
        title="Verification code"
        titleColor={themeStyle.colors.primary}
        descriptionText="We have sent a verification code to"
        email={email.trim()}
        errorMessage={verifyError}
        fields={[{ type: 'code', placeholder: '', value: code, onChangeText: (t) => setCode(t) }]}
        underlineButton={{
          text: resendIn > 0 ? `Send again (${resendIn}s)` : 'Send again',
          onPress: resendIn > 0 ? () => { } : onPressResend,
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
