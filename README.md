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

## Project installation — install dependencies & running application inside the emulator

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
3. Fix dependencies vulnerability
  
  ```powershell
   npm audit fix
   ```
4. Put the secret to the root of project 
<img width="866" height="597" alt="image" src="https://github.com/user-attachments/assets/ac9c75bd-d3cf-407e-9424-735c82adfed3" />
<img width="866" height="607" alt="image" src="https://github.com/user-attachments/assets/4c08dfce-8b55-4a08-879f-11175a4e25be" />

5. Start the local project
  
  ```powershell
   npm run start
   # or
   yarn run start
   ```
6. Open Android Studio and click open
<img width="1919" height="500" alt="image" src="https://github.com/user-attachments/assets/2cef2358-9bcf-426c-aab8-6e286124bd12" />

7. Go to /Duweenext_proj/android
<img width="1919" height="830" alt="image" src="https://github.com/user-attachments/assets/4062da56-38aa-4980-a30e-49a7a434d36b" />

8. Run the project
<img width="1402" height="363" alt="image" src="https://github.com/user-attachments/assets/07509919-bc89-41e4-a947-7f03ca37de84" />

9. In terminal press a to load dependency modules into Andriod Studio emulator
<img width="1093" height="548" alt="image" src="https://github.com/user-attachments/assets/b05ff823-834d-486c-902f-490981bbcdb6" />

10. Change the url in apiManager.ts to connect to localhost backend
<img width="797" height="639" alt="image" src="https://github.com/user-attachments/assets/40fcafcd-f75e-4e5c-b9e4-276a0ba5778d" />

## Running locally

There are several ways to run, depending on what you want to work on.

### Mobile (Expo / React Native)

For a native development run (React Native CLI / local Android/iOS builds/ build on real device):

```powershell
# Android (from repo root)
npm run android
# or
yarn android

for production build you can build using EAS Build:

```powershell
npx eas build -p android
```

## Project structure (high level)

- `app/` — Web front-end (layout files like `_layout.tsx` indicate a Next-style structure).
- `src/` — Main TypeScript source: components, hooks, services, interfaces, utils, styles, etc.
  - `src/component/` — UI components
  - `src/api/` — API and auth services
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

## Troubleshooting

- If a module cannot be found after pulling the repo, delete `node_modules` and reinstall.
- If Metro bundler loads stale cache, run: `npx expo start -c` or `npx react-native start --reset-cache`.
- Android build errors often require updating Android SDK versions or Java JDK; check `android/build.gradle` for expected versions.

## Contributing

1. Fork the repository or create a new branch off `main`.
2. Create a feature branch: `git checkout -b feat/my-change`.
3. Add tests for new features where appropriate.
4. Run linters and type checks.
5. Create a pull request describing the change.

## Application installation
In order to install the DuWeeNext application you only need to install APK file from below here, not neccessary to download any file from the Backend 
