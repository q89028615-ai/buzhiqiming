// ========== video-call.js - 视频通话功能模块 ==========
console.log('video-call.js 开始加载...');

// ========== 视频通话数据管理 ==========

// 获取视频通话记忆库（按角色过滤）
async function getVideoCallRecords(characterId = null) {
    try {
        const data = await storageDB.getItem('videoCallRecords');
        const records = data || [];
        
        if (characterId) {
            return records.filter(r => r.characterId === characterId);
        }
        
        return records;
    } catch (e) {
        console.error('获取视频通话记录失败:', e);
        return [];
    }
}

// 保存视频通话记忆库
async function saveVideoCallRecords(records) {
    try {
        await storageDB.setItem('videoCallRecords', records);
    } catch (e) {
        console.error('保存视频通话记录失败:', e);
    }
}

// 添加视频通话记录
async function addVideoCallRecord(record) {
    const records = await getVideoCallRecords();
    records.push(record);
    await saveVideoCallRecords(records);
}

// 删除视频通话记录
async function deleteVideoCallRecord(recordId) {
    const records = await getVideoCallRecords();
    const filtered = records.filter(r => r.id !== recordId);
    await saveVideoCallRecords(filtered);
}

// 获取角色的视频通话头像设置
function getVideoCallAvatars(characterId) {
    const key = `videoCallAvatars_${characterId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : {
        userAvatar: null,
        characterAvatar: null
    };
}

// 保存角色的视频通话头像设置
function saveVideoCallAvatars(characterId, avatars) {
    const key = `videoCallAvatars_${characterId}`;
    localStorage.setItem(key, JSON.stringify(avatars));
}

// ========== 视频通话UI ==========

// 当前视频通话状态
let currentVideoCall = null;
let isVideoCallMinimized = false;
let isVideoViewSwapped = false; // 是否切换了大小窗

// 最小化视频通话
window.minimizeVideoCall = function minimizeVideoCall() {
    const overlay = document.getElementById('videoCallOverlay');
    if (!overlay) return;
    
    isVideoCallMinimized = true;
    overlay.style.display = 'none';
    
    // 创建悬浮球
    createVideoCallFloatingBall();
}

// 恢复视频通话
window.restoreVideoCall = function restoreVideoCall() {
    const overlay = document.getElementById('videoCallOverlay');
    const floatingBall = document.getElementById('videoCallFloatingBall');
    
    if (overlay) {
        isVideoCallMinimized = false;
        overlay.style.display = 'flex';
    }
    
    if (floatingBall) {
        floatingBall.remove();
    }
}

// 创建悬浮球
function createVideoCallFloatingBall() {
    // 移除已存在的悬浮球
    const existing = document.getElementById('videoCallFloatingBall');
    if (existing) existing.remove();
    
    const ball = document.createElement('div');
    ball.id = 'videoCallFloatingBall';
    ball.className = 'video-call-floating-ball';
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
        charAvatar = currentChatCharacter.avatar;
    }
    
    const avatarHtml = charAvatar 
        ? `<img src="${charAvatar}" alt="通话中">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    ball.innerHTML = `
        <div class="floating-ball-avatar">
            ${avatarHtml}
        </div>
        <div class="floating-ball-status">${getFloatingBallStatusText()}</div>
    `;
    
    document.body.appendChild(ball);
    
    // 计算初始位置（小手机右上角）
    const phoneContainer = document.querySelector('.phone-container') || document.body;
    const phoneRect = phoneContainer.getBoundingClientRect();
    ball.style.left = (phoneRect.right - 90) + 'px';
    ball.style.top = '100px';
    ball.style.right = 'auto';
    
    // 点击恢复
    ball.addEventListener('click', (e) => {
        if (!isDragging) {
            restoreVideoCall();
        }
    });
    
    // 拖动功能
    makeDraggable(ball);
    
    // 定时更新状态
    updateFloatingBallStatus();
}

// 获取悬浮球状态文本
function getFloatingBallStatusText() {
    if (!currentVideoCall) return '';
    
    if (currentVideoCall.status === 'calling') {
        return '呼叫中...';
    } else if (currentVideoCall.status === 'connected') {
        const elapsed = Math.floor((Date.now() - currentVideoCall.connectedTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    return '';
}

// 更新悬浮球状态
function updateFloatingBallStatus() {
    const ball = document.getElementById('videoCallFloatingBall');
    if (!ball || !isVideoCallMinimized) return;
    
    const statusEl = ball.querySelector('.floating-ball-status');
    if (statusEl) {
        statusEl.textContent = getFloatingBallStatusText();
    }
    
    setTimeout(() => updateFloatingBallStatus(), 1000);
}

// 拖动相关变量
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let ballStartX = 0;
let ballStartY = 0;

// 使元素可拖动
function makeDraggable(element) {
    let startX, startY, initialX, initialY;
    
    element.addEventListener('touchstart', dragStart, { passive: false });
    element.addEventListener('touchmove', drag, { passive: false });
    element.addEventListener('touchend', dragEnd, { passive: false });
    
    element.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);
    
    function dragStart(e) {
        isDragging = false;
        
        const touch = e.touches ? e.touches[0] : e;
        startX = touch.clientX;
        startY = touch.clientY;
        
        const rect = element.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        
        dragStartX = startX;
        dragStartY = startY;
        ballStartX = initialX;
        ballStartY = initialY;
        
        element.style.transition = 'none';
        e.preventDefault();
    }
    
    function drag(e) {
        if (e.type === 'mousemove' && e.buttons !== 1) return;
        
        const touch = e.touches ? e.touches[0] : e;
        const currentX = touch.clientX;
        const currentY = touch.clientY;
        
        const deltaX = currentX - dragStartX;
        const deltaY = currentY - dragStartY;
        
        // 如果移动超过5px，认为是拖动
        if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
            isDragging = true;
        }
        
        if (isDragging) {
            const newX = ballStartX + deltaX;
            const newY = ballStartY + deltaY;
            
            // 获取小手机容器的边界
            const phoneContainer = document.querySelector('.phone-container');
            let maxX = window.innerWidth - element.offsetWidth;
            let minX = 0;
            
            if (phoneContainer) {
                const phoneRect = phoneContainer.getBoundingClientRect();
                minX = phoneRect.left;
                maxX = phoneRect.right - element.offsetWidth;
            }
            
            const maxY = window.innerHeight - element.offsetHeight;
            
            const boundedX = Math.max(minX, Math.min(newX, maxX));
            const boundedY = Math.max(0, Math.min(newY, maxY));
            
            element.style.left = boundedX + 'px';
            element.style.top = boundedY + 'px';
            
            e.preventDefault();
        }
    }
    
    function dragEnd(e) {
        element.style.transition = 'all 0.3s ease';
        
        setTimeout(() => {
            isDragging = false;
        }, 100);
    }
}

// 发起视频通话
window.startVideoCall = async function startVideoCall() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    // 初始化通话状态
    currentVideoCall = {
        id: 'videocall_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        characterId: currentChatCharacter.id,
        startTime: Date.now(),
        endTime: null,
        duration: 0,
        status: 'calling', // calling/connected/rejected/cancelled/completed
        messages: [],
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
    };
    
    // 显示拨打界面
    showCallingUI();
    
    // 调用API让角色决定是否接听
    await requestCharacterAnswer();
}

// 显示拨打界面
function showCallingUI() {
    const overlay = document.createElement('div');
    overlay.className = 'video-call-overlay';
    overlay.id = 'videoCallOverlay';
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
    
    // 角色头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
        charAvatar = currentChatCharacter.avatar;
    }
    
    const avatarHtml = charAvatar 
        ? `<img src="${charAvatar}" alt="角色头像">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    overlay.innerHTML = `
        <div class="video-call-container calling">
            <button class="video-call-minimize-btn" onclick="minimizeVideoCall()" title="最小化">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <div class="video-call-avatar-large">
                ${avatarHtml}
            </div>
            <div class="video-call-status">正在呼叫...</div>
            <div class="video-call-name">${escapeHtml(currentChatCharacter.name)}</div>
            <button class="video-call-btn cancel" onclick="cancelVideoCall()">
                <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="30" cy="30" r="28" />
                    <path d="M20 28 Q20 22 26 22 L34 22 Q40 22 40 28 L40 32 Q40 35 37 35 L35 35 Q33 35 33 33 L33 30 Q33 28 31 28 L29 28 Q27 28 27 30 L27 33 Q27 35 25 35 L23 35 Q20 35 20 32 Z" fill="white" transform="rotate(135 30 30)"/>
                </svg>
            </button>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
}

// 请求角色接听
let currentApiRequest = null; // 用于追踪当前的API请求

async function requestCharacterAnswer() {
    try {
        // 构建提示词
        const now = new Date();
        const timeStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        // 获取最近聊天记录
        const recentMessages = await getRecentChatMessages(currentChatCharacter.id, 5);
        let chatContext = '';
        if (recentMessages.length > 0) {
            chatContext = '最近的聊天：\n' + recentMessages.map(m => {
                const role = m.role === 'user' ? currentChatCharacter.userName || '用户' : '你';
                return `${role}：${m.content}`;
            }).join('\n');
        } else {
            chatContext = '你们还没有聊过天。';
        }
        
        const prompt = `【视频通话请求】
${currentChatCharacter.userName || '用户'}向你发起了视频通话。

【当前时间】
${timeStr}

【最近聊天情况】
${chatContext}

你需要决定是否接听这个视频通话。请根据你的性格、当前可能的状态、以及你们的关系来决定。

输出JSON格式（只输出JSON，不要其他内容）：
{
  "action": "accept",
  "reason": "接听原因或拒绝原因",
  "environment": "你当前所在的环境（如果接听）"
}

action只能是"accept"（接听）或"reject"（拒绝）。`;

        // 调用API
        const settings = await storageDB.getItem('apiSettings');
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
            throw new Error('请先在设置中配置API');
        }
        
        // 创建一个可以取消的Promise
        currentApiRequest = { cancelled: false };
        const apiRequest = currentApiRequest;
        
        const response = await callChatAPI(settings, [{ role: 'user', content: prompt }]);
        
        // 检查是否已被取消
        if (apiRequest.cancelled) {
            console.log('API请求已被取消');
            return;
        }
        
        // 解析响应
        let result;
        try {
            let jsonStr = response.trim();
            jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
            result = JSON.parse(jsonStr);
        } catch (e) {
            console.error('JSON解析失败:', response);
            result = { action: 'accept', reason: '', environment: '房间里' };
        }
        
        // 再次检查是否已被取消
        if (apiRequest.cancelled) {
            console.log('API请求已被取消');
            return;
        }
        
        // 处理结果
        if (result.action === 'reject') {
            handleCallRejected(result.reason || '对方拒绝了通话');
        } else {
            handleCallAccepted(result.environment || '');
        }
        
    } catch (error) {
        // 检查是否是因为取消导致的错误
        if (currentApiRequest && currentApiRequest.cancelled) {
            console.log('API请求已被取消，忽略错误');
            return;
        }
        
        console.error('请求接听失败:', error);
        
        // 只有在通话还存在时才显示错误
        if (currentVideoCall && currentVideoCall.status === 'calling') {
            showIosAlert('错误', '网络错误，请稍后重试');
            cancelVideoCall();
        }
    } finally {
        currentApiRequest = null;
    }
}

// 处理通话被拒绝
function handleCallRejected(reason) {
    if (!currentVideoCall) return;
    
    currentVideoCall.status = 'rejected';
    currentVideoCall.rejectReason = reason;
    currentVideoCall.endTime = Date.now();
    
    const overlay = document.getElementById('videoCallOverlay');
    if (overlay) {
        const container = overlay.querySelector('.video-call-container');
        container.classList.remove('calling');
        container.classList.add('rejected');
        
        // 获取头像
        const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
        let charAvatar = videoCallAvatars.characterAvatar;
        if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
            charAvatar = currentChatCharacter.avatar;
        }
        
        const avatarHtml = charAvatar 
            ? `<img src="${charAvatar}" alt="角色头像">` 
            : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
        
        container.innerHTML = `
            <div class="video-call-avatar-large">
                ${avatarHtml}
            </div>
            <div class="video-call-status">对方已拒绝</div>
            <div class="video-call-reason">${escapeHtml(reason)}</div>
        `;
        
        setTimeout(() => {
            closeVideoCall();
            // 等待界面关闭后再添加消息
            setTimeout(() => {
                addVideoCallMessageToChat('已拒绝');
            }, 400);
        }, 2000);
    }
}

// 处理通话被接听
function handleCallAccepted(environment) {
    if (!currentVideoCall) return;
    
    currentVideoCall.status = 'connected';
    currentVideoCall.connectedTime = Date.now();
    currentVideoCall.environment = environment;
    
    // 显示通话界面
    showConnectedUI();
    
    // 开始计时
    startCallTimer();
}

// 显示已接通界面
function showConnectedUI() {
    const overlay = document.getElementById('videoCallOverlay');
    if (!overlay) return;
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
    
    // 用户头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let userAvatar = videoCallAvatars.userAvatar;
    if (!userAvatar) {
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            userAvatar = userAvatarImg.src;
        }
    }
    
    // 角色头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
        charAvatar = currentChatCharacter.avatar;
    }
    
    const charAvatarHtml = charAvatar 
        ? `<img src="${charAvatar}" alt="角色头像">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    const userAvatarHtml = userAvatar 
        ? `<img src="${userAvatar}" alt="用户头像">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    overlay.innerHTML = `
        <div class="video-call-container connected">
            <button class="video-call-minimize-btn" onclick="minimizeVideoCall()" title="最小化">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <!-- 顶部时长显示 -->
            <div class="video-call-timer" id="videoCallTimer">00:00</div>
            
            <!-- 角色视频画面 -->
            <div class="video-call-main-view" id="mainView">
                <div class="video-call-character-avatar breathing">
                    ${charAvatarHtml}
                </div>
            </div>
            
            <!-- 用户小窗 -->
            <div class="video-call-user-view" id="userView" onclick="toggleVideoView()">
                ${userAvatarHtml}
            </div>
            
            <!-- 消息显示区域 -->
            <div class="video-call-messages" id="videoCallMessages">
                <!-- 动态添加消息 -->
            </div>
            
            <!-- 底部操作按钮 -->
            <div class="video-call-actions">
                <button class="video-call-btn speak" onclick="openVideoCallInput()">
                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="30" r="28" />
                        <rect x="26" y="18" width="8" height="14" rx="4" fill="white"/>
                        <path d="M20 28 Q20 36 30 38 Q40 36 40 28" stroke="white" stroke-width="2.5" fill="none" stroke-linecap="round"/>
                        <line x1="30" y1="38" x2="30" y2="44" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                        <line x1="24" y1="44" x2="36" y2="44" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
                    </svg>
                </button>
                <button class="video-call-btn hangup" onclick="hangupVideoCall()">
                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="30" r="28" />
                        <path d="M20 28 Q20 22 26 22 L34 22 Q40 22 40 28 L40 32 Q40 35 37 35 L35 35 Q33 35 33 33 L33 30 Q33 28 31 28 L29 28 Q27 28 27 30 L27 33 Q27 35 25 35 L23 35 Q20 35 20 32 Z" fill="white" transform="rotate(135 30 30)"/>
                    </svg>
                </button>
                <button class="video-call-btn api" onclick="callCharacterResponse()">
                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="30" r="28" />
                        <path d="M18 30 L28 20 L28 26 L42 26 L42 34 L28 34 L28 40 Z" fill="white"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
}

// 切换大小窗显示
window.toggleVideoView = function toggleVideoView() {
    const mainView = document.getElementById('mainView');
    const userView = document.getElementById('userView');
    
    if (!mainView || !userView) return;
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
    
    // 用户头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let userAvatar = videoCallAvatars.userAvatar;
    if (!userAvatar) {
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            userAvatar = userAvatarImg.src;
        }
    }
    
    // 角色头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
        charAvatar = currentChatCharacter.avatar;
    }
    
    const charAvatarHtml = charAvatar 
        ? `<img src="${charAvatar}" alt="角色头像">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    const userAvatarHtml = userAvatar 
        ? `<img src="${userAvatar}" alt="用户头像">` 
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    isVideoViewSwapped = !isVideoViewSwapped;
    
    if (isVideoViewSwapped) {
        // 用户变大窗，角色变小窗
        mainView.innerHTML = `
            <div class="video-call-character-avatar breathing">
                ${userAvatarHtml}
            </div>
        `;
        userView.innerHTML = charAvatarHtml;
    } else {
        // 角色变大窗，用户变小窗
        mainView.innerHTML = `
            <div class="video-call-character-avatar breathing">
                ${charAvatarHtml}
            </div>
        `;
        userView.innerHTML = userAvatarHtml;
    }
}

// 开始通话计时
let callTimerInterval = null;
function startCallTimer() {
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
    }
    
    callTimerInterval = setInterval(() => {
        if (!currentVideoCall || currentVideoCall.status !== 'connected') {
            clearInterval(callTimerInterval);
            return;
        }
        
        const elapsed = Math.floor((Date.now() - currentVideoCall.connectedTime) / 1000);
        currentVideoCall.duration = elapsed;
        
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        const timeStr = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const timerEl = document.getElementById('videoCallTimer');
        if (timerEl) {
            timerEl.textContent = timeStr;
        }
    }, 1000);
}

// 打开用户输入框
window.openVideoCallInput = function openVideoCallInput() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10005';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.maxWidth = '340px';
    
    dialog.innerHTML = `
        <div class="ios-dialog-title">发言</div>
        <div class="ios-dialog-message" style="padding: 16px;">
            <textarea id="videoCallUserInput" placeholder="输入你要说的话或用括号描述环境&#10;例如：&#10;你好啊&#10;（我坐在沙发上）&#10;在干嘛呢" style="width:100%;min-height:120px;padding:8px;border:1px solid #e0e0e0;border-radius:8px;font-size:14px;resize:vertical;"></textarea>
            <div style="margin-top:8px;font-size:12px;color:#999;">
                用括号（）描述环境或动作，不用括号就是说的话
            </div>
        </div>
        <div class="ios-dialog-buttons">
            <button class="ios-dialog-button" onclick="closeVideoCallInputDialog()">取消</button>
            <button class="ios-dialog-button primary" onclick="sendVideoCallUserMessage()">发送</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    overlay.id = 'videoCallInputOverlay';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('show');
        document.getElementById('videoCallUserInput').focus();
    }, 10);
}

// 关闭输入对话框
window.closeVideoCallInputDialog = function closeVideoCallInputDialog() {
    const overlay = document.getElementById('videoCallInputOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
}

// 发送用户消息
window.sendVideoCallUserMessage = function sendVideoCallUserMessage() {
    const input = document.getElementById('videoCallUserInput');
    const text = input.value.trim();
    
    if (!text) {
        showIosAlert('提示', '请输入内容');
        return;
    }
    
    // 按行分割消息
    const lines = text.split('\n').filter(line => line.trim());
    
    lines.forEach(line => {
        line = line.trim();
        
        // 检查是否是括号描述（旁白）
        const narrationMatch = line.match(/^[（(](.+)[）)]$/);
        
        if (narrationMatch) {
            // 这是旁白描述
            const message = {
                type: 'narration',
                role: 'user',
                content: narrationMatch[1],
                timestamp: Date.now()
            };
            currentVideoCall.messages.push(message);
            addMessageToVideoCallUI(message);
        } else {
            // 这是普通语言
            const message = {
                type: 'speech',
                role: 'user',
                content: line,
                timestamp: Date.now()
            };
            currentVideoCall.messages.push(message);
            addMessageToVideoCallUI(message);
        }
    });
    
    closeVideoCallInputDialog();
}

// 添加消息到视频通话UI
function addMessageToVideoCallUI(message) {
    const container = document.getElementById('videoCallMessages');
    if (!container) return;
    
    const msgEl = document.createElement('div');
    
    if (message.type === 'narration') {
        // 旁白消息 - 浅灰色背景，斜体
        msgEl.className = `video-call-message narration ${message.role}`;
        msgEl.textContent = message.content;
    } else if (message.type === 'speech') {
        // 语言消息 - 根据角色显示不同颜色
        msgEl.className = `video-call-message speech ${message.role}`;
        msgEl.textContent = message.content;
    }
    
    container.appendChild(msgEl);
    
    // 滚动到底部
    container.scrollTop = container.scrollHeight;
}

// 调用角色回复
window.callCharacterResponse = async function callCharacterResponse() {
    if (!currentVideoCall || currentVideoCall.status !== 'connected') {
        return;
    }
    
    // 检查是否有用户消息
    const userMessages = currentVideoCall.messages.filter(m => m.role === 'user');
    if (userMessages.length === 0) {
        showIosAlert('提示', '请先发言');
        return;
    }
    
    // 显示加载状态
    const apiBtn = document.querySelector('.video-call-btn.api');
    if (apiBtn) {
        apiBtn.disabled = true;
    }
    
    // 显示"正在回复中"提示
    const loadingEl = document.createElement('div');
    loadingEl.className = 'video-call-loading';
    loadingEl.id = 'videoCallLoading';
    loadingEl.innerHTML = `
        <div class="video-call-loading-spinner"></div>
        <span>对方正在回复中...</span>
    `;
    document.querySelector('.video-call-container').appendChild(loadingEl);
    
    try {
        // 构建提示词
        const prompt = await buildVideoCallPrompt();
        
        // 调用API
        const settings = await storageDB.getItem('apiSettings');
        const response = await callChatAPI(settings, [{ role: 'user', content: prompt }]);
        
        // 解析响应
        let messages;
        try {
            let jsonStr = response.trim();
            jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
            messages = JSON.parse(jsonStr);
            
            if (!Array.isArray(messages)) {
                throw new Error('响应不是数组');
            }
        } catch (e) {
            console.error('JSON解析失败:', response);
            showIosAlert('错误', 'AI返回格式错误');
            return;
        }
        
        // 添加消息
        messages.forEach(msg => {
            if (msg.type === 'narration' || msg.type === 'speech') {
                const message = {
                    type: msg.type,
                    role: 'character',
                    content: msg.content,
                    timestamp: Date.now()
                };
                currentVideoCall.messages.push(message);
                addMessageToVideoCallUI(message);
            }
        });
        
    } catch (error) {
        console.error('调用API失败:', error);
        showIosAlert('错误', '网络错误，请稍后重试');
    } finally {
        // 移除加载提示
        const loadingEl = document.getElementById('videoCallLoading');
        if (loadingEl) {
            loadingEl.remove();
        }
        
        // 恢复按钮状态
        if (apiBtn) {
            apiBtn.disabled = false;
        }
    }
}

// 构建视频通话提示词
async function buildVideoCallPrompt() {
    const char = currentChatCharacter;
    
    // 获取世界书
    let worldBookContent = '';
    if (char.worldBooks && char.worldBooks.length > 0) {
        const worldBooks = await storageDB.getItem('worldBooks') || [];
        const activeBooks = worldBooks.filter(wb => char.worldBooks.includes(wb.id));
        if (activeBooks.length > 0) {
            worldBookContent = '\n【世界书】\n' + activeBooks.map(wb => wb.content).join('\n\n');
        }
    }
    
    // 获取双方人设
    const charPersona = char.persona || '（未设置）';
    const userPersona = char.userPersona || '（未设置）';
    
    // 获取长期记忆
    const longTermMemories = await getLongTermMemories(char.id);
    let ltmContent = '';
    if (longTermMemories.length > 0) {
        ltmContent = '\n【长期记忆】\n' + longTermMemories.map(m => m.content).join('\n');
    }
    
    // 获取视频通话记忆
    const videoCallMemory = await buildVideoCallMemoryContent(char.id);
    
    // 获取最近聊天记录
    const recentChats = await getRecentChatMessages(char.id, 20);
    let chatHistory = '';
    if (recentChats.length > 0) {
        chatHistory = '\n【最近聊天记录】\n' + recentChats.map(m => {
            const role = m.role === 'user' ? (char.userName || '用户') : '你';
            return `${role}：${m.content}`;
        }).join('\n');
    }
    
    // 当前视频通话对话
    let currentConversation = '';
    if (currentVideoCall.messages.length > 0) {
        currentConversation = '\n【当前视频通话对话】\n' + currentVideoCall.messages.map(m => {
            if (m.type === 'narration') {
                return `[旁白] ${m.content}`;
            } else {
                const speaker = m.role === 'user' ? (char.userName || '用户') : '你';
                return `${speaker}："${m.content}"`;
            }
        }).join('\n');
    }
    
    // 用户刚才说的话
    const recentUserMessages = currentVideoCall.messages
        .filter(m => m.role === 'user' && m.type === 'speech')
        .slice(-5);
    let userSaid = '';
    if (recentUserMessages.length > 0) {
        userSaid = '\n【用户刚才说】\n' + recentUserMessages.map(m => `"${m.content}"`).join('\n');
    }
    
    const prompt = `【视频通话中】
你正在和${char.userName || '用户'}视频通话。
${worldBookContent}

【你的人设】
${charPersona}

【用户人设】
${userPersona}
${ltmContent}
${videoCallMemory}
${chatHistory}
${currentConversation}
${userSaid}

---

请描述你的反应，输出JSON数组格式（只输出JSON，不要其他内容）：
[
  {
    "type": "narration",
    "content": "描述你的表情、动作、环境变化"
  },
  {
    "type": "speech",
    "content": "你说的话"
  }
]

规则：
- type只能是"narration"（旁白）或"speech"（语言）
- narration描述表情、动作、环境变化，要生动细腻
- speech是你说的话，要符合你的性格
- 可以多条交替出现
- 不要在JSON外添加任何内容`;

    return prompt;
}

// 构建视频通话记忆内容（用于单聊提示词）
async function buildVideoCallMemoryContent(characterId) {
    const records = await getVideoCallRecords(characterId);
    
    if (records.length === 0) {
        return '\n【视频通话记忆】\n你们还没有视频通话过。';
    }
    
    let content = `\n【视频通话记忆】\n你们一共视频通话过 ${records.length} 次。\n\n最近的通话记录：\n`;
    
    // 只取最近5次
    const recentRecords = records.slice(-5);
    
    recentRecords.forEach((record, index) => {
        const date = `${record.year}年${record.month}月${record.day}日`;
        const time = new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        if (record.status === 'rejected') {
            content += `\n${index + 1}. ${date} ${time}\n`;
            content += `   状态：你拒绝了通话\n`;
            content += `   原因：${record.rejectReason}\n`;
        } else if (record.status === 'cancelled') {
            content += `\n${index + 1}. ${date} ${time}\n`;
            content += `   状态：对方取消了通话\n`;
        } else if (record.status === 'completed') {
            const minutes = Math.floor(record.duration / 60);
            const seconds = record.duration % 60;
            const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
            
            content += `\n${index + 1}. ${date} ${time}\n`;
            content += `   时长：${durationText}\n`;
            
            // 显示对话片段
            const speeches = record.messages.filter(m => m.type === 'speech').slice(0, 5);
            if (speeches.length > 0) {
                content += `   对话片段：\n`;
                speeches.forEach(msg => {
                    const speaker = msg.role === 'user' ? '{userName}' : '你';
                    content += `   ${speaker}："${msg.content}"\n`;
                });
                
                if (record.messages.filter(m => m.type === 'speech').length > 5) {
                    content += `   （还有更多对话...）\n`;
                }
            }
        }
    });
    
    return content;
}

// 取消视频通话
window.cancelVideoCall = function cancelVideoCall() {
    // 取消正在进行的API请求
    if (currentApiRequest) {
        currentApiRequest.cancelled = true;
        currentApiRequest = null;
    }
    
    if (currentVideoCall) {
        currentVideoCall.status = 'cancelled';
        currentVideoCall.endTime = Date.now();
    }
    
    // 先关闭界面
    closeVideoCall();
    
    // 等待界面关闭后再添加消息
    setTimeout(() => {
        addVideoCallMessageToChat('已取消');
    }, 400);
}

// 挂断视频通话
window.hangupVideoCall = async function hangupVideoCall() {
    if (!currentVideoCall) return;
    
    const confirmed = await iosConfirm('确定要挂断吗？', '挂断');
    if (!confirmed) return;
    
    // 停止计时
    if (callTimerInterval) {
        clearInterval(callTimerInterval);
        callTimerInterval = null;
    }
    
    currentVideoCall.status = 'completed';
    currentVideoCall.endTime = Date.now();
    
    // 保存记录
    await addVideoCallRecord(currentVideoCall);
    
    // 计算时长文本
    const minutes = Math.floor(currentVideoCall.duration / 60);
    const seconds = currentVideoCall.duration % 60;
    let statusText;
    if (minutes > 0) {
        statusText = `${minutes}分${seconds}秒`;
    } else {
        statusText = `${seconds}秒`;
    }
    
    // 先判断是否是来电（closeVideoCall会清空currentVideoCall）
    const isIncoming = currentVideoCall && currentVideoCall.direction === 'incoming';
    
    // 先关闭视频通话界面
    closeVideoCall();
    
    // 等待界面关闭后再添加消息（确保chatMessages元素可见）
    setTimeout(() => {
        if (isIncoming && typeof addIncomingCallMessageToChat === 'function') {
            addIncomingCallMessageToChat(statusText);
        } else {
            addVideoCallMessageToChat(statusText);
        }
    }, 400);
    
    // 询问是否添加到长期记忆
    setTimeout(async () => {
        const addToLTM = await iosConfirm('是否将本次通话添加到长期记忆？', '提示');
        if (addToLTM) {
            await addVideoCallToLongTermMemory();
        }
    }, 800);
}

// 关闭视频通话界面
function closeVideoCall() {
    const overlay = document.getElementById('videoCallOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    }
    
    // 移除悬浮球
    const floatingBall = document.getElementById('videoCallFloatingBall');
    if (floatingBall) {
        floatingBall.remove();
    }
    
    isVideoCallMinimized = false;
    isVideoViewSwapped = false;
    currentVideoCall = null;
}

// 在聊天记录中添加视频通话消息
async function addVideoCallMessageToChat(statusText) {
    console.log('=== 添加视频通话消息到聊天 ===');
    console.log('currentChatCharacter:', currentChatCharacter);
    console.log('statusText:', statusText);
    
    if (!currentChatCharacter) {
        console.log('没有当前角色，跳过');
        return;
    }
    
    // 创建用户消息对象（视频通话是用户发起的）
    const videoCallMessage = {
        id: Date.now().toString(),
        characterId: currentChatCharacter.id,
        content: `视频通话 ${statusText}`,
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'video-call'
    };
    
    console.log('创建的消息对象:', videoCallMessage);
    
    // 保存到数据库（使用与普通消息相同的saveMessageToDB）
    try {
        await saveMessageToDB(videoCallMessage);
        console.log('消息已保存到数据库');
        
        // 更新聊天列表中的最后一条消息
        if (typeof updateChatListLastMessage === 'function') {
            await updateChatListLastMessage(currentChatCharacter.id, `视频通话 ${statusText}`, new Date().toISOString());
        }
    } catch (e) {
        console.error('保存视频通话记录失败:', e);
    }
    
    // 检查是否在聊天详情页面
    const chatDetailPage = document.getElementById('chatDetailPage');
    console.log('chatDetailPage元素:', chatDetailPage);
    console.log('chatDetailPage显示状态:', chatDetailPage ? window.getComputedStyle(chatDetailPage).display : 'null');
    
    // 如果不在聊天详情页，先打开它
    if (!chatDetailPage || window.getComputedStyle(chatDetailPage).display === 'none') {
        console.log('聊天详情页未打开，尝试打开...');
        if (typeof openChatDetail === 'function') {
            await openChatDetail(currentChatCharacter);
            // 等待界面渲染
            await new Promise(resolve => setTimeout(resolve, 300));
        }
    }
    
    // 手动添加到界面（使用特殊样式）
    const chatMessages = document.getElementById('chatMessagesContainer');
    console.log('chatMessages元素:', chatMessages);
    console.log('chatMessages显示状态:', chatMessages ? window.getComputedStyle(chatMessages).display : 'null');
    
    if (chatMessages) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message chat-message-user';
        messageEl.dataset.msgId = videoCallMessage.id;
        messageEl.dataset.msgType = 'user';
        
        // 获取用户头像
        const userAvatarImg = document.getElementById('userAvatarImage');
        let userAvatar = '';
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            userAvatar = userAvatarImg.src;
        }
        
        // 格式化时间
        const time = new Date(videoCallMessage.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="chat-message-avatar">
                ${userAvatar ? `<img src="${userAvatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
            </div>
            <div class="chat-message-content">
                <div class="chat-message-bubble video-call-simple">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <span>视频通话 ${statusText}</span>
                </div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        console.log('消息已添加到界面');
    } else {
        console.log('找不到chatMessages元素，消息已保存到数据库，下次打开聊天时会显示');
    }
}

// 将视频通话添加到长期记忆
async function addVideoCallToLongTermMemory() {
    if (!currentVideoCall || !currentChatCharacter) return;
    
    const minutes = Math.floor(currentVideoCall.duration / 60);
    const seconds = currentVideoCall.duration % 60;
    const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
    
    // 提取对话摘要
    const speeches = currentVideoCall.messages.filter(m => m.type === 'speech').slice(0, 3);
    let summary = '';
    if (speeches.length > 0) {
        summary = '，聊了' + speeches.map(m => {
            const speaker = m.role === 'user' ? (currentChatCharacter.userName || '用户') : currentChatCharacter.name;
            return `${speaker}说"${m.content}"`;
        }).join('、');
    }
    
    const memoryContent = `今天和${currentChatCharacter.userName || '用户'}视频通话了${durationText}${summary}`;
    
    await addLongTermMemory(currentChatCharacter.id, memoryContent, 'manual');
    showToast('已添加到长期记忆');
}

// ========== 视频通话记忆库管理界面 ==========

// 打开视频通话记忆库
window.openVideoCallMemoryLibrary = async function openVideoCallMemoryLibrary() {
    console.log('=== 打开视频通话记忆库 ===');
    console.log('currentChatCharacter:', currentChatCharacter);
    
    if (!currentChatCharacter) {
        console.log('没有打开聊天，显示提示');
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    console.log('创建记忆库界面...');
    
    const overlay = document.createElement('div');
    overlay.className = 'settings-page';
    overlay.style.zIndex = '10010';
    overlay.id = 'videoCallMemoryOverlay';
    
    overlay.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <div class="back-btn" onclick="closeVideoCallMemoryLibrary()">←</div>
                <div class="settings-title">视频通话记忆库</div>
                <div style="display:flex;gap:8px;">
                    <div class="settings-action" onclick="batchDeleteVideoCallRecords()" style="font-size:14px;color:#ff3b30;cursor:pointer;">删除</div>
                    <div class="settings-action" onclick="archiveVideoCallRecords()" style="font-size:14px;color:#007aff;cursor:pointer;">归档</div>
                </div>
            </div>
            
            <div class="settings-card">
                <div id="videoCallMemoryList" style="max-height:60vh;overflow-y:auto;">
                    <!-- 动态生成列表 -->
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    console.log('界面已添加到DOM');
    console.log('overlay元素:', overlay);
    console.log('overlay的样式:', {
        display: window.getComputedStyle(overlay).display,
        zIndex: window.getComputedStyle(overlay).zIndex,
        opacity: window.getComputedStyle(overlay).opacity,
        visibility: window.getComputedStyle(overlay).visibility,
        position: window.getComputedStyle(overlay).position
    });
    
    setTimeout(() => {
        overlay.classList.add('active');
        console.log('显示动画已触发（添加active类）');
        console.log('添加active后的样式:', {
            display: window.getComputedStyle(overlay).display,
            opacity: window.getComputedStyle(overlay).opacity,
            visibility: window.getComputedStyle(overlay).visibility
        });
    }, 10);
    
    console.log('开始渲染记录列表...');
    await renderVideoCallMemoryList();
    console.log('记录列表渲染完成');
};
console.log('openVideoCallMemoryLibrary 已定义:', typeof window.openVideoCallMemoryLibrary);

// 渲染视频通话记忆列表
async function renderVideoCallMemoryList() {
    const container = document.getElementById('videoCallMemoryList');
    if (!container) return;
    
    const records = await getVideoCallRecords(currentChatCharacter.id);
    
    if (records.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;">
                <div style="font-size:15px;color:#666;margin-bottom:8px;">暂无视频通话记录</div>
                <div style="font-size:13px;color:#999;">发起视频通话后，记录会显示在这里</div>
            </div>
        `;
        return;
    }
    
    // 按时间倒序
    const sorted = [...records].reverse();
    
    container.innerHTML = sorted.map(record => {
        const date = `${record.year}年${record.month}月${record.day}日`;
        const time = new Date(record.startTime).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        let statusHtml = '';
        let actionsHtml = '';
        
        if (record.status === 'rejected') {
            statusHtml = `
                <div style="color:#ff3b30;font-size:13px;margin-bottom:4px;">状态：已拒绝</div>
                <div style="color:#999;font-size:12px;">原因：${escapeHtml(record.rejectReason)}</div>
            `;
            actionsHtml = `
                <button class="delete-record-btn" data-record-id="${record.id}" style="padding:6px 12px;background:#ff3b30;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">删除</button>
            `;
        } else if (record.status === 'cancelled') {
            statusHtml = `
                <div style="color:#999;font-size:13px;">状态：未接通</div>
            `;
            actionsHtml = `
                <button class="delete-record-btn" data-record-id="${record.id}" style="padding:6px 12px;background:#ff3b30;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">删除</button>
            `;
        } else if (record.status === 'completed') {
            const minutes = Math.floor(record.duration / 60);
            const seconds = record.duration % 60;
            const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
            
            statusHtml = `
                <div style="color:#34c759;font-size:13px;margin-bottom:4px;">通话时长：${durationText}</div>
                <div style="color:#999;font-size:12px;">消息数：${record.messages.length}条</div>
            `;
            actionsHtml = `
                <button class="view-detail-btn" data-record-id="${record.id}" style="padding:6px 12px;background:#007aff;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;margin-right:6px;">查看详情</button>
                <button class="delete-record-btn" data-record-id="${record.id}" style="padding:6px 12px;background:#ff3b30;color:#fff;border:none;border-radius:6px;font-size:12px;cursor:pointer;">删除</button>
            `;
        }
        
        return `
            <div class="video-call-record-item" data-record-id="${record.id}" style="background:#f8f8f8;border-radius:12px;padding:12px;margin-bottom:10px;">
                <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
                    <div>
                        <div style="font-size:14px;font-weight:600;color:#333;margin-bottom:4px;">${date} ${time}</div>
                        ${statusHtml}
                    </div>
                    <input type="checkbox" class="video-call-record-checkbox" data-record-id="${record.id}" style="width:18px;height:18px;cursor:pointer;">
                </div>
                <div style="display:flex;gap:6px;margin-top:8px;">
                    ${actionsHtml}
                </div>
            </div>
        `;
    }).join('');
    
    // 使用事件委托绑定点击事件
    container.querySelectorAll('.view-detail-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = btn.getAttribute('data-record-id');
            viewVideoCallDetail(recordId);
        });
    });
    
    container.querySelectorAll('.delete-record-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = btn.getAttribute('data-record-id');
            deleteVideoCallRecordFromUI(recordId);
        });
    });
};

// 查看视频通话详情
window.viewVideoCallDetail = async function viewVideoCallDetail(recordId) {
    const records = await getVideoCallRecords();
    const record = records.find(r => r.id === recordId);
    
    if (!record) {
        showIosAlert('错误', '记录不存在');
        return;
    }
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(currentChatCharacter.id);
    
    // 用户头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let userAvatar = videoCallAvatars.userAvatar;
    if (!userAvatar) {
        const userAvatarImg = document.getElementById('userAvatarImage');
        if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
            userAvatar = userAvatarImg.src;
        }
    }
    
    // 角色头像：优先使用视频通话头像，否则使用聊天头像，都没有则为null
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && currentChatCharacter && currentChatCharacter.avatar) {
        charAvatar = currentChatCharacter.avatar;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'settings-page';
    overlay.style.zIndex = '10011';
    
    const date = `${record.year}年${record.month}月${record.day}日`;
    const time = new Date(record.startTime).toLocaleTimeString('zh-CN');
    const minutes = Math.floor(record.duration / 60);
    const seconds = record.duration % 60;
    const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
    
    overlay.innerHTML = `
        <div class="settings-content">
            <div class="settings-header">
                <div class="back-btn" onclick="this.closest('.settings-page').remove()">←</div>
                <div class="settings-title">通话详情</div>
                <div style="width:44px;"></div>
            </div>
            
            <div class="settings-card">
                <div style="background:#f8f8f8;border-radius:12px;padding:12px;margin-bottom:16px;">
                    <div style="font-size:13px;color:#999;margin-bottom:4px;">时间</div>
                    <div style="font-size:14px;color:#333;font-weight:500;">${date} ${time}</div>
                </div>
                
                <div style="background:#f8f8f8;border-radius:12px;padding:12px;margin-bottom:16px;">
                    <div style="font-size:13px;color:#999;margin-bottom:4px;">时长</div>
                    <div style="font-size:14px;color:#333;font-weight:500;">${durationText}</div>
                </div>
                
                <div class="section-title">
                    <span class="section-title-text">通话内容</span>
                </div>
                
                <div style="max-height:50vh;overflow-y:auto;background:#f8f8f8;border-radius:12px;padding:12px;">
                    ${record.messages.map(msg => {
                        const timeStr = new Date(msg.timestamp).toLocaleTimeString('zh-CN');
                        if (msg.type === 'narration') {
                            return `<div style="margin-bottom:8px;padding:8px;background:#e0e0e0;border-radius:8px;color:#666;font-size:13px;font-style:italic;">[${timeStr}] ${escapeHtml(msg.content)}</div>`;
                        } else {
                            // 使用头像布局
                            const isUser = msg.role === 'user';
                            const avatar = isUser ? userAvatar : charAvatar;
                            const avatarHtml = avatar 
                                ? `<img src="${avatar}" style="width:32px;height:32px;border-radius:50%;object-fit:cover;flex-shrink:0;">` 
                                : `<div style="width:32px;height:32px;border-radius:50%;background:#ccc;flex-shrink:0;"></div>`;
                            
                            return `
                                <div style="margin-bottom:10px;display:flex;gap:8px;align-items:start;${isUser ? 'flex-direction:row-reverse;' : ''}">
                                    ${avatarHtml}
                                    <div style="flex:1;min-width:0;display:flex;flex-direction:column;${isUser ? 'align-items:flex-end;' : 'align-items:flex-start;'}">
                                        <div style="font-size:11px;color:#999;margin-bottom:2px;">${timeStr}</div>
                                        <div style="padding:8px 12px;background:#fff;border-radius:12px;color:#333;font-size:13px;word-break:break-word;max-width:70%;display:inline-block;">${escapeHtml(msg.content)}</div>
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('active'), 10);
}

// 删除视频通话记录（UI层）
window.deleteVideoCallRecordFromUI = async function deleteVideoCallRecordFromUI(recordId) {
    const confirmed = await iosConfirm('确定要删除这条记录吗？', '确认删除');
    if (!confirmed) return;
    
    // 调用底层删除函数
    await deleteVideoCallRecord(recordId);
    showToast('已删除');
    await renderVideoCallMemoryList();
}

// 关闭视频通话记忆库
window.closeVideoCallMemoryLibrary = function closeVideoCallMemoryLibrary() {
    const overlay = document.getElementById('videoCallMemoryOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
    }
}

// 归档视频通话记录
async function archiveVideoCallRecords() {
    // 获取所有选中的记录
    const checkboxes = document.querySelectorAll('.video-call-record-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showIosAlert('提示', '请先选择要归档的记录');
        return;
    }
    
    const confirmed = await iosConfirm(`确定要将选中的 ${checkboxes.length} 条记录归档为摘要吗？`, '确认归档');
    if (!confirmed) return;
    
    // 收集选中的记录
    const records = await getVideoCallRecords();
    const selectedRecords = [];
    checkboxes.forEach(cb => {
        const recordId = cb.dataset.recordId;
        const record = records.find(r => r.id === recordId);
        if (record) {
            selectedRecords.push(record);
        }
    });
    
    if (selectedRecords.length === 0) return;
    
    // 调用AI生成摘要
    showToast('正在生成摘要...');
    
    try {
        const summary = await generateVideoCallSummary(selectedRecords);
        
        // 创建归档记录
        const archiveRecord = {
            id: 'archive_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            characterId: currentChatCharacter.id,
            type: 'archive',
            recordIds: selectedRecords.map(r => r.id),
            summary: summary,
            year: new Date().getFullYear(),
            month: new Date().getMonth() + 1,
            day: new Date().getDate(),
            createdAt: Date.now()
        };
        
        // 删除原记录，添加归档记录
        const allRecords = await getVideoCallRecords();
        const filtered = allRecords.filter(r => !selectedRecords.find(sr => sr.id === r.id));
        filtered.push(archiveRecord);
        await saveVideoCallRecords(filtered);
        
        showToast('归档成功');
        await renderVideoCallMemoryList();
        
    } catch (error) {
        console.error('归档失败:', error);
        showIosAlert('错误', '归档失败，请稍后重试');
    }
}
// 批量删除视频通话记录
async function batchDeleteVideoCallRecords() {
    // 获取所有选中的记录
    const checkboxes = document.querySelectorAll('.video-call-record-checkbox:checked');

    if (checkboxes.length === 0) {
        showIosAlert('提示', '请先选择要删除的记录');
        return;
    }

    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 条记录吗？`, '确认删除');
    if (!confirmed) return;

    // 收集选中的记录ID
    const selectedIds = [];
    checkboxes.forEach(cb => {
        selectedIds.push(cb.dataset.recordId);
    });

    // 删除记录
    const allRecords = await getVideoCallRecords();
    const filtered = allRecords.filter(r => !selectedIds.includes(r.id));
    await saveVideoCallRecords(filtered);

    showToast(`已删除 ${checkboxes.length} 条记录`);
    await renderVideoCallMemoryList();
}

window.batchDeleteVideoCallRecords = batchDeleteVideoCallRecords;

// 生成视频通话摘要
async function generateVideoCallSummary(records) {
    const settings = await storageDB.getItem('apiSettings');
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('请先在设置中配置API');
    }
    
    // 构建提示词
    let content = '以下是多次视频通话的记录，请生成一个简洁的摘要（200字以内）：\n\n';
    
    records.forEach((record, index) => {
        const date = `${record.year}年${record.month}月${record.day}日`;
        const minutes = Math.floor(record.duration / 60);
        const seconds = record.duration % 60;
        const durationText = minutes > 0 ? `${minutes}分${seconds}秒` : `${seconds}秒`;
        
        content += `第${index + 1}次通话（${date}，时长${durationText}）：\n`;
        
        const speeches = record.messages.filter(m => m.type === 'speech');
        speeches.forEach(msg => {
            const speaker = msg.role === 'user' ? '用户' : '角色';
            content += `${speaker}："${msg.content}"\n`;
        });
        
        content += '\n';
    });
    
    content += '请用第一人称（"我"）的视角，像写日记一样总结这几次视频通话。只输出摘要内容，不要其他内容。';
    
    const response = await callChatAPI(settings, [{ role: 'user', content: content }]);
    return response.trim();
}

// ========== 辅助函数 ==========

// 获取最近的聊天消息
async function getRecentChatMessages(characterId, limit = 20) {
    try {
        const allChats = await getAllChatsFromDB();
        const characterChats = allChats.filter(c => c.characterId === characterId);
        return characterChats.slice(-limit);
    } catch (e) {
        console.error('获取聊天记录失败:', e);
        return [];
    }
}

// 调用聊天API
async function callChatAPI(settings, messages) {
    let response;
    
    if (settings.provider === 'hakimi') {
        // Gemini API
        const parts = messages.map(m => ({ text: m.content }));
        
        response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: parts }],
                generationConfig: {
                    temperature: 1.0,
                    maxOutputTokens: 2048
                }
            })
        });
        
        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            return data.candidates[0].content.parts[0].text;
        }
    } else if (settings.provider === 'claude') {
        // Claude API
        response = await fetch(settings.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model,
                max_tokens: 2048,
                messages: messages
            })
        });
        
        const data = await response.json();
        if (data.content && data.content[0]) {
            return data.content[0].text;
        }
    } else {
        // OpenAI API
        response = await fetch(`${settings.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: messages,
                temperature: 1.0,
                max_tokens: 2048
            })
        });
        
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
            return data.choices[0].message.content;
        }
    }
    
    throw new Error('API返回了空响应');
}

// ========== 视频通话头像设置 ==========

// 上传用户视频头像
function uploadVideoCallUserAvatar(type) {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const avatars = getVideoCallAvatars(currentChatCharacter.id);
                avatars.userAvatar = event.target.result;
                saveVideoCallAvatars(currentChatCharacter.id, avatars);
                
                // 只更新用户头像预览
                const userImg = document.getElementById('videoCallUserAvatarPreview');
                const userPlaceholder = document.getElementById('videoCallUserAvatarPlaceholder');
                if (userImg && userPlaceholder) {
                    userImg.src = event.target.result;
                    userImg.style.display = 'block';
                    userPlaceholder.style.display = 'none';
                }
                
                showToast('用户视频头像已设置');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const avatars = getVideoCallAvatars(currentChatCharacter.id);
            avatars.userAvatar = url;
            saveVideoCallAvatars(currentChatCharacter.id, avatars);
            
            // 只更新用户头像预览
            const userImg = document.getElementById('videoCallUserAvatarPreview');
            const userPlaceholder = document.getElementById('videoCallUserAvatarPlaceholder');
            if (userImg && userPlaceholder) {
                userImg.src = url;
                userImg.style.display = 'block';
                userPlaceholder.style.display = 'none';
            }
            
            showToast('用户视频头像已设置');
        });
    }
}

// 上传角色视频头像
function uploadVideoCallCharAvatar(type) {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const avatars = getVideoCallAvatars(currentChatCharacter.id);
                avatars.characterAvatar = event.target.result;
                saveVideoCallAvatars(currentChatCharacter.id, avatars);
                
                // 只更新角色头像预览
                const charImg = document.getElementById('videoCallCharAvatarPreview');
                const charPlaceholder = document.getElementById('videoCallCharAvatarPlaceholder');
                if (charImg && charPlaceholder) {
                    charImg.src = event.target.result;
                    charImg.style.display = 'block';
                    charPlaceholder.style.display = 'none';
                }
                
                showToast('角色视频头像已设置');
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const avatars = getVideoCallAvatars(currentChatCharacter.id);
            avatars.characterAvatar = url;
            saveVideoCallAvatars(currentChatCharacter.id, avatars);
            
            // 只更新角色头像预览
            const charImg = document.getElementById('videoCallCharAvatarPreview');
            const charPlaceholder = document.getElementById('videoCallCharAvatarPlaceholder');
            if (charImg && charPlaceholder) {
                charImg.src = url;
                charImg.style.display = 'block';
                charPlaceholder.style.display = 'none';
            }
            
            showToast('角色视频头像已设置');
        });
    }
}

// 通过URL设置用户视频头像
function setVideoCallUserAvatarByUrl(url) {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    if (!url || !url.trim()) return;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showIosAlert('提示', '请输入有效的图片URL');
        return;
    }
    const avatars = getVideoCallAvatars(currentChatCharacter.id);
    avatars.userAvatar = url;
    saveVideoCallAvatars(currentChatCharacter.id, avatars);
    const userImg = document.getElementById('videoCallUserAvatarPreview');
    const userPlaceholder = document.getElementById('videoCallUserAvatarPlaceholder');
    if (userImg && userPlaceholder) {
        userImg.src = url;
        userImg.style.display = 'block';
        userPlaceholder.style.display = 'none';
    }
    showToast('用户视频头像已设置');
}

// 通过URL设置角色视频头像
function setVideoCallCharAvatarByUrl(url) {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    if (!url || !url.trim()) return;
    url = url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        showIosAlert('提示', '请输入有效的图片URL');
        return;
    }
    const avatars = getVideoCallAvatars(currentChatCharacter.id);
    avatars.characterAvatar = url;
    saveVideoCallAvatars(currentChatCharacter.id, avatars);
    const charImg = document.getElementById('videoCallCharAvatarPreview');
    const charPlaceholder = document.getElementById('videoCallCharAvatarPlaceholder');
    if (charImg && charPlaceholder) {
        charImg.src = url;
        charImg.style.display = 'block';
        charPlaceholder.style.display = 'none';
    }
    showToast('角色视频头像已设置');
}

// 重置用户视频头像
async function resetVideoCallUserAvatar() {
    if (!currentChatCharacter) return;
    
    const confirmed = await iosConfirm('确定要重置用户视频头像吗？', '确认');
    if (!confirmed) return;
    
    const avatars = getVideoCallAvatars(currentChatCharacter.id);
    avatars.userAvatar = null;
    saveVideoCallAvatars(currentChatCharacter.id, avatars);
    
    updateVideoCallAvatarPreview();
    showToast('已重置');
}

// 重置角色视频头像
async function resetVideoCallCharAvatar() {
    if (!currentChatCharacter) return;
    
    const confirmed = await iosConfirm('确定要重置角色视频头像吗？', '确认');
    if (!confirmed) return;
    
    const avatars = getVideoCallAvatars(currentChatCharacter.id);
    avatars.characterAvatar = null;
    saveVideoCallAvatars(currentChatCharacter.id, avatars);
    
    updateVideoCallAvatarPreview();
    showToast('已重置');
}

// 更新视频头像预览
function updateVideoCallAvatarPreview() {
    if (!currentChatCharacter) return;
    
    const avatars = getVideoCallAvatars(currentChatCharacter.id);
    
    // 用户头像
    const userImg = document.getElementById('videoCallUserAvatarPreview');
    const userPlaceholder = document.getElementById('videoCallUserAvatarPlaceholder');
    if (userImg && userPlaceholder) {
        if (avatars.userAvatar) {
            userImg.src = avatars.userAvatar;
            userImg.style.display = 'block';
            userPlaceholder.style.display = 'none';
        } else {
            userImg.style.display = 'none';
            userPlaceholder.style.display = 'flex';
        }
    }
    
    // 角色头像
    const charImg = document.getElementById('videoCallCharAvatarPreview');
    const charPlaceholder = document.getElementById('videoCallCharAvatarPlaceholder');
    if (charImg && charPlaceholder) {
        if (avatars.characterAvatar) {
            charImg.src = avatars.characterAvatar;
            charImg.style.display = 'block';
            charPlaceholder.style.display = 'none';
        } else {
            charImg.style.display = 'none';
            charPlaceholder.style.display = 'flex';
        }
    }
}

// Hook到openChatSettings，在打开设置时更新预览
const _origOpenChatSettingsForVideoCall = typeof openChatSettings === 'function' ? openChatSettings : null;
if (_origOpenChatSettingsForVideoCall) {
    const _origFn = openChatSettings;
    openChatSettings = function() {
        _origFn.apply(this, arguments);
        setTimeout(() => {
            updateVideoCallAvatarPreview();
        }, 100);
    };
}


// ========== 全局函数暴露 ==========
// 将需要在HTML中通过onclick调用的函数暴露到全局作用域
window.startVideoCall = startVideoCall;
window.minimizeVideoCall = minimizeVideoCall;
window.restoreVideoCall = restoreVideoCall;
window.cancelVideoCall = cancelVideoCall;
window.hangupVideoCall = hangupVideoCall;
window.toggleVideoView = toggleVideoView;
window.openVideoCallInput = openVideoCallInput;
window.closeVideoCallInputDialog = closeVideoCallInputDialog;
window.sendVideoCallUserMessage = sendVideoCallUserMessage;
window.callCharacterResponse = callCharacterResponse;
window.openVideoCallMemoryLibrary = openVideoCallMemoryLibrary;
window.closeVideoCallMemoryLibrary = closeVideoCallMemoryLibrary;
window.viewVideoCallDetail = viewVideoCallDetail;
window.deleteVideoCallRecordFromUI = deleteVideoCallRecordFromUI;
window.archiveVideoCallRecords = archiveVideoCallRecords;
window.uploadVideoCallUserAvatar = uploadVideoCallUserAvatar;
window.setVideoCallUserAvatarByUrl = setVideoCallUserAvatarByUrl;
window.uploadVideoCallCharAvatar = uploadVideoCallCharAvatar;
window.setVideoCallCharAvatarByUrl = setVideoCallCharAvatarByUrl;
window.resetVideoCallUserAvatar = resetVideoCallUserAvatar;
window.resetVideoCallCharAvatar = resetVideoCallCharAvatar;
window.appendVideoCallMessageToChat = appendVideoCallMessageToChat;

// 专门用于渲染视频通话消息的函数（用于刷新后加载）
function appendVideoCallMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message chat-message-user';
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = 'user';
    
    // 获取用户头像
    const userAvatarImg = document.getElementById('userAvatarImage');
    let userAvatar = '';
    if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
        userAvatar = userAvatarImg.src;
    }
    
    // 格式化时间
    const time = new Date(messageObj.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    
    // 提取状态文本（从 "视频通话 已取消" 中提取 "已取消"）
    const statusText = messageObj.content.replace('视频通话 ', '');
    
    messageEl.innerHTML = `
        ${userAvatar ? `<img src="${userAvatar}" class="chat-message-avatar">` : ''}
        <div class="chat-message-content">
            <div class="chat-message-bubble video-call-simple">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                </svg>
                <span>视频通话 ${statusText}</span>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
    container.scrollTop = container.scrollHeight;
}
