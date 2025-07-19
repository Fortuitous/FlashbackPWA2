/*
 Copyright 2016 Google Inc. All Rights Reserved.
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at
 http://www.apache.org/licenses/LICENSE-2.0
 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 */

// Names of the two caches used in this version of the service worker.
// Change to v2, etc. when you update any of the local resources, which will
// in turn trigger the install event again.
const PRECACHE = 'precache-v6';
const RUNTIME = 'runtime';

// A list of local resources we always want to be cached.
const PRECACHE_URLS = [
  'index.html',
  './css/flashback.css',
  './css/flashback-theme.css',
  './css/jquery.mobile.iscrollview.css',
  './css/jquery.mobile.simultaneous-transitions-replace.css',
  './css/spectrum.css',
  './js/fastclick.min.js',
  './js/iscroll.js',
  './js/jquery.mobile.iscrollview.js',
  './js/jquery.mobile.simultaneous-transitions-replace.js',
  './js/jquery.spin.js',
  './js/spin.min.js',
  './js/bgLog/bglogCore-1604B-FB-svg.min.js',
  './js/bgLog/JBbglogThemes.js',
  './js/Flashcard/Card.js',
  './js/Flashcard/CardInDeck.js',
  './js/Flashcard/CardLabel.js',
  './js/Flashcard/CardLabelOnCard.js',
  './js/Flashcard/ConceptCard.js',
  './js/Flashcard/CubeCard.js',
  './js/Flashcard/CubePosition.js',
  './js/Flashcard/Deck.js',
  './js/Flashcard/DeckSet.js',
  './js/Flashcard/fbdata.min.js',
  './js/Flashcard/flashcheck.1.0.2.min.js',
  './js/Flashcard/flashcheck.021.min.js',
  './js/Flashcard/flashcheck.js',
  './js/Flashcard/OutcomeDistribution.js',
  './js/Flashcard/Play.js',
  './js/Flashcard/PlayCard.js',
  './js/Flashcard/PlayComponent.js',
  './js/Flashcard/PlayPosition.js',
  './js/Flashcard/RuleCard.js',
  './js/greensock/AttrPlugin.min.js',
  './js/greensock/CSSPlugin.min.js',
  './js/greensock/TweenLite.min.js',
  './js/JQ/jquery.csv-0.62.js',
  './js/JQ/jquery.mobile.icons-1.4.5.min.css',
  './js/JQ/jquery.mobile.structure-1.4.5.min.css',  
  './js/JQ/jquery.mobile.theme-1.4.5.min.css',
  './js/JQ/jquery.mobile-1.4.5.min.css',
  './js/JQ/jquery.mobile-1.4.5.min.js',
  './js/JQ/jquery-2.1.4.min.js'
  ];

// The install handler takes care of precaching the resources we always need.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(PRECACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  const currentCaches = [PRECACHE, RUNTIME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

// The fetch handler serves responses for same-origin resources from a cache.
// If no response is found, it populates the runtime cache with the response
// from the network before returning it to the page.
self.addEventListener('fetch', event => {
  // Skip cross-origin requests, like those for Google Analytics.
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME).then(cache => {
          return fetch(event.request).then(response => {
            // Put a copy of the response in the runtime cache.
            return cache.put(event.request, response.clone()).then(() => {
              return response;
            });
          });
        });
      })
    );
  }
});