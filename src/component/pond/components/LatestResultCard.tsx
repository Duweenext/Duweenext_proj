// src/pond/components/LatestResultCard.tsx
import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { themeStyle } from '@/src/theme';
import { AnalysisResult, AnalysisStatus } from '../types';

type Props = {
  status: AnalysisStatus;
  result: AnalysisResult | null;
  onOpenEducation?: (slug: string) => void;
};

const LABEL_MAP: Record<string, string> = {
  healthy: 'Healthy',
  excess_fertilizer: 'Excess Fertilizer',
  contamination: 'Contamination Suspected',
  low_oxygen: 'Low Oxygen',
  uncertain: 'Uncertain',
};

export default function LatestResultCard({ status, result, onOpenEducation }: Props) {
  const loading = status === 'uploading' || status === 'processing';

  return (
    <View style={{
      backgroundColor: themeStyle.colors.primary, margin: 16, padding: 16,
      borderRadius: 12, width: '90%', alignSelf: 'center',
    }}>
      <Text style={{ color: themeStyle.colors.white, fontFamily: themeStyle.fontFamily.bold, fontSize: 18, marginBottom: 6 }}>
        Pond Health
      </Text>
      {loading && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <ActivityIndicator />
          <Text style={{ color: themeStyle.colors.white }}>Analyzing…</Text>
        </View>
      )}
      {!loading && result && (
        <>
          <Text style={{ color: themeStyle.colors.white, marginTop: 6 }}>
            Health Status: {LABEL_MAP[result.label] ?? result.label} ({Math.round(result.confidence * 100)}%)
          </Text>
          <Text style={{ color: themeStyle.colors.white, marginTop: 10 }}>{result.tips[0]}</Text>
          {result.educationLinks?.[0] && (
            <Text
              onPress={() => onOpenEducation?.(result.educationLinks[0].slug)}
              style={{ color: '#d8f5ff', marginTop: 12, textDecorationLine: 'underline' }}
            >
              Learn more in Education →
            </Text>
          )}
        </>
      )}
    </View>
  );
}
