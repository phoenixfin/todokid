/* Service worker untuk Tugas Harianku (PWA).
 * Tujuan:
 *  - Bisa "Add to Home Screen" & tampil fullscreen (butuh SW + manifest).
 *  - App shell tersimpan, jadi tetap terbuka walau internet putus.
 *  - SDK Firebase dari CDN gstatic ikut di-cache, supaya buka berikutnya
 *    tidak lagi "layar kosong kalau tidak ada internet".
 *
 * PENTING: request ke Firestore/Auth (googleapis.com) TIDAK di-cache —
 * selalu ke jaringan supaya data & sinkronisasi tetap real-time.
 *
 * Naikkan versi CACHE saat mengubah file yang di-precache agar klien
 * lama otomatis memperbarui.
 */
const CACHE = 'tugasku-v1';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './icon-maskable.svg'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Navigasi halaman: utamakan jaringan (dapat versi terbaru),
  // jatuh ke index.html dari cache saat offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // SDK Firebase di www.gstatic.com: URL-nya berversi & tak berubah,
  // jadi cache-first aman dan mempercepat pembukaan berikutnya.
  if (url.hostname === 'www.gstatic.com' && url.pathname.includes('/firebasejs/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      }).catch(() => hit))
    );
    return;
  }

  // Data Firebase (firestore/auth di *.googleapis.com) & lainnya: jaringan dulu,
  // fallback ke cache hanya untuk file shell yang sudah tersimpan.
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req))
    );
  }
});
