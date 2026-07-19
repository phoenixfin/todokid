# Tugas Harianku — Android app (Capacitor)

This `native/` folder wraps the web app (the repo-root `index.html`) as an **Android app**
so it can fire **real notifications/alarms at each period's deadline — even when the app
is closed**. The web version is unchanged; `index.html` stays the single source of truth.

The app id (Android package name) is **`com.todokid.app`** — use this exact value in Firebase.

---

## 1. One-time tools (you)

Install **Android Studio** (bundles the Android SDK + Java). Launch it once and let it
finish downloading the SDK. That's the only heavy install; everything else is CLI.

> Node + npm are already installed and the Capacitor project is already scaffolded.

## 2. Firebase Console (you) — needed for Google login on the device

Google blocks its web login inside app WebViews, so the app uses **native Google Sign-In**
feeding the same Firebase account (same uid → same Firestore data as the web app).

1. Firebase console → project **kid-s-app-fec65** → **Add app → Android**.
2. **Android package name:** `com.todokid.app` → Register app.
3. **Add a SHA-1 fingerprint** (required for Google sign-in — see below).
4. **Download `google-services.json`** and place it at:
   `native/android/app/google-services.json`

### Getting the SHA-1 (debug key)
After Android Studio is installed, from `native/android/`:
```
gradlew.bat signingReport
```
Copy the **SHA1** (and SHA-256) listed under `Variant: debug`, add it to the Firebase
Android app (Project settings → your Android app → **Add fingerprint**), then
**re-download** `google-services.json`.

## 3. Build the APK

From `native/`:
```
npm install            # only if node_modules is missing
npm run build:apk      # copies index.html -> www, syncs, builds the debug APK
```
Output: `native/android/app/build/outputs/apk/debug/app-debug.apk`

Or open the project in Android Studio and press Run:
```
npm run open
```

## 4. Install on the tablet
- On the tablet, allow "Install unknown apps" for your file manager/browser.
- Copy over `app-debug.apk` and tap it to install.
- On first launch, **allow the Notifications permission**.

---

## How the reminders work
- On launch — and every time you press **Save** in Admin — the app schedules a daily
  local notification at **each period's deadline time**, respecting weekday / weekend
  day types (`com.todokid.app` uses Android's own scheduler, so it fires even when the
  app is closed).
- Editing deadlines in Admin reschedules automatically.

## Updating later
After editing the root `index.html`, just run `npm run build:apk` again and reinstall.

## Troubleshooting
- **Google sign-in fails:** confirm the SHA-1 is in Firebase, `google-services.json` is the
  latest download, and the package name is exactly `com.todokid.app`.
- **No notifications:** check the app has Notification permission (Android 13+ asks at runtime).
- **Blank screen on first open:** the app loads the Firebase SDK from a CDN, so it needs
  internet on first launch.

## Regenerating the native project
`android/` is not committed (it's regenerable). To recreate it:
```
npm install && npm run copyweb && npx cap add android
```
Then redo these local edits (they live inside the gitignored `android/`):
1. Re-add `google-services.json` at `android/app/`.
2. `android/local.properties` → `sdk.dir=C:/Users/ThinkPad/AppData/Local/Android/Sdk`
   (forward slashes — backslashes break it).
3. `android/gradle/wrapper/gradle-wrapper.properties` → use `gradle-8.7-all.zip`
   (8.2.1 fails on Java 21).
4. `android/variables.gradle` → add `rgcfaIncludeGoogle = true` inside `ext { }`.
   **Required** — without it the Google Sign-In classes (play-services-auth) are
   compiled but NOT packaged, and the app crashes instantly on launch.

Build with `JAVA_HOME` pointing at Android Studio's JBR:
`export JAVA_HOME="C:\Program Files\Android\Android Studio\jbr"` then
`cd android && ./gradlew.bat :app:assembleDebug --no-daemon`.
