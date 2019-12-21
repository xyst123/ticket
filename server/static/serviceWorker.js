const FileCacheName = 'file-v3';
const ApiCacheName = 'api-v1';

const cacheFiles = [
	'/manifest.json',
	'/images/favicon.png',
	'/images/main/others.svg',
	'/images/main/passenger.svg',
	'/images/main/seat.svg',
	'/images/main/ticket.svg',
	'/js/cookie.js',
	'/js/performance.js',
	'/js/station.js',
	'/js/vendors.dll.js',
	'/style/icon-font/iconfont.css',
	'/style/icon-font/iconfont.eot',
	'/style/icon-font/iconfont.js',
	'/style/icon-font/iconfont.json',
	'/style/icon-font/iconfont.svg',
	'/style/icon-font/iconfont.ttf',
	'/style/icon-font/iconfont.woff',
	'/style/icon-font/iconfont.woff2',
];

self.addEventListener('install', (e) => {
	e.waitUntil(
		caches.open(FileCacheName).then(cache => cache.addAll(cacheFiles)),
	);
});

self.addEventListener('activate', (e) => {
	e.waitUntil(
		caches.keys().then((cacheNames) => {
			Promise.all(
				cacheNames.map((cacheName) => {
					if ((cacheName.startsWith('file-') && cacheName !== FileCacheName) || (cacheName.startsWith('api-') && cacheName !== ApiCacheName)) {
						return caches.delete(cacheName);
					}
				}),
			);
		}),
	);
});

self.addEventListener('fetch', (e) => {
	const cacheUrls = [];

	const shouldCache = cacheUrls.some(url => new URL(e.request.url).pathname === url);

	if (shouldCache) {
		caches.open(ApiCacheName).then(cache => fetch(e.request).then((response) => {
			cache.put(e.request.url, response.clone());
			return response;
		}));
	} else {
		e.respondWith(
			caches.match(e.request).then(cache => cache || fetch(e.request)).catch(() => {
				if (/\.png|jpeg|jpg|gif/i.test(e.request.url)) {
					return caches.match('/images/favicon.png').then(cache => cache);
				}
			}),
		);
	}
});





