import React from 'react';
import { View, Text, ScrollView } from 'react-native';
// Removed TopBar import as it's commented out
import { themeStyle } from '@/theme';
import { useTranslation } from 'react-i18next'; // --- ADDED ---

export default function PrivacyPolicy() {
  const { t } = useTranslation(); // --- ADDED ---

  const h1 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginBottom: 8,
  } as const;

  const h2 = { // Not used, kept for potential future use
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 14,
    marginBottom: 6,
  } as const;

  const p = {
    fontFamily: themeStyle.fontFamily.regular,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    lineHeight: 22,
    marginBottom: 10,
  } as const;

  return (
    <View style={{ flex: 1 }}>
      {/* <TopBar title="Privacy & Policy" /> */}
      <ScrollView contentContainerStyle={{ paddingVertical: 12 }}>
        <View
          style={{
            backgroundColor: themeStyle.colors.white,
            width: '92%',
            alignSelf: 'center',
            borderRadius: 10,
            padding: 16,
          }}
        >
          {/* --- TRANSLATED --- */}
          <Text style={p}>
            {t('privacy.introduction')}
          </Text>

          <Text style={h1}>{t('privacy.section1Title')}</Text>
          <Text style={p}>
            {t('privacy.section1Content')}
          </Text>

          <Text style={h1}>{t('privacy.section2Title')}</Text>
          <Text style={p}>
            {t('privacy.section2Content')}
          </Text>

          <Text style={h1}>{t('privacy.section3Title')}</Text>
          <Text style={p}>
            {t('privacy.section3Content')}
          </Text>

          <Text style={h1}>{t('privacy.section4Title')}</Text>
          <Text style={p}>
            {t('privacy.section4Content')}
          </Text>

          <Text style={h1}>{t('privacy.section5Title')}</Text>
          <Text style={p}>
            {t('privacy.section5Content')}
          </Text>

          <Text style={h1}>{t('privacy.section6Title')}</Text>
          <Text style={p}>
            {t('privacy.section6Content')}
          </Text>
          {/* --- END TRANSLATED --- */}
        </View>
      </ScrollView>
    </View>
  );
}