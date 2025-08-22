// app/(screens)/check-pond-health.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Share, Text, TouchableOpacity, Modal, Pressable, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { themeStyle } from '@/src/theme';
import TopBar from '@/component-v2/NavBar/TopBar';
import UploadBox from '@/src/pond/components/UploadBox';
import ActionRow from '@/src/pond/components/ActionRow';
import LatestResultCard from '@/src/pond/components/LatestResultCard';
import HistoryList from '@/src/pond/components/HistoryList';
import { usePondAnalysis } from '@/src/pond/usePondAnalysis';
import { mockService } from '@/src/pond/services';

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

// dd/mm/yyyy
const fmt = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy';

const CalendarChip = ({
  label,
  value,
  onCalendarPress,
}: {
  label: string;
  value: Date | null;
  onCalendarPress: () => void;
}) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 10,
      height: 32,
      borderRadius: 6,
      backgroundColor: themeStyle.colors.white,
      minWidth: 160,
      justifyContent: 'space-between',
    }}
  >
    <Text style={{ fontSize: 12, color: '#6b7280' }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text>{fmt(value)}</Text>
      <TouchableOpacity onPress={onCalendarPress} accessibilityRole="button" accessibilityLabel={`Open ${label} calendar`}>
        <Text style={{ fontSize: 16 }}>📅</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/** iOS/Android modal calendar */
function CalendarModal({
  visible,
  value,
  onClose,
  onConfirm,
  minimumDate,
  maximumDate,
}: {
  visible: boolean;
  value: Date;
  onClose: () => void;
  onConfirm: (d: Date) => void;
  minimumDate?: Date;
  maximumDate?: Date;
}) {
  const [temp, setTemp] = useState<Date>(value);
  useEffect(() => { if (visible) setTemp(value); }, [visible, value]);

  if (Platform.OS === 'web') return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 18 }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{ width: '100%', maxWidth: 360, borderRadius: 16, overflow: 'hidden', backgroundColor: themeStyle.colors.white }}
        >
          <View style={{ padding: 10 }}>
            <DateTimePicker
              value={temp}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={(event, d) => {
                if (Platform.OS === 'android') {
                  if ((event as any)?.type === 'set' && d) onConfirm(d);
                  onClose();
                } else {
                  if (d) setTemp(d);
                }
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
            {Platform.OS === 'ios' && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <TouchableOpacity
                  onPress={onClose}
                  style={{ paddingHorizontal: 14, height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => { onConfirm(temp); onClose(); }}
                  style={{ paddingHorizontal: 14, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyle.colors.primary }}
                >
                  <Text style={{ color: '#fff' }}>Select</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

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

  // ===== Date state =====
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  // ---- WEB: invisible inputs that open the native calendar immediately ----
  const webFromRef = useRef<HTMLInputElement | null>(null);
  const webToRef   = useRef<HTMLInputElement | null>(null);

  // Render hidden inputs only on web (no modal, no extra click)
  const WebDateInputs = Platform.OS === 'web' ? (
    <>
      {/* @ts-ignore: web-only element */}
      <input
        ref={webFromRef}
        type="date"
        // keep in DOM & focusable, but fully transparent + tiny -> avoids the “white line”
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          // ensure not clipped by parent
          zIndex: -1,
        }}
        value={fromDate ? toISO(fromDate) : ''}
        max={toDate ? toISO(toDate) : undefined}
        onChange={(e: any) => {
          const d = parseISO(e.target.value);
          if (d) setFromDate(d);
        }}
      />
      {/* @ts-ignore: web-only element */}
      <input
        ref={webToRef}
        type="date"
        style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
        value={toDate ? toISO(toDate) : ''}
        min={fromDate ? toISO(fromDate) : undefined}
        onChange={(e: any) => {
          const d = parseISO(e.target.value);
          if (d) setToDate(d);
        }}
      />
    </>
  ) : null;

  const openFromPicker = () => {
    if (Platform.OS === 'web') {
      const el: any = webFromRef.current;
      if (el?.showPicker) el.showPicker();
      else {
        // fallback: focus to let user open calendar by keyboard
        el?.focus?.();
      }
    } else {
      setShowFromPicker(true);
    }
  };

  const openToPicker = () => {
    if (Platform.OS === 'web') {
      const el: any = webToRef.current;
      if (el?.showPicker) el.showPicker();
      else el?.focus?.();
    } else {
      setShowToPicker(true);
    }
  };

  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const ts = new Date(h.processedAt).getTime();
      if (fromDate) {
        const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
        if (ts < start.getTime()) return false;
      }
      if (toDate) {
        const end = new Date(toDate); end.setHours(23, 59, 59, 999);
        if (ts > end.getTime()) return false;
      }
      return true;
    });
  }, [history, fromDate, toDate]);

  const historyHeader = (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
      <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 }}>History</Text>

      <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 10 }}>
        <Text style={{ color: '#fff' }}>Filter history:</Text>

        <CalendarChip label="From:" value={fromDate} onCalendarPress={openFromPicker} />
        <CalendarChip label="To:" value={toDate} onCalendarPress={openToPicker} />

        {(fromDate || toDate) && (
          <TouchableOpacity
            onPress={() => { setFromDate(null); setToDate(null); }}
            style={{ paddingHorizontal: 12, height: 32, borderRadius: 6, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
          >
            <Text style={{ color: '#111827' }}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mobile (iOS/Android) calendar popups */}
      {Platform.OS !== 'web' && (
        <>
          <CalendarModal
            visible={showFromPicker}
            value={fromDate ?? new Date()}
            onClose={() => setShowFromPicker(false)}
            onConfirm={(d) => setFromDate(d)}
            maximumDate={toDate ?? undefined}
          />
          <CalendarModal
            visible={showToPicker}
            value={toDate ?? (fromDate ?? new Date())}
            onClose={() => setShowToPicker(false)}
            onConfirm={(d) => setToDate(d)}
            minimumDate={fromDate ?? undefined}
          />
        </>
      )}

      {/* Invisible web inputs that we trigger with showPicker() */}
      {WebDateInputs}
    </View>
  );

  const shareResult = async (payload?: { text?: string }) => {
    const text = payload?.text ?? (latest
      ? `Pond check • ${new Date(latest.processedAt).toLocaleString()}
Result: ${latest.label} (${Math.round(latest.confidence * 100)}%)
Tip: ${latest.tips[0]}`
      : 'Duweenext pond check');
    await Share.share({ message: text });
  };

  const onRetake = () => { setConfirmVisible(false); resetImage(); };
  const onContinue = async () => { setConfirmVisible(false); await startAnalysis(); };

  return (
    <View style={{ flex: 1 }}>
      <TopBar title="Check Pond Health" />
      <ScrollView contentContainerStyle={{ paddingBottom: 30, marginTop: 20 }}>
        <Text style={{ color: themeStyle.colors.white, fontFamily: themeStyle.fontFamily.semibold, fontSize: themeStyle.fontSize.header2, left: 20, marginBottom: 10 }}>
          Determine your pond health
        </Text>

        <UploadBox imageUri={imageUri} status={status} placeholder={placeholder} onReset={resetImage} />

        <ActionRow
          onCamera={() => router.push('/take-photo')}
          onUpload={pickFromLibrary}
          RenderButton={IconBtn}
          icons={{ camera: <Text>📷</Text>, upload: <Text>⬆️</Text> }}
        />

        <View style={{ marginBottom: 40 }}>
          <LatestResultCard
            status={status}
            result={latest}
            onOpenEducation={(slug) => router.push(`/education/${slug}` as any)}
          />
        </View>

        <HistoryList
          header={historyHeader}
          items={filteredHistory}
          onShareItem={(item) =>
            Share.share({
              message: `Pond check • ${new Date(item.processedAt).toLocaleString()}
Result: ${item.label} (${Math.round(item.confidence * 100)}%)
Tip: ${item.tips[0]}`,
            })
          }
          onDeleteItem={(id) => removeHistoryItem(id)}
        />
      </ScrollView>

      {/* Confirm Modal */}
      <Modal animationType="fade" transparent visible={confirmVisible} onRequestClose={() => setConfirmVisible(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 }}
          onPress={() => setConfirmVisible(false)}
        >
          <Pressable
            onPress={(e) => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 360, backgroundColor: themeStyle.colors.white, borderRadius: 16, overflow: 'hidden' }}
          >
            {imageUri ? <Image source={{ uri: imageUri }} style={{ width: '100%', height: 180 }} resizeMode="cover" /> : null}
            <View style={{ padding: 16 }}>
              <Text style={{ fontFamily: themeStyle.fontFamily.bold, fontSize: 18, marginBottom: 6, color: themeStyle.colors.black }}>Use this photo?</Text>
              <Text style={{ color: '#6b7280', marginBottom: 16 }}>Make sure the surface is clear and close-up for best analysis.</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity onPress={onRetake} style={{ flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' }}>
                  <Text style={{ color: '#111827', fontFamily: themeStyle.fontFamily.semibold }}>Upload Again</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onContinue} style={{ flex: 1, height: 44, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyle.colors.primary }}>
                  <Text style={{ color: '#fff', fontFamily: themeStyle.fontFamily.semibold }}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

/** Helpers for web input attributes */
function toISO(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(s: string) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  const out = new Date(y, m - 1, d);
  return isNaN(out.getTime()) ? null : out;
}
