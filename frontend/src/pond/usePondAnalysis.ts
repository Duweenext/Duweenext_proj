// src/pond/usePondAnalysis.ts
import * as ImagePicker from 'expo-image-picker';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { AnalysisResult, AnalysisStatus, Service } from './types';
import { loadHistory, saveHistory } from './storage';

const MAX_FILE_MB = 8;
const ALLOWED_MIME = ['image/jpeg', 'image/png'];

export function usePondAnalysis(service: Service) {
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [placeholder, setPlaceholder] = useState<'default' | 'unsupported' | 'network'>('default');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [latest, setLatest] = useState<AnalysisResult | null>(null);
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // init history
  useMemo(() => { loadHistory().then(setHistory); }, []);

  const validateFile = async (uri: string): Promise<boolean> => {
    try {
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      if (!info.exists) return false;
      const sizeMB = (info.size ?? 0) / (1024 * 1024);
      if (sizeMB > MAX_FILE_MB) {
        Alert.alert('File too large', `Please choose an image less than ${MAX_FILE_MB} MB.`);
        return false;
      }
      // On Expo we often don’t get mime easily; guard by extension as best-effort
      if (!(uri.endsWith('.jpg') || uri.endsWith('.jpeg') || uri.endsWith('.png'))) {
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
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Camera permission is required to take a photo.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      allowsEditing: false, quality: 0.9, exif: false,
    });
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    if (!(await validateFile(uri))) return;
    setImageUri(uri);
  }, []);

  const pickFromLibrary = useCallback(async () => {
    setPlaceholder('default');
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.9,
    });
    if (res.canceled) return;
    const uri = res.assets[0].uri;
    if (!(await validateFile(uri))) return;
    setImageUri(uri);
  }, []);

  const resetImage = () => setImageUri(null);

  const startAnalysis = useCallback(async () => {
    if (!imageUri) return;
    setStatus('uploading');
    try {
      const job = await service.upload(imageUri);
      setStatus('processing');
      // Polling
      const poll = async () => {
        const r = await service.poll(job.jobId);
        if (r.status === 'processing') {
          pollTimer.current = setTimeout(poll, 900);
          return;
        }
        if (r.status === 'failed') {
          setStatus('error'); setPlaceholder('network');
          return;
        }
        // success
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
      setStatus('error'); setPlaceholder('network');
    }
  }, [imageUri, history, service]);

  return {
    // state
    status, placeholder, imageUri, latest, history,
    // actions
    pickFromCamera, pickFromLibrary, startAnalysis, resetImage,
  };
}
