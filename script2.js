// ========== script2.js - 扩展功能模块 ==========
// 依赖 script.js 中的全局变量和函数

// ========== 聊天发送图片功能 ==========

// 打开图片选择器
function openImagePicker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = false;
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 压缩图片后发送
            const imageData = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.7,
                maxSizeKB: 300
            });

            await sendImageMessage(imageData);
        } catch (err) {
            console.error('图片处理失败:', err);
            showIosAlert('提示', '图片处理失败，请重试');
        }
    };
    input.click();
}

// 发送图片消息
async function sendImageMessage(imageData) {
    if (!currentChatCharacter) return;

    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[图片]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'image',
        imageData: imageData
    };

    // 渲染到聊天界面
    appendImageMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[图片]', messageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();

    // 收起扩展面板
    const panel = document.getElementById('chatExtendPanel');
    if (panel) panel.classList.remove('active');
}

// 渲染图片消息到聊天界面
function appendImageMessageToChat(messageObj) {
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
            <div class="chat-image-bubble">
                <img src="${messageObj.imageData}" alt="图片" class="chat-image-msg" onclick="previewChatImage(this.src)">
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}

// 图片预览（全屏查看）
function previewChatImage(src) {
    const overlay = document.createElement('div');
    overlay.className = 'chat-image-preview-overlay';
    overlay.onclick = () => overlay.remove();
    overlay.innerHTML = `<img src="${src}" class="chat-image-preview-img">`;
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
}


// ========== 图文消息功能（手动描述图片） ==========

// 打开图文输入弹窗
function openTextImageModal() {
    // 收起扩展面板
    const panel = document.getElementById('chatExtendPanel');
    if (panel) panel.classList.remove('active');

    const overlay = document.createElement('div');
    overlay.id = 'textImageOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:300px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

    // 标题
    const header = document.createElement('div');
    header.style.cssText = 'padding:22px 24px 12px;text-align:center;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:600;color:#333;';
    title.textContent = '发送图文';
    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:12px;color:#aaa;margin-top:6px;';
    subtitle.textContent = '描述一张图片的内容，对方会当作图片来看';
    header.appendChild(title);
    header.appendChild(subtitle);

    // 输入区域
    const body = document.createElement('div');
    body.style.cssText = 'padding:8px 24px 16px;';
    const textarea = document.createElement('textarea');
    textarea.id = 'textImageInput';
    textarea.placeholder = '描述图片内容，例如：一张在海边拍的夕阳照片';
    textarea.maxLength = 200;
    textarea.style.cssText = 'width:100%;height:80px;padding:12px;border:1.5px solid #e0e0e0;border-radius:12px;font-size:14px;color:#333;outline:none;resize:none;box-sizing:border-box;font-family:inherit;transition:border-color 0.2s;';
    textarea.onfocus = () => { textarea.style.borderColor = '#999'; };
    textarea.onblur = () => { textarea.style.borderColor = '#e0e0e0'; };
    body.appendChild(textarea);

    // 按钮区域
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:0 24px 20px;display:flex;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;transition:all 0.15s;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeTextImageModal(overlay, card);

    const sendBtn = document.createElement('button');
    sendBtn.style.cssText = 'flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;transition:all 0.15s;';
    sendBtn.textContent = '发送';
    sendBtn.onclick = () => sendTextImageMessage(overlay, card);

    footer.appendChild(cancelBtn);
    footer.appendChild(sendBtn);

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
        if (e.target === overlay) closeTextImageModal(overlay, card);
    });

    // 自动聚焦
    setTimeout(() => textarea.focus(), 400);
}

// 关闭图文弹窗
function closeTextImageModal(overlay, card) {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.opacity = '0';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
}

// 发送图文消息
async function sendTextImageMessage(overlay, card) {
    const textarea = document.getElementById('textImageInput');
    const desc = textarea ? textarea.value.trim() : '';
    if (!desc) {
        showIosAlert('提示', '请输入图片描述');
        return;
    }
    if (!currentChatCharacter) return;

    closeTextImageModal(overlay, card);

    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[图片]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'textImage',
        textImageDesc: desc
    };

    // 渲染到聊天界面
    appendTextImageMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[图片]', messageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();
}

// 渲染图文消息到聊天界面
function appendTextImageMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');

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
    const desc = messageObj.textImageDesc || '';

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-text-image-bubble" onclick="toggleTextImageDesc(this)">
                <div class="text-image-desc">${escapeHtml(desc)}</div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}

// 点击图文气泡切换描述文字显示
function toggleTextImageDesc(bubble) {
    const descEl = bubble.querySelector('.text-image-desc');
    if (!descEl) return;
    descEl.classList.toggle('show');
}


// ========== 转账功能 ==========

let _selectedTransferAmount = null;

// 打开转账弹窗
function openTransferModal() {
    _selectedTransferAmount = null;
    const overlay = document.getElementById('transferOverlay');
    overlay.style.display = 'flex';
    document.getElementById('transferCustomAmount').value = '';
    document.getElementById('transferRemark').value = '';
    // 清除选中状态
    document.querySelectorAll('.transfer-amount-btn').forEach(btn => btn.classList.remove('active'));
    // 收起扩展面板
    const panel = document.getElementById('chatExtendPanel');
    if (panel) panel.classList.remove('active');
}

// 关闭转账弹窗
function closeTransferModal() {
    const overlay = document.getElementById('transferOverlay');
    overlay.style.display = 'none';
    _selectedTransferAmount = null;
}

// 选择预设金额
function selectTransferAmount(btn, amount) {
    document.querySelectorAll('.transfer-amount-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    _selectedTransferAmount = amount;
    document.getElementById('transferCustomAmount').value = '';
}

// 自定义金额输入时清除预设选中
function clearTransferAmountSelection() {
    document.querySelectorAll('.transfer-amount-btn').forEach(b => b.classList.remove('active'));
    _selectedTransferAmount = null;
}

// 发送转账消息
async function sendTransferMessage() {
    // 获取金额
    let amount = _selectedTransferAmount;
    if (!amount) {
        const customVal = document.getElementById('transferCustomAmount').value.trim();
        if (customVal) {
            amount = parseFloat(customVal);
        }
    }
    if (!amount || amount <= 0 || isNaN(amount)) {
        showIosAlert('提示', '请选择或输入转账金额');
        return;
    }

    // 格式化金额（保留两位小数）
    amount = Math.round(amount * 100) / 100;

    const remark = document.getElementById('transferRemark').value.trim();

    if (!currentChatCharacter) return;

    closeTransferModal();

    const transferId = 'tf_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);

    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[转账]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'transfer',
        transferAmount: amount,
        transferRemark: remark,
        transferId: transferId,
        transferStatus: 'pending'
    };

    // 渲染到聊天界面
    appendTransferMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[转账]', messageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();
}

// 渲染转账消息到聊天界面
function appendTransferMessageToChat(messageObj) {
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
    const amount = messageObj.transferAmount || 0;
    const remark = messageObj.transferRemark || '';
    const status = messageObj.transferStatus || 'pending';
    const transferId = messageObj.transferId || '';

    // 状态文字和样式
    let statusText = '';
    let doneClass = '';
    if (status === 'accepted') {
        statusText = '已收款';
        doneClass = ' transfer-done';
    } else if (status === 'rejected') {
        statusText = '已退还';
        doneClass = ' transfer-done';
    }

    // 角色发来的pending转账，点击气泡弹出操作弹窗
    const isCharPending = messageObj.type === 'char' && status === 'pending' && transferId;

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-transfer-bubble${doneClass}" ${transferId ? `data-transfer-id="${transferId}"` : ''}${isCharPending ? ` onclick="openTransferActionModal('${transferId}')" style="cursor:pointer;"` : ''}>
                <div class="chat-transfer-header">
                    <div class="chat-transfer-icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="1" x2="12" y2="23"/>
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                    </div>
                    <div class="chat-transfer-info">
                        <div class="chat-transfer-amount">¥${amount.toFixed(2)}</div>
                        ${remark ? `<div class="chat-transfer-remark">${escapeHtml(remark)}</div>` : ''}
                    </div>
                </div>
                <div class="chat-transfer-footer">
                    <span class="chat-transfer-label">微信转账</span>
                    ${statusText ? `<span class="chat-transfer-status">${statusText}</span>` : ''}
                </div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}

// 更新转账消息状态（接收/拒绝后更新界面上所有相关气泡）
function updateTransferBubbleStatus(transferId, status) {
    const bubbles = document.querySelectorAll(`.chat-transfer-bubble[data-transfer-id="${transferId}"]`);
    const statusText = status === 'accepted' ? '已收款' : '已退还';
    bubbles.forEach(bubble => {
        bubble.classList.add('transfer-done');
        const statusEl = bubble.querySelector('.chat-transfer-status');
        if (statusEl) {
            statusEl.textContent = statusText;
        } else {
            const footer = bubble.querySelector('.chat-transfer-footer');
            if (footer) {
                const span = document.createElement('span');
                span.className = 'chat-transfer-status';
                span.textContent = statusText;
                footer.appendChild(span);
            }
        }
    });
}

// 更新数据库中转账消息的状态
async function updateTransferStatusInDB(transferId, status) {
    try {
        const allChats = await getAllChatsFromDB();
        const transferMsgs = allChats.filter(m => m.transferId === transferId);
        for (const msg of transferMsgs) {
            msg.transferStatus = status;
            // 用 put 更新已有记录，而不是 add 新增记录
            await new Promise((resolve, reject) => {
                const transaction = db.transaction(['chats'], 'readwrite');
                const store = transaction.objectStore('chats');
                const request = store.put(msg);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        }
    } catch (e) {
        console.error('更新转账状态失败:', e);
    }
}

// 打开转账操作弹窗（用户点击角色发来的pending转账）
function openTransferActionModal(transferId) {
    const bubble = document.querySelector(`.chat-transfer-bubble[data-transfer-id="${transferId}"]`);
    if (!bubble || bubble.classList.contains('transfer-done')) return;

    const amountEl = bubble.querySelector('.chat-transfer-amount');
    const remarkEl = bubble.querySelector('.chat-transfer-remark');
    const amount = amountEl ? amountEl.textContent : '¥0.00';
    const remark = remarkEl ? remarkEl.textContent : '';

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:300px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

    // 顶部区域
    const topSection = document.createElement('div');
    topSection.style.cssText = 'padding:28px 24px 20px;text-align:center;background:#fff;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size:13px;color:#999;letter-spacing:1px;margin-bottom:16px;font-weight:400;';
    title.textContent = '微信转账';

    const amountDisplay = document.createElement('div');
    amountDisplay.style.cssText = 'font-size:36px;font-weight:700;color:#333;letter-spacing:-1px;margin-bottom:8px;';
    amountDisplay.textContent = amount;

    topSection.appendChild(title);
    topSection.appendChild(amountDisplay);

    if (remark) {
        const remarkDisplay = document.createElement('div');
        remarkDisplay.style.cssText = 'font-size:13px;color:#aaa;margin-top:4px;';
        remarkDisplay.textContent = remark;
        topSection.appendChild(remarkDisplay);
    }

    // 分割线
    const divider = document.createElement('div');
    divider.style.cssText = 'height:1px;background:#f0f0f0;margin:0 24px;';

    // 按钮区域
    const btnSection = document.createElement('div');
    btnSection.style.cssText = 'padding:16px 24px 20px;display:flex;flex-direction:column;gap:10px;';

    const acceptBtn = document.createElement('button');
    acceptBtn.style.cssText = 'width:100%;padding:14px 0;border:none;border-radius:12px;font-size:16px;font-weight:600;color:#fff;background:#f09b37;cursor:pointer;transition:all 0.15s;letter-spacing:0.5px;';
    acceptBtn.textContent = '收款';
    acceptBtn.onmousedown = () => { acceptBtn.style.transform = 'scale(0.97)'; acceptBtn.style.opacity = '0.9'; };
    acceptBtn.onmouseup = () => { acceptBtn.style.transform = ''; acceptBtn.style.opacity = ''; };
    acceptBtn.ontouchstart = () => { acceptBtn.style.transform = 'scale(0.97)'; acceptBtn.style.opacity = '0.9'; };
    acceptBtn.ontouchend = () => { acceptBtn.style.transform = ''; acceptBtn.style.opacity = ''; };
    acceptBtn.onclick = () => closeAndHandle('accepted');

    const rejectBtn = document.createElement('button');
    rejectBtn.style.cssText = 'width:100%;padding:14px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;transition:all 0.15s;';
    rejectBtn.textContent = '退还';
    rejectBtn.onmousedown = () => { rejectBtn.style.transform = 'scale(0.97)'; rejectBtn.style.background = '#f8f8f8'; };
    rejectBtn.onmouseup = () => { rejectBtn.style.transform = ''; rejectBtn.style.background = '#fff'; };
    rejectBtn.ontouchstart = () => { rejectBtn.style.transform = 'scale(0.97)'; rejectBtn.style.background = '#f8f8f8'; };
    rejectBtn.ontouchend = () => { rejectBtn.style.transform = ''; rejectBtn.style.background = '#fff'; };
    rejectBtn.onclick = () => closeAndHandle('rejected');

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'width:100%;padding:12px 0;border:none;border-radius:12px;font-size:14px;font-weight:400;color:#bbb;background:transparent;cursor:pointer;transition:all 0.15s;margin-top:2px;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    btnSection.appendChild(acceptBtn);
    btnSection.appendChild(rejectBtn);
    btnSection.appendChild(cancelBtn);

    card.appendChild(topSection);
    card.appendChild(divider);
    card.appendChild(btnSection);
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
        if (e.target === overlay) closeDialog();
    });

    function closeDialog() {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(20px)';
        card.style.opacity = '0';
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }

    async function closeAndHandle(action) {
        closeDialog();

        // 1. 更新角色原始转账消息状态（数据库 + 界面变浅色）
        await updateTransferStatusInDB(transferId, action);
        updateTransferBubbleStatus(transferId, action);
        if (bubble) {
            bubble.removeAttribute('onclick');
            bubble.style.cursor = '';
        }

        // 2. 从数据库找到原始转账消息，获取数值型金额和备注
        let tfAmount = 0;
        let tfRemark = '';
        try {
            const allChats = await getAllChatsFromDB();
            const originalMsg = allChats.find(m => m.transferId === transferId && m.type === 'char' && m.messageType === 'transfer');
            if (originalMsg) {
                tfAmount = originalMsg.transferAmount || 0;
                tfRemark = originalMsg.transferRemark || '';
            }
        } catch (e) {
            // fallback: 从DOM解析金额
            const amountStr = amount.replace(/[^0-9.]/g, '');
            tfAmount = parseFloat(amountStr) || 0;
            tfRemark = remark || '';
        }

        // 3. 创建用户的回应消息（转账卡片样式，跟角色处理用户转账一样）
        const responseMsg = {
            id: Date.now().toString() + Math.random(),
            characterId: currentChatCharacter.id,
            content: action === 'accepted' ? '[已收款]' : '[已退还]',
            type: 'user',
            timestamp: new Date().toISOString(),
            sender: 'user',
            messageType: 'transfer',
            transferAmount: tfAmount,
            transferRemark: tfRemark,
            transferId: transferId,
            transferStatus: action
        };

        // 4. 渲染用户回应卡片到聊天界面
        appendTransferMessageToChat(responseMsg);

        // 5. 保存到数据库
        await saveMessageToDB(responseMsg);

        // 6. 更新聊天列表最后一条消息
        const lastMsgText = action === 'accepted' ? '[已收款]' : '[已退还]';
        await updateChatListLastMessage(currentChatCharacter.id, lastMsgText, responseMsg.timestamp);

        // 7. 滚动到底部
        scrollChatToBottom();

        showToast(action === 'accepted' ? '已收款' : '已退还');
    }
}


// ========== 长期记忆功能 ==========

// 长期记忆提示词格式预设（{charName}和{userName}会在实际使用时替换为真名）
const LTM_FORMAT_TEMPLATES = {
    timeline: {
        label: '时间线式',
        preview: '示例：\n- [2026-02-08 下午] 我和小明聊了工作的事，他心情不太好，我安慰了他\n- [2026-02-09 上午] 我们聊了喜欢的电影，发现都喜欢科幻片',
        summaryPrompt: `你是{charName}，请以你的第一人称视角，将以下你和{userName}的对话总结为一条简洁的长期记忆。要求：
1. 用"我"指代{charName}（你自己），用"{userName}"指代对方
2. 用一行文字概括这段对话的核心内容
3. 格式为：[时间] 总结内容
4. 时间使用对话发生的大致时间段（如：2026-02-08 下午）
5. 总结要包含关键事件、话题、双方的态度
6. 不超过100字
7. 只输出总结内容，不要输出其他任何内容

对话内容：
{messages}`
    },
    timeline_emotion: {
        label: '时间线+情感标记',
        preview: '示例：\n- [2026-02-08 下午][低落->好转] 小明工作不顺，我耐心安慰了他，他心情好转了\n- [2026-02-09 上午][开心] 我们聊了喜欢的电影，气氛很轻松',
        summaryPrompt: `你是{charName}，请以你的第一人称视角，将以下你和{userName}的对话总结为一条简洁的长期记忆。要求：
1. 用"我"指代{charName}（你自己），用"{userName}"指代对方
2. 用一行文字概括这段对话的核心内容
3. 格式为：[时间][情感变化] 总结内容
4. 时间使用对话发生的大致时间段（如：2026-02-08 下午）
5. 情感标记反映对话中的情绪变化（如：开心、低落->好转、平静、兴奋）
6. 总结要包含关键事件、话题、双方的态度和情感
7. 不超过120字
8. 只输出总结内容，不要输出其他任何内容

对话内容：
{messages}`
    },
    category: {
        label: '分类式',
        preview: '示例：\n- [关于他] 小明喜欢科幻片、正在学画画\n- [我们的关系] 互相分享了兴趣爱好\n- [重要事件] 2026-02-08 小明心情低落，我安慰了他',
        summaryPrompt: `你是{charName}，请以你的第一人称视角，将以下你和{userName}的对话总结为一条简洁的长期记忆。要求：
1. 用"我"指代{charName}（你自己），用"{userName}"指代对方
2. 按以下分类提取关键信息（没有的分类可以省略）：
   [关于{userName}] {userName}透露的个人信息、喜好、习惯
   [我们的关系] 我和{userName}之间关系的变化、互动质量
   [重要事件] 发生的关键事件
   [情感状态] 双方的情绪状态
3. 每个分类一行，简洁明了
4. 不超过150字
5. 只输出总结内容，不要输出其他任何内容

对话内容：
{messages}`
    }
};

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

// 获取角色的消息计数器（用于追踪自动总结触发）
async function getLtmMessageCounter(characterId) {
    try {
        const key = `ltm_counter_${characterId}`;
        const data = await storageDB.getItem(key);
        return data || 0;
    } catch (e) {
        return 0;
    }
}

// 设置角色的消息计数器
async function setLtmMessageCounter(characterId, count) {
    try {
        const key = `ltm_counter_${characterId}`;
        await storageDB.setItem(key, count);
    } catch (e) {
        console.error('保存消息计数器失败:', e);
    }
}

// 自动总结触发检查（每次AI回复完成后调用）
async function checkAndTriggerAutoSummary(characterId) {
    if (!characterId) return;

    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    const interval = character.longTermMemoryInterval || 0;
    if (interval < 2) return; // 间隔小于2或未设置，不触发

    // 增加计数器
    let counter = await getLtmMessageCounter(characterId);
    counter++;
    await setLtmMessageCounter(characterId, counter);

    // 检查是否达到间隔
    if (counter >= interval) {
        // 重置计数器
        await setLtmMessageCounter(characterId, 0);

        // 异步后台执行总结
        performAutoSummary(characterId, interval).catch(err => {
            console.error('自动总结失败:', err);
            showIosAlert('长期记忆', '自动总结失败: ' + (err.message || '未知错误'));
        });
    }
}

// 执行自动总结
async function performAutoSummary(characterId, interval) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) throw new Error('角色不存在');

    // 获取角色真名和用户真名
    const charName = character.name || '角色';
    let userName = '对方';
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.name) userName = userData.name;
        }
    } catch (e) {}

    // 获取最近的interval条消息用于总结
    const recentMessages = await getChatHistory(characterId, interval);
    if (recentMessages.length === 0) return;

    // 构建对话文本（用真名）
    const messagesText = recentMessages.map(msg => {
        const role = msg.type === 'user' ? userName : charName;
        let content = msg.content || '';
        if (msg.messageType === 'voice' && msg.voiceText) {
            content = `(语音) ${msg.voiceText}`;
        } else if (msg.messageType === 'sticker') {
            content = `(表情包: ${msg.stickerName || '未知'})`;
        } else if (msg.messageType === 'image') {
            content = '(发送了一张图片)';
        } else if (msg.messageType === 'textImage' && msg.textImageDesc) {
            content = `(图片: ${msg.textImageDesc})`;
        } else if (msg.messageType === 'transfer') {
            const amount = msg.transferAmount || 0;
            const status = msg.transferStatus || 'pending';
            content = `(转账 ¥${amount} ${status === 'accepted' ? '已收款' : status === 'rejected' ? '已退还' : '待处理'})`;
        }
        const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('zh-CN') : '';
        return `[${time}] ${role}: ${content}`;
    }).join('\n');

    // 获取总结提示词
    const format = character.longTermMemoryFormat || 'timeline';
    let summaryPrompt;

    if (format === 'custom' && character.longTermMemoryCustomPrompt) {
        summaryPrompt = character.longTermMemoryCustomPrompt
            .replace(/\{messages\}/g, messagesText)
            .replace(/\{charName\}/g, charName)
            .replace(/\{userName\}/g, userName);
    } else {
        const template = LTM_FORMAT_TEMPLATES[format] || LTM_FORMAT_TEMPLATES.timeline;
        summaryPrompt = template.summaryPrompt
            .replace(/\{messages\}/g, messagesText)
            .replace(/\{charName\}/g, charName)
            .replace(/\{userName\}/g, userName);
    }

    // 调用API进行总结
    const settings = await getSummaryApiSettings();
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('API未配置');
    }

    let response;
    const messages = [
        { role: 'system', content: '你是一个对话总结助手。请严格按照要求格式输出总结。' },
        { role: 'user', content: summaryPrompt }
    ];

    if (settings.provider === 'hakimi') {
        const geminiContents = [{ role: 'user', parts: [{ text: summaryPrompt }] }];
        response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: geminiContents,
                systemInstruction: { parts: [{ text: '你是一个对话总结助手。请严格按照要求格式输出总结。' }] },
                generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
            })
        });
    } else if (settings.provider === 'claude') {
        response = await fetch(`${settings.apiUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model,
                max_tokens: 500,
                temperature: 0.3,
                system: '你是一个对话总结助手。请严格按照要求格式输出总结。',
                messages: [{ role: 'user', content: summaryPrompt }]
            })
        });
    } else {
        response = await fetch(`${settings.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: messages,
                temperature: 0.3,
                max_tokens: 500
            })
        });
    }

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let summaryText = '';

    if (settings.provider === 'hakimi') {
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            summaryText = data.candidates[0].content.parts[0].text;
        }
    } else if (settings.provider === 'claude') {
        if (data.content && data.content[0]) {
            summaryText = data.content[0].text;
        }
    } else {
        if (data.choices && data.choices[0] && data.choices[0].message) {
            summaryText = data.choices[0].message.content;
        }
    }

    summaryText = summaryText.trim();
    if (!summaryText) throw new Error('总结结果为空');

    // 保存到长期记忆
    await addLongTermMemory(characterId, summaryText, 'auto');
    console.log('长期记忆自动总结完成:', summaryText.substring(0, 50) + '...');
}

// 构建长期记忆提示词（用于注入到系统提示词中）
async function buildLongTermMemoryPrompt(characterId) {
    const memories = await getLongTermMemories(characterId);
    if (memories.length === 0) return '';

    const character = chatCharacters.find(c => c.id === characterId);
    const charName = character ? (character.name || '你') : '你';
    let userName = '对方';
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.name) userName = userData.name;
        }
    } catch (e) {}

    const memoryTexts = memories.map(m => '- ' + m.content).join('\n');
    return `\n[长期记忆 - 你（${charName}）和${userName}之前的重要经历和回忆]\n以下是你过去和${userName}交流中的重要记忆，这些是真实发生过的事，你应该自然地记得这些：\n${memoryTexts}`;
}

// 长期记忆格式选择变化
function onLongTermMemoryFormatChange() {
    const select = document.getElementById('longTermMemoryFormatSelect');
    const preview = document.getElementById('longTermMemoryFormatPreview');
    const customGroup = document.getElementById('longTermMemoryCustomPromptGroup');
    const format = select.value;

    if (format === 'custom') {
        customGroup.style.display = 'block';
        preview.textContent = '使用自定义提示词进行总结';
    } else {
        customGroup.style.display = 'none';
        const template = LTM_FORMAT_TEMPLATES[format];
        preview.textContent = template ? template.preview : '';
    }
}

// 打开长期记忆管理库
async function openLongTermMemoryManager() {
    if (!currentChatCharacter) return;
    document.getElementById('longTermMemoryPage').style.display = 'block';
    await renderLongTermMemoryList();
}

// 关闭长期记忆管理库
function closeLongTermMemoryManager() {
    document.getElementById('longTermMemoryPage').style.display = 'none';
}

// 渲染长期记忆列表
async function renderLongTermMemoryList() {
    if (!currentChatCharacter) return;

    const container = document.getElementById('longTermMemoryList');
    const memories = await getLongTermMemories(currentChatCharacter.id);

    if (memories.length === 0) {
        container.innerHTML = '<div class="ltm-empty">暂无长期记忆</div>';
        return;
    }

    // 按时间倒序显示
    const sorted = [...memories].reverse();
    container.innerHTML = sorted.map(m => {
        const time = new Date(m.createdAt).toLocaleString('zh-CN');
        const sourceLabel = m.source === 'manual' ? '[手动]' : m.source === 'condense' ? '[精简]' : '[自动]';
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
}

// 手动添加长期记忆
async function addLongTermMemoryManual() {
    if (!currentChatCharacter) return;

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
            showIosAlert('提示', '请输入记忆内容');
            return;
        }
        await addLongTermMemory(currentChatCharacter.id, content, 'manual');
        closeDialog();
        await renderLongTermMemoryList();
        showToast('已添加');
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
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
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

// 取消编辑
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

// 保存编辑
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

    await editLongTermMemory(currentChatCharacter.id, memoryId, newContent);
    await renderLongTermMemoryList();
    showToast('已保存');
}

// 确认删除长期记忆
async function confirmDeleteLongTermMemory(memoryId) {
    if (!currentChatCharacter) return;

    const confirmed = await iosConfirm('确认删除这条长期记忆？');
    if (confirmed) {
        await deleteLongTermMemory(currentChatCharacter.id, memoryId);
        await renderLongTermMemoryList();
        showToast('已删除');
    }
}

// 初始化长期记忆格式预览（打开设置时调用）
function initLongTermMemorySettings() {
    if (!currentChatCharacter) return;

    const interval = currentChatCharacter.longTermMemoryInterval || 0;
    document.getElementById('longTermMemoryIntervalInput').value = interval || '';

    const format = currentChatCharacter.longTermMemoryFormat || 'timeline';
    document.getElementById('longTermMemoryFormatSelect').value = format;

    const customPrompt = currentChatCharacter.longTermMemoryCustomPrompt || '';
    document.getElementById('longTermMemoryCustomPromptInput').value = customPrompt;

    const condensePrompt = currentChatCharacter.ltmCondensePrompt || '';
    document.getElementById('ltmCondensePromptInput').value = condensePrompt;

    // 触发格式预览更新
    onLongTermMemoryFormatChange();
}

// 保存长期记忆设置（在saveChatSettings中调用）
function saveLongTermMemorySettings() {
    if (!currentChatCharacter) return;

    const intervalInput = document.getElementById('longTermMemoryIntervalInput').value.trim();
    const interval = intervalInput ? parseInt(intervalInput) : 0;
    currentChatCharacter.longTermMemoryInterval = interval >= 0 ? interval : 0;

    const format = document.getElementById('longTermMemoryFormatSelect').value;
    currentChatCharacter.longTermMemoryFormat = format;

    const customPrompt = document.getElementById('longTermMemoryCustomPromptInput').value.trim();
    currentChatCharacter.longTermMemoryCustomPrompt = customPrompt;

    const condensePrompt = document.getElementById('ltmCondensePromptInput').value.trim();
    currentChatCharacter.ltmCondensePrompt = condensePrompt;
}

// ========== 长期记忆精简功能 ==========
let ltmCondenseMode = false;
let ltmCondenseSelected = new Set();

const LTM_DEFAULT_CONDENSE_PROMPT = `请将以下多条记忆信息进行总结精简，合并重复内容，提取关键信息，生成一条简洁但完整的总结记忆。要求：保留所有重要信息，去除冗余，语言简洁明了。只输出总结后的内容，不要输出其他任何内容。

以下是需要精简的记忆内容：
{memories}`;

function startCondenseMode() {
    if (!currentChatCharacter) return;
    ltmCondenseMode = true;
    ltmCondenseSelected.clear();
    document.getElementById('ltmCondenseBtn').textContent = '取消';
    document.getElementById('ltmCondenseBtn').onclick = exitCondenseMode;
    renderCondenseMemoryList();
    showCondenseBar();
}

function exitCondenseMode() {
    ltmCondenseMode = false;
    ltmCondenseSelected.clear();
    document.getElementById('ltmCondenseBtn').textContent = '精简';
    document.getElementById('ltmCondenseBtn').onclick = startCondenseMode;
    removeCondenseBar();
    renderLongTermMemoryList();
}

function showCondenseBar() {
    removeCondenseBar();
    const bar = document.createElement('div');
    bar.className = 'ltm-condense-bar';
    bar.id = 'ltmCondenseBar';
    bar.innerHTML = `
        <div class="ltm-condense-bar-info">已选 <span id="ltmCondenseCount">0</span> 条</div>
        <div class="ltm-condense-bar-actions">
            <button class="ltm-condense-cancel-btn" onclick="exitCondenseMode()">取消</button>
            <button class="ltm-condense-confirm-btn" id="ltmCondenseConfirmBtn" onclick="performCondense()" disabled>开始精简</button>
        </div>
    `;
    document.getElementById('longTermMemoryPage').appendChild(bar);
}

function removeCondenseBar() {
    const bar = document.getElementById('ltmCondenseBar');
    if (bar) bar.remove();
}

function updateCondenseCount() {
    const countEl = document.getElementById('ltmCondenseCount');
    const btn = document.getElementById('ltmCondenseConfirmBtn');
    if (countEl) countEl.textContent = ltmCondenseSelected.size;
    if (btn) btn.disabled = ltmCondenseSelected.size < 2;
}

function toggleCondenseSelect(memoryId) {
    if (ltmCondenseSelected.has(memoryId)) {
        ltmCondenseSelected.delete(memoryId);
    } else {
        ltmCondenseSelected.add(memoryId);
    }
    // 更新UI
    const item = document.querySelector(`.ltm-item[data-ltm-id="${memoryId}"]`);
    if (item) {
        item.classList.toggle('condense-selected', ltmCondenseSelected.has(memoryId));
        const cb = item.querySelector('.ltm-condense-checkbox');
        if (cb) cb.classList.toggle('checked', ltmCondenseSelected.has(memoryId));
    }
    updateCondenseCount();
}

async function renderCondenseMemoryList() {
    if (!currentChatCharacter) return;
    const container = document.getElementById('longTermMemoryList');
    const memories = await getLongTermMemories(currentChatCharacter.id);

    if (memories.length < 2) {
        showToast('至少需要2条记忆才能精简');
        exitCondenseMode();
        return;
    }

    const sorted = [...memories].reverse();
    container.innerHTML = sorted.map(m => {
        const time = new Date(m.createdAt).toLocaleString('zh-CN');
        const sourceLabel = m.source === 'manual' ? '[手动]' : m.source === 'condense' ? '[精简]' : '[自动]';
        const editedLabel = m.editedAt ? ' (已编辑)' : '';
        const selected = ltmCondenseSelected.has(m.id);
        return `
            <div class="ltm-item condense-mode ${selected ? 'condense-selected' : ''}" data-ltm-id="${m.id}" onclick="toggleCondenseSelect('${m.id}')">
                <div class="ltm-condense-checkbox ${selected ? 'checked' : ''}"></div>
                <div class="ltm-item-time">${sourceLabel} ${time}${editedLabel}</div>
                <div class="ltm-item-content" style="padding-right: 36px;">${escapeHtml(m.content)}</div>
            </div>
        `;
    }).join('');
}

async function performCondense() {
    if (!currentChatCharacter || ltmCondenseSelected.size < 2) return;

    const memories = await getLongTermMemories(currentChatCharacter.id);
    const selectedMemories = memories.filter(m => ltmCondenseSelected.has(m.id));

    if (selectedMemories.length < 2) {
        showToast('请至少选择2条记忆');
        return;
    }

    // 构建记忆文本
    const memoriesText = selectedMemories.map((m, i) => {
        const time = new Date(m.createdAt).toLocaleString('zh-CN');
        const sourceLabel = m.source === 'manual' ? '[手动]' : m.source === 'condense' ? '[精简]' : '[自动]';
        return `记忆${i + 1} ${sourceLabel} ${time}:\n${m.content}`;
    }).join('\n\n');

    // 获取精简提示词
    const customCondensePrompt = currentChatCharacter.ltmCondensePrompt;
    let prompt;
    if (customCondensePrompt && customCondensePrompt.trim()) {
        prompt = customCondensePrompt.replace(/\{memories\}/g, memoriesText);
    } else {
        prompt = LTM_DEFAULT_CONDENSE_PROMPT.replace(/\{memories\}/g, memoriesText);
    }

    // 显示loading
    const btn = document.getElementById('ltmCondenseConfirmBtn');
    if (btn) {
        btn.disabled = true;
        btn.textContent = '精简中...';
    }

    try {
        const summaryText = await callCondenseAPI(prompt);
        if (!summaryText) throw new Error('精简结果为空');
        showCondenseResultDialog(summaryText, selectedMemories);
    } catch (e) {
        console.error('精简失败:', e);
        showIosAlert('精简失败', e.message || '调用API失败，请检查API设置');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = '开始精简';
        }
    }
}

async function callCondenseAPI(prompt) {
    const settings = await getSummaryApiSettings();
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('API未配置，请先在设置中配置API');
    }

    let response;
    const systemMsg = '你是一个记忆精简助手。请严格按照要求输出精简后的内容。';

    if (settings.provider === 'hakimi') {
        response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                systemInstruction: { parts: [{ text: systemMsg }] },
                generationConfig: { temperature: 0.3, maxOutputTokens: 800 }
            })
        });
    } else if (settings.provider === 'claude') {
        response = await fetch(`${settings.apiUrl}/messages`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': settings.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: settings.model,
                max_tokens: 800,
                temperature: 0.3,
                system: systemMsg,
                messages: [{ role: 'user', content: prompt }]
            })
        });
    } else {
        response = await fetch(`${settings.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${settings.apiKey}`
            },
            body: JSON.stringify({
                model: settings.model,
                messages: [
                    { role: 'system', content: systemMsg },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.3,
                max_tokens: 800
            })
        });
    }

    if (!response.ok) {
        throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    let result = '';

    if (settings.provider === 'hakimi') {
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
            result = data.candidates[0].content.parts[0].text;
        }
    } else if (settings.provider === 'claude') {
        if (data.content && data.content[0]) {
            result = data.content[0].text;
        }
    } else {
        if (data.choices && data.choices[0] && data.choices[0].message) {
            result = data.choices[0].message.content;
        }
    }

    return result.trim();
}

function showCondenseResultDialog(summaryText, selectedMemories) {
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10005;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:320px;max-height:80vh;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);display:flex;flex-direction:column;';

    const header = document.createElement('div');
    header.style.cssText = 'padding:22px 24px 12px;text-align:center;flex-shrink:0;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:600;color:#333;';
    title.textContent = '精简结果';
    header.appendChild(title);

    const body = document.createElement('div');
    body.style.cssText = 'padding:8px 24px 16px;overflow-y:auto;flex:1;';
    const contentDiv = document.createElement('div');
    contentDiv.style.cssText = 'font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;word-break:break-word;background:#f8f8f8;border-radius:12px;padding:14px;';
    contentDiv.textContent = summaryText;
    body.appendChild(contentDiv);

    const hint = document.createElement('div');
    hint.style.cssText = 'padding:8px 24px 4px;font-size:12px;color:#999;text-align:center;flex-shrink:0;';
    hint.textContent = '是否用精简结果覆盖已选中的原记忆？';

    const footer = document.createElement('div');
    footer.style.cssText = 'padding:8px 24px 20px;display:flex;gap:10px;flex-shrink:0;';

    const keepBtn = document.createElement('button');
    keepBtn.style.cssText = 'flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;';
    keepBtn.textContent = '不覆盖';
    keepBtn.onclick = async () => {
        await addLongTermMemory(currentChatCharacter.id, summaryText, 'condense');
        closeDialog();
        exitCondenseMode();
        showToast('已添加精简记忆');
    };

    const replaceBtn = document.createElement('button');
    replaceBtn.style.cssText = 'flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#007aff;cursor:pointer;';
    replaceBtn.textContent = '覆盖';
    replaceBtn.onclick = async () => {
        // 删除选中的原记忆
        for (const m of selectedMemories) {
            await deleteLongTermMemory(currentChatCharacter.id, m.id);
        }
        // 添加精简后的记忆
        await addLongTermMemory(currentChatCharacter.id, summaryText, 'condense');
        closeDialog();
        exitCondenseMode();
        showToast('已覆盖为精简记忆');
    };

    footer.appendChild(keepBtn);
    footer.appendChild(replaceBtn);
    card.appendChild(header);
    card.appendChild(body);
    card.appendChild(hint);
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

    function closeDialog() {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(20px)';
        card.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

// ========== 副API功能 ==========

function handleSecProviderChange() {
    const provider = document.getElementById('secApiProvider').value;
    const urlInput = document.getElementById('secApiUrl');

    if (provider === 'custom') {
        urlInput.disabled = false;
        urlInput.placeholder = '请输入自定义API地址';
        urlInput.value = '';
    } else {
        urlInput.value = apiUrls[provider] || '';
        urlInput.disabled = false;
        urlInput.placeholder = '输入API地址';
    }
}

async function fetchSecModels(silent = false) {
    let apiUrl = document.getElementById('secApiUrl').value.replace(/\/+$/, '');
    const apiKey = document.getElementById('secApiKey').value;
    const provider = document.getElementById('secApiProvider').value;
    const modelSelect = document.getElementById('secModelSelect');

    if (!apiUrl || !apiKey) {
        if (!silent) alert('请填写副API地址和密钥');
        return;
    }

    try {
        let models = [];

        if (provider === 'hakimi') {
            const response = await fetch(`${apiUrl}/models?key=${apiKey}`, {
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('获取模型失败');
            const data = await response.json();
            if (data.models && Array.isArray(data.models)) {
                models = data.models.map(m => ({ id: m.name.replace('models/', ''), displayName: m.displayName || m.name }));
            }
        } else if (provider === 'claude') {
            models = [
                { id: 'claude-opus-4-20250514', displayName: 'Claude Opus 4.5' },
                { id: 'claude-opus-4-20250115', displayName: 'Claude Opus 4' },
                { id: 'claude-sonnet-4-20250514', displayName: 'Claude Sonnet 4.5' },
                { id: 'claude-sonnet-4-20250115', displayName: 'Claude Sonnet 4' },
                { id: 'claude-3-7-sonnet-20250219', displayName: 'Claude 3.7 Sonnet' },
                { id: 'claude-3-5-sonnet-20241022', displayName: 'Claude 3.5 Sonnet (Oct)' },
                { id: 'claude-3-5-haiku-20241022', displayName: 'Claude 3.5 Haiku' },
                { id: 'claude-3-haiku-20240307', displayName: 'Claude 3 Haiku' }
            ];
        } else {
            const response = await fetch(`${apiUrl}/models`, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            });
            if (!response.ok) throw new Error('获取模型失败');
            const data = await response.json();
            if (data.data && Array.isArray(data.data)) {
                models = data.data.map(m => ({ id: m.id, displayName: m.id }));
            }
        }

        modelSelect.innerHTML = '<option value="">从列表选择模型</option>';
        if (models.length > 0) {
            models.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = m.displayName;
                modelSelect.appendChild(opt);
            });

            const secSettings = await storageDB.getItem('secApiSettings');
            const savedModel = secSettings && secSettings.model || '';
            if (savedModel) {
                const exists = Array.from(modelSelect.options).some(o => o.value === savedModel);
                if (exists) {
                    modelSelect.value = savedModel;
                    document.getElementById('secModelInput').value = savedModel;
                }
            }

            if (!silent) alert(`副API模型列表获取成功！共 ${models.length} 个模型`);
        } else {
            throw new Error('未找到可用模型');
        }
    } catch (error) {
        if (!silent) alert('获取副API模型失败: ' + error.message);
    }
}

async function saveSecSettings() {
    const settings = {
        provider: document.getElementById('secApiProvider').value,
        apiUrl: document.getElementById('secApiUrl').value,
        apiKey: document.getElementById('secApiKey').value,
        model: document.getElementById('secModelInput').value || document.getElementById('secModelSelect').value
    };

    try {
        await storageDB.setItem('secApiSettings', settings);
        alert('副API设置已保存！');
    } catch (error) {
        console.error('保存副API设置失败:', error);
        alert('保存失败，请重试！');
    }
}

async function clearSecSettings() {
    try {
        await storageDB.removeItem('secApiSettings');
        document.getElementById('secApiProvider').value = 'hakimi';
        document.getElementById('secApiUrl').value = '';
        document.getElementById('secApiKey').value = '';
        document.getElementById('secModelInput').value = '';
        document.getElementById('secModelSelect').innerHTML = '<option value="">从列表选择模型</option>';
        handleSecProviderChange();
        alert('副API设置已清除！');
    } catch (error) {
        console.error('清除副API设置失败:', error);
    }
}

async function loadSecSettings() {
    try {
        const settings = await storageDB.getItem('secApiSettings');
        if (settings) {
            document.getElementById('secApiProvider').value = settings.provider || 'hakimi';
            document.getElementById('secApiKey').value = settings.apiKey || '';
            document.getElementById('secModelInput').value = settings.model || '';
            handleSecProviderChange();
            if (settings.apiUrl) {
                document.getElementById('secApiUrl').value = settings.apiUrl;
            }
        }
    } catch (error) {
        console.error('加载副API设置失败:', error);
    }
}

// 获取总结/精简用的API设置（优先副API，fallback主API）
async function getSummaryApiSettings() {
    const secSettings = await storageDB.getItem('secApiSettings');
    if (secSettings && secSettings.apiUrl && secSettings.apiKey && secSettings.model) {
        return secSettings;
    }
    const mainSettings = await storageDB.getItem('apiSettings');
    return mainSettings;
}


// ========== 长按消息菜单功能 ==========

let _msgMenuTimer = null;
let _msgMenuActive = false;
let _msgMenuStartPos = null;

// 初始化长按消息菜单（在聊天容器上使用事件委托）
function initMsgContextMenu() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container || container._msgMenuInited) return;
    container._msgMenuInited = true;

    // 触摸事件（移动端）
    container.addEventListener('touchstart', onMsgTouchStart, { passive: false });
    container.addEventListener('touchmove', onMsgTouchMove, { passive: true });
    container.addEventListener('touchend', onMsgTouchEnd);
    container.addEventListener('touchcancel', onMsgTouchEnd);

    // 鼠标事件（桌面端）
    container.addEventListener('mousedown', onMsgMouseDown);
    container.addEventListener('mousemove', onMsgMouseMove);
    container.addEventListener('mouseup', onMsgMouseUp);

    // 禁用原生右键菜单
    container.addEventListener('contextmenu', function(e) {
        const msgEl = e.target.closest('.chat-message[data-msg-id]');
        if (msgEl) e.preventDefault();
    });
}

function getMsgElFromEvent(e) {
    const target = e.target || (e.touches && e.touches[0] && document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY));
    if (!target) return null;
    return target.closest('.chat-message[data-msg-id]');
}

function onMsgTouchStart(e) {
    const msgEl = getMsgElFromEvent(e);
    if (!msgEl) return;
    // 多选模式下，直接切换选中状态
    if (_multiSelectMode) {
        toggleMsgSelect(msgEl);
        e.preventDefault();
        return;
    }
    const touch = e.touches[0];
    _msgMenuStartPos = { x: touch.clientX, y: touch.clientY };
    _msgMenuTimer = setTimeout(() => {
        _msgMenuActive = true;
        // 轻微震动反馈
        if (navigator.vibrate) navigator.vibrate(20);
        showMsgContextMenu(msgEl, touch.clientX, touch.clientY);
    }, 500);
}

function onMsgTouchMove(e) {
    if (!_msgMenuStartPos) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - _msgMenuStartPos.x);
    const dy = Math.abs(touch.clientY - _msgMenuStartPos.y);
    if (dx > 10 || dy > 10) {
        clearTimeout(_msgMenuTimer);
        _msgMenuTimer = null;
    }
}

function onMsgTouchEnd() {
    clearTimeout(_msgMenuTimer);
    _msgMenuTimer = null;
    _msgMenuStartPos = null;
    // 延迟重置，避免触发点击
    setTimeout(() => { _msgMenuActive = false; }, 100);
}

function onMsgMouseDown(e) {
    if (e.button !== 0) return;
    const msgEl = getMsgElFromEvent(e);
    if (!msgEl) return;
    // 多选模式下，直接切换选中状态
    if (_multiSelectMode) {
        toggleMsgSelect(msgEl);
        return;
    }
    _msgMenuStartPos = { x: e.clientX, y: e.clientY };
    _msgMenuTimer = setTimeout(() => {
        _msgMenuActive = true;
        showMsgContextMenu(msgEl, e.clientX, e.clientY);
    }, 500);
}

function onMsgMouseMove(e) {
    if (!_msgMenuStartPos) return;
    const dx = Math.abs(e.clientX - _msgMenuStartPos.x);
    const dy = Math.abs(e.clientY - _msgMenuStartPos.y);
    if (dx > 10 || dy > 10) {
        clearTimeout(_msgMenuTimer);
        _msgMenuTimer = null;
    }
}

function onMsgMouseUp() {
    clearTimeout(_msgMenuTimer);
    _msgMenuTimer = null;
    _msgMenuStartPos = null;
    setTimeout(() => { _msgMenuActive = false; }, 100);
}

// 显示消息上下文菜单
function showMsgContextMenu(msgEl, x, y) {
    // 先关闭已有菜单
    closeMsgContextMenu();

    const msgId = msgEl.dataset.msgId;
    const msgType = msgEl.dataset.msgType; // 'user' or 'char'

    // 高亮消息
    msgEl.classList.add('msg-highlight');

    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.className = 'msg-context-overlay';
    overlay.id = 'msgContextOverlay';
    overlay.onclick = () => closeMsgContextMenu();

    // 创建菜单
    const menu = document.createElement('div');
    menu.className = 'msg-context-menu';
    menu.id = 'msgContextMenu';

    // 菜单项（纯SVG图标，无emoji，所有功能对用户和角色消息都显示）
    const items = [
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>',
            label: '引用', action: 'quote'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            label: '编辑', action: 'edit'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>',
            label: '撤回', action: 'recall'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
            label: '群发', action: 'broadcast'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>',
            label: '转发', action: 'forward'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
            label: '删除', action: 'delete', destructive: true
        }
    ];

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'msg-context-item' + (item.destructive ? ' destructive' : '');
        el.innerHTML = `<span class="msg-context-icon">${item.icon}</span><span>${item.label}</span>`;
        el.onclick = (e) => {
            e.stopPropagation();
            closeMsgContextMenu();
            handleMsgAction(item.action, msgId, msgEl);
        };
        menu.appendChild(el);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(menu);

    // 入场动画
    requestAnimationFrame(() => {
        overlay.classList.add('show');

        // 计算菜单位置
        const menuRect = menu.getBoundingClientRect();
        const vw = window.innerWidth;
        const vh = window.innerHeight;

        let left = x - menuRect.width / 2;
        let top = y - menuRect.height - 10;

        // 如果上方空间不够，放到下方
        if (top < 10) {
            top = y + 10;
            menu.classList.add('from-bottom');
        }

        // 水平边界
        if (left < 10) left = 10;
        if (left + menuRect.width > vw - 10) left = vw - menuRect.width - 10;

        // 垂直边界
        if (top + menuRect.height > vh - 10) top = vh - menuRect.height - 10;

        menu.style.left = left + 'px';
        menu.style.top = top + 'px';
        menu.classList.add('show');
    });
}

// 关闭消息上下文菜单
function closeMsgContextMenu() {
    const overlay = document.getElementById('msgContextOverlay');
    const menu = document.getElementById('msgContextMenu');

    // 移除高亮
    document.querySelectorAll('.chat-message.msg-highlight').forEach(el => el.classList.remove('msg-highlight'));

    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
    }
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 200);
    }
}

// 处理菜单操作（目前只做UI框架，具体功能后续实现）
function handleMsgAction(action, msgId, msgEl) {
    switch (action) {
        case 'delete':
            handleMsgDelete(msgId, msgEl);
            break;
        case 'edit':
            handleMsgEdit(msgId, msgEl);
            break;
        case 'recall':
            handleMsgRecall(msgId, msgEl);
            break;
        case 'quote':
            handleMsgQuote(msgId, msgEl);
            break;
        case 'broadcast':
            handleMsgBroadcast(msgId, msgEl);
            break;
        case 'forward':
            handleMsgForward(msgId, msgEl);
            break;
        default:
            showToast('功能开发中');
    }
}

// 删除消息 - 弹出选择：删除本条 or 多选删除
function handleMsgDelete(msgId, msgEl) {
    // 创建选择弹窗
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10040';

    overlay.innerHTML = `
        <div class="ios-dialog">
            <div class="ios-dialog-title">删除消息</div>
            <div class="ios-dialog-message">请选择删除方式</div>
            <div class="ios-dialog-buttons vertical">
                <button class="ios-dialog-button destructive" id="msgDelSingle">删除本条</button>
                <button class="ios-dialog-button destructive" id="msgDelMulti">多选删除</button>
                <button class="ios-dialog-button" id="msgDelCancel">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#msgDelCancel').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#msgDelSingle').onclick = () => {
        close();
        deleteSingleMsg(msgId, msgEl);
    };

    overlay.querySelector('#msgDelMulti').onclick = () => {
        close();
        enterMultiSelectMode(msgId);
    };
}

// 单条删除
function deleteSingleMsg(msgId, msgEl) {
    showIosConfirm('删除消息', '确定要删除这条消息吗？', async () => {
        try {
            await deleteMsgFromDB(msgId);
            msgEl.style.transition = 'opacity 0.25s, transform 0.25s';
            msgEl.style.opacity = '0';
            msgEl.style.transform = 'scale(0.9)';
            setTimeout(() => msgEl.remove(), 260);
            showToast('已删除');
            // 删除后刷新聊天列表预览
            renderChatList();
        } catch (e) {
            console.error('删除消息失败:', e);
            showToast('删除失败');
        }
    });
}

// 从数据库删除单条消息
function deleteMsgFromDB(msgId) {
    return new Promise((resolve) => {
        const tx = db.transaction(['chats'], 'readwrite');
        const s = tx.objectStore('chats');
        const req = s.openCursor();
        req.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                if (cursor.value.id === msgId) {
                    cursor.delete();
                    resolve();
                } else {
                    cursor.continue();
                }
            } else {
                resolve();
            }
        };
        req.onerror = () => resolve();
    });
}

// ========== 多选删除模式 ==========

let _multiSelectMode = false;
let _multiSelectedIds = new Set();
let _multiSelectLock = false; // 防抖锁，防止快速连续点击导致闪烁
let _multiSelectPurpose = 'delete'; // 'delete' | 'forward'

function enterMultiSelectMode(preSelectId, purpose) {
    _multiSelectMode = true;
    _multiSelectPurpose = purpose || 'delete';
    _multiSelectedIds.clear();

    const detailPage = document.getElementById('chatDetailPage');
    const container = document.getElementById('chatMessagesContainer');
    if (!detailPage || !container) return;

    // 给容器加多选class
    const detailContainer = detailPage.querySelector('.chat-detail-container');
    if (detailContainer) detailContainer.classList.add('multiselect-mode');

    // 给每条消息加勾选框
    container.querySelectorAll('.chat-message[data-msg-id]').forEach(msgEl => {
        if (msgEl.querySelector('.msg-checkbox')) return;
        const cb = document.createElement('div');
        cb.className = 'msg-checkbox';
        // 不在checkbox上绑onclick，统一由容器事件委托处理，避免touch+click双重触发
        // 用户消息在右边，checkbox插到最右；角色消息在左边，checkbox插到最左
        if (msgEl.classList.contains('chat-message-user')) {
            msgEl.appendChild(cb);
        } else {
            msgEl.insertBefore(cb, msgEl.firstChild);
        }
    });

    // 预选当前消息
    if (preSelectId) {
        const target = container.querySelector(`.chat-message[data-msg-id="${preSelectId}"]`);
        if (target) toggleMsgSelect(target);
    }

    // 顶部操作栏
    const topBar = document.createElement('div');
    topBar.className = 'msg-multiselect-bar';
    topBar.id = 'msgMultiselectBar';
    topBar.innerHTML = `
        <div class="ms-cancel" onclick="exitMultiSelectMode()">取消</div>
        <div class="ms-title" id="msTitle">已选择 ${_multiSelectedIds.size} 条</div>
        <div class="ms-select-all" onclick="toggleSelectAllMsgs()">全选</div>
    `;
    detailContainer.insertBefore(topBar, detailContainer.firstChild);

    // 底部操作栏 - 根据用途显示不同按钮
    const bottomBar = document.createElement('div');
    bottomBar.className = 'msg-multiselect-bottom';
    bottomBar.id = 'msgMultiselectBottom';
    if (_multiSelectPurpose === 'forward') {
        bottomBar.innerHTML = `
            <button class="ms-forward-btn" id="msForwardBtn" disabled onclick="forwardSelectedMsgs()">转发</button>
        `;
    } else {
        bottomBar.innerHTML = `
            <button class="ms-delete-btn" id="msDeleteBtn" disabled onclick="confirmMultiDelete()">删除</button>
        `;
    }
    detailContainer.appendChild(bottomBar);

    updateMultiSelectUI();
}

function exitMultiSelectMode() {
    _multiSelectMode = false;
    _multiSelectPurpose = 'delete';
    _multiSelectedIds.clear();

    const detailPage = document.getElementById('chatDetailPage');
    if (!detailPage) return;

    const detailContainer = detailPage.querySelector('.chat-detail-container');
    if (detailContainer) detailContainer.classList.remove('multiselect-mode');

    // 移除所有checkbox
    document.querySelectorAll('.msg-checkbox').forEach(cb => cb.remove());

    // 移除顶部和底部栏
    const topBar = document.getElementById('msgMultiselectBar');
    const bottomBar = document.getElementById('msgMultiselectBottom');
    if (topBar) topBar.remove();
    if (bottomBar) bottomBar.remove();
}

function toggleMsgSelect(msgEl) {
    if (_multiSelectLock) return;
    _multiSelectLock = true;
    setTimeout(() => { _multiSelectLock = false; }, 150);

    const msgId = msgEl.dataset.msgId;
    const cb = msgEl.querySelector('.msg-checkbox');
    if (!cb) return;

    if (_multiSelectedIds.has(msgId)) {
        _multiSelectedIds.delete(msgId);
        cb.classList.remove('checked');
    } else {
        _multiSelectedIds.add(msgId);
        cb.classList.add('checked');
    }
    updateMultiSelectUI();
}

function toggleSelectAllMsgs() {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return;

    const allMsgs = container.querySelectorAll('.chat-message[data-msg-id]');
    const allSelected = _multiSelectedIds.size === allMsgs.length && allMsgs.length > 0;

    if (allSelected) {
        // 取消全选
        _multiSelectedIds.clear();
        allMsgs.forEach(el => {
            const cb = el.querySelector('.msg-checkbox');
            if (cb) cb.classList.remove('checked');
        });
    } else {
        // 全选
        allMsgs.forEach(el => {
            const id = el.dataset.msgId;
            _multiSelectedIds.add(id);
            const cb = el.querySelector('.msg-checkbox');
            if (cb) cb.classList.add('checked');
        });
    }
    updateMultiSelectUI();
}

function updateMultiSelectUI() {
    const count = _multiSelectedIds.size;
    const title = document.getElementById('msTitle');
    if (title) title.textContent = `已选择 ${count} 条`;

    const btn = document.getElementById('msDeleteBtn');
    if (btn) {
        btn.disabled = count === 0;
        btn.textContent = count > 0 ? `删除 (${count})` : '删除';
    }

    const fwdBtn = document.getElementById('msForwardBtn');
    if (fwdBtn) {
        fwdBtn.disabled = count === 0;
        fwdBtn.textContent = count > 0 ? `转发 (${count})` : '转发';
    }
}

function confirmMultiDelete() {
    const count = _multiSelectedIds.size;
    if (count === 0) return;

    showIosConfirm('批量删除', `确定要删除选中的 ${count} 条消息吗？`, async () => {
        try {
            const idsToDelete = [..._multiSelectedIds];
            const container = document.getElementById('chatMessagesContainer');

            // 从数据库批量删除
            for (const id of idsToDelete) {
                await deleteMsgFromDB(id);
            }

            // 从界面移除（带动画）
            idsToDelete.forEach(id => {
                const el = container.querySelector(`.chat-message[data-msg-id="${id}"]`);
                if (el) {
                    el.style.transition = 'opacity 0.2s, transform 0.2s';
                    el.style.opacity = '0';
                    el.style.transform = 'scale(0.9)';
                    setTimeout(() => el.remove(), 220);
                }
            });

            showToast(`已删除 ${count} 条消息`);
            exitMultiSelectMode();
            // 删除后刷新聊天列表预览
            renderChatList();
        } catch (e) {
            console.error('批量删除失败:', e);
            showToast('删除失败');
        }
    });
}

// 编辑消息
function handleMsgEdit(msgId, msgEl) {
    // 获取当前消息内容
    const bubble = msgEl.querySelector('.chat-message-bubble');
    if (!bubble) {
        showToast('该消息不支持编辑');
        return;
    }
    const currentText = bubble.textContent.trim();

    // 创建编辑弹窗
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10030;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s;';

    const card = document.createElement('div');
    card.style.cssText = 'width:300px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

    card.innerHTML = `
        <div style="padding:22px 24px 12px;text-align:center;">
            <div style="font-size:17px;font-weight:600;color:#333;">编辑消息</div>
        </div>
        <div style="padding:8px 24px 16px;">
            <textarea id="msgEditTextarea" style="width:100%;height:80px;padding:12px;border:1.5px solid #e0e0e0;border-radius:12px;font-size:14px;color:#333;outline:none;resize:none;box-sizing:border-box;font-family:inherit;">${escapeHtml(currentText)}</textarea>
        </div>
        <div style="padding:0 24px 20px;display:flex;gap:10px;">
            <button id="msgEditCancel" style="flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;">取消</button>
            <button id="msgEditSave" style="flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;">保存</button>
        </div>
    `;

    overlay.appendChild(card);
    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
        overlay.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
        card.style.opacity = '1';
    });

    const closeEdit = () => {
        overlay.style.opacity = '0';
        card.style.transform = 'scale(0.9) translateY(20px)';
        card.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEdit(); });
    card.querySelector('#msgEditCancel').onclick = closeEdit;
    card.querySelector('#msgEditSave').onclick = async () => {
        const newText = document.getElementById('msgEditTextarea').value.trim();
        if (!newText) {
            showToast('消息不能为空');
            return;
        }
        closeEdit();
        try {
            // 更新数据库
            await new Promise((resolve, reject) => {
                const tx = db.transaction(['chats'], 'readwrite');
                const s = tx.objectStore('chats');
                const req = s.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (cursor.value.id === msgId) {
                            const updated = cursor.value;
                            updated.content = newText;
                            updated.edited = true;
                            cursor.update(updated);
                            resolve();
                        } else {
                            cursor.continue();
                        }
                    } else {
                        resolve();
                    }
                };
                req.onerror = () => resolve();
            });
            // 更新界面
            bubble.textContent = newText;
            showToast('已编辑');
            // 编辑后刷新聊天列表预览
            renderChatList();
        } catch (e) {
            console.error('编辑消息失败:', e);
            showToast('编辑失败');
        }
    };

    setTimeout(() => {
        const ta = document.getElementById('msgEditTextarea');
        if (ta) { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }
    }, 400);
}

// 撤回消息
function handleMsgRecall(msgId, msgEl) {
    showIosConfirm('撤回消息', '确定要撤回这条消息吗？', async () => {
        try {
            // 从数据库删除
            await new Promise((resolve) => {
                const tx = db.transaction(['chats'], 'readwrite');
                const s = tx.objectStore('chats');
                const req = s.openCursor();
                req.onsuccess = (e) => {
                    const cursor = e.target.result;
                    if (cursor) {
                        if (cursor.value.id === msgId) {
                            cursor.delete();
                            resolve();
                        } else {
                            cursor.continue();
                        }
                    } else {
                        resolve();
                    }
                };
                req.onerror = () => resolve();
            });
            // 替换为撤回提示
            const recallEl = document.createElement('div');
            recallEl.style.cssText = 'text-align:center;padding:8px 0;font-size:12px;color:#999;';
            recallEl.textContent = msgEl.dataset.msgType === 'user' ? '你撤回了一条消息' : '对方撤回了一条消息';
            msgEl.style.transition = 'opacity 0.25s';
            msgEl.style.opacity = '0';
            setTimeout(() => {
                msgEl.replaceWith(recallEl);
            }, 260);
            showToast('已撤回');
            // 撤回后刷新聊天列表预览
            renderChatList();
        } catch (e) {
            console.error('撤回消息失败:', e);
            showToast('撤回失败');
        }
    });
}

// 引用消息
function handleMsgQuote(msgId, msgEl) {
    // 获取消息内容
    const bubble = msgEl.querySelector('.chat-message-bubble, .chat-voice-bubble, .chat-sticker-bubble, .chat-image-bubble, .chat-text-image-bubble, .chat-transfer-bubble');
    let quoteText = '';
    if (msgEl.querySelector('.chat-message-bubble')) {
        quoteText = msgEl.querySelector('.chat-message-bubble').textContent.trim();
    } else if (msgEl.querySelector('.chat-voice-bubble')) {
        quoteText = '[语音消息]';
    } else if (msgEl.querySelector('.chat-sticker-bubble')) {
        quoteText = '[表情包]';
    } else if (msgEl.querySelector('.chat-image-bubble')) {
        quoteText = '[图片]';
    } else if (msgEl.querySelector('.chat-text-image-bubble')) {
        quoteText = '[图片]';
    } else if (msgEl.querySelector('.chat-transfer-bubble')) {
        quoteText = '[转账]';
    }

    const senderName = msgEl.dataset.msgType === 'user' ? '你' : (currentChatCharacter ? (currentChatCharacter.remark || currentChatCharacter.name) : '对方');

    // 在输入框上方显示引用条
    let quoteBar = document.getElementById('chatQuoteBar');
    if (!quoteBar) {
        quoteBar = document.createElement('div');
        quoteBar.id = 'chatQuoteBar';
        quoteBar.style.cssText = 'padding:8px 16px;background:#f0f0f0;border-top:1px solid #e0e0e0;display:flex;align-items:center;gap:8px;font-size:13px;color:#666;';
        // 插入到输入栏上方
        const inputBar = document.querySelector('.chat-input-bar') || document.getElementById('chatInputField')?.parentElement?.parentElement;
        if (inputBar) {
            inputBar.parentElement.insertBefore(quoteBar, inputBar);
        }
    }

    // 截断过长的引用文本
    const displayText = quoteText.length > 30 ? quoteText.substring(0, 30) + '...' : quoteText;
    quoteBar.innerHTML = `
        <div style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
            <span style="color:#333;font-weight:500;">${escapeHtml(senderName)}</span>：${escapeHtml(displayText)}
        </div>
        <div style="cursor:pointer;color:#999;font-size:18px;padding:0 4px;" onclick="closeQuoteBar()">×</div>
    `;
    quoteBar.dataset.quoteId = msgId;
    quoteBar.dataset.quoteSender = senderName;
    quoteBar.dataset.quoteText = quoteText;
    quoteBar.style.display = 'flex';

    // 聚焦输入框
    const input = document.getElementById('chatInputField');
    if (input) input.focus();

    showToast('已引用');
}

// 关闭引用条
function closeQuoteBar() {
    const bar = document.getElementById('chatQuoteBar');
    if (bar) {
        bar.style.display = 'none';
        bar.dataset.quoteId = '';
    }
}

// 群发消息
function handleMsgBroadcast(msgId, msgEl) {
    // 获取消息内容
    const bubble = msgEl.querySelector('.chat-message-bubble');
    let broadcastText = '';
    if (bubble) {
        broadcastText = bubble.textContent.trim();
    } else {
        showToast('该消息类型暂不支持群发');
        return;
    }

    if (!broadcastText) {
        showToast('消息内容为空');
        return;
    }

    // 弹出确认
    showIosConfirm('群发消息', `将此消息发送给所有角色？\n\n"${broadcastText.length > 40 ? broadcastText.substring(0, 40) + '...' : broadcastText}"`, async () => {
        try {
            let count = 0;
            for (const char of chatCharacters) {
                const msgObj = {
                    id: Date.now().toString() + Math.random(),
                    characterId: char.id,
                    content: broadcastText,
                    type: 'user',
                    timestamp: new Date().toISOString(),
                    sender: 'user'
                };
                await saveMessageToDB(msgObj);
                await updateChatListLastMessage(char.id, broadcastText, msgObj.timestamp);
                count++;
            }
            showToast(`已群发给 ${count} 个角色`);
        } catch (e) {
            console.error('群发失败:', e);
            showToast('群发失败');
        }
    });
}

// iOS风格确认弹窗（带取消和确认按钮）
function showIosConfirm(title, message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10040';

    overlay.innerHTML = `
        <div class="ios-dialog">
            <div class="ios-dialog-title">${escapeHtml(title)}</div>
            <div class="ios-dialog-message">${escapeHtml(message)}</div>
            <div class="ios-dialog-buttons">
                <button class="ios-dialog-button" id="iosConfirmCancel">取消</button>
                <button class="ios-dialog-button primary destructive" id="iosConfirmOk">确定</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#iosConfirmCancel').onclick = close;
    overlay.querySelector('#iosConfirmOk').onclick = () => {
        close();
        if (onConfirm) onConfirm();
    };
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
}

// 在打开聊天详情时初始化长按菜单
const _origOpenChatDetail = typeof openChatDetail === 'function' ? openChatDetail : null;
if (_origOpenChatDetail) {
    const _origFn = openChatDetail;
    openChatDetail = async function() {
        await _origFn.apply(this, arguments);
        // 延迟初始化，确保DOM已渲染
        setTimeout(() => initMsgContextMenu(), 200);
    };
}


// ========== 消息通知弹窗功能 ==========

// 通知弹窗队列
let _notifQueue = [];
let _notifProcessing = false;

// 读取通知设置
function getNotifSettings() {
    return {
        stack: localStorage.getItem('notifStackEnabled') === 'true',           // 默认false
        onlyOther: localStorage.getItem('notifOnlyOtherEnabled') !== 'false'   // 默认true
    };
}

// 切换多条堆叠开关
function toggleNotifStack() {
    const toggle = document.getElementById('notifStackToggle');
    if (toggle) {
        localStorage.setItem('notifStackEnabled', toggle.checked ? 'true' : 'false');
    }
}

// 切换仅非当前聊天角色弹窗开关
function toggleNotifOnlyOther() {
    const toggle = document.getElementById('notifOnlyOtherToggle');
    if (toggle) {
        localStorage.setItem('notifOnlyOtherEnabled', toggle.checked ? 'true' : 'false');
    }
}

// 显示一条消息通知弹窗
function showMsgNotification(characterId, charName, charAvatar, messageText) {
    const settings = getNotifSettings();

    // 如果开启了"仅非当前聊天角色弹窗"，且用户正在该角色聊天界面，则不弹
    if (settings.onlyOther && isUserInChatDetail(characterId)) {
        return;
    }

    const notifData = { characterId, charName, charAvatar, messageText };

    if (settings.stack) {
        // 堆叠模式：直接显示
        _createNotifPopup(notifData);
    } else {
        // 非堆叠模式：加入队列，逐条显示
        _notifQueue.push(notifData);
        _processNotifQueue();
    }
}

// 处理通知队列（非堆叠模式）
function _processNotifQueue() {
    if (_notifProcessing || _notifQueue.length === 0) return;
    _notifProcessing = true;

    // 移除当前显示的通知
    const container = document.getElementById('msgNotifContainer');
    const existing = container ? container.querySelector('.msg-notif-popup') : null;
    if (existing) {
        existing.classList.remove('show');
        existing.classList.add('hide');
        setTimeout(() => {
            if (existing.parentNode) existing.parentNode.removeChild(existing);
            _showNextNotif();
        }, 260);
    } else {
        _showNextNotif();
    }
}

function _showNextNotif() {
    if (_notifQueue.length === 0) {
        _notifProcessing = false;
        return;
    }
    const data = _notifQueue.shift();
    _createNotifPopup(data, () => {
        _notifProcessing = false;
        _processNotifQueue();
    });
}

// 创建并显示一个通知弹窗
function _createNotifPopup(data, onDismiss) {
    const container = document.getElementById('msgNotifContainer');
    if (!container) return;

    const popup = document.createElement('div');
    popup.className = 'msg-notif-popup';
    popup.dataset.charId = data.characterId;

    // 格式化时间
    const now = new Date();
    const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

    // 截断消息文本
    let displayText = data.messageText || '';
    if (displayText.length > 50) displayText = displayText.substring(0, 50) + '...';

    popup.innerHTML = `
        <div class="msg-notif-avatar">
            ${data.charAvatar ? `<img src="${data.charAvatar}" alt="">` : '头像'}
        </div>
        <div class="msg-notif-body">
            <div class="msg-notif-name">${_escapeNotifHtml(data.charName)}</div>
            <div class="msg-notif-text">${_escapeNotifHtml(displayText)}</div>
        </div>
        <div class="msg-notif-time">${timeStr}</div>
    `;

    // 点击跳转到该角色聊天界面
    popup.addEventListener('click', () => {
        _dismissNotif(popup, onDismiss);
        if (typeof openChatDetail === 'function') {
            openChatDetail(data.characterId);
        }
    });

    container.appendChild(popup);

    // 入场动画
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            popup.classList.add('show');
        });
    });

    // 4秒后自动消失
    const autoTimer = setTimeout(() => {
        _dismissNotif(popup, onDismiss);
    }, 4000);

    popup._autoTimer = autoTimer;
}

// 消失通知
function _dismissNotif(popup, onDismiss) {
    if (!popup || popup._dismissed) return;
    popup._dismissed = true;
    if (popup._autoTimer) clearTimeout(popup._autoTimer);

    popup.classList.remove('show');
    popup.classList.add('hide');
    setTimeout(() => {
        if (popup.parentNode) popup.parentNode.removeChild(popup);
        if (onDismiss) onDismiss();
    }, 260);
}

// HTML转义
function _escapeNotifHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ========== 消息转发功能 ==========

// 单条消息转发入口
function handleMsgForward(msgId, msgEl) {
    // 创建选择弹窗：转发本条 / 多选转发
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10040';

    overlay.innerHTML = `
        <div class="ios-dialog">
            <div class="ios-dialog-title">转发消息</div>
            <div class="ios-dialog-message">请选择转发方式</div>
            <div class="ios-dialog-buttons vertical">
                <button class="ios-dialog-button" id="msgFwdSingle">转发本条</button>
                <button class="ios-dialog-button" id="msgFwdMulti">多选转发</button>
                <button class="ios-dialog-button" id="msgFwdCancel">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#msgFwdCancel').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#msgFwdSingle').onclick = () => {
        close();
        const msgs = collectForwardMessages([msgId]);
        if (!msgs.length) {
            showToast('该消息不支持转发');
            return;
        }
        showForwardCharacterSelector(msgs);
    };

    overlay.querySelector('#msgFwdMulti').onclick = () => {
        close();
        enterMultiSelectMode(msgId, 'forward');
    };
}


// 多选模式转发入口
function forwardSelectedMsgs() {
    if (_multiSelectedIds.size === 0) return;
    const ids = [..._multiSelectedIds];
    const msgs = collectForwardMessages(ids);
    if (!msgs.length) {
        showToast('选中的消息不支持转发');
        return;
    }
    exitMultiSelectMode();
    showForwardCharacterSelector(msgs);
}

// 从消息ID列表收集转发内容
function collectForwardMessages(msgIds) {
    const container = document.getElementById('chatMessagesContainer');
    if (!container) return [];
    const results = [];
    // 按DOM顺序排列
    const allMsgEls = container.querySelectorAll('.chat-message[data-msg-id]');
    allMsgEls.forEach(el => {
        const id = el.dataset.msgId;
        if (!msgIds.includes(id)) return;
        const bubble = el.querySelector('.chat-message-bubble');
        if (bubble) {
            results.push({ id, text: bubble.textContent.trim() });
        }
    });
    return results;
}

// 显示转发角色选择器
function showForwardCharacterSelector(msgs) {
    // 过滤掉当前正在聊天的角色
    const currentId = currentChatCharacter ? currentChatCharacter.id : null;
    const candidates = chatCharacters.filter(c => c.id !== currentId);

    if (candidates.length === 0) {
        showToast('没有其他角色可以转发');
        return;
    }

    const selectedIds = new Set();

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10050';
    overlay.id = 'forwardSelectorOverlay';

    const card = document.createElement('div');
    card.style.cssText = 'background:#fff;border-radius:16px;width:90%;max-width:360px;max-height:70vh;display:flex;flex-direction:column;overflow:hidden;animation:slideUp 0.3s ease;';

    // 头部
    const header = document.createElement('div');
    header.style.cssText = 'padding:16px 20px;border-bottom:1px solid #e5e5e5;display:flex;justify-content:space-between;align-items:center;flex-shrink:0;';
    header.innerHTML = `
        <div style="font-size:17px;font-weight:600;color:#333;">转发给</div>
        <div style="font-size:13px;color:#999;">${msgs.length}条消息</div>
    `;
    card.appendChild(header);

    // 角色列表
    const listWrap = document.createElement('div');
    listWrap.style.cssText = 'overflow-y:auto;flex:1;padding:8px 0;';

    candidates.forEach(char => {
        const item = document.createElement('div');
        item.style.cssText = 'display:flex;align-items:center;padding:12px 20px;cursor:pointer;transition:background 0.15s;';
        item.onmousedown = () => { item.style.background = '#f5f5f5'; };
        item.onmouseup = () => { item.style.background = ''; };
        item.onmouseleave = () => { item.style.background = ''; };

        const avatarHtml = char.avatar
            ? `<img src="${char.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`
            : `<div style="width:40px;height:40px;border-radius:50%;background:#e0e0e0;display:flex;align-items:center;justify-content:center;font-size:18px;color:#999;">${(char.remark || char.name || '?')[0]}</div>`;

        const cb = document.createElement('div');
        cb.className = 'fwd-cb';
        cb.style.cssText = 'width:22px;height:22px;border-radius:50%;border:2px solid #d1d1d6;margin-right:14px;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all 0.2s;';

        item.innerHTML = '';
        item.appendChild(cb);
        const avatarDiv = document.createElement('div');
        avatarDiv.style.cssText = 'margin-right:12px;flex-shrink:0;';
        avatarDiv.innerHTML = avatarHtml;
        item.appendChild(avatarDiv);
        const nameDiv = document.createElement('div');
        nameDiv.style.cssText = 'font-size:15px;color:#333;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
        nameDiv.textContent = char.remark || char.name || '未命名';
        item.appendChild(nameDiv);

        item.onclick = () => {
            if (selectedIds.has(char.id)) {
                selectedIds.delete(char.id);
                cb.style.background = '';
                cb.style.borderColor = '#d1d1d6';
                cb.innerHTML = '';
            } else {
                selectedIds.add(char.id);
                cb.style.background = '#007aff';
                cb.style.borderColor = '#007aff';
                cb.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
            }
            confirmBtn.disabled = selectedIds.size === 0;
            confirmBtn.textContent = selectedIds.size > 0 ? `确认转发 (${selectedIds.size})` : '确认转发';
        };

        listWrap.appendChild(item);
    });
    card.appendChild(listWrap);

    // 底部按钮
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:12px 20px;border-top:1px solid #e5e5e5;display:flex;gap:10px;flex-shrink:0;';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:12px 0;border:none;border-radius:10px;font-size:15px;font-weight:500;background:#f2f2f7;color:#333;cursor:pointer;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeForwardSelector();

    const confirmBtn = document.createElement('button');
    confirmBtn.style.cssText = 'flex:1;padding:12px 0;border:none;border-radius:10px;font-size:15px;font-weight:500;background:#007aff;color:#fff;cursor:pointer;transition:opacity 0.15s;';
    confirmBtn.textContent = '确认转发';
    confirmBtn.disabled = true;
    confirmBtn.onclick = () => executeForward(msgs, selectedIds);

    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    card.appendChild(footer);

    overlay.appendChild(card);
    overlay.onclick = (e) => { if (e.target === overlay) closeForwardSelector(); };
    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));
}

function closeForwardSelector() {
    const overlay = document.getElementById('forwardSelectorOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
    }
}

async function executeForward(msgs, targetIds) {
    closeForwardSelector();
    try {
        let count = 0;
        for (const charId of targetIds) {
            for (const msg of msgs) {
                const msgObj = {
                    id: Date.now().toString() + Math.random().toString(36).substr(2, 6),
                    characterId: charId,
                    content: msg.text,
                    type: 'user',
                    timestamp: new Date().toISOString(),
                    sender: 'user'
                };
                await saveMessageToDB(msgObj);
            }
            // 更新聊天列表最后一条消息
            const lastMsg = msgs[msgs.length - 1];
            await updateChatListLastMessage(charId, lastMsg.text, new Date().toISOString());
            count++;
        }
        showToast(`已转发给 ${count} 个角色`);
        // 刷新聊天列表
        renderChatList();
    } catch (e) {
        console.error('转发失败:', e);
        showToast('转发失败');
    }
}

// ========== 在 saveMessageToDB 中挂载通知弹窗触发 ==========

// 包装原始的 saveMessageToDB，在角色消息保存后触发通知弹窗
const _origSaveMessageToDB = typeof saveMessageToDB === 'function' ? saveMessageToDB : null;
if (_origSaveMessageToDB) {
    saveMessageToDB = async function(messageObj) {
        // 先执行原始保存逻辑
        await _origSaveMessageToDB(messageObj);

        // 角色消息时触发通知弹窗
        if (messageObj.type === 'char' && messageObj.characterId) {
            const character = chatCharacters.find(c => c.id === messageObj.characterId);
            if (character) {
                // 获取消息文本
                let text = messageObj.content || '';
                if (messageObj.messageType === 'sticker') text = '[表情包]';
                else if (messageObj.messageType === 'voice') text = '[语音消息]';
                else if (messageObj.messageType === 'transfer') text = '[转账]';
                else if (messageObj.messageType === 'image') text = '[图片]';
                else if (messageObj.messageType === 'textImage') text = '[图片]';

                showMsgNotification(
                    character.id,
                    character.remark || character.name,
                    character.avatar || '',
                    text
                );
            }
        }
    };
}


// ========== 对话统计功能 ==========

// 估算文本的token数（粗略估算）
function estimateTokenCount(text) {
    if (!text) return 0;
    let tokens = 0;
    // 中文字符：约1.5 token/字
    const chineseChars = (text.match(/[\u4e00-\u9fff\u3400-\u4dbf]/g) || []).length;
    tokens += chineseChars * 1.5;
    // 去掉中文后剩余部分按英文估算：约0.25 token/字符（≈4字符/token）
    const nonChinese = text.replace(/[\u4e00-\u9fff\u3400-\u4dbf]/g, '');
    tokens += nonChinese.length * 0.25;
    return Math.round(tokens);
}

// 更新对话统计
async function updateChatStats() {
    if (!currentChatCharacter) return;
    try {
        const allChats = await getAllChatsFromDB();
        const msgs = allChats.filter(m => m.characterId === currentChatCharacter.id);

        const total = msgs.length;
        const userCount = msgs.filter(m => m.type === 'user').length;
        const charCount = msgs.filter(m => m.type === 'char').length;

        // 估算token：累加所有消息内容
        let totalTokens = 0;
        msgs.forEach(m => {
            totalTokens += estimateTokenCount(m.content || '');
            if (m.voiceText) totalTokens += estimateTokenCount(m.voiceText);
            if (m.textImageDesc) totalTokens += estimateTokenCount(m.textImageDesc);
            if (m.transferRemark) totalTokens += estimateTokenCount(m.transferRemark);
        });

        // 格式化数字显示
        const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString();

        const elTotal = document.getElementById('statTotalMessages');
        const elUser = document.getElementById('statUserMessages');
        const elChar = document.getElementById('statCharMessages');
        const elTokens = document.getElementById('statEstTokens');

        if (elTotal) elTotal.textContent = fmt(total);
        if (elUser) elUser.textContent = fmt(userCount);
        if (elChar) elChar.textContent = fmt(charCount);
        if (elTokens) elTokens.textContent = fmt(totalTokens);
    } catch (e) {
        console.error('更新对话统计失败:', e);
    }
}

// Hook openChatSettings：打开聊天设置时自动更新统计
const _origOpenChatSettings = typeof openChatSettings === 'function' ? openChatSettings : null;
if (_origOpenChatSettings) {
    const _origFn = openChatSettings;
    openChatSettings = function() {
        _origFn.apply(this, arguments);
        // 延迟更新，确保设置页已显示
        setTimeout(() => updateChatStats(), 100);
    };
}

// Hook switchChatSettingsTab：切换到高级标签时刷新统计
const _origSwitchChatSettingsTab = typeof switchChatSettingsTab === 'function' ? switchChatSettingsTab : null;
if (_origSwitchChatSettingsTab) {
    const _origTabFn = switchChatSettingsTab;
    switchChatSettingsTab = function(tabName) {
        _origTabFn.apply(this, arguments);
        if (tabName === 'advanced') {
            setTimeout(() => updateChatStats(), 100);
        }
    };
}

// Hook saveMessageToDB：每次保存消息后，如果设置页可见则实时刷新统计
const _origSaveMessageForStats = typeof saveMessageToDB === 'function' ? saveMessageToDB : null;
if (_origSaveMessageForStats) {
    const _prevFn = saveMessageToDB;
    saveMessageToDB = async function(messageObj) {
        await _prevFn.apply(this, arguments);
        // 如果聊天设置页正在显示，实时更新统计
        const settingsPage = document.getElementById('chatSettingsPage');
        if (settingsPage && settingsPage.style.display === 'block') {
            setTimeout(() => updateChatStats(), 200);
        }
    };
}


// ========== 手动总结功能 ==========

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
        const uds = localStorage.getItem('chatUserData');
        if (uds) { const ud = JSON.parse(uds); if (ud.name) userName = ud.name; }
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
            if (text.length > 30) text = text.substring(0, 30) + '...';
            lines.push(`<div style="padding:2px 0;">${role} ${escapeHtml(text)}</div>`);
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
    confirmBtn.onclick = () => executeManualSummary(overlay, card, msgs);

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

// 执行手动总结
async function executeManualSummary(overlay, card, allMsgs) {
    if (!currentChatCharacter) return;

    const total = allMsgs.length;
    const from = Math.max(1, Math.min(total, parseInt(document.getElementById('manualSummaryFrom').value) || 1));
    const to = Math.max(from, Math.min(total, parseInt(document.getElementById('manualSummaryTo').value) || total));
    const selectedMsgs = allMsgs.slice(from - 1, to);

    if (selectedMsgs.length < 2) {
        showIosAlert('提示', '至少需要选择2条消息');
        return;
    }

    // 关闭弹窗
    closeManualSummaryModal(overlay, card);
    showToast('正在总结中...');

    try {
        const character = currentChatCharacter;
        const charName = character.name || '角色';
        let userName = '对方';
        try {
            const userDataStr = localStorage.getItem('chatUserData');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (userData.name) userName = userData.name;
            }
        } catch (e) {}

        // 构建对话文本
        const messagesText = selectedMsgs.map(msg => {
            const role = msg.type === 'user' ? userName : charName;
            let content = msg.content || '';
            if (msg.messageType === 'voice' && msg.voiceText) content = `(语音) ${msg.voiceText}`;
            else if (msg.messageType === 'sticker') content = `(表情包: ${msg.stickerName || '未知'})`;
            else if (msg.messageType === 'image') content = '(发送了一张图片)';
            else if (msg.messageType === 'textImage' && msg.textImageDesc) content = `(图片: ${msg.textImageDesc})`;
            else if (msg.messageType === 'transfer') {
                const amount = msg.transferAmount || 0;
                const status = msg.transferStatus || 'pending';
                content = `(转账 ¥${amount} ${status === 'accepted' ? '已收款' : status === 'rejected' ? '已退还' : '待处理'})`;
            }
            const time = msg.timestamp ? new Date(msg.timestamp).toLocaleString('zh-CN') : '';
            return `[${time}] ${role}: ${content}`;
        }).join('\n');

        // 获取总结提示词（复用角色设置的格式）
        const format = character.longTermMemoryFormat || 'timeline';
        let summaryPrompt;
        if (format === 'custom' && character.longTermMemoryCustomPrompt) {
            summaryPrompt = character.longTermMemoryCustomPrompt
                .replace(/\{messages\}/g, messagesText)
                .replace(/\{charName\}/g, charName)
                .replace(/\{userName\}/g, userName);
        } else {
            const template = LTM_FORMAT_TEMPLATES[format] || LTM_FORMAT_TEMPLATES.timeline;
            summaryPrompt = template.summaryPrompt
                .replace(/\{messages\}/g, messagesText)
                .replace(/\{charName\}/g, charName)
                .replace(/\{userName\}/g, userName);
        }

        // 调用API
        const settings = await getSummaryApiSettings();
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
            showIosAlert('提示', '请先配置API');
            return;
        }

        let response;
        const apiMessages = [
            { role: 'system', content: '你是一个对话总结助手。请严格按照要求格式输出总结。' },
            { role: 'user', content: summaryPrompt }
        ];

        if (settings.provider === 'hakimi') {
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
                    systemInstruction: { parts: [{ text: '你是一个对话总结助手。请严格按照要求格式输出总结。' }] },
                    generationConfig: { temperature: 0.3, maxOutputTokens: 500 }
                })
            });
        } else if (settings.provider === 'claude') {
            response = await fetch(`${settings.apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: settings.model,
                    max_tokens: 500,
                    temperature: 0.3,
                    system: '你是一个对话总结助手。请严格按照要求格式输出总结。',
                    messages: [{ role: 'user', content: summaryPrompt }]
                })
            });
        } else {
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: apiMessages,
                    temperature: 0.3,
                    max_tokens: 500
                })
            });
        }

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        let summaryText = '';

        if (settings.provider === 'hakimi') {
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                summaryText = data.candidates[0].content.parts[0].text;
            }
        } else if (settings.provider === 'claude') {
            if (data.content && data.content[0]) {
                summaryText = data.content[0].text;
            }
        } else {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                summaryText = data.choices[0].message.content;
            }
        }

        summaryText = summaryText.trim();
        if (!summaryText) {
            showIosAlert('提示', '总结结果为空，请重试');
            return;
        }

        // 保存到长期记忆
        await addLongTermMemory(currentChatCharacter.id, summaryText, 'manual');
        await renderLongTermMemoryList();
        showToast('总结完成');

    } catch (err) {
        console.error('手动总结失败:', err);
        showIosAlert('总结失败', err.message || '未知错误');
    }
}

// ========== 挂载聊天记录功能 ==========

// 总开关切换
function onMountChatToggleChange() {
    const toggle = document.getElementById('mountChatToggle');
    const settingsDiv = document.getElementById('mountChatSettings');
    if (toggle.checked) {
        settingsDiv.style.display = 'block';
        renderMountChatList();
    } else {
        settingsDiv.style.display = 'none';
    }
}

// 渲染可挂载的聊天列表（排除当前角色自身）
function renderMountChatList() {
    const container = document.getElementById('mountChatList');
    if (!container || !currentChatCharacter) return;

    const otherChars = chatCharacters.filter(c => c.id !== currentChatCharacter.id);
    if (otherChars.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; font-size: 13px; padding: 12px 0;">暂无其他聊天</div>';
        return;
    }

    // 获取当前已挂载的配置
    const mountedChats = currentChatCharacter.mountedChats || [];
    const mountedMap = {};
    mountedChats.forEach(mc => { mountedMap[mc.chatId] = mc.count; });

    let html = '';
    otherChars.forEach(char => {
        const isChecked = mountedMap.hasOwnProperty(char.id);
        const displayName = char.remark || char.name || '未命名角色';
        html += `
            <div style="display: flex; align-items: center; padding: 10px 8px; border-bottom: 1px solid #eee;">
                <label style="display: flex; align-items: center; gap: 10px; flex: 1; cursor: pointer;">
                    <input type="checkbox" class="mount-chat-checkbox" data-char-id="${char.id}" ${isChecked ? 'checked' : ''} onchange="onMountChatCheckChange()">
                    <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                        ${char.avatar ? `<img src="${char.avatar}" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover;">` : `<div style="width: 32px; height: 32px; border-radius: 8px; background: #e0e0e0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">头像</div>`}
                        <span style="font-size: 14px; color: #333;">${escapeHtml(displayName)}</span>
                    </div>
                </label>
            </div>
        `;
    });

    container.innerHTML = html;

    // 同步渲染条数设置
    renderMountChatCountSettings();
}

// 勾选/取消勾选时更新条数设置区域
function onMountChatCheckChange() {
    renderMountChatCountSettings();
}

// 渲染已勾选聊天的条数输入
function renderMountChatCountSettings() {
    const countContainer = document.getElementById('mountChatCountSettings');
    if (!countContainer) return;

    const checkboxes = document.querySelectorAll('.mount-chat-checkbox:checked');
    if (checkboxes.length === 0) {
        countContainer.innerHTML = '<div style="font-size: 13px; color: #999;">请先勾选要挂载的聊天</div>';
        return;
    }

    // 获取当前已挂载的配置
    const mountedChats = currentChatCharacter.mountedChats || [];
    const mountedMap = {};
    mountedChats.forEach(mc => { mountedMap[mc.chatId] = mc.count; });

    let html = '';
    checkboxes.forEach(cb => {
        const charId = cb.dataset.charId;
        const char = chatCharacters.find(c => c.id === charId);
        if (!char) return;
        const displayName = char.remark || char.name || '未命名角色';
        const currentCount = mountedMap[charId] || 10;
        html += `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f0f0f0;">
                <div style="flex: 1; font-size: 14px; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(displayName)}</div>
                <input type="number" class="mount-chat-count-input form-input" data-char-id="${charId}" value="${currentCount}" min="1" max="1000" step="1" style="width: 80px; padding: 8px 10px; font-size: 14px; text-align: center;">
                <span style="font-size: 13px; color: #999;">条</span>
            </div>
        `;
    });

    countContainer.innerHTML = html;
}

// 初始化挂载聊天记录设置（打开设置时调用）
function initMountChatSettings() {
    if (!currentChatCharacter) return;

    const enabled = currentChatCharacter.mountChatEnabled || false;
    document.getElementById('mountChatToggle').checked = enabled;

    const settingsDiv = document.getElementById('mountChatSettings');
    if (enabled) {
        settingsDiv.style.display = 'block';
        renderMountChatList();
    } else {
        settingsDiv.style.display = 'none';
    }
}

// 保存挂载聊天记录设置（在saveChatSettings中调用）
function saveMountChatSettings() {
    if (!currentChatCharacter) return;

    const enabled = document.getElementById('mountChatToggle').checked;
    currentChatCharacter.mountChatEnabled = enabled;

    if (!enabled) {
        currentChatCharacter.mountedChats = [];
        return;
    }

    const checkboxes = document.querySelectorAll('.mount-chat-checkbox:checked');
    const mountedChats = [];
    checkboxes.forEach(cb => {
        const charId = cb.dataset.charId;
        const countInput = document.querySelector(`.mount-chat-count-input[data-char-id="${charId}"]`);
        const count = countInput ? (parseInt(countInput.value) || 10) : 10;
        mountedChats.push({ chatId: charId, count: Math.max(1, Math.min(1000, count)) });
    });

    currentChatCharacter.mountedChats = mountedChats;
}

// 构建挂载聊天记录的提示词片段（在buildRolePlaySystemPrompt中调用）
async function buildMountedChatPrompt(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character || !character.mountChatEnabled) return '';

    const mountedChats = character.mountedChats || [];
    if (mountedChats.length === 0) return '';

    const parts = [];

    for (const mc of mountedChats) {
        const targetChar = chatCharacters.find(c => c.id === mc.chatId);
        if (!targetChar) continue; // 被删除的聊天，跳过

        const targetName = targetChar.remark || targetChar.name || '未命名角色';
        const count = mc.count || 10;

        try {
            const history = await getChatHistory(mc.chatId, count);
            if (!history || history.length === 0) continue;

            // 获取用户名
            let userName = '用户';
            try {
                const userDataStr = localStorage.getItem('chatUserData');
                if (userDataStr) {
                    const userData = JSON.parse(userDataStr);
                    if (userData.name) userName = userData.name;
                }
            } catch (e) {}

            let chatLog = '';
            history.forEach(msg => {
                let content = msg.content || '';
                // 简化特殊消息类型
                if (msg.messageType === 'voice' && msg.voiceText) {
                    content = `（语音）${msg.voiceText}`;
                } else if (msg.messageType === 'sticker') {
                    content = `（表情包：${msg.stickerName || '未知'}）`;
                } else if (msg.messageType === 'image') {
                    content = '（图片）';
                } else if (msg.messageType === 'textImage' && msg.textImageDesc) {
                    content = `（图片：${msg.textImageDesc}）`;
                } else if (msg.messageType === 'transfer') {
                    const amt = msg.transferAmount || 0;
                    content = `（转账 ¥${amt}）`;
                }
                const sender = msg.type === 'user' ? userName : targetName;
                chatLog += `${sender}: ${content}\n`;
            });

            if (chatLog) {
                parts.push(`【${userName}与${targetName}的聊天记录（最近${history.length}条）】\n${chatLog.trim()}`);
            }
        } catch (e) {
            console.error(`获取挂载聊天记录失败(${mc.chatId}):`, e);
        }
    }

    if (parts.length === 0) return '';

    return `\n以下是你可以参考的其他聊天记录。这些是用户和其他角色之间的对话，你可以从中了解用户的习惯、喜好和近况，但不要直接提及你看过这些记录：\n\n${parts.join('\n\n')}`;
}
