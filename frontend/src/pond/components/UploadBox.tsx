// src/pond/components/UploadBox.tsx
import React from 'react';
import { View, Image, Text, TouchableOpacity } from 'react-native';
import { themeStyle } from '@/src/theme';

type Props = {
  imageUri: string | null;
  status: 'idle' | 'validating' | 'uploading' | 'processing' | 'done' | 'error';
  placeholder: 'default' | 'unsupported' | 'network';
  onReset: () => void;
};

const MSG = {
  default: 'Please insert image to\nbegin analysis',
  unsupported: 'Unsupported file type.\nPlease upload a JPG or PNG image.',
  network: 'Unable to upload image\nPlease check your network\nconnection',
};

export default function UploadBox({ imageUri, status, placeholder, onReset }: Props) {
  return (
    <View style={{
      backgroundColor: themeStyle.colors.white, borderRadius: 10, 
      width: '90%', height: 200, alignSelf: 'center', justifyContent: 'center',
    }}>
      {imageUri ? (
        <>
          <Image source={{ uri: imageUri }} style={{ width: '100%', height: '100%', borderRadius: 8 }} resizeMode="cover" />
          <TouchableOpacity onPress={onReset} style={{
            position: 'absolute', right: 10, top: 10, width: 28, height: 28, borderRadius: 14,
            backgroundColor: themeStyle.colors.primary, alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: themeStyle.colors.white, fontWeight: '700' }}>×</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={{
          textAlign: 'center', color: '#c9c9c9',
          fontFamily: themeStyle.fontFamily.medium,
        }}>{MSG[placeholder]}</Text>
      )}
    </View>
  );
}
