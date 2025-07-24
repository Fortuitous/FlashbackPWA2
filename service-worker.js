const CACHENAME = 'v16';

const PRECACHE_URLS = [
        './index.html',
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

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHENAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('message', function (event) {
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', function (event) {
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      console.log({cacheNames})
      return cacheNames.filter(cacheName => CACHENAME != cacheName);
    }).then(cachesToDelete => {
      console.log({cachesToDelete})
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});