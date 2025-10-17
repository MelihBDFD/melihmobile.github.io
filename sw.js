// Temel PWA desteği
const CACHE_NAME = 'todo-app-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js'
];

importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js');

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "your-todo-app.firebaseapp.com",
  projectId: "your-todo-app",
  storageBucket: "your-todo-app.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

// Kurulum
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Aktivasyon
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch olayları - Çevrimdışı destek
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache'den dönen varsa onu kullan
        if (response) {
          return response;
        }

        // Yoksa network'ten al
        return fetch(event.request).then(response => {
          // GET isteklerini cache'le
          if (event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseClone));
          }
          return response;
        }).catch(() => {
          // Çevrimdışı durumu için fallback
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

self.addEventListener('push', (event) => {
  const payload = event.data.json();
  const options = {
    body: payload.notification.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification(payload.notification.title, options)
  );
});
