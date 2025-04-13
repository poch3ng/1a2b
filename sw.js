self.addEventListener("install", event => {
    event.waitUntil(
        caches.open("1a2b-v1").then(cache => {
            return cache.addAll([
                "/",
                "/index.html",
                "/script.js",
                "/icon.png"
            ]);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
