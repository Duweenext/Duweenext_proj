// src/pond/components/HistoryList.tsx
import React from 'react';
import { Alert, FlatList, Image, Text, TouchableOpacity, View, Platform } from 'react-native'; // 👈 add Platform
import { AnalysisResult } from '../types';
import { themeStyle } from '@/src/theme';

type Props = {
  items: AnalysisResult[];
  header?: React.ReactNode;
  onShareItem?: (item: AnalysisResult) => void;
  onDeleteItem?: (id: string) => void;
};

export default function HistoryList({ items, header, onShareItem, onDeleteItem }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      ListHeaderComponent={() =>
        header ? (
          <>{header}</>
        ) : (
          <Text style={{ marginLeft: 18, marginTop: 8, fontSize: 18, fontWeight: '700', color: '#fff' }}>
            History
          </Text>
        )
      }
      ListHeaderComponentStyle={{ marginBottom: 6 }}
      renderItem={({ item }) => (
        <HistoryCard item={item} onShareItem={onShareItem} onDeleteItem={onDeleteItem} />
      )}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

function HistoryCard({
  item,
  onShareItem,
  onDeleteItem,
}: {
  item: AnalysisResult;
  onShareItem?: (i: AnalysisResult) => void;
  onDeleteItem?: (id: string) => void;
}) {
  const confirmDelete = () => {
    if (Platform.OS === 'web') {
      onDeleteItem?.(item.id); // web: call directly
    } else {
      Alert.alert('Delete entry', 'Remove this history item?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => onDeleteItem?.(item.id) },
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
      <Image source={{ uri: item.imageUri }} style={{ width: 110, height: 80, borderRadius: 8 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Health Status: {String(item.label)}</Text>
          <Text style={{ color: '#666' }}>{timeAgo(item.processedAt)}</Text>
        </View>
        <Text style={{ marginTop: 6 }} numberOfLines={3}>
          {item.tips?.[0]}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8, gap: 16 }}>
          {onShareItem && (
            <TouchableOpacity onPress={() => onShareItem(item)}>
              <Text style={{ color: '#0a6' }}>Share</Text>
            </TouchableOpacity>
          )}
          {onDeleteItem && (
            <TouchableOpacity onPress={confirmDelete}>
              <Text style={{ color: '#d00' }}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.max(1, Math.round(diff / 60000));
  if (min < 60) return `Last ${min} minute${min > 1 ? 's' : ''}`;
  const hr = Math.round(min / 60);
  return `Last ${hr} hour${hr > 1 ? 's' : ''}`;
}
