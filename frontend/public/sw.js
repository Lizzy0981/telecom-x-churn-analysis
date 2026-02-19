// Service Worker for Telecom X PWA
// Version 1.0.0

// FIX-01: Derive base path dynamically from the SW scope.
// On GitHub Pages → '/telecom-x-churn-analysis/'
// On Vercel / localhost → '/'
// This ensures every cached URL resolves correctly regardless of deployment.
var BASE_PATH = self.registration.scope.replace(self.location.origin, '') || '/';

const CACHE_NAME = 'telecom-x-v1.0.0';
const RUNTIME_CACHE = 'telecom-x-runtime';
const MODEL_CACHE = 'telecom-x-models';

// FIX-02: Prefix every static URL with BASE_PATH (was absolute '/' — broken on GitHub Pages).
const STATIC_CACHE_URLS = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'offline.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'logo.svg',
  BASE_PATH + 'favicon.ico'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      // FIX-03: Use Promise.allSettled so a missing asset doesn't abort the whole install.
      return Promise.allSettled(
        STATIC_CACHE_URLS.map(url =>
          cache.add(url).catch(err =>
            console.warn('[Service Worker] Failed to cache (non-fatal):', url, err)
          )
        )
      );
    }).then(() => {
      console.log('[Service Worker] Installed successfully');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== RUNTIME_CACHE && 
              cacheName !== MODEL_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Activated successfully');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // FIX-04: Wrap URL parsing in try/catch to avoid crashes on malformed URLs.
  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // FIX-05: Skip cross-origin requests (Google Fonts, CDNs, external APIs).
  // Without this, the SW intercepts and may break external resources.
  if (url.origin !== self.location.origin) {
    return;
  }

  // Handle API requests separately
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Handle ML model requests
  if (url.pathname.includes('/models/')) {
    event.respondWith(cacheFirst(request, MODEL_CACHE));
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        // FIX applied here too: use BASE_PATH for the fallback URL
        return caches.match(BASE_PATH + 'offline.html');
      })
    );
    return;
  }

  // Handle other requests with cache-first strategy
  event.respondWith(cacheFirst(request, CACHE_NAME));
});

// Cache-first strategy
async function cacheFirst(request, cacheName = CACHE_NAME) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  
  if (cached) {
    console.log('[Service Worker] Serving from cache:', request.url);
    return cached;
  }
  
  try {
    const response = await fetch(request);
    
    // Cache successful responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(BASE_PATH + 'offline.html');
    }
    
    throw error;
  }
}

// Network-first strategy (for API calls)
async function networkFirst(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const response = await fetch(request);
    
    // Cache successful API responses
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[Service Worker] Network request failed, trying cache:', error);
    
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    
    throw error;
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  // Placeholder for background sync logic
  console.log('[Service Worker] Syncing data...');
  // Implement your sync logic here
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available',
    icon: BASE_PATH + 'logo.svg',
    badge: BASE_PATH + 'logo.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: BASE_PATH + 'icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: BASE_PATH + 'icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Telecom X', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow(BASE_PATH)
    );
  }
});

// Message handler (for communication with app)
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

console.log('[Service Worker] Registered successfully - v1.0.0');
