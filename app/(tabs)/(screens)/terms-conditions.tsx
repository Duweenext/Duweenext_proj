import React from 'react';
import { View, Text, ScrollView } from 'react-native';
// Removed TopBar import as it's commented out
import { themeStyle } from '@/theme';
import { useTranslation } from 'react-i18next'; // --- ADDED ---

export default function TermsConditions() {
  const { t } = useTranslation(); // --- ADDED ---

  const h1 = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginTop: 10,
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
      {/* <TopBar title="Term & Conditions" /> */}
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
            {t('terms.introduction')}
          </Text>

          <Text style={h1}>{t('terms.section1Title')}</Text>
          <Text style={p}>
            {t('terms.section1Content')}
          </Text>

          <Text style={h1}>{t('terms.section2Title')}</Text>
          <Text style={p}>
            {t('terms.section2Content')}
          </Text>

          <Text style={h1}>{t('terms.section3Title')}</Text>
          <Text style={p}>
            {t('terms.section3Content')}
          </Text>

          <Text style={h1}>{t('terms.section4Title')}</Text>
          <Text style={p}>
            {t('terms.section4Content')}
          </Text>

          <Text style={h1}>{t('terms.section5Title')}</Text>
          <Text style={p}>
            {t('terms.section5Content')}
          </Text>

          <Text style={h1}>{t('terms.section6Title')}</Text>
          <Text style={p}>
            {t('terms.section6Content')}
          </Text>

          <Text style={h1}>{t('terms.section7Title')}</Text>
          <Text style={p}>
            {t('terms.section7Content')}
          </Text>

          <Text style={h1}>{t('terms.section8Title')}</Text>
          <Text style={p}>
            {t('terms.section8Content')}
          </Text>

          <Text style={h1}>{t('terms.section9Title')}</Text>
          <Text style={p}>
            {t('terms.section9Content')}
          </Text>

          <Text style={h1}>{t('terms.section10Title')}</Text>
          <Text style={p}>
            {t('terms.section10Content')}
          </Text>
          {/* --- END TRANSLATED --- */}
        </View>
      </ScrollView>
    </View>
  );
}