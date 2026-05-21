/* ═══════════════════════════════════════════════════
   CANDY BOOM — SERVICE WORKER v1.2
   Strategy: Cache-first for assets, Network-first for HTML
   ═══════════════════════════════════════════════════ */

const CACHE_NAME   = 'candyboom-v2.0';
const STATIC_CACHE = 'candyboom-static-v1.2';
const DATA_CACHE   = 'candyboom-data-v1.2';

/* ── Files to pre-cache on install ── */
const PRE_CACHE = [
  '/',
  '/index.html',
  '/game.html',
  '/levelmap.html',
  '/levels/levels_config.js',
  '/assets/icon-192.png',
  '/assets/icon-512.png',
  '/assets/icon-apple.png',
  '/assets/levelmap_bg.png',
  '/assets/levelmap_bg_volcano.png',
  '/assets/levelmap_bg_frozen.png',
  '/assets/levelmap_bg_cosmic.png',
  '/manifest.json',
  '/terms.html',
  '/assets/supabase.min.js',
];

/* ── Install: pre-cache all static assets ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      return cache.addAll(PRE_CACHE.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

/* ── Activate: clear old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== STATIC_CACHE && k !== DATA_CACHE)
          .map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

/* ── Fetch: smart caching strategy ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Skip non-GET and browser-extension requests */
  if (event.request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  /* Supabase API calls: Network only (always fresh) */
  if (url.hostname.includes('supabase.co')) {
    event.respondWith(fetchNetworkOnly(event.request));
    return;
  }

  /* Google Fonts: Cache-first (font files are immutable) */
  if (url.hostname.includes('fonts.g') || url.hostname.includes('fonts-googleapis')) {
    event.respondWith(fetchCacheFirst(event.request, DATA_CACHE));
    return;
  }

  /* HTML pages: Network-first, fallback to cache */
  if (event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(fetchNetworkFirst(event.request));
    return;
  }

  /* JS, CSS, images, assets: Cache-first */
  event.respondWith(fetchCacheFirst(event.request, STATIC_CACHE));
});

/* ── Strategy: Cache-first ── */
async function fetchCacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline – asset not cached', { status: 503 });
  }
}

/* ── Strategy: Network-first ── */
async function fetchNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('<h1>Offline</h1><p>Please check your connection.</p>',
      { status: 200, headers: { 'Content-Type': 'text/html' } });
  }
}

/* ── Strategy: Network-only ── */
async function fetchNetworkOnly(request) {
  try {
    return await fetch(request);
  } catch {
    return new Response(JSON.stringify({ error: 'offline' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } });
  }
}

/* ── Background sync: queue failed leaderboard saves ── */
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CACHE_URLS') {
    caches.open(STATIC_CACHE).then(cache => cache.addAll(event.data.urls || []));
  }
});
