// src/pond/components/LatestResultCard.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { themeStyle } from '@/src/theme';
import { AnalysisResult, AnalysisStatus } from '../types';
import { PondDiagnoseResponse } from '@/src/api/hooks/useImageProcessing';
import { useTranslation } from 'react-i18next';
import { t } from 'i18next';

type Props = {
  loading: boolean;
  result: PondDiagnoseResponse | undefined;
  onOpenEducation?: (slug: string) => void;
};

const LABEL_MAP: Record<string, string> = {
  healthy: t('Healthy'),
  excess_fertilizer: t('Excess Fertilizer'),
  contamination: t('Contamination Suspected'),
  low_oxygen: t('Low Oxygen'),
  uncertain: t('Uncertain'),
};

export default function LatestResultCard({ loading, result, onOpenEducation }: Props) {

  const {t} = useTranslation();

  return (
    <View style={{
      backgroundColor: themeStyle.colors.primary, margin: 16, padding: 16,
      borderRadius: 12, width: '90%', alignSelf: 'center',
    }}>
      <Text style={{ color: themeStyle.colors.white, fontFamily: themeStyle.fontFamily.bold, fontSize: 18, marginBottom: 6 }}>
        {t('Pond Health')}
      </Text>
      {loading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ActivityIndicator />
          <Text style={{ color: themeStyle.colors.white }}>{t('Analyzing…')}</Text>
        </View>
      )}
      {!loading && result && (
        <>
          <Text style={{ color: themeStyle.colors.white, marginTop: 6 }}>
            {/* Health Status: {LABEL_MAP[result.health_status] ?? result.health_status} ({Math.round(result.detected_classes * 100)}%) */}
            {t('Health Status')}: {t(LABEL_MAP[result.health_status]) ?? t(result.health_status)}
          </Text>
          <Text style={{ color: themeStyle.colors.white, marginTop: 10 }}>{result.description_and_recommendation}</Text>
          {/* {result.educationLinks?.[0] && (
            <Text
              onPress={() => onOpenEducation?.(result.educationLinks[0].slug)}
              style={{ color: '#d8f5ff', marginTop: 12, textDecorationLine: 'underline' }}
            >
              Learn more in Education →
            </Text>
          )} */}
        </>
      )}
    </View>
  );
}
