import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { theme, themeStyle } from '@/theme';
import { SettingCard } from '@/src/component/Card/SettingCard';
import { useUser } from '@/src/api/hooks/useUser';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';
import { useTranslation } from 'react-i18next';
import { useLang } from '@/src/api/local/_languageConfig';

const Setting: React.FC = () => {
  const router = useRouter();
  const {lang, setLang} = useLang();
  const [langOpen, setLangOpen] = useState(false);
  const { userLanguage, updateLocale } = useUser();

  console.log('userLanguage', userLanguage);
  const { i18n, t } = useTranslation();

  const cardSpacing = 14;

  const onPickLang = async (code: "en" | "th") => {
    setLang(code);
    i18n.changeLanguage(code);
    await updateLocale(code);
    setLangOpen(false);
    console.log('Language changed to:', lang);
  };

  return (
      <View style={{
        flexDirection: 'column',
        marginTop: 20,
        alignItems: 'center'
      }}>
        {/* CARD LIST */}
        <View style={{ gap: cardSpacing, width: '90%' }}>
          <SettingCard
            title={t("Manage Profile")}
            onPress={() => router.push('/(tabs)/(screens)/profile_setting')}
          />
          <SettingCard
            title={t("Manage Notifications")}
            onPress={() => router.push('/(tabs)/(screens)/manage-notifications')}
          />
          <SettingCard
            title={t("Help & Supports")}
            onPress={() => router.push('/(tabs)/(screens)/help-supports')}
          />
          <SettingCard
            title={t("Privacy Policy")}
            onPress={() => router.push('/(tabs)/(screens)/privacy-policy')}
          />
          <SettingCard
            title={t("Terms & Conditions")}
            onPress={() => router.push('/(tabs)/(screens)/terms-conditions')}
          />
        </View>

        {/* LANGUAGE ROW */}
        <View
          style={{
            flexDirection: 'row',
            marginTop: 16,
            backgroundColor: '#fff',
            borderRadius: 5,
            padding: 10,
            width: '90%',
          }}
        >
          <Text
            style={{
              fontSize: themeStyle.fontSize.description,
              fontFamily: themeStyle.fontFamily.medium,
              color: themeStyle.colors.black,
              alignSelf: 'center',
            }}
          >
            {t('Language')}
          </Text>

          <View
            style={{
              width: '100%',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              right: i18n.language === 'en' ? 60 : 40,
            }}
          >
            <Pressable
              onPress={async () => {
                setLangOpen((v) => !v);
                await updateLocale(lang);
              }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingHorizontal: 12,
                height: 40,
                borderWidth: 1,
                borderColor: '#CFCFCF',
                borderRadius: 10,
                minWidth: 160,
                backgroundColor: themeStyle.colors.white,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontFamily: theme.fontFamily.regular,
                  color: '#000',
                }}
              >
                {userLanguage?.language === 'en' ? t('English') : t('Thai (default)')}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#7A7A7A" />
            </Pressable>
          </View>

          {/* Small dropdown panel anchored under the button */}
          {langOpen && (
            <View
              style={{
                position: 'absolute',
                right: 26,
                top: 50,
                backgroundColor: '#fff',
                borderRadius: 10,
                borderWidth: 1,
                borderColor: '#E6E6E6',
                overflow: 'hidden',
                minWidth: 160,
                elevation: 3,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 4,
              }}
            >
              <Pressable
                onPress={() => onPickLang('en')}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                    fontFamily:
                      lang === 'en'
                        ? theme.fontFamily.medium
                        : theme.fontFamily.regular,
                  }}
                >
                  {t('English')}
                </Text>
              </Pressable>
              <View
                style={{
                  height: 1,
                  backgroundColor: '#EEEEEE',
                  marginHorizontal: 10,
                }}
              />
              <Pressable
                onPress={() => onPickLang('th')}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                    fontFamily:
                      lang === 'th'
                        ? theme.fontFamily.medium
                        : theme.fontFamily.regular,
                  }}
                >
                  {t('Thai (default)')}
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
  );
};

export default Setting;
