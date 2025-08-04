const CACHE_NAME = 'registro-elettronico-pwa-cache-v6';
const URLS_TO_CACHE = [
  // App Shell
  '/',
  '/index.html',
  '/manifest.json',
  
  // Local scripts
  '/index.tsx',
  '/App.tsx',
  '/constants.tsx',
  '/db.ts',
  '/Layout.tsx',
  '/BottomNav.tsx',
  '/Modal.tsx',
  '/AuthLayout.tsx',
  '/InstallBanner.tsx',
  '/SplashScreen.tsx',
  '/ImageCropperModal.tsx',

  // Pages
  '/LoginPage.tsx',
  '/RegistrationPage.tsx',
  '/StudentAccessPage.tsx',
  '/HomePage.tsx',
  '/ClassesPage.tsx',
  '/StudentsPage.tsx',
  '/CommunicationsPage.tsx',
  '/SettingsPage.tsx',
  '/ClassDetailPage.tsx',
  '/StudentDetailPage.tsx',
  '/GradesPage.tsx',
  '/ProfileEditPage.tsx',
  '/PlaceholderPage.tsx',
  '/AccessReportPage.tsx',
  '/SessionDetailPage.tsx',
  '/DeveloperOptionsPage.tsx',
  '/OtherSettingsPage.tsx',
  '/LiveDuration.tsx',

  // Critical External Dependencies (fixed URLs without unsupported characters)
  'https://cdn.tailwindcss.com',
  'https://esm.sh/react@19.1.1',
  'https://esm.sh/react-dom@19.1.1/client',
  'https://esm.sh/react-router-dom@7.7.1',
  'https://esm.sh/react-easy-crop@5.0.7',
  'https://esm.sh/@google/genai'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('SW caching app shell and static assets.');
      return cache.addAll(URLS_TO_CACHE);
    }).catch(error => {
        console.error('Failed to cache assets during install:', error);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  // App Shell (Navigation) strategy: Network falling back to Cache.
  // This ensures online users get the latest version of the app's HTML,
  // while offline users still get a working app.
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          // Try to fetch from the network.
          const networkResponse = await fetch(request);
          return networkResponse;
        } catch (error) {
          // If the network fails, serve the cached app shell.
          console.log('Network request for navigation failed, serving from cache.', error);
          const cache = await caches.open(CACHE_NAME);
          // For a SPA, all navigation routes should be handled by the root index.html
          return cache.match('/'); 
        }
      })()
    );
    return;
  }

  // Static Assets strategy: Cache First.
  // This is fast and reliable for offline use.
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cachedResponse = await cache.match(request);
      
      // If found in cache, return it.
      if (cachedResponse) {
        return cachedResponse;
      }

      // If not in cache, fetch from network, cache it, and return it.
      try {
        const networkResponse = await fetch(request);
        // We only cache successful responses to avoid caching errors.
        if (networkResponse.status === 200) {
            // It's a good practice to clone the response before caching.
            const responseToCache = networkResponse.clone();
            await cache.put(request, responseToCache);
        }
        return networkResponse;
      } catch (error) {
        // The network request failed and the resource is not in the cache.
        console.error(`Fetch failed for resource: ${request.url}`, error);
        // Return an error response.
        return new Response(null, {
          status: 404,
          statusText: 'Not Found'
        });
      }
    })()
  );
});