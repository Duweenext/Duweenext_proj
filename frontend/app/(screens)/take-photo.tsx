import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';

export default function TakePhoto() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const camRef = useRef<CameraView>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, [permission]);

  if (!permission) return null;

  if (!permission.granted) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <Text style={{ color: '#333', textAlign: 'center' }}>
          We need your permission to show the camera
        </Text>
        <TouchableOpacity onPress={requestPermission} style={{ marginTop: 16, padding: 12, backgroundColor: '#0a6', borderRadius: 8 }}>
          <Text style={{ color: 'white' }}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const take = async () => {
    try {
      // @ts-ignore capturePhoto is the new API as of SDK 51 (CameraView)
      const photo = await camRef.current?.takePictureAsync?.({ quality: 0.9, skipProcessing: true });
      if (photo?.uri) setPreviewUri(photo.uri);
    } catch (e) { /* handle */ }
  };

  const retake = () => setPreviewUri(null);

  const usePhoto = () => {
    // Send URI back to the check page via route params
    router.replace({ pathname: '/check-pond-health', params: { photoUri: previewUri! } });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {!previewUri ? (
        <>
          <CameraView
            ref={camRef}
            style={{ flex: 1 }}
            facing="back"
          />
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ position: 'absolute', top: 50, left: 20, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: 'white', fontSize: 18 }}>✕</Text>
          </TouchableOpacity>

          {/* Shutter */}
          <View style={{ position: 'absolute', bottom: 40, width: '100%', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={take}
              style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: '#11B183' }}
            />
          </View>
        </>
      ) : (
        <>
          <Image source={{ uri: previewUri }} style={{ flex: 1, resizeMode: 'cover' }} />
          <View style={{ position: 'absolute', bottom: 30, width: '100%', flexDirection: 'row', justifyContent: 'space-evenly' }}>
            <TouchableOpacity onPress={retake} style={{ padding: 14, backgroundColor: 'white', borderRadius: 10 }}>
              <Text>Retake</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={usePhoto} style={{ padding: 14, backgroundColor: '#11B183', borderRadius: 10 }}>
              <Text style={{ color: 'white' }}>Use Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}
