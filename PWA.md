# Tugas Harianku — versi PWA

Alternatif tanpa APK. Anak "meng-install" app langsung dari Chrome di tablet;
tidak perlu rebuild + reinstall tiap kali `index.html` diubah — cukup deploy ulang.

## File PWA
- `manifest.webmanifest` — nama, warna, mode fullscreen (`standalone`), ikon.
- `icon.svg` / `icon-maskable.svg` — ikon home screen (maskable = aman dari crop bulat Android).
- `sw.js` — service worker: menyimpan app shell agar tetap terbuka walau internet putus,
  dan meng-cache SDK Firebase (CDN gstatic) supaya buka berikutnya lebih cepat.
  Data Firestore/Auth **tidak** di-cache (selalu real-time).
- Registrasi SW ada di `index.html` (dilewati otomatis saat dibungkus APK/Capacitor).

## Deploy (Firebase Hosting — HTTPS, wajib untuk PWA)
Sekali saja: `npm i -g firebase-tools` lalu `firebase login`.

Tiap update:
```
firebase deploy --only hosting
```
Situs terbit di `https://kid-s-app-fec65.web.app`. Project sudah diset di `.firebaserc`.

> Service worker **wajib HTTPS** — membuka `index.html` langsung dari file (`file://`)
> tidak akan meng-install sebagai PWA. Harus lewat hosting.

## Install di tablet
1. Buka `https://kid-s-app-fec65.web.app` di **Chrome**.
2. Menu ⋮ → **Add to Home screen** / **Install app**.
3. Ikon ⭐ muncul di home; dibuka tampil fullscreen tanpa address bar.

Google Sign-In berjalan normal di sini (PWA memakai mesin Chrome asli, bukan WebView APK).

## Pengingat jam tugas
Versi PWA **tidak** memunculkan notifikasi terjadwal saat app tertutup
(keterbatasan web di Android). Sesuai keputusan: pakai **alarm bawaan tablet**.

Setup sekali di app **Jam/Clock** tablet — alarm berulang tiap hari untuk tiap periode:
- 06:00 Bangun tidur · 06:45 Sebelum sekolah · 13:00 Pulang sekolah
- 15:30 Sore · 20:00 Malam sebelum tidur

(Jam mengikuti deadline periode di menu Admin; sesuaikan bila diubah.)

## PWA vs APK
| | PWA | APK (native/) |
|---|---|---|
| Install | Add to Home screen | Sideload file .apk |
| Update | `firebase deploy` → refresh | Rebuild + reinstall |
| Google login | ✅ normal | ✅ (via native plugin) |
| Reminder app tertutup | ❌ pakai alarm tablet | ✅ notifikasi terjadwal |
| Offline (buka app) | ✅ service worker | ✅ |

Folder `native/` tetap ada bila suatu saat butuh reminder native lagi.
