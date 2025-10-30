// src/i18n/i18n.config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
// import resources for both 'en' and 'th'
import en from './translation/en.json';
import th from './translation/th.json';

if (!i18n.isInitialized) {
  i18n
    .use(initReactI18next)
    .init({
      resources: { en: { translation: en }, th: { translation: th } },
      fallbackLng: 'th',             // only as fallback, not forced
      interpolation: { escapeValue: false },
      // optional but helpful:
      returnNull: false,
      // Turn off language detectors unless you explicitly need them:
      // detection: { order: [], caches: [] },
    });
}

export default i18n;
