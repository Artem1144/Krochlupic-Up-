var CACHE_NAME = "krohlupic-v102";
var URLS = [
  "./",
  "./index.html",
  "./style.css",
  "./game.js",
  "./lang.js",
  "./manifest.json",
  "./krohlupic.jpg",
  "./corridor.jpg",
  "./power.png",
  "./icon-192.png",
  "./icon-512.png",
  "./sounds/click.mp3",
  "./sounds/ui.mp3",
  "./sounds/achievement.mp3",
  "./sounds/music.mp3",
  "./sounds/music2.mp3",
  "./sounds/alarm.mp3",
  "./sounds/chest.mp3",
  "./sounds/boss.mp3",
  "./sounds/eat.mp3"
];

self.addEventListener("install", function(e){
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      // Игнорируем ошибки отдельных файлов (если чего-то нет)
      return Promise.all(
        URLS.map(function(url){
          return cache.add(url).catch(function(err){
            console.warn("SW: не удалось закэшировать", url, err);
          });
        })
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function(e){
  e.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(
        names.filter(function(n){ return n !== CACHE_NAME; })
             .map(function(n){ return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", function(e){
  e.respondWith(
    caches.match(e.request).then(function(r){
      return r || fetch(e.request).catch(function(){
        // Если оффлайн и файла нет — вернуть index.html для навигации
        if(e.request.mode === "navigate"){
          return caches.match("./index.html");
        }
      });
    })
  );
});
