/**
 * Config Capacitor — pembungkus resmi WebView Android untuk build APK.
 *
 * Kenapa siap pakai: `vite build` (vite-plugin-singlefile) menghasilkan SATU file
 * dist/index.html (JS+CSS ter-inline) + aset public/ (font, ikon, manifest, sw.js).
 * Cukup salin folder dist/ ke aplikasi Android — tanpa server, tanpa path absolut yang bermasalah.
 *
 * Langkah lengkap ada di MOBILE_APK.md di root repo.
 */
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.akuamirkap.pigeonsk8",
  appName: "Pigeon SK8",
  webDir: "dist",
  backgroundColor: "#151823",
  android: {
    // Game = sentuh & gesture: biarkan WebView menangkap input penuh layar.
    captureInput: true,
    allowMixedContent: false,
    // Splash gelap yang sama dengan theme game -> tanpa flash putih saat cold start.
    splashScreenStyle: "SplashScreen",
  },
  server: {
    // Skema https lokal Capacitor -> AudioContext & WebGL aktif tanpa peringatan "insecure".
    androidScheme: "https",
  },
};

export default config;
