// app/auth/login.tsx
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, Alert, ImageBackground, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { themeStyle } from '@/src/theme';
import { images } from '@/constants/images';

import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';
import ForgotPasswordFlow from '@/src/flows/ForgotPasswordFlow';
import { useAuthentication } from '@/src/api/useAuth';
import { useAuth } from '@/src/auth/context/auth_context';

// simple email validation function
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

const Login: React.FC = () => {
  const router = useRouter();

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const {session, user, isAuthenticated, login: authLogin} = useAuth();

  const {login: apiLogin} = useAuthentication();

  const [emailError, setEmailError] = React.useState<string | undefined>();
  const [pwdError, setPwdError] = React.useState<string | undefined>();

  const [forgotOpen, setForgotOpen] = React.useState(false);

  const onLogin = async () => {
    setEmailError(undefined);
    setPwdError(undefined);

    // Validate email format
    console.log(session, user?.email, isAuthenticated)
    if (!email.trim()) {
      setEmailError('Email is required');
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
    
    if (!password.trim()) setPwdError('Password is required');
    
    // Stop if there are validation errors
    if (!email.trim() || !isValidEmail(email) || !password.trim()) return;
    
    try {
      const res = await apiLogin({
        Email: email, // Send email as username for backend compatibility
        Password: password
      });

      console.log('Login successful:', res);
      
      // Store the session in auth context
      // Adjust these property names based on your actual API response structure
      if (res?.token || res?.access_token || res?.jwt) {
        const token = res.token || res.access_token || res.jwt;
        const userData = {
          id: res.user?.id || res.user_id || '1',
          email: email,
          name: res.user?.name || res.username || email.split('@')[0]
        };
        
        await authLogin(token, userData);
        console.log('Session stored successfully');
        console.log('Token:', token);
        console.log('User data:', userData);
      } else {
        console.error('No token found in response:', res);
        Alert.alert('Login Error', 'No authentication token received from server');
      }
      
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

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ 
          flexGrow: 1, 
          paddingHorizontal: 18, 
          paddingTop: 100,
          paddingBottom: 50 
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
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
          {/* Email Field */}
          <Animated.View entering={FadeInDown.delay(80).duration(500)}>
            <TextFieldPrimary
              name="Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (emailError) setEmailError(undefined);
              }}
              errorPlacement="topRight"
              externalError={emailError}
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
            style={{ alignItems: 'center'}}
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
      </ScrollView>

      {/* Forgot Password flow: force verification step first */}
      <ForgotPasswordFlow
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={email}   // from Email TextField
        startStep="verify"          // force verification UI
      />

    </SafeAreaView>
  );
};

export default Login;
