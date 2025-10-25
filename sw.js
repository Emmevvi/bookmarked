const CACHE_NAME = 'link-saver-v2';
const urlsToCache = [
  './',
  'index.html',
  'app.js',
  'manifest.json',
  'icon16.png',
  'icon48.png',
  'icon128.png'
];

// Installazione Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installazione in corso...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Cache aperta, caricamento file...');
        return cache.addAll(urlsToCache.map(url => new Request(url, { cache: 'reload' })));
      })
      .then(() => {
        console.log('[SW] Tutti i file sono stati cachati');
        // Forza l'attivazione immediata del nuovo SW
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Errore durante il caching:', error);
      })
  );
});

// Attivazione e pulizia vecchie cache
self.addEventListener('activate', event => {
  console.log('[SW] Attivazione in corso...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Rimozione cache vecchia:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker attivato');
        // Prendi controllo immediato di tutte le pagine
        return self.clients.claim();
      })
  );
});

// Strategia di fetch: Network First per API, Cache First per assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Non cachare le richieste a Firebase/Google APIs
  if (
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('firestore.googleapis.com') ||
    url.pathname.endsWith('/manifest.json')
  ) {
    // Network only per Firebase e manifest
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Strategia Cache First con Network Fallback per tutto il resto
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Servito dalla cache:', event.request.url);
          
          // Aggiorna la cache in background (stale-while-revalidate)
          fetch(event.request)
            .then(networkResponse => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then(cache => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {
              // Ignora errori di rete durante l'aggiornamento in background
            });
          
          return cachedResponse;
        }
        
        // Se non è in cache, prova la rete
        console.log('[SW] Fetch dalla rete:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Verifica che la risposta sia valida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clona la risposta per poterla cachare
            const responseToCache = networkResponse.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch(error => {
            console.error('[SW] Fetch fallito:', error);
            
            // Fallback: se è una richiesta di navigazione, ritorna index.html dalla cache
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            // Per altri tipi di richieste, ritorna un errore
            return new Response('Contenuto non disponibile offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// Gestione messaggi dal client
self.addEventListener('message', event => {
  if (event.data.action === 'skipWaiting') {
    console.log('[SW] Richiesta skipWaiting ricevuta');
    self.skipWaiting();
  }
  
  if (event.data.action === 'clearCache') {
    console.log('[SW] Richiesta clearCache ricevuta');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('[SW] Tutte le cache sono state svuotate');
      })
    );
  }
});

// Gestione sincronizzazione in background (opzionale, per future implementazioni)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-links') {
    console.log('[SW] Sincronizzazione link in background');
    event.waitUntil(
      // Qui potresti implementare una logica di sincronizzazione
      Promise.resolve()
    );
  }
});

// Notifiche push (opzionale, per future implementazioni)
self.addEventListener('push', event => {
  if (event.data) {
    const data = event.data.json();
    console.log('[SW] Push ricevuto:', data);
    
    const options = {
      body: data.body || 'Nuovo aggiornamento disponibile',
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      vibrate: [200, 100, 200],
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Link Saver', options)
    );
  }
});

// Gestione click su notifiche
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notifica cliccata');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});