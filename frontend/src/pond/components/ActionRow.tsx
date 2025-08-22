// src/pond/components/ActionRow.tsx
import CardIcon from '@/component-v2/Card/CardIcon';
import React, { JSX } from 'react';
import { View } from 'react-native';

type Props = {
  onCamera(): void;
  onUpload(): void;
  onShare(): void;
  shareDisabled?: boolean;
  RenderButton: (p: { icon: React.ReactNode; onPress: () => void; disabled?: boolean }) => JSX.Element; // use your Button
  icons: { camera: React.ReactNode; upload: React.ReactNode; share: React.ReactNode };
};

export default function ActionRow({ onCamera, onUpload, onShare, shareDisabled, RenderButton, icons }: Props) {
  return (
    <View style={{ flexDirection: 'row', gap: 14, paddingHorizontal: 20, paddingTop: 10 }}>
      <CardIcon icon ={require('../../../assets/images/camera.png')} onPress={onCamera} />
      <CardIcon icon={require('../../../assets/images/upload.png')} onPress={onUpload} />
      <CardIcon icon={require('../../../assets/images/share.png')} onPress={onShare}  />
    </View>
  );
}
