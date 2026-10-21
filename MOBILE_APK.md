# Membuat APK Android (Capacitor) — Panduan Singkat

Game ini **sudah siap dibungkus jadi APK**:

- Build web = **satu file** `dist/index.html` (vite-plugin-singlefile) — aman dibaca WebView, tanpa CDN.
- `manifest.webmanifest` sudah `"orientation": "portrait"` + `display_override: fullscreen`.
- Layout sudah portrait-first: di HP panggung mengisi `100dvh` penuh (URL-bar safe), dengan
  padding `env(safe-area-inset-*)` untuk poni/bezel bulat, `viewport-fit=cover` + `user-scalable=no`
  (tidak bisa zoom PINCH yang merusak layout), `touch-action:none` (tanpa pull-to-refresh).
- Screen wake lock otomatis (layar tidak sleep saat main).
- Audio: gesture-safe unlock + `AudioContext` disuspend saat app background (hemat baterai).
- Musik BGM default SENYAP; FPS dijaga AdaptiveDpr + cap DPR 1.25 di HP; chip FPS live kiri bawah.

> Catatan sandbox: APK TIDAK BISA di-build di lingkungan ini (butuh Android SDK + Gradle).
> Jalankan langkah berikut di PC sendiri (perlu Android Studio + JDK 17).

## 1. Setup project Android

```bash
npm i -D @capacitor/cli
npm i @capacitor/core @capacitor/android
npx cap init            # capacitor.config.ts SUDAH ada di repo — lewati wizard
npm run build           # hasilkan dist/
npx cap add android
npx cap sync android
```

## 2. Kunci portrait + fullscreen native (WAJIB, sekali saja)

**a. `android/app/src/main/AndroidManifest.xml`** — pada tag `<activity ... >`:

```xml
android:screenOrientation="portrait"
android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|layoutDirection|fontScale|screenLayout|density|smallestScreenSize|navigation"
```

`configChanges` membuat rotasi/resize TIDAK me-restart activity (WebGL tidak reload — tidak flicker/black).

**b. `android/app/src/main/res/values/styles.xml`** — tambah di `<style name="AppTheme.NoActionBarLaunch">` (dan/atau theme utama):

```xml
<item name="android:windowFullscreen">true</item>
<item name="android:windowLayoutInDisplayCutoutMode">shortEdges</item>
<item name="android:statusBarColor">@android:color/transparent</item>
<item name="android:navigationBarColor">@android:color/transparent</item>
```

- `windowFullscreen` = status bar hilang total (game menutupi seluruh layar).
- `shortEdges` = konten boleh masuk area poni/bezel; CSS `env(safe-area-inset-*)` sudah menggeser
  HUD & chip FPS menjauh dari area itu, jadi aman di semua HP (cek screenshot dari beberapa device).
- API < 27 mengabaikan `shortEdges` dengan aman (fallback letterbox).

**c. (Opsional, WebView immersive penuh)** di `MainActivity` tambahkan `onPostCreate`:

```java
override fun onPostCreate(savedInstanceState: android.os.Bundle?) {
  super.onPostCreate(savedInstanceState)
  window.decorView.systemUiVisibility = (
    android.view.View.SYSTEM_UI_FLAG_LAYOUT_STABLE
    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
    or android.view.View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
    or android.view.View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
    or android.view.View.SYSTEM_UI_FLAG_FULLSCREEN
    or android.view.View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY)
}
```

Ini menyembunyikan nav bar gesture di semua HP saat bermain (sticky = auto-muncul lagi saat swipe).

## 3. Build APK

```bash
npx cap sync android
cd android
./gradlew assembleRelease        # APK: android/app/build/outputs/apk/release/app-release.apk
# atau debug cepat utk dites: ./gradlew assembleDebug
```

Play Store butuh AAB + signing: `./gradlew bundleRelease` dan konfigurasi `signingConfig`
di `android/app/build.gradle` (lihat `PUBLISHING.md` bila relevan).

## 4. Checklist performa / keamanan layar (sudah ditangani di kode)

| Risiko HP | Proteksi di repo |
|---|---|
| FPS drop GPU menengah | `dpr` cap 1.25 (HP touch < 900px) + `AdaptiveDpr` turun bertahap < 50fps, naik lagi saat sehat |
| Layar panjang 20:9 / poni | layout portrait 9:16 letterbox otomatis + safe-area inset CSS |
| Keyboard/URL bar mengubah tinggi | `100dvh` + resize listener `useStageSize` |
| Layar sleep saat AFK main | Wake Lock `screen` + re-acquire saat resume |
| Pull-to-refresh / double-tap zoom | `touch-action:none`, `overscroll-behavior:none`, `user-scalable=no` |
| Musik mengganggu | BGM default OFF (toggle 🎵 di menu; SFX tetap) |
| AudioContext error sebelum gesture | unlock tertunda sampai tap pertama |
| Konteks WebGL hilang (driver) | `onContextLost` → remount Scene otomatis |
| Cek cepat apakah lancar | chip FPS live kiri bawah (FPS + ms/frame) |
