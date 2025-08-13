// app/auth/signup.tsx (or your route file)
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';

import { themeStyle } from '@/src/theme';
import { images } from '@/constants/images';

import TextFieldPrimary from '@/component-v2/TextFields/TextFieldPrimary';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';
import ButtonGoogle from '@/component-v2/Buttons/ButtonGoogle';
import ButtonUnderline from '@/component-v2/Buttons/ButtonUnderline';

const SignUpScreen: React.FC = () => {
  const router = useRouter();

  // local form state
  const [username, setUsername] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  // simple submit (wire to your API later)
  const onRegister = () => {
    // TODO: replace with your real submit
    console.log('Register ->', { username, email, password });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
      {/* Background (remove if you already provide this globally) */}
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
              // letters-only is enforced by your TextFieldPrimary (validateText)
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              // turn off strength UI for text input
              strengthIndicator={false}
              showStrengthRules={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(60).duration(500)}>
            <TextFieldPrimary
              name="Email"
              type="email"
              placeholder="example@gmail.com"
              value={email}
              onChangeText={setEmail}
              strengthIndicator={false}
              showStrengthRules={false}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <TextFieldPrimary
              name="Password"
              type="password"
              passwordVariant="default"          // no strength meter (matches your screenshot)
              placeholder="••••••••••••"
              value={password}
              onChangeText={setPassword}
              strengthIndicator={true}
              showStrengthRules={true}
            />
          </Animated.View>
        </View>

        {/* Primary button */}
        <View style={{ alignItems: 'center', marginTop: 50 }}>
          <Animated.View entering={FadeInDown.delay(180).duration(500)}>
            <ButtonPrimary
              text="Register"
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
          style={{
            marginTop: 6,
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.data_text,
              marginRight: 4,
            }}
          >
            Already have an account?
          </Text>
          <ButtonUnderline
            text="Log In"
            onPress={() => router.push('/auth/login')}
          />
          <Text
            style={{
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.data_text,
              marginLeft: 4,
            }}
          >
            here.
          </Text>
        </Animated.View>

        {/* Divider */}
        <Animated.Text
          entering={FadeInDown.delay(260).duration(500)}
          style={{
            marginTop: 20,
            textAlign: 'center',
            color: themeStyle.colors.white,
            fontFamily: themeStyle.fontFamily.regular,
            fontSize: themeStyle.fontSize.description,
            opacity: 0.9,
          }}
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

        {/* bottom spacer */}
        <View style={{ height: 16 }} />
      </View>
    </SafeAreaView>
  );
};

export default SignUpScreen;
