import React, { useEffect } from 'react';
import { View, Text, Image, SafeAreaView, StatusBar, ImageBackground } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { themeStyle } from '@/src/theme';
import { images } from '@/src/constants/images';
import ButtonPrimary from '@/src/component/Buttons/ButtonPrimary';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import i18n from '@/src/i18n/i18n.config'; // Adjust the path if your i18n config is elsewhere

const WelcomeScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();

  // useEffect(() => {
  //   i18n.changeLanguage('th'); // try 'en' or 'th'
  // }, []);

  return (
    <ScrollView>
      <SafeAreaView style={{ flex: 1, backgroundColor: themeStyle.colors.black }}>
        <ImageBackground
          source={require('@/assets/images/background.png')}
          style={{ position: 'absolute', width: '100%', height: '100%' }}
          resizeMode="cover"
        />
        <StatusBar barStyle="light-content" />

        <View
          style={{
            flex: 1,
            paddingHorizontal: 15,
            paddingTop: 300,
            paddingBottom: 10,
            justifyContent: 'flex-start',
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
              {t('welcome.appName')}
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
              {t('welcome.tagline')}
            </Animated.Text>
          </View>

          {/* Spacer to control vertical layout */}
          <View style={{ flex: 0.55 }} />

          {/* Buttons */}
          <View
            style={{
              alignItems: 'center',
              gap: 3,
              marginBottom: 5,
              transform: [{ translateY: 15 }],
            }}
          >
            <Animated.View entering={FadeInDown.delay(220).duration(600)}>
              <ButtonPrimary
                text={t('welcome.register')}
                filledColor={themeStyle.colors.primary}
                borderColor={themeStyle.colors.white}
                textColor={themeStyle.colors.white}
                width={230}
                onPress={() => router.push('/(auth)/signup')}
              />
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(280).duration(600)}>
              <ButtonPrimary
                text={t('welcome.login')}
                filledColor={themeStyle.colors.white}
                textColor={themeStyle.colors.black}
                width={230}
                onPress={() => router.push('/(auth)/login')}
              />
            </Animated.View>

            <Animated.Text
              entering={FadeInDown.delay(340).duration(600)}
              style={{
                marginTop: -6,
                color: themeStyle.colors.warning,
                fontFamily: themeStyle.fontFamily.regular,
                fontSize: themeStyle.fontSize.data_text,
                opacity: 0.9,
                textAlign: 'center',
              }}
            >
              {t('welcome.registerHint')}
            </Animated.Text>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  );
};

export default WelcomeScreen;
