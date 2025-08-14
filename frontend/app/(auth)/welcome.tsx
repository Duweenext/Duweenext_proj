import React from 'react';
import { View, Text, Image, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { themeStyle } from '@/src/theme';
import { images } from '@/constants/images';
import ButtonPrimary from '@/component-v2/Buttons/ButtonPrimary';

const WelcomeScreen: React.FC = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
      <ImageBackground
        source={require('../../assets/images/background.png')}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
        resizeMode="cover"
      />
      <StatusBar barStyle="light-content" />

      <View
        style={{
          flex: 1,
          paddingHorizontal: 15,
          paddingTop: 300,      // small top inset
          paddingBottom: 10,
          justifyContent: 'flex-start', // <-- keep everything toward the top
        }}
      >
        {/* Logo + titles */}
        <View style={{ alignItems: 'center', transform: [{ translateY: -20 }] }}>
          <Animated.Image
            entering={FadeIn.duration(600)}
            source={images.logo}
            style={{ width: 260, height: 260, borderRadius: 130, marginBottom: 6 }}
          />

          <Animated.Text
            entering={FadeInDown.delay(80).duration(600)}
            style={{
              fontSize: 36,
              lineHeight: 42,
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.semibold,
              textAlign: 'center',
              marginTop: 20,
            }}
          >
            DuweeNext
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(140).duration(600)}
            style={{
              marginTop: 4,
              fontSize: themeStyle.fontSize.description,
              color: themeStyle.colors.white,
              fontFamily: themeStyle.fontFamily.regular,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Monitor, Prevent & Thrive!
          </Animated.Text>
        </View>

        {/* Spacer to control vertical layout (fine-tune by adjusting flex) */}
        <View style={{ flex: 0.55 }} />

        {/* Buttons */}
        <View
          style={{
            alignItems: 'center',
            gap: 3,
            marginBottom: 5,
            transform: [{ translateY: 15 }], // <-- nudge buttons up
          }}
        >
          <Animated.View entering={FadeInDown.delay(220).duration(600)}>
            <ButtonPrimary
              text="Register"
              filledColor={themeStyle.colors.primary}
              borderColor={themeStyle.colors.white}
              textColor={themeStyle.colors.white}
              width={230}
              onPress={() => router.push('/auth/signup')}
            />
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(280).duration(600)}>
            <ButtonPrimary
              text="Login"
              filledColor={themeStyle.colors.white}
              textColor={themeStyle.colors.black}
              width={230}
              onPress={() => router.push('/auth/login')}
            />
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(340).duration(600)}
            style={{
              marginTop:-6,
              color: themeStyle.colors.warning,
              fontFamily: themeStyle.fontFamily.regular,
              fontSize: themeStyle.fontSize.data_text,
              opacity: 0.9,
              textAlign: 'center',
            }}
          >
            Please register if you do not have an account.
          </Animated.Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;
