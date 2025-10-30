import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { themeStyle } from '@/theme';
import { useTranslation } from 'react-i18next'; // --- ADDED ---

export default function HelpSupports() {
  const { t } = useTranslation(); // --- ADDED ---

  const section = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.header2,
    color: themeStyle.colors.black,
    marginTop: 16,
    marginBottom: 8,
  } as const;

  const h3 = { // Not used in the current structure, but kept for potential future use
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 12,
    marginBottom: 6,
  } as const;

  const p = {
    fontFamily: themeStyle.fontFamily.regular,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    lineHeight: 22,
    marginBottom: 10,
  } as const;

  const q = {
    fontFamily: themeStyle.fontFamily.semibold,
    fontSize: themeStyle.fontSize.description,
    color: themeStyle.colors.black,
    marginTop: 12,
    marginBottom: 4,
  } as const;

  return (
    <View style={{ flex: 1 }}>
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
            {t('help.introduction')}
          </Text>

          <Text style={section}>{t('help.commonIssuesTitle')}</Text>
          <Text style={p}>
            {t('help.commonIssuesContent')}
          </Text>

          <Text style={section}>{t('help.faqTitle')}</Text>

          <Text style={q}>{t('help.q1')}</Text>
          <Text style={p}>
            {t('help.a1')}
          </Text>

          <Text style={q}>{t('help.q2')}</Text>
          <Text style={p}>
            {t('help.a2')}
          </Text>

          <Text style={q}>{t('help.q3')}</Text>
          <Text style={p}>
            {t('help.a3')}
          </Text>

          <Text style={q}>{t('help.q4')}</Text>
          <Text style={p}>
            {t('help.a4')}
          </Text>

          <Text style={q}>{t('help.q5')}</Text>
          <Text style={p}>
            {t('help.a5')}
          </Text>

          <Text style={q}>{t('help.q6')}</Text>
          <Text style={p}>
            {t('help.a6')}
          </Text>
          <Text style={q}>{t('help.q7')}</Text>
          <Text style={p}>{t('help.a7')}</Text>

          <Text style={q}>{t('help.q8')}</Text>
          <Text style={p}>{t('help.a8')}</Text>

          <Text style={q}>{t('help.q9')}</Text>
          <Text style={p}>{t('help.a9')}</Text>

          <Text style={q}>{t('help.q10')}</Text>
          <Text style={p}>{t('help.a10')}</Text>
          {/* --- END TRANSLATED --- */}
        </View>
      </ScrollView>
    </View>
  );
}