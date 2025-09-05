import React, { useState } from 'react';
import { ScrollView, RefreshControl, View, StyleSheet } from 'react-native';

type PullToRefreshScreenProps = {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
};

export default function PullToRefreshScreen({ onRefresh, children }: PullToRefreshScreenProps) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          progressViewOffset={70} // Moves indicator down from top
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});