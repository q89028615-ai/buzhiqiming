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
            // 触发触感反馈
            if (typeof triggerHapticFeedback === 'function') {
                triggerHapticFeedback();
            }
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
            // 触发触感反馈
            if (typeof triggerHapticFeedback === 'function') {
                triggerHapticFeedback();
            }
            closeDialog(false);
        };
        
        const okBtn = document.createElement('button');
        okBtn.className = 'ios-dialog-button primary';
        okBtn.textContent = '确定';
        okBtn.onclick = () => {
            // 触发触感反馈
            if (typeof triggerHapticFeedback === 'function') {
                triggerHapticFeedback();
            }
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

// iOS风格的prompt弹窗（回调风格）
function iosPrompt(title, defaultValue, callback) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = title;

    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'padding: 8px 16px 16px;';
    const input = document.createElement('input');
    input.type = 'text';
    input.value = defaultValue || '';
    input.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;';
    input.onfocus = () => { input.style.borderColor = '#007aff'; };
    input.onblur = () => { input.style.borderColor = '#e0e0e0'; };
    inputWrap.appendChild(input);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => {
        // 触发触感反馈
        if (typeof triggerHapticFeedback === 'function') {
            triggerHapticFeedback();
        }
        closeDialog(null);
    };

    const okBtn = document.createElement('button');
    okBtn.className = 'ios-dialog-button primary';
    okBtn.textContent = '确定';
    okBtn.onclick = () => {
        // 触发触感反馈
        if (typeof triggerHapticFeedback === 'function') {
            triggerHapticFeedback();
        }
        closeDialog(input.value);
    };

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(okBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(inputWrap);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.add('show');
        input.focus();
    }, 10);

    function closeDialog(result) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (result !== null && callback) callback(result);
        }, 300);
    }
}

// 便捷函数：参数顺序为 (title, message)
function showIosAlert(title, message) {
    return iosAlert(message, title);
}

// 轻量 toast 提示（几秒自动消失）
function showToast(message, duration = 2500) {
    const existing = document.querySelector('.auto-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'auto-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ========== IndexedDB 存储管理系统 ==========

let db = null;
const DB_NAME = 'YuanBaoPhoneDB';
const DB_VERSION = 3;

// ========== 长期记忆核心函数（必须在最前面定义）==========

// 获取角色的长期记忆列表
async function getLongTermMemories(characterId) {
    try {
        const key = `ltm_${characterId}`;
        const data = await storageDB.getItem(key);
        return data || [];
    } catch (e) {
        console.error('获取长期记忆失败:', e);
        return [];
    }
}

// 保存角色的长期记忆列表
async function saveLongTermMemories(characterId, memories) {
    try {
        const key = `ltm_${characterId}`;
        await storageDB.setItem(key, memories);
    } catch (e) {
        console.error('保存长期记忆失败:', e);
    }
}

// 添加一条长期记忆
async function addLongTermMemory(characterId, content, source = 'auto') {
    const memories = await getLongTermMemories(characterId);
    const memory = {
        id: 'ltm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        content: content,
        createdAt: new Date().toISOString(),
        source: source // 'auto' 或 'manual'
    };
    memories.push(memory);
    await saveLongTermMemories(characterId, memories);
    return memory;
}

// 删除一条长期记忆
async function deleteLongTermMemory(characterId, memoryId) {
    const memories = await getLongTermMemories(characterId);
    const filtered = memories.filter(m => m.id !== memoryId);
    await saveLongTermMemories(characterId, filtered);
}

// 编辑一条长期记忆
async function editLongTermMemory(characterId, memoryId, newContent) {
    const memories = await getLongTermMemories(characterId);
    const memory = memories.find(m => m.id === memoryId);
    if (memory) {
        memory.content = newContent;
        memory.editedAt = new Date().toISOString();
        await saveLongTermMemories(characterId, memories);
    }
}

// 渲染长期记忆列表
async function renderLongTermMemoryList() {
    console.log('=== renderLongTermMemoryList 开始 ===');
    console.log('currentChatCharacter:', currentChatCharacter);
    
    if (!currentChatCharacter) {
        console.error('currentChatCharacter 为空！');
        return;
    }

    const container = document.getElementById('longTermMemoryList');
    console.log('container:', container);
    
    const memories = await getLongTermMemories(currentChatCharacter.id);
    console.log('memories:', memories);

    if (memories.length === 0) {
        container.innerHTML = '<div class="ltm-empty">暂无长期记忆</div>';
        console.log('没有记忆，显示空状态');
        return;
    }

    // 按时间倒序显示
    const sorted = [...memories].reverse();
    container.innerHTML = sorted.map(m => {
        const time = new Date(m.createdAt).toLocaleString('zh-CN');
        const sourceLabel = m.source === 'manual' ? '[手动]' : m.source === 'condense' ? '[精简]' : m.source === 'diary' ? '[日记]' : '[自动]';
        const editedLabel = m.editedAt ? ' (已编辑)' : '';
        return `
            <div class="ltm-item" data-ltm-id="${m.id}">
                <div class="ltm-item-time">${sourceLabel} ${time}${editedLabel}</div>
                <div class="ltm-item-content">${escapeHtml(m.content)}</div>
                <div class="ltm-item-actions">
                    <button class="ltm-action-btn" onclick="startEditLongTermMemory('${m.id}')">编辑</button>
                    <button class="ltm-action-btn danger" onclick="confirmDeleteLongTermMemory('${m.id}')">删除</button>
                </div>
            </div>
        `;
    }).join('');
    
    console.log('=== renderLongTermMemoryList 完成，已渲染', sorted.length, '条记忆 ===');
}

// ========== IndexedDB 存储管理系统 ==========

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
        // 如果是GIF，直接保留原格式，不进行压缩
        if (file.type === 'image/gif') {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('🎬 GIF图片保留原格式，跳过压缩');
                resolve(e.target.result);
            };
            reader.onerror = () => {
                reject(new Error('GIF文件读取失败'));
            };
            reader.readAsDataURL(file);
            return;
        }
        
        // 非GIF图片进行压缩处理
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
async function saveSettings() {
    const settings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value || document.getElementById('modelSelect').value,
        lastSelectedModel: document.getElementById('modelSelect').value || '',
        temperature: parseFloat(document.getElementById('temperatureSlider').value),
        topP: parseFloat(document.getElementById('topPSlider').value),
        maxTokens: parseInt(document.getElementById('maxTokensInput').value) || 2048
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

// 保存字体设置
async function saveFontSettings() {
    const fontFamily = document.getElementById('globalFontSelect').value;
    const fontSize = document.getElementById('fontSizeRange').value;
    
    try {
        // 保存到 localStorage
        localStorage.setItem('globalFont', fontFamily);
        localStorage.setItem('globalFontSize', fontSize);
        
        // 立即应用字体设置
        applyFontSettings(fontFamily, fontSize);
        
        await iosAlert('字体设置已保存！');
    } catch (error) {
        console.error('保存字体设置失败:', error);
        await iosAlert('保存失败，请重试！');
    }
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
    
    // 显示/隐藏边框颜色选择区域
    const borderColorSection = document.getElementById('borderColorSection');
    if (borderColorSection) {
        borderColorSection.style.display = isEnabled ? 'block' : 'none';
    }
    
    // 显示/隐藏手机边框
    if (phoneContainer) {
        if (isEnabled) {
            phoneContainer.classList.add('phone-border');
            // 应用保存的颜色
            const savedColor = localStorage.getItem('phoneBorderColor') || '#ffffff';
            applyBorderColor(savedColor);
        } else {
            phoneContainer.classList.remove('phone-border');
        }
    }
    
    console.log('手机边框已' + (isEnabled ? '显示' : '隐藏'));
}

// 选择边框颜色
function selectBorderColor(color) {
    // 保存颜色到localStorage
    localStorage.setItem('phoneBorderColor', color);
    
    // 应用颜色
    applyBorderColor(color);
    
    // 更新选中状态
    document.querySelectorAll('.color-option').forEach(option => {
        option.classList.remove('selected');
    });
    const selectedOption = document.querySelector(`.color-option[data-color="${color}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    }
    
    // 更新自定义颜色选择器的值
    const customColorPicker = document.getElementById('customBorderColor');
    if (customColorPicker) {
        customColorPicker.value = color;
    }
    
    console.log('边框颜色已更改为:', color);
}

// 应用边框颜色
function applyBorderColor(color) {
    const phoneContainer = document.querySelector('.phone-container');
    if (phoneContainer) {
        phoneContainer.style.setProperty('--border-color', color);
    }
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
        const chatPage = document.getElementById('chatPage');
        if (chatPage) {
            const settingsContent = chatPage.querySelector('.settings-content');
            const chatHeader = document.getElementById('chatHeader');
            const chatSearchContainer = chatPage.querySelector('.chat-search-container');
            const chatListContainer = document.getElementById('chatListContainer');
            const chatBottomNav = chatPage.querySelector('.chat-bottom-nav');
            if (settingsContent) settingsContent.style.backgroundImage = 'none';
            if (chatHeader) chatHeader.style.background = '';
            if (chatSearchContainer) chatSearchContainer.style.background = '';
            if (chatListContainer) chatListContainer.style.background = '';
            if (chatBottomNav) chatBottomNav.style.background = '';
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
    const chatPage = document.getElementById('chatPage');
    
    if (!chatPage) return;
    
    const settingsContent = chatPage.querySelector('.settings-content');
    const chatHeader = document.getElementById('chatHeader');
    const chatSearchContainer = chatPage.querySelector('.chat-search-container');
    const chatListContainer = document.getElementById('chatListContainer');
    const chatBottomNav = chatPage.querySelector('.chat-bottom-nav');
    
    try {
        const bgData = await getImageFromDB('chatListBg');
        if (bgData) {
            // 将壁纸应用到整个聊天页面容器
            if (settingsContent) {
                settingsContent.style.backgroundImage = `url(${bgData})`;
                settingsContent.style.backgroundSize = 'cover';
                settingsContent.style.backgroundPosition = 'center';
                settingsContent.style.backgroundRepeat = 'no-repeat';
            }
            // 让内部元素背景透明，露出壁纸
            if (chatHeader) chatHeader.style.background = 'transparent';
            if (chatSearchContainer) chatSearchContainer.style.background = 'transparent';
            if (chatListContainer) chatListContainer.style.background = 'transparent';
            if (chatBottomNav) chatBottomNav.style.background = 'rgba(255,255,255,0.8)';
            console.log('聊天列表背景已应用');
        } else {
            // 恢复默认背景
            if (settingsContent) settingsContent.style.backgroundImage = 'none';
            if (chatHeader) chatHeader.style.background = '';
            if (chatSearchContainer) chatSearchContainer.style.background = '';
            if (chatListContainer) chatListContainer.style.background = '';
            if (chatBottomNav) chatBottomNav.style.background = '';
        }
    } catch (error) {
        console.error('应用聊天列表背景失败:', error);
        if (settingsContent) settingsContent.style.backgroundImage = 'none';
        if (chatHeader) chatHeader.style.background = '';
        if (chatSearchContainer) chatSearchContainer.style.background = '';
        if (chatListContainer) chatListContainer.style.background = '';
        if (chatBottomNav) chatBottomNav.style.background = '';
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
        await iosAlert('请先上传壁纸！', '提示');
        return;
    }
    
    try {
        console.log('正在保存主屏幕壁纸...');
        await saveImageToDB('mainWallpaper', tempMainWallpaperData);
        
        // 保存壁纸时自动启用壁纸功能
        localStorage.setItem('mainWallpaperEnabled', 'true');
        const mainWallpaperToggle = document.getElementById('mainWallpaperToggle');
        if (mainWallpaperToggle) {
            mainWallpaperToggle.checked = true;
        }
        const mainWallpaperOptions = document.getElementById('mainWallpaperOptions');
        if (mainWallpaperOptions) {
            mainWallpaperOptions.style.display = 'block';
        }
        
        // 应用壁纸
        await applyWallpaperToMainScreen();
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        await iosAlert('主屏幕壁纸保存成功！', '成功');
        console.log('主屏幕壁纸已保存');
    } catch (error) {
        console.error('保存主屏幕壁纸失败:', error);
        await iosAlert('保存失败，请重试！', '错误');
    }
}

// 重置主屏幕壁纸
async function resetMainWallpaper() {
    const confirmed = await iosConfirm('确定要重置主屏幕壁纸吗？', '确认');
    if (!confirmed) {
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
        
        // 移除壁纸（phone-container 和 main-screen 都要清除）
        const phoneContainer = document.querySelector('.phone-container');
        if (phoneContainer) {
            phoneContainer.style.backgroundImage = 'none';
        }
        const mainScreen = document.querySelector('.main-screen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
        
        // 更新状态
        await updateMainWallpaperStatus();
        
        await iosAlert('主屏幕壁纸已重置！', '成功');
        console.log('主屏幕壁纸已重置');
    } catch (error) {
        console.error('重置主屏幕壁纸失败:', error);
        await iosAlert('重置失败，请重试！', '错误');
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
        // 自定义模式：不清空地址，保留用户输入
        urlInput.disabled = false;
        urlInput.placeholder = '请输入自定义API地址';
        
        // 如果当前输入框是空的，尝试从数据库恢复自定义地址
        if (!urlInput.value || urlInput.value.trim() === '') {
            loadCustomApiUrl();
        }
    } else {
        // 预设提供商：直接切换到对应的默认地址
        urlInput.value = apiUrls[provider] || '';
        urlInput.disabled = false;
        urlInput.placeholder = '输入API地址';
    }
}

// 从数据库加载自定义API地址
async function loadCustomApiUrl() {
    try {
        const settings = await storageDB.getItem('apiSettings');
        if (settings && settings.provider === 'custom' && settings.apiUrl) {
            const urlInput = document.getElementById('apiUrl');
            if (urlInput && (!urlInput.value || urlInput.value.trim() === '')) {
                urlInput.value = settings.apiUrl;
                console.log('✅ 已恢复自定义API地址:', settings.apiUrl);
            }
        }
    } catch (error) {
        console.error('❌ 加载自定义API地址失败:', error);
    }
}

// 获取模型列表
async function fetchModels(silent = false) {
    let apiUrl = document.getElementById('apiUrl').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('apiKey').value;
    const provider = document.getElementById('apiProvider').value;
    const modelSelect = document.getElementById('modelSelect');

    if (!apiUrl || !apiKey) {
        if (!silent) alert('请填写API地址和密钥');
        return;
    }

    try {
        let models = [];

        if (provider === 'hakimi') {
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

            // 恢复上次选择的模型（优先用 model 字段，兼容旧数据）
            const settings = await storageDB.getItem('apiSettings');
            const savedModel = (settings && (settings.model || settings.lastSelectedModel)) || '';
            if (savedModel) {
                const optionExists = Array.from(modelSelect.options).some(opt => opt.value === savedModel);
                if (optionExists) {
                    modelSelect.value = savedModel;
                    document.getElementById('modelInput').value = savedModel;
                }
            }

            if (!silent) {
                alert(`模型列表获取成功！共 ${models.length} 个模型`);
            }
        } else {
            throw new Error('未找到可用模型');
        }
    } catch (error) {
        if (!silent) {
            alert('获取模型失败: ' + error.message);
        } else {
            console.warn('自动拉取模型失败:', error.message);
        }
        return false;
    }
    return true;
}

// 保存设置
async function saveSettings() {
    const settings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value || document.getElementById('modelSelect').value,
        temperature: parseFloat(document.getElementById('temperatureSlider').value),
        topP: parseFloat(document.getElementById('topPSlider').value),
        maxTokens: parseInt(document.getElementById('maxTokensInput').value) || 2048
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

            // 恢复模型参数
            if (settings.temperature !== undefined) {
                document.getElementById('temperatureSlider').value = settings.temperature;
                document.getElementById('temperatureValue').textContent = settings.temperature;
            }
            if (settings.topP !== undefined) {
                document.getElementById('topPSlider').value = settings.topP;
                document.getElementById('topPValue').textContent = settings.topP;
            }
            if (settings.maxTokens !== undefined) {
                document.getElementById('maxTokensInput').value = settings.maxTokens;
            }
        }
    } catch (error) {
        console.error('加载设置失败:', error);
    }
}

// 页面初始化
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // 禁用所有input的浏览器自动填充提示
        document.querySelectorAll('input').forEach(input => {
            input.setAttribute('autocomplete', 'off');
            input.setAttribute('autocorrect', 'off');
            input.setAttribute('autocapitalize', 'off');
        });
        // 监听动态添加的input，也禁用自动填充
        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        const inputs = node.tagName === 'INPUT' ? [node] : node.querySelectorAll ? node.querySelectorAll('input') : [];
                        inputs.forEach(input => {
                            input.setAttribute('autocomplete', 'off');
                            input.setAttribute('autocorrect', 'off');
                            input.setAttribute('autocapitalize', 'off');
                        });
                    }
                });
            });
        }).observe(document.body, { childList: true, subtree: true });
        
        // 初始化新的IndexedDB存储系统
        console.log(' 正在初始化存储系统...');
        await initIndexedDB();
        
        // 加载照片展示区域的保存照片
        loadShowcasePhoto();
        
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
            // 恢复边框颜色
            const savedBorderColor = localStorage.getItem('phoneBorderColor') || '#ffffff';
            applyBorderColor(savedBorderColor);
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
        
        // 模型下拉框变化时同步到输入框并记住选择
        document.getElementById('modelSelect').addEventListener('change', async function() {
            if (this.value) {
                document.getElementById('modelInput').value = this.value;
                // 记住用户选择的模型
                try {
                    const settings = await storageDB.getItem('apiSettings');
                    if (settings) {
                        settings.lastSelectedModel = this.value;
                        await storageDB.setItem('apiSettings', settings);
                    }
                } catch (e) {
                    console.warn('保存模型选择失败:', e);
                }
            }
        });
        
        // 页面加载时加载保存的设置
        await loadSettings();
        
        // 自动拉取模型列表（如果密钥和地址都已填好，且之前已保存过模型）
        const savedSettings = await storageDB.getItem('apiSettings');
        if (savedSettings && savedSettings.apiUrl && savedSettings.apiKey && savedSettings.model) {
            const success = await fetchModels(true);
            if (success) {
                showToast('模型列表已自动更新');
            } else {
                showToast('模型列表自动拉取失败');
            }
        }
        
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
        
        // 迁移旧的用户数据到按角色存储的格式
        migrateOldUserData();
        
        // 初始化角色后台活动系统
        if (typeof initAllBgActivities === 'function') {
            initAllBgActivities();
            console.log('角色后台活动系统已初始化');
        }
        
        // 初始化表情包匹配功能
        if (typeof initStickerMatch === 'function') {
            initStickerMatch();
            console.log('智能表情包匹配已初始化');
        }
        
        // 缓存方案一HTML并渲染当前方案
        const widgetArea = document.getElementById('widgetArea');
        if (widgetArea) _scheme1Html = widgetArea.innerHTML;
        const activeScheme = getActiveSchemeId();
        if (activeScheme === 'scheme_2') {
            // 等待script2.js加载完成
            if (typeof getScheme2Html === 'function') {
                await renderActiveScheme();
            } else {
                // 如果函数还未定义，等待一小段时间后重试
                setTimeout(async () => {
                    if (typeof getScheme2Html === 'function') {
                        await renderActiveScheme();
                    }
                }, 50);
            }
        }
        
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
        
        // 实时更新聊天界面的用户头像
        const chatUserAvatars = document.querySelectorAll('.chat-message-user .chat-avatar-img');
        chatUserAvatars.forEach(img => {
            img.src = tempAvatarData;
        });
        
        // 更新聊天设置页面的用户头像
        const userAvatarImage = document.getElementById('userAvatarImage');
        if (userAvatarImage) {
            userAvatarImage.src = tempAvatarData;
            userAvatarImage.style.display = 'block';
            const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
            if (userAvatarPlaceholder) {
                userAvatarPlaceholder.style.display = 'none';
            }
        }
        
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
        // 优先从 localStorage 的 chatUserData 加载用户头像
        let avatarSrc = null;
        
        // 方案1：尝试从 localStorage 加载用户头像数据
        try {
            const savedUserData = localStorage.getItem('chatUserData');
            if (savedUserData) {
                const userData = JSON.parse(savedUserData);
                if (userData.avatar) {
                    avatarSrc = userData.avatar;
                    console.log('从 localStorage 加载用户头像');
                }
            }
        } catch (e) {
            console.warn('从 localStorage 加载用户头像失败:', e);
        }
        
        // 方案2：如果 localStorage 没有，再从 IndexedDB 加载小组件头像
        if (!avatarSrc) {
            avatarSrc = await getImageFromDB('widgetAvatar');
            if (avatarSrc) {
                console.log('从 IndexedDB 加载小组件头像');
            }
        }
        
        // 应用头像
        if (avatarSrc) {
            const avatarImage = document.getElementById('avatarImage');
            const avatarPlaceholder = document.getElementById('avatarPlaceholder');
            
            if (avatarImage && avatarPlaceholder) {
                avatarImage.src = avatarSrc;
                avatarImage.style.display = 'block';
                avatarPlaceholder.style.display = 'none';
                console.log('头像已加载并显示');
            }
        } else {
            console.log('未找到保存的头像');
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
    // 获取当前主API配置
    const currentSettings = {
        provider: document.getElementById('apiProvider').value,
        apiUrl: document.getElementById('apiUrl').value,
        apiKey: document.getElementById('apiKey').value,
        model: document.getElementById('modelInput').value,
        temperature: parseFloat(document.getElementById('temperatureSlider').value),
        topP: parseFloat(document.getElementById('topPSlider').value),
        maxTokens: parseInt(document.getElementById('maxTokensInput').value) || 2048
    };

    // 获取副API配置（如果有填写）
    const secProvider = document.getElementById('secApiProvider') ? document.getElementById('secApiProvider').value : '';
    const secUrl = document.getElementById('secApiUrl') ? document.getElementById('secApiUrl').value : '';
    const secKey = document.getElementById('secApiKey') ? document.getElementById('secApiKey').value : '';
    const secModel = document.getElementById('secModelInput') ? document.getElementById('secModelInput').value : '';

    if (secUrl && secKey) {
        currentSettings.secProvider = secProvider;
        currentSettings.secApiUrl = secUrl;
        currentSettings.secApiKey = secKey;
        currentSettings.secModel = secModel;
    }

    // 检查至少主API或副API有配置
    const hasMain = currentSettings.provider && currentSettings.apiUrl && currentSettings.apiKey;
    const hasSec = currentSettings.secApiUrl && currentSettings.secApiKey;
    if (!hasMain && !hasSec) {
        alert('请先至少填写一组API配置！');
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

        // 应用主API配置
        if (preset.provider) {
            document.getElementById('apiProvider').value = preset.provider;
            document.getElementById('apiKey').value = preset.apiKey || '';
            document.getElementById('modelInput').value = preset.model || '';
            handleProviderChange();
            if (preset.apiUrl) {
                document.getElementById('apiUrl').value = preset.apiUrl;
            }
        }

        // 恢复模型参数
        if (preset.temperature !== undefined) {
            document.getElementById('temperatureSlider').value = preset.temperature;
            document.getElementById('temperatureValue').textContent = preset.temperature;
        } else {
            document.getElementById('temperatureSlider').value = 0.9;
            document.getElementById('temperatureValue').textContent = '0.9';
        }
        if (preset.topP !== undefined) {
            document.getElementById('topPSlider').value = preset.topP;
            document.getElementById('topPValue').textContent = preset.topP;
        } else {
            document.getElementById('topPSlider').value = 0.95;
            document.getElementById('topPValue').textContent = '0.95';
        }
        if (preset.maxTokens !== undefined) {
            document.getElementById('maxTokensInput').value = preset.maxTokens;
        } else {
            document.getElementById('maxTokensInput').value = 2048;
        }

        // 应用副API配置
        const secProviderEl = document.getElementById('secApiProvider');
        const secUrlEl = document.getElementById('secApiUrl');
        const secKeyEl = document.getElementById('secApiKey');
        const secModelEl = document.getElementById('secModelInput');
        const secModelSelect = document.getElementById('secModelSelect');

        if (secProviderEl) {
            if (preset.secApiUrl && preset.secApiKey) {
                secProviderEl.value = preset.secProvider || 'hakimi';
                secKeyEl.value = preset.secApiKey || '';
                secModelEl.value = preset.secModel || '';
                if (typeof handleSecProviderChange === 'function') handleSecProviderChange();
                if (preset.secApiUrl) secUrlEl.value = preset.secApiUrl;
            } else {
                // 预设没有副API，清空副API区域
                secProviderEl.value = 'hakimi';
                secUrlEl.value = '';
                secKeyEl.value = '';
                secModelEl.value = '';
                if (secModelSelect) secModelSelect.innerHTML = '<option value="">从列表选择模型</option>';
                if (typeof handleSecProviderChange === 'function') handleSecProviderChange();
            }
        }

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

// 加载预设列表到下拉框
async function loadPresetList() {
    try {
        const presetSelect = document.getElementById('presetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        presetSelect.innerHTML = '<option value="">选择预设...</option>';

        if (presetNames.length > 0) {
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            const providerMap = { 'hakimi': 'Gemini', 'claude': 'Claude', 'ds': 'DeepSeek', 'custom': 'Custom' };

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;

                const mainName = providerMap[preset.provider] || preset.provider;
                let label = `${name} (${mainName})`;
                if (preset.secApiUrl && preset.secApiKey) {
                    const secName = providerMap[preset.secProvider] || preset.secProvider || '';
                    label = `${name} (主:${mainName} 副:${secName})`;
                }
                option.textContent = label;
                presetSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('加载预设列表失败:', error);
    }
}

// 加载删除弹窗中的预设列表
async function loadDeletePresetList() {
    try {
        const deleteSelect = document.getElementById('deletePresetSelect');
        const presets = await storageDB.getItem('apiPresets') || {};
        const presetNames = Object.keys(presets);

        deleteSelect.innerHTML = '';

        if (presetNames.length === 0) {
            const option = document.createElement('option');
            option.value = '';
            option.disabled = true;
            option.style.color = '#999';
            option.textContent = '暂无预设';
            deleteSelect.appendChild(option);
        } else {
            presetNames.sort((a, b) => {
                const timeA = new Date(presets[a].createdAt || 0).getTime();
                const timeB = new Date(presets[b].createdAt || 0).getTime();
                return timeB - timeA;
            });

            const providerMap = { 'hakimi': 'Gemini', 'claude': 'Claude', 'ds': 'DeepSeek', 'custom': 'Custom' };

            presetNames.forEach(name => {
                const preset = presets[name];
                const option = document.createElement('option');
                option.value = name;

                const mainName = providerMap[preset.provider] || preset.provider;
                let label = `${name} (${mainName})`;
                if (preset.secApiUrl && preset.secApiKey) {
                    const secName = providerMap[preset.secProvider] || preset.secProvider || '';
                    label = `${name} (主:${mainName} 副:${secName})`;
                }
                option.textContent = label;
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
    const friendsTabContent = document.getElementById('friendsTabContent');
    
    if (chatTabContent) chatTabContent.style.display = 'none';
    if (profileTabContent) profileTabContent.style.display = 'none';
    if (friendsTabContent) friendsTabContent.style.display = 'none';

    // 显示对应的标签页内容
    switch(tab) {
        case 'chat':
            if (chatTabContent) chatTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            // 如果聊天详情页正在显示，刷新拉黑UI
            const chatDetailPage = document.getElementById('chatDetailPage');
            if (chatDetailPage && chatDetailPage.style.display !== 'none' && currentChatCharacter) {
                if (typeof updateBlockUI === 'function') {
                    if (typeof loadBlockConfigFromDB === 'function') {
                        loadBlockConfigFromDB(currentChatCharacter.id).then(() => {
                            updateBlockUI(currentChatCharacter.id);
                        });
                    } else {
                        updateBlockUI(currentChatCharacter.id);
                    }
                }
            }
            renderChatList(); // 刷新聊天列表
            break;
        case 'friends':
            if (friendsTabContent) friendsTabContent.style.display = 'flex';
            if (chatHeader) chatHeader.style.display = 'flex';
            if (typeof renderFriendRequestList === 'function') renderFriendRequestList();
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

// 打开好友申请页面（已废弃，保留为空函数避免报错）
function openFriendRequestPage() {
    // 好友申请已移至好友标签页内
}

// 关闭好友申请页面（已废弃）
function closeFriendRequestPage() {
    // 好友申请已移至好友标签页内
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
    const width = canvasId === 'profileBarcodePreview' ? 200 : 56;
    const height = canvasId === 'profileBarcodePreview' ? 50 : 25;
    
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
        
        const docImportBtn = document.createElement('button');
        docImportBtn.className = 'ios-dialog-button primary';
        docImportBtn.textContent = '文档导入';
        docImportBtn.onclick = () => {
            closeDialog();
            openDocumentImport();
        };
        
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(manualBtn);
        buttonsEl.appendChild(importBtn);
        buttonsEl.appendChild(docImportBtn);
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
        let pngAvatarData = null;
        
        if (file.name.endsWith('.json')) {
            // 处理 JSON 文件
            const text = await file.text();
            characterData = JSON.parse(text);
        } else if (file.name.endsWith('.png')) {
            // 处理 PNG 文件，从 tEXt 块中提取 JSON
            characterData = await extractCharacterFromPNG(file);
            // PNG文件本身作为头像，压缩后存储
            pngAvatarData = await compressImage(file, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.8,
                maxSizeKB: 200
            });
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
        
        // 如果是PNG，把图片数据附加到解析结果上
        if (pngAvatarData) {
            parsedCharacterCard.avatarData = pngAvatarData;
        }
        
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

// 读取文件为 DataURL（用于PNG头像提取）
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('文件读取失败'));
        reader.readAsDataURL(file);
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
            avatar: parsedCharacterCard.avatarData || '', // 使用PNG图片作为头像
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
async function renderChatList() {
    const container = document.getElementById('chatListContainer');
    
    if (chatCharacters.length === 0) {
        container.innerHTML = `
            <div class="chat-empty-state">
                <div class="chat-empty-text">暂无聊天记录</div>
            </div>
        `;
        return;
    }
    
    // 一次性从数据库获取所有聊天记录，避免多次查询
    let allChats = [];
    try {
        allChats = await getAllChatsFromDB();
    } catch (e) {
        console.warn('获取聊天记录失败，使用缓存:', e);
    }
    
    // 为每个角色从数据库中取实际的最后一条消息
    const charLastMsgMap = {};
    chatCharacters.forEach(char => {
        const charMsgs = allChats.filter(m => m.characterId === char.id);
        if (charMsgs.length > 0) {
            charMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            const last = charMsgs[0];
            let previewText = '';
            if (last.messageType === 'image') previewText = '[图片]';
            else if (last.messageType === 'textImage') previewText = '[图片]';
            else if (last.messageType === 'sticker') previewText = '[表情包]';
            else if (last.messageType === 'voice') previewText = '[语音消息]';
            else if (last.messageType === 'transfer') previewText = '[转账]';
            else if (last.messageType === 'location') previewText = '[位置]';
            else if (last.messageType === 'bankTransfer') previewText = '[银行转账]';
            else if (last.messageType === 'avatarChange') previewText = '[更换头像]';
            else if (last.messageType === 'coupleAvatarChange') previewText = '[更换情头]';
            else if (last.messageType === 'systemNotice') previewText = last.content || '';
            else previewText = (last.content || '').substring(0, 50);
            charLastMsgMap[char.id] = { text: previewText, time: last.timestamp };
        }
    });
    
    // 排序：置顶的在前面，然后按最后消息时间排序
    const sortedChars = [...chatCharacters].sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const timeA = charLastMsgMap[a.id] ? charLastMsgMap[a.id].time : a.lastMessageTime;
        const timeB = charLastMsgMap[b.id] ? charLastMsgMap[b.id].time : b.lastMessageTime;
        return new Date(timeB) - new Date(timeA);
    });
    
    let html = '';
    sortedChars.forEach(char => {
        const avatarHtml = char.avatar 
            ? `<img src="${char.avatar}" alt="${char.remark}">`
            : '<span style="font-size: 12px; color: #666;">头像</span>';
        
        // 从数据库实际数据获取预览，没有则用缓存兜底
        const dbMsg = charLastMsgMap[char.id];
        const displayMessage = dbMsg ? dbMsg.text : (char.lastMessage || '');
        const displayTime = dbMsg ? dbMsg.time : char.lastMessageTime;
        
        // 格式化时间
        const timeStr = displayTime ? formatChatTime(displayTime) : '';
        
        // 置顶标记
        const pinnedClass = char.isPinned ? ' chat-list-item-pinned' : '';
        
        // 未读消息红点
        const unread = char.unreadCount || 0;
        const badgeHtml = unread > 0 ? `<div class="chat-list-badge">${unread > 99 ? '99+' : unread}</div>` : '';
        
        html += `
            <div class="chat-list-item${pinnedClass}" 
                 data-char-id="${char.id}"
                 onclick="openChatDetail('${char.id}')"
                 ontouchstart="handleChatItemTouchStart(event, '${char.id}')"
                 ontouchend="handleChatItemTouchEnd(event)"
                 ontouchmove="handleChatItemTouchMove(event)">
                <div class="chat-list-avatar">${avatarHtml}</div>
                <div class="chat-list-info">
                    <div class="chat-list-name">${escapeHtml(char.remark)}${char.isPinned ? ' <span style="color: #999; font-size: 11px;">[置顶]</span>' : ''}${typeof getCharacterStatusDot === 'function' ? (() => { const dot = getCharacterStatusDot(char.id); return dot ? `<span class="chat-list-status-dot ${dot}"></span>` : ''; })() : ''}</div>
                    <div class="chat-list-message">${escapeHtml(replaceAtUserInPreview(displayMessage, char.id))}</div>
                </div>
                <div class="chat-list-right">
                    <div class="chat-list-time">${timeStr}</div>
                    ${badgeHtml}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // 初始化聊天列表项的右键菜单（事件委托）
    initChatListContextMenu();
    
    // 如果搜索框有内容，重新应用过滤
    const searchInput = document.getElementById('chatSearchInput');
    if (searchInput && searchInput.value.trim()) {
        filterChatList(searchInput.value);
    }
}

// 搜索过滤聊天列表
function filterChatList(keyword) {
    const container = document.getElementById('chatListContainer');
    if (!container) return;
    const items = container.querySelectorAll('.chat-list-item[data-char-id]');
    const kw = (keyword || '').trim().toLowerCase();
    
    if (!kw) {
        // 没有关键词，显示全部
        items.forEach(item => item.style.display = '');
        // 隐藏空状态
        const emptyState = container.querySelector('.chat-empty-state');
        if (emptyState) emptyState.style.display = chatCharacters.length === 0 ? '' : 'none';
        return;
    }
    
    let visibleCount = 0;
    items.forEach(item => {
        const charId = item.dataset.charId;
        const char = chatCharacters.find(c => c.id === charId);
        if (!char) { item.style.display = 'none'; return; }
        
        // 匹配备注名、角色名
        const remark = (char.remark || '').toLowerCase();
        const name = (char.name || '').toLowerCase();
        const desc = (char.description || '').toLowerCase();
        
        if (remark.includes(kw) || name.includes(kw) || desc.includes(kw)) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 如果没有匹配结果，显示提示
    let noResult = container.querySelector('.chat-search-no-result');
    if (visibleCount === 0) {
        if (!noResult) {
            noResult = document.createElement('div');
            noResult.className = 'chat-search-no-result';
            noResult.style.cssText = 'text-align:center;padding:40px 20px;color:#999;font-size:14px;';
            container.appendChild(noResult);
        }
        noResult.textContent = `没有找到"${keyword}"相关的角色`;
        noResult.style.display = '';
    } else if (noResult) {
        noResult.style.display = 'none';
    }
}

// 初始化聊天列表右键菜单（只初始化一次）
function initChatListContextMenu() {
    const container = document.getElementById('chatListContainer');
    if (!container || container._contextMenuInited) return;
    container._contextMenuInited = true;
    
    // PC端右键菜单
    container.addEventListener('contextmenu', function(e) {
        const item = e.target.closest('.chat-list-item[data-char-id]');
        if (item) {
            e.preventDefault();
            const characterId = item.dataset.charId;
            // 创建一个模拟事件对象
            const fakeEvent = { preventDefault: () => {}, stopPropagation: () => {} };
            showChatItemMenu(fakeEvent, characterId);
        }
    });
}

// 长按相关变量
let touchTimer = null;
let touchMoved = false;
let longPressTriggered = false;
let lastMenuShowTime = 0; // 防抖：记录上次菜单显示时间

// 触摸开始
function handleChatItemTouchStart(event, characterId) {
    touchMoved = false;
    longPressTriggered = false;
    touchTimer = setTimeout(() => {
        if (!touchMoved) {
            longPressTriggered = true;
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
    // 延迟重置标志，确保 contextmenu 事件已被拦截
    if (longPressTriggered) {
        setTimeout(() => {
            longPressTriggered = false;
        }, 300);
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
    // 防抖检查：500ms内重复调用直接忽略
    const now = Date.now();
    if (now - lastMenuShowTime < 500) {
        console.log('防抖：忽略重复的菜单调用');
        return;
    }
    lastMenuShowTime = now;
    
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
let aiRespondingCharacterIds = new Set(); // 追踪正在AI调用中的角色ID（支持多个同时调用）

// ========== 按角色存储用户数据的辅助函数 ==========

/**
 * 获取指定角色的用户数据
 * @param {string} characterId - 角色ID
 * @returns {object} 用户数据对象 {avatar, name, description}
 */
function getUserDataForCharacter(characterId) {
    if (!characterId) {
        return { avatar: '', name: '', description: '' };
    }
    
    try {
        const key = 'chatUserData_' + characterId;
        const data = localStorage.getItem(key);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('读取角色用户数据失败:', e);
    }
    
    return { avatar: '', name: '', description: '' };
}

/**
 * 保存指定角色的用户数据
 * @param {string} characterId - 角色ID
 * @param {object} userData - 用户数据对象 {avatar, name, description}
 */
function saveUserDataForCharacter(characterId, userData) {
    if (!characterId) {
        console.error('保存用户数据失败：角色ID为空');
        return;
    }
    
    try {
        const key = 'chatUserData_' + characterId;
        localStorage.setItem(key, JSON.stringify(userData));
        console.log('✅ 已保存角色用户数据:', characterId, userData);
    } catch (e) {
        console.error('保存角色用户数据失败:', e);
    }
}

/**
 * 迁移旧的全局用户数据到按角色存储的格式
 * 只在首次加载时执行一次
 */
function migrateOldUserData() {
    try {
        // 检查是否已经迁移过
        const migrated = localStorage.getItem('userDataMigrated');
        if (migrated === 'true') {
            return; // 已经迁移过，跳过
        }
        
        // 检查是否存在旧的全局用户数据
        const oldUserData = localStorage.getItem('chatUserData');
        if (!oldUserData) {
            // 没有旧数据，标记为已迁移
            localStorage.setItem('userDataMigrated', 'true');
            return;
        }
        
        console.log('🔄 检测到旧的用户数据，开始迁移...');
        
        // 解析旧数据
        const userData = JSON.parse(oldUserData);
        
        // 如果有角色，将数据应用到所有现有角色
        if (chatCharacters && chatCharacters.length > 0) {
            chatCharacters.forEach(char => {
                saveUserDataForCharacter(char.id, userData);
            });
            console.log(`✅ 已将用户数据迁移到 ${chatCharacters.length} 个角色`);
        }
        
        // 删除旧的全局数据
        localStorage.removeItem('chatUserData');
        
        // 标记为已迁移
        localStorage.setItem('userDataMigrated', 'true');
        
        console.log('✅ 用户数据迁移完成');
    } catch (e) {
        console.error('❌ 用户数据迁移失败:', e);
        // 即使失败也标记为已迁移，避免重复尝试
        localStorage.setItem('userDataMigrated', 'true');
    }
}

// 判断用户是否正在查看某个角色的聊天界面
function isUserInChatDetail(characterId) {
    const page = document.getElementById('chatDetailPage');
    return page && page.style.display === 'block' && currentChatCharacter && currentChatCharacter.id === characterId;
}

// 打开聊天详情
async function openChatDetail(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    
    currentChatCharacter = character;
    
    // 清除未读消息计数
    if (character.unreadCount > 0) {
        character.unreadCount = 0;
        await saveChatCharacters();
        renderChatList();
    }
    
    // 设置备注名称
    document.getElementById('chatDetailName').textContent = character.remark;
    
    // 更新角色后台活动状态显示
    if (typeof updateBgActivityStatusUI === 'function') {
        updateBgActivityStatusUI(characterId);
    }
    
    // 初始化用户头像（按角色加载）
    const userData = getUserDataForCharacter(characterId);
    if (userData.avatar) {
        try {
            const userAvatarImg = document.getElementById('userAvatarImage');
            const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
            
            if (userAvatarImg && userAvatarPlaceholder) {
                userAvatarImg.src = userData.avatar;
                userAvatarImg.style.display = 'block';
                userAvatarPlaceholder.style.display = 'none';
            }
        } catch (e) {
            console.error('加载用户头像失败:', e);
        }
    }
    
    // 加载历史消息
    await loadChatMessages(characterId);
    
    // 显示聊天界面
    document.getElementById('chatDetailPage').style.display = 'block';
    
    // 应用聊天背景
    await applyChatDetailBg();
    
    // 如果这个角色正在AI调用中，重新显示typing indicator
    if (aiRespondingCharacterIds.has(characterId)) {
        showTypingIndicator();
        disableSendButton();
    }
    
    // 滚动到底部
    scrollChatToBottom();
    
    // 初始化长按菜单
    setTimeout(() => {
        initMsgContextMenu();
    }, 300);

    // 更新拉黑UI
    if (typeof updateBlockUI === 'function') {
        if (typeof loadBlockConfigFromDB === 'function') {
            await loadBlockConfigFromDB(characterId);
        }
        updateBlockUI(characterId);
    }
}

// 加载聊天历史消息
async function loadChatMessages(characterId) {
    try {
        const container = document.getElementById('chatMessagesContainer');
        
        // 清空现有消息（这会移除事件监听器，所以需要重置初始化标志）
        container.innerHTML = '';
        container._msgMenuInited = false;
        
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
    // AI调用已使用捕获的角色引用，可以安全清空全局变量
    currentChatCharacter = null;
    
    // 清理长按菜单初始化标志，以便下次打开时重新初始化
    const container = document.getElementById('chatMessagesContainer');
    if (container) {
        container._msgMenuInited = false;
    }
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
    
    // 检查是否是群聊
    const isGroup = currentChatCharacter.groupType === 'group';
    
    const charTab = document.getElementById('charTab');
    if (!charTab) {
        console.error('找不到角色标签页');
        return;
    }
    
    // 查找或创建群聊专属容器
    let groupContainer = document.getElementById('groupChatContainer');
    const originalContent = charTab.querySelector('.settings-card');
    
    if (isGroup) {
        // 群聊模式
        console.log('打开群聊设置，群聊ID:', currentChatCharacter.id);
        console.log('群聊成员:', currentChatCharacter.members);
        
        // 隐藏原始单聊内容
        if (originalContent) {
            originalContent.style.display = 'none';
        }
        
        // 如果群聊容器不存在，创建它
        if (!groupContainer) {
            groupContainer = document.createElement('div');
            groupContainer.id = 'groupChatContainer';
            charTab.appendChild(groupContainer);
        }
        
        // 获取成员列表
        const memberIds = currentChatCharacter.members || [];
        const members = memberIds.map(id => {
            const member = chatCharacters.find(c => c.id === id);
            if (!member) {
                console.warn(`找不到成员 ID=${id}`);
            }
            return member;
        }).filter(Boolean);
        
        console.log('找到的成员对象:', members);
        
        // 创建成员列表HTML
        let membersHTML = '';
        if (members.length > 0) {
            membersHTML = members.map(member => `
                <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f8f8; border-radius: 12px; margin-bottom: 10px;">
                    <div style="width: 45px; height: 45px; border-radius: 50%; background: #e0e0e0; overflow: hidden; flex-shrink: 0;">
                        ${member.avatar ? `<img src="${member.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">头像</div>'}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px;">${escapeHtml(member.remark || member.name || '未知')}</div>
                        <div style="font-size: 12px; color: #999;">ID: ${member.id.substring(0, 8)}...</div>
                    </div>
                </div>
            `).join('');
        } else {
            membersHTML = '<div style="text-align: center; color: #999; padding: 20px;">找不到群成员</div>';
        }
        
        // 填充群聊内容
        groupContainer.innerHTML = `
            <div class="settings-card">
                <div class="section-title">
                    <span class="section-title-text">群聊信息</span>
                </div>
                
                <div class="form-group">
                    <label class="form-label">群头像</label>
                    <div style="width: 80px; height: 80px; border-radius: 50%; background: #e0e0e0; overflow: hidden; margin: 0 auto;">
                        ${currentChatCharacter.avatar ? `<img src="${currentChatCharacter.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #999;">群头像</div>'}
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">群名称</label>
                    <div style="padding: 12px; background: #f5f5f5; border-radius: 8px; color: #333; text-align: center;">
                        ${escapeHtml(currentChatCharacter.groupName || currentChatCharacter.name || '未命名群聊')}
                    </div>
                </div>
                
                <div class="section-title" style="margin-top: 30px;">
                    <span class="section-title-text">群成员 (${members.length}人)</span>
                </div>
                
                <div style="max-height: 300px; overflow-y: auto; margin-bottom: 20px;">
                    ${membersHTML}
                </div>
                
                <!-- 成员消息数量设置 -->
                <div class="section-title" style="margin-top: 30px;">
                    <span class="section-title-text">成员发言设置</span>
                </div>
                
                <div class="form-group">
                    <label class="form-label">每轮最少消息数</label>
                    <input type="number" class="form-input" id="groupMinMessages" value="${currentChatCharacter.settings?.minMessagesPerMember || 1}" min="0" onchange="updateGroupMessageRange()">
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                        每个成员每轮至少发几条消息
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="form-label">每轮最多消息数</label>
                    <input type="number" class="form-input" id="groupMaxMessages" value="${currentChatCharacter.settings?.maxMessagesPerMember || 5}" min="0" onchange="updateGroupMessageRange()">
                    <div style="margin-top: 8px; font-size: 12px; color: #666;">
                        每个成员每轮最多发几条消息
                    </div>
                </div>
                
                <div class="section-title" style="margin-top: 30px;">
                    <span class="section-title-text">群聊设置</span>
                </div>
                
                <div class="form-group">
                    <button class="btn-primary" onclick="openGroupMemberManagement()" style="width: 100%;">
                        成员管理
                    </button>
                </div>
                
                <div class="form-group">
                    <button class="btn-primary" onclick="openGroupRelationManagement()" style="width: 100%;">
                        成员关系设置
                    </button>
                </div>
            </div>
        `;
        
        groupContainer.style.display = 'block';
        
    } else {
        // 单人聊天模式
        
        // 隐藏群聊容器
        if (groupContainer) {
            groupContainer.style.display = 'none';
        }
        
        // 显示原始单聊内容
        if (originalContent) {
            originalContent.style.display = 'block';
        }
        
        // 加载角色信息
        const charAvatarImg = document.getElementById('charAvatarImage');
        const charAvatarPlaceholder = document.getElementById('charAvatarPlaceholder');
        
        if (charAvatarImg && charAvatarPlaceholder) {
            if (currentChatCharacter.avatar) {
                charAvatarImg.src = currentChatCharacter.avatar;
                charAvatarImg.style.display = 'block';
                charAvatarPlaceholder.style.display = 'none';
            } else {
                charAvatarImg.style.display = 'none';
                charAvatarPlaceholder.style.display = 'block';
            }
        }
        
        const charNameInput = document.getElementById('charNameInput');
        const charRemarkInput = document.getElementById('charRemarkInput');
        const charDescInput = document.getElementById('charDescInput');
        
        if (charNameInput) charNameInput.value = currentChatCharacter.name || '';
        if (charRemarkInput) charRemarkInput.value = currentChatCharacter.remark || '';
        if (charDescInput) charDescInput.value = currentChatCharacter.description || '';
    }
    
    // 加载用户信息（按角色分开存储）
    const userData = getUserDataForCharacter(currentChatCharacter.id);
    
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    
    if (userAvatarImg && userAvatarPlaceholder) {
        if (userData.avatar) {
            userAvatarImg.src = userData.avatar;
            userAvatarImg.style.display = 'block';
            userAvatarPlaceholder.style.display = 'none';
        } else {
            userAvatarImg.style.display = 'none';
            userAvatarPlaceholder.style.display = 'block';
        }
    }
    
    const userNameInput = document.getElementById('userNameInput');
    const userDescInput = document.getElementById('userDescInput');
    
    if (userNameInput) userNameInput.value = userData.name || '';
    if (userDescInput) userDescInput.value = userData.description || '';
    
    // 初始化银行卡转账设置
    if (typeof initBankTransferSettings === 'function') {
        initBankTransferSettings();
    }
    
    // 加载已绑定的世界书
    const boundWorldBookIds = currentChatCharacter.boundWorldBooks || [];
    updateBoundWorldBooksDisplay(boundWorldBookIds);
    
    // 加载短期记忆设置
    const shortTermMemory = currentChatCharacter.shortTermMemory || 10; // 默认10条
    const shortTermMemoryInput = document.getElementById('shortTermMemoryInput');
    if (shortTermMemoryInput) shortTermMemoryInput.value = shortTermMemory;
    
    // 加载长期记忆设置
    if (typeof initLongTermMemorySettings === 'function') {
        initLongTermMemorySettings();
    }
    
    // 加载挂载聊天记录设置
    if (typeof initMountChatSettings === 'function') {
        initMountChatSettings();
    }
    
    // 加载时间感知设置（默认开启）
    const timeAwareness = currentChatCharacter.timeAwareness !== undefined ? currentChatCharacter.timeAwareness : true;
    const timeAwarenessToggle = document.getElementById('timeAwarenessToggle');
    if (timeAwarenessToggle) timeAwarenessToggle.checked = timeAwareness;
    
    // 加载角色主动来电设置（默认开启）
    const incomingCallEnabled = currentChatCharacter.incomingCallEnabled !== undefined ? currentChatCharacter.incomingCallEnabled : true;
    const incomingCallToggle = document.getElementById('incomingCallToggle');
    if (incomingCallToggle) incomingCallToggle.checked = incomingCallEnabled;
    
    // 加载自定义时间设置
    if (typeof loadCustomTimeSettings === 'function') {
        loadCustomTimeSettings();
    }
    
    // 加载系统卡片显示设置（默认开启）
    const showSystemCardBubbles = localStorage.getItem('showSystemCardBubbles') !== 'false';
    const showSystemCardBubblesToggle = document.getElementById('showSystemCardBubblesToggle');
    if (showSystemCardBubblesToggle) showSystemCardBubblesToggle.checked = showSystemCardBubbles;
    
    // 加载情头模式设置（默认关闭）
    if (typeof getCoupleMode === 'function') {
        const coupleModeEnabled = getCoupleMode();
        const coupleModeToggle = document.getElementById('coupleModeToggle');
        if (coupleModeToggle) coupleModeToggle.checked = coupleModeEnabled;
    }
    
    // 加载记忆库存档列表
    if (typeof renderMemoryArchiveList === 'function') {
        renderMemoryArchiveList();
    }
    
    // 加载表情包匹配设置
    if (typeof initStickerMatchSettings === 'function') {
        initStickerMatchSettings();
    }
    
    // 初始化角色后台活动设置
    if (typeof initBgActivitySettings === 'function') {
        initBgActivitySettings();
    }
    
    // 初始化独立定时主动消息设置
    if (typeof initIndProactiveSettings === 'function') {
        initIndProactiveSettings();
    }
    
    // 初始化气泡颜色设置
    if (typeof initBubbleColorSettings === 'function') {
        initBubbleColorSettings();
    }
    
    // 初始化国籍选择器和汇率模式选择器
    if (typeof initNationalitySelector === 'function') {
        initNationalitySelector();
    }
    if (typeof initExchangeRateModeSelector === 'function') {
        initExchangeRateModeSelector();
    }
    
    // 显示设置界面
    document.getElementById('chatSettingsPage').style.display = 'block';

    // 更新拉黑按钮状态
    if (typeof updateBlockButtonInSettings === 'function') {
        updateBlockButtonInSettings();
    }
}

// 关闭聊天设置界面
function closeChatSettingsPage() {
    document.getElementById('chatSettingsPage').style.display = 'none';
    // 清理觉醒时间刷新定时器
    if (typeof _wakeTimeRefreshInterval !== 'undefined' && _wakeTimeRefreshInterval) {
        clearInterval(_wakeTimeRefreshInterval);
        _wakeTimeRefreshInterval = null;
    }
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
            'advanced': '高级',
            'beautify': '美化'
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
    
    // 如果切换到美化标签页，更新当前气泡形状显示
    if (tabName === 'beautify' && typeof updateCurrentBubbleShapeDisplay === 'function') {
        updateCurrentBubbleShapeDisplay();
    }
}

// 长期记忆格式选择变化
function onLongTermMemoryFormatChange() {
    const select = document.getElementById('longTermMemoryFormatSelect');
    const preview = document.getElementById('longTermMemoryFormatPreview');
    const customGroup = document.getElementById('longTermMemoryCustomPromptGroup');
    const customInput = document.getElementById('longTermMemoryCustomPromptInput');

    const format = select.value;

    if (format === 'custom') {
        customGroup.style.display = 'block';
        preview.textContent = '使用自定义提示词进行总结';
        
        // 如果输入框为空，自动填入日记式作为示例（需要从script2.js获取）
        if (!customInput.value.trim() && typeof LTM_SIMPLE_PROMPTS !== 'undefined') {
            customInput.value = LTM_SIMPLE_PROMPTS.diary;
        }
    } else {
        customGroup.style.display = 'none';
        // 显示预设格式的预览（需要从script2.js获取）
        if (typeof LTM_FORMAT_TEMPLATES !== 'undefined' && LTM_FORMAT_TEMPLATES[format]) {
            const template = LTM_FORMAT_TEMPLATES[format];
            preview.textContent = `${template.label}：${template.preview}`;
        }
    }
}

// 精简格式切换处理
function onLtmCondenseFormatChange() {
    const select = document.getElementById('ltmCondenseFormatSelect');
    const preview = document.getElementById('ltmCondenseFormatPreview');
    const customGroup = document.getElementById('ltmCondenseCustomPromptGroup');
    const customInput = document.getElementById('ltmCondensePromptInput');

    const format = select.value;

    if (format === 'custom') {
        customGroup.style.display = 'block';
        preview.textContent = '使用自定义提示词进行精简';
        
        // 如果输入框为空，自动填入第一人称作为示例（需要从script2.js获取）
        if (!customInput.value.trim() && typeof LTM_CONDENSE_FORMATS !== 'undefined') {
            customInput.value = LTM_CONDENSE_FORMATS['first-person'].prompt;
        }
    } else {
        customGroup.style.display = 'none';
        // 显示预设格式的预览（需要从script2.js获取）
        if (typeof LTM_CONDENSE_FORMATS !== 'undefined') {
            const formatConfig = LTM_CONDENSE_FORMATS[format];
            if (formatConfig) {
                preview.textContent = formatConfig.preview;
            }
        }
    }
}

// ========== 长期记忆相关函数 ==========
// 这些函数在HTML中被直接调用，所以放在script.js中

// 打开长期记忆管理库
async function openLongTermMemoryManager() {
    if (!currentChatCharacter) return;
    document.getElementById('longTermMemoryPage').style.display = 'block';
    if (typeof renderLongTermMemoryList === 'function') {
        await renderLongTermMemoryList();
    }
}

// 手动添加长期记忆
async function addLongTermMemoryManual() {
    if (!currentChatCharacter) {
        console.error('没有当前角色');
        return;
    }

    console.log('打开添加记忆弹窗，当前角色:', currentChatCharacter.name);

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10003;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:300px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

    const header = document.createElement('div');
    header.style.cssText = 'padding:22px 24px 12px;text-align:center;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:600;color:#333;';
    title.textContent = '添加长期记忆';
    header.appendChild(title);

    const body = document.createElement('div');
    body.style.cssText = 'padding:8px 24px 16px;';
    const textarea = document.createElement('textarea');
    textarea.className = 'ltm-edit-textarea';
    textarea.placeholder = '输入记忆内容...';
    textarea.style.cssText += 'width:100%;min-height:100px;';
    body.appendChild(textarea);

    const footer = document.createElement('div');
    footer.style.cssText = 'padding:0 24px 20px;display:flex;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;';
    saveBtn.textContent = '保存';
    saveBtn.onclick = async () => {
        const content = textarea.value.trim();
        if (!content) {
            await showIosAlert('提示', '请输入记忆内容');
            return;
        }
        
        console.log('开始保存记忆:', content);
        
        try {
            // 添加记忆
            await addLongTermMemory(currentChatCharacter.id, content, 'manual');
            console.log('记忆已添加到数据库');
            
            // 刷新列表
            await renderLongTermMemoryList();
            console.log('列表已刷新');
            
            // 关闭弹窗
            closeDialog();
            
            showToast('已添加');
        } catch (error) {
            console.error('添加记忆失败:', error);
            await showIosAlert('错误', '添加失败: ' + error.message);
        }
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(saveBtn);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
        card.style.opacity = '1';
    });

    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeDialog();
    });

    setTimeout(() => textarea.focus(), 400);

    function closeDialog() {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(20px)';
        card.style.opacity = '0';
        setTimeout(() => { 
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
}

// 开始精简模式
function startCondenseMode() {
    if (!currentChatCharacter) return;
    if (typeof ltmCondenseMode !== 'undefined') {
        ltmCondenseMode = true;
    }
    if (typeof ltmCondenseSelected !== 'undefined') {
        ltmCondenseSelected.clear();
    }
    const btn = document.getElementById('ltmCondenseBtn');
    if (btn) {
        btn.textContent = '取消';
        btn.onclick = exitCondenseMode;
    }
    if (typeof renderCondenseMemoryList === 'function') {
        renderCondenseMemoryList();
    }
    if (typeof showCondenseBar === 'function') {
        showCondenseBar();
    }
}

// 退出精简模式
function exitCondenseMode() {
    if (typeof ltmCondenseMode !== 'undefined') {
        ltmCondenseMode = false;
    }
    if (typeof ltmCondenseSelected !== 'undefined') {
        ltmCondenseSelected.clear();
    }
    const btn = document.getElementById('ltmCondenseBtn');
    if (btn) {
        btn.textContent = '精简';
        btn.onclick = startCondenseMode;
    }
    if (typeof removeCondenseBar === 'function') {
        removeCondenseBar();
    }
    if (typeof renderLongTermMemoryList === 'function') {
        renderLongTermMemoryList();
    }
}

// 打开手动总结弹窗
async function openManualSummaryModal() {
    if (!currentChatCharacter) return;

    // 获取当前角色的所有消息
    const allChats = await getAllChatsFromDB();
    const msgs = allChats.filter(m => m.characterId === currentChatCharacter.id);
    msgs.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

    if (msgs.length < 2) {
        showIosAlert('提示', '消息太少，至少需要2条消息才能总结');
        return;
    }

    const total = msgs.length;

    // 获取真名
    const charName = currentChatCharacter.name || '角色';
    let userName = '用户';
    try {
        const ud = getUserDataForCharacter(currentChatCharacter.id);
        if (ud.name) userName = ud.name;
    } catch (e) {}

    // 构建弹窗
    const overlay = document.createElement('div');
    overlay.id = 'manualSummaryOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10003;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:320px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);max-height:80vh;overflow-y:auto;';

    // 标题
    const header = document.createElement('div');
    header.style.cssText = 'padding:22px 24px 8px;text-align:center;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:600;color:#333;';
    title.textContent = '手动总结';
    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:12px;color:#aaa;margin-top:6px;';
    subtitle.textContent = `当前共 ${total} 条消息，选择要总结的范围`;
    header.appendChild(title);
    header.appendChild(subtitle);

    // 范围选择区域
    const body = document.createElement('div');
    body.style.cssText = 'padding:16px 24px;';

    // 从第几条
    const fromGroup = document.createElement('div');
    fromGroup.style.cssText = 'margin-bottom:14px;';
    const fromLabel = document.createElement('div');
    fromLabel.style.cssText = 'font-size:13px;color:#666;margin-bottom:6px;';
    fromLabel.textContent = '从第几条开始';
    const fromRow = document.createElement('div');
    fromRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const fromInput = document.createElement('input');
    fromInput.type = 'number';
    fromInput.id = 'manualSummaryFrom';
    fromInput.min = 1;
    fromInput.max = total;
    fromInput.value = Math.max(1, total - 19);
    fromInput.style.cssText = 'flex:1;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:15px;outline:none;box-sizing:border-box;';
    fromInput.onfocus = () => { fromInput.style.borderColor = '#007aff'; };
    fromInput.onblur = () => { fromInput.style.borderColor = '#e0e0e0'; };
    const fromHint = document.createElement('span');
    fromHint.style.cssText = 'font-size:13px;color:#999;white-space:nowrap;';
    fromHint.textContent = `/ ${total}`;
    fromRow.appendChild(fromInput);
    fromRow.appendChild(fromHint);
    fromGroup.appendChild(fromLabel);
    fromGroup.appendChild(fromRow);

    // 到第几条
    const toGroup = document.createElement('div');
    toGroup.style.cssText = 'margin-bottom:14px;';
    const toLabel = document.createElement('div');
    toLabel.style.cssText = 'font-size:13px;color:#666;margin-bottom:6px;';
    toLabel.textContent = '到第几条结束';
    const toRow = document.createElement('div');
    toRow.style.cssText = 'display:flex;align-items:center;gap:10px;';
    const toInput = document.createElement('input');
    toInput.type = 'number';
    toInput.id = 'manualSummaryTo';
    toInput.min = 1;
    toInput.max = total;
    toInput.value = total;
    toInput.style.cssText = 'flex:1;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:15px;outline:none;box-sizing:border-box;';
    toInput.onfocus = () => { toInput.style.borderColor = '#007aff'; };
    toInput.onblur = () => { toInput.style.borderColor = '#e0e0e0'; };
    const toHint = document.createElement('span');
    toHint.style.cssText = 'font-size:13px;color:#999;white-space:nowrap;';
    toHint.textContent = `/ ${total}`;
    toRow.appendChild(toInput);
    toRow.appendChild(toHint);
    toGroup.appendChild(toLabel);
    toGroup.appendChild(toRow);

    // 预览区域：显示选中范围的消息预览
    const previewBox = document.createElement('div');
    previewBox.id = 'manualSummaryPreview';
    previewBox.style.cssText = 'background:#f8f8f8;border-radius:10px;padding:12px;max-height:150px;overflow-y:auto;font-size:12px;color:#666;line-height:1.6;margin-bottom:6px;';
    previewBox.textContent = '加载预览中...';

    // 更新预览的函数
    function updatePreview() {
        const from = Math.max(1, Math.min(total, parseInt(fromInput.value) || 1));
        const to = Math.max(from, Math.min(total, parseInt(toInput.value) || total));
        const selected = msgs.slice(from - 1, to);
        const count = selected.length;
        if (count === 0) {
            previewBox.innerHTML = '<span style="color:#ccc;">无消息</span>';
            return;
        }
        // 只显示前5条和后2条，中间省略
        let lines = [];
        const show = count <= 8 ? selected : [...selected.slice(0, 5), null, ...selected.slice(-2)];
        show.forEach((m, i) => {
            if (!m) {
                lines.push('<div style="text-align:center;color:#ccc;padding:2px 0;">... 省略 ' + (count - 7) + ' 条 ...</div>');
                return;
            }
            const role = m.type === 'user' ? userName : charName;
            let text = m.content || '';
            if (m.messageType === 'voice') text = '(语音)';
            else if (m.messageType === 'sticker') text = '(表情包)';
            else if (m.messageType === 'image') text = '(图片)';
            else if (m.messageType === 'textImage') text = '(图文)';
            else if (m.messageType === 'transfer') text = '(转账)';
            else if (m.messageType === 'location') text = '(位置)';
            if (text.length > 30) text = text.substring(0, 30) + '...';
            lines.push(`<div style="padding:2px 0;">${role}: ${escapeHtml(text)}</div>`);
        });
        previewBox.innerHTML = `<div style="font-size:11px;color:#999;margin-bottom:6px;">已选 ${count} 条消息</div>` + lines.join('');
    }

    fromInput.oninput = updatePreview;
    toInput.oninput = updatePreview;

    body.appendChild(fromGroup);
    body.appendChild(toGroup);
    body.appendChild(previewBox);

    // 按钮区域
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:8px 24px 20px;display:flex;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;transition:all 0.15s;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeManualSummaryModal(overlay, card);

    const confirmBtn = document.createElement('button');
    confirmBtn.style.cssText = 'flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#007aff;cursor:pointer;transition:all 0.15s;';
    confirmBtn.textContent = '开始总结';
    confirmBtn.onclick = () => {
        if (typeof executeManualSummary === 'function') {
            executeManualSummary(overlay, card, msgs);
        }
    };

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);

    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(footer);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // 入场动画
    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
        card.style.opacity = '1';
    });

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeManualSummaryModal(overlay, card);
    });

    // 初始预览
    setTimeout(updatePreview, 50);
}

// 关闭手动总结弹窗
function closeManualSummaryModal(overlay, card) {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.opacity = '0';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
}

// 关闭长期记忆管理库
function closeLongTermMemoryManager() {
    document.getElementById('longTermMemoryPage').style.display = 'none';
}

// 开始编辑长期记忆
function startEditLongTermMemory(memoryId) {
    const item = document.querySelector(`.ltm-item[data-ltm-id="${memoryId}"]`);
    if (!item) return;

    const contentEl = item.querySelector('.ltm-item-content');
    const actionsEl = item.querySelector('.ltm-item-actions');
    const originalContent = contentEl.textContent;

    contentEl.innerHTML = `<textarea class="ltm-edit-textarea">${escapeHtml(originalContent)}</textarea>`;
    actionsEl.innerHTML = `
        <div class="ltm-edit-actions">
            <button class="ltm-edit-btn" onclick="cancelEditLongTermMemory('${memoryId}', '${encodeURIComponent(originalContent)}')">取消</button>
            <button class="ltm-edit-btn primary" onclick="saveEditLongTermMemory('${memoryId}')">保存</button>
        </div>
    `;

    const textarea = contentEl.querySelector('textarea');
    if (textarea) textarea.focus();
}

// 取消编辑长期记忆
function cancelEditLongTermMemory(memoryId, encodedContent) {
    const originalContent = decodeURIComponent(encodedContent);
    const item = document.querySelector(`.ltm-item[data-ltm-id="${memoryId}"]`);
    if (!item) return;

    const contentEl = item.querySelector('.ltm-item-content');
    const actionsEl = item.querySelector('.ltm-item-actions');

    contentEl.textContent = originalContent;
    actionsEl.innerHTML = `
        <button class="ltm-action-btn" onclick="startEditLongTermMemory('${memoryId}')">编辑</button>
        <button class="ltm-action-btn danger" onclick="confirmDeleteLongTermMemory('${memoryId}')">删除</button>
    `;
}

// 保存编辑长期记忆
async function saveEditLongTermMemory(memoryId) {
    if (!currentChatCharacter) return;

    const item = document.querySelector(`.ltm-item[data-ltm-id="${memoryId}"]`);
    if (!item) return;

    const textarea = item.querySelector('.ltm-edit-textarea');
    if (!textarea) return;

    const newContent = textarea.value.trim();
    if (!newContent) {
        showIosAlert('提示', '记忆内容不能为空');
        return;
    }

    if (typeof editLongTermMemory === 'function') {
        await editLongTermMemory(currentChatCharacter.id, memoryId, newContent);
    }
    if (typeof renderLongTermMemoryList === 'function') {
        await renderLongTermMemoryList();
    }
    showToast('已保存');
}

// 确认删除长期记忆
async function confirmDeleteLongTermMemory(memoryId) {
    if (!currentChatCharacter) return;

    const confirmed = await iosConfirm('确认删除这条长期记忆？');
    if (confirmed) {
        if (typeof deleteLongTermMemory === 'function') {
            await deleteLongTermMemory(currentChatCharacter.id, memoryId);
        }
        if (typeof renderLongTermMemoryList === 'function') {
            await renderLongTermMemoryList();
        }
        showToast('已删除');
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
    
    // 保存时间感知设置
    currentChatCharacter.timeAwareness = document.getElementById('timeAwarenessToggle').checked;
    
    // 保存角色主动来电设置
    currentChatCharacter.incomingCallEnabled = document.getElementById('incomingCallToggle').checked;
    
    // 保存自定义时间设置
    if (typeof saveCustomTimeSettings === 'function') {
        saveCustomTimeSettings();
    }
    
    // 保存系统卡片显示设置
    const showSystemCardBubbles = document.getElementById('showSystemCardBubblesToggle').checked;
    localStorage.setItem('showSystemCardBubbles', showSystemCardBubbles.toString());
    
    // 保存长期记忆设置
    if (typeof saveLongTermMemorySettings === 'function') {
        saveLongTermMemorySettings();
    }
    
    // 保存挂载聊天记录设置
    if (typeof saveMountChatSettings === 'function') {
        saveMountChatSettings();
    }
    
    // 保存国籍设置
    if (typeof saveNationalitySettings === 'function') {
        saveNationalitySettings();
    }
    
    // 保存群聊设置
    if (currentChatCharacter.groupType === 'group') {
        if (!currentChatCharacter.settings) {
            currentChatCharacter.settings = {};
        }
        
        // 保存后台活动设置
        const bgActivityToggle = document.getElementById('groupBgActivityToggle');
        if (bgActivityToggle) {
            currentChatCharacter.settings.bgActivityEnabled = bgActivityToggle.checked;
        }
        
        const bgActivityInterval = document.getElementById('groupBgActivityInterval');
        if (bgActivityInterval) {
            currentChatCharacter.settings.bgActivityInterval = parseInt(bgActivityInterval.value) || 60;
        }
        
        // 保存消息数量范围设置
        const minMessages = document.getElementById('groupMinMessages');
        const maxMessages = document.getElementById('groupMaxMessages');
        if (minMessages) {
            currentChatCharacter.settings.minMessagesPerMember = parseInt(minMessages.value) || 1;
        }
        if (maxMessages) {
            currentChatCharacter.settings.maxMessagesPerMember = parseInt(maxMessages.value) || 5;
        }
    }
    
    // 保存到chatCharacters数组
    const index = chatCharacters.findIndex(c => c.id === currentChatCharacter.id);
    if (index !== -1) {
        chatCharacters[index] = currentChatCharacter;
        await saveChatCharacters();
        renderChatList();
    }
    
    // 更新聊天详情界面显示
    document.getElementById('chatDetailName').textContent = currentChatCharacter.remark;
    
    // 保存用户信息到localStorage（按角色分开存储）
    const userData = {
        avatar: userAvatar,
        name: userName,
        description: userDesc
    };
    saveUserDataForCharacter(currentChatCharacter.id, userData);
    
    // 实时更新聊天界面的用户头像
    if (userAvatar) {
        const chatUserAvatars = document.querySelectorAll('.chat-message-user .chat-avatar-img');
        chatUserAvatars.forEach(img => {
            img.src = userAvatar;
        });
    }
    
    // 更新聊天详情页顶部的角色头像
    const chatDetailAvatar = document.querySelector('.chat-detail-header .chat-avatar-img');
    if (chatDetailAvatar && charAvatar) {
        chatDetailAvatar.src = charAvatar;
    }
    
    // 实时更新聊天消息中该角色的所有头像
    if (charAvatar) {
        const charAvatars = document.querySelectorAll('.chat-message-char .chat-avatar-img');
        charAvatars.forEach(img => {
            img.src = charAvatar;
        });
    }
    
    // 关闭设置界面
    closeChatSettingsPage();
    
    showIosAlert('成功', '设置已保存');
}

/**
 * 更新群聊消息数量范围设置
 */
function updateGroupMessageRange() {
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') return;
    
    const minInput = document.getElementById('groupMinMessages');
    const maxInput = document.getElementById('groupMaxMessages');
    
    if (!minInput || !maxInput) return;
    
    let minMessages = parseInt(minInput.value) || 1;
    let maxMessages = parseInt(maxInput.value) || 5;
    
    // 确保最小值不超过最大值
    if (minMessages > maxMessages) {
        minMessages = maxMessages;
        minInput.value = minMessages;
    }
    
    // 确保范围合理
    minMessages = Math.max(1, Math.min(10, minMessages));
    maxMessages = Math.max(1, Math.min(20, maxMessages));
    
    minInput.value = minMessages;
    maxInput.value = maxMessages;
    
    // 保存设置
    if (!currentChatCharacter.settings) {
        currentChatCharacter.settings = {};
    }
    currentChatCharacter.settings.minMessagesPerMember = minMessages;
    currentChatCharacter.settings.maxMessagesPerMember = maxMessages;
    
    console.log('群聊消息数量范围已更新:', minMessages, '-', maxMessages);
}

// CHAR头像库（已废弃，使用角色专属头像库管理）
function showCharAvatarLibrary() {
    // 直接跳转到角色专属头像库管理
    if (typeof openAvatarLibraryManager === 'function') {
        openAvatarLibraryManager();
    } else {
        showIosAlert('提示', '请先打开一个聊天');
    }
}

// 情侣头像库功能（在couple-avatar.js中实现）
function showCoupleAvatarLibrary() {
    openCoupleAvatarLibrary();
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
    
    // 如果是群聊，调用群聊处理函数
    if (currentChatCharacter.groupType === 'group' && typeof handleGroupChatMessage === 'function') {
        console.log('检测到群聊，调用群聊处理函数');
        // 获取最后一条用户消息
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats
            .filter(chat => chat.characterId === currentChatCharacter.id && chat.type === 'user')
            .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (characterMessages.length === 0) {
            showToast('没有找到用户消息');
            return;
        }
        
        const lastUserMessage = characterMessages[characterMessages.length - 1];
        await handleGroupChatMessage(lastUserMessage.content);
        return;
    }
    
    // 单聊逻辑
    // 检查角色后台活动状态 - 如果角色不在线则拦截AI回复
    if (typeof shouldBlockAIReply === 'function' && shouldBlockAIReply(currentChatCharacter.id)) {
        const statusText = typeof getCharacterStatusText === 'function' ? getCharacterStatusText(currentChatCharacter.id) : '不在线';
        showToast(`对方${statusText}，暂时无法回复`);
        return;
    }

    // 检查拉黑状态 - 用户拉黑了角色则不触发AI回复
    if (typeof isUserBlockedChar === 'function' && isUserBlockedChar(currentChatCharacter.id)) {
        showToast('你已拉黑对方，对方无法回复');
        return;
    }
    // 角色拉黑了用户则不触发AI回复
    if (typeof isCharBlockedUser === 'function' && isCharBlockedUser(currentChatCharacter.id)) {
        showToast('对方已将你拉黑，消息无法送达');
        return;
    }
    
    // 【关键】在异步调用前捕获当前角色引用，防止用户切换角色后消息串到错误的对话
    const targetCharacter = currentChatCharacter;
    const targetCharacterId = currentChatCharacter.id;
    
    // 记录正在调用AI的角色ID
    aiRespondingCharacterIds.add(targetCharacterId);
    
    try {
        // 显示"正在输入中"提示
        showTypingIndicator();
        // 禁用发送按钮
        disableSendButton();
        
        // 控制台提示
        console.log('AI正在思考中...');
        
        // 调用AI生成消息（传入捕获的角色，避免使用全局变量）
        const rawMessages = await callAIRolePlay(targetCharacter);
        
        // 解析并处理状态标签
        let messages = (typeof parseStatusTagsFromMessages === 'function')
            ? parseStatusTagsFromMessages(targetCharacterId, rawMessages || [])
            : (rawMessages || []);

        // 解析拉黑标签
        if (typeof parseBlockTagsFromMessages === 'function') {
            messages = parseBlockTagsFromMessages(targetCharacterId, messages);
        }
        
        if (messages && messages.length > 0) {
            // 将AI生成的消息添加到聊天界面
            // 预加载角色可用表情包（用于匹配AI发送的表情包指令）
            const availableStickers = await getAvailableStickersForCharacter(targetCharacterId);
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
                
                // 只有当用户仍在查看目标角色的聊天界面时才显示typing动画
                const isViewingTarget = currentChatCharacter && currentChatCharacter.id === targetCharacterId;
                
                // 显示"正在输入中"动画（让用户看到打字过程）
                // 如果是第一条消息，typing indicator已经在显示了
                if (i > 0 && isViewingTarget) {
                    showTypingIndicator();
                }
                
                // 等待一段时间，让用户看到"正在输入..."动画
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // 隐藏typing indicator
                if (isViewingTarget) {
                    hideTypingIndicator();
                }
                
                // 检查是否是表情包指令 [sticker:xxx]
                const stickerMatch = msg.match(/^\[sticker:(.+)\]$/);
                // 检查是否是语音指令 [voice:xxx]
                const voiceMatch = msg.match(/^\[voice:(.+)\]$/);
                // 检查是否是转账处理指令
                const transferAcceptMatch = msg.match(/^\[transfer-accept\]$/);
                const transferRejectMatch = msg.match(/^\[transfer-reject\]$/);
                // 检查是否是角色主动发送转账指令 [transfer:金额] 或 [transfer:金额:备注]
                const transferSendMatch = msg.match(/^\[transfer:([\d.]+)(?::(.+))?\]$/);
                // 检查是否是银行转账指令 [银行转账:金额:原因]
                const bankTransferMatch = msg.match(/^\[银行转账:([\d.]+):(.+)\]$/);
                // 检查是否是头像更换指令 [更换头像:头像名称] 或 [更换头像:头像名称:原因]
                const avatarChangeMatch = msg.match(/^\[更换头像:([^:\]]+)(?::(.+))?\]$/);
                // 检查是否是情头更换指令 [换情头:情头名称]
                const coupleAvatarChangeMatch = msg.match(/^\[换情头:([^:\]]+)\]$/);
                // 检查是否是角色发送图片指令 [image:描述]
                const charImageMatch = msg.match(/^\[image:(.+)\]$/);
                // 检查是否是角色发送定位指令 [location:地址] 或 [location:地址:坐标] 或 [location:地址:坐标:距离]
                const locationMatch = msg.match(/^\[location:([^:\]]+)(?::([^:\]]*))?(?::([^\]]*))?\]$/);
                // 检查是否是引用消息指令 [quote:消息ID]
                const quoteMatch = msg.match(/^\[quote:([^\]]+)\]$/);
                // 检查是否是角色主动来电指令 [video-call:原因]
                const videoCallMatch = msg.match(/^\[video-call:(.+)\]$/);
                
                // ========== 群聊权限指令匹配 ==========
                // 检查是否是设置管理员指令 [admin:成员ID]
                const adminMatch = msg.match(/^\[admin:([^\]]+)\]$/);
                // 检查是否是取消管理员指令 [unadmin:成员ID]
                const unadminMatch = msg.match(/^\[unadmin:([^\]]+)\]$/);
                // 检查是否是禁言指令 [mute:成员ID:时长]
                const muteMatch = msg.match(/^\[mute:([^:]+):([^\]]+)\]$/);
                // 检查是否是解除禁言指令 [unmute:成员ID]
                const unmuteMatch = msg.match(/^\[unmute:([^\]]+)\]$/);
                // 检查是否是设置头衔指令 [title:成员ID:头衔]
                const titleMatch = msg.match(/^\[title:([^:]+):([^\]]+)\]$/);
                // 检查是否是踢出群聊指令 [kick:成员ID]
                const kickMatch = msg.match(/^\[kick:([^\]]+)\]$/);
                // 检查是否是转让群主指令 [transfer:成员ID]（注意：这个要放在转账匹配之后检查）
                const transferOwnerMatch = !transferSendMatch && msg.match(/^\[transfer:([^\]]+)\]$/);
                
                let messageObj;
                
                if (stickerMatch && stickerMap[stickerMatch[1]]) {
                    // AI发送表情包
                    const stickerName = stickerMatch[1];
                    const sticker = stickerMap[stickerName];
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: targetCharacterId,
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
                        characterId: targetCharacterId,
                        content: `[语音消息: ${voiceText}]`,
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'voice',
                        voiceText: voiceText,
                        voiceDuration: duration
                    };
                } else if (transferAcceptMatch || transferRejectMatch) {
                    // AI接收或拒绝转账
                    const action = transferAcceptMatch ? 'accepted' : 'rejected';
                    // 找到最近一笔pending的用户转账
                    const allChats = await getAllChatsFromDB();
                    const pendingTransfer = allChats
                        .filter(m => m.characterId === targetCharacterId && m.messageType === 'transfer' && m.type === 'user' && m.transferStatus === 'pending')
                        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];
                    
                    if (pendingTransfer) {
                        const tfId = pendingTransfer.transferId;
                        const tfAmount = pendingTransfer.transferAmount || 0;
                        const tfRemark = pendingTransfer.transferRemark || '';
                        
                        // 更新用户原始转账消息状态（数据库）
                        await updateTransferStatusInDB(tfId, action);
                        // 更新界面上用户的转账气泡
                        updateTransferBubbleStatus(tfId, action);
                        
                        // 创建角色的转账回应消息（也是转账样式）
                        messageObj = {
                            id: Date.now().toString() + Math.random(),
                            characterId: targetCharacterId,
                            content: action === 'accepted' ? '[已收款]' : '[已退还]',
                            type: 'char',
                            timestamp: new Date().toISOString(),
                            sender: 'char',
                            messageType: 'transfer',
                            transferAmount: tfAmount,
                            transferRemark: tfRemark,
                            transferId: tfId,
                            transferStatus: action
                        };
                    } else {
                        // 没有pending转账，跳过这条指令
                        continue;
                    }
                } else if (transferSendMatch) {
                    // 角色主动发送转账
                    const tfAmount = Math.round(parseFloat(transferSendMatch[1]) * 100) / 100;
                    const tfRemark = transferSendMatch[2] || '';
                    if (!tfAmount || tfAmount <= 0 || isNaN(tfAmount)) {
                        continue; // 金额无效，跳过
                    }
                    const transferId = 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
                    
                    // 获取角色国籍对应的货币信息
                    let currencyCode = 'CNY';
                    let currencySymbol = '¥';
                    if (typeof getCharacterNationality === 'function' && typeof getCurrencyByNationality === 'function') {
                        const nationality = getCharacterNationality(targetCharacterId);
                        const currencyInfo = getCurrencyByNationality(nationality);
                        currencyCode = currencyInfo.code;
                        currencySymbol = currencyInfo.symbol;
                    }
                    
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: targetCharacterId,
                        content: '[转账]',
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'transfer',
                        transferAmount: tfAmount,
                        transferRemark: tfRemark,
                        transferId: transferId,
                        transferStatus: 'pending',
                        // 保存货币信息
                        transferCurrencyCode: currencyCode,
                        transferCurrencySymbol: currencySymbol
                    };
                } else if (bankTransferMatch) {
                    // 角色发送银行转账
                    const btAmount = Math.round(parseFloat(bankTransferMatch[1]) * 100) / 100;
                    const btReason = bankTransferMatch[2] || '';
                    if (!btAmount || btAmount <= 0 || isNaN(btAmount)) {
                        continue; // 金额无效，跳过
                    }
                    // 执行银行转账（异步，不阻塞消息显示）
                    if (typeof executeBankTransfer === 'function') {
                        executeBankTransfer(btAmount, btReason).catch(err => {
                            console.error('银行转账执行失败:', err);
                        });
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (avatarChangeMatch) {
                    // 角色更换头像
                    const avatarName = avatarChangeMatch[1].trim();
                    const reason = (avatarChangeMatch[2] || '').trim();
                    // 执行头像更换（异步，不阻塞消息显示）
                    if (typeof executeAvatarChange === 'function') {
                        executeAvatarChange(avatarName, reason).catch(err => {
                            console.error('头像更换执行失败:', err);
                        });
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (coupleAvatarChangeMatch) {
                    // 角色更换情头
                    const coupleName = coupleAvatarChangeMatch[1].trim();
                    // 执行情头更换（异步，不阻塞消息显示）
                    if (typeof aiChangeCoupleAvatar === 'function') {
                        aiChangeCoupleAvatar(coupleName).catch(err => {
                            console.error('情头更换执行失败:', err);
                        });
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (charImageMatch) {
                    // 角色发送图片消息（虚拟图片，显示为灰色占位+描述）
                    const imageDesc = charImageMatch[1];
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: targetCharacterId,
                        content: '[图片]',
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'textImage',
                        textImageDesc: imageDesc
                    };
                } else if (locationMatch) {
                    // 角色发送定位消息
                    const locAddr = locationMatch[1].trim();
                    const locCoord = (locationMatch[2] || '').trim();
                    // 第三段可能是 "1200 km" 或 "500米" 这种
                    const distRaw = (locationMatch[3] || '').trim();
                    let locDist = '';
                    let locUnit = '';
                    if (distRaw) {
                        const distParts = distRaw.match(/^([\d.]+)\s*(.*)$/);
                        if (distParts) {
                            locDist = distParts[1];
                            locUnit = distParts[2] || 'km';
                        } else {
                            locDist = distRaw;
                        }
                    }
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: targetCharacterId,
                        content: '[位置]',
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char',
                        messageType: 'location',
                        locationAddress: locAddr,
                        locationCoord: locCoord,
                        locationDistance: locDist,
                        locationUnit: locUnit
                    };
                } else if (quoteMatch) {
                    // 角色引用消息
                    const quotedMsgId = quoteMatch[1].trim();
                    // 从数据库查找被引用的消息
                    const allChats = await getAllChatsFromDB();
                    const quotedMsg = allChats.find(m => m.id === quotedMsgId && m.characterId === targetCharacterId);
                    
                    if (quotedMsg) {
                        // 获取被引用消息的发送者名称
                        let quotedSender = '';
                        if (quotedMsg.type === 'user') {
                            // 读取该角色的用户真名
                            try {
                                const userData = getUserDataForCharacter(targetCharacterId);
                                quotedSender = userData.name || 'User';
                            } catch (e) {
                                quotedSender = 'User';
                            }
                        } else {
                            quotedSender = targetCharacter.remark || targetCharacter.name;
                        }
                        
                        // 获取被引用消息的内容（简化显示）
                        let quotedContent = quotedMsg.content || '';
                        if (quotedMsg.messageType === 'sticker') quotedContent = '[表情包]';
                        else if (quotedMsg.messageType === 'voice') quotedContent = '[语音消息]';
                        else if (quotedMsg.messageType === 'image') quotedContent = '[图片]';
                        else if (quotedMsg.messageType === 'textImage') quotedContent = '[图片]';
                        else if (quotedMsg.messageType === 'transfer') quotedContent = '[转账]';
                        else if (quotedMsg.messageType === 'location') quotedContent = '[位置]';
                        else if (quotedMsg.messageType === 'bankTransfer') quotedContent = '[银行转账]';
                        else if (quotedMsg.messageType === 'avatarChange') quotedContent = '[更换头像]';
                        else if (quotedMsg.messageType === 'coupleAvatarChange') quotedContent = '[更换情头]';
                        
                        // 查找下一条消息作为回复内容
                        let replyContent = '';
                        if (i + 1 < messages.length) {
                            const nextMsg = messages[i + 1];
                            // 清洗下一条消息，去除可能的指令标记
                            replyContent = nextMsg
                                .replace(/\[sticker:[^\]]*\]/g, '')
                                .replace(/\[voice:[^\]]*\]/g, '')
                                .replace(/\[transfer[^\]]*\]/g, '')
                                .replace(/\[银行转账:[^\]]*\]/g, '')
                                .replace(/\[image:[^\]]*\]/g, '')
                                .replace(/\[location:[^\]]*\]/g, '')
                                .replace(/\[quote:[^\]]*\]/g, '')
                                .replace(/\[video-call:[^\]]*\]/g, '')
                                .trim();
                            
                            // 如果下一条是有效的回复内容，跳过下一条消息的处理
                            if (replyContent) {
                                i++; // 跳过下一条消息
                            }
                        }
                        
                        // 如果没有找到回复内容，使用默认文本
                        if (!replyContent) {
                            replyContent = '（引用了这条消息）';
                        }
                        
                        messageObj = {
                            id: Date.now().toString() + Math.random(),
                            characterId: targetCharacterId,
                            content: replyContent,
                            type: 'char',
                            timestamp: new Date().toISOString(),
                            sender: 'char',
                            messageType: 'quote',
                            quotedMessageId: quotedMsgId,
                            quotedSender: quotedSender,
                            quotedContent: quotedContent
                        };
                    } else {
                        // 找不到被引用的消息，跳过
                        continue;
                    }
                } else if (videoCallMatch) {
                    // 角色主动发起视频通话
                    const reason = videoCallMatch[1].trim();
                    if (typeof showIncomingCallUI === 'function') {
                        showIncomingCallUI(targetCharacter, reason);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && adminMatch) {
                    // ========== 群聊权限指令：设置管理员 ==========
                    const targetId = adminMatch[1].trim();
                    console.log('🔧 执行设置管理员指令:', targetId);
                    
                    if (typeof executeGroupAdminCommand === 'function') {
                        await executeGroupAdminCommand(targetCharacterId, targetId, targetCharacter, true);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && unadminMatch) {
                    // ========== 群聊权限指令：取消管理员 ==========
                    const targetId = unadminMatch[1].trim();
                    console.log('🔧 执行取消管理员指令:', targetId);
                    
                    if (typeof executeGroupAdminCommand === 'function') {
                        await executeGroupAdminCommand(targetCharacterId, targetId, targetCharacter, false);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && muteMatch) {
                    // ========== 群聊权限指令：禁言 ==========
                    const targetId = muteMatch[1].trim();
                    const duration = muteMatch[2].trim();
                    console.log('🔇 执行禁言指令:', targetId, duration);
                    
                    if (typeof executeGroupMuteCommand === 'function') {
                        await executeGroupMuteCommand(targetCharacterId, targetId, duration, targetCharacter);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && unmuteMatch) {
                    // ========== 群聊权限指令：解除禁言 ==========
                    const targetId = unmuteMatch[1].trim();
                    console.log('🔊 执行解除禁言指令:', targetId);
                    
                    if (typeof executeGroupUnmuteCommand === 'function') {
                        await executeGroupUnmuteCommand(targetCharacterId, targetId, targetCharacter);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && titleMatch) {
                    // ========== 群聊权限指令：设置头衔 ==========
                    const targetId = titleMatch[1].trim();
                    const title = titleMatch[2].trim();
                    console.log('👑 执行设置头衔指令:', targetId, title);
                    
                    if (typeof executeGroupTitleCommand === 'function') {
                        await executeGroupTitleCommand(targetCharacterId, targetId, title, targetCharacter);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && kickMatch) {
                    // ========== 群聊权限指令：踢出群聊 ==========
                    const targetId = kickMatch[1].trim();
                    console.log('👢 执行踢出群聊指令:', targetId);
                    
                    if (typeof executeGroupKickCommand === 'function') {
                        await executeGroupKickCommand(targetCharacterId, targetId, targetCharacter);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else if (targetCharacter.groupType === 'group' && transferOwnerMatch) {
                    // ========== 群聊权限指令：转让群主 ==========
                    const targetId = transferOwnerMatch[1].trim();
                    console.log('👑 执行转让群主指令:', targetId);
                    
                    if (typeof executeGroupTransferOwnerCommand === 'function') {
                        await executeGroupTransferOwnerCommand(targetCharacterId, targetId, targetCharacter);
                    }
                    // 跳过这条指令，不显示为普通消息
                    continue;
                } else {
                    // 普通文本消息
                    let cleanMsg = msg
                        .replace(/\[sticker:[^\]]*\]/g, '')
                        .replace(/\[voice:[^\]]*\]/g, '')
                        .replace(/\[transfer-(?:accept|reject)\]/g, '')
                        .replace(/\[transfer:[\d.]+(?::[^\]]+)?\]/g, '')
                        .replace(/\[银行转账:[^\]]*\]/g, '')
                        .replace(/\[image:[^\]]*\]/g, '')
                        .replace(/\[location:[^\]]*\]/g, '')
                        .replace(/\[quote:[^\]]*\]/g, '')
                        .replace(/\[video-call:[^\]]*\]/g, '')
                        .trim();
                    
                    // 清洗后为空则跳过（AI只发了一个无效指令）
                    if (!cleanMsg) continue;
                    
                    messageObj = {
                        id: Date.now().toString() + Math.random(),
                        characterId: targetCharacterId,
                        content: cleanMsg,
                        type: 'char',
                        timestamp: new Date().toISOString(),
                        sender: 'char'
                    };
                }
                
                // 只有当用户仍在查看目标角色的聊天界面时才渲染消息到界面
                if (messageObj) {
                    if (currentChatCharacter && currentChatCharacter.id === targetCharacterId) {
                        appendMessageToChat(messageObj);
                    }
                    await saveMessageToDB(messageObj);
                }
                
                // 更新角色最后消息时间
                targetCharacter.lastMessageTime = new Date().toISOString();
                
                // 消息之间添加小延迟
                if (i < messages.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
            }
            
            // 更新角色最后消息并保存
            const lastMsg = messages[messages.length - 1];
            const lastMsgSticker = lastMsg.match(/^\[sticker:(.+)\]$/);
            const lastMsgVoice = lastMsg.match(/^\[voice:(.+)\]$/);
            const lastMsgTransfer = lastMsg.match(/^\[transfer-(accept|reject)\]$/);
            const lastMsgTransferSend = lastMsg.match(/^\[transfer:[\d.]+(?::.+)?\]$/);
            const lastMsgImage = lastMsg.match(/^\[image:.+\]$/);
            const lastMsgLocation = lastMsg.match(/^\[location:[^\]]+\]$/);
            const lastMsgQuote = lastMsg.match(/^\[quote:[^\]]+\]$/);
            const lastMsgVideoCall = lastMsg.match(/^\[video-call:[^\]]+\]$/);
            targetCharacter.lastMessage = lastMsgSticker ? '[表情包]' : lastMsgVoice ? '[语音消息]' : (lastMsgTransfer || lastMsgTransferSend) ? '[转账]' : lastMsgImage ? '[图片]' : lastMsgLocation ? '[位置]' : lastMsgQuote ? '[引用消息]' : lastMsgVideoCall ? '[视频通话]' : lastMsg.substring(0, 50) + (lastMsg.length > 50 ? '...' : '');
            await saveChatCharacters();
            
            // 只有当用户仍在查看目标角色的聊天界面时才滚动
            if (currentChatCharacter && currentChatCharacter.id === targetCharacterId) {
                scrollChatToBottom();
            }
            
            // 触发长期记忆自动总结检查（异步后台执行）
            if (typeof checkAndTriggerAutoSummary === 'function') {
                checkAndTriggerAutoSummary(targetCharacterId);
            }
            
            console.log('AI消息发送完成');
        }
        
        // 启用发送按钮（仅当用户正在查看该角色时）
        if (currentChatCharacter && currentChatCharacter.id === targetCharacterId) {
            enableSendButton();
        }
        // AI调用完成，清除该角色的调用状态
        aiRespondingCharacterIds.delete(targetCharacterId);
    } catch (error) {
        // 出错时也要隐藏typing indicator和启用发送按钮（仅当用户正在查看该角色时）
        if (currentChatCharacter && currentChatCharacter.id === targetCharacterId) {
            hideTypingIndicator();
            enableSendButton();
        }
        // AI调用失败，清除该角色的调用状态
        aiRespondingCharacterIds.delete(targetCharacterId);
        
        console.error('AI调用失败:', error);
        showIosAlert('错误', error.message || 'AI调用失败，请检查API设置');
    }
}

// ============================================================
// 提示词模板系统
// ============================================================
// 提示词定义已移至 prompts.js 文件
// 本文件保留提示词相关的辅助函数

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
async function buildRolePlaySystemPrompt(targetCharacter) {
    // 使用传入的角色（防止异步期间全局变量被切换），兼容旧调用
    const character = targetCharacter || currentChatCharacter;
    // 【预留】模板系统接入点
    // 当模板系统启用后，这里会根据角色选择的模板来生成提示词
    // const templateId = getCurrentPromptTemplateId();
    // const template = await getPromptTemplate(templateId);
    // if (template && template.content) {
    //     return buildPromptFromTemplate(template);
    // }
    // 以下为默认提示词（templateId === 'default' 时使用）
    
    const parts = [];
    
    // 0. 开头就强调输出格式（引用prompts.js中的常量）
    parts.push(MAIN_CHAT_PROMPT);
    
    // 2. 角色人设
    if (character) {
        parts.push(`\n你叫${character.name || '（未设置名字）'}。${character.remark ? `关于你：${character.remark}` : ''}
${character.description ? `\n${character.description}` : ''}
这些就是你，不需要刻意表演，因为你本来就是这样的人。`);
    }
    
    // 3. 用户人设（按角色获取）
    try {
        const userData = getUserDataForCharacter(character.id);
        if (userData.name || userData.description) {
            parts.push(`\n你正在跟${userData.name || '对方'}聊天。${userData.description ? `关于对方：${userData.description}` : ''}`);
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
        const boundWorldBookIds = character && character.boundWorldBooks 
            ? character.boundWorldBooks 
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
    if (character) {
        // 5.0 长期记忆注入
        if (typeof buildLongTermMemoryPrompt === 'function') {
            const ltmPrompt = await buildLongTermMemoryPrompt(character.id);
            if (ltmPrompt) {
                parts.push(ltmPrompt);
            }
        }

        // 5.01 视频通话记忆注入
        if (typeof buildVideoCallMemoryContent === 'function') {
            const videoCallMemory = await buildVideoCallMemoryContent(character.id);
            if (videoCallMemory) {
                parts.push(videoCallMemory);
            }
        }

        // 5.02 最近视频通话状态感知（script3.js中定义）
        if (typeof buildRecentVideoCallStatusPrompt === 'function') {
            const recentCallPrompt = await buildRecentVideoCallStatusPrompt(character.id);
            if (recentCallPrompt) {
                parts.push(recentCallPrompt);
            }
        }

        // 5.05 挂载聊天记录注入
        if (typeof buildMountedChatPrompt === 'function') {
            const mountedPrompt = await buildMountedChatPrompt(character.id);
            if (mountedPrompt) {
                parts.push(mountedPrompt);
            }
        }

        // 5.1 格式提醒（在介绍特殊功能前再次提醒）
        parts.push(FORMAT_REMINDER_PROMPT);

        const availableStickers = await getAvailableStickersForCharacter(character.id);
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
    parts.push(VOICE_ABILITY_PROMPT);
    
    // 5.6 转账处理能力
    parts.push(TRANSFER_RECEIVE_PROMPT);

    // 5.7 角色主动发送转账能力
    parts.push(TRANSFER_SEND_PROMPT);

    // 5.77 银行转账能力（条件注入）
    const bankTransferSettings = JSON.parse(localStorage.getItem('bankTransferSettings') || '{}');
    if (bankTransferSettings.enabled && bankTransferSettings.selectedCardIndex !== null && bankTransferSettings.selectedCardIndex !== undefined) {
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
        const card = walletData.bankCards ? walletData.bankCards[bankTransferSettings.selectedCardIndex] : null;
        
        if (card) {
            const cardNumber = card.number || card.cardNumber || '0000000000000000';
            const last4 = cardNumber.slice(-4);
            const cardInfo = `${card.name || '银行卡'} 尾号${last4}`;
            
            parts.push(`\n【银行转账功能】
当你需要给对方转账，但金额比较大（比如几千、几万）或者超过了平台单笔限额时，你可以直接转到对方的银行卡。
目标卡号：${cardInfo}
使用格式：[银行转账:金额:原因]
使用场景：
- 大额转账（几千、几万元以上）
- 超过平台单笔限额的转账
- 其他需要走银行渠道的情况
注意：小额转账（几百元以内）还是用普通的 [transfer:金额] 就好，银行转账主要用于大额。
举例：需要转5000块钱：[银行转账:50000:这个月生活费]
举例：转个大红包：[银行转账:8888888:新年快乐！]
银行转账消息单独一条发，不要和文字混在同一条消息里。`);
        }
    }

    // 5.75 角色发送图片能力
    parts.push(IMAGE_SEND_PROMPT);

    // 5.76 角色发送定位能力
    parts.push(LOCATION_SEND_PROMPT);

    // 5.77 角色引用消息能力
    parts.push(QUOTE_ABILITY_PROMPT);

    // 5.775 角色主动来电能力（条件注入）
    if (character && character.incomingCallEnabled !== false) {
        parts.push(INCOMING_CALL_PROMPT);
    }

    // 5.78 角色更换头像能力
    // 检查角色是否有头像库
    if (character) {
        const avatarLibrary = await getCharacterAvatarLibrary(character.id);
        if (avatarLibrary && avatarLibrary.length > 0) {
            const avatarList = avatarLibrary.map(a => a.name).join('、');
            parts.push(`\n你可以根据自己的心情、情绪或场景主动更换头像。
你的头像库里有：${avatarList}
要更换头像的时候，用这个格式：[更换头像:头像名称] 或 [更换头像:头像名称:原因]
- 头像名称必须从上面列表里选，不能自己编
- 支持模糊匹配，比如头像叫"生气的表情"，你写"生气"也能匹配到
- 更换头像消息单独一条发，不要和文字混在同一条消息里
- 原因是可选的，你可以写也可以不写
- 什么时候换、换不换，完全看你自己的心情，不用刻意`);
        }
    }

    // 5.79 情侣头像更换能力
    if (typeof getCoupleMode === 'function' && getCoupleMode()) {
        // 情头模式已开启
        if (typeof getCoupleAvatarLibrary === 'function' && character && character.id) {
            // 只获取当前角色的情头库
            const coupleLibrary = await getCoupleAvatarLibrary(character.id);
            // 只有当前角色有情头时才注入提示词
            if (coupleLibrary && coupleLibrary.length > 0) {
                const coupleList = coupleLibrary.map(c => `"${c.coupleName}"${c.description ? `（${c.description}）` : ''}`).join('、');
                const currentCoupleId = typeof getCurrentCoupleId === 'function' ? getCurrentCoupleId() : null;
                let currentCoupleName = '';
                if (currentCoupleId) {
                    const currentCouple = coupleLibrary.find(c => c.id === currentCoupleId);
                    if (currentCouple) {
                        currentCoupleName = currentCouple.coupleName;
                    }
                }
                
                parts.push(`\n你可以根据聊天氛围或用户要求更换情侣头像（会同时改变你和用户的头像）。
你的情侣头像库里有：${coupleList}
要更换情头的时候，用这个格式：[换情头:情头名称]
- 情头名称必须从上面列表里选，不能自己编
- 支持模糊匹配
- 更换情头消息单独一条发，不要和文字混在同一条消息里
- 什么时候换、换不换，完全看你自己的判断，不用刻意`);
            }
        }
    }

    // 5.795 角色后台活动状态提示词注入
    if (character && typeof getBgActivityConfig === 'function') {
        const bgCfg = getBgActivityConfig(character.id);
        if (bgCfg.enabled && typeof BG_ACTIVITY_STATUS_PROMPT !== 'undefined') {
            parts.push(BG_ACTIVITY_STATUS_PROMPT);
        }
    }

    // 5.796 角色拉黑能力提示词注入
    if (character && typeof BLOCK_USER_ABILITY_PROMPT !== 'undefined') {
        // 只有在没有被拉黑的情况下才注入拉黑能力
        const blockActive = typeof isAnyBlockActive === 'function' && isAnyBlockActive(character.id);
        if (!blockActive) {
            parts.push(BLOCK_USER_ABILITY_PROMPT);
        }
    }

    // 5.8 时间感知
    if (character && character.timeAwareness !== false) {
        // 获取当前时间（可能是自定义时间）
        const now = typeof getCurrentTime === 'function' ? getCurrentTime() : new Date();
        const isCustomTime = character && character.customTime && character.customTime.enabled;
        
        console.log('⏰ 时间感知模式:', isCustomTime ? '自定义时间' : '真实时间');
        console.log('⏰ 当前时间:', now.toLocaleString('zh-CN'));
        
        const weekDays = ['日', '一', '二', '三', '四', '五', '六'];
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        const day = now.getDate();
        const weekDay = weekDays[now.getDay()];
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        console.log('⏰ 格式化时间:', `${year}年${month}月${day}日 星期${weekDay} ${hours}:${minutes}:${seconds}`);
        
        // 计算距离上一次聊天（最后一条消息，不管是谁发的）到现在的间隔
        let timeDiffText = '';
        let timeDiffDetail = '';
        
        // 只有在非自定义时间模式下才计算时间间隔
        if (!isCustomTime) {
            try {
                const chatHistory = await getChatHistory(character.id, 30);
                // 找最后一条消息（不管是用户还是角色发的）
                if (chatHistory.length > 0) {
                    const lastMsg = chatHistory[chatHistory.length - 1];
                    if (lastMsg && lastMsg.timestamp) {
                        const lastTime = new Date(lastMsg.timestamp);
                        const diffMs = now - lastTime;
                        const diffSec = Math.floor(diffMs / 1000);
                        const diffMin = Math.floor(diffMs / 60000);
                        const diffHour = Math.floor(diffMs / 3600000);
                        const diffDay = Math.floor(diffMs / 86400000);
                        
                        // 精确描述
                        if (diffDay >= 1) {
                            const remainHours = Math.floor((diffMs % 86400000) / 3600000);
                            timeDiffText = remainHours > 0 ? `${diffDay}天${remainHours}小时` : `${diffDay}天`;
                        } else if (diffHour >= 1) {
                            const remainMin = Math.floor((diffMs % 3600000) / 60000);
                            timeDiffText = remainMin > 0 ? `${diffHour}小时${remainMin}分钟` : `${diffHour}小时`;
                        } else if (diffMin >= 1) {
                            timeDiffText = `${diffMin}分钟`;
                        } else if (diffSec >= 10) {
                            timeDiffText = `${diffSec}秒`;
                        }
                        
                        // 详细时间点
                        const lastTimeStr = `${lastTime.getFullYear()}年${lastTime.getMonth()+1}月${lastTime.getDate()}日 ${String(lastTime.getHours()).padStart(2,'0')}:${String(lastTime.getMinutes()).padStart(2,'0')}:${String(lastTime.getSeconds()).padStart(2,'0')}`;
                        timeDiffDetail = `上一条消息是${lastMsg.type === 'user' ? '对方' : '你'}在 ${lastTimeStr} 发的`;
                    }
                }
            } catch (e) {
                console.error('计算消息间隔失败:', e);
            }
        }
        
        // 使用 prompts.js 中的函数构建时间感知提示词
        if (typeof buildTimeAwarenessPrompt === 'function') {
            const timeAwarenessPrompt = buildTimeAwarenessPrompt({
                year, month, day, weekDay, hours, minutes, seconds,
                isCustomTime, timeDiffText, timeDiffDetail
            });
            parts.push(timeAwarenessPrompt);
        }
    }

    
    // 6. 输出格式要求（结尾再次强调）
    parts.push(FINAL_FORMAT_REMINDER);
    
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

// 清洗AI返回的异常格式内容
function cleanAIResponse(text) {
    let cleaned = text.trim();
    
    // 情况1: 多个JSON数组拼接，如 ["……"] ["草"] ["大半夜的，诈尸啊你"]
    const multiArrayMatch = cleaned.match(/\[\"[^"]*\"\]\s*\[/);
    if (multiArrayMatch) {
        try {
            // 提取所有 ["xxx"] 中的内容
            const items = [];
            const regex = /\["([^"]*)"\]/g;
            let m;
            while ((m = regex.exec(cleaned)) !== null) {
                if (m[1]) items.push(m[1]);
            }
            if (items.length > 0) {
                return items;
            }
        } catch (e) { /* 继续后续处理 */ }
    }
    
    // 情况2: 内容被方括号包裹但不是合法JSON，如 [你好啊] 或 ["你好", 不合法]
    // 尝试把外层方括号去掉
    if (/^\[.*\]$/s.test(cleaned)) {
        try {
            // 再试一次宽松的JSON解析：补全可能缺失的引号
            const fixedJson = cleaned.replace(/\[([^\]]+)\]/g, (match) => {
                try {
                    JSON.parse(match);
                    return match; // 已经是合法JSON
                } catch {
                    return match; // 无法修复，保留原样
                }
            });
            const parsed = JSON.parse(fixedJson);
            if (Array.isArray(parsed)) {
                return parsed.map(msg => String(msg));
            }
        } catch (e) { /* 继续后续处理 */ }
    }
    
    // 情况3: 普通文本，直接返回
    return [cleaned];
}

// 调用AI角色扮演API
async function callAIRolePlay(targetCharacter) {
    // 获取API设置
    const settings = await storageDB.getItem('apiSettings');
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('请先在设置中配置API');
    }
    
    // 使用传入的角色（防止异步期间全局变量被切换），兼容旧调用
    const character = targetCharacter || currentChatCharacter;
    
    // 构建系统提示词
    const systemPrompt = await buildRolePlaySystemPrompt(character);
    
    // 获取最近的聊天历史（使用角色设置的短期记忆条数）
    const memoryLimit = character.shortTermMemory || 10; // 默认10条
    let chatHistory = await getChatHistory(character.id, memoryLimit);
    
    // 过滤拉黑期间角色看不到的消息
    if (typeof getBlockConfig === 'function') {
        const blockCfg = getBlockConfig(character.id);
        if (blockCfg.charBlockedUser && !blockCfg.showBlockedMsgsAfterUnblock) {
            // 角色拉黑了用户，过滤掉用户在拉黑期间发的消息
            chatHistory = chatHistory.filter(msg => !msg.blockedMsg);
        }
    }

    // 应用隐藏消息过滤（script3.js中定义）
    if (typeof filterHiddenMessages === 'function') {
        chatHistory = await filterHiddenMessages(chatHistory, character.id);
    }
    
    // 构建消息数组
    const messages = [
        {
            role: 'system',
            content: systemPrompt
        }
    ];
    
    // 添加聊天历史（每条消息都带精确时间戳和ID）
    chatHistory.forEach(msg => {
        let content = msg.content;
        let imageData = null;
        
        // 生成消息ID标记（让AI知道每条消息的ID）
        let idPrefix = '';
        if (msg.id) {
            idPrefix = `[id:${msg.id}] `;
        }
        
        // 生成精确时间标记（精确到秒）
        let timePrefix = '';
        if (msg.timestamp) {
            const msgTime = new Date(msg.timestamp);
            const y = msgTime.getFullYear();
            const mo = msgTime.getMonth() + 1;
            const d = msgTime.getDate();
            const h = String(msgTime.getHours()).padStart(2, '0');
            const mi = String(msgTime.getMinutes()).padStart(2, '0');
            const s = String(msgTime.getSeconds()).padStart(2, '0');
            timePrefix = `[${y}年${mo}月${d}日 ${h}:${mi}:${s}] `;
        }
        
        // 检查是否有引用信息（用户引用了角色的消息）
        let quotePrefix = '';
        if (msg.quotedMessageId && msg.quotedSender && msg.quotedContent && msg.type === 'user') {
            quotePrefix = `（用户引用了你的消息："${msg.quotedContent}"，以下是用户针对这条消息的回复）\n`;
        }
        
        // 语音消息
        if (msg.messageType === 'voice' && msg.voiceText) {
            if (msg.type === 'user') {
                content = `（对方发了一条${msg.voiceDuration || ''}秒的语音消息，说的是：「${msg.voiceText}」）`;
            } else {
                content = `[voice:${msg.voiceText}]`;
            }
        }
        // 表情包消息：转换为自然描述
        if (msg.messageType === 'sticker') {
            const name = msg.stickerName || '未知';
            if (msg.type === 'user') {
                content = `（对方发了一个表情包，含义是：${name}）`;
            } else {
                content = `[sticker:${name}]`;
            }
        }
        // 图片消息：标记图片数据，后续按provider格式处理
        if (msg.messageType === 'image' && msg.imageData) {
            imageData = msg.imageData;
            content = '（对方发送了一张图片，请仔细查看图片内容并自然地回应）';
        }
        // 图文消息（手动描述图片）：让AI当作图片来理解
        if (msg.messageType === 'textImage' && msg.textImageDesc) {
            if (msg.type === 'user') {
                content = `（对方发送了一张图片，图片内容是：${msg.textImageDesc}。请把这当作一张真实的图片来自然地回应）`;
            } else {
                content = `[image:${msg.textImageDesc}]`;
            }
        }
        // 转账消息：转换为自然描述
        if (msg.messageType === 'transfer') {
            const amount = msg.transferAmount || 0;
            const remark = msg.transferRemark || '';
            const tStatus = msg.transferStatus || 'pending';
            if (msg.type === 'user') {
                if (tStatus === 'pending') {
                    content = remark
                        ? `（对方给你转账了${amount}元，备注：${remark}。【待处理】你必须在本次回复中使用 [transfer-accept] 或 [transfer-reject] 来处理这笔转账！）`
                        : `（对方给你转账了${amount}元。【待处理】你必须在本次回复中使用 [transfer-accept] 或 [transfer-reject] 来处理这笔转账！）`;
                } else if (tStatus === 'accepted') {
                    content = remark
                        ? `（对方之前给你转账了${amount}元，备注：${remark}。你已经收下了。）`
                        : `（对方之前给你转账了${amount}元，你已经收下了。）`;
                } else {
                    content = remark
                        ? `（对方之前给你转账了${amount}元，备注：${remark}。你拒绝了这笔转账。）`
                        : `（对方之前给你转账了${amount}元，你拒绝了这笔转账。）`;
                }
            } else {
                // 角色发的转账
                if (tStatus === 'pending') {
                    content = remark
                        ? `（你之前给对方转账了${amount}元，备注：${remark}。对方还没处理。）`
                        : `（你之前给对方转账了${amount}元。对方还没处理。）`;
                } else if (tStatus === 'accepted') {
                    content = remark
                        ? `（你之前给对方转账了${amount}元，备注：${remark}。对方已收款。）`
                        : `（你之前给对方转账了${amount}元。对方已收款。）`;
                } else if (tStatus === 'rejected') {
                    content = remark
                        ? `（你之前给对方转账了${amount}元，备注：${remark}。对方退还了。）`
                        : `（你之前给对方转账了${amount}元。对方退还了。）`;
                } else {
                    content = remark
                        ? `[transfer:${amount}:${remark}]`
                        : `[transfer:${amount}]`;
                }
            }
        }
        // 定位消息：转换为自然描述
        if (msg.messageType === 'location') {
            const locAddr = msg.locationAddress || '';
            const locCoord = msg.locationCoord || '';
            const locDist = msg.locationDistance || '';
            const locUnit = msg.locationUnit || '';
            let locDesc = `地址：${locAddr}`;
            if (locCoord) locDesc += `，坐标：${locCoord}`;
            if (locDist) locDesc += `，距离你${locDist}${locUnit ? ' ' + locUnit : ''}`;
            if (msg.type === 'user') {
                content = `（对方发送了一个位置信息。${locDesc}。请自然地回应。）`;
            } else {
                // 角色自己发的定位，用tag格式让AI知道自己发过
                let tag = `[location:${locAddr}`;
                if (locCoord) tag += `:${locCoord}`;
                if (locDist) tag += `:${locDist}${locUnit ? locUnit : ''}`;
                tag += ']';
                content = tag;
            }
        }
        // 银行转账消息：转换为自然描述
        if (msg.messageType === 'bankTransfer') {
            const amount = msg.bankTransferAmount || 0;
            const reason = msg.bankTransferReason || '';
            const cardInfo = msg.bankTransferCard || '银行卡';
            content = `（你刚刚通过银行向对方的${cardInfo}转账了${amount}元${reason ? '，原因：' + reason : ''}。）`;
        }
        // 头像更换消息：转换为自然描述
        if (msg.messageType === 'avatarChange') {
            const avatarName = msg.avatarChangeName || '';
            const reason = msg.avatarChangeReason || '';
            content = `（你刚刚更换了头像为"${avatarName}"${reason ? '，原因：' + reason : ''}。）`;
        }
        // 引用消息：转换为自然描述
        if (msg.messageType === 'quote') {
            const quotedSender = msg.quotedSender || '对方';
            const quotedContent = msg.quotedContent || '';
            content = `（你刚刚引用了${quotedSender}的消息："${quotedContent}"。）`;
        }
        // 系统消息：作为客观事实添加到上下文，明确告知AI这不是任何人说的话
        if (msg.messageType === 'systemNotice' || msg.type === 'system') {
            // 使用特殊格式，让AI明确知道这是系统记录的客观事实
            content = `（系统记录的客观事实：${msg.content}。注意：这不是你说的，也不是对方说的，这是系统自动记录的事实信息，供你了解当前情况。）`;
        }
        const msgObj = {
            role: msg.type === 'user' ? 'user' : (msg.type === 'system' ? 'user' : 'assistant'),
            content: idPrefix + timePrefix + quotePrefix + content
        };
        if (imageData) {
            msgObj._hasImage = true;
            msgObj._imageData = imageData;
        }
        messages.push(msgObj);
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
        // 创建新的AbortController
        if (typeof currentAbortController !== 'undefined') {
            currentAbortController = new AbortController();
        }
        const signal = (typeof currentAbortController !== 'undefined') ? currentAbortController.signal : undefined;
        
        let response;
        
        if (settings.provider === 'hakimi') {
            // Gemini API
            const geminiContents = messages.filter(m => m.role !== 'system').map(m => {
                const parts = [{ text: m.content }];
                if (m._hasImage && m._imageData) {
                    const base64Match = m._imageData.match(/^data:(image\/\w+);base64,(.+)$/);
                    if (base64Match) {
                        parts.unshift({
                            inlineData: {
                                mimeType: base64Match[1],
                                data: base64Match[2]
                            }
                        });
                    }
                }
                return {
                    role: m.role === 'user' ? 'user' : 'model',
                    parts: parts
                };
            });
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: geminiContents,
                    systemInstruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    generationConfig: {
                        temperature: settings.temperature !== undefined ? settings.temperature : 0.9,
                        topP: settings.topP !== undefined ? settings.topP : 0.95,
                        maxOutputTokens: settings.maxTokens || 2048
                    }
                }),
                signal: signal
            });
        } else if (settings.provider === 'claude') {
            // Claude API
            const claudeMessages = messages.filter(m => m.role !== 'system').map(m => {
                if (m._hasImage && m._imageData) {
                    const base64Match = m._imageData.match(/^data:(image\/\w+);base64,(.+)$/);
                    if (base64Match) {
                        return {
                            role: m.role,
                            content: [
                                {
                                    type: 'image',
                                    source: {
                                        type: 'base64',
                                        media_type: base64Match[1],
                                        data: base64Match[2]
                                    }
                                },
                                {
                                    type: 'text',
                                    text: m.content
                                }
                            ]
                        };
                    }
                }
                return { role: m.role, content: m.content };
            });
            response = await fetch(`${settings.apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: settings.model,
                    max_tokens: settings.maxTokens || 2048,
                    temperature: settings.temperature !== undefined ? settings.temperature : 0.9,
                    system: systemPrompt,
                    messages: claudeMessages
                }),
                signal: signal
            });
        } else {
            // OpenAI-compatible API (包括 DeepSeek 和 Custom)
            const openaiMessages = messages.map(m => {
                if (m._hasImage && m._imageData) {
                    return {
                        role: m.role,
                        content: [
                            {
                                type: 'image_url',
                                image_url: {
                                    url: m._imageData
                                }
                            },
                            {
                                type: 'text',
                                text: m.content
                            }
                        ]
                    };
                }
                return { role: m.role, content: m.content };
            });
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: openaiMessages,
                    temperature: settings.temperature !== undefined ? settings.temperature : 0.9,
                    max_tokens: settings.maxTokens || 2048
                }),
                signal: signal
            });
        }
        
        // 清除AbortController
        if (typeof currentAbortController !== 'undefined') {
            currentAbortController = null;
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
        
        // 记录API历史（成功）
        if (typeof addApiHistoryRecord === 'function') {
            const requestData = {
                provider: settings.provider,
                model: settings.model,
                messages: messages.map(m => ({
                    role: m.role,
                    content: m.content,
                    hasImage: m._hasImage || false
                })),
                temperature: settings.temperature,
                topP: settings.topP,
                maxTokens: settings.maxTokens
            };
            const responseData = {
                raw: aiResponse,
                parsed: data
            };
            const characterName = character.remark || character.name || '未知角色';
            await addApiHistoryRecord(requestData, responseData, characterName, 'success');
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
                const messages = messagesArray.map(msg => String(msg));
                
                // 验证格式
                const validation = validateMessageFormat(messages);
                if (validation.valid) {
                    return messages;
                } else {
                    console.warn('消息格式验证失败:', validation.error);
                    // 继续尝试自动修正
                }
            } else {
                throw new Error('返回的不是有效的消息数组');
            }
        } catch (parseError) {
            console.error('JSON解析失败，原始响应:', aiResponse);
            
            // 检查是否启用自动格式修正
            if (typeof isAutoFormatFixEnabled === 'function' && isAutoFormatFixEnabled()) {
                console.log('尝试自动修正格式...');
                try {
                    // 调用AI修正格式
                    if (typeof callAIToFixFormat === 'function') {
                        const fixedMessages = await callAIToFixFormat(aiResponse);
                        console.log('格式修正成功:', fixedMessages);
                        return fixedMessages;
                    }
                } catch (fixError) {
                    console.error('自动格式修正失败:', fixError);
                    // 修正失败，继续使用清洗方法
                }
            }
            
            // 清洗异常格式的AI回复
            return cleanAIResponse(aiResponse);
        }
    } catch (error) {
        // 清除AbortController
        if (typeof currentAbortController !== 'undefined') {
            currentAbortController = null;
        }
        
        // 记录API历史（失败）
        if (typeof addApiHistoryRecord === 'function' && error.name !== 'AbortError') {
            try {
                const requestData = {
                    provider: settings.provider,
                    model: settings.model,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        hasImage: m._hasImage || false
                    })),
                    temperature: settings.temperature,
                    topP: settings.topP,
                    maxTokens: settings.maxTokens
                };
                const responseData = {
                    error: error.message,
                    stack: error.stack
                };
                const characterName = character.remark || character.name || '未知角色';
                await addApiHistoryRecord(requestData, responseData, characterName, 'error');
            } catch (recordError) {
                console.error('记录API历史失败:', recordError);
            }
        }
        
        // 检查是否是用户中断
        if (error.name === 'AbortError') {
            console.log('API调用已被用户中断');
            throw new Error('API调用已被用户中断');
        }
        
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
        initExtendSwiper();
        // 展开面板后滚动聊天到底部
        setTimeout(() => scrollChatToBottom(), 100);
    }
}

// ========== 拓展面板滑动切换 ==========
let _extendSwiperInited = false;
let _extendCurrentPage = 0;

function initExtendSwiper() {
    if (_extendSwiperInited) return;
    _extendSwiperInited = true;

    const swiper = document.getElementById('chatExtendSwiper');
    if (!swiper) return;

    let startX = 0;
    let startY = 0;
    let diffX = 0;
    let isDragging = false;
    let isHorizontal = null;
    const threshold = 40;

    function getPageCount() {
        return swiper.querySelectorAll('.chat-extend-page').length;
    }

    function goToPage(page) {
        const total = getPageCount();
        if (page < 0) page = 0;
        if (page >= total) page = total - 1;
        _extendCurrentPage = page;
        swiper.style.transform = `translateX(-${page * 100}%)`;
        // 更新指示器
        const dots = swiper.parentElement.querySelectorAll('.chat-extend-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === page);
        });
    }

    function handleStart(e) {
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        startX = clientX;
        startY = clientY;
        diffX = 0;
        isDragging = true;
        isHorizontal = null;
        swiper.style.transition = 'none';
    }

    function handleMove(e) {
        if (!isDragging) return;
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const dx = clientX - startX;
        const dy = clientY - startY;

        // 判断滑动方向
        if (isHorizontal === null && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            isHorizontal = Math.abs(dx) > Math.abs(dy);
        }

        if (!isHorizontal) return;

        e.preventDefault();
        diffX = dx;
        const offset = -_extendCurrentPage * 100 + (diffX / swiper.offsetWidth) * 100;
        swiper.style.transform = `translateX(${offset}%)`;
    }

    function handleEnd() {
        if (!isDragging) return;
        isDragging = false;
        swiper.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';

        if (Math.abs(diffX) > threshold) {
            if (diffX < 0) {
                goToPage(_extendCurrentPage + 1);
            } else {
                goToPage(_extendCurrentPage - 1);
            }
        } else {
            goToPage(_extendCurrentPage);
        }
        diffX = 0;
    }

    // 触摸事件
    swiper.addEventListener('touchstart', handleStart, { passive: true });
    swiper.addEventListener('touchmove', handleMove, { passive: false });
    swiper.addEventListener('touchend', handleEnd);

    // 鼠标事件（PC端拖拽）
    swiper.addEventListener('mousedown', handleStart);
    swiper.addEventListener('mousemove', handleMove);
    swiper.addEventListener('mouseup', handleEnd);
    swiper.addEventListener('mouseleave', () => { if (isDragging) handleEnd(); });

    // 点击指示器切换
    const dots = swiper.parentElement.querySelectorAll('.chat-extend-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.dataset.page);
            if (!isNaN(page)) goToPage(page);
        });
    });
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
            openImagePicker();
            break;
        case 'narration':
            openNarrationModal();
            break;
        case 'proactiveSpeak':
            handleProactiveSpeak();
            break;
        case 'transfer':
            openTransferModal();
            break;
        case 'gift':
            showIosAlert('提示', '礼物功能开发中');
            break;
        case 'textImage':
            openTextImageModal();
            break;
        case 'videoCall':
            startVideoCall();
            break;
        case 'location':
            openLocationModal();
            break;
        case 'voiceCall':
            showIosAlert('提示', '语音通话功能开发中');
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

        // 收集最后一条用户消息之后的所有角色消息和系统消息（即本回合AI的回复和相关系统通知）
        const messagesToDelete = [];
        for (let i = lastUserMsgIndex + 1; i < characterMessages.length; i++) {
            // 删除角色消息和系统消息
            if (characterMessages[i].type === 'char' || characterMessages[i].sender === 'char' || 
                characterMessages[i].type === 'system' || characterMessages[i].messageType === 'systemNotice') {
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

        // 从UI中移除这些消息（从底部移除对应数量的角色消息和系统消息）
        const container = document.getElementById('chatMessagesContainer');
        const allBubbles = container.querySelectorAll('.chat-message');
        let removed = 0;
        for (let i = allBubbles.length - 1; i >= 0 && removed < messagesToDelete.length; i--) {
            // 删除角色消息和系统消息
            if (allBubbles[i].classList.contains('chat-message-char') || 
                allBubbles[i].classList.contains('chat-system-message')) {
                allBubbles[i].remove();
                removed++;
            }
        }

        // 立即更新聊天列表的预览消息
        const lastMsg = await getLastMessageForCharacter(currentChatCharacter.id);
        if (lastMsg) {
            await updateChatListLastMessage(currentChatCharacter.id, lastMsg.text, lastMsg.time);
        } else {
            // 如果没有消息了，清空预览
            await updateChatListLastMessage(currentChatCharacter.id, '', '');
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
    const voiceText = messageObj.voiceText || '';
    const duration = messageObj.voiceDuration || estimateVoiceDuration(voiceText);
    const bubbleWidth = Math.min(220, 80 + duration * 8);

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-voice-bubble" style="width:${bubbleWidth}px;" onclick="this.parentElement.querySelector('.voice-text-reveal').classList.toggle('show')">
                <div class="voice-wave-icon">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <span class="voice-duration">${duration}"</span>
            </div>
            <div class="voice-text-reveal">${escapeHtml(voiceText)}</div>
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
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
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

// 加载URL图片为DataURL（保留GIF动画）
function loadImageUrlAsDataURL(url) {
    return new Promise((resolve, reject) => {
        // 使用fetch获取图片，保留原始格式
        fetch(url)
            .then(response => {
                if (!response.ok) throw new Error('图片加载失败');
                return response.blob();
            })
            .then(blob => {
                const reader = new FileReader();
                reader.onload = (e) => {
                    console.log('🌐 URL图片已加载，保留原始格式');
                    resolve(e.target.result);
                };
                reader.onerror = () => reject(new Error('文件读取失败'));
                reader.readAsDataURL(blob);
            })
            .catch(err => {
                // 如果fetch失败（可能是CORS问题），回退到Canvas方法
                console.warn('Fetch失败，尝试Canvas方法:', err);
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

    // 检查拉黑状态
    const _charBlocked = typeof isCharBlockedUser === 'function' && isCharBlockedUser(currentChatCharacter.id);
    if (_charBlocked) {
        // 角色拉黑了用户 - 消息标记为不可送达，角色看不到
        messageObj.blockedMsg = true;
    }
    
    // 检查是否有引用信息
    const quoteBar = document.getElementById('chatQuoteBar');
    if (quoteBar && quoteBar.style.display !== 'none' && quoteBar.dataset.quoteId) {
        messageObj.quotedMessageId = quoteBar.dataset.quoteId;
        messageObj.quotedSender = quoteBar.dataset.quoteSender;
        messageObj.quotedContent = quoteBar.dataset.quoteText;
    }
    
    // 添加消息到界面
    appendMessageToChat(messageObj);
    
    // 清空输入框
    input.value = '';
    
    // 关闭引用条
    closeQuoteBar();
    
    // 保存消息到数据库
    await saveMessageToDB(messageObj);
    
    // 如果角色不在线，增加未读计数
    if (typeof shouldBlockAIReply === 'function' && shouldBlockAIReply(currentChatCharacter.id)) {
        if (typeof incrementUnreadCount === 'function') incrementUnreadCount(currentChatCharacter.id);
    }
    
    // 更新聊天列表中的最后一条消息
    await updateChatListLastMessage(currentChatCharacter.id, message, new Date().toISOString());
    
    // 滚动到底部
    scrollChatToBottom();
    
    // 群聊不自动调用API，需要手动点击"调用API"按钮
    // 如果是群聊，触发群成员回复
    // if (currentChatCharacter.groupType === 'group' && typeof handleGroupChatMessage === 'function') {
    //     await handleGroupChatMessage(message);
    // }
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
        
        // 角色消息且用户不在该聊天界面时，增加未读计数并更新列表
        if (messageObj.type === 'char' && messageObj.characterId) {
            if (!isUserInChatDetail(messageObj.characterId)) {
                const character = chatCharacters.find(c => c.id === messageObj.characterId);
                if (character) {
                    character.unreadCount = (character.unreadCount || 0) + 1;
                    // 更新预览文字
                    const previewText = messageObj.messageType === 'sticker' ? '[表情包]' 
                        : messageObj.messageType === 'voice' ? '[语音消息]' 
                        : messageObj.messageType === 'transfer' ? '[转账]' 
                        : messageObj.messageType === 'location' ? '[位置]'
                        : messageObj.messageType === 'bankTransfer' ? '[银行转账]'
                        : messageObj.messageType === 'avatarChange' ? '[更换头像]'
                        : messageObj.messageType === 'coupleAvatarChange' ? '[更换情头]'
                        : messageObj.messageType === 'systemNotice' ? messageObj.content
                        : (messageObj.content || '').substring(0, 50);
                    character.lastMessage = previewText;
                    character.lastMessageTime = messageObj.timestamp || new Date().toISOString();
                    await saveChatCharacters();
                    renderChatList();
                }
            }
        }
    } catch (error) {
        console.error('保存消息失败:', error);
    }
}

// 从数据库获取某个角色的最后一条消息
async function getLastMessageForCharacter(characterId) {
    try {
        const allChats = await getAllChatsFromDB();
        const charMsgs = allChats.filter(m => m.characterId === characterId);
        if (charMsgs.length === 0) return null;
        charMsgs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        const last = charMsgs[0];
        let previewText = '';
        if (last.messageType === 'image') previewText = '[图片]';
        else if (last.messageType === 'textImage') previewText = '[图片]';
        else if (last.messageType === 'sticker') previewText = '[表情包]';
        else if (last.messageType === 'voice') previewText = '[语音消息]';
        else if (last.messageType === 'transfer') previewText = '[转账]';
        else if (last.messageType === 'location') previewText = '[位置]';
        else if (last.messageType === 'bankTransfer') previewText = '[银行转账]';
        else if (last.messageType === 'avatarChange') previewText = '[更换头像]';
        else if (last.messageType === 'coupleAvatarChange') previewText = '[更换情头]';
        else if (last.messageType === 'systemNotice') previewText = last.content || '';
        else previewText = (last.content || '').substring(0, 50);
        return { text: previewText, time: last.timestamp };
    } catch (e) {
        console.error('获取最后消息失败:', e);
        return null;
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

// 清除当前角色的所有聊天记录
async function clearAllChatMessages() {
    if (!currentChatCharacter) return;

    const confirmed = await iosConfirm(
        '确定要清除与「' + currentChatCharacter.remark + '」的所有聊天记录吗？\n\n此操作不可撤销。',
        '清除聊天记录'
    );
    if (!confirmed) return;

    try {
        const characterId = currentChatCharacter.id;
        const allChats = await getAllChatsFromDB();
        const toDelete = allChats.filter(c => c.characterId === characterId);

        for (const msg of toDelete) {
            await deleteMsgFromDB(msg.id);
            // 如果消息有关联图片，也删除
            if (msg.imageId) {
                await deleteImageFromDB(msg.imageId);
            }
        }

        // 清空聊天界面
        const container = document.getElementById('chatMessagesContainer');
        container.innerHTML = `
            <div class="chat-empty-message">
                <div style="font-size: 14px; color: #999;">开始对话吧</div>
            </div>
        `;

        // 更新聊天列表的最后一条消息
        await updateChatListLastMessage(characterId, '', '');

        // 刷新对话统计
        if (typeof updateChatStats === 'function') {
            await updateChatStats();
        }

        showToast('聊天记录已清除');
    } catch (error) {
        console.error('清除聊天记录失败:', error);
        showToast('清除失败，请重试');
    }
}

// 导出当前角色的聊天记录
async function exportChatHistory() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先选择一个角色');
        return;
    }

    try {
        const characterId = currentChatCharacter.id;
        const characterName = currentChatCharacter.remark || currentChatCharacter.name || '未命名';
        
        // 1. 获取该角色的所有聊天记录
        const allChats = await getAllChatsFromDB();
        const characterChats = allChats.filter(c => c.characterId === characterId);

        if (characterChats.length === 0) {
            const confirmed = await iosConfirm(
                '当前角色没有聊天记录，是否仍要导出角色设置和表情包？',
                '提示'
            );
            if (!confirmed) return;
        }

        // 2. 获取角色的长期记忆
        const longTermMemories = await getLongTermMemories(characterId);

        // 3. 获取角色专属表情包
        const allImages = await getAllImagesFromDB();
        const characterStickers = allImages.filter(img => 
            img.type === 'charSticker' && 
            img.characterIds && 
            img.characterIds.includes(characterId)
        );

        // 4. 获取角色设置
        const characterSettings = {
            id: currentChatCharacter.id,
            name: currentChatCharacter.name,
            remark: currentChatCharacter.remark,
            description: currentChatCharacter.description,
            avatar: currentChatCharacter.avatar,
            shortTermMemory: currentChatCharacter.shortTermMemory,
            timeAwareness: currentChatCharacter.timeAwareness,
            longTermMemoryInterval: currentChatCharacter.longTermMemoryInterval,
            longTermMemoryFormat: currentChatCharacter.longTermMemoryFormat,
            longTermMemoryCustomPrompt: currentChatCharacter.longTermMemoryCustomPrompt,
            ltmCondenseFormat: currentChatCharacter.ltmCondenseFormat,
            ltmCondenseCustomPrompt: currentChatCharacter.ltmCondenseCustomPrompt,
            mountedChatIds: currentChatCharacter.mountedChatIds,
            createTime: currentChatCharacter.createTime
        };

        // 5. 获取记忆库存档
        let memoryArchives = [];
        if (typeof getMemoryArchives === 'function') {
            const allArchives = await getMemoryArchives();
            // 只导出与当前角色相关的存档
            memoryArchives = allArchives.filter(archive => archive.characterId === characterId);
        }

        // 构建导出数据
        const exportData = {
            version: '3.0', // 升级版本号以支持记忆库
            exportTime: new Date().toISOString(),
            characterSettings: characterSettings,
            messageCount: characterChats.length,
            messages: characterChats,
            longTermMemories: longTermMemories,
            characterStickers: characterStickers.map(s => ({
                id: s.id,
                name: s.name,
                data: s.data,
                category: s.category,
                characterIds: s.characterIds,
                accessType: s.accessType
            })),
            memoryArchives: memoryArchives // 新增：记忆库存档
        };

        // 转换为JSON字符串
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `聊天记录_${characterName}_${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        const summary = [
            `聊天记录: ${characterChats.length} 条`,
            `长期记忆: ${longTermMemories.length} 条`,
            `专属表情包: ${characterStickers.length} 个`,
            `记忆库存档: ${memoryArchives.length} 个`
        ].join('\n');
        
        showToast(`导出成功！\n${summary}`);
    } catch (error) {
        console.error('导出聊天记录失败:', error);
        showIosAlert('错误', '导出失败，请重试');
    }
}

// 导入聊天记录
async function importChatHistory() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先选择一个角色');
        return;
    }

    // 创建文件选择器
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 读取文件内容
            const text = await file.text();
            const importData = JSON.parse(text);

            // 验证数据格式
            if (!importData.version || !importData.messages || !Array.isArray(importData.messages)) {
                showIosAlert('错误', '文件格式不正确');
                return;
            }

            // 显示选择界面
            showImportSelectionDialog(importData);
        } catch (error) {
            console.error('导入聊天记录失败:', error);
            showIosAlert('错误', '导入失败，请检查文件格式');
        }
    };

    input.click();
}

// 显示导入选择对话框
function showImportSelectionDialog(importData) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.cssText = 'width: 90%; max-width: 500px; max-height: 85vh; display: flex; flex-direction: column;';
    
    // 标题
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.style.padding = '20px 20px 10px';
    titleEl.textContent = '选择要导入的内容';
    
    // 副标题 - 显示导入数据的统计
    const subtitleEl = document.createElement('div');
    subtitleEl.className = 'ios-dialog-message';
    subtitleEl.style.cssText = 'padding: 0 20px 10px; font-size: 13px; color: #666;';
    const stats = [];
    if (importData.messages && importData.messages.length > 0) {
        stats.push(`${importData.messages.length} 条消息`);
    }
    if (importData.longTermMemories && importData.longTermMemories.length > 0) {
        stats.push(`${importData.longTermMemories.length} 条长期记忆`);
    }
    if (importData.characterStickers && importData.characterStickers.length > 0) {
        stats.push(`${importData.characterStickers.length} 个表情包`);
    }
    if (importData.memoryArchives && importData.memoryArchives.length > 0) {
        stats.push(`${importData.memoryArchives.length} 个记忆库存档`);
    }
    subtitleEl.textContent = `文件包含: ${stats.join('、')}`;
    
    // 导入选项区域
    const optionsContainer = document.createElement('div');
    optionsContainer.style.cssText = 'padding: 15px 20px; border-top: 1px solid #e5e5ea; border-bottom: 1px solid #e5e5ea; background: #f8f8f8;';
    
    // 角色设置选项
    if (importData.characterSettings) {
        const settingsOption = createImportOption(
            'importSettings',
            '导入角色设置',
            '包括短期记忆、长期记忆设置、时间感知等',
            true
        );
        optionsContainer.appendChild(settingsOption);
    }
    
    // 长期记忆选项
    if (importData.longTermMemories && importData.longTermMemories.length > 0) {
        const memoriesOption = createImportOption(
            'importMemories',
            '导入长期记忆',
            `${importData.longTermMemories.length} 条记忆`,
            true
        );
        optionsContainer.appendChild(memoriesOption);
    }
    
    // 表情包选项
    if (importData.characterStickers && importData.characterStickers.length > 0) {
        const stickersOption = createImportOption(
            'importStickers',
            '导入角色专属表情包',
            `${importData.characterStickers.length} 个表情包`,
            true
        );
        optionsContainer.appendChild(stickersOption);
    }
    
    // 记忆库选项
    if (importData.memoryArchives && importData.memoryArchives.length > 0) {
        const archivesOption = createImportOption(
            'importArchives',
            '导入记忆库存档',
            `${importData.memoryArchives.length} 个存档`,
            true
        );
        optionsContainer.appendChild(archivesOption);
    }
    
    // 消息选择区域
    let messageList = null;
    if (importData.messages && importData.messages.length > 0) {
        const messagesHeader = document.createElement('div');
        messagesHeader.style.cssText = 'padding: 10px 20px; border-top: 1px solid #e5e5ea; display: flex; justify-content: space-between; align-items: center; background: #f8f8f8;';
        
        const messagesTitle = document.createElement('div');
        messagesTitle.style.cssText = 'font-size: 14px; font-weight: 600; color: #333;';
        messagesTitle.textContent = '选择要导入的消息';
        
        const selectAllContainer = document.createElement('div');
        selectAllContainer.style.cssText = 'display: flex; gap: 8px;';
        
        const selectAllBtn = document.createElement('button');
        selectAllBtn.textContent = '全选';
        selectAllBtn.style.cssText = 'padding: 4px 12px; background: #007bff; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;';
        selectAllBtn.onclick = () => toggleSelectAll(true);
        
        const deselectAllBtn = document.createElement('button');
        deselectAllBtn.textContent = '取消';
        deselectAllBtn.style.cssText = 'padding: 4px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; font-size: 12px; cursor: pointer;';
        deselectAllBtn.onclick = () => toggleSelectAll(false);
        
        selectAllContainer.appendChild(selectAllBtn);
        selectAllContainer.appendChild(deselectAllBtn);
        
        messagesHeader.appendChild(messagesTitle);
        messagesHeader.appendChild(selectAllContainer);
        
        // 消息列表容器
        messageList = document.createElement('div');
        messageList.id = 'importMessageList';
        messageList.style.cssText = 'flex: 1; overflow-y: auto; padding: 10px 20px; min-height: 200px; max-height: 300px;';
        
        // 渲染消息列表
        importData.messages.forEach((msg, index) => {
            const msgItem = document.createElement('div');
            msgItem.className = 'import-msg-item';
            msgItem.style.cssText = 'display: flex; gap: 10px; padding: 12px; background: #f8f8f8; border-radius: 10px; margin-bottom: 8px; cursor: pointer; transition: background 0.2s;';
            msgItem.dataset.index = index;
            
            // 复选框
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = true;
            checkbox.className = 'import-msg-checkbox';
            checkbox.style.cssText = 'width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; margin-top: 2px;';
            checkbox.onclick = (e) => {
                e.stopPropagation();
                updateSelectedCount();
            };
            
            // 消息内容
            const msgContent = document.createElement('div');
            msgContent.style.cssText = 'flex: 1; min-width: 0;';
            
            const msgHeader = document.createElement('div');
            msgHeader.style.cssText = 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;';
            
            const senderLabel = document.createElement('span');
            senderLabel.style.cssText = 'font-size: 12px; font-weight: 600; color: ' + (msg.type === 'user' ? '#007bff' : '#34c759') + ';';
            senderLabel.textContent = msg.type === 'user' ? '用户' : '角色';
            
            const timeLabel = document.createElement('span');
            timeLabel.style.cssText = 'font-size: 11px; color: #999;';
            timeLabel.textContent = formatMessageTime(msg.timestamp);
            
            msgHeader.appendChild(senderLabel);
            msgHeader.appendChild(timeLabel);
            
            const msgText = document.createElement('div');
            msgText.style.cssText = 'font-size: 13px; color: #333; word-break: break-word; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;';
            msgText.textContent = msg.content || '[无内容]';
            
            msgContent.appendChild(msgHeader);
            msgContent.appendChild(msgText);
            
            msgItem.appendChild(checkbox);
            msgItem.appendChild(msgContent);
            
            // 点击整个项目切换选中状态
            msgItem.onclick = () => {
                checkbox.checked = !checkbox.checked;
                updateSelectedCount();
            };
            
            msgItem.onmouseenter = () => {
                msgItem.style.background = '#e8e8e8';
            };
            msgItem.onmouseleave = () => {
                msgItem.style.background = '#f8f8f8';
            };
            
            messageList.appendChild(msgItem);
        });
    }
    
    // 选中计数
    const selectedCount = document.createElement('div');
    selectedCount.id = 'importSelectedCount';
    selectedCount.style.cssText = 'padding: 8px 20px; font-size: 12px; color: #666; text-align: center; border-top: 1px solid #e5e5ea; background: #f8f8f8;';
    updateSelectedCount();
    
    // 按钮区域
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    buttonsEl.style.borderTop = '1px solid #e5e5ea';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    const importBtn = document.createElement('button');
    importBtn.className = 'ios-dialog-button primary';
    importBtn.textContent = '开始导入';
    importBtn.onclick = () => executeImport(importData);
    
    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(importBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(subtitleEl);
    dialog.appendChild(optionsContainer);
    if (messageList) {
        const messagesHeader = optionsContainer.nextSibling;
        dialog.appendChild(messagesHeader || createMessagesHeader());
        dialog.appendChild(messageList);
    }
    dialog.appendChild(selectedCount);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // 创建导入选项
    function createImportOption(id, title, description, checked) {
        const option = document.createElement('div');
        option.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e5ea;';
        
        const textContainer = document.createElement('div');
        textContainer.style.cssText = 'flex: 1;';
        
        const titleEl = document.createElement('div');
        titleEl.style.cssText = 'font-size: 14px; font-weight: 500; color: #333; margin-bottom: 2px;';
        titleEl.textContent = title;
        
        const descEl = document.createElement('div');
        descEl.style.cssText = 'font-size: 12px; color: #999;';
        descEl.textContent = description;
        
        textContainer.appendChild(titleEl);
        textContainer.appendChild(descEl);
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = id;
        checkbox.checked = checked;
        checkbox.style.cssText = 'width: 20px; height: 20px; cursor: pointer;';
        
        option.appendChild(textContainer);
        option.appendChild(checkbox);
        
        return option;
    }
    
    function createMessagesHeader() {
        const messagesHeader = document.createElement('div');
        messagesHeader.style.cssText = 'padding: 10px 20px; border-top: 1px solid #e5e5ea; display: flex; justify-content: space-between; align-items: center; background: #f8f8f8;';
        
        const messagesTitle = document.createElement('div');
        messagesTitle.style.cssText = 'font-size: 14px; font-weight: 600; color: #333;';
        messagesTitle.textContent = '选择要导入的消息';
        
        messagesHeader.appendChild(messagesTitle);
        return messagesHeader;
    }
    
    // 全选/取消全选功能
    function toggleSelectAll(checked) {
        const checkboxes = document.querySelectorAll('.import-msg-checkbox');
        checkboxes.forEach(cb => cb.checked = checked);
        updateSelectedCount();
    }
    
    // 更新选中数量
    function updateSelectedCount() {
        const checkboxes = document.querySelectorAll('.import-msg-checkbox');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        const totalCount = checkboxes.length;
        selectedCount.textContent = `已选择 ${checkedCount} / ${totalCount} 条消息`;
    }
    
    // 执行导入
    async function executeImport(data) {
        try {
            const importSettings = document.getElementById('importSettings')?.checked || false;
            const importMemories = document.getElementById('importMemories')?.checked || false;
            const importStickers = document.getElementById('importStickers')?.checked || false;
            const importArchives = document.getElementById('importArchives')?.checked || false;
            
            const checkboxes = document.querySelectorAll('.import-msg-checkbox');
            const selectedMessages = [];
            
            checkboxes.forEach((cb, index) => {
                if (cb.checked) {
                    selectedMessages.push(data.messages[index]);
                }
            });
            
            if (!importSettings && !importMemories && !importStickers && !importArchives && selectedMessages.length === 0) {
                showIosAlert('提示', '请至少选择一项内容导入');
                return;
            }
            
            closeDialog();
            
            let successLog = [];
            
            // 1. 导入角色设置
            if (importSettings && data.characterSettings) {
                currentChatCharacter.shortTermMemory = data.characterSettings.shortTermMemory;
                currentChatCharacter.timeAwareness = data.characterSettings.timeAwareness;
                currentChatCharacter.longTermMemoryInterval = data.characterSettings.longTermMemoryInterval;
                currentChatCharacter.longTermMemoryFormat = data.characterSettings.longTermMemoryFormat;
                currentChatCharacter.longTermMemoryCustomPrompt = data.characterSettings.longTermMemoryCustomPrompt;
                currentChatCharacter.ltmCondenseFormat = data.characterSettings.ltmCondenseFormat;
                currentChatCharacter.ltmCondenseCustomPrompt = data.characterSettings.ltmCondenseCustomPrompt;
                currentChatCharacter.mountedChatIds = data.characterSettings.mountedChatIds;
                
                await saveChatCharacters();
                successLog.push('角色设置');
            }
            
            // 2. 导入长期记忆
            if (importMemories && data.longTermMemories && data.longTermMemories.length > 0) {
                for (const memory of data.longTermMemories) {
                    await addLongTermMemory(currentChatCharacter.id, memory.content, memory.source || 'imported');
                }
                successLog.push(`${data.longTermMemories.length} 条长期记忆`);
            }
            
            // 3. 导入表情包
            if (importStickers && data.characterStickers && data.characterStickers.length > 0) {
                for (const sticker of data.characterStickers) {
                    // 生成新的ID避免冲突
                    const newSticker = {
                        ...sticker,
                        id: 'charSticker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        type: 'charSticker',
                        timestamp: Date.now(),
                        // 更新角色ID为当前角色
                        characterIds: [currentChatCharacter.id]
                    };
                    
                    await saveImageToDB(newSticker.id, newSticker.data, 'charSticker');
                    
                    // 更新图片对象的其他属性
                    const allImages = await getAllImagesFromDB();
                    const savedImage = allImages.find(img => img.id === newSticker.id);
                    if (savedImage) {
                        savedImage.name = newSticker.name;
                        savedImage.category = newSticker.category;
                        savedImage.characterIds = newSticker.characterIds;
                        savedImage.accessType = newSticker.accessType;
                        await saveImageToDB(savedImage.id, savedImage.data, 'charSticker');
                    }
                }
                successLog.push(`${data.characterStickers.length} 个表情包`);
            }
            
            // 4. 导入记忆库存档
            if (importArchives && data.memoryArchives && data.memoryArchives.length > 0 && typeof getMemoryArchives === 'function' && typeof saveMemoryArchives === 'function') {
                const existingArchives = await getMemoryArchives();
                
                for (const archive of data.memoryArchives) {
                    // 生成新的ID避免冲突
                    const newArchive = {
                        ...archive,
                        id: 'archive_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                        // 更新角色ID为当前角色
                        characterId: currentChatCharacter.id,
                        // 更新存档中的角色数据
                        character: {
                            ...archive.character,
                            id: currentChatCharacter.id
                        },
                        // 更新消息中的角色ID
                        messages: archive.messages ? archive.messages.map(msg => ({
                            ...msg,
                            characterId: currentChatCharacter.id
                        })) : []
                    };
                    
                    existingArchives.unshift(newArchive);
                }
                
                await saveMemoryArchives(existingArchives);
                
                // 刷新记忆库列表
                if (typeof renderMemoryArchiveList === 'function') {
                    await renderMemoryArchiveList();
                }
                
                successLog.push(`${data.memoryArchives.length} 个记忆库存档`);
            }
            
            // 5. 导入选中的消息
            if (selectedMessages.length > 0) {
                for (let i = 0; i < selectedMessages.length; i++) {
                    const msg = selectedMessages[i];
                    // 更新消息的角色ID为当前角色
                    msg.characterId = currentChatCharacter.id;
                    
                    // 生成新的消息ID（避免冲突）
                    msg.id = Date.now().toString() + Math.random() + '_imported_' + i;
                    
                    // 保存到数据库
                    await saveMessageToDB(msg);
                }
                successLog.push(`${selectedMessages.length} 条消息`);
            }
            
            // 刷新聊天界面
            if (selectedMessages.length > 0 && currentChatCharacter) {
                await loadChatMessages(currentChatCharacter.id);
                
                // 更新聊天列表
                const lastMsg = selectedMessages[selectedMessages.length - 1];
                await updateChatListLastMessage(currentChatCharacter.id, lastMsg.content, lastMsg.timestamp);
            }
            
            // 刷新对话统计
            if (typeof updateChatStats === 'function') {
                await updateChatStats();
            }
            
            // 刷新长期记忆列表（如果打开了）
            if (importMemories && typeof renderLongTermMemoryList === 'function') {
                const ltmPage = document.getElementById('longTermMemoryPage');
                if (ltmPage && ltmPage.style.display !== 'none') {
                    await renderLongTermMemoryList();
                }
            }
            
            showToast(`导入成功！\n${successLog.join('、')}`);
        } catch (error) {
            console.error('导入失败:', error);
            showIosAlert('错误', '导入失败，请重试');
        }
    }
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
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
    
    // 创建typing indicator - 复用chat-message-char结构，让气泡形状/颜色/自定义CSS自动生效
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message chat-message-char typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-message-bubble typing-indicator-bubble">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
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
// 清洗消息内容中残留的JSON格式
function cleanMessageContent(content) {
    if (!content || typeof content !== 'string') return content || '';
    let text = content.trim();
    
    // 检测多个JSON数组拼接格式: ["xxx"] ["yyy"]
    if (/^\["[^"]*"\](\s*\["[^"]*"\])+$/.test(text)) {
        const items = [];
        const regex = /\["([^"]*)"\]/g;
        let m;
        while ((m = regex.exec(text)) !== null) {
            if (m[1]) items.push(m[1]);
        }
        if (items.length > 0) return items.join('');
    }
    
    // 检测单个JSON数组格式: ["xxx", "yyy"]
    if (/^\[".+"\]$/.test(text)) {
        try {
            const arr = JSON.parse(text);
            if (Array.isArray(arr)) {
                return arr.map(s => String(s)).join('');
            }
        } catch (e) { /* 不是合法JSON，保留原样 */ }
    }
    
    // 清理权限指令标记（这些是给AI用的，用户消息中不应该显示）
    text = text
        .replace(/\[admin:[^\]]+\]/g, '')
        .replace(/\[unadmin:[^\]]+\]/g, '')
        .replace(/\[mute:[^\]]+\]/g, '')
        .replace(/\[unmute:[^\]]+\]/g, '')
        .replace(/\[title:[^\]]+\]/g, '')
        .replace(/\[kick:[^\]]+\]/g, '')
        .replace(/\[transfer:[^\]]+\]/g, '')
        .trim();
    
    return text;
}

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

    // 如果是图片消息，用专门的渲染函数
    if (messageObj.messageType === 'image' && messageObj.imageData) {
        appendImageMessageToChat(messageObj);
        return;
    }

    // 如果是图文消息（手动描述图片），用专门的渲染函数
    if (messageObj.messageType === 'textImage') {
        appendTextImageMessageToChat(messageObj);
        return;
    }

    // 如果是转账消息，用专门的渲染函数
    if (messageObj.messageType === 'transfer') {
        appendTransferMessageToChat(messageObj);
        return;
    }

    // 如果是定位消息，用专门的渲染函数
    if (messageObj.messageType === 'location') {
        appendLocationMessageToChat(messageObj);
        return;
    }

    // 如果是银行转账消息，用专门的渲染函数
    if (messageObj.messageType === 'bankTransfer') {
        appendBankTransferMessageToChat(messageObj);
        return;
    }

    // 如果是头像更换消息，用专门的渲染函数
    if (messageObj.messageType === 'avatarChange') {
        appendAvatarChangeMessageToChat(messageObj);
        return;
    }

    // 如果是情头更换消息，用专门的渲染函数
    if (messageObj.messageType === 'coupleAvatarChange') {
        if (typeof appendCoupleAvatarChangeCard === 'function') {
            appendCoupleAvatarChangeCard(messageObj);
        }
        return;
    }

    // 如果是引用消息，用专门的渲染函数
    if (messageObj.messageType === 'quote') {
        appendQuoteMessageToChat(messageObj);
        return;
    }

    // 如果是系统消息，用专门的渲染函数
    if (messageObj.messageType === 'systemNotice' || messageObj.type === 'system') {
        appendSystemMessageToChat(messageObj);
        return;
    }

    // 如果是视频通话消息，用专门的渲染函数
    if (messageObj.messageType === 'video-call') {
        appendVideoCallMessageToChat(messageObj);
        return;
    }
    
    // 如果是来电消息，用专门的渲染函数
    if (messageObj.messageType === 'incoming-video-call') {
        if (typeof appendIncomingCallMessageToChat === 'function') {
            appendIncomingCallMessageToChat(messageObj);
        } else {
            console.warn('appendIncomingCallMessageToChat 函数未定义');
        }
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
    let isGroupMessage = false;
    
    // 检查是否是群聊消息
    if (typeof getGroupMessageSender === 'function') {
        const groupSender = getGroupMessageSender(messageObj);
        if (groupSender.isGroupMessage) {
            avatar = groupSender.avatar;
            senderName = groupSender.name;
            isGroupMessage = true;
        }
    }
    
    // 如果不是群聊消息，使用原有逻辑
    if (!isGroupMessage) {
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
    }
    
    // 格式化时间（时:分:秒）
    const time = formatMessageTime(messageObj.timestamp);
    
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    // 构建引用预览HTML（在气泡外面）
    let quoteHtml = '';
    if (messageObj.quotedMessageId && messageObj.quotedSender && messageObj.quotedContent) {
        const quotedText = messageObj.quotedContent.length > 30 
            ? messageObj.quotedContent.substring(0, 30) + '...' 
            : messageObj.quotedContent;
        quoteHtml = `
            <div class="chat-quote-preview">
                <span class="chat-quote-sender">${escapeHtml(messageObj.quotedSender)}</span>: ${escapeHtml(quotedText)}
            </div>
        `;
    }
    
    // 拉黑状态感叹号
    let blockIndicator = '';
    if (messageObj.blockedMsg) {
        blockIndicator = '<div class="msg-block-indicator" title="消息未送达">⚠</div>';
    }

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            ${isGroupMessage && messageObj.type === 'char' ? `<div class="chat-message-name" style="font-size: 12px; color: #999; margin-bottom: 4px;">${escapeHtml(senderName)}</div>` : ''}
            <div class="chat-message-bubble">
                ${escapeHtml(replaceAtUserWithRealName(cleanMessageContent(messageObj.content)))}
            </div>
            ${quoteHtml}
            <div class="chat-message-time">${time}${blockIndicator}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
    
    // 如果是用户发送的消息，添加发送动画
    if (messageObj.type === 'user' && typeof addMessageSendAnimation === 'function') {
        addMessageSendAnimation(messageEl);
    }
}

// 格式化消息时间（时:分:秒）
function formatMessageTime(date) {
    const d = new Date(date);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    const seconds = d.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

// HTML转义（增强版：保留换行和多个空格）
function escapeHtml(text) {
    if (!text) return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    let html = div.innerHTML;
    
    // 把换行符转成<br>标签
    html = html.replace(/\n/g, '<br>');
    
    // 把多个连续空格转成&nbsp;（保留格式）
    html = html.replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length));
    
    // 把单独的空格（在行首或<br>后）也转成&nbsp;，防止被折叠
    html = html.replace(/(<br>|^) /g, '$1&nbsp;');
    
    return html;
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

/**
 * 替换消息中的@用户为真实用户名，并处理群聊中的@成员
 * @param {string} content - 消息内容
 * @returns {string} - 替换后的内容
 */
function replaceAtUserWithRealName(content) {
    if (!content || !currentChatCharacter) return content;
    
    // 获取当前角色的用户数据
    const userData = getUserDataForCharacter(currentChatCharacter.id);
    const realUserName = userData.name || '用户';
    
    // 替换所有的 @用户 为真实用户名
    // 使用正则表达式匹配 @用户，但要确保后面是空格、标点或结尾
    let result = content.replace(/@用户(?=\s|$|[，。！？、：；""''（）《》【】])/g, '@' + realUserName);
    
    // 如果是群聊，处理 @数字 和 @成员名
    if (currentChatCharacter.groupType === 'group') {
        // 处理 @数字 格式（如 @2, @3）
        result = result.replace(/@(\d+)/g, (match, memberId) => {
            // 查找对应的成员
            const member = chatCharacters.find(c => c.id === memberId || c.id === `char_${memberId}`);
            if (member) {
                return '@' + (member.remark || member.name);
            }
            // 如果找不到，保持原样
            return match;
        });
        
        // 处理 @成员名 格式（已经是名字的情况，保持原样即可）
        // 不需要额外处理，因为已经是可读的名字了
    }
    
    return result;
}

/**
 * 替换聊天列表预览中的@用户为真实用户名
 * @param {string} content - 消息内容
 * @param {string} characterId - 角色ID
 * @returns {string} - 替换后的内容
 */
function replaceAtUserInPreview(content, characterId) {
    if (!content || !characterId) return content;
    
    // 获取指定角色的用户数据
    const userData = getUserDataForCharacter(characterId);
    const realUserName = userData.name || '用户';
    
    // 替换所有的 @用户 为真实用户名
    // 使用正则表达式匹配 @用户，但要确保后面是空格、标点或结尾
    return content.replace(/@用户(?=\s|$|[，。！？、：；""''（）《》【】])/g, '@' + realUserName);
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



// ========== 群聊权限指令执行函数 ==========

/**
 * 执行设置/取消管理员指令
 */
async function executeGroupAdminCommand(operatorId, targetId, groupData, setAdmin) {
    console.log('🔧 executeGroupAdminCommand 被调用', { operatorId, targetId, setAdmin });
    
    // 权限检查
    if (groupData.owner !== operatorId) {
        console.warn(`❌ 角色 ${operatorId} 不是群主，无法设置管理员`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    // 不能对群主操作
    if (targetId === groupData.owner) {
        console.warn(`❌ 不能对群主操作`);
        return;
    }
    
    // 检查是否已经是管理员
    if (!groupData.admins) groupData.admins = [];
    const isAdmin = groupData.admins.includes(targetId);
    
    if (setAdmin && isAdmin) {
        console.warn(`⚠️ ${targetId} 已经是管理员`);
        return;
    }
    
    if (!setAdmin && !isAdmin) {
        console.warn(`⚠️ ${targetId} 不是管理员`);
        return;
    }
    
    // 执行操作
    if (setAdmin) {
        groupData.admins.push(targetId);
    } else {
        groupData.admins = groupData.admins.filter(id => id !== targetId);
    }
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 管理员状态已更新');
    
    // 生成系统消息
    const operatorName = groupData.remark || groupData.name;
    const targetName = targetMember.remark || targetMember.name;
    const systemContent = setAdmin
        ? `群主"${operatorName}"设置"${targetName}"为管理员`
        : `群主"${operatorName}"取消了"${targetName}"的管理员`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 执行禁言指令
 */
async function executeGroupMuteCommand(operatorId, targetId, duration, groupData) {
    console.log('🔇 executeGroupMuteCommand 被调用', { operatorId, targetId, duration });
    
    // 权限检查：群主和管理员可以禁言
    const isOwner = groupData.owner === operatorId;
    const isAdmin = groupData.admins && groupData.admins.includes(operatorId);
    
    if (!isOwner && !isAdmin) {
        console.warn(`❌ 角色 ${operatorId} 没有禁言权限`);
        return;
    }
    
    // 不能禁言群主
    if (targetId === groupData.owner) {
        console.warn(`❌ 不能禁言群主`);
        return;
    }
    
    // 管理员不能禁言其他管理员
    if (isAdmin && !isOwner && groupData.admins && groupData.admins.includes(targetId)) {
        console.warn(`❌ 管理员不能禁言其他管理员`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    // 初始化成员状态
    if (!groupData.memberStatus) groupData.memberStatus = {};
    if (!groupData.memberStatus[targetId]) {
        groupData.memberStatus[targetId] = {
            isMuted: false,
            muteUntil: null,
            joinTime: new Date().toISOString(),
            title: '',
            level: 1,
            messageCount: 0,
            lastActiveTime: null
        };
    }
    
    const status = groupData.memberStatus[targetId];
    
    // 解析禁言时长
    let minutes = 0;
    let durationText = '';
    
    if (duration === '永久' || duration === 'permanent' || duration === '0') {
        minutes = 0;
        durationText = '永久';
    } else {
        minutes = parseInt(duration);
        if (isNaN(minutes) || minutes < 0) {
            console.warn(`❌ 无效的禁言时长: ${duration}`);
            return;
        }
        durationText = `${minutes}分钟`;
    }
    
    // 执行禁言
    status.isMuted = true;
    if (minutes > 0) {
        status.muteUntil = new Date(Date.now() + minutes * 60000).toISOString();
    } else {
        status.muteUntil = null;
    }
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 禁言状态已更新:', status);
    
    // 生成系统消息
    const operatorName = groupData.remark || groupData.name;
    const operatorRole = isOwner ? '群主' : '管理员';
    const targetName = targetMember.remark || targetMember.name;
    const systemContent = `${operatorRole}"${operatorName}"将成员"${targetName}"禁言 ${durationText}`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 执行解除禁言指令
 */
async function executeGroupUnmuteCommand(operatorId, targetId, groupData) {
    console.log('🔊 executeGroupUnmuteCommand 被调用', { operatorId, targetId });
    
    // 权限检查
    const isOwner = groupData.owner === operatorId;
    const isAdmin = groupData.admins && groupData.admins.includes(operatorId);
    
    if (!isOwner && !isAdmin) {
        console.warn(`❌ 角色 ${operatorId} 没有解除禁言权限`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    // 检查是否被禁言
    if (!groupData.memberStatus?.[targetId]?.isMuted) {
        console.warn(`⚠️ 该成员未被禁言`);
        return;
    }
    
    const status = groupData.memberStatus[targetId];
    status.isMuted = false;
    status.muteUntil = null;
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 已解除禁言');
    
    // 生成系统消息
    const operatorName = groupData.remark || groupData.name;
    const operatorRole = isOwner ? '群主' : '管理员';
    const targetName = targetMember.remark || targetMember.name;
    const systemContent = `${operatorRole}"${operatorName}"解除了成员"${targetName}"的禁言`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 执行设置头衔指令
 */
async function executeGroupTitleCommand(operatorId, targetId, title, groupData) {
    console.log('👑 executeGroupTitleCommand 被调用', { operatorId, targetId, title });
    
    // 权限检查：只有群主可以设置头衔
    if (groupData.owner !== operatorId) {
        console.warn(`❌ 角色 ${operatorId} 不是群主，无法设置头衔`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    // 初始化成员状态
    if (!groupData.memberStatus) groupData.memberStatus = {};
    if (!groupData.memberStatus[targetId]) {
        groupData.memberStatus[targetId] = {
            isMuted: false,
            muteUntil: null,
            joinTime: new Date().toISOString(),
            title: '',
            level: 1,
            messageCount: 0,
            lastActiveTime: null
        };
    }
    
    // 设置头衔
    groupData.memberStatus[targetId].title = title;
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 头衔已设置');
    
    // 生成系统消息
    const operatorName = groupData.remark || groupData.name;
    const targetName = targetMember.remark || targetMember.name;
    const systemContent = title
        ? `群主"${operatorName}"将"${targetName}"的头衔设置为"${title}"`
        : `群主"${operatorName}"清除了"${targetName}"的头衔`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 执行踢出群聊指令
 */
async function executeGroupKickCommand(operatorId, targetId, groupData) {
    console.log('👢 executeGroupKickCommand 被调用', { operatorId, targetId });
    
    // 权限检查
    const isOwner = groupData.owner === operatorId;
    const isAdmin = groupData.admins && groupData.admins.includes(operatorId);
    
    if (!isOwner && !isAdmin) {
        console.warn(`❌ 角色 ${operatorId} 没有踢人权限`);
        return;
    }
    
    // 不能踢群主
    if (targetId === groupData.owner) {
        console.warn(`❌ 不能踢出群主`);
        return;
    }
    
    // 管理员不能踢其他管理员
    if (isAdmin && !isOwner && groupData.admins && groupData.admins.includes(targetId)) {
        console.warn(`❌ 管理员不能踢出其他管理员`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    const targetName = targetMember.remark || targetMember.name;
    
    // 执行踢出
    groupData.members = groupData.members.filter(id => id !== targetId);
    
    if (groupData.membersWhoKnowUser) {
        groupData.membersWhoKnowUser = groupData.membersWhoKnowUser.filter(id => id !== targetId);
    }
    
    if (groupData.memberStatus?.[targetId]) {
        delete groupData.memberStatus[targetId];
    }
    
    if (groupData.settings?.memberActivity?.[targetId]) {
        delete groupData.settings.memberActivity[targetId];
    }
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 成员已被踢出');
    
    // 生成系统消息
    const operatorName = groupData.remark || groupData.name;
    const operatorRole = isOwner ? '群主' : '管理员';
    const systemContent = `${operatorRole}"${operatorName}"将成员"${targetName}"移出了群聊`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 执行转让群主指令
 */
async function executeGroupTransferOwnerCommand(operatorId, targetId, groupData) {
    console.log('👑 executeGroupTransferOwnerCommand 被调用', { operatorId, targetId });
    
    // 权限检查：只有群主可以转让
    if (groupData.owner !== operatorId) {
        console.warn(`❌ 角色 ${operatorId} 不是群主，无法转让群主`);
        return;
    }
    
    // 查找目标成员
    const targetMember = chatCharacters.find(c => c.id === targetId);
    if (!targetMember) {
        console.warn(`❌ 找不到成员: ${targetId}`);
        return;
    }
    
    // 不能转让给自己
    if (targetId === operatorId) {
        console.warn(`❌ 不能转让给自己`);
        return;
    }
    
    const operatorName = groupData.remark || groupData.name;
    const targetName = targetMember.remark || targetMember.name;
    
    // 执行转让
    const oldOwnerId = groupData.owner;
    groupData.owner = targetId;
    
    // 将旧群主设为管理员
    if (!groupData.admins) groupData.admins = [];
    if (!groupData.admins.includes(oldOwnerId)) {
        groupData.admins.push(oldOwnerId);
    }
    
    // 移除新群主的管理员身份（如果有）
    groupData.admins = groupData.admins.filter(id => id !== targetId);
    
    await saveChatCharacters();
    await saveChatCharacterToDB(groupData);
    
    console.log('✅ 群主已转让');
    
    // 生成系统消息
    const systemContent = `"${operatorName}"将群主转让给"${targetName}"`;
    
    await addGroupSystemMessageDirect(systemContent, groupData.id);
}

/**
 * 直接添加群聊系统消息（不依赖script3.js）
 */
async function addGroupSystemMessageDirect(content, characterId) {
    console.log('📢 addGroupSystemMessageDirect 被调用:', content);
    
    const systemMessageObj = {
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        type: 'system',
        messageType: 'systemNotice',
        content: content,
        timestamp: new Date().toISOString(),
        characterId: characterId,
        sender: 'system'
    };
    
    // 渲染到聊天界面
    if (currentChatCharacter && currentChatCharacter.id === characterId) {
        if (typeof appendSystemMessageToChat === 'function') {
            appendSystemMessageToChat(systemMessageObj);
            console.log('✅ 系统消息已渲染到界面');
        } else {
            console.error('❌ appendSystemMessageToChat 函数不存在');
        }
    }
    
    // 保存到数据库
    await saveMessageToDB(systemMessageObj);
    console.log('💾 系统消息已保存到数据库');
    
    // 滚动到底部
    if (typeof scrollChatToBottom === 'function') {
        scrollChatToBottom();
    }
}
