// app/(screens)/notification-history.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, Modal, Pressable, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import TopBar from '@/component-v2/NavBar/TopBar';
import { CardNotification } from '@/component-v2/Card/CardNotification';
import { themeStyle } from '@/src/theme';

// ===== Types =====
type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';
type NotificationItem = { id: string; title: string; headline: string; message: string; createdAt: string; severity?: NotificationSeverity };

// ===== Helpers =====
const fmt = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'dd/mm/yyyy';
const toLocalTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const toLocalDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const groupByDate = (items: NotificationItem[]) => {
  const m: Record<string, NotificationItem[]> = {};
  items.forEach(n => (m[toLocalDateLabel(n.createdAt)] ||= []).push(n));
  return Object.entries(m)
    .sort((a, b) => +new Date(b[1][0].createdAt) - +new Date(a[1][0].createdAt))
    .map(([title, data]) => ({ title, data: data.sort((x, y) => +new Date(y.createdAt) - +new Date(x.createdAt)) }));
};

// ===== Calendar chip (same UX) =====
const CalendarChip = ({ label, value, onCalendarPress }: { label: string; value: Date | null; onCalendarPress: () => void }) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, height: 32,
    borderRadius: 6, backgroundColor: themeStyle.colors.white, minWidth: 160, justifyContent: 'space-between',
  }}>
    <Text style={{ fontSize: 12, color: '#6b7280' }}>{label}</Text>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text>{fmt(value)}</Text>
      <TouchableOpacity onPress={onCalendarPress} accessibilityRole="button" accessibilityLabel={`Open ${label} calendar`}>
        <Text style={{ fontSize: 16 }}>📅</Text>
      </TouchableOpacity>
    </View>
  </View>
);

// ===== Native (iOS/Android) modal calendar =====
function NativeCalendarModal({
  visible, value, onClose, onConfirm, minimumDate, maximumDate,
}: { visible: boolean; value: Date; onClose: () => void; onConfirm: (d: Date) => void; minimumDate?: Date; maximumDate?: Date }) {
  const [temp, setTemp] = useState<Date>(value);
  useEffect(() => { if (visible) setTemp(value); }, [visible, value]);
  if (Platform.OS === 'web') return null;
  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 18 }} onPress={onClose}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ width: '100%', maxWidth: 360, borderRadius: 16, overflow: 'hidden', backgroundColor: themeStyle.colors.white }}>
          <View style={{ padding: 10 }}>
            <DateTimePicker
              value={temp}
              mode="date"
              display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
              onChange={(event, d) => {
                if (Platform.OS === 'android') {
                  if ((event as any)?.type === 'set' && d) onConfirm(d);
                  onClose();
                } else if (d) setTemp(d);
              }}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
            />
            {Platform.OS === 'ios' && (
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
                <TouchableOpacity onPress={onClose} style={{ paddingHorizontal: 14, height: 40, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}>
                  <Text>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { onConfirm(temp); onClose(); }} style={{ paddingHorizontal: 14, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: themeStyle.colors.primary }}>
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

// ===== WEB top‑center date picker trigger =====
function WebCalendarPortal({
  visible, mode, defaultValue, min, max, onClose, onConfirm,
}: {
  visible: boolean; mode: 'start' | 'end'; defaultValue: Date | null; min?: Date | null; max?: Date | null;
  onClose: () => void; onConfirm: (d: Date) => void;
}) {
  const ref = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !visible) return;
    const el = ref.current as any;
    // open immediately, anchored where the input is (top center)
    if (el?.showPicker) setTimeout(() => el.showPicker(), 0);
    else setTimeout(() => el?.click?.(), 0);
  }, [visible]);

  if (Platform.OS !== 'web' || !visible) return null;

  return (
    // blocker: click outside closes; positioned so the anchor input sits top‑center
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.0)', // transparent so only native picker is seen
        zIndex: 9999,
      }}
    >
      {/* anchor container at top center (under TopBar) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: 88,          // tweak if your TopBar height differs
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10000,
        }}
      >
        {/* @ts-ignore web-only */}
        <input
          ref={ref}
          type="date"
          // visually invisible but focusable (1×1) -> no “weird box”
          style={{
            width: 1, height: 1,
            opacity: 0, border: 0, outline: 'none',
            background: 'transparent', color: 'transparent',
            padding: 0, margin: 0,
          }}
          defaultValue={defaultValue ? toISO(defaultValue) : ''}
          min={min ? toISO(min) : undefined}
          max={max ? toISO(max) : undefined}
          onChange={(e: any) => {
            const d = parseISO(e.target.value);
            if (d) onConfirm(d);
            onClose();
          }}
          onBlur={onClose}
        />
      </div>
    </div>
  );
}

// ===== Mock backend (unchanged) =====
const MOCK: NotificationItem[] = [
  { id: 'n1', title: 'DuweeNext', headline: 'Your pond EC value is too low!', message: 'Please add fertilizer to the ponds now.', createdAt: '2025-01-13T02:02:00.000Z', severity: 'warning' },
  { id: 'n2', title: 'DuweeNext', headline: 'Your pond pH value is too high!', message: 'Please add fertilizer to the ponds now.', createdAt: '2025-01-10T12:49:00.000Z', severity: 'warning' },
  { id: 'n3', title: 'DuweeNext', headline: 'Your pond Temperature value is too high!', message: 'Please add fertilizer to the ponds now.', createdAt: '2025-01-10T15:07:00.000Z', severity: 'warning' },
  { id: 'n4', title: 'DuweeNext', headline: 'Your Wolffia is ready to be harvested!', message: 'Great job keeping the pond healthy.', createdAt: '2025-01-07T09:08:00.000Z', severity: 'success' },
  { id: 'n5', title: 'DuweeNext', headline: 'Aerator power usage is high', message: 'Consider checking your schedule settings.', createdAt: '2025-01-06T06:18:00.000Z', severity: 'info' },
  { id: 'n6', title: 'DuweeNext', headline: 'Water level dropped quickly', message: 'Inspect for leakage or evaporation.', createdAt: '2025-01-05T18:34:00.000Z', severity: 'warning' },
  { id: 'n7', title: 'DuweeNext', headline: 'IoT sensor offline', message: 'We lost connection to sensor #A2.', createdAt: '2025-01-04T10:10:00.000Z', severity: 'error' },
  { id: 'n8', title: 'DuweeNext', headline: 'pH back to normal', message: 'Values are within range.', createdAt: '2025-01-03T07:25:00.000Z', severity: 'success' },
];

type FetchParams = { page: number; pageSize: number; startDate?: string; endDate?: string; };
async function fetchNotifications({ page, pageSize, startDate, endDate }: FetchParams): Promise<NotificationItem[]> {
  const start = startDate ? +new Date(startDate) : -Infinity;
  const end   = endDate   ? +new Date(endDate)   : +Infinity;
  const filtered = MOCK.filter(n => {
    const t = +new Date(n.createdAt); return t >= start && t <= end;
  }).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
  const startIdx = (page - 1) * pageSize;
  await new Promise(r => setTimeout(r, 120));
  return filtered.slice(startIdx, startIdx + pageSize);
}
async function deleteNotification(id: string) {
  const idx = MOCK.findIndex(x => x.id === id); if (idx >= 0) MOCK.splice(idx, 1);
  await new Promise(r => setTimeout(r, 80));
}

// ===== Screen =====
export default function NotificationHistoryScreen() {
  // filters
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [webPicker, setWebPicker] = useState<null | 'start' | 'end'>(null);

  // data
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const loadPage = useCallback(async (reset = false) => {
    if (loading) return;
    setLoading(true);
    const startISO = fromDate ? new Date(new Date(fromDate).setHours(0,0,0,0)).toISOString() : undefined;
    const endISO   = toDate   ? new Date(new Date(toDate).setHours(23,59,59,999)).toISOString() : undefined;
    const p = reset ? 1 : page;
    const res = await fetchNotifications({ page: p, pageSize: 6, startDate: startISO, endDate: endISO });
    setItems(prev => (reset ? res : [...prev, ...res]));
    setHasMore(res.length === 6);
    setPage(prev => (reset ? 2 : prev + 1));
    setLoading(false);
  }, [page, fromDate, toDate, loading]);

  useEffect(() => { loadPage(true); }, [fromDate?.toISOString(), toDate?.toISOString()]);

  const handleDelete = useCallback(async (id: string) => {
    const snap = items;
    setItems(prev => prev.filter(n => n.id !== id));
    try { await deleteNotification(id); } catch { setItems(snap); }
  }, [items]);

  const sections = useMemo(() => groupByDate(items), [items]);
  const iconFor = (s?: NotificationSeverity) =>
    s === 'warning' ? <Text style={{ fontSize: 18 }}>⚠️</Text> :
    s === 'success' ? <Text style={{ fontSize: 18 }}>🌾</Text> :
    s === 'error'   ? <Text style={{ fontSize: 18 }}>⛔️</Text> :
                      <Text style={{ fontSize: 18 }}>ℹ️</Text>;

  const openFromPicker = () => Platform.OS === 'web' ? setWebPicker('start') : setShowFromPicker(true);
  const openToPicker   = () => Platform.OS === 'web' ? setWebPicker('end')   : setShowToPicker(true);

  return (
    <View style={{ flex: 1 }}>
      <TopBar title="Notification" />

      {/* Filter row */}
      <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
        <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, paddingHorizontal: 10 }}>
          <Text style={{ color: '#fff' }}>Filter by date:</Text>
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

        {/* Native pickers */}
        {Platform.OS !== 'web' && (
          <>
            <NativeCalendarModal visible={showFromPicker} value={fromDate ?? new Date()} onClose={() => setShowFromPicker(false)} onConfirm={setFromDate} maximumDate={toDate ?? undefined} />
            <NativeCalendarModal visible={showToPicker}   value={toDate ?? (fromDate ?? new Date())} onClose={() => setShowToPicker(false)}   onConfirm={setToDate}   minimumDate={fromDate ?? undefined} />
          </>
        )}

        {/* Web top-center anchor (no weird box) */}
        <WebCalendarPortal
          visible={Platform.OS === 'web' && webPicker === 'start'}
          mode="start"
          defaultValue={fromDate}
          max={toDate}
          onClose={() => setWebPicker(null)}
          onConfirm={(d) => setFromDate(d)}
        />
        <WebCalendarPortal
          visible={Platform.OS === 'web' && webPicker === 'end'}
          mode="end"
          defaultValue={toDate ?? fromDate}
          min={fromDate}
          onClose={() => setWebPicker(null)}
          onConfirm={(d) => setToDate(d)}
        />
      </View>

      {/* List */}
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={{ color: '#d1d5db', marginVertical: 10, marginLeft: 4, fontFamily: themeStyle.fontFamily.medium }}>
            {title}
          </Text>
        )}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 12 }}>
            <CardNotification
              icon={iconFor(item.severity)}
              title={item.title}
              headline={item.headline}
              message={item.message}
              time={toLocalTime(item.createdAt)}
              onDelete={() => handleDelete(item.id)}
            />
          </View>
        )}
        onEndReached={() => hasMore && loadPage()}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={!loading ? <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: '#fff' }}>No notifications.</Text></View> : null}
      />
    </View>
  );
}

/** Web helpers */
function toISO(d: Date) {
  const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function parseISO(s: string) {
  if (!s) return null;
  const [y, m, d] = s.split('-').map(Number);
  const out = new Date(y, m - 1, d);
  return isNaN(out.getTime()) ? null : out;
}
