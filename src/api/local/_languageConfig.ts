import {create} from "zustand";

type LanguageState = {
  lang: "en" | "th";
  setLang: (l: "en" | "th") => void;
};

export const useLang = create<LanguageState>((set) => ({
  lang: "en", // default
  setLang: (l) => set({ lang: l }),
}));
