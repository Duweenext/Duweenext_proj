// src/pond/usePondAnalysis.ts
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native'; // 👈 add Platform
import * as FileSystem from 'expo-file-system';
import { AnalysisResult, AnalysisStatus, Service } from './types';
import { loadHistory, saveHistory, removeHistoryItemById } from './storage';

const MAX_FILE_MB = 8;

export function usePondAnalysis(service: Service) {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [placeholder, setPlaceholder] = useState<'default' | 'unsupported' | 'network'>('default');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let mounted = true;
    loadHistory().then((h) => mounted && setHistory(h));
    return () => { mounted = false; };
  }, []);

  useEffect(() => () => { if (pollTimer.current) clearTimeout(pollTimer.current); }, []);

  // ✅ accept generic image/* on web to avoid false "unsupported"
  const validateAsset = async (asset: ImagePicker.ImagePickerAsset): Promise<boolean> => {
    try {
      let sizeBytes = asset.fileSize ?? null;
      if (sizeBytes == null) {
        const info = await FileSystem.getInfoAsync(asset.uri, { size: true });
        if (!info.exists) return false;
        sizeBytes = info.size ?? null;
      }
      if (sizeBytes != null) {
        const sizeMB = sizeBytes / (1024 * 1024);
        if (sizeMB > MAX_FILE_MB) {
          Alert.alert('File too large', `Please choose an image smaller than ${MAX_FILE_MB} MB.`);
          return false;
        }
      }

      const isImage = (asset.type ?? '').toLowerCase() === 'image';
      const mime = (asset.mimeType ?? '').toLowerCase();
      const name = (asset.fileName ?? '').toLowerCase();

      const looksLikePngOrJpg =
        mime.includes('png') || mime.includes('jpeg') || mime.includes('jpg') ||
        name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg');

      const looksLikeAnyImage = isImage || mime.startsWith('image/');

      if (!(looksLikePngOrJpg || (Platform.OS === 'web' && looksLikeAnyImage))) {
        setPlaceholder('unsupported');
        return false;
      }
      return true;
    } catch {
      setPlaceholder('unsupported');
      return false;
    }
  };

  const pickFromCamera = useCallback(async () => {
    setPlaceholder('default');
    const { status: camStatus } = await ImagePicker.requestCameraPermissionsAsync();
    if (camStatus !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take a photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 0.9,
      exif: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (!(await validateAsset(asset))) return;
    setImageUri(asset.uri);
    setStatus('idle');
  }, []);

  // ✅ request media library permission first
  const pickFromLibrary = useCallback(async () => {
    setPlaceholder('default');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== 'granted') {
      Alert.alert('Permission required', 'Photo library permission is required to choose an image.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.9,
      allowsMultipleSelection: false,
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    if (!(await validateAsset(asset))) return;
    setImageUri(asset.uri);
    setStatus('idle');
  }, []);

  const setExternalImageUri = useCallback((uri: string) => {
    if (!uri) return;
    setPlaceholder('default');
    setImageUri(uri);
    setStatus('idle');
  }, []);

  const resetImage = () => setImageUri(null);

  const startAnalysis = useCallback(async () => {
    if (!imageUri) return;
    setStatus('uploading');
    try {
      const job = await service.upload(imageUri);
      setStatus('processing');

      const poll = async () => {
        const r = await service.poll(job.jobId);
        if (r.status === 'processing') {
          pollTimer.current = setTimeout(poll, 900);
          return;
        }
        if (r.status === 'failed') {
          setStatus('error');
          setPlaceholder('network');
          return;
        }
        const result: AnalysisResult = {
          id: job.jobId,
          imageUri,
          ...r.result,
        };
        setLatest(result);
        const newHistory = [result, ...history];
        setHistory(newHistory);
        await saveHistory(newHistory);
        setStatus('done');
      };

      poll();
    } catch {
      setStatus('error');
      setPlaceholder('network');
    }
  }, [imageUri, history, service]);

  const removeHistoryItem = useCallback(async (id: string) => {
    setHistory(prev => prev.filter(h => h.id !== id));
    await removeHistoryItemById(id);
    setLatest(prev => (prev?.id === id ? null : prev));
  }, []);

  return {
    status, placeholder, imageUri, latest, history,
    pickFromCamera, pickFromLibrary, startAnalysis, resetImage, setExternalImageUri,
    removeHistoryItem,
  };
}
