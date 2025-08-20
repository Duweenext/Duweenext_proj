// src/pond/components/HistoryList.tsx
import React, { useRef } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { AnalysisResult } from '../types';
import { Share } from 'react-native';

type Props = { items: AnalysisResult[]; onShareItem?: (item: AnalysisResult) => void; };

export default function HistoryList({ items, onShareItem }: Props) {
  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.id}
      ListHeaderComponent={<Text style={{ marginLeft: 18, marginTop: 8, fontSize: 18, fontWeight: '700', color: '#fff' }}>History</Text>}
      renderItem={({ item }) => <HistoryCard item={item} onShareItem={onShareItem} />}
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

function HistoryCard({ item, onShareItem }: { item: AnalysisResult; onShareItem?: (i: AnalysisResult) => void }) {
  return (
    <View style={{
      backgroundColor: '#fff', marginHorizontal: 16, marginTop: 12, borderRadius: 10, padding: 12,
      flexDirection: 'row', gap: 12,
    }}>
      <Image source={{ uri: item.imageUri }} style={{ width: 110, height: 80, borderRadius: 8 }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontWeight: '700' }}>Health Status: {item.label}</Text>
          <Text style={{ color: '#666' }}>{timeAgo(item.processedAt)}</Text>
        </View>
        <Text style={{ marginTop: 6 }} numberOfLines={3}>
          {item.tips[0]}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
          <TouchableOpacity onPress={() => onShareItem?.(item)}><Text style={{ color: '#0a6' }}>Share</Text></TouchableOpacity>
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
