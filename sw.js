// Service Worker - 网络优先策略 + 自动更新检测
// 确保仓库更新时始终获取最新版本

const VERSION = '1.0.0'; // 手动版本号，每次更新时修改
const CACHE_NAME = 'phone-ui-v' + VERSION;
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './data-management.js',
  './appearance.js',
  './music-search.js',
  './persona.js',
  './worldbook.js',
  './showcase.js',
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
  
  // 只对本地文件添加时间戳，不要对外部 CDN 文件加时间戳
  const isLocalFile = url.hostname === self.location.hostname;
  const shouldBypassCache = isLocalFile && (
    url.pathname.endsWith('.html') || 
    url.pathname.endsWith('.css') || 
    url.pathname.endsWith('.js')
  );
  
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

// 消息处理（更新检查 + 主动消息后台定时）
let _swProactiveInterval = null;

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  if (event.data && event.data.type === 'CHECK_UPDATE') {
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
  if (event.data && event.data.type === 'START_PROACTIVE_TIMER') {
    if (_swProactiveInterval) clearInterval(_swProactiveInterval);
    _swProactiveInterval = setInterval(() => {
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'PROACTIVE_TICK' });
        });
      });
    }, 20000);
    console.log('[SW] 主动消息后台定时器已启动');
  }
  if (event.data && event.data.type === 'STOP_PROACTIVE_TIMER') {
    if (_swProactiveInterval) {
      clearInterval(_swProactiveInterval);
      _swProactiveInterval = null;
    }
    console.log('[SW] 主动消息后台定时器已停止');
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
