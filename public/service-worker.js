const FILES_TO_CACHE = [];
const CACHE_NAME = "v2";
const DATA_CACHE_NAME = "v1";

// install
self.addEventListener("install", function (evt) {
	evt.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			console.log("Your files were pre-cached successfully! ✅");
			return cache.addAll(FILES_TO_CACHE);
		})
	);

	self.skipWaiting();
});

self.addEventListener("activate", function (evt) {
	evt.waitUntil(
		caches.keys().then((keyList) => {
			return Promise.all(
				keyList.map((key) => {
					if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
						console.log("Removing old cache data 🧹", key);
						return caches.delete(key);
					}
				})
			);
		})
	);

	self.clients.claim();
});

// fetch
self.addEventListener("fetch", function (evt) {
	console.log(
		`Service working is handling request for '${evt.request.url}'. 📝`
	);
	if (evt.request.url.includes("/api/")) {
		evt.respondWith(
			caches
				.open(DATA_CACHE_NAME)
				.then((cache) => {
					return fetch(evt.request)
						.then((response) => {
							if (response.status === 200) {
								console.log("Saving response in the data cache. 🔑");
								cache.put(evt.request.url, response.clone());
							}

							return response;
						})
						.catch((err) => {
							console.log(
								"Unable to reach the server. Getting data from the cache instead. 📝"
							);
							return cache.match(evt.request);
						});
				})
				.catch((err) => console.log(err))
		);
		return;
	}
	evt.respondWith(
		caches.match(evt.request).then(function (response) {
			return response || fetch(evt.request);
		})
	);
});
