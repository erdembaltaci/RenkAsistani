// Rengim servis çalışanı: uygulamayı çevrimdışı açılır kılar ve ana ekran kurulumunu tamamlar.
// __BUILD_ID__, derleme sırasında değiştirilir; her yayında önbellek adı değişir, eski dosyalar silinir.
const CACHE = 'rengim-__BUILD_ID__';
const SHELL = ['/', '/manifest.webmanifest', '/favicon.svg', '/icon-192.png'];

// Sunucu "Vary: Origin" gönderirse, önceden alınan kayıtlar sayfanın gerçek isteğiyle eşleşmez ve çevrimdışı
// açılış sessizce bozulur. Tüm dosyalar aynı kökenden ve sabit olduğu için Vary yok sayılır.
const MATCH_OPTIONS = { ignoreVary: true };

// Ana sayfayı ve ona bağlı (içeriği sabit adlı) script/stil/yazı tipi dosyalarını önceden önbelleğe alır.
async function precache() {
  const cache = await caches.open(CACHE);
  await cache.addAll(SHELL);

  const html = await (await cache.match('/', MATCH_OPTIONS)).text();
  const assets = new Set(html.match(/\/assets\/[^"'\s>]+/g) ?? []);

  for (const url of [...assets].filter((asset) => asset.endsWith('.css'))) {
    const css = await (await fetch(url)).text();
    for (const font of css.match(/\/assets\/[^)"'\s]+/g) ?? []) {
      // Yalnızca Latin ve Latin-genişletilmiş (Türkçe harfler) alt kümeleri; kiril, yunanca vb. gereksiz.
      if (font.includes('latin')) assets.add(font);
    }
  }
  await cache.addAll([...assets]);
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  // Sayfa: önce ağ (yeni sürüm hemen görünsün), ağ yoksa önbellekteki ana sayfa.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Hata sayfaları (404, 500) ana sayfa önbelleğini bozmasın.
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put('/', copy));
          }
          return response;
        })
        .catch(() => caches.match('/', MATCH_OPTIONS)),
    );
    return;
  }

  // Diğer dosyalar: önce önbellek (adları içeriğe göre değiştiği için güvenli), yoksa ağdan al ve sakla.
  event.respondWith(
    caches.match(request, MATCH_OPTIONS).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
