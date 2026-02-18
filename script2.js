// ========== script2.js - 扩展功能模块 ==========
// 依赖 script.js 中的全局变量和函数

// ========== 银行卡转账功能 ==========

// 切换银行卡转账功能开关
function toggleBankTransferFeature() {
    const toggle = document.getElementById('bankTransferToggle');
    const cardSection = document.getElementById('bankTransferCardSection');
    
    if (toggle.checked) {
        // 开启功能
        cardSection.style.display = 'block';
        
        // 检查钱包是否有银行卡
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
        const cards = walletData.bankCards || [];
        
        if (cards.length === 0) {
            showIosAlert('提示', '请先在钱包APP中添加银行卡');
            toggle.checked = false;
            cardSection.style.display = 'none';
            return;
        }
        
        // 保存开关状态
        saveBankTransferSettings({ enabled: true });
        
        // 更新显示
        updateBankTransferCardDisplay();
    } else {
        // 关闭功能
        cardSection.style.display = 'none';
        saveBankTransferSettings({ enabled: false });
    }
}

// 保存银行卡转账设置
function saveBankTransferSettings(settings) {
    const current = JSON.parse(localStorage.getItem('bankTransferSettings') || '{}');
    const updated = { ...current, ...settings };
    localStorage.setItem('bankTransferSettings', JSON.stringify(updated));
}

// 获取银行卡转账设置
function getBankTransferSettings() {
    return JSON.parse(localStorage.getItem('bankTransferSettings') || '{}');
}

// 打开选择银行卡界面
function openSelectBankCardForTransfer() {
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const cards = walletData.bankCards || [];
    
    if (cards.length === 0) {
        showIosAlert('提示', '请先在钱包APP中添加银行卡');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '320px';
    dialog.style.maxHeight = '70vh';
    dialog.style.overflowY = 'auto';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择接收银行卡';
    
    const msgEl = document.createElement('div');
    msgEl.className = 'ios-dialog-message';
    msgEl.textContent = '角色转账将直接到这张卡';
    msgEl.style.marginBottom = '16px';
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons vertical';
    buttonsEl.style.maxHeight = '400px';
    buttonsEl.style.overflowY = 'auto';
    
    // 为每张卡创建一个按钮
    cards.forEach((card, index) => {
        const cardNumber = card.number || card.cardNumber || '0000000000000000';
        const last4 = cardNumber.slice(-4);
        const balance = card.balance || 0;
        const cardName = card.name || '未命名银行卡';
        
        const btn = document.createElement('button');
        btn.className = 'ios-dialog-button';
        btn.style.textAlign = 'left';
        btn.style.padding = '14px 16px';
        btn.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 4px;">
                <div style="font-weight:600; font-size: 15px; color:#333;">${escapeHtml(cardName)}</div>
                <div style="font-size:13px;color:#666;">**** **** **** ${last4}</div>
                <div style="font-size:12px;color:#999;">余额: ¥${balance.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
        `;
        btn.onclick = () => {
            selectBankCardForTransfer(index);
            closeDialog();
        };
        buttonsEl.appendChild(btn);
    });
    
    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    buttonsEl.appendChild(cancelBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(msgEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                document.body.removeChild(overlay);
            }
        }, 300);
    }
}

// 选择银行卡
function selectBankCardForTransfer(cardIndex) {
    saveBankTransferSettings({ selectedCardIndex: cardIndex });
    updateBankTransferCardDisplay();
    showToast('已选择银行卡');
}

// 更新银行卡显示
function updateBankTransferCardDisplay() {
    const settings = getBankTransferSettings();
    const noCardDiv = document.getElementById('bankTransferNoCard');
    const selectedCardDiv = document.getElementById('bankTransferSelectedCard');
    
    if (settings.selectedCardIndex === null || settings.selectedCardIndex === undefined) {
        // 未选择
        noCardDiv.style.display = 'block';
        selectedCardDiv.style.display = 'none';
    } else {
        // 已选择
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
        const card = walletData.bankCards[settings.selectedCardIndex];
        
        if (card) {
            const cardNumber = card.number || card.cardNumber || '0000000000000000';
            const last4 = cardNumber.slice(-4);
            const balance = card.balance || 0;
            
            document.getElementById('selectedCardName').textContent = card.name || '未命名银行卡';
            document.getElementById('selectedCardNumber').textContent = `**** **** **** ${last4}`;
            document.getElementById('selectedCardBalance').textContent = `余额: ¥${balance.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
            
            noCardDiv.style.display = 'none';
            selectedCardDiv.style.display = 'block';
        } else {
            // 卡不存在了，重置
            saveBankTransferSettings({ selectedCardIndex: null });
            noCardDiv.style.display = 'block';
            selectedCardDiv.style.display = 'none';
        }
    }
}

// 初始化银行卡转账设置界面
function initBankTransferSettings() {
    const settings = getBankTransferSettings();
    const toggle = document.getElementById('bankTransferToggle');
    const cardSection = document.getElementById('bankTransferCardSection');
    
    if (toggle) {
        toggle.checked = settings.enabled || false;
        if (settings.enabled) {
            cardSection.style.display = 'block';
            updateBankTransferCardDisplay();
        }
    }
}

// 执行银行转账（AI触发）
async function executeBankTransfer(amount, reason) {
    const settings = getBankTransferSettings();
    
    // 检查功能是否开启
    if (!settings.enabled || settings.selectedCardIndex === null || settings.selectedCardIndex === undefined) {
        console.log('银行转账功能未开启或未选择银行卡');
        return;
    }
    
    // 获取钱包数据
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const card = walletData.bankCards[settings.selectedCardIndex];
    
    if (!card) {
        console.log('银行卡不存在');
        return;
    }
    
    // 直接增加银行卡余额
    card.balance = Math.round((card.balance + amount) * 100) / 100;
    localStorage.setItem('walletData', JSON.stringify(walletData));
    
    // 添加账单记录
    addBillRecord('income', amount, `银行转账：${reason}`, 'bankcard', settings.selectedCardIndex);
    
    // 在聊天界面显示银行转账通知（立即显示）
    await showBankTransferNotification(card, amount, reason);
    
    // 添加系统消息到聊天记录（告知AI转账详情，立即显示）
    await addBankTransferSystemMessage(card, amount);
    
    // 发送银行短信通知（延迟4秒，等角色消息通知弹窗显示完）
    sendBankTransferSms(card, amount, reason, true);
    
    // 更新钱包UI（如果钱包页面是打开的）
    if (typeof updateWalletUI === 'function') {
        updateWalletUI(walletData);
    }
    
    // 更新设置界面的卡片显示
    updateBankTransferCardDisplay();
    
    showToast(`收到银行转账 ¥${amount.toFixed(2)}`);
}

// 发送银行转账短信
async function sendBankTransferSms(card, amount, reason, delayNotification = false) {
    const now = new Date();
    const dateStr = `${now.getMonth()+1}月${now.getDate()}日`;
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const cardNumber = card.number || card.cardNumber || '0000000000000000';
    const last4 = cardNumber.slice(-4);
    const cardType = card.type === 'credit' ? '信用卡' : '储蓄卡';
    const bankName = card.name || '银行';
    const balance = card.balance || 0;
    
    // 生成银行官方号码（95开头）
    const bankPhone = generateBankPhone(bankName);
    
    // 银行短信格式：收入（不显示原因，只显示收支变化）
    const smsText = `【${bankName}】您尾号${last4}的${cardType}于${dateStr}${timeStr}收入人民币${amount.toFixed(2)}元，余额${balance.toFixed(2)}元。`;
    
    // 添加到短信会话
    if (!smsConversations[bankPhone]) {
        smsConversations[bankPhone] = [];
    }
    
    smsConversations[bankPhone].push({
        text: smsText,
        from: 'other',
        time: now.toISOString()
    });
    
    saveSmsData();
    
    // 取消隐藏（如果之前被隐藏了）
    unhideSmsConversation(bankPhone);
    
    // 显示消息通知弹窗（标记为银行类型）
    // 如果需要延迟（角色转账场景），等待消息通知队列处理完成后再显示
    if (delayNotification) {
        // 智能等待：等待所有角色消息通知弹窗显示完成
        if (typeof waitForNotifQueueComplete === 'function') {
            await waitForNotifQueueComplete();
        }
        showMessageNotification(bankName, smsText, bankPhone, 'bank');
    } else {
        // 立即显示（钱包充值/提现等场景）
        showMessageNotification(bankName, smsText, bankPhone, 'bank');
    }
}

// 在聊天界面显示银行转账消息
async function showBankTransferNotification(card, amount, reason) {
    if (!currentChatCharacter) return;
    
    const cardNumber = card.number || card.cardNumber || '0000000000000000';
    const last4 = cardNumber.slice(-4);
    
    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[银行转账]',
        type: 'char',
        timestamp: new Date().toISOString(),
        sender: 'char',
        messageType: 'bankTransfer',
        bankTransferAmount: amount,
        bankTransferReason: reason,
        bankTransferCard: `${card.name || '银行卡'} **** ${last4}`
    };
    
    // 渲染到聊天界面
    appendBankTransferMessageToChat(messageObj);
    
    // 保存到数据库
    await saveMessageToDB(messageObj);
    
    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[银行转账]', messageObj.timestamp);
    
    // 滚动到底部
    scrollChatToBottom();
}

// 渲染银行转账消息到聊天界面
function appendBankTransferMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    // 获取角色头像
    let avatar = '';
    if (currentChatCharacter && currentChatCharacter.avatar) {
        avatar = currentChatCharacter.avatar;
    }
    
    const time = formatMessageTime(messageObj.timestamp);
    const amount = messageObj.bankTransferAmount || 0;
    const reason = messageObj.bankTransferReason || '';
    const cardInfo = messageObj.bankTransferCard || '银行卡';
    
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message chat-message-char';
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-bank-transfer-bubble">
                <div class="chat-bank-transfer-header">
                    <div class="chat-bank-transfer-info">
                        <div class="chat-bank-transfer-title">银行转账</div>
                        <div class="chat-bank-transfer-card">${escapeHtml(cardInfo)}</div>
                    </div>
                </div>
                <div class="chat-bank-transfer-body">
                    <div class="chat-bank-transfer-amount">¥${amount.toFixed(2)}</div>
                    ${reason ? `<div class="chat-bank-transfer-reason">${escapeHtml(reason)}</div>` : ''}
                </div>
                <div class="chat-bank-transfer-footer">
                    <span class="chat-bank-transfer-status">已到账</span>
                </div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
}

// 添加银行转账系统消息（灰色提示，添加到上下文）
async function addBankTransferSystemMessage(card, amount) {
    console.log('🔔 addBankTransferSystemMessage 被调用', { card, amount, currentChatCharacter });
    
    if (!currentChatCharacter) {
        console.error('❌ currentChatCharacter 为空，无法添加系统消息');
        return;
    }
    
    // 获取角色真名
    const charName = currentChatCharacter.name || '角色';
    
    // 获取用户真名
    let userName = '用户';
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        console.log('📋 userData字符串:', userDataStr);
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            console.log('📋 userData对象:', userData);
            if (userData.name && userData.name.trim()) {
                userName = userData.name.trim();
            }
        }
    } catch (e) {
        console.error('获取用户名失败:', e);
    }
    
    console.log('👤 最终用户名:', userName);
    
    // 获取卡号信息
    const cardNumber = card.number || card.cardNumber || '0000000000000000';
    const last4 = cardNumber.slice(-4);
    const cardName = card.name || '银行卡';
    
    // 构建系统消息内容
    const systemContent = `${charName} 向 ${userName} 的${cardName}(尾号${last4})转账了 ¥${amount.toFixed(2)}`;
    
    console.log('📝 系统消息内容:', systemContent);
    
    const systemMessageObj = {
        id: Date.now().toString() + Math.random() + '_system',
        characterId: currentChatCharacter.id,
        content: systemContent,
        type: 'system',
        timestamp: new Date().toISOString(),
        sender: 'system',
        messageType: 'systemNotice'
    };
    
    console.log('💾 系统消息对象:', systemMessageObj);
    
    // 渲染到聊天界面
    appendSystemMessageToChat(systemMessageObj);
    
    // 保存到数据库（添加到上下文）
    await saveMessageToDB(systemMessageObj);
    
    console.log('✅ 系统消息已保存到数据库');
    
    // 滚动到底部
    scrollChatToBottom();
}

// 渲染系统消息到聊天界面
function appendSystemMessageToChat(messageObj) {
    console.log('🎨 appendSystemMessageToChat 被调用', messageObj);
    
    const container = document.getElementById('chatMessagesContainer');
    
    if (!container) {
        console.error('❌ chatMessagesContainer 不存在');
        return;
    }
    
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    // 使用 chat-message 类让它能被长按菜单识别，同时保留 chat-system-message 用于样式
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message chat-system-message';
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = 'system';
    
    // 添加复选框（多选模式下显示）
    const checkbox = document.createElement('div');
    checkbox.className = 'msg-checkbox';
    checkbox.onclick = (e) => {
        e.stopPropagation();
        toggleMsgSelection(messageObj.id);
    };
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'chat-system-message-content';
    contentWrapper.textContent = messageObj.content;
    
    messageEl.appendChild(checkbox);
    messageEl.appendChild(contentWrapper);
    
    console.log('➕ 系统消息元素已创建，准备添加到容器');
    
    container.appendChild(messageEl);
    
    console.log('✅ 系统消息已添加到聊天界面');
}

// ========== 模型参数保存功能 ==========

// 单独保存模型参数
async function saveModelParams() {
    try {
        // 读取现有设置
        const settings = await storageDB.getItem('apiSettings') || {};
        
        // 只更新模型参数
        settings.temperature = parseFloat(document.getElementById('temperatureSlider').value);
        settings.topP = parseFloat(document.getElementById('topPSlider').value);
        settings.maxTokens = parseInt(document.getElementById('maxTokensInput').value) || 2048;
        
        // 保存回数据库
        await storageDB.setItem('apiSettings', settings);
        
        console.log('✅ 模型参数已保存:', {
            temperature: settings.temperature,
            topP: settings.topP,
            maxTokens: settings.maxTokens
        });
        
        showToast('模型参数已保存！');
    } catch (error) {
        console.error('❌ 保存模型参数失败:', error);
        showToast('保存失败，请重试');
    }
}

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
    let sourceDisplayName = '';
    let accountType = 'balance';
    let accountIndex = null;
    
    if (typeof paySource === 'string') {
        // 原有的支付方式：balance, huabei, yuebao
        if (paySource === 'balance') {
            data.balance = Math.round((data.balance - amount) * 100) / 100;
            sourceDisplayName = '余额';
            accountType = 'balance';
        } else if (paySource === 'huabei') {
            data.huabeiUsed = Math.round((data.huabeiUsed + amount) * 100) / 100;
            sourceDisplayName = '花呗';
            accountType = 'balance'; // 花呗暂时记录到余额账户
        } else if (paySource === 'yuebao') {
            data.yuebaoAmount = Math.round((data.yuebaoAmount - amount) * 100) / 100;
            sourceDisplayName = '余额宝';
            accountType = 'yuebao';
        }
        messageObj.transferSource = paySource;
    } else if (paySource && paySource.type === 'bankcard') {
        // 银行卡支付
        const cardIndex = paySource.index;
        const card = data.bankCards[cardIndex];
        if (card) {
            card.balance = Math.round((card.balance - amount) * 100) / 100;
            sourceDisplayName = card.name || '银行卡';
            accountType = 'bankcard';
            accountIndex = cardIndex;
            messageObj.transferSource = 'bankcard';
            messageObj.transferBankCardIndex = cardIndex;
            
            // 发送银行转账支出短信
            sendBankSms(card, 'transfer', amount);
        }
    }
    
    localStorage.setItem('walletData', JSON.stringify(data));
    
    // 添加账单记录
    const remarkText = remark ? `转账：${remark}` : '转账';
    addBillRecord('expense', amount, remarkText, accountType, accountIndex);

    // 渲染到聊天界面
    appendTransferMessageToChat(messageObj);

    // 保存到数据库
    await saveMessageToDB(messageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[转账]', messageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();

    // 来源提示
    showToast(`已通过${sourceDisplayName}转账 ¥${amount.toFixed(2)}`);
}

// 转账来源选择弹窗
function showTransferSourceChoice(amount) {
    return new Promise((resolve) => {
        const data = JSON.parse(localStorage.getItem('walletData') || '{}');
        const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const balanceOk = (data.balance || 0) >= amount;
        const huabeiOk = data.huabeiEnabled && ((data.huabeiTotal - data.huabeiUsed) >= amount) && !data.huabeiFrozen;
        const yuebaoOk = (data.yuebaoAmount || 0) >= amount;
        const bankCards = data.bankCards || [];

        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.width = '300px';
        dialog.style.maxHeight = '80vh';
        dialog.style.overflowY = 'auto';

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

        buttonsEl.appendChild(balBtn);
        buttonsEl.appendChild(hbBtn);
        buttonsEl.appendChild(ybBtn);

        // 银行卡选项
        if (bankCards.length > 0) {
            bankCards.forEach((card, index) => {
                const cardBalance = card.balance || 0;
                const cardOk = cardBalance >= amount;
                const cardNumber = card.number || card.cardNumber || '0000000000000000';
                const last4 = cardNumber.slice(-4);
                
                const cardBtn = document.createElement('button');
                cardBtn.className = 'ios-dialog-button' + (cardOk ? ' primary' : '');
                cardBtn.style.opacity = cardOk ? '1' : '0.4';
                cardBtn.style.textAlign = 'left';
                cardBtn.style.padding = '12px 16px';
                cardBtn.innerHTML = `
                    <div style="font-weight:600;color:${cardOk ? '#333' : '#999'};margin-bottom:4px;">${escapeHtml(card.name || '银行卡')}</div>
                    <div style="font-size:13px;color:#666;">**** **** **** ${last4}</div>
                    <div style="font-size:13px;color:#999;margin-top:2px;">余额: ¥${fmt(cardBalance)}</div>
                `;
                cardBtn.onclick = () => {
                    if (!cardOk) { showToast('银行卡余额不足'); return; }
                    close({ type: 'bankcard', index: index });
                };
                buttonsEl.appendChild(cardBtn);
            });
        }

        // 取消
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => close(null);

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

        // 7. 如果是收款，增加用户余额并添加账单记录
        if (action === 'accepted' && tfAmount > 0) {
            const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
            walletData.balance = Math.round((walletData.balance + tfAmount) * 100) / 100;
            localStorage.setItem('walletData', JSON.stringify(walletData));
            
            // 添加账单记录
            const remarkText = tfRemark ? `收款：${tfRemark}` : '收款';
            addBillRecord('income', tfAmount, remarkText, 'balance');
        }

        // 8. 滚动到底部
        scrollChatToBottom();

        showToast(action === 'accepted' ? '已收款' : '已退还');
    }
}


// ========== 长期记忆功能 ==========

// 简化版提示词（给用户看的纯文字版本，用于自定义格式的示例）
const LTM_SIMPLE_PROMPTS = {
    diary: `请用日记的方式总结对话。用"我"的口吻，像写日记一样自然、随意、有感情地记录。可以包含内心想法和感受。不要使用方括号、箭头等符号。150-200字左右，保持段落完整。`,
    
    narrative: `请用第三人称旁白的方式总结对话。像讲故事一样叙述，有情节、有细节、有情感描写。不要使用方括号、箭头等符号。150-200字左右，保持段落完整。`,
    
    objective: `请用客观中立的方式总结对话。像观察报告一样记录事实和行为，少带主观情感。不要使用方括号、箭头等符号。150-200字左右，保持段落完整。`
};

// 长期记忆提示词格式预设（{charName}和{userName}会在实际使用时替换为真名）
const LTM_FORMAT_TEMPLATES = {
    diary: {
        label: '日记式',
        preview: '示例：\n今天下午和小明聊了工作的事。他心情不太好，看起来遇到了一些困难。我耐心地听他倾诉，尽力安慰他。后来我们聊到了电影，发现彼此都喜欢科幻片，气氛轻松了很多。感觉我们的关系又近了一步。',
        summaryPrompt: `你是{charName}，请以你的第一人称视角，像写日记一样，将以下你和{userName}的对话总结为一段自然的文字记录。要求：
1. 用"我"指代{charName}（你自己），用"{userName}"或对方的名字指代对方
2. 用完整的句子和段落，像写日记一样自然、随意、有感情
3. 可以包含你的内心想法、感受和观察
4. 不要使用任何方括号[]、箭头->等符号标记
5. 时间信息可以自然地融入叙述中（如"今天下午"、"刚才"）
6. 总结要包含关键事件、话题、双方的情感和互动
7. 150-200字左右，保持段落完整
8. 只输出总结内容，不要输出其他任何内容

对话内容：
{messages}`
    },
    narrative: {
        label: '旁白式',
        preview: '示例：\n2月8日下午，小明向她倾诉了工作上的烦恼。他的情绪有些低落，她耐心地陪伴和安慰他。第二天上午，两人聊起了喜欢的电影，发现都对科幻片情有独钟。这次交流让彼此的距离更近了一些，也让小明的心情好转了不少。',
        summaryPrompt: `请以第三人称旁白的视角，像讲故事一样，将以下{charName}和{userName}的对话总结为一段自然的叙述文字。要求：
1. 用第三人称称呼双方（用"他/她"或直接用名字）
2. 像讲故事一样，有情节、有细节、有情感描写
3. 保持一定的文学性和叙事感，但不要过于夸张
4. 不要使用任何方括号[]、箭头->等符号标记
5. 时间可以自然地融入叙述中（如"那天下午"、"随后"）
6. 总结要包含关键事件、话题、双方的情感变化和互动
7. 150-200字左右，保持段落完整
8. 只输出总结内容，不要输出其他任何内容

对话内容：
{messages}`
    },
    objective: {
        label: '客观记录式',
        preview: '示例：\n这段时间里，小明分享了他在工作中遇到的困难和压力。通过交流，他得到了一些情感支持和建议。随后的对话中，双方发现了共同的兴趣爱好，包括对科幻电影的喜爱。这次交流促进了彼此的了解，也对小明的情绪状态产生了积极影响。',
        summaryPrompt: `请以客观中立的视角，将以下{charName}和{userName}的对话总结为一段客观的记录文字。要求：
1. 用客观、中立的语气描述
2. 像观察报告一样记录事实和行为
3. 少带主观情感色彩，多描述可观察的行为和事件
4. 不要使用任何方括号[]、箭头->等符号标记
5. 时间可以用"这段时间"、"期间"等词汇自然表达
6. 总结要包含关键事件、话题、互动内容和影响
7. 150-200字左右，保持段落完整，语言简洁但完整
8. 只输出总结内容，不要输出其他任何内容

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
    const format = character.longTermMemoryFormat || 'diary';
    let summaryPrompt;

    if (format === 'custom' && character.longTermMemoryCustomPrompt) {
        // 自定义格式：用户的纯文字提示词 + 自动附加对话内容
        const userPrompt = character.longTermMemoryCustomPrompt.trim();
        summaryPrompt = `${userPrompt}\n\n以下是需要总结的对话内容：\n${messagesText}`;
    } else {
        // 预设格式：使用模板
        const template = LTM_FORMAT_TEMPLATES[format] || LTM_FORMAT_TEMPLATES.diary;
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

// 长期记忆格式选择变化（已移至script.js）

// 打开长期记忆管理库
// 打开长期记忆管理库（已移至script.js）

// 关闭长期记忆管理库
// 关闭长期记忆管理库（已移至script.js）

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
    
    console.log('=== renderLongTermMemoryList 完成，已渲染', sorted.length, '条记忆 ===');
}

// 手动添加长期记忆（已移至script.js）

// 开始编辑长期记忆（已移至script.js）

// 取消编辑（已移至script.js）

// 保存编辑（已移至script.js）

// 确认删除长期记忆（已移至script.js）

// 初始化长期记忆格式预览（打开设置时调用）
function initLongTermMemorySettings() {
    if (!currentChatCharacter) return;

    const interval = currentChatCharacter.longTermMemoryInterval || 0;
    document.getElementById('longTermMemoryIntervalInput').value = interval || '';

    const format = currentChatCharacter.longTermMemoryFormat || 'timeline';
    document.getElementById('longTermMemoryFormatSelect').value = format;

    const customPrompt = currentChatCharacter.longTermMemoryCustomPrompt || '';
    document.getElementById('longTermMemoryCustomPromptInput').value = customPrompt;

    // 加载精简格式设置
    const condenseFormat = currentChatCharacter.ltmCondenseFormat || 'first-person';
    document.getElementById('ltmCondenseFormatSelect').value = condenseFormat;

    const condensePrompt = currentChatCharacter.ltmCondensePrompt || '';
    document.getElementById('ltmCondensePromptInput').value = condensePrompt;

    // 触发格式预览更新
    onLongTermMemoryFormatChange();
    onLtmCondenseFormatChange();
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

    // 保存精简格式设置
    const condenseFormat = document.getElementById('ltmCondenseFormatSelect').value;
    currentChatCharacter.ltmCondenseFormat = condenseFormat;

    const condensePrompt = document.getElementById('ltmCondensePromptInput').value.trim();
    currentChatCharacter.ltmCondensePrompt = condensePrompt;
}

// ========== 长期记忆精简功能 ==========
let ltmCondenseMode = false;
let ltmCondenseSelected = new Set();

// 精简提示词格式模板
const LTM_CONDENSE_FORMATS = {
    'first-person': {
        name: '第一人称精简',
        preview: '以"我"的视角总结记忆，保留情感和主观感受',
        prompt: `请以第一人称（"我"）的视角，将以下多条记忆信息进行总结精简。要求：
1. 合并重复内容，提取关键信息
2. 保留重要的情感和主观感受
3. 使用"我"的口吻叙述
4. 语言简洁但完整
5. 只输出总结后的内容，不要输出其他任何内容

以下是需要精简的记忆内容：
{memories}`
    },
    'third-person': {
        name: '第三人称精简',
        preview: '以旁观者视角客观总结记忆内容',
        prompt: `请以第三人称的视角，将以下多条记忆信息进行总结精简。要求：
1. 合并重复内容，提取关键信息
2. 使用第三人称叙述（如"用户"、"他/她"等）
3. 保持客观中立的叙述风格
4. 语言简洁但完整
5. 只输出总结后的内容，不要输出其他任何内容

以下是需要精简的记忆内容：
{memories}`
    },
    'objective': {
        name: '客观记录式精简',
        preview: '纯客观事实记录，去除主观描述',
        prompt: `请以客观记录的方式，将以下多条记忆信息进行总结精简。要求：
1. 只保留客观事实和关键信息
2. 去除主观感受和情感描述
3. 使用简洁的陈述句
4. 按时间或逻辑顺序组织内容
5. 只输出总结后的内容，不要输出其他任何内容

以下是需要精简的记忆内容：
{memories}`
    }
};

const LTM_DEFAULT_CONDENSE_PROMPT = `请将以下多条记忆信息进行总结精简，合并重复内容，提取关键信息，生成一条简洁但完整的总结记忆。要求：保留所有重要信息，去除冗余，语言简洁明了。只输出总结后的内容，不要输出其他任何内容。

以下是需要精简的记忆内容：
{memories}`;

// 退出精简模式（已移至script.js）

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

    // 获取精简格式和提示词
    const condenseFormat = currentChatCharacter.ltmCondenseFormat || 'first-person';
    let prompt;

    if (condenseFormat === 'custom') {
        // 使用自定义提示词
        const customCondensePrompt = currentChatCharacter.ltmCondensePrompt;
        if (customCondensePrompt && customCondensePrompt.trim()) {
            prompt = customCondensePrompt.replace(/\{memories\}/g, memoriesText);
        } else {
            prompt = LTM_DEFAULT_CONDENSE_PROMPT.replace(/\{memories\}/g, memoriesText);
        }
    } else {
        // 使用预设格式
        const formatConfig = LTM_CONDENSE_FORMATS[condenseFormat];
        if (formatConfig) {
            prompt = formatConfig.prompt.replace(/\{memories\}/g, memoriesText);
        } else {
            prompt = LTM_DEFAULT_CONDENSE_PROMPT.replace(/\{memories\}/g, memoriesText);
        }
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

    // 顶部操作栏 - 根据用途显示不同按钮
    const topBar = document.createElement('div');
    topBar.className = 'msg-multiselect-bar';
    topBar.id = 'msgMultiselectBar';
    
    if (_multiSelectPurpose === 'forward') {
        topBar.innerHTML = `
            <div class="ms-cancel" onclick="exitMultiSelectMode()">取消</div>
            <div class="ms-title" id="msTitle">已选择 ${_multiSelectedIds.size} 条</div>
            <div class="ms-select-all" onclick="toggleSelectAllMsgs()">全选</div>
            <div class="ms-action-btn ms-forward-btn" id="msForwardBtn" onclick="forwardSelectedMsgs()">转发</div>
        `;
    } else {
        topBar.innerHTML = `
            <div class="ms-cancel" onclick="exitMultiSelectMode()">取消</div>
            <div class="ms-title" id="msTitle">已选择 ${_multiSelectedIds.size} 条</div>
            <div class="ms-select-all" onclick="toggleSelectAllMsgs()">全选</div>
            <div class="ms-action-btn ms-delete-btn" id="msDeleteBtn" onclick="confirmMultiDelete()">删除</div>
        `;
    }
    detailContainer.insertBefore(topBar, detailContainer.firstChild);

    // 移除底部操作栏（不再需要）
    const oldBottomBar = document.getElementById('msgMultiselectBottom');
    if (oldBottomBar) oldBottomBar.remove();

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
        if (count === 0) {
            btn.classList.add('disabled');
            btn.textContent = '删除';
        } else {
            btn.classList.remove('disabled');
            btn.textContent = `删除 (${count})`;
        }
    }

    const fwdBtn = document.getElementById('msForwardBtn');
    if (fwdBtn) {
        if (count === 0) {
            fwdBtn.classList.add('disabled');
            fwdBtn.textContent = '转发';
        } else {
            fwdBtn.classList.remove('disabled');
            fwdBtn.textContent = `转发 (${count})`;
        }
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
    // 获取当前消息内容 - 支持所有类型的消息
    let bubble = msgEl.querySelector('.chat-message-bubble');
    let currentText = '';
    
    if (bubble) {
        // 普通消息气泡
        currentText = bubble.textContent.trim();
    } else {
        // 检查是否是系统消息
        const systemContent = msgEl.querySelector('.chat-system-message-content');
        if (systemContent) {
            currentText = systemContent.textContent.trim();
        } else {
            // 其他特殊消息类型，尝试获取任何文本内容
            currentText = msgEl.textContent.trim();
        }
    }
    
    if (!currentText) {
        showToast('无法编辑该消息');
        return;
    }

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
            
            // 更新界面 - 支持所有类型的消息
            if (bubble) {
                bubble.textContent = newText;
            } else {
                const systemContent = msgEl.querySelector('.chat-system-message-content');
                if (systemContent) {
                    systemContent.textContent = newText;
                }
            }
            
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

// 等待消息通知队列处理完成
function waitForNotifQueueComplete() {
    return new Promise((resolve) => {
        // 检查队列是否为空且没有正在处理的通知
        const checkQueue = () => {
            if (_notifQueue.length === 0 && !_notifProcessing) {
                resolve();
            } else {
                // 每100ms检查一次
                setTimeout(checkQueue, 100);
            }
        };
        checkQueue();
    });
}

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

// 全局变量：保存token分布详情
let tokenDistributionData = null;

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
        
        // 三大分类统计
        let tokenStats = {
            systemPrompt: 0,      // 系统提示词
            longTermMemory: 0,    // 长期记忆
            shortTermMemory: 0,   // 短期记忆（聊天历史）
            recentMessages: []
        };

        // 1. 系统提示词（包含所有提示词内容）
        try {
            const systemPrompt = await buildRolePlaySystemPrompt(currentChatCharacter);
            tokenStats.systemPrompt = estimateTokenCount(systemPrompt);
            totalTokens += tokenStats.systemPrompt;
        } catch (e) {
            console.warn('估算系统提示词token失败:', e);
        }

        // 2. 长期记忆（单独统计）
        if (typeof buildLongTermMemoryPrompt === 'function') {
            try {
                const ltmPrompt = await buildLongTermMemoryPrompt(currentChatCharacter.id);
                if (ltmPrompt) {
                    tokenStats.longTermMemory = estimateTokenCount(ltmPrompt);
                    // 长期记忆已经包含在系统提示词中，需要从系统提示词中减去避免重复计算
                    tokenStats.systemPrompt -= tokenStats.longTermMemory;
                }
            } catch (e) {
                console.warn('估算长期记忆token失败:', e);
            }
        }

        // 3. 短期记忆（聊天历史）
        const memoryLimit = currentChatCharacter.shortTermMemory || 10;
        try {
            const recentMsgs = await getChatHistory(currentChatCharacter.id, memoryLimit);
            recentMsgs.forEach(m => {
                let msgTokens = 0;
                msgTokens += estimateTokenCount(m.content || '');
                if (m.voiceText) msgTokens += estimateTokenCount(m.voiceText);
                if (m.textImageDesc) msgTokens += estimateTokenCount(m.textImageDesc);
                if (m.transferRemark) msgTokens += estimateTokenCount(m.transferRemark);
                if (m.locationAddress) msgTokens += estimateTokenCount(m.locationAddress);
                
                tokenStats.shortTermMemory += msgTokens;
                
                // 保存最近8条消息的详情
                if (tokenStats.recentMessages.length < 8) {
                    tokenStats.recentMessages.push({
                        content: m.content || '',
                        tokens: msgTokens,
                        type: m.type,
                        timestamp: m.timestamp
                    });
                }
            });
            totalTokens += tokenStats.shortTermMemory;
        } catch (e) {
            console.warn('估算聊天历史token失败:', e);
        }

        // 保存token分布数据到全局变量
        tokenDistributionData = {
            total: totalTokens,
            stats: tokenStats
        };

        // 格式化数字显示
        const fmt = n => n >= 10000 ? (n / 10000).toFixed(1) + '万' : n.toLocaleString();

        const elTotal = document.getElementById('statTotalMessages');
        const elUser = document.getElementById('statUserMessages');
        const elChar = document.getElementById('statCharMessages');
        const elTokens = document.getElementById('statEstTokens');

        if (elTotal) elTotal.textContent = fmt(total);
        if (elUser) elUser.textContent = fmt(userCount);
        if (elChar) elChar.textContent = fmt(charCount);
        if (elTokens) {
            elTokens.textContent = fmt(totalTokens);
            // 添加点击事件（只添加一次）
            if (!elTokens.dataset.clickListenerAdded) {
                elTokens.style.cursor = 'pointer';
                elTokens.onclick = showTokenDistribution;
                elTokens.dataset.clickListenerAdded = 'true';
            }
        }
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

// 显示Token分布弹窗
function showTokenDistribution() {
    if (!tokenDistributionData) {
        showToast('暂无Token统计数据');
        return;
    }

    const data = tokenDistributionData;
    const total = data.total;
    const stats = data.stats;

    const systemPercent = total > 0 ? ((stats.systemPrompt / total) * 100).toFixed(1) : 0;
    const ltmPercent = total > 0 ? ((stats.longTermMemory / total) * 100).toFixed(1) : 0;
    const stmPercent = total > 0 ? ((stats.shortTermMemory / total) * 100).toFixed(1) : 0;

    const overlay = document.createElement('div');
    overlay.id = 'tokenDistOverlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10001;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

    const card = document.createElement('div');
    card.style.cssText = 'width:360px;max-width:90vw;max-height:85vh;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);display:flex;flex-direction:column;';

    // 标题
    const header = document.createElement('div');
    header.style.cssText = 'padding:24px 24px 20px;text-align:center;border-bottom:1px solid #e8e8e8;flex-shrink:0;background:#fff;';
    const title = document.createElement('div');
    title.style.cssText = 'font-size:18px;font-weight:600;color:#333;margin-bottom:8px;';
    title.textContent = 'Token 分布详情';
    const subtitle = document.createElement('div');
    subtitle.style.cssText = 'font-size:32px;font-weight:700;color:#333;margin-bottom:4px;';
    subtitle.textContent = total.toLocaleString();
    const subtitleLabel = document.createElement('div');
    subtitleLabel.style.cssText = 'font-size:13px;color:#999;';
    subtitleLabel.textContent = 'tokens 总计';
    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(subtitleLabel);

    // 内容区域（可滚动）
    const body = document.createElement('div');
    body.style.cssText = 'padding:24px;overflow-y:auto;flex:1;';

    // 系统提示词
    const systemSection = document.createElement('div');
    systemSection.style.cssText = 'margin-bottom:20px;';
    systemSection.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:15px;color:#333;font-weight:600;">系统提示词</span>
            <span style="font-size:15px;color:#333;font-weight:700;">${stats.systemPrompt.toLocaleString()} <span style="font-size:13px;color:#999;font-weight:500;">(${systemPercent}%)</span></span>
        </div>
        <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;background:#333;width:${systemPercent}%;transition:width 0.5s ease;"></div>
        </div>
        <div style="font-size:12px;color:#999;line-height:1.5;">包含角色人设、用户信息、世界书、功能说明等</div>
    `;
    body.appendChild(systemSection);

    // 长期记忆
    if (stats.longTermMemory > 0) {
        const ltmSection = document.createElement('div');
        ltmSection.style.cssText = 'margin-bottom:20px;';
        ltmSection.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                <span style="font-size:15px;color:#333;font-weight:600;">长期记忆</span>
                <span style="font-size:15px;color:#333;font-weight:700;">${stats.longTermMemory.toLocaleString()} <span style="font-size:13px;color:#999;font-weight:500;">(${ltmPercent}%)</span></span>
            </div>
            <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;margin-bottom:8px;">
                <div style="height:100%;background:#666;width:${ltmPercent}%;transition:width 0.5s ease;"></div>
            </div>
            <div style="font-size:12px;color:#999;line-height:1.5;">AI记住的重要事件和关键信息</div>
        `;
        body.appendChild(ltmSection);
    }

    // 短期记忆（聊天历史）
    const stmSection = document.createElement('div');
    stmSection.style.cssText = 'margin-bottom:20px;';
    stmSection.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:15px;color:#333;font-weight:600;">短期记忆</span>
            <span style="font-size:15px;color:#333;font-weight:700;">${stats.shortTermMemory.toLocaleString()} <span style="font-size:13px;color:#999;font-weight:500;">(${stmPercent}%)</span></span>
        </div>
        <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;margin-bottom:8px;">
            <div style="height:100%;background:#999;width:${stmPercent}%;transition:width 0.5s ease;"></div>
        </div>
        <div style="font-size:12px;color:#999;line-height:1.5;">最近 ${currentChatCharacter.shortTermMemory || 10} 条对话内容</div>
    `;
    body.appendChild(stmSection);

    // 最近消息详情
    if (stats.recentMessages && stats.recentMessages.length > 0) {
        const messagesTitle = document.createElement('div');
        messagesTitle.style.cssText = 'font-size:14px;color:#666;font-weight:600;margin:24px 0 12px;padding-top:20px;border-top:1px solid #f0f0f0;';
        messagesTitle.textContent = '最近消息明细';
        body.appendChild(messagesTitle);

        const messagesContainer = document.createElement('div');
        messagesContainer.style.cssText = 'max-height:300px;overflow-y:auto;';

        stats.recentMessages.forEach((msg, idx) => {
            const msgItem = document.createElement('div');
            msgItem.style.cssText = 'padding:12px;background:#f8f8f8;border-radius:10px;margin-bottom:10px;';
            
            const msgHeader = document.createElement('div');
            msgHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';
            
            const msgType = document.createElement('span');
            msgType.style.cssText = `font-size:12px;padding:4px 10px;border-radius:4px;font-weight:500;${msg.type === 'user' ? 'background:#e8e8e8;color:#333;' : 'background:#333;color:#fff;'}`;
            msgType.textContent = msg.type === 'user' ? '用户' : '角色';
            
            const msgTokens = document.createElement('span');
            msgTokens.style.cssText = 'font-size:13px;color:#333;font-weight:700;';
            msgTokens.textContent = `${msg.tokens} tokens`;
            
            msgHeader.appendChild(msgType);
            msgHeader.appendChild(msgTokens);
            
            const msgContent = document.createElement('div');
            msgContent.style.cssText = 'font-size:13px;color:#666;line-height:1.5;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;';
            msgContent.textContent = msg.content || '[特殊消息]';
            
            msgItem.appendChild(msgHeader);
            msgItem.appendChild(msgContent);
            messagesContainer.appendChild(msgItem);
        });

        body.appendChild(messagesContainer);
    }

    // 提示信息
    const tipSection = document.createElement('div');
    tipSection.style.cssText = 'margin-top:20px;padding:14px;background:#f8f8f8;border-radius:10px;border:1px solid #e8e8e8;';
    tipSection.innerHTML = `
        <div style="font-size:12px;color:#666;line-height:1.6;">
            <div style="font-weight:600;margin-bottom:8px;color:#333;">说明</div>
            <div style="margin-bottom:4px;">• Token数为粗略估算，实际消耗可能略有差异</div>
            <div style="margin-bottom:4px;">• 系统提示词包含角色设定、功能说明等固定内容</div>
            <div style="margin-bottom:4px;">• 长期记忆保存AI记住的重要信息</div>
            <div>• 短期记忆是最近的对话历史，条数可在设置中调整</div>
        </div>
    `;
    body.appendChild(tipSection);

    // 底部按钮
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:20px 24px;border-top:1px solid #e8e8e8;flex-shrink:0;';
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'width:100%;padding:14px 0;border:none;border-radius:12px;font-size:15px;font-weight:600;color:#fff;background:#333;cursor:pointer;transition:all 0.2s;';
    closeBtn.textContent = '关闭';
    closeBtn.onmouseenter = () => closeBtn.style.background = '#555';
    closeBtn.onmouseleave = () => closeBtn.style.background = '#333';
    closeBtn.onclick = () => closeTokenDistModal(overlay, card);
    
    footer.appendChild(closeBtn);

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
        if (e.target === overlay) closeTokenDistModal(overlay, card);
    });
}

// 关闭Token分布弹窗
function closeTokenDistModal(overlay, card) {
    overlay.style.opacity = '0';
    card.style.transform = 'scale(0.9) translateY(20px)';
    card.style.opacity = '0';
    setTimeout(() => {
        if (overlay.parentNode) {
            document.body.removeChild(overlay);
        }
    }, 300);
}


// ========== 手动总结功能 ==========

// 打开手动总结弹窗（已移至script.js）

// 关闭手动总结弹窗（已移至script.js）

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
        const format = character.longTermMemoryFormat || 'diary';
        let summaryPrompt;
        if (format === 'custom' && character.longTermMemoryCustomPrompt) {
            // 自定义格式：用户的纯文字提示词 + 自动附加对话内容
            const userPrompt = character.longTermMemoryCustomPrompt.trim();
            summaryPrompt = `${userPrompt}\n\n以下是需要总结的对话内容：\n${messagesText}`;
        } else {
            // 预设格式：使用模板
            const template = LTM_FORMAT_TEMPLATES[format] || LTM_FORMAT_TEMPLATES.diary;
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
    
    const data = JSON.parse(localStorage.getItem('walletData'));
    const cards = data.bankCards || [];
    
    if (cards.length === 0) {
        showIosAlert('提示', '请先添加银行卡');
        return;
    }
    
    // 选择银行卡
    selectBankCardForRecharge(cards, data);
}

// 选择银行卡进行充值
function selectBankCardForRecharge(cards, walletData) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.maxWidth = '320px';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择充值银行卡';
    
    const msgEl = document.createElement('div');
    msgEl.className = 'ios-dialog-message';
    msgEl.style.maxHeight = '300px';
    msgEl.style.overflowY = 'auto';
    
    // 银行卡列表
    msgEl.innerHTML = cards.map((card, index) => {
        const cardNumber = card.number || card.cardNumber || '0000000000000000';
        const last4 = cardNumber.slice(-4);
        const balance = card.balance || 0;
        return `
            <div class="bank-card-select-item" onclick="confirmRechargeAmount(${index})" style="padding:12px;margin:8px 0;background:#f8f8f8;border-radius:10px;cursor:pointer;text-align:left;">
                <div style="font-weight:600;color:#333;margin-bottom:4px;">${escapeHtml(card.name || '未命名银行卡')}</div>
                <div style="font-size:13px;color:#666;">**** **** **** ${last4}</div>
                <div style="font-size:13px;color:#999;margin-top:4px;">余额: ¥${balance.toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    buttonsEl.appendChild(cancelBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(msgEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    }
    
    // 将closeDialog函数暴露到全局
    window.closeRechargeDialog = closeDialog;
}

// 确认充值金额
function confirmRechargeAmount(cardIndex) {
    window.closeRechargeDialog();
    
    iosPrompt('充值金额', '', (val) => {
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        
        const data = JSON.parse(localStorage.getItem('walletData'));
        const card = data.bankCards[cardIndex];
        
        if (!card) {
            showIosAlert('提示', '银行卡不存在');
            return;
        }
        
        const cardBalance = card.balance || 0;
        
        if (cardBalance < amount) {
            showIosAlert('提示', '银行卡余额不足');
            return;
        }
        
        // 扣除银行卡余额
        card.balance = Math.round((cardBalance - amount) * 100) / 100;
        // 增加钱包余额
        data.balance = Math.round((data.balance + amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        
        // 添加账单记录
        addBillRecord('income', amount, '充值', 'balance');
        addBillRecord('expense', amount, '充值到钱包', 'bankcard', cardIndex);
        
        updateWalletUI(data);
        showToast('充值成功 +' + amount.toFixed(2));
        
        // 发送银行短信
        sendBankSms(card, 'recharge', amount);
    });
}

// 提现
function walletWithdraw() {
    if (isWalletFrozen()) {
        showIosAlert('操作受限', '您的钱包已被冻结（花呗逾期），请先还清花呗欠款后再提现。');
        return;
    }
    
    const data = JSON.parse(localStorage.getItem('walletData'));
    const cards = data.bankCards || [];
    
    if (cards.length === 0) {
        showIosAlert('提示', '请先添加银行卡');
        return;
    }
    
    // 选择银行卡
    selectBankCardForWithdraw(cards, data);
}

// 选择银行卡进行提现
function selectBankCardForWithdraw(cards, walletData) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.maxWidth = '320px';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择提现银行卡';
    
    const msgEl = document.createElement('div');
    msgEl.className = 'ios-dialog-message';
    msgEl.style.maxHeight = '300px';
    msgEl.style.overflowY = 'auto';
    
    // 银行卡列表
    msgEl.innerHTML = cards.map((card, index) => {
        const cardNumber = card.number || card.cardNumber || '0000000000000000';
        const last4 = cardNumber.slice(-4);
        const balance = card.balance || 0;
        return `
            <div class="bank-card-select-item" onclick="confirmWithdrawAmount(${index})" style="padding:12px;margin:8px 0;background:#f8f8f8;border-radius:10px;cursor:pointer;text-align:left;">
                <div style="font-weight:600;color:#333;margin-bottom:4px;">${escapeHtml(card.name || '未命名银行卡')}</div>
                <div style="font-size:13px;color:#666;">**** **** **** ${last4}</div>
                <div style="font-size:13px;color:#999;margin-top:4px;">余额: ¥${balance.toFixed(2)}</div>
            </div>
        `;
    }).join('');
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    buttonsEl.appendChild(cancelBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(msgEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    }
    
    // 将closeDialog函数暴露到全局
    window.closeWithdrawDialog = closeDialog;
}

// 确认提现金额
function confirmWithdrawAmount(cardIndex) {
    window.closeWithdrawDialog();
    
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
        
        const card = data.bankCards[cardIndex];
        
        if (!card) {
            showIosAlert('提示', '银行卡不存在');
            return;
        }
        
        const cardBalance = card.balance || 0;
        
        // 扣除钱包余额
        data.balance = Math.round((data.balance - amount) * 100) / 100;
        // 增加银行卡余额
        card.balance = Math.round((cardBalance + amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        
        // 添加账单记录
        addBillRecord('expense', amount, '提现', 'balance');
        addBillRecord('income', amount, '从钱包提现', 'bankcard', cardIndex);
        
        updateWalletUI(data);
        showToast('提现成功 -' + amount.toFixed(2));
        
        // 发送银行短信
        sendBankSms(card, 'withdraw', amount);
    });
}

// 直接充值（金手指功能）
function walletDirectRecharge() {
    if (isWalletFrozen()) {
        showIosAlert('操作受限', '您的钱包已被冻结（花呗逾期），充值后资金将优先用于还款。');
    }
    
    iosPrompt('直接充值金额', '', (val) => {
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        
        // 格式化金额（保留两位小数）
        const formattedAmount = Math.round(amount * 100) / 100;
        
        // 直接增加钱包余额
        const data = JSON.parse(localStorage.getItem('walletData'));
        data.balance = Math.round((data.balance + formattedAmount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        
        // 添加账单记录
        addBillRecord('income', formattedAmount, '直接充值', 'balance');
        
        updateWalletUI(data);
        showToast('直接充值成功 +' + formattedAmount.toFixed(2));
    });
}

// 发送银行短信通知
function sendBankSms(card, type, amount) {
    const now = new Date();
    const dateStr = `${now.getMonth() + 1}月${now.getDate()}日`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const cardNumber = card.number || card.cardNumber || '0000000000000000';
    const last4 = cardNumber.slice(-4);
    const cardType = card.type === 'credit' ? '信用卡' : '储蓄卡';
    const bankName = card.name || '银行';
    const balance = card.balance || 0;
    
    // 生成银行官方号码（95开头）
    const bankPhone = generateBankPhone(bankName);
    
    // 生成短信内容
    let smsText = '';
    if (type === 'recharge') {
        smsText = `【${bankName}】您尾号${last4}的${cardType}于${dateStr}${timeStr}支出人民币${amount.toFixed(2)}元，余额${balance.toFixed(2)}元。`;
    } else if (type === 'withdraw') {
        smsText = `【${bankName}】您尾号${last4}的${cardType}于${dateStr}${timeStr}收入人民币${amount.toFixed(2)}元，余额${balance.toFixed(2)}元。`;
    } else if (type === 'transfer') {
        smsText = `【${bankName}】您尾号${last4}的${cardType}于${dateStr}${timeStr}支出人民币${amount.toFixed(2)}元（转账），余额${balance.toFixed(2)}元。`;
    }
    
    // 添加到短信会话
    if (!smsConversations[bankPhone]) {
        smsConversations[bankPhone] = [];
    }
    
    smsConversations[bankPhone].push({
        text: smsText,
        from: 'other',
        time: now.toISOString()
    });
    
    saveSmsData();
    
    // 取消隐藏（如果之前被隐藏了）
    unhideSmsConversation(bankPhone);
    
    // 显示消息通知弹窗（标记为银行类型）
    showMessageNotification(bankName, smsText, bankPhone, 'bank');
}

// 生成银行官方号码
function generateBankPhone(bankName) {
    const bankPhones = {
        '中国工商银行': '95588',
        '中国农业银行': '95599',
        '中国银行': '95566',
        '中国建设银行': '95533',
        '交通银行': '95559',
        '招商银行': '95555',
        '中信银行': '95558',
        '光大银行': '95595',
        '民生银行': '95568',
        '浦发银行': '95528',
        '兴业银行': '95561',
        '平安银行': '95511',
        '华夏银行': '95577',
        '广发银行': '95508',
        '邮储银行': '95580',
        '北京银行': '95526',
        '上海银行': '95594',
        '江苏银行': '96098',
        '南京银行': '95302',
        '宁波银行': '95574'
    };
    
    // 如果是已知银行，返回对应号码，否则生成一个95开头的号码
    return bankPhones[bankName] || '95' + Math.floor(Math.random() * 900 + 100);
}

// 显示消息通知弹窗
function showMessageNotification(senderName, message, phone, notifType = 'message') {
    const container = document.getElementById('msgNotifContainer');
    if (!container) return;
    
    // 检查是否有不同类型的通知（冲突检测）
    const existingNotifs = container.querySelectorAll('.msg-notification');
    if (existingNotifs.length > 0) {
        const hasConflict = Array.from(existingNotifs).some(n => n.dataset.notifType !== notifType);
        
        if (hasConflict) {
            // 有冲突：新消息覆盖旧消息，移除所有旧通知
            existingNotifs.forEach(oldNotif => {
                oldNotif.classList.remove('show');
                setTimeout(() => oldNotif.remove(), 300);
            });
        } else {
            // 无冲突：限制最多3个，移除最旧的
            if (existingNotifs.length >= 3) {
                const oldest = existingNotifs[0];
                oldest.classList.remove('show');
                setTimeout(() => oldest.remove(), 300);
            }
        }
    }
    
    const notif = document.createElement('div');
    notif.className = 'msg-notification';
    notif.dataset.notifType = notifType; // 标记通知类型
    
    // 截取消息预览（最多50字）
    const preview = message.length > 50 ? message.substring(0, 50) + '...' : message;
    
    notif.innerHTML = `
        <div class="msg-notif-header">
            <div class="msg-notif-app">信息</div>
            <div class="msg-notif-time">现在</div>
        </div>
        <div class="msg-notif-body">
            <div class="msg-notif-sender">${escapeHtml(senderName)}</div>
            <div class="msg-notif-text">${escapeHtml(preview)}</div>
        </div>
    `;
    
    // 点击通知打开短信
    notif.onclick = () => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
        openSmsApp();
        setTimeout(() => openSmsDetail(phone), 100);
    };
    
    container.appendChild(notif);
    
    // 显示动画
    setTimeout(() => notif.classList.add('show'), 10);
    
    // 3秒后自动消失
    setTimeout(() => {
        notif.classList.remove('show');
        setTimeout(() => notif.remove(), 300);
    }, 3000);
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
            // 添加账单记录
            addBillRecord('expense', amount, '花呗还款', 'balance');
        } else if (choice === 'yuebao') {
            if (amount > data.yuebaoAmount) {
                showIosAlert('提示', '余额宝资金不足');
                return;
            }
            data.yuebaoAmount = Math.round((data.yuebaoAmount - amount) * 100) / 100;
            // 添加账单记录
            addBillRecord('expense', amount, '花呗还款', 'yuebao');
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

// 显示人设选择器（用于花呗AI生成）
async function showPersonaSelectorForHuabei() {
    // 加载最新的人设数据
    let allPersonas = [];
    try {
        const personasData = localStorage.getItem('personas');
        if (personasData) {
            allPersonas = JSON.parse(personasData);
        }
    } catch (e) {}
    
    if (allPersonas.length === 0) {
        return null;
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
        messageEl.textContent = 'AI将根据所选人设评估额度';
        messageEl.style.paddingBottom = '10px';
        
        // 人设列表容器
        const listContainer = document.createElement('div');
        listContainer.style.flex = '1';
        listContainer.style.overflowY = 'auto';
        listContainer.style.padding = '0 16px';
        listContainer.style.margin = '10px 0';
        listContainer.style.maxHeight = '40vh';
        
        // 渲染人设列表
        allPersonas.forEach((persona) => {
            const personaItem = document.createElement('div');
            personaItem.style.padding = '12px';
            personaItem.style.marginBottom = '8px';
            personaItem.style.backgroundColor = '#f5f5f5';
            personaItem.style.borderRadius = '8px';
            personaItem.style.cursor = 'pointer';
            personaItem.style.transition = 'background-color 0.2s';
            
            const idCardBadge = persona.isIdCard ? '<span style="display: inline-block; margin-left: 6px; padding: 2px 8px; background: #007bff; color: white; font-size: 10px; border-radius: 10px; font-weight: 500;">ID卡</span>' : '';
            
            personaItem.innerHTML = `
                <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px;">${escapeHtml(persona.name || '未命名人设')}${idCardBadge}</div>
                <div style="font-size: 12px; color: #666; line-height: 1.4; max-height: 3.6em; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                    ${escapeHtml(persona.description || '暂无描述')}
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
        
        function closeDialog(result) {
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

    // 检查人设库是否有人设
    let allPersonas = [];
    try {
        const personasData = localStorage.getItem('personas');
        if (personasData) {
            allPersonas = JSON.parse(personasData);
        }
    } catch (e) {}

    if (allPersonas.length === 0) {
        await showIosAlert('提示', '人设库为空，请先在"我的"页面添加人设后再使用AI生成');
        return null;
    }

    // 让用户选择一个人设
    const selectedPersona = await showPersonaSelectorForHuabei();
    if (!selectedPersona) {
        // 用户取消选择
        return null;
    }

    // 收集用户信息
    let userDesc = selectedPersona.description || '';
    let userName = selectedPersona.name || '';

    // 也可以补充用户数据中的信息
    try {
        const userDataStr = localStorage.getItem('chatUserData');
        if (userDataStr) {
            const userData = JSON.parse(userDataStr);
            if (userData.description) {
                userDesc += '\n' + userData.description;
            }
            if (!userName && userData.name) {
                userName = userData.name;
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
        
        // 添加账单记录
        if (interest > 0) {
            addBillRecord('income', interest, `余额宝收益（${diffDays}天）`, 'yuebao');
        }
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
        
        // 添加账单记录
        addBillRecord('expense', amount, '转入余额宝', 'balance');
        addBillRecord('income', amount, '从钱包转入', 'yuebao');
        
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
        
        // 添加账单记录
        addBillRecord('expense', amount, '转出到钱包', 'yuebao');
        addBillRecord('income', amount, '从余额宝转出', 'balance');
        
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
    showBillsPage();
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

// 隐藏的短信会话列表
let hiddenSmsConversations = JSON.parse(localStorage.getItem('hiddenSmsConversations') || '[]');

// 联系人列表存储（完整的联系人对象数组）
let contactsList = JSON.parse(localStorage.getItem('contactsList') || '[]');

// 保存短信数据
function saveSmsData() {
    localStorage.setItem('smsConversations', JSON.stringify(smsConversations));
}

// 保存隐藏列表
function saveHiddenSmsList() {
    localStorage.setItem('hiddenSmsConversations', JSON.stringify(hiddenSmsConversations));
}

// 检查会话是否被隐藏
function isSmsHidden(phone) {
    return hiddenSmsConversations.includes(phone);
}

// 隐藏短信会话
function hideSmsConversation(phone) {
    if (!isSmsHidden(phone)) {
        hiddenSmsConversations.push(phone);
        saveHiddenSmsList();
    }
}

// 取消隐藏短信会话
function unhideSmsConversation(phone) {
    const index = hiddenSmsConversations.indexOf(phone);
    if (index > -1) {
        hiddenSmsConversations.splice(index, 1);
        saveHiddenSmsList();
    }
}

// 删除短信会话
function deleteSmsConversation(phone) {
    delete smsConversations[phone];
    saveSmsData();
    // 同时从隐藏列表中移除
    unhideSmsConversation(phone);
}

// 保存联系人列表
function saveContactsList() {
    localStorage.setItem('contactsList', JSON.stringify(contactsList));
}

// 检查号码是否在联系人列表中
function isInContacts(phone) {
    return contactsList.some(contact => contact.phone === phone);
}

// 获取联系人信息
function getContactByPhone(phone) {
    return contactsList.find(contact => contact.phone === phone);
}

// 添加联系人（简单版本，只有号码）
function addToContacts(phone) {
    // 检查号码是否有效
    if (!phone || phone === 'undefined' || phone === 'null') {
        console.warn('无效的电话号码，跳过添加:', phone);
        return false;
    }
    
    if (!isInContacts(phone)) {
        contactsList.push({
            id: 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            phone: phone,
            name: '',
            avatar: '',
            note: '',
            createTime: new Date().toISOString()
        });
        saveContactsList();
        return true;
    }
    return false;
}

// 添加或更新联系人（完整版本）
function saveContact(contactData) {
    const existingIndex = contactsList.findIndex(c => c.id === contactData.id);
    if (existingIndex > -1) {
        // 更新现有联系人
        contactsList[existingIndex] = contactData;
    } else {
        // 添加新联系人
        contactsList.push(contactData);
    }
    saveContactsList();
}

// 从联系人中移除
function removeFromContacts(phone) {
    const index = contactsList.findIndex(c => c.phone === phone);
    if (index > -1) {
        contactsList.splice(index, 1);
        saveContactsList();
        return true;
    }
    return false;
}

// 删除联系人（通过ID）
function deleteContactById(id) {
    const index = contactsList.findIndex(c => c.id === id);
    if (index > -1) {
        contactsList.splice(index, 1);
        saveContactsList();
        return true;
    }
    return false;
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

// ========== 联系人管理功能 ==========

// 打开联系人管理页面
function openContactsManager() {
    const page = document.getElementById('contactsManagerPage');
    page.style.display = 'block';
    renderContactsList();
}

// 关闭联系人管理页面
function closeContactsManager() {
    const page = document.getElementById('contactsManagerPage');
    page.style.display = 'none';
    // 退出编辑模式
    exitContactsEditMode();
}

// 清理无效联系人（手动调用）
function cleanupInvalidContacts() {
    const beforeCount = contactsList.length;
    contactsList = contactsList.filter(contact => {
        return contact.phone && 
               contact.phone !== 'undefined' && 
               contact.phone !== 'null' && 
               contact.phone.trim() !== '';
    });
    const afterCount = contactsList.length;
    const removed = beforeCount - afterCount;
    
    if (removed > 0) {
        saveContactsList();
        renderContactsList();
        showToast(`已清理 ${removed} 个无效联系人`);
    } else {
        showToast('没有发现无效联系人');
    }
}

// 渲染联系人列表
function renderContactsList() {
    const list = document.getElementById('contactsList');
    
    // 清理无效的联系人（电话号码为空、undefined或null的）
    contactsList = contactsList.filter(contact => {
        return contact.phone && contact.phone !== 'undefined' && contact.phone !== 'null' && contact.phone.trim() !== '';
    });
    saveContactsList();
    
    if (contactsList.length === 0) {
        list.innerHTML = '<div class="contacts-empty"><div class="contacts-empty-text">暂无联系人</div></div>';
        return;
    }

    // 按创建时间倒序排序
    const sorted = [...contactsList].sort((a, b) => {
        return new Date(b.createTime).getTime() - new Date(a.createTime).getTime();
    });

    list.innerHTML = sorted.map(contact => {
        const displayName = contact.name || contact.phone || '未知';
        const firstChar = displayName ? displayName.charAt(0).toUpperCase() : '?';
        const avatarHtml = contact.avatar ? 
            `<img src="${contact.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">` :
            `<div class="contacts-avatar-placeholder">${firstChar}</div>`;
        
        return `<div class="contacts-list-item" data-contact-id="${contact.id}">
            <div class="contacts-item-checkbox" style="display:none;">
                <input type="checkbox" class="contact-checkbox" data-contact-id="${contact.id}">
            </div>
            <div class="contacts-item-content" onclick="openContactDetail('${contact.id}')">
                <div class="contacts-list-avatar">${avatarHtml}</div>
                <div class="contacts-list-info">
                    <div class="contacts-list-name">${escapeHtml(displayName)}</div>
                    <div class="contacts-list-phone">${escapeHtml(contact.phone || '')}</div>
                    ${contact.note ? `<div class="contacts-list-note">${escapeHtml(contact.note)}</div>` : ''}
                </div>
            </div>
            <div class="contacts-list-arrow">›</div>
        </div>`;
    }).join('');
}

// 进入编辑模式
function enterContactsEditMode() {
    document.getElementById('contactsEditBtn').style.display = 'none';
    document.getElementById('contactsCancelBtn').style.display = 'block';
    document.getElementById('contactsDeleteBtn').style.display = 'block';
    document.getElementById('contactsSelectAllBtn').style.display = 'block';
    
    // 显示所有复选框
    document.querySelectorAll('.contacts-item-checkbox').forEach(el => {
        el.style.display = 'flex';
    });
    
    // 隐藏箭头
    document.querySelectorAll('.contacts-list-arrow').forEach(el => {
        el.style.display = 'none';
    });
}

// 退出编辑模式
function exitContactsEditMode() {
    document.getElementById('contactsEditBtn').style.display = 'block';
    document.getElementById('contactsCancelBtn').style.display = 'none';
    document.getElementById('contactsDeleteBtn').style.display = 'none';
    document.getElementById('contactsSelectAllBtn').style.display = 'none';
    
    // 隐藏所有复选框并取消选中
    document.querySelectorAll('.contacts-item-checkbox').forEach(el => {
        el.style.display = 'none';
        const checkbox = el.querySelector('input');
        if (checkbox) checkbox.checked = false;
    });
    
    // 显示箭头
    document.querySelectorAll('.contacts-list-arrow').forEach(el => {
        el.style.display = 'block';
    });
}

// 全选/取消全选
function toggleSelectAllContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    const btn = document.getElementById('contactsSelectAllBtn');
    btn.textContent = allChecked ? '全选' : '取消全选';
}

// 删除选中的联系人
async function deleteSelectedContacts() {
    const checkboxes = document.querySelectorAll('.contact-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showToast('请选择要删除的联系人');
        return;
    }
    
    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 个联系人吗？`, '删除联系人');
    if (!confirmed) return;
    
    checkboxes.forEach(cb => {
        const contactId = cb.dataset.contactId;
        deleteContactById(contactId);
    });
    
    showToast('已删除');
    exitContactsEditMode();
    renderContactsList();
}

// 打开新建联系人页面
function openNewContact() {
    openContactEditor(null);
}

// 打开联系人详情/编辑页面
function openContactDetail(contactId) {
    // 如果在编辑模式，不打开详情
    if (document.getElementById('contactsCancelBtn').style.display !== 'none') {
        return;
    }
    openContactEditor(contactId);
}

// 打开联系人编辑器
function openContactEditor(contactId) {
    const page = document.getElementById('contactEditorPage');
    const isNew = !contactId;
    
    // 设置标题
    document.getElementById('contactEditorTitle').textContent = isNew ? '新建联系人' : '编辑联系人';
    
    // 清空或填充表单
    if (isNew) {
        document.getElementById('contactEditorId').value = '';
        document.getElementById('contactNameInput').value = '';
        document.getElementById('contactPhoneInput').value = '';
        document.getElementById('contactNoteInput').value = '';
        document.getElementById('contactAvatarPreview').innerHTML = '<div class="contact-avatar-placeholder-large">+</div>';
        document.getElementById('contactAvatarData').value = '';
    } else {
        const contact = contactsList.find(c => c.id === contactId);
        if (!contact) return;
        
        document.getElementById('contactEditorId').value = contact.id;
        document.getElementById('contactNameInput').value = contact.name || '';
        document.getElementById('contactPhoneInput').value = contact.phone || '';
        document.getElementById('contactNoteInput').value = contact.note || '';
        document.getElementById('contactAvatarData').value = contact.avatar || '';
        
        if (contact.avatar) {
            document.getElementById('contactAvatarPreview').innerHTML = 
                `<img src="${contact.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">`;
        } else {
            const displayName = contact.name || contact.phone || '?';
            const firstChar = displayName ? displayName.charAt(0).toUpperCase() : '?';
            document.getElementById('contactAvatarPreview').innerHTML = 
                `<div class="contact-avatar-placeholder-large">${firstChar}</div>`;
        }
    }
    
    page.style.display = 'block';
}

// 关闭联系人编辑器
function closeContactEditor() {
    const page = document.getElementById('contactEditorPage');
    page.style.display = 'none';
}

// 选择头像（本地上传）
function selectContactAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const imageData = await compressImage(file, {
                maxWidth: 400,
                maxHeight: 400,
                quality: 0.8,
                maxSizeKB: 200
            });
            
            document.getElementById('contactAvatarData').value = imageData;
            document.getElementById('contactAvatarPreview').innerHTML = 
                `<img src="${imageData}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">`;
        } catch (err) {
            console.error('图片处理失败:', err);
            showToast('图片处理失败');
        }
    };
    input.click();
}

// 输入头像URL
function inputContactAvatarUrl() {
    iosPrompt('输入头像URL', '', (url) => {
        if (url && url.trim()) {
            const avatarUrl = url.trim();
            document.getElementById('contactAvatarData').value = avatarUrl;
            document.getElementById('contactAvatarPreview').innerHTML = 
                `<img src="${avatarUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar" onerror="this.parentElement.innerHTML='<div class=\\'contact-avatar-placeholder-large\\'>!</div>'">`;
        }
    });
}

// 保存联系人
function saveContactFromEditor() {
    const id = document.getElementById('contactEditorId').value;
    const name = document.getElementById('contactNameInput').value.trim();
    const phone = document.getElementById('contactPhoneInput').value.trim();
    const note = document.getElementById('contactNoteInput').value.trim();
    const avatar = document.getElementById('contactAvatarData').value;
    
    if (!phone) {
        showToast('请输入电话号码');
        return;
    }
    
    // 检查号码是否已存在（排除自己）
    const existing = contactsList.find(c => c.phone === phone && c.id !== id);
    if (existing) {
        showToast('该号码已存在');
        return;
    }
    
    const contactData = {
        id: id || 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        phone: phone,
        name: name,
        avatar: avatar,
        note: note,
        createTime: id ? (contactsList.find(c => c.id === id)?.createTime || new Date().toISOString()) : new Date().toISOString()
    };
    
    saveContact(contactData);
    showToast(id ? '已保存' : '已添加');
    closeContactEditor();
    renderContactsList();
}

// 保存联系人并发送消息
function saveAndMessageContact() {
    const id = document.getElementById('contactEditorId').value;
    const name = document.getElementById('contactNameInput').value.trim();
    const phone = document.getElementById('contactPhoneInput').value.trim();
    const note = document.getElementById('contactNoteInput').value.trim();
    const avatar = document.getElementById('contactAvatarData').value;
    
    if (!phone) {
        showToast('请输入电话号码');
        return;
    }
    
    // 检查号码是否已存在（排除自己）
    const existing = contactsList.find(c => c.phone === phone && c.id !== id);
    if (existing) {
        showToast('该号码已存在');
        return;
    }
    
    const contactData = {
        id: id || 'contact_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        phone: phone,
        name: name,
        avatar: avatar,
        note: note,
        createTime: id ? (contactsList.find(c => c.id === id)?.createTime || new Date().toISOString()) : new Date().toISOString()
    };
    
    saveContact(contactData);
    
    // 关闭编辑器和联系人管理页面
    closeContactEditor();
    closeContactsManager();
    
    // 如果该号码还没有短信会话，创建一个空会话
    if (!smsConversations[phone]) {
        smsConversations[phone] = [];
        saveSmsData();
    }
    
    // 取消隐藏（如果之前被隐藏了）
    unhideSmsConversation(phone);
    
    // 刷新短信列表
    renderSmsList();
    
    // 打开短信详情页
    openSmsDetail(phone);
    
    showToast('已保存，可以开始发送消息');
}

// 渲染短信列表
function renderSmsList() {
    const list = document.getElementById('smsList');
    const keys = Object.keys(smsConversations).filter(phone => !isSmsHidden(phone));

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
        
        // 获取联系人信息
        const contact = getContactByPhone(phone);
        const displayName = contact?.name || phone || '未知';
        const avatarHtml = contact?.avatar ? 
            `<img src="${contact.avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">` :
            `<img src="https://i.postimg.cc/Nf6f1665/CFEEC469058BDB0EAD269FB4D4FE5F6C.jpg" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" alt="avatar">`;

        return `<div class="sms-list-item" data-phone="${phone}" onclick="openSmsDetail('${phone}')">
            <div class="sms-list-avatar">${avatarHtml}</div>
            <div class="sms-list-info">
                <div class="sms-list-top">
                    <div class="sms-list-name">${escapeHtml(displayName)}</div>
                    <div class="sms-list-time">${timeStr}</div>
                </div>
                <div class="sms-list-preview">${escapeHtml(preview)}</div>
            </div>
            <div class="sms-list-arrow">›</div>
        </div>`;
    }).join('');
    
    // 添加长按和右键事件监听
    attachSmsItemContextMenu();
}

// 添加短信列表项的长按和右键事件
function attachSmsItemContextMenu() {
    const items = document.querySelectorAll('.sms-list-item');
    
    items.forEach(item => {
        const phone = item.dataset.phone;
        let longPressTimer = null;
        
        // 长按事件（移动端）
        item.addEventListener('touchstart', (e) => {
            longPressTimer = setTimeout(() => {
                e.preventDefault();
                showSmsContextMenu(phone, e.touches[0].clientX, e.touches[0].clientY);
            }, 500); // 500ms 长按
        });
        
        item.addEventListener('touchend', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
        
        item.addEventListener('touchmove', () => {
            if (longPressTimer) {
                clearTimeout(longPressTimer);
                longPressTimer = null;
            }
        });
        
        // 右键事件（PC端）
        item.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showSmsContextMenu(phone, e.clientX, e.clientY);
        });
    });
}

// 显示短信上下文菜单
function showSmsContextMenu(phone, x, y) {
    // 移除已存在的菜单
    const existingMenu = document.getElementById('smsContextMenu');
    if (existingMenu) existingMenu.remove();
    
    // 创建菜单
    const menu = document.createElement('div');
    menu.id = 'smsContextMenu';
    menu.className = 'sms-context-menu';
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    const contact = getContactByPhone(phone);
    const displayName = contact?.name || phone || '未知';
    
    menu.innerHTML = `
        <div class="sms-context-menu-header">${escapeHtml(displayName)}</div>
        <div class="sms-context-menu-item" onclick="hideSmsFromMenu('${phone}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <line x1="4" y1="4" x2="20" y2="20" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>隐藏会话</span>
        </div>
        <div class="sms-context-menu-item danger" onclick="deleteSmsFromMenu('${phone}')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>删除会话</span>
        </div>
    `;
    
    document.body.appendChild(menu);
    
    // 调整位置，确保不超出屏幕
    setTimeout(() => {
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            menu.style.left = (window.innerWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > window.innerHeight) {
            menu.style.top = (window.innerHeight - rect.height - 10) + 'px';
        }
    }, 0);
    
    // 显示动画
    setTimeout(() => menu.classList.add('show'), 10);
    
    // 点击其他地方关闭菜单
    setTimeout(() => {
        document.addEventListener('click', closeSmsContextMenu);
        document.addEventListener('touchstart', closeSmsContextMenu);
    }, 100);
}

// 关闭上下文菜单
function closeSmsContextMenu() {
    const menu = document.getElementById('smsContextMenu');
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 200);
    }
    document.removeEventListener('click', closeSmsContextMenu);
    document.removeEventListener('touchstart', closeSmsContextMenu);
}

// 从菜单隐藏会话
function hideSmsFromMenu(phone) {
    closeSmsContextMenu();
    hideSmsConversation(phone);
    renderSmsList();
    showToast('已隐藏会话');
}

// 从菜单删除会话
async function deleteSmsFromMenu(phone) {
    closeSmsContextMenu();
    
    const contact = getContactByPhone(phone);
    const displayName = contact?.name || phone || '未知';
    
    const confirmed = await iosConfirm(`确定要删除与 ${displayName} 的所有消息吗？`, '删除会话');
    if (!confirmed) return;
    
    deleteSmsConversation(phone);
    renderSmsList();
    showToast('已删除会话');
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

    // 只对陌生号码（不在联系人列表中）显示"疑似垃圾信息"提示
    if (!isInContacts(currentSmsPhone)) {
        html += `<div class="sms-not-in-contacts">
            发件人不在你的联系人列表中。<br>
            <a href="javascript:void(0)" onclick="reportSpam('${currentSmsPhone}')">报告垃圾信息</a> | 
            <a href="javascript:void(0)" onclick="addContactFromSms('${currentSmsPhone}')">添加到联系人</a>
        </div>`;
    }

    container.innerHTML = html;

    // 滚动到底部
    setTimeout(() => {
        container.scrollTop = container.scrollHeight;
    }, 50);
}

// 从短信界面添加联系人
function addContactFromSms(phone) {
    if (addToContacts(phone)) {
        showToast('已添加到联系人');
        renderSmsMessages(); // 重新渲染，隐藏提示
    } else {
        showToast('该号码已在联系人中');
    }
}

// 报告垃圾信息
function reportSpam(phone) {
    showToast('已报告垃圾信息');
    // 这里可以添加更多逻辑，比如标记为垃圾号码等
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

    // 当用户发送消息时，自动将对方添加到联系人
    if (!isInContacts(currentSmsPhone)) {
        addToContacts(currentSmsPhone);
    }

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

    // 当用户发送消息时，自动将对方添加到联系人
    if (!isInContacts(phone)) {
        addToContacts(phone);
    }

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

// ========== 账单功能 ==========

// 显示账单页面
function showBillsPage() {
    const page = document.getElementById('billsPage');
    if (!page) {
        createBillsPage();
    }
    
    // 初始化账单数据
    initBillsData();
    
    // 渲染账单列表
    renderBillsList();
    
    document.getElementById('billsPage').classList.add('active');
}

// 创建账单页面
function createBillsPage() {
    const page = document.createElement('div');
    page.id = 'billsPage';
    page.className = 'settings-page';
    page.style.zIndex = '1500';
    
    page.innerHTML = `
        <div class="wallet-page-inner">
            <div class="wallet-header">
                <div class="wallet-back-btn" onclick="closeBillsPage()">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                </div>
                <div class="wallet-header-title">账单</div>
                <div style="width:40px;"></div>
            </div>

            <!-- 账户选择器 -->
            <div style="margin:16px;padding:16px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="display:flex;align-items:center;justify-content:space-between;cursor:pointer;" onclick="showAccountSelector()">
                    <div>
                        <div style="font-size:12px;color:#999;margin-bottom:4px;">当前账户</div>
                        <div id="currentAccountName" style="font-size:15px;font-weight:600;color:#333;">钱包余额</div>
                    </div>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
            </div>

            <!-- 余额卡片 -->
            <div style="margin:0 16px 16px;padding:20px;background:#fff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
                <div style="text-align:center;margin-bottom:16px;">
                    <div style="font-size:12px;color:#999;margin-bottom:6px;">账户余额</div>
                    <div id="billsBalance" style="font-size:32px;font-weight:700;color:#333;">¥0.00</div>
                </div>
                <div style="display:flex;gap:12px;">
                    <div style="flex:1;text-align:center;padding:12px;background:#f8f8f8;border-radius:12px;">
                        <div style="font-size:11px;color:#999;margin-bottom:4px;">本月收入</div>
                        <div id="billsIncome" style="font-size:16px;font-weight:600;color:#52c41a;">¥0.00</div>
                    </div>
                    <div style="flex:1;text-align:center;padding:12px;background:#f8f8f8;border-radius:12px;">
                        <div style="font-size:11px;color:#999;margin-bottom:4px;">本月支出</div>
                        <div id="billsExpense" style="font-size:16px;font-weight:600;color:#ff4d4f;">¥0.00</div>
                    </div>
                </div>
            </div>

            <!-- 筛选器 -->
            <div style="margin:0 16px 12px;display:flex;gap:8px;overflow-x:auto;padding:4px 0;">
                <button class="bills-filter-btn active" data-type="all" onclick="filterBillsByType('all')">全部</button>
                <button class="bills-filter-btn" data-type="income" onclick="filterBillsByType('income')">收入</button>
                <button class="bills-filter-btn" data-type="expense" onclick="filterBillsByType('expense')">支出</button>
                <button class="bills-filter-btn" onclick="showDatePicker()">
                    <span id="dateFilterText">选择日期</span>
                </button>
            </div>

            <!-- 账单列表 -->
            <div id="billsListContainer" style="margin:0 16px 80px;"></div>
        </div>
    `;
    
    document.body.appendChild(page);
}

// 关闭账单页面
function closeBillsPage() {
    document.getElementById('billsPage').classList.remove('active');
}

// 初始化账单数据
function initBillsData() {
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    
    // 如果没有账单数据，初始化
    if (!walletData.bills) {
        walletData.bills = [];
        localStorage.setItem('walletData', JSON.stringify(walletData));
    }
    
    // 如果没有当前选中的账户，默认选择余额
    if (!localStorage.getItem('currentBillAccount')) {
        localStorage.setItem('currentBillAccount', JSON.stringify({ type: 'balance', name: '钱包余额' }));
    }
}

// 添加账单记录
function addBillRecord(type, amount, remark, accountType = 'balance', accountIndex = null) {
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    
    if (!walletData.bills) {
        walletData.bills = [];
    }
    
    const bill = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: type, // 'income' 或 'expense'
        amount: Math.round(amount * 100) / 100,
        remark: remark || (type === 'income' ? '收入' : '支出'),
        accountType: accountType, // 'balance', 'yuebao', 'bankcard'
        accountIndex: accountIndex, // 银行卡索引（如果是银行卡）
        timestamp: new Date().toISOString(),
        status: 'completed' // 'completed', 'refunded', 'pending'
    };
    
    walletData.bills.push(bill);
    localStorage.setItem('walletData', JSON.stringify(walletData));
    
    return bill;
}

// 添加退款记录
function addRefundRecord(originalBillId) {
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    
    // 找到原始账单
    const originalBill = walletData.bills.find(b => b.id === originalBillId);
    if (!originalBill) return;
    
    // 标记原始账单为已退款
    originalBill.status = 'refunded';
    
    // 创建退款记录
    const refundBill = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: originalBill.type === 'expense' ? 'income' : 'expense',
        amount: originalBill.amount,
        remark: `退款：${originalBill.remark}`,
        accountType: originalBill.accountType,
        accountIndex: originalBill.accountIndex,
        timestamp: new Date().toISOString(),
        status: 'completed',
        isRefund: true,
        originalBillId: originalBillId
    };
    
    walletData.bills.push(refundBill);
    localStorage.setItem('walletData', JSON.stringify(walletData));
    
    return refundBill;
}

// 渲染账单列表
function renderBillsList() {
    const currentAccount = JSON.parse(localStorage.getItem('currentBillAccount') || '{"type":"balance","name":"钱包余额"}');
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    
    // 更新账户名称
    document.getElementById('currentAccountName').textContent = currentAccount.name;
    
    // 获取当前账户余额
    let balance = 0;
    if (currentAccount.type === 'balance') {
        balance = walletData.balance || 0;
    } else if (currentAccount.type === 'yuebao') {
        balance = walletData.yuebaoAmount || 0;
    } else if (currentAccount.type === 'bankcard' && currentAccount.index !== undefined) {
        const card = walletData.bankCards?.[currentAccount.index];
        balance = card?.balance || 0;
    }
    
    document.getElementById('billsBalance').textContent = `¥${balance.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // 获取筛选条件
    const filterType = document.querySelector('.bills-filter-btn.active')?.dataset.type || 'all';
    const dateFilter = localStorage.getItem('billsDateFilter');
    
    // 筛选账单
    let bills = (walletData.bills || []).filter(bill => {
        // 账户筛选
        if (currentAccount.type === 'balance' && bill.accountType !== 'balance') return false;
        if (currentAccount.type === 'yuebao' && bill.accountType !== 'yuebao') return false;
        if (currentAccount.type === 'bankcard' && (bill.accountType !== 'bankcard' || bill.accountIndex !== currentAccount.index)) return false;
        
        // 类型筛选
        if (filterType !== 'all' && bill.type !== filterType) return false;
        
        // 日期筛选
        if (dateFilter) {
            const billDate = new Date(bill.timestamp);
            const filter = JSON.parse(dateFilter);
            
            if (filter.year && billDate.getFullYear() !== filter.year) return false;
            if (filter.month !== undefined && billDate.getMonth() !== filter.month) return false;
            if (filter.date && billDate.getDate() !== filter.date) return false;
        }
        
        return true;
    });
    
    // 按时间倒序排序
    bills.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // 计算本月收支
    const now = new Date();
    const thisMonth = bills.filter(bill => {
        const billDate = new Date(bill.timestamp);
        return billDate.getFullYear() === now.getFullYear() && billDate.getMonth() === now.getMonth();
    });
    
    const income = thisMonth.filter(b => b.type === 'income' && b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
    const expense = thisMonth.filter(b => b.type === 'expense' && b.status === 'completed').reduce((sum, b) => sum + b.amount, 0);
    
    document.getElementById('billsIncome').textContent = `¥${income.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    document.getElementById('billsExpense').textContent = `¥${expense.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    
    // 渲染列表
    const container = document.getElementById('billsListContainer');
    
    if (bills.length === 0) {
        container.innerHTML = `
            <div style="text-align:center;padding:60px 20px;color:#999;">
                <div style="font-size:48px;margin-bottom:12px;">📋</div>
                <div style="font-size:14px;">暂无账单记录</div>
            </div>
        `;
        return;
    }
    
    // 按日期分组
    const grouped = {};
    bills.forEach(bill => {
        const date = new Date(bill.timestamp);
        const dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        
        if (!grouped[dateKey]) {
            grouped[dateKey] = [];
        }
        grouped[dateKey].push(bill);
    });
    
    // 渲染分组
    let html = '';
    Object.keys(grouped).sort((a, b) => b.localeCompare(a)).forEach(dateKey => {
        const dateBills = grouped[dateKey];
        const date = new Date(dateKey);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        let dateLabel = dateKey;
        if (dateKey === `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`) {
            dateLabel = '今天';
        } else if (dateKey === `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`) {
            dateLabel = '昨天';
        } else {
            dateLabel = `${date.getMonth() + 1}月${date.getDate()}日`;
        }
        
        html += `
            <div style="margin-bottom:20px;">
                <div style="font-size:13px;font-weight:600;color:#666;margin-bottom:8px;padding:0 4px;">${dateLabel}</div>
                <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.04);">
        `;
        
        dateBills.forEach((bill, index) => {
            const time = new Date(bill.timestamp);
            const timeStr = `${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}`;
            const isIncome = bill.type === 'income';
            const amountColor = isIncome ? '#52c41a' : '#333';
            const amountPrefix = isIncome ? '+' : '-';
            const statusText = bill.status === 'refunded' ? '（已退款）' : bill.isRefund ? '（退款）' : '';
            
            html += `
                <div style="display:flex;align-items:center;padding:14px 16px;${index < dateBills.length - 1 ? 'border-bottom:1px solid #f5f5f5;' : ''}">
                    <div style="flex:1;">
                        <div style="font-size:14px;font-weight:500;color:#333;margin-bottom:2px;">${escapeHtml(bill.remark)}${statusText}</div>
                        <div style="font-size:12px;color:#999;">${timeStr}</div>
                    </div>
                    <div style="text-align:right;">
                        <div style="font-size:16px;font-weight:600;color:${amountColor};">${amountPrefix}¥${bill.amount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                    </div>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 按类型筛选
function filterBillsByType(type) {
    // 更新按钮状态
    document.querySelectorAll('.bills-filter-btn[data-type]').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`.bills-filter-btn[data-type="${type}"]`).classList.add('active');
    
    // 重新渲染
    renderBillsList();
}

// 显示账户选择器
function showAccountSelector() {
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const currentAccount = JSON.parse(localStorage.getItem('currentBillAccount') || '{"type":"balance"}');
    
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';
    dialog.style.maxHeight = '70vh';
    dialog.style.overflowY = 'auto';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择账户';
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons vertical';
    
    // 钱包余额
    const balanceBtn = document.createElement('button');
    balanceBtn.className = 'ios-dialog-button' + (currentAccount.type === 'balance' ? ' primary' : '');
    balanceBtn.innerHTML = `
        <div style="text-align:left;padding:4px 0;">
            <div style="font-weight:600;font-size:15px;color:#333;margin-bottom:2px;">钱包余额</div>
            <div style="font-size:13px;color:#666;">¥${(walletData.balance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
    `;
    balanceBtn.onclick = () => {
        selectAccount({ type: 'balance', name: '钱包余额' });
        closeDialog();
    };
    buttonsEl.appendChild(balanceBtn);
    
    // 余额宝
    if (walletData.yuebaoAmount > 0) {
        const yuebaoBtn = document.createElement('button');
        yuebaoBtn.className = 'ios-dialog-button' + (currentAccount.type === 'yuebao' ? ' primary' : '');
        yuebaoBtn.innerHTML = `
            <div style="text-align:left;padding:4px 0;">
                <div style="font-weight:600;font-size:15px;color:#333;margin-bottom:2px;">余额宝</div>
                <div style="font-size:13px;color:#666;">¥${walletData.yuebaoAmount.toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            </div>
        `;
        yuebaoBtn.onclick = () => {
            selectAccount({ type: 'yuebao', name: '余额宝' });
            closeDialog();
        };
        buttonsEl.appendChild(yuebaoBtn);
    }
    
    // 银行卡
    if (walletData.bankCards && walletData.bankCards.length > 0) {
        walletData.bankCards.forEach((card, index) => {
            const cardNumber = card.number || card.cardNumber || '0000000000000000';
            const last4 = cardNumber.slice(-4);
            const isSelected = currentAccount.type === 'bankcard' && currentAccount.index === index;
            
            const cardBtn = document.createElement('button');
            cardBtn.className = 'ios-dialog-button' + (isSelected ? ' primary' : '');
            cardBtn.innerHTML = `
                <div style="text-align:left;padding:4px 0;">
                    <div style="font-weight:600;font-size:15px;color:#333;margin-bottom:2px;">${escapeHtml(card.name || '银行卡')}</div>
                    <div style="font-size:13px;color:#666;">**** ${last4} · ¥${(card.balance || 0).toLocaleString('zh-CN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
            `;
            cardBtn.onclick = () => {
                selectAccount({ type: 'bankcard', name: card.name || '银行卡', index: index });
                closeDialog();
            };
            buttonsEl.appendChild(cardBtn);
        });
    }
    
    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    buttonsEl.appendChild(cancelBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    }
}

// 选择账户
function selectAccount(account) {
    localStorage.setItem('currentBillAccount', JSON.stringify(account));
    renderBillsList();
}

// 显示日期选择器
function showDatePicker() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '选择日期';
    
    const formWrap = document.createElement('div');
    formWrap.style.cssText = 'padding:12px 16px 16px;';
    
    // 年份选择
    const yearLabel = document.createElement('div');
    yearLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    yearLabel.textContent = '年份';
    const yearSelect = document.createElement('select');
    yearSelect.id = 'billYearSelect';
    yearSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;background:#fff;';
    
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y >= currentYear - 10; y--) {
        const opt = document.createElement('option');
        opt.value = y;
        opt.textContent = `${y}年`;
        yearSelect.appendChild(opt);
    }
    
    // 月份选择
    const monthLabel = document.createElement('div');
    monthLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    monthLabel.textContent = '月份（可选）';
    const monthSelect = document.createElement('select');
    monthSelect.id = 'billMonthSelect';
    monthSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;margin-bottom:12px;background:#fff;';
    
    const allMonthOpt = document.createElement('option');
    allMonthOpt.value = '';
    allMonthOpt.textContent = '全年';
    monthSelect.appendChild(allMonthOpt);
    
    for (let m = 1; m <= 12; m++) {
        const opt = document.createElement('option');
        opt.value = m - 1;
        opt.textContent = `${m}月`;
        monthSelect.appendChild(opt);
    }
    
    // 日期选择
    const dateLabel = document.createElement('div');
    dateLabel.style.cssText = 'font-size:12px;color:#999;margin-bottom:6px;';
    dateLabel.textContent = '日期（可选）';
    const dateSelect = document.createElement('select');
    dateSelect.id = 'billDateSelect';
    dateSelect.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;color:#333;outline:none;box-sizing:border-box;background:#fff;';
    
    const allDateOpt = document.createElement('option');
    allDateOpt.value = '';
    allDateOpt.textContent = '全月';
    dateSelect.appendChild(allDateOpt);
    
    for (let d = 1; d <= 31; d++) {
        const opt = document.createElement('option');
        opt.value = d;
        opt.textContent = `${d}日`;
        dateSelect.appendChild(opt);
    }
    
    formWrap.appendChild(yearLabel);
    formWrap.appendChild(yearSelect);
    formWrap.appendChild(monthLabel);
    formWrap.appendChild(monthSelect);
    formWrap.appendChild(dateLabel);
    formWrap.appendChild(dateSelect);
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    
    const clearBtn = document.createElement('button');
    clearBtn.className = 'ios-dialog-button';
    clearBtn.textContent = '清除筛选';
    clearBtn.onclick = () => {
        localStorage.removeItem('billsDateFilter');
        document.getElementById('dateFilterText').textContent = '选择日期';
        closeDialog();
        renderBillsList();
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ios-dialog-button primary';
    confirmBtn.textContent = '确定';
    confirmBtn.onclick = () => {
        const year = parseInt(document.getElementById('billYearSelect').value);
        const monthVal = document.getElementById('billMonthSelect').value;
        const dateVal = document.getElementById('billDateSelect').value;
        
        const filter = { year };
        if (monthVal !== '') filter.month = parseInt(monthVal);
        if (dateVal !== '') filter.date = parseInt(dateVal);
        
        localStorage.setItem('billsDateFilter', JSON.stringify(filter));
        
        // 更新按钮文字
        let text = `${year}年`;
        if (filter.month !== undefined) text += `${filter.month + 1}月`;
        if (filter.date) text += `${filter.date}日`;
        document.getElementById('dateFilterText').textContent = text;
        
        closeDialog();
        renderBillsList();
    };
    
    buttonsEl.appendChild(clearBtn);
    buttonsEl.appendChild(confirmBtn);
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

// 修改钱包充值函数，添加账单记录
const originalRecharge = window.recharge;
window.recharge = function() {
    iosPrompt('充值金额', '', (val) => {
        const amount = parseFloat(val);
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        const data = JSON.parse(localStorage.getItem('walletData'));
        data.balance = Math.round((data.balance + amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(data));
        
        // 添加账单记录
        addBillRecord('income', amount, '充值', 'balance');
        
        updateWalletUI(data);
        showToast('充值成功 ¥' + amount.toFixed(2));
    });
};

// 修改钱包提现函数，添加账单记录
const originalWithdraw = window.withdraw;
window.withdraw = function() {
    const data = JSON.parse(localStorage.getItem('walletData'));
    if (data.balance <= 0) {
        showToast('余额不足');
        return;
    }
    const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    iosPrompt(`提现金额（可用 ¥${fmt(data.balance)}）`, '', (val) => {
        const amount = parseFloat(val);
        const d = JSON.parse(localStorage.getItem('walletData'));
        if (isNaN(amount) || amount <= 0) {
            showIosAlert('提示', '请输入有效金额');
            return;
        }
        if (amount > d.balance) {
            showIosAlert('提示', '余额不足');
            return;
        }
        d.balance = Math.round((d.balance - amount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(d));
        
        // 添加账单记录
        addBillRecord('expense', amount, '提现', 'balance');
        
        updateWalletUI(d);
        showToast('提现成功 ¥' + amount.toFixed(2));
    });
};

// 标记script2.js已加载完成
window.script2Loaded = true;

// ========== 引用消息功能 ==========

// 渲染引用消息到聊天界面
function appendQuoteMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');

    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();

    // 获取角色头像
    let avatar = '';
    if (currentChatCharacter && currentChatCharacter.avatar) {
        avatar = currentChatCharacter.avatar;
    }

    const time = formatMessageTime(messageObj.timestamp);
    const quotedSender = messageObj.quotedSender || '未知';
    const quotedContent = messageObj.quotedContent || '';
    
    // 构建引用预览HTML（和用户引用消息一样的样式）
    const quotedText = quotedContent.length > 30 
        ? quotedContent.substring(0, 30) + '...' 
        : quotedContent;
    const quoteHtml = `
        <div class="chat-quote-preview">
            <span class="chat-quote-sender">${escapeHtml(quotedSender)}</span>: ${escapeHtml(quotedText)}
        </div>
    `;

    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message chat-message-char';
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;

    // 使用消息的实际内容作为回复内容
    const replyContent = messageObj.content || '（引用了这条消息）';

    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-message-bubble">
                ${escapeHtml(replyContent)}
            </div>
            ${quoteHtml}
            <div class="chat-message-time">${time}</div>
        </div>
    `;

    container.appendChild(messageEl);
}
