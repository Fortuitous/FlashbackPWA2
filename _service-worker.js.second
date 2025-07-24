const CACHE_NAME = 'my-pwa-cache-v2'; // Increment this for a new version
// B comment
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching essential assets');
        return cache.addAll([
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
        ]);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
