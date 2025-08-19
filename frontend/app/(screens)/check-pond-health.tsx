// app/(screens)/check-pond-health.tsx
import React, { useRef } from 'react';
import { View, ScrollView, Share } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { themeStyle } from '@/src/theme';
import TopBar from '@/component-v2/NavBar/TopBar';
import UploadBox from '@/src/pond/components/UploadBox';
import ActionRow from '@/src/pond/components/ActionRow';
import LatestResultCard from '@/src/pond/components/LatestResultCard';
import HistoryList from '@/src/pond/components/HistoryList';
import { usePondAnalysis } from '@/src/pond/usePondAnalysis';
import { mockService } from '@/src/pond/services';


// TODO: replace with your own small icon buttons
import { Text, TouchableOpacity } from 'react-native';
const IconBtn = ({ icon, onPress, disabled }: any) => (
  <TouchableOpacity onPress={onPress} disabled={disabled} style={{
    width: 40, height: 40, borderRadius: 8, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1,
    marginRight: 10
  }}>
    {icon ?? <Text>○</Text>}
  </TouchableOpacity>
);

export default function CheckPondHealthScreen() {
  const router = useRouter();
  const { status, placeholder, imageUri, latest, history,
    pickFromCamera, pickFromLibrary, startAnalysis, resetImage } = usePondAnalysis(mockService);

  // SHARE (latest or via history)
  const shareResult = async (payload?: { text?: string; uri?: string }) => {
    // minimal text share; you can upgrade to view-shot snapshot later
    const text = payload?.text ?? (latest
      ? `Pond check • ${new Date(latest.processedAt).toLocaleString()}
Result: ${latest.label} (${Math.round(latest.confidence * 100)}%)
Tip: ${latest.tips[0]}`
      : 'Duweenext pond check');
    await Share.share({ message: text });
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeStyle.colors.primary }}>
      <TopBar title='Check Pond Health' />
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <UploadBox imageUri={imageUri} status={status} placeholder={placeholder} onReset={resetImage} />

        <ActionRow
          onCamera={pickFromCamera}
          onUpload={pickFromLibrary}
          onShare={() => shareResult()}
          shareDisabled={!latest}
          RenderButton={IconBtn}
          icons={{ camera: <Text>📷</Text>, upload: <Text>⬆️</Text>, share: <Text>🔗</Text> }}
        />

        {/* Confirm controls (Retake / Continue) when image chosen but not analyzed yet */}
        {imageUri && status !== 'processing' && status !== 'done' && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16, marginTop: 14 }}>
            <IconBtn icon={<Text>↺</Text>} onPress={resetImage} />
            <IconBtn icon={<Text>▶︎</Text>} onPress={startAnalysis} />
          </View>
        )}

        <LatestResultCard
          status={status}
          result={latest}
          onOpenEducation={(slug) => router.push(`/education/${slug}` as any)}
        />

        <HistoryList
          items={history}
          onShareItem={(item) =>
            Share.share({
              message: `Pond check • ${new Date(item.processedAt).toLocaleString()}
Result: ${item.label} (${Math.round(item.confidence * 100)}%)
Tip: ${item.tips[0]}`,
            })
          }
        />
      </ScrollView>
    </View>
  );
}
