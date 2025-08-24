// app/auth/login.tsx
import React from 'react';
import { View, Text, SafeAreaView, StatusBar, ImageBackground, ScrollView, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import axios from 'axios'; // Import axios to check for AxiosError

import { themeStyle } from '@/src/theme';
import { images } from '@/src/constants/images';

import ForgotPasswordFlow from '@/src/flows/ForgotPasswordFlow';
import { useAuthentication } from '@/src/api/hooks/useAuth';
import { useAuth } from '@/src/auth/context/auth_context';
import TextFieldPrimary from '@/src/component/TextFields/TextFieldPrimary';
import ButtonUnderline from '@/src/component/Buttons/ButtonUnderline';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import ButtonGoogle from '@/src/component/Buttons/ButtonGoogle';

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
  
  // Custom popup states
  const [showErrorPopup, setShowErrorPopup] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Helper function to show custom popup
  const showError = (title: string, message: string) => {
    console.log('Showing error popup:', title, message); // Debug log
    setErrorTitle(title);
    setErrorMessage(message);
    setShowErrorPopup(true);
  };

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
        showError('Login Error', 'No authentication token received from server');
      }
      
      console.log('Navigation called successfully');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Check if it's an axios error with 401 status
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        
        if (status === 401) {
          // Show specific popup for wrong email/password
          console.log("Unauthorized 401 ");
          showError(
            'Login Failed',
            'Email or password is incorrect. Please check your credentials and try again.'
          );
        } else if (status === 400) {
          // Handle other client errors
          showError(
            'Login Error',
            error.response?.data?.message || 'Please check your input and try again.'
          );
        } else if (status && status >= 500) {
          // Handle server errors
          showError(
            'Server Error',
            'Something went wrong on our end. Please try again later.'
          );
        } else {
          // Handle other HTTP errors
          showError(
            'Login Error',
            error.response?.data?.message || 'An error occurred during login. Please try again.'
          );
        }
      } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network')) {
        // Handle network errors
        showError(
          'Network Error',
          'Please check your internet connection and try again.'
        );
      } else {
        // Handle other errors
        showError(
          'Login Error',
          error.message || 'An unexpected error occurred. Please try again.'
        );
      }
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
              onPress={() => showError('Google', 'Google auth (mock)')}
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

      {/* Custom Error Popup Modal */}
      <Modal
        visible={showErrorPopup}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowErrorPopup(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{errorTitle}</Text>
            <Text style={styles.modalMessage}>{errorMessage}</Text>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowErrorPopup(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

// Modal styles for custom popup
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
