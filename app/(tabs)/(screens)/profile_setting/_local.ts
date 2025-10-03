// src/stores/emailChange.store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import * as SecureStore from "expo-secure-store";
import type { VerifyCredentialResponse } from "@/src/api/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { AppState, Platform } from "react-native";

export type EmailChangeStep = "verify-code-old-email" | "change-email" | "verify-code-new-email";

type State = {
  step: EmailChangeStep | null;
  verificationResponse: VerifyCredentialResponse | null;
  challengeToken: string | null;
  newEmail: string;
  expiresAt: number | null; // epoch ms
};

type Actions = {
  saveStep: (p: Partial<Omit<State, "expiresAt">> & { step: EmailChangeStep; ttlMs?: number }) => void;
  clear: () => void;
};

const hasWindow = typeof window !== "undefined";
const webStorage = {
  getItem: async (k: string) => (hasWindow ? window.localStorage.getItem(k) : null),
  setItem: async (k: string, v: string) => { if (hasWindow) window.localStorage.setItem(k, v); },
  removeItem: async (k: string) => { if (hasWindow) window.localStorage.removeItem(k); },
};

// Native secure storage
const nativeSecureStorage = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};

// Pick one at runtime. Also guard against “shimmed” SecureStore on web.
const isNative = Platform.OS === "ios" || Platform.OS === "android";
const secureStoreLooksValid =
  typeof (SecureStore as any)?.getItemAsync === "function" &&
  typeof (SecureStore as any)?.setItemAsync === "function" &&
  typeof (SecureStore as any)?.deleteItemAsync === "function";

export const crossPlatformStorage =
  isNative && secureStoreLooksValid ? nativeSecureStorage : webStorage;

export const useEmailChangeStore = create<State & Actions>()(
  persist(
    (set) => ({
      step: null,
      verificationResponse: null,
      challengeToken: null,
      newEmail: "",
      expiresAt: null,

      // merge fields + set TTL
      saveStep: ({ ttlMs = 15 * 60_000, ...p }) =>
        set((s) => ({
          ...s,
          ...p,
          expiresAt: Date.now() + ttlMs,
        })),

      clear: () =>
        set({
          step: null,
          verificationResponse: null,
          challengeToken: null,
          newEmail: "",
          expiresAt: null,
        }),
    }),
    {
      name: "persistemailChange",
      storage: createJSONStorage(() => crossPlatformStorage),
      partialize: (s) => ({
        step: s.step,
        verificationResponse: s.verificationResponse,
        challengeToken: s.challengeToken,
        newEmail: s.newEmail,
        expiresAt: s.expiresAt,
      }),
    }
  )
);

// helpers
export function msRemaining(expiresAt: number | null) {
  return Math.max(0, (expiresAt ?? 0) - Date.now());
}
export function formatMMSS(ms: number) {
  const s = Math.floor(ms / 1000);
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}


export function useEmailChangeAutoExpire() {
  const expiresAt = useEmailChangeStore((s) => s.expiresAt);
  const clear = useEmailChangeStore((s) => s.clear);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!expiresAt) return;

    const left = msRemaining(expiresAt);
    if (left === 0) {
      clear();
      return;
    }

    // one-shot clear exactly at expiry
    timeoutRef.current = setTimeout(() => {
      clear();
      timeoutRef.current = null;
    }, left);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [expiresAt, clear]);

  // also clear if user returns and time already passed
  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active" && expiresAt && msRemaining(expiresAt) === 0) {
        clear();
      }
    });
    return () => sub.remove();
  }, [expiresAt, clear]);
}

export function useCountdown(expiresAt: number | null) {
  const [ms, setMs] = useState(() => msRemaining(expiresAt));
  useEffect(() => {
    const tick = () => setMs(msRemaining(expiresAt));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  return ms;
}

export function getDeletionCountdown(permanentDeletionAt: string) {
  const expireAt = new Date(permanentDeletionAt).getTime();
  const now = Date.now();

  const remainingMs = expireAt - now;
  const expired = remainingMs <= 0;

  const remainingDays = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
  const remainingHours = Math.floor((remainingMs / (1000 * 60 * 60)) % 24);
  const remainingMinutes = Math.floor((remainingMs / (1000 * 60)) % 60);

  return {
    remainingMs: Math.max(0, remainingMs),
    remainingDays: expired ? 0 : remainingDays,
    remainingHours: expired ? 0 : remainingHours,
    remainingMinutes: expired ? 0 : remainingMinutes,
    expired,
  };
}
