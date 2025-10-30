import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

type Props = {
  children: React.ReactNode;
  onRefresh: () => Promise<any>; 
};

export default function PullToRefreshScreen({ children, onRefresh }: Props) {
  const [refreshing, setRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);

  const handleRefresh = useCallback(async () => {
    if (canRefresh === false) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('PullToRefresh failed:', error);
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if (yOffset === 0) {
      setCanRefresh(true);
    } else {
      setCanRefresh(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      onScroll={handleScroll}
      scrollEventThrottle={16}
      bounces={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#227C71" 
          colors={['#227C71', '#4CAF50']} 
          progressViewOffset={70}
          enabled={canRefresh}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});