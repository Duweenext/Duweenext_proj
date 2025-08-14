// app/auth/login.tsx
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, Alert, ImageBackground } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { themeStyle } from '@/src/theme';
import { images } from '@/constants/images';

import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import ForgotPasswordFlow from '@/src/flows/ForgotPasswordFlow';

// simple email check so we can prefill initialEmail if present
const looksLikeEmail = (s: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((s || '').trim());

const Login: React.FC = () => {
  const router = useRouter();

  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  const [idError, setIdError] = React.useState<string | undefined>();
  const [pwdError, setPwdError] = React.useState<string | undefined>();

  const [forgotOpen, setForgotOpen] = React.useState(false);

  // In your login.tsx file, update the onLogin function:
  const onLogin = () => {
    // console.log('Login attempt:', { identifier, password });
    setIdError(undefined);
    setPwdError(undefined);

    if (!identifier.trim()) setIdError('Required');
    if (!password.trim()) setPwdError('Required');
    if (!identifier.trim() || !password.trim()) return;
    try {
      router.replace('/');
      console.log('Navigation called successfully');
    } catch (error: any) {
      console.error('Navigation error:', error);
      Alert.alert('Navigation Error', `Failed to navigate: ${error.message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <StatusBar barStyle="light-content" />

      <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 100 }}>
        {/* Logo */}
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Animated.Image
            entering={FadeIn.duration(500)}
            source={images.logo}
            style={{ width: 260, height: 260, borderRadius: 120 }}
          />
        </View>

        {/* Form */}
        <View style={{ gap: 12, alignItems: 'center' }}>
          {/* Username / Email */}
          <Animated.View entering={FadeInDown.delay(80).duration(500)}>
            <TextFieldPrimary
              name="Email"
              type="email"
              placeholder="example@gmail.com"
              value={identifier}
              onChangeText={(t) => {
                setIdentifier(t);
                if (idError) setIdError(undefined);
              }}
              errorPlacement="topRight"
              externalError={idError}
            />
          </Animated.View>

          {/* Password (old variant) */}
          <Animated.View entering={FadeInDown.delay(140).duration(500)}>
            <TextFieldPrimary
              name="Password"
              type="password"
              passwordVariant="old"
              placeholder="••••••••••••"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (pwdError) setPwdError(undefined);
              }}
              errorPlacement="topRight"
              externalError={pwdError}
            />
          </Animated.View>

          {/* Forgot password -> skip email step, go straight to verification */}
          <View style={{ paddingHorizontal: 16, marginTop: -6, alignItems: 'center', right: 100 }}>
            <ButtonUnderline text="Forgot password" onPress={() => setForgotOpen(true)} />
          </View>
          <View style={{ maxWidth: 325 }}>
            <Text style={{ color: 'white' }}>To continue with password reset,
              you need to input email first.</Text>
          </View>


          {/* Login button */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={{ alignItems: 'center', marginTop: 80 }}
          >
            <ButtonPrimary
              text="Login"
              filledColor={themeStyle.colors.primary}
              borderColor={themeStyle.colors.white}
              textColor={themeStyle.colors.white}
              width={230}
              onPress={onLogin}
            />
          </Animated.View>

          {/* Register hint */}
          <Animated.Text
            entering={FadeInDown.delay(260).duration(500)}
            style={{
              marginTop: 10,
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.data_text,
              textAlign: 'center',
            }}
          >
            Please{' '}
            <Text
              onPress={() => router.push('/(auth)/signup')}
              style={{
                color: themeStyle.colors.primary,
                textDecorationLine: 'underline',
                fontFamily: themeStyle.fontFamily.medium,
              }}
            >
              register
            </Text>{' '}
            if you have not registered.
          </Animated.Text>

          {/* Divider */}
          <Animated.Text
            entering={FadeInDown.delay(300).duration(500)}
            style={{
              textAlign: 'center',
              color: themeStyle.colors.white,
              opacity: 0.8,
              marginTop: 20,
            }}
          >
            ————————— or —————————
          </Animated.Text>

          {/* Google button */}
          <Animated.View
            entering={FadeInDown.delay(340).duration(500)}
            style={{ alignItems: 'center', marginTop: 30 }}
          >
            <ButtonGoogle
              text="Sign up with Google"
              borderColor={themeStyle.colors.black}
              onPress={() => Alert.alert('Google', 'Google auth (mock)')}
              width={270}
            />
          </Animated.View>
        </View>
      </View>

      {/* Forgot Password flow: force verification step first */}
      <ForgotPasswordFlow
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={identifier}   // from Email TextField
        startStep="verify"          // force verification UI
      />


    </SafeAreaView>
  );
};

export default Login;
