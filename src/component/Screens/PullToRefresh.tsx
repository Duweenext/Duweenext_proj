// component/PullToRefreshScreen.tsx
import { useGlobalRefresh } from "@/src/api/local/_local";
import React from "react";
import { ScrollView, RefreshControl, StyleSheet } from "react-native";


type Props = { children: React.ReactNode };

export default function PullToRefreshScreen({ children }: Props) {
  const { refreshing, refresh } = useGlobalRefresh();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={refresh}
          progressViewOffset={70}
        />
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1 },
});
