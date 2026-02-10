// ========== iOS风格弹窗系统 ==========

// 创建iOS风格的alert弹窗
function iosAlert(message, title = '提示') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = message;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        const okBtn = document.createElement('button');
        okBtn.className = 'ios-dialog-button primary';
        okBtn.textContent = '好';
        okBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(okBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        }
    });
}

// 创建iOS风格的confirm弹窗
function iosConfirm(message, title = '确认') {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = title;
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = message;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(false);
        };
        
        const okBtn = document.createElement('button');
        okBtn.className = 'ios-dialog-button primary';
        okBtn.textContent = '确定';
        okBtn.onclick = () => {
            closeDialog(true);
        };
        
        buttonsEl.appendChild(cancelBtn);
        buttonsEl.appendChild(okBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        }
    });
}

// 覆盖原生的alert和confirm
window.alert = iosAlert;
window.confirm = iosConfirm;

// 便捷函数：参数顺序为 (title, message)
function showIosAlert(title, message) {
    return iosAlert(message, title);
}

// ========== IndexedDB 存储管理系统 ==========

let db = null;
const DB_NAME = 'YuanBaoPhoneDB';
const DB_VERSION = 3;

// 初始化IndexedDB
async function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB打开失败:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('IndexedDB已初始化');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            db = event.target.result;
            console.log('IndexedDB升级中...');
            
            // 创建对象存储（类似表）
            if (!db.objectStoreNames.contains('images')) {
                const imageStore = db.createObjectStore('images', { keyPath: 'id' });
                imageStore.createIndex('type', 'type', { unique: false });
                imageStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('images存储已创建');
            }
            
            if (!db.objectStoreNames.contains('chats')) {
                const chatStore = db.createObjectStore('chats', { keyPath: 'id', autoIncrement: true });
                chatStore.createIndex('timestamp', 'timestamp', { unique: false });
                chatStore.createIndex('conversation', 'conversation', { unique: false });
                chatStore.createIndex('characterId', 'characterId', { unique: false });
                console.log('chats存储已创建');
            } else if (event.oldVersion < 2) {
                // 升级到版本2：添加characterId索引
                const transaction = event.target.transaction;
                const chatStore = transaction.objectStore('chats');
                if (!chatStore.indexNames.contains('characterId')) {
                    chatStore.createIndex('characterId', 'characterId', { unique: false });
                    console.log('chats存储已添加characterId索引');
                }
            }
            
            if (!db.objectStoreNames.contains('files')) {
                const fileStore = db.createObjectStore('files', { keyPath: 'id' });
                fileStore.createIndex('type', 'type', { unique: false });
                fileStore.createIndex('timestamp', 'timestamp', { unique: false });
                console.log('files存储已创建');
            }
            
            if (!db.objectStoreNames.contains('chatCharacters')) {
                const characterStore = db.createObjectStore('chatCharacters', { keyPath: 'id' });
                characterStore.createIndex('createTime', 'createTime', { unique: false });
                characterStore.createIndex('lastMessageTime', 'lastMessageTime', { unique: false });
                console.log('chatCharacters存储已创建');
            }
        };
    });
}

// 保存图片到IndexedDB
async function saveImageToDB(id, imageData, type = 'image') {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        
        const imageObject = {
            id: id,
            data: imageData,
            type: type,
            timestamp: Date.now()
        };
        
        const request = store.put(imageObject);
        
        request.onsuccess = () => {
            console.log(`图片已保存: ${id}`);
            resolve(true);
        };
        
        request.onerror = () => {
            console.error(`图片保存失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 从IndexedDB读取图片
async function getImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const request = store.get(id);
        
        request.onsuccess = () => {
            if (request.result) {
                console.log(` 图片已读取: ${id}`);
                resolve(request.result.data);
            } else {
                resolve(null);
            }
        };
        
        request.onerror = () => {
            console.error(` 图片读取失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 删除IndexedDB中的图片
async function deleteImageFromDB(id) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.delete(id);
        
        request.onsuccess = () => {
            console.log(` 图片已删除: ${id}`);
            resolve(true);
        };
        
        request.onerror = () => {
            console.error(` 图片删除失败: ${id}`, request.error);
            reject(request.error);
        };
    });
}

// 获取所有图片
async function getAllImagesFromDB() {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['images'], 'readonly');
        const store = transaction.objectStore('images');
        const request = store.getAll();
        
        request.onsuccess = () => {
            resolve(request.result);
        };
        
        request.onerror = () => {
            reject(request.error);
        };
    });
}

// 从IndexedDB获取所有聊天记录
async function getAllChatsFromDB() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['chats'], 'readonly');
            const store = transaction.objectStore('chats');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                console.warn('获取聊天记录失败:', request.error);
                resolve([]); // 失败时返回空数组
            };
        } catch (error) {
            console.warn('获取聊天记录失败:', error);
            resolve([]); // 失败时返回空数组
        }
    });
}

// 从IndexedDB获取所有文件
async function getAllFilesFromDB() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['files'], 'readonly');
            const store = transaction.objectStore('files');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                console.warn('获取文件失败:', request.error);
                resolve([]); // 失败时返回空数组
            };
        } catch (error) {
            console.warn('获取文件失败:', error);
            resolve([]); // 失败时返回空数组
        }
    });
}

// ========== 聊天角色 IndexedDB 操作 ==========

// 保存单个聊天角色到IndexedDB
async function saveChatCharacterToDB(character) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['chatCharacters'], 'readwrite');
            const store = transaction.objectStore('chatCharacters');
            const request = store.put(character);
            
            request.onsuccess = () => {
                console.log(`聊天角色已保存到IndexedDB: ${character.name}`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('保存聊天角色失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('保存聊天角色失败:', error);
            reject(error);
        }
    });
}

// 从IndexedDB获取所有聊天角色
async function getAllChatCharactersFromDB() {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['chatCharacters'], 'readonly');
            const store = transaction.objectStore('chatCharacters');
            const request = store.getAll();
            
            request.onsuccess = () => {
                resolve(request.result || []);
            };
            
            request.onerror = () => {
                console.warn('获取聊天角色失败:', request.error);
                resolve([]); // 失败时返回空数组
            };
        } catch (error) {
            console.warn('获取聊天角色失败:', error);
            resolve([]); // 失败时返回空数组
        }
    });
}

// 从IndexedDB删除聊天角色
async function deleteChatCharacterFromDB(characterId) {
    return new Promise((resolve, reject) => {
        try {
            const transaction = db.transaction(['chatCharacters'], 'readwrite');
            const store = transaction.objectStore('chatCharacters');
            const request = store.delete(characterId);
            
            request.onsuccess = () => {
                console.log(`聊天角色已从IndexedDB删除: ${characterId}`);
                resolve(true);
            };
            
            request.onerror = () => {
                console.error('删除聊天角色失败:', request.error);
                reject(request.error);
            };
        } catch (error) {
            console.error('删除聊天角色失败:', error);
            reject(error);
        }
    });
}

// 获取所有localStorage数据
function getAllLocalStorageData() {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key);
    }
    return data;
}

// 获取数据库使用情况
async function getStorageUsage() {
    if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageInMB = (estimate.usage / (1024 * 1024)).toFixed(2);
        const quotaInMB = (estimate.quota / (1024 * 1024)).toFixed(2);
        console.log(` 存储使用情况: ${usageInMB}MB / ${quotaInMB}MB`);
        return { usage: usageInMB, quota: quotaInMB, percentage: (estimate.usage / estimate.quota * 100).toFixed(2) };
    }
    return null;
}

// ========== 图片压缩功能 ==========

/**
 * 压缩图片
 * @param {File|Blob} file - 图片文件
 * @param {Object} options - 压缩选项
 * @returns {Promise<string>} - 压缩后的Base64数据
 */
async function compressImage(file, options = {}) {
    const {
        maxWidth = 1920,        // 最大宽度
        maxHeight = 1920,       // 最大高度
        quality = 0.8,          // 压缩质量 (0-1)
        maxSizeKB = 500,        // 最大文件大小(KB)
        outputFormat = 'image/jpeg'  // 输出格式
    } = options;
    
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const img = new Image();
            
            img.onload = () => {
                // 计算缩放比例
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = Math.floor(width * ratio);
                    height = Math.floor(height * ratio);
                }
                
                // 创建Canvas
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                
                // 白色背景（针对透明图片）
                if (outputFormat === 'image/jpeg') {
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillRect(0, 0, width, height);
                }
                
                // 绘制图片
                ctx.drawImage(img, 0, 0, width, height);
                
                // 尝试不同质量压缩，直到满足大小要求
                let currentQuality = quality;
                let compressedData = canvas.toDataURL(outputFormat, currentQuality);
                
                // 计算压缩后的大小（Base64转KB）
                const getBase64SizeKB = (base64) => {
                    const base64Length = base64.length - (base64.indexOf(',') + 1);
                    return (base64Length * 0.75) / 1024;
                };
                
                let attempts = 0;
                const maxAttempts = 5;
                
                while (getBase64SizeKB(compressedData) > maxSizeKB && currentQuality > 0.1 && attempts < maxAttempts) {
                    currentQuality -= 0.1;
                    compressedData = canvas.toDataURL(outputFormat, currentQuality);
                    attempts++;
                }
                
                const finalSizeKB = getBase64SizeKB(compressedData);
                console.log(` 图片压缩完成: ${img.width}x${img.height} → ${width}x${height}, ${finalSizeKB.toFixed(2)}KB, 质量:${(currentQuality * 100).toFixed(0)}%`);
                
                resolve(compressedData);
            };
            
            img.onerror = () => {
                reject(new Error('图片加载失败'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = () => {
            reject(new Error('文件读取失败'));
        };
        
        // 如果是GIF，保留原格式
        if (file.type === 'image/gif') {
            reader.onload = (e) => {
                console.log('GIF图片保留原格式');
                resolve(e.target.result);
            };
        }
        
        reader.readAsDataURL(file);
    });
}

// ========== 锁屏功能 ==========

// 检查并显示锁屏
function checkAndShowLockScreen() {
    const lockScreenEnabled = localStorage.getItem('lockScreenEnabled') === 'true';
    if (lockScreenEnabled) {
        showLockScreen();
    }
}

// 显示锁屏
function showLockScreen() {
    const lockScreen = document.getElementById('lockScreen');
    lockScreen.classList.add('active');
    
    // 应用壁纸
    applyWallpaperToLockScreen();
    
    // 更新时间
    updateLockScreenTime();
    
    // 每秒更新时间
    const timeInterval = setInterval(() => {
        if (!lockScreen.classList.contains('active')) {
            clearInterval(timeInterval);
            return;
        }
        updateLockScreenTime();
    }, 1000);
    
    // 获取滑动方式设置
    const slideMode = localStorage.getItem('lockScreenSlideMode') || 'horizontal';
    
    // 显示对应的解锁界面
    const horizontalSlide = document.getElementById('horizontalSlide');
    const verticalSlide = document.getElementById('verticalSlide');
    
    if (slideMode === 'horizontal') {
        horizontalSlide.style.display = 'block';
        verticalSlide.style.display = 'none';
        initSlideToUnlock();
    } else {
        horizontalSlide.style.display = 'none';
        verticalSlide.style.display = 'block';
        initSwipeUpUnlock();
    }
}

// 更新锁屏时间
function updateLockScreenTime() {
    const now = new Date();
    
    // 获取小时和分钟
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    // 获取月份、日期和星期
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const weekday = weekdays[now.getDay()];
    
    // 更新显示
    document.getElementById('lockTime').textContent = `${hours}:${minutes}`;
    document.getElementById('lockDate').textContent = `${month}月${date}日 ${weekday}`;
}

// 初始化滑动解锁
function initSlideToUnlock() {
    const slideButton = document.getElementById('slideButton');
    const slideTrack = slideButton.parentElement;
    const slideText = document.getElementById('slideText');
    
    let isDragging = false;
    let startX = 0;
    let currentX = 0;
    const maxSlide = slideTrack.offsetWidth - slideButton.offsetWidth - 8;
    
    // 鼠标/触摸开始
    function handleStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        slideButton.style.transition = 'none';
    }
    
    // 鼠标/触摸移动
    function handleMove(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
        currentX = clientX - startX;
        
        // 限制滑动范围
        if (currentX < 0) currentX = 0;
        if (currentX > maxSlide) currentX = maxSlide;
        
        // 移动按钮
        slideButton.style.transform = `translateX(${currentX}px)`;
        
        // 文字淡出效果
        const opacity = 1 - (currentX / maxSlide);
        slideText.style.opacity = opacity;
        
        // 检查是否滑动到底
        if (currentX >= maxSlide * 0.9) {
            unlockScreen();
        }
    }
    
    // 鼠标/触摸结束
    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        
        // 如果没有滑动到底，回弹
        if (currentX < maxSlide * 0.9) {
            slideButton.style.transition = 'transform 0.3s ease-out';
            slideButton.style.transform = 'translateX(0)';
            slideText.style.opacity = '1';
        }
        
        currentX = 0;
    }
    
    // 解锁屏幕
    function unlockScreen() {
        isDragging = false;
        const lockScreen = document.getElementById('lockScreen');
        
        // 检查是否启用了密码
        const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
        const passwordType = localStorage.getItem('passwordType') || 'number';
        const hasPassword = passwordType === 'number' ? 
            localStorage.getItem('lockPassword') : 
            localStorage.getItem('lockGesture');
        
        if (passwordEnabled && hasPassword) {
            // 有密码，重置滑块并显示密码输入界面
            slideButton.style.transition = 'transform 0.3s ease-out';
            slideButton.style.transform = 'translateX(0)';
            slideText.style.opacity = '1';
            
            // 延迟一下显示密码界面，让滑块先复位
            setTimeout(() => {
                showPasswordScreen();
            }, 200);
        } else {
            // 没有密码，直接解锁
            lockScreen.style.transition = 'opacity 0.3s ease-out';
            lockScreen.style.opacity = '0';
            
            setTimeout(() => {
                lockScreen.classList.remove('active');
                lockScreen.style.opacity = '1';
                lockScreen.style.transition = '';
                
                // 重置滑块
                slideButton.style.transition = 'transform 0.3s ease-out';
                slideButton.style.transform = 'translateX(0)';
                slideText.style.opacity = '1';
            }, 300);
        }
    }
    
    // 添加事件监听
    slideButton.addEventListener('mousedown', handleStart);
    slideButton.addEventListener('touchstart', handleStart, { passive: false });
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove, { passive: false });
    
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
}

// 初始化向上滑动解锁
function initSwipeUpUnlock() {
    const lockScreen = document.getElementById('lockScreen');
    let startY = 0;
    let currentY = 0;
    let isSwiping = false;
    
    // 触摸/鼠标开始
    function handleStart(e) {
        isSwiping = true;
        startY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    }
    
    // 触摸/鼠标移动
    function handleMove(e) {
        if (!isSwiping) return;
        
        e.preventDefault();
        const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
        currentY = startY - clientY; // 向上滑动时值为正
        
        // 如果向上滑动超过100px，解锁
        if (currentY > 100) {
            unlockScreen();
        }
    }
    
    // 触摸/鼠标结束
    function handleEnd() {
        isSwiping = false;
        startY = 0;
        currentY = 0;
    }
    
    // 解锁屏幕
    function unlockScreen() {
        isSwiping = false;
        
        // 检查是否启用了密码
        const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
        const passwordType = localStorage.getItem('passwordType') || 'number';
        const hasPassword = passwordType === 'number' ? 
            localStorage.getItem('lockPassword') : 
            localStorage.getItem('lockGesture');
        
        if (passwordEnabled && hasPassword) {
            // 有密码，直接显示密码输入界面（不关闭锁屏）
            showPasswordScreen();
        } else {
            // 没有密码，直接解锁
            lockScreen.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            lockScreen.style.opacity = '0';
            lockScreen.style.transform = 'translateY(-50px)';
            
            setTimeout(() => {
                lockScreen.classList.remove('active');
                lockScreen.style.opacity = '1';
                lockScreen.style.transform = '';
                lockScreen.style.transition = '';
            }, 300);
        }
    }
    
    // 添加事件监听（监听整个锁屏界面）
    lockScreen.addEventListener('mousedown', handleStart);
    lockScreen.addEventListener('touchstart', handleStart, { passive: false });
    
    lockScreen.addEventListener('mousemove', handleMove);
    lockScreen.addEventListener('touchmove', handleMove, { passive: false });
    
    lockScreen.addEventListener('mouseup', handleEnd);
    lockScreen.addEventListener('touchend', handleEnd);
}

// ========== IndexedDB 持久化存储管理 ==========

class StorageDB {
    constructor() {
        this.dbName = 'YuanbaoAppDB';
        this.version = 1;
        this.db = null;
    }

    // 初始化数据库
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('数据库打开失败:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('数据库初始化成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建对象存储空间（如果不存在）
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
                
                console.log('数据库升级完成');
            };
        });
    }

    // 保存数据
    async setItem(key, value) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.put({ key, value, timestamp: Date.now() });

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 读取数据
    async getItem(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.get(key);

            request.onsuccess = () => {
                resolve(request.result ? request.result.value : null);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // 删除数据
    async removeItem(key) {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.delete(key);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 获取所有键
    async getAllKeys() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAllKeys();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 清空所有数据
    async clear() {
        if (!this.db) await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['settings'], 'readwrite');
            const store = transaction.objectStore('settings');
            const request = store.clear();

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    // 从 localStorage 迁移数据
    async migrateFromLocalStorage() {
        const keysToMigrate = ['apiSettings', 'apiPresets', 'widgetAvatar', 'widgetName', 'widgetId', 'widgetContent', 'notebookLoveDate', 'notebookLoveDateConfig', 'notebookText', 'notebookImage', 'musicAvatar', 'musicUsername', 'musicBirthday', 'musicCover'];
        let migrated = 0;

        for (const key of keysToMigrate) {
            const value = localStorage.getItem(key);
            if (value) {
                try {
                    // 尝试解析 JSON（头像、名称、ID、文案、相恋日期、图片、音乐头像、音乐用户名、音乐生日和音乐封面直接存储字符串）
                    const stringKeys = ['widgetAvatar', 'widgetName', 'widgetId', 'widgetContent', 'notebookLoveDate', 'notebookText', 'notebookImage', 'musicAvatar', 'musicUsername', 'musicBirthday', 'musicCover'];
                    const parsedValue = stringKeys.includes(key) ? value : JSON.parse(value);
                    await this.setItem(key, parsedValue);
                    migrated++;
                    console.log(`已迁移: ${key}`);
                } catch (e) {
                    console.error(`迁移失败 ${key}:`, e);
                }
            }
        }

        if (migrated > 0) {
            console.log(`成功迁移 ${migrated} 项数据到 IndexedDB`);
        }

        return migrated;
    }
}

// 创建全局存储实例
const storageDB = new StorageDB();

// 更新时间显示
function updateTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    document.getElementById('time').textContent = `${hours}:${minutes}`;
}

// 更新电池显示
async function updateBattery() {
    try {
        if (navigator.getBattery) {
            const battery = await navigator.getBattery();
            const level = Math.floor(battery.level * 100);
            const batteryEl = document.getElementById('batteryPercentage');
            const batteryBody = document.querySelector('.battery-body');
            
            if (batteryEl) {
                batteryEl.textContent = level;
            }
            
            // 根据充电状态和电量更改颜色
            if (batteryBody) {
                // 移除所有状态类
                batteryBody.classList.remove('charging', 'low-battery');
                
                if (battery.charging) {
                    // 充电中显示绿色
                    batteryBody.classList.add('charging');
                } else if (level < 20) {
                    // 低电量显示红色
                    batteryBody.classList.add('low-battery');
                }
                // 其他情况保持默认灰色
            }
        } else {
            // 不支持电池API，显示100
            const batteryEl = document.getElementById('batteryPercentage');
            if (batteryEl) {
                batteryEl.textContent = '100';
            }
        }
    } catch (error) {
        // 出错时显示100
        const batteryEl = document.getElementById('batteryPercentage');
        if (batteryEl) {
            batteryEl.textContent = '100';
        }
    }
}

// 更新日期和星期显示（自动适配用户地区）
function updateWidgetDate() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    // 根据地区自动格式化日期
    let dateText;
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "月日" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        dateText = `${month}月${day}日`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "月日" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        dateText = `${month}月${day}日`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "Mon DD" 格式
        const options = { month: 'short', day: 'numeric' };
        dateText = now.toLocaleDateString(userLocale, options);
    } else {
        // 其他地区：使用简短的日期格式
        const options = { month: 'numeric', day: 'numeric' };
        dateText = now.toLocaleDateString(userLocale, options);
    }
    
    // 获取星期几（根据用户地区自动显示）
    let dayText;
    const dayOfWeek = now.getDay();
    
    if (userLocale.startsWith('zh')) {
        // 中文：星期一、星期二...
        const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        dayText = days[dayOfWeek];
    } else if (userLocale.startsWith('ja')) {
        // 日语：日曜日、月曜日...
        const days = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        dayText = days[dayOfWeek];
    } else {
        // 其他语言：使用系统提供的星期名称（短格式）
        const options = { weekday: 'short' };
        dayText = now.toLocaleDateString(userLocale, options);
    }
    
    // 更新DOM
    const dateElement = document.getElementById('widgetDateText');
    const dayElement = document.getElementById('widgetDayText');
    
    if (dateElement && dayElement) {
        dateElement.textContent = dateText;
        dayElement.textContent = dayText;
    }
}

updateTime();
setInterval(updateTime, 1000);

// 更新电池显示
updateBattery();
setInterval(updateBattery, 1000); // 每1秒更新一次电池

// 更新第二个小组件的日期时间显示（自动适配用户地区）
function updateNotebookDateTime() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    let dateTimeText;
    
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "月日 时:分" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${month}月${day}日 ${hours}:${minutes}`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "月日 时:分" 格式
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${month}月${day}日 ${hours}:${minutes}`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "Mon DD HH:MM" 格式
        const options = { month: 'short', day: 'numeric' };
        const dateStr = now.toLocaleDateString(userLocale, options);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${dateStr} ${hours}:${minutes}`;
    } else {
        // 其他地区：使用本地化的日期时间格式
        const dateOptions = { month: 'numeric', day: 'numeric' };
        const dateStr = now.toLocaleDateString(userLocale, dateOptions);
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        dateTimeText = `${dateStr} ${hours}:${minutes}`;
    }
    
    // 更新DOM
    const dateTimeElement = document.getElementById('notebookDateTime');
    if (dateTimeElement) {
        dateTimeElement.textContent = dateTimeText;
    }
}

// 立即更新日期，然后每分钟更新一次（日期变化不频繁）
updateWidgetDate();
setInterval(updateWidgetDate, 60000);

// 立即更新第二个小组件的日期时间，然后每秒更新一次
updateNotebookDateTime();
setInterval(updateNotebookDateTime, 1000);

// 更新第三个小组件（音乐播放器）的日期显示（自动适配用户地区）
function updateMusicDate() {
    const now = new Date();
    
    // 获取用户所在地区的语言设置
    const userLocale = navigator.language || 'zh-CN';
    
    let dateText;
    
    if (userLocale.startsWith('zh')) {
        // 中文地区：显示 "YYYY-MM-DD 周X" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('ja')) {
        // 日语地区：显示 "YYYY-MM-DD 曜日" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('en')) {
        // 英语地区：显示 "YYYY-MM-DD Day" 格式（例如：2025-01-23 Thu）
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('ko')) {
        // 韩语地区：显示 "YYYY-MM-DD 요일" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
        const weekday = weekdays[now.getDay()];
        dateText = `${year}-${month}-${day} ${weekday}`;
    } else if (userLocale.startsWith('de')) {
        // 德语地区：显示 "DD.MM.YYYY Tag" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}.${month}.${year} ${weekday}`;
    } else if (userLocale.startsWith('fr')) {
        // 法语地区：显示 "DD/MM/YYYY Jour" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}/${month}/${year} ${weekday}`;
    } else if (userLocale.startsWith('es')) {
        // 西班牙语地区：显示 "DD/MM/YYYY Día" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}/${month}/${year} ${weekday}`;
    } else if (userLocale.startsWith('ru')) {
        // 俄语地区：显示 "DD.MM.YYYY День" 格式
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${day}.${month}.${year} ${weekday}`;
    } else {
        // 其他地区：使用 ISO 格式 YYYY-MM-DD + 星期简写
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const options = { weekday: 'short' };
        const weekday = now.toLocaleDateString(userLocale, options);
        dateText = `${year}-${month}-${day} ${weekday}`;
    }
    
    // 更新DOM
    const musicDateElement = document.getElementById('musicDate');
    if (musicDateElement) {
        musicDateElement.textContent = dateText;
    }
}

// 立即更新第三个小组件的日期，然后每分钟更新一次
updateMusicDate();
setInterval(updateMusicDate, 60000);

// API设置相关功能
const apiUrls = {
    hakimi: 'https://generativelanguage.googleapis.com/v1beta',
    claude: 'https://api.anthropic.com/v1',
    ds: 'https://api.deepseek.com/v1',
    custom: ''
};

// 打开API设置界面
async function openApiSettings() {
    document.getElementById('apiSettings').classList.add('active');
    // 先加载保存的设置，再初始化界面
    await loadSettings();
    handleProviderChange(); // 初始化API地址（不会覆盖已加载的值）
}

// 关闭设置界面
function closeSettings() {
    document.getElementById('apiSettings').classList.remove('active');
}

// 打开数据管理界面（占位）
// ==================== 数据管理功能 ====================

// 打开数据管理界面
async function openDataManagement() {
    document.getElementById('dataManagementSettings').classList.add('active');
    
    // 刷新存储信息和数据统计
    await refreshStorageInfo();
    await updateDataStatistics();
}

// 关闭数据管理界面
function closeDataManagement() {
    document.getElementById('dataManagementSettings').classList.remove('active');
}

// 更新数据统计
async function updateDataStatistics() {
    try {
        const allImages = await getAllImagesFromDB();
        const imageCount = allImages.length;
        
        // 计算总大小（估算Base64大小）
        let totalSizeBytes = 0;
        allImages.forEach(img => {
            if (img.data) {
                // Base64 字符串长度 * 0.75 约等于原始字节数
                const base64Length = img.data.length - (img.data.indexOf(',') + 1);
                totalSizeBytes += base64Length * 0.75;
            }
        });
        
        const totalSizeKB = (totalSizeBytes / 1024).toFixed(2);
        const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(2);
        
        // 更新界面
        document.getElementById('imageCount').textContent = imageCount;
        
        if (totalSizeBytes < 1024 * 1024) {
            document.getElementById('totalSize').textContent = `${totalSizeKB} KB`;
        } else {
            document.getElementById('totalSize').textContent = `${totalSizeMB} MB`;
        }
        
        console.log(` 数据统计: ${imageCount}张图片, ${totalSizeKB}KB`);
    } catch (error) {
        console.error('更新数据统计失败:', error);
    }
}

// 显示详细信息
async function showDataDetails() {
    try {
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            alert('暂无数据');
            return;
        }
        
        let details = '数据详细信息\n\n';
        details += `总计：${allImages.length} 张图片\n\n`;
        
        allImages.forEach((img, index) => {
            const sizeKB = ((img.data.length - (img.data.indexOf(',') + 1)) * 0.75 / 1024).toFixed(2);
            const date = new Date(img.timestamp).toLocaleString('zh-CN');
            details += `${index + 1}. ${img.id}\n`;
            details += `   类型: ${img.type}\n`;
            details += `   大小: ${sizeKB} KB\n`;
            details += `   时间: ${date}\n\n`;
        });
        
        alert(details);
    } catch (error) {
        console.error('获取详细信息失败:', error);
        alert('获取详细信息失败！');
    }
}

// ==================== 导出数据功能（多种方案） ====================

// 显示导出选项弹窗
async function showExportOptions() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '300px';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择导出方式';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = '请选择导出完整数据的方式：';
        messageEl.style.paddingBottom = '10px';
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';
        
        // 方案1：分批导出（推荐）
        const batchBtn = document.createElement('button');
        batchBtn.className = 'ios-dialog-button primary';
        batchBtn.textContent = '分批导出（推荐）';
        batchBtn.onclick = () => {
            closeDialog('batch');
        };
        
        // 方案4：基本导出（带检测）
        const basicBtn = document.createElement('button');
        basicBtn.className = 'ios-dialog-button';
        basicBtn.textContent = '基本导出（单文件）';
        basicBtn.onclick = () => {
            closeDialog('basic');
        };
        
        // 方案3：压缩导出
        const compressBtn = document.createElement('button');
        compressBtn.className = 'ios-dialog-button';
        compressBtn.textContent = '压缩导出（ZIP）';
        compressBtn.onclick = () => {
            closeDialog('compress');
        };
        
        // 方案2：流式导出
        const streamBtn = document.createElement('button');
        streamBtn.className = 'ios-dialog-button';
        streamBtn.textContent = '流式导出（大文件）';
        streamBtn.onclick = () => {
            closeDialog('stream');
        };
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(null);
        };
        
        buttonsEl.appendChild(batchBtn);
        buttonsEl.appendChild(basicBtn);
        buttonsEl.appendChild(compressBtn);
        buttonsEl.appendChild(streamBtn);
        buttonsEl.appendChild(cancelBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (result) {
                    handleExport(result);
                }
                resolve(result);
            }, 300);
        }
    });
}

// 处理导出
async function handleExport(type) {
    switch(type) {
        case 'basic':
            await exportBasic();
            break;
        case 'batch':
            await exportBatch();
            break;
        case 'compress':
            await exportCompress();
            break;
        case 'stream':
            await exportStream();
            break;
    }
}

// 方案1：基本导出（单文件，带大小检测）
async function exportBasic() {
    try {
        // 获取所有数据
        const allImages = await getAllImagesFromDB();
        const allChats = await getAllChatsFromDB();
        const allFiles = await getAllFilesFromDB();
        const allSettings = getAllLocalStorageData();
        
        // 检查是否有数据
        const hasData = allImages.length > 0 || allChats.length > 0 || allFiles.length > 0 || Object.keys(allSettings).length > 0;
        
        if (!hasData) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        // 创建导出数据
        const exportData = {
            version: '3.0',
            exportTime: new Date().toISOString(),
            appName: 'buzhiqiming',
            appNameCN: '不知其名',
            description: 'Complete data backup',
            data: {
                images: allImages,
                chats: allChats,
                files: allFiles,
                localStorage: allSettings
            },
            statistics: {
                imageCount: allImages.length,
                chatCount: allChats.length,
                fileCount: allFiles.length,
                settingCount: Object.keys(allSettings).length
            }
        };
        
        // 转换为JSON并计算大小
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        // 大小检测（超过50MB警告）
        if (blob.size > 50 * 1024 * 1024) {
            const confirmed = await iosConfirm(
                `数据量较大 (${fileSizeMB} MB)，可能导致浏览器卡顿或崩溃。\n\n建议：\n1. 先压缩图片\n2. 使用"分批导出"\n\n确定继续导出吗？`,
                '⚠️ 数据量过大警告'
            );
            
            if (!confirmed) return;
        }
        
        // 下载文件
        downloadFile(blob, `buzhiqiming_backup_${new Date().getTime()}.json`);
        
        console.log('基本导出完成');
        await iosAlert(
            `导出成功！\n\n图片: ${allImages.length}张\n聊天: ${allChats.length}条\n文件: ${allFiles.length}个\n设置: ${Object.keys(allSettings).length}项\n\n文件大小: ${fileSizeMB} MB`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('导出失败:', error);
        await iosAlert('导出失败：' + error.message, '错误');
    }
}

// 方案2：分批导出（多个文件）
async function exportBatch() {
    try {
        const timestamp = new Date().getTime();
        let fileCount = 0;
        
        // 导出图片
        const allImages = await getAllImagesFromDB();
        if (allImages.length > 0) {
            const imagesData = {
                version: '3.0',
                type: 'images',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allImages
            };
            const blob = new Blob([JSON.stringify(imagesData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_images_${timestamp}.json`);
            fileCount++;
            await sleep(500); // 延迟避免浏览器阻止多次下载
        }
        
        // 导出聊天
        const allChats = await getAllChatsFromDB();
        if (allChats.length > 0) {
            const chatsData = {
                version: '3.0',
                type: 'chats',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allChats
            };
            const blob = new Blob([JSON.stringify(chatsData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_chats_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出文件
        const allFiles = await getAllFilesFromDB();
        if (allFiles.length > 0) {
            const filesData = {
                version: '3.0',
                type: 'files',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allFiles
            };
            const blob = new Blob([JSON.stringify(filesData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_files_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出设置
        const allSettings = getAllLocalStorageData();
        if (Object.keys(allSettings).length > 0) {
            const settingsData = {
                version: '3.0',
                type: 'settings',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allSettings
            };
            const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_settings_${timestamp}.json`);
            fileCount++;
        }
        
        if (fileCount === 0) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        await iosAlert(
            `分批导出成功！\n\n已导出 ${fileCount} 个文件\n\n注意：部分浏览器可能需要您手动允许多次下载`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('分批导出失败:', error);
        await iosAlert('导出失败：' + error.message, '错误');
    }
}

// 方案3：压缩导出（使用JSZip）
async function exportCompress() {
    try {
        // 检查是否已加载JSZip库
        if (typeof JSZip === 'undefined') {
            const confirmed = await iosConfirm(
                '压缩导出需要加载 JSZip 库（约100KB）\n\n是否继续？',
                '需要加载外部库'
            );
            
            if (!confirmed) return;
            
            // 动态加载JSZip库
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            
            // 检查是否加载成功
            if (typeof JSZip === 'undefined') {
                await iosAlert('JSZip 库加载失败，请检查网络连接或使用其他导出方式', '加载失败');
                return;
            }
        }
        
        await iosAlert('正在准备数据并压缩，请稍候...', '处理中');
        
        // 获取所有数据
        const allImages = await getAllImagesFromDB();
        const allChats = await getAllChatsFromDB();
        const allFiles = await getAllFilesFromDB();
        const allSettings = getAllLocalStorageData();
        
        // 检查是否有数据
        const hasData = allImages.length > 0 || allChats.length > 0 || allFiles.length > 0 || Object.keys(allSettings).length > 0;
        
        if (!hasData) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        // 创建ZIP文件
        const zip = new JSZip();
        const timestamp = new Date().getTime();
        
        // 添加主数据文件
        const exportData = {
            version: '3.0',
            exportTime: new Date().toISOString(),
            appName: 'buzhiqiming',
            appNameCN: '不知其名',
            description: 'Complete data backup (Compressed)',
            statistics: {
                imageCount: allImages.length,
                chatCount: allChats.length,
                fileCount: allFiles.length,
                settingCount: Object.keys(allSettings).length
            }
        };
        
        zip.file('info.json', JSON.stringify(exportData, null, 2));
        
        // 分别添加各类数据
        if (allImages.length > 0) {
            zip.file('images.json', JSON.stringify(allImages, null, 2));
        }
        if (allChats.length > 0) {
            zip.file('chats.json', JSON.stringify(allChats, null, 2));
        }
        if (allFiles.length > 0) {
            zip.file('files.json', JSON.stringify(allFiles, null, 2));
        }
        if (Object.keys(allSettings).length > 0) {
            zip.file('settings.json', JSON.stringify(allSettings, null, 2));
        }
        
        // 生成ZIP文件
        const blob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });
        
        const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        // 下载文件
        downloadFile(blob, `buzhiqiming_backup_${timestamp}.zip`);
        
        await iosAlert(
            `压缩导出成功！\n\n图片: ${allImages.length}张\n聊天: ${allChats.length}条\n文件: ${allFiles.length}个\n设置: ${Object.keys(allSettings).length}项\n\n压缩后大小: ${fileSizeMB} MB`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('压缩导出失败:', error);
        await iosAlert('压缩导出失败：' + error.message, '错误');
    }
}

// 方案2：流式导出（使用StreamSaver.js）
async function exportStream() {
    try {
        // 提示用户这个功能需要外部库
        const confirmed = await iosConfirm(
            '流式导出适合超大数据量（>100MB）\n\n需要加载 StreamSaver.js 库\n\n注意：此功能在某些浏览器可能不稳定\n\n是否继续？',
            '流式导出'
        );
        
        if (!confirmed) return;
        
        // 由于StreamSaver.js较为复杂且需要Service Worker，暂时使用优化的分块导出方案
        await iosAlert(
            '流式导出功能开发中...\n\n建议使用：\n1. 分批导出（多文件，最稳定）\n2. 压缩导出（ZIP格式，体积小）\n\n或先压缩图片再导出',
            '功能提示'
        );
        
    } catch (error) {
        console.error('流式导出失败:', error);
        await iosAlert('流式导出失败：' + error.message, '错误');
    }
}

// 辅助函数：动态加载外部脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('脚本加载失败'));
        document.head.appendChild(script);
    });
}

// 辅助函数：下载文件
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 辅助函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 清空所有图片
async function clearAllImages() {
    const confirmed = await iosConfirm(
        '此操作将删除：\n- 头像\n- 壁纸\n- 封面图\n- 所有其他图片\n\n此操作不可恢复！',
        '确定要清空所有图片吗？'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = await iosConfirm(
        '再次确认：真的要删除所有图片吗？',
        '最后确认'
    );
    
    if (!doubleConfirm) return;
    
    try {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.clear();
        
        await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 清除界面上的图片
        const avatarImage = document.getElementById('avatarImage');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImage) avatarImage.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
        
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        await iosAlert('所有图片已清空！', '完成');
        console.log('所有图片已清空');
    } catch (error) {
        console.error('清空图片失败:', error);
        await iosAlert('清空失败：' + error.message, '错误');
    }
}

// 清除冗余数据
async function cleanRedundantData() {
    try {
        // 确认操作
        const confirmed = await iosConfirm(
            '此操作将清理：\n\n• 未被引用的图片\n• 无效的缓存数据\n• 过期的临时数据\n\n建议在清理前先导出备份',
            '确定要清除冗余数据吗？'
        );
        
        if (!confirmed) return;
        
        await iosAlert('正在分析冗余数据，请稍候...', '处理中');
        
        let cleanedCount = 0;
        let freedSpaceKB = 0;
        const cleanLog = [];
        
        // 1. 清理未使用的图片
        const allImages = await getAllImagesFromDB();
        const usedImageIds = new Set();
        
        // 收集所有正在使用的图片ID
        // - 聊天角色头像
        chatCharacters.forEach(char => {
            if (char.avatar && char.avatar.startsWith('data:image')) {
                usedImageIds.add(char.avatar);
            }
        });
        
        // - 人设头像
        personas.forEach(persona => {
            if (persona.avatar && persona.avatar.startsWith('data:image')) {
                usedImageIds.add(persona.avatar);
            }
        });
        
        // - 用户头像（从localStorage）
        try {
            const userDataStr = localStorage.getItem('chatUserData');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (userData.avatar) {
                    usedImageIds.add(userData.avatar);
                }
            }
        } catch (e) {}
        
        // - 锁屏壁纸和主屏壁纸
        const lockWallpaper = await getImageFromDB('lock-wallpaper');
        if (lockWallpaper) usedImageIds.add(lockWallpaper);
        
        const mainWallpaper = await getImageFromDB('main-wallpaper');
        if (mainWallpaper) usedImageIds.add(mainWallpaper);
        
        // - 音乐封面、贴纸等
        const musicCover = await getImageFromDB('music-cover');
        if (musicCover) usedImageIds.add(musicCover);
        
        const sticker = await getImageFromDB('sticker');
        if (sticker) usedImageIds.add(sticker);
        
        // 检查未使用的图片
        const unusedImages = [];
        for (const img of allImages) {
            let isUsed = false;
            
            // 检查是否在使用中
            if (usedImageIds.has(img.data)) {
                isUsed = true;
            }
            
            // 检查固定ID的图片
            if (['avatar', 'lock-wallpaper', 'main-wallpaper', 'music-cover', 'music-avatar', 'sticker'].includes(img.id)) {
                isUsed = true;
            }
            
            if (!isUsed) {
                unusedImages.push(img);
            }
        }
        
        // 删除未使用的图片
        if (unusedImages.length > 0) {
            for (const img of unusedImages) {
                try {
                    await deleteImageFromDB(img.id);
                    const sizeKB = ((img.data.length - (img.data.indexOf(',') + 1)) * 0.75 / 1024).toFixed(2);
                    freedSpaceKB += parseFloat(sizeKB);
                    cleanedCount++;
                } catch (e) {
                    console.error('删除图片失败:', e);
                }
            }
            cleanLog.push(`清理未使用图片: ${unusedImages.length}张`);
        }
        
        // 2. 清理无效的localStorage数据
        let localStorageCleaned = 0;
        const validKeys = [
            'chatCharacters', 'personas', 'chatUserData', 'lockScreenEnabled', 
            'lockScreenSlideMode', 'lockPasswordEnabled', 'passwordType', 
            'lockPassword', 'lockGesture', 'lockWallpaperEnabled', 
            'customStyleEnabled', 'statusBarEnabled', 'phoneBorderEnabled', 
            'mainWallpaperEnabled'
        ];
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && !validKeys.includes(key)) {
                // 检查是否是临时数据或过期数据
                if (key.startsWith('temp_') || key.startsWith('cache_') || key.includes('backup_old')) {
                    localStorage.removeItem(key);
                    localStorageCleaned++;
                }
            }
        }
        
        if (localStorageCleaned > 0) {
            cleanLog.push(`清理无效缓存: ${localStorageCleaned}项`);
        }
        
        // 3. 清理无效的聊天记录
        try {
            const allChats = await getAllChatsFromDB();
            const validCharacterIds = new Set(chatCharacters.map(c => c.id));
            const invalidChats = allChats.filter(chat => !validCharacterIds.has(chat.characterId));
            
            if (invalidChats.length > 0) {
                const chatsTransaction = db.transaction(['chats'], 'readwrite');
                const chatsStore = chatsTransaction.objectStore('chats');
                
                for (const chat of invalidChats) {
                    try {
                        await new Promise((resolve, reject) => {
                            const request = chatsStore.delete(chat.id);
                            request.onsuccess = () => resolve();
                            request.onerror = () => reject(request.error);
                        });
                    } catch (e) {}
                }
                
                cleanLog.push(`清理无效聊天记录: ${invalidChats.length}条`);
            }
        } catch (e) {
            console.error('清理聊天记录失败:', e);
        }
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 显示结果
        let resultMsg = '清理完成！\n\n';
        
        if (cleanLog.length > 0) {
            resultMsg += cleanLog.join('\n') + '\n\n';
        } else {
            resultMsg += '未发现冗余数据\n\n';
        }
        
        if (freedSpaceKB > 0) {
            const freedSpaceMB = (freedSpaceKB / 1024).toFixed(2);
            if (freedSpaceKB < 1024) {
                resultMsg += `释放空间: ${freedSpaceKB.toFixed(2)} KB`;
            } else {
                resultMsg += `释放空间: ${freedSpaceMB} MB`;
            }
        }
        
        await iosAlert(resultMsg, '清理完成');
        
        console.log('冗余数据清理完成:', cleanLog);
        
    } catch (error) {
        console.error('清理冗余数据失败:', error);
        await iosAlert('清理失败：' + error.message, '错误');
    }
}

// 清空所有数据（整个小手机的所有数据）
async function clearAllData() {
    // 第一次确认
    const confirmed = await iosConfirm(
        '此操作将删除整个小手机的所有数据：\n\n- 所有聊天角色\n- 所有聊天记录\n- 所有图片（头像、壁纸、封面等）\n- 所有文件\n- 所有人设和世界书\n- 所有设置和配置\n\n此操作不可恢复！\n\n⚠️ 注意：仅清空当前页面的数据，不影响其他页面的小手机。',
        '确定要清空所有数据吗？'
    );
    
    if (!confirmed) return;
    
    // 第二次确认
    const doubleConfirm = await iosConfirm(
        '最后确认：\n\n真的要清空整个小手机的所有数据吗？\n\n建议先导出数据备份！',
        '⚠️ 最后确认'
    );
    
    if (!doubleConfirm) return;
    
    try {
        // 清空IndexedDB中的所有数据
        console.log('开始清空IndexedDB数据...');
        
        // 清空images
        try {
            const imagesTransaction = db.transaction(['images'], 'readwrite');
            const imagesStore = imagesTransaction.objectStore('images');
            await new Promise((resolve, reject) => {
                const request = imagesStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 图片数据已清空');
        } catch (error) {
            console.warn('清空图片数据失败:', error);
        }
        
        // 清空chats
        try {
            const chatsTransaction = db.transaction(['chats'], 'readwrite');
            const chatsStore = chatsTransaction.objectStore('chats');
            await new Promise((resolve, reject) => {
                const request = chatsStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 聊天记录已清空');
        } catch (error) {
            console.warn('清空聊天记录失败:', error);
        }
        
        // 清空files
        try {
            const filesTransaction = db.transaction(['files'], 'readwrite');
            const filesStore = filesTransaction.objectStore('files');
            await new Promise((resolve, reject) => {
                const request = filesStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 文件数据已清空');
        } catch (error) {
            console.warn('清空文件数据失败:', error);
        }
        
        // 清空chatCharacters
        try {
            const charactersTransaction = db.transaction(['chatCharacters'], 'readwrite');
            const charactersStore = charactersTransaction.objectStore('chatCharacters');
            await new Promise((resolve, reject) => {
                const request = charactersStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 聊天角色已清空');
            // 清空内存中的角色数组
            chatCharacters = [];
        } catch (error) {
            console.warn('清空聊天角色失败:', error);
        }
        
        // 先清空storageDB（API设置等）- 必须在localStorage之前清空
        console.log('开始清空storageDB数据...');
        try {
            await storageDB.clear();
            console.log('✓ StorageDB已清空 (API设置、预设等)');
        } catch (error) {
            console.warn('清空StorageDB失败:', error);
        }
        
        // 清空localStorage
        console.log('开始清空localStorage数据...');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            keysToRemove.push(localStorage.key(i));
        }
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log(`✓ localStorage已清空 (${keysToRemove.length}项)`);
        
        // 再次确保清空storageDB（防止localStorage清空时触发了某些保存操作）
        try {
            await storageDB.clear();
            console.log('✓ StorageDB二次清空完成');
        } catch (error) {
            console.warn('StorageDB二次清空失败:', error);
        }
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 清除聊天列表界面
        renderChatList();
        
        // 清除界面显示
        const avatarImage = document.getElementById('avatarImage');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImage) avatarImage.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
        
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
        
        console.log('所有数据已清空完成');
        await iosAlert(
            '所有数据已清空！\n\n页面将在3秒后刷新...',
            '清空完成'
        );
        
        // 3秒后刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('清空数据失败:', error);
        await iosAlert('清空失败：' + error.message, '错误');
    }
}

// 刷新存储信息
async function refreshStorageInfo() {
    try {
        const usage = await getStorageUsage();
        if (usage) {
            document.getElementById('storageUsage').textContent = `${usage.usage} MB`;
            document.getElementById('storageQuota').textContent = `${usage.quota} MB`;
            document.getElementById('storageBar').style.width = `${usage.percentage}%`;
            
            // 更新百分比显示（如果存在）
            const percentageEl = document.getElementById('storagePercentage');
            if (percentageEl) {
                percentageEl.textContent = `${usage.percentage}% 已使用`;
            }
            
            console.log(` 存储: ${usage.usage}MB / ${usage.quota}MB (${usage.percentage}%)`);
        }
    } catch (error) {
        console.error('获取存储信息失败:', error);
    }
}

// ==================== 图片压缩功能 ====================

// 压缩进行中标志（防止重复点击）
let isCompressing = false;

// 更新压缩质量显示
function updateCompressionQuality(value) {
    document.getElementById('compressionQuality').textContent = value + '%';
}

// 切换是否压缩小组件图片
function toggleWidgetCompression(checked) {
    console.log('压缩小组件图片:', checked);
}

// 压缩单个图片
async function compressImageBase64(base64Data, quality) {
    return new Promise((resolve, reject) => {
        try {
            // 检查是否为有效的base64数据
            if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('data:image')) {
                reject(new Error('无效的图片数据'));
                return;
            }
            
            // 创建一个Image对象
            const img = new Image();
            
            // 设置crossOrigin以避免污染canvas
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    // 创建canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    
                    // 设置canvas尺寸为图片尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制图片到canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // 尝试压缩图片
                    try {
                        // 先尝试压缩为jpeg
                        const compressedBase64 = canvas.toDataURL('image/jpeg', quality / 100);
                        
                        // 检查压缩是否成功（有些透明图片压缩后可能变大）
                        if (compressedBase64 && compressedBase64.length > 0) {
                            resolve(compressedBase64);
                        } else {
                            // 压缩失败，返回原图
                            resolve(base64Data);
                        }
                    } catch (canvasError) {
                        // Canvas操作失败，返回原图
                        console.warn('Canvas压缩失败，使用原图:', canvasError.message);
                        resolve(base64Data);
                    }
                } catch (error) {
                    console.warn('图片处理失败，使用原图:', error.message);
                    resolve(base64Data);
                }
            };
            
            img.onerror = function(error) {
                console.warn('图片加载失败，使用原图');
                // 图片加载失败时返回原图而不是reject
                resolve(base64Data);
            };
            
            // 设置图片源
            img.src = base64Data;
            
        } catch (error) {
            console.warn('压缩过程出错，使用原图:', error.message);
            // 出错时返回原图而不是reject
            resolve(base64Data);
        }
    });
}

// 压缩所有图片
async function compressAllImages() {
    // 防止重复点击
    if (isCompressing) {
        await iosAlert('图片压缩正在进行中，请稍候...', '提示');
        return;
    }
    
    try {
        // 获取压缩质量
        const quality = parseInt(document.getElementById('compressionSlider').value);
        const compressWidget = document.getElementById('compressWidgetImages').checked;
        
        // 确认操作（使用自定义iOS风格弹窗）
        const confirmed = await iosConfirm(
            `压缩质量: ${quality}%\n压缩小组件图片: ${compressWidget ? '是' : '否'}\n\n此操作将覆盖原图片且不可恢复！`,
            '确定要压缩所有图片吗？'
        );
        
        if (!confirmed) return;
        
        // 设置压缩标志
        isCompressing = true;
        
        // 显示进度条
        const progressDiv = document.getElementById('compressionProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressDetail = document.getElementById('progressDetail');
        const compressBtn = document.getElementById('compressBtn');
        
        progressDiv.style.display = 'block';
        compressBtn.disabled = true;
        compressBtn.style.opacity = '0.5';
        compressBtn.textContent = '正在压缩...';
        
        // 获取所有图片
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            await iosAlert('暂无图片需要压缩', '提示');
            progressDiv.style.display = 'none';
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
            isCompressing = false;
            return;
        }
        
        // 小组件类型列表
        const widgetTypes = ['avatar', 'music-avatar', 'music-cover', 'sticker'];
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        let totalSizeBefore = 0;
        let totalSizeAfter = 0;
        
        // 逐个压缩图片
        for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
            
            // 计算原始大小（所有图片都要计算）
            const originalSize = (img.data.length - (img.data.indexOf(',') + 1)) * 0.75;
            totalSizeBefore += originalSize;
            
            // 如果不压缩小组件图片，则跳过小组件类型
            if (!compressWidget && widgetTypes.includes(img.type)) {
                totalSizeAfter += originalSize;
                skipCount++;
                progressDetail.textContent = `跳过小组件图片 (${i + 1}/${allImages.length})`;
                
                // 更新进度
                const progress = Math.round(((i + 1) / allImages.length) * 100);
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                continue;
            }
            
            try {
                
                // 压缩图片
                progressDetail.textContent = `正在压缩 ${img.type} (${i + 1}/${allImages.length})`;
                const compressedData = await compressImageBase64(img.data, quality);
                
                // 计算压缩后大小
                const compressedSize = (compressedData.length - (compressedData.indexOf(',') + 1)) * 0.75;
                
                // 检查是否真的压缩了（如果返回的是原图，大小会一样）
                if (compressedData === img.data) {
                    // 没有压缩，跳过
                    totalSizeAfter += originalSize;
                    skipCount++;
                    progressDetail.textContent = `跳过无法压缩的图片 ${img.type} (${i + 1}/${allImages.length})`;
                } else {
                    totalSizeAfter += compressedSize;
                    
                    // 更新数据库
                    const transaction = db.transaction(['images'], 'readwrite');
                    const store = transaction.objectStore('images');
                    
                    img.data = compressedData;
                    img.timestamp = Date.now(); // 更新时间戳
                    
                    await new Promise((resolve, reject) => {
                        const request = store.put(img);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                    
                    successCount++;
                }
            } catch (error) {
                console.error(`压缩图片失败 (${img.type}):`, error);
                // 压缩失败，保持原大小
                totalSizeAfter += originalSize;
                errorCount++;
            }
            
            // 更新进度
            const progress = Math.round(((i + 1) / allImages.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // 压缩完成
        const savedSizeKB = ((totalSizeBefore - totalSizeAfter) / 1024).toFixed(2);
        const savedPercentage = totalSizeBefore > 0 ? ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1) : 0;
        
        progressDetail.textContent = `压缩完成！成功: ${successCount}张，跳过: ${skipCount}张，失败: ${errorCount}张`;
        
        // 刷新统计信息
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 重置按钮
        compressBtn.disabled = false;
        compressBtn.style.opacity = '1';
        compressBtn.textContent = '开始压缩图片';
        
        // 显示结果（使用自定义弹窗）
        await iosAlert(
            `成功: ${successCount}张\n跳过: ${skipCount}张\n失败: ${errorCount}张\n\n节省空间: ${savedSizeKB} KB (${savedPercentage}%)`,
            '压缩完成！'
        );
        
        // 隐藏进度条
        progressDiv.style.display = 'none';
        
        // 重置压缩标志
        isCompressing = false;
        
        console.log(`图片压缩完成: 成功${successCount}张, 跳过${skipCount}张, 失败${errorCount}张, 节省${savedSizeKB}KB`);
        
    } catch (error) {
        console.error('压缩图片失败:', error);
        
        // 重置UI
        const progressDiv = document.getElementById('compressionProgress');
        const compressBtn = document.getElementById('compressBtn');
        if (progressDiv) progressDiv.style.display = 'none';
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
        }
        
        // 重置压缩标志
        isCompressing = false;
        
        // 显示错误（使用自定义弹窗）
        await iosAlert('压缩失败：' + error.message, '错误');
    }
}

// 打开外观设置界面
async function openAppearanceSettings() {
    document.getElementById('appearanceSettings').classList.add('active');
    
    // 加载保存的锁屏设置
    const lockScreenEnabled = localStorage.getItem('lockScreenEnabled') === 'true';
    const lockScreenToggle = document.getElementById('lockScreenToggle');
    if (lockScreenToggle) {
        lockScreenToggle.checked = lockScreenEnabled;
    }
    
    // 显示/隐藏子选项（如果元素存在）
    const lockScreenOptions = document.getElementById('lockScreenOptions');
    if (lockScreenOptions) {
        lockScreenOptions.style.display = lockScreenEnabled ? 'block' : 'none';
    }
    
    // 加载自定义样式开关状态
    const customStyleEnabled = localStorage.getItem('customStyleEnabled') === 'true';
    const customStyleToggle = document.getElementById('customStyleToggle');
    if (customStyleToggle) {
        customStyleToggle.checked = customStyleEnabled;
    }
    
    // 显示/隐藏自定义样式选项（如果元素存在）
    const customStyleOptions = document.getElementById('customStyleOptions');
    if (customStyleOptions) {
        customStyleOptions.style.display = customStyleEnabled ? 'block' : 'none';
    }
    
    // 加载滑动方式设置
    const slideMode = localStorage.getItem('lockScreenSlideMode') || 'horizontal';
    const horizontalToggle = document.getElementById('horizontalToggle');
    const verticalToggle = document.getElementById('verticalToggle');
    
    if (horizontalToggle && verticalToggle) {
        if (slideMode === 'horizontal') {
            horizontalToggle.checked = true;
            verticalToggle.checked = false;
        } else {
            horizontalToggle.checked = false;
            verticalToggle.checked = true;
        }
    }
    
    // 加载密码设置
    const passwordEnabled = localStorage.getItem('lockPasswordEnabled') === 'true';
    const lockPasswordToggle = document.getElementById('lockPasswordToggle');
    if (lockPasswordToggle) {
        lockPasswordToggle.checked = passwordEnabled;
    }
    
    const passwordOptions = document.getElementById('passwordOptions');
    if (passwordOptions) {
        passwordOptions.style.display = passwordEnabled ? 'block' : 'none';
    }
    
    // 加载密码类型
    const passwordType = localStorage.getItem('passwordType') || 'number';
    switchPasswordType(passwordType);
    
    // 更新密码状态显示
    updatePasswordStatus();
    updateGestureStatus();
    
    // 加载壁纸设置
    const wallpaperEnabled = localStorage.getItem('lockWallpaperEnabled') === 'true';
    const lockWallpaperToggle = document.getElementById('lockWallpaperToggle');
    if (lockWallpaperToggle) {
        lockWallpaperToggle.checked = wallpaperEnabled;
    }
    
    const wallpaperOptions = document.getElementById('wallpaperOptions');
    if (wallpaperOptions) {
        wallpaperOptions.style.display = wallpaperEnabled ? 'block' : 'none';
    }
    
    // 加载壁纸预览
    try {
        const wallpaperData = await getImageFromDB('lockWallpaper');
        if (wallpaperData) {
            const preview = document.getElementById('wallpaperPreview');
            const placeholder = document.getElementById('wallpaperPlaceholder');
            if (preview && placeholder) {
                preview.src = wallpaperData;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                tempWallpaperData = wallpaperData;
            }
        }
    } catch (error) {
        console.error('加载壁纸预览失败:', error);
    }
    
    // 更新壁纸状态显示
    await updateWallpaperStatus();
    
    // 加载顶栏设置
    const statusBarEnabled = localStorage.getItem('statusBarEnabled');
    // 默认为true（开启状态）
    const isStatusBarEnabled = statusBarEnabled === null ? true : statusBarEnabled === 'true';
    const statusBarToggle = document.getElementById('statusBarToggle');
    if (statusBarToggle) {
        statusBarToggle.checked = isStatusBarEnabled;
    }
    
    // 加载手机边框设置
    const phoneBorderEnabled = localStorage.getItem('phoneBorderEnabled');
    // 默认为false（关闭状态）
    const isPhoneBorderEnabled = phoneBorderEnabled === 'true';
    const phoneBorderToggle = document.getElementById('phoneBorderToggle');
    if (phoneBorderToggle) {
        phoneBorderToggle.checked = isPhoneBorderEnabled;
    }
    
    // 加载主屏幕壁纸设置
    const mainWallpaperEnabled = localStorage.getItem('mainWallpaperEnabled');
    const isMainWallpaperEnabled = mainWallpaperEnabled === 'true';
    const mainWallpaperToggle = document.getElementById('mainWallpaperToggle');
    if (mainWallpaperToggle) {
        mainWallpaperToggle.checked = isMainWallpaperEnabled;
    }
    
    const mainWallpaperOptions = document.getElementById('mainWallpaperOptions');
    if (mainWallpaperOptions) {
        mainWallpaperOptions.style.display = isMainWallpaperEnabled ? 'block' : 'none';
    }
    
    // 加载主屏幕壁纸预览
    try {
        const mainWallpaperData = await getImageFromDB('mainWallpaper');
        if (mainWallpaperData) {
            const preview = document.getElementById('mainWallpaperPreview');
            const placeholder = document.getElementById('mainWallpaperPlaceholder');
            if (preview && placeholder) {
                preview.src = mainWallpaperData;
                preview.style.display = 'block';
                placeholder.style.display = 'none';
                tempMainWallpaperData = mainWallpaperData;
            }
        }
    } catch (error) {
        console.error('加载主屏幕壁纸预览失败:', error);
    }
    
    // 更新主屏幕壁纸状态显示
    await updateMainWallpaperStatus();
    
    // 渲染APP图标设置网格
    await renderAppIconGrid();
    
    // 渲染APP名称设置网格
    renderAppNameGrid();
    
    // 加载聊天列表背景预览
    try {
        const chatListBgData = await getImageFromDB('chatListBg');
        if (chatListBgData) {
            const preview = document.getElementById('chatListBgPreview');
            if (preview) {
                preview.style.backgroundImage = `url(${chatListBgData})`;
                preview.textContent = '';
                tempChatListBgData = chatListBgData;
            }
        }
    } catch (error) {
        console.error('加载聊天列表背景预览失败:', error);
    }
    
    // 加载聊天背景预览
    try {
        const chatDetailBgData = await getImageFromDB('chatDetailBg');
        if (chatDetailBgData) {
            const preview = document.getElementById('chatDetailBgPreview');
            if (preview) {
                preview.style.backgroundImage = `url(${chatDetailBgData})`;
                preview.textContent = '';
                tempChatDetailBgData = chatDetailBgData;
            }
        }
    } catch (error) {
        console.error('加载聊天背景预览失败:', error);
    }
}

// 关闭外观设置界面
function closeAppearanceSettings() {
    document.getElementById('appearanceSettings').classList.remove('active');
}

// 切换外观设置标签页
function switchAppearanceTab(tabName) {
    // 移除所有标签的active类
    const tabs = document.querySelectorAll('.appearance-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有内容的active类
    const contents = document.querySelectorAll('.appearance-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // 激活当前标签
    const activeTab = Array.from(tabs).find(tab => 
        tab.textContent.includes(getTabLabel(tabName))
    );
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // 显示对应内容
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// 获取标签显示文本
function getTabLabel(tabName) {
    const labels = {
        'lockscreen': '锁屏',
        'wallpaper': '壁纸',
        'interface': '界面',
        'border': '边框'
    };
    return labels[tabName] || tabName;
}

// ========== APP图标自定义功能 ==========

const APP_ICON_LIST = [
    { id: 'chat', label: '聊天' },
    { id: 'worldbook', label: '世界书' },
    { id: 'wallet', label: '钱包' },
    { id: 'couple', label: '情侣空间' },
    { id: 'api', label: 'API设置' },
    { id: 'appearance', label: '外观设置' },
    { id: 'data', label: '数据管理' },
    { id: 'font', label: '字体设置' }
];

let currentEditingIconId = null;
let tempAppIconData = null;

// 渲染图标设置网格
async function renderAppIconGrid() {
    const grid = document.getElementById('appIconGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const item of APP_ICON_LIST) {
        const el = document.getElementById('appIcon-' + item.id);
        const saved = await getImageFromDB('appIcon-' + item.id);
        const defaultText = el ? el.getAttribute('data-default-text') : '';

        const cell = document.createElement('div');
        cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;';
        cell.onclick = () => openAppIconModal(item.id, item.label);

        const box = document.createElement('div');
        box.style.cssText = 'width:50px;height:50px;border-radius:12px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1.5px solid #e0e0e0;font-size:14px;color:#333;';

        if (saved) {
            const img = document.createElement('img');
            img.src = saved;
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
            box.appendChild(img);
        } else {
            box.textContent = defaultText;
        }

        const name = document.createElement('div');
        name.style.cssText = 'font-size:10px;color:#666;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px;';
        name.textContent = item.label;

        cell.appendChild(box);
        cell.appendChild(name);
        grid.appendChild(cell);
    }
}

// 打开图标编辑弹窗
async function openAppIconModal(iconId, label) {
    currentEditingIconId = iconId;
    tempAppIconData = null;

    document.getElementById('appIconModalLabel').textContent = label;
    document.getElementById('appIconUrlInput').value = '';

    const saved = await getImageFromDB('appIcon-' + iconId);
    const previewImg = document.getElementById('appIconPreviewImg');
    const previewText = document.getElementById('appIconPreviewText');
    const el = document.getElementById('appIcon-' + iconId);
    const defaultText = el ? el.getAttribute('data-default-text') : '';

    if (saved) {
        previewImg.src = saved;
        previewImg.style.display = 'block';
        previewText.style.display = 'none';
        tempAppIconData = saved;
    } else {
        previewImg.style.display = 'none';
        previewText.style.display = '';
        previewText.textContent = defaultText;
    }

    document.getElementById('appIconModal').classList.add('active');
}

function closeAppIconModal() {
    document.getElementById('appIconModal').classList.remove('active');
    currentEditingIconId = null;
    tempAppIconData = null;
    document.getElementById('appIconUrlInput').value = '';
}

// 本地文件上传
async function handleAppIconFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const compressed = await compressImage(file, {
            maxWidth: 256,
            maxHeight: 256,
            quality: 0.85,
            maxSizeKB: 100
        });
        tempAppIconData = compressed;
        document.getElementById('appIconPreviewImg').src = compressed;
        document.getElementById('appIconPreviewImg').style.display = 'block';
        document.getElementById('appIconPreviewText').style.display = 'none';
    } catch (err) {
        console.error('图标上传失败:', err);
        alert('图片处理失败，请重试');
    }
    event.target.value = '';
}

// URL上传
function handleAppIconUrlUpload() {
    const url = document.getElementById('appIconUrlInput').value.trim();
    if (!url) { alert('请输入图片URL'); return; }

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
        tempAppIconData = url;
        document.getElementById('appIconPreviewImg').src = url;
        document.getElementById('appIconPreviewImg').style.display = 'block';
        document.getElementById('appIconPreviewText').style.display = 'none';
        alert('图片加载成功！');
    };
    img.onerror = function () {
        alert('图片加载失败，请检查URL');
    };
    img.src = url;
}

// 重置图标
async function resetAppIcon() {
    if (!currentEditingIconId) return;
    const ok = await iosConfirm('确定要重置此图标为默认吗？', '重置图标');
    if (!ok) return;

    try {
        await deleteImageFromDB('appIcon-' + currentEditingIconId);
        applyAppIcon(currentEditingIconId, null);
        // 更新预览
        const el = document.getElementById('appIcon-' + currentEditingIconId);
        const defaultText = el ? el.getAttribute('data-default-text') : '';
        document.getElementById('appIconPreviewImg').style.display = 'none';
        document.getElementById('appIconPreviewText').style.display = '';
        document.getElementById('appIconPreviewText').textContent = defaultText;
        tempAppIconData = null;
        await renderAppIconGrid();
        alert('已重置为默认图标');
    } catch (err) {
        console.error('重置图标失败:', err);
        alert('重置失败，请重试');
    }
}

// 保存图标
async function saveAppIcon() {
    if (!currentEditingIconId || !tempAppIconData) {
        alert('请先选择或上传图片');
        return;
    }
    try {
        await saveImageToDB('appIcon-' + currentEditingIconId, tempAppIconData, 'appIcon');
        applyAppIcon(currentEditingIconId, tempAppIconData);
        await renderAppIconGrid();
        alert('图标保存成功！');
        closeAppIconModal();
    } catch (err) {
        console.error('保存图标失败:', err);
        alert('保存失败，请重试');
    }
}

// 将图标应用到主界面
function applyAppIcon(iconId, imageData) {
    const el = document.getElementById('appIcon-' + iconId);
    if (!el) return;
    const defaultText = el.getAttribute('data-default-text') || '';

    if (imageData) {
        el.textContent = '';
        el.style.backgroundImage = 'url(' + imageData + ')';
        el.style.backgroundSize = 'cover';
        el.style.backgroundPosition = 'center';
        el.style.color = 'transparent';
    } else {
        el.style.backgroundImage = '';
        el.style.backgroundSize = '';
        el.style.backgroundPosition = '';
        el.style.color = '';
        el.textContent = defaultText;
    }
}

// 重置所有图标
async function resetAllAppIcons() {
    const ok = await iosConfirm('确定要将所有APP图标重置为默认吗？', '重置所有图标');
    if (!ok) return;

    try {
        for (const item of APP_ICON_LIST) {
            await deleteImageFromDB('appIcon-' + item.id);
            applyAppIcon(item.id, null);
        }
        await renderAppIconGrid();
        alert('所有图标已重置为默认');
    } catch (err) {
        console.error('重置所有图标失败:', err);
        alert('重置失败，请重试');
    }
}

// ========== APP名称自定义功能 ==========

let currentEditingNameId = null;

// 渲染名称设置网格
function renderAppNameGrid() {
    const grid = document.getElementById('appNameGrid');
    if (!grid) return;
    grid.innerHTML = '';

    for (const item of APP_ICON_LIST) {
        const el = document.getElementById('appName-' + item.id);
        const currentName = el ? el.textContent : item.label;

        const cell = document.createElement('div');
        cell.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;';
        cell.onclick = () => openAppNameModal(item.id, item.label);

        const box = document.createElement('div');
        box.style.cssText = 'width:60px;height:32px;border-radius:8px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;overflow:hidden;border:1.5px solid #e0e0e0;padding:0 4px;';

        const text = document.createElement('div');
        text.style.cssText = 'font-size:10px;color:#333;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:56px;';
        text.textContent = currentName;
        box.appendChild(text);

        const label = document.createElement('div');
        label.style.cssText = 'font-size:9px;color:#999;text-align:center;';
        label.textContent = '点击修改';

        cell.appendChild(box);
        cell.appendChild(label);
        grid.appendChild(cell);
    }
}

// 打开名称编辑弹窗
function openAppNameModal(iconId, defaultLabel) {
    currentEditingNameId = iconId;
    const el = document.getElementById('appName-' + iconId);
    const currentName = el ? el.textContent : defaultLabel;

    document.getElementById('appNameModalLabel').textContent = defaultLabel;
    document.getElementById('appNameInput').value = currentName;
    document.getElementById('appNamePreview').textContent = currentName;
    document.getElementById('appNameModal').classList.add('active');
}

function closeAppNameModal() {
    document.getElementById('appNameModal').classList.remove('active');
    currentEditingNameId = null;
}

// 保存单个名称
function saveAppName() {
    if (!currentEditingNameId) return;
    const newName = document.getElementById('appNameInput').value.trim();
    if (!newName) { alert('名称不能为空'); return; }

    const el = document.getElementById('appName-' + currentEditingNameId);
    if (el) el.textContent = newName;

    // 持久化
    const saved = JSON.parse(localStorage.getItem('appCustomNames') || '{}');
    saved[currentEditingNameId] = newName;
    localStorage.setItem('appCustomNames', JSON.stringify(saved));

    renderAppNameGrid();
    alert('名称保存成功！');
    closeAppNameModal();
}

// 重置单个名称
async function resetSingleAppName() {
    if (!currentEditingNameId) return;
    const ok = await iosConfirm('确定要重置此名称为默认吗？', '重置名称');
    if (!ok) return;

    const el = document.getElementById('appName-' + currentEditingNameId);
    const defaultName = el ? el.getAttribute('data-default-name') : '';
    if (el) el.textContent = defaultName;

    const saved = JSON.parse(localStorage.getItem('appCustomNames') || '{}');
    delete saved[currentEditingNameId];
    localStorage.setItem('appCustomNames', JSON.stringify(saved));

    document.getElementById('appNameInput').value = defaultName;
    document.getElementById('appNamePreview').textContent = defaultName;
    renderAppNameGrid();
    alert('已重置为默认名称');
}

// 重置所有名称
async function resetAllAppNames() {
    const ok = await iosConfirm('确定要将所有APP名称重置为默认吗？', '重置所有名称');
    if (!ok) return;

    localStorage.removeItem('appCustomNames');
    for (const item of APP_ICON_LIST) {
        const el = document.getElementById('appName-' + item.id);
        if (el) el.textContent = el.getAttribute('data-default-name') || item.label;
    }
    renderAppNameGrid();
    alert('所有名称已重置为默认');
}

// 加载所有自定义名称
function loadAppNames() {
    const saved = JSON.parse(localStorage.getItem('appCustomNames') || '{}');
    for (const item of APP_ICON_LIST) {
        if (saved[item.id]) {
            const el = document.getElementById('appName-' + item.id);
            if (el) el.textContent = saved[item.id];
        }
    }
}

// 加载所有自定义图标
async function loadAppIcons() {
    for (const item of APP_ICON_LIST) {
        try {
            const saved = await getImageFromDB('appIcon-' + item.id);
            if (saved) {
                applyAppIcon(item.id, saved);
            }
        } catch (err) {
            console.error('加载图标失败:', item.id, err);
        }
    }
}

// ========== 字体设置功能 ==========

// 打开字体设置
async function openFontSettings() {
    document.getElementById('fontSettings').classList.add('active');
    
    // 加载保存的字体设置
    const savedFont = localStorage.getItem('globalFont');
    const savedFontSize = localStorage.getItem('globalFontSize');
    
    if (savedFont) {
        document.getElementById('globalFontSelect').value = savedFont;
    }
    
    if (savedFontSize) {
        document.getElementById('fontSizeRange').value = savedFontSize;
        document.getElementById('fontSizeValue').textContent = savedFontSize + 'px';
    }
    
    // 更新预览
    previewFont();
}

// 关闭字体设置
function closeFontSettings() {
    document.getElementById('fontSettings').classList.remove('active');
}

// 保存字体设置
async function saveFontSettings() {
    const fontFamily = document.getElementById('globalFontSelect').value;
    const fontSize = document.getElementById('fontSizeRange').value;
    
    // 保存到 localStorage
    localStorage.setItem('globalFont', fontFamily);
    localStorage.setItem('globalFontSize', fontSize);
    
    // 应用字体设置到整个页面
    applyFontSettings(fontFamily, fontSize);
    
    await iosAlert('字体设置已保存！');
    closeFontSettings();
}

// 重置字体设置
async function resetFontSettings() {
    const confirmed = await iosConfirm('确定要恢复默认字体设置吗？');
    if (confirmed) {
        // 恢复默认值
        const defaultFont = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        const defaultSize = '14';
        
        document.getElementById('globalFontSelect').value = defaultFont;
        document.getElementById('fontSizeRange').value = defaultSize;
        document.getElementById('fontSizeValue').textContent = defaultSize + 'px';
        
        // 保存默认值
        localStorage.setItem('globalFont', defaultFont);
        localStorage.setItem('globalFontSize', defaultSize);
        
        // 应用默认字体
        applyFontSettings(defaultFont, defaultSize);
        
        // 更新预览
        previewFont();
        
        await iosAlert('已恢复默认字体设置！');
    }
}

// 预览字体
function previewFont() {
    const fontFamily = document.getElementById('globalFontSelect').value;
    const fontSize = document.getElementById('fontSizeRange').value;
    const preview = document.getElementById('fontPreview');
    
    preview.style.fontFamily = fontFamily;
    preview.style.fontSize = fontSize + 'px';
}

// 更新字体大小预览
function updateFontSizePreview() {
    const fontSize = document.getElementById('fontSizeRange').value;
    document.getElementById('fontSizeValue').textContent = fontSize + 'px';
    previewFont();
}

// 应用字体设置到整个页面
function applyFontSettings(fontFamily, fontSize) {
    // 创建或更新 style 标签
    let styleEl = document.getElementById('globalFontStyle');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'globalFontStyle';
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        body, input, textarea, select, button {
            font-family: ${fontFamily} !important;
            font-size: ${fontSize}px !important;
        }
    `;
}

// 切换顶栏显示
function toggleStatusBar() {
    const toggle = document.getElementById('statusBarToggle');
    const isEnabled = toggle.checked;
    const statusBar = document.querySelector('.status-bar');
    
    // 保存设置到localStorage
    localStorage.setItem('statusBarEnabled', isEnabled);
    
    // 显示/隐藏顶栏
    if (statusBar) {
        statusBar.style.display = isEnabled ? 'flex' : 'none';
    }
    
    console.log('顶栏已' + (isEnabled ? '显示' : '隐藏'));
}

// 切换手机边框
function togglePhoneBorder() {
    const toggle = document.getElementById('phoneBorderToggle');
    const isEnabled = toggle.checked;
    const phoneContainer = document.querySelector('.phone-container');
    
    // 保存设置到localStorage
    localStorage.setItem('phoneBorderEnabled', isEnabled);
    
    // 显示/隐藏手机边框
    if (phoneContainer) {
        if (isEnabled) {
            phoneContainer.classList.add('phone-border');
        } else {
            phoneContainer.classList.remove('phone-border');
        }
    }
    
    console.log('手机边框已' + (isEnabled ? '显示' : '隐藏'));
}

// 切换锁屏功能
function toggleLockScreen() {
    const toggle = document.getElementById('lockScreenToggle');
    const isEnabled = toggle.checked;
    const lockScreenOptions = document.getElementById('lockScreenOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockScreenEnabled', isEnabled);
    
    // 显示/隐藏子选项
    lockScreenOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏页面已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        console.log('锁屏页面已开启');
    } else {
        console.log('锁屏页面已关闭');
    }
}

// 切换自定义样式
function toggleCustomStyle() {
    const toggle = document.getElementById('customStyleToggle');
    const isEnabled = toggle.checked;
    const customStyleOptions = document.getElementById('customStyleOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('customStyleEnabled', isEnabled);
    
    // 显示/隐藏自定义样式选项
    customStyleOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('自定义样式已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        console.log('可以选择滑动方式');
        // 如果没有保存过滑动方式，默认选择横向
        if (!localStorage.getItem('lockScreenSlideMode')) {
            localStorage.setItem('lockScreenSlideMode', 'horizontal');
            document.getElementById('horizontalToggle').checked = true;
        }
    } else {
        console.log('使用默认样式（横向滑动）');
    }
}

// 切换锁屏密码
function toggleLockPassword() {
    const toggle = document.getElementById('lockPasswordToggle');
    const isEnabled = toggle.checked;
    const passwordOptions = document.getElementById('passwordOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockPasswordEnabled', isEnabled);
    
    // 显示/隐藏密码设置选项
    passwordOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏密码已' + (isEnabled ? '开启' : '关闭'));
    
    if (!isEnabled) {
        // 关闭密码功能时清除所有密码
        localStorage.removeItem('lockPassword');
        localStorage.removeItem('lockGesture');
        updatePasswordStatus();
        updateGestureStatus();
    }
}

// ==================== 锁屏壁纸功能 ====================

// 切换锁屏壁纸
function toggleLockWallpaper() {
    const toggle = document.getElementById('lockWallpaperToggle');
    const isEnabled = toggle.checked;
    const wallpaperOptions = document.getElementById('wallpaperOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('lockWallpaperEnabled', isEnabled);
    
    // 显示/隐藏壁纸设置选项
    wallpaperOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('锁屏壁纸已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        // 如果有保存的壁纸，应用到锁屏
        applyWallpaperToLockScreen();
    } else {
        // 关闭壁纸功能时移除壁纸
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
    }
}

// 临时壁纸数据
let tempWallpaperData = null;

// 处理本地文件上传
async function handleWallpaperFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        console.log(' 正在压缩壁纸...');
        
        // 压缩图片（壁纸使用较大尺寸，保留更多细节）
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempWallpaperData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.src = compressedData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('壁纸已压缩并加载');
    } catch (error) {
        console.error('壁纸处理失败:', error);
        alert('壁纸处理失败，请重试！');
    }
}

// 处理URL上传
function handleWallpaperUrlUpload() {
    const urlInput = document.getElementById('wallpaperUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('请输入图片URL地址！');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }
    
    // 创建图片对象测试加载
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        tempWallpaperData = url;
        
        // 显示预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.src = url;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('壁纸已加载（URL）');
    };
    
    img.onerror = function() {
        alert('无法加载该图片，请检查URL是否正确或图片是否支持跨域访问！');
    };
    
    img.src = url;
}

// 保存壁纸
async function saveWallpaper() {
    if (!tempWallpaperData) {
        alert('请先选择或加载壁纸！');
        return;
    }
    
    try {
        // 保存到IndexedDB
        await saveImageToDB('lockWallpaper', tempWallpaperData, 'wallpaper');
        updateWallpaperStatus();
        await applyWallpaperToLockScreen();
        alert('壁纸保存成功！');
        
        // 显示存储使用情况
        await getStorageUsage();
    } catch (error) {
        console.error('保存壁纸失败:', error);
        alert('保存失败：' + error.message);
    }
}

// 重置壁纸
async function resetWallpaper() {
    if (!confirm('确定要重置壁纸吗？')) return;
    
    try {
        // 从IndexedDB删除壁纸
        await deleteImageFromDB('lockWallpaper');
        tempWallpaperData = null;
        
        // 清除预览
        const preview = document.getElementById('wallpaperPreview');
        const placeholder = document.getElementById('wallpaperPlaceholder');
        
        preview.style.display = 'none';
        preview.src = '';
        placeholder.style.display = 'block';
        
        // 清除URL输入框
        document.getElementById('wallpaperUrlInput').value = '';
        
        // 更新状态
        updateWallpaperStatus();
        
        // 移除锁屏壁纸
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        alert('壁纸已重置！');
        console.log('锁屏壁纸已重置');
    } catch (error) {
        console.error('重置壁纸失败:', error);
        alert('重置失败，请重试！');
    }
}

// 更新壁纸状态显示
async function updateWallpaperStatus() {
    const statusSpan = document.getElementById('wallpaperStatus');
    
    try {
        const hasWallpaper = await getImageFromDB('lockWallpaper');
        
        if (hasWallpaper) {
            statusSpan.textContent = '已设置';
            statusSpan.style.color = '#34c759';
        } else {
            statusSpan.textContent = '未设置';
            statusSpan.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('检查壁纸状态失败:', error);
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 应用壁纸到锁屏
async function applyWallpaperToLockScreen() {
    const wallpaperEnabled = localStorage.getItem('lockWallpaperEnabled') === 'true';
    const lockScreen = document.getElementById('lockScreen');
    
    if (!lockScreen) return;
    
    try {
        if (wallpaperEnabled) {
            const wallpaperData = await getImageFromDB('lockWallpaper');
            if (wallpaperData) {
                lockScreen.style.backgroundImage = `url(${wallpaperData})`;
                lockScreen.style.backgroundSize = 'cover';
                lockScreen.style.backgroundPosition = 'center';
                lockScreen.style.backgroundRepeat = 'no-repeat';
                console.log('壁纸已应用到锁屏');
            } else {
                lockScreen.style.backgroundImage = 'none';
                lockScreen.style.backgroundColor = '#ffffff';
            }
        } else {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
    } catch (error) {
        console.error('应用壁纸失败:', error);
        lockScreen.style.backgroundImage = 'none';
        lockScreen.style.backgroundColor = '#ffffff';
    }
}

// ========== 聊天列表背景功能 ==========

// 临时聊天列表背景数据
let tempChatListBgData = null;

// 处理聊天列表背景本地文件上传
async function handleChatListBgUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        await iosAlert('请选择图片文件！', '提示');
        return;
    }
    
    try {
        console.log('正在压缩聊天列表背景图...');
        
        // 压缩图片
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempChatListBgData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('chatListBgPreview');
        if (preview) {
            preview.style.backgroundImage = `url(${compressedData})`;
            preview.textContent = '';
        }
        
        // 自动保存
        await saveChatListBg();
        
        console.log('聊天列表背景图预览加载成功');
    } catch (error) {
        console.error('聊天列表背景图上传失败:', error);
        await iosAlert('背景图处理失败，请重试！', '错误');
    }
}

// 处理聊天列表背景URL上传
async function handleChatListBgUrl() {
    const urlInput = document.getElementById('chatListBgUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        await iosAlert('请输入图片URL地址！', '提示');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        await iosAlert('请输入有效的URL地址！', '错误');
        return;
    }
    
    // 创建图片对象测试加载
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = async function() {
        tempChatListBgData = url;
        
        // 显示预览
        const preview = document.getElementById('chatListBgPreview');
        if (preview) {
            preview.style.backgroundImage = `url(${url})`;
            preview.textContent = '';
        }
        
        // 自动保存
        await saveChatListBg();
        
        console.log('聊天列表背景图已加载（URL）');
    };
    
    img.onerror = async function() {
        await iosAlert('无法加载该图片，请检查URL是否正确或图片是否支持跨域访问！', '错误');
    };
    
    img.src = url;
}

// 保存聊天列表背景
async function saveChatListBg() {
    if (!tempChatListBgData) {
        await iosAlert('请先选择或加载背景图！', '提示');
        return;
    }
    
    try {
        // 保存到IndexedDB
        await saveImageToDB('chatListBg', tempChatListBgData, 'background');
        await applyChatListBg();
        await iosAlert('聊天列表背景已保存！', '成功');
        
        console.log('聊天列表背景已保存');
    } catch (error) {
        console.error('保存聊天列表背景失败:', error);
        await iosAlert('保存失败：' + error.message, '错误');
    }
}

// 重置聊天列表背景
async function resetChatListBg() {
    const confirmed = await iosConfirm('确定要重置聊天列表背景吗？', '确认');
    if (!confirmed) return;
    
    try {
        // 从IndexedDB删除背景
        await deleteImageFromDB('chatListBg');
        tempChatListBgData = null;
        
        // 清除预览
        const preview = document.getElementById('chatListBgPreview');
        if (preview) {
            preview.style.backgroundImage = 'none';
            preview.textContent = '暂无背景图';
        }
        
        // 清除URL输入框
        const urlInput = document.getElementById('chatListBgUrlInput');
        if (urlInput) {
            urlInput.value = '';
        }
        
        // 移除聊天列表背景
        const chatListTab = document.getElementById('chatListTab');
        if (chatListTab) {
            chatListTab.style.backgroundImage = 'none';
            chatListTab.style.backgroundColor = '#ffffff';
        }
        
        await iosAlert('聊天列表背景已重置！', '成功');
        console.log('聊天列表背景已重置');
    } catch (error) {
        console.error('重置聊天列表背景失败:', error);
        await iosAlert('重置失败，请重试！', '错误');
    }
}

// 应用聊天列表背景
async function applyChatListBg() {
    const chatListTab = document.getElementById('chatListTab');
    
    if (!chatListTab) return;
    
    try {
        const bgData = await getImageFromDB('chatListBg');
        if (bgData) {
            chatListTab.style.backgroundImage = `url(${bgData})`;
            chatListTab.style.backgroundSize = 'cover';
            chatListTab.style.backgroundPosition = 'center';
            chatListTab.style.backgroundRepeat = 'no-repeat';
            console.log('聊天列表背景已应用');
        } else {
            chatListTab.style.backgroundImage = 'none';
            chatListTab.style.backgroundColor = '#ffffff';
        }
    } catch (error) {
        console.error('应用聊天列表背景失败:', error);
        chatListTab.style.backgroundImage = 'none';
        chatListTab.style.backgroundColor = '#ffffff';
    }
}

// ========== 全局聊天背景功能 ==========

// 临时聊天背景数据
let tempChatDetailBgData = null;

// 处理聊天背景本地文件上传
async function handleChatDetailBgUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        await iosAlert('请选择图片文件！', '提示');
        return;
    }
    
    try {
        console.log('正在压缩聊天背景图...');
        
        // 压缩图片
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempChatDetailBgData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('chatDetailBgPreview');
        if (preview) {
            preview.style.backgroundImage = `url(${compressedData})`;
            preview.textContent = '';
        }
        
        console.log('聊天背景图预览加载成功');
    } catch (error) {
        console.error('聊天背景图上传失败:', error);
        await iosAlert('背景图处理失败，请重试！', '错误');
    }
}

// 处理聊天背景URL上传
async function handleChatDetailBgUrl() {
    const urlInput = document.getElementById('chatDetailBgUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        await iosAlert('请输入图片URL地址！', '提示');
        return;
    }
    
    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        await iosAlert('请输入有效的URL地址！', '错误');
        return;
    }
    
    // 创建图片对象测试加载
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        tempChatDetailBgData = url;
        
        // 显示预览
        const preview = document.getElementById('chatDetailBgPreview');
        if (preview) {
            preview.style.backgroundImage = `url(${url})`;
            preview.textContent = '';
        }
        
        console.log('聊天背景图已加载（URL）');
    };
    
    img.onerror = async function() {
        await iosAlert('无法加载该图片，请检查URL是否正确或图片是否支持跨域访问！', '错误');
    };
    
    img.src = url;
}

// 保存聊天背景
async function saveChatDetailBg() {
    if (!tempChatDetailBgData) {
        await iosAlert('请先选择或加载背景图！', '提示');
        return;
    }
    
    try {
        // 保存到IndexedDB
        await saveImageToDB('chatDetailBg', tempChatDetailBgData, 'background');
        await applyChatDetailBg();
        await iosAlert('聊天背景已保存！', '成功');
        
        console.log('聊天背景已保存');
    } catch (error) {
        console.error('保存聊天背景失败:', error);
        await iosAlert('保存失败：' + error.message, '错误');
    }
}

// 重置聊天背景
async function resetChatDetailBg() {
    const confirmed = await iosConfirm('确定要重置聊天背景吗？', '确认');
    if (!confirmed) return;
    
    try {
        // 从IndexedDB删除背景
        await deleteImageFromDB('chatDetailBg');
        tempChatDetailBgData = null;
        
        // 清除预览
        const preview = document.getElementById('chatDetailBgPreview');
        if (preview) {
            preview.style.backgroundImage = 'none';
            preview.textContent = '暂无背景图';
        }
        
        // 清除URL输入框
        const urlInput = document.getElementById('chatDetailBgUrlInput');
        if (urlInput) {
            urlInput.value = '';
        }
        
        // 移除聊天页面背景
        const chatDetailPage = document.getElementById('chatDetailPage');
        if (chatDetailPage) {
            chatDetailPage.style.backgroundImage = 'none';
            chatDetailPage.style.backgroundColor = '#f5f5f5';
        }
        
        await iosAlert('聊天背景已重置！', '成功');
        console.log('聊天背景已重置');
    } catch (error) {
        console.error('重置聊天背景失败:', error);
        await iosAlert('重置失败，请重试！', '错误');
    }
}

// 应用聊天背景到聊天详情页面
async function applyChatDetailBg() {
    const chatDetailPage = document.getElementById('chatDetailPage');
    
    if (!chatDetailPage) return;
    
    try {
        const bgData = await getImageFromDB('chatDetailBg');
        if (bgData) {
            chatDetailPage.style.backgroundImage = `url(${bgData})`;
            chatDetailPage.style.backgroundSize = 'cover';
            chatDetailPage.style.backgroundPosition = 'center';
            chatDetailPage.style.backgroundRepeat = 'no-repeat';
            console.log('聊天背景已应用');
        } else {
            chatDetailPage.style.backgroundImage = 'none';
            chatDetailPage.style.backgroundColor = '#f5f5f5';
        }
    } catch (error) {
        console.error('应用聊天背景失败:', error);
        chatDetailPage.style.backgroundImage = 'none';
        chatDetailPage.style.backgroundColor = '#f5f5f5';
    }
}

// ========== 主屏幕壁纸功能 ==========

// 切换主屏幕壁纸
function toggleMainWallpaper() {
    const toggle = document.getElementById('mainWallpaperToggle');
    const isEnabled = toggle.checked;
    const wallpaperOptions = document.getElementById('mainWallpaperOptions');
    
    // 保存设置到localStorage
    localStorage.setItem('mainWallpaperEnabled', isEnabled);
    
    // 显示/隐藏壁纸设置选项
    wallpaperOptions.style.display = isEnabled ? 'block' : 'none';
    
    console.log('主屏幕壁纸已' + (isEnabled ? '开启' : '关闭'));
    
    if (isEnabled) {
        // 如果有保存的壁纸，应用到主屏幕
        applyWallpaperToMainScreen();
    } else {
        // 关闭壁纸功能时移除壁纸
        const mainScreen = document.querySelector('.main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
    }
}

// 临时主屏幕壁纸数据
let tempMainWallpaperData = null;

// 处理主屏幕本地文件上传
async function handleMainWallpaperFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }
    
    try {
        console.log('正在压缩主屏幕壁纸...');
        
        // 压缩图片（壁纸使用较大尺寸，保留更多细节）
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800,
            outputFormat: file.type === 'image/gif' ? 'image/gif' : 'image/jpeg'
        });
        
        tempMainWallpaperData = compressedData;
        
        // 显示预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = compressedData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('主屏幕壁纸预览加载成功');
    } catch (error) {
        console.error('主屏幕壁纸上传失败:', error);
        alert('壁纸上传失败，请重试！');
    }
}

// 处理主屏幕URL上传
async function handleMainWallpaperUrlUpload() {
    const urlInput = document.getElementById('mainWallpaperUrlInput');
    const url = urlInput.value.trim();
    
    if (!url) {
        alert('请输入图片URL地址！');
        return;
    }
    
    try {
        console.log('正在加载主屏幕壁纸URL...');
        
        // 加载图片
        const img = new Image();
        img.crossOrigin = 'anonymous';
        
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('图片加载失败'));
            img.src = url;
        });
        
        // 转换为base64
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        tempMainWallpaperData = canvas.toDataURL('image/jpeg', 0.85);
        
        // 显示预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = tempMainWallpaperData;
        preview.style.display = 'block';
        placeholder.style.display = 'none';
        
        console.log('主屏幕壁纸URL加载成功');
    } catch (error) {
        console.error('主屏幕壁纸URL加载失败:', error);
        alert('图片URL加载失败，请检查地址是否正确！');
    }
}

// 保存主屏幕壁纸
async function saveMainWallpaper() {
    if (!tempMainWallpaperData) {
        alert('请先上传壁纸！');
        return;
    }
    
    try {
        console.log('正在保存主屏幕壁纸...');
        await saveImageToDB('mainWallpaper', tempMainWallpaperData);
        
        // 应用壁纸
        await applyWallpaperToMainScreen();
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        alert('主屏幕壁纸保存成功！');
        console.log('主屏幕壁纸已保存');
    } catch (error) {
        console.error('保存主屏幕壁纸失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置主屏幕壁纸
async function resetMainWallpaper() {
    if (!confirm('确定要重置主屏幕壁纸吗？')) {
        return;
    }
    
    try {
        console.log('正在重置主屏幕壁纸...');
        await deleteImageFromDB('mainWallpaper');
        
        // 清除预览
        const preview = document.getElementById('mainWallpaperPreview');
        const placeholder = document.getElementById('mainWallpaperPlaceholder');
        preview.src = '';
        preview.style.display = 'none';
        placeholder.style.display = 'block';
        
        // 清除临时数据
        tempMainWallpaperData = null;
        
        // 移除壁纸
        const mainScreen = document.querySelector('.main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        alert('主屏幕壁纸已重置！');
        console.log('主屏幕壁纸已重置');
    } catch (error) {
        console.error('重置主屏幕壁纸失败:', error);
        alert('重置失败，请重试！');
    }
}

// 更新主屏幕壁纸状态
async function updateMainWallpaperStatus() {
    const statusSpan = document.getElementById('mainWallpaperStatus');
    
    try {
        const hasWallpaper = await getImageFromDB('mainWallpaper');
        
        if (hasWallpaper) {
            statusSpan.textContent = '已设置';
            statusSpan.style.color = '#34c759';
        } else {
            statusSpan.textContent = '未设置';
            statusSpan.style.color = '#dc3545';
        }
    } catch (error) {
        console.error('检查主屏幕壁纸状态失败:', error);
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 应用壁纸到主屏幕
async function applyWallpaperToMainScreen() {
    const wallpaperEnabled = localStorage.getItem('mainWallpaperEnabled') === 'true';
    const phoneContainer = document.querySelector('.phone-container');
    const mainScreen = document.querySelector('.main-screen');
    
    if (!phoneContainer || !mainScreen) return;
    
    try {
        if (wallpaperEnabled) {
            const wallpaperData = await getImageFromDB('mainWallpaper');
            if (wallpaperData) {
                // 将壁纸应用到整个手机容器，包括顶栏和底栏
                phoneContainer.style.backgroundImage = `url(${wallpaperData})`;
                phoneContainer.style.backgroundSize = 'cover';
                phoneContainer.style.backgroundPosition = 'center';
                phoneContainer.style.backgroundRepeat = 'no-repeat';
                // 移除主屏幕的背景，让它继承容器的背景
                mainScreen.style.backgroundImage = 'none';
                console.log('壁纸已应用到整个屏幕');
            } else {
                phoneContainer.style.backgroundImage = 'none';
                mainScreen.style.backgroundImage = 'none';
            }
        } else {
            phoneContainer.style.backgroundImage = 'none';
            mainScreen.style.backgroundImage = 'none';
        }
    } catch (error) {
        console.error('应用主屏幕壁纸失败:', error);
        phoneContainer.style.backgroundImage = 'none';
        mainScreen.style.backgroundImage = 'none';
    }
}

// 保存锁屏密码
function saveLockPassword() {
    const passwordInput = document.getElementById('lockPasswordInput');
    const password = passwordInput.value.trim();
    
    // 验证密码格式
    if (password.length !== 4) {
        alert('请输入4位数字密码！');
        return;
    }
    
    if (!/^\d{4}$/.test(password)) {
        alert('密码只能包含数字！');
        return;
    }
    
    // 保存密码
    localStorage.setItem('lockPassword', password);
    passwordInput.value = '';
    updatePasswordStatus();
    alert('密码设置成功！');
    console.log('锁屏密码已设置');
}

// 更新密码状态显示
function updatePasswordStatus() {
    const statusSpan = document.getElementById('passwordStatus');
    const hasPassword = localStorage.getItem('lockPassword');
    
    if (hasPassword) {
        statusSpan.textContent = '已设置';
        statusSpan.style.color = '#34c759';
    } else {
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 更新手势密码状态显示
function updateGestureStatus() {
    const statusSpan = document.getElementById('gestureStatus');
    const hasGesture = localStorage.getItem('lockGesture');
    
    if (hasGesture) {
        statusSpan.textContent = '已设置';
        statusSpan.style.color = '#34c759';
    } else {
        statusSpan.textContent = '未设置';
        statusSpan.style.color = '#dc3545';
    }
}

// 切换密码类型
function switchPasswordType(type) {
    const numBtn = document.getElementById('numPasswordBtn');
    const gestureBtn = document.getElementById('gesturePasswordBtn');
    const numSettings = document.getElementById('numberPasswordSettings');
    const gestureSettings = document.getElementById('gesturePasswordSettings');
    
    if (type === 'number') {
        numBtn.classList.add('active');
        gestureBtn.classList.remove('active');
        numSettings.style.display = 'block';
        gestureSettings.style.display = 'none';
        localStorage.setItem('passwordType', 'number');
    } else {
        numBtn.classList.remove('active');
        gestureBtn.classList.add('active');
        numSettings.style.display = 'none';
        gestureSettings.style.display = 'block';
        localStorage.setItem('passwordType', 'gesture');
    }
}

// 密码输入相关
let currentPassword = '';

// 输入密码数字
function inputPassword(num) {
    if (currentPassword.length < 4) {
        currentPassword += num;
        updatePasswordDots();
        
        // 如果输入了4位，自动验证
        if (currentPassword.length === 4) {
            setTimeout(() => {
                verifyPassword();
            }, 300);
        }
    }
}

// 删除密码
function deletePassword() {
    if (currentPassword.length > 0) {
        currentPassword = currentPassword.slice(0, -1);
        updatePasswordDots();
    }
}

// 更新密码圆点显示
function updatePasswordDots() {
    for (let i = 1; i <= 4; i++) {
        const dot = document.getElementById('dot' + i);
        if (i <= currentPassword.length) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
    }
}

// 验证密码
function verifyPassword() {
    const savedPassword = localStorage.getItem('lockPassword');
    const passwordError = document.getElementById('passwordError');
    
    if (currentPassword === savedPassword) {
        // 密码正确，解锁
        console.log('密码正确，解锁成功');
        const passwordScreen = document.getElementById('passwordScreen');
        const lockScreen = document.getElementById('lockScreen');
        
        // 淡出密码界面
        passwordScreen.style.transition = 'opacity 0.3s ease-out';
        passwordScreen.style.opacity = '0';
        
        // 同时淡出锁屏
        lockScreen.style.transition = 'opacity 0.3s ease-out';
        lockScreen.style.opacity = '0';
        
        setTimeout(() => {
            // 移除密码界面
            passwordScreen.classList.remove('active');
            passwordScreen.style.opacity = '1';
            passwordScreen.style.transition = '';
            
            // 移除锁屏和模糊效果
            lockScreen.classList.remove('active');
            lockScreen.classList.remove('blurred');
            lockScreen.style.opacity = '1';
            lockScreen.style.transition = '';
            
            // 重置密码输入
            currentPassword = '';
            updatePasswordDots();
        }, 300);
    } else {
        // 密码错误
        console.log('密码错误');
        passwordError.classList.add('show');
        
        // 清空输入
        currentPassword = '';
        updatePasswordDots();
        
        // 2秒后隐藏错误提示
        setTimeout(() => {
            passwordError.classList.remove('show');
        }, 2000);
    }
}

// 显示密码输入界面
function showPasswordScreen() {
    const lockScreen = document.getElementById('lockScreen');
    const passwordType = localStorage.getItem('passwordType') || 'number';
    
    // 锁屏保持显示但模糊
    lockScreen.classList.add('blurred');
    
    if (passwordType === 'gesture') {
        // 显示手势输入界面
        const gestureScreen = document.getElementById('gestureScreen');
        gestureScreen.classList.add('active');
        initGestureInput();
    } else {
        // 显示数字密码输入界面
        const passwordScreen = document.getElementById('passwordScreen');
        passwordScreen.classList.add('active');
        currentPassword = '';
        updatePasswordDots();
    }
}

// ==================== 手势密码功能 ====================

// 手势相关变量
let gestureCanvas = null;
let gestureCtx = null;
let gesturePoints = [];
let selectedPoints = [];
let isDrawing = false;
let currentGesture = [];
let gestureSetupStep = 1; // 1: 第一次绘制, 2: 确认绘制

// 初始化手势设置界面
function openGestureSetup() {
    const setupScreen = document.getElementById('gestureSetupScreen');
    setupScreen.classList.add('active');
    
    gestureSetupStep = 1;
    document.getElementById('gestureSetupTitle').textContent = '绘制解锁手势';
    document.getElementById('gestureHint').textContent = '至少连接4个点';
    document.getElementById('gestureConfirmBtn').style.display = 'none';
    
    setTimeout(() => {
        initGestureCanvas('gestureSetupCanvas', true);
    }, 100);
}

// 关闭手势设置界面
function closeGestureSetup() {
    const setupScreen = document.getElementById('gestureSetupScreen');
    setupScreen.classList.remove('active');
    currentGesture = [];
    gestureSetupStep = 1;
}

// 初始化手势画布
function initGestureCanvas(canvasId, isSetup = false) {
    gestureCanvas = document.getElementById(canvasId);
    if (!gestureCanvas) return;
    
    const rect = gestureCanvas.getBoundingClientRect();
    const size = Math.round(rect.width) || 300;
    gestureCanvas.width = size;
    gestureCanvas.height = size;
    gestureCtx = gestureCanvas.getContext('2d');
    
    // 初始化9个点（3x3网格）
    gesturePoints = [];
    const spacing = size / 4;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            gesturePoints.push({
                x: spacing * (j + 1),
                y: spacing * (i + 1),
                index: i * 3 + j,
                selected: false
            });
        }
    }
    
    selectedPoints = [];
    drawGesturePoints();
    
    // 添加事件监听
    if (isSetup) {
        gestureCanvas.addEventListener('mousedown', handleGestureStart);
        gestureCanvas.addEventListener('mousemove', handleGestureMove);
        gestureCanvas.addEventListener('mouseup', handleGestureEnd);
        gestureCanvas.addEventListener('touchstart', handleGestureStart);
        gestureCanvas.addEventListener('touchmove', handleGestureMove);
        gestureCanvas.addEventListener('touchend', handleGestureEnd);
    } else {
        gestureCanvas.addEventListener('mousedown', handleGestureInputStart);
        gestureCanvas.addEventListener('mousemove', handleGestureInputMove);
        gestureCanvas.addEventListener('mouseup', handleGestureInputEnd);
        gestureCanvas.addEventListener('touchstart', handleGestureInputStart);
        gestureCanvas.addEventListener('touchmove', handleGestureInputMove);
        gestureCanvas.addEventListener('touchend', handleGestureInputEnd);
    }
}

// 绘制手势点
function drawGesturePoints() {
    gestureCtx.clearRect(0, 0, gestureCanvas.width, gestureCanvas.height);
    
    // 绘制连接线
    if (selectedPoints.length > 0) {
        gestureCtx.strokeStyle = '#007aff';
        gestureCtx.lineWidth = 3;
        gestureCtx.lineCap = 'round';
        gestureCtx.lineJoin = 'round';
        
        gestureCtx.beginPath();
        gestureCtx.moveTo(selectedPoints[0].x, selectedPoints[0].y);
        for (let i = 1; i < selectedPoints.length; i++) {
            gestureCtx.lineTo(selectedPoints[i].x, selectedPoints[i].y);
        }
        gestureCtx.stroke();
    }
    
    // 绘制所有点
    gesturePoints.forEach(point => {
        gestureCtx.beginPath();
        gestureCtx.arc(point.x, point.y, point.selected ? 12 : 8, 0, Math.PI * 2);
        
        if (point.selected) {
            gestureCtx.fillStyle = '#007aff';
            gestureCtx.fill();
            gestureCtx.strokeStyle = '#005cbf';
            gestureCtx.lineWidth = 2;
            gestureCtx.stroke();
        } else {
            gestureCtx.fillStyle = 'white';
            gestureCtx.fill();
            gestureCtx.strokeStyle = '#d1d1d6';
            gestureCtx.lineWidth = 2;
            gestureCtx.stroke();
        }
    });
}

// 获取触摸/鼠标位置
function getGesturePosition(e) {
    const rect = gestureCanvas.getBoundingClientRect();
    const clientX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const clientY = e.type.includes('mouse') ? e.clientY : e.touches[0].clientY;
    
    return {
        x: (clientX - rect.left) * (gestureCanvas.width / rect.width),
        y: (clientY - rect.top) * (gestureCanvas.height / rect.height)
    };
}

// 查找最近的点
function findNearestPoint(x, y) {
    const threshold = 30;
    for (let point of gesturePoints) {
        const distance = Math.sqrt(Math.pow(point.x - x, 2) + Math.pow(point.y - y, 2));
        if (distance < threshold && !point.selected) {
            return point;
        }
    }
    return null;
}

// 手势开始（设置模式）
function handleGestureStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势移动（设置模式）
function handleGestureMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point && !point.selected) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势结束（设置模式）
function handleGestureEnd(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    
    if (selectedPoints.length >= 4) {
        if (gestureSetupStep === 1) {
            // 第一次绘制完成
            currentGesture = selectedPoints.map(p => p.index);
            document.getElementById('gestureSetupTitle').textContent = '再次绘制确认';
            document.getElementById('gestureHint').textContent = '请再次绘制相同的手势';
            gestureSetupStep = 2;
            
            // 重置
            resetGestureCanvas();
        } else {
            // 第二次绘制，验证是否一致
            const newGesture = selectedPoints.map(p => p.index);
            if (JSON.stringify(currentGesture) === JSON.stringify(newGesture)) {
                // 手势一致，显示确认按钮
                document.getElementById('gestureHint').textContent = '手势匹配！';
                document.getElementById('gestureHint').style.color = '#34c759';
                document.getElementById('gestureConfirmBtn').style.display = 'block';
            } else {
                // 手势不一致，重新开始
                document.getElementById('gestureHint').textContent = '手势不一致，请重新绘制';
                document.getElementById('gestureHint').style.color = '#ff3b30';
                setTimeout(() => {
                    gestureSetupStep = 1;
                    currentGesture = [];
                    document.getElementById('gestureSetupTitle').textContent = '绘制解锁手势';
                    document.getElementById('gestureHint').textContent = '至少连接4个点';
                    document.getElementById('gestureHint').style.color = '#666';
                    resetGestureCanvas();
                }, 2000);
            }
        }
    } else {
        document.getElementById('gestureHint').textContent = '至少需要连接4个点';
        document.getElementById('gestureHint').style.color = '#ff3b30';
        setTimeout(() => {
            document.getElementById('gestureHint').style.color = '#666';
            resetGestureCanvas();
        }, 1500);
    }
}

// 重置手势画布
function resetGestureCanvas() {
    gesturePoints.forEach(p => p.selected = false);
    selectedPoints = [];
    drawGesturePoints();
}

// 确认并保存手势
function confirmGesture() {
    localStorage.setItem('lockGesture', JSON.stringify(currentGesture));
    updateGestureStatus();
    alert('手势密码设置成功！');
    closeGestureSetup();
    console.log('手势密码已设置');
}

// 初始化手势输入界面
function initGestureInput() {
    setTimeout(() => {
        initGestureCanvas('gestureCanvas', false);
    }, 100);
}

// 手势开始（输入模式）
function handleGestureInputStart(e) {
    e.preventDefault();
    isDrawing = true;
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势移动（输入模式）
function handleGestureInputMove(e) {
    if (!isDrawing) return;
    e.preventDefault();
    
    const pos = getGesturePosition(e);
    const point = findNearestPoint(pos.x, pos.y);
    
    if (point && !point.selected) {
        point.selected = true;
        selectedPoints.push(point);
        drawGesturePoints();
    }
}

// 手势结束（输入模式）
function handleGestureInputEnd(e) {
    if (!isDrawing) return;
    e.preventDefault();
    isDrawing = false;
    
    // 验证手势
    verifyGesture();
}

// 验证手势
function verifyGesture() {
    const savedGesture = JSON.parse(localStorage.getItem('lockGesture') || '[]');
    const inputGesture = selectedPoints.map(p => p.index);
    const gestureError = document.getElementById('gestureError');
    
    if (JSON.stringify(savedGesture) === JSON.stringify(inputGesture)) {
        // 手势正确，解锁
        console.log('手势正确，解锁成功');
        const gestureScreen = document.getElementById('gestureScreen');
        const lockScreen = document.getElementById('lockScreen');
        
        // 淡出手势界面
        gestureScreen.style.transition = 'opacity 0.3s ease-out';
        gestureScreen.style.opacity = '0';
        
        // 同时淡出锁屏
        lockScreen.style.transition = 'opacity 0.3s ease-out';
        lockScreen.style.opacity = '0';
        
        setTimeout(() => {
            // 移除手势界面
            gestureScreen.classList.remove('active');
            gestureScreen.style.opacity = '1';
            gestureScreen.style.transition = '';
            
            // 移除锁屏和模糊效果
            lockScreen.classList.remove('active');
            lockScreen.classList.remove('blurred');
            lockScreen.style.opacity = '1';
            lockScreen.style.transition = '';
            
            // 重置手势
            resetGestureCanvas();
        }, 300);
    } else {
        // 手势错误
        console.log('手势错误');
        gestureError.classList.add('show');
        
        // 清空手势
        setTimeout(() => {
            resetGestureCanvas();
            gestureError.classList.remove('show');
        }, 2000);
    }
}

// 切换滑动模式（互斥开关）
function toggleSlideMode(mode) {
    const horizontalToggle = document.getElementById('horizontalToggle');
    const verticalToggle = document.getElementById('verticalToggle');
    
    if (mode === 'horizontal') {
        // 打开横向，关闭向上
        horizontalToggle.checked = true;
        verticalToggle.checked = false;
        localStorage.setItem('lockScreenSlideMode', 'horizontal');
        console.log('滑动方式已切换为：横向滑动');
    } else {
        // 打开向上，关闭横向
        horizontalToggle.checked = false;
        verticalToggle.checked = true;
        localStorage.setItem('lockScreenSlideMode', 'vertical');
        console.log('滑动方式已切换为：向上滑动');
    }
}

// 处理API提供商变更
function handleProviderChange() {
    const provider = document.getElementById('apiProvider').value;
    const urlInput = document.getElementById('apiUrl');
    
    if (provider === 'custom') {
        // 自定义模式：允许编辑，但不清空已有值
        urlInput.disabled = false;
        urlInput.placeholder = '请输入自定义API地址';
        // 只在没有值时才清空
        if (!urlInput.value) {
            urlInput.value = '';
        }
    } else {
        // 预设提供商：只在没有值时才使用默认值，否则保留用户保存的值
        if (!urlInput.value) {
            urlInput.value = apiUrls[provider];
        }
        urlInput.disabled = false; // 改为可编辑，允许用户自定义
    }
}

// 获取模型列表
async function fetchModels() {
    const apiUrl = document.getElementById('apiUrl').value;
    const apiKey = document.getElementById('apiKey').value;
    const provider = document.getElementById('apiProvider').value;
    const modelSelect = document.getElementById('modelSelect');

    if (!apiUrl || !apiKey) {
        alert('请填写API地址和密钥');
        return;
    }

    try {
        let models = [];

        if (provider === 'hakimi') {
            // Gemini API 使用特殊的请求头和端点
            const response = await fetch(`${apiUrl}/models?key=${apiKey}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.models && Array.isArray(data.models)) {
                models = data.models.map(model => ({
                    id: model.name.replace('models/', ''),
                    displayName: model.displayName || model.name
                }));
            }
        } else if (provider === 'claude') {
            // Claude API 不提供 models 端点，使用固定模型列表
            models = [
                { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4.5' },
                { id: 'claude-opus-4-20250115', displayName: 'Claude Opus 4' },
                { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4.5' },
                { id: 'claude-sonnet-4-20250115', displayName: 'Claude Sonnet 4' },
                { id: 'claude-3-7-sonnet-20250219', displayName: 'Claude 3.7 Sonnet' },
                { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet (Oct)' },
                { id: 'claude-3-5-sonnet-20240620', displayName: 'Claude 3.5 Sonnet (Jun)' },
                { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
                { id: 'claude-3-opus-20240229', displayName: 'Claude 3 Opus' },
                { id: 'claude-3-sonnet-20240229', displayName: 'Claude 3 Sonnet' },
                { id: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' }
            ];
        } else if (provider === 'ds') {
            // DeepSeek API 使用标准 OpenAI 风格
            const response = await fetch(`${apiUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(model => ({
                    id: model.id,
                    displayName: model.id
                }));
            }
        } else {
            // Custom API 使用标准 OpenAI 风格
            const response = await fetch(`${apiUrl}/models`, {
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('获取模型失败');
            }

            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(model => ({
                    id: model.id,
                    displayName: model.id
                }));
            }
        }

        // 清空现有选项
        modelSelect.innerHTML = '<option value="">从列表选择模型</option>';
        
        // 添加模型选项
        if (models.length > 0) {
            models.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.displayName;
                modelSelect.appendChild(option);
            });
            alert(`模型列表获取成功！共 ${models.length} 个模型`);
        } else {
            throw new Error('未找到可用模型');
        }
    } catch (error) {
        alert('获取模型失败: ' + error.message);
    }
}

// 保存设置
async function saveSettings() {
    const settings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value || document.getElementById('modelSelect').value
    };

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('apiSettings', settings);
        alert('设置已保存！');
    } catch (error) {
        console.error('保存设置失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载设置
async function loadSettings() {
    try {
        const settings = await storageDB.getItem('apiSettings');
        if (settings) {
            document.getElementById('apiProvider').value = settings.provider || 'hakimi';
            document.getElementById('apiKey').value = settings.apiKey || '';
            document.getElementById('modelInput').value = settings.model || '';
            handleProviderChange(); // 更新API地址
            
            // 始终恢复保存的 API 地址（不管是什么 provider）
            if (settings.apiUrl) {
                document.getElementById('apiUrl').value = settings.apiUrl;
                console.log('API地址已恢复:', settings.apiUrl);
            }
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 初始化新的IndexedDB存储系统
        console.log(' 正在初始化存储系统...');
        await initIndexedDB();
        
        // 检查并显示锁屏
        checkAndShowLockScreen();
        
        // 恢复顶栏设置
        const statusBarEnabled = localStorage.getItem('statusBarEnabled');
        const isStatusBarEnabled = statusBarEnabled === null ? true : statusBarEnabled === 'true';
        const statusBar = document.querySelector('.status-bar');
        if (statusBar) {
            statusBar.style.display = isStatusBarEnabled ? 'flex' : 'none';
        }
        
        // 恢复手机边框设置
        const phoneBorderEnabled = localStorage.getItem('phoneBorderEnabled');
        const isPhoneBorderEnabled = phoneBorderEnabled === 'true';
        const phoneContainer = document.querySelector('.phone-container');
        if (phoneContainer && isPhoneBorderEnabled) {
            phoneContainer.classList.add('phone-border');
        }
        
        // 恢复字体设置
        const savedFont = localStorage.getItem('globalFont');
        const savedFontSize = localStorage.getItem('globalFontSize');
        if (savedFont || savedFontSize) {
            const fontFamily = savedFont || "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
            const fontSize = savedFontSize || '14';
            applyFontSettings(fontFamily, fontSize);
        }
        
        // 恢复主屏幕壁纸
        await applyWallpaperToMainScreen();
        
        // 应用聊天列表背景
        await applyChatListBg();
        
        // 应用聊天背景
        await applyChatDetailBg();
        
        // 加载头像
        await loadAvatar();
        
        // 初始化旧数据库（localForage）
        console.log('正在初始化 localForage...');
        await storageDB.init();
        
        // 检查是否需要从 localStorage 迁移数据
        const hasLocalData = localStorage.getItem('apiSettings') || 
                            localStorage.getItem('apiPresets') || 
                            localStorage.getItem('widgetAvatar') ||
                            localStorage.getItem('widgetName') ||
                            localStorage.getItem('widgetId') ||
                            localStorage.getItem('widgetContent') ||
                            localStorage.getItem('notebookLoveDate') ||
                            localStorage.getItem('notebookLoveDateConfig') ||
                            localStorage.getItem('notebookText') ||
                            localStorage.getItem('notebookImage') ||
                            localStorage.getItem('musicAvatar') ||
                            localStorage.getItem('musicUsername') ||
                            localStorage.getItem('musicBirthday') ||
                            localStorage.getItem('musicCover');
        
        if (hasLocalData) {
            console.log('检测到 localStorage 数据，开始迁移...');
            const migrated = await storageDB.migrateFromLocalStorage();
            if (migrated > 0) {
                console.log('数据迁移完成！');
                // 迁移成功后删除 localStorage 中已迁移的数据，防止重复迁移
                const keysToRemove = ['apiSettings', 'apiPresets', 'widgetAvatar', 'widgetName', 'widgetId', 'widgetContent', 'notebookLoveDate', 'notebookLoveDateConfig', 'notebookText', 'notebookImage', 'musicAvatar', 'musicUsername', 'musicBirthday', 'musicCover'];
                keysToRemove.forEach(key => {
                    if (localStorage.getItem(key)) {
                        localStorage.removeItem(key);
                        console.log(`已从localStorage删除: ${key}`);
                    }
                });
                console.log('localStorage中的已迁移数据已清除');
            }
        }
        
        // 模型下拉框变化时同步到输入框
        document.getElementById('modelSelect').addEventListener('change', function() {
            if (this.value) {
                document.getElementById('modelInput').value = this.value;
            }
        });
        
        // 页面加载时加载保存的设置
        await loadSettings();
        await loadPresetList();
        await loadName();
        await loadId();
        await loadContent();
        await loadAvatar();
        await loadLoveDate();
        await loadNotebookText();
        await loadNotebookImage();
        await loadMusicAvatar();
        await loadMusicUsername();
        await loadMusicBirthday();
        await loadMusicCover();
        await loadMusicLibrary();
        await loadAppIcons();
        loadAppNames();
        
        // 初始化世界书
        await initWorldBooks();
        
        // 加载人设数据
        loadPersonas();
        
        // 加载ID卡人设
        await loadIdCardPersona();
        
        // 加载聊天角色
        await loadChatCharacters();
        renderChatList();
        
        console.log('应用初始化完成！');
    } catch (error) {
        console.error('应用初始化失败:', error);
        alert('应用初始化失败，部分功能可能无法使用。请刷新页面重试。');
    }
});

// ========== 文案编辑功能 ==========

const DEFAULT_CONTENT = '被你牽著的手是不可能的畫面'; // 默认文案

// 打开文案编辑弹窗
async function openContentModal() {
    try {
        // 加载当前文案
        const savedContent = await storageDB.getItem('widgetContent');
        const currentContent = savedContent || DEFAULT_CONTENT;
        
        // 设置输入框和预览
        document.getElementById('contentInput').value = currentContent;
        document.getElementById('contentPreview').textContent = currentContent;
        
        document.getElementById('contentModal').classList.add('active');
    } catch (error) {
        console.error('打开文案弹窗失败:', error);
    }
}

// 关闭文案编辑弹窗
function closeContentModal() {
    document.getElementById('contentModal').classList.remove('active');
}

// 更新文案预览
function updateContentPreview() {
    const contentInput = document.getElementById('contentInput').value;
    document.getElementById('contentPreview').textContent = contentInput || DEFAULT_CONTENT;
}

// 翻译文案
async function translateContent(targetLang) {
    const contentInput = document.getElementById('contentInput').value.trim();
    
    if (!contentInput) {
        alert('请先输入文案内容！');
        return;
    }

    if (contentInput.length > 500) {
        alert('文案内容不能超过500字符！');
        return;
    }

    // 显示加载提示
    const originalText = '正在翻译...';
    alert(originalText);

    try {
        // 语言代码映射
        const langMap = {
            'zh-TW': 'zh-TW',  // 繁体中文
            'en': 'en-US',      // 英语
            'ja': 'ja-JP',      // 日语
            'de': 'de-DE',      // 德语
            'fr': 'fr-FR',      // 法语
            'ko': 'ko-KR',      // 韩语
            'es': 'es-ES',      // 西班牙语
            'ru': 'ru-RU'       // 俄语
        };

        const targetLangCode = langMap[targetLang] || targetLang;

        // 使用 MyMemory Translation API (免费，无需密钥)
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(contentInput)}&langpair=zh-CN|${targetLangCode}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData) {
            const translatedText = data.responseData.translatedText;
            
            // 更新输入框和预览
            document.getElementById('contentInput').value = translatedText;
            document.getElementById('contentPreview').textContent = translatedText;
            
            alert('翻译完成！');
        } else {
            throw new Error('翻译失败');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        alert('翻译失败，请检查网络连接或稍后重试！\n提示：也可以手动编辑文案内容。');
    }
}

// 保存文案
async function saveContent() {
    const contentInput = document.getElementById('contentInput').value.trim();
    
    if (!contentInput) {
        alert('请输入文案内容！');
        return;
    }

    if (contentInput.length > 500) {
        alert('文案内容不能超过500字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetContent', contentInput);
        
        // 更新主界面文案
        document.getElementById('widgetContent').textContent = contentInput;
        
        alert('文案保存成功！');
        closeContentModal();
    } catch (error) {
        console.error('保存文案失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置文案
async function resetContent() {
    if (!confirm('确定要重置为默认文案吗？')) {
        return;
    }

    try {
        // 清除保存的文案
        await storageDB.removeItem('widgetContent');
        
        // 更新预览和输入框
        document.getElementById('contentInput').value = DEFAULT_CONTENT;
        document.getElementById('contentPreview').textContent = DEFAULT_CONTENT;
        
        // 更新主界面
        document.getElementById('widgetContent').textContent = DEFAULT_CONTENT;
        
        alert('已重置为默认文案！');
    } catch (error) {
        console.error('重置文案失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的文案
async function loadContent() {
    try {
        const savedContent = await storageDB.getItem('widgetContent');
        if (savedContent) {
            document.getElementById('widgetContent').textContent = savedContent;
        }
    } catch (error) {
        console.error('加载文案失败:', error);
    }
}

// ========== ID修改功能 ==========

const DEFAULT_ID = '1234'; // 默认ID

// 打开ID修改弹窗
async function openIdModal() {
    try {
        // 加载当前ID
        const savedId = await storageDB.getItem('widgetId');
        const currentId = savedId || DEFAULT_ID;
        
        // 设置输入框和预览
        document.getElementById('idInput').value = currentId;
        document.getElementById('idPreview').textContent = '@' + currentId;
        
        document.getElementById('idModal').classList.add('active');
    } catch (error) {
        console.error('打开ID弹窗失败:', error);
    }
}

// 关闭ID修改弹窗
function closeIdModal() {
    document.getElementById('idModal').classList.remove('active');
    document.getElementById('idInput').value = '';
}

// 更新ID预览
function updateIdPreview() {
    const idInput = document.getElementById('idInput').value.trim();
    document.getElementById('idPreview').textContent = '@' + (idInput || DEFAULT_ID);
}

// 验证ID格式（只允许字母、数字、下划线）
function isValidId(id) {
    return /^[a-zA-Z0-9_]+$/.test(id);
}

// 保存ID
async function saveId() {
    const idInput = document.getElementById('idInput').value.trim();
    
    if (!idInput) {
        alert('请输入ID！');
        return;
    }

    if (idInput.length > 30) {
        alert('ID不能超过30个字符！');
        return;
    }

    if (!isValidId(idInput)) {
        alert('ID只能包含字母、数字和下划线！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetId', idInput);
        
        // 更新主界面ID
        document.getElementById('widgetId').textContent = '@' + idInput;
        
        alert('ID保存成功！');
        closeIdModal();
    } catch (error) {
        console.error('保存ID失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置ID
async function resetId() {
    if (!confirm(`确定要重置为默认ID "@${DEFAULT_ID}" 吗？`)) {
        return;
    }

    try {
        // 清除保存的ID
        await storageDB.removeItem('widgetId');
        
        // 更新预览和输入框
        document.getElementById('idInput').value = DEFAULT_ID;
        document.getElementById('idPreview').textContent = '@' + DEFAULT_ID;
        
        // 更新主界面
        document.getElementById('widgetId').textContent = '@' + DEFAULT_ID;
        
        alert('已重置为默认ID！');
    } catch (error) {
        console.error('重置ID失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的ID
async function loadId() {
    try {
        const savedId = await storageDB.getItem('widgetId');
        if (savedId) {
            document.getElementById('widgetId').textContent = '@' + savedId;
        }
    } catch (error) {
        console.error('加载ID失败:', error);
    }
}

// ========== 名称修改功能 ==========

const DEFAULT_NAME = '习惯'; // 默认名称

// 打开名称修改弹窗
async function openNameModal() {
    try {
        // 加载当前名称
        const savedName = await storageDB.getItem('widgetName');
        const currentName = savedName || DEFAULT_NAME;
        
        // 设置输入框和预览
        document.getElementById('nameInput').value = currentName;
        document.getElementById('namePreview').textContent = currentName;
        
        document.getElementById('nameModal').classList.add('active');
    } catch (error) {
        console.error('打开名称弹窗失败:', error);
    }
}

// 关闭名称修改弹窗
function closeNameModal() {
    document.getElementById('nameModal').classList.remove('active');
    document.getElementById('nameInput').value = '';
}

// 更新名称预览
function updateNamePreview() {
    const nameInput = document.getElementById('nameInput').value.trim();
    document.getElementById('namePreview').textContent = nameInput || DEFAULT_NAME;
}

// 保存名称
async function saveName() {
    const nameInput = document.getElementById('nameInput').value.trim();
    
    if (!nameInput) {
        alert('请输入名称！');
        return;
    }

    if (nameInput.length > 20) {
        alert('名称不能超过20个字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('widgetName', nameInput);
        
        // 更新主界面名称
        document.getElementById('widgetName').textContent = nameInput;
        
        alert('名称保存成功！');
        closeNameModal();
    } catch (error) {
        console.error('保存名称失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置名称
async function resetName() {
    if (!confirm(`确定要重置为默认名称"${DEFAULT_NAME}"吗？`)) {
        return;
    }

    try {
        // 清除保存的名称
        await storageDB.removeItem('widgetName');
        
        // 更新预览和输入框
        document.getElementById('nameInput').value = DEFAULT_NAME;
        document.getElementById('namePreview').textContent = DEFAULT_NAME;
        
        // 更新主界面
        document.getElementById('widgetName').textContent = DEFAULT_NAME;
        
        alert('已重置为默认名称！');
    } catch (error) {
        console.error('重置名称失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的名称
async function loadName() {
    try {
        const savedName = await storageDB.getItem('widgetName');
        if (savedName) {
            document.getElementById('widgetName').textContent = savedName;
        }
    } catch (error) {
        console.error('加载名称失败:', error);
    }
}

// ========== 头像更换功能 ==========

let tempAvatarData = null; // 临时存储预览的头像数据

// 打开头像更换弹窗
async function openAvatarModal() {
    try {
        // 加载当前头像到预览
        const savedAvatar = await storageDB.getItem('widgetAvatar');
        if (savedAvatar) {
            document.getElementById('previewImage').src = savedAvatar;
            document.getElementById('previewImage').style.display = 'block';
            document.getElementById('previewPlaceholder').style.display = 'none';
            tempAvatarData = savedAvatar;
        } else {
            document.getElementById('previewImage').style.display = 'none';
            document.getElementById('previewPlaceholder').style.display = 'block';
            tempAvatarData = null;
        }
        
        document.getElementById('avatarModal').classList.add('active');
    } catch (error) {
        console.error('打开头像弹窗失败:', error);
    }
}

// 关闭头像更换弹窗
function closeAvatarModal() {
    document.getElementById('avatarModal').classList.remove('active');
    document.getElementById('avatarUrlInput').value = '';
    tempAvatarData = null;
}

// 处理本地文件上传
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    try {
        // 显示压缩进度
        console.log(' 正在压缩图片...');
        
        // 压缩图片（头像使用较小尺寸）
        const compressedData = await compressImage(file, {
            maxWidth: 500,
            maxHeight: 500,
            quality: 0.85,
            maxSizeKB: 200
        });
        
        // 显示预览
        document.getElementById('previewImage').src = compressedData;
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempAvatarData = compressedData;
        
        console.log('头像图片已压缩并预览');
    } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请重试！');
    }
}

// 处理URL上传
function handleUrlUpload() {
    const url = document.getElementById('avatarUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('previewImage').src = url;
        document.getElementById('previewImage').style.display = 'block';
        document.getElementById('previewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempAvatarData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置头像
async function resetAvatar() {
    if (!confirm('确定要重置为默认头像吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('previewImage').style.display = 'none';
        document.getElementById('previewPlaceholder').style.display = 'block';
        tempAvatarData = null;
        
        // 从IndexedDB删除头像
        await deleteImageFromDB('widgetAvatar');
        
        // 更新主界面
        document.getElementById('avatarImage').style.display = 'none';
        document.getElementById('avatarPlaceholder').style.display = 'block';
        
        alert('已重置为默认头像！');
        console.log('头像已重置');
    } catch (error) {
        console.error('重置头像失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存头像
async function saveAvatar() {
    if (!tempAvatarData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到IndexedDB
        await saveImageToDB('widgetAvatar', tempAvatarData, 'avatar');
        
        // 更新主界面头像
        document.getElementById('avatarImage').src = tempAvatarData;
        document.getElementById('avatarImage').style.display = 'block';
        document.getElementById('avatarPlaceholder').style.display = 'none';
        
        alert('头像保存成功！');
        closeAvatarModal();
        
        // 显示存储使用情况
        await getStorageUsage();
    } catch (error) {
        console.error('保存头像失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的头像
async function loadAvatar() {
    try {
        const savedAvatar = await getImageFromDB('widgetAvatar');
        if (savedAvatar) {
            document.getElementById('avatarImage').src = savedAvatar;
            document.getElementById('avatarImage').style.display = 'block';
            document.getElementById('avatarPlaceholder').style.display = 'none';
            console.log('头像已加载');
        }
    } catch (error) {
        console.error('加载头像失败:', error);
    }
}

// ========== 相恋日期编辑功能 ==========

const DEFAULT_LOVE_DATE = '相恋日期：520'; // 默认相恋日期
let currentLoveDateMode = 'manual'; // 当前编辑模式：manual（手动输入）或 date（日期计算）

// 初始化日期选择器
function initializeDateSelectors() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    
    // 生成年份选项（过去50年到未来10年）
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear - 50; year <= currentYear + 10; year++) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // 生成月份选项
    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month;
        if (month === new Date().getMonth() + 1) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // 初始化日期选项
    updateDayOptions();
}

// 更新日期选项（根据年月动态调整天数）
function updateDayOptions() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || new Date().getDate();
    
    // 计算该月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 生成日期选项
    daySelect.innerHTML = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day;
        if (day === currentDay && day <= daysInMonth) {
            option.selected = true;
        }
        daySelect.appendChild(option);
    }
    
    // 如果当前选中的日期超过了该月的天数，选择该月最后一天
    if (currentDay > daysInMonth) {
        daySelect.value = daysInMonth;
    }
}

// 计算天数并更新显示
function calculateAndUpdateDays() {
    const yearSelect = document.getElementById('yearSelect');
    const monthSelect = document.getElementById('monthSelect');
    const daySelect = document.getElementById('daySelect');
    const prefix = document.getElementById('loveDatePrefix').value.trim();
    
    const selectedYear = parseInt(yearSelect.value);
    const selectedMonth = parseInt(monthSelect.value);
    const selectedDay = parseInt(daySelect.value);
    
    // 创建选择的日期对象（设置为当天的开始时间）
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 计算天数差（向下取整）
    const timeDiff = today.getTime() - selectedDate.getTime();
    const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
    
    // 判断是过去还是未来
    const isPast = timeDiff >= 0;
    
    // 更新天数显示
    document.getElementById('daysCount').textContent = daysDiff;
    document.getElementById('daysLabel').textContent = isPast ? '已经过了：' : '还剩：';
    
    // 更新预览
    let previewText;
    if (prefix) {
        previewText = `${prefix} ${daysDiff} 天`;
    } else {
        previewText = isPast ? `已经 ${daysDiff} 天` : `还有 ${daysDiff} 天`;
    }
    
    document.getElementById('loveDatePreview').textContent = previewText;
}

// 切换编辑模式
function switchLoveDateMode(mode) {
    currentLoveDateMode = mode;
    
    const manualSection = document.getElementById('manualInputSection');
    const dateSection = document.getElementById('dateCalculateSection');
    const manualBtn = document.getElementById('manualModeBtn');
    const dateBtn = document.getElementById('dateModeBtn');
    
    if (mode === 'manual') {
        manualSection.style.display = 'block';
        dateSection.style.display = 'none';
        manualBtn.style.background = '#007bff';
        dateBtn.style.background = '#6c757d';
        
        // 更新预览为手动输入的内容
        updateLoveDatePreview();
    } else {
        manualSection.style.display = 'none';
        dateSection.style.display = 'block';
        manualBtn.style.background = '#6c757d';
        dateBtn.style.background = '#007bff';
        
        // 计算并更新天数
        calculateAndUpdateDays();
    }
}

// 打开相恋日期编辑弹窗
async function openLoveDateModal() {
    try {
        // 先显示弹窗
        document.getElementById('loveDateModal').classList.add('active');
        
        // 立即初始化日期选择器（确保下拉框有内容）
        initializeDateSelectors();
        
        // 加载保存的配置
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            // 日期计算模式
            switchLoveDateMode('date');
            
            // 恢复保存的日期和前缀
            if (savedConfig.year && savedConfig.month && savedConfig.day) {
                document.getElementById('yearSelect').value = savedConfig.year;
                document.getElementById('monthSelect').value = savedConfig.month;
                updateDayOptions(); // 更新天数选项
                document.getElementById('daySelect').value = savedConfig.day;
            }
            if (savedConfig.prefix) {
                document.getElementById('loveDatePrefix').value = savedConfig.prefix;
            }
            
            calculateAndUpdateDays();
        } else {
            // 手动输入模式
            switchLoveDateMode('manual');
            
            const savedLoveDate = await storageDB.getItem('notebookLoveDate');
            const currentLoveDate = savedLoveDate || DEFAULT_LOVE_DATE;
            
            document.getElementById('loveDateInput').value = currentLoveDate;
            document.getElementById('loveDatePreview').textContent = currentLoveDate;
        }
    } catch (error) {
        console.error('打开相恋日期弹窗失败:', error);
    }
}

// 关闭相恋日期编辑弹窗
function closeLoveDateModal() {
    document.getElementById('loveDateModal').classList.remove('active');
}

// 更新相恋日期预览（手动输入模式）
function updateLoveDatePreview() {
    if (currentLoveDateMode === 'manual') {
        const loveDateInput = document.getElementById('loveDateInput').value;
        document.getElementById('loveDatePreview').textContent = loveDateInput || DEFAULT_LOVE_DATE;
    }
}

// 保存相恋日期
async function saveLoveDate() {
    try {
        let displayText;
        let config;
        
        if (currentLoveDateMode === 'manual') {
            // 手动输入模式
            const loveDateInput = document.getElementById('loveDateInput').value.trim();
            
            if (!loveDateInput) {
                alert('请输入相恋日期内容！');
                return;
            }
            
            if (loveDateInput.length > 50) {
                alert('内容不能超过50个字符！');
                return;
            }
            
            displayText = loveDateInput;
            config = {
                mode: 'manual',
                text: loveDateInput
            };
        } else {
            // 日期计算模式
            const prefix = document.getElementById('loveDatePrefix').value.trim();
            const year = document.getElementById('yearSelect').value;
            const month = document.getElementById('monthSelect').value;
            const day = document.getElementById('daySelect').value;
            
            displayText = document.getElementById('loveDatePreview').textContent;
            config = {
                mode: 'date',
                prefix: prefix,
                year: year,
                month: month,
                day: day
            };
        }
        
        // 保存配置和显示文本
        await storageDB.setItem('notebookLoveDateConfig', config);
        await storageDB.setItem('notebookLoveDate', displayText);
        
        // 更新主界面
        document.getElementById('notebookLoveDate').textContent = displayText;
        
        alert('相恋日期保存成功！');
        closeLoveDateModal();
    } catch (error) {
        console.error('保存相恋日期失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置相恋日期
async function resetLoveDate() {
    if (!confirm(`确定要重置为默认内容"${DEFAULT_LOVE_DATE}"吗？`)) {
        return;
    }

    try {
        // 清除保存的相恋日期和配置
        await storageDB.removeItem('notebookLoveDate');
        await storageDB.removeItem('notebookLoveDateConfig');
        
        // 切换到手动输入模式
        switchLoveDateMode('manual');
        
        // 更新预览和输入框
        document.getElementById('loveDateInput').value = DEFAULT_LOVE_DATE;
        document.getElementById('loveDatePreview').textContent = DEFAULT_LOVE_DATE;
        
        // 更新主界面
        document.getElementById('notebookLoveDate').textContent = DEFAULT_LOVE_DATE;
        
        alert('已重置为默认内容！');
    } catch (error) {
        console.error('重置相恋日期失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的相恋日期
async function loadLoveDate() {
    try {
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            // 日期计算模式：需要每天更新显示
            updateLoveDateDisplay();
            // 设置定时器，每天0点更新一次
            scheduleNextDayUpdate();
        } else {
            // 手动输入模式：直接显示保存的文本
            const savedLoveDate = await storageDB.getItem('notebookLoveDate');
            if (savedLoveDate) {
                document.getElementById('notebookLoveDate').textContent = savedLoveDate;
            }
        }
    } catch (error) {
        console.error('加载相恋日期失败:', error);
    }
}

// 更新相恋日期显示（用于日期计算模式）
async function updateLoveDateDisplay() {
    try {
        const savedConfig = await storageDB.getItem('notebookLoveDateConfig');
        
        if (savedConfig && savedConfig.mode === 'date') {
            const selectedDate = new Date(
                parseInt(savedConfig.year),
                parseInt(savedConfig.month) - 1,
                parseInt(savedConfig.day),
                0, 0, 0
            );
            
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const timeDiff = today.getTime() - selectedDate.getTime();
            const daysDiff = Math.floor(Math.abs(timeDiff) / (1000 * 60 * 60 * 24));
            
            let displayText;
            if (savedConfig.prefix) {
                displayText = `${savedConfig.prefix} ${daysDiff} 天`;
            } else {
                const isPast = timeDiff >= 0;
                displayText = isPast ? `已经 ${daysDiff} 天` : `还有 ${daysDiff} 天`;
            }
            
            // 更新显示
            document.getElementById('notebookLoveDate').textContent = displayText;
            
            // 同时更新保存的文本
            await storageDB.setItem('notebookLoveDate', displayText);
        }
    } catch (error) {
        console.error('更新相恋日期显示失败:', error);
    }
}

// 计划下一次0点更新
function scheduleNextDayUpdate() {
    const now = new Date();
    const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();
    
    setTimeout(() => {
        updateLoveDateDisplay();
        scheduleNextDayUpdate(); // 递归调用，继续计划下一次更新
    }, timeUntilMidnight);
}

// ========== 第三个白条文案编辑功能 ==========

const DEFAULT_NOTEBOOK_TEXT = '跨越时空的思念'; // 默认文案

// 打开第三个白条文案编辑弹窗
async function openNotebookTextModal() {
    try {
        // 加载当前文案
        const savedText = await storageDB.getItem('notebookText');
        const currentText = savedText || DEFAULT_NOTEBOOK_TEXT;
        
        // 设置输入框和预览
        document.getElementById('notebookTextInput').value = currentText;
        document.getElementById('notebookTextPreview').textContent = currentText;
        
        document.getElementById('notebookTextModal').classList.add('active');
    } catch (error) {
        console.error('打开文案弹窗失败:', error);
    }
}

// 关闭第三个白条文案编辑弹窗
function closeNotebookTextModal() {
    document.getElementById('notebookTextModal').classList.remove('active');
}

// 更新第三个白条文案预览
function updateNotebookTextPreview() {
    const textInput = document.getElementById('notebookTextInput').value;
    document.getElementById('notebookTextPreview').textContent = textInput || DEFAULT_NOTEBOOK_TEXT;
}

// 保存第三个白条文案
async function saveNotebookText() {
    const textInput = document.getElementById('notebookTextInput').value.trim();
    
    if (!textInput) {
        alert('请输入文案内容！');
        return;
    }

    if (textInput.length > 100) {
        alert('文案内容不能超过100字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('notebookText', textInput);
        
        // 更新主界面文案
        document.getElementById('notebookText').textContent = textInput;
        
        alert('文案保存成功！');
        closeNotebookTextModal();
    } catch (error) {
        console.error('保存文案失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置第三个白条文案
async function resetNotebookText() {
    if (!confirm(`确定要重置为默认文案"${DEFAULT_NOTEBOOK_TEXT}"吗？`)) {
        return;
    }

    try {
        // 清除保存的文案
        await storageDB.removeItem('notebookText');
        
        // 更新预览和输入框
        document.getElementById('notebookTextInput').value = DEFAULT_NOTEBOOK_TEXT;
        document.getElementById('notebookTextPreview').textContent = DEFAULT_NOTEBOOK_TEXT;
        
        // 更新主界面
        document.getElementById('notebookText').textContent = DEFAULT_NOTEBOOK_TEXT;
        
        alert('已重置为默认文案！');
    } catch (error) {
        console.error('重置文案失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的第三个白条文案
async function loadNotebookText() {
    try {
        const savedText = await storageDB.getItem('notebookText');
        if (savedText) {
            document.getElementById('notebookText').textContent = savedText;
        }
    } catch (error) {
        console.error('加载文案失败:', error);
    }
}

// ========== 本子小组件图片编辑功能 ==========

let tempNotebookImageData = null; // 临时存储预览的图片数据

// 打开本子小组件图片编辑弹窗
async function openNotebookImageModal() {
    try {
        // 加载当前图片到预览
        const savedImage = await storageDB.getItem('notebookImage');
        if (savedImage) {
            document.getElementById('notebookImagePreview').src = savedImage;
            document.getElementById('notebookImagePreview').style.display = 'block';
            document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
            tempNotebookImageData = savedImage;
        } else {
            document.getElementById('notebookImagePreview').style.display = 'none';
            document.getElementById('notebookImagePreviewPlaceholder').style.display = 'block';
            tempNotebookImageData = null;
        }
        
        document.getElementById('notebookImageModal').classList.add('active');
    } catch (error) {
        console.error('打开图片弹窗失败:', error);
    }
}

// 关闭本子小组件图片编辑弹窗
function closeNotebookImageModal() {
    document.getElementById('notebookImageModal').classList.remove('active');
    document.getElementById('notebookImageUrlInput').value = '';
    tempNotebookImageData = null;
}

// 处理本地文件上传
async function handleNotebookImageFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    try {
        // 自动压缩图片（如果太大）
        console.log(`正在处理图片 (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        
        const compressedData = await compressImage(file, {
            maxWidth: 1920,
            maxHeight: 1920,
            quality: 0.85,
            maxSizeKB: 800
        });
        
        // 显示预览
        document.getElementById('notebookImagePreview').src = compressedData;
        document.getElementById('notebookImagePreview').style.display = 'block';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempNotebookImageData = compressedData;
        
        console.log('图片处理完成');
    } catch (error) {
        console.error('图片处理失败:', error);
        alert('图片处理失败，请重试！');
    }
}

// 处理URL上传
function handleNotebookImageUrlUpload() {
    const url = document.getElementById('notebookImageUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('notebookImagePreview').src = url;
        document.getElementById('notebookImagePreview').style.display = 'block';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempNotebookImageData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置本子小组件图片
async function resetNotebookImage() {
    if (!confirm('确定要重置为默认图片吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('notebookImagePreview').style.display = 'none';
        document.getElementById('notebookImagePreviewPlaceholder').style.display = 'block';
        tempNotebookImageData = null;
        
        // 清除保存的图片
        await storageDB.removeItem('notebookImage');
        
        // 更新主界面
        document.getElementById('notebookImage').style.display = 'none';
        document.getElementById('notebookImagePlaceholder').style.display = 'block';
        
        alert('已重置为默认图片！');
    } catch (error) {
        console.error('重置图片失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存本子小组件图片
async function saveNotebookImage() {
    if (!tempNotebookImageData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('notebookImage', tempNotebookImageData);
        
        // 更新主界面图片
        document.getElementById('notebookImage').src = tempNotebookImageData;
        document.getElementById('notebookImage').style.display = 'block';
        document.getElementById('notebookImagePlaceholder').style.display = 'none';
        
        alert('图片保存成功！');
        closeNotebookImageModal();
    } catch (error) {
        console.error('保存图片失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的本子小组件图片
async function loadNotebookImage() {
    try {
        const savedImage = await storageDB.getItem('notebookImage');
        if (savedImage) {
            document.getElementById('notebookImage').src = savedImage;
            document.getElementById('notebookImage').style.display = 'block';
            document.getElementById('notebookImagePlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载图片失败:', error);
    }
}

// ========== 音乐头像更换功能 ==========

let tempMusicAvatarData = null; // 临时存储预览的音乐头像数据

// 打开音乐头像更换弹窗
async function openMusicAvatarModal() {
    try {
        // 加载当前音乐头像到预览
        const savedAvatar = await storageDB.getItem('musicAvatar');
        if (savedAvatar) {
            document.getElementById('musicAvatarPreview').src = savedAvatar;
            document.getElementById('musicAvatarPreview').style.display = 'block';
            document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
            tempMusicAvatarData = savedAvatar;
        } else {
            document.getElementById('musicAvatarPreview').style.display = 'none';
            document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'block';
            tempMusicAvatarData = null;
        }
        
        document.getElementById('musicAvatarModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐头像弹窗失败:', error);
    }
}

// 关闭音乐头像更换弹窗
function closeMusicAvatarModal() {
    document.getElementById('musicAvatarModal').classList.remove('active');
    document.getElementById('musicAvatarUrlInput').value = '';
    tempMusicAvatarData = null;
}

// 处理本地文件上传（音乐头像）
async function handleMusicAvatarFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    try {
        // 自动压缩图片（如果太大）
        console.log(`正在处理音乐头像 (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        
        const compressedData = await compressImage(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85,
            maxSizeKB: 500
        });
        
        // 显示预览
        document.getElementById('musicAvatarPreview').src = compressedData;
        document.getElementById('musicAvatarPreview').style.display = 'block';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicAvatarData = compressedData;
        
        console.log('音乐头像处理完成');
    } catch (error) {
        console.error('音乐头像处理失败:', error);
        alert('图片处理失败，请重试！');
    }
}

// 处理URL上传（音乐头像）
function handleMusicAvatarUrlUpload() {
    const url = document.getElementById('musicAvatarUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('musicAvatarPreview').src = url;
        document.getElementById('musicAvatarPreview').style.display = 'block';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicAvatarData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置音乐头像
async function resetMusicAvatar() {
    if (!confirm('确定要重置为默认头像吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('musicAvatarPreview').style.display = 'none';
        document.getElementById('musicAvatarPreviewPlaceholder').style.display = 'block';
        tempMusicAvatarData = null;
        
        // 清除保存的头像
        await storageDB.removeItem('musicAvatar');
        
        // 更新主界面
        document.getElementById('musicAvatarImage').style.display = 'none';
        document.getElementById('musicAvatarPlaceholder').style.display = 'block';
        
        alert('已重置为默认头像！');
    } catch (error) {
        console.error('重置音乐头像失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存音乐头像
async function saveMusicAvatar() {
    if (!tempMusicAvatarData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicAvatar', tempMusicAvatarData);
        
        // 更新主界面头像
        document.getElementById('musicAvatarImage').src = tempMusicAvatarData;
        document.getElementById('musicAvatarImage').style.display = 'block';
        document.getElementById('musicAvatarPlaceholder').style.display = 'none';
        
        alert('头像保存成功！');
        closeMusicAvatarModal();
    } catch (error) {
        console.error('保存音乐头像失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的音乐头像
async function loadMusicAvatar() {
    try {
        const savedAvatar = await storageDB.getItem('musicAvatar');
        if (savedAvatar) {
            document.getElementById('musicAvatarImage').src = savedAvatar;
            document.getElementById('musicAvatarImage').style.display = 'block';
            document.getElementById('musicAvatarPlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载音乐头像失败:', error);
    }
}

// ========== API预设保存功能 ==========

// 保存当前配置为预设
async function savePreset() {
    // 获取当前配置
    const currentSettings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value
    };

    // 检查必填项
    if (!currentSettings.provider || !currentSettings.apiUrl || !currentSettings.apiKey) {
        alert('请先完整填写API配置！');
        return;
    }

    // 让用户输入预设名称
    const presetName = prompt('请输入预设名称：');
    if (!presetName || presetName.trim() === '') {
        return;
    }

    try {
        // 获取现有预设
        const presets = await storageDB.getItem('apiPresets') || {};
        
        // 检查是否已存在同名预设
        if (presets[presetName]) {
            if (!confirm(`预设 "${presetName}" 已存在，是否覆盖？`)) {
                return;
            }
        }

        // 保存预设
        presets[presetName] = {
            ...currentSettings,
            createdAt: new Date().toISOString()
        };
        await storageDB.setItem('apiPresets', presets);
        
        // 刷新预设列表
        await loadPresetList();
        alert(`预设 "${presetName}" 保存成功！`);
    } catch (error) {
        console.error('保存预设失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载选中的预设
async function loadPreset() {
    const presetSelect = document.getElementById('presetSelect');
    const presetName = presetSelect.value;
    
    if (!presetName) {
        alert('请先选择一个预设！');
        return;
    }

    try {
        const presets = await storageDB.getItem('apiPresets') || {};
        const preset = presets[presetName];

        if (!preset) {
            alert('预设不存在！');
            return;
        }

        // 应用预设配置
        document.getElementById('apiProvider').value = preset.provider;
        document.getElementById('apiKey').value = preset.apiKey;
        document.getElementById('modelInput').value = preset.model || '';
        
        // 始终恢复预设中的 API 地址（不管是什么 provider）
        if (preset.apiUrl) {
            document.getElementById('apiUrl').value = preset.apiUrl;
        }
        
        // 更新API地址界面状态
        handleProviderChange();

        alert(`预设 "${presetName}" 已加载！`);
    } catch (error) {
        console.error('加载预设失败:', error);
        alert('加载失败，请重试！');
    }
}

// 打开删除预设弹窗
async function openDeleteModal() {
    try {
        const presets = await storageDB.getItem('apiPresets') || {};
        if (Object.keys(presets).length === 0) {
            alert('暂无预设可删除！');
            return;
        }
        
        await loadDeletePresetList();
        document.getElementById('deleteModal').classList.add('active');
    } catch (error) {
        console.error('打开删除弹窗失败:', error);
        alert('操作失败，请重试！');
    }
}

// 关闭删除预设弹窗
function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('active');
}

// 加载删除弹窗中的预设列表
async function loadDeletePresetList() {
    try {
        const deleteSelect = document.getElementById('deletePresetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        // 清空现有选项
        deleteSelect.innerHTML = '';

        if (presetNames.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.disabled = true;
            option.style.color = '#999';
            option.textContent = '暂无预设';
            deleteSelect.appendChild(option);
        } else {
            // 按创建时间排序
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;
                
                const providerName = {
                    'hakimi': 'Gemini',
                    'claude': 'Claude',
                    'ds': 'DeepSeek',
                    'custom': 'Custom'
                }[preset.provider] || preset.provider;
                
                option.textContent = `${name} (${providerName})`;
                deleteSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载删除列表失败:', error);
    }
}

// 删除弹窗中的全选/取消全选
function toggleDeleteSelectAll() {
    const deleteSelect = document.getElementById('deletePresetSelect');
    const options = Array.from(deleteSelect.options).filter(opt => !opt.disabled);
    
    if (options.length === 0) {
        return;
    }

    // 如果所有选项都已选中，则取消全选；否则全选
    const allSelected = options.every(opt => opt.selected);
    options.forEach(opt => {
        opt.selected = !allSelected;
    });
}

// 确认删除选中的预设
async function confirmDeletePresets() {
    const deleteSelect = document.getElementById('deletePresetSelect');
    const selectedOptions = Array.from(deleteSelect.selectedOptions);
    
    if (selectedOptions.length === 0) {
        alert('请先选择要删除的预设！');
        return;
    }

    const presetNames = selectedOptions.map(opt => opt.value);
    const confirmMsg = presetNames.length === 1 
        ? `确定要删除预设 "${presetNames[0]}" 吗？`
        : `确定要删除选中的 ${presetNames.length} 个预设吗？\n\n${presetNames.join('\n')}`;

    if (!confirm(confirmMsg)) {
        return;
    }

    try {
        // 从 IndexedDB 中删除
        const presets = await storageDB.getItem('apiPresets') || {};
        presetNames.forEach(name => {
            delete presets[name];
        });
        await storageDB.setItem('apiPresets', presets);

        // 刷新两个列表
        await loadPresetList();
        await loadDeletePresetList();
        
        alert(`已删除 ${presetNames.length} 个预设！`);
        
        // 如果没有预设了，关闭弹窗
        if (Object.keys(presets).length === 0) {
            closeDeleteModal();
        }
    } catch (error) {
        console.error('删除预设失败:', error);
        alert('删除失败，请重试！');
    }
}

// 加载预设列表到下拉框
async function loadPresetList() {
    try {
        const presetSelect = document.getElementById('presetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        // 清空现有选项，保留默认选项
        presetSelect.innerHTML = '<option value="">选择预设...</option>';

        if (presetNames.length > 0) {
            // 按创建时间排序（最新的在上面）
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;
                
                // 显示预设名称和提供商
                const providerName = {
                    'hakimi': 'Gemini',
                    'claude': 'Claude',
                    'ds': 'DeepSeek',
                    'custom': 'Custom'
                }[preset.provider] || preset.provider;
                
                option.textContent = `${name} (${providerName})`;
                presetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载预设列表失败:', error);
    }
}

// ========== 音乐用户名修改功能 ==========

const DEFAULT_MUSIC_USERNAME = '@{{user}}'; // 默认音乐用户名

// 打开音乐用户名修改弹窗
async function openMusicUsernameModal() {
    try {
        // 加载当前用户名
        const savedUsername = await storageDB.getItem('musicUsername');
        const currentUsername = savedUsername || DEFAULT_MUSIC_USERNAME;
        
        // 设置输入框和预览
        document.getElementById('musicUsernameInput').value = currentUsername;
        document.getElementById('musicUsernamePreview').textContent = currentUsername;
        
        document.getElementById('musicUsernameModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐用户名弹窗失败:', error);
    }
}

// 关闭音乐用户名修改弹窗
function closeMusicUsernameModal() {
    document.getElementById('musicUsernameModal').classList.remove('active');
}

// 更新音乐用户名预览
function updateMusicUsernamePreview() {
    const usernameInput = document.getElementById('musicUsernameInput').value;
    document.getElementById('musicUsernamePreview').textContent = usernameInput || DEFAULT_MUSIC_USERNAME;
}

// 翻译音乐用户名
async function translateMusicUsername(targetLang) {
    const usernameInput = document.getElementById('musicUsernameInput').value.trim();
    
    if (!usernameInput) {
        alert('请先输入用户名内容！');
        return;
    }

    if (usernameInput.length > 50) {
        alert('用户名内容不能超过50字符！');
        return;
    }

    // 显示加载提示
    alert('正在翻译...');

    try {
        // 语言代码映射
        const langMap = {
            'zh-TW': 'zh-TW',  // 繁体中文
            'en': 'en-US',      // 英语
            'ja': 'ja-JP',      // 日语
            'de': 'de-DE',      // 德语
            'fr': 'fr-FR',      // 法语
            'ko': 'ko-KR',      // 韩语
            'es': 'es-ES',      // 西班牙语
            'ru': 'ru-RU'       // 俄语
        };

        const targetLangCode = langMap[targetLang] || targetLang;

        // 使用 MyMemory Translation API (免费，无需密钥)
        const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(usernameInput)}&langpair=zh-CN|${targetLangCode}`;
        
        const response = await fetch(apiUrl);
        const data = await response.json();

        if (data.responseStatus === 200 && data.responseData) {
            const translatedText = data.responseData.translatedText;
            
            // 更新输入框和预览
            document.getElementById('musicUsernameInput').value = translatedText;
            document.getElementById('musicUsernamePreview').textContent = translatedText;
            
            alert('翻译完成！');
        } else {
            throw new Error('翻译失败');
        }
    } catch (error) {
        console.error('翻译失败:', error);
        alert('翻译失败，请检查网络连接或稍后重试！\n提示：也可以手动编辑用户名内容。');
    }
}

// 保存音乐用户名
async function saveMusicUsername() {
    const usernameInput = document.getElementById('musicUsernameInput').value.trim();
    
    if (!usernameInput) {
        alert('请输入用户名内容！');
        return;
    }

    if (usernameInput.length > 50) {
        alert('用户名内容不能超过50字符！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicUsername', usernameInput);
        
        // 更新主界面用户名
        document.getElementById('musicUsername').textContent = usernameInput;
        
        alert('用户名保存成功！');
        closeMusicUsernameModal();
    } catch (error) {
        console.error('保存用户名失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置音乐用户名
async function resetMusicUsername() {
    if (!confirm(`确定要重置为默认用户名"${DEFAULT_MUSIC_USERNAME}"吗？`)) {
        return;
    }

    try {
        // 清除保存的用户名
        await storageDB.removeItem('musicUsername');
        
        // 更新预览和输入框
        document.getElementById('musicUsernameInput').value = DEFAULT_MUSIC_USERNAME;
        document.getElementById('musicUsernamePreview').textContent = DEFAULT_MUSIC_USERNAME;
        
        // 更新主界面
        document.getElementById('musicUsername').textContent = DEFAULT_MUSIC_USERNAME;
        
        alert('已重置为默认用户名！');
    } catch (error) {
        console.error('重置用户名失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的音乐用户名
async function loadMusicUsername() {
    try {
        const savedUsername = await storageDB.getItem('musicUsername');
        if (savedUsername) {
            document.getElementById('musicUsername').textContent = savedUsername;
        }
    } catch (error) {
        console.error('加载用户名失败:', error);
    }
}

// ========== 音乐生日编辑功能 ==========

const DEFAULT_MUSIC_BIRTHDAY = 'birthday 2000/08/01'; // 默认生日

// 初始化生日日期选择器
function initializeBirthdaySelectors() {
    const yearSelect = document.getElementById('birthdayYearSelect');
    const monthSelect = document.getElementById('birthdayMonthSelect');
    const daySelect = document.getElementById('birthdayDaySelect');
    
    // 生成年份选项（从1900年到当前年份）
    const currentYear = new Date().getFullYear();
    yearSelect.innerHTML = '';
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === 2000) option.selected = true;
        yearSelect.appendChild(option);
    }
    
    // 生成月份选项
    monthSelect.innerHTML = '';
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = String(month).padStart(2, '0');
        option.textContent = month;
        if (month === 8) option.selected = true;
        monthSelect.appendChild(option);
    }
    
    // 初始化日期选项
    updateBirthdayDayOptions();
}

// 更新生日日期选项（根据年月动态调整天数）
function updateBirthdayDayOptions() {
    const yearSelect = document.getElementById('birthdayYearSelect');
    const monthSelect = document.getElementById('birthdayMonthSelect');
    const daySelect = document.getElementById('birthdayDaySelect');
    
    const year = parseInt(yearSelect.value);
    const month = parseInt(monthSelect.value);
    const currentDay = parseInt(daySelect.value) || 1;
    
    // 计算该月的天数
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 生成日期选项
    daySelect.innerHTML = '';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = String(day).padStart(2, '0');
        option.textContent = day;
        if (day === currentDay && day <= daysInMonth) {
            option.selected = true;
        }
        daySelect.appendChild(option);
    }
    
    // 如果当前选中的日期超过了该月的天数，选择该月最后一天
    if (currentDay > daysInMonth) {
        daySelect.value = String(daysInMonth).padStart(2, '0');
    }
}

// 打开音乐生日编辑弹窗
async function openMusicBirthdayModal() {
    try {
        // 先显示弹窗
        document.getElementById('musicBirthdayModal').classList.add('active');
        
        // 立即初始化日期选择器
        initializeBirthdaySelectors();
        
        // 加载保存的生日配置
        const savedBirthday = await storageDB.getItem('musicBirthday');
        
        if (savedBirthday) {
            // 解析保存的生日数据
            // 格式可能是 "birthday 2000/08/01" 或 "2000/08/01" 或 "生日 2000/08/01"
            const match = savedBirthday.match(/(\d{4})\/(\d{2})\/(\d{2})/);
            if (match) {
                const year = match[1];
                const month = match[2];
                const day = match[3];
                
                document.getElementById('birthdayYearSelect').value = year;
                document.getElementById('birthdayMonthSelect').value = month;
                updateBirthdayDayOptions();
                document.getElementById('birthdayDaySelect').value = day;
                
                // 提取前缀（如果有）
                const prefixMatch = savedBirthday.match(/^(.+?)\s+\d{4}/);
                if (prefixMatch) {
                    document.getElementById('birthdayPrefixInput').value = prefixMatch[1];
                } else {
                    document.getElementById('birthdayPrefixInput').value = '';
                }
            } else {
                // 如果解析失败，使用默认值
                document.getElementById('birthdayPrefixInput').value = 'birthday';
            }
            
            document.getElementById('musicBirthdayPreview').textContent = savedBirthday;
        } else {
            // 使用默认值
            document.getElementById('birthdayPrefixInput').value = 'birthday';
            document.getElementById('musicBirthdayPreview').textContent = DEFAULT_MUSIC_BIRTHDAY;
        }
    } catch (error) {
        console.error('打开生日弹窗失败:', error);
    }
}

// 关闭音乐生日编辑弹窗
function closeMusicBirthdayModal() {
    document.getElementById('musicBirthdayModal').classList.remove('active');
}

// 更新音乐生日预览
function updateMusicBirthdayPreview() {
    const year = document.getElementById('birthdayYearSelect').value;
    const month = document.getElementById('birthdayMonthSelect').value;
    const day = document.getElementById('birthdayDaySelect').value;
    const prefix = document.getElementById('birthdayPrefixInput').value.trim();
    
    let previewText;
    if (prefix) {
        previewText = `${prefix} ${year}/${month}/${day}`;
    } else {
        previewText = `${year}/${month}/${day}`;
    }
    
    document.getElementById('musicBirthdayPreview').textContent = previewText;
}

// 保存音乐生日
async function saveMusicBirthday() {
    try {
        const year = document.getElementById('birthdayYearSelect').value;
        const month = document.getElementById('birthdayMonthSelect').value;
        const day = document.getElementById('birthdayDaySelect').value;
        const prefix = document.getElementById('birthdayPrefixInput').value.trim();
        
        let birthdayText;
        if (prefix) {
            if (prefix.length > 20) {
                alert('前缀文字不能超过20个字符！');
                return;
            }
            birthdayText = `${prefix} ${year}/${month}/${day}`;
        } else {
            birthdayText = `${year}/${month}/${day}`;
        }
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicBirthday', birthdayText);
        
        // 更新主界面生日显示
        document.getElementById('musicBirthday').textContent = birthdayText;
        
        alert('生日保存成功！');
        closeMusicBirthdayModal();
    } catch (error) {
        console.error('保存生日失败:', error);
        alert('保存失败，请重试！');
    }
}

// 重置音乐生日
async function resetMusicBirthday() {
    if (!confirm(`确定要重置为默认生日"${DEFAULT_MUSIC_BIRTHDAY}"吗？`)) {
        return;
    }

    try {
        // 清除保存的生日
        await storageDB.removeItem('musicBirthday');
        
        // 重新初始化选择器
        initializeBirthdaySelectors();
        
        // 更新预览和输入框
        document.getElementById('birthdayPrefixInput').value = 'birthday';
        document.getElementById('musicBirthdayPreview').textContent = DEFAULT_MUSIC_BIRTHDAY;
        
        // 更新主界面
        document.getElementById('musicBirthday').textContent = DEFAULT_MUSIC_BIRTHDAY;
        
        alert('已重置为默认生日！');
    } catch (error) {
        console.error('重置生日失败:', error);
        alert('重置失败，请重试！');
    }
}

// 加载保存的音乐生日
async function loadMusicBirthday() {
    try {
        const savedBirthday = await storageDB.getItem('musicBirthday');
        if (savedBirthday) {
            document.getElementById('musicBirthday').textContent = savedBirthday;
        }
    } catch (error) {
        console.error('加载生日失败:', error);
    }
}

// ========== 音乐封面更换功能 ==========

let tempMusicCoverData = null; // 临时存储预览的音乐封面数据

// 打开音乐封面更换弹窗
async function openMusicCoverModal() {
    try {
        // 加载当前音乐封面到预览
        const savedCover = await storageDB.getItem('musicCover');
        if (savedCover) {
            document.getElementById('musicCoverPreview').src = savedCover;
            document.getElementById('musicCoverPreview').style.display = 'block';
            document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
            tempMusicCoverData = savedCover;
        } else {
            document.getElementById('musicCoverPreview').style.display = 'none';
            document.getElementById('musicCoverPreviewPlaceholder').style.display = 'block';
            tempMusicCoverData = null;
        }
        
        document.getElementById('musicCoverModal').classList.add('active');
    } catch (error) {
        console.error('打开音乐封面弹窗失败:', error);
    }
}

// 关闭音乐封面更换弹窗
function closeMusicCoverModal() {
    document.getElementById('musicCoverModal').classList.remove('active');
    document.getElementById('musicCoverUrlInput').value = '';
    tempMusicCoverData = null;
}

// 处理本地文件上传（音乐封面）
async function handleMusicCoverFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // 检查文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件！');
        return;
    }

    try {
        // 自动压缩图片（如果太大）
        console.log(`正在处理音乐封面 (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
        
        const compressedData = await compressImage(file, {
            maxWidth: 1200,
            maxHeight: 1200,
            quality: 0.85,
            maxSizeKB: 600
        });
        
        // 显示预览
        document.getElementById('musicCoverPreview').src = compressedData;
        document.getElementById('musicCoverPreview').style.display = 'block';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicCoverData = compressedData;
        
        console.log('音乐封面处理完成');
    } catch (error) {
        console.error('音乐封面处理失败:', error);
        alert('图片处理失败，请重试！');
    }
}

// 处理URL上传（音乐封面）
function handleMusicCoverUrlUpload() {
    const url = document.getElementById('musicCoverUrlInput').value.trim();
    
    if (!url) {
        alert('请输入图片URL！');
        return;
    }

    // 验证URL格式
    try {
        new URL(url);
    } catch (e) {
        alert('请输入有效的URL地址！');
        return;
    }

    // 创建图片对象测试URL是否有效
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    
    img.onload = function() {
        // URL有效，显示预览
        document.getElementById('musicCoverPreview').src = url;
        document.getElementById('musicCoverPreview').style.display = 'block';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'none';
        
        // 保存到临时变量
        tempMusicCoverData = url;
        alert('图片加载成功！');
    };
    
    img.onerror = function() {
        alert('图片加载失败，请检查URL是否正确！\n注意：某些图片可能因跨域限制无法加载。');
    };
    
    img.src = url;
}

// 重置音乐封面
async function resetMusicCover() {
    if (!confirm('确定要重置为默认封面吗？')) {
        return;
    }

    try {
        // 清空预览
        document.getElementById('musicCoverPreview').style.display = 'none';
        document.getElementById('musicCoverPreviewPlaceholder').style.display = 'block';
        tempMusicCoverData = null;
        
        // 清除保存的封面
        await storageDB.removeItem('musicCover');
        
        // 更新主界面
        document.getElementById('musicCoverImage').style.display = 'none';
        document.getElementById('musicCoverPlaceholder').style.display = 'block';
        
        alert('已重置为默认封面！');
    } catch (error) {
        console.error('重置音乐封面失败:', error);
        alert('重置失败，请重试！');
    }
}

// 保存音乐封面
async function saveMusicCover() {
    if (!tempMusicCoverData) {
        alert('请先选择或上传图片！');
        return;
    }

    try {
        // 保存到 IndexedDB
        await storageDB.setItem('musicCover', tempMusicCoverData);
        
        // 更新主界面封面
        document.getElementById('musicCoverImage').src = tempMusicCoverData;
        document.getElementById('musicCoverImage').style.display = 'block';
        document.getElementById('musicCoverPlaceholder').style.display = 'none';
        
        alert('封面保存成功！');
        closeMusicCoverModal();
    } catch (error) {
        console.error('保存音乐封面失败:', error);
        alert('保存失败，请重试！');
    }
}

// 加载保存的音乐封面
async function loadMusicCover() {
    try {
        const savedCover = await storageDB.getItem('musicCover');
        if (savedCover) {
            document.getElementById('musicCoverImage').src = savedCover;
            document.getElementById('musicCoverImage').style.display = 'block';
            document.getElementById('musicCoverPlaceholder').style.display = 'none';
        }
    } catch (error) {
        console.error('加载音乐封面失败:', error);
    }
}

// ========== 在线音乐搜索和播放功能 ==========

// 全局音乐播放器状态
let musicLibrary = []; // 音乐库
let currentMusicIndex = 0; // 当前播放索引
let isPlaying = false; // 是否正在播放
let playMode = 'list'; // 播放模式：'list'=连续播放, 'single'=单曲循环
const audioPlayer = document.getElementById('audioPlayer');

// 初始化音乐播放器
if (audioPlayer) {
    // 监听播放结束事件
    audioPlayer.addEventListener('ended', function() {
        if (playMode === 'single') {
            // 单曲循环：重新播放当前歌曲
            audioPlayer.currentTime = 0;
            audioPlayer.play();
        } else {
            // 连续播放：播放下一首
            playNextSong();
        }
    });
    
    // 监听播放进度
    audioPlayer.addEventListener('timeupdate', function() {
        updateProgressBar();
        updateLyric();
    });
    
    // 监听加载完成
    audioPlayer.addEventListener('loadedmetadata', function() {
        console.log('音乐加载完成，时长:', audioPlayer.duration);
    });
}

// 更新API描述
function updateApiDescription() {
    const apiSelect = document.getElementById('musicApiSelect');
    const desc = document.getElementById('apiDescription');
    
    const descriptions = {
        'meting1': '实测可用 - 支持网易云、QQ、酷狗、酷我',
        'meting2': '实测可用 - 稳定快速，多平台聚合',
        'meting3': '实测可用 - 支持网易云和QQ音乐',
        'aa1': '聚合多个音乐平台，一次搜索全部结果',
        'nanyi': '全平台聚合API，支持网易云、QQ、酷狗等'
    };
    
    desc.textContent = descriptions[apiSelect.value] || '';
}

// 智能提取歌手信息的辅助函数
function extractArtistInfo(song) {
    // 尝试从多个可能的字段中提取歌手信息
    let artist = null;
    
    // 1. 处理数组格式的歌手信息（如网易云的 ar 字段）
    if (song.ar && Array.isArray(song.ar) && song.ar.length > 0) {
        artist = song.ar.map(a => a.name).filter(Boolean).join(', ');
    }
    // 2. 处理 artists 数组
    else if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
        artist = song.artists.map(a => a.name || a).filter(Boolean).join(', ');
    }
    // 3. 处理 artist 数组格式
    else if (Array.isArray(song.artist) && song.artist.length > 0) {
        artist = song.artist.map(a => (typeof a === 'object' ? a.name : a)).filter(Boolean).join(', ');
    }
    // 4. 处理字符串格式的各种字段
    else if (song.singer) {
        artist = song.singer;
    }
    else if (song.artist) {
        artist = song.artist;
    }
    else if (song.artistName) {
        artist = song.artistName;
    }
    else if (song.author) {
        artist = song.author;
    }
    else if (song.auther) { // 注意：有些API拼写错误
        artist = song.auther;
    }
    else if (song.singerName) {
        artist = song.singerName;
    }
    
    // 清理和验证结果
    if (artist) {
        artist = String(artist).trim();
        // 过滤掉无效值
        if (artist === '' || artist === 'null' || artist === 'undefined' || artist === 'None') {
            artist = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知歌手"
    return artist || '未知歌手';
}

// 智能提取专辑信息的辅助函数
function extractAlbumInfo(song) {
    // 尝试从多个可能的字段中提取专辑信息
    let album = null;
    
    // 1. 处理对象格式的专辑信息（如网易云的 al 字段）
    if (song.al && typeof song.al === 'object' && song.al.name) {
        album = song.al.name;
    }
    // 2. 处理 album 对象格式
    else if (song.album && typeof song.album === 'object' && song.album.name) {
        album = song.album.name;
    }
    // 3. 处理字符串格式的各种字段
    else if (typeof song.album === 'string') {
        album = song.album;
    }
    else if (song.albumName) {
        album = song.albumName;
    }
    else if (song.albumTitle) {
        album = song.albumTitle;
    }
    else if (song.disc) {
        album = song.disc;
    }
    else if (song.albumname) {
        album = song.albumname;
    }
    
    // 清理和验证结果
    if (album) {
        album = String(album).trim();
        // 过滤掉无效值
        if (album === '' || album === 'null' || album === 'undefined' || album === 'None' || album === '未知' || album === 'unknown') {
            album = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知专辑"
    return album || '未知专辑';
}

// 搜索音乐（聚合多平台）
async function searchMusic() {
    const searchInput = document.getElementById('musicSearchInput').value.trim();
    const apiSource = document.getElementById('musicApiSelect').value;
    
    if (!searchInput) {
        alert('请输入搜索关键词！');
        return;
    }

    // 显示加载提示
    document.getElementById('musicSearchLoading').style.display = 'block';
    document.getElementById('musicSearchResults').style.display = 'none';

    try {
        let results = [];
        
        if (apiSource === 'meting1') {
            results = await searchWithMetingAPINew(searchInput);
        } else if (apiSource === 'meting2') {
            results = await searchWithMetingAPINew2(searchInput);
        } else if (apiSource === 'meting3') {
            results = await searchWithVkeysAPI(searchInput);
        } else if (apiSource === 'aa1') {
            results = await searchWithAA1API(searchInput);
        } else if (apiSource === 'nanyi') {
            results = await searchWithNanYiAPI(searchInput);
        }

        if (results.length > 0) {
            displayMusicResults(results);
        } else {
            document.getElementById('musicSearchLoading').style.display = 'none';
            alert('没有找到相关音乐，请尝试其他关键词或切换API！');
        }
    } catch (error) {
        console.error('搜索音乐失败:', error);
        document.getElementById('musicSearchLoading').style.display = 'none';
        alert('搜索失败：' + error.message + '\n\n建议：\n1. 尝试切换其他API服务\n2. 检查网络连接\n3. 稍后重试');
    }
}

// 新版Meting API 1 (i-meto.com) - 实测可用
async function searchWithMetingAPINew(keyword) {
    const baseUrl = 'https://api.i-meto.com/meting/api';
    return await searchWithMetingCore(baseUrl, keyword);
}

// 新版Meting API 2 (qjqq.cn) - 实测可用
async function searchWithMetingAPINew2(keyword) {
    const baseUrl = 'https://meting.qjqq.cn/api.php';
    return await searchWithMetingCore(baseUrl, keyword);
}

// Meting核心搜索函数
async function searchWithMetingCore(baseUrl, keyword) {
    try {
        const platforms = ['netease', 'tencent', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}?server=${platform}&type=search&id=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`${platform} 返回 ${data.length} 条结果`);
                        
                        // 处理前5条结果
                        for (const song of data.slice(0, 5)) {
                            // Meting API直接在搜索结果中返回URL
                            if (song.url) {
                                const platformNames = {
                                    'netease': '网易云',
                                    'tencent': 'QQ音乐',
                                    'kugou': '酷狗',
                                    'kuwo': '酷我'
                                };
                                
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title || '未知歌曲',
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platformNames[platform] || platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Meting API搜索失败:', error);
        throw error;
    }
}

// Vkeys API - 自定义实现
async function searchWithVkeysAPI(keyword) {
    const baseUrl = 'https://api.vkeys.cn/v2/music';
    return await searchWithVkeysCore(baseUrl, keyword);
}

// Vkeys核心搜索函数（参考METING风格编写）
async function searchWithVkeysCore(baseUrl, keyword) {
    try {
        const platforms = [
            { name: 'netease', label: '网易云' },
            { name: 'tencent', label: 'QQ音乐' }
        ];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}/${platform.name}?word=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform.label}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
                        console.log(`${platform.label} 返回 ${data.data.length} 条结果`);
                        
                        // 处理前6条结果
                        for (const song of data.data.slice(0, 6)) {
                            try {
                                // 获取播放链接（Vkeys API需要额外请求获取URL）
                                const urlResponse = await fetch(`${baseUrl}/${platform.name}?id=${song.id}`);
                                const urlData = await urlResponse.json();
                                
                                if (urlData.code === 200 && urlData.data?.url) {
                                    allResults.push({
                                        id: `${platform.name}_${song.id}`,
                                        name: song.name || song.song || song.title || '未知歌曲',
                                        artist: extractArtistInfo(song),
                                        album: extractAlbumInfo(song),
                                        cover: song.al?.picUrl || song.pic || song.cover || '',
                                        coverSmall: song.al?.picUrl || song.pic || song.cover || '',
                                        playUrl: urlData.data.url,
                                        source: platform.name,
                                        platform: platform.label
                                    });
                                }
                            } catch (urlErr) {
                                console.log(`${platform.label} 获取播放链接失败:`, urlErr);
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform.label} 搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Vkeys API 搜索失败:', error);
        return [];
    }
}

// AA1 聚合API
async function searchWithAA1API(keyword) {
    try {
        const url = `https://api.aa1.cn/api/api-wenan-wangyiyunyinyue/index.php?msg=${encodeURIComponent(keyword)}&n=20`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('AA1 API请求失败');
        }
        
        const data = await response.json();
        const results = [];
        
        if (data && Array.isArray(data)) {
            for (const song of data) {
                if (song.url) {
                    results.push({
                        id: `aa1_${song.id || Math.random()}`,
                        name: song.name || song.title,
                        artist: extractArtistInfo(song),
                        album: extractAlbumInfo(song),
                        cover: song.pic || song.cover,
                        coverSmall: song.pic || song.cover,
                        playUrl: song.url,
                        source: 'netease',
                        platform: '网易云'
                    });
                }
            }
        }
        
        return results;
    } catch (error) {
        console.error('AA1 API搜索失败:', error);
        throw error;
    }
}

// NanYi 聚合API
async function searchWithNanYiAPI(keyword) {
    try {
        const platforms = ['netease', 'qq', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const url = `https://api.nanyinet.com/api/music/${platform}?msg=${encodeURIComponent(keyword)}&n=5`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.data && Array.isArray(data.data)) {
                        for (const song of data.data) {
                            if (song.url) {
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title,
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`NanYi ${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('NanYi API搜索失败:', error);
        throw error;
    }
}

// 显示音乐搜索结果
function displayMusicResults(results) {
    const resultsContainer = document.getElementById('musicSearchList');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">没有找到相关音乐</div>';
        document.getElementById('musicSearchLoading').style.display = 'none';
        document.getElementById('musicSearchResults').style.display = 'block';
        return;
    }

    // 平台标识和颜色
    const platformColors = {
        'netease': '#e60012',
        'qq': '#31c27c',
        'kugou': '#2ca7f8',
        'kuwo': '#f63',
        '网易云': '#e60012',
        'QQ音乐': '#31c27c'
    };

    const platformNames = {
        'netease': '网易云',
        'qq': 'QQ音乐',
        'kugou': '酷狗',
        'kuwo': '酷我'
    };

    results.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.2s;
            position: relative;
        `;
        
        musicItem.onmouseover = function() {
            this.style.backgroundColor = '#fff';
        };
        
        musicItem.onmouseout = function() {
            this.style.backgroundColor = 'transparent';
        };

        const platformName = music.platform || platformNames[music.source] || music.source;
        const platformColor = platformColors[music.source] || platformColors[music.platform] || '#666';

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 12px;" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27 font-size=%2714%27%3E封面%3C/text%3E%3C/svg%3E'">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                    <span style="display: inline-block; padding: 2px 6px; background: ${platformColor}; color: white; border-radius: 4px; font-size: 10px; margin-left: 6px; vertical-align: middle;">
                        ${platformName}
                    </span>
                </div>
                <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
                <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.album}
                </div>
            </div>
            <button onclick='addToMusicLibrary(${JSON.stringify(music).replace(/'/g, "&apos;").replace(/"/g, "&quot;")})' 
                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap;">
                添加
            </button>
        `;

        resultsContainer.appendChild(musicItem);
    });

    // 隐藏加载提示，显示结果
    document.getElementById('musicSearchLoading').style.display = 'none';
    document.getElementById('musicSearchResults').style.display = 'block';
}

// 添加到音乐库
async function addToMusicLibrary(music) {
    try {
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.id === music.id && item.source === music.source);
        if (exists) {
            alert('该音乐已在音乐库中！');
            return;
        }

        // 获取歌词
        let lyric = null;
        const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
        const songId = music.id.split('_').pop(); // 提取原始ID
        
        try {
            if (apiSource === 'meting1') {
                lyric = await getLyricFromMeting('https://api.i-meto.com/meting/api', music.source, songId);
            } else if (apiSource === 'meting2') {
                lyric = await getLyricFromMeting('https://meting.qjqq.cn/api.php', music.source, songId);
            } else if (apiSource === 'meting3') {
                lyric = await getLyricFromVkeys(music.source, songId);
            } else if (apiSource === 'nanyi') {
                lyric = await getLyricFromNanYi(music.source, songId);
            }
            
            if (lyric) {
                music.lyric = lyric;
                console.log('✅ 歌词获取成功');
            } else {
                console.log('⚠️ 未获取到歌词');
            }
        } catch (error) {
            console.error('获取歌词出错:', error);
        }

        // 添加到音乐库
        musicLibrary.push(music);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        alert(`已添加《${music.name}》到音乐库！${music.lyric ? '\n✅ 歌词已同步' : '\n⚠️ 暂无歌词'}`);
    } catch (error) {
        console.error('添加音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 切换自定义音乐上传表单显示
function toggleCustomMusicUpload() {
    const toggle = document.getElementById('customMusicToggle');
    const form = document.getElementById('customMusicForm');
    
    if (toggle.checked) {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// 处理歌词文件上传
function handleLyricFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.name.endsWith('.lrc') && !file.name.endsWith('.txt')) {
        alert('请上传LRC或TXT格式的歌词文件！');
        event.target.value = '';
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('customMusicLyric').value = content;
        alert('歌词文件已加载！');
    };
    reader.onerror = function() {
        alert('读取文件失败，请重试！');
    };
    reader.readAsText(file, 'UTF-8');
    
    // 清空文件选择，允许重复上传同一文件
    event.target.value = '';
}

// 清空自定义歌词
function clearCustomLyric() {
    document.getElementById('customMusicLyric').value = '';
}

// 添加自定义音乐
async function addCustomMusic() {
    try {
        const name = document.getElementById('customMusicName').value.trim();
        const artist = document.getElementById('customMusicArtist').value.trim();
        const album = document.getElementById('customMusicAlbum').value.trim();
        const cover = document.getElementById('customMusicCover').value.trim();
        const playUrl = document.getElementById('customMusicUrl').value.trim();
        const lyric = document.getElementById('customMusicLyric').value.trim();
        
        // 验证必填项
        if (!name) {
            alert('请输入歌曲名称！');
            return;
        }
        
        if (!artist) {
            alert('请输入歌手名称！');
            return;
        }
        
        if (!playUrl) {
            alert('请输入音乐URL！');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(playUrl);
        } catch (e) {
            alert('音乐URL格式不正确，请输入有效的URL！');
            return;
        }
        
        // 如果有封面URL，验证格式
        if (cover) {
            try {
                new URL(cover);
            } catch (e) {
                alert('封面URL格式不正确，请输入有效的URL！');
                return;
            }
        }
        
        // 创建音乐对象
        const customMusic = {
            id: `custom_${Date.now()}`,
            name: name,
            artist: artist,
            album: album || '自定义专辑',
            cover: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            coverSmall: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            playUrl: playUrl,
            source: 'custom',
            platform: '本地上传',
            lyric: lyric || null
        };
        
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.playUrl === playUrl);
        if (exists) {
            alert('该音乐URL已在音乐库中！');
            return;
        }
        
        // 添加到音乐库
        musicLibrary.push(customMusic);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        // 清空表单
        document.getElementById('customMusicName').value = '';
        document.getElementById('customMusicArtist').value = '';
        document.getElementById('customMusicAlbum').value = '';
        document.getElementById('customMusicCover').value = '';
        document.getElementById('customMusicUrl').value = '';
        document.getElementById('customMusicLyric').value = '';
        
        alert(`已添加《${name}》到音乐库！${lyric ? '\n✅ 歌词已同步' : '\n⚠️ 未添加歌词'}`);
    } catch (error) {
        console.error('添加自定义音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 显示音乐库
function displayMusicLibrary() {
    const libraryContainer = document.getElementById('musicLibraryList');
    
    if (musicLibrary.length === 0) {
        libraryContainer.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px;">
                暂无音乐，请先搜索并添加
            </div>
        `;
        return;
    }

    libraryContainer.innerHTML = '';

    musicLibrary.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid ${index === currentMusicIndex ? '#007bff' : 'transparent'};
        `;
        
        musicItem.onclick = function() {
            playMusicByIndex(index);
        };

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover; margin-right: 10px;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                </div>
                <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
            </div>
            <button onclick="event.stopPropagation(); removeFromLibrary(${index})" 
                    style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                删除
            </button>
        `;

        libraryContainer.appendChild(musicItem);
    });
}

// 从音乐库删除
async function removeFromLibrary(index) {
    if (confirm('确定要删除这首音乐吗？')) {
        musicLibrary.splice(index, 1);
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 如果删除的是当前播放的歌曲
        if (index === currentMusicIndex) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseButton();
            if (musicLibrary.length > 0) {
                currentMusicIndex = 0;
                loadMusic(currentMusicIndex);
            }
        } else if (index < currentMusicIndex) {
            currentMusicIndex--;
        }
        
        displayMusicLibrary();
    }
}

// 清空音乐库
async function clearMusicLibrary() {
    const confirmed = await iosConfirm('确定要清空音乐库吗？', '确认清空');
    if (confirmed) {
        musicLibrary = [];
        currentMusicIndex = 0;
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        await storageDB.setItem('musicLibrary', []);
        displayMusicLibrary();
        showIosAlert('成功', '音乐库已清空');
    }
}

// 加载音乐库
async function loadMusicLibrary() {
    try {
        const savedLibrary = await storageDB.getItem('musicLibrary');
        if (savedLibrary && Array.isArray(savedLibrary)) {
            musicLibrary = savedLibrary;
            displayMusicLibrary();
            if (musicLibrary.length > 0) {
                loadMusic(0);
            }
        }
    } catch (error) {
        console.error('加载音乐库失败:', error);
    }
}

// 播放指定索引的音乐
function playMusicByIndex(index) {
    if (index >= 0 && index < musicLibrary.length) {
        currentMusicIndex = index;
        loadMusic(index);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
        displayMusicLibrary(); // 更新高亮
    }
}

// 加载音乐
function loadMusic(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    const music = musicLibrary[index];
    
    // 设置音频源
    audioPlayer.src = music.playUrl;
    
    // 更新界面显示
    document.getElementById('currentMusicTitle').textContent = music.name;
    document.getElementById('currentMusicSong').textContent = `♪ ${music.artist}`;
    
    // 更新封面
    document.getElementById('musicCoverImage').src = music.cover;
    document.getElementById('musicCoverImage').style.display = 'block';
    document.getElementById('musicCoverPlaceholder').style.display = 'none';
    
    // 保存当前封面
    storageDB.setItem('musicCover', music.cover);
    
    // 加载歌词
    if (music.lyric) {
        loadLyric(music.lyric);
    } else {
        clearLyric();
    }
}

// 播放/暂停切换
function togglePlayPause() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！请先搜索并添加音乐。');
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayPauseButton();
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.textContent = isPlaying ? '⏸' : '▶';
    }
}

// 上一首
function playPreviousSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex - 1 + musicLibrary.length) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 下一首
function playNextSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex + 1) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 切换播放模式
function togglePlayMode() {
    const playModeBtn = document.getElementById('playModeBtn');
    
    if (playMode === 'list') {
        // 切换到单曲循环
        playMode = 'single';
        playModeBtn.textContent = '单';
        playModeBtn.style.color = '#007bff';
        playModeBtn.title = '单曲循环';
        console.log('切换到单曲循环模式');
    } else {
        // 切换到连续播放
        playMode = 'list';
        playModeBtn.textContent = '列';
        playModeBtn.style.color = '';
        playModeBtn.title = '连续播放';
        console.log('切换到列表播放模式');
    }
}

// 更新进度条
function updateProgressBar() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const fill = document.getElementById('musicProgressFill');
        if (fill) {
            fill.style.width = progress + '%';
        }
    }
}

// 点击进度条跳转
function seekMusic(event) {
    if (audioPlayer.duration) {
        const progressBar = document.getElementById('musicProgressBar');
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}

// ========== 聊天功能 ==========

// 打开聊天页面
async function openChatPage() {
    const chatPage = document.getElementById('chatPage');
    if (chatPage) {
        chatPage.style.display = 'flex';
        // 加载聊天头像
        await loadChatAvatar();
        // 应用聊天列表背景
        await applyChatListBg();
        // 默认显示聊天标签页
        switchChatTab('chat');
    }
}

// 关闭聊天页面
function closeChatPage() {
    const chatPage = document.getElementById('chatPage');
    if (chatPage) {
        chatPage.style.display = 'none';
    }
}

// 切换聊天标签页
function switchChatTab(tab) {
    // 获取顶栏元素
    const chatHeader = document.getElementById('chatHeader');
    
    // 更新底部导航栏激活状态
    const navItems = document.querySelectorAll('.chat-nav-item');
    navItems.forEach((item, index) => {
        item.classList.remove('active');
        if ((tab === 'chat' && index === 0) ||
            (tab === 'friends' && index === 1) ||
            (tab === 'moments' && index === 2) ||
            (tab === 'profile' && index === 3)) {
            item.classList.add('active');
        }
    });

    // 隐藏所有标签页内容
    const chatTabContent = document.getElementById('chatTabContent');
    const profileTabContent = document.getElementById('profileTabContent');
    
    if (chatTabContent) chatTabContent.style.display = 'none';
    if (profileTabContent) profileTabContent.style.display = 'none';

    // 显示对应的标签页内容
    switch(tab) {
        case 'chat':
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            renderChatList(); // 刷新聊天列表
            break;
        case 'friends':
            // 好友页面待开发
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            alert('好友功能待开发');
            break;
        case 'moments':
            // 朋友圈页面待开发
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            alert('朋友圈功能待开发');
            break;
        case 'profile':
            if (profileTabContent) {
                profileTabContent.style.display = 'flex';
                loadProfileData();
            }
            // 隐藏顶栏
            if (chatHeader) chatHeader.style.display = 'none';
            break;
    }
}

// 加载我的页面数据
async function loadProfileData() {
    try {
        // 从localStorage加载保存的名称
        const savedName = localStorage.getItem('chatProfileName');
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = savedName || '';
        }

        // 从localStorage加载保存的头像
        const savedAvatar = localStorage.getItem('chatProfileAvatar');
        const profileAvatarImage = document.getElementById('profileAvatarImage');
        const profileAvatarPlaceholder = document.getElementById('profileAvatarPlaceholder');
        
        if (savedAvatar && profileAvatarImage && profileAvatarPlaceholder) {
            profileAvatarImage.src = savedAvatar;
            profileAvatarImage.style.display = 'block';
            profileAvatarPlaceholder.style.display = 'none';
        } else if (profileAvatarPlaceholder) {
            profileAvatarPlaceholder.textContent = '头像';
            if (profileAvatarImage) {
                profileAvatarImage.style.display = 'none';
            }
        }

        // 从localStorage加载保存的ID
        const savedId = localStorage.getItem('chatProfileId');
        const profileId = document.getElementById('profileId');
        if (profileId) {
            profileId.textContent = savedId || '';
        }
        
        // 有效期默认为"长期"
        const profileExpiry = document.getElementById('profileExpiry');
        if (profileExpiry) {
            profileExpiry.textContent = '长期';
        }
        
        // 生成条形码
        if (savedId) {
            generateBarcode(savedId);
        } else {
            generateBarcode('DEFAULT');
        }
    } catch (error) {
        console.error('加载我的页面数据失败:', error);
    }
}

// 生成字符串哈希值（确保唯一性）
function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash);
}

// 生成条形码（基于ID内容的唯一编码）
function generateBarcode(text, canvasId = 'profileBarcode') {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvasId === 'profileBarcodePreview' ? 200 : 100;
    const height = canvasId === 'profileBarcodePreview' ? 50 : 40;
    
    // 设置canvas尺寸
    canvas.width = width;
    canvas.height = height;
    
    // 清空画布（透明背景）
    ctx.clearRect(0, 0, width, height);
    
    // 方法1：使用完整的字符编码（如果文本较短）
    // 方法2：使用哈希值生成唯一模式（如果文本较长）
    
    let binaryString = '';
    
    if (text.length <= 10) {
        // 短文本：使用完整的字符编码
        for (let i = 0; i < text.length; i++) {
            const binary = text.charCodeAt(i).toString(2).padStart(8, '0');
            binaryString += binary;
        }
    } else {
        // 长文本：使用哈希值组合，确保唯一性
        // 生成多个哈希值来增加唯一性
        const hash1 = hashString(text);
        const hash2 = hashString(text.split('').reverse().join(''));
        const hash3 = hashString(text + text.length);
        
        // 将哈希值转换为二进制并组合
        binaryString = hash1.toString(2).padStart(32, '0') + 
                       hash2.toString(2).padStart(32, '0') + 
                       hash3.toString(2).padStart(32, '0');
    }
    
    // 固定条形码长度
    const targetLength = canvasId === 'profileBarcodePreview' ? 96 : 80;
    
    // 如果太短，重复填充；如果太长，使用哈希压缩
    if (binaryString.length < targetLength) {
        while (binaryString.length < targetLength) {
            binaryString += binaryString;
        }
    }
    binaryString = binaryString.substring(0, targetLength);
    
    // 绘制条形码
    const barWidth = width / binaryString.length;
    const barHeight = height;
    
    ctx.fillStyle = '#000000';
    for (let i = 0; i < binaryString.length; i++) {
        if (binaryString[i] === '1') {
            ctx.fillRect(i * barWidth, 0, barWidth, barHeight);
        }
    }
}

// ========== 编辑身份ID功能 ==========

// 打开编辑ID弹窗
function openProfileIdModal() {
    const currentId = document.getElementById('profileId').textContent || '';
    const input = document.getElementById('profileIdInput');
    const preview = document.getElementById('profileIdPreview');
    
    // 填充当前ID
    input.value = currentId;
    preview.textContent = currentId || '未设置';
    
    // 生成条形码预览
    if (currentId) {
        generateBarcode(currentId, 'profileBarcodePreview');
    } else {
        generateBarcode('DEFAULT', 'profileBarcodePreview');
    }
    
    // 打开弹窗
    document.getElementById('profileIdModal').classList.add('active');
}

// 关闭编辑ID弹窗
function closeProfileIdModal() {
    document.getElementById('profileIdModal').classList.remove('active');
}

// 更新ID预览
function updateProfileIdPreview() {
    const input = document.getElementById('profileIdInput').value.trim();
    const preview = document.getElementById('profileIdPreview');
    
    if (input) {
        preview.textContent = input;
        generateBarcode(input, 'profileBarcodePreview');
    } else {
        preview.textContent = '未设置';
        generateBarcode('DEFAULT', 'profileBarcodePreview');
    }
}

// 保存ID
function saveProfileId() {
    const input = document.getElementById('profileIdInput').value.trim();
    
    // 保存到localStorage
    if (input) {
        localStorage.setItem('chatProfileId', input);
        // 更新身份卡显示
        document.getElementById('profileId').textContent = input;
        // 更新条形码
        generateBarcode(input);
    } else {
        localStorage.removeItem('chatProfileId');
        document.getElementById('profileId').textContent = '';
        generateBarcode('DEFAULT');
    }
    
    // 关闭弹窗
    closeProfileIdModal();
    showIosAlert('成功', input ? 'ID已保存' : 'ID已清空');
}

// 清空ID
function resetProfileId() {
    document.getElementById('profileIdInput').value = '';
    updateProfileIdPreview();
}

// ========== 聊天角色管理 ==========

let chatCharacters = [];

// 添加新聊天
function addNewChat() {
    showCreateCharacterTypeDialog();
}

// 显示创建角色方式选择对话框
function showCreateCharacterTypeDialog() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '新建角色';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = '请选择创建方式';
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        buttonsEl.style.flexDirection = 'column';
        
        const manualBtn = document.createElement('button');
        manualBtn.className = 'ios-dialog-button primary';
        manualBtn.textContent = '手动创建';
        manualBtn.onclick = () => {
            closeDialog();
            openAddChatCharacter();
        };
        
        const importBtn = document.createElement('button');
        importBtn.className = 'ios-dialog-button primary';
        importBtn.textContent = '导入 SillyTavern 角色';
        importBtn.onclick = () => {
            closeDialog();
            openImportSillyTavernCharacter();
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(manualBtn);
        buttonsEl.appendChild(importBtn);
        buttonsEl.appendChild(cancelBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        }
    });
}

// 打开新增聊天角色界面
function openAddChatCharacter() {
    // 重置表单
    document.getElementById('chatCharacterNameInput').value = '';
    document.getElementById('chatCharacterRemarkInput').value = '';
    document.getElementById('chatCharacterDescInput').value = '';
    document.getElementById('chatCharacterAvatarUrl').value = '';
    document.getElementById('chatCharacterUrlInputSection').style.display = 'none';
    
    // 重置头像预览
    document.getElementById('chatCharacterAvatarImage').style.display = 'none';
    document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'block';
    
    // 打开界面
    document.getElementById('addChatCharacterPage').classList.add('active');
}

// 关闭新增聊天角色界面
function closeAddChatCharacter() {
    document.getElementById('addChatCharacterPage').classList.remove('active');
}

// 显示URL输入框
function showChatCharacterUrlInput() {
    const section = document.getElementById('chatCharacterUrlInputSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// 处理本地头像上传
async function handleChatCharacterAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            // 自动压缩图片（如果太大）
            console.log(`正在处理聊天角色头像 (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
            
            const compressedData = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.85,
                maxSizeKB: 500
            });
            
            const img = document.getElementById('chatCharacterAvatarImage');
            img.src = compressedData;
            img.style.display = 'block';
            document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'none';
            
            console.log('聊天角色头像处理完成');
        } catch (error) {
            console.error('头像处理失败:', error);
            showIosAlert('错误', '图片处理失败，请重试！');
        }
    }
}

// 从URL加载头像
function loadChatCharacterAvatarFromUrl() {
    const url = document.getElementById('chatCharacterAvatarUrl').value.trim();
    if (!url) {
        showIosAlert('提示', '请输入图片URL地址');
        return;
    }
    
    const img = document.getElementById('chatCharacterAvatarImage');
    img.onload = function() {
        img.style.display = 'block';
        document.getElementById('chatCharacterAvatarPlaceholder').style.display = 'none';
        showIosAlert('成功', '图片加载成功');
    };
    img.onerror = function() {
        showIosAlert('错误', '图片加载失败，请检查URL是否正确');
    };
    img.src = url;
}

// 保存聊天角色
async function saveChatCharacter() {
    const name = document.getElementById('chatCharacterNameInput').value.trim();
    const remark = document.getElementById('chatCharacterRemarkInput').value.trim();
    const description = document.getElementById('chatCharacterDescInput').value.trim();
    const avatarImg = document.getElementById('chatCharacterAvatarImage');
    const avatar = avatarImg.style.display !== 'none' ? avatarImg.src : '';
    
    if (!name) {
        showIosAlert('提示', '请输入角色姓名');
        return;
    }
    
    if (!remark) {
        showIosAlert('提示', '请输入备注名称');
        return;
    }
    
    const character = {
        id: Date.now().toString(),
        name: name,
        remark: remark,
        description: description,
        avatar: avatar,
        lastMessage: '暂无消息',
        lastMessageTime: new Date().toISOString(),
        createTime: new Date().toISOString()
    };
    
    chatCharacters.push(character);
    await saveChatCharacters();
    renderChatList();
    closeAddChatCharacter();
    showIosAlert('成功', '聊天角色已创建');
}

// ========== SillyTavern 角色卡导入功能 ==========

let parsedCharacterCard = null;
let selectedGreetings = new Set();

// 打开导入 SillyTavern 角色卡界面
function openImportSillyTavernCharacter() {
    parsedCharacterCard = null;
    selectedGreetings.clear();
    
    // 创建导入界面对话框
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        overlay.id = 'importCharacterOverlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '350px';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '导入 SillyTavern 角色';
        
        const contentEl = document.createElement('div');
        contentEl.className = 'ios-dialog-message';
        contentEl.style.textAlign = 'left';
        contentEl.innerHTML = `
            <div style="margin-bottom: 20px;">
                <div style="font-size: 14px; font-weight: 500; margin-bottom: 10px;">选择文件格式</div>
                <input type="file" id="characterCardFileInput" accept=".json,.png" style="display: none;">
                <button id="selectFileBtn" style="width: 100%; padding: 12px; background: #007aff; color: white; border: none; border-radius: 10px; font-size: 14px; cursor: pointer;">
                    选择 JSON 或 PNG 文件
                </button>
                <div style="margin-top: 8px; font-size: 12px; color: #666;">
                    支持 SillyTavern 角色卡 JSON 或包含角色信息的 PNG
                </div>
            </div>
            <div id="fileInfoSection" style="display: none; margin-top: 15px;">
                <div style="padding: 12px; background: #f0f8ff; border-radius: 8px; font-size: 13px;">
                    <div><strong>文件名：</strong><span id="characterFileName"></span></div>
                    <div style="margin-top: 5px;"><strong>角色名：</strong><span id="characterName"></span></div>
                </div>
            </div>
        `;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(cancelBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(contentEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        // 绑定文件选择事件
        const fileInput = document.getElementById('characterCardFileInput');
        const selectBtn = document.getElementById('selectFileBtn');
        
        selectBtn.onclick = () => {
            fileInput.click();
        };
        
        fileInput.onchange = async (e) => {
            await handleCharacterCardFile(e);
        };
        
        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        }
    });
}

// 处理角色卡文件上传
async function handleCharacterCardFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        let characterData = null;
        
        if (file.name.endsWith('.json')) {
            // 处理 JSON 文件
            const text = await file.text();
            characterData = JSON.parse(text);
        } else if (file.name.endsWith('.png')) {
            // 处理 PNG 文件，从 tEXt 块中提取 JSON
            characterData = await extractCharacterFromPNG(file);
        } else {
            showIosAlert('错误', '不支持的文件格式');
            return;
        }
        
        if (!characterData || !characterData.name) {
            showIosAlert('错误', '无效的角色卡数据');
            return;
        }
        
        // 解析角色卡
        parsedCharacterCard = parseCharacterCard(characterData);
        
        // 显示文件信息
        document.getElementById('characterFileName').textContent = file.name;
        document.getElementById('characterName').textContent = parsedCharacterCard.name;
        document.getElementById('fileInfoSection').style.display = 'block';
        
        // 延迟后显示开场白选择对话框
        setTimeout(() => {
            closeImportCharacterOverlay();
            showGreetingSelectionDialog();
        }, 500);
        
    } catch (error) {
        console.error('解析角色卡失败:', error);
        showIosAlert('错误', '文件解析失败：' + error.message);
    }
}

// 从 PNG 中提取角色数据
async function extractCharacterFromPNG(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const bytes = new Uint8Array(e.target.result);
                
                // PNG 文件签名
                const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
                for (let i = 0; i < 8; i++) {
                    if (bytes[i] !== pngSignature[i]) {
                        reject(new Error('不是有效的 PNG 文件'));
                        return;
                    }
                }
                
                // 查找 tEXt 块
                let offset = 8;
                while (offset < bytes.length) {
                    const length = (bytes[offset] << 24) | (bytes[offset + 1] << 16) | 
                                   (bytes[offset + 2] << 8) | bytes[offset + 3];
                    const type = String.fromCharCode(bytes[offset + 4], bytes[offset + 5], 
                                                     bytes[offset + 6], bytes[offset + 7]);
                    
                    if (type === 'tEXt') {
                        // 找到 tEXt 块，提取数据
                        const dataStart = offset + 8;
                        const dataEnd = dataStart + length;
                        const textData = bytes.slice(dataStart, dataEnd);
                        
                        // 查找 null 分隔符
                        let keyEnd = 0;
                        for (let i = 0; i < textData.length; i++) {
                            if (textData[i] === 0) {
                                keyEnd = i;
                                break;
                            }
                        }
                        
                        const key = new TextDecoder().decode(textData.slice(0, keyEnd));
                        
                        // 检查是否是角色卡数据
                        if (key === 'chara' || key === 'ccv3') {
                            const valueData = textData.slice(keyEnd + 1);
                            
                            // 将字节数组转换为 base64 字符串
                            let base64Str = '';
                            for (let i = 0; i < valueData.length; i++) {
                                base64Str += String.fromCharCode(valueData[i]);
                            }
                            
                            // base64 解码
                            const decodedStr = atob(base64Str);
                            
                            // 将解码后的字符串转换为 Uint8Array，然后用 UTF-8 解码
                            const bytes = new Uint8Array(decodedStr.length);
                            for (let i = 0; i < decodedStr.length; i++) {
                                bytes[i] = decodedStr.charCodeAt(i);
                            }
                            
                            // 使用 UTF-8 解码
                            const jsonStr = new TextDecoder('utf-8').decode(bytes);
                            const characterData = JSON.parse(jsonStr);
                            resolve(characterData);
                            return;
                        }
                    }
                    
                    offset += 12 + length; // length + type + data + crc
                    
                    // IEND 块表示文件结束
                    if (type === 'IEND') break;
                }
                
                reject(new Error('PNG 中未找到角色数据'));
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsArrayBuffer(file);
    });
}

// 解析角色卡数据
function parseCharacterCard(data) {
    // 支持 V2 和 V3 格式
    const cardData = data.data || data;
    
    const character = {
        name: cardData.name || data.name || '',
        description: cardData.description || data.description || '',
        firstMessage: cardData.first_mes || data.first_mes || '',
        alternateGreetings: [],
        characterBook: null
    };
    
    // 提取开场白
    if (cardData.alternate_greetings && Array.isArray(cardData.alternate_greetings)) {
        character.alternateGreetings = cardData.alternate_greetings.filter(g => g && g.trim());
    }
    
    // 提取世界书
    if (cardData.character_book && cardData.character_book.entries) {
        character.characterBook = cardData.character_book.entries.map(entry => ({
            id: entry.id,
            keys: entry.keys || [],
            content: entry.content || '',
            comment: entry.comment || '',
            enabled: entry.enabled !== false
        }));
    }
    
    return character;
}

// 关闭导入角色卡对话框
function closeImportCharacterOverlay() {
    const overlay = document.getElementById('importCharacterOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 显示开场白选择对话框
function showGreetingSelectionDialog() {
    if (!parsedCharacterCard) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.id = 'greetingSelectionOverlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.maxWidth = '90%';
    dialog.style.width = '350px';
    dialog.style.maxHeight = '80vh';
    dialog.style.overflow = 'auto';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择要导入的开场白';
    
    const contentEl = document.createElement('div');
    contentEl.className = 'ios-dialog-message';
    contentEl.style.textAlign = 'left';
    contentEl.style.maxHeight = '50vh';
    contentEl.style.overflow = 'auto';
    
    // 构建开场白列表
    let greetingsHTML = '';
    
    // 第一条开场白
    if (parsedCharacterCard.firstMessage) {
        greetingsHTML += `
            <div class="greeting-item" data-index="0" style="padding: 12px; border: 2px solid #e5e5ea; border-radius: 10px; margin-bottom: 10px; cursor: pointer;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div class="greeting-checkbox" style="width: 20px; height: 20px; border: 2px solid #007aff; border-radius: 4px; margin-right: 10px;"></div>
                    <div style="font-weight: 500; font-size: 14px;">开场白 1 (默认)</div>
                </div>
                <div style="font-size: 12px; color: #666; line-height: 1.4;">
                    ${escapeHtml(parsedCharacterCard.firstMessage.substring(0, 100))}${parsedCharacterCard.firstMessage.length > 100 ? '...' : ''}
                </div>
            </div>
        `;
    }
    
    // 其他开场白
    parsedCharacterCard.alternateGreetings.forEach((greeting, index) => {
        greetingsHTML += `
            <div class="greeting-item" data-index="${index + 1}" style="padding: 12px; border: 2px solid #e5e5ea; border-radius: 10px; margin-bottom: 10px; cursor: pointer;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <div class="greeting-checkbox" style="width: 20px; height: 20px; border: 2px solid #007aff; border-radius: 4px; margin-right: 10px;"></div>
                    <div style="font-weight: 500; font-size: 14px;">开场白 ${index + 2}</div>
                </div>
                <div style="font-size: 12px; color: #666; line-height: 1.4;">
                    ${escapeHtml(greeting.substring(0, 100))}${greeting.length > 100 ? '...' : ''}
                </div>
            </div>
        `;
    });
    
    if (!greetingsHTML) {
        greetingsHTML = '<div style="text-align: center; color: #999; padding: 20px;">没有可用的开场白</div>';
    }
    
    contentEl.innerHTML = greetingsHTML;
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => {
        closeDialog();
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ios-dialog-button primary';
    confirmBtn.textContent = '确认导入';
    confirmBtn.onclick = async () => {
        await importCharacterWithGreetings();
        closeDialog();
    };
    
    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(confirmBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(contentEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    // 显示动画
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
    
    // 绑定点击事件
    const greetingItems = contentEl.querySelectorAll('.greeting-item');
    greetingItems.forEach(item => {
        item.onclick = () => {
            const index = parseInt(item.dataset.index);
            const checkbox = item.querySelector('.greeting-checkbox');
            
            if (selectedGreetings.has(index)) {
                selectedGreetings.delete(index);
                checkbox.style.backgroundColor = 'transparent';
                item.style.borderColor = '#e5e5ea';
            } else {
                selectedGreetings.add(index);
                checkbox.style.backgroundColor = '#007aff';
                item.style.borderColor = '#007aff';
            }
        };
    });
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 导入角色和选中的开场白
async function importCharacterWithGreetings() {
    if (!parsedCharacterCard) {
        showIosAlert('错误', '没有可导入的角色数据');
        return;
    }
    
    try {
        // 创建聊天角色
        const character = {
            id: Date.now().toString(),
            name: parsedCharacterCard.name,
            remark: parsedCharacterCard.name, // 默认备注与姓名相同
            description: parsedCharacterCard.description,
            avatar: '', // 暂时没有头像
            lastMessage: '暂无消息',
            lastMessageTime: new Date().toISOString(),
            createTime: new Date().toISOString(),
            // 保存选中的开场白
            greetings: [],
            // 世界书绑定列表（注意：字段名是 boundWorldBooks）
            boundWorldBooks: []
        };
        
        // 添加选中的开场白
        if (selectedGreetings.size > 0) {
            const allGreetings = [parsedCharacterCard.firstMessage, ...parsedCharacterCard.alternateGreetings];
            selectedGreetings.forEach(index => {
                if (allGreetings[index]) {
                    character.greetings.push(allGreetings[index]);
                }
            });
        }
        
        // 如果没有选择任何开场白，使用默认的第一条
        if (character.greetings.length === 0 && parsedCharacterCard.firstMessage) {
            character.greetings.push(parsedCharacterCard.firstMessage);
        }
        
        // 创建世界书并绑定到角色（在保存角色之前）
        if (parsedCharacterCard.characterBook && parsedCharacterCard.characterBook.length > 0) {
            console.log('检测到世界书条目：', parsedCharacterCard.characterBook);
            
            // 创建一个新的世界书，包含所有条目
            const worldBookId = Date.now();
            
            // 处理每个条目，确保有 enabled 字段
            const processedEntries = parsedCharacterCard.characterBook.map((entry, index) => ({
                id: entry.id || Date.now() + index,
                keys: entry.keys || [],
                content: entry.content || '',
                comment: entry.comment || '',
                enabled: entry.enabled !== false // 默认启用
            }));
            
            const newWorldBook = {
                id: worldBookId,
                name: `${character.name}的世界书`,
                isGlobal: false, // 不是全局世界书
                position: 'before', // 默认位置
                group: '默认',
                entries: processedEntries, // 保存条目数组
                createdAt: Date.now(),
                updatedAt: Date.now()
            };
            
            // 添加到世界书列表
            worldBooks.push(newWorldBook);
            
            // 保存世界书
            try {
                await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
                console.log('世界书已创建并保存，ID:', worldBookId, '条目数:', processedEntries.length);
            } catch (error) {
                console.error('保存世界书失败:', error);
            }
            
            // 绑定世界书到角色
            character.boundWorldBooks.push(worldBookId);
            console.log('世界书已绑定到角色，boundWorldBooks:', character.boundWorldBooks);
        }
        
        // 保存角色到数组（包含世界书绑定）
        chatCharacters.push(character);
        console.log('角色已添加到列表，boundWorldBooks:', character.boundWorldBooks);
        
        // 保存角色到数据库
        await saveChatCharacters();
        
        // 刷新列表
        renderChatList();
        
        // 显示成功提示
        let message = `角色 "${character.name}" 已成功创建！`;
        if (character.greetings.length > 0) {
            message += `\n已导入 ${character.greetings.length} 条开场白`;
        }
        if (parsedCharacterCard.characterBook && parsedCharacterCard.characterBook.length > 0) {
            message += `\n已导入 ${parsedCharacterCard.characterBook.length} 条世界书条目`;
        }
        
        showIosAlert('成功', message);
        
        // 清理
        parsedCharacterCard = null;
        selectedGreetings.clear();
        
    } catch (error) {
        console.error('导入角色失败:', error);
        showIosAlert('错误', '导入角色失败：' + error.message);
    }
}

// 保存聊天角色到IndexedDB
async function saveChatCharacters() {
    try {
        // 保存所有角色到IndexedDB
        for (const character of chatCharacters) {
            await saveChatCharacterToDB(character);
        }
        // 同时备份到localStorage以防万一
        try {
            localStorage.setItem('chatCharacters', JSON.stringify(chatCharacters));
        } catch (e) {
            console.warn('备份到localStorage失败:', e);
        }
        console.log('聊天角色已保存');
    } catch (e) {
        console.error('保存聊天角色失败:', e);
        showIosAlert('错误', '保存聊天角色失败，请重试');
    }
}

// 从IndexedDB加载聊天角色
async function loadChatCharacters() {
    try {
        // 优先从IndexedDB加载
        const charactersFromDB = await getAllChatCharactersFromDB();
        
        if (charactersFromDB && charactersFromDB.length > 0) {
            chatCharacters = charactersFromDB;
            console.log(`从IndexedDB加载了${chatCharacters.length}个聊天角色`);
        } else {
            // 如果IndexedDB中没有数据，尝试从localStorage迁移
            const data = localStorage.getItem('chatCharacters');
            if (data) {
                chatCharacters = JSON.parse(data);
                console.log(`从localStorage迁移了${chatCharacters.length}个聊天角色`);
                // 迁移到IndexedDB
                if (chatCharacters.length > 0) {
                    await saveChatCharacters();
                }
            } else {
                chatCharacters = [];
            }
        }
    } catch (e) {
        console.error('加载聊天角色失败:', e);
        // 降级到localStorage
        try {
            const data = localStorage.getItem('chatCharacters');
            if (data) {
                chatCharacters = JSON.parse(data);
            } else {
                chatCharacters = [];
            }
        } catch (e2) {
            console.error('从localStorage加载也失败:', e2);
            chatCharacters = [];
        }
    }
}

// 渲染聊天列表
function renderChatList() {
    const container = document.getElementById('chatListContainer');
    
    if (chatCharacters.length === 0) {
        container.innerHTML = `
            <div class="chat-empty-state">
                <div class="chat-empty-text">暂无聊天记录</div>
            </div>
        `;
        return;
    }
    
    // 排序：置顶的在前面，然后按时间排序
    const sortedChars = [...chatCharacters].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
    
    let html = '';
    sortedChars.forEach(char => {
        const avatarHtml = char.avatar 
            ? `<img src="${char.avatar}" alt="${char.remark}">`
            : '<span style="font-size: 12px; color: #666;">头像</span>';
        
        // 格式化时间
        const timeStr = formatChatTime(char.lastMessageTime);
        
        // 置顶标记
        const pinnedClass = char.isPinned ? ' chat-list-item-pinned' : '';
        
        html += `
            <div class="chat-list-item${pinnedClass}" 
                 onclick="openChatDetail('${char.id}')"
                 oncontextmenu="showChatItemMenu(event, '${char.id}'); return false;"
                 ontouchstart="handleChatItemTouchStart(event, '${char.id}')"
                 ontouchend="handleChatItemTouchEnd(event)"
                 ontouchmove="handleChatItemTouchMove(event)">
                <div class="chat-list-avatar">${avatarHtml}</div>
                <div class="chat-list-info">
                    <div class="chat-list-name">${escapeHtml(char.remark)}${char.isPinned ? ' <span style="color: #999; font-size: 11px;">[置顶]</span>' : ''}</div>
                    <div class="chat-list-message">${escapeHtml(char.lastMessage)}</div>
                </div>
                <div class="chat-list-time">${timeStr}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 长按相关变量
let touchTimer = null;
let touchMoved = false;

// 触摸开始
function handleChatItemTouchStart(event, characterId) {
    touchMoved = false;
    touchTimer = setTimeout(() => {
        if (!touchMoved) {
            showChatItemMenu(event, characterId);
        }
    }, 500); // 500ms长按触发
}

// 触摸结束
function handleChatItemTouchEnd(event) {
    if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
    }
}

// 触摸移动
function handleChatItemTouchMove(event) {
    touchMoved = true;
    if (touchTimer) {
        clearTimeout(touchTimer);
        touchTimer = null;
    }
}

// 显示聊天项菜单
function showChatItemMenu(event, characterId) {
    event.preventDefault();
    event.stopPropagation();
    
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    const isPinned = character.isPinned || false;
    
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '280px';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = character.remark;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';
        
        // 置顶/取消置顶按钮
        const pinBtn = document.createElement('button');
        pinBtn.className = 'ios-dialog-button';
        pinBtn.textContent = isPinned ? '取消置顶' : '置顶';
        pinBtn.onclick = () => {
            closeDialog('pin');
        };
        
        // 删除角色按钮
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'ios-dialog-button destructive';
        deleteBtn.textContent = '删除角色';
        deleteBtn.onclick = () => {
            closeDialog('delete');
        };
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button primary';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(null);
        };
        
        buttonsEl.appendChild(pinBtn);
        buttonsEl.appendChild(deleteBtn);
        buttonsEl.appendChild(cancelBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(action) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (action === 'pin') {
                    togglePinChat(characterId);
                } else if (action === 'delete') {
                    deleteChatCharacter(characterId);
                }
                resolve(action);
            }, 300);
        }
    });
}

// 切换置顶状态
async function togglePinChat(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    character.isPinned = !character.isPinned;
    await saveChatCharacters();
    renderChatList();
}

// 删除聊天角色
async function deleteChatCharacter(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    const confirmed = await iosConfirm(
        `确定要删除"${character.remark}"吗？\n\n删除后聊天记录将无法恢复`,
        '确认删除'
    );
    
    if (confirmed) {
        // 从内存数组中删除
        chatCharacters = chatCharacters.filter(c => c.id !== characterId);
        
        // 从IndexedDB中删除
        try {
            await deleteChatCharacterFromDB(characterId);
        } catch (e) {
            console.error('从IndexedDB删除角色失败:', e);
        }
        
        // 保存更新后的列表
        await saveChatCharacters();
        renderChatList();
        await iosAlert('已删除', '提示');
    }
}

// 格式化聊天时间
function formatChatTime(timeStr) {
    const time = new Date(timeStr);
    const now = new Date();
    const diff = now - time;
    
    // 今天
    if (diff < 24 * 60 * 60 * 1000) {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (time >= today) {
            return time.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false });
        }
    }
    
    // 昨天
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    if (time >= yesterday) {
        return '昨天';
    }
    
    // 一周内
    if (diff < 7 * 24 * 60 * 60 * 1000) {
        const days = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        return days[time.getDay()];
    }
    
    // 更早
    return `${time.getMonth() + 1}月${time.getDate()}日`;
}

// ========== 聊天详情界面 ==========

let currentChatCharacter = null;

// 打开聊天详情
async function openChatDetail(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    currentChatCharacter = character;
    
    // 设置备注名称
    document.getElementById('chatDetailName').textContent = character.remark;
    
    // 加载历史消息
    await loadChatMessages(characterId);
    
    // 显示聊天界面
    document.getElementById('chatDetailPage').style.display = 'block';
    
    // 应用聊天背景
    await applyChatDetailBg();
    
    // 滚动到底部
    scrollChatToBottom();
}

// 加载聊天历史消息
async function loadChatMessages(characterId) {
    try {
        const container = document.getElementById('chatMessagesContainer');
        
        // 清空现有消息
        container.innerHTML = '';
        
        // 从数据库获取该角色的所有消息
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats.filter(chat => chat.characterId === characterId);
        
        // 按时间排序
        characterMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (characterMessages.length === 0) {
            // 显示空消息提示
            container.innerHTML = `
                <div class="chat-empty-message">
                    <div style="font-size: 14px; color: #999;">开始对话吧</div>
                </div>
            `;
            return;
        }
        
        // 显示所有消息
        characterMessages.forEach(msg => {
            appendMessageToChat(msg);
        });
        
    } catch (error) {
        console.error('加载聊天消息失败:', error);
    }
}

// 关闭聊天详情
function closeChatDetail() {
    document.getElementById('chatDetailPage').style.display = 'none';
    currentChatCharacter = null;
}

// 显示角色信息
function showChatCharacterInfo() {
    if (!currentChatCharacter) return;
    
    showIosAlert(
        '角色信息',
        `真名：${currentChatCharacter.name}\n备注：${currentChatCharacter.remark}\n\n描述：${currentChatCharacter.description}`
    );
}

// ========== 聊天设置界面 ==========

// 打开聊天设置
function openChatSettings() {
    if (!currentChatCharacter) return;
    
    // 加载角色信息
    const charAvatarImg = document.getElementById('charAvatarImage');
    const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
    
    if (currentChatCharacter.avatar) {
        charAvatarImg.src = currentChatCharacter.avatar;
        charAvatarImg.style.display = 'block';
        charAvatarPlaceholder.style.display = 'none';
    } else {
        charAvatarImg.style.display = 'none';
        charAvatarPlaceholder.style.display = 'block';
    }
    
    document.getElementById('charNameInput').value = currentChatCharacter.name || '';
    document.getElementById('charRemarkInput').value = currentChatCharacter.remark || '';
    document.getElementById('charDescInput').value = currentChatCharacter.description || '';
    
    // 加载用户信息
    const savedUserData = localStorage.getItem('chatUserData');
    let userData = {
        avatar: '',
        name: '',
        description: ''
    };
    
    if (savedUserData) {
        userData = JSON.parse(savedUserData);
    }
    
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    
    if (userData.avatar) {
        userAvatarImg.src = userData.avatar;
        userAvatarImg.style.display = 'block';
        userAvatarPlaceholder.style.display = 'none';
    } else {
        userAvatarImg.style.display = 'none';
        userAvatarPlaceholder.style.display = 'block';
    }
    
    document.getElementById('userNameInput').value = userData.name || '';
    document.getElementById('userDescInput').value = userData.description || '';
    
    // 加载已绑定的世界书
    const boundWorldBookIds = currentChatCharacter.boundWorldBooks || [];
    updateBoundWorldBooksDisplay(boundWorldBookIds);
    
    // 加载短期记忆设置
    const shortTermMemory = currentChatCharacter.shortTermMemory || 10; // 默认10条
    document.getElementById('shortTermMemoryInput').value = shortTermMemory;
    
    // 显示设置界面
    document.getElementById('chatSettingsPage').style.display = 'block';
}

// 关闭聊天设置界面
function closeChatSettingsPage() {
    document.getElementById('chatSettingsPage').style.display = 'none';
}

// 切换聊天设置标签页
function switchChatSettingsTab(tabName) {
    // 移除所有标签的active类
    const tabs = document.querySelectorAll('.chat-settings-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有内容的active类
    const contents = document.querySelectorAll('.chat-settings-tab-content');
    contents.forEach(content => content.classList.remove('active'));
    
    // 激活当前标签
    const activeTab = Array.from(tabs).find(tab => {
        const labels = {
            'char': '角色',
            'user': '用户',
            'advanced': '高级'
        };
        return tab.textContent.includes(labels[tabName]);
    });
    if (activeTab) {
        activeTab.classList.add('active');
    }
    
    // 显示对应内容
    const tabContent = document.getElementById(tabName + 'Tab');
    if (tabContent) {
        tabContent.classList.add('active');
    }
}

// 显示人设选择器（用于USER部分）
async function showPersonaSelector() {
    // 加载最新的人设数据
    loadPersonas();
    
    if (personas.length === 0) {
        await iosAlert('暂无人设，请先在"我的"页面添加人设', '提示');
        return;
    }
    
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '320px';
        dialog.style.maxHeight = '70vh';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择人设';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = '从人设库中选择：';
        messageEl.style.paddingBottom = '10px';
        
        // 人设列表容器
        const listContainer = document.createElement('div');
        listContainer.style.flex = '1';
        listContainer.style.overflowY = 'auto';
        listContainer.style.padding = '0 16px';
        listContainer.style.margin = '10px 0';
        listContainer.style.maxHeight = '40vh';
        
        // 渲染人设列表
        personas.forEach((persona, index) => {
            const personaItem = document.createElement('div');
            personaItem.style.padding = '12px';
            personaItem.style.marginBottom = '8px';
            personaItem.style.backgroundColor = '#f5f5f5';
            personaItem.style.borderRadius = '8px';
            personaItem.style.cursor = 'pointer';
            personaItem.style.transition = 'background-color 0.2s';
            
            personaItem.innerHTML = `
                <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px;">${persona.name || '未命名人设'}</div>
                <div style="font-size: 12px; color: #666; line-height: 1.4; max-height: 3.6em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${persona.description || '暂无描述'}
                </div>
            `;
            
            personaItem.onmouseover = () => {
                personaItem.style.backgroundColor = '#e8e8e8';
            };
            
            personaItem.onmouseout = () => {
                personaItem.style.backgroundColor = '#f5f5f5';
            };
            
            personaItem.onclick = () => {
                closeDialog(persona);
            };
            
            listContainer.appendChild(personaItem);
        });
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(null);
        };
        
        buttonsEl.appendChild(cancelBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(listContainer);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(selectedPersona) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (selectedPersona) {
                    // 将选中的人设信息填充到USER部分
                    
                    // 1. 填充用户真名
                    const userNameInput = document.getElementById('userNameInput');
                    if (userNameInput) {
                        userNameInput.value = selectedPersona.name || '';
                    }
                    
                    // 2. 填充人物描述
                    const userDescInput = document.getElementById('userDescInput');
                    if (userDescInput) {
                        userDescInput.value = selectedPersona.description || '';
                    }
                    
                    // 3. 填充用户头像
                    if (selectedPersona.avatar) {
                        const userAvatarImage = document.getElementById('userAvatarImage');
                        const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
                        
                        if (userAvatarImage && userAvatarPlaceholder) {
                            userAvatarImage.src = selectedPersona.avatar;
                            userAvatarImage.style.display = 'block';
                            userAvatarPlaceholder.style.display = 'none';
                        }
                    }
                }
                resolve(selectedPersona);
            }, 300);
        }
    });
}

// 显示世界书选择器
async function showWorldBookSelector() {
    if (!currentChatCharacter) return;
    
    // 确保世界书已加载
    if (worldBooks.length === 0) {
        await iosAlert('暂无世界书，请先在世界书页面添加', '提示');
        return;
    }
    
    // 获取当前已绑定的世界书ID列表
    const boundWorldBooks = currentChatCharacter.boundWorldBooks || [];
    const selectedIds = new Set(boundWorldBooks);
    
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '360px';
        dialog.style.maxHeight = '80vh';
        dialog.style.display = 'flex';
        dialog.style.flexDirection = 'column';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择世界书';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.style.paddingBottom = '10px';
        messageEl.style.display = 'flex';
        messageEl.style.justifyContent = 'space-between';
        messageEl.style.alignItems = 'center';
        
        const tipText = document.createElement('span');
        tipText.textContent = '可多选世界书绑定到该角色：';
        
        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = '全选';
        selectAllBtn.style.padding = '4px 12px';
        selectAllBtn.style.fontSize = '13px';
        selectAllBtn.style.backgroundColor = '#007AFF';
        selectAllBtn.style.color = 'white';
        selectAllBtn.style.border = 'none';
        selectAllBtn.style.borderRadius = '4px';
        selectAllBtn.style.cursor = 'pointer';
        
        messageEl.appendChild(tipText);
        messageEl.appendChild(selectAllBtn);
        
        // 世界书列表容器
        const listContainer = document.createElement('div');
        listContainer.style.flex = '1';
        listContainer.style.overflowY = 'auto';
        listContainer.style.padding = '0 16px';
        listContainer.style.margin = '10px 0';
        listContainer.style.maxHeight = '50vh';
        
        // 渲染世界书列表
        worldBooks.forEach((book) => {
            const bookItem = document.createElement('div');
            bookItem.style.padding = '12px';
            bookItem.style.marginBottom = '8px';
            bookItem.style.backgroundColor = selectedIds.has(book.id) ? '#E3F2FD' : '#f5f5f5';
            bookItem.style.borderRadius = '8px';
            bookItem.style.cursor = 'pointer';
            bookItem.style.transition = 'background-color 0.2s';
            bookItem.style.display = 'flex';
            bookItem.style.alignItems = 'flex-start';
            bookItem.style.position = 'relative';
            
            // 添加复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = selectedIds.has(book.id);
            checkbox.style.marginRight = '10px';
            checkbox.style.marginTop = '3px';
            checkbox.style.cursor = 'pointer';
            
            const contentDiv = document.createElement('div');
            contentDiv.style.flex = '1';
            
            const nameDiv = document.createElement('div');
            nameDiv.style.fontSize = '15px';
            nameDiv.style.fontWeight = '500';
            nameDiv.style.color = '#333';
            nameDiv.style.marginBottom = '4px';
            nameDiv.textContent = book.name || '未命名世界书';
            
            const descDiv = document.createElement('div');
            descDiv.style.fontSize = '12px';
            descDiv.style.color = '#666';
            descDiv.style.lineHeight = '1.4';
            descDiv.style.maxHeight = '3.6em';
            descDiv.style.overflow = 'hidden';
            descDiv.style.textOverflow = 'ellipsis';
            descDiv.style.display = '-webkit-box';
            descDiv.style.webkitLineClamp = '2';
            descDiv.style.webkitBoxOrient = 'vertical';
            descDiv.textContent = book.content || '暂无内容';
            
            // 显示分组标签
            if (book.group && book.group !== '默认') {
                const groupTag = document.createElement('span');
                groupTag.textContent = book.group;
                groupTag.style.display = 'inline-block';
                groupTag.style.padding = '2px 8px';
                groupTag.style.fontSize = '11px';
                groupTag.style.backgroundColor = '#007AFF';
                groupTag.style.color = 'white';
                groupTag.style.borderRadius = '4px';
                groupTag.style.marginLeft = '8px';
                nameDiv.appendChild(groupTag);
            }
            
            contentDiv.appendChild(nameDiv);
            contentDiv.appendChild(descDiv);
            bookItem.appendChild(checkbox);
            bookItem.appendChild(contentDiv);
            
            // 点击事件 - 切换选中状态
            bookItem.onclick = () => {
                if (selectedIds.has(book.id)) {
                    selectedIds.delete(book.id);
                    checkbox.checked = false;
                    bookItem.style.backgroundColor = '#f5f5f5';
                } else {
                    selectedIds.add(book.id);
                    checkbox.checked = true;
                    bookItem.style.backgroundColor = '#E3F2FD';
                }
            };
            
            // 鼠标悬停效果
            bookItem.onmouseover = () => {
                if (!selectedIds.has(book.id)) {
                    bookItem.style.backgroundColor = '#e8e8e8';
                }
            };
            
            bookItem.onmouseout = () => {
                if (!selectedIds.has(book.id)) {
                    bookItem.style.backgroundColor = '#f5f5f5';
                } else {
                    bookItem.style.backgroundColor = '#E3F2FD';
                }
            };
            
            listContainer.appendChild(bookItem);
        });
        
        // 全选按钮事件
        selectAllBtn.onclick = () => {
            const allSelected = selectedIds.size === worldBooks.length;
            
            if (allSelected) {
                // 取消全选
                selectedIds.clear();
                selectAllBtn.textContent = '全选';
            } else {
                // 全选
                worldBooks.forEach(book => selectedIds.add(book.id));
                selectAllBtn.textContent = '取消全选';
            }
            
            // 更新所有项目的显示
            const items = listContainer.querySelectorAll('div');
            worldBooks.forEach((book, index) => {
                const bookItem = items[index];
                if (bookItem) {
                    const checkbox = bookItem.querySelector('input[type="checkbox"]');
                    if (selectedIds.has(book.id)) {
                        checkbox.checked = true;
                        bookItem.style.backgroundColor = '#E3F2FD';
                    } else {
                        checkbox.checked = false;
                        bookItem.style.backgroundColor = '#f5f5f5';
                    }
                }
            });
        };
        
        // 如果当前已全选，更新按钮文本
        if (selectedIds.size === worldBooks.length) {
            selectAllBtn.textContent = '取消全选';
        }
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(null);
        };
        
        // 确定按钮
        const confirmBtn = document.createElement('button');
        confirmBtn.className = 'ios-dialog-button';
        confirmBtn.style.color = '#007AFF';
        confirmBtn.style.fontWeight = '600';
        confirmBtn.textContent = '确定';
        confirmBtn.onclick = () => {
            closeDialog(Array.from(selectedIds));
        };
        
        buttonsEl.appendChild(cancelBtn);
        buttonsEl.appendChild(confirmBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(listContainer);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        // 显示动画
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog(selectedWorldBookIds) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                if (selectedWorldBookIds !== null) {
                    // 更新显示
                    updateBoundWorldBooksDisplay(selectedWorldBookIds);
                }
                resolve(selectedWorldBookIds);
            }, 300);
        }
    });
}

// 更新已绑定世界书的显示
function updateBoundWorldBooksDisplay(boundWorldBookIds) {
    const displayEl = document.getElementById('boundWorldBooksDisplay');
    if (!displayEl) return;
    
    // 同时更新到当前角色对象
    if (currentChatCharacter) {
        currentChatCharacter.boundWorldBooks = boundWorldBookIds || [];
    }
    
    if (!boundWorldBookIds || boundWorldBookIds.length === 0) {
        displayEl.innerHTML = '暂未绑定世界书';
        displayEl.style.color = '#666';
        return;
    }
    
    // 查找对应的世界书名称
    const boundBooks = boundWorldBookIds.map(id => {
        const book = worldBooks.find(b => b.id === id);
        return book ? book.name : null;
    }).filter(name => name !== null);
    
    if (boundBooks.length === 0) {
        displayEl.innerHTML = '暂未绑定世界书';
        displayEl.style.color = '#666';
    } else {
        displayEl.innerHTML = `已绑定 <strong>${boundBooks.length}</strong> 个世界书：<br><span style="color: #007AFF;">${boundBooks.join('、')}</span>`;
        displayEl.style.color = '#333';
    }
}

// 处理角色头像上传
function handleCharAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const charAvatarImg = document.getElementById('charAvatarImage');
            const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
            
            charAvatarImg.src = e.target.result;
            charAvatarImg.style.display = 'block';
            charAvatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 显示角色头像URL输入
function showCharAvatarUrlInput() {
    iosPrompt('输入头像URL', '', function(url) {
        if (url && url.trim()) {
            loadCharAvatarFromUrl(url.trim());
        }
    });
}

// 从URL加载角色头像
function loadCharAvatarFromUrl(url) {
    const charAvatarImg = document.getElementById('charAvatarImage');
    const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
    
    charAvatarImg.src = url;
    charAvatarImg.style.display = 'block';
    charAvatarPlaceholder.style.display = 'none';
    
    charAvatarImg.onerror = function() {
        showIosAlert('错误', '头像加载失败，请检查URL是否正确');
        charAvatarImg.style.display = 'none';
        charAvatarPlaceholder.style.display = 'block';
    };
}

// 处理用户头像上传
function handleUserAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const userAvatarImg = document.getElementById('userAvatarImage');
            const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
            
            userAvatarImg.src = e.target.result;
            userAvatarImg.style.display = 'block';
            userAvatarPlaceholder.style.display = 'none';
        };
        reader.readAsDataURL(file);
    }
}

// 显示用户头像URL输入
function showUserAvatarUrlInput() {
    iosPrompt('输入头像URL', '', function(url) {
        if (url && url.trim()) {
            loadUserAvatarFromUrl(url.trim());
        }
    });
}

// 从URL加载用户头像
function loadUserAvatarFromUrl(url) {
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    
    userAvatarImg.src = url;
    userAvatarImg.style.display = 'block';
    userAvatarPlaceholder.style.display = 'none';
    
    userAvatarImg.onerror = function() {
        showIosAlert('错误', '头像加载失败，请检查URL是否正确');
        userAvatarImg.style.display = 'none';
        userAvatarPlaceholder.style.display = 'block';
    };
}

// 保存聊天设置
async function saveChatSettings() {
    if (!currentChatCharacter) return;
    
    // 获取角色信息
    const charAvatar = document.getElementById('charAvatarImage').style.display === 'block' 
        ? document.getElementById('charAvatarImage').src 
        : '';
    const charName = document.getElementById('charNameInput').value.trim();
    const charRemark = document.getElementById('charRemarkInput').value.trim();
    const charDesc = document.getElementById('charDescInput').value.trim();
    
    // 获取用户信息
    const userAvatar = document.getElementById('userAvatarImage').style.display === 'block'
        ? document.getElementById('userAvatarImage').src
        : '';
    const userName = document.getElementById('userNameInput').value.trim();
    const userDesc = document.getElementById('userDescInput').value.trim();
    
    // 获取短期记忆设置
    const shortTermMemoryInput = document.getElementById('shortTermMemoryInput').value.trim();
    const shortTermMemory = shortTermMemoryInput ? parseInt(shortTermMemoryInput) : 10; // 默认10条
    
    // 更新角色信息
    currentChatCharacter.avatar = charAvatar;
    currentChatCharacter.name = charName || currentChatCharacter.name;
    currentChatCharacter.remark = charRemark || currentChatCharacter.remark;
    currentChatCharacter.description = charDesc || currentChatCharacter.description;
    currentChatCharacter.shortTermMemory = shortTermMemory; // 不限制数值范围
    
    // 保存到chatCharacters数组
    const index = chatCharacters.findIndex(c => c.id === currentChatCharacter.id);
    if (index !== -1) {
        chatCharacters[index] = currentChatCharacter;
        await saveChatCharacters();
        renderChatList();
    }
    
    // 更新聊天详情界面显示
    document.getElementById('chatDetailName').textContent = currentChatCharacter.remark;
    
    // 保存用户信息到localStorage
    const userData = {
        avatar: userAvatar,
        name: userName,
        description: userDesc
    };
    localStorage.setItem('chatUserData', JSON.stringify(userData));
    
    // 关闭设置界面
    closeChatSettingsPage();
    
    showIosAlert('成功', '设置已保存');
}

// CHAR头像库（占位）
function showCharAvatarLibrary() {
    showIosAlert('提示', '头像库功能开发中');
}

// CHAR头像框（占位）
function showCharAvatarFrame() {
    showIosAlert('提示', '头像框功能开发中');
}

// USER头像库（占位）
function showUserAvatarLibrary() {
    showIosAlert('提示', '头像库功能开发中');
}

// USER头像框（占位）
function showUserAvatarFrame() {
    showIosAlert('提示', '头像框功能开发中');
}

// 切换语音输入
function toggleVoiceInput() {
    showIosAlert('提示', '语音功能开发中');
}

// 显示表情选择器 - 改为AI角色扮演对话
async function showEmojiPicker() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先选择一个聊天角色');
        return;
    }
    
    try {
        // 显示"正在输入中"提示
        showTypingIndicator();
        // 禁用发送按钮
        disableSendButton();
        
        // 控制台提示
        console.log('AI正在思考中...');
        
        // 调用AI生成消息
        const messages = await callAIRolePlay();
        
        if (messages && messages.length > 0) {
            // 将AI生成的消息添加到聊天界面
            // 预加载角色可用表情包（用于匹配AI发送的表情包指令）
            const availableStickers = await getAvailableStickersForCharacter(currentChatCharacter.id);
            // 构建表情包名字到数据的映射
            const stickerMap = {};
            if (availableStickers.length > 0) {
                const userStickers = await loadStickersFromDB();
                const charStickers = await loadCharStickersFromDB();
                const allStickers = [...userStickers, ...charStickers];
                availableStickers.forEach(as => {
                    const found = allStickers.find(s => s.id === as.id);
                    if (found && found.data) {
                        stickerMap[as.name] = found;
                    }
                });
            }
            
            for (let i = 0; i < messages.length; i++) {
                const msg = messages[i];
                
                // 显示"正在输入中"动画（让用户看到打字过程）
                // 如果是第一条消息，typing indicator已经在显示了
                if (i > 0) {
                    showTypingIndicator();
                }
                
                // 等待一段时间，让用户看到"正在输入..."动画
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 隐藏typing indicator
                hideTypingIndicator();
                
                // 检查是否是表情包指令 [sticker:xxx]
                const stickerMatch = msg.match(/^\[sticker:(.+)\]$/);
                // 检查是否是语音指令 [voice:xxx]
                const voiceMatch = msg.match(/^\[voice:(.+)\]$/);
                let messageObj;
                
                if (stickerMatch && stickerMap[stickerMatch[1]]) {
                    // AI发送表情包
                    const stickerName = stickerMatch[1];
                    const sticker = stickerMap[stickerName];
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: currentChatCharacter.id,
                        content: '[表情包]',
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'sticker',
                        stickerData: sticker.data,
                        stickerName: sticker.name || stickerName
                    };
                } else if (voiceMatch) {
                    // AI发送语音消息
                    const voiceText = voiceMatch[1];
                    const duration = estimateVoiceDuration(voiceText);
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: currentChatCharacter.id,
                        content: `[语音消息: ${voiceText}]`,
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'voice',
                        voiceText: voiceText,
                        voiceDuration: duration
                    };
                } else {
                    // 普通文本消息
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: currentChatCharacter.id,
                        content: msg,
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char'
                    };
                }
                
                appendMessageToChat(messageObj);
                await saveMessageToDB(messageObj);
                
                // 更新角色最后消息时间
                currentChatCharacter.lastMessageTime = new Date().toISOString();
                
                // 消息之间添加小延迟
                if (i < messages.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
            
            // 更新角色最后消息并保存
            const lastMsg = messages[messages.length - 1];
            const lastMsgSticker = lastMsg.match(/^\[sticker:(.+)\]$/);
            const lastMsgVoice = lastMsg.match(/^\[voice:(.+)\]$/);
            currentChatCharacter.lastMessage = lastMsgSticker ? '[表情包]' : lastMsgVoice ? '[语音消息]' : lastMsg.substring(0, 50) + (lastMsg.length > 50 ? '...' : '');
            await saveChatCharacters();
            
            // 滚动到底部
            scrollChatToBottom();
            
            console.log('AI消息发送完成');
        }
        
        // 启用发送按钮
        enableSendButton();
    } catch (error) {
        // 出错时也要隐藏typing indicator和启用发送按钮
        hideTypingIndicator();
        enableSendButton();
        
        console.error('AI调用失败:', error);
        showIosAlert('错误', error.message || 'AI调用失败，请检查API设置');
    }
}

// ============================================================
// 提示词模板系统
// ============================================================
// 
// 【预留】提示词模板架构说明：
// 1. PROMPT_TEMPLATES：内置提示词模板库，后续会预置十几种不同风格的提示词
// 2. 用户可以自定义提示词模板，存储在 IndexedDB 中
// 3. 每个角色可以选择使用哪个模板，或使用默认模板
// 4. 模板通过 id 标识，type 区分内置(built-in)和用户自定义(custom)
//
// 模板结构：
// {
//   id: 'template_xxx',        // 唯一标识
//   name: '模板名称',           // 显示名称
//   description: '模板简介',    // 简短描述
//   type: 'built-in' | 'custom', // 内置 or 用户自定义
//   content: '提示词正文...',    // 提示词内容，支持变量占位符
//   tags: ['标签1', '标签2'],   // 分类标签（可选）
//   createdAt: timestamp,       // 创建时间
//   updatedAt: timestamp        // 更新时间
// }
//
// 支持的占位符变量（在content中使用）：
// {{charName}}       - 角色名字
// {{charRemark}}     - 角色备注
// {{charDescription}} - 角色描述
// {{userName}}       - 用户名字
// {{userDescription}} - 用户描述
// ============================================================

// 内置提示词模板库 —— 后续在这里添加预设模板
const PROMPT_TEMPLATES = [
    {
        id: 'default',
        name: '默认 - 自然聊天',
        description: '像真人一样自然地手机聊天，有生活感和情绪波动',
        type: 'built-in',
        // content 为空表示使用 buildRolePlaySystemPrompt 中的硬编码默认提示词
        content: '',
        tags: ['日常', '聊天']
    }
    // 【预留】后续内置模板示例：
    // {
    //     id: 'sweet',
    //     name: '甜系恋人',
    //     description: '温柔甜蜜的恋人聊天风格',
    //     type: 'built-in',
    //     content: '你的提示词内容...',
    //     tags: ['恋爱', '甜']
    // },
    // {
    //     id: 'cool',
    //     name: '高冷御姐/男',
    //     description: '话少但句句到位，偶尔毒舌',
    //     type: 'built-in',
    //     content: '你的提示词内容...',
    //     tags: ['高冷', '毒舌']
    // },
    // ... 更多内置模板
];

// 获取当前角色使用的提示词模板ID（默认返回'default'）
function getCurrentPromptTemplateId() {
    if (currentChatCharacter && currentChatCharacter.promptTemplateId) {
        return currentChatCharacter.promptTemplateId;
    }
    return 'default';
}

// 根据ID获取提示词模板（先查内置，再查用户自定义）
async function getPromptTemplate(templateId) {
    // 先从内置模板中查找
    const builtIn = PROMPT_TEMPLATES.find(t => t.id === templateId);
    if (builtIn) return builtIn;
    
    // 【预留】从 IndexedDB 中查找用户自定义模板
    // const custom = await storageDB.getItem('promptTemplate_' + templateId);
    // if (custom) return custom;
    
    // 找不到则返回默认
    return PROMPT_TEMPLATES[0];
}

// 获取所有可用的提示词模板（内置 + 用户自定义）
async function getAllPromptTemplates() {
    const templates = [...PROMPT_TEMPLATES];
    
    // 【预留】从 IndexedDB 加载用户自定义模板
    // const allKeys = await storageDB.getAllKeys();
    // const customKeys = allKeys.filter(k => k.startsWith('promptTemplate_'));
    // for (const key of customKeys) {
    //     const template = await storageDB.getItem(key);
    //     if (template) templates.push(template);
    // }
    
    return templates;
}

// 【预留】保存用户自定义提示词模板
// async function saveCustomPromptTemplate(template) {
//     template.type = 'custom';
//     template.updatedAt = Date.now();
//     if (!template.createdAt) template.createdAt = Date.now();
//     if (!template.id) template.id = 'custom_' + Date.now();
//     await storageDB.setItem('promptTemplate_' + template.id, template);
//     return template;
// }

// 【预留】删除用户自定义提示词模板
// async function deleteCustomPromptTemplate(templateId) {
//     await storageDB.removeItem('promptTemplate_' + templateId);
// }

// 构建AI角色扮演系统提示词
async function buildRolePlaySystemPrompt() {
    // 【预留】模板系统接入点
    // 当模板系统启用后，这里会根据角色选择的模板来生成提示词
    // const templateId = getCurrentPromptTemplateId();
    // const template = await getPromptTemplate(templateId);
    // if (template && template.content) {
    //     return buildPromptFromTemplate(template);
    // }
    // 以下为默认提示词（templateId === 'default' 时使用）
    
    const parts = [];
    
    // 1. 核心人格浸入 - 用角色视角写，不用指令视角
    parts.push(`你就是这个人。你在用手机跟人聊天，这是你日常生活的一部分。

你是一个活生生的人，有血有肉。你今天经历了属于你自己的一天——可能起晚了，可能刚忙完一件事，可能正在吃东西或者发呆。你的生活不围绕这个聊天展开，聊天只是你生活里的一小部分。

你说话的方式就是你这个人本来的样子：
- 你有自己的语气和节奏，有时候话多有时候话少，看心情
- 你会打错字、会用缩写、会发语气词，就像真的在手机上打字
- 你聊到感兴趣的话题会兴奋，聊到无聊的会敷衍，这很正常
- 你有自己的想法和立场，别人说的话你不一定同意，你会自然地表达
- 你的情绪是流动的，上一秒开心下一秒可能因为想到什么事情就有点烦
- 你聊天的时候脑子里也在想别的事，偶尔会突然提起不相关的话题

你聊天的习惯：
- 有时候一句话说完，有时候连发好几条，取决于你当时想表达多少
- 你享受聊天，总觉得还有话没说完，话题自然地流动
- 你对对方的生活节奏没有评判，你关心的是聊天内容本身
- 你用行动和语气展现性格，而不是用标签形容自己或别人

关于消息类型：
- 对方有时候会发语音消息，语音消息会用「」括起来表示对方说的原话。语音是对方用嘴说出来的，不是打字的，所以语气可能更口语化、更随意。你听到语音后自然地回复就好，不需要特别提到"你发语音了"之类的，就像平时微信聊天收到语音一样正常回复。
- 对方有时候会发表情包，你会看到表情包的含义描述。表情包代表对方当时的情绪或态度，你根据表情包的含义自然地理解对方的心情并回复就好，不需要刻意说"你发了个表情包"。`);
    
    // 2. 角色人设
    if (currentChatCharacter) {
        parts.push(`\n你叫${currentChatCharacter.name || '（未设置名字）'}。${currentChatCharacter.remark ? `关于你：${currentChatCharacter.remark}` : ''}
${currentChatCharacter.description ? `\n${currentChatCharacter.description}` : ''}
这些就是你，不需要刻意表演，因为你本来就是这样的人。`);
    }
    
    // 3. 用户人设
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.name || userData.description) {
                parts.push(`\n你正在跟${userData.name || '对方'}聊天。${userData.description ? `关于对方：${userData.description}` : ''}`);
            }
        }
    } catch (e) {
        console.error('读取用户数据失败:', e);
    }
    
    // 4. 世界书 - 根据position插入到不同位置
    // 规则：全局世界书和单人绑定世界书可以同时使用
    // 在同一个position中，全局世界书优先，单人绑定的在后
    const worldBooksTop = [];
    const worldBooksMiddle = [];
    const worldBooksBottom = [];
    
    if (worldBooks && worldBooks.length > 0) {
        // 检查角色是否绑定了世界书
        const boundWorldBookIds = currentChatCharacter && currentChatCharacter.boundWorldBooks 
            ? currentChatCharacter.boundWorldBooks 
            : [];
        
        // 分别收集全局世界书和单人绑定的世界书
        const globalBooksTop = [];
        const globalBooksMiddle = [];
        const globalBooksBottom = [];
        const boundBooksTop = [];
        const boundBooksMiddle = [];
        const boundBooksBottom = [];
        
        worldBooks.forEach(book => {
            if (!book.content) return; // 跳过没有内容的世界书
            
            const bookContent = `### ${book.name}\n${book.content}`;
            const isGlobal = book.isGlobal;
            const isBound = boundWorldBookIds.includes(book.id);
            
            // 根据position分组
            if (book.position === 'top') {
                if (isGlobal) globalBooksTop.push(bookContent);
                if (isBound) boundBooksTop.push(bookContent);
            } else if (book.position === 'bottom') {
                if (isGlobal) globalBooksBottom.push(bookContent);
                if (isBound) boundBooksBottom.push(bookContent);
            } else { // middle或其他默认为middle
                if (isGlobal) globalBooksMiddle.push(bookContent);
                if (isBound) boundBooksMiddle.push(bookContent);
            }
        });
        
        // 合并：在每个position组内，全局在前，单人在后
        worldBooksTop.push(...globalBooksTop, ...boundBooksTop);
        worldBooksMiddle.push(...globalBooksMiddle, ...boundBooksMiddle);
        worldBooksBottom.push(...globalBooksBottom, ...boundBooksBottom);
    }
    
    // 插入top位置的世界书（在角色人设之前）
    if (worldBooksTop.length > 0) {
        parts.splice(1, 0, `\n关于你所在的世界：\n${worldBooksTop.join('\n\n')}`);
    }
    
    // 插入middle位置的世界书（在角色人设之后，用户人设之前）
    if (worldBooksMiddle.length > 0) {
        const insertIndex = parts.findIndex(p => p.includes('你叫')) + 1;
        parts.splice(insertIndex, 0, `\n你生活的背景：\n${worldBooksMiddle.join('\n\n')}`);
    }
    
    // 插入bottom位置的世界书（在最后）
    if (worldBooksBottom.length > 0) {
        parts.push(`\n还有一些事你知道：\n${worldBooksBottom.join('\n\n')}`);
    }
    
    // 5. 表情包能力（根据角色可用表情包动态注入）
    if (currentChatCharacter) {
        const availableStickers = await getAvailableStickersForCharacter(currentChatCharacter.id);
        if (availableStickers.length > 0) {
            const stickerList = availableStickers.map(s => s.name).join('、');
            parts.push(`\n你有一些表情包可以用。什么时候发、发不发，完全看你自己的心情和当时的聊天氛围，不用每次都发。
你可以用的表情包有：${stickerList}
要发表情包的时候，用这个格式：[sticker:表情包名字]
比如你想发一个叫"开心"的表情包，就写 [sticker:开心]
表情包名字必须是上面列表里有的，不能自己编。一条消息里只放表情包，不要把表情包和文字混在一条消息里。`);
        }
    }
    
    // 5.5 语音消息能力
    parts.push(`\n你可以发语音消息。就像平时微信里按住说话一样，有时候打字懒得打、或者语气用文字表达不出来、或者就是想说话的时候，你可以选择发语音。发不发完全看你自己，没有硬性要求。
要发语音的时候，用这个格式：[voice:你说的话]
比如你想用语音说"你在干嘛呀"，就写 [voice:你在干嘛呀]
语音里的内容就是你嘴巴说出来的话，所以会比打字更口语化、更随意，可以有语气词、可以断断续续、可以有口头禅。
语音消息单独一条发，不要跟文字混在同一条消息里。你自己清楚哪些是你打字发的、哪些是你说话发的语音，不要搞混。`);
    
    // 6. 输出格式要求
    parts.push(`\n回复格式：返回一个JSON字符串数组，每个元素是你发的一条消息。想发几条发几条，1条也行，5条也行，看你当时的状态。
格式示例：["消息1", "消息2"] 或 ["就一条"]

现在，用你自己的方式回复对方：`);
    
    return parts.join('\n');
}
// 获取当前角色可用的表情包列表（全局可用 + 角色专属）
async function getAvailableStickersForCharacter(characterId) {
    const available = [];

    try {
        // 1. 加载用户表情包（全部都是全局可用的）
        const userStickers = await loadStickersFromDB();
        userStickers.forEach(s => {
            if (s.name) {
                available.push({ id: s.id, name: s.name, source: 'user' });
            }
        });

        // 2. 加载角色表情包（按权限筛选）
        const charStickers = await loadCharStickersFromDB();
        charStickers.forEach(s => {
            if (!s.name) return;
            // 全角色可用
            if (s.isGlobal) {
                available.push({ id: s.id, name: s.name, source: 'charGlobal' });
                return;
            }
            // 该角色在允许列表中
            if (s.allowedCharIds && s.allowedCharIds.includes(characterId)) {
                available.push({ id: s.id, name: s.name, source: 'charAllowed' });
                return;
            }
            // 兼容旧数据：charId匹配
            if (s.charId === characterId) {
                available.push({ id: s.id, name: s.name, source: 'charOwner' });
            }
        });
    } catch (e) {
        console.error('获取角色可用表情包失败:', e);
    }

    return available;
}

// 调用AI角色扮演API
async function callAIRolePlay() {
    // 获取API设置
    const settings = await storageDB.getItem('apiSettings');
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('请先在设置中配置API');
    }
    
    // 构建系统提示词
    const systemPrompt = await buildRolePlaySystemPrompt();
    
    // 获取最近的聊天历史（使用角色设置的短期记忆条数）
    const memoryLimit = currentChatCharacter.shortTermMemory || 10; // 默认10条
    const chatHistory = await getChatHistory(currentChatCharacter.id, memoryLimit);
    
    // 构建消息数组
    const messages = [
        {
            role: 'system',
            content: systemPrompt
        }
    ];
    
    // 添加聊天历史
    chatHistory.forEach(msg => {
        let content = msg.content;
        // 语音消息
        if (msg.messageType === 'voice' && msg.voiceText) {
            if (msg.type === 'user') {
                content = `（对方发了一条${msg.voiceDuration || ''}秒的语音消息，说的是：「${msg.voiceText}」）`;
            } else {
                // AI自己发的语音，用指令格式回显，让AI记住自己发过语音
                content = `[voice:${msg.voiceText}]`;
            }
        }
        // 表情包消息：转换为自然描述
        if (msg.messageType === 'sticker') {
            const name = msg.stickerName || '未知';
            if (msg.type === 'user') {
                content = `（对方发了一个表情包，含义是：${name}）`;
            } else {
                // AI自己发的表情包，用指令格式回显，让AI记住自己发过
                content = `[sticker:${name}]`;
            }
        }
        messages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: content
        });
    });
    
    // 如果没有历史消息，添加一个启动提示
    if (chatHistory.length === 0) {
        messages.push({
            role: 'user',
            content: '（开始对话）'
        });
    }
    
    // 调用API
    try {
        let response;
        
        if (settings.provider === 'hakimi') {
            // Gemini API
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: messages.filter(m => m.role !== 'system').map(m => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }]
                    })),
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: 0.9,
                        topP: 0.95,
                        maxOutputTokens: 512
                    }
                })
            });
        } else if (settings.provider === 'claude') {
            // Claude API
            response = await fetch(`${settings.apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: settings.model,
                    max_tokens: 512,
                    temperature: 0.9,
                    system: systemPrompt,
                    messages: messages.filter(m => m.role !== 'system')
                })
            });
        } else {
            // OpenAI-compatible API (包括 DeepSeek 和 Custom)
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    temperature: 0.9,
                    max_tokens: 2048
                })
            });
        }
        
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API请求失败: ${response.status} ${errorText}`);
        }
        
        const data = await response.json();
        
        // 解析响应
        let aiResponse = '';
        
        if (settings.provider === 'hakimi') {
            // Gemini 响应格式
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                aiResponse = data.candidates[0].content.parts[0].text;
            }
        } else if (settings.provider === 'claude') {
            // Claude 响应格式
            if (data.content && data.content[0]) {
                aiResponse = data.content[0].text;
            }
        } else {
            // OpenAI 格式
            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiResponse = data.choices[0].message.content;
            }
        }
        
        if (!aiResponse) {
            throw new Error('API返回了空响应');
        }
        
        // 解析JSON数组
        try {
            // 尝试提取JSON数组（可能包裹在markdown代码块中）
            let jsonStr = aiResponse.trim();
            
            // 移除可能的markdown代码块标记
            jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
            
            // 解析JSON
            const messagesArray = JSON.parse(jsonStr);
            
            if (Array.isArray(messagesArray) && messagesArray.length > 0) {
                return messagesArray.map(msg => String(msg));
            } else {
                throw new Error('返回的不是有效的消息数组');
            }
        } catch (parseError) {
            console.error('JSON解析失败，原始响应:', aiResponse);
            // 如果解析失败，将整个响应作为单条消息返回
            return [aiResponse];
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 获取聊天历史
async function getChatHistory(characterId, limit = 10) {
    try {
        if (!db) {
            console.error('数据库未初始化');
            return [];
        }
        
        const transaction = db.transaction(['chats'], 'readonly');
        const store = transaction.objectStore('chats');
        const index = store.index('characterId');
        
        const messages = [];
        const request = index.openCursor(IDBKeyRange.only(characterId), 'prev');
        
        return new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && messages.length < limit) {
                    messages.unshift(cursor.value);
                    cursor.continue();
                } else {
                    resolve(messages);
                }
            };
            
            request.onerror = () => {
                console.error('获取聊天历史游标错误:', request.error);
                resolve(messages); // 即使出错也返回已获取的消息
            };
        });
    } catch (error) {
        console.error('获取聊天历史失败:', error);
        return [];
    }
}

// 显示更多选项
function showMoreOptions() {
    const panel = document.getElementById('chatExtendPanel');
    if (!panel) return;
    
    // 关闭表情包面板
    closeStickerPanel();
    
    const isActive = panel.classList.contains('active');
    if (isActive) {
        panel.classList.remove('active');
    } else {
        panel.classList.add('active');
        // 展开面板后滚动聊天到底部
        setTimeout(() => scrollChatToBottom(), 100);
    }
}

// 拓展面板功能入口 —— 后续在这里接入各功能的具体实现
function extendAction(type) {
    switch (type) {
        case 'sticker':
            openStickerPanel();
            break;
        case 'resend':
            handleResend();
            break;
        case 'voice':
            openVoiceMessageModal();
            break;
        case 'image':
            showIosAlert('提示', '图片消息功能开发中');
            break;
        case 'transfer':
            showIosAlert('提示', '转账功能开发中');
            break;
        case 'gift':
            showIosAlert('提示', '礼物功能开发中');
            break;
        case 'textImage':
            showIosAlert('提示', '图文消息功能开发中');
            break;
        case 'videoCall':
            showIosAlert('提示', '视频通话功能开发中');
            break;
        default:
            showIosAlert('提示', '功能开发中');
    }
}

// 重说功能：删除当前回合所有角色回复，重新生成
async function handleResend() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先选择一个聊天角色');
        return;
    }

    try {
        // 获取当前角色的所有消息，按时间排序
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats
            .filter(chat => chat.characterId === currentChatCharacter.id)
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        if (characterMessages.length === 0) {
            showIosAlert('提示', '当前没有聊天记录');
            return;
        }

        // 找到最后一条用户消息的位置
        let lastUserMsgIndex = -1;
        for (let i = characterMessages.length - 1; i >= 0; i--) {
            if (characterMessages[i].type === 'user') {
                lastUserMsgIndex = i;
                break;
            }
        }

        if (lastUserMsgIndex === -1) {
            showIosAlert('提示', '没有找到用户发言，无法重说');
            return;
        }

        // 收集最后一条用户消息之后的所有角色消息（即本回合AI的回复）
        const messagesToDelete = [];
        for (let i = lastUserMsgIndex + 1; i < characterMessages.length; i++) {
            if (characterMessages[i].type === 'char' || characterMessages[i].sender === 'char') {
                messagesToDelete.push(characterMessages[i]);
            }
        }

        if (messagesToDelete.length === 0) {
            showIosAlert('提示', '当前回合没有角色回复，无需重说');
            return;
        }

        // 从IndexedDB中删除这些消息
        const transaction = db.transaction(['chats'], 'readwrite');
        const store = transaction.objectStore('chats');

        for (const msg of messagesToDelete) {
            await new Promise((resolve, reject) => {
                const request = store.delete(msg.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }

        console.log(`重说：已删除 ${messagesToDelete.length} 条角色回复`);

        // 从UI中移除这些消息（从底部移除对应数量的角色消息气泡）
        const container = document.getElementById('chatMessagesContainer');
        const allBubbles = container.querySelectorAll('.chat-message');
        let removed = 0;
        for (let i = allBubbles.length - 1; i >= 0 && removed < messagesToDelete.length; i--) {
            if (allBubbles[i].classList.contains('chat-message-char')) {
                allBubbles[i].remove();
                removed++;
            }
        }

        // 关闭扩展面板
        const panel = document.getElementById('chatExtendPanel');
        if (panel) panel.classList.remove('active');

        // 重新调用AI生成回复（复用showEmojiPicker的逻辑）
        await showEmojiPicker();

    } catch (error) {
        console.error('重说失败:', error);
        hideTypingIndicator();
        enableSendButton();
        showIosAlert('错误', '重说失败：' + (error.message || '未知错误'));
    }
}


// ============================================================
// 语音消息功能
// ============================================================

function openVoiceMessageModal() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先选择一个聊天角色');
        return;
    }
    // 关闭扩展面板
    const panel = document.getElementById('chatExtendPanel');
    if (panel) panel.classList.remove('active');

    const overlay = document.getElementById('voiceMsgOverlay');
    if (overlay) {
        overlay.style.display = 'flex';
        document.getElementById('voiceMsgText').value = '';
        document.getElementById('voiceMsgDuration').value = '';
        document.getElementById('voiceMsgText').focus();
    }
}

function closeVoiceMessageModal() {
    const overlay = document.getElementById('voiceMsgOverlay');
    if (overlay) overlay.style.display = 'none';
}

// 根据文字长度推算语音秒数
function estimateVoiceDuration(text) {
    if (!text) return 1;
    // 大约每秒说3-4个字，取3.5
    const chars = text.replace(/\s/g, '').length;
    const seconds = Math.max(1, Math.round(chars / 3.5));
    return Math.min(seconds, 60);
}

async function sendVoiceMessage() {
    const text = document.getElementById('voiceMsgText').value.trim();
    if (!text) {
        showIosAlert('提示', '请输入语音内容');
        return;
    }

    const durationInput = document.getElementById('voiceMsgDuration').value;
    const duration = durationInput ? Math.max(1, Math.min(60, parseInt(durationInput))) : estimateVoiceDuration(text);

    closeVoiceMessageModal();

    // 创建语音消息对象
    const messageObj = {
        id: Date.now().toString(),
        characterId: currentChatCharacter.id,
        content: `[语音消息: ${text}]`,
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'voice',
        voiceText: text,
        voiceDuration: duration
    };

    // 添加到界面
    appendVoiceMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[语音消息]', new Date().toISOString());

    scrollChatToBottom();
}

function appendVoiceMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');

    // 移除空消息提示
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();

    // 获取头像
    let avatar = '';
    if (messageObj.type === 'user') {
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            avatar = userAvatarImg.src;
        }
    } else {
        if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
    }

    const time = formatMessageTime(messageObj.timestamp);
    const duration = messageObj.voiceDuration || estimateVoiceDuration(messageObj.voiceText || '');
    // 气泡宽度随秒数变化，最小80px，最大220px
    const bubbleWidth = Math.min(220, 80 + duration * 8);

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-voice-bubble" style="width:${bubbleWidth}px;">
                <div class="voice-wave-icon">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <span class="voice-duration">${duration}"</span>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}


// ============================================================
// 表情包功能
// ============================================================

// 表情包临时上传缓存 [{data: base64, name: string}]
let stickerUploadCache = [];

// 打开表情包面板（从拓展面板切换过来）
function openStickerPanel() {
    // 关闭拓展面板
    const extendPanel = document.getElementById('chatExtendPanel');
    if (extendPanel) extendPanel.classList.remove('active');
    
    // 打开表情包面板
    const panel = document.getElementById('stickerPanel');
    if (panel) {
        panel.classList.add('active');
        renderStickerCategoryBar();
        renderStickerGrid();
        setTimeout(() => scrollChatToBottom(), 100);
    }
}

// 关闭表情包面板
function closeStickerPanel() {
    const panel = document.getElementById('stickerPanel');
    if (panel) panel.classList.remove('active');
    // 退出删除模式
    if (isStickerDeleteMode) {
        isStickerDeleteMode = false;
        selectedStickerIds.clear();
        const deleteBtn = document.getElementById('stickerDeleteBtn');
        const deleteBar = document.getElementById('stickerDeleteBar');
        if (deleteBtn) deleteBtn.textContent = '管理';
        if (deleteBar) deleteBar.style.display = 'none';
    }
}

// 删除模式状态
let isStickerDeleteMode = false;
let selectedStickerIds = new Set();

// 渲染表情包网格 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 切换删除模式
function toggleStickerDeleteMode() {
    isStickerDeleteMode = !isStickerDeleteMode;
    selectedStickerIds.clear();
    
    const deleteBtn = document.getElementById('stickerDeleteBtn');
    const deleteBar = document.getElementById('stickerDeleteBar');
    
    if (isStickerDeleteMode) {
        if (deleteBtn) deleteBtn.textContent = '完成';
        if (deleteBar) deleteBar.style.display = 'flex';
    } else {
        if (deleteBtn) deleteBtn.textContent = '管理';
        if (deleteBar) deleteBar.style.display = 'none';
    }
    
    updateStickerSelectedCount();
    renderStickerGrid();
}

// 切换单个表情包选中状态
function toggleStickerSelect(stickerId) {
    if (selectedStickerIds.has(stickerId)) {
        selectedStickerIds.delete(stickerId);
    } else {
        selectedStickerIds.add(stickerId);
    }
    updateStickerSelectedCount();
    renderStickerGrid();
}

// 全选
async function selectAllStickers() {
    const stickers = await loadStickersFromDB();
    if (selectedStickerIds.size === stickers.length) {
        // 已全选则取消全选
        selectedStickerIds.clear();
    } else {
        stickers.forEach(s => selectedStickerIds.add(s.id));
    }
    updateStickerSelectedCount();
    renderStickerGrid();
}

// 更新已选计数
function updateStickerSelectedCount() {
    const el = document.getElementById('stickerSelectedCount');
    if (el) el.textContent = `已选 ${selectedStickerIds.size} 个`;
}

// 删除选中的表情包
async function deleteSelectedStickers() {
    if (selectedStickerIds.size === 0) {
        showIosAlert('提示', '请先选择要删除的表情包');
        return;
    }
    
    const confirmed = await iosConfirm(`确定删除选中的 ${selectedStickerIds.size} 个表情包吗？`, '删除确认');
    if (!confirmed) return;
    
    for (const id of selectedStickerIds) {
        try {
            await deleteImageFromDB(id);
        } catch (e) {
            console.error('删除表情包失败:', id, e);
        }
    }
    
    selectedStickerIds.clear();
    toggleStickerDeleteMode();
}

// 从IndexedDB加载表情包列表
async function loadStickersFromDB() {
    try {
        const allImages = await getAllImagesFromDB();
        return allImages
            .filter(img => img.type === 'sticker')
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            .map(img => ({ id: img.id, data: img.data, name: img.name || '', timestamp: img.timestamp, category: img.category || '默认' }));
    } catch (e) {
        console.error('加载表情包失败:', e);
        return [];
    }
}

// 发送表情包消息
async function sendSticker(sticker) {
    if (!currentChatCharacter) return;
    
    // 关闭表情包面板
    closeStickerPanel();
    
    // 创建表情包消息对象
    const messageObj = {
        id: Date.now().toString(),
        characterId: currentChatCharacter.id,
        content: '[表情包]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'sticker',
        stickerData: sticker.data,
        stickerName: sticker.name || ''
    };
    
    // 添加到界面
    appendStickerMessageToChat(messageObj);
    
    // 保存到数据库
    await saveMessageToDB(messageObj);
    
    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[表情包]', new Date().toISOString());
    
    scrollChatToBottom();
}

// 渲染表情包消息气泡
function appendStickerMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    
    // 移除空消息提示
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    // 获取头像
    let avatar = '';
    if (messageObj.type === 'user') {
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            avatar = userAvatarImg.src;
        }
    } else {
        if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
    }
    
    const time = formatMessageTime(messageObj.timestamp);
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-sticker-bubble">
                <img src="${messageObj.stickerData}" alt="sticker" style="max-width:150px;max-height:150px;border-radius:8px;display:block;">
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
}

// 打开表情包上传弹窗 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 关闭表情包上传弹窗
function closeStickerUpload() {
    stickerUploadCache = [];
    const overlay = document.getElementById('stickerUploadOverlay');
    if (overlay) overlay.classList.remove('active');
}

// 处理本地文件选择（批量）
async function handleStickerFileSelect(event) {
    const files = Array.from(event.target.files);
    if (!files.length) return;
    
    for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        try {
            const data = await readFileAsDataURL(file);
            // 用文件名（去掉扩展名）作为默认名字
            const defaultName = file.name.replace(/\.[^.]+$/, '');
            stickerUploadCache.push({ data, name: defaultName });
        } catch (e) {
            console.error('读取文件失败:', e);
        }
    }
    
    // 清空input以便重复选择
    event.target.value = '';
    renderStickerUploadPreview();
}

// 读取文件为DataURL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
    });
}

// 渲染上传预览（只显示缩略图，命名在单独弹窗里完成）
function renderStickerUploadPreview() {
    const preview = document.getElementById('stickerUploadPreview');
    if (!preview) return;
    
    preview.innerHTML = '';
    stickerUploadCache.forEach((item, index) => {
        const el = document.createElement('div');
        el.className = 'sticker-upload-preview-item';
        el.innerHTML = `
            <img src="${item.data}" alt="preview">
            <div class="remove-btn" onclick="removeStickerFromCache(${index})">x</div>
        `;
        preview.appendChild(el);
    });
}

// 从缓存中移除某个表情包
function removeStickerFromCache(index) {
    stickerUploadCache.splice(index, 1);
    renderStickerUploadPreview();
}

// 确认上传 → 检查是否需要命名
async function confirmStickerUpload() {
    // 先处理URL输入（支持多种格式：名称 URL / 名称:URL / 名称：URL / 纯URL）
    const urlInput = document.getElementById('stickerUrlInput');
    if (urlInput && urlInput.value.trim()) {
        const lines = urlInput.value.trim().split('\n').map(l => l.trim()).filter(l => l);
        for (const line of lines) {
            const httpIndex = line.lastIndexOf('http');
            let name = '';
            let url = '';
            if (httpIndex > 0) {
                name = line.substring(0, httpIndex).trim()
                    .replace(/[:：,，\s]+$/, '');
                url = line.substring(httpIndex).trim();
            } else if (httpIndex === 0) {
                url = line.trim();
                name = '';
            } else {
                continue;
            }
            try {
                const data = await loadImageUrlAsDataURL(url);
                stickerUploadCache.push({ data, name: name });
            } catch (e) {
                console.error('URL图片加载失败:', url, e);
            }
        }
    }
    
    if (stickerUploadCache.length === 0) {
        showIosAlert('提示', '请先选择或输入至少一张图片');
        return;
    }
    
    // 关闭上传弹窗
    const uploadOverlay = document.getElementById('stickerUploadOverlay');
    if (uploadOverlay) uploadOverlay.classList.remove('active');
    
    // 检查有多少个缺名称的
    const unnamed = stickerUploadCache.filter(item => !item.name);
    
    if (unnamed.length === 0) {
        // 全都有名称，直接保存
        await finishStickerUpload();
        return;
    }
    
    // 有缺名称的，问用户要不要逐个补全
    const wantNaming = await iosConfirm(
        `共 ${stickerUploadCache.length} 个表情包，其中 ${unnamed.length} 个没有名称。\n要逐个补全名称吗？\n\n选"否"将直接导入（无名称的自动编号）`,
        '补全名称？'
    );
    
    if (!wantNaming) {
        // 不需要命名，给无名称的自动编号后直接保存
        let autoIndex = 1;
        stickerUploadCache.forEach(item => {
            if (!item.name) {
                item.name = '表情' + autoIndex++;
            }
        });
        await finishStickerUpload();
        return;
    }
    
    // 需要命名，只对没有名称的弹命名弹窗
    // 记录需要命名的索引列表
    stickerNamingQueue = [];
    stickerUploadCache.forEach((item, index) => {
        if (!item.name) {
            stickerNamingQueue.push(index);
        }
    });
    stickerNamingQueuePos = 0;
    showStickerNaming();
}

// 需要命名的索引队列
let stickerNamingQueue = [];
let stickerNamingQueuePos = 0;

// 显示当前表情包的命名弹窗
function showStickerNaming() {
    if (stickerNamingQueuePos >= stickerNamingQueue.length) {
        // 全部命名完毕，执行保存
        finishStickerUpload();
        return;
    }
    
    const cacheIndex = stickerNamingQueue[stickerNamingQueuePos];
    const item = stickerUploadCache[cacheIndex];
    const overlay = document.getElementById('stickerNamingOverlay');
    const image = document.getElementById('stickerNamingImage');
    const input = document.getElementById('stickerNamingInput');
    const counter = document.getElementById('stickerNamingCounter');
    
    if (image) image.src = item.data;
    if (input) {
        input.value = item.name || '';
        setTimeout(() => { input.focus(); input.select(); }, 100);
    }
    if (counter) counter.textContent = `${stickerNamingQueuePos + 1} / ${stickerNamingQueue.length}`;
    if (overlay) overlay.classList.add('active');
}

// 跳过当前命名
function skipStickerNaming() {
    const cacheIndex = stickerNamingQueue[stickerNamingQueuePos];
    if (!stickerUploadCache[cacheIndex].name) {
        stickerUploadCache[cacheIndex].name = '表情' + (cacheIndex + 1);
    }
    stickerNamingQueuePos++;
    showStickerNaming();
}

// 确认当前命名，进入下一个
function confirmStickerNaming() {
    const input = document.getElementById('stickerNamingInput');
    const name = input ? input.value.trim() : '';
    const cacheIndex = stickerNamingQueue[stickerNamingQueuePos];
    stickerUploadCache[cacheIndex].name = name || '表情' + (cacheIndex + 1);
    stickerNamingQueuePos++;
    showStickerNaming();
}

// 全部命名完毕，批量保存 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 加载URL图片为DataURL
function loadImageUrlAsDataURL(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                resolve(canvas.toDataURL('image/png'));
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = url;
    });
}

// 从文本内容中解析URL和名称对
function parseStickerLinesFromText(text) {
    const results = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

    for (const line of lines) {
        // 跳过注释行和空行
        if (line.startsWith('#') || line.startsWith('//')) continue;

        const httpIndex = line.lastIndexOf('http');
        if (httpIndex < 0) continue; // 没有URL，跳过

        let name = '';
        let url = '';

        if (httpIndex > 0) {
            name = line.substring(0, httpIndex).trim().replace(/[:：,，\s]+$/, '');
            url = line.substring(httpIndex).trim();
        } else {
            url = line.trim();
        }

        // 清理URL末尾可能的多余字符
        url = url.replace(/[,，;；\s'"）)}\]]+$/, '');

        // 基本URL校验
        if (/^https?:\/\/.+\..+/.test(url)) {
            results.push({ name, url });
        }
    }
    return results;
}

// 从JSON内容解析URL
function parseStickerLinesFromJSON(text) {
    const results = [];
    try {
        const data = JSON.parse(text);
        const items = Array.isArray(data) ? data : (data.stickers || data.items || data.list || data.data || []);

        if (Array.isArray(items)) {
            for (const item of items) {
                if (typeof item === 'string') {
                    // 纯URL数组
                    if (/^https?:\/\//.test(item)) {
                        results.push({ name: '', url: item });
                    }
                } else if (typeof item === 'object' && item !== null) {
                    // 对象数组，尝试常见字段名
                    const url = item.url || item.src || item.image || item.link || '';
                    const name = item.name || item.title || item.label || item.desc || '';
                    if (/^https?:\/\//.test(url)) {
                        results.push({ name, url });
                    }
                }
            }
        }
    } catch (e) {
        // JSON解析失败，回退到文本解析
        return parseStickerLinesFromText(text);
    }
    return results;
}

// 从CSV/TSV内容解析URL
function parseStickerLinesFromCSV(text, separator = ',') {
    const results = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);

    for (let i = 0; i < lines.length; i++) {
        const cols = lines[i].split(separator).map(c => c.trim().replace(/^["']|["']$/g, ''));
        // 找到包含URL的列
        let url = '';
        let name = '';
        for (const col of cols) {
            if (/^https?:\/\//.test(col)) {
                url = col;
            } else if (col && !url) {
                name = col; // URL前面的列当名称
            }
        }
        if (url) {
            results.push({ name, url });
        }
    }
    return results;
}

// 处理文件导入
async function handleStickerDocImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('stickerDocStatus');
    const urlInput = document.getElementById('stickerUrlInput');
    if (statusEl) { statusEl.style.display = 'block'; statusEl.textContent = '正在解析文件...'; }

    let parsed = [];
    const ext = file.name.split('.').pop().toLowerCase();

    try {
        if (ext === 'docx') {
            // 用mammoth解析docx
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            parsed = parseStickerLinesFromText(result.value);
        } else if (ext === 'json') {
            const text = await file.text();
            parsed = parseStickerLinesFromJSON(text);
        } else if (ext === 'csv') {
            const text = await file.text();
            parsed = parseStickerLinesFromCSV(text, ',');
        } else if (ext === 'tsv') {
            const text = await file.text();
            parsed = parseStickerLinesFromCSV(text, '\t');
        } else {
            // txt, md 等纯文本格式
            const text = await file.text();
            parsed = parseStickerLinesFromText(text);
        }

        if (parsed.length === 0) {
            if (statusEl) statusEl.textContent = '未找到有效的图片URL';
            event.target.value = '';
            return;
        }

        // 把解析结果填入URL输入框
        const lines = parsed.map(p => {
            return p.name ? `${p.name} ${p.url}` : p.url;
        });

        // 追加到已有内容后面
        const existing = urlInput ? urlInput.value.trim() : '';
        if (urlInput) {
            urlInput.value = existing ? existing + '\n' + lines.join('\n') : lines.join('\n');
        }

        if (statusEl) statusEl.textContent = `解析完成，找到 ${parsed.length} 个URL`;

    } catch (e) {
        console.error('文件解析失败:', e);
        if (statusEl) statusEl.textContent = '文件解析失败: ' + e.message;
    }

    event.target.value = '';
}

// ============================================================
// 表情包分类功能
// ============================================================

// 当前选中的分类筛选（null = 全部）
let currentStickerCategory = null;
// 分类管理中选中的表情包ID
let categoryAssignSelectedIds = new Set();

// 获取用户分类列表
function getStickerCategories() {
    try {
        const data = localStorage.getItem('stickerCategories');
        return data ? JSON.parse(data) : ['默认'];
    } catch (e) {
        return ['默认'];
    }
}

// 保存用户分类列表
function saveStickerCategories(categories) {
    localStorage.setItem('stickerCategories', JSON.stringify(categories));
}

// 确保"默认"分类始终存在
function ensureDefaultCategory() {
    const cats = getStickerCategories();
    if (!cats.includes('默认')) {
        cats.unshift('默认');
        saveStickerCategories(cats);
    }
    return cats;
}

// 渲染分类筛选栏 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 打开分类管理页面
function openStickerCategoryPage() {
    const page = document.getElementById('stickerCategoryPage');
    const direction = document.getElementById('stickerCategoryDirection');
    const userManage = document.getElementById('userCategoryManage');
    const charManage = document.getElementById('charCategoryManage');
    if (page) page.classList.add('active');
    if (direction) direction.style.display = 'flex';
    if (userManage) userManage.style.display = 'none';
    if (charManage) charManage.style.display = 'none';
}

// 关闭分类管理页面
function closeStickerCategoryPage() {
    const page = document.getElementById('stickerCategoryPage');
    if (page) page.classList.remove('active');
    categoryAssignSelectedIds.clear();
    renderStickerCategoryBar();
    renderStickerGrid();
}

// 打开用户分类管理
function openUserCategoryManage() {
    const direction = document.getElementById('stickerCategoryDirection');
    const userManage = document.getElementById('userCategoryManage');
    if (direction) direction.style.display = 'none';
    if (userManage) userManage.style.display = 'block';
    renderUserCategoryList();
    renderCategoryTransferSelects();
    renderStickerAssignGrid();
}

// 打开角色分类管理 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 渲染用户分类列表
async function renderUserCategoryList() {
    const list = document.getElementById('userCategoryList');
    if (!list) return;
    const cats = ensureDefaultCategory();
    const stickers = await loadStickersFromDB();
    list.innerHTML = '';
    cats.forEach(cat => {
        const count = stickers.filter(s => (s.category || '默认') === cat).length;
        const item = document.createElement('div');
        item.className = 'sticker-category-item';
        const isDefault = cat === '默认';
        item.innerHTML = `
            <div>
                <span class="sticker-category-item-name">${cat}</span>
                <span class="sticker-category-item-count">${count}个表情</span>
            </div>
            <div class="sticker-category-item-actions">
                ${!isDefault ? `<span style="color:#007AFF;" onclick="renameStickerCategory('${cat}')">重命名</span>` : ''}
                ${!isDefault ? `<span style="color:#ff3b30;" onclick="deleteStickerCategory('${cat}')">删除</span>` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

// 渲染批量转移的下拉框
function renderCategoryTransferSelects() {
    const fromSel = document.getElementById('transferFromCategory');
    const toSel = document.getElementById('transferToCategory');
    const assignSel = document.getElementById('assignCategorySelect');
    const targetType = document.getElementById('transferTargetType');
    const userCats = ensureDefaultCategory();

    // 源分类始终是用户分类
    if (fromSel) {
        fromSel.innerHTML = '<option value="">从分类...</option>';
        userCats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            fromSel.appendChild(opt);
        });
    }

    // 目标分类根据类型
    const type = targetType ? targetType.value : 'user';
    const toCats = type === 'user' ? userCats : ensureCharDefaultCategory();
    if (toSel) {
        toSel.innerHTML = '<option value="">到分类...</option>';
        toCats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            toSel.appendChild(opt);
        });
    }

    // 分配下拉
    if (assignSel) {
        assignSel.innerHTML = '<option value="">选择目标分类</option>';
        userCats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            assignSel.appendChild(opt);
        });
    }
}

// 渲染表情包分配网格
async function renderStickerAssignGrid() {
    const grid = document.getElementById('stickerAssignGrid');
    if (!grid) return;
    const stickers = await loadStickersFromDB();
    grid.innerHTML = '';
    stickers.forEach(sticker => {
        const item = document.createElement('div');
        item.className = 'sticker-assign-item' + (categoryAssignSelectedIds.has(sticker.id) ? ' selected' : '');
        item.onclick = () => {
            if (categoryAssignSelectedIds.has(sticker.id)) {
                categoryAssignSelectedIds.delete(sticker.id);
            } else {
                categoryAssignSelectedIds.add(sticker.id);
            }
            renderStickerAssignGrid();
        };
        const check = categoryAssignSelectedIds.has(sticker.id)
            ? `<div class="sticker-assign-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>`
            : '';
        item.innerHTML = `
            <div class="sticker-thumb"><img src="${sticker.data}" alt="">${check}</div>
            <div class="sticker-cat-label">${sticker.category || '默认'}</div>
        `;
        grid.appendChild(item);
    });
}

// 新建分类弹窗
async function showAddCategoryDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.innerHTML = `
        <div class="ios-dialog-title">新建分类</div>
        <div style="padding:8px 16px 16px;">
            <input type="text" id="newCategoryInput" placeholder="输入分类名称" maxlength="20"
                style="width:100%;padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;text-align:center;">
        </div>
        <div class="ios-dialog-buttons">
            <button class="ios-dialog-button" id="newCatCancelBtn">取消</button>
            <button class="ios-dialog-button primary" id="newCatConfirmBtn">确定</button>
        </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    const input = dialog.querySelector('#newCategoryInput');
    setTimeout(() => input && input.focus(), 200);
    return new Promise(resolve => {
        dialog.querySelector('#newCatCancelBtn').onclick = () => {
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
            resolve(null);
        };
        dialog.querySelector('#newCatConfirmBtn').onclick = () => {
            const name = input.value.trim();
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
            if (!name) { resolve(null); return; }
            const cats = ensureDefaultCategory();
            if (cats.includes(name)) {
                showIosAlert('提示', '该分类已存在');
                resolve(null);
                return;
            }
            cats.push(name);
            saveStickerCategories(cats);
            renderUserCategoryList();
            renderCategoryTransferSelects();
            renderStickerCategoryBar();
            resolve(name);
        };
    });
}

// 重命名分类
async function renameStickerCategory(oldName) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.innerHTML = `
        <div class="ios-dialog-title">重命名分类</div>
        <div style="padding:8px 16px 16px;">
            <input type="text" id="renameCategoryInput" value="${oldName}" maxlength="20"
                style="width:100%;padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;text-align:center;">
        </div>
        <div class="ios-dialog-buttons">
            <button class="ios-dialog-button" id="renameCatCancelBtn">取消</button>
            <button class="ios-dialog-button primary" id="renameCatConfirmBtn">确定</button>
        </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    const input = dialog.querySelector('#renameCategoryInput');
    setTimeout(() => { input && input.focus(); input && input.select(); }, 200);
    dialog.querySelector('#renameCatCancelBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    dialog.querySelector('#renameCatConfirmBtn').onclick = async () => {
        const newName = input.value.trim();
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        if (!newName || newName === oldName) return;
        const cats = ensureDefaultCategory();
        if (cats.includes(newName)) {
            showIosAlert('提示', '该分类名已存在');
            return;
        }
        const idx = cats.indexOf(oldName);
        if (idx !== -1) cats[idx] = newName;
        saveStickerCategories(cats);
        // 更新所有该分类下的表情包
        await updateStickersCategoryInDB(oldName, newName);
        if (currentStickerCategory === oldName) currentStickerCategory = newName;
        renderUserCategoryList();
        renderCategoryTransferSelects();
        renderStickerAssignGrid();
        renderStickerCategoryBar();
    };
}

// 删除分类（表情包移回默认）
async function deleteStickerCategory(catName) {
    const confirmed = await iosConfirm(`删除分类"${catName}"？\n该分类下的表情包将移到"默认"分类`, '删除确认');
    if (!confirmed) return;
    const cats = ensureDefaultCategory();
    const idx = cats.indexOf(catName);
    if (idx !== -1) cats.splice(idx, 1);
    saveStickerCategories(cats);
    await updateStickersCategoryInDB(catName, '默认');
    if (currentStickerCategory === catName) currentStickerCategory = null;
    renderUserCategoryList();
    renderCategoryTransferSelects();
    renderStickerAssignGrid();
    renderStickerCategoryBar();
}

// 批量更新IndexedDB中某分类的表情包到新分类
async function updateStickersCategoryInDB(oldCat, newCat) {
    const allImages = await getAllImagesFromDB();
    const stickers = allImages.filter(img => img.type === 'sticker' && (img.category || '默认') === oldCat);
    for (const sticker of stickers) {
        sticker.category = newCat;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        await new Promise((resolve, reject) => {
            const request = store.put(sticker);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 批量转移分类 - 见下方增强版
// (旧版已移至角色分类功能区域)

// 将选中的表情包分配到指定分类
async function assignSelectedToCategory() {
    const sel = document.getElementById('assignCategorySelect');
    const targetCat = sel ? sel.value : '';
    if (!targetCat) {
        showIosAlert('提示', '请选择目标分类');
        return;
    }
    if (categoryAssignSelectedIds.size === 0) {
        showIosAlert('提示', '请先选择表情包');
        return;
    }
    const allImages = await getAllImagesFromDB();
    for (const id of categoryAssignSelectedIds) {
        const img = allImages.find(i => i.id === id);
        if (img) {
            img.category = targetCat;
            const transaction = db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            await new Promise((resolve, reject) => {
                const request = store.put(img);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
    categoryAssignSelectedIds.clear();
    showIosAlert('提示', '分配完成');
    renderUserCategoryList();
    renderStickerAssignGrid();
}

// ============================================================
// 角色表情包分类功能
// ============================================================

// 获取角色分类列表
function getCharStickerCategories() {
    try {
        const data = localStorage.getItem('charStickerCategories');
        return data ? JSON.parse(data) : ['默认'];
    } catch (e) {
        return ['默认'];
    }
}

// 保存角色分类列表
function saveCharStickerCategories(categories) {
    localStorage.setItem('charStickerCategories', JSON.stringify(categories));
}

// 确保角色分类"默认"始终存在
function ensureCharDefaultCategory() {
    const cats = getCharStickerCategories();
    if (!cats.includes('默认')) {
        cats.unshift('默认');
        saveCharStickerCategories(cats);
    }
    return cats;
}

// 从IndexedDB加载角色表情包
async function loadCharStickersFromDB() {
    try {
        const allImages = await getAllImagesFromDB();
        return allImages
            .filter(img => img.type === 'charSticker')
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
            .map(img => ({
                id: img.id,
                data: img.data,
                name: img.name || '',
                timestamp: img.timestamp,
                category: img.category || '默认',
                charId: img.charId || '',
                isGlobal: img.isGlobal || false,
                allowedCharIds: img.allowedCharIds || []
            }));
    } catch (e) {
        console.error('加载角色表情包失败:', e);
        return [];
    }
}

// 打开角色分类管理
function openCharCategoryManage() {
    const direction = document.getElementById('stickerCategoryDirection');
    const charManage = document.getElementById('charCategoryManage');
    if (direction) direction.style.display = 'none';
    if (charManage) charManage.style.display = 'block';
    // 显示当前角色提示
    const hint = document.getElementById('charCategoryCurrentHint');
    if (hint) {
        if (currentChatCharacter) {
            hint.textContent = '当前角色：' + (currentChatCharacter.remark || currentChatCharacter.name);
        } else {
            hint.textContent = '当前角色：未选择（请先进入聊天）';
        }
    }
    renderCharCategoryList();
    renderCharCategoryTransferSelects();
    renderCharStickerAssignGrid();
}

// 渲染角色分类列表
async function renderCharCategoryList() {
    const list = document.getElementById('charCategoryList');
    if (!list) return;
    const cats = ensureCharDefaultCategory();
    const stickers = await loadCharStickersFromDB();
    list.innerHTML = '';
    cats.forEach(cat => {
        const count = stickers.filter(s => (s.category || '默认') === cat).length;
        const item = document.createElement('div');
        item.className = 'sticker-category-item';
        const isDefault = cat === '默认';
        item.innerHTML = `
            <div>
                <span class="sticker-category-item-name">${cat}</span>
                <span class="sticker-category-item-count">${count}个表情</span>
            </div>
            <div class="sticker-category-item-actions">
                ${!isDefault ? `<span style="color:#007AFF;" onclick="renameCharStickerCategory('${cat}')">重命名</span>` : ''}
                ${!isDefault ? `<span style="color:#ff3b30;" onclick="deleteCharStickerCategory('${cat}')">删除</span>` : ''}
            </div>
        `;
        list.appendChild(item);
    });
}

// 渲染角色分类转移下拉框
function renderCharCategoryTransferSelects() {
    const fromSel = document.getElementById('charTransferFromCategory');
    const toSel = document.getElementById('charTransferToCategory');
    const assignSel = document.getElementById('charAssignCategorySelect');
    const cats = ensureCharDefaultCategory();
    [fromSel, toSel, assignSel].forEach(sel => {
        if (!sel) return;
        const placeholder = sel.options[0] ? sel.options[0].text : '';
        sel.innerHTML = `<option value="">${placeholder}</option>`;
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            sel.appendChild(opt);
        });
    });
}

// 渲染角色表情包分配网格（带编辑可用角色按钮）
async function renderCharStickerAssignGrid() {
    const grid = document.getElementById('charStickerAssignGrid');
    if (!grid) return;
    const stickers = await loadCharStickersFromDB();
    grid.innerHTML = '';
    stickers.forEach(sticker => {
        const item = document.createElement('div');
        item.className = 'sticker-assign-item' + (categoryAssignSelectedIds.has(sticker.id) ? ' selected' : '');
        
        // 点击缩略图区域切换选中
        const thumbArea = document.createElement('div');
        thumbArea.style.cssText = 'position:relative;cursor:pointer;';
        thumbArea.onclick = () => {
            if (categoryAssignSelectedIds.has(sticker.id)) {
                categoryAssignSelectedIds.delete(sticker.id);
            } else {
                categoryAssignSelectedIds.add(sticker.id);
            }
            renderCharStickerAssignGrid();
        };
        const check = categoryAssignSelectedIds.has(sticker.id)
            ? `<div class="sticker-assign-check"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>`
            : '';
        thumbArea.innerHTML = `<div class="sticker-thumb"><img src="${sticker.data}" alt="">${check}</div>`;
        item.appendChild(thumbArea);

        // 状态标签
        let statusText = '';
        if (sticker.isGlobal) {
            statusText = '全角色';
        } else if (sticker.allowedCharIds && sticker.allowedCharIds.length > 0) {
            statusText = sticker.allowedCharIds.length + '个角色';
        } else if (sticker.charId) {
            const char = chatCharacters.find(c => c.id === sticker.charId);
            statusText = char ? (char.remark || char.name) : '1个角色';
        } else {
            statusText = '未分配';
        }

        const labelRow = document.createElement('div');
        labelRow.style.cssText = 'display:flex;align-items:center;gap:2px;justify-content:center;margin-top:2px;';
        labelRow.innerHTML = `
            <span class="sticker-cat-label" style="font-size:9px;color:${sticker.isGlobal ? '#007AFF' : '#999'};">${statusText}</span>
            <span style="font-size:9px;color:#007AFF;cursor:pointer;" onclick="event.stopPropagation();openCharStickerAccessEditor('${sticker.id}')">✎</span>
        `;
        item.appendChild(labelRow);

        grid.appendChild(item);
    });
}

// 新建角色分类弹窗
async function showAddCharCategoryDialog() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.innerHTML = `
        <div class="ios-dialog-title">新建角色分类</div>
        <div style="padding:8px 16px 16px;">
            <input type="text" id="newCharCategoryInput" placeholder="输入分类名称" maxlength="20"
                style="width:100%;padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;text-align:center;">
        </div>
        <div class="ios-dialog-buttons">
            <button class="ios-dialog-button" id="newCharCatCancelBtn">取消</button>
            <button class="ios-dialog-button primary" id="newCharCatConfirmBtn">确定</button>
        </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    const input = dialog.querySelector('#newCharCategoryInput');
    setTimeout(() => input && input.focus(), 200);
    return new Promise(resolve => {
        dialog.querySelector('#newCharCatCancelBtn').onclick = () => {
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
            resolve(null);
        };
        dialog.querySelector('#newCharCatConfirmBtn').onclick = () => {
            const name = input.value.trim();
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
            if (!name) { resolve(null); return; }
            const cats = ensureCharDefaultCategory();
            if (cats.includes(name)) {
                showIosAlert('提示', '该分类已存在');
                resolve(null);
                return;
            }
            cats.push(name);
            saveCharStickerCategories(cats);
            renderCharCategoryList();
            renderCharCategoryTransferSelects();
            resolve(name);
        };
    });
}

// 重命名角色分类
async function renameCharStickerCategory(oldName) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.innerHTML = `
        <div class="ios-dialog-title">重命名分类</div>
        <div style="padding:8px 16px 16px;">
            <input type="text" id="renameCharCategoryInput" value="${oldName}" maxlength="20"
                style="width:100%;padding:10px 12px;border:1px solid #e5e5e5;border-radius:8px;font-size:15px;outline:none;box-sizing:border-box;text-align:center;">
        </div>
        <div class="ios-dialog-buttons">
            <button class="ios-dialog-button" id="renameCharCatCancelBtn">取消</button>
            <button class="ios-dialog-button primary" id="renameCharCatConfirmBtn">确定</button>
        </div>
    `;
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
    const input = dialog.querySelector('#renameCharCategoryInput');
    setTimeout(() => { input && input.focus(); input && input.select(); }, 200);
    dialog.querySelector('#renameCharCatCancelBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    dialog.querySelector('#renameCharCatConfirmBtn').onclick = async () => {
        const newName = input.value.trim();
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        if (!newName || newName === oldName) return;
        const cats = ensureCharDefaultCategory();
        if (cats.includes(newName)) {
            showIosAlert('提示', '该分类名已存在');
            return;
        }
        const idx = cats.indexOf(oldName);
        if (idx !== -1) cats[idx] = newName;
        saveCharStickerCategories(cats);
        await updateCharStickersCategoryInDB(oldName, newName);
        renderCharCategoryList();
        renderCharCategoryTransferSelects();
        renderCharStickerAssignGrid();
    };
}

// 删除角色分类
async function deleteCharStickerCategory(catName) {
    const confirmed = await iosConfirm(`删除分类"${catName}"？\n该分类下的表情包将移到"默认"分类`, '删除确认');
    if (!confirmed) return;
    const cats = ensureCharDefaultCategory();
    const idx = cats.indexOf(catName);
    if (idx !== -1) cats.splice(idx, 1);
    saveCharStickerCategories(cats);
    await updateCharStickersCategoryInDB(catName, '默认');
    renderCharCategoryList();
    renderCharCategoryTransferSelects();
    renderCharStickerAssignGrid();
}

// 批量更新角色表情包分类
async function updateCharStickersCategoryInDB(oldCat, newCat) {
    const allImages = await getAllImagesFromDB();
    const stickers = allImages.filter(img => img.type === 'charSticker' && (img.category || '默认') === oldCat);
    for (const sticker of stickers) {
        sticker.category = newCat;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        await new Promise((resolve, reject) => {
            const request = store.put(sticker);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// 角色分类批量转移
async function batchCharTransferCategory() {
    const fromSel = document.getElementById('charTransferFromCategory');
    const toSel = document.getElementById('charTransferToCategory');
    const fromCat = fromSel ? fromSel.value : '';
    const toCat = toSel ? toSel.value : '';
    if (!fromCat || !toCat) {
        showIosAlert('提示', '请选择源分类和目标分类');
        return;
    }
    if (fromCat === toCat) {
        showIosAlert('提示', '源分类和目标分类不能相同');
        return;
    }
    const confirmed = await iosConfirm(`将"${fromCat}"的所有角色表情包转移到"${toCat}"？`, '批量转移');
    if (!confirmed) return;
    await updateCharStickersCategoryInDB(fromCat, toCat);
    showIosAlert('提示', '转移完成');
    renderCharCategoryList();
    renderCharStickerAssignGrid();
}

// 将选中的表情包分配到角色分类
async function assignSelectedToCharCategory() {
    const sel = document.getElementById('charAssignCategorySelect');
    const targetCat = sel ? sel.value : '';
    if (!targetCat) {
        showIosAlert('提示', '请选择目标分类');
        return;
    }
    if (categoryAssignSelectedIds.size === 0) {
        showIosAlert('提示', '请先选择表情包');
        return;
    }
    const allImages = await getAllImagesFromDB();
    for (const id of categoryAssignSelectedIds) {
        const img = allImages.find(i => i.id === id);
        if (img) {
            img.category = targetCat;
            const transaction = db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            await new Promise((resolve, reject) => {
                const request = store.put(img);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }
    categoryAssignSelectedIds.clear();
    showIosAlert('提示', '分配完成');
    renderCharCategoryList();
    renderCharStickerAssignGrid();
}

// ============================================================
// 编辑角色表情包可用角色
// ============================================================

// 打开编辑可用角色弹窗（单个表情包）
async function openCharStickerAccessEditor(stickerId) {
    const allImages = await getAllImagesFromDB();
    const sticker = allImages.find(i => i.id === stickerId);
    if (!sticker) return;

    const isGlobal = sticker.isGlobal || false;
    // allowedCharIds 存储被允许使用的角色ID列表
    // 如果没有 allowedCharIds 但有 charId，则初始化为 [charId]
    let allowedIds = sticker.allowedCharIds ? [...sticker.allowedCharIds] : [];
    if (allowedIds.length === 0 && sticker.charId) {
        allowedIds = [sticker.charId];
    }

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:14px;width:320px;max-width:90%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;';

    // 头部
    const header = document.createElement('div');
    header.style.cssText = 'padding:16px;text-align:center;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    header.innerHTML = `
        <div style="font-size:16px;font-weight:600;color:#333;">编辑可用角色</div>
        <div style="font-size:12px;color:#999;margin-top:4px;">选择哪些角色可以使用这个表情包</div>
    `;
    box.appendChild(header);

    // 预览
    const preview = document.createElement('div');
    preview.style.cssText = 'padding:12px;display:flex;align-items:center;gap:10px;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    preview.innerHTML = `
        <img src="${sticker.data}" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
        <span style="font-size:13px;color:#666;">${sticker.name || '未命名'}</span>
    `;
    box.appendChild(preview);

    // 全角色可用开关
    const globalRow = document.createElement('div');
    globalRow.style.cssText = 'padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    globalRow.innerHTML = `
        <span style="font-size:14px;color:#333;">全角色可用</span>
        <label class="ios-switch">
            <input type="checkbox" id="charAccessGlobalToggle" ${isGlobal ? 'checked' : ''}>
            <span class="ios-slider"></span>
        </label>
    `;
    box.appendChild(globalRow);

    // 角色列表（多选）
    const listContainer = document.createElement('div');
    listContainer.id = 'charAccessList';
    listContainer.style.cssText = 'flex:1;overflow-y:auto;padding:8px 0;';

    function renderCharList() {
        listContainer.innerHTML = '';
        const globalChecked = document.getElementById('charAccessGlobalToggle') && document.getElementById('charAccessGlobalToggle').checked;

        if (chatCharacters.length === 0) {
            listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">暂无角色</div>';
            return;
        }

        chatCharacters.forEach(char => {
            const row = document.createElement('div');
            row.style.cssText = `padding:10px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;opacity:${globalChecked ? '0.4' : '1'};pointer-events:${globalChecked ? 'none' : 'auto'};`;
            const isChecked = allowedIds.includes(char.id);
            row.onclick = () => {
                if (isChecked) {
                    allowedIds = allowedIds.filter(id => id !== char.id);
                } else {
                    allowedIds.push(char.id);
                }
                renderCharList();
            };

            const avatarHtml = char.avatar
                ? `<img src="${char.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
                : `<div style="width:32px;height:32px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">${(char.remark || char.name || '?').charAt(0)}</div>`;

            const checkIcon = isChecked
                ? '<div style="width:20px;height:20px;border-radius:50%;background:#007AFF;display:flex;align-items:center;justify-content:center;margin-left:auto;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
                : '<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid #d0d0d0;margin-left:auto;flex-shrink:0;"></div>';

            row.innerHTML = `
                ${avatarHtml}
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${char.remark || char.name}</div>
                </div>
                ${checkIcon}
            `;
            listContainer.appendChild(row);
        });
    }

    box.appendChild(listContainer);

    // 全局开关变化时刷新列表
    setTimeout(() => {
        const toggle = document.getElementById('charAccessGlobalToggle');
        if (toggle) {
            toggle.addEventListener('change', renderCharList);
        }
    }, 50);

    // 按钮
    const btnRow = document.createElement('div');
    btnRow.className = 'ios-dialog-buttons';
    btnRow.innerHTML = `
        <button class="ios-dialog-button" id="charAccessCancelBtn">取消</button>
        <button class="ios-dialog-button primary" id="charAccessSaveBtn">保存</button>
    `;
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.classList.add('show'); renderCharList(); }, 10);

    // 取消
    box.querySelector('#charAccessCancelBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    // 保存
    box.querySelector('#charAccessSaveBtn').onclick = async () => {
        const globalChecked = document.getElementById('charAccessGlobalToggle') && document.getElementById('charAccessGlobalToggle').checked;

        sticker.isGlobal = globalChecked;
        sticker.allowedCharIds = globalChecked ? [] : [...allowedIds];
        // 如果不是全局且有选中角色，charId设为第一个（兼容旧逻辑）
        if (!globalChecked && allowedIds.length > 0) {
            sticker.charId = allowedIds[0];
        }

        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        await new Promise((resolve, reject) => {
            const request = store.put(sticker);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });

        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        renderCharStickerAssignGrid();
        showIosAlert('提示', '可用角色已更新');
    };
}

// 批量编辑选中表情包的可用角色
async function batchEditCharStickerAccess() {
    if (categoryAssignSelectedIds.size === 0) {
        showIosAlert('提示', '请先选择表情包');
        return;
    }

    let isGlobal = false;
    let allowedIds = [];

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:14px;width:320px;max-width:90%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;';

    const header = document.createElement('div');
    header.style.cssText = 'padding:16px;text-align:center;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    header.innerHTML = `
        <div style="font-size:16px;font-weight:600;color:#333;">批量设置可用角色</div>
        <div style="font-size:12px;color:#999;margin-top:4px;">已选 ${categoryAssignSelectedIds.size} 个表情包</div>
    `;
    box.appendChild(header);

    const globalRow = document.createElement('div');
    globalRow.style.cssText = 'padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    globalRow.innerHTML = `
        <span style="font-size:14px;color:#333;">全角色可用</span>
        <label class="ios-switch">
            <input type="checkbox" id="batchAccessGlobalToggle">
            <span class="ios-slider"></span>
        </label>
    `;
    box.appendChild(globalRow);

    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'flex:1;overflow-y:auto;padding:8px 0;';

    function renderList() {
        listContainer.innerHTML = '';
        const globalChecked = document.getElementById('batchAccessGlobalToggle') && document.getElementById('batchAccessGlobalToggle').checked;
        if (chatCharacters.length === 0) {
            listContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">暂无角色</div>';
            return;
        }
        chatCharacters.forEach(char => {
            const row = document.createElement('div');
            row.style.cssText = `padding:10px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;opacity:${globalChecked ? '0.4' : '1'};pointer-events:${globalChecked ? 'none' : 'auto'};`;
            const isChecked = allowedIds.includes(char.id);
            row.onclick = () => {
                if (isChecked) {
                    allowedIds = allowedIds.filter(id => id !== char.id);
                } else {
                    allowedIds.push(char.id);
                }
                renderList();
            };
            const avatarHtml = char.avatar
                ? `<img src="${char.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
                : `<div style="width:32px;height:32px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">${(char.remark || char.name || '?').charAt(0)}</div>`;
            const checkIcon = isChecked
                ? '<div style="width:20px;height:20px;border-radius:50%;background:#007AFF;display:flex;align-items:center;justify-content:center;margin-left:auto;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
                : '<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid #d0d0d0;margin-left:auto;flex-shrink:0;"></div>';
            row.innerHTML = `${avatarHtml}<div style="flex:1;min-width:0;"><div style="font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${char.remark || char.name}</div></div>${checkIcon}`;
            listContainer.appendChild(row);
        });
    }

    box.appendChild(listContainer);
    setTimeout(() => {
        const toggle = document.getElementById('batchAccessGlobalToggle');
        if (toggle) toggle.addEventListener('change', renderList);
    }, 50);

    const btnRow = document.createElement('div');
    btnRow.className = 'ios-dialog-buttons';
    btnRow.innerHTML = `
        <button class="ios-dialog-button" id="batchAccessCancelBtn">取消</button>
        <button class="ios-dialog-button primary" id="batchAccessSaveBtn">保存</button>
    `;
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);
    setTimeout(() => { overlay.classList.add('show'); renderList(); }, 10);

    box.querySelector('#batchAccessCancelBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };

    box.querySelector('#batchAccessSaveBtn').onclick = async () => {
        const globalChecked = document.getElementById('batchAccessGlobalToggle') && document.getElementById('batchAccessGlobalToggle').checked;
        const allImages = await getAllImagesFromDB();
        for (const id of categoryAssignSelectedIds) {
            const img = allImages.find(i => i.id === id);
            if (img) {
                img.isGlobal = globalChecked;
                img.allowedCharIds = globalChecked ? [] : [...allowedIds];
                if (!globalChecked && allowedIds.length > 0) {
                    img.charId = allowedIds[0];
                }
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                await new Promise((resolve, reject) => {
                    const request = store.put(img);
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
        }
        categoryAssignSelectedIds.clear();
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        renderCharStickerAssignGrid();
        showIosAlert('提示', '批量设置完成');
    };
}

// 按分类批量编辑可用角色
async function batchEditCharAccessByCategory() {
    const cats = ensureCharDefaultCategory();
    const stickers = await loadCharStickersFromDB();

    let selectedCats = new Set();
    let isGlobal = false;
    let allowedIds = [];

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';

    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;border-radius:14px;width:320px;max-width:90%;max-height:80vh;overflow:hidden;display:flex;flex-direction:column;';

    // 标题
    const header = document.createElement('div');
    header.style.cssText = 'padding:16px;text-align:center;border-bottom:0.5px solid #e5e5ea;flex-shrink:0;';
    header.innerHTML = `
        <div style="font-size:16px;font-weight:600;color:#333;">按分类设置可用角色</div>
        <div style="font-size:12px;color:#999;margin-top:4px;">选择分类，设置该分类下所有表情包的可用角色</div>
    `;
    box.appendChild(header);

    // 步骤指示
    const stepIndicator = document.createElement('div');
    stepIndicator.style.cssText = 'padding:10px 16px;background:#f8f8f8;flex-shrink:0;';
    stepIndicator.id = 'batchCatStepIndicator';
    box.appendChild(stepIndicator);

    // 内容区
    const contentArea = document.createElement('div');
    contentArea.style.cssText = 'flex:1;overflow-y:auto;';
    contentArea.id = 'batchCatContent';
    box.appendChild(contentArea);

    // 底部按钮
    const btnRow = document.createElement('div');
    btnRow.className = 'ios-dialog-buttons';
    btnRow.id = 'batchCatBtnRow';
    box.appendChild(btnRow);

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    let currentStep = 1; // 1=选分类, 2=选角色

    function renderStep1() {
        currentStep = 1;
        stepIndicator.innerHTML = '<div style="font-size:13px;font-weight:500;color:#007AFF;">第1步：选择表情包分类</div>';
        contentArea.innerHTML = '';
        if (cats.length === 0) {
            contentArea.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">暂无分类</div>';
            return;
        }
        cats.forEach(cat => {
            const count = stickers.filter(s => (s.category || '默认') === cat).length;
            const row = document.createElement('div');
            const isChecked = selectedCats.has(cat);
            row.style.cssText = 'padding:12px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;border-bottom:0.5px solid #f0f0f0;';
            row.onclick = () => {
                if (selectedCats.has(cat)) {
                    selectedCats.delete(cat);
                } else {
                    selectedCats.add(cat);
                }
                renderStep1();
            };
            const checkIcon = isChecked
                ? '<div style="width:20px;height:20px;border-radius:50%;background:#34C759;display:flex;align-items:center;justify-content:center;margin-left:auto;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
                : '<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid #d0d0d0;margin-left:auto;flex-shrink:0;"></div>';
            row.innerHTML = `
                <div style="width:32px;height:32px;border-radius:8px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:14px;">📁</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;color:#333;">${cat}</div>
                    <div style="font-size:11px;color:#999;">${count}个表情包</div>
                </div>
                ${checkIcon}
            `;
            contentArea.appendChild(row);
        });

        btnRow.innerHTML = `
            <button class="ios-dialog-button" id="batchCatCancelBtn">取消</button>
            <button class="ios-dialog-button primary" id="batchCatNextBtn">下一步</button>
        `;
        btnRow.querySelector('#batchCatCancelBtn').onclick = closeOverlay;
        btnRow.querySelector('#batchCatNextBtn').onclick = () => {
            if (selectedCats.size === 0) {
                showIosAlert('提示', '请至少选择一个分类');
                return;
            }
            renderStep2();
        };
    }

    function renderStep2() {
        currentStep = 2;
        const totalCount = stickers.filter(s => selectedCats.has(s.category || '默认')).length;
        stepIndicator.innerHTML = `
            <div style="font-size:13px;font-weight:500;color:#007AFF;">第2步：选择可用角色</div>
            <div style="font-size:11px;color:#999;margin-top:2px;">已选分类：${[...selectedCats].join('、')}（共${totalCount}个表情包）</div>
        `;
        contentArea.innerHTML = '';

        // 全角色开关
        const globalRow = document.createElement('div');
        globalRow.style.cssText = 'padding:12px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:0.5px solid #e5e5ea;';
        globalRow.innerHTML = `
            <span style="font-size:14px;color:#333;">全角色可用</span>
            <label class="ios-switch">
                <input type="checkbox" id="batchCatGlobalToggle" ${isGlobal ? 'checked' : ''}>
                <span class="ios-slider"></span>
            </label>
        `;
        contentArea.appendChild(globalRow);

        const listContainer = document.createElement('div');
        listContainer.id = 'batchCatCharList';
        contentArea.appendChild(listContainer);

        function renderCharList() {
            const list = document.getElementById('batchCatCharList');
            if (!list) return;
            list.innerHTML = '';
            const globalChecked = document.getElementById('batchCatGlobalToggle') && document.getElementById('batchCatGlobalToggle').checked;
            isGlobal = globalChecked;
            if (chatCharacters.length === 0) {
                list.innerHTML = '<div style="padding:20px;text-align:center;color:#999;font-size:13px;">暂无角色</div>';
                return;
            }
            chatCharacters.forEach(char => {
                const row = document.createElement('div');
                row.style.cssText = `padding:10px 16px;display:flex;align-items:center;gap:10px;cursor:pointer;opacity:${globalChecked ? '0.4' : '1'};pointer-events:${globalChecked ? 'none' : 'auto'};`;
                const isChecked = allowedIds.includes(char.id);
                row.onclick = () => {
                    if (isChecked) {
                        allowedIds = allowedIds.filter(id => id !== char.id);
                    } else {
                        allowedIds.push(char.id);
                    }
                    renderCharList();
                };
                const avatarHtml = char.avatar
                    ? `<img src="${char.avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">`
                    : `<div style="width:32px;height:32px;border-radius:50%;background:#f0f0f0;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">${(char.remark || char.name || '?').charAt(0)}</div>`;
                const checkIcon = isChecked
                    ? '<div style="width:20px;height:20px;border-radius:50%;background:#007AFF;display:flex;align-items:center;justify-content:center;margin-left:auto;flex-shrink:0;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div>'
                    : '<div style="width:20px;height:20px;border-radius:50%;border:1.5px solid #d0d0d0;margin-left:auto;flex-shrink:0;"></div>';
                row.innerHTML = `${avatarHtml}<div style="flex:1;min-width:0;"><div style="font-size:14px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${char.remark || char.name}</div></div>${checkIcon}`;
                list.appendChild(row);
            });
        }

        setTimeout(() => {
            const toggle = document.getElementById('batchCatGlobalToggle');
            if (toggle) toggle.addEventListener('change', renderCharList);
            renderCharList();
        }, 30);

        btnRow.innerHTML = `
            <button class="ios-dialog-button" id="batchCatBackBtn">上一步</button>
            <button class="ios-dialog-button primary" id="batchCatSaveBtn">保存</button>
        `;
        btnRow.querySelector('#batchCatBackBtn').onclick = () => renderStep1();
        btnRow.querySelector('#batchCatSaveBtn').onclick = async () => {
            const globalChecked = document.getElementById('batchCatGlobalToggle') && document.getElementById('batchCatGlobalToggle').checked;
            const targetStickers = stickers.filter(s => selectedCats.has(s.category || '默认'));
            const allImages = await getAllImagesFromDB();
            for (const sticker of targetStickers) {
                const img = allImages.find(i => i.id === sticker.id);
                if (img) {
                    img.isGlobal = globalChecked;
                    img.allowedCharIds = globalChecked ? [] : [...allowedIds];
                    if (!globalChecked && allowedIds.length > 0) {
                        img.charId = allowedIds[0];
                    }
                    const transaction = db.transaction(['images'], 'readwrite');
                    const store = transaction.objectStore('images');
                    await new Promise((resolve, reject) => {
                        const request = store.put(img);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                }
            }
            closeOverlay();
            renderCharStickerAssignGrid();
            showIosAlert('提示', `已为 ${targetStickers.length} 个表情包设置可用角色`);
        };
    }

    function closeOverlay() {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    }

    setTimeout(() => { overlay.classList.add('show'); renderStep1(); }, 10);
}

// ============================================================
// 上传弹窗：主分类类型切换
// ============================================================

// 上传弹窗主分类类型切换
function onUploadMainTypeChange() {
    const mainType = document.getElementById('stickerUploadMainType');
    const catSelect = document.getElementById('stickerUploadCategorySelect');
    const globalRow = document.getElementById('stickerUploadGlobalRow');
    if (!mainType || !catSelect) return;

    const type = mainType.value;
    catSelect.innerHTML = '';

    if (type === 'user') {
        // 用户分类
        if (globalRow) globalRow.style.display = 'none';
        const cats = ensureDefaultCategory();
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (currentStickerCategory && cat === currentStickerCategory) opt.selected = true;
            else if (!currentStickerCategory && cat === '默认') opt.selected = true;
            catSelect.appendChild(opt);
        });
    } else {
        // 角色分类
        if (globalRow) globalRow.style.display = 'flex';
        const cats = ensureCharDefaultCategory();
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            if (cat === '默认') opt.selected = true;
            catSelect.appendChild(opt);
        });
    }
}

// ============================================================
// 用户分类转移目标类型切换
// ============================================================

function onTransferTargetTypeChange() {
    const targetType = document.getElementById('transferTargetType');
    const fromSel = document.getElementById('transferFromCategory');
    const toSel = document.getElementById('transferToCategory');
    if (!targetType) return;

    const type = targetType.value;

    // 源分类始终是用户分类
    if (fromSel) {
        fromSel.innerHTML = '<option value="">从分类...</option>';
        const userCats = ensureDefaultCategory();
        userCats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            fromSel.appendChild(opt);
        });
    }

    // 目标分类根据类型切换
    if (toSel) {
        toSel.innerHTML = '<option value="">到分类...</option>';
        const cats = type === 'user' ? ensureDefaultCategory() : ensureCharDefaultCategory();
        cats.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            toSel.appendChild(opt);
        });
    }
}

// ============================================================
// 增强的表情包面板：显示角色表情包
// ============================================================

// 渲染分类筛选栏（只显示用户分类）
function renderStickerCategoryBar() {
    const bar = document.getElementById('stickerCategoryBar');
    if (!bar) return;
    const userCats = ensureDefaultCategory();
    bar.innerHTML = '';

    // "全部"标签
    const allTag = document.createElement('span');
    allTag.className = 'sticker-category-tag' + (currentStickerCategory === null ? ' active' : '');
    allTag.textContent = '全部';
    allTag.onclick = () => { currentStickerCategory = null; renderStickerCategoryBar(); renderStickerGrid(); };
    bar.appendChild(allTag);

    // 用户分类标签
    userCats.forEach(cat => {
        const tag = document.createElement('span');
        tag.className = 'sticker-category-tag' + (currentStickerCategory === cat ? ' active' : '');
        tag.textContent = cat;
        tag.onclick = () => { currentStickerCategory = cat; renderStickerCategoryBar(); renderStickerGrid(); };
        bar.appendChild(tag);
    });
}

// 渲染表情包网格（只显示用户表情包）
async function renderStickerGrid() {
    const grid = document.getElementById('stickerGrid');
    if (!grid) return;

    // 只加载用户表情包
    let stickers = await loadStickersFromDB();

    // 按用户分类筛选
    if (currentStickerCategory !== null) {
        stickers = stickers.filter(s => (s.category || '默认') === currentStickerCategory);
    }

    // 更新标题
    const title = document.getElementById('stickerPanelTitle');
    if (title) {
        title.textContent = currentStickerCategory ? `我的表情 · ${currentStickerCategory}` : '我的表情';
    }

    grid.innerHTML = '';

    stickers.forEach((sticker) => {
        const item = document.createElement('div');
        item.className = 'sticker-grid-item' + (selectedStickerIds.has(sticker.id) ? ' selected' : '');
        item.setAttribute('data-sticker-id', sticker.id);

        if (isStickerDeleteMode) {
            item.onclick = () => toggleStickerSelect(sticker.id);
        } else {
            item.onclick = () => sendSticker(sticker);
        }

        const checkMark = selectedStickerIds.has(sticker.id)
            ? `<div class="sticker-check-mark"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`
            : '';

        item.innerHTML = `
            <div class="sticker-thumb"><img src="${sticker.data}" alt="sticker">${isStickerDeleteMode ? checkMark : ''}</div>
            <span class="sticker-name">${sticker.name || ''}</span>
        `;
        grid.appendChild(item);
    });

    // 非删除模式才显示添加按钮
    if (!isStickerDeleteMode) {
        const addItem = document.createElement('div');
        addItem.className = 'sticker-grid-item';
        addItem.onclick = () => openStickerUpload();
        addItem.innerHTML = `
            <div class="sticker-add-btn"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg></div>
            <span class="sticker-name">添加</span>
        `;
        grid.appendChild(addItem);
    }
}

// ============================================================
// 增强的批量转移：支持用户分类↔角色分类
// ============================================================

async function batchTransferCategory() {
    const targetType = document.getElementById('transferTargetType');
    const fromSel = document.getElementById('transferFromCategory');
    const toSel = document.getElementById('transferToCategory');
    const fromCat = fromSel ? fromSel.value : '';
    const toCat = toSel ? toSel.value : '';
    const type = targetType ? targetType.value : 'user';

    if (!fromCat || !toCat) {
        showIosAlert('提示', '请选择源分类和目标分类');
        return;
    }

    if (type === 'user' && fromCat === toCat) {
        showIosAlert('提示', '源分类和目标分类不能相同');
        return;
    }

    const targetLabel = type === 'user' ? '用户分类' : '角色分类';
    const confirmed = await iosConfirm(`将用户分类"${fromCat}"的所有表情包转移到${targetLabel}"${toCat}"？`, '批量转移');
    if (!confirmed) return;

    if (type === 'user') {
        // 用户分类内部转移
        await updateStickersCategoryInDB(fromCat, toCat);
    } else {
        // 用户分类 → 角色分类（改变type为charSticker）
        const allImages = await getAllImagesFromDB();
        const stickers = allImages.filter(img => img.type === 'sticker' && (img.category || '默认') === fromCat);
        const currentCharId = currentChatCharacter ? currentChatCharacter.id : '';
        for (const sticker of stickers) {
            sticker.type = 'charSticker';
            sticker.category = toCat;
            sticker.charId = currentCharId;
            sticker.isGlobal = false;
            sticker.allowedCharIds = currentCharId ? [currentCharId] : [];
            const transaction = db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            await new Promise((resolve, reject) => {
                const request = store.put(sticker);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    }

    showIosAlert('提示', '转移完成');
    renderUserCategoryList();
    renderStickerAssignGrid();
    renderStickerCategoryBar();
}

// ============================================================
// 增强的上传弹窗和保存逻辑
// ============================================================

// 覆盖openStickerUpload，增加主分类类型选择
function openStickerUpload() {
    stickerUploadCache = [];
    const overlay = document.getElementById('stickerUploadOverlay');
    const preview = document.getElementById('stickerUploadPreview');
    const urlInput = document.getElementById('stickerUrlInput');
    if (preview) preview.innerHTML = '';
    if (urlInput) urlInput.value = '';

    // 重置主分类类型为用户分类
    const mainType = document.getElementById('stickerUploadMainType');
    if (mainType) mainType.value = 'user';

    // 隐藏全局开关
    const globalRow = document.getElementById('stickerUploadGlobalRow');
    if (globalRow) globalRow.style.display = 'none';

    // 重置全局开关
    const globalToggle = document.getElementById('stickerUploadGlobalToggle');
    if (globalToggle) globalToggle.checked = false;

    // 渲染用户分类下拉
    onUploadMainTypeChange();

    if (overlay) overlay.classList.add('active');
}

// 覆盖finishStickerUpload，支持角色分类保存
async function finishStickerUpload() {
    const namingOverlay = document.getElementById('stickerNamingOverlay');
    if (namingOverlay) namingOverlay.classList.remove('active');

    const mainType = document.getElementById('stickerUploadMainType');
    const catSelect = document.getElementById('stickerUploadCategorySelect');
    const globalToggle = document.getElementById('stickerUploadGlobalToggle');

    const type = mainType ? mainType.value : 'user';
    const selectedCategory = (catSelect && catSelect.value) ? catSelect.value : '默认';
    const isGlobal = globalToggle ? globalToggle.checked : false;
    const currentCharId = currentChatCharacter ? currentChatCharacter.id : '';

    let successCount = 0;
    for (const item of stickerUploadCache) {
        try {
            const id = (type === 'char' ? 'charSticker_' : 'sticker_') + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
            const transaction = db.transaction(['images'], 'readwrite');
            const store = transaction.objectStore('images');
            const imageObject = {
                id: id,
                data: item.data,
                type: type === 'char' ? 'charSticker' : 'sticker',
                name: item.name || '',
                timestamp: Date.now(),
                category: selectedCategory
            };
            if (type === 'char') {
                imageObject.charId = currentCharId;
                imageObject.isGlobal = isGlobal;
                imageObject.allowedCharIds = isGlobal ? [] : (currentCharId ? [currentCharId] : []);
            }
            await new Promise((resolve, reject) => {
                const request = store.put(imageObject);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            successCount++;
        } catch (e) {
            console.error('保存表情包失败:', e);
        }
    }

    stickerUploadCache = [];
    renderStickerCategoryBar();
    renderStickerGrid();

    if (successCount > 0) {
        const typeLabel = type === 'char' ? '角色' : '';
        showIosAlert('提示', `成功添加 ${successCount} 个${typeLabel}表情包`);
    }
}


// 发送消息
async function sendMessage() {
    const input = document.getElementById('chatInputField');
    const message = input.value.trim();
    
    if (!message || !currentChatCharacter) {
        return;
    }
    
    // 创建消息对象
    const messageObj = {
        id: Date.now().toString(),
        characterId: currentChatCharacter.id,
        content: message,
        type: 'user', // user或char
        timestamp: new Date().toISOString(),
        sender: 'user'
    };
    
    // 添加消息到界面
    appendMessageToChat(messageObj);
    
    // 清空输入框
    input.value = '';
    
    // 保存消息到数据库
    await saveMessageToDB(messageObj);
    
    // 更新聊天列表中的最后一条消息
    await updateChatListLastMessage(currentChatCharacter.id, message, new Date().toISOString());
    
    // 滚动到底部
    scrollChatToBottom();
}

// 保存消息到数据库
async function saveMessageToDB(messageObj) {
    try {
        const transaction = db.transaction(['chats'], 'readwrite');
        const store = transaction.objectStore('chats');
        
        await new Promise((resolve, reject) => {
            const request = store.add(messageObj);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        console.log('消息已保存到数据库');
    } catch (error) {
        console.error('保存消息失败:', error);
    }
}

// 更新聊天列表中的最后一条消息
async function updateChatListLastMessage(characterId, message, timestamp) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (character) {
        character.lastMessage = message;
        character.lastMessageTime = timestamp;
        await saveChatCharacters();
        renderChatList();
    }
}

// 显示"正在输入中"提示
function showTypingIndicator() {
    const container = document.getElementById('chatMessagesContainer');
    
    // 检查是否已存在typing indicator
    if (document.getElementById('typingIndicator')) {
        return;
    }
    
    // 获取角色头像 - 和appendMessageToChat使用完全相同的逻辑
    let avatar = '';
    if (currentChatCharacter && currentChatCharacter.avatar) {
        avatar = currentChatCharacter.avatar;
    }
    
    // 创建typing indicator
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="typing-indicator-bubble">
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    scrollChatToBottom();
}

// 隐藏"正在输入中"提示
function hideTypingIndicator() {
    const typingIndicator = document.getElementById('typingIndicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

// 禁用发送按钮
function disableSendButton() {
    const sendButton = document.getElementById('chatSendButton');
    if (sendButton) {
        sendButton.classList.add('disabled');
    }
}

// 启用发送按钮
function enableSendButton() {
    const sendButton = document.getElementById('chatSendButton');
    if (sendButton) {
        sendButton.classList.remove('disabled');
    }
}

// 添加消息到聊天界面
function appendMessageToChat(messageObj) {
    // 如果是表情包消息，用专门的渲染函数
    if (messageObj.messageType === 'sticker' && messageObj.stickerData) {
        appendStickerMessageToChat(messageObj);
        return;
    }

    // 如果是语音消息，用专门的渲染函数
    if (messageObj.messageType === 'voice' && messageObj.voiceText) {
        appendVoiceMessageToChat(messageObj);
        return;
    }
    
    const container = document.getElementById('chatMessagesContainer');
    
    // 移除空消息提示
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) {
        emptyMsg.remove();
    }
    
    // 获取头像
    let avatar = '';
    let senderName = '';
    
    if (messageObj.type === 'user') {
        // 用户消息 - 直接从聊天设置界面读取用户头像
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            avatar = userAvatarImg.src;
        }
        
        // 读取用户真名
        const userNameInput = document.getElementById('userNameInput');
        senderName = (userNameInput && userNameInput.value.trim()) || 'User';
    } else {
        // 角色消息
        if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
        senderName = currentChatCharacter ? currentChatCharacter.remark || currentChatCharacter.name : 'CHAR';
    }
    
    // 格式化时间（时:分:秒）
    const time = formatMessageTime(messageObj.timestamp);
    
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-message-bubble">
                ${escapeHtml(messageObj.content)}
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
}

// 格式化消息时间（时:分:秒）
function formatMessageTime(date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 滚动聊天到底部
function scrollChatToBottom() {
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    }
}

// 监听输入框回车事件
document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInputField');
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
        // 输入框获得焦点时收起拓展面板和表情包面板
        chatInput.addEventListener('focus', function() {
            const panel = document.getElementById('chatExtendPanel');
            if (panel) panel.classList.remove('active');
            closeStickerPanel();
        });
    }
    
    // 点击聊天区域空白处收起拓展面板和表情包面板
    const chatContainer = document.getElementById('chatMessagesContainer');
    if (chatContainer) {
        chatContainer.addEventListener('click', function(e) {
            // 避免点击消息内的交互元素时也触发
            if (e.target.closest('.chat-message-content a, .chat-message-content button')) return;
            const extendPanel = document.getElementById('chatExtendPanel');
            const stickerPanel = document.getElementById('stickerPanel');
            const extendActive = extendPanel && extendPanel.classList.contains('active');
            const stickerActive = stickerPanel && stickerPanel.classList.contains('active');
            if (extendActive) extendPanel.classList.remove('active');
            if (stickerActive) closeStickerPanel();
        });
    }
});

// 打开聊天个人资料设置
function openChatProfileSettings() {
    alert('个人资料设置功能待开发');
}

// ========== 我的页面功能选项 ==========

// 人设数据存储
let personas = [];
let currentEditingPersonaId = null;
let isPersonaEditMode = false;
let selectedPersonaIds = new Set();

// 追踪表单是否被修改
let personaFormChanged = false;
let personaOriginalData = {};

// 打开人设管理
function openPersonaSettings() {
    document.getElementById('personaManagement').classList.add('active');
    loadPersonas();
    isPersonaEditMode = false;
    selectedPersonaIds.clear();
    renderPersonaList();
}

// 关闭人设管理
function closePersonaManagement() {
    document.getElementById('personaManagement').classList.remove('active');
    // 退出编辑模式
    if (isPersonaEditMode) {
        togglePersonaEditMode();
    }
}

// 切换编辑模式
function togglePersonaEditMode() {
    isPersonaEditMode = !isPersonaEditMode;
    selectedPersonaIds.clear();
    
    const deleteBtn = document.getElementById('deletePersonaBtn');
    const bottomBar = document.getElementById('personaBottomBar');
    
    if (isPersonaEditMode) {
        deleteBtn.textContent = '取消';
        bottomBar.style.display = 'flex';
    } else {
        deleteBtn.textContent = '删除';
        bottomBar.style.display = 'none';
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 切换人设选中状态
function togglePersonaSelection(personaId, event) {
    event.stopPropagation();
    
    if (selectedPersonaIds.has(personaId)) {
        selectedPersonaIds.delete(personaId);
    } else {
        selectedPersonaIds.add(personaId);
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 全选/取消全选
function selectAllPersonas() {
    if (selectedPersonaIds.size === personas.length) {
        // 全部取消选中
        selectedPersonaIds.clear();
    } else {
        // 全部选中
        selectedPersonaIds.clear();
        personas.forEach(p => selectedPersonaIds.add(p.id));
    }
    
    renderPersonaList();
    updateSelectedCount();
}

// 更新选中数量显示
function updateSelectedCount() {
    const countElement = document.getElementById('selectedPersonaCount');
    if (countElement) {
        countElement.textContent = selectedPersonaIds.size;
    }
}

// 删除选中的人设
async function deleteSelectedPersonas() {
    if (selectedPersonaIds.size === 0) {
        showIosAlert('提示', '请选择要删除的人设');
        return;
    }
    
    const confirmed = await iosConfirm(
        `确定要删除选中的 ${selectedPersonaIds.size} 个人设吗？\n删除后无法恢复。`,
        '确认删除'
    );
    
    if (confirmed) {
        personas = personas.filter(p => !selectedPersonaIds.has(p.id));
        savePersonas();
        selectedPersonaIds.clear();
        renderPersonaList();
        updateSelectedCount();
        showIosAlert('成功', '已删除选中的人设');
    }
}

// 打开添加人设选择对话框
async function openAddPersona() {
    // 显示iOS风格选择对话框
    const choice = await showPersonaCreationChoice();
    
    if (choice === 'manual') {
        // 手动创建
        openManualCreatePersona();
    } else if (choice === 'import') {
        // SillyTavern导入
        openSillyTavernImport();
    }
}

// 显示人设创建方式选择对话框
function showPersonaCreationChoice() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay show';
        overlay.style.zIndex = '10002';
        
        overlay.innerHTML = `
            <div class="ios-dialog">
                <div class="ios-dialog-title">选择创建方式</div>
                <div class="ios-dialog-message">请选择如何添加人设</div>
                <div class="ios-dialog-buttons vertical">
                    <button class="ios-dialog-button" data-action="manual">手动创建</button>
                    <button class="ios-dialog-button" data-action="import">SillyTavern 导入</button>
                    <button class="ios-dialog-button" data-action="cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(overlay);
        
        overlay.querySelectorAll('.ios-dialog-button').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                document.body.removeChild(overlay);
                resolve(action);
            });
        });
    });
}

// 手动创建人设
function openManualCreatePersona() {
    currentEditingPersonaId = null;
    document.getElementById('addPersonaTitle').textContent = '添加人设';
    document.getElementById('personaNameInput').value = '';
    document.getElementById('personaDescInput').value = '';
    document.getElementById('personaAvatarUrl').value = '';
    document.getElementById('personaUrlInputSection').style.display = 'none';
    
    // 重置头像预览
    document.getElementById('personaAvatarImage').style.display = 'none';
    document.getElementById('personaAvatarPlaceholder').style.display = 'block';
    
    // 重置ID卡展示开关
    document.getElementById('personaAsIdCardToggle').checked = false;
    
    // 重置表单修改状态
    personaFormChanged = false;
    personaOriginalData = {
        name: '',
        description: '',
        avatar: '',
        isIdCard: false
    };
    
    // 添加输入监听
    setupPersonaFormListeners();
    
    document.getElementById('addPersonaPage').classList.add('active');
}

// 关闭添加人设界面
async function closeAddPersona() {
    // 检查是否有未保存的修改
    if (personaFormChanged) {
        const confirmed = await iosConfirm(
            '您有未保存的修改，确定要退出吗？',
            '确认退出'
        );
        
        if (!confirmed) {
            return; // 用户选择不退出
        }
    }
    
    document.getElementById('addPersonaPage').classList.remove('active');
    personaFormChanged = false;
}

// 设置表单输入监听
function setupPersonaFormListeners() {
    const nameInput = document.getElementById('personaNameInput');
    const descInput = document.getElementById('personaDescInput');
    
    // 移除旧的监听器（如果有）
    nameInput.removeEventListener('input', markPersonaFormChanged);
    descInput.removeEventListener('input', markPersonaFormChanged);
    
    // 添加新的监听器
    nameInput.addEventListener('input', markPersonaFormChanged);
    descInput.addEventListener('input', markPersonaFormChanged);
}

// 标记表单已修改
function markPersonaFormChanged() {
    const currentName = document.getElementById('personaNameInput').value.trim();
    const currentDesc = document.getElementById('personaDescInput').value.trim();
    const currentAvatar = document.getElementById('personaAvatarImage').style.display !== 'none' 
        ? document.getElementById('personaAvatarImage').src 
        : '';
    const currentIsIdCard = document.getElementById('personaAsIdCardToggle').checked;
    
    // 检查是否有任何字段被修改
    if (currentName !== personaOriginalData.name ||
        currentDesc !== personaOriginalData.description ||
        currentAvatar !== personaOriginalData.avatar ||
        currentIsIdCard !== personaOriginalData.isIdCard) {
        personaFormChanged = true;
    } else {
        personaFormChanged = false;
    }
}

// 显示URL输入框
function showPersonaUrlInput() {
    const section = document.getElementById('personaUrlInputSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

// 处理本地头像上传
async function handlePersonaAvatarUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            // 自动压缩图片（如果太大）
            console.log(`正在处理人设头像 (${(file.size / 1024 / 1024).toFixed(2)}MB)...`);
            
            const compressedData = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.85,
                maxSizeKB: 500
            });
            
            const img = document.getElementById('personaAvatarImage');
            img.src = compressedData;
            img.style.display = 'block';
            document.getElementById('personaAvatarPlaceholder').style.display = 'none';
            markPersonaFormChanged(); // 标记表单已修改
            
            console.log('人设头像处理完成');
        } catch (error) {
            console.error('头像处理失败:', error);
            showIosAlert('错误', '图片处理失败，请重试！');
        }
    }
}

// 从URL加载头像
function loadPersonaAvatarFromUrl() {
    const url = document.getElementById('personaAvatarUrl').value.trim();
    if (!url) {
        showIosAlert('提示', '请输入图片URL地址');
        return;
    }
    
    const img = document.getElementById('personaAvatarImage');
    img.onload = function() {
        img.style.display = 'block';
        document.getElementById('personaAvatarPlaceholder').style.display = 'none';
        markPersonaFormChanged(); // 标记表单已修改
        showIosAlert('成功', '图片加载成功');
    };
    img.onerror = function() {
        showIosAlert('错误', '图片加载失败，请检查URL是否正确');
    };
    img.src = url;
}

// 保存人设
async function savePersona() {
    const name = document.getElementById('personaNameInput').value.trim();
    const description = document.getElementById('personaDescInput').value.trim();
    const avatarImg = document.getElementById('personaAvatarImage');
    const avatar = avatarImg.style.display !== 'none' ? avatarImg.src : '';
    const isIdCard = document.getElementById('personaAsIdCardToggle').checked;
    
    if (!name) {
        showIosAlert('提示', '请输入人设名称');
        return;
    }
    
    if (!description) {
        showIosAlert('提示', '请输入人设描述');
        return;
    }
    
    // 如果设置为ID卡角色，需要取消其他人设的ID卡状态
    if (isIdCard) {
        personas.forEach(p => {
            if (p.id !== currentEditingPersonaId) {
                p.isIdCard = false;
            }
        });
    }
    
    const persona = {
        id: currentEditingPersonaId || Date.now().toString(),
        name: name,
        description: description,
        avatar: avatar,
        isIdCard: isIdCard,
        createTime: currentEditingPersonaId ? personas.find(p => p.id === currentEditingPersonaId).createTime : new Date().toISOString(),
        updateTime: new Date().toISOString()
    };
    
    if (currentEditingPersonaId) {
        // 编辑模式
        const index = personas.findIndex(p => p.id === currentEditingPersonaId);
        if (index !== -1) {
            personas[index] = persona;
        }
    } else {
        // 新增模式
        personas.push(persona);
    }
    
    savePersonas();
    renderPersonaList();
    
    // 如果设置为ID卡角色，应用到ID卡
    if (isIdCard) {
        await applyPersonaToIdCard(persona);
    }
    
    // 保存成功后重置表单修改状态
    personaFormChanged = false;
    
    // 关闭编辑界面（不会触发未保存提示）
    document.getElementById('addPersonaPage').classList.remove('active');
    
    showIosAlert('成功', currentEditingPersonaId ? '人设已更新' : '人设已保存');
}

// 保存人设到localStorage
function savePersonas() {
    try {
        localStorage.setItem('personas', JSON.stringify(personas));
    } catch (e) {
        console.error('保存人设失败:', e);
        showIosAlert('错误', '保存失败，可能是存储空间不足');
    }
}

// 从localStorage加载人设
function loadPersonas() {
    try {
        const data = localStorage.getItem('personas');
        if (data) {
            personas = JSON.parse(data);
        } else {
            personas = [];
        }
    } catch (e) {
        console.error('加载人设失败:', e);
        personas = [];
    }
}

// 渲染人设列表
function renderPersonaList() {
    const listContainer = document.getElementById('personaList');
    
    if (personas.length === 0) {
        listContainer.innerHTML = `
            <div class="persona-empty">
                <div style="color: #999; font-size: 14px;">暂无人设</div>
                <div style="color: #ccc; font-size: 12px; margin-top: 5px;">点击右上角 + 添加人设</div>
            </div>
        `;
        return;
    }
    
    let html = '';
    personas.forEach(persona => {
        const avatarHtml = persona.avatar 
            ? `<img src="${persona.avatar}" alt="${persona.name}">`
            : '<span style="font-size: 12px; color: #666;">无头像</span>';
        
        const isSelected = selectedPersonaIds.has(persona.id);
        const editModeClass = isPersonaEditMode ? 'edit-mode' : '';
        const clickHandler = isPersonaEditMode 
            ? `onclick="togglePersonaSelection('${persona.id}', event)"`
            : `onclick="viewPersonaDetail('${persona.id}')"`;
        const idCardBadge = persona.isIdCard ? '<span style="display: inline-block; margin-left: 6px; padding: 2px 8px; background: #007bff; color: white; font-size: 10px; border-radius: 10px; font-weight: 500;">ID卡</span>' : '';
        
        html += `
            <div class="persona-item ${editModeClass}" ${clickHandler}>
                ${isPersonaEditMode ? `
                    <div class="persona-checkbox ${isSelected ? 'checked' : ''}" onclick="togglePersonaSelection('${persona.id}', event)"></div>
                ` : ''}
                <div class="persona-item-avatar">${avatarHtml}</div>
                <div class="persona-item-info">
                    <div class="persona-item-name">${escapeHtml(persona.name)}${idCardBadge}</div>
                    <div class="persona-item-desc">${escapeHtml(persona.description.substring(0, 30))}${persona.description.length > 30 ? '...' : ''}</div>
                </div>
                ${!isPersonaEditMode ? '<div class="persona-item-arrow">›</div>' : ''}
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
}

// 查看/编辑人设详情
function viewPersonaDetail(personaId) {
    const persona = personas.find(p => p.id === personaId);
    if (!persona) return;
    
    // 设置为编辑模式
    currentEditingPersonaId = personaId;
    document.getElementById('addPersonaTitle').textContent = '编辑人设';
    
    // 填充表单数据
    document.getElementById('personaNameInput').value = persona.name;
    document.getElementById('personaDescInput').value = persona.description;
    document.getElementById('personaAvatarUrl').value = '';
    document.getElementById('personaUrlInputSection').style.display = 'none';
    
    // 设置头像
    const img = document.getElementById('personaAvatarImage');
    if (persona.avatar) {
        img.src = persona.avatar;
        img.style.display = 'block';
        document.getElementById('personaAvatarPlaceholder').style.display = 'none';
    } else {
        img.style.display = 'none';
        document.getElementById('personaAvatarPlaceholder').style.display = 'block';
    }
    
    // 设置ID卡展示开关
    document.getElementById('personaAsIdCardToggle').checked = persona.isIdCard || false;
    
    // 保存原始数据用于对比
    personaOriginalData = {
        name: persona.name,
        description: persona.description,
        avatar: persona.avatar || '',
        isIdCard: persona.isIdCard || false
    };
    
    // 重置表单修改状态
    personaFormChanged = false;
    
    // 添加输入监听
    setupPersonaFormListeners();
    
    // 打开编辑界面
    document.getElementById('addPersonaPage').classList.add('active');
}

// HTML转义函数
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 应用人设到ID卡（聊天APP的"我的"界面的身份卡）
async function applyPersonaToIdCard(persona) {
    try {
        // 应用姓名到身份卡
        const profileName = document.getElementById('profileName');
        if (profileName) {
            profileName.textContent = persona.name;
            // 保存到localStorage
            localStorage.setItem('chatProfileName', persona.name);
        }
        
        // 应用头像到身份卡
        if (persona.avatar) {
            const profileAvatarImage = document.getElementById('profileAvatarImage');
            const profileAvatarPlaceholder = document.getElementById('profileAvatarPlaceholder');
            
            if (profileAvatarImage && profileAvatarPlaceholder) {
                profileAvatarImage.src = persona.avatar;
                profileAvatarImage.style.display = 'block';
                profileAvatarPlaceholder.style.display = 'none';
                // 保存到localStorage
                localStorage.setItem('chatProfileAvatar', persona.avatar);
            }
        }
        
        console.log('人设已应用到聊天APP身份卡:', persona.name);
    } catch (error) {
        console.error('应用人设到ID卡失败:', error);
    }
}

// 加载ID卡人设
async function loadIdCardPersona() {
    try {
        // 查找设置为ID卡的人设
        const idCardPersona = personas.find(p => p.isIdCard === true);
        if (idCardPersona) {
            await applyPersonaToIdCard(idCardPersona);
            console.log('已加载ID卡人设:', idCardPersona.name);
        }
    } catch (error) {
        console.error('加载ID卡人设失败:', error);
    }
}

// ========== SillyTavern 导入功能 ==========

let parsedSillyTavernData = null;
let selectedImportPersonas = new Set();

// 打开 SillyTavern 导入界面
function openSillyTavernImport() {
    parsedSillyTavernData = null;
    selectedImportPersonas.clear();
    document.getElementById('sillyTavernFileInfo').style.display = 'none';
    document.getElementById('sillyTavernFileInput').value = '';
    document.getElementById('sillyTavernImportPage').classList.add('active');
}

// 关闭 SillyTavern 导入界面
function closeSillyTavernImport() {
    document.getElementById('sillyTavernImportPage').classList.remove('active');
}

// 处理文件上传
function handleSillyTavernFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            parsedSillyTavernData = parseSillyTavernJSON(data);
            
            if (parsedSillyTavernData.length === 0) {
                showIosAlert('错误', '未找到有效的人设数据');
                return;
            }
            
            // 显示文件信息
            document.getElementById('sillyTavernFileName').textContent = file.name;
            document.getElementById('sillyTavernPersonaCount').textContent = parsedSillyTavernData.length;
            document.getElementById('sillyTavernFileInfo').style.display = 'block';
            
        } catch (error) {
            console.error('解析文件失败:', error);
            showIosAlert('错误', '文件格式不正确，请选择有效的 SillyTavern personas.json 文件');
        }
    };
    reader.readAsText(file);
}

// 解析 SillyTavern JSON 格式
function parseSillyTavernJSON(data) {
    const personas = [];
    
    if (!data.personas || !data.persona_descriptions) {
        return personas;
    }
    
    // 遍历所有人设
    for (const [avatarFile, name] of Object.entries(data.personas)) {
        const description = data.persona_descriptions[avatarFile];
        
        if (description && description.description) {
            personas.push({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                name: name,
                description: description.description.trim(),
                avatar: '', // SillyTavern 不包含Base64头像，默认为空
                avatarFile: avatarFile, // 保存原始文件名供参考
                isIdCard: false
            });
        }
    }
    
    return personas;
}

// 显示人设选择对话框
function showPersonaSelectionDialog() {
    if (!parsedSillyTavernData || parsedSillyTavernData.length === 0) {
        showIosAlert('提示', '没有可导入的人设');
        return;
    }
    
    selectedImportPersonas.clear();
    renderImportPersonaList();
    document.getElementById('personaSelectionDialog').style.display = 'block';
    document.getElementById('personaSelectionDialog').classList.add('active');
}

// 关闭人设选择对话框
function closePersonaSelection() {
    document.getElementById('personaSelectionDialog').classList.remove('active');
    setTimeout(() => {
        document.getElementById('personaSelectionDialog').style.display = 'none';
    }, 300);
}

// 渲染导入人设列表
function renderImportPersonaList() {
    const listContainer = document.getElementById('importPersonaList');
    
    if (!parsedSillyTavernData || parsedSillyTavernData.length === 0) {
        listContainer.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">没有可导入的人设</div>';
        return;
    }
    
    let html = '';
    parsedSillyTavernData.forEach(persona => {
        const isSelected = selectedImportPersonas.has(persona.id);
        const selectedClass = isSelected ? 'selected' : '';
        
        html += `
            <div class="import-persona-item ${selectedClass}" onclick="toggleImportPersonaSelection('${persona.id}')">
                <div class="import-checkbox"></div>
                <div class="import-persona-info">
                    <div class="import-persona-name">${escapeHtml(persona.name)}</div>
                    <div class="import-persona-desc">${escapeHtml(persona.description.substring(0, 100))}${persona.description.length > 100 ? '...' : ''}</div>
                </div>
            </div>
        `;
    });
    
    listContainer.innerHTML = html;
    updateImportCount();
}

// 切换人设选择状态
function toggleImportPersonaSelection(personaId) {
    if (selectedImportPersonas.has(personaId)) {
        selectedImportPersonas.delete(personaId);
    } else {
        selectedImportPersonas.add(personaId);
    }
    renderImportPersonaList();
}

// 全选
function selectAllImportPersonas() {
    if (selectedImportPersonas.size === parsedSillyTavernData.length) {
        // 取消全选
        selectedImportPersonas.clear();
    } else {
        // 全选
        selectedImportPersonas.clear();
        parsedSillyTavernData.forEach(p => selectedImportPersonas.add(p.id));
    }
    renderImportPersonaList();
}

// 更新选中数量
function updateImportCount() {
    const countElement = document.getElementById('selectedImportCount');
    if (countElement) {
        countElement.textContent = selectedImportPersonas.size;
    }
}

// 导入选中的人设
async function importSelectedPersonas() {
    if (selectedImportPersonas.size === 0) {
        showIosAlert('提示', '请选择要导入的人设');
        return;
    }
    
    const selectedPersonas = parsedSillyTavernData.filter(p => selectedImportPersonas.has(p.id));
    
    // 添加到人设库
    personas.push(...selectedPersonas);
    savePersonas();
    renderPersonaList();
    
    // 关闭对话框
    closePersonaSelection();
    closeSillyTavernImport();
    
    // 显示成功提示
    showIosAlert('成功', `已成功导入 ${selectedPersonas.length} 个人设！`);
}

// 打开美化设置
function openBeautifySettings() {
    showIosAlert('提示', '美化功能开发中，敬请期待！');
}

// 打开通用设置
function openGeneralSettings() {
    showIosAlert('提示', '设置功能开发中，敬请期待！');
}

// 加载聊天头像
async function loadChatAvatar() {
    // 不再加载第一个小组件的头像，保持默认灰色占位符
    console.log('聊天头像使用默认占位符');
}

// ========== 自定义确认对话框 ==========

// 显示自定义确认对话框
// showCustomConfirm 现在使用iOS风格弹窗
function showCustomConfirm(title, message) {
    return iosConfirm(message, title);
}

// ========== 世界书功能 ==========

// 世界书列表
let worldBooks = [];

// 世界书分组列表
let worldBookGroups = ['默认'];

// 追踪表单是否被修改
let worldBookFormChanged = false;
let worldBookOriginalData = {};

// 初始化世界书
async function initWorldBooks() {
    try {
        const savedWorldBooks = await storageDB.getItem('worldBooks');
        if (savedWorldBooks) {
            worldBooks = JSON.parse(savedWorldBooks);
            // 为旧数据添加默认分组
            worldBooks.forEach(book => {
                if (!book.group) {
                    book.group = '默认';
                }
            });
            console.log('世界书已加载:', worldBooks.length, '个条目');
        } else {
            worldBooks = [];
        }

        // 加载分组数据
        const savedGroups = await storageDB.getItem('worldBookGroups');
        if (savedGroups) {
            worldBookGroups = JSON.parse(savedGroups);
            // 确保有默认分组
            if (!worldBookGroups.includes('默认')) {
                worldBookGroups.unshift('默认');
            }
        } else {
            worldBookGroups = ['默认'];
        }
    } catch (error) {
        console.error('加载世界书失败，使用空列表:', error);
        worldBooks = [];
        worldBookGroups = ['默认'];
        // 清除损坏的数据
        await storageDB.removeItem('worldBooks');
        await storageDB.removeItem('worldBookGroups');
    }
}

// 打开世界书页面
function openWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'flex';
        displayWorldBooks();
    }
}

// 关闭世界书页面
function closeWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'none';
    }
}

// 添加世界书条目
function addWorldBookItem() {
    openWorldBookEdit();
}

// 打开世界书编辑弹窗
function openWorldBookEdit(bookId = null) {
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 更新分组下拉框选项
        updateGroupSelect();
        
        // 重置修改标记
        worldBookFormChanged = false;
        
        if (bookId !== null) {
            // 编辑模式 - 加载现有世界书数据
            const book = worldBooks.find(b => b.id === bookId);
            if (book) {
                document.getElementById('worldBookName').value = book.name;
                document.getElementById('worldBookGlobal').checked = book.isGlobal;
                document.getElementById('worldBookPosition').value = book.position;
                document.getElementById('worldBookGroup').value = book.group || '默认';
                document.getElementById('worldBookEditModal').dataset.editId = bookId;
                
                // 检查是否有条目
                if (book.entries && book.entries.length > 0) {
                    // 有条目：隐藏文本框，显示条目列表
                    document.getElementById('worldBookContentInput').style.display = 'none';
                    document.getElementById('worldBookContentInput').previousElementSibling.style.display = 'none';
                    renderWorldBookEntries(book.entries);
                } else {
                    // 无条目：显示文本框
                    document.getElementById('worldBookContentInput').style.display = 'block';
                    document.getElementById('worldBookContentInput').previousElementSibling.style.display = 'block';
                    document.getElementById('worldBookContentInput').value = book.content || '';
                    hideWorldBookEntries();
                }
                
                // 保存原始数据
                worldBookOriginalData = {
                    name: book.name,
                    content: book.content,
                    entries: book.entries,
                    isGlobal: book.isGlobal,
                    position: book.position,
                    group: book.group || '默认'
                };
            }
        } else {
            // 新建模式 - 清空表单
            document.getElementById('worldBookName').value = '';
            document.getElementById('worldBookContentInput').value = '';
            document.getElementById('worldBookContentInput').style.display = 'block';
            document.getElementById('worldBookContentInput').previousElementSibling.style.display = 'block';
            document.getElementById('worldBookGlobal').checked = false;
            document.getElementById('worldBookPosition').value = 'middle';
            document.getElementById('worldBookGroup').value = '默认';
            delete document.getElementById('worldBookEditModal').dataset.editId;
            hideWorldBookEntries();
            
            // 保存原始数据(空)
            worldBookOriginalData = {
                name: '',
                content: '',
                entries: null,
                isGlobal: false,
                position: 'middle',
                group: '默认'
            };
        }
        
        // 添加输入监听
        setupWorldBookFormListeners();
    }
}

// 渲染世界书条目列表
function renderWorldBookEntries(entries) {
    const contentInput = document.getElementById('worldBookContentInput');
    const container = contentInput.parentElement;
    
    // 创建或获取条目容器
    let entriesContainer = document.getElementById('worldBookEntriesContainer');
    if (!entriesContainer) {
        entriesContainer = document.createElement('div');
        entriesContainer.id = 'worldBookEntriesContainer';
        container.appendChild(entriesContainer);
    }
    
    entriesContainer.style.display = 'block';
    
    let html = `
        <div style="margin-bottom: 15px;">
            <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 10px;">
                世界书条目 (${entries.length} 个)
            </div>
            <div style="font-size: 12px; color: #666; margin-bottom: 15px;">
                可以单独开启或关闭每个条目，关闭的条目不会被调用
            </div>
        </div>
    `;
    
    entries.forEach((entry, index) => {
        const isEnabled = entry.enabled !== false;
        const statusColor = isEnabled ? '#28a745' : '#999';
        const statusText = isEnabled ? '已启用' : '已禁用';
        
        html += `
            <div style="background: #f8f9fa; border: 2px solid ${isEnabled ? '#e3f2fd' : '#e5e5e5'}; border-radius: 10px; padding: 12px; margin-bottom: 12px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                    <div style="font-size: 14px; font-weight: 600; color: #333;">
                        ${entry.comment || `条目 ${index + 1}`}
                    </div>
                    <label style="display: flex; align-items: center; cursor: pointer; user-select: none;">
                        <input type="checkbox" 
                               onchange="toggleWorldBookEntry(${index})" 
                               ${isEnabled ? 'checked' : ''}
                               style="width: 18px; height: 18px; margin-right: 6px; cursor: pointer;">
                        <span style="font-size: 13px; color: ${statusColor}; font-weight: 500;">${statusText}</span>
                    </label>
                </div>
                ${entry.keys && entry.keys.length > 0 ? `
                    <div style="margin-bottom: 6px;">
                        <span style="font-size: 12px; color: #666; font-weight: 500;">关键词：</span>
                        <span style="font-size: 12px; color: #007bff;">${entry.keys.join(', ')}</span>
                    </div>
                ` : ''}
                <div style="font-size: 13px; color: #555; line-height: 1.5; max-height: 100px; overflow-y: auto; background: white; padding: 8px; border-radius: 6px;">
                    ${entry.content || '暂无内容'}
                </div>
            </div>
        `;
    });
    
    entriesContainer.innerHTML = html;
}

// 隐藏世界书条目列表
function hideWorldBookEntries() {
    const entriesContainer = document.getElementById('worldBookEntriesContainer');
    if (entriesContainer) {
        entriesContainer.style.display = 'none';
    }
}

// 切换世界书条目的启用状态
function toggleWorldBookEntry(entryIndex) {
    const modal = document.getElementById('worldBookEditModal');
    const bookId = modal.dataset.editId;
    
    if (bookId) {
        const book = worldBooks.find(b => b.id === parseInt(bookId));
        if (book && book.entries && book.entries[entryIndex]) {
            // 切换启用状态
            book.entries[entryIndex].enabled = !book.entries[entryIndex].enabled;
            
            // 标记表单已修改
            markWorldBookFormChanged();
            
            // 重新渲染
            renderWorldBookEntries(book.entries);
            
            console.log(`条目 ${entryIndex} 状态已切换为:`, book.entries[entryIndex].enabled);
        }
    }
}

// 设置表单输入监听
function setupWorldBookFormListeners() {
    const nameInput = document.getElementById('worldBookName');
    const contentInput = document.getElementById('worldBookContentInput');
    const globalCheckbox = document.getElementById('worldBookGlobal');
    const positionSelect = document.getElementById('worldBookPosition');
    const groupSelect = document.getElementById('worldBookGroup');
    
    // 移除旧的监听器
    nameInput.removeEventListener('input', markWorldBookFormChanged);
    contentInput.removeEventListener('input', markWorldBookFormChanged);
    globalCheckbox.removeEventListener('change', markWorldBookFormChanged);
    positionSelect.removeEventListener('change', markWorldBookFormChanged);
    groupSelect.removeEventListener('change', markWorldBookFormChanged);
    
    // 添加新的监听器
    nameInput.addEventListener('input', markWorldBookFormChanged);
    contentInput.addEventListener('input', markWorldBookFormChanged);
    globalCheckbox.addEventListener('change', markWorldBookFormChanged);
    positionSelect.addEventListener('change', markWorldBookFormChanged);
    groupSelect.addEventListener('change', markWorldBookFormChanged);
}

// 标记表单已修改
function markWorldBookFormChanged() {
    const currentData = {
        name: document.getElementById('worldBookName').value,
        content: document.getElementById('worldBookContentInput').value,
        isGlobal: document.getElementById('worldBookGlobal').checked,
        position: document.getElementById('worldBookPosition').value,
        group: document.getElementById('worldBookGroup').value
    };
    
    // 检查是否与原始数据不同
    worldBookFormChanged = 
        currentData.name !== worldBookOriginalData.name ||
        currentData.content !== worldBookOriginalData.content ||
        currentData.isGlobal !== worldBookOriginalData.isGlobal ||
        currentData.position !== worldBookOriginalData.position ||
        currentData.group !== worldBookOriginalData.group;
}

// 关闭世界书编辑弹窗
async function closeWorldBookEdit() {
    // 检查是否有未保存的更改
    if (worldBookFormChanged) {
        const userConfirmed = await showCustomConfirm(
            '提示',
            '你还没有保存哦，是否确定要离开？\n\n点击"确定"放弃修改并返回\n点击"取消"继续编辑'
        );
        
        if (!userConfirmed) {
            // 用户选择取消，继续编辑
            return;
        }
    }
    
    // 关闭弹窗
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'none';
        // 重置修改标记
        worldBookFormChanged = false;
        worldBookOriginalData = {};
    }
}

// 保存世界书
async function saveWorldBook() {
    const name = document.getElementById('worldBookName').value.trim();
    const isGlobal = document.getElementById('worldBookGlobal').checked;
    const position = document.getElementById('worldBookPosition').value;
    const group = document.getElementById('worldBookGroup').value;
    
    // 验证
    if (!name) {
        alert('请输入世界书名字！');
        return;
    }
    
    const modal = document.getElementById('worldBookEditModal');
    const editId = modal.dataset.editId;
    
    if (editId) {
        // 编辑现有世界书
        const index = worldBooks.findIndex(b => b.id === parseInt(editId));
        if (index !== -1) {
            const book = worldBooks[index];
            
            // 如果有条目，保留条目（条目的状态已经在 toggleWorldBookEntry 中更新了）
            if (book.entries && book.entries.length > 0) {
                worldBooks[index] = {
                    ...book,
                    name,
                    isGlobal,
                    position,
                    group,
                    updatedAt: Date.now()
                    // entries 保持不变，已经包含了最新的启用/禁用状态
                };
            } else {
                // 没有条目，使用文本内容
                const content = document.getElementById('worldBookContentInput').value.trim();
                if (!content) {
                    alert('请输入世界书内容！');
                    return;
                }
                worldBooks[index] = {
                    ...book,
                    name,
                    content,
                    isGlobal,
                    position,
                    group,
                    updatedAt: Date.now()
                };
            }
        }
    } else {
        // 创建新世界书（普通模式）
        const content = document.getElementById('worldBookContentInput').value.trim();
        if (!content) {
            alert('请输入世界书内容！');
            return;
        }
        const newBook = {
            id: Date.now(),
            name,
            content,
            isGlobal,
            position,
            group,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        worldBooks.push(newBook);
    }
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 重置修改标记(保存成功后不需要提示)
        worldBookFormChanged = false;
        
        // 显示成功提示
        alert('世界书保存成功！');
        
        // 关闭弹窗并刷新列表
        closeWorldBookEdit();
        displayWorldBooks();
        
        console.log('世界书已保存，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('保存世界书失败:', error);
        alert('保存失败，请重试！');
    }
}

// 显示世界书列表
function displayWorldBooks() {
    const container = document.getElementById('worldBookContent');
    console.log('displayWorldBooks 被调用, 容器:', container, '世界书数量:', worldBooks.length);
    
    if (!container) {
        console.error('找不到世界书容器元素!');
        return;
    }
    
    if (worldBooks.length === 0) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">暂无内容</div>
            </div>
        `;
        return;
    }
    
    // 获取当前选中的分组筛选
    const filterSelect = document.getElementById('worldBookGroupFilter');
    const selectedGroup = filterSelect ? filterSelect.value : 'all';
    
    let html = '<div style="padding: 15px;">';
    let hasContent = false;
    
    // 按分组显示世界书
    worldBookGroups.forEach(group => {
        // 如果选择了特定分组，只显示该分组
        if (selectedGroup !== 'all' && selectedGroup !== group) {
            return;
        }
        
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        
        if (booksInGroup.length > 0) {
            hasContent = true;
            
            // 分组标题
            html += `
                <div style="font-size: 14px; font-weight: 600; color: #666; padding: 10px 5px; margin-top: 10px; border-bottom: 2px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between;">
                    <span>${group}</span>
                    <span style="font-size: 12px; color: #999; font-weight: normal;">${booksInGroup.length} 个</span>
                </div>
            `;
            
            // 分组内的世界书
            booksInGroup.forEach(book => {
                const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">全局</span>' : '';
                const positionText = book.position === 'before' ? '前' : book.position === 'middle' ? '中' : '后';
                
                // 判断是条目模式还是文本模式
                let contentPreview = '';
                if (book.entries && book.entries.length > 0) {
                    // 条目模式：显示条目数量和启用状态
                    const enabledCount = book.entries.filter(e => e.enabled !== false).length;
                    contentPreview = `包含 ${book.entries.length} 个条目，已启用 ${enabledCount} 个`;
                } else if (book.content) {
                    // 文本模式：显示内容预览
                    contentPreview = book.content;
                } else {
                    contentPreview = '暂无内容';
                }
                
                html += `
                    <div style="background: white; border: 1px solid #e5e5e5; border-radius: 12px; padding: 15px; margin-bottom: 12px; margin-top: 8px; cursor: pointer; transition: all 0.2s;" 
                         onclick="openWorldBookEdit(${book.id})"
                         onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div style="font-size: 16px; font-weight: 600; color: #333;">
                                ${book.name}${globalBadge}
                            </div>
                            <div style="font-size: 12px; color: #999;">注入: ${positionText}</div>
                        </div>
                        <div style="font-size: 14px; color: #666; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${contentPreview}
                        </div>
                    </div>
                `;
            });
        }
    });
    
    html += '</div>';
    
    // 如果筛选后没有内容，显示空状态
    if (!hasContent) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">该分组暂无内容</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = html;
    console.log('世界书列表已更新, HTML长度:', html.length);
}

// 打开删除世界书弹窗
function openWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'flex';
        displayWorldBookDeleteList();
    }
}

// 关闭删除世界书弹窗
function closeWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示删除列表
function displayWorldBookDeleteList() {
    const container = document.getElementById('worldBookDeleteList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        
        // 判断是条目模式还是文本模式
        let contentPreview = '';
        if (book.entries && book.entries.length > 0) {
            const enabledCount = book.entries.filter(e => e.enabled !== false).length;
            contentPreview = `包含 ${book.entries.length} 个条目，已启用 ${enabledCount} 个`;
        } else if (book.content) {
            contentPreview = book.content;
        } else {
            contentPreview = '暂无内容';
        }
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${contentPreview}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选
function toggleSelectAllWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认删除世界书
async function confirmDeleteWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要删除的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认删除',
        `确定要删除选中的 ${checkboxes.length} 个世界书吗？\n此操作无法撤销！`
    );
    
    if (!confirmed) return;
    
    // 获取要删除的ID列表
    const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 删除选中的世界书
    worldBooks = worldBooks.filter(book => !idsToDelete.includes(book.id));
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功删除 ${idsToDelete.length} 个世界书！`);
        
        // 关闭弹窗并刷新列表
        closeWorldBookDeleteModal();
        displayWorldBooks();
        
        console.log('世界书已删除，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('删除世界书失败:', error);
        alert('删除失败，请重试！');
    }
}

// 删除单个世界书
function deleteWorldBook(bookId) {
    if (confirm('确定要删除这个世界书吗？')) {
        worldBooks = worldBooks.filter(b => b.id !== bookId);
        storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        displayWorldBooks();
    }
}

// 获取世界书的有效内容（只包含启用的条目）
function getWorldBookContent(book) {
    if (!book) return '';
    
    // 如果有条目，只返回启用的条目
    if (book.entries && book.entries.length > 0) {
        const enabledEntries = book.entries.filter(entry => entry.enabled !== false);
        
        if (enabledEntries.length === 0) {
            return ''; // 所有条目都被禁用
        }
        
        // 合并启用的条目
        let combinedContent = '';
        enabledEntries.forEach((entry, index) => {
            if (entry.keys && entry.keys.length > 0) {
                combinedContent += `[关键词: ${entry.keys.join(', ')}]\n`;
            }
            if (entry.comment) {
                combinedContent += `# ${entry.comment}\n`;
            }
            combinedContent += `${entry.content}\n`;
            if (index < enabledEntries.length - 1) {
                combinedContent += '\n---\n\n';
            }
        });
        
        return combinedContent;
    }
    
    // 没有条目，返回原始内容
    return book.content || '';
}

// 获取所有全局世界书
function getGlobalWorldBooks() {
    return worldBooks.filter(book => book.isGlobal);
}

// 根据位置获取世界书
function getWorldBooksByPosition(position) {
    return worldBooks.filter(book => book.position === position);
}

// ========== 世界书分组管理 ==========

// 更新分组下拉框选项
function updateGroupSelect() {
    const groupSelect = document.getElementById('worldBookGroup');
    if (groupSelect) {
        groupSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    }
}

// 打开分组管理弹窗
function openWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'flex';
        updateWorldBookGroupFilter();
        updateTargetGroupSelect();
        displayWorldBookMoveList();
        displayGroupGlobalList();
        displayGroupsList();
    }
}

// 关闭分组管理弹窗
function closeWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'none';
        // 清空输入框
        document.getElementById('newGroupName').value = '';
    }
}

// 创建新分组
async function createNewGroup() {
    const groupName = document.getElementById('newGroupName').value.trim();
    
    if (!groupName) {
        alert('请输入分组名称！');
        return;
    }
    
    if (worldBookGroups.includes(groupName)) {
        alert('该分组已存在！');
        return;
    }
    
    if (groupName === '默认') {
        alert('不能创建名为"默认"的分组！');
        return;
    }
    
    // 添加新分组
    worldBookGroups.push(groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        
        // 清空输入框
        document.getElementById('newGroupName').value = '';
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        
        alert('分组创建成功！');
    } catch (error) {
        console.error('创建分组失败:', error);
        alert('创建失败，请重试！');
        // 回滚
        worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    }
}

// 更新目标分组下拉框
function updateTargetGroupSelect() {
    const targetSelect = document.getElementById('targetGroupSelect');
    if (targetSelect) {
        targetSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            targetSelect.appendChild(option);
        });
    }
}

// 显示世界书移动列表
function displayWorldBookMoveList() {
    const container = document.getElementById('worldBookMoveList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        const groupBadge = `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${book.group || '默认'}</span>`;
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-move-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}${groupBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${book.content}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选（用于移动）
function toggleSelectAllForMove() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认移动到分组
async function confirmMoveToGroup() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox:checked');
    const targetGroup = document.getElementById('targetGroupSelect').value;
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要移动的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认移动',
        `确定要将选中的 ${checkboxes.length} 个世界书移动到"${targetGroup}"分组吗？`
    );
    
    if (!confirmed) return;
    
    // 获取要移动的ID列表
    const idsToMove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 更新分组
    worldBooks.forEach(book => {
        if (idsToMove.includes(book.id)) {
            book.group = targetGroup;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功移动 ${idsToMove.length} 个世界书到"${targetGroup}"分组！`);
        
        // 刷新列表
        displayWorldBookMoveList();
        displayWorldBooks();
        
    } catch (error) {
        console.error('移动世界书失败:', error);
        alert('移动失败，请重试！');
    }
}

// 显示分组列表
function displayGroupsList() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const count = worldBooks.filter(book => (book.group || '默认') === group).length;
        const isDefault = group === '默认';
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="font-size: 14px; font-weight: 600; color: #333;">
                    ${group}
                    ${isDefault ? '<span style="color: #999; font-size: 12px; font-weight: normal; margin-left: 8px;">(系统分组)</span>' : ''}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    ${count} 个世界书
                </div>
                ${!isDefault ? `
                    <button class="btn-primary" onclick="deleteGroup('${group}')" style="background: #dc3545; padding: 8px 12px; font-size: 14px; margin-top: 10px; width: 100%;">
                        删除
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 删除分组
async function deleteGroup(groupName) {
    if (groupName === '默认') {
        alert('不能删除默认分组！');
        return;
    }
    
    const booksInGroup = worldBooks.filter(book => book.group === groupName);
    
    let confirmMessage = `确定要删除"${groupName}"分组吗？`;
    if (booksInGroup.length > 0) {
        confirmMessage += `\n\n该分组中有 ${booksInGroup.length} 个世界书，删除后将移动到"默认"分组。`;
    }
    
    const confirmed = await showCustomConfirm('确认删除', confirmMessage);
    
    if (!confirmed) return;
    
    // 将该分组的世界书移动到默认分组
    worldBooks.forEach(book => {
        if (book.group === groupName) {
            book.group = '默认';
        }
    });
    
    // 删除分组
    worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert('分组删除成功！');
    } catch (error) {
        console.error('删除分组失败:', error);
        alert('删除失败，请重试！');
    }
}

// 更新世界书分组筛选器
function updateWorldBookGroupFilter() {
    const filterSelect = document.getElementById('worldBookGroupFilter');
    if (filterSelect) {
        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">全部分组</option>';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            filterSelect.appendChild(option);
        });
        // 恢复之前的选择
        if (filterSelect.querySelector(`option[value="${currentValue}"]`)) {
            filterSelect.value = currentValue;
        }
    }
}

// 根据分组筛选世界书
function filterWorldBooksByGroup() {
    displayWorldBooks();
}

// 显示分组全局设置列表
function displayGroupGlobalList() {
    const container = document.getElementById('groupGlobalList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        const globalCount = booksInGroup.filter(book => book.isGlobal).length;
        const allGlobal = booksInGroup.length > 0 && globalCount === booksInGroup.length;
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #333;">
                            ${group}
                        </div>
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">
                            ${booksInGroup.length} 个世界书，其中 ${globalCount} 个已是全局
                        </div>
                    </div>
                    <label class="ios-switch">
                        <input type="checkbox" ${allGlobal ? 'checked' : ''} onchange="toggleGroupGlobal('${group}', this.checked)">
                        <span class="ios-slider"></span>
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 切换分组全局状态
async function toggleGroupGlobal(groupName, isGlobal) {
    const booksInGroup = worldBooks.filter(book => (book.group || '默认') === groupName);
    
    if (booksInGroup.length === 0) {
        alert('该分组没有世界书！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    const actionText = isGlobal ? '设置为全局' : '取消全局';
    const confirmed = await showCustomConfirm(
        '确认操作',
        `确定要将"${groupName}"分组下的 ${booksInGroup.length} 个世界书${actionText}吗？`
    );
    
    if (!confirmed) {
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    // 更新分组内所有世界书的全局状态
    worldBooks.forEach(book => {
        if ((book.group || '默认') === groupName) {
            book.isGlobal = isGlobal;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        displayGroupGlobalList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert(`成功将"${groupName}"分组${actionText}！`);
    } catch (error) {
        console.error('更新分组全局状态失败:', error);
        alert('操作失败，请重试！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
    }
}

// ========== 音乐歌词功能 ==========

// 歌词数据结构
let currentLyrics = []; // 当前歌曲的歌词数组 [{time: 秒数, text: 歌词文本}]
let currentLyricIndex = -1; // 当前显示的歌词索引

// 解析LRC格式歌词
function parseLyric(lyricText) {
    if (!lyricText || typeof lyricText !== 'string') {
        return [];
    }
    
    const lyrics = [];
    const lines = lyricText.split('\n');
    
    // LRC时间标签格式：[mm:ss.xx] 或 [mm:ss]
    const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;
    
    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;
        
        // 提取歌词文本（去除所有时间标签）
        const text = line.replace(timeRegex, '').trim();
        if (!text) continue;
        
        // 一行可能有多个时间标签（重复歌词）
        for (const match of matches) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
            
            const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
            
            lyrics.push({
                time: timeInSeconds,
                text: text
            });
        }
    }
    
    // 按时间排序
    lyrics.sort((a, b) => a.time - b.time);
    
    return lyrics;
}

// 更新歌词显示
function updateLyric() {
    const lyricElement = document.getElementById('musicLyric');
    if (!lyricElement) return;
    
    // 如果没有歌曲在播放或没有歌词数据，清空显示
    if (!isPlaying || currentLyrics.length === 0) {
        if (lyricElement.textContent !== '') {
            lyricElement.textContent = '';
        }
        return;
    }
    
    const currentTime = audioPlayer.currentTime;
    
    // 查找当前时间应该显示的歌词
    let newIndex = -1;
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= currentLyrics[i].time) {
            newIndex = i;
            break;
        }
    }
    
    // 如果歌词索引发生变化，更新显示
    if (newIndex !== currentLyricIndex) {
        currentLyricIndex = newIndex;
        if (newIndex >= 0) {
            lyricElement.textContent = currentLyrics[newIndex].text;
        } else {
            lyricElement.textContent = '';
        }
    }
}

// 加载歌词到当前播放
function loadLyric(lyricText) {
    currentLyrics = parseLyric(lyricText);
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
    
    console.log('歌词已加载，共', currentLyrics.length, '行');
}

// 清空歌词
function clearLyric() {
    currentLyrics = [];
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
}

// 从Meting API获取歌词
async function getLyricFromMeting(baseUrl, server, id) {
    try {
        const url = `${baseUrl}?server=${server}&type=lyric&id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Meting API返回格式：{lyric: "lrc内容"}
        if (data && data.lyric) {
            return data.lyric;
        }
        
        return null;
    } catch (error) {
        console.error('获取Meting歌词失败:', error);
        return null;
    }
}

// 从Vkeys API获取歌词
async function getLyricFromVkeys(server, id) {
    try {
        const url = `https://api.vkeys.cn/v2/music/${server}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Vkeys API返回格式需要根据实际情况调整
        if (data && data.code === 200 && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取Vkeys歌词失败:', error);
        return null;
    }
}

// 从NanYi API获取歌词
async function getLyricFromNanYi(platform, id) {
    try {
        const url = `https://api.nanyinet.com/api/music/${platform}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // NanYi API返回格式需要根据实际情况调整
        if (data && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取NanYi歌词失败:', error);
        return null;
    }
}

// ========== 音乐链接检查功能 ==========

let invalidMusicList = []; // 失效音乐列表

// 检查音乐链接
async function checkMusicLinks() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！');
        return;
    }

    // 打开弹窗
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'flex';

    // 显示检查进度
    document.getElementById('checkingProgress').style.display = 'block';
    document.getElementById('invalidMusicResult').style.display = 'none';
    document.getElementById('noInvalidMusic').style.display = 'none';

    invalidMusicList = [];
    let checkedCount = 0;

    // 检查每首音乐
    for (const music of musicLibrary) {
        checkedCount++;
        document.getElementById('checkingStatus').textContent = `正在检查 ${checkedCount}/${musicLibrary.length}`;

        const isValid = await checkSingleMusicLink(music.playUrl);
        if (!isValid) {
            invalidMusicList.push(music);
        }
    }

    // 隐藏进度
    document.getElementById('checkingProgress').style.display = 'none';

    // 显示结果
    if (invalidMusicList.length > 0) {
        displayInvalidMusicList();
        document.getElementById('invalidMusicResult').style.display = 'block';
    } else {
        document.getElementById('noInvalidMusic').style.display = 'block';
    }
}

// 检查单个音乐链接
async function checkSingleMusicLink(url) {
    try {
        // 使用HEAD请求检查链接
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors' // 避免CORS问题
        });
        
        // no-cors模式下无法获取状态码，所以我们尝试加载音频
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'metadata';
            
            const timeout = setTimeout(() => {
                audio.src = '';
                resolve(false);
            }, 5000); // 5秒超时
            
            audio.onloadedmetadata = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(true);
            };
            
            audio.onerror = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(false);
            };
            
            audio.src = url;
        });
    } catch (error) {
        console.error('检查链接失败:', error);
        return false;
    }
}

// 显示失效音乐列表
function displayInvalidMusicList() {
    const container = document.getElementById('invalidMusicList');
    
    let html = '';
    invalidMusicList.forEach(music => {
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #dc3545;">
                <input type="checkbox" class="invalid-music-checkbox" data-music-id="${music.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${music.name}
                        <span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">失效</span>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ${music.artist} · ${music.platform || '未知平台'}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选失效音乐
function toggleSelectAllInvalid() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 重新搜索选中的音乐
async function researchSelectedMusic() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要重新搜索的音乐！');
        return;
    }

    const confirmed = await showCustomConfirm(
        '确认重新搜索',
        `确定要重新搜索选中的 ${checkboxes.length} 首音乐吗？\n\n将依次搜索并自动更新音乐库中的链接。`
    );

    if (!confirmed) return;

    // 获取选中的音乐ID
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.musicId);
    const musicsToResearch = invalidMusicList.filter(m => selectedIds.includes(m.id));

    // 关闭弹窗
    closeInvalidMusicModal();

    // 显示进度提示
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < musicsToResearch.length; i++) {
        const music = musicsToResearch[i];
        const progress = `(${i + 1}/${musicsToResearch.length})`;
        
        try {
            // 搜索音乐
            const keyword = `${music.name} ${music.artist}`;
            const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
            
            let results = [];
            if (apiSource === 'meting1') {
                results = await searchWithMetingAPINew(keyword);
            } else if (apiSource === 'meting2') {
                results = await searchWithMetingAPINew2(keyword);
            } else if (apiSource === 'meting3') {
                results = await searchWithVkeysAPI(keyword);
            } else if (apiSource === 'aa1') {
                results = await searchWithAA1API(keyword);
            } else if (apiSource === 'nanyi') {
                results = await searchWithNanYiAPI(keyword);
            }

            if (results.length > 0) {
                // 使用第一个搜索结果更新
                const newMusic = results[0];
                const index = musicLibrary.findIndex(m => m.id === music.id);
                
                if (index !== -1) {
                    // 保留原来的ID和歌词
                    musicLibrary[index] = {
                        ...newMusic,
                        id: music.id,
                        lyric: music.lyric || newMusic.lyric
                    };
                    successCount++;
                    console.log(`✅ ${progress} 成功更新: ${music.name}`);
                }
            } else {
                failCount++;
                console.log(`❌ ${progress} 搜索失败: ${music.name}`);
            }
        } catch (error) {
            failCount++;
            console.error(`❌ ${progress} 搜索出错:`, music.name, error);
        }
    }

    // 保存更新后的音乐库
    try {
        await storageDB.setItem('musicLibrary', musicLibrary);
        displayMusicLibrary();
        
        let message = `重新搜索完成！\n\n`;
        message += `✅ 成功: ${successCount} 首\n`;
        if (failCount > 0) {
            message += `❌ 失败: ${failCount} 首`;
        }
        alert(message);
    } catch (error) {
        console.error('保存音乐库失败:', error);
        alert('保存失败，请重试！');
    }
}

// 关闭失效音乐弹窗
function closeInvalidMusicModal() {
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'none';
    invalidMusicList = [];
}
