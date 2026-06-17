# Firebase setup (Questory)

Questory uses Firebase **Analytics** and **Crashlytics** via `@react-native-firebase/*`. The JavaScript layer fails safely when native Firebase is unavailable (web preview, dev without config files).

Native Firebase only activates after you add platform config files **and** run a fresh native/EAS build.

## Android

1. In [Firebase Console](https://console.firebase.google.com/), create or open your project.
2. Add an Android app with package name: `com.pioneer.pioneer1` (must match `app.json`).
3. Download `google-services.json`.
4. Place it in the **project root** (same folder as `app.json`):

   ```
   pioneer1/
   ├── google-services.json   ← here
   ├── app.json
   └── app.config.js
   ```

5. `app.config.js` automatically sets `expo.android.googleServicesFile` when that file exists. No manual `app.json` edit required.

## iOS (optional)

Only needed if you build for iOS later.

1. Add an iOS app in Firebase with your bundle identifier.
2. Download `GoogleService-Info.plist` to the project root.
3. `app.config.js` wires `expo.ios.googleServicesFile` when the file exists.

## Do not commit secrets

This repo ignores Firebase config files in `.gitignore`:

- `google-services.json`
- `GoogleService-Info.plist`

If your team policy allows committing them, remove those lines from `.gitignore` — otherwise keep them local or in CI secrets.

## Rebuild required

After adding config files:

```bash
# Dev client / local native
npx expo run:android

# Closed beta APK
npm run build:android:preview
```

Expo Go and web preview **do not** load native Firebase. Analytics/Crashlytics no-op there (DEV console logs only).

## Verify Analytics

1. Enable **DebugView** in Firebase Console.
2. On a device with a debug/dev build, run:

   ```bash
   adb shell setprop debug.firebase.analytics.app com.pioneer.pioneer1
   ```

3. Open the app and confirm events in DebugView (allow a minute for propagation).

## Verify Crashlytics

1. Build with `google-services.json` present.
2. In Profile, ensure **Help detect app crashes** is ON.
3. In dev/internal tools (`__DEV__` or preview build), use **TEST CRASH REPORT** for a non-fatal test.
4. Check Firebase Console → Crashlytics (can take several minutes).

## Privacy

Analytics and crash reporting use allowlisted metadata only. Quest titles, notes, names, and other user-written text are blocked at the service layer. Users can disable both in Profile → Analytics section.
