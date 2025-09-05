// src/pond/components/HistoryList.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View, Platform, Modal, Pressable } from 'react-native'; // 👈 add Platform
import { AnalysisResult } from '../types';
import { themeStyle } from '@/src/theme';
import { PondDiagnoseHistory, PondDiagnoseResponse, usePondHealths } from '@/src/api/hooks/useImageProcessing';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScrollView } from 'react-native-gesture-handler';
type Props = {
  items: PondDiagnoseHistory[];
  onShareItem?: (item: PondDiagnoseHistory) => void;
};

export default function HistoryList({ items, onShareItem }: Props) {
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);

  const webFromRef = useRef<HTMLInputElement | null>(null);
  const webToRef = useRef<HTMLInputElement | null>(null);

  const filteredItems = useMemo(
    () => filterByDateRange(items, fromDate, toDate),
    [items, fromDate, toDate]
  );

  const openFromPicker = () => {
    if (Platform.OS === 'web') {
      const el: any = webFromRef.current;
      if (el?.showPicker) el.showPicker();
      else {
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

  const WebDateInputs = Platform.OS === 'web' ? (
    <>
      {/* @ts-ignore: web-only element */}
      <input
        ref={webFromRef}
        type="date"
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
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

  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6, paddingHorizontal: 14 }}>History</Text>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4,paddingHorizontal: 14 }}>

          <CalendarChip label="From:" value={fromDate} onCalendarPress={openFromPicker} />
          <CalendarChip label="To:" value={toDate} onCalendarPress={openToPicker} />

        </View>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4,paddingHorizontal: 14 }}>
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

      {WebDateInputs}
      <FlatList
        data={filteredItems}
        keyExtractor={(i) => i._id}

        ListHeaderComponentStyle={{ marginBottom: 6 }}
        renderItem={({ item }) => (
          <HistoryCard item={item} onShareItem={onShareItem} />
        )}
        contentContainerStyle={{ paddingBottom: 40 }}
      />
    </View>
  );
}

function HistoryCard({
  item,
  onShareItem,
}: {
  item: PondDiagnoseHistory
  onShareItem?: (i: PondDiagnoseHistory) => void;
}) {
  const { removeHistoryAt } = usePondHealths();
  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      removeHistoryAt(item._ts); // web: call directly
    } else {
      Alert.alert('Delete entry', 'Remove this history item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => removeHistoryAt(item._ts) },
      ]);
    }
  };

  return (
    <View
      style={{
        backgroundColor: themeStyle.colors.white,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 10,
        padding: 12,
        flexDirection: 'row',
        gap: 12,
      }}
    >
      <Image source={{ uri: item.image_uri }} style={{ width: 110, height: 80, borderRadius: 8 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Health Status: {String(item.health_status)}</Text>
        </View>
          <Text style={{ color: '#666' }}>{timeAgo(item._ts)}</Text>
        <Text style={{ marginTop: 6 }} numberOfLines={3}>
          {item.description_and_recommendation}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 16 }}>
          {onShareItem && (
            <TouchableOpacity onPress={() => onShareItem(item)}>
              <Text style={{ color: '#0a6' }}>Share</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={confirmDelete}>
            <Text style={{ color: '#d00' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

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

function timeAgo(ts: number | string | Date) {
  const date = typeof ts === "number" ? new Date(ts) : new Date(ts);
  const diff = Date.now() - date.getTime();

  const min = Math.max(1, Math.round(diff / 60000));
  if (min < 60) return `Last ${min} minute${min > 1 ? "s" : ""}`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `Last ${hr} hour${hr > 1 ? "s" : ""}`;
  const days = Math.round(hr / 24);
  return `Last ${days} day${days > 1 ? "s" : ""}`;
}

const fmt = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy';

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

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);

const endOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

function filterByDateRange<T extends { _ts: number }>(
  items: T[],
  fromDate: Date | null,
  toDate: Date | null
) {
  if (!fromDate && !toDate) return items;

  const fromMs = fromDate ? startOfDay(fromDate).getTime() : -Infinity;
  const toMs   = toDate   ? endOfDay(toDate).getTime()     :  Infinity;

  return items.filter(it => it._ts >= fromMs && it._ts <= toMs);
}
