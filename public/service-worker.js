const FILES_TO_CACHE = [];
const CACHE_NAME = "v1";

// install
self.addEventListener("install", function (evt) {
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Your files were pre-cached successfully! ✅");
			return cache.addAll(FILES_TO_CACHE).catch((err) => console.log(err));
		})
	);

	self.skipWaiting();
});
// activate
self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME) {
						console.log("Removing old cache data 🧹", key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});
//fetch
self.addEventListener("fetch", function (evt) {
	evt.respondWith(
		caches.match(evt.request).then(function (response) {
			return response || fetch(evt.request);
		})
	);
});
