// store/appStore.ts
import { create } from "zustand";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

interface AppState {
  refreshVersion: number;
  bumpRefresh: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  refreshVersion: 0,
  bumpRefresh: () =>
    set((s) => ({ refreshVersion: s.refreshVersion + 1 })),
}));

export function useGlobalRefresh() {
  const bumpRefresh = useAppStore((s) => s.bumpRefresh); // still useful for local-only state
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = async () => {
    setRefreshing(true);

    // 1. bump zustand (for local state listeners)
    bumpRefresh();

    // 2. invalidate queries (forces refetch for all active ones)
    await queryClient.invalidateQueries();

    setRefreshing(false);
  };

  return { refreshing, refresh };
}
