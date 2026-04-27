/**
 * Self-unregistering service worker.
 *
 * Why this file exists:
 *   Older versions of the site shipped a real PWA service worker which cached
 *   pages and JS chunks. Even after we removed the PWA setup, browsers that
 *   had once installed that SW kept serving stale content. This stub replaces
 *   that old SW the next time a user's browser fetches /sw.js — it deletes
 *   every cache it can find and unregisters itself, so the page reloads fresh.
 *
 * Safe to delete after a few months once all users have visited at least
 * once and been cleaned up.
 */
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      } catch {}
      try {
        await self.registration.unregister();
      } catch {}
      const clientList = await self.clients.matchAll({ type: "window" });
      for (const client of clientList) {
        try {
          client.navigate(client.url);
        } catch {}
      }
    })(),
  );
});
