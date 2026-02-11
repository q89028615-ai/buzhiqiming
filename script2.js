// ========== script2.js - 扩展功能模块 ==========
// 依赖 script.js 中的全局变量和函数

// ========== 定位消息功能 ==========

// 打开定位输入弹窗
function openLocationModal() {
    // 收起扩展面板
    const panel = document.getElementById('chatExtendPanel');
    if (panel) panel.classList.remove('active');

    const overlay = document.createElement('div');
    overlay.id = 'locationOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:300px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

    // 标题
    const header = document.createElement('div');
    header.style.cssText = 'padding:22px 24px 8px;text-align:center;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:17px;font-weight:600;color:#333;';
    title.textContent = '发送定位';
    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:12px;color:#aaa;margin-top:6px;';
    subtitle.textContent = '输入地址信息发送给对方';
    header.appendChild(title);
    header.appendChild(subtitle);

    // 表单区域
    const body = document.createElement('div');
    body.style.cssText = 'padding:12px 24px 8px;';

    // 地址（必填）
    const addrLabel = document.createElement('div');
    addrLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    addrLabel.textContent = '地址（必填）';
    const addrInput = document.createElement('input');
    addrInput.id = 'locationAddrInput';
    addrInput.type = 'text';
    addrInput.placeholder = '例如：北京市朝阳区建国路88号';
    addrInput.maxLength = 100;
    addrInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;transition:border-color 0.2s;margin-bottom:14px;';
    addrInput.onfocus = () => { addrInput.style.borderColor = '#999'; };
    addrInput.onblur = () => { addrInput.style.borderColor = '#e0e0e0'; };

    // 坐标（可选）
    const coordLabel = document.createElement('div');
    coordLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    coordLabel.textContent = '坐标（可选）';
    const coordInput = document.createElement('input');
    coordInput.id = 'locationCoordInput';
    coordInput.type = 'text';
    coordInput.placeholder = '例如：39.9042, 116.4074';
    coordInput.maxLength = 60;
    coordInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;transition:border-color 0.2s;margin-bottom:14px;';
    coordInput.onfocus = () => { coordInput.style.borderColor = '#999'; };
    coordInput.onblur = () => { coordInput.style.borderColor = '#e0e0e0'; };

    // 距离（可选）
    const distLabel = document.createElement('div');
    distLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    distLabel.textContent = '距离（可选）';
    const distRow = document.createElement('div');
    distRow.style.cssText = 'display:flex;gap:8px;margin-bottom:6px;';
    const distInput = document.createElement('input');
    distInput.id = 'locationDistInput';
    distInput.type = 'text';
    distInput.placeholder = '例如：1200';
    distInput.maxLength = 20;
    distInput.style.cssText = 'flex:1;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;transition:border-color 0.2s;';
    distInput.onfocus = () => { distInput.style.borderColor = '#999'; };
    distInput.onblur = () => { distInput.style.borderColor = '#e0e0e0'; };
    const unitInput = document.createElement('input');
    unitInput.id = 'locationUnitInput';
    unitInput.type = 'text';
    unitInput.placeholder = '单位';
    unitInput.value = 'km';
    unitInput.maxLength = 10;
    unitInput.style.cssText = 'width:70px;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;transition:border-color 0.2s;text-align:center;';
    unitInput.onfocus = () => { unitInput.style.borderColor = '#999'; };
    unitInput.onblur = () => { unitInput.style.borderColor = '#e0e0e0'; };
    distRow.appendChild(distInput);
    distRow.appendChild(unitInput);

    body.appendChild(addrLabel);
    body.appendChild(addrInput);
    body.appendChild(coordLabel);
    body.appendChild(coordInput);
    body.appendChild(distLabel);
    body.appendChild(distRow);

    // 按钮区域
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:8px 24px 20px;display:flex;gap:10px;';

    const cancelBtn = document.createElement('button');
    cancelBtn.style.cssText = 'flex:1;padding:13px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;transition:all 0.15s;';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeLocationModal(overlay, card);

    const sendBtn = document.createElement('button');
    sendBtn.style.cssText = 'flex:1;padding:13px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;transition:all 0.15s;';
    sendBtn.textContent = '发送';
    sendBtn.onclick = () => sendLocationMessage(overlay, card);

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
        if (e.target === overlay) closeLocationModal(overlay, card);
    });

    setTimeout(() => addrInput.focus(), 400);
}

// 关闭定位弹窗
function closeLocationModal(overlay, card) {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.opacity = '0';
    setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
}

// 发送定位消息
async function sendLocationMessage(overlay, card) {
    const addr = document.getElementById('locationAddrInput').value.trim();
    if (!addr) {
        showIosAlert('提示', '请输入地址');
        return;
    }
    const coord = document.getElementById('locationCoordInput').value.trim();
    const dist = document.getElementById('locationDistInput').value.trim();
    const unit = document.getElementById('locationUnitInput').value.trim();

    if (!currentChatCharacter) return;

    closeLocationModal(overlay, card);

    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[位置]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'location',
        locationAddress: addr,
        locationCoord: coord || '',
        locationDistance: dist || '',
        locationUnit: unit || ''
    };

    appendLocationMessageToChat(messageObj);
    await saveMessageToDB(messageObj);
    await updateChatListLastMessage(currentChatCharacter.id, '[位置]', messageObj.timestamp);
    scrollChatToBottom();
}

// 渲染定位消息到聊天界面
function appendLocationMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');

    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();

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
    const addr = messageObj.locationAddress || '';
    const coord = messageObj.locationCoord || '';
    const dist = messageObj.locationDistance || '';
    const unit = messageObj.locationUnit || '';

    // 构建可选信息
    let metaHtml = '';
    if (coord) {
        metaHtml += `<span class="chat-location-coord">${escapeHtml(coord)}</span>`;
    }
    if (dist) {
        metaHtml += `<span class="chat-location-distance">${escapeHtml(dist)}${unit ? ' ' + escapeHtml(unit) : ''}</span>`;
    }

    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-location-bubble">
                <div class="chat-location-map">
                    <div class="chat-location-pin">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="#e74c3c" stroke="none">
                            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
                        </svg>
                        <div class="chat-location-pin-dot"></div>
                    </div>
                </div>
                <div class="chat-location-body">
                    <div class="chat-location-address">${escapeHtml(addr)}</div>
                    ${metaHtml ? `<div class="chat-location-meta">${metaHtml}</div>` : ''}
                </div>
                <div class="chat-location-footer">
                    <span class="chat-location-footer-label">位置信息</span>
                </div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}

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

    // 检查钱包是否冻结
    if (isWalletFrozen()) {
        showIosAlert('转账失败', '您的钱包已被冻结（花呗逾期），请先还清花呗欠款。');
        return;
    }

    // 选择转账途径
    const paySource = await showTransferSourceChoice(amount);
    if (!paySource) return; // 用户取消

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
        transferStatus: 'pending',
        transferSource: paySource // 记录转账来源
    };

    // 扣款
    const data = JSON.parse(localStorage.getItem('walletData') || '{}');
    if (paySource === 'balance') {
        data.balance = Math.round((data.balance - amount) * 100) / 100;
    } else if (paySource === 'huabei') {
        data.huabeiUsed = Math.round((data.huabeiUsed + amount) * 100) / 100;
    } else if (paySource === 'yuebao') {
        data.yuebaoAmount = Math.round((data.yuebaoAmount - amount) * 100) / 100;
    }
    localStorage.setItem('walletData', JSON.stringify(data));

    // 渲染到聊天界面
    appendTransferMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[转账]', messageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();

    // 来源提示
    const sourceNames = { balance: '余额', huabei: '花呗', yuebao: '余额宝' };
    showToast(`已通过${sourceNames[paySource]}转账 ¥${amount.toFixed(2)}`);
}

// 转账来源选择弹窗
function showTransferSourceChoice(amount) {
    return new Promise((resolve) => {
        const data = JSON.parse(localStorage.getItem('walletData') || '{}');
        const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const balanceOk = (data.balance || 0) >= amount;
        const huabeiOk = data.huabeiEnabled && ((data.huabeiTotal - data.huabeiUsed) >= amount) && !data.huabeiFrozen;
        const yuebaoOk = (data.yuebaoAmount || 0) >= amount;

        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.width = '300px';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择支付方式';

        const msgEl = document.createElement('div');
        msgEl.className = 'ios-dialog-message';
        msgEl.textContent = `转账金额：¥${fmt(amount)}`;

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';

        // 余额
        const balBtn = document.createElement('button');
        balBtn.className = 'ios-dialog-button' + (balanceOk ? ' primary' : '');
        balBtn.textContent = `余额 (¥${fmt(data.balance || 0)})`;
        balBtn.style.opacity = balanceOk ? '1' : '0.4';
        balBtn.onclick = () => {
            if (!balanceOk) { showToast('余额不足'); return; }
            close('balance');
        };

        // 花呗
        const hbBtn = document.createElement('button');
        hbBtn.className = 'ios-dialog-button' + (huabeiOk ? ' primary' : '');
        if (data.huabeiEnabled) {
            const remaining = data.huabeiTotal - data.huabeiUsed;
            hbBtn.textContent = data.huabeiFrozen ? '花呗 (已冻结)' : `花呗 (剩余¥${fmt(remaining)})`;
        } else {
            hbBtn.textContent = '花呗 (未开通)';
        }
        hbBtn.style.opacity = huabeiOk ? '1' : '0.4';
        hbBtn.onclick = () => {
            if (data.huabeiFrozen) { showToast('花呗已冻结，请先还款'); return; }
            if (!data.huabeiEnabled) { showToast('花呗未开通'); return; }
            if (!huabeiOk) { showToast('花呗额度不足'); return; }
            close('huabei');
        };

        // 余额宝
        const ybBtn = document.createElement('button');
        ybBtn.className = 'ios-dialog-button' + (yuebaoOk ? ' primary' : '');
        ybBtn.textContent = `余额宝 (¥${fmt(data.yuebaoAmount || 0)})`;
        ybBtn.style.opacity = yuebaoOk ? '1' : '0.4';
        ybBtn.onclick = () => {
            if (!yuebaoOk) { showToast('余额宝资金不足'); return; }
            close('yuebao');
        };

        // 取消
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => close(null);

        buttonsEl.appendChild(balBtn);
        buttonsEl.appendChild(hbBtn);
        buttonsEl.appendChild(ybBtn);
        buttonsEl.appendChild(cancelBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(msgEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('show'), 10);

        function close(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        }
    });
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
        } else if (msg.messageType === 'location') {
            content = `(位置: ${msg.locationAddress || ''})`;
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
                else if (messageObj.messageType === 'location') text = '[位置]';

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

        // 估算总token：模拟实际发送给API的完整内容
        let totalTokens = 0;

        // 1. 系统提示词（人设、世界书、记忆等）
        try {
            const systemPrompt = await buildRolePlaySystemPrompt(currentChatCharacter);
            totalTokens += estimateTokenCount(systemPrompt);
        } catch (e) {
            console.warn('估算系统提示词token失败:', e);
        }

        // 2. 短期记忆范围内的聊天历史（和实际发送给API的一致）
        const memoryLimit = currentChatCharacter.shortTermMemory || 10;
        try {
            const recentMsgs = await getChatHistory(currentChatCharacter.id, memoryLimit);
            recentMsgs.forEach(m => {
                totalTokens += estimateTokenCount(m.content || '');
                if (m.voiceText) totalTokens += estimateTokenCount(m.voiceText);
                if (m.textImageDesc) totalTokens += estimateTokenCount(m.textImageDesc);
                if (m.transferRemark) totalTokens += estimateTokenCount(m.transferRemark);
                if (m.locationAddress) totalTokens += estimateTokenCount(m.locationAddress);
            });
        } catch (e) {
            console.warn('估算聊天历史token失败:', e);
        }

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
            else if (m.messageType === 'location') text = '(位置)';
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
            else if (msg.messageType === 'location') content = `(位置: ${msg.locationAddress || ''})`;
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
                } else if (msg.messageType === 'location') {
                    content = `（位置：${msg.locationAddress || ''}）`;
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

// ========== 方案二：个人资料卡片 + ID卡小组件 ==========

function getScheme2Html() {
    return `
    <!-- 方案二：个人资料卡片（紧凑版） -->
    <div class="s2-profile-card">
        <div class="s2-banner" id="s2Banner" onclick="openS2BannerModal()">
            <div class="s2-banner-placeholder" id="s2BannerPlaceholder">点击设置背景图</div>
            <img id="s2BannerImage" style="display:none;width:100%;height:100%;object-fit:cover;">
        </div>
        <div class="s2-avatar-wrapper" onclick="openS2AvatarModal()">
            <div class="s2-avatar" id="s2Avatar">
                <span id="s2AvatarPlaceholder">头像</span>
                <img id="s2AvatarImage" style="display:none;width:100%;height:100%;object-fit:cover;border-radius:50%;">
            </div>
        </div>
        <div class="s2-info">
            <div class="s2-name" id="s2Name" onclick="openS2NameModal()">Name</div>
            <div class="s2-username" id="s2Username" onclick="openS2UsernameModal()">username</div>
            <div class="s2-bio" id="s2Bio" onclick="openS2BioModal()">点击编辑个性签名</div>
            <div class="s2-location" id="s2Location" onclick="openS2LocationModal()">
                <svg class="s2-location-svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                <span id="s2LocationText">地球</span>
            </div>
        </div>
    </div>

    <!-- 下半区：左边APP + 右边ID卡 -->
    <div class="s2-bottom-row">
        <!-- 左边：4个APP -->
        <div class="s2-app-grid">
            <div class="app-item" onclick="openChatPage()">
                <div class="app-icon" id="appIcon-chat" data-default-text="聊">聊</div>
                <div class="app-name" id="appName-chat" data-default-name="聊天">聊天</div>
            </div>
            <div class="app-item" onclick="openWorldBook()">
                <div class="app-icon" id="appIcon-worldbook" data-default-text="书">书</div>
                <div class="app-name" id="appName-worldbook" data-default-name="世界书">世界书</div>
            </div>
            <div class="app-item" onclick="openWalletPage()">
                <div class="app-icon" id="appIcon-wallet" data-default-text="钱">钱</div>
                <div class="app-name" id="appName-wallet" data-default-name="钱包">钱包</div>
            </div>
            <div class="app-item">
                <div class="app-icon" id="appIcon-couple" data-default-text="情">情</div>
                <div class="app-name" id="appName-couple" data-default-name="情侣空间">情侣空间</div>
            </div>
        </div>

        <!-- 右边：ID卡/工牌小组件 -->
        <div class="s2-idcard" onclick="openS2IdCardModal()">
            <!-- 挂带 -->
            <div class="s2-idcard-strap"></div>
            <!-- 金属夹子 -->
            <div class="s2-idcard-clip">
                <div class="s2-clip-body">
                    <div class="s2-clip-inner"></div>
                    <div class="s2-clip-screw"></div>
                </div>
            </div>
            <!-- 卡片主体 -->
            <div class="s2-idcard-body">
                <!-- 左侧照片区 -->
                <div class="s2-idcard-photo">
                    <div class="s2-idcard-photo-inner" id="s2IdCardPhoto">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                    </div>
                </div>
                <!-- 右侧信息区 -->
                <div class="s2-idcard-info">
                    <div class="s2-idcard-row">
                        <svg class="s2-idcard-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                        <span class="s2-idcard-text" id="s2IdCardName">name</span>
                    </div>
                    <div class="s2-idcard-row">
                        <svg class="s2-idcard-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span class="s2-idcard-text" id="s2IdCardLocation">location</span>
                    </div>
                    <div class="s2-idcard-row">
                        <svg class="s2-idcard-svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                        <span class="s2-idcard-text" id="s2IdCardMotto">motto</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

// 加载方案二数据
async function loadScheme2Data() {
    try {
        const banner = await storageDB.getItem('s2_banner');
        if (banner) {
            document.getElementById('s2BannerImage').src = banner;
            document.getElementById('s2BannerImage').style.display = 'block';
            document.getElementById('s2BannerPlaceholder').style.display = 'none';
        }

        const avatar = await storageDB.getItem('s2_avatar');
        if (avatar) {
            document.getElementById('s2AvatarImage').src = avatar;
            document.getElementById('s2AvatarImage').style.display = 'block';
            document.getElementById('s2AvatarPlaceholder').style.display = 'none';
        }

        const name = await storageDB.getItem('s2_name');
        if (name) document.getElementById('s2Name').textContent = name;

        const username = await storageDB.getItem('s2_username');
        if (username) document.getElementById('s2Username').textContent = username;

        const bio = await storageDB.getItem('s2_bio');
        if (bio) document.getElementById('s2Bio').textContent = bio;

        const location = await storageDB.getItem('s2_location');
        if (location) document.getElementById('s2LocationText').textContent = location;

        // ID卡数据
        const idName = await storageDB.getItem('s2_idcard_name');
        if (idName) document.getElementById('s2IdCardName').textContent = idName;

        const idLocation = await storageDB.getItem('s2_idcard_location');
        if (idLocation) document.getElementById('s2IdCardLocation').textContent = idLocation;

        const idMotto = await storageDB.getItem('s2_idcard_motto');
        if (idMotto) document.getElementById('s2IdCardMotto').textContent = idMotto;

        // ID卡照片
        const idPhoto = await storageDB.getItem('s2_idcard_photo');
        if (idPhoto) {
            const photoEl = document.getElementById('s2IdCardPhoto');
            if (photoEl) photoEl.innerHTML = '<img src="' + idPhoto + '">';
        }

        // 加载APP图标
        await loadAppIcons();
        loadAppNames();
    } catch (e) {
        console.error('加载方案二数据失败:', e);
    }
}

// ===== 方案二编辑弹窗 =====

// 通用图片选择弹窗（支持本地上传和URL）
function openS2ImagePicker(title, compressOpts, callback, onReset) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '280px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = title;

    const body = document.createElement('div');
    body.style.cssText = 'padding: 8px 16px 16px;';

    // URL输入区
    const urlLabel = document.createElement('div');
    urlLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    urlLabel.textContent = '图片链接';
    const urlInput = document.createElement('input');
    urlInput.type = 'text';
    urlInput.placeholder = '粘贴图片URL';
    urlInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:13px;color:#333;outline:none;box-sizing:border-box;';
    urlInput.onfocus = () => { urlInput.style.borderColor = '#007aff'; };
    urlInput.onblur = () => { urlInput.style.borderColor = '#e0e0e0'; };

    const urlBtn = document.createElement('button');
    urlBtn.style.cssText = 'width:100%;padding:10px;margin-top:8px;border:none;border-radius:10px;font-size:14px;font-weight:500;color:#fff;background:#333;cursor:pointer;transition:opacity 0.15s;';
    urlBtn.textContent = '使用链接';
    urlBtn.onclick = async () => {
        const url = urlInput.value.trim();
        if (!url) { showToast('请输入图片链接'); return; }
        closeDialog();
        callback(url);
    };

    // 分隔线
    const divider = document.createElement('div');
    divider.style.cssText = 'display:flex;align-items:center;gap:10px;margin:14px 0;';
    divider.innerHTML = '<div style="flex:1;height:1px;background:#e0e0e0;"></div><span style="font-size:12px;color:#bbb;">或</span><div style="flex:1;height:1px;background:#e0e0e0;"></div>';

    // 本地上传按钮
    const localBtn = document.createElement('button');
    localBtn.style.cssText = 'width:100%;padding:10px;border:1.5px solid #d0d0d0;border-radius:10px;font-size:14px;font-weight:500;color:#333;background:#fff;cursor:pointer;transition:all 0.15s;';
    localBtn.textContent = '本地上传';
    localBtn.onclick = () => {
        const fi = document.createElement('input');
        fi.type = 'file';
        fi.accept = 'image/*';
        fi.onchange = async (ev) => {
            const file = ev.target.files[0];
            if (!file) return;
            try {
                const data = await compressImage(file, compressOpts);
                closeDialog();
                callback(data);
            } catch (err) {
                showToast('图片处理失败');
            }
        };
        fi.click();
    };

    body.appendChild(urlLabel);
    body.appendChild(urlInput);
    body.appendChild(urlBtn);
    body.appendChild(divider);
    body.appendChild(localBtn);

    // 重置按钮
    if (onReset) {
        const resetDivider = document.createElement('div');
        resetDivider.style.cssText = 'margin:14px 0 0;';
        const resetBtn = document.createElement('button');
        resetBtn.style.cssText = 'width:100%;padding:10px;border:1.5px solid #ff3b30;border-radius:10px;font-size:14px;font-weight:500;color:#ff3b30;background:#fff;cursor:pointer;transition:all 0.15s;';
        resetBtn.textContent = '重置为默认';
        resetBtn.onclick = async () => {
            closeDialog();
            const confirmed = await iosConfirm('确定要重置为默认吗？', '重置');
            if (confirmed) onReset();
        };
        body.appendChild(resetDivider);
        body.appendChild(resetBtn);
    }

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    buttonsEl.appendChild(cancelBtn);

    dialog.appendChild(titleEl);
    dialog.appendChild(body);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.classList.add('show'); urlInput.focus(); }, 10);

    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
}

// 背景图
function openS2BannerModal() {
    openS2ImagePicker('设置背景图', { maxWidth: 1200, maxHeight: 600, quality: 0.8, maxSizeKB: 400 }, async (data) => {
        await storageDB.setItem('s2_banner', data);
        document.getElementById('s2BannerImage').src = data;
        document.getElementById('s2BannerImage').style.display = 'block';
        document.getElementById('s2BannerPlaceholder').style.display = 'none';
        showToast('背景图已更新');
    }, async () => {
        await storageDB.removeItem('s2_banner');
        const img = document.getElementById('s2BannerImage');
        const ph = document.getElementById('s2BannerPlaceholder');
        if (img) { img.style.display = 'none'; img.removeAttribute('src'); }
        if (ph) ph.style.display = 'block';
        showToast('背景图已重置');
    });
}

// 头像
function openS2AvatarModal() {
    openS2ImagePicker('设置头像', { maxWidth: 400, maxHeight: 400, quality: 0.8, maxSizeKB: 200 }, async (data) => {
        await storageDB.setItem('s2_avatar', data);
        document.getElementById('s2AvatarImage').src = data;
        document.getElementById('s2AvatarImage').style.display = 'block';
        document.getElementById('s2AvatarPlaceholder').style.display = 'none';
        showToast('头像已更新');
    }, async () => {
        await storageDB.removeItem('s2_avatar');
        const img = document.getElementById('s2AvatarImage');
        const ph = document.getElementById('s2AvatarPlaceholder');
        if (img) { img.style.display = 'none'; img.removeAttribute('src'); }
        if (ph) ph.style.display = 'block';
        showToast('头像已重置');
    });
}

// 名称
function openS2NameModal() {
    iosPrompt('修改名称', document.getElementById('s2Name').textContent, async (val) => {
        val = val.trim();
        if (!val) return;
        await storageDB.setItem('s2_name', val);
        document.getElementById('s2Name').textContent = val;
        showToast('名称已更新');
    });
}

// 用户名
function openS2UsernameModal() {
    iosPrompt('修改用户名', document.getElementById('s2Username').textContent, async (val) => {
        val = val.trim();
        if (!val) return;
        await storageDB.setItem('s2_username', val);
        document.getElementById('s2Username').textContent = val;
        showToast('用户名已更新');
    });
}

// 个性签名
function openS2BioModal() {
    iosPrompt('修改个性签名', document.getElementById('s2Bio').textContent, async (val) => {
        val = val.trim();
        if (!val) return;
        await storageDB.setItem('s2_bio', val);
        document.getElementById('s2Bio').textContent = val;
        showToast('签名已更新');
    });
}

// 位置
function openS2LocationModal() {
    iosPrompt('修改位置', document.getElementById('s2LocationText').textContent, async (val) => {
        val = val.trim();
        if (!val) return;
        await storageDB.setItem('s2_location', val);
        document.getElementById('s2LocationText').textContent = val;
        showToast('位置已更新');
    });
}

// ID卡编辑弹窗
function openS2IdCardModal() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '编辑ID卡';

    const body = document.createElement('div');
    body.style.cssText = 'padding: 8px 16px 16px;';

    // 照片上传
    const photoLabel = document.createElement('div');
    photoLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    photoLabel.textContent = '卡片照片';
    const photoBtn = document.createElement('div');
    photoBtn.style.cssText = 'width:100%;padding:10px 12px;border:1.5px dashed #d0d0d0;border-radius:10px;font-size:13px;color:#999;text-align:center;cursor:pointer;margin-bottom:12px;transition:border-color 0.2s;';
    photoBtn.textContent = '点击上传照片';
    photoBtn.onclick = () => {
        closeDialog();
        openS2ImagePicker('设置卡片照片', { maxWidth: 200, maxHeight: 400, quality: 0.8, maxSizeKB: 150 }, async (data) => {
            await storageDB.setItem('s2_idcard_photo', data);
            const photoEl = document.getElementById('s2IdCardPhoto');
            if (photoEl) photoEl.innerHTML = '<img src="' + data + '">';
            showToast('照片已更新');
            // 重新打开ID卡编辑弹窗
            openS2IdCardModal();
        }, async () => {
            await storageDB.removeItem('s2_idcard_photo');
            const photoEl = document.getElementById('s2IdCardPhoto');
            if (photoEl) photoEl.innerHTML = '📷';
            showToast('卡片照片已重置');
            openS2IdCardModal();
        });
    };

    // 名称输入
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    nameLabel.textContent = '名称';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = document.getElementById('s2IdCardName').textContent;
    nameInput.maxLength = 20;
    nameInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    nameInput.onfocus = () => { nameInput.style.borderColor = '#007aff'; };
    nameInput.onblur = () => { nameInput.style.borderColor = '#e0e0e0'; };

    // 位置输入
    const locLabel = document.createElement('div');
    locLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    locLabel.textContent = '位置';
    const locInput = document.createElement('input');
    locInput.type = 'text';
    locInput.value = document.getElementById('s2IdCardLocation').textContent;
    locInput.maxLength = 30;
    locInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    locInput.onfocus = () => { locInput.style.borderColor = '#007aff'; };
    locInput.onblur = () => { locInput.style.borderColor = '#e0e0e0'; };

    // 座右铭输入
    const mottoLabel = document.createElement('div');
    mottoLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    mottoLabel.textContent = '座右铭';
    const mottoInput = document.createElement('input');
    mottoInput.type = 'text';
    mottoInput.value = document.getElementById('s2IdCardMotto').textContent;
    mottoInput.maxLength = 50;
    mottoInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;';
    mottoInput.onfocus = () => { mottoInput.style.borderColor = '#007aff'; };
    mottoInput.onblur = () => { mottoInput.style.borderColor = '#e0e0e0'; };

    body.appendChild(photoLabel);
    body.appendChild(photoBtn);
    body.appendChild(nameLabel);
    body.appendChild(nameInput);
    body.appendChild(locLabel);
    body.appendChild(locInput);
    body.appendChild(mottoLabel);
    body.appendChild(mottoInput);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    const okBtn = document.createElement('button');
    okBtn.className = 'ios-dialog-button primary';
    okBtn.textContent = '保存';
    okBtn.onclick = async () => {
        const n = nameInput.value.trim();
        const l = locInput.value.trim();
        const m = mottoInput.value.trim();
        if (n) { await storageDB.setItem('s2_idcard_name', n); document.getElementById('s2IdCardName').textContent = n; }
        if (l) { await storageDB.setItem('s2_idcard_location', l); document.getElementById('s2IdCardLocation').textContent = l; }
        if (m) { await storageDB.setItem('s2_idcard_motto', m); document.getElementById('s2IdCardMotto').textContent = m; }
        showToast('ID卡已更新');
        closeDialog();
    };

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(okBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(body);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.classList.add('show'); nameInput.focus(); }, 10);

    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => { document.body.removeChild(overlay); }, 300);
    }
}

// ========== 钱包功能 ==========

let walletBalanceHidden = false;

// 打开钱包页面
function openWalletPage() {
    const page = document.getElementById('walletPage');
    if (page) {
        page.classList.add('active');
        loadWalletData();
    }
}

// 关闭钱包页面
function closeWalletPage() {
    const page = document.getElementById('walletPage');
    if (page) {
        page.classList.remove('active');
    }
}

// 钱包默认数据
const WALLET_DEFAULTS = {
    balance: 5200,
    huabeiEnabled: false,
    huabeiTotal: 0,
    huabeiUsed: 0,
    huabeiRepayDay: 6,       // 每月还款日，默认6号
    huabeiMinRepay: 10,      // 最低还款比例(%)，默认10%
    huabeiOverdue: false,    // 是否逾期
    huabeiFrozen: false,     // 是否冻结（征信问题）
    huabeiLastRepayMonth: '', // 上次还款月份 'YYYY-MM'
    yuebaoAmount: 0,
    yuebaoEarn: 0,
    yuebaoRate: 2.35,
    yuebaoTotalEarn: 0,      // 累计收益
    yuebaoLastUpdate: '',    // 上次计算利息的日期 'YYYY-MM-DD'
    bankCards: []
};

// 加载钱包数据
function loadWalletData() {
    let data = JSON.parse(localStorage.getItem('walletData') || 'null');

    if (!data) {
        data = Object.assign({}, WALLET_DEFAULTS);
        localStorage.setItem('walletData', JSON.stringify(data));
    }

    // 补齐旧数据中缺失的字段
    let patched = false;
    if (!('huabeiEnabled' in data)) {
        // 旧版数据，重置为新默认值
        data = Object.assign({}, WALLET_DEFAULTS);
        patched = true;
    }
    for (const key in WALLET_DEFAULTS) {
        if (!(key in data)) {
            data[key] = WALLET_DEFAULTS[key];
            patched = true;
        }
    }
    if (patched) localStorage.setItem('walletData', JSON.stringify(data));

    // 检查花呗逾期
    checkHuabeiOverdue();
    // 计算余额宝利息
    calculateYuebaoInterest();
    data = JSON.parse(localStorage.getItem('walletData'));

    updateWalletUI(data);
}

// 更新钱包UI
function updateWalletUI(data) {
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const balEl = document.getElementById('walletBalanceAmount');
    if (balEl) balEl.textContent = walletBalanceHidden ? '****' : fmt(data.balance);

    // 冻结提示
    let frozenBanner = document.getElementById('walletFrozenBanner');
    if (data.huabeiFrozen) {
        if (!frozenBanner) {
            frozenBanner = document.createElement('div');
            frozenBanner.id = 'walletFrozenBanner';
            frozenBanner.style.cssText = 'margin:0 16px 10px;padding:10px 16px;background:#fff5f5;border-radius:10px;border:1px solid #ffe0e0;font-size:12px;color:#e53e3e;display:flex;align-items:center;gap:6px;';
            frozenBanner.innerHTML = '钱包已冻结：花呗逾期未还款，部分功能受限';
            const walletInner = document.querySelector('.wallet-page-inner');
            const balCard = document.querySelector('.wallet-balance-card');
            if (walletInner && balCard) {
                walletInner.insertBefore(frozenBanner, balCard.nextSibling);
            }
        }
    } else if (frozenBanner) {
        frozenBanner.remove();
    }

    // 花呗区域
    const huabeiSection = document.getElementById('walletHuabeiSection');
    if (huabeiSection) {
        if (data.huabeiEnabled) {
            huabeiSection.innerHTML = `
                <div class="wallet-section-header">
                    <span class="wallet-section-title">花呗</span>
                    <span class="wallet-section-more" onclick="openHuabei()">查看详情 ></span>
                </div>
                <div class="wallet-section-body">
                    <div class="wallet-huabei-row">
                        <div class="wallet-huabei-item">
                            <div class="wallet-huabei-label">总额度</div>
                            <div class="wallet-huabei-value">${fmt(data.huabeiTotal)}</div>
                        </div>
                        <div class="wallet-huabei-divider"></div>
                        <div class="wallet-huabei-item">
                            <div class="wallet-huabei-label">剩余额度</div>
                            <div class="wallet-huabei-value">${fmt(data.huabeiTotal - data.huabeiUsed)}</div>
                        </div>
                        <div class="wallet-huabei-divider"></div>
                        <div class="wallet-huabei-item">
                            <div class="wallet-huabei-label">本月待还</div>
                            <div class="wallet-huabei-value wallet-huabei-due">${fmt(data.huabeiUsed)}</div>
                        </div>
                    </div>
                </div>`;
        } else {
            huabeiSection.innerHTML = `
                <div class="wallet-section-header">
                    <span class="wallet-section-title">花呗</span>
                </div>
                <div class="wallet-section-body">
                    <div class="wallet-empty-state">
                        <div class="wallet-empty-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        </div>
                        <div class="wallet-empty-text">花呗尚未开通</div>
                        <button class="wallet-activate-btn" onclick="activateHuabei()">立即开通</button>
                    </div>
                </div>`;
        }
    }

    // 余额宝区域
    const yuebaoSection = document.getElementById('walletYuebaoSection');
    if (yuebaoSection) {
        if (data.yuebaoAmount > 0) {
            yuebaoSection.innerHTML = `
                <div class="wallet-section-header">
                    <span class="wallet-section-title">余额宝</span>
                    <span class="wallet-section-more" onclick="openYuebao()">查看详情 ></span>
                </div>
                <div class="wallet-section-body">
                    <div class="wallet-yuebao-info">
                        <div class="wallet-yuebao-main">
                            <div class="wallet-yuebao-label">总金额</div>
                            <div class="wallet-yuebao-amount">${fmt(data.yuebaoAmount)}</div>
                        </div>
                        <div class="wallet-yuebao-right">
                            <div class="wallet-yuebao-label">昨日收益</div>
                            <div class="wallet-yuebao-earn">+${fmt(data.yuebaoEarn)}</div>
                        </div>
                    </div>
                    <div class="wallet-yuebao-bar-wrap">
                        <div class="wallet-yuebao-bar">
                            <div class="wallet-yuebao-bar-fill" style="width:${Math.min(data.yuebaoRate / 5 * 100, 100)}%;"></div>
                        </div>
                        <div class="wallet-yuebao-bar-label">七日年化 <span>${data.yuebaoRate}%</span></div>
                    </div>
                </div>`;
        } else {
            yuebaoSection.innerHTML = `
                <div class="wallet-section-header">
                    <span class="wallet-section-title">余额宝</span>
                </div>
                <div class="wallet-section-body">
                    <div class="wallet-empty-state">
                        <div class="wallet-empty-icon">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        </div>
                        <div class="wallet-empty-text">余额宝暂无资金</div>
                        <button class="wallet-activate-btn" onclick="transferToYuebao()">转入余额宝</button>
                    </div>
                </div>`;
        }
    }

    // 小荷包区域
    const xiaoheSection = document.getElementById('walletXiaoheSection');
    if (xiaoheSection) {
        xiaoheSection.innerHTML = `
            <div class="wallet-section-header">
                <span class="wallet-section-title">小荷包</span>
            </div>
            <div class="wallet-section-body">
                <div class="wallet-empty-state">
                    <div class="wallet-empty-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z"/></svg>
                    </div>
                    <div class="wallet-empty-text">小荷包功能即将上线</div>
                    <button class="wallet-activate-btn" onclick="openXiaohe()">敬请期待</button>
                </div>
            </div>`;
    }

    // 银行卡区域
    const bankSection = document.getElementById('walletBankCardList');
    if (bankSection) {
        const cards = data.bankCards || [];
        if (cards.length > 0) {
            const bankColors = ['#e8f0fe', '#fef3e8', '#f0fdf4', '#fdf2f8'];
            const bankStroke = ['#3b7ddd', '#e8910d', '#22a06b', '#d946a8'];
            bankSection.innerHTML = cards.map((card, i) => `
                <div class="wallet-bankcard" onclick="openBankCardDetail(${i})">
                    <div class="wallet-bankcard-icon" style="background:${bankColors[i % 4]};color:${bankStroke[i % 4]};">
                        ${card.image
                            ? `<img src="${card.image}" style="width:40px;height:40px;border-radius:10px;object-fit:cover;">`
                            : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
                        }
                    </div>
                    <div class="wallet-bankcard-info">
                        <div class="wallet-bankcard-name">${card.name}</div>
                        <div class="wallet-bankcard-num">尾号 ${card.tail} · 余额 ¥${card.balance.toLocaleString('zh-CN', {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
                    </div>
                    <div class="wallet-bankcard-type">${card.type}</div>
                </div>`).join('');
        } else {
            bankSection.innerHTML = `
                <div class="wallet-empty-state wallet-empty-state-sm">
                    <div class="wallet-empty-text">暂无绑定的银行卡</div>
                </div>`;
        }
    }
}

// 切换余额显示/隐藏
function toggleWalletBalance() {
    walletBalanceHidden = !walletBalanceHidden;
    const eyeEl = document.getElementById('walletBalanceEye');
    if (eyeEl) {
        eyeEl.innerHTML = walletBalanceHidden
            ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>'
            : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>';
    }
    loadWalletData();
}

// 充值
function walletRecharge() {
    if (isWalletFrozen()) {
        showIosAlert('操作受限', '您的钱包已被冻结（花呗逾期），充值后资金将优先用于还款。');
    }
    iosPrompt('充值金额', '', (val) => {
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        const data = JSON.parse(localStorage.getItem('walletData'));
        data.balance = Math.round((data.balance + amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        updateWalletUI(data);
        showToast('充值成功 +' + amount.toFixed(2));
    });
}

// 提现
function walletWithdraw() {
    if (isWalletFrozen()) {
        showIosAlert('操作受限', '您的钱包已被冻结（花呗逾期），请先还清花呗欠款后再提现。');
        return;
    }
    iosPrompt('提现金额', '', (val) => {
        const amount = parseFloat(val);
        const data = JSON.parse(localStorage.getItem('walletData'));
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        if (amount > data.balance) {
            showIosAlert('提示', '余额不足');
            return;
        }
        data.balance = Math.round((data.balance - amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        updateWalletUI(data);
        showToast('提现成功 -' + amount.toFixed(2));
    });
}

// 花呗详情
function openHuabei() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (!data.huabeiEnabled) {
        activateHuabei();
        return;
    }
    // 先检查逾期
    checkHuabeiOverdue();
    showHuabeiDetailPage();
}

// 检查花呗是否逾期
function checkHuabeiOverdue() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (!data || !data.huabeiEnabled || data.huabeiUsed <= 0) return;

    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const repayDay = data.huabeiRepayDay || 6;

    // 如果本月已过还款日，且本月未还款，且有待还金额
    if (now.getDate() > repayDay && data.huabeiLastRepayMonth !== currentMonth && data.huabeiUsed > 0) {
        data.huabeiOverdue = true;
        data.huabeiFrozen = true;
        localStorage.setItem('walletData', JSON.stringify(data));
    }
}

// 检查钱包是否被冻结（供外部调用）
function isWalletFrozen() {
    const data = JSON.parse(localStorage.getItem('walletData') || '{}');
    return data.huabeiFrozen === true;
}

// 显示花呗详情页
function showHuabeiDetailPage() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const remaining = data.huabeiTotal - data.huabeiUsed;
    const repayDay = data.huabeiRepayDay || 6;
    const minRepay = data.huabeiMinRepay || 10;
    const minRepayAmount = Math.round(data.huabeiUsed * minRepay / 100 * 100) / 100;

    // 创建全屏页面
    let page = document.getElementById('huabeiDetailPage');
    if (!page) {
        page = document.createElement('div');
        page.id = 'huabeiDetailPage';
        page.className = 'settings-page';
        document.body.appendChild(page);
    }

    const overdueHtml = data.huabeiOverdue ? `
        <div style="margin:0 16px 14px;padding:14px 18px;background:#fff5f5;border-radius:14px;border:1px solid #ffe0e0;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:15px;font-weight:600;color:#e53e3e;">账户已逾期</span>
            </div>
            <div style="font-size:12px;color:#e53e3e;line-height:1.6;">
                您的花呗已逾期未还款，钱包功能已被冻结。<br>请尽快还款以恢复正常使用。
            </div>
        </div>` : '';

    page.innerHTML = `
        <div class="wallet-page-inner">
            <div class="wallet-header">
                <div class="wallet-back-btn" onclick="closeHuabeiDetail()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <div class="wallet-header-title">花呗</div>
                <div style="width:40px;"></div>
            </div>

            ${overdueHtml}

            <!-- 额度概览 -->
            <div style="margin:16px;padding:24px 20px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:13px;color:#999;margin-bottom:8px;">剩余额度(元)</div>
                    <div style="font-size:36px;font-weight:700;color:${remaining > 0 ? '#222' : '#e53e3e'};font-variant-numeric:tabular-nums;">${fmt(remaining)}</div>
                </div>
                <div class="wallet-huabei-row">
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">总额度</div>
                        <div class="wallet-huabei-value">${fmt(data.huabeiTotal)}</div>
                    </div>
                    <div class="wallet-huabei-divider"></div>
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">已使用</div>
                        <div class="wallet-huabei-value" style="color:#e8910d;">${fmt(data.huabeiUsed)}</div>
                    </div>
                    <div class="wallet-huabei-divider"></div>
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">待还款</div>
                        <div class="wallet-huabei-value wallet-huabei-due">${fmt(data.huabeiUsed)}</div>
                    </div>
                </div>
            </div>

            <!-- 还款信息 -->
            <div style="margin:0 16px 14px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="padding:16px 18px 0;">
                    <div style="font-size:16px;font-weight:600;color:#222;">还款信息</div>
                </div>
                <div style="padding:14px 18px 18px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">每月还款日</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">每月${repayDay}号</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">最低还款比例</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">${minRepay}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">
                        <span style="font-size:14px;color:#666;">最低还款金额</span>
                        <span style="font-size:14px;font-weight:500;color:#e8910d;">¥${fmt(minRepayAmount)}</span>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div style="margin:0 16px 14px;display:flex;flex-direction:column;gap:10px;">
                <button onclick="huabeiRepay()" style="width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;">立即还款</button>
                <button onclick="openHuabeiSettings()" style="width:100%;padding:14px;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;">还款设置</button>
                <button onclick="closeHuabeiService()" style="width:100%;padding:14px;border:1.5px solid #e8910d;border-radius:12px;font-size:15px;font-weight:500;color:#e8910d;background:#fff;cursor:pointer;">关闭花呗</button>
            </div>

            <div style="height:40px;"></div>
        </div>
    `;

    page.classList.add('active');
}

// 关闭花呗详情
function closeHuabeiDetail() {
    const page = document.getElementById('huabeiDetailPage');
    if (page) page.classList.remove('active');
    // 刷新钱包UI
    loadWalletData();
}

// 关闭花呗服务
async function closeHuabeiService() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (data.huabeiUsed > 0) {
        showIosAlert('无法关闭', '您还有未还清的花呗账单，请先还清所有欠款后再关闭花呗。');
        return;
    }
    const ok = await iosConfirm('关闭后花呗额度将被清零，如需使用需重新开通。确认关闭？', '关闭花呗');
    if (!ok) return;
    data.huabeiEnabled = false;
    data.huabeiTotal = 0;
    data.huabeiUsed = 0;
    data.huabeiOverdue = false;
    data.huabeiFrozen = false;
    data.huabeiLastRepayMonth = '';
    localStorage.setItem('walletData', JSON.stringify(data));
    showToast('花呗已关闭');
    closeHuabeiDetail();
}

// 花呗还款
async function huabeiRepay() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (data.huabeiUsed <= 0) {
        showToast('当前无需还款');
        return;
    }

    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const minRepay = data.huabeiMinRepay || 10;
    const minAmount = Math.max(0.01, Math.round(data.huabeiUsed * minRepay / 100 * 100) / 100);

    // 选择还款方式
    const choice = await showHuabeiRepayChoice(data, fmt);
    if (!choice) return;

    iosPrompt(`还款金额（最低¥${fmt(minAmount)}）`, data.huabeiUsed.toFixed(2), async (val) => {
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        if (amount < minAmount) {
            showIosAlert('提示', `还款金额不能低于最低还款额 ¥${fmt(minAmount)}`);
            return;
        }
        if (amount > data.huabeiUsed) {
            showIosAlert('提示', '还款金额不能超过待还金额');
            return;
        }

        // 检查还款来源余额
        if (choice === 'balance') {
            if (amount > data.balance) {
                showIosAlert('提示', '余额不足');
                return;
            }
            data.balance = Math.round((data.balance - amount) * 100) / 100;
        } else if (choice === 'yuebao') {
            if (amount > data.yuebaoAmount) {
                showIosAlert('提示', '余额宝资金不足');
                return;
            }
            data.yuebaoAmount = Math.round((data.yuebaoAmount - amount) * 100) / 100;
        }

        data.huabeiUsed = Math.round((data.huabeiUsed - amount) * 100) / 100;
        if (data.huabeiUsed <= 0) {
            data.huabeiUsed = 0;
            data.huabeiOverdue = false;
            data.huabeiFrozen = false;
        }

        // 记录还款月份
        const now = new Date();
        data.huabeiLastRepayMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        localStorage.setItem('walletData', JSON.stringify(data));
        showToast('还款成功 ¥' + fmt(amount));
        showHuabeiDetailPage(); // 刷新页面
    });
}

// 花呗还款来源选择
function showHuabeiRepayChoice(data, fmt) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.width = '300px';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择还款来源';

        const msgEl = document.createElement('div');
        msgEl.className = 'ios-dialog-message';
        msgEl.textContent = `余额: ¥${fmt(data.balance)}\n余额宝: ¥${fmt(data.yuebaoAmount)}`;

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';

        const balBtn = document.createElement('button');
        balBtn.className = 'ios-dialog-button primary';
        balBtn.textContent = `余额还款 (¥${fmt(data.balance)})`;
        balBtn.onclick = () => close('balance');

        const yueBtn = document.createElement('button');
        yueBtn.className = 'ios-dialog-button primary';
        yueBtn.textContent = `余额宝还款 (¥${fmt(data.yuebaoAmount)})`;
        yueBtn.onclick = () => close('yuebao');

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => close(null);

        buttonsEl.appendChild(balBtn);
        buttonsEl.appendChild(yueBtn);
        buttonsEl.appendChild(cancelBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(msgEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('show'), 10);

        function close(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        }
    });
}

// 花呗设置
function openHuabeiSettings() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const repayDay = data.huabeiRepayDay || 6;
    const minRepay = data.huabeiMinRepay || 10;

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '还款设置';

    const formWrap = document.createElement('div');
    formWrap.style.cssText = 'padding:12px 16px 16px;';

    // 还款日选择
    const dayLabel = document.createElement('div');
    dayLabel.style.cssText = 'font-size:13px;color:#999;margin-bottom:6px;';
    dayLabel.textContent = '每月还款日';
    const daySelect = document.createElement('select');
    daySelect.id = 'huabeiRepayDaySelect';
    daySelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:14px;background:#fff;';
    for (let i = 1; i <= 28; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `每月${i}号`;
        if (i === repayDay) opt.selected = true;
        daySelect.appendChild(opt);
    }

    // 最低还款比例
    const minLabel = document.createElement('div');
    minLabel.style.cssText = 'font-size:13px;color:#999;margin-bottom:6px;';
    minLabel.textContent = '最低还款比例';
    const minSelect = document.createElement('select');
    minSelect.id = 'huabeiMinRepaySelect';
    minSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;background:#fff;';
    [5, 10, 15, 20, 30, 50].forEach(v => {
        const opt = document.createElement('option');
        opt.value = v;
        opt.textContent = `${v}%`;
        if (v === minRepay) opt.selected = true;
        minSelect.appendChild(opt);
    });

    formWrap.appendChild(dayLabel);
    formWrap.appendChild(daySelect);
    formWrap.appendChild(minLabel);
    formWrap.appendChild(minSelect);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ios-dialog-button primary';
    saveBtn.textContent = '保存';
    saveBtn.onclick = () => {
        const newDay = parseInt(document.getElementById('huabeiRepayDaySelect').value);
        const newMin = parseInt(document.getElementById('huabeiMinRepaySelect').value);
        const d = JSON.parse(localStorage.getItem('walletData'));
        d.huabeiRepayDay = newDay;
        d.huabeiMinRepay = newMin;
        localStorage.setItem('walletData', JSON.stringify(d));
        closeDialog();
        showToast('设置已保存');
        showHuabeiDetailPage(); // 刷新
    };

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(saveBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(formWrap);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => overlay.classList.add('show'), 10);

    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    }
}

// 根据用户人设和余额计算花呗额度
function calculateHuabeiQuota() {
    // 获取用户人设描述
    let userDesc = '';
    let userName = '';
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userDesc = (userData.description || '').toLowerCase();
            userName = userData.name || '';
        }
    } catch (e) {}

    // 也检查personas中标记为ID卡的人设
    try {
        const personasData = localStorage.getItem('personas');
        if (personasData) {
            const allPersonas = JSON.parse(personasData);
            const idCard = allPersonas.find(p => p.isIdCard === true);
            if (idCard && idCard.description) {
                userDesc += ' ' + idCard.description.toLowerCase();
            }
        }
    } catch (e) {}

    // 获取钱包余额
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const balance = walletData.balance || 0;

    // ===== 人设关键词分析 =====
    // 富裕关键词
    const richKeywords = ['富', '有钱', '土豪', '富豪', '老板', '总裁', 'ceo', '董事', '企业家',
        '百万', '千万', '亿', '豪车', '豪宅', '别墅', '奢侈', '贵族', '名媛', '富二代',
        '继承', '财阀', '大佬', '巨富', '首富', '资产', '投资人', '金融'];
    // 中产关键词
    const middleKeywords = ['白领', '程序员', '工程师', '医生', '律师', '教师', '老师', '公务员',
        '经理', '主管', '设计师', '会计', '上班族', '职员', '中产', '小康', '稳定'];
    // 贫穷关键词
    const poorKeywords = ['穷', '没钱', '贫', '打工', '底层', '月光', '负债', '欠债', '破产',
        '失业', '流浪', '乞丐', '困难', '拮据', '窘迫', '落魄', '潦倒', '屌丝', '社畜'];
    // 学生关键词
    const studentKeywords = ['学生', '大学', '高中', '初中', '小学', '校园', '读书', '学校',
        '毕业', '在校', '研究生', '博士', '本科', '专科'];

    let personaScore = 50; // 默认中等 (0-100)

    // 计算人设得分
    richKeywords.forEach(kw => { if (userDesc.includes(kw)) personaScore += 15; });
    middleKeywords.forEach(kw => { if (userDesc.includes(kw)) personaScore += 5; });
    poorKeywords.forEach(kw => { if (userDesc.includes(kw)) personaScore -= 15; });
    studentKeywords.forEach(kw => { if (userDesc.includes(kw)) personaScore -= 8; });

    // 限制范围
    personaScore = Math.max(5, Math.min(100, personaScore));

    // ===== 余额因子 =====
    let balanceFactor;
    if (balance >= 100000) balanceFactor = 1.0;
    else if (balance >= 50000) balanceFactor = 0.85;
    else if (balance >= 10000) balanceFactor = 0.7;
    else if (balance >= 5000) balanceFactor = 0.5;
    else if (balance >= 1000) balanceFactor = 0.35;
    else if (balance >= 100) balanceFactor = 0.2;
    else balanceFactor = 0.1;

    // ===== 综合计算额度 =====
    // 基础额度范围：500 ~ 200000
    const baseQuota = (personaScore / 100) * 150000 + 500;
    let finalQuota = baseQuota * balanceFactor;

    // 加一点随机浮动 (±10%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    finalQuota = finalQuota * randomFactor;

    // 取整到百
    finalQuota = Math.round(finalQuota / 100) * 100;

    // 最低500，最高200000
    finalQuota = Math.max(500, Math.min(200000, finalQuota));

    return {
        quota: finalQuota,
        personaScore: personaScore,
        balance: balance,
        hasPersona: userDesc.trim().length > 0
    };
}

// 开通花呗 — 弹出选择方式
async function activateHuabei() {
    // 创建选择弹窗：AI评估 or 随机额度
    const choice = await showHuabeiActivateChoice();
    if (!choice) return; // 用户取消

    let quota = 0;

    if (choice === 'ai') {
        // ===== AI 评估模式 =====
        quota = await getHuabeiQuotaFromAI();
        if (quota === null) return; // 用户取消或失败
    } else {
        // ===== 随机额度模式 =====
        const presets = [500, 1000, 1500, 2000, 3000, 5000, 8000, 10000, 15000, 20000, 30000, 50000, 80000, 100000, 150000, 200000];
        quota = presets[Math.floor(Math.random() * presets.length)];
    }

    // 确认开通
    const ok = await iosConfirm(`预计可获得额度：¥${quota.toLocaleString()}\n\n确认开通花呗？`, '开通花呗');
    if (ok) {
        const data = JSON.parse(localStorage.getItem('walletData'));
        data.huabeiEnabled = true;
        data.huabeiTotal = quota;
        data.huabeiUsed = 0;
        localStorage.setItem('walletData', JSON.stringify(data));
        updateWalletUI(data);
        showToast('花呗开通成功，额度 ¥' + quota.toLocaleString());
    }
}

// 花呗开通方式选择弹窗
function showHuabeiActivateChoice() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.width = '300px';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '开通花呗';

        const msgEl = document.createElement('div');
        msgEl.className = 'ios-dialog-message';
        msgEl.textContent = '请选择额度生成方式';

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';

        // AI评估按钮
        const aiBtn = document.createElement('button');
        aiBtn.className = 'ios-dialog-button primary';
        aiBtn.innerHTML = 'AI智能评估';
        aiBtn.onclick = () => close('ai');

        // 随机额度按钮
        const randomBtn = document.createElement('button');
        randomBtn.className = 'ios-dialog-button primary';
        randomBtn.innerHTML = '随机额度';
        randomBtn.onclick = () => close('random');

        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => close(null);

        buttonsEl.appendChild(aiBtn);
        buttonsEl.appendChild(randomBtn);
        buttonsEl.appendChild(cancelBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(msgEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);

        setTimeout(() => overlay.classList.add('show'), 10);

        function close(result) {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve(result);
            }, 300);
        }
    });
}

// 通过AI API评估花呗额度
async function getHuabeiQuotaFromAI() {
    // 获取API设置
    const settings = await getSummaryApiSettings();
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        await showIosAlert('提示', 'API未配置，请先在设置中配置API');
        return null;
    }

    // 收集用户信息
    let userDesc = '';
    let userName = '';
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            userDesc = userData.description || '';
            userName = userData.name || '';
        }
    } catch (e) {}

    try {
        const personasData = localStorage.getItem('personas');
        if (personasData) {
            const allPersonas = JSON.parse(personasData);
            const idCard = allPersonas.find(p => p.isIdCard === true);
            if (idCard && idCard.description) {
                userDesc += '\n' + idCard.description;
            }
        }
    } catch (e) {}

    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const balance = walletData.balance || 0;

    const prompt = `你是一个花呗额度评估系统。请根据以下用户信息，给出一个合理的花呗额度数字（单位：元）。

用户名称：${userName || '未知'}
用户人设描述：${userDesc || '无'}
账户余额：¥${balance.toFixed(2)}

规则：
- 额度范围：500 ~ 200000
- 额度必须是100的整数倍
- 根据用户的身份、职业、经济状况等综合判断
- 余额越高，额度倾向越高
- 如果人设描述为空，主要参考余额

请只回复一个纯数字，不要包含任何其他文字、符号或解释。例如：15000`;

    // 显示加载提示
    showToast('AI正在评估您的额度...');

    try {
        let response;
        const provider = settings.provider || '';

        if (provider === 'hakimi') {
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.7, maxOutputTokens: 50 }
                })
            });
        } else if (provider === 'claude') {
            response = await fetch(`${settings.apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': settings.apiKey,
                    'anthropic-version': '2023-06-01',
                    'anthropic-dangerous-direct-browser-access': 'true'
                },
                body: JSON.stringify({
                    model: settings.model,
                    max_tokens: 50,
                    temperature: 0.7,
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
                    temperature: 0.7,
                    max_tokens: 50,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
        }

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();
        console.log('花呗AI返回原始数据:', JSON.stringify(data));
        let text = '';

        if (provider === 'hakimi') {
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else if (provider === 'claude') {
            text = data.content?.[0]?.text || '';
        } else {
            // 兼容更多格式
            text = data.choices?.[0]?.message?.content
                || data.choices?.[0]?.text
                || data.result?.text
                || data.output?.text
                || (typeof data.result === 'string' ? data.result : '')
                || (typeof data.output === 'string' ? data.output : '')
                || '';
        }

        console.log('花呗AI解析文本:', text);

        // 从回复中提取数字（更宽松的匹配）
        const match = text.replace(/,/g, '').match(/\d+/);
        if (match) {
            let quota = parseInt(match[0]);
            quota = Math.round(quota / 100) * 100;
            quota = Math.max(500, Math.min(200000, quota));
            return quota;
        } else {
            // 最后兜底：尝试从整个JSON响应中找数字
            const rawStr = JSON.stringify(data);
            const fallbackMatch = rawStr.match(/(\d{3,6})/);
            if (fallbackMatch) {
                let quota = parseInt(fallbackMatch[0]);
                quota = Math.round(quota / 100) * 100;
                quota = Math.max(500, Math.min(200000, quota));
                console.log('花呗AI兜底解析额度:', quota);
                return quota;
            }
            throw new Error('AI返回内容无法解析: ' + text);
        }
    } catch (e) {
        console.error('AI评估花呗额度失败:', e);
        await showIosAlert('提示', 'AI评估失败，已切换为本地评估');
        // fallback到本地计算
        const result = calculateHuabeiQuota();
        return result.quota;
    }
}

// 计算余额宝每日利息
function calculateYuebaoInterest() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (!data || data.yuebaoAmount <= 0) return;

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    if (data.yuebaoLastUpdate === todayStr) return; // 今天已经算过了

    const rate = data.yuebaoRate || 2.35; // 七日年化利率(%)
    const dailyRate = rate / 100 / 365;

    if (data.yuebaoLastUpdate) {
        // 计算距离上次更新过了几天
        const lastDate = new Date(data.yuebaoLastUpdate);
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = Math.max(1, Math.floor(diffTime / (1000 * 60 * 60 * 24)));

        // 按天复利计算
        const interest = Math.round(data.yuebaoAmount * dailyRate * diffDays * 100) / 100;
        data.yuebaoEarn = Math.round(data.yuebaoAmount * dailyRate * 100) / 100; // 昨日收益（按1天算）
        data.yuebaoAmount = Math.round((data.yuebaoAmount + interest) * 100) / 100;
        data.yuebaoTotalEarn = Math.round(((data.yuebaoTotalEarn || 0) + interest) * 100) / 100;
    } else {
        // 首次，只记录日期，不产生利息
        data.yuebaoEarn = 0;
    }

    data.yuebaoLastUpdate = todayStr;
    localStorage.setItem('walletData', JSON.stringify(data));
}

// 余额宝详情
function openYuebao() {
    calculateYuebaoInterest();
    showYuebaoDetailPage();
}

// 余额宝详情页
function showYuebaoDetailPage() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const rate = data.yuebaoRate || 2.35;
    const dailyEarn = Math.round(data.yuebaoAmount * rate / 100 / 365 * 100) / 100;

    let page = document.getElementById('yuebaoDetailPage');
    if (!page) {
        page = document.createElement('div');
        page.id = 'yuebaoDetailPage';
        page.className = 'settings-page';
        document.body.appendChild(page);
    }

    page.innerHTML = `
        <div class="wallet-page-inner">
            <div class="wallet-header">
                <div class="wallet-back-btn" onclick="closeYuebaoDetail()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <div class="wallet-header-title">余额宝</div>
                <div style="width:40px;"></div>
            </div>

            <!-- 总金额 -->
            <div style="margin:16px;padding:24px 20px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="text-align:center;margin-bottom:20px;">
                    <div style="font-size:13px;color:#999;margin-bottom:8px;">总金额(元)</div>
                    <div style="font-size:36px;font-weight:700;color:#222;font-variant-numeric:tabular-nums;">${fmt(data.yuebaoAmount)}</div>
                </div>
                <div class="wallet-huabei-row">
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">昨日收益</div>
                        <div class="wallet-huabei-value" style="color:#22a06b;">+${fmt(data.yuebaoEarn)}</div>
                    </div>
                    <div class="wallet-huabei-divider"></div>
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">累计收益</div>
                        <div class="wallet-huabei-value" style="color:#22a06b;">+${fmt(data.yuebaoTotalEarn || 0)}</div>
                    </div>
                    <div class="wallet-huabei-divider"></div>
                    <div class="wallet-huabei-item">
                        <div class="wallet-huabei-label">预估日收益</div>
                        <div class="wallet-huabei-value" style="color:#22a06b;">+${fmt(dailyEarn)}</div>
                    </div>
                </div>
            </div>

            <!-- 收益信息 -->
            <div style="margin:0 16px 14px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="padding:16px 18px 0;">
                    <div style="font-size:16px;font-weight:600;color:#222;">收益信息</div>
                </div>
                <div style="padding:14px 18px 18px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">七日年化收益率</span>
                        <span style="font-size:14px;font-weight:500;color:#e8910d;">${rate}%</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">每万份收益</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">¥${fmt(10000 * rate / 100 / 365)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">
                        <span style="font-size:14px;color:#666;">收益计算方式</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">按日计息</span>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div style="margin:0 16px 14px;display:flex;flex-direction:column;gap:10px;">
                <button onclick="transferToYuebao()" style="width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;">转入</button>
                <button onclick="transferFromYuebao()" style="width:100%;padding:14px;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;">转出到余额</button>
            </div>

            <div style="margin:0 16px;padding:14px 18px;background:#f9f9f9;border-radius:12px;">
                <div style="font-size:12px;color:#999;line-height:1.8;">
                    · 转入资金次日开始产生收益<br>
                    · 收益每日自动计入本金<br>
                    · 转出实时到账，无手续费
                </div>
            </div>

            <div style="height:40px;"></div>
        </div>
    `;

    page.classList.add('active');
}

// 关闭余额宝详情
function closeYuebaoDetail() {
    const page = document.getElementById('yuebaoDetailPage');
    if (page) page.classList.remove('active');
    loadWalletData();
}

// 转入余额宝
function transferToYuebao() {
    iosPrompt('转入金额', '', (val) => {
        const amount = parseFloat(val);
        const data = JSON.parse(localStorage.getItem('walletData'));
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        if (amount > data.balance) {
            showIosAlert('提示', '余额不足');
            return;
        }
        data.balance = Math.round((data.balance - amount) * 100) / 100;
        data.yuebaoAmount = Math.round((data.yuebaoAmount + amount) * 100) / 100;
        if (!data.yuebaoRate) data.yuebaoRate = 2.35;
        // 如果是首次转入，记录今天为起始日期（次日开始计息）
        if (!data.yuebaoLastUpdate) {
            const today = new Date();
            data.yuebaoLastUpdate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        }
        localStorage.setItem('walletData', JSON.stringify(data));
        showToast('转入成功 ¥' + amount.toFixed(2));
        // 如果详情页打开着就刷新
        const detailPage = document.getElementById('yuebaoDetailPage');
        if (detailPage && detailPage.classList.contains('active')) {
            showYuebaoDetailPage();
        } else {
            updateWalletUI(data);
        }
    });
}

// 从余额宝转出
function transferFromYuebao() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (data.yuebaoAmount <= 0) {
        showToast('余额宝暂无资金');
        return;
    }
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    iosPrompt(`转出金额（可用 ¥${fmt(data.yuebaoAmount)}）`, '', (val) => {
        const amount = parseFloat(val);
        const d = JSON.parse(localStorage.getItem('walletData'));
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        if (amount > d.yuebaoAmount) {
            showIosAlert('提示', '余额宝资金不足');
            return;
        }
        d.yuebaoAmount = Math.round((d.yuebaoAmount - amount) * 100) / 100;
        d.balance = Math.round((d.balance + amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(d));
        showToast('转出成功 ¥' + amount.toFixed(2));
        const detailPage = document.getElementById('yuebaoDetailPage');
        if (detailPage && detailPage.classList.contains('active')) {
            showYuebaoDetailPage();
        } else {
            updateWalletUI(d);
        }
    });
}

// 银行卡管理
function openBankCards() {
    showBankCardListPage();
}

// 小荷包（占位）
function openXiaohe() {
    showIosAlert('小荷包', '小荷包功能开发中，敬请期待');
}

// 账单
function openWalletBills() {
    showIosAlert('账单', '账单功能开发中，敬请期待');
}

// 生成随机银行卡号（16位）
function generateBankCardNumber() {
    let num = '';
    for (let i = 0; i < 16; i++) {
        num += Math.floor(Math.random() * 10);
    }
    return num;
}

// 添加银行卡
function addBankCard() {
    let cardImage = '';

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '添加银行卡';

    const body = document.createElement('div');
    body.style.cssText = 'padding:8px 16px 16px;';

    // 卡片图片
    const imgLabel = document.createElement('div');
    imgLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    imgLabel.textContent = '卡片图片（可选）';
    const imgPreview = document.createElement('div');
    imgPreview.id = 'bankCardImgPreview';
    imgPreview.style.cssText = 'width:100%;height:60px;border:1.5px dashed #d0d0d0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#999;cursor:pointer;margin-bottom:12px;overflow:hidden;transition:border-color 0.2s;';
    imgPreview.textContent = '点击上传图片';
    imgPreview.onclick = () => {
        closeDialog();
        openS2ImagePicker('银行卡图片', { maxWidth: 200, maxHeight: 200, quality: 0.8, maxSizeKB: 100 }, (data) => {
            cardImage = data;
            addBankCard.__resumeData = { cardImage: data };
            addBankCard();
        });
    };

    // 如果是从图片选择器返回的
    if (addBankCard.__resumeData) {
        cardImage = addBankCard.__resumeData.cardImage;
        delete addBankCard.__resumeData;
        imgPreview.innerHTML = `<img src="${cardImage}" style="height:56px;border-radius:8px;object-fit:cover;">`;
        imgPreview.style.borderStyle = 'solid';
        imgPreview.style.borderColor = '#e0e0e0';
    }

    // 银行名称
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    nameLabel.textContent = '银行名称';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.placeholder = '例如：中国银行';
    nameInput.maxLength = 20;
    nameInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    nameInput.onfocus = () => { nameInput.style.borderColor = '#007aff'; };
    nameInput.onblur = () => { nameInput.style.borderColor = '#e0e0e0'; };

    // 卡片类型
    const typeLabel = document.createElement('div');
    typeLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    typeLabel.textContent = '卡片类型';
    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;background:#fff;';
    ['储蓄卡', '信用卡'].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        typeSelect.appendChild(opt);
    });

    // 卡内余额
    const balLabel = document.createElement('div');
    balLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    balLabel.textContent = '卡内余额';
    const balInput = document.createElement('input');
    balInput.type = 'number';
    balInput.placeholder = '0.00';
    balInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    balInput.onfocus = () => { balInput.style.borderColor = '#007aff'; };
    balInput.onblur = () => { balInput.style.borderColor = '#e0e0e0'; };

    // 额度限制
    const limitLabel = document.createElement('div');
    limitLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    limitLabel.textContent = '额度限制（0为不限）';
    const limitInput = document.createElement('input');
    limitInput.type = 'number';
    limitInput.placeholder = '0';
    limitInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;';
    limitInput.onfocus = () => { limitInput.style.borderColor = '#007aff'; };
    limitInput.onblur = () => { limitInput.style.borderColor = '#e0e0e0'; };

    body.appendChild(imgLabel);
    body.appendChild(imgPreview);
    body.appendChild(nameLabel);
    body.appendChild(nameInput);
    body.appendChild(typeLabel);
    body.appendChild(typeSelect);
    body.appendChild(balLabel);
    body.appendChild(balInput);
    body.appendChild(limitLabel);
    body.appendChild(limitInput);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ios-dialog-button primary';
    saveBtn.textContent = '添加';
    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) { showToast('请输入银行名称'); return; }
        const cardNum = generateBankCardNumber();
        const tail = cardNum.slice(-4);
        const balance = Math.max(0, parseFloat(balInput.value) || 0);
        const limit = Math.max(0, parseFloat(limitInput.value) || 0);

        const newCard = {
            id: 'card_' + Date.now(),
            name: name,
            type: typeSelect.value,
            cardNumber: cardNum,
            tail: tail,
            balance: Math.round(balance * 100) / 100,
            limit: Math.round(limit * 100) / 100,
            image: cardImage || '',
            createdAt: new Date().toISOString()
        };

        const data = JSON.parse(localStorage.getItem('walletData'));
        if (!data.bankCards) data.bankCards = [];
        data.bankCards.push(newCard);
        localStorage.setItem('walletData', JSON.stringify(data));
        closeDialog();
        showToast('银行卡添加成功');
        loadWalletData();
        // 如果管理页打开着就刷新
        const listPage = document.getElementById('bankCardListPage');
        if (listPage && listPage.classList.contains('active')) {
            showBankCardListPage();
        }
    };

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(saveBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(body);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.classList.add('show'); nameInput.focus(); }, 10);

    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
}

// 银行卡管理列表页
function showBankCardListPage() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const cards = data.bankCards || [];
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    let page = document.getElementById('bankCardListPage');
    if (!page) {
        page = document.createElement('div');
        page.id = 'bankCardListPage';
        page.className = 'settings-page';
        document.body.appendChild(page);
    }

    const bankColors = ['#e8f0fe', '#fef3e8', '#f0fdf4', '#fdf2f8'];
    const bankStroke = ['#3b7ddd', '#e8910d', '#22a06b', '#d946a8'];

    const cardsHtml = cards.length > 0 ? cards.map((card, i) => `
        <div style="margin:0 16px 10px;padding:16px;background:#fff;border-radius:14px;box-shadow:0 1px 4px rgba(0,0,0,0.04);cursor:pointer;" onclick="openBankCardDetail(${i})">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
                <div style="width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:${bankColors[i % 4]};color:${bankStroke[i % 4]};overflow:hidden;flex-shrink:0;">
                    ${card.image
                        ? `<img src="${card.image}" style="width:44px;height:44px;object-fit:cover;">`
                        : `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg>`
                    }
                </div>
                <div style="flex:1;">
                    <div style="font-size:15px;font-weight:600;color:#222;">${card.name}</div>
                    <div style="font-size:12px;color:#aaa;margin-top:2px;">${card.type} · ${card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</div>
                </div>
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div>
                    <div style="font-size:12px;color:#999;">余额</div>
                    <div style="font-size:18px;font-weight:700;color:#222;font-variant-numeric:tabular-nums;">¥${fmt(card.balance)}</div>
                </div>
                ${card.limit > 0 ? `<div style="text-align:right;">
                    <div style="font-size:12px;color:#999;">额度限制</div>
                    <div style="font-size:14px;font-weight:500;color:#e8910d;">¥${fmt(card.limit)}</div>
                </div>` : ''}
            </div>
        </div>
    `).join('') : '<div style="text-align:center;padding:40px 0;color:#ccc;font-size:14px;">暂无银行卡</div>';

    page.innerHTML = `
        <div class="wallet-page-inner">
            <div class="wallet-header">
                <div class="wallet-back-btn" onclick="closeBankCardList()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <div class="wallet-header-title">银行卡管理</div>
                <div style="width:40px;"></div>
            </div>
            <div style="margin-top:12px;">
            ${cardsHtml}
            </div>
            <div style="margin:14px 16px;">
                <button onclick="addBankCard()" style="width:100%;padding:14px;border:1.5px dashed #d0d0d0;border-radius:12px;font-size:15px;font-weight:500;color:#999;background:#fff;cursor:pointer;">+ 添加银行卡</button>
            </div>
            <div style="height:40px;"></div>
        </div>
    `;

    page.classList.add('active');
}

// 关闭银行卡列表
function closeBankCardList() {
    const page = document.getElementById('bankCardListPage');
    if (page) page.classList.remove('active');
    loadWalletData();
}

// 银行卡详情
function openBankCardDetail(index) {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const cards = data.bankCards || [];
    if (index < 0 || index >= cards.length) return;
    const card = cards[index];
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const bankColors = ['#e8f0fe', '#fef3e8', '#f0fdf4', '#fdf2f8'];
    const bankStroke = ['#3b7ddd', '#e8910d', '#22a06b', '#d946a8'];

    let page = document.getElementById('bankCardDetailPage');
    if (!page) {
        page = document.createElement('div');
        page.id = 'bankCardDetailPage';
        page.className = 'settings-page';
        document.body.appendChild(page);
    }

    page.innerHTML = `
        <div class="wallet-page-inner">
            <div class="wallet-header">
                <div class="wallet-back-btn" onclick="closeBankCardDetail()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <div class="wallet-header-title">${card.name}</div>
                <div style="width:40px;"></div>
            </div>

            <!-- 卡片展示 -->
            <div style="margin:16px;padding:24px 20px;background:${bankColors[index % 4]};border-radius:16px;box-shadow:0 2px 8px rgba(0,0,0,0.06);">
                <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
                    ${card.image
                        ? `<img src="${card.image}" style="width:48px;height:48px;border-radius:12px;object-fit:cover;">`
                        : `<div style="width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.6);color:${bankStroke[index % 4]};"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="3"/><line x1="2" y1="10" x2="22" y2="10"/></svg></div>`
                    }
                    <div>
                        <div style="font-size:17px;font-weight:700;color:#222;">${card.name}</div>
                        <div style="font-size:12px;color:#666;margin-top:2px;">${card.type}</div>
                    </div>
                </div>
                <div style="font-size:13px;color:#666;margin-bottom:4px;">卡号</div>
                <div style="font-size:18px;font-weight:600;color:#222;letter-spacing:2px;font-variant-numeric:tabular-nums;">${card.cardNumber.replace(/(\d{4})/g, '$1 ').trim()}</div>
            </div>

            <!-- 余额信息 -->
            <div style="margin:0 16px 14px;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="padding:14px 18px 18px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">卡内余额</span>
                        <span style="font-size:16px;font-weight:600;color:#222;">¥${fmt(card.balance)}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #f5f5f5;">
                        <span style="font-size:14px;color:#666;">额度限制</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">${card.limit > 0 ? '¥' + fmt(card.limit) : '无限制'}</span>
                    </div>
                    <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;">
                        <span style="font-size:14px;color:#666;">添加时间</span>
                        <span style="font-size:14px;font-weight:500;color:#333;">${card.createdAt ? new Date(card.createdAt).toLocaleDateString('zh-CN') : '未知'}</span>
                    </div>
                </div>
            </div>

            <!-- 操作按钮 -->
            <div style="margin:0 16px 14px;display:flex;flex-direction:column;gap:10px;">
                <button onclick="editBankCard(${index})" style="width:100%;padding:14px;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;">编辑</button>
                <button onclick="deleteBankCard(${index})" style="width:100%;padding:14px;border:1.5px solid #e53e3e;border-radius:12px;font-size:15px;font-weight:500;color:#e53e3e;background:#fff;cursor:pointer;">删除银行卡</button>
            </div>

            <div style="height:40px;"></div>
        </div>
    `;

    page.classList.add('active');
}

// 关闭银行卡详情
function closeBankCardDetail() {
    const page = document.getElementById('bankCardDetailPage');
    if (page) page.classList.remove('active');
    // 刷新列表页
    const listPage = document.getElementById('bankCardListPage');
    if (listPage && listPage.classList.contains('active')) {
        showBankCardListPage();
    }
    loadWalletData();
}

// 编辑银行卡
function editBankCard(index) {
    const data = JSON.parse(localStorage.getItem('walletData'));
    const card = data.bankCards[index];
    if (!card) return;

    let cardImage = card.image || '';

    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '编辑银行卡';

    const body = document.createElement('div');
    body.style.cssText = 'padding:8px 16px 16px;';

    // 卡片图片
    const imgLabel = document.createElement('div');
    imgLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    imgLabel.textContent = '卡片图片';
    const imgPreview = document.createElement('div');
    imgPreview.style.cssText = 'width:100%;height:60px;border:1.5px dashed #d0d0d0;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:13px;color:#999;cursor:pointer;margin-bottom:12px;overflow:hidden;';
    if (cardImage) {
        imgPreview.innerHTML = `<img src="${cardImage}" style="height:56px;border-radius:8px;object-fit:cover;">`;
        imgPreview.style.borderStyle = 'solid';
        imgPreview.style.borderColor = '#e0e0e0';
    } else {
        imgPreview.textContent = '点击上传图片';
    }
    imgPreview.onclick = () => {
        closeDialog();
        openS2ImagePicker('银行卡图片', { maxWidth: 200, maxHeight: 200, quality: 0.8, maxSizeKB: 100 }, (imgData) => {
            editBankCard.__resumeData = { index, cardImage: imgData };
            editBankCard(index);
        });
    };

    if (editBankCard.__resumeData && editBankCard.__resumeData.index === index) {
        cardImage = editBankCard.__resumeData.cardImage;
        delete editBankCard.__resumeData;
        imgPreview.innerHTML = `<img src="${cardImage}" style="height:56px;border-radius:8px;object-fit:cover;">`;
        imgPreview.style.borderStyle = 'solid';
        imgPreview.style.borderColor = '#e0e0e0';
    }

    // 名称
    const nameLabel = document.createElement('div');
    nameLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    nameLabel.textContent = '银行名称';
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = card.name;
    nameInput.maxLength = 20;
    nameInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    nameInput.onfocus = () => { nameInput.style.borderColor = '#007aff'; };
    nameInput.onblur = () => { nameInput.style.borderColor = '#e0e0e0'; };

    // 类型
    const typeLabel = document.createElement('div');
    typeLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    typeLabel.textContent = '卡片类型';
    const typeSelect = document.createElement('select');
    typeSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;background:#fff;';
    ['储蓄卡', '信用卡'].forEach(t => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        if (t === card.type) opt.selected = true;
        typeSelect.appendChild(opt);
    });

    // 余额
    const balLabel = document.createElement('div');
    balLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    balLabel.textContent = '卡内余额';
    const balInput = document.createElement('input');
    balInput.type = 'number';
    balInput.value = card.balance;
    balInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;';
    balInput.onfocus = () => { balInput.style.borderColor = '#007aff'; };
    balInput.onblur = () => { balInput.style.borderColor = '#e0e0e0'; };

    // 额度
    const limitLabel = document.createElement('div');
    limitLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:4px;';
    limitLabel.textContent = '额度限制（0为不限）';
    const limitInput = document.createElement('input');
    limitInput.type = 'number';
    limitInput.value = card.limit || 0;
    limitInput.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;';
    limitInput.onfocus = () => { limitInput.style.borderColor = '#007aff'; };
    limitInput.onblur = () => { limitInput.style.borderColor = '#e0e0e0'; };

    body.appendChild(imgLabel);
    body.appendChild(imgPreview);
    body.appendChild(nameLabel);
    body.appendChild(nameInput);
    body.appendChild(typeLabel);
    body.appendChild(typeSelect);
    body.appendChild(balLabel);
    body.appendChild(balInput);
    body.appendChild(limitLabel);
    body.appendChild(limitInput);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();

    const saveBtn = document.createElement('button');
    saveBtn.className = 'ios-dialog-button primary';
    saveBtn.textContent = '保存';
    saveBtn.onclick = () => {
        const name = nameInput.value.trim();
        if (!name) { showToast('请输入银行名称'); return; }
        const d = JSON.parse(localStorage.getItem('walletData'));
        d.bankCards[index].name = name;
        d.bankCards[index].type = typeSelect.value;
        d.bankCards[index].balance = Math.round(Math.max(0, parseFloat(balInput.value) || 0) * 100) / 100;
        d.bankCards[index].limit = Math.round(Math.max(0, parseFloat(limitInput.value) || 0) * 100) / 100;
        d.bankCards[index].image = cardImage;
        localStorage.setItem('walletData', JSON.stringify(d));
        closeDialog();
        showToast('银行卡已更新');
        openBankCardDetail(index);
    };

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(saveBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(body);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.classList.add('show'); nameInput.focus(); }, 10);

    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }
}

// 删除银行卡
async function deleteBankCard(index) {
    const ok = await iosConfirm('确认删除该银行卡？此操作不可撤销。', '删除银行卡');
    if (!ok) return;
    const data = JSON.parse(localStorage.getItem('walletData'));
    data.bankCards.splice(index, 1);
    localStorage.setItem('walletData', JSON.stringify(data));
    showToast('银行卡已删除');
    closeBankCardDetail();
}

// ========== 主屏幕翻页功能 ==========

let _homeCurrentPage = 0;
const _homeTotalPages = 2;

function initHomePageSwipe() {
    const wrapper = document.getElementById('homePagesWrapper');
    const mainScreen = document.getElementById('mainScreen');
    if (!wrapper || !mainScreen) return;

    let startX = 0, startY = 0, diffX = 0, isSwiping = false, isScrolling = null;

    // 触摸事件
    wrapper.addEventListener('touchstart', onStart, { passive: true });
    wrapper.addEventListener('touchmove', onMove, { passive: false });
    wrapper.addEventListener('touchend', onEnd, { passive: true });

    // 鼠标事件（PC端）
    wrapper.addEventListener('mousedown', onMouseDown);

    function onStart(e) {
        const t = e.touches[0];
        startX = t.clientX;
        startY = t.clientY;
        diffX = 0;
        isScrolling = null;
        wrapper.classList.add('swiping');
    }

    function onMove(e) {
        if (!e.touches.length) return;
        const t = e.touches[0];
        const dx = t.clientX - startX;
        const dy = t.clientY - startY;

        // 判断是横向滑动还是纵向滚动
        if (isScrolling === null) {
            isScrolling = Math.abs(dy) > Math.abs(dx);
        }
        if (isScrolling) return;

        e.preventDefault();
        diffX = dx;

        // 边界阻尼
        let offset = -_homeCurrentPage * 100 + (diffX / wrapper.offsetWidth) * 100;
        if (offset > 0) offset *= 0.3;
        if (offset < -(_homeTotalPages - 1) * 100) {
            offset = -(_homeTotalPages - 1) * 100 + (offset + (_homeTotalPages - 1) * 100) * 0.3;
        }
        wrapper.style.transform = `translateX(${offset}%)`;
    }

    function onEnd() {
        wrapper.classList.remove('swiping');
        if (isScrolling) return;

        const threshold = wrapper.offsetWidth * 0.2;
        if (diffX < -threshold && _homeCurrentPage < _homeTotalPages - 1) {
            _homeCurrentPage++;
        } else if (diffX > threshold && _homeCurrentPage > 0) {
            _homeCurrentPage--;
        }
        goToHomePage(_homeCurrentPage);
    }

    // PC鼠标拖拽
    function onMouseDown(e) {
        // 忽略来自按钮、输入框等的拖拽
        if (e.target.closest('button, input, select, textarea, a, .app-item, .dock-app, .widget, .notebook-widget, .music-widget')) return;
        startX = e.clientX;
        startY = e.clientY;
        diffX = 0;
        isScrolling = null;
        wrapper.classList.add('swiping');

        const onMouseMove = (ev) => {
            const dx = ev.clientX - startX;
            const dy = ev.clientY - startY;
            if (isScrolling === null) {
                isScrolling = Math.abs(dy) > Math.abs(dx);
            }
            if (isScrolling) return;
            ev.preventDefault();
            diffX = dx;
            let offset = -_homeCurrentPage * 100 + (diffX / wrapper.offsetWidth) * 100;
            if (offset > 0) offset *= 0.3;
            if (offset < -(_homeTotalPages - 1) * 100) {
                offset = -(_homeTotalPages - 1) * 100 + (offset + (_homeTotalPages - 1) * 100) * 0.3;
            }
            wrapper.style.transform = `translateX(${offset}%)`;
        };

        const onMouseUp = () => {
            wrapper.classList.remove('swiping');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            if (isScrolling) return;
            const threshold = wrapper.offsetWidth * 0.2;
            if (diffX < -threshold && _homeCurrentPage < _homeTotalPages - 1) {
                _homeCurrentPage++;
            } else if (diffX > threshold && _homeCurrentPage > 0) {
                _homeCurrentPage--;
            }
            goToHomePage(_homeCurrentPage);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }

    // 点击指示器切换
    document.querySelectorAll('.home-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const page = parseInt(dot.dataset.page);
            if (!isNaN(page)) {
                _homeCurrentPage = page;
                goToHomePage(page);
            }
        });
    });
}

function goToHomePage(page) {
    const wrapper = document.getElementById('homePagesWrapper');
    if (!wrapper) return;
    wrapper.style.transform = `translateX(-${page * 100}%)`;
    // 更新指示器
    document.querySelectorAll('.home-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === page);
    });
}

// 第二页APP占位函数
// ========== 短信应用功能 ==========

// 短信数据存储
let smsConversations = JSON.parse(localStorage.getItem('smsConversations') || '{}');
let currentSmsPhone = null;

// 保存短信数据
function saveSmsData() {
    localStorage.setItem('smsConversations', JSON.stringify(smsConversations));
}

// 打开短信应用
function openSmsApp() {
    const page = document.getElementById('smsListPage');
    page.style.display = 'block';
    renderSmsList();
}

// 关闭短信应用
function closeSmsApp() {
    const page = document.getElementById('smsListPage');
    page.style.display = 'none';
}

// 渲染短信列表
function renderSmsList() {
    const list = document.getElementById('smsList');
    const keys = Object.keys(smsConversations);

    if (keys.length === 0) {
        list.innerHTML = '<div class="sms-empty"><div class="sms-empty-text">暂无信息</div></div>';
        return;
    }

    // 按最后消息时间排序
    keys.sort((a, b) => {
        const msgsA = smsConversations[a];
        const msgsB = smsConversations[b];
        const tA = msgsA.length ? new Date(msgsA[msgsA.length - 1].time).getTime() : 0;
        const tB = msgsB.length ? new Date(msgsB[msgsB.length - 1].time).getTime() : 0;
        return tB - tA;
    });

    list.innerHTML = keys.map(phone => {
        const msgs = smsConversations[phone];
        const last = msgs[msgs.length - 1];
        const timeStr = formatSmsTime(last.time);
        const preview = last.text.length > 30 ? last.text.substring(0, 30) + '...' : last.text;

        return `<div class="sms-list-item" onclick="openSmsDetail('${phone}')">
            <div class="sms-list-avatar">
                <img src="https://i.postimg.cc/Nf6f1665/CFEEC469058BDB0EAD269FB4D4FE5F6C.jpg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">
            </div>
            <div class="sms-list-info">
                <div class="sms-list-top">
                    <div class="sms-list-name">${escapeHtml(phone)}</div>
                    <div class="sms-list-time">${timeStr}</div>
                </div>
                <div class="sms-list-preview">${escapeHtml(preview)}</div>
            </div>
            <div class="sms-list-arrow">›</div>
        </div>`;
    }).join('');
}

// 格式化短信时间
function formatSmsTime(timeStr) {
    const d = new Date(timeStr);
    const now = new Date();
    const diff = now - d;
    const oneDay = 86400000;

    if (diff < oneDay && d.getDate() === now.getDate()) {
        return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
    } else if (diff < oneDay * 2) {
        return '昨天';
    } else if (diff < oneDay * 7) {
        const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
        return weekdays[d.getDay()];
    } else {
        return (d.getMonth() + 1) + '/' + d.getDate();
    }
}

// 搜索过滤
function filterSmsList() {
    const q = document.getElementById('smsSearchInput').value.trim().toLowerCase();
    const items = document.querySelectorAll('.sms-list-item');
    items.forEach(item => {
        const name = item.querySelector('.sms-list-name').textContent.toLowerCase();
        const preview = item.querySelector('.sms-list-preview').textContent.toLowerCase();
        item.style.display = (name.includes(q) || preview.includes(q)) ? '' : 'none';
    });
}

// 打开短信详情
function openSmsDetail(phone) {
    currentSmsPhone = phone;
    const page = document.getElementById('smsDetailPage');
    page.style.display = 'block';

    document.getElementById('smsDetailName').textContent = phone;
    renderSmsMessages();

    // 聚焦输入框
    setTimeout(() => {
        const input = document.getElementById('smsInputField');
        if (input) input.focus();
    }, 350);
}

// 关闭短信详情
function closeSmsDetail() {
    const page = document.getElementById('smsDetailPage');
    page.style.display = 'none';
    currentSmsPhone = null;
}

// 渲染短信消息
function renderSmsMessages() {
    const container = document.getElementById('smsMessages');
    const msgs = smsConversations[currentSmsPhone] || [];

    let html = '<div class="sms-imessage-hint">信息 · 短信</div>';

    let lastDate = '';
    msgs.forEach(msg => {
        const d = new Date(msg.time);
        const dateStr = (d.getMonth() + 1) + '月' + d.getDate() + '日 ' +
            d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');

        // 日期分隔
        const dayStr = d.toDateString();
        if (dayStr !== lastDate) {
            const now = new Date();
            let label = '';
            if (d.toDateString() === now.toDateString()) {
                label = '今天 ' + d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
            } else {
                label = dateStr;
            }
            html += `<div class="sms-time-divider">${label}</div>`;
            lastDate = dayStr;
        }

        const type = msg.from === 'user' ? 'sent' : 'received';
        html += `<div class="sms-bubble-row ${type}">
            <div class="sms-bubble ${type}">${escapeHtml(msg.text)}</div>
        </div>`;
    });

    // 不在联系人提示
    html += `<div class="sms-not-in-contacts">发件人不在你的联系人列表中。<br><a href="javascript:void(0)" onclick="showToast('功能开发中')">报告垃圾信息</a></div>`;

    container.innerHTML = html;

    // 滚动到底部
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

// 切换发送按钮显示
function toggleSmsSendBtn() {
    const input = document.getElementById('smsInputField');
    const sendBtn = document.getElementById('smsSendBtn');
    const mic = document.getElementById('smsInputMic');
    if (input.value.trim()) {
        sendBtn.style.display = 'flex';
        mic.style.display = 'none';
    } else {
        sendBtn.style.display = 'none';
        mic.style.display = 'flex';
    }
}

// 发送短信
function sendSmsMessage() {
    const input = document.getElementById('smsInputField');
    const text = input.value.trim();
    if (!text || !currentSmsPhone) return;

    if (!smsConversations[currentSmsPhone]) {
        smsConversations[currentSmsPhone] = [];
    }

    smsConversations[currentSmsPhone].push({
        text: text,
        from: 'user',
        time: new Date().toISOString()
    });

    saveSmsData();
    input.value = '';
    toggleSmsSendBtn();
    renderSmsMessages();
}

// 打开新建短信（底部弹出半屏弹窗）
function openSmsCompose() {
    // 如果已存在则不重复创建
    if (document.getElementById('smsComposeOverlay')) return;

    const overlay = document.createElement('div');
    overlay.className = 'sms-compose-overlay';
    overlay.id = 'smsComposeOverlay';

    const sheet = document.createElement('div');
    sheet.className = 'sms-compose-sheet';
    sheet.id = 'smsComposeSheet';

    sheet.innerHTML = `
        <div class="sms-compose-sheet-header">
            <div class="sms-compose-sheet-cancel" onclick="closeSmsCompose()">取消</div>
            <div class="sms-compose-sheet-title">新信息</div>
            <div style="width:50px;"></div>
        </div>
        <div class="sms-compose-sheet-to">
            <span class="sms-compose-sheet-to-label">收件人：</span>
            <input type="tel" class="sms-compose-sheet-to-input" id="smsComposeToInput" placeholder="输入电话号码">
        </div>
        <div class="sms-compose-sheet-body"></div>
        <div class="sms-compose-sheet-input-bar">
            <div class="sms-compose-sheet-input-wrapper">
                <input type="text" class="sms-compose-sheet-input" id="smsComposeInputField" placeholder="信息 · 短信" oninput="toggleSmsComposeSendBtn()">
            </div>
            <div class="sms-send-btn" id="smsComposeSendBtn" onclick="sendComposeMessage()" style="display:none;">
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="14" fill="#34C759"/><path d="M9 14.5l3.5 3.5L19 11" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </div>
            <div class="sms-input-mic" id="smsComposeInputMic">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" stroke="#8E8E93" stroke-width="2"/><path d="M19 11c0 3.53-2.61 6.44-6 6.93V21M5 11c0 3.53 2.61 6.44 6 6.93V21M8 21h8" stroke="#8E8E93" stroke-width="2" stroke-linecap="round"/></svg>
            </div>
        </div>
    `;

    overlay.appendChild(sheet);
    document.body.appendChild(overlay);

    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeSmsCompose();
    });

    // 聚焦收件人输入框
    setTimeout(() => {
        const toInput = document.getElementById('smsComposeToInput');
        if (toInput) toInput.focus();
    }, 400);

    // 绑定回车发送
    setTimeout(() => {
        const composeInput = document.getElementById('smsComposeInputField');
        if (composeInput) {
            composeInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendComposeMessage();
                }
            });
        }
    }, 500);
}

// 关闭新建短信弹窗
function closeSmsCompose() {
    const overlay = document.getElementById('smsComposeOverlay');
    if (!overlay) return;
    const sheet = document.getElementById('smsComposeSheet');
    if (sheet) {
        sheet.style.animation = 'smsSheetDown 0.25s ease forwards';
    }
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 0.25s';
    setTimeout(() => {
        if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
    }, 280);
}

// 切换新建短信发送按钮
function toggleSmsComposeSendBtn() {
    const input = document.getElementById('smsComposeInputField');
    const sendBtn = document.getElementById('smsComposeSendBtn');
    const mic = document.getElementById('smsComposeInputMic');
    if (input.value.trim()) {
        sendBtn.style.display = 'flex';
        mic.style.display = 'none';
    } else {
        sendBtn.style.display = 'none';
        mic.style.display = 'flex';
    }
}

// 发送新建短信
function sendComposeMessage() {
    const phoneInput = document.getElementById('smsComposeToInput');
    const msgInput = document.getElementById('smsComposeInputField');
    const phone = phoneInput.value.trim();
    const text = msgInput.value.trim();

    if (!phone) {
        showToast('请输入电话号码');
        return;
    }
    if (!text) {
        showToast('请输入短信内容');
        return;
    }

    if (!smsConversations[phone]) {
        smsConversations[phone] = [];
    }

    smsConversations[phone].push({
        text: text,
        from: 'user',
        time: new Date().toISOString()
    });

    saveSmsData();

    // 关闭新建页，打开详情页
    closeSmsCompose();
    renderSmsList();
    openSmsDetail(phone);
}

// 监听回车发送（短信详情页）
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const smsInput = document.getElementById('smsInputField');
        if (smsInput) {
            smsInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendSmsMessage();
                }
            });
        }
    }, 500);
});
function openLinkApp() {
    showIosAlert('联机', '联机功能开发中，敬请期待');
}
function openGameHall() {
    showIosAlert('游戏大厅', '游戏大厅功能开发中，敬请期待');
}
function openForum() {
    showIosAlert('论坛', '论坛功能开发中，敬请期待');
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initHomePageSwipe();
});
