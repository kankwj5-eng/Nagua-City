/* Nagua City: cache only the lightweight installable shell, never the ~184 MB game. */
const SHELL_CACHE = "nagua-city-shell-v1";
const SHELL = [
  "./", "./index.html", "./style.css", "./app.js",
  "./manifest.webmanifest", "./offline.html",
  "./assets/managua-menu-reference.jpg",
  "./icons/icon-192.png", "./icons/icon-512.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith("nagua-city-shell-") && name !== SHELL_CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  const scope = new URL(self.registration.scope);
  if (url.origin !== scope.origin || !url.pathname.startsWith(scope.pathname)) return;
  // Juego enorme: siempre desde la red. No llenar la cuota ni duplicarlo en Cache Storage.
  if (url.pathname === scope.pathname + "Managua.html") {
    if (request.mode === "navigate") event.respondWith(fetch(request).catch(() => caches.match("./offline.html")));
    return;
  }
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).then(response => {
      if (response.ok && url.pathname === scope.pathname) {
        const clone = response.clone();
        event.waitUntil(caches.open(SHELL_CACHE).then(cache => cache.put("./index.html", clone)));
      }
      return response;
    }).catch(() => caches.match("./index.html").then(hit => hit || caches.match("./offline.html"))));
    return;
  }
  // Cache-first only for the explicitly listed small static files.
  const permitted = new Set(SHELL.map(path => new URL(path, scope).pathname));
  if (!permitted.has(url.pathname)) return;
  event.respondWith(caches.match(request).then(hit => hit || fetch(request)));
});
