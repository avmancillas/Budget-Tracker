const CACHE_NAME = "cache";
const DATA_CACHE_NAME = "data-cache";
const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/assets/icons/icon-192x192.png",
    "/assets/icons/icon-512x512.png",
    "/index.js",
    "/manifest.webmanifest",
    "/styles.css"



];

self.addEventListener("install", evt =>{
    evt.waitUntil(
        caches.open(DATA_CACHE_NAME).then((cache) => cache.addALL(FILES_TO_CACHE))
    );

    self.skipWaiting();
    
});

self.addEventListener("activate", evt =>{
    evt.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(
                keyList.map(key => {
                    if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
                        console.log("Delete old cache",key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );    
    self.clients.claim();
    
})

self.addEventListener("fetch", evt =>{
    if(evt.request.url.includes("/api/")){
        evt.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(evt.request)
                .then(response => {
                    if (response.status === 200) {
                        cache.put(evt.request.url, response.clone());
                    }
                    return response;
                })
                .catch(err => {
                    return cache.match(evt.request);
                });
            }).catch(err => console.log(err))
        );
        return;
    }
   
});