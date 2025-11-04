# Duweenext — Frontend

This repository contains the frontend code for the Duweenext project. It includes TypeScript-based front-end code used for mobile and web targets. The workspace appears to contain both mobile (React Native / Expo) and web (app) frontends alongside native Android/iOS project files.

## Features

- TypeScript-first codebase
- React Native (Expo / EAS) mobile app files and native `android/` and `ios/` folders
- Web app code in the `app/` folder 
- Tailwind / NativeWind styling 
- Firebase / Google services configuration placeholders 

## Prerequisites

- Node.js (LTS recommended — e.g. 16 or 18)
- npm or Yarn
- For mobile (native builds):
  - Android Studio (Android SDK + emulator)
  - Xcode (for iOS native builds on macOS)
  - Java JDK (for Android builds)
- Expo CLI (optional, if you use the Expo workflow): `npm install -g expo-cli` or run with `npx`.
- EAS CLI if you use EAS build: `npm install -g eas-cli` or use `npx eas`.

## Project installation — install dependencies

1. Clone the project and change into the repository root:

   ```powershell
   git clone <repo-url>
   cd Duweenext_proj
   ```

2. Install dependencies (choose one):

   ```powershell
   npm install
   # or
   yarn
   ```

## Running locally

There are several ways to run, depending on what you want to work on.

### Mobile (Expo / React Native)

For a native development run (React Native CLI / local Android/iOS builds):

```powershell
# Android (from repo root)
npm run android
# or
yarn android

# iOS (macOS only)
npm run ios
# or
yarn ios
```

for production build you can build using EAS Build:

```powershell
npx eas build -p android
npx eas build -p ios
```

## Project structure (high level)

- `app/` — Web front-end (layout files like `_layout.tsx` indicate a Next-style structure).
- `frontend/` / `ios/` / `android/` / `Duweenext/` — Native mobile and platform-specific code.
- `src/` — Main TypeScript source: components, hooks, services, interfaces, utils, styles, etc.
  - `src/component/` — UI components
  - `src/services/` — API and auth services
  - `src/interfaces/` — shared TypeScript types
  - `src/utils/` and `lib/` — utilities and helper functions
- `assets/` — images, fonts, icons used by the app
- `app.json`, `eas.json` — Expo and EAS configurations
- `tailwind.config.js`, `nativewind-env.d.ts` — Tailwind/nativewind setup

Adjust the list above if your copy has slightly different folders — this is a general map based on the repository contents.

## Environment variables

In order to run the project you need 
- google-service.json
- GoogleService-Info.plist
- firebase-admin-sdk.json

to access all of this file you need to be one of the member of DuWeeNext firebase console

## Type checking and linting

TypeScript is used in the codebase. Run the TypeScript compiler to type-check (project may use `tsc --noEmit` or a script):

```powershell
npx tsc --noEmit
# or
npm run typecheck
```

Run linter (if configured):

```powershell
npm run lint
# or
yarn lint
```

## Troubleshooting

- If a module cannot be found after pulling the repo, delete `node_modules` and reinstall.
- If Metro bundler loads stale cache, run: `npx expo start -c` or `npx react-native start --reset-cache`.
- Android build errors often require updating Android SDK versions or Java JDK; check `android/build.gradle` for expected versions.
- iOS build errors (macOS) may require `cd ios && pod install`.

## Contributing

1. Fork the repository or create a new branch off `main`.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Add tests for new features where appropriate.
4. Run linters and type checks.
5. Create a pull request describing the change.

## Application installation
In order to install the DuWeeNext application you only need to install APK file from below here, not neccessary to download any file from the Backend 
