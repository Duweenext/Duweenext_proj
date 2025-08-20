// src/pond/components/ActionRow.tsx
import CardIcon from '@/component-v2/Card/CardIcon';
import React from 'react';
import { View } from 'react-native';

type Props = {
  onCamera(): void;
  onUpload(): void;
  RenderButton: (p: { icon: React.ReactNode; onPress: () => void; disabled?: boolean }) => JSX.Element; // your button renderer
  icons: { camera: React.ReactNode; upload: React.ReactNode }; // ✅ removed share
};

export default function ActionRow({ onCamera, onUpload }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingTop: 8 }}>
      <CardIcon icon={require('../../../assets/images/camera.png')} onPress={onCamera} />
      <CardIcon icon={require('../../../assets/images/upload.png')} onPress={onUpload} />
      {/* ❌ Removed share button */}
    </View>
  );
}
