// src/state/useLang.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Lang = 'en' | 'th';

type LanguageState = {
  lang: Lang;
  setLang: (l: Lang) => void;
  _hydrated: boolean;
  _setHydrated: (v: boolean) => void;
};

export const useLang = create<LanguageState>()(
  persist(
    (set) => ({
      lang: 'en',
      setLang: (l) => set({ lang: l }),
      _hydrated: false,
      _setHydrated: (v) => set({ _hydrated: v }),
    }),
    {
      name: 'duweenext_lang_v1',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (_state) => {
        _state?._setHydrated(true);
      },
      partialize: (s) => ({ lang: s.lang }),
    }
  )
);
