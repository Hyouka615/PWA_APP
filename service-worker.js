self.addEventListener('install', (event) => {
    console.log('Service Worker 安装中...');
    // 缓存静态资源
    event.waitUntil(
        caches.open('my-cache').then((cache) => {
            return cache.addAll([
                '/index.html',
                '/styles.css',
                '/app.js',
                '/manifest.json',
                '/icon.png'
            ]);
        })
    );
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker 激活中...');
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // 返回缓存的资源，如果没有则从网络加载
            return cachedResponse || fetch(event.request);
        })
    );
});

