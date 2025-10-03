// app/(screens)/notification-history.tsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import {
  View, Text, SectionList, TouchableOpacity, Modal, Pressable, Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Notification } from '@/src/api/hooks/useNotification';
import TopBar from '@/src/component/NavBar/TopBar';
import { themeStyle } from '@/src/theme';
import { CardNotification } from '@/src/component/Card/CardNotification';
import { useNotification } from '@/src/api/hooks/useNotification';
import { t } from 'i18next';
import PullToRefreshScreen from '@/src/component/Screens/PullToRefresh';

// ===== Types =====
type NotificationSeverity = 'info' | 'warning' | 'success' | 'error';
type NotificationItem = { id: string; title: string; headline: string; message: string; createdAt: string; severity?: NotificationSeverity };

// ===== Helpers =====
const fmt = (d?: Date | null) =>
  d ? d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : t('dd/mm/yyyy');
const toLocalTime = (iso: string) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const toLocalDateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
const groupByDate = (items: Notification[]) => {
  const m: Record<string, Notification[]> = {};
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

// ===== Screen =====
export default function NotificationHistoryScreen() {
  // filters
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [webPicker, setWebPicker] = useState<null | 'start' | 'end'>(null);
  const [view, setView] = useState<"active" | "archived">("active");

  const { notifications, resolveNotification, archiveNotification, deleteNotification, getNotifications } = useNotification();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getNotifications();
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getNotifications]);

  const activeNotifications = useMemo(
    () => (notifications || []).filter(n => !n.archived),
    [notifications]
  );
  const archivedNotifications = useMemo(
    () => (notifications || []).filter(n => n.archived),
    [notifications]
  );

  const sections = useMemo(() => {
    let items = view === "active" ? activeNotifications : archivedNotifications;

    if (fromDate) {
      items = items.filter(n => new Date(n.createdAt) >= fromDate);
    }
    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      items = items.filter(n => new Date(n.createdAt) <= to);
    }

    return groupByDate(items);
  }, [view, activeNotifications, archivedNotifications, fromDate, toDate]);

  console.log("notifications", notifications);


  const openFromPicker = () => Platform.OS === 'web' ? setWebPicker('start') : setShowFromPicker(true);
  const openToPicker = () => Platform.OS === 'web' ? setWebPicker('end') : setShowToPicker(true);

  return (
    <PullToRefreshScreen>
      <View style={{ flex: 1 }}>

        <View style={{
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: themeStyle.colors.primary,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: "#374151",
        }}>
          <TouchableOpacity
            onPress={() => setView("active")}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: view === "active" ? 3 : 0,
              borderBottomColor: view === "active" ? "#fff" : "transparent",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t('History')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setView("archived")}
            style={{
              flex: 1,
              alignItems: "center",
              paddingVertical: 8,
              borderBottomWidth: view === "archived" ? 3 : 0,
              borderBottomColor: view === "archived" ? "#fff" : "transparent",
            }}
          >
            <Text style={{ color: "#fff", fontWeight: "600" }}>{t('Archived')}</Text>
          </TouchableOpacity>
        </View>

        {/* Filter row */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4 }}>
          <View style={{ alignSelf: 'flex-start', alignItems: 'flex-start', gap: 8, paddingVertical: 4, paddingHorizontal: 10 }}>
            <Text style={{ color: '#fff' }}>{t('Filter by date')}:</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <CalendarChip label={t('From')} value={fromDate} onCalendarPress={openFromPicker} />
              <CalendarChip label={t('To')} value={toDate} onCalendarPress={openToPicker} />
            </View>
            {(fromDate || toDate) && (
              <TouchableOpacity
                onPress={() => { setFromDate(null); setToDate(null); }}
                style={{ paddingHorizontal: 12, height: 32, borderRadius: 6, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#111827' }}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {Platform.OS !== 'web' && (
            <>
              <NativeCalendarModal visible={showFromPicker} value={fromDate ?? new Date()} onClose={() => setShowFromPicker(false)} onConfirm={setFromDate} maximumDate={toDate ?? undefined} />
              <NativeCalendarModal visible={showToPicker} value={toDate ?? (fromDate ?? new Date())} onClose={() => setShowToPicker(false)} onConfirm={setToDate} minimumDate={fromDate ?? undefined} />
            </>
          )}

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

        <SectionList
          sections={sections}
          keyExtractor={(item, index) => item.id ? String(item.id) : `notification-${index}`}
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
                icon={<Text>⚠️</Text>}
                title={item.title}
                headline={item.title}
                message={item.message}
                time={toLocalTime(item.createdAt)}
                onDelete={async () => {
                  await deleteNotification(item.id);
                }}
                onArchive={async () => {
                  await archiveNotification(item.id);
                }}
                onResolve={async (note) => {
                  if (!item.id || !note) return;
                  await resolveNotification(item.id, note, item.groupId);
                }}
                note={item.note}
                resolvedBy={item.resolvedBy || ''}
              />
            </View>
          )}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={!loading ? <View style={{ padding: 24, alignItems: 'center' }}><Text style={{ color: '#fff' }}>No notifications.</Text></View> : null}
        />
      </View>
    </PullToRefreshScreen>
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
