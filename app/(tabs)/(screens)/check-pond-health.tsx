// app/(screens)/check-pond-health.tsx
import React, { useEffect, useState } from 'react';
import { View, ScrollView, Share, Text, TouchableOpacity, Modal, Pressable, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from "expo-image-picker";

import { themeStyle } from '@/src/theme';
import UploadBox from '@/src/component/pond/components/UploadBox';
import ActionRow from '@/src/component/pond/components/ActionRow';
import LatestResultCard from '@/src/component/pond/components/LatestResultCard';
import HistoryList from '@/src/component/pond/components/HistoryList';
import { usePondAnalysis } from '@/src/component/pond/usePondAnalysis';
import { mockService } from '@/src/component/pond/services';
import { usePondHealths } from '@/src/api/hooks/useImageProcessing';
import { useTranslation } from 'react-i18next';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';

const IconBtn = ({ icon, onPress, disabled }: any) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={{
      width: 40,
      height: 40,
      borderRadius: 8,
      backgroundColor: themeStyle.colors.white,
      alignItems: 'center',
      justifyContent: 'center',
      opacity: disabled ? 0.4 : 1,
      marginRight: 10,
    }}
  >
    {icon ?? <Text>○</Text>}
  </TouchableOpacity>
);

export default function CheckPondHealthScreen() {
  const router = useRouter();
  const { photoUri } = useLocalSearchParams<{ photoUri?: string }>();

  const {
    status,
    placeholder,
    imageUri,
    latest,
    history,
    pickFromLibrary,
    startAnalysis,
    resetImage,
    setExternalImageUri,
    removeHistoryItem,
  } = usePondAnalysis(mockService);

  const [confirmVisible, setConfirmVisible] = useState(false);
  useEffect(() => { setConfirmVisible(!!imageUri && status !== 'processing' && status !== 'done'); }, [imageUri, status]);

  useEffect(() => {
    if (photoUri && typeof photoUri === 'string') {
      setExternalImageUri(photoUri);
      router.setParams({ photoUri: undefined as any });
    }
  }, [photoUri]);

  const [pendingFile, setPendingFile] = useState<any | null>(null);
  const {t} = useTranslation();

  const { diagnose, diagnoseResult, diagnosing, history_result, removeHistoryAt} = usePondHealths();

  const onRetake = () => { setConfirmVisible(false); setPendingFile(null); };
  const onContinue = async () => {
    setConfirmVisible(false);
    if (!pendingFile) return;
    await diagnose(pendingFile);
  };
  const pickFromCamera = async () => {
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;

    const asset = res.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? "pond.jpg",
      type: asset.mimeType ?? "image/jpeg",
    };

    setPendingFile(file);
    setConfirmVisible(true);
  };

  const pickFromLocalLibrary = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;

    const asset = res.assets[0];
    const file = {
      uri: asset.uri,
      name: asset.fileName ?? "pond.jpg",
      type: asset.mimeType ?? "image/jpeg",
    };

    setPendingFile(file);
    setConfirmVisible(true);
  };

  return (
    <View style={{ flex: 1 }}>
      <PullToRefreshScreen>
      <ScrollView contentContainerStyle={{ paddingBottom: 30, marginTop: 20 }}>
        <Text style={{ color: themeStyle.colors.white, fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.header2, left: 20, marginBottom: 10 }}>
          {t('Determine your pond health')}
        </Text>

        <UploadBox imageUri={!confirmVisible ? pendingFile?.uri : undefined} status={status} placeholder={placeholder} onReset={() => setPendingFile(null)} />

        <ActionRow
          onCamera={pickFromCamera}
          onUpload={pickFromLocalLibrary}
          RenderButton={IconBtn}
          icons={{ camera: <Text>📷</Text>, upload: <Text>⬆️</Text> }}
        />

        <View style={{ marginBottom: 40 }}>
          <LatestResultCard
            loading={diagnosing}
            result={diagnoseResult}
            onOpenEducation={(slug) => router.push(`/education/${slug}` as any)}
          />
        </View>

        <HistoryList
          items={history_result}
          onShareItem={(item) =>
            Share.share({
              message: `${t('Pond check')} • ${new Date(item._ts)}
              ${t('Result')}: ${t(item.health_status) ?? t(item.health_status)}
              ${t('Tip')}: ${item.description_and_recommendation}`,
            })
          }
          onDeleteItem={(id) => removeHistoryAt(id)}
        />
      </ScrollView>

      <Modal animationType="fade" transparent visible={confirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 360, backgroundColor: themeStyle.colors.white, borderRadius: 16, overflow: 'hidden' }}
          >
            {pendingFile ? <Image source={{ uri: pendingFile.uri }} style={{ width: '100%', height: 180 }} resizeMode="cover" /> : null}
            <View style={{ padding: 16 }}>
              <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: 18, marginBottom: 6, color: themeStyle.colors.black }}>{t('Use this photo?')}</Text>
              <Text style={{ color: '#6b7280', marginBottom: 16 }}>{t('Make sure the surface is clear and close-up for best analysis.')}</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onRetake} style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                  <Text style={{ color: '#111827', fontFamily: themeStyle.fontFamily.semibold }}>{t('Upload Again')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onContinue} style={{ flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyle.colors.primary }}>
                  <Text style={{ color: '#fff', fontFamily: themeStyle.fontFamily.semibold }}>{t('Continue')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
      </PullToRefreshScreen>
    </View>
  );
}