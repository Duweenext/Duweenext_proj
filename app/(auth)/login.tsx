import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, StatusBar, ImageBackground, ScrollView, Modal, TouchableOpacity, StyleSheet, Pressable, Alert, Platform } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { jwtDecode } from "jwt-decode";

import { themeStyle } from '@/src/theme';
import { images } from '@/src/constants/images';

import { useAuthentication } from '@/src/api/hooks/useAuth';
import { useAuth } from '@/src/auth/context/auth_context';
import TextFieldPrimary from '@/src/component/TextFields/TextFieldPrimary';
import ButtonUnderline from '@/src/component/Buttons/ButtonUnderline';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import ButtonGoogle from '@/src/component/Buttons/ButtonGoogle';
import { useTranslation } from 'react-i18next';
import i18n from "i18next";
import { z } from "zod";
import ForgotPasswordFlow from '@/src/flows/ForgotPasswordFlow';
import { GoogleAuthProvider, getAuth, signInWithCredential } from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useDeviceStore } from './_local';

const loginSchema = z.object({
  email: z.string().trim().min(1, "errors.emailRequired").email("errors.invalidEmail"),
  password: z.string().trim().min(1, "errors.passwordRequired"),
});

type LoginForm = z.infer<typeof loginSchema>;

const Login: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const deviceToken = useDeviceStore(state => state.deviceToken);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const { login: authLogin } = useAuth();


  const { login: apiLogin, googleLogin } = useAuthentication();

  const [emailError, setEmailError] = React.useState<string | undefined>();
  const [pwdError, setPwdError] = React.useState<string | undefined>();

  const [forgotOpen, setForgotOpen] = React.useState(false);

  const [showErrorPopup, setShowErrorPopup] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

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
      showError(t('auth.googleSignInError'), error.message);
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

  const showError = (title: string, message: string) => {
    console.log('Showing error popup:', title, message);
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

  const onLogin = async () => {
    setEmailError(undefined);
    setPwdError(undefined);

    const result = loginSchema.safeParse({ email, password } as LoginForm);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      if (fieldErrors.email?.[0]) setEmailError(t(fieldErrors.email[0]));
      if (fieldErrors.password?.[0]) setPwdError(t(fieldErrors.password[0]));
      return;
    }

    console.log("Device token from store:", deviceToken);

    const res = await apiLogin({
      Email: email,
      Password: password,
      DeviceToken: deviceToken,
      Platform: Platform.OS === 'ios' ? 'ios' : 'android'
    }).catch((error) => {
      console.error('Login error:', error);
      showError(t('auth.login'), error.message);
    });

    if (res?.token) {
      await authLogin(res.token);
    } else {
      showError(t('auth.login'), t('errors.noToken'));
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
          paddingHorizontal: 18,
          paddingTop: 100,
          paddingBottom: 50
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <Animated.Image
            entering={FadeIn.duration(500)}
            source={images.logo}
            style={{ width: 260, height: 260, borderRadius: 120 }}
          />
        </View>

        <View style={{ gap: 12, alignItems: 'center' }}>
          <Animated.View entering={FadeInDown.delay(80).duration(500)}>
            <TextFieldPrimary
              name={t('auth.email')}
              type="email"
              placeholder={t('auth.placeholder.email')}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (emailError) setEmailError(undefined);
              }}
              errorPlacement="topRight"
              externalError={emailError}
              ruleData={{
                title: t('rules.email.title'),
                description: t('rules.email.description'),
                rules: t('rules.email.items', { returnObjects: true }) as string[]
              }}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(140).duration(500)}>
            <TextFieldPrimary
              name={t('auth.password')}
              type="password"
              passwordVariant="old"
              placeholder={t('auth.placeholder.password')}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (pwdError) setPwdError(undefined);
              }}
              errorPlacement="topRight"
              externalError={pwdError}
              ruleData={{
                title: t('rules.password.title'),
                description: t('rules.password.description'),
                rules: t('rules.password.items', { returnObjects: true }) as string[]
              }}
            />
          </Animated.View>

          <View style={{ paddingHorizontal: 16, marginTop: -6, alignItems: 'center', right: 100 }}>
            <ButtonUnderline text={t('auth.forgotPassword')} onPress={() => setForgotOpen(true)} />
          </View>
          <Text style={{ color: 'white' }}>{t('auth.forgotNeedsEmail')}</Text>
          <Animated.View entering={FadeInDown.delay(200).duration(500)} style={{ alignItems: 'center' }}>
            <ButtonPrimary
              text={t('auth.login')}
              filledColor={themeStyle.colors.primary}
              borderColor={themeStyle.colors.white}
              textColor={themeStyle.colors.white}
              width={230}
              onPress={onLogin}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(260).duration(500)}
            style={{
              marginTop: 10,
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.data_text,
              textAlign: 'center'
            }}
          >
            {t('auth.registerInline.prefix')}{' '}
            <Text
              onPress={() => router.push('/(auth)/signup')}
              style={{
                color: '#40a9ff',
                textDecorationLine: 'underline',
                fontFamily: themeStyle.fontFamily.medium
              }}
            >
              {t('auth.registerInline.link')}
            </Text>{' '}
            {t('auth.registerInline.suffix')}
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(300).duration(500)}
            style={{ textAlign: 'center', color: themeStyle.colors.white, opacity: 0.8, marginTop: 20 }}
          >
            ————————— {t('common.or')} —————————
          </Animated.Text>

          <Animated.View entering={FadeInDown.delay(340).duration(500)} style={{ alignItems: 'center', marginTop: 30 }}>
            <ButtonGoogle
              text={t('auth.googleContinue')}
              borderColor={themeStyle.colors.black}
              onPress={() => onGoogleButtonPress()}
              width={270}
            />
          </Animated.View>
        </View>
      </ScrollView>

      <ForgotPasswordFlow
        visible={forgotOpen}
        onClose={() => setForgotOpen(false)}
        initialEmail={email}
        startStep="email"
      />

      <Modal
        visible={showErrorPopup}
        transparent
        animationType="fade"
        onRequestClose={() => setShowErrorPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity style={styles.modalButton} onPress={() => setShowErrorPopup(false)}>
              <Text style={styles.modalButtonText}>{t('common.ok')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 280,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    color: '#333',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
    lineHeight: 22,
  },
  modalButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Login;
