// Service Worker - 网络优先策略 + 自动更新检测
// 确保仓库更新时始终获取最新版本

const CACHE_NAME = 'phone-ui-v' + Date.now(); // 使用时间戳作为缓存版本
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './manifest.json'
];

// 安装 Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] 安装中...版本:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] 缓存文件');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting(); // 立即激活新的 Service Worker
    })
  );
});

// 激活 Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] 删除旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // 立即控制所有页面
    })
  );
});

// 网络优先策略 - 始终尝试从网络获取最新内容
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // 添加时间戳参数，强制绕过浏览器缓存
  const shouldBypassCache = url.pathname.endsWith('.html') || 
                           url.pathname.endsWith('.css') || 
                           url.pathname.endsWith('.js');
  
  if (shouldBypassCache) {
    // 为关键资源添加时间戳，确保获取最新版本
    const timestamp = Date.now();
    const fetchUrl = event.request.url + (event.request.url.includes('?') ? '&' : '?') + '_t=' + timestamp;
    
    event.respondWith(
      fetch(fetchUrl, {
        cache: 'no-store', // 不使用浏览器缓存
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
        .then((response) => {
          // 如果网络请求成功，更新缓存
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // 网络请求失败时，尝试从缓存获取
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log('[SW] 从缓存返回:', event.request.url);
              return cachedResponse;
            }
            return new Response('离线状态，内容不可用', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain; charset=utf-8'
              })
            });
          });
        })
    );
  } else {
    // 其他资源使用普通网络优先策略
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response('离线状态，内容不可用', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
        })
    );
  }
});

// 定期检查更新（每10分钟）
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_UPDATE') {
    // 清除所有缓存，强制重新获取
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        return self.registration.update();
      })
    );
  }
});

// 后台同步 - 定期检查更新
self.addEventListener('sync', (event) => {
  if (event.tag === 'update-check') {
    event.waitUntil(
      self.registration.update().then(() => {
        console.log('[SW] 后台更新检查完成');
      })
    );
  }
});
