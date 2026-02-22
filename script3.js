// ========== script3.js - 挂坠功能模块 ==========

// ========== 挂坠数据管理 ==========

// 获取挂坠配置
function getPendantConfig() {
    const config = localStorage.getItem('pendantConfig');
    return config ? JSON.parse(config) : {
        enabled: false,
        imageUrl: '',
        imageType: 'url', // 'url' 或 'local'
        position: { x: 50, y: 20 }, // 百分比位置
        size: 60, // 像素大小
        animation: 'swing-medium', // 动画预设
        customAnimation: '', // 自定义动画CSS
        visible: true
    };
}

// 保存挂坠配置
function savePendantConfig(config) {
    localStorage.setItem('pendantConfig', JSON.stringify(config));
}

// 获取自定义动画预设列表
function getCustomAnimationPresets() {
    const presets = localStorage.getItem('pendantAnimationPresets');
    return presets ? JSON.parse(presets) : [];
}

// 保存自定义动画预设列表
function saveCustomAnimationPresets(presets) {
    localStorage.setItem('pendantAnimationPresets', JSON.stringify(presets));
}

// ========== 挂坠渲染 ==========

// 初始化挂坠
function initPendant() {
    const config = getPendantConfig();
    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }
}

// 渲染挂坠到主屏幕
function renderPendant(config) {
    // 移除旧的挂坠
    const oldPendant = document.getElementById('screenPendant');
    if (oldPendant) {
        oldPendant.remove();
    }

    if (!config.enabled || !config.imageUrl || !config.visible) {
        return;
    }

    // 创建挂坠元素
    const pendant = document.createElement('div');
    pendant.id = 'screenPendant';
    pendant.className = 'screen-pendant';
    pendant.style.cssText = `
        position: absolute;
        left: ${config.position.x}%;
        top: ${config.position.y}%;
        width: ${config.size}px;
        height: ${config.size}px;
        transform: translate(-50%, -50%);
        z-index: 100;
        pointer-events: none;
        user-select: none;
    `;

    const img = document.createElement('img');
    img.src = config.imageUrl;
    img.style.cssText = `
        width: 100%;
        height: 100%;
        object-fit: contain;
    `;
    img.onerror = () => {
        console.error('挂坠图片加载失败');
        pendant.remove();
    };

    pendant.appendChild(img);

    // 应用动画
    applyPendantAnimation(pendant, config);

    // 添加到主屏幕
    const mainScreen = document.querySelector('.main-screen');
    if (mainScreen) {
        mainScreen.appendChild(pendant);
    }
}

// 应用挂坠动画
function applyPendantAnimation(element, config) {
    // 移除旧的动画类
    element.className = 'screen-pendant';

    // 移除旧的自定义动画样式
    const oldStyle = document.getElementById('pendantCustomAnimationStyle');
    if (oldStyle) {
        oldStyle.remove();
    }

    if (config.customAnimation) {
        // 使用自定义动画
        const style = document.createElement('style');
        style.id = 'pendantCustomAnimationStyle';
        style.textContent = config.customAnimation;
        document.head.appendChild(style);
    } else if (config.animation && config.animation !== 'none') {
        // 使用预设动画
        element.classList.add(`pendant-anim-${config.animation}`);
    }
}

// ========== 挂坠设置界面 ==========

// 打开挂坠图片选择（本地上传）
function openPendantImageUpload() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 压缩图片
            const compressedData = await compressImage(file, {
                maxWidth: 200,
                maxHeight: 200,
                quality: 0.8,
                maxSizeKB: 100
            });

            // 更新预览
            document.getElementById('pendantImagePreview').src = compressedData;
            document.getElementById('pendantImagePreview').style.display = 'block';
            document.getElementById('pendantImagePlaceholder').style.display = 'none';

            // 保存到配置（临时）
            const config = getPendantConfig();
            config.imageUrl = compressedData;
            config.imageType = 'local';
            savePendantConfig(config);

            showToast('图片已上传');
        } catch (error) {
            console.error('图片上传失败:', error);
            showToast('图片上传失败');
        }
    };
    input.click();
}

// 从URL加载挂坠图片
function loadPendantImageFromUrl() {
    const url = document.getElementById('pendantImageUrlInput').value.trim();
    if (!url) {
        showToast('请输入图片URL');
        return;
    }

    // 更新预览
    const preview = document.getElementById('pendantImagePreview');
    preview.src = url;
    preview.style.display = 'block';
    document.getElementById('pendantImagePlaceholder').style.display = 'none';

    preview.onerror = () => {
        showToast('图片加载失败');
        preview.style.display = 'none';
        document.getElementById('pendantImagePlaceholder').style.display = 'flex';
    };

    preview.onload = () => {
        // 保存到配置（临时）
        const config = getPendantConfig();
        config.imageUrl = url;
        config.imageType = 'url';
        savePendantConfig(config);
        showToast('图片已加载');
    };
}

// 重置挂坠图片
function resetPendantImage() {
    const config = getPendantConfig();
    config.imageUrl = '';
    config.imageType = 'url';
    savePendantConfig(config);

    document.getElementById('pendantImagePreview').style.display = 'none';
    document.getElementById('pendantImagePreview').src = '';
    document.getElementById('pendantImagePlaceholder').style.display = 'flex';
    document.getElementById('pendantImageUrlInput').value = '';

    // 移除主屏幕上的挂坠
    const pendant = document.getElementById('screenPendant');
    if (pendant) {
        pendant.remove();
    }

    showToast('挂坠图片已重置');
}

// 更新挂坠位置
function updatePendantPosition() {
    const x = parseInt(document.getElementById('pendantPositionX').value);
    const y = parseInt(document.getElementById('pendantPositionY').value);

    const config = getPendantConfig();
    config.position = { x, y };
    savePendantConfig(config);

    // 实时更新预览
    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }
}

// 更新挂坠大小
function updatePendantSize() {
    const size = parseInt(document.getElementById('pendantSizeInput').value);

    const config = getPendantConfig();
    config.size = size;
    savePendantConfig(config);

    document.getElementById('pendantSizeValue').textContent = size + 'px';

    // 实时更新预览
    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }
}

// 切换挂坠动画预设
function changePendantAnimation() {
    const animation = document.getElementById('pendantAnimationSelect').value;

    const config = getPendantConfig();
    config.animation = animation;
    config.customAnimation = ''; // 清空自定义动画
    savePendantConfig(config);

    // 实时更新预览
    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }
}

// 保存挂坠设置
function savePendantSettings() {
    const config = getPendantConfig();
    config.enabled = true;

    if (!config.imageUrl) {
        showToast('请先上传挂坠图片');
        return;
    }

    savePendantConfig(config);
    renderPendant(config);
    showToast('挂坠设置已保存');
}

// 切换挂坠显示/隐藏
function togglePendantVisibility() {
    const toggle = document.getElementById('pendantVisibilityToggle');
    const config = getPendantConfig();
    config.visible = toggle.checked;
    savePendantConfig(config);

    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }
}

// ========== 自定义动画管理 ==========

// 打开自定义动画编辑器
function openCustomAnimationEditor() {
    const config = getPendantConfig();
    document.getElementById('customAnimationCodeInput').value = config.customAnimation || '';
    document.getElementById('customAnimationSection').style.display = 'block';
}

// 关闭自定义动画编辑器
function closeCustomAnimationEditor() {
    document.getElementById('customAnimationSection').style.display = 'none';
}

// 应用自定义动画
function applyCustomAnimation() {
    const code = document.getElementById('customAnimationCodeInput').value.trim();

    const config = getPendantConfig();
    config.customAnimation = code;
    config.animation = 'custom'; // 标记为自定义
    savePendantConfig(config);

    // 实时预览
    if (config.enabled && config.imageUrl) {
        renderPendant(config);
    }

    showToast('自定义动画已应用');
}

// 保存自定义动画为预设
function saveCustomAnimationPreset() {
    const code = document.getElementById('customAnimationCodeInput').value.trim();
    if (!code) {
        showToast('请先输入动画代码');
        return;
    }

    iosPrompt('预设名称', '', (name) => {
        if (!name || !name.trim()) {
            showToast('预设名称不能为空');
            return;
        }

        const presets = getCustomAnimationPresets();
        const preset = {
            id: Date.now().toString(),
            name: name.trim(),
            code: code,
            createdAt: new Date().toISOString()
        };

        presets.push(preset);
        saveCustomAnimationPresets(presets);

        renderCustomAnimationPresetList();
        showToast('预设已保存');
    });
}

// 渲染自定义动画预设列表
function renderCustomAnimationPresetList() {
    const presets = getCustomAnimationPresets();
    const container = document.getElementById('customAnimationPresetList');

    if (presets.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px 20px;">
                <div style="font-size: 14px; margin-bottom: 8px;">暂无预设</div>
                <div style="font-size: 12px; color: #bbb;">保存自定义动画后将显示在这里</div>
            </div>
        `;
        return;
    }

    container.innerHTML = presets.map(preset => `
        <div class="animation-preset-item" data-preset-id="${preset.id}">
            <input type="checkbox" onclick="event.stopPropagation()">
            <div style="flex: 1;">
                <div style="font-size: 14px; color: #333; margin-bottom: 4px; font-weight: 500;">${escapeHtml(preset.name)}</div>
                <div style="font-size: 11px; color: #999;">${new Date(preset.createdAt).toLocaleString('zh-CN')}</div>
            </div>
            <div style="display: flex; gap: 8px;">
                <button class="preset-action-btn" onclick="loadAnimationPreset('${preset.id}')">加载</button>
                <button class="preset-action-btn danger" onclick="deleteAnimationPreset('${preset.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 加载动画预设
function loadAnimationPreset(presetId) {
    const presets = getCustomAnimationPresets();
    const preset = presets.find(p => p.id === presetId);

    if (!preset) {
        showToast('预设不存在');
        return;
    }

    document.getElementById('customAnimationCodeInput').value = preset.code;
    showToast('预设已加载');
}

// 删除动画预设
async function deleteAnimationPreset(presetId) {
    const confirmed = await iosConfirm('确定要删除这个预设吗？', '删除预设');
    if (!confirmed) return;

    const presets = getCustomAnimationPresets();
    const filtered = presets.filter(p => p.id !== presetId);
    saveCustomAnimationPresets(filtered);

    renderCustomAnimationPresetList();
    showToast('预设已删除');
}

// 批量删除动画预设
async function batchDeleteAnimationPresets() {
    const checkboxes = document.querySelectorAll('.animation-preset-item input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        showToast('请先选择要删除的预设');
        return;
    }

    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 个预设吗？`, '批量删除');
    if (!confirmed) return;

    const presets = getCustomAnimationPresets();
    const idsToDelete = Array.from(checkboxes).map(cb => cb.closest('.animation-preset-item').dataset.presetId);
    const filtered = presets.filter(p => !idsToDelete.includes(p.id));
    saveCustomAnimationPresets(filtered);

    renderCustomAnimationPresetList();
    showToast(`已删除 ${idsToDelete.length} 个预设`);
}

// 全选/取消全选动画预设
function toggleSelectAllAnimationPresets() {
    const checkboxes = document.querySelectorAll('.animation-preset-item input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);

    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// ========== 初始化挂坠设置界面 ==========

function initPendantSettings() {
    const config = getPendantConfig();

    // 图片预览
    if (config.imageUrl) {
        document.getElementById('pendantImagePreview').src = config.imageUrl;
        document.getElementById('pendantImagePreview').style.display = 'block';
        document.getElementById('pendantImagePlaceholder').style.display = 'none';
    }

    // 位置
    document.getElementById('pendantPositionX').value = config.position.x;
    document.getElementById('pendantPositionY').value = config.position.y;
    document.getElementById('pendantPositionXValue').textContent = config.position.x + '%';
    document.getElementById('pendantPositionYValue').textContent = config.position.y + '%';

    // 大小
    document.getElementById('pendantSizeInput').value = config.size;
    document.getElementById('pendantSizeValue').textContent = config.size + 'px';

    // 动画
    document.getElementById('pendantAnimationSelect').value = config.animation;

    // 显示/隐藏
    document.getElementById('pendantVisibilityToggle').checked = config.visible;

    // 渲染预设列表
    renderCustomAnimationPresetList();
}

// ========== 发送动画功能 ==========

/**
 * 初始化发送动画设置
 */
function initSendAnimationSettings() {
    const toggle = document.getElementById('sendAnimationToggle');
    if (!toggle) return;
    
    // 读取设置，默认关闭
    const animationEnabled = localStorage.getItem('sendAnimationEnabled');
    toggle.checked = animationEnabled === 'true'; // 默认false
}

/**
 * 切换发送动画开关
 */
function toggleSendAnimation() {
    const toggle = document.getElementById('sendAnimationToggle');
    const isEnabled = toggle.checked;
    
    // 保存设置
    localStorage.setItem('sendAnimationEnabled', isEnabled.toString());
    
    if (isEnabled) {
        showToast('发送动画已开启');
    } else {
        showToast('发送动画已关闭');
    }
}

/**
 * 为新添加的消息气泡添加飞入动画
 * @param {HTMLElement} messageElement - 消息气泡元素
 */
function addMessageSendAnimation(messageElement) {
    const enabled = localStorage.getItem('sendAnimationEnabled') === 'true';
    
    if (!enabled || !messageElement) {
        return;
    }
    
    // 添加动画类
    messageElement.classList.add('message-send-animation');
    
    // 动画完成后移除类（避免影响后续操作）
    messageElement.addEventListener('animationend', () => {
        messageElement.classList.remove('message-send-animation');
    }, { once: true });
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    initPendant();
});

// ========== 格式修正功能 ==========

/**
 * 初始化格式修正设置
 */
function initFormatFixSettings() {
    const toggle = document.getElementById('autoFormatFixToggle');
    if (!toggle) return;
    
    // 读取设置，默认开启
    const autoFixEnabled = localStorage.getItem('autoFormatFixEnabled');
    toggle.checked = autoFixEnabled !== 'false'; // 默认true
}

/**
 * 切换自动格式修正开关
 */
function toggleAutoFormatFix() {
    const toggle = document.getElementById('autoFormatFixToggle');
    const isEnabled = toggle.checked;
    
    // 保存设置
    localStorage.setItem('autoFormatFixEnabled', isEnabled.toString());
    
    if (isEnabled) {
        showToast('自动格式修正已开启');
    } else {
        showToast('自动格式修正已关闭');
    }
}

/**
 * 检查是否启用自动格式修正
 */
function isAutoFormatFixEnabled() {
    const enabled = localStorage.getItem('autoFormatFixEnabled');
    return enabled !== 'false'; // 默认开启
}

/**
 * 验证消息格式是否规范
 * @param {Array} messages - 消息数组
 * @returns {Object} { valid: boolean, error: string }
 */
function validateMessageFormat(messages) {
    if (!Array.isArray(messages)) {
        return { valid: false, error: '不是数组格式' };
    }
    
    if (messages.length === 0) {
        return { valid: false, error: '消息数组为空' };
    }
    
    // 检查每条消息是否为字符串
    for (let i = 0; i < messages.length; i++) {
        if (typeof messages[i] !== 'string') {
            return { valid: false, error: `第${i + 1}条消息不是字符串` };
        }
    }
    
    return { valid: true, error: '' };
}

/**
 * 调用AI修正格式
 * @param {string} rawResponse - AI的原始回复
 * @returns {Promise<Array>} 修正后的消息数组
 */
async function callAIToFixFormat(rawResponse) {
    try {
        // 获取API设置
        const settings = await storageDB.getItem('apiSettings');
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
            throw new Error('API未配置');
        }
        
        // 构建修正提示词
        const fixPrompt = `你是一个格式修正助手。用户的AI助手返回了一个格式不规范的回复，你需要将其修正为标准的JSON数组格式。

【标准格式要求】
1. 必须是JSON数组：["消息1", "消息2", "消息3"]
2. 用方括号 [] 包裹
3. 每条消息用双引号 "" 包裹
4. 多条消息用逗号分隔
5. 不要添加任何JSON之外的内容

【原始回复】
${rawResponse}

【你的任务】
1. 识别原始回复中的实际消息内容
2. 将其转换为标准JSON数组格式
3. 保留所有特殊标记（如 [voice:xxx]、[sticker:xxx]、[transfer:xxx] 等）
4. 只输出JSON数组，不要有任何其他内容

【输出示例】
["你好啊", "在干嘛呢"]
["[voice:你在哪呢]", "想你了"]

现在请修正上面的原始回复：`;

        const messages = [
            { role: 'user', content: fixPrompt }
        ];
        
        let response;
        
        if (settings.provider === 'hakimi') {
            // Gemini API
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: fixPrompt }] }],
                    generationConfig: {
                        temperature: 0.1, // 低温度，更精确
                        topP: 0.9,
                        maxOutputTokens: 2048
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
                    max_tokens: 2048,
                    temperature: 0.1,
                    messages: [{ role: 'user', content: fixPrompt }]
                })
            });
        } else {
            // OpenAI-compatible API
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    temperature: 0.1,
                    max_tokens: 2048
                })
            });
        }
        
        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 解析响应
        let aiResponse = '';
        
        if (settings.provider === 'hakimi') {
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                aiResponse = data.candidates[0].content.parts[0].text;
            }
        } else if (settings.provider === 'claude') {
            if (data.content && data.content[0]) {
                aiResponse = data.content[0].text;
            }
        } else {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiResponse = data.choices[0].message.content;
            }
        }
        
        if (!aiResponse) {
            throw new Error('AI返回了空响应');
        }
        
        // 解析修正后的JSON
        let jsonStr = aiResponse.trim();
        jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
        
        const fixedMessages = JSON.parse(jsonStr);
        
        if (!Array.isArray(fixedMessages) || fixedMessages.length === 0) {
            throw new Error('修正后的格式仍然不正确');
        }
        
        return fixedMessages.map(msg => String(msg));
        
    } catch (error) {
        console.error('格式修正失败:', error);
        throw error;
    }
}

/**
 * 打开格式调节面板
 */
async function openFormatFixPanel() {
    if (!currentChatCharacter) {
        showToast('请先选择一个聊天角色');
        return;
    }
    
    // 关闭扩展面板
    const extendPanel = document.getElementById('chatExtendPanel');
    if (extendPanel) extendPanel.classList.remove('active');
    
    // 显示格式调节面板
    const panel = document.getElementById('formatFixPanel');
    if (!panel) return;
    
    panel.classList.add('active');
    
    // 加载消息列表
    await loadFormatFixMessageList();
}

/**
 * 关闭格式调节面板
 */
function closeFormatFixPanel() {
    const panel = document.getElementById('formatFixPanel');
    if (panel) panel.classList.remove('active');
}

/**
 * 加载可调节的消息列表
 */
async function loadFormatFixMessageList() {
    const container = document.getElementById('formatFixMessageList');
    if (!container) return;
    
    if (!currentChatCharacter) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">请先选择一个聊天角色</div>';
        return;
    }
    
    try {
        // 获取当前角色的所有消息
        const transaction = db.transaction(['chats'], 'readonly');
        const store = transaction.objectStore('chats');
        const index = store.index('characterId');
        
        const allMessages = [];
        const request = index.openCursor(IDBKeyRange.only(currentChatCharacter.id), 'prev');
        
        await new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    allMessages.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
        
        // 只显示角色发送的消息
        const charMessages = allMessages.filter(msg => msg.type === 'char' && msg.sender === 'char');
        
        if (charMessages.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无角色消息</div>';
            return;
        }
        
        // 渲染消息列表
        container.innerHTML = charMessages.map((msg, index) => {
            const time = new Date(msg.timestamp).toLocaleString('zh-CN');
            const content = msg.content || '';
            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
            
            return `
                <div class="format-fix-message-item" onclick="openFormatEditModal('${msg.id}')">
                    <div class="format-fix-message-time">${time}</div>
                    <div class="format-fix-message-content">${escapeHtml(preview)}</div>
                    <div class="format-fix-message-action">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18l6-6-6-6"/>
                        </svg>
                    </div>
                </div>
            `;
        }).join('');
        
    } catch (error) {
        console.error('加载消息列表失败:', error);
        container.innerHTML = '<div style="text-align: center; color: #f44336; padding: 30px;">加载失败，请重试</div>';
    }
}

/**
 * 打开格式编辑弹窗
 */
async function openFormatEditModal(messageId) {
    try {
        // 获取消息
        const transaction = db.transaction(['chats'], 'readonly');
        const store = transaction.objectStore('chats');
        
        const allMessages = [];
        const request = store.openCursor();
        
        await new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.id === messageId) {
                        allMessages.push(cursor.value);
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = () => reject(request.error);
        });
        
        if (allMessages.length === 0) {
            showToast('消息不存在');
            return;
        }
        
        const message = allMessages[0];
        
        // 显示编辑弹窗
        const modal = document.getElementById('formatEditModal');
        if (!modal) return;
        
        // 填充原始内容
        document.getElementById('formatEditOriginal').textContent = message.content || '';
        
        // 尝试将内容转换为JSON数组格式
        let editContent = message.content || '';
        try {
            // 如果已经是JSON格式，美化显示
            const parsed = JSON.parse(editContent);
            if (Array.isArray(parsed)) {
                editContent = JSON.stringify(parsed, null, 2);
            }
        } catch (e) {
            // 不是JSON格式，尝试转换
            editContent = JSON.stringify([editContent], null, 2);
        }
        
        document.getElementById('formatEditInput').value = editContent;
        
        // 保存当前编辑的消息ID
        window._currentEditingMessageId = messageId;
        
        modal.classList.add('active');
        
    } catch (error) {
        console.error('打开编辑弹窗失败:', error);
        showToast('打开失败，请重试');
    }
}

/**
 * 关闭格式编辑弹窗
 */
function closeFormatEditModal() {
    const modal = document.getElementById('formatEditModal');
    if (modal) modal.classList.remove('active');
    window._currentEditingMessageId = null;
}

/**
 * 智能修正格式
 */
async function smartFixFormat() {
    const input = document.getElementById('formatEditInput');
    const originalContent = input.value.trim();
    
    if (!originalContent) {
        showToast('内容为空');
        return;
    }
    
    try {
        showToast('正在智能修正...');
        
        // 调用AI修正格式
        const fixedMessages = await callAIToFixFormat(originalContent);
        
        // 更新输入框
        input.value = JSON.stringify(fixedMessages, null, 2);
        
        showToast('格式修正完成');
        
    } catch (error) {
        console.error('智能修正失败:', error);
        showToast('修正失败: ' + error.message);
    }
}

/**
 * 保存格式编辑
 */
async function saveFormatEdit() {
    const messageId = window._currentEditingMessageId;
    if (!messageId) {
        showToast('消息ID丢失');
        return;
    }
    
    const input = document.getElementById('formatEditInput');
    const newContent = input.value.trim();
    
    if (!newContent) {
        showToast('内容不能为空');
        return;
    }
    
    try {
        // 验证JSON格式
        const parsed = JSON.parse(newContent);
        if (!Array.isArray(parsed)) {
            showToast('必须是JSON数组格式');
            return;
        }
        
        // 更新数据库中的消息
        const transaction = db.transaction(['chats'], 'readwrite');
        const store = transaction.objectStore('chats');
        
        // 先获取消息
        const getRequest = store.openCursor();
        
        await new Promise((resolve, reject) => {
            getRequest.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    if (cursor.value.id === messageId) {
                        // 找到了，更新内容
                        const message = cursor.value;
                        
                        // 将JSON数组转换回单个字符串（如果只有一条消息）
                        if (parsed.length === 1) {
                            message.content = parsed[0];
                        } else {
                            // 多条消息，保存为JSON字符串
                            message.content = JSON.stringify(parsed);
                        }
                        
                        cursor.update(message);
                        resolve();
                    } else {
                        cursor.continue();
                    }
                } else {
                    reject(new Error('消息不存在'));
                }
            };
            getRequest.onerror = () => reject(getRequest.error);
        });
        
        // 重新渲染聊天界面
        if (typeof renderChatMessages === 'function') {
            await renderChatMessages(currentChatCharacter.id);
        }
        
        showToast('保存成功');
        closeFormatEditModal();
        closeFormatFixPanel();
        
    } catch (error) {
        console.error('保存失败:', error);
        if (error instanceof SyntaxError) {
            showToast('JSON格式错误，请检查');
        } else {
            showToast('保存失败: ' + error.message);
        }
    }
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    initFormatFixSettings();
});


// ========== 短信消息长按菜单功能 ==========

let _smsMenuTimer = null;
let _smsMenuActive = false;
let _smsMenuStartPos = null;

// 初始化短信消息长按菜单
function initSmsMessageContextMenu() {
    const container = document.getElementById('smsMessages');
    if (!container || container._smsMenuInited) return;
    container._smsMenuInited = true;

    // 触摸事件（移动端）
    container.addEventListener('touchstart', onSmsMsgTouchStart, { passive: false });
    container.addEventListener('touchmove', onSmsMsgTouchMove, { passive: true });
    container.addEventListener('touchend', onSmsMsgTouchEnd);
    container.addEventListener('touchcancel', onSmsMsgTouchEnd);

    // 鼠标事件（桌面端）
    container.addEventListener('mousedown', onSmsMsgMouseDown);
    container.addEventListener('mousemove', onSmsMsgMouseMove);
    container.addEventListener('mouseup', onSmsMsgMouseUp);

    // 禁用原生右键菜单
    container.addEventListener('contextmenu', function(e) {
        const msgEl = e.target.closest('.sms-bubble-row');
        if (msgEl) e.preventDefault();
    });
}

function getSmsMsgElFromEvent(e) {
    const target = e.target || (e.touches && e.touches[0] && document.elementFromPoint(e.touches[0].clientX, e.touches[0].clientY));
    if (!target) return null;
    return target.closest('.sms-bubble-row');
}

function onSmsMsgTouchStart(e) {
    const msgEl = getSmsMsgElFromEvent(e);
    if (!msgEl) return;
    
    const touch = e.touches[0];
    _smsMenuStartPos = { x: touch.clientX, y: touch.clientY };
    _smsMenuTimer = setTimeout(() => {
        _smsMenuActive = true;
        // 轻微震动反馈
        if (navigator.vibrate) navigator.vibrate(20);
        showSmsMessageContextMenu(msgEl, touch.clientX, touch.clientY);
    }, 500);
}

function onSmsMsgTouchMove(e) {
    if (!_smsMenuStartPos) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - _smsMenuStartPos.x);
    const dy = Math.abs(touch.clientY - _smsMenuStartPos.y);
    if (dx > 10 || dy > 10) {
        clearTimeout(_smsMenuTimer);
        _smsMenuTimer = null;
    }
}

function onSmsMsgTouchEnd() {
    clearTimeout(_smsMenuTimer);
    _smsMenuTimer = null;
    _smsMenuStartPos = null;
    setTimeout(() => { _smsMenuActive = false; }, 100);
}

function onSmsMsgMouseDown(e) {
    if (e.button !== 0) return;
    const msgEl = getSmsMsgElFromEvent(e);
    if (!msgEl) return;
    
    _smsMenuStartPos = { x: e.clientX, y: e.clientY };
    _smsMenuTimer = setTimeout(() => {
        _smsMenuActive = true;
        showSmsMessageContextMenu(msgEl, e.clientX, e.clientY);
    }, 500);
}

function onSmsMsgMouseMove(e) {
    if (!_smsMenuStartPos) return;
    const dx = Math.abs(e.clientX - _smsMenuStartPos.x);
    const dy = Math.abs(e.clientY - _smsMenuStartPos.y);
    if (dx > 10 || dy > 10) {
        clearTimeout(_smsMenuTimer);
        _smsMenuTimer = null;
    }
}

function onSmsMsgMouseUp() {
    clearTimeout(_smsMenuTimer);
    _smsMenuTimer = null;
    _smsMenuStartPos = null;
    setTimeout(() => { _smsMenuActive = false; }, 100);
}

// 显示短信消息上下文菜单
function showSmsMessageContextMenu(msgEl, x, y) {
    // 先关闭已有菜单
    closeSmsMessageContextMenu();

    // 获取消息索引
    const container = document.getElementById('smsMessages');
    const allRows = Array.from(container.querySelectorAll('.sms-bubble-row'));
    const msgIndex = allRows.indexOf(msgEl);
    
    if (msgIndex === -1) return;

    // 高亮消息
    msgEl.classList.add('sms-msg-highlight');

    // 创建遮罩
    const overlay = document.createElement('div');
    overlay.className = 'sms-msg-context-overlay';
    overlay.id = 'smsMsgContextOverlay';
    overlay.onclick = () => closeSmsMessageContextMenu();

    // 创建菜单
    const menu = document.createElement('div');
    menu.className = 'sms-msg-context-menu';
    menu.id = 'smsMsgContextMenu';

    // 菜单项（只有编辑和删除）
    const items = [
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
            label: '编辑', action: 'edit'
        },
        {
            icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>',
            label: '删除', action: 'delete', destructive: true
        }
    ];

    items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'sms-msg-context-item' + (item.destructive ? ' destructive' : '');
        el.innerHTML = `<span class="sms-msg-context-icon">${item.icon}</span><span>${item.label}</span>`;
        el.onclick = (e) => {
            e.stopPropagation();
            closeSmsMessageContextMenu();
            handleSmsMessageAction(item.action, msgIndex, msgEl);
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

// 关闭短信消息上下文菜单
function closeSmsMessageContextMenu() {
    const overlay = document.getElementById('smsMsgContextOverlay');
    const menu = document.getElementById('smsMsgContextMenu');

    // 移除高亮
    document.querySelectorAll('.sms-bubble-row.sms-msg-highlight').forEach(el => el.classList.remove('sms-msg-highlight'));

    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 200);
    }
    if (menu) {
        menu.classList.remove('show');
        setTimeout(() => menu.remove(), 200);
    }
}

// 处理短信消息菜单操作
function handleSmsMessageAction(action, msgIndex, msgEl) {
    switch (action) {
        case 'edit':
            handleSmsMessageEdit(msgIndex, msgEl);
            break;
        case 'delete':
            handleSmsMessageDelete(msgIndex, msgEl);
            break;
        default:
            showToast('功能开发中');
    }
}

// 编辑短信消息
function handleSmsMessageEdit(msgIndex, msgEl) {
    if (!currentSmsPhone) return;
    
    const msgs = smsConversations[currentSmsPhone];
    if (!msgs || msgIndex < 0 || msgIndex >= msgs.length) return;
    
    const msg = msgs[msgIndex];
    const bubble = msgEl.querySelector('.sms-bubble');
    if (!bubble) return;
    
    const currentText = msg.text;
    
    // 创建编辑弹窗
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10040';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '编辑消息';
    
    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'padding: 8px 16px 16px;';
    const textarea = document.createElement('textarea');
    textarea.value = currentText;
    textarea.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;min-height:80px;font-family:inherit;resize:vertical;';
    textarea.onfocus = () => { textarea.style.borderColor = '#007aff'; };
    textarea.onblur = () => { textarea.style.borderColor = '#e0e0e0'; };
    inputWrap.appendChild(textarea);
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    const okBtn = document.createElement('button');
    okBtn.className = 'ios-dialog-button primary';
    okBtn.textContent = '确定';
    okBtn.onclick = () => {
        const newText = textarea.value.trim();
        if (!newText) {
            showToast('内容不能为空');
            return;
        }
        
        // 更新消息
        msg.text = newText;
        saveSmsData();
        renderSmsMessages();
        renderSmsList();
        
        closeDialog();
        showToast('消息已更新');
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
        textarea.focus();
        textarea.setSelectionRange(textarea.value.length, textarea.value.length);
    }, 10);
    
    function closeDialog() {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 删除短信消息 - 弹出选择：删除本条 or 多选删除
function handleSmsMessageDelete(msgIndex, msgEl) {
    // 创建选择弹窗
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10040';

    overlay.innerHTML = `
        <div class="ios-dialog">
            <div class="ios-dialog-title">删除消息</div>
            <div class="ios-dialog-message">请选择删除方式</div>
            <div class="ios-dialog-buttons vertical">
                <button class="ios-dialog-button destructive" id="smsMsgDelSingle">删除本条</button>
                <button class="ios-dialog-button destructive" id="smsMsgDelMulti">多选删除</button>
                <button class="ios-dialog-button" id="smsMsgDelCancel">取消</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);
    requestAnimationFrame(() => overlay.classList.add('show'));

    const close = () => {
        overlay.classList.remove('show');
        setTimeout(() => overlay.remove(), 300);
    };

    overlay.querySelector('#smsMsgDelCancel').onclick = close;
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

    overlay.querySelector('#smsMsgDelSingle').onclick = () => {
        close();
        deleteSingleSmsMessage(msgIndex, msgEl);
    };

    overlay.querySelector('#smsMsgDelMulti').onclick = () => {
        close();
        enterSmsMultiSelectMode(msgIndex);
    };
}

// 单条删除短信消息
async function deleteSingleSmsMessage(msgIndex, msgEl) {
    if (!currentSmsPhone) return;
    
    const msgs = smsConversations[currentSmsPhone];
    if (!msgs || msgIndex < 0 || msgIndex >= msgs.length) return;
    
    const confirmed = await iosConfirm('确定要删除这条消息吗？', '删除消息');
    if (!confirmed) return;
    
    // 删除消息
    msgs.splice(msgIndex, 1);
    
    // 如果没有消息了，删除整个会话
    if (msgs.length === 0) {
        delete smsConversations[currentSmsPhone];
    }
    
    saveSmsData();
    renderSmsMessages();
    renderSmsList();
    
    // 添加删除动画
    msgEl.style.transition = 'opacity 0.25s, transform 0.25s';
    msgEl.style.opacity = '0';
    msgEl.style.transform = 'scale(0.9)';
    
    showToast('消息已删除');
}

// 进入短信多选模式
function enterSmsMultiSelectMode(initialMsgIndex) {
    if (!currentSmsPhone) return;
    
    const container = document.getElementById('smsMessages');
    const allRows = Array.from(container.querySelectorAll('.sms-bubble-row'));
    
    // 标记进入多选模式
    container.classList.add('sms-multi-select-mode');
    
    // 选中的消息索引集合
    const selectedIndices = new Set();
    if (initialMsgIndex !== undefined && initialMsgIndex >= 0) {
        selectedIndices.add(initialMsgIndex);
    }
    
    // 为每条消息添加复选框和点击事件
    allRows.forEach((row, index) => {
        // 添加复选框
        const checkbox = document.createElement('div');
        checkbox.className = 'sms-msg-checkbox';
        row.insertBefore(checkbox, row.firstChild);
        
        // 如果是初始选中的消息，添加选中状态
        if (selectedIndices.has(index)) {
            row.classList.add('sms-msg-selected');
        }
        
        // 点击消息切换选中状态
        row.onclick = (e) => {
            e.stopPropagation();
            if (selectedIndices.has(index)) {
                selectedIndices.delete(index);
                row.classList.remove('sms-msg-selected');
            } else {
                selectedIndices.add(index);
                row.classList.add('sms-msg-selected');
            }
            updateSmsMultiSelectToolbar(selectedIndices.size, allRows.length);
        };
    });
    
    // 创建底部工具栏
    createSmsMultiSelectToolbar(selectedIndices, allRows);
    
    // 更新工具栏显示
    updateSmsMultiSelectToolbar(selectedIndices.size, allRows.length);
}

// 创建短信多选工具栏
function createSmsMultiSelectToolbar(selectedIndices, allRows) {
    // 移除已存在的工具栏
    const existingToolbar = document.getElementById('smsMultiSelectToolbar');
    if (existingToolbar) existingToolbar.remove();
    
    const toolbar = document.createElement('div');
    toolbar.id = 'smsMultiSelectToolbar';
    toolbar.className = 'sms-multi-select-toolbar';
    toolbar.innerHTML = `
        <div class="sms-cancel" id="smsCancelMultiSelect">取消</div>
        <div class="sms-title" id="smsSelectedCount">已选择 0 条</div>
        <div class="sms-select-all" id="smsSelectAll">全选</div>
        <div class="sms-action-btn sms-delete-btn" id="smsDeleteSelected">删除 (0)</div>
    `;
    
    document.body.appendChild(toolbar);
    
    // 取消按钮
    toolbar.querySelector('#smsCancelMultiSelect').onclick = () => {
        exitSmsMultiSelectMode();
    };
    
    // 全选按钮
    toolbar.querySelector('#smsSelectAll').onclick = () => {
        const allSelected = selectedIndices.size === allRows.length;
        
        if (allSelected) {
            // 取消全选
            selectedIndices.clear();
            allRows.forEach(row => {
                row.classList.remove('sms-msg-selected');
            });
        } else {
            // 全选
            selectedIndices.clear();
            allRows.forEach((row, index) => {
                selectedIndices.add(index);
                row.classList.add('sms-msg-selected');
            });
        }
        
        updateSmsMultiSelectToolbar(selectedIndices.size, allRows.length);
    };
    
    // 删除按钮
    toolbar.querySelector('#smsDeleteSelected').onclick = async () => {
        if (selectedIndices.size === 0) {
            showToast('请先选择要删除的消息');
            return;
        }
        
        const confirmed = await iosConfirm(`确定要删除选中的 ${selectedIndices.size} 条消息吗？`, '批量删除');
        if (!confirmed) return;
        
        // 删除选中的消息（从后往前删，避免索引变化）
        const sortedIndices = Array.from(selectedIndices).sort((a, b) => b - a);
        const msgs = smsConversations[currentSmsPhone];
        
        sortedIndices.forEach(index => {
            if (msgs && index >= 0 && index < msgs.length) {
                msgs.splice(index, 1);
            }
        });
        
        // 如果没有消息了，删除整个会话
        if (msgs.length === 0) {
            delete smsConversations[currentSmsPhone];
        }
        
        saveSmsData();
        exitSmsMultiSelectMode();
        renderSmsMessages();
        renderSmsList();
        
        showToast(`已删除 ${selectedIndices.size} 条消息`);
    };
}

// 更新短信多选工具栏
function updateSmsMultiSelectToolbar(count, total) {
    const countEl = document.getElementById('smsSelectedCount');
    const deleteBtn = document.getElementById('smsDeleteSelected');
    const selectAllBtn = document.getElementById('smsSelectAll');
    
    if (countEl) {
        countEl.textContent = `已选择 ${count} 条`;
    }
    
    if (deleteBtn) {
        deleteBtn.textContent = `删除 (${count})`;
    }
    
    if (selectAllBtn && total !== undefined) {
        selectAllBtn.textContent = count === total ? '取消全选' : '全选';
    }
}

// 退出短信多选模式
function exitSmsMultiSelectMode() {
    const container = document.getElementById('smsMessages');
    container.classList.remove('sms-multi-select-mode');
    
    // 移除所有复选框和选中状态
    const allRows = container.querySelectorAll('.sms-bubble-row');
    allRows.forEach(row => {
        const checkbox = row.querySelector('.sms-msg-checkbox');
        if (checkbox) checkbox.remove();
        row.classList.remove('sms-msg-selected');
        row.onclick = null;
    });
    
    // 移除工具栏
    const toolbar = document.getElementById('smsMultiSelectToolbar');
    if (toolbar) toolbar.remove();
}


// ========== 国籍货币与汇率功能 ==========

// 国籍与货币映射表（包含货币代码、符号、中文名称）
const NATIONALITY_CURRENCY_MAP = {
    'CN': { code: 'CNY', symbol: '¥', name: '人民币', country: '中国' },
    'US': { code: 'USD', symbol: '$', name: '美元', country: '美国' },
    'JP': { code: 'JPY', symbol: '¥', name: '日元', country: '日本' },
    'KR': { code: 'KRW', symbol: '₩', name: '韩元', country: '韩国' },
    'GB': { code: 'GBP', symbol: '£', name: '英镑', country: '英国' },
    'EU': { code: 'EUR', symbol: '€', name: '欧元', country: '欧盟' },
    'HK': { code: 'HKD', symbol: 'HK$', name: '港币', country: '中国香港' },
    'TW': { code: 'TWD', symbol: 'NT$', name: '新台币', country: '中国台湾' },
    'SG': { code: 'SGD', symbol: 'S$', name: '新加坡元', country: '新加坡' },
    'AU': { code: 'AUD', symbol: 'A$', name: '澳元', country: '澳大利亚' },
    'CA': { code: 'CAD', symbol: 'C$', name: '加元', country: '加拿大' },
    'NZ': { code: 'NZD', symbol: 'NZ$', name: '新西兰元', country: '新西兰' },
    'CH': { code: 'CHF', symbol: 'CHF', name: '瑞士法郎', country: '瑞士' },
    'SE': { code: 'SEK', symbol: 'kr', name: '瑞典克朗', country: '瑞典' },
    'NO': { code: 'NOK', symbol: 'kr', name: '挪威克朗', country: '挪威' },
    'DK': { code: 'DKK', symbol: 'kr', name: '丹麦克朗', country: '丹麦' },
    'RU': { code: 'RUB', symbol: '₽', name: '俄罗斯卢布', country: '俄罗斯' },
    'IN': { code: 'INR', symbol: '₹', name: '印度卢比', country: '印度' },
    'TH': { code: 'THB', symbol: '฿', name: '泰铢', country: '泰国' },
    'MY': { code: 'MYR', symbol: 'RM', name: '马来西亚林吉特', country: '马来西亚' },
    'ID': { code: 'IDR', symbol: 'Rp', name: '印尼盾', country: '印度尼西亚' },
    'PH': { code: 'PHP', symbol: '₱', name: '菲律宾比索', country: '菲律宾' },
    'VN': { code: 'VND', symbol: '₫', name: '越南盾', country: '越南' },
    'MX': { code: 'MXN', symbol: 'Mex$', name: '墨西哥比索', country: '墨西哥' },
    'BR': { code: 'BRL', symbol: 'R$', name: '巴西雷亚尔', country: '巴西' },
    'AR': { code: 'ARS', symbol: 'ARS$', name: '阿根廷比索', country: '阿根廷' },
    'ZA': { code: 'ZAR', symbol: 'R', name: '南非兰特', country: '南非' },
    'AE': { code: 'AED', symbol: 'د.إ', name: '阿联酋迪拉姆', country: '阿联酋' },
    'SA': { code: 'SAR', symbol: '﷼', name: '沙特里亚尔', country: '沙特阿拉伯' },
    'TR': { code: 'TRY', symbol: '₺', name: '土耳其里拉', country: '土耳其' },
    'PL': { code: 'PLN', symbol: 'zł', name: '波兰兹罗提', country: '波兰' },
    'CZ': { code: 'CZK', symbol: 'Kč', name: '捷克克朗', country: '捷克' },
    'HU': { code: 'HUF', symbol: 'Ft', name: '匈牙利福林', country: '匈牙利' },
    'IL': { code: 'ILS', symbol: '₪', name: '以色列谢克尔', country: '以色列' },
    'EG': { code: 'EGP', symbol: 'E£', name: '埃及镑', country: '埃及' },
    'NG': { code: 'NGN', symbol: '₦', name: '尼日利亚奈拉', country: '尼日利亚' },
    'KE': { code: 'KES', symbol: 'KSh', name: '肯尼亚先令', country: '肯尼亚' },
    'PK': { code: 'PKR', symbol: '₨', name: '巴基斯坦卢比', country: '巴基斯坦' },
    'BD': { code: 'BDT', symbol: '৳', name: '孟加拉塔卡', country: '孟加拉国' },
    'CL': { code: 'CLP', symbol: 'CLP$', name: '智利比索', country: '智利' },
    'CO': { code: 'COP', symbol: 'COL$', name: '哥伦比亚比索', country: '哥伦比亚' },
    'PE': { code: 'PEN', symbol: 'S/', name: '秘鲁索尔', country: '秘鲁' }
};

// 本地汇率表（以CNY为基准，1外币=多少CNY）
const LOCAL_EXCHANGE_RATES = {
    'CNY': 1,
    'USD': 7.25,
    'JPY': 0.048,
    'KRW': 0.0053,
    'GBP': 9.18,
    'EUR': 7.88,
    'HKD': 0.93,
    'TWD': 0.23,
    'SGD': 5.38,
    'AUD': 4.72,
    'CAD': 5.32,
    'NZD': 4.35,
    'CHF': 8.15,
    'SEK': 0.69,
    'NOK': 0.67,
    'DKK': 1.06,
    'RUB': 0.078,
    'INR': 0.087,
    'THB': 0.21,
    'MYR': 1.54,
    'IDR': 0.00046,
    'PHP': 0.13,
    'VND': 0.00029,
    'MXN': 0.42,
    'BRL': 1.45,
    'ARS': 0.0082,
    'ZAR': 0.40,
    'AED': 1.97,
    'SAR': 1.93,
    'TRY': 0.22,
    'PLN': 1.82,
    'CZK': 0.31,
    'HUF': 0.020,
    'ILS': 1.98,
    'EGP': 0.15,
    'NGN': 0.0047,
    'KES': 0.056,
    'PKR': 0.026,
    'BDT': 0.066,
    'CLP': 0.0078,
    'COP': 0.0018,
    'PEN': 1.95
};

// 汇率缓存
let exchangeRateCache = {
    rates: null,
    timestamp: 0,
    cacheTime: 10 * 60 * 1000 // 10分钟缓存
};

// 获取角色的国籍设置
function getCharacterNationality(characterId) {
    if (!characterId) return 'CN';
    const key = `char_nationality_${characterId}`;
    return localStorage.getItem(key) || 'CN';
}

// 保存角色的国籍设置
function saveCharacterNationality(characterId, nationality) {
    if (!characterId) return;
    const key = `char_nationality_${characterId}`;
    localStorage.setItem(key, nationality);
}

// 获取角色的汇率模式设置
function getCharacterExchangeRateMode(characterId) {
    if (!characterId) return 'local';
    const key = `char_exchange_mode_${characterId}`;
    return localStorage.getItem(key) || 'local';
}

// 保存角色的汇率模式设置
function saveCharacterExchangeRateMode(characterId, mode) {
    if (!characterId) return;
    const key = `char_exchange_mode_${characterId}`;
    localStorage.setItem(key, mode);
}

// 根据国籍获取货币信息
function getCurrencyByNationality(nationality) {
    return NATIONALITY_CURRENCY_MAP[nationality] || NATIONALITY_CURRENCY_MAP['CN'];
}

// 获取本地汇率
function getLocalExchangeRate(currencyCode) {
    return LOCAL_EXCHANGE_RATES[currencyCode] || 1;
}

// 获取实时汇率（带缓存和降级）
async function getRealtimeExchangeRate(currencyCode) {
    // 如果是人民币，直接返回1
    if (currencyCode === 'CNY') return 1;
    
    // 检查缓存
    const now = Date.now();
    if (exchangeRateCache.rates && (now - exchangeRateCache.timestamp) < exchangeRateCache.cacheTime) {
        if (exchangeRateCache.rates[currencyCode]) {
            return exchangeRateCache.rates[currencyCode];
        }
    }
    
    try {
        // 使用免费的汇率API
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/CNY`, {
            timeout: 5000
        });
        
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        
        const data = await response.json();
        
        // 转换为 1外币=多少CNY 的格式
        const rates = {};
        for (const [code, rate] of Object.entries(data.rates)) {
            rates[code] = 1 / rate;
        }
        
        // 更新缓存
        exchangeRateCache.rates = rates;
        exchangeRateCache.timestamp = now;
        
        return rates[currencyCode] || getLocalExchangeRate(currencyCode);
    } catch (error) {
        console.warn('获取实时汇率失败，使用本地汇率:', error);
        return getLocalExchangeRate(currencyCode);
    }
}

// 获取汇率（根据模式选择本地或实时）
async function getExchangeRate(currencyCode, mode = 'local') {
    if (currencyCode === 'CNY') return 1;
    
    if (mode === 'realtime') {
        return await getRealtimeExchangeRate(currencyCode);
    }
    return getLocalExchangeRate(currencyCode);
}

// 货币转换（外币转人民币）
async function convertToCNY(amount, currencyCode, mode = 'local') {
    const rate = await getExchangeRate(currencyCode, mode);
    return Math.round(amount * rate * 100) / 100;
}

// 格式化货币显示
function formatCurrencyAmount(amount, currencyInfo) {
    const symbol = currencyInfo.symbol || '¥';
    // 日元、韩元等不需要小数
    if (['JPY', 'KRW', 'VND', 'IDR'].includes(currencyInfo.code)) {
        return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${amount.toFixed(2)}`;
}

// 初始化国籍选择器
function initNationalitySelector() {
    const select = document.getElementById('charNationalitySelect');
    if (!select) return;
    
    // 清空现有选项
    select.innerHTML = '';
    
    // 按国家名称排序
    const sortedEntries = Object.entries(NATIONALITY_CURRENCY_MAP).sort((a, b) => {
        // 中国放在最前面
        if (a[0] === 'CN') return -1;
        if (b[0] === 'CN') return 1;
        return a[1].country.localeCompare(b[1].country, 'zh-CN');
    });
    
    // 添加选项
    for (const [code, info] of sortedEntries) {
        const option = document.createElement('option');
        option.value = code;
        option.textContent = `${info.country} (${info.symbol} ${info.name})`;
        select.appendChild(option);
    }
    
    // 设置当前值
    if (currentChatCharacter) {
        select.value = getCharacterNationality(currentChatCharacter.id);
    }
}

// 初始化汇率模式选择器
function initExchangeRateModeSelector() {
    const select = document.getElementById('exchangeRateModeSelect');
    if (!select) return;
    
    if (currentChatCharacter) {
        select.value = getCharacterExchangeRateMode(currentChatCharacter.id);
    }
}

// 保存国籍和汇率设置
function saveNationalitySettings() {
    if (!currentChatCharacter) return;
    
    const nationalitySelect = document.getElementById('charNationalitySelect');
    const modeSelect = document.getElementById('exchangeRateModeSelect');
    
    if (nationalitySelect) {
        saveCharacterNationality(currentChatCharacter.id, nationalitySelect.value);
    }
    
    if (modeSelect) {
        saveCharacterExchangeRateMode(currentChatCharacter.id, modeSelect.value);
    }
}

// 显示汇率转换确认弹窗
async function showExchangeConfirmDialog(originalAmount, currencyInfo, characterId) {
    return new Promise(async (resolve) => {
        const mode = getCharacterExchangeRateMode(characterId);
        const rate = await getExchangeRate(currencyInfo.code, mode);
        const convertedAmount = Math.round(originalAmount * rate * 100) / 100;
        
        const isRealtime = mode === 'realtime';
        const rateSource = isRealtime ? '实时汇率' : '本地汇率';
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10002;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity 0.25s ease;';

        const card = document.createElement('div');
        card.style.cssText = 'width:320px;background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.25);transform:scale(0.9) translateY(20px);opacity:0;transition:all 0.35s cubic-bezier(0.34,1.56,0.64,1);';

        // 顶部区域
        const topSection = document.createElement('div');
        topSection.style.cssText = 'padding:24px 24px 16px;text-align:center;background:linear-gradient(135deg, #f09b37 0%, #f5af19 100%);';

        const title = document.createElement('div');
        title.style.cssText = 'font-size:13px;color:rgba(255,255,255,0.9);letter-spacing:1px;margin-bottom:12px;font-weight:400;';
        title.textContent = '外币转账收款';

        const originalDisplay = document.createElement('div');
        originalDisplay.style.cssText = 'font-size:28px;font-weight:700;color:#fff;letter-spacing:-1px;margin-bottom:4px;';
        originalDisplay.textContent = formatCurrencyAmount(originalAmount, currencyInfo);

        const currencyName = document.createElement('div');
        currencyName.style.cssText = 'font-size:12px;color:rgba(255,255,255,0.8);';
        currencyName.textContent = currencyInfo.name;

        topSection.appendChild(title);
        topSection.appendChild(originalDisplay);
        topSection.appendChild(currencyName);

        // 转换信息区域
        const convertSection = document.createElement('div');
        convertSection.style.cssText = 'padding:20px 24px;background:#f8f9fa;';

        const arrowIcon = document.createElement('div');
        arrowIcon.style.cssText = 'text-align:center;margin-bottom:12px;';
        arrowIcon.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';

        const convertedDisplay = document.createElement('div');
        convertedDisplay.style.cssText = 'text-align:center;';

        const convertedAmount_el = document.createElement('div');
        convertedAmount_el.style.cssText = 'font-size:32px;font-weight:700;color:#333;margin-bottom:4px;';
        convertedAmount_el.textContent = `¥${convertedAmount.toFixed(2)}`;

        const rateInfo = document.createElement('div');
        rateInfo.style.cssText = 'font-size:12px;color:#999;';
        rateInfo.innerHTML = `${rateSource}: 1 ${currencyInfo.code} = ¥${rate.toFixed(4)}`;

        convertedDisplay.appendChild(convertedAmount_el);
        convertedDisplay.appendChild(rateInfo);

        convertSection.appendChild(arrowIcon);
        convertSection.appendChild(convertedDisplay);

        // 按钮区域
        const btnSection = document.createElement('div');
        btnSection.style.cssText = 'padding:16px 24px 20px;display:flex;gap:12px;';

        const cancelBtn = document.createElement('button');
        cancelBtn.style.cssText = 'flex:1;padding:14px 0;border:1.5px solid #e0e0e0;border-radius:12px;font-size:15px;font-weight:500;color:#666;background:#fff;cursor:pointer;transition:all 0.15s;';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog();
            resolve(null);
        };

        const confirmBtn = document.createElement('button');
        confirmBtn.style.cssText = 'flex:1;padding:14px 0;border:none;border-radius:12px;font-size:16px;font-weight:600;color:#fff;background:#f09b37;cursor:pointer;transition:all 0.15s;';
        confirmBtn.textContent = '确认收款';
        confirmBtn.onclick = () => {
            closeDialog();
            resolve({
                originalAmount,
                convertedAmount,
                rate,
                currencyCode: currencyInfo.code,
                currencySymbol: currencyInfo.symbol,
                currencyName: currencyInfo.name,
                rateMode: mode
            });
        };

        btnSection.appendChild(cancelBtn);
        btnSection.appendChild(confirmBtn);

        card.appendChild(topSection);
        card.appendChild(convertSection);
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
            if (e.target === overlay) {
                closeDialog();
                resolve(null);
            }
        });

        function closeDialog() {
            overlay.style.opacity = '0';
            card.style.transform = 'scale(0.9) translateY(20px)';
            card.style.opacity = '0';
            setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
        }
    });
}

// 国籍选择器现在由 script.js 的 openChatSettings 直接调用 initNationalitySelector()

// 国籍设置现在由 script.js 的 saveChatSettings 直接调用 saveNationalitySettings()


// ========== 隐藏消息功能 ==========

/**
 * 获取角色的隐藏消息范围列表
 * @param {string} characterId - 角色ID
 * @returns {Promise<Array>} 隐藏范围数组
 */
async function getHiddenMessageRanges(characterId) {
    try {
        const key = `hiddenMessages_${characterId}`;
        const data = await storageDB.getItem(key);
        return data || [];
    } catch (e) {
        console.error('获取隐藏消息范围失败:', e);
        return [];
    }
}

/**
 * 保存角色的隐藏消息范围列表
 * @param {string} characterId - 角色ID
 * @param {Array} ranges - 隐藏范围数组
 */
async function saveHiddenMessageRanges(characterId, ranges) {
    try {
        const key = `hiddenMessages_${characterId}`;
        await storageDB.setItem(key, ranges);
    } catch (e) {
        console.error('保存隐藏消息范围失败:', e);
    }
}

/**
 * 添加一个隐藏范围
 * @param {string} characterId - 角色ID
 * @param {number} startIndex - 起始序号（从1开始）
 * @param {number} endIndex - 结束序号（从1开始）
 */
async function addHiddenMessageRange(characterId, startIndex, endIndex) {
    const ranges = await getHiddenMessageRanges(characterId);
    const range = {
        id: 'hide_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        startIndex: startIndex,
        endIndex: endIndex,
        createdAt: new Date().toISOString()
    };
    ranges.push(range);
    await saveHiddenMessageRanges(characterId, ranges);
    return range;
}

/**
 * 删除一个隐藏范围
 * @param {string} characterId - 角色ID
 * @param {string} rangeId - 范围ID
 */
async function deleteHiddenMessageRange(characterId, rangeId) {
    const ranges = await getHiddenMessageRanges(characterId);
    const filtered = ranges.filter(r => r.id !== rangeId);
    await saveHiddenMessageRanges(characterId, filtered);
}

/**
 * 打开隐藏消息管理面板
 */
async function openHiddenMessagePanel() {
    if (!currentChatCharacter) {
        showToast('请先选择一个聊天角色');
        return;
    }
    
    const panel = document.getElementById('hiddenMessagePanel');
    if (!panel) return;
    
    panel.classList.add('active');
    
    // 加载数据
    await loadHiddenMessageData();
}

/**
 * 关闭隐藏消息管理面板
 */
function closeHiddenMessagePanel() {
    const panel = document.getElementById('hiddenMessagePanel');
    if (panel) panel.classList.remove('active');
}

/**
 * 加载隐藏消息数据
 */
async function loadHiddenMessageData() {
    if (!currentChatCharacter) return;
    
    try {
        // 获取消息总数
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats.filter(chat => chat.characterId === currentChatCharacter.id);
        characterMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        const totalCount = characterMessages.length;
        document.getElementById('hiddenMessageTotalCount').textContent = totalCount;
        
        // 加载已隐藏范围列表
        await renderHiddenRangeList();
        
    } catch (error) {
        console.error('加载隐藏消息数据失败:', error);
    }
}

/**
 * 渲染已隐藏范围列表
 */
async function renderHiddenRangeList() {
    if (!currentChatCharacter) return;
    
    const container = document.getElementById('hiddenRangeList');
    const ranges = await getHiddenMessageRanges(currentChatCharacter.id);
    
    if (ranges.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px 20px;">
                <div style="font-size: 14px; margin-bottom: 8px;">暂无隐藏范围</div>
                <div style="font-size: 12px; color: #bbb;">添加隐藏范围后将显示在这里</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = ranges.map(range => {
        const count = range.endIndex - range.startIndex + 1;
        const time = new Date(range.createdAt).toLocaleString('zh-CN');
        return `
            <div class="hidden-range-item" data-range-id="${range.id}">
                <div style="flex: 1;">
                    <div style="font-size: 14px; color: #333; margin-bottom: 4px; font-weight: 500;">
                        第 ${range.startIndex} 条 ~ 第 ${range.endIndex} 条（共 ${count} 条）
                    </div>
                    <div style="font-size: 11px; color: #999;">${time}</div>
                </div>
                <button class="hidden-range-action-btn" onclick="unhideMessageRange('${range.id}')">解除隐藏</button>
            </div>
        `;
    }).join('');
}

/**
 * 预览隐藏范围
 */
async function previewHiddenRange() {
    if (!currentChatCharacter) return;
    
    const startInput = document.getElementById('hiddenRangeStart');
    const endInput = document.getElementById('hiddenRangeEnd');
    
    const startIndex = parseInt(startInput.value);
    const endIndex = parseInt(endInput.value);
    
    if (!startIndex || !endIndex || startIndex < 1 || endIndex < 1) {
        showToast('请输入有效的序号');
        return;
    }
    
    if (startIndex > endIndex) {
        showToast('起始序号不能大于结束序号');
        return;
    }
    
    try {
        // 获取消息
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats.filter(chat => chat.characterId === currentChatCharacter.id);
        characterMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        if (endIndex > characterMessages.length) {
            showToast(`结束序号超出范围（最大 ${characterMessages.length}）`);
            return;
        }
        
        // 获取范围内的消息
        const rangeMessages = characterMessages.slice(startIndex - 1, endIndex);
        
        // 显示预览
        const previewContainer = document.getElementById('hiddenRangePreview');
        previewContainer.innerHTML = rangeMessages.map((msg, index) => {
            const actualIndex = startIndex + index;
            const time = new Date(msg.timestamp).toLocaleString('zh-CN', { 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const sender = msg.type === 'user' ? '我' : (currentChatCharacter.remark || currentChatCharacter.name);
            const content = msg.content || '';
            const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
            
            return `
                <div class="hidden-preview-item">
                    <div class="hidden-preview-header">
                        <span style="font-weight: 500; color: #666;">第 ${actualIndex} 条</span>
                        <span style="color: #999; font-size: 12px;">${time}</span>
                    </div>
                    <div class="hidden-preview-content">
                        <span style="color: ${msg.type === 'user' ? '#007aff' : '#333'}; font-weight: 500;">${sender}:</span>
                        ${escapeHtml(preview)}
                    </div>
                </div>
            `;
        }).join('');
        
        document.getElementById('hiddenRangePreviewSection').style.display = 'block';
        
    } catch (error) {
        console.error('预览失败:', error);
        showToast('预览失败，请重试');
    }
}

/**
 * 确认隐藏范围
 */
async function confirmHideRange() {
    if (!currentChatCharacter) return;
    
    const startInput = document.getElementById('hiddenRangeStart');
    const endInput = document.getElementById('hiddenRangeEnd');
    
    const startIndex = parseInt(startInput.value);
    const endIndex = parseInt(endInput.value);
    
    if (!startIndex || !endIndex || startIndex < 1 || endIndex < 1) {
        showToast('请输入有效的序号');
        return;
    }
    
    if (startIndex > endIndex) {
        showToast('起始序号不能大于结束序号');
        return;
    }
    
    try {
        // 验证范围
        const allChats = await getAllChatsFromDB();
        const characterMessages = allChats.filter(chat => chat.characterId === currentChatCharacter.id);
        
        if (endIndex > characterMessages.length) {
            showToast(`结束序号超出范围（最大 ${characterMessages.length}）`);
            return;
        }
        
        // 添加隐藏范围
        await addHiddenMessageRange(currentChatCharacter.id, startIndex, endIndex);
        
        // 清空输入
        startInput.value = '';
        endInput.value = '';
        document.getElementById('hiddenRangePreviewSection').style.display = 'none';
        
        // 刷新列表
        await renderHiddenRangeList();
        
        showToast(`已隐藏第 ${startIndex} ~ ${endIndex} 条消息`);
        
    } catch (error) {
        console.error('隐藏失败:', error);
        showToast('隐藏失败，请重试');
    }
}

/**
 * 解除隐藏范围
 * @param {string} rangeId - 范围ID
 */
async function unhideMessageRange(rangeId) {
    if (!currentChatCharacter) return;
    
    const confirmed = await iosConfirm('确定要解除这个隐藏范围吗？', '解除隐藏');
    if (!confirmed) return;
    
    try {
        await deleteHiddenMessageRange(currentChatCharacter.id, rangeId);
        await renderHiddenRangeList();
        showToast('已解除隐藏');
    } catch (error) {
        console.error('解除隐藏失败:', error);
        showToast('操作失败，请重试');
    }
}

/**
 * 过滤掉隐藏的消息（用于API调用）
 * @param {Array} messages - 所有消息数组
 * @param {string} characterId - 角色ID
 * @returns {Promise<Array>} 过滤后的消息数组
 */
async function filterHiddenMessages(messages, characterId) {
    try {
        const ranges = await getHiddenMessageRanges(characterId);
        
        if (ranges.length === 0) {
            return messages; // 没有隐藏范围，直接返回
        }
        
        // 过滤消息
        return messages.filter((msg, index) => {
            const msgIndex = index + 1; // 序号从1开始
            return !ranges.some(range => 
                msgIndex >= range.startIndex && msgIndex <= range.endIndex
            );
        });
    } catch (error) {
        console.error('过滤隐藏消息失败:', error);
        return messages; // 出错时返回原消息
    }
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 初始化隐藏消息功能（如果需要）
});

// ========== API历史记录功能 ==========

/**
 * 初始化API历史记录设置
 */
function initApiHistorySettings() {
    const toggle = document.getElementById('apiHistoryToggle');
    const limitInput = document.getElementById('apiHistoryLimit');
    
    if (!toggle || !limitInput) return;
    
    // 读取设置，默认关闭
    const historyEnabled = localStorage.getItem('apiHistoryEnabled');
    toggle.checked = historyEnabled === 'true';
    
    // 读取限制数量，默认100
    const historyLimit = localStorage.getItem('apiHistoryLimit') || '100';
    limitInput.value = historyLimit;
}

/**
 * 切换API历史记录开关
 */
function toggleApiHistory() {
    const toggle = document.getElementById('apiHistoryToggle');
    const isEnabled = toggle.checked;
    
    // 保存设置
    localStorage.setItem('apiHistoryEnabled', isEnabled.toString());
    
    if (isEnabled) {
        showToast('API历史记录已开启');
    } else {
        showToast('API历史记录已关闭');
    }
}

/**
 * 保存API历史记录限制数量
 */
function saveApiHistoryLimit() {
    const limitInput = document.getElementById('apiHistoryLimit');
    const limit = parseInt(limitInput.value) || 100;
    
    // 限制范围
    if (limit < 10) {
        limitInput.value = 10;
        localStorage.setItem('apiHistoryLimit', '10');
    } else if (limit > 1000) {
        limitInput.value = 1000;
        localStorage.setItem('apiHistoryLimit', '1000');
    } else {
        localStorage.setItem('apiHistoryLimit', limit.toString());
    }
}

/**
 * 检查是否启用API历史记录
 */
function isApiHistoryEnabled() {
    const enabled = localStorage.getItem('apiHistoryEnabled');
    return enabled === 'true';
}

/**
 * 获取API历史记录列表
 */
async function getApiHistoryList() {
    try {
        const data = await storageDB.getItem('apiHistory');
        return data || [];
    } catch (e) {
        console.error('获取API历史记录失败:', e);
        return [];
    }
}

/**
 * 保存API历史记录列表
 */
async function saveApiHistoryList(historyList) {
    try {
        await storageDB.setItem('apiHistory', historyList);
    } catch (e) {
        console.error('保存API历史记录失败:', e);
    }
}

/**
 * 添加一条API历史记录
 * @param {Object} requestData - 请求数据
 * @param {Object} responseData - 响应数据
 * @param {string} characterName - 角色名称
 * @param {string} status - 状态 ('success' 或 'error')
 */
async function addApiHistoryRecord(requestData, responseData, characterName = '', status = 'success') {
    // 检查是否启用
    if (!isApiHistoryEnabled()) {
        return;
    }
    
    try {
        const historyList = await getApiHistoryList();
        
        const record = {
            id: 'api_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            timestamp: new Date().toISOString(),
            characterName: characterName,
            request: requestData,
            response: responseData,
            status: status
        };
        
        historyList.push(record);
        
        // 检查是否超过限制
        const limit = parseInt(localStorage.getItem('apiHistoryLimit') || '100');
        if (historyList.length > limit) {
            // 删除最旧的记录
            historyList.shift();
        }
        
        await saveApiHistoryList(historyList);
        
        console.log('API历史记录已保存:', record.id);
    } catch (error) {
        console.error('添加API历史记录失败:', error);
    }
}

/**
 * 删除一条API历史记录
 * @param {string} recordId - 记录ID
 */
async function deleteApiHistoryRecord(recordId) {
    try {
        const historyList = await getApiHistoryList();
        const filtered = historyList.filter(r => r.id !== recordId);
        await saveApiHistoryList(filtered);
    } catch (error) {
        console.error('删除API历史记录失败:', error);
    }
}

/**
 * 打开API历史查看面板
 */
async function openApiHistoryPanel() {
    // 检查是否启用
    if (!isApiHistoryEnabled()) {
        const confirmed = await iosConfirm(
            'API历史记录功能未开启，是否前往API设置开启？',
            '提示'
        );
        if (confirmed) {
            closeApiHistoryPanel();
            if (typeof openApiSettings === 'function') {
                openApiSettings();
            }
        }
        return;
    }
    
    const panel = document.getElementById('apiHistoryPanel');
    if (!panel) return;
    
    panel.style.display = 'block';
    
    // 加载历史记录列表
    await renderApiHistoryList();
}

/**
 * 关闭API历史查看面板
 */
function closeApiHistoryPanel() {
    const panel = document.getElementById('apiHistoryPanel');
    if (panel) panel.style.display = 'none';
}

/**
 * 渲染API历史记录列表
 */
async function renderApiHistoryList() {
    const container = document.getElementById('apiHistoryList');
    const totalCountEl = document.getElementById('apiHistoryTotalCount');
    
    if (!container || !totalCountEl) return;
    
    try {
        const historyList = await getApiHistoryList();
        
        // 更新总数
        totalCountEl.textContent = historyList.length;
        
        if (historyList.length === 0) {
            container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无历史记录</div>';
            return;
        }
        
        // 按时间倒序显示
        const sorted = [...historyList].reverse();
        
        container.innerHTML = sorted.map(record => {
            const time = new Date(record.timestamp).toLocaleString('zh-CN');
            const statusColor = record.status === 'success' ? '#34c759' : '#ff3b30';
            const statusText = record.status === 'success' ? '成功' : '失败';
            
            return `
                <div class="api-history-item" data-record-id="${record.id}">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <input type="checkbox" class="api-history-checkbox" onclick="updateApiHistorySelectedCount()" style="width: 18px; height: 18px; cursor: pointer;">
                        <div style="flex: 1;" onclick="openApiHistoryDetail('${record.id}')">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                                <span style="font-size: 14px; color: #333; font-weight: 500;">${escapeHtml(record.characterName || '未知角色')}</span>
                                <span style="font-size: 12px; color: ${statusColor}; font-weight: 500;">${statusText}</span>
                            </div>
                            <div style="font-size: 12px; color: #999;">${time}</div>
                        </div>
                        <div style="display: flex; gap: 8px;">
                            <button class="api-history-action-btn" onclick="event.stopPropagation(); exportSingleApiHistoryById('${record.id}')">导出</button>
                            <button class="api-history-action-btn danger" onclick="event.stopPropagation(); deleteSingleApiHistory('${record.id}')">删除</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // 重置选择计数
        updateApiHistorySelectedCount();
        
    } catch (error) {
        console.error('渲染API历史记录列表失败:', error);
        container.innerHTML = '<div style="text-align: center; color: #f44336; padding: 30px;">加载失败，请重试</div>';
    }
}

/**
 * 更新已选择数量
 */
function updateApiHistorySelectedCount() {
    const checkboxes = document.querySelectorAll('.api-history-checkbox:checked');
    const countEl = document.getElementById('apiHistorySelectedCount');
    if (countEl) {
        countEl.textContent = checkboxes.length;
    }
}

/**
 * 全选/取消全选
 */
function toggleSelectAllApiHistory() {
    const checkboxes = document.querySelectorAll('.api-history-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
    
    updateApiHistorySelectedCount();
}

/**
 * 批量删除API历史记录
 */
async function batchDeleteApiHistory() {
    const checkboxes = document.querySelectorAll('.api-history-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showToast('请先选择要删除的记录');
        return;
    }
    
    const confirmed = await iosConfirm(
        `确定要删除选中的 ${checkboxes.length} 条记录吗？`,
        '批量删除'
    );
    if (!confirmed) return;
    
    try {
        const historyList = await getApiHistoryList();
        const idsToDelete = Array.from(checkboxes).map(cb => 
            cb.closest('.api-history-item').dataset.recordId
        );
        
        const filtered = historyList.filter(r => !idsToDelete.includes(r.id));
        await saveApiHistoryList(filtered);
        
        await renderApiHistoryList();
        showToast(`已删除 ${idsToDelete.length} 条记录`);
        
    } catch (error) {
        console.error('批量删除失败:', error);
        showToast('删除失败，请重试');
    }
}

/**
 * 批量导出API历史记录
 */
async function batchExportApiHistory() {
    const checkboxes = document.querySelectorAll('.api-history-checkbox:checked');
    
    if (checkboxes.length === 0) {
        showToast('请先选择要导出的记录');
        return;
    }
    
    try {
        const historyList = await getApiHistoryList();
        const idsToExport = Array.from(checkboxes).map(cb => 
            cb.closest('.api-history-item').dataset.recordId
        );
        
        const recordsToExport = historyList.filter(r => idsToExport.includes(r.id));
        
        const dataStr = JSON.stringify(recordsToExport, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_history_batch_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast(`已导出 ${recordsToExport.length} 条记录`);
        
    } catch (error) {
        console.error('批量导出失败:', error);
        showToast('导出失败，请重试');
    }
}

/**
 * 删除单条API历史记录
 * @param {string} recordId - 记录ID
 */
async function deleteSingleApiHistory(recordId) {
    const confirmed = await iosConfirm('确定要删除这条记录吗？', '删除记录');
    if (!confirmed) return;
    
    try {
        await deleteApiHistoryRecord(recordId);
        await renderApiHistoryList();
        showToast('已删除');
    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败，请重试');
    }
}

/**
 * 导出单条API历史记录（通过ID）
 * @param {string} recordId - 记录ID
 */
async function exportSingleApiHistoryById(recordId) {
    try {
        const historyList = await getApiHistoryList();
        const record = historyList.find(r => r.id === recordId);
        
        if (!record) {
            showToast('记录不存在');
            return;
        }
        
        const dataStr = JSON.stringify(record, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_history_${recordId}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast('已导出');
        
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败，请重试');
    }
}

/**
 * 导出所有API历史记录
 */
async function exportApiHistory() {
    try {
        const historyList = await getApiHistoryList();
        
        if (historyList.length === 0) {
            showToast('暂无历史记录');
            return;
        }
        
        const dataStr = JSON.stringify(historyList, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `api_history_all_${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        showToast(`已导出 ${historyList.length} 条记录`);
        
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败，请重试');
    }
}

/**
 * 清空所有API历史记录
 */
async function clearApiHistory() {
    const historyList = await getApiHistoryList();
    
    if (historyList.length === 0) {
        showToast('暂无历史记录');
        return;
    }
    
    const confirmed = await iosConfirm(
        `确定要清空所有 ${historyList.length} 条历史记录吗？此操作不可撤销。`,
        '清空历史'
    );
    if (!confirmed) return;
    
    try {
        await saveApiHistoryList([]);
        await renderApiHistoryList();
        showToast('已清空所有历史记录');
    } catch (error) {
        console.error('清空失败:', error);
        showToast('清空失败，请重试');
    }
}

/**
 * 打开API历史详情弹窗
 * @param {string} recordId - 记录ID
 */
async function openApiHistoryDetail(recordId) {
    try {
        const historyList = await getApiHistoryList();
        const record = historyList.find(r => r.id === recordId);
        
        if (!record) {
            showToast('记录不存在');
            return;
        }
        
        // 保存当前查看的记录ID
        window._currentViewingApiHistoryId = recordId;
        
        // 填充详情
        document.getElementById('historyDetailTime').textContent = new Date(record.timestamp).toLocaleString('zh-CN');
        document.getElementById('historyDetailCharacter').textContent = record.characterName || '未知角色';
        
        const statusEl = document.getElementById('historyDetailStatus');
        if (record.status === 'success') {
            statusEl.textContent = '成功';
            statusEl.style.color = '#34c759';
        } else {
            statusEl.textContent = '失败';
            statusEl.style.color = '#ff3b30';
        }
        
        document.getElementById('historyDetailRequest').textContent = JSON.stringify(record.request, null, 2);
        document.getElementById('historyDetailResponse').textContent = JSON.stringify(record.response, null, 2);
        
        // 显示弹窗
        const modal = document.getElementById('apiHistoryDetailModal');
        if (modal) modal.style.display = 'block';
        
    } catch (error) {
        console.error('打开详情失败:', error);
        showToast('打开失败，请重试');
    }
}

/**
 * 关闭API历史详情弹窗
 */
function closeApiHistoryDetail() {
    const modal = document.getElementById('apiHistoryDetailModal');
    if (modal) modal.style.display = 'none';
    window._currentViewingApiHistoryId = null;
}

/**
 * 导出当前查看的单条记录
 */
async function exportSingleApiHistory() {
    const recordId = window._currentViewingApiHistoryId;
    if (!recordId) {
        showToast('记录ID丢失');
        return;
    }
    
    await exportSingleApiHistoryById(recordId);
}

/**
 * 复制请求数据
 */
function copyHistoryRequest() {
    const requestEl = document.getElementById('historyDetailRequest');
    if (!requestEl) return;
    
    const text = requestEl.textContent;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制请求数据');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

/**
 * 复制响应数据
 */
function copyHistoryResponse() {
    const responseEl = document.getElementById('historyDetailResponse');
    if (!responseEl) return;
    
    const text = responseEl.textContent;
    
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制响应数据');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopy(text);
        });
    } else {
        fallbackCopy(text);
    }
}

/**
 * 降级复制方法
 */
function fallbackCopy(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('已复制');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败');
    }
    
    document.body.removeChild(textarea);
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    initApiHistorySettings();
    
    // 监听历史记录限制输入框的变化
    const limitInput = document.getElementById('apiHistoryLimit');
    if (limitInput) {
        limitInput.addEventListener('change', saveApiHistoryLimit);
    }
});


// ========== 表情包识别功能 ==========

/**
 * 表情包缓存管理
 */
const MemeRecognition = {
    // 获取表情包识别设置
    getSettings() {
        const settings = localStorage.getItem('memeRecognitionSettings');
        return settings ? JSON.parse(settings) : {
            enabled: false
        };
    },

    // 保存表情包识别设置
    saveSettings(settings) {
        localStorage.setItem('memeRecognitionSettings', JSON.stringify(settings));
    },

    // 获取表情包缓存
    async getCache() {
        try {
            const cache = await storageDB.getItem('memeCache');
            return cache || {};
        } catch (e) {
            console.error('获取表情包缓存失败:', e);
            return {};
        }
    },

    // 保存表情包到缓存
    async saveToCache(imageHash, imageData, description = null) {
        try {
            const cache = await this.getCache();
            cache[imageHash] = {
                imageData: imageData,
                description: description,
                timestamp: Date.now()
            };
            await storageDB.setItem('memeCache', cache);
            console.log('表情包已缓存:', imageHash);
        } catch (e) {
            console.error('保存表情包缓存失败:', e);
        }
    },

    // 从缓存获取表情包
    async getFromCache(imageHash) {
        try {
            const cache = await this.getCache();
            return cache[imageHash] || null;
        } catch (e) {
            console.error('获取表情包缓存失败:', e);
            return null;
        }
    },

    // 计算图片hash（简单的hash算法）
    async calculateImageHash(imageData) {
        // 使用base64的前100个字符作为简单hash
        const hashSource = imageData.substring(0, 100);
        let hash = 0;
        for (let i = 0; i < hashSource.length; i++) {
            const char = hashSource.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return 'meme_' + Math.abs(hash).toString(36);
    },

    // 清理过期缓存（超过30天）
    async cleanExpiredCache() {
        try {
            const cache = await this.getCache();
            const now = Date.now();
            const thirtyDays = 30 * 24 * 60 * 60 * 1000;
            
            let cleaned = 0;
            for (const hash in cache) {
                if (now - cache[hash].timestamp > thirtyDays) {
                    delete cache[hash];
                    cleaned++;
                }
            }
            
            if (cleaned > 0) {
                await storageDB.setItem('memeCache', cache);
                console.log(`已清理 ${cleaned} 个过期表情包缓存`);
            }
        } catch (e) {
            console.error('清理表情包缓存失败:', e);
        }
    }
};

/**
 * 初始化表情包识别设置
 */
function initMemeRecognitionSettings() {
    const toggle = document.getElementById('memeRecognitionToggle');
    if (!toggle) return;
    
    const settings = MemeRecognition.getSettings();
    toggle.checked = settings.enabled || false;
}

/**
 * 切换表情包识别开关
 */
function toggleMemeRecognition() {
    const toggle = document.getElementById('memeRecognitionToggle');
    const isEnabled = toggle.checked;
    
    MemeRecognition.saveSettings({ enabled: isEnabled });
    
    if (isEnabled) {
        showToast('表情包识别已开启');
    } else {
        showToast('表情包识别已关闭');
    }
}

/**
 * 打开表情包上传界面
 */
function openMemeUpload() {
    if (!currentChatCharacter) {
        showToast('请先选择一个聊天角色');
        return;
    }

    const settings = MemeRecognition.getSettings();
    if (!settings.enabled) {
        showToast('请先在聊天设置中开启表情包识别');
        return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            // 显示加载提示
            showToast('正在处理表情包...');

            // 压缩图片
            const compressedData = await compressImage(file, {
                maxWidth: 800,
                maxHeight: 800,
                quality: 0.8,
                maxSizeKB: 500
            });

            // 计算hash
            const imageHash = await MemeRecognition.calculateImageHash(compressedData);

            // 检查缓存
            const cached = await MemeRecognition.getFromCache(imageHash);
            
            // 保存到缓存（如果是新的）
            if (!cached) {
                await MemeRecognition.saveToCache(imageHash, compressedData);
            }

            // 发送表情包消息
            await sendMemeMessage(compressedData, imageHash);

        } catch (error) {
            console.error('表情包上传失败:', error);
            showToast('表情包上传失败');
        }
    };
    input.click();
}

/**
 * 发送表情包消息
 */
async function sendMemeMessage(imageData, imageHash) {
    if (!currentChatCharacter) {
        showToast('请先选择一个聊天角色');
        return;
    }

    // 创建用户消息对象
    const userMessageObj = {
        id: Date.now().toString() + Math.random() + '_user',
        characterId: currentChatCharacter.id,
        content: '[表情包]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'meme',
        memeData: imageData,
        memeHash: imageHash
    };

    // 渲染到聊天界面
    appendMemeMessageToChat(userMessageObj);

    // 保存到数据库
    await saveMessageToDB(userMessageObj);

    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[表情包]', userMessageObj.timestamp);

    // 滚动到底部
    scrollChatToBottom();

    // 调用AI响应（将表情包发送给AI识别）
    await callChatAPIWithMeme(imageData);
}

/**
 * 渲染表情包消息到聊天界面
 */
function appendMemeMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    const time = formatMessageTime(messageObj.timestamp);
    const isUser = messageObj.type === 'user';
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message chat-message-${isUser ? 'user' : 'char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    // 用户消息（右侧）
    if (isUser) {
        messageEl.innerHTML = `
            <div class="chat-message-content">
                <div class="chat-meme-bubble">
                    <img src="${messageObj.memeData}" alt="表情包" class="chat-meme-image">
                </div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;
    } else {
        // 角色消息（左侧）
        let avatar = '';
        if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
        
        messageEl.innerHTML = `
            <div class="chat-message-avatar">
                ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
            </div>
            <div class="chat-message-content">
                <div class="chat-meme-bubble">
                    <img src="${messageObj.memeData}" alt="表情包" class="chat-meme-image">
                </div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;
    }
    
    container.appendChild(messageEl);
}

/**
 * 调用API识别表情包
 */
async function callChatAPIWithMeme(imageData) {
    try {
        // 获取API设置
        const settings = await storageDB.getItem('apiSettings');
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
            showToast('请先配置API设置');
            return;
        }

        // 显示"正在输入中"提示
        if (typeof showTypingIndicator === 'function') {
            showTypingIndicator();
        }

        // 构建消息历史
        const messages = await buildChatMessages();

        // 添加表情包识别提示
        const memePrompt = {
            role: 'user',
            content: [
                {
                    type: 'text',
                    text: '用户发送了一张表情包，请识别这张表情包的内容和含义，并理解用户想要表达的情绪或意图。请用自然的方式回复，就像你真的看到了这张表情包一样。'
                },
                {
                    type: 'image_url',
                    image_url: {
                        url: imageData
                    }
                }
            ]
        };

        messages.push(memePrompt);

        // 调用API
        let response;
        
        if (settings.provider === 'claude') {
            // Claude API支持vision
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
                    temperature: settings.temperature || 0.7,
                    messages: messages
                })
            });
        } else if (settings.provider === 'hakimi') {
            // Gemini API支持vision
            const geminiMessages = messages.map(msg => {
                if (msg.content && Array.isArray(msg.content)) {
                    const parts = msg.content.map(part => {
                        if (part.type === 'text') {
                            return { text: part.text };
                        } else if (part.type === 'image_url') {
                            // 提取base64数据
                            const base64Data = part.image_url.url.split(',')[1];
                            return {
                                inline_data: {
                                    mime_type: 'image/jpeg',
                                    data: base64Data
                                }
                            };
                        }
                    });
                    return { role: msg.role === 'assistant' ? 'model' : 'user', parts: parts };
                }
                return { role: msg.role === 'assistant' ? 'model' : 'user', parts: [{ text: msg.content }] };
            });

            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: geminiMessages,
                    generationConfig: {
                        temperature: settings.temperature || 0.7,
                        topP: settings.topP || 0.9,
                        maxOutputTokens: settings.maxTokens || 2048
                    }
                })
            });
        } else {
            // OpenAI-compatible API (GPT-4V等)
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: messages,
                    temperature: settings.temperature || 0.7,
                    max_tokens: settings.maxTokens || 2048
                })
            });
        }

        if (!response.ok) {
            throw new Error(`API请求失败: ${response.status}`);
        }

        const data = await response.json();

        // 解析响应
        let aiResponse = '';
        
        if (settings.provider === 'hakimi') {
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                aiResponse = data.candidates[0].content.parts[0].text;
            }
        } else if (settings.provider === 'claude') {
            if (data.content && data.content[0]) {
                aiResponse = data.content[0].text;
            }
        } else {
            if (data.choices && data.choices[0] && data.choices[0].message) {
                aiResponse = data.choices[0].message.content;
            }
        }

        if (!aiResponse) {
            throw new Error('AI返回了空响应');
        }

        // 隐藏typing indicator
        if (typeof hideTypingIndicator === 'function') {
            hideTypingIndicator();
        }

        // 显示AI回复
        const charMessageObj = {
            id: Date.now().toString() + Math.random() + '_char',
            characterId: currentChatCharacter.id,
            content: aiResponse,
            type: 'char',
            timestamp: new Date().toISOString(),
            sender: 'char'
        };

        // 渲染到聊天界面
        if (typeof appendTextMessageToChat === 'function') {
            appendTextMessageToChat(charMessageObj);
        }

        // 保存到数据库
        await saveMessageToDB(charMessageObj);

        // 更新聊天列表
        await updateChatListLastMessage(currentChatCharacter.id, aiResponse, charMessageObj.timestamp);

        // 滚动到底部
        scrollChatToBottom();

    } catch (error) {
        console.error('表情包识别失败:', error);
        
        if (typeof hideTypingIndicator === 'function') {
            hideTypingIndicator();
        }
        
        showToast('表情包识别失败: ' + error.message);
    }
}

/**
 * 清理表情包缓存
 */
async function clearMemeCache() {
    const confirmed = await iosConfirm('确定要清空所有表情包缓存吗？', '清空缓存');
    if (!confirmed) return;

    try {
        await storageDB.setItem('memeCache', {});
        showToast('表情包缓存已清空');
    } catch (e) {
        console.error('清空表情包缓存失败:', e);
        showToast('清空失败');
    }
}

/**
 * 查看表情包缓存统计
 */
async function showMemeCacheStats() {
    try {
        const cache = await MemeRecognition.getCache();
        const count = Object.keys(cache).length;
        
        // 计算总大小（粗略估算）
        let totalSize = 0;
        for (const hash in cache) {
            if (cache[hash].imageData) {
                totalSize += cache[hash].imageData.length;
            }
        }
        const sizeMB = (totalSize / 1024 / 1024).toFixed(2);
        
        showIosAlert('缓存统计', `已缓存表情包: ${count} 个\n估算大小: ${sizeMB} MB`);
    } catch (e) {
        console.error('获取缓存统计失败:', e);
        showToast('获取统计失败');
    }
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    initMemeRecognitionSettings();
    
    // 定期清理过期缓存（每天一次）
    const lastCleanTime = localStorage.getItem('memeCache_lastClean');
    const now = Date.now();
    if (!lastCleanTime || now - parseInt(lastCleanTime) > 24 * 60 * 60 * 1000) {
        MemeRecognition.cleanExpiredCache();
        localStorage.setItem('memeCache_lastClean', now.toString());
    }
});


// ========== 智能表情包匹配功能 ==========

// 表情包匹配配置
const StickerMatch = {
    // 获取设置
    getSettings() {
        const settings = localStorage.getItem('stickerMatchSettings');
        return settings ? JSON.parse(settings) : {
            enabled: true, // 默认开启
            maxResults: 10, // 最多显示10个匹配结果
            debounceDelay: 300 // 防抖延迟（毫秒）
        };
    },

    // 保存设置
    saveSettings(settings) {
        localStorage.setItem('stickerMatchSettings', JSON.stringify(settings));
    },

    // 缓存的表情包列表
    cachedStickers: null,
    cacheTime: 0,
    cacheDuration: 60000, // 缓存1分钟

    // 获取所有可用的表情包
    async getAllStickers() {
        const now = Date.now();
        // 如果缓存有效，直接返回
        if (this.cachedStickers && (now - this.cacheTime) < this.cacheDuration) {
            return this.cachedStickers;
        }

        try {
            // 加载用户表情包
            const userStickers = await loadStickersFromDB();
            // 加载角色表情包
            const charStickers = await loadCharStickersFromDB();
            
            // 合并并添加关键词
            const allStickers = [...userStickers, ...charStickers].map(sticker => {
                return {
                    ...sticker,
                    keywords: this.extractKeywords(sticker.name || '')
                };
            });

            // 更新缓存
            this.cachedStickers = allStickers;
            this.cacheTime = now;

            return allStickers;
        } catch (error) {
            console.error('获取表情包列表失败:', error);
            return [];
        }
    },

    // 从表情包名称提取关键词
    extractKeywords(name) {
        if (!name) return [];
        
        // 分词：按空格、标点符号等分割
        const keywords = [];
        
        // 添加完整名称
        keywords.push(name.toLowerCase());
        
        // 按常见分隔符分割
        const parts = name.split(/[\s\-_,，、。！？]+/);
        parts.forEach(part => {
            if (part.trim()) {
                keywords.push(part.toLowerCase().trim());
            }
        });

        // 提取中文字符
        const chineseChars = name.match(/[\u4e00-\u9fa5]+/g);
        if (chineseChars) {
            chineseChars.forEach(chars => {
                keywords.push(chars);
                // 如果是2-3个字，也添加单个字
                if (chars.length <= 3) {
                    for (let i = 0; i < chars.length; i++) {
                        keywords.push(chars[i]);
                    }
                }
            });
        }

        return [...new Set(keywords)]; // 去重
    },

    // 匹配表情包
    async matchStickers(inputText) {
        if (!inputText || inputText.trim().length === 0) {
            return [];
        }

        const settings = this.getSettings();
        if (!settings.enabled) {
            return [];
        }

        const allStickers = await this.getAllStickers();
        const searchText = inputText.toLowerCase().trim();
        
        // 匹配结果，带权重
        const matches = [];

        allStickers.forEach(sticker => {
            let score = 0;
            const name = (sticker.name || '').toLowerCase();

            // 完全匹配（最高权重）
            if (name === searchText) {
                score = 100;
            }
            // 名称包含搜索文本
            else if (name.includes(searchText)) {
                score = 80;
            }
            // 关键词匹配
            else if (sticker.keywords) {
                for (const keyword of sticker.keywords) {
                    if (keyword.includes(searchText)) {
                        score = Math.max(score, 60);
                    }
                    if (searchText.includes(keyword) && keyword.length > 1) {
                        score = Math.max(score, 50);
                    }
                }
            }

            if (score > 0) {
                matches.push({ sticker, score });
            }
        });

        // 按权重排序，取前N个
        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, settings.maxResults).map(m => m.sticker);
    },

    // 清除缓存
    clearCache() {
        this.cachedStickers = null;
        this.cacheTime = 0;
    }
};

// 防抖函数
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

// 显示表情包推荐
async function showStickerSuggestions(inputText) {
    const panel = document.getElementById('stickerSuggestionPanel');
    const scroll = document.getElementById('stickerSuggestionScroll');
    
    if (!panel || !scroll) return;

    // 如果输入为空，隐藏面板
    if (!inputText || inputText.trim().length === 0) {
        panel.style.display = 'none';
        return;
    }

    // 匹配表情包
    const matches = await StickerMatch.matchStickers(inputText);

    // 如果没有匹配结果，隐藏面板
    if (matches.length === 0) {
        panel.style.display = 'none';
        return;
    }

    // 渲染匹配结果
    scroll.innerHTML = matches.map(sticker => `
        <div class="sticker-suggestion-item" onclick="sendStickerFromSuggestion('${sticker.id}')">
            <div class="sticker-suggestion-thumb">
                <img src="${sticker.data}" alt="${sticker.name || '表情包'}">
            </div>
            <div class="sticker-suggestion-name">${sticker.name || '未命名'}</div>
        </div>
    `).join('');

    // 显示面板
    panel.style.display = 'block';
}

// 隐藏表情包推荐
function hideStickerSuggestions() {
    const panel = document.getElementById('stickerSuggestionPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

// 从推荐中发送表情包
async function sendStickerFromSuggestion(stickerId) {
    try {
        // 获取表情包数据
        const userStickers = await loadStickersFromDB();
        const charStickers = await loadCharStickersFromDB();
        const allStickers = [...userStickers, ...charStickers];
        
        const sticker = allStickers.find(s => s.id === stickerId);
        if (!sticker) {
            showToast('表情包不存在');
            return;
        }

        // 发送表情包消息
        await sendStickerMessage(sticker);

        // 清空输入框
        const inputField = document.getElementById('chatInputField');
        if (inputField) {
            inputField.value = '';
        }

        // 隐藏推荐面板
        hideStickerSuggestions();

        // 触发触感反馈
        if (typeof triggerHapticFeedback === 'function') {
            triggerHapticFeedback();
        }

    } catch (error) {
        console.error('发送表情包失败:', error);
        showToast('发送失败');
    }
}

// 创建防抖的匹配函数
const debouncedMatch = debounce(async (inputText) => {
    await showStickerSuggestions(inputText);
}, StickerMatch.getSettings().debounceDelay);

// 初始化表情包匹配功能
function initStickerMatch() {
    const inputField = document.getElementById('chatInputField');
    if (!inputField) return;

    // 监听输入事件
    inputField.addEventListener('input', (e) => {
        const settings = StickerMatch.getSettings();
        if (!settings.enabled) {
            hideStickerSuggestions();
            return;
        }

        const inputText = e.target.value;
        debouncedMatch(inputText);
    });

    // 监听焦点失去事件（延迟隐藏，以便点击表情包）
    inputField.addEventListener('blur', () => {
        setTimeout(() => {
            hideStickerSuggestions();
        }, 200);
    });

    // 监听回车发送消息后隐藏推荐
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            hideStickerSuggestions();
        }
    });
}

// 切换表情包匹配开关
function toggleStickerMatch() {
    const toggle = document.getElementById('stickerMatchToggle');
    if (!toggle) return;

    const settings = StickerMatch.getSettings();
    settings.enabled = toggle.checked;
    StickerMatch.saveSettings(settings);

    if (settings.enabled) {
        showToast('智能表情包匹配已开启');
    } else {
        showToast('智能表情包匹配已关闭');
        hideStickerSuggestions();
    }
}

// 初始化表情包匹配设置
function initStickerMatchSettings() {
    const toggle = document.getElementById('stickerMatchToggle');
    if (!toggle) return;

    const settings = StickerMatch.getSettings();
    toggle.checked = settings.enabled;
}


// ========== 自定义时间功能 ==========

/**
 * 切换时间感知开关
 */
function toggleTimeAwareness() {
    const timeAwarenessToggle = document.getElementById('timeAwarenessToggle');
    const customTimeToggle = document.getElementById('customTimeToggle');
    
    // 如果关闭时间感知，同时关闭自定义时间
    if (!timeAwarenessToggle.checked && customTimeToggle.checked) {
        customTimeToggle.checked = false;
        toggleCustomTime();
        showToast('已同时关闭自定义时间');
    }
}

/**
 * 切换自定义时间开关
 */
function toggleCustomTime() {
    const customTimeToggle = document.getElementById('customTimeToggle');
    const timeAwarenessToggle = document.getElementById('timeAwarenessToggle');
    const customTimeSettings = document.getElementById('customTimeSettings');
    
    if (customTimeToggle.checked) {
        // 开启自定义时间，同时确保时间感知也开启
        timeAwarenessToggle.checked = true;
        customTimeSettings.style.display = 'block';
        
        // 初始化为当前时间
        const now = new Date();
        document.getElementById('customYear').value = now.getFullYear();
        document.getElementById('customMonth').value = now.getMonth() + 1;
        document.getElementById('customDay').value = now.getDate();
        document.getElementById('customHour').value = now.getHours();
        document.getElementById('customMinute').value = now.getMinutes();
        document.getElementById('customSecond').value = now.getSeconds();
        
        showToast('自定义时间已开启');
    } else {
        // 关闭自定义时间
        customTimeSettings.style.display = 'none';
        showToast('自定义时间已关闭');
    }
    
    // 保存设置（包括时间感知状态）
    saveCustomTimeSettings();
    
    // 同时保存时间感知状态到角色
    if (currentChatCharacter) {
        currentChatCharacter.timeAwareness = timeAwarenessToggle.checked;
        if (typeof saveChatCharacterToDB === 'function') {
            saveChatCharacterToDB(currentChatCharacter);
        }
    }
}

/**
 * 保存自定义时间设置
 */
function saveCustomTimeSettings() {
    if (!currentChatCharacter) return;
    
    const customTimeToggle = document.getElementById('customTimeToggle');
    const settings = {
        enabled: customTimeToggle.checked,
        year: parseInt(document.getElementById('customYear').value) || new Date().getFullYear(),
        month: parseInt(document.getElementById('customMonth').value) || 1,
        day: parseInt(document.getElementById('customDay').value) || 1,
        hour: parseInt(document.getElementById('customHour').value) || 0,
        minute: parseInt(document.getElementById('customMinute').value) || 0,
        second: parseInt(document.getElementById('customSecond').value) || 0
    };
    
    currentChatCharacter.customTime = settings;
    
    // 保存到数据库
    if (typeof saveChatCharacterToDB === 'function') {
        saveChatCharacterToDB(currentChatCharacter);
    }
}

/**
 * 加载自定义时间设置
 */
function loadCustomTimeSettings() {
    if (!currentChatCharacter) return;
    
    const customTimeToggle = document.getElementById('customTimeToggle');
    const customTimeSettings = document.getElementById('customTimeSettings');
    const timeAwarenessToggle = document.getElementById('timeAwarenessToggle');
    
    if (currentChatCharacter.customTime && currentChatCharacter.customTime.enabled) {
        // 有自定义时间设置
        customTimeToggle.checked = true;
        customTimeSettings.style.display = 'block';
        
        // 确保时间感知也开启
        timeAwarenessToggle.checked = true;
        
        // 加载时间值
        const ct = currentChatCharacter.customTime;
        document.getElementById('customYear').value = ct.year || new Date().getFullYear();
        document.getElementById('customMonth').value = ct.month || 1;
        document.getElementById('customDay').value = ct.day || 1;
        document.getElementById('customHour').value = ct.hour || 0;
        document.getElementById('customMinute').value = ct.minute || 0;
        document.getElementById('customSecond').value = ct.second || 0;
    } else {
        // 没有自定义时间设置
        customTimeToggle.checked = false;
        customTimeSettings.style.display = 'none';
    }
}

/**
 * 获取当前使用的时间（自定义时间或真实时间）
 * @returns {Date} 时间对象
 */
function getCurrentTime() {
    if (currentChatCharacter && currentChatCharacter.customTime && currentChatCharacter.customTime.enabled) {
        // 使用自定义时间
        const ct = currentChatCharacter.customTime;
        const customDate = new Date(ct.year, ct.month - 1, ct.day, ct.hour, ct.minute, ct.second);
        console.log('🕐 使用自定义时间:', customDate.toLocaleString('zh-CN'));
        console.log('📋 自定义时间设置:', ct);
        return customDate;
    } else {
        // 使用真实时间
        const realDate = new Date();
        console.log('🕐 使用真实时间:', realDate.toLocaleString('zh-CN'));
        return realDate;
    }
}

/**
 * 获取当前时间的ISO字符串（用于消息时间戳）
 * 会根据自定义时间设置返回对应的时间戳
 * @returns {string} ISO格式的时间字符串
 */
function getCurrentTimeISO() {
    return getCurrentTime().toISOString();
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 监听自定义时间输入框的变化
    const customTimeInputs = ['customYear', 'customMonth', 'customDay', 'customHour', 'customMinute', 'customSecond'];
    customTimeInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('change', saveCustomTimeSettings);
        }
    });
});


// ========== 气泡形状样式功能 ==========

/**
 * 气泡形状方案配置
 */
const BUBBLE_SHAPES = [
    {
        id: 1,
        name: '方案1',
        title: '圆角气泡',
        description: '经典圆角矩形气泡，带小尾巴'
    },
    {
        id: 2,
        name: '方案2',
        title: '全圆角',
        description: '胶囊形状，无尾巴'
    },
    {
        id: 3,
        name: '方案3',
        title: '直角矩形',
        description: '方正简洁，无圆角'
    },
    {
        id: 4,
        name: '方案4',
        title: '大圆角',
        description: '柔和圆角，无尾巴'
    },
    {
        id: 5,
        name: '方案5',
        title: '不规则圆角',
        description: 'iOS拟态风格'
    },
    {
        id: 6,
        name: '方案6',
        title: '扁平边框',
        description: '方形带边框'
    },
    {
        id: 7,
        name: '方案7',
        title: '气泡形',
        description: '对话框样式'
    },
    {
        id: 8,
        name: '方案8',
        title: '卡片式',
        description: '带阴影效果'
    }
];

/**
 * 获取当前气泡形状
 */
function getCurrentBubbleShape() {
    const shapeId = localStorage.getItem('bubbleShapeId');
    return shapeId ? parseInt(shapeId) : 1; // 默认方案1
}

/**
 * 保存气泡形状
 */
function saveBubbleShape(shapeId) {
    localStorage.setItem('bubbleShapeId', shapeId.toString());
}

/**
 * 应用气泡形状
 */
function applyBubbleShape(shapeId) {
    const chatPage = document.getElementById('chatPage');
    const chatDetailPage = document.getElementById('chatDetailPage');
    
    console.log('🔍 applyBubbleShape 调用:', {
        shapeId,
        chatPage: chatPage ? '找到' : '未找到',
        chatDetailPage: chatDetailPage ? '找到' : '未找到'
    });
    
    if (!chatPage && !chatDetailPage) {
        console.error('❌ chatPage 和 chatDetailPage 都未找到！');
        return;
    }
    
    // 移除所有形状类
    for (let i = 1; i <= BUBBLE_SHAPES.length; i++) {
        if (chatPage) chatPage.classList.remove(`bubble-shape-${i}`);
        if (chatDetailPage) chatDetailPage.classList.remove(`bubble-shape-${i}`);
    }
    
    // 添加新形状类
    if (chatPage) chatPage.classList.add(`bubble-shape-${shapeId}`);
    if (chatDetailPage) chatDetailPage.classList.add(`bubble-shape-${shapeId}`);
    
    console.log('✅ 已添加类名:', `bubble-shape-${shapeId}`);
    if (chatPage) console.log('📋 chatPage类名:', chatPage.className);
    if (chatDetailPage) console.log('📋 chatDetailPage类名:', chatDetailPage.className);
    
    // 保存设置
    saveBubbleShape(shapeId);
    
    console.log(`✅ 已应用气泡形状方案${shapeId}`);
}

/**
 * 切换气泡形状
 */
function switchBubbleShape(shapeId) {
    // 触发触感反馈
    if (typeof triggerHapticFeedback === 'function') {
        triggerHapticFeedback();
    }
    
    // 应用形状
    applyBubbleShape(shapeId);
    
    // 更新UI
    updateCurrentBubbleShapeDisplay();
    renderBubbleShapeGrid();
    
    const shape = BUBBLE_SHAPES.find(s => s.id === shapeId);
    showToast(`已切换到${shape.title}`);
}

/**
 * 打开气泡形状选择器
 */
function openBubbleStyleSelector() {
    // 触发触感反馈
    if (typeof triggerHapticFeedback === 'function') {
        triggerHapticFeedback();
    }
    
    const modal = document.getElementById('bubbleStyleSelectorModal');
    if (!modal) return;
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
    
    // 渲染气泡形状网格
    renderBubbleShapeGrid();
}

/**
 * 关闭气泡形状选择器
 */
function closeBubbleStyleSelector() {
    // 触发触感反馈
    if (typeof triggerHapticFeedback === 'function') {
        triggerHapticFeedback();
    }
    
    const modal = document.getElementById('bubbleStyleSelectorModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

/**
 * 渲染气泡形状网格
 */
function renderBubbleShapeGrid() {
    const container = document.getElementById('bubbleStyleGrid');
    if (!container) return;
    
    const currentShapeId = getCurrentBubbleShape();
    
    container.innerHTML = BUBBLE_SHAPES.map(shape => {
        const isActive = shape.id === currentShapeId;
        
        return `
            <div class="bubble-shape-card ${isActive ? 'active' : ''}" onclick="switchBubbleShape(${shape.id}); closeBubbleStyleSelector();">
                <div class="bubble-shape-name">${escapeHtml(shape.title)}</div>
                <div style="font-size: 11px; color: #999; margin-bottom: 10px;">${escapeHtml(shape.description)}</div>
                <div class="bubble-shape-preview bubble-shape-${shape.id}">
                    <div class="bubble-shape-preview-user">你好</div>
                    <div class="bubble-shape-preview-char">在吗</div>
                </div>
                ${isActive ? '<div style="margin-top: 8px; font-size: 11px; color: #007bff; font-weight: 600;">✓ 当前</div>' : ''}
            </div>
        `;
    }).join('');
}

/**
 * 更新当前气泡形状显示
 */
function updateCurrentBubbleShapeDisplay() {
    const currentShapeId = getCurrentBubbleShape();
    const shape = BUBBLE_SHAPES.find(s => s.id === currentShapeId);
    
    if (!shape) return;
    
    const nameEl = document.getElementById('currentBubbleStyleName');
    const descEl = document.getElementById('currentBubbleStyleDesc');
    
    if (nameEl) nameEl.textContent = `${shape.name} - ${shape.title}`;
    if (descEl) descEl.textContent = shape.description;
}

/**
 * 初始化气泡形状
 */
function initBubbleShape() {
    const shapeId = getCurrentBubbleShape();
    applyBubbleShape(shapeId);
    updateCurrentBubbleShapeDisplay();
    console.log(`🎨 初始化气泡形状: 方案${shapeId}`);
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 初始化气泡形状
    initBubbleShape();
});



// ========== 气泡颜色管理功能 ==========

// 预设颜色方案
const PRESET_BUBBLE_COLORS = [
    { name: '经典蓝灰', userColor: '#007aff', aiColor: '#e5e5ea' },
    { name: '温暖橙', userColor: '#ff9500', aiColor: '#fff3e0' },
    { name: '清新绿', userColor: '#34c759', aiColor: '#e8f5e9' },
    { name: '优雅紫', userColor: '#af52de', aiColor: '#f3e5f5' },
    { name: '活力红', userColor: '#ff3b30', aiColor: '#ffebee' },
    { name: '深邃蓝', userColor: '#5856d6', aiColor: '#e8eaf6' },
    { name: '柔和粉', userColor: '#ff2d55', aiColor: '#fce4ec' },
    { name: '商务灰', userColor: '#8e8e93', aiColor: '#f5f5f5' }
];

/**
 * 初始化气泡颜色设置
 */
function initBubbleColorSettings() {
    // 渲染预设颜色网格
    renderPresetColorGrid();
    
    // 加载自定义方案到下拉框
    loadColorSchemeSelect();
    
    // 加载当前颜色到颜色选择器
    const currentColors = getBubbleColors();
    document.getElementById('userBubbleColorPicker').value = currentColors.userColor;
    document.getElementById('aiBubbleColorPicker').value = currentColors.aiColor;
}

/**
 * 渲染预设颜色网格
 */
function renderPresetColorGrid() {
    const grid = document.getElementById('presetColorGrid');
    if (!grid) return;
    
    const currentColors = getBubbleColors();
    
    grid.innerHTML = PRESET_BUBBLE_COLORS.map((preset, index) => {
        const isSelected = currentColors.userColor === preset.userColor && 
                          currentColors.aiColor === preset.aiColor;
        
        return `
            <div class="preset-color-btn ${isSelected ? 'selected' : ''}" 
                 onclick="applyPresetColor(${index})"
                 title="${preset.name}">
                <div class="preset-color-split">
                    <div class="preset-color-left" style="background-color: ${preset.userColor};">我</div>
                    <div class="preset-color-right" style="background-color: ${preset.aiColor};">AI</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 应用预设颜色
 */
function applyPresetColor(index) {
    const preset = PRESET_BUBBLE_COLORS[index];
    if (!preset) return;
    
    // 保存颜色
    saveBubbleColors(preset.userColor, preset.aiColor);
    
    // 应用到界面
    applyBubbleColorsToUI(preset.userColor, preset.aiColor);
    
    // 更新颜色选择器
    document.getElementById('userBubbleColorPicker').value = preset.userColor;
    document.getElementById('aiBubbleColorPicker').value = preset.aiColor;
    
    // 重新渲染预设网格（更新选中状态）
    renderPresetColorGrid();
    
    showToast(`已应用 ${preset.name}`);
}

/**
 * 应用自定义颜色
 */
function applyCustomBubbleColor() {
    const userColor = document.getElementById('userBubbleColorPicker').value;
    const aiColor = document.getElementById('aiBubbleColorPicker').value;
    
    // 保存颜色
    saveBubbleColors(userColor, aiColor);
    
    // 应用到界面
    applyBubbleColorsToUI(userColor, aiColor);
    
    // 重新渲染预设网格（取消选中状态）
    renderPresetColorGrid();
    
    showToast('自定义颜色已应用');
}

/**
 * 获取当前气泡颜色
 */
function getBubbleColors() {
    const saved = localStorage.getItem('bubbleColors');
    if (saved) {
        return JSON.parse(saved);
    }
    return { userColor: '#007aff', aiColor: '#e5e5ea' };
}

/**
 * 保存气泡颜色
 */
function saveBubbleColors(userColor, aiColor) {
    localStorage.setItem('bubbleColors', JSON.stringify({ userColor, aiColor }));
}

/**
 * 应用气泡颜色到UI
 */
function applyBubbleColorsToUI(userColor, aiColor) {
    // 创建或更新style标签
    let styleEl = document.getElementById('bubbleColorStyle');
    if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'bubbleColorStyle';
        document.head.appendChild(styleEl);
    }
    
    styleEl.textContent = `
        /* 用户消息气泡颜色 */
        .chat-message-user .chat-message-bubble {
            background-color: ${userColor} !important;
        }
        
        /* AI消息气泡颜色 */
        .chat-message-char .chat-message-bubble {
            background-color: ${aiColor} !important;
        }
        
        /* 用户消息气泡尾巴颜色 */
        .chat-message-user .chat-message-bubble::after {
            border-left-color: ${userColor} !important;
        }
        
        /* AI消息气泡尾巴颜色 */
        .chat-message-char .chat-message-bubble::after {
            border-right-color: ${aiColor} !important;
        }
    `;
}

/**
 * 保存自定义颜色方案
 */
function saveCustomColorScheme() {
    const name = document.getElementById('customColorSchemeName').value.trim();
    if (!name) {
        showToast('请输入方案名称');
        return;
    }
    
    const userColor = document.getElementById('userBubbleColorPicker').value;
    const aiColor = document.getElementById('aiBubbleColorPicker').value;
    
    // 获取现有方案
    const schemes = getCustomColorSchemes();
    
    // 检查是否已存在同名方案
    if (schemes.some(s => s.name === name)) {
        showToast('方案名称已存在');
        return;
    }
    
    // 添加新方案
    schemes.push({
        id: Date.now().toString(),
        name: name,
        userColor: userColor,
        aiColor: aiColor,
        createdAt: new Date().toISOString()
    });
    
    // 保存
    saveCustomColorSchemes(schemes);
    
    // 清空输入框
    document.getElementById('customColorSchemeName').value = '';
    
    // 重新加载下拉框
    loadColorSchemeSelect();
    
    showToast('方案已保存');
}

/**
 * 获取自定义颜色方案列表
 */
function getCustomColorSchemes() {
    const saved = localStorage.getItem('customBubbleColorSchemes');
    return saved ? JSON.parse(saved) : [];
}

/**
 * 保存自定义颜色方案列表
 */
function saveCustomColorSchemes(schemes) {
    localStorage.setItem('customBubbleColorSchemes', JSON.stringify(schemes));
}

/**
 * 加载颜色方案到下拉框
 */
function loadColorSchemeSelect() {
    const select = document.getElementById('colorSchemeSelect');
    if (!select) return;
    
    const schemes = getCustomColorSchemes();
    
    select.innerHTML = '<option value="">选择方案</option>' + 
        schemes.map(scheme => `
            <option value="${scheme.id}">${scheme.name}</option>
        `).join('');
}

/**
 * 加载选中的颜色方案
 */
function loadColorScheme() {
    const select = document.getElementById('colorSchemeSelect');
    const schemeId = select.value;
    
    if (!schemeId) return;
    
    const schemes = getCustomColorSchemes();
    const scheme = schemes.find(s => s.id === schemeId);
    
    if (!scheme) {
        showToast('方案不存在');
        return;
    }
    
    // 更新颜色选择器
    document.getElementById('userBubbleColorPicker').value = scheme.userColor;
    document.getElementById('aiBubbleColorPicker').value = scheme.aiColor;
    
    // 应用颜色
    saveBubbleColors(scheme.userColor, scheme.aiColor);
    applyBubbleColorsToUI(scheme.userColor, scheme.aiColor);
    
    // 重新渲染预设网格
    renderPresetColorGrid();
    
    showToast(`已加载方案：${scheme.name}`);
}

/**
 * 打开删除颜色方案弹窗
 */
function openDeleteColorSchemes() {
    const schemes = getCustomColorSchemes();
    
    if (schemes.length === 0) {
        showToast('暂无自定义方案');
        return;
    }
    
    const modal = document.getElementById('deleteColorSchemesModal');
    if (!modal) return;
    
    // 渲染方案列表
    renderDeleteColorSchemesList();
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * 关闭删除颜色方案弹窗
 */
function closeDeleteColorSchemes() {
    const modal = document.getElementById('deleteColorSchemesModal');
    if (!modal) return;
    
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

/**
 * 渲染删除方案列表
 */
function renderDeleteColorSchemesList() {
    const container = document.getElementById('deleteColorSchemesList');
    if (!container) return;
    
    const schemes = getCustomColorSchemes();
    
    if (schemes.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px;">
                暂无自定义方案
            </div>
        `;
        return;
    }
    
    container.innerHTML = schemes.map(scheme => {
        const date = new Date(scheme.createdAt).toLocaleString('zh-CN');
        return `
            <div class="color-scheme-item" data-scheme-id="${scheme.id}">
                <input type="checkbox" onclick="event.stopPropagation()">
                <div class="color-scheme-preview">
                    <div class="color-scheme-preview-box" style="background-color: ${scheme.userColor};"></div>
                    <div class="color-scheme-preview-box" style="background-color: ${scheme.aiColor};"></div>
                </div>
                <div class="color-scheme-info">
                    <div class="color-scheme-name">${escapeHtml(scheme.name)}</div>
                    <div class="color-scheme-date">${date}</div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * 全选/取消全选颜色方案
 */
function toggleSelectAllColorSchemes() {
    const checkboxes = document.querySelectorAll('#deleteColorSchemesList input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

/**
 * 确认删除选中的颜色方案
 */
async function confirmDeleteColorSchemes() {
    const checkboxes = document.querySelectorAll('#deleteColorSchemesList input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showToast('请先选择要删除的方案');
        return;
    }
    
    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 个方案吗？`, '删除确认');
    if (!confirmed) return;
    
    // 获取要删除的方案ID
    const idsToDelete = Array.from(checkboxes).map(cb => 
        cb.closest('.color-scheme-item').dataset.schemeId
    );
    
    // 获取现有方案
    const schemes = getCustomColorSchemes();
    
    // 过滤掉要删除的方案
    const filtered = schemes.filter(s => !idsToDelete.includes(s.id));
    
    // 保存
    saveCustomColorSchemes(filtered);
    
    // 重新加载下拉框
    loadColorSchemeSelect();
    
    // 重新渲染列表
    renderDeleteColorSchemesList();
    
    showToast(`已删除 ${idsToDelete.length} 个方案`);
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 应用保存的气泡颜色
    const colors = getBubbleColors();
    applyBubbleColorsToUI(colors.userColor, colors.aiColor);
});


// ========== 气泡装饰功能 ==========

/**
 * 获取气泡装饰配置
 */
function getBubbleDecorationConfig() {
    const config = localStorage.getItem('bubbleDecorationConfig');
    return config ? JSON.parse(config) : {
        enabled: false,
        imageUrl: '',
        imageType: 'url',
        position: {
            preset: 'top-right',
            offsetX: 0,
            offsetY: 0
        },
        size: 40,
        opacity: 100,
        rotation: 0,
        applyTo: 'both'
    };
}

/**
 * 保存气泡装饰配置
 */
function saveBubbleDecorationConfig(config) {
    localStorage.setItem('bubbleDecorationConfig', JSON.stringify(config));
}

/**
 * 获取气泡装饰预设列表
 */
function getBubbleDecorationPresets() {
    const presets = localStorage.getItem('bubbleDecorationPresets');
    return presets ? JSON.parse(presets) : [];
}

/**
 * 保存气泡装饰预设列表
 */
function saveBubbleDecorationPresets(presets) {
    localStorage.setItem('bubbleDecorationPresets', JSON.stringify(presets));
}

/**
 * 初始化气泡装饰设置界面
 */
function initBubbleDecorationSettings() {
    const config = getBubbleDecorationConfig();
    
    // 启用开关
    document.getElementById('bubbleDecorationToggle').checked = config.enabled;
    
    // 图片预览
    if (config.imageUrl) {
        document.getElementById('bubbleDecorationImagePreview').src = config.imageUrl;
        document.getElementById('bubbleDecorationImagePreview').style.display = 'block';
        document.getElementById('bubbleDecorationImagePlaceholder').style.display = 'none';
    }
    
    // 位置
    document.querySelectorAll('.bubble-decoration-position-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.position === config.position.preset) {
            btn.classList.add('active');
        }
    });
    
    // 偏移
    document.getElementById('bubbleDecorationOffsetX').value = config.position.offsetX;
    document.getElementById('bubbleDecorationOffsetY').value = config.position.offsetY;
    document.getElementById('bubbleDecorationOffsetXValue').textContent = config.position.offsetX;
    document.getElementById('bubbleDecorationOffsetYValue').textContent = config.position.offsetY;
    
    // 大小
    document.getElementById('bubbleDecorationSize').value = config.size;
    document.getElementById('bubbleDecorationSizeValue').textContent = config.size;
    
    // 透明度
    document.getElementById('bubbleDecorationOpacity').value = config.opacity;
    document.getElementById('bubbleDecorationOpacityValue').textContent = config.opacity;
    
    // 旋转
    document.getElementById('bubbleDecorationRotation').value = config.rotation;
    document.getElementById('bubbleDecorationRotationValue').textContent = config.rotation;
    
    // 应用范围
    document.querySelectorAll('input[name="bubbleDecorationApplyTo"]').forEach(radio => {
        radio.checked = radio.value === config.applyTo;
    });
    
    // 加载预设列表
    loadBubbleDecorationPresetsList();
    
    // 应用装饰
    applyBubbleDecoration();
}

/**
 * 切换气泡装饰开关
 */
function toggleBubbleDecoration() {
    const config = getBubbleDecorationConfig();
    config.enabled = document.getElementById('bubbleDecorationToggle').checked;
    saveBubbleDecorationConfig(config);
    applyBubbleDecoration();
    
    if (config.enabled) {
        showToast('气泡装饰已开启');
    } else {
        showToast('气泡装饰已关闭');
    }
}

/**
 * 上传气泡装饰图片
 */
function uploadBubbleDecorationImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            // 读取图片
            const reader = new FileReader();
            reader.onload = (event) => {
                const imageUrl = event.target.result;
                
                // 更新预览
                document.getElementById('bubbleDecorationImagePreview').src = imageUrl;
                document.getElementById('bubbleDecorationImagePreview').style.display = 'block';
                document.getElementById('bubbleDecorationImagePlaceholder').style.display = 'none';
                
                // 保存到配置
                const config = getBubbleDecorationConfig();
                config.imageUrl = imageUrl;
                config.imageType = 'local';
                saveBubbleDecorationConfig(config);
                
                showToast('图片已上传');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('图片上传失败:', error);
            showToast('图片上传失败');
        }
    };
    input.click();
}

/**
 * 显示URL输入区域
 */
function showBubbleDecorationUrlInput() {
    const section = document.getElementById('bubbleDecorationUrlSection');
    section.style.display = section.style.display === 'none' ? 'block' : 'none';
}

/**
 * 从URL加载气泡装饰图片
 */
function loadBubbleDecorationFromUrl() {
    const url = document.getElementById('bubbleDecorationUrlInput').value.trim();
    if (!url) {
        showToast('请输入图片URL');
        return;
    }
    
    // 更新预览
    const preview = document.getElementById('bubbleDecorationImagePreview');
    preview.src = url;
    preview.style.display = 'block';
    document.getElementById('bubbleDecorationImagePlaceholder').style.display = 'none';
    
    preview.onerror = () => {
        showToast('图片加载失败');
        preview.style.display = 'none';
        document.getElementById('bubbleDecorationImagePlaceholder').style.display = 'flex';
    };
    
    preview.onload = () => {
        // 保存到配置
        const config = getBubbleDecorationConfig();
        config.imageUrl = url;
        config.imageType = 'url';
        saveBubbleDecorationConfig(config);
        showToast('图片已加载');
    };
}

/**
 * 重置气泡装饰图片
 */
function resetBubbleDecorationImage() {
    const config = getBubbleDecorationConfig();
    config.imageUrl = '';
    config.imageType = 'url';
    saveBubbleDecorationConfig(config);
    
    document.getElementById('bubbleDecorationImagePreview').style.display = 'none';
    document.getElementById('bubbleDecorationImagePreview').src = '';
    document.getElementById('bubbleDecorationImagePlaceholder').style.display = 'flex';
    document.getElementById('bubbleDecorationUrlInput').value = '';
    
    applyBubbleDecoration();
    showToast('图片已重置');
}

/**
 * 选择气泡装饰位置
 */
function selectBubbleDecorationPosition(position) {
    document.querySelectorAll('.bubble-decoration-position-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    const config = getBubbleDecorationConfig();
    config.position.preset = position;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 更新气泡装饰偏移
 */
function updateBubbleDecorationOffset() {
    const offsetX = parseInt(document.getElementById('bubbleDecorationOffsetX').value);
    const offsetY = parseInt(document.getElementById('bubbleDecorationOffsetY').value);
    
    document.getElementById('bubbleDecorationOffsetXValue').textContent = offsetX;
    document.getElementById('bubbleDecorationOffsetYValue').textContent = offsetY;
    
    const config = getBubbleDecorationConfig();
    config.position.offsetX = offsetX;
    config.position.offsetY = offsetY;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 更新气泡装饰大小
 */
function updateBubbleDecorationSize() {
    const size = parseInt(document.getElementById('bubbleDecorationSize').value);
    document.getElementById('bubbleDecorationSizeValue').textContent = size;
    
    const config = getBubbleDecorationConfig();
    config.size = size;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 更新气泡装饰透明度
 */
function updateBubbleDecorationOpacity() {
    const opacity = parseInt(document.getElementById('bubbleDecorationOpacity').value);
    document.getElementById('bubbleDecorationOpacityValue').textContent = opacity;
    
    const config = getBubbleDecorationConfig();
    config.opacity = opacity;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 更新气泡装饰旋转角度
 */
function updateBubbleDecorationRotation() {
    const rotation = parseInt(document.getElementById('bubbleDecorationRotation').value);
    document.getElementById('bubbleDecorationRotationValue').textContent = rotation;
    
    const config = getBubbleDecorationConfig();
    config.rotation = rotation;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 更新气泡装饰应用范围
 */
function updateBubbleDecorationApplyTo() {
    const applyTo = document.querySelector('input[name="bubbleDecorationApplyTo"]:checked').value;
    
    const config = getBubbleDecorationConfig();
    config.applyTo = applyTo;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
}

/**
 * 保存气泡装饰设置
 */
function saveBubbleDecorationSettings() {
    const config = getBubbleDecorationConfig();
    
    if (!config.imageUrl) {
        showToast('请先上传装饰图片');
        return;
    }
    
    config.enabled = true;
    document.getElementById('bubbleDecorationToggle').checked = true;
    saveBubbleDecorationConfig(config);
    
    applyBubbleDecoration();
    showToast('装饰设置已保存');
}

/**
 * 应用气泡装饰
 */
function applyBubbleDecoration() {
    const config = getBubbleDecorationConfig();
    
    // 移除旧的样式
    const oldStyle = document.getElementById('bubbleDecorationStyle');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (!config.enabled || !config.imageUrl) {
        return;
    }
    
    // 计算位置
    const positionMap = {
        'top-left': { top: '5%', left: '5%', transform: '' },
        'top': { top: '5%', left: '50%', transform: 'translateX(-50%)' },
        'top-right': { top: '5%', right: '5%', transform: '' },
        'left': { top: '50%', left: '5%', transform: 'translateY(-50%)' },
        'center': { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
        'right': { top: '50%', right: '5%', transform: 'translateY(-50%)' },
        'bottom-left': { bottom: '5%', left: '5%', transform: '' },
        'bottom': { bottom: '5%', left: '50%', transform: 'translateX(-50%)' },
        'bottom-right': { bottom: '5%', right: '5%', transform: '' }
    };
    
    const pos = positionMap[config.position.preset] || positionMap['top-right'];
    
    // 构建CSS
    let css = '';
    const selector = config.applyTo === 'both' ? '.chat-message-bubble::before' :
                     config.applyTo === 'user' ? '.chat-message-user .chat-message-bubble::before' :
                     '.chat-message-char .chat-message-bubble::before';
    
    css += `${selector} {
        background-image: url('${config.imageUrl}');
        width: ${config.size}px;
        height: ${config.size}px;
        opacity: ${config.opacity / 100};
    `;
    
    if (pos.top) css += `top: calc(${pos.top} + ${config.position.offsetY}%);`;
    if (pos.bottom) css += `bottom: calc(${pos.bottom} - ${config.position.offsetY}%);`;
    if (pos.left) css += `left: calc(${pos.left} + ${config.position.offsetX}%);`;
    if (pos.right) css += `right: calc(${pos.right} - ${config.position.offsetX}%);`;
    
    let transform = pos.transform;
    if (config.rotation !== 0) {
        transform = transform ? `${transform} rotate(${config.rotation}deg)` : `rotate(${config.rotation}deg)`;
    }
    if (transform) {
        css += `transform: ${transform};`;
    }
    
    css += '}';
    
    // 注入样式
    const style = document.createElement('style');
    style.id = 'bubbleDecorationStyle';
    style.textContent = css;
    document.head.appendChild(style);
}

/**
 * 保存气泡装饰预设
 */
function saveBubbleDecorationPreset() {
    const name = document.getElementById('bubbleDecorationPresetName').value.trim();
    if (!name) {
        showToast('请输入预设名称');
        return;
    }
    
    const config = getBubbleDecorationConfig();
    if (!config.imageUrl) {
        showToast('请先配置装饰图片');
        return;
    }
    
    const presets = getBubbleDecorationPresets();
    const preset = {
        id: Date.now().toString(),
        name: name,
        config: JSON.parse(JSON.stringify(config)),
        createdAt: new Date().toISOString()
    };
    
    presets.push(preset);
    saveBubbleDecorationPresets(presets);
    
    loadBubbleDecorationPresetsList();
    document.getElementById('bubbleDecorationPresetName').value = '';
    showToast('预设已保存');
}

/**
 * 加载气泡装饰预设列表
 */
function loadBubbleDecorationPresetsList() {
    const presets = getBubbleDecorationPresets();
    const select = document.getElementById('bubbleDecorationPresetSelect');
    
    select.innerHTML = '<option value="">选择预设</option>';
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        select.appendChild(option);
    });
}

/**
 * 加载气泡装饰预设
 */
function loadBubbleDecorationPreset() {
    const select = document.getElementById('bubbleDecorationPresetSelect');
    const presetId = select.value;
    
    if (!presetId) return;
    
    const presets = getBubbleDecorationPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
        showToast('预设不存在');
        return;
    }
    
    // 应用预设配置
    saveBubbleDecorationConfig(preset.config);
    initBubbleDecorationSettings();
    applyBubbleDecoration();
    
    showToast('预设已加载');
}

/**
 * 打开删除气泡装饰预设弹窗
 */
function openDeleteBubbleDecorationPresets() {
    const presets = getBubbleDecorationPresets();
    
    if (presets.length === 0) {
        showToast('暂无预设');
        return;
    }
    
    const modal = document.getElementById('deleteBubbleDecorationPresetsModal');
    const list = document.getElementById('deleteBubbleDecorationPresetsList');
    
    list.innerHTML = presets.map(preset => `
        <div class="bubble-decoration-preset-item" data-preset-id="${preset.id}">
            <input type="checkbox" onclick="event.stopPropagation()">
            <div style="flex: 1;">
                <div class="preset-name">${escapeHtml(preset.name)}</div>
                <div class="preset-date">${new Date(preset.createdAt).toLocaleString('zh-CN')}</div>
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * 关闭删除气泡装饰预设弹窗
 */
function closeDeleteBubbleDecorationPresets() {
    const modal = document.getElementById('deleteBubbleDecorationPresetsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

/**
 * 全选/取消全选气泡装饰预设
 */
function toggleSelectAllBubbleDecorationPresets() {
    const checkboxes = document.querySelectorAll('#deleteBubbleDecorationPresetsList input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

/**
 * 确认删除气泡装饰预设
 */
async function confirmDeleteBubbleDecorationPresets() {
    const checkboxes = document.querySelectorAll('#deleteBubbleDecorationPresetsList input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showToast('请选择要删除的预设');
        return;
    }
    
    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 个预设吗？`, '删除预设');
    if (!confirmed) return;
    
    const presets = getBubbleDecorationPresets();
    const idsToDelete = Array.from(checkboxes).map(cb => cb.closest('.bubble-decoration-preset-item').dataset.presetId);
    const filtered = presets.filter(p => !idsToDelete.includes(p.id));
    
    saveBubbleDecorationPresets(filtered);
    loadBubbleDecorationPresetsList();
    closeDeleteBubbleDecorationPresets();
    
    showToast(`已删除 ${idsToDelete.length} 个预设`);
}

// ========== 页面加载时初始化 ==========

document.addEventListener('DOMContentLoaded', () => {
    // 初始化气泡装饰
    if (typeof initBubbleDecorationSettings === 'function') {
        try {
            initBubbleDecorationSettings();
        } catch (e) {
            console.error('初始化气泡装饰失败:', e);
        }
    }
});


// Hook openChatSettings 以初始化气泡装饰设置
const _origOpenChatSettingsForBubbleDecoration = typeof openChatSettings === 'function' ? openChatSettings : null;
if (_origOpenChatSettingsForBubbleDecoration) {
    const _origFnBubbleDecoration = openChatSettings;
    openChatSettings = function() {
        _origFnBubbleDecoration.apply(this, arguments);
        // 延迟初始化，确保DOM已渲染
        setTimeout(() => {
            if (typeof initBubbleDecorationSettings === 'function') {
                try {
                    initBubbleDecorationSettings();
                } catch (e) {
                    console.error('初始化气泡装饰设置失败:', e);
                }
            }
        }, 100);
    };
}


// Hook switchChatSettingsTab 以在切换到美化标签时初始化气泡装饰设置
const _origSwitchChatSettingsTabForBubbleDecoration = typeof switchChatSettingsTab === 'function' ? switchChatSettingsTab : null;
if (_origSwitchChatSettingsTabForBubbleDecoration) {
    const _origTabFnBubbleDecoration = switchChatSettingsTab;
    switchChatSettingsTab = function(tabName) {
        _origTabFnBubbleDecoration.apply(this, arguments);
        if (tabName === 'beautify') {
            setTimeout(() => {
                if (typeof initBubbleDecorationSettings === 'function') {
                    try {
                        initBubbleDecorationSettings();
                    } catch (e) {
                        console.error('初始化气泡装饰设置失败:', e);
                    }
                }
            }, 100);
        }
    };
}


// ========== 自定义气泡CSS功能 ==========

/**
 * 获取默认气泡CSS代码
 */
function getDefaultBubbleCss() {
    return `/* 用户气泡样式 */
.chat-message-user .chat-message-bubble {
    background-color: #007bff;
    color: white;
    border-radius: 18px;
    padding: 10px 14px;
}

/* AI气泡样式 */
.chat-message-char .chat-message-bubble {
    background-color: #f0f0f0;
    color: #333;
    border-radius: 18px;
    padding: 10px 14px;
}`;
}

/**
 * 获取自定义气泡CSS配置
 */
function getCustomBubbleCssConfig() {
    const config = localStorage.getItem('customBubbleCssConfig');
    return config ? JSON.parse(config) : {
        css: getDefaultBubbleCss()
    };
}

/**
 * 保存自定义气泡CSS配置
 */
function saveCustomBubbleCssConfig(config) {
    localStorage.setItem('customBubbleCssConfig', JSON.stringify(config));
}

/**
 * 获取自定义气泡CSS预设列表
 */
function getCustomBubbleCssPresets() {
    const presets = localStorage.getItem('customBubbleCssPresets');
    return presets ? JSON.parse(presets) : [];
}

/**
 * 保存自定义气泡CSS预设列表
 */
function saveCustomBubbleCssPresets(presets) {
    localStorage.setItem('customBubbleCssPresets', JSON.stringify(presets));
}

/**
 * 初始化自定义气泡CSS设置
 */
function initCustomBubbleCssSettings() {
    const config = getCustomBubbleCssConfig();
    
    // 加载CSS代码到编辑器
    document.getElementById('customBubbleCssInput').value = config.css;
    
    // 加载预设列表
    loadCustomBubbleCssPresetsList();
    
    // 初始化预览
    initBubbleCssPreview();
    
    // 应用CSS
    applyCustomBubbleCss();
}

/**
 * 应用自定义气泡CSS
 */
function applyCustomBubbleCss() {
    const css = document.getElementById('customBubbleCssInput').value.trim();
    
    // 保存到配置
    const config = getCustomBubbleCssConfig();
    config.css = css;
    saveCustomBubbleCssConfig(config);
    
    // 移除旧的样式
    const oldStyle = document.getElementById('customBubbleCssStyle');
    if (oldStyle) {
        oldStyle.remove();
    }
    
    if (!css) {
        showToast('CSS代码为空');
        return;
    }
    
    // 注入新样式
    const style = document.createElement('style');
    style.id = 'customBubbleCssStyle';
    style.textContent = css;
    document.head.appendChild(style);
    
    showToast('CSS已应用');
}

/**
 * 复制自定义气泡CSS
 */
function copyCustomBubbleCss() {
    const css = document.getElementById('customBubbleCssInput').value.trim();
    
    if (!css) {
        showToast('CSS代码为空');
        return;
    }
    
    // 复制到剪贴板
    navigator.clipboard.writeText(css).then(() => {
        showToast('CSS代码已复制');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败');
    });
}

/**
 * 重置自定义气泡CSS
 */
async function resetCustomBubbleCss() {
    const confirmed = await iosConfirm('确定要重置为默认CSS代码吗？', '重置确认');
    if (!confirmed) return;
    
    const defaultCss = getDefaultBubbleCss();
    document.getElementById('customBubbleCssInput').value = defaultCss;
    
    // 保存并应用
    const config = getCustomBubbleCssConfig();
    config.css = defaultCss;
    saveCustomBubbleCssConfig(config);
    
    applyCustomBubbleCss();
    updateBubbleCssPreview();
    showToast('已重置为默认CSS');
}

/**
 * 初始化气泡CSS预览
 */
function initBubbleCssPreview() {
    const previewContainer = document.getElementById('bubbleCssPreview');
    if (!previewContainer) return;
    
    // 创建预览HTML结构
    previewContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 15px;">
            <!-- AI消息气泡 -->
            <div class="preview-chat-message preview-chat-message-char" style="display: flex; align-items: flex-start; gap: 8px;">
                <div style="width: 32px; height: 32px; background: #e0e0e0; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">AI</div>
                <div class="preview-chat-message-bubble chat-message-bubble chat-message-char" style="max-width: 70%;">
                    这是AI的消息气泡样式预览
                </div>
            </div>
            
            <!-- 用户消息气泡 -->
            <div class="preview-chat-message preview-chat-message-user" style="display: flex; align-items: flex-start; gap: 8px; flex-direction: row-reverse;">
                <div style="width: 32px; height: 32px; background: #007bff; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 12px; color: white;">我</div>
                <div class="preview-chat-message-bubble chat-message-bubble chat-message-user" style="max-width: 70%;">
                    这是用户的消息气泡样式预览
                </div>
            </div>
        </div>
        <style id="bubbleCssPreviewStyle"></style>
    `;
    
    // 初始更新预览
    updateBubbleCssPreview();
}

/**
 * 更新气泡CSS预览
 */
function updateBubbleCssPreview() {
    const css = document.getElementById('customBubbleCssInput')?.value.trim() || '';
    const previewStyle = document.getElementById('bubbleCssPreviewStyle');
    
    if (!previewStyle) return;
    
    // 将CSS应用到预览区域
    // 需要将选择器限定在预览容器内
    const scopedCss = css
        .replace(/\.chat-message-user\s+\.chat-message-bubble/g, '.preview-chat-message-user .preview-chat-message-bubble')
        .replace(/\.chat-message-char\s+\.chat-message-bubble/g, '.preview-chat-message-char .preview-chat-message-bubble');
    
    previewStyle.textContent = scopedCss;
}

/**
 * 保存自定义气泡CSS预设
 */
function saveCustomBubbleCssPreset() {
    const name = document.getElementById('customBubbleCssPresetName').value.trim();
    if (!name) {
        showToast('请输入预设名称');
        return;
    }
    
    const css = document.getElementById('customBubbleCssInput').value.trim();
    if (!css) {
        showToast('CSS代码为空');
        return;
    }
    
    const presets = getCustomBubbleCssPresets();
    const preset = {
        id: Date.now().toString(),
        name: name,
        css: css,
        createdAt: new Date().toISOString()
    };
    
    presets.push(preset);
    saveCustomBubbleCssPresets(presets);
    
    loadCustomBubbleCssPresetsList();
    document.getElementById('customBubbleCssPresetName').value = '';
    showToast('预设已保存');
}

/**
 * 加载自定义气泡CSS预设列表
 */
function loadCustomBubbleCssPresetsList() {
    const presets = getCustomBubbleCssPresets();
    const select = document.getElementById('customBubbleCssPresetSelect');
    
    select.innerHTML = '<option value="">选择预设</option>';
    presets.forEach(preset => {
        const option = document.createElement('option');
        option.value = preset.id;
        option.textContent = preset.name;
        select.appendChild(option);
    });
}

/**
 * 加载自定义气泡CSS预设
 */
function loadCustomBubbleCssPreset() {
    const select = document.getElementById('customBubbleCssPresetSelect');
    const presetId = select.value;
    
    if (!presetId) return;
    
    const presets = getCustomBubbleCssPresets();
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
        showToast('预设不存在');
        return;
    }
    
    // 加载CSS到编辑器
    document.getElementById('customBubbleCssInput').value = preset.css;
    
    // 更新预览
    updateBubbleCssPreview();
    
    showToast('预设已加载');
}

/**
 * 打开删除自定义气泡CSS预设弹窗
 */
function openDeleteCustomBubbleCssPresets() {
    const presets = getCustomBubbleCssPresets();
    
    if (presets.length === 0) {
        showToast('暂无预设');
        return;
    }
    
    const modal = document.getElementById('deleteCustomBubbleCssPresetsModal');
    const list = document.getElementById('deleteCustomBubbleCssPresetsList');
    
    list.innerHTML = presets.map(preset => `
        <div class="custom-bubble-css-preset-item" data-preset-id="${preset.id}" style="display: flex; align-items: center; gap: 12px; padding: 12px; background: #f8f8f8; border-radius: 10px; margin-bottom: 10px; cursor: pointer;">
            <input type="checkbox" onclick="event.stopPropagation()" style="width: 18px; height: 18px; cursor: pointer;">
            <div style="flex: 1;">
                <div style="font-size: 14px; color: #333; margin-bottom: 4px; font-weight: 500;">${escapeHtml(preset.name)}</div>
                <div style="font-size: 11px; color: #999;">${new Date(preset.createdAt).toLocaleString('zh-CN')}</div>
            </div>
        </div>
    `).join('');
    
    modal.style.display = 'block';
    setTimeout(() => modal.classList.add('active'), 10);
}

/**
 * 关闭删除自定义气泡CSS预设弹窗
 */
function closeDeleteCustomBubbleCssPresets() {
    const modal = document.getElementById('deleteCustomBubbleCssPresetsModal');
    modal.classList.remove('active');
    setTimeout(() => modal.style.display = 'none', 300);
}

/**
 * 全选/取消全选自定义气泡CSS预设
 */
function toggleSelectAllCustomBubbleCssPresets() {
    const checkboxes = document.querySelectorAll('#deleteCustomBubbleCssPresetsList input[type="checkbox"]');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

/**
 * 确认删除自定义气泡CSS预设
 */
async function confirmDeleteCustomBubbleCssPresets() {
    const checkboxes = document.querySelectorAll('#deleteCustomBubbleCssPresetsList input[type="checkbox"]:checked');
    
    if (checkboxes.length === 0) {
        showToast('请选择要删除的预设');
        return;
    }
    
    const confirmed = await iosConfirm(`确定要删除选中的 ${checkboxes.length} 个预设吗？`, '删除预设');
    if (!confirmed) return;
    
    const presets = getCustomBubbleCssPresets();
    const idsToDelete = Array.from(checkboxes).map(cb => cb.closest('.custom-bubble-css-preset-item').dataset.presetId);
    const filtered = presets.filter(p => !idsToDelete.includes(p.id));
    
    saveCustomBubbleCssPresets(filtered);
    loadCustomBubbleCssPresetsList();
    closeDeleteCustomBubbleCssPresets();
    
    showToast(`已删除 ${idsToDelete.length} 个预设`);
}

// ========== 导入/导出功能 ==========

/**
 * 智能提取CSS代码
 */
function extractCssCode(content) {
    // 如果内容看起来已经是纯CSS，直接返回
    if (content.includes('{') && content.includes('}') && 
        (content.includes('.chat-message') || content.includes('background') || content.includes('color'))) {
        return content.trim();
    }
    
    // 尝试提取CSS代码块
    const cssBlockMatch = content.match(/```css\s*([\s\S]*?)\s*```/);
    if (cssBlockMatch) {
        return cssBlockMatch[1].trim();
    }
    
    // 尝试提取任何代码块
    const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
        return codeBlockMatch[1].trim();
    }
    
    // 如果没有找到代码块，返回整个内容
    return content.trim();
}

/**
 * 导入气泡CSS
 */
function importBubbleCss() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.docx,.zip,.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const fileName = file.name.toLowerCase();
            let cssCode = '';
            
            if (fileName.endsWith('.txt')) {
                // 处理TXT文件
                cssCode = await file.text();
                cssCode = extractCssCode(cssCode);
            } else if (fileName.endsWith('.json')) {
                // 处理JSON文件
                const jsonText = await file.text();
                const jsonData = JSON.parse(jsonText);
                cssCode = jsonData.css || jsonData.code || jsonData.content || '';
                cssCode = extractCssCode(cssCode);
            } else if (fileName.endsWith('.docx')) {
                // 处理DOCX文件
                if (typeof mammoth === 'undefined') {
                    showToast('DOCX解析库未加载');
                    return;
                }
                
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                cssCode = extractCssCode(result.value);
            } else if (fileName.endsWith('.zip')) {
                // 处理ZIP文件
                if (typeof JSZip === 'undefined') {
                    showToast('ZIP解析库未加载');
                    return;
                }
                
                const arrayBuffer = await file.arrayBuffer();
                const zip = await JSZip.loadAsync(arrayBuffer);
                
                // 查找第一个TXT或DOCX文件
                let foundFile = null;
                for (const [filename, zipEntry] of Object.entries(zip.files)) {
                    if (!zipEntry.dir && (filename.toLowerCase().endsWith('.txt') || filename.toLowerCase().endsWith('.docx'))) {
                        foundFile = { filename, zipEntry };
                        break;
                    }
                }
                
                if (!foundFile) {
                    showToast('ZIP中未找到TXT或DOCX文件');
                    return;
                }
                
                if (foundFile.filename.toLowerCase().endsWith('.txt')) {
                    const text = await foundFile.zipEntry.async('text');
                    cssCode = extractCssCode(text);
                } else if (foundFile.filename.toLowerCase().endsWith('.docx')) {
                    if (typeof mammoth === 'undefined') {
                        showToast('DOCX解析库未加载');
                        return;
                    }
                    
                    const arrayBuffer = await foundFile.zipEntry.async('arraybuffer');
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    cssCode = extractCssCode(result.value);
                }
            } else {
                showToast('不支持的文件格式');
                return;
            }
            
            if (!cssCode) {
                showToast('未能提取到CSS代码');
                return;
            }
            
            // 填充到输入框
            document.getElementById('customBubbleCssInput').value = cssCode;
            
            // 更新预览
            updateBubbleCssPreview();
            
            showToast('导入成功');
        } catch (error) {
            console.error('导入失败:', error);
            showToast('导入失败: ' + error.message);
        }
    };
    
    input.click();
}

/**
 * 打开导出气泡CSS弹窗
 */
function openExportBubbleCssModal() {
    const css = document.getElementById('customBubbleCssInput').value.trim();
    
    if (!css) {
        showToast('CSS代码为空');
        return;
    }
    
    // 生成默认文件名
    const now = new Date();
    const dateStr = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0') + 
                    String(now.getSeconds()).padStart(2, '0');
    const defaultFilename = `气泡样式_${dateStr}`;
    
    // 创建弹窗HTML
    const modalHtml = `
        <div class="settings-page" id="exportBubbleCssModal" style="z-index: 10009; display: flex;">
            <div class="settings-content" style="max-width: 400px;">
                <div class="settings-header">
                    <div class="back-btn" onclick="closeExportBubbleCssModal()">←</div>
                    <div class="settings-title">导出气泡CSS</div>
                    <div style="width: 44px;"></div>
                </div>

                <div class="settings-card">
                    <!-- 文件名输入 -->
                    <div style="margin-bottom: 20px;">
                        <label class="form-label">文件名（可选）</label>
                        <input type="text" id="exportBubbleCssFilename" class="form-input" placeholder="${defaultFilename}" value="${defaultFilename}" maxlength="50">
                        <div style="margin-top: 8px; font-size: 12px; color: #666;">
                            留空则使用默认文件名
                        </div>
                    </div>

                    <!-- 格式选择 -->
                    <div style="margin-bottom: 20px;">
                        <label class="form-label">导出格式</label>
                        <select id="exportBubbleCssFormat" class="form-select">
                            <option value="txt">TXT文本文件</option>
                            <option value="docx">DOCX文档</option>
                            <option value="json">JSON格式</option>
                        </select>
                    </div>

                    <!-- 导出按钮 -->
                    <button class="btn-primary" onclick="confirmExportBubbleCss()" style="width: 100%; background: #17a2b8; color: white; border: none;">
                        确认导出
                    </button>
                </div>
            </div>
        </div>
    `;
    
    // 移除旧弹窗（如果存在）
    const oldModal = document.getElementById('exportBubbleCssModal');
    if (oldModal) {
        oldModal.remove();
    }
    
    // 添加新弹窗
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

/**
 * 关闭导出气泡CSS弹窗
 */
function closeExportBubbleCssModal() {
    const modal = document.getElementById('exportBubbleCssModal');
    if (modal) {
        modal.remove();
    }
}

/**
 * 确认导出气泡CSS
 */
async function confirmExportBubbleCss() {
    const css = document.getElementById('customBubbleCssInput').value.trim();
    const filenameInput = document.getElementById('exportBubbleCssFilename').value.trim();
    const format = document.getElementById('exportBubbleCssFormat').value;
    
    // 生成文件名
    const now = new Date();
    const dateStr = now.getFullYear() + 
                    String(now.getMonth() + 1).padStart(2, '0') + 
                    String(now.getDate()).padStart(2, '0') + '_' +
                    String(now.getHours()).padStart(2, '0') + 
                    String(now.getMinutes()).padStart(2, '0') + 
                    String(now.getSeconds()).padStart(2, '0');
    const filename = filenameInput || `气泡样式_${dateStr}`;
    
    try {
        if (format === 'txt') {
            await exportBubbleCssAsTxt(filename, css);
        } else if (format === 'docx') {
            await exportBubbleCssAsDocx(filename, css);
        } else if (format === 'json') {
            await exportBubbleCssAsJson(filename, css);
        }
        
        closeExportBubbleCssModal();
        showToast('导出成功');
    } catch (error) {
        console.error('导出失败:', error);
        showToast('导出失败: ' + error.message);
    }
}

/**
 * 导出为TXT文件
 */
function exportBubbleCssAsTxt(filename, css) {
    // 添加UTF-8 BOM
    const bom = '\uFEFF';
    const content = bom + css;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.txt';
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * 导出为DOCX文件
 */
async function exportBubbleCssAsDocx(filename, css) {
    if (typeof docx === 'undefined') {
        // 如果docx.js未加载，降级为TXT
        console.warn('docx.js未加载，降级为TXT格式');
        exportBubbleCssAsTxt(filename, css);
        return;
    }
    
    try {
        const { Document, Paragraph, TextRun, Packer } = docx;
        
        // 创建文档
        const doc = new Document({
            sections: [{
                properties: {},
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: css,
                                font: 'Consolas'
                            })
                        ]
                    })
                ]
            }]
        });
        
        // 生成并下载
        const blob = await Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename + '.docx';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('DOCX生成失败，降级为TXT:', error);
        exportBubbleCssAsTxt(filename, css);
    }
}

/**
 * 导出为JSON文件
 */
function exportBubbleCssAsJson(filename, css) {
    const jsonData = {
        css: css,
        exportedAt: new Date().toISOString(),
        version: '1.0'
    };
    
    const jsonStr = JSON.stringify(jsonData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

// ========== 页面加载时初始化自定义气泡CSS ==========

document.addEventListener('DOMContentLoaded', () => {
    // 初始化自定义气泡CSS
    if (typeof initCustomBubbleCssSettings === 'function') {
        try {
            initCustomBubbleCssSettings();
        } catch (e) {
            console.error('初始化自定义气泡CSS失败:', e);
        }
    }
});

// Hook openChatSettings 以初始化自定义气泡CSS设置
const _origOpenChatSettingsForCustomBubbleCss = typeof openChatSettings === 'function' ? openChatSettings : null;
if (_origOpenChatSettingsForCustomBubbleCss) {
    const _origFnCustomBubbleCss = openChatSettings;
    openChatSettings = function() {
        _origFnCustomBubbleCss.apply(this, arguments);
        setTimeout(() => {
            if (typeof initCustomBubbleCssSettings === 'function') {
                try {
                    initCustomBubbleCssSettings();
                } catch (e) {
                    console.error('初始化自定义气泡CSS设置失败:', e);
                }
            }
        }, 100);
    };
}

// Hook switchChatSettingsTab 以在切换到美化标签时初始化自定义气泡CSS设置
const _origSwitchChatSettingsTabForCustomBubbleCss = typeof switchChatSettingsTab === 'function' ? switchChatSettingsTab : null;
if (_origSwitchChatSettingsTabForCustomBubbleCss) {
    const _origTabFnCustomBubbleCss = switchChatSettingsTab;
    switchChatSettingsTab = function(tabName) {
        _origTabFnCustomBubbleCss.apply(this, arguments);
        if (tabName === 'beautify') {
            setTimeout(() => {
                if (typeof initCustomBubbleCssSettings === 'function') {
                    try {
                        initCustomBubbleCssSettings();
                    } catch (e) {
                        console.error('初始化自定义气泡CSS设置失败:', e);
                    }
                }
            }, 100);
        }
    };
}

// ========== 顶栏分割线隐藏功能 ==========

/**
 * 获取顶栏分割线显示设置
 */
function getHeaderDividerSettings() {
    const settings = localStorage.getItem('headerDividerSettings');
    return settings ? JSON.parse(settings) : {
        hideHeaderDivider: true // 默认隐藏分割线
    };
}

/**
 * 保存顶栏分割线显示设置
 */
function saveHeaderDividerSettings(settings) {
    localStorage.setItem('headerDividerSettings', JSON.stringify(settings));
}

/**
 * 应用顶栏分割线显示设置
 */
function applyHeaderDividerSettings() {
    const settings = getHeaderDividerSettings();
    const chatDetailHeader = document.querySelector('.chat-detail-header');
    
    if (chatDetailHeader) {
        if (settings.hideHeaderDivider) {
            chatDetailHeader.classList.add('hide-header-divider');
        } else {
            chatDetailHeader.classList.remove('hide-header-divider');
        }
    }
}

/**
 * 初始化顶栏分割线设置
 */
function initHeaderDividerSettings() {
    const toggle = document.getElementById('hideHeaderDividerToggle');
    if (!toggle) return;
    
    const settings = getHeaderDividerSettings();
    toggle.checked = settings.hideHeaderDivider;
}

/**
 * 切换顶栏分割线显示
 */
function toggleHeaderDivider() {
    const toggle = document.getElementById('hideHeaderDividerToggle');
    if (!toggle) return;
    
    const settings = getHeaderDividerSettings();
    settings.hideHeaderDivider = toggle.checked;
    saveHeaderDividerSettings(settings);
    
    // 立即应用设置
    applyHeaderDividerSettings();
    
    if (settings.hideHeaderDivider) {
        showToast('顶栏分割线已隐藏');
    } else {
        showToast('顶栏分割线已显示');
    }
}

// 页面加载时应用设置
document.addEventListener('DOMContentLoaded', () => {
    applyHeaderDividerSettings();
});

// Hook openChatDetail 以在打开聊天详情时应用设置
const _origOpenChatDetailForHeaderDivider = typeof openChatDetail === 'function' ? openChatDetail : null;
if (_origOpenChatDetailForHeaderDivider) {
    const _origFnHeaderDivider = openChatDetail;
    openChatDetail = function() {
        const result = _origFnHeaderDivider.apply(this, arguments);
        setTimeout(() => {
            applyHeaderDividerSettings();
        }, 100);
        return result;
    };
}


// Hook openAppearanceSettings 以初始化顶栏分割线设置
const _origOpenAppearanceSettingsForHeaderDivider = typeof openAppearanceSettings === 'function' ? openAppearanceSettings : null;
if (_origOpenAppearanceSettingsForHeaderDivider) {
    const _origFnHeaderDivider = openAppearanceSettings;
    openAppearanceSettings = function() {
        _origFnHeaderDivider.apply(this, arguments);
        setTimeout(() => {
            if (typeof initHeaderDividerSettings === 'function') {
                try {
                    initHeaderDividerSettings();
                } catch (e) {
                    console.error('初始化顶栏分割线设置失败:', e);
                }
            }
        }, 100);
    };
}

// Hook switchAppearanceTab 以在切换到界面标签时初始化顶栏分割线设置
const _origSwitchAppearanceTabForHeaderDivider = typeof switchAppearanceTab === 'function' ? switchAppearanceTab : null;
if (_origSwitchAppearanceTabForHeaderDivider) {
    const _origTabFnHeaderDivider = switchAppearanceTab;
    switchAppearanceTab = function(tabName) {
        _origTabFnHeaderDivider.apply(this, arguments);
        if (tabName === 'interface') {
            setTimeout(() => {
                if (typeof initHeaderDividerSettings === 'function') {
                    try {
                        initHeaderDividerSettings();
                    } catch (e) {
                        console.error('初始化顶栏分割线设置失败:', e);
                    }
                }
            }, 100);
        }
    };
}


// ========== 视频通话状态感知功能 ==========

/**
 * 构建最近视频通话状态提示词
 * @param {string} characterId - 角色ID
 * @returns {Promise<string>} 提示词内容
 */
async function buildRecentVideoCallStatusPrompt(characterId) {
    try {
        // 1. 从聊天记录中获取最近的消息
        const allChats = await getAllChatsFromDB();
        const characterChats = allChats
            .filter(c => c.characterId === characterId)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
        // 2. 找出所有视频通话消息
        const videoCallMessages = characterChats.filter(m => m.messageType === 'video-call');
        
        if (videoCallMessages.length === 0) {
            return ''; // 没有视频通话记录
        }
        
        // 3. 获取最近的视频通话消息（最多5条）
        const recentCalls = videoCallMessages.slice(0, 5);
        
        // 4. 从视频通话记忆库获取详细信息
        const videoCallRecords = await getVideoCallRecords(characterId);
        
        // 5. 构建提示词
        let prompt = '\n【最近的视频通话】\n';
        
        recentCalls.forEach((callMsg, index) => {
            const callTime = new Date(callMsg.timestamp);
            const now = new Date();
            const diffMs = now - callTime;
            const diffMinutes = Math.floor(diffMs / 60000);
            
            // 计算时间描述
            let timeDesc = '';
            if (diffMinutes < 1) {
                timeDesc = '刚刚';
            } else if (diffMinutes < 5) {
                timeDesc = `${diffMinutes}分钟前`;
            } else if (diffMinutes < 30) {
                timeDesc = `${diffMinutes}分钟前`;
            } else if (diffMinutes < 60) {
                timeDesc = '半小时前';
            } else if (diffMinutes < 120) {
                timeDesc = '1小时前';
            } else if (diffMinutes < 1440) {
                const hours = Math.floor(diffMinutes / 60);
                timeDesc = `${hours}小时前`;
            } else {
                const days = Math.floor(diffMinutes / 1440);
                timeDesc = `${days}天前`;
            }
            
            // 解析通话状态
            const content = callMsg.content || '';
            let statusInfo = '';
            
            if (content.includes('已取消')) {
                statusInfo = `${timeDesc}，用户向你发起了视频通话，但在你接听前就取消了。`;
            } else if (content.includes('已拒绝')) {
                // 从记忆库中查找拒绝原因
                const matchedRecord = videoCallRecords.find(r => {
                    const recordTime = new Date(r.startTime);
                    return Math.abs(recordTime - callTime) < 5000 && r.status === 'rejected';
                });
                
                if (matchedRecord && matchedRecord.rejectReason) {
                    statusInfo = `${timeDesc}，用户向你发起了视频通话，你拒绝了接听。\n你当时的拒绝原因：${matchedRecord.rejectReason}`;
                } else {
                    statusInfo = `${timeDesc}，用户向你发起了视频通话，你拒绝了接听。`;
                }
            } else {
                // 通话完成，提取时长
                const durationMatch = content.match(/(\d+)分(\d+)秒|(\d+)秒/);
                let duration = '';
                if (durationMatch) {
                    if (durationMatch[1]) {
                        duration = `${durationMatch[1]}分${durationMatch[2]}秒`;
                    } else if (durationMatch[3]) {
                        duration = `${durationMatch[3]}秒`;
                    }
                }
                
                // 从记忆库中查找通话内容
                const matchedRecord = videoCallRecords.find(r => {
                    const recordTime = new Date(r.startTime);
                    return Math.abs(recordTime - callTime) < 5000 && r.status === 'completed';
                });
                
                if (matchedRecord && matchedRecord.messages && matchedRecord.messages.length > 0) {
                    statusInfo = `${timeDesc}，你和用户视频通话了 ${duration}。\n\n通话内容：`;
                    
                    // 添加对话记录（只显示语音部分，旁白不显示）
                    const speeches = matchedRecord.messages.filter(m => m.type === 'speech');
                    speeches.forEach(msg => {
                        const msgTime = new Date(msg.timestamp);
                        const timeStr = `${String(msgTime.getHours()).padStart(2, '0')}:${String(msgTime.getMinutes()).padStart(2, '0')}:${String(msgTime.getSeconds()).padStart(2, '0')}`;
                        const speaker = msg.role === 'user' ? '用户' : '你';
                        statusInfo += `\n[${timeStr}] ${speaker}："${msg.content}"`;
                    });
                    
                    if (speeches.length > 10) {
                        statusInfo += `\n（共${speeches.length}条对话）`;
                    }
                } else {
                    statusInfo = `${timeDesc}，你和用户视频通话了 ${duration}。`;
                }
            }
            
            // 添加序号标记（如果有多次通话）
            if (recentCalls.length > 1) {
                if (index === 0) {
                    prompt += `\n最近一次：\n${statusInfo}\n`;
                } else if (index === 1) {
                    prompt += `\n第二次：\n${statusInfo}\n`;
                } else {
                    prompt += `\n第三次：\n${statusInfo}\n`;
                }
            } else {
                prompt += `\n${statusInfo}`;
            }
        });
        
        return prompt;
        
    } catch (error) {
        console.error('构建视频通话状态提示词失败:', error);
        return '';
    }
}

// 导出函数供script.js使用
window.buildRecentVideoCallStatusPrompt = buildRecentVideoCallStatusPrompt;

// ========== 角色主动来电功能 ==========

// 当前来电状态
let currentIncomingCall = null;

// 显示来电界面
function showIncomingCallUI(character, reason) {
    // 如果已经有通话在进行，忽略
    if (currentVideoCall) {
        console.log('已有通话进行中，忽略来电');
        return;
    }
    
    // 初始化来电状态
    currentIncomingCall = {
        character: character,
        reason: reason,
        startTime: Date.now()
    };
    
    // 初始化通话对象
    currentVideoCall = {
        id: 'videocall_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        characterId: character.id,
        startTime: Date.now(),
        endTime: null,
        duration: 0,
        status: 'incoming',
        direction: 'incoming',
        messages: [],
        reason: reason,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        day: new Date().getDate()
    };
    
    // 获取头像
    const videoCallAvatars = getVideoCallAvatars(character.id);
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && character.avatar) {
        charAvatar = character.avatar;
    }
    
    const avatarHtml = charAvatar
        ? `<img src="${charAvatar}" alt="角色头像">`
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    const overlay = document.createElement('div');
    overlay.className = 'video-call-overlay';
    overlay.id = 'videoCallOverlay';
    
    overlay.innerHTML = `
        <div class="video-call-container incoming">
            <button class="video-call-minimize-btn" onclick="minimizeIncomingCall()" title="最小化">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
            </button>
            <div class="video-call-avatar-large">
                ${avatarHtml}
            </div>
            <div class="video-call-status incoming-status">来电中...</div>
            <div class="video-call-name">${escapeHtml(character.remark || character.name)}</div>
            <div class="video-call-incoming-actions">
                <button class="video-call-btn reject-call" onclick="rejectIncomingCall()">
                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="30" r="28" />
                        <path d="M20 28 Q20 22 26 22 L34 22 Q40 22 40 28 L40 32 Q40 35 37 35 L35 35 Q33 35 33 33 L33 30 Q33 28 31 28 L29 28 Q27 28 27 30 L27 33 Q27 35 25 35 L23 35 Q20 35 20 32 Z" fill="white" transform="rotate(135 30 30)"/>
                    </svg>
                    <span class="incoming-btn-label">拒绝</span>
                </button>
                <button class="video-call-btn accept-call" onclick="acceptIncomingCall()">
                    <svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="30" cy="30" r="28" />
                        <path d="M20 28 Q20 22 26 22 L34 22 Q40 22 40 28 L40 32 Q40 35 37 35 L35 35 Q33 35 33 33 L33 30 Q33 28 31 28 L29 28 Q27 28 27 30 L27 33 Q27 35 25 35 L23 35 Q20 35 20 32 Z" fill="white"/>
                    </svg>
                    <span class="incoming-btn-label">接听</span>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);
}

// 接听来电
function acceptIncomingCall() {
    if (!currentVideoCall || !currentIncomingCall) return;
    
    currentVideoCall.status = 'connected';
    currentVideoCall.connectedTime = Date.now();
    
    currentIncomingCall = null;
    
    // 复用已有的接通界面
    showConnectedUI();
    startCallTimer();
}

// 拒绝来电
function rejectIncomingCall() {
    if (!currentVideoCall) return;
    
    currentVideoCall.status = 'rejected';
    currentVideoCall.endTime = Date.now();
    
    const reason = currentIncomingCall ? currentIncomingCall.reason : '';
    currentIncomingCall = null;
    
    // 关闭界面
    closeVideoCall();
    
    // 添加聊天记录
    setTimeout(() => {
        addIncomingCallMessageToChat('已拒绝');
    }, 400);
}

// 最小化来电
function minimizeIncomingCall() {
    const overlay = document.getElementById('videoCallOverlay');
    if (!overlay) return;
    
    isVideoCallMinimized = true;
    overlay.style.display = 'none';
    
    createIncomingCallFloatingBall();
}

// 创建来电悬浮球
function createIncomingCallFloatingBall() {
    const existing = document.getElementById('videoCallFloatingBall');
    if (existing) existing.remove();
    
    const character = currentIncomingCall ? currentIncomingCall.character : (currentVideoCall ? currentChatCharacter : null);
    if (!character) return;
    
    const videoCallAvatars = getVideoCallAvatars(character.id);
    let charAvatar = videoCallAvatars.characterAvatar;
    if (!charAvatar && character.avatar) {
        charAvatar = character.avatar;
    }
    
    const avatarHtml = charAvatar
        ? `<img src="${charAvatar}" alt="来电中">`
        : `<div style="width:100%;height:100%;background:#ccc;border-radius:50%;"></div>`;
    
    const ball = document.createElement('div');
    ball.id = 'videoCallFloatingBall';
    ball.className = 'video-call-floating-ball incoming-floating-ball';
    
    ball.innerHTML = `
        <div class="floating-ball-avatar">
            ${avatarHtml}
        </div>
        <div class="floating-ball-status">来电中...</div>
    `;
    
    document.body.appendChild(ball);
    
    const phoneContainer = document.querySelector('.phone-container') || document.body;
    const phoneRect = phoneContainer.getBoundingClientRect();
    ball.style.left = (phoneRect.right - 90) + 'px';
    ball.style.top = '100px';
    ball.style.right = 'auto';
    
    ball.addEventListener('click', (e) => {
        if (!isDragging) {
            restoreVideoCall();
        }
    });
    
    makeDraggable(ball);
}

// 在聊天记录中添加来电消息
async function addIncomingCallMessageToChat(statusText) {
    if (!currentChatCharacter) return;
    
    const videoCallMessage = {
        id: Date.now().toString(),
        characterId: currentChatCharacter.id,
        content: `视频来电 ${statusText}`,
        type: 'char',
        timestamp: new Date().toISOString(),
        sender: 'char',
        messageType: 'incoming-video-call'
    };
    
    try {
        await saveMessageToDB(videoCallMessage);
        if (typeof updateChatListLastMessage === 'function') {
            await updateChatListLastMessage(currentChatCharacter.id, `视频来电 ${statusText}`, new Date().toISOString());
        }
    } catch (e) {
        console.error('保存来电记录失败:', e);
    }
    
    const chatMessages = document.getElementById('chatMessagesContainer');
    if (chatMessages) {
        const messageEl = document.createElement('div');
        messageEl.className = 'chat-message chat-message-char';
        messageEl.dataset.msgId = videoCallMessage.id;
        messageEl.dataset.msgType = 'char';
        
        let charAvatar = '';
        if (currentChatCharacter.avatar) {
            charAvatar = currentChatCharacter.avatar;
        }
        
        const time = new Date(videoCallMessage.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
        
        messageEl.innerHTML = `
            <div class="chat-message-avatar">
                ${charAvatar ? `<img src="${charAvatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
            </div>
            <div class="chat-message-content">
                <div class="chat-message-bubble video-call-simple">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 15.5c-1.25 0-2.45-.2-3.57-.57-.35-.11-.74-.03-1.02.24l-2.2 2.2c-2.83-1.44-5.15-3.75-6.59-6.59l2.2-2.21c.28-.26.36-.65.25-1C8.7 6.45 8.5 5.25 8.5 4c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1 0 9.39 7.61 17 17 17 .55 0 1-.45 1-1v-3.5c0-.55-.45-1-1-1z"/>
                    </svg>
                    <span>视频来电 ${statusText}</span>
                </div>
                <div class="chat-message-time">${time}</div>
            </div>
        `;
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// 挂断来电后的通话（复用hangupVideoCall的逻辑，但标记为incoming）
// 注意：接听后的挂断直接复用video-call.js里的hangupVideoCall

// 全局暴露
window.showIncomingCallUI = showIncomingCallUI;
window.acceptIncomingCall = acceptIncomingCall;
window.rejectIncomingCall = rejectIncomingCall;
window.minimizeIncomingCall = minimizeIncomingCall;
window.addIncomingCallMessageToChat = addIncomingCallMessageToChat;


// ============================================================
// 角色后台活动系统
// ============================================================

// 全局定时器管理
const _bgActivityTimers = {};

// ========== 数据存取 ==========

function getBgActivityConfig(characterId) {
    const key = `bgActivity_${characterId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
    }
    return {
        enabled: false,
        currentStatus: 'online',
        statusLabel: '',
        canReply: true,
        autoResumeAt: null,
        lastStatusChange: null,
        unreadCount: 0,
        proactiveEnabled: false,
        proactiveMinInterval: 30,
        proactiveMaxInterval: 120,
        proactiveProbability: 60,
        lastProactiveTime: null,
        dndEnabled: false,
        dndStartTime: '00:00',
        dndEndTime: '08:00'
    };
}

function saveBgActivityConfig(characterId, config) {
    localStorage.setItem(`bgActivity_${characterId}`, JSON.stringify(config));
}

// ========== 状态查询 ==========

function isCharacterOnline(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!isBgActivityEffective(characterId)) return true;
    return cfg.canReply;
}

function getCharacterStatusText(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled || cfg.currentStatus === 'online') return '';
    const labels = { sleeping: '睡觉中', busy: '忙碌中', away: '离开中' };
    let text = labels[cfg.currentStatus] || cfg.currentStatus;
    if (cfg.statusLabel) text = cfg.statusLabel;
    if (cfg.autoResumeAt) {
        const resumeTime = new Date(cfg.autoResumeAt);
        const now = new Date();
        if (resumeTime > now) {
            const h = String(resumeTime.getHours()).padStart(2, '0');
            const m = String(resumeTime.getMinutes()).padStart(2, '0');
            text += ` · 预计${h}:${m}上线`;
        }
    }
    return text;
}

function getCharacterStatusDot(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled) return '';
    if (cfg.currentStatus === 'online') return 'online';
    if (cfg.currentStatus === 'sleeping') return 'sleeping';
    if (cfg.currentStatus === 'busy') return 'busy';
    return 'away';
}

// ========== 状态变更 ==========

function changeCharacterStatus(characterId, status, duration, label) {
    const cfg = getBgActivityConfig(characterId);
    cfg.currentStatus = status;
    cfg.statusLabel = label || '';
    cfg.lastStatusChange = new Date().toISOString();

    if (status === 'online') {
        cfg.canReply = true;
        cfg.autoResumeAt = null;
    } else {
        cfg.canReply = false;
        if (duration) {
            const now = new Date();
            let ms = 0;
            const match = duration.match(/^(\d+)(m|h)$/);
            if (match) {
                ms = parseInt(match[1]) * (match[2] === 'h' ? 3600000 : 60000);
            } else {
                // 尝试解析为具体时间 HH:MM
                const timeMatch = duration.match(/^(\d{1,2}):(\d{2})$/);
                if (timeMatch) {
                    const target = new Date(now);
                    target.setHours(parseInt(timeMatch[1]), parseInt(timeMatch[2]), 0, 0);
                    if (target <= now) target.setDate(target.getDate() + 1);
                    ms = target - now;
                }
            }
            if (ms > 0) {
                cfg.autoResumeAt = new Date(now.getTime() + ms).toISOString();
                scheduleAutoResume(characterId, ms);
            }
        }
    }

    saveBgActivityConfig(characterId, cfg);
    updateBgActivityStatusUI(characterId);
    if (typeof renderChatList === 'function') renderChatList();
}

// ========== 自动恢复定时器 ==========

function scheduleAutoResume(characterId, delayMs) {
    clearBgTimer(characterId, 'resume');
    _bgActivityTimers[`resume_${characterId}`] = setTimeout(() => {
        handleCharacterResume(characterId);
    }, delayMs);
}

async function handleCharacterResume(characterId) {
    const cfg = getBgActivityConfig(characterId);
    const prevStatus = cfg.statusLabel || cfg.currentStatus;
    const pendingCount = cfg.unreadCount || 0;

    // 恢复在线
    cfg.currentStatus = 'online';
    cfg.canReply = true;
    cfg.autoResumeAt = null;
    cfg.statusLabel = '';
    const unread = cfg.unreadCount;
    cfg.unreadCount = 0;
    saveBgActivityConfig(characterId, cfg);
    updateBgActivityStatusUI(characterId);
    if (typeof renderChatList === 'function') renderChatList();

    // 如果有未回复消息，触发主动回复
    if (unread > 0 && cfg.enabled) {
        await triggerWakeupReply(characterId, prevStatus, unread);
    } else if (cfg.enabled && cfg.proactiveEnabled) {
        // 没有未读消息，但可以发个"我回来了"
        await triggerProactiveMessage(characterId);
    }

    // 重启主动消息定时器
    if (cfg.enabled && cfg.proactiveEnabled) {
        scheduleProactiveMessage(characterId);
    }
}

// ========== 唤醒回复 ==========

async function triggerWakeupReply(characterId, prevStatus, unreadCount) {
    // 检查勿扰
    if (isDndActive(characterId)) return;

    const character = (typeof chatCharacters !== 'undefined') ? chatCharacters.find(c => c.id === characterId) : null;
    if (!character) return;

    try {
        const settings = await storageDB.getItem('apiSettings');
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) return;

        const systemPrompt = await buildRolePlaySystemPrompt(character);
        const memoryLimit = character.shortTermMemory || 10;
        const chatHistory = await getChatHistory(characterId, memoryLimit);

        const messages = [{ role: 'system', content: systemPrompt }];

        chatHistory.forEach(msg => {
            let content = msg.content;
            let timePrefix = '';
            if (msg.timestamp) {
                const t = new Date(msg.timestamp);
                timePrefix = `[${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日 ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}] `;
            }
            if (msg.messageType === 'systemNotice' || msg.type === 'system') {
                content = `（系统记录：${msg.content}）`;
            }
            messages.push({
                role: msg.type === 'user' ? 'user' : 'assistant',
                content: timePrefix + content
            });
        });

        // 注入唤醒提示
        let wakeupPrompt = BG_ACTIVITY_WAKEUP_PROMPT
            .replace('{statusLabel}', prevStatus)
            .replace('{pendingInfo}', unreadCount > 0
                ? `对方在你不在的时候发了${unreadCount}条消息，请查看上面的聊天记录并自然地回应。`
                : '');
        messages.push({ role: 'user', content: wakeupPrompt });

        const aiMessages = await callBgActivityAPI(settings, messages, systemPrompt);
        if (aiMessages && aiMessages.length > 0) {
            await deliverBgMessages(characterId, character, aiMessages);
        }
    } catch (e) {
        console.error('唤醒回复失败:', e);
    }
}

// ========== 主动消息 ==========

function scheduleProactiveMessage(characterId) {
    clearBgTimer(characterId, 'proactive');
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled || !cfg.proactiveEnabled) return;
    if (cfg.currentStatus !== 'online') return;

    const minMs = (cfg.proactiveMinInterval || 30) * 60000;
    const maxMs = (cfg.proactiveMaxInterval || 120) * 60000;
    const delay = minMs + Math.random() * (maxMs - minMs);

    _bgActivityTimers[`proactive_${characterId}`] = setTimeout(async () => {
        await triggerProactiveMessage(characterId);
        // 循环
        scheduleProactiveMessage(characterId);
    }, delay);
}

async function triggerProactiveMessage(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled || !cfg.proactiveEnabled) return;
    if (cfg.currentStatus !== 'online') return;
    if (isDndActive(characterId)) return;

    // 拉黑检查
    if (typeof isAnyBlockActive === 'function' && isAnyBlockActive(characterId)) return;

    // 概率检查
    const prob = cfg.proactiveProbability || 60;
    if (Math.random() * 100 > prob) return;

    const character = (typeof chatCharacters !== 'undefined') ? chatCharacters.find(c => c.id === characterId) : null;
    if (!character) return;

    try {
        // 复用已有的callProactiveSpeakAPI
        if (typeof callProactiveSpeakAPI === 'function') {
            const msgs = await callProactiveSpeakAPI(character);
            if (msgs && msgs.length > 0) {
                await deliverBgMessages(characterId, character, msgs);
            }
        }
        cfg.lastProactiveTime = new Date().toISOString();
        saveBgActivityConfig(characterId, cfg);
    } catch (e) {
        console.error('主动消息发送失败:', e);
    }
}

// ========== 消息投递 ==========

async function deliverBgMessages(characterId, character, messages) {
    for (let i = 0; i < messages.length; i++) {
        const msg = messages[i];

        // 解析状态标签
        const statusMatch = msg.match(/^\[status:(\w+)(?::([^:\]]+))?(?::([^\]]+))?\]$/);
        if (statusMatch) {
            changeCharacterStatus(characterId, statusMatch[1], statusMatch[2], statusMatch[3]);
            continue;
        }

        // 跳过空消息
        let cleanMsg = msg.replace(/\[status:[^\]]*\]/g, '').trim();
        if (!cleanMsg) continue;

        const messageObj = {
            id: Date.now().toString() + Math.random(),
            characterId: characterId,
            content: cleanMsg,
            type: 'char',
            timestamp: new Date().toISOString(),
            sender: 'char'
        };

        // 检查特殊消息类型
        const stickerMatch = cleanMsg.match(/^\[sticker:(.+)\]$/);
        const voiceMatch = cleanMsg.match(/^\[voice:(.+)\]$/);
        if (stickerMatch) {
            // 尝试匹配表情包
            const availableStickers = typeof getAvailableStickersForCharacter === 'function' ? await getAvailableStickersForCharacter(characterId) : [];
            const userStickers = typeof loadStickersFromDB === 'function' ? await loadStickersFromDB() : [];
            const charStickers = typeof loadCharStickersFromDB === 'function' ? await loadCharStickersFromDB() : [];
            const allStickers = [...userStickers, ...charStickers];
            const found = allStickers.find(s => s.name === stickerMatch[1] && s.data);
            if (found) {
                messageObj.content = '[表情包]';
                messageObj.messageType = 'sticker';
                messageObj.stickerData = found.data;
                messageObj.stickerName = found.name;
            }
        } else if (voiceMatch) {
            const voiceText = voiceMatch[1];
            const duration = typeof estimateVoiceDuration === 'function' ? estimateVoiceDuration(voiceText) : 5;
            messageObj.content = `[语音消息: ${voiceText}]`;
            messageObj.messageType = 'voice';
            messageObj.voiceText = voiceText;
            messageObj.voiceDuration = duration;
        }

        // 渲染到界面（如果用户正在看这个角色的聊天）
        if (typeof currentChatCharacter !== 'undefined' && currentChatCharacter && currentChatCharacter.id === characterId) {
            if (typeof appendMessageToChat === 'function') appendMessageToChat(messageObj);
        }

        // 保存到数据库
        if (typeof saveMessageToDB === 'function') await saveMessageToDB(messageObj);

        // 发送通知（如果不在当前聊天页面）
        if (!currentChatCharacter || currentChatCharacter.id !== characterId) {
            if (typeof showMsgNotification === 'function') {
                showMsgNotification(characterId, character.remark || character.name, character.avatar, cleanMsg);
            }
        }

        if (i < messages.length - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }

    // 更新聊天列表
    character.lastMessageTime = new Date().toISOString();
    const lastMsg = messages[messages.length - 1] || '';
    character.lastMessage = lastMsg.substring(0, 50);
    if (typeof saveChatCharacters === 'function') await saveChatCharacters();
    if (typeof renderChatList === 'function') renderChatList();
    if (typeof currentChatCharacter !== 'undefined' && currentChatCharacter && currentChatCharacter.id === characterId) {
        if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
    }
}

// ========== API调用（简化版） ==========

async function callBgActivityAPI(settings, messages, systemPrompt) {
    let response;
    if (settings.provider === 'hakimi') {
        const contents = messages.filter(m => m.role !== 'system').map(m => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [{ text: m.content }]
        }));
        response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents,
                systemInstruction: { parts: [{ text: systemPrompt }] },
                generationConfig: { temperature: settings.temperature || 0.9, maxOutputTokens: settings.maxTokens || 2048 }
            })
        });
    } else if (settings.provider === 'claude') {
        const claudeMsgs = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role, content: m.content }));
        response = await fetch(`${settings.apiUrl}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-api-key': settings.apiKey, 'anthropic-version': '2023-06-01' },
            body: JSON.stringify({ model: settings.model, max_tokens: settings.maxTokens || 2048, temperature: settings.temperature || 0.9, system: systemPrompt, messages: claudeMsgs })
        });
    } else {
        const openaiMsgs = messages.map(m => ({ role: m.role, content: m.content }));
        response = await fetch(`${settings.apiUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${settings.apiKey}` },
            body: JSON.stringify({ model: settings.model, messages: openaiMsgs, temperature: settings.temperature || 0.9, max_tokens: settings.maxTokens || 2048 })
        });
    }

    if (!response.ok) throw new Error(`API请求失败: ${response.status}`);
    const data = await response.json();

    let aiResponse = '';
    if (settings.provider === 'hakimi') {
        aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } else if (settings.provider === 'claude') {
        aiResponse = data.content?.[0]?.text || '';
    } else {
        aiResponse = data.choices?.[0]?.message?.content || '';
    }
    if (!aiResponse) return [];

    try {
        let jsonStr = aiResponse.trim().replace(/^```json?\s*/i, '').replace(/```\s*$/, '');
        const arr = JSON.parse(jsonStr);
        if (Array.isArray(arr)) return arr.map(m => String(m));
    } catch(e) {
        if (typeof cleanAIResponse === 'function') return cleanAIResponse(aiResponse);
        return [aiResponse.trim()];
    }
    return [aiResponse.trim()];
}

// ========== 勿扰检查 ==========

function isDndActive(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.dndEnabled) return false;
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const current = h * 60 + m;
    const [sh, sm] = (cfg.dndStartTime || '00:00').split(':').map(Number);
    const [eh, em] = (cfg.dndEndTime || '08:00').split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start <= end) {
        return current >= start && current < end;
    } else {
        return current >= start || current < end;
    }
}

// ========== 定时器管理 ==========

function clearBgTimer(characterId, type) {
    const key = `${type}_${characterId}`;
    if (_bgActivityTimers[key]) {
        clearTimeout(_bgActivityTimers[key]);
        delete _bgActivityTimers[key];
    }
}

function clearAllBgTimers(characterId) {
    clearBgTimer(characterId, 'resume');
    clearBgTimer(characterId, 'proactive');
}

// ========== 消息拦截（供showEmojiPicker调用） ==========

function shouldBlockAIReply(characterId) {
    if (!isBgActivityEffective(characterId)) return false;
    const cfg = getBgActivityConfig(characterId);
    return !cfg.canReply;
}

function incrementUnreadCount(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled) return;
    cfg.unreadCount = (cfg.unreadCount || 0) + 1;
    saveBgActivityConfig(characterId, cfg);
}

// ========== 解析AI回复中的状态标签 ==========

function parseStatusTagsFromMessages(characterId, messages) {
    const cleaned = [];
    for (const msg of messages) {
        const statusMatch = msg.match(/^\[status:(\w+)(?::([^:\]]+))?(?::([^\]]+))?\]$/);
        if (statusMatch) {
            changeCharacterStatus(characterId, statusMatch[1], statusMatch[2], statusMatch[3]);
        } else {
            // 检查消息末尾是否有内嵌的状态标签
            const inlineMatch = msg.match(/\[status:(\w+)(?::([^:\]]+))?(?::([^\]]+))?\]$/);
            if (inlineMatch) {
                changeCharacterStatus(characterId, inlineMatch[1], inlineMatch[2], inlineMatch[3]);
                const cleanMsg = msg.replace(/\[status:[^\]]*\]$/, '').trim();
                if (cleanMsg) cleaned.push(cleanMsg);
            } else {
                cleaned.push(msg);
            }
        }
    }
    return cleaned;
}

// ========== UI更新 ==========

function updateBgActivityStatusUI(characterId) {
    // 更新聊天详情页顶部状态
    const statusEl = document.getElementById('chatDetailStatus');
    if (statusEl && typeof currentChatCharacter !== 'undefined' && currentChatCharacter && currentChatCharacter.id === characterId) {
        const text = getCharacterStatusText(characterId);
        if (text) {
            statusEl.textContent = text;
            statusEl.style.display = 'block';
        } else {
            statusEl.style.display = 'none';
        }
    }
}

// ========== 设置面板初始化 ==========

function initBgActivitySettings() {
    if (!currentChatCharacter) return;
    const cfg = getBgActivityConfig(currentChatCharacter.id);

    const toggle = document.getElementById('bgActivityToggle');
    if (toggle) toggle.checked = cfg.enabled;

    // 更新状态显示
    updateBgActivitySettingsStatus();
    // 更新觉醒时间显示
    updateBgWakeTimeUI();
}

function updateBgActivitySettingsStatus() {
    if (!currentChatCharacter) return;
    const cfg = getBgActivityConfig(currentChatCharacter.id);
    const statusDisplay = document.getElementById('bgActivityCurrentStatus');
    if (statusDisplay) {
        const labels = { online: '在线', sleeping: '睡觉中', busy: '忙碌中', away: '离开中' };
        let text = labels[cfg.currentStatus] || '在线';
        if (cfg.statusLabel) text = cfg.statusLabel;
        statusDisplay.textContent = text;
        statusDisplay.className = 'bg-status-badge bg-status-' + (cfg.currentStatus || 'online');
    }
}

function toggleBgActivity() {
    if (!currentChatCharacter) return;
    const toggle = document.getElementById('bgActivityToggle');
    const cfg = getBgActivityConfig(currentChatCharacter.id);
    cfg.enabled = toggle.checked;
    saveBgActivityConfig(currentChatCharacter.id, cfg);

    if (cfg.enabled) {
        initBgActivityForCharacter(currentChatCharacter.id);
    } else {
        clearAllBgTimers(currentChatCharacter.id);
    }
}

function toggleBgProactive() {
    if (!currentChatCharacter) return;
    const toggle = document.getElementById('bgProactiveToggle');
    const cfg = getBgActivityConfig(currentChatCharacter.id);
    cfg.proactiveEnabled = toggle.checked;
    saveBgActivityConfig(currentChatCharacter.id, cfg);

    if (cfg.proactiveEnabled && cfg.enabled && cfg.currentStatus === 'online') {
        scheduleProactiveMessage(currentChatCharacter.id);
    } else {
        clearBgTimer(currentChatCharacter.id, 'proactive');
    }
}

function saveBgActivitySettings() {
    if (!currentChatCharacter) return;
    const cfg = getBgActivityConfig(currentChatCharacter.id);

    saveBgActivityConfig(currentChatCharacter.id, cfg);
    showToast('后台活动设置已保存');
}

function forceWakeCharacter() {
    if (!currentChatCharacter) return;
    const cfg = getBgActivityConfig(currentChatCharacter.id);
    if (cfg.currentStatus === 'online') {
        showToast('角色当前已在线');
        return;
    }
    handleCharacterResume(currentChatCharacter.id);
    showToast('已唤醒角色');
}

// ========== 觉醒时间查看与修改 ==========

let _wakeTimeRefreshInterval = null;

function updateBgWakeTimeUI() {
    if (!currentChatCharacter) return;
    const cfg = getBgActivityConfig(currentChatCharacter.id);
    const section = document.getElementById('bgWakeTimeSection');
    if (!section) return;

    // 只有不在线且有恢复时间时才显示
    if (cfg.currentStatus !== 'online' && cfg.autoResumeAt) {
        section.style.display = 'block';
        const resumeTime = new Date(cfg.autoResumeAt);
        const now = new Date();
        const remaining = Math.max(0, resumeTime - now);

        // 倒计时文字
        const countdownEl = document.getElementById('bgWakeTimeCountdown');
        if (countdownEl) {
            if (remaining <= 0) {
                countdownEl.textContent = '即将恢复';
                countdownEl.style.color = '#34c759';
            } else {
                const h = Math.floor(remaining / 3600000);
                const m = Math.floor((remaining % 3600000) / 60000);
                const s = Math.floor((remaining % 60000) / 1000);
                let text = '';
                if (h > 0) text += h + '小时';
                if (m > 0) text += m + '分';
                text += s + '秒后恢复';
                countdownEl.textContent = text;
                countdownEl.style.color = '#007bff';
            }
        }

        // 设置输入框的值
        const input = document.getElementById('bgWakeTimeInput');
        if (input && document.activeElement !== input) {
            // 转为本地时间格式 YYYY-MM-DDTHH:MM
            const y = resumeTime.getFullYear();
            const mo = String(resumeTime.getMonth() + 1).padStart(2, '0');
            const d = String(resumeTime.getDate()).padStart(2, '0');
            const hh = String(resumeTime.getHours()).padStart(2, '0');
            const mm = String(resumeTime.getMinutes()).padStart(2, '0');
            input.value = `${y}-${mo}-${d}T${hh}:${mm}`;
        }

        // 启动刷新
        if (!_wakeTimeRefreshInterval) {
            _wakeTimeRefreshInterval = setInterval(updateBgWakeTimeUI, 1000);
        }
    } else {
        section.style.display = 'none';
        if (_wakeTimeRefreshInterval) {
            clearInterval(_wakeTimeRefreshInterval);
            _wakeTimeRefreshInterval = null;
        }
    }
}

function updateWakeTime() {
    if (!currentChatCharacter) return;
    const input = document.getElementById('bgWakeTimeInput');
    if (!input || !input.value) {
        showToast('请选择时间');
        return;
    }

    const newTime = new Date(input.value);
    const now = new Date();
    if (newTime <= now) {
        // 时间已过，直接唤醒
        handleCharacterResume(currentChatCharacter.id);
        showToast('时间已过，已立即唤醒角色');
        updateBgWakeTimeUI();
        return;
    }

    const cfg = getBgActivityConfig(currentChatCharacter.id);
    cfg.autoResumeAt = newTime.toISOString();
    saveBgActivityConfig(currentChatCharacter.id, cfg);

    // 重新设置定时器
    const delayMs = newTime - now;
    scheduleAutoResume(currentChatCharacter.id, delayMs);

    showToast('觉醒时间已更新');
    updateBgWakeTimeUI();
}

// ========== 页面加载时初始化 ==========

function initBgActivityForCharacter(characterId) {
    const cfg = getBgActivityConfig(characterId);
    if (!cfg.enabled) return;

    // 检查是否有待恢复的状态
    if (cfg.autoResumeAt) {
        const resumeTime = new Date(cfg.autoResumeAt);
        const now = new Date();
        if (resumeTime <= now) {
            // 已经过了恢复时间，立即恢复
            handleCharacterResume(characterId);
        } else {
            // 还没到恢复时间，设置定时器
            scheduleAutoResume(characterId, resumeTime - now);
        }
    }

    // 启动主动消息定时器
    if (cfg.proactiveEnabled && cfg.currentStatus === 'online') {
        // 检查距离上次主动消息的时间
        if (cfg.lastProactiveTime) {
            const lastTime = new Date(cfg.lastProactiveTime);
            const elapsed = Date.now() - lastTime.getTime();
            const maxMs = (cfg.proactiveMaxInterval || 120) * 60000;
            if (elapsed >= maxMs) {
                // 超过最大间隔，立即触发一次
                triggerProactiveMessage(characterId).then(() => {
                    scheduleProactiveMessage(characterId);
                });
                return;
            }
        }
        scheduleProactiveMessage(characterId);
    }
}

function initAllBgActivities() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;
    chatCharacters.forEach(char => {
        initBgActivityForCharacter(char.id);
    });
}

// ================================================================
// ========== 全局后台系统设置 ==========
// ================================================================

function getGlobalBgSettings() {
    const raw = localStorage.getItem('globalBgSettings');
    if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
    }
    return {
        bgActivityEnabled: false,
        indProactiveEnabled: false,
        minInterval: 5,
        maxInterval: 10,
        dndEnabled: false,
        dndStartTime: '00:00',
        dndEndTime: '08:00'
    };
}

function saveGlobalBgSettingsData(config) {
    localStorage.setItem('globalBgSettings', JSON.stringify(config));
}

// 判断某角色的后台活动是否生效（角色级 > 全局级）
function isBgActivityEffective(characterId) {
    const charCfg = getBgActivityConfig(characterId);
    // 角色自己明确开启了
    if (charCfg.enabled) return true;
    // 角色没开，看全局
    const globalCfg = getGlobalBgSettings();
    return globalCfg.bgActivityEnabled;
}

// 判断某角色的定时消息是否生效（角色级 > 全局级）
function isIndProactiveEffective(characterId) {
    const charCfg = getIndProactiveConfig(characterId);
    // 角色自己明确开启了
    if (charCfg.enabled) return true;
    // 角色没开，看全局
    const globalCfg = getGlobalBgSettings();
    return globalCfg.indProactiveEnabled;
}

// 获取某角色生效的定时消息配置（角色级优先，否则用全局）
function getEffectiveIndProactiveConfig(characterId) {
    const charCfg = getIndProactiveConfig(characterId);
    if (charCfg.enabled) return charCfg;
    const globalCfg = getGlobalBgSettings();
    if (globalCfg.indProactiveEnabled) {
        // 用全局配置，但保留角色级的运行时数据
        return {
            enabled: true,
            minInterval: globalCfg.minInterval,
            maxInterval: globalCfg.maxInterval,
            dndEnabled: globalCfg.dndEnabled,
            dndStartTime: globalCfg.dndStartTime,
            dndEndTime: globalCfg.dndEndTime,
            nextFireTime: charCfg.nextFireTime,
            lastFireTime: charCfg.lastFireTime,
            _fromGlobal: true
        };
    }
    return charCfg; // 都没开，返回角色配置（enabled=false）
}

// 全局设置面板交互
function initGlobalBgSettings() {
    const cfg = getGlobalBgSettings();
    const t1 = document.getElementById('globalBgActivityToggle');
    if (t1) t1.checked = cfg.bgActivityEnabled;
    const t2 = document.getElementById('globalIndProactiveToggle');
    if (t2) t2.checked = cfg.indProactiveEnabled;
    const min = document.getElementById('globalIndProactiveMin');
    if (min) min.value = cfg.minInterval || 5;
    const max = document.getElementById('globalIndProactiveMax');
    if (max) max.value = cfg.maxInterval || 10;
    const dnd = document.getElementById('globalDndToggle');
    if (dnd) dnd.checked = cfg.dndEnabled;
    const ds = document.getElementById('globalDndStart');
    if (ds) ds.value = cfg.dndStartTime || '00:00';
    const de = document.getElementById('globalDndEnd');
    if (de) de.value = cfg.dndEndTime || '08:00';
}

function toggleGlobalBgActivity() {
    const cfg = getGlobalBgSettings();
    const t = document.getElementById('globalBgActivityToggle');
    cfg.bgActivityEnabled = t ? t.checked : false;
    saveGlobalBgSettingsData(cfg);
}

function toggleGlobalIndProactive() {
    const cfg = getGlobalBgSettings();
    const t = document.getElementById('globalIndProactiveToggle');
    cfg.indProactiveEnabled = t ? t.checked : false;
    saveGlobalBgSettingsData(cfg);
    // 重新初始化所有角色的定时器
    reinitAllIndProactive();
}

function saveGlobalBgSettings() {
    const cfg = getGlobalBgSettings();
    const t1 = document.getElementById('globalBgActivityToggle');
    if (t1) cfg.bgActivityEnabled = t1.checked;
    const t2 = document.getElementById('globalIndProactiveToggle');
    if (t2) cfg.indProactiveEnabled = t2.checked;
    const min = document.getElementById('globalIndProactiveMin');
    if (min) cfg.minInterval = Math.max(0.1, parseFloat(min.value) || 5);
    const max = document.getElementById('globalIndProactiveMax');
    if (max) cfg.maxInterval = Math.max(cfg.minInterval, parseFloat(max.value) || 10);
    const dnd = document.getElementById('globalDndToggle');
    if (dnd) cfg.dndEnabled = dnd.checked;
    const ds = document.getElementById('globalDndStart');
    if (ds) cfg.dndStartTime = ds.value || '00:00';
    const de = document.getElementById('globalDndEnd');
    if (de) cfg.dndEndTime = de.value || '08:00';

    saveGlobalBgSettingsData(cfg);
    showToast('全局后台设置已保存');
    reinitAllIndProactive();
}

function reinitAllIndProactive() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;
    // 先清除所有定时器
    chatCharacters.forEach(char => {
        if (_indProactiveTimers[char.id]) {
            clearTimeout(_indProactiveTimers[char.id]);
            delete _indProactiveTimers[char.id];
        }
    });
    // 重新初始化
    initAllIndProactive();
}

// ================================================================
// ========== 独立定时主动消息系统 ==========
// ================================================================

const _indProactiveTimers = {};
const _indProactiveLog = []; // 调试日志，最多保留20条

function _indLog(characterId, msg) {
    const entry = { time: new Date().toISOString(), characterId, msg };
    _indProactiveLog.unshift(entry);
    if (_indProactiveLog.length > 20) _indProactiveLog.pop();
    console.log(`[IndProactive][${characterId}] ${msg}`);
}

// ========== 配置存取 ==========

function getIndProactiveConfig(characterId) {
    const key = `indProactive_${characterId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
        try { return JSON.parse(raw); } catch(e) {}
    }
    return {
        enabled: false,
        minInterval: 5,
        maxInterval: 10,
        dndEnabled: false,
        dndStartTime: '00:00',
        dndEndTime: '08:00',
        nextFireTime: null,
        lastFireTime: null
    };
}

function saveIndProactiveConfig(characterId, config) {
    localStorage.setItem(`indProactive_${characterId}`, JSON.stringify(config));
}

// ========== 勿扰检查 ==========

function isIndDndActive(characterId) {
    const cfg = getIndProactiveConfig(characterId);
    if (!cfg.dndEnabled) return false;
    const now = new Date();
    const current = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = (cfg.dndStartTime || '00:00').split(':').map(Number);
    const [eh, em] = (cfg.dndEndTime || '08:00').split(':').map(Number);
    const start = sh * 60 + sm;
    const end = eh * 60 + em;
    if (start <= end) return current >= start && current < end;
    return current >= start || current < end;
}

// ========== 计算距离上次聊天的时间描述 ==========

async function getTimeSinceLastChat(characterId) {
    try {
        const lastMsg = typeof getLastMessageForCharacter === 'function'
            ? await getLastMessageForCharacter(characterId) : null;
        if (!lastMsg || !lastMsg.timestamp) return { text: '未知时间', ms: 0, sender: '未知' };

        const lastTime = new Date(lastMsg.timestamp);
        const now = new Date();
        const diffMs = now - lastTime;
        const diffMin = Math.floor(diffMs / 60000);
        const diffHour = Math.floor(diffMs / 3600000);
        const diffDay = Math.floor(diffMs / 86400000);

        let text;
        if (diffMin < 1) text = '不到1分钟';
        else if (diffMin < 60) text = `${diffMin}分钟`;
        else if (diffHour < 24) text = `${diffHour}小时${diffMin % 60 > 0 ? diffMin % 60 + '分钟' : ''}`;
        else text = `${diffDay}天${diffHour % 24 > 0 ? diffHour % 24 + '小时' : ''}`;

        const sender = lastMsg.type === 'user' ? '用户' : '你（角色）';
        return { text, ms: diffMs, sender };
    } catch(e) {
        return { text: '未知时间', ms: 0, sender: '未知' };
    }
}

// ========== 调度与触发 ==========

function scheduleIndProactive(characterId) {
    // 清除旧定时器
    if (_indProactiveTimers[characterId]) {
        clearTimeout(_indProactiveTimers[characterId]);
        delete _indProactiveTimers[characterId];
    }

    const cfg = getEffectiveIndProactiveConfig(characterId);
    if (!cfg.enabled) {
        _indLog(characterId, '未启用（角色级和全局级均关闭），跳过调度');
        return;
    }

    const minMs = (cfg.minInterval || 5) * 60000;
    const maxMs = (cfg.maxInterval || 10) * 60000;
    const delay = minMs + Math.random() * (maxMs - minMs);
    const fireTime = new Date(Date.now() + delay);

    // 保存下次触发时间到角色级配置
    const charCfg = getIndProactiveConfig(characterId);
    charCfg.nextFireTime = fireTime.toISOString();
    saveIndProactiveConfig(characterId, charCfg);

    _indLog(characterId, `已调度，${(delay/1000).toFixed(1)}秒后触发（${fireTime.toLocaleTimeString('zh-CN')}）${cfg._fromGlobal ? '【全局配置】' : ''}`);

    _indProactiveTimers[characterId] = setTimeout(async () => {
        await fireIndProactive(characterId);
        // 循环调度
        scheduleIndProactive(characterId);
    }, delay);
}

async function fireIndProactive(characterId) {
    const cfg = getEffectiveIndProactiveConfig(characterId);
    if (!cfg.enabled) {
        _indLog(characterId, '触发时发现已关闭，跳过');
        return;
    }

    // 拉黑检查 - 任何拉黑状态下不发主动消息
    if (typeof isAnyBlockActive === 'function' && isAnyBlockActive(characterId)) {
        _indLog(characterId, '拉黑状态中，跳过主动消息');
        return;
    }

    // 勿扰检查（用生效的配置）
    if (cfg.dndEnabled) {
        const now = new Date();
        const current = now.getHours() * 60 + now.getMinutes();
        const [sh, sm] = (cfg.dndStartTime || '00:00').split(':').map(Number);
        const [eh, em] = (cfg.dndEndTime || '08:00').split(':').map(Number);
        const start = sh * 60 + sm;
        const end = eh * 60 + em;
        const inDnd = start <= end ? (current >= start && current < end) : (current >= start || current < end);
        if (inDnd) {
            _indLog(characterId, '当前处于勿扰时段，跳过');
            return;
        }
    }

    const character = (typeof chatCharacters !== 'undefined') ? chatCharacters.find(c => c.id === characterId) : null;
    if (!character) {
        _indLog(characterId, '找不到角色数据，跳过');
        return;
    }

    _indLog(characterId, '开始触发主动消息...');

    try {
        const timeSince = await getTimeSinceLastChat(characterId);

        // 调用callProactiveSpeakAPI，但先注入时间上下文
        const msgs = await callIndProactiveAPI(character, timeSince);
        if (msgs && msgs.length > 0) {
            await deliverBgMessages(characterId, character, msgs);
            cfg.lastFireTime = new Date().toISOString();
            saveIndProactiveConfig(characterId, cfg);
            _indLog(characterId, `成功发送${msgs.length}条消息`);
        } else {
            _indLog(characterId, 'API返回空消息');
        }
    } catch(e) {
        _indLog(characterId, `发送失败: ${e.message}`);
        console.error('独立主动消息发送失败:', e);
    }
}

// ========== 独立主动消息API调用 ==========

async function callIndProactiveAPI(character, timeSince) {
    const settings = await storageDB.getItem('apiSettings');
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('请先在设置中配置API');
    }

    const systemPrompt = await buildRolePlaySystemPrompt(character);
    const memoryLimit = character.shortTermMemory || 10;
    const chatHistory = await getChatHistory(character.id, memoryLimit);

    const messages = [{ role: 'system', content: systemPrompt }];

    chatHistory.forEach(msg => {
        let content = msg.content;
        let timePrefix = '';
        if (msg.timestamp) {
            const t = new Date(msg.timestamp);
            timePrefix = `[${t.getFullYear()}年${t.getMonth()+1}月${t.getDate()}日 ${String(t.getHours()).padStart(2,'0')}:${String(t.getMinutes()).padStart(2,'0')}:${String(t.getSeconds()).padStart(2,'0')}] `;
        }
        if (msg.messageType === 'systemNotice' || msg.type === 'system') {
            content = `（系统记录：${msg.content}）`;
        }
        messages.push({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: timePrefix + content
        });
    });

    // 注入时间上下文的主动消息提示
    let proactivePrompt = INDEPENDENT_PROACTIVE_PROMPT
        .replace('{timeSinceLastChat}', timeSince.text)
        .replace('{lastMsgSender}', timeSince.sender);
    messages.push({ role: 'user', content: proactivePrompt });

    const aiMessages = await callBgActivityAPI(settings, messages, systemPrompt);
    return aiMessages || [];
}

// ========== 后台保活：visibilitychange + Service Worker ==========

let _indProactiveSWReady = false;

function initIndProactiveBackgroundKeepAlive() {
    // 1. visibilitychange 兜底：切回页面时检查是否需要补发
    document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
            _indLog('global', '页面恢复可见，检查是否有错过的消息');
            checkAndFireMissedProactive();
        }
    });

    // 2. Service Worker 消息监听
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data && event.data.type === 'PROACTIVE_TICK') {
                // SW 后台 tick，检查是否需要触发
                checkAndFireMissedProactive();
            }
        });
    }
}

function startSWProactiveTimer() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'START_PROACTIVE_TIMER' });
        _indProactiveSWReady = true;
        _indLog('global', 'Service Worker 后台定时器已请求启动');
    }
}

function stopSWProactiveTimer() {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'STOP_PROACTIVE_TIMER' });
        _indProactiveSWReady = false;
        _indLog('global', 'Service Worker 后台定时器已请求停止');
    }
}

async function checkAndFireMissedProactive() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;
    for (const char of chatCharacters) {
        const effectiveCfg = getEffectiveIndProactiveConfig(char.id);
        if (!effectiveCfg.enabled) continue;
        const charCfg = getIndProactiveConfig(char.id);
        if (!charCfg.nextFireTime) continue;

        const nextFire = new Date(charCfg.nextFireTime);
        if (Date.now() >= nextFire.getTime()) {
            _indLog(char.id, '检测到错过的触发时间，立即补发');
            await fireIndProactive(char.id);
            scheduleIndProactive(char.id);
        }
    }
}

// ========== 设置面板交互 ==========

function initIndProactiveSettings() {
    if (!currentChatCharacter) return;
    const cfg = getIndProactiveConfig(currentChatCharacter.id);

    const toggle = document.getElementById('indProactiveToggle');
    if (toggle) toggle.checked = cfg.enabled;

    const minInput = document.getElementById('indProactiveMin');
    if (minInput) minInput.value = cfg.minInterval || 5;

    const maxInput = document.getElementById('indProactiveMax');
    if (maxInput) maxInput.value = cfg.maxInterval || 10;

    const dndToggle = document.getElementById('indDndToggle');
    if (dndToggle) dndToggle.checked = cfg.dndEnabled;

    const dndStart = document.getElementById('indDndStart');
    if (dndStart) dndStart.value = cfg.dndStartTime || '00:00';

    const dndEnd = document.getElementById('indDndEnd');
    if (dndEnd) dndEnd.value = cfg.dndEndTime || '08:00';
}

function toggleIndependentProactive() {
    if (!currentChatCharacter) return;
    const toggle = document.getElementById('indProactiveToggle');
    const cfg = getIndProactiveConfig(currentChatCharacter.id);
    cfg.enabled = toggle.checked;
    saveIndProactiveConfig(currentChatCharacter.id, cfg);

    if (cfg.enabled) {
        scheduleIndProactive(currentChatCharacter.id);
        startSWProactiveTimer();
        _indLog(currentChatCharacter.id, '已开启');
    } else {
        if (_indProactiveTimers[currentChatCharacter.id]) {
            clearTimeout(_indProactiveTimers[currentChatCharacter.id]);
            delete _indProactiveTimers[currentChatCharacter.id];
        }
        cfg.nextFireTime = null;
        saveIndProactiveConfig(currentChatCharacter.id, cfg);
        _indLog(currentChatCharacter.id, '已关闭');
        // 检查是否还有其他角色需要SW定时器
        checkAndStopSWIfNoActive();
    }
}

function saveIndProactiveSettings() {
    if (!currentChatCharacter) return;
    const cfg = getIndProactiveConfig(currentChatCharacter.id);

    const minInput = document.getElementById('indProactiveMin');
    const maxInput = document.getElementById('indProactiveMax');
    const dndToggle = document.getElementById('indDndToggle');
    const dndStart = document.getElementById('indDndStart');
    const dndEnd = document.getElementById('indDndEnd');

    if (minInput) cfg.minInterval = Math.max(0.1, parseFloat(minInput.value) || 5);
    if (maxInput) cfg.maxInterval = Math.max(cfg.minInterval, parseFloat(maxInput.value) || 10);
    if (dndToggle) cfg.dndEnabled = dndToggle.checked;
    if (dndStart) cfg.dndStartTime = dndStart.value || '00:00';
    if (dndEnd) cfg.dndEndTime = dndEnd.value || '08:00';

    saveIndProactiveConfig(currentChatCharacter.id, cfg);
    showToast('定时消息设置已保存');

    // 重新调度
    if (cfg.enabled) {
        scheduleIndProactive(currentChatCharacter.id);
    }
}

function checkAndStopSWIfNoActive() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;
    const anyActive = chatCharacters.some(c => {
        return getEffectiveIndProactiveConfig(c.id).enabled;
    });
    if (!anyActive) stopSWProactiveTimer();
}

// ========== 立即测试 ==========

async function testIndProactiveMessage() {
    if (!currentChatCharacter) {
        showToast('请先选择一个聊天角色');
        return;
    }

    showToast('正在发送测试消息...');
    _indLog(currentChatCharacter.id, '手动触发测试消息');

    try {
        await fireIndProactive(currentChatCharacter.id);
        showToast('测试消息发送成功');
    } catch(e) {
        showToast('测试失败: ' + e.message);
    }
}

// ========== 开发者调试面板 ==========

let _debugRefreshInterval = null;

function openProactiveDebugPanel() {
    const overlay = document.getElementById('proactiveDebugOverlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    refreshProactiveDebug();

    // 每秒刷新倒计时
    _debugRefreshInterval = setInterval(refreshProactiveDebug, 1000);
}

function closeProactiveDebugPanel() {
    const overlay = document.getElementById('proactiveDebugOverlay');
    if (overlay) overlay.style.display = 'none';
    if (_debugRefreshInterval) {
        clearInterval(_debugRefreshInterval);
        _debugRefreshInterval = null;
    }
}

async function refreshProactiveDebug() {
    const container = document.getElementById('proactiveDebugContent');
    if (!container) return;
    if (!currentChatCharacter) {
        container.innerHTML = '<div style="color:#999; text-align:center;">请先选择一个聊天角色</div>';
        return;
    }

    try {
        const charId = currentChatCharacter.id;
        const cfg = getEffectiveIndProactiveConfig(charId);
        const charCfg = getIndProactiveConfig(charId);
        const configSource = charCfg.enabled ? '角色级' : (cfg.enabled ? '全局级' : '未启用');
        const now = new Date();

        // 计算倒计时
        let countdownText = '—';
        let nextFireText = '—';
        if (cfg.nextFireTime) {
            const nextFire = new Date(cfg.nextFireTime);
            nextFireText = nextFire.toLocaleTimeString('zh-CN');
            const remaining = Math.max(0, nextFire - now);
            const remSec = Math.floor(remaining / 1000);
            const remMin = Math.floor(remSec / 60);
            const remS = remSec % 60;
            countdownText = remaining > 0 ? `${remMin}分${remS}秒` : '已到时间（等待触发）';
        }

        // 上次发送时间
        let lastFireText = '—';
        if (cfg.lastFireTime) {
            lastFireText = new Date(cfg.lastFireTime).toLocaleString('zh-CN');
        }

        // 上次聊天时间
        let timeSince = { text: '未知', ms: 0, sender: '未知' };
        try { timeSince = await getTimeSinceLastChat(charId); } catch(e) {}

        // 定时器状态
        const timerActive = !!_indProactiveTimers[charId];

        // SW状态
        let swStatus = '不支持';
        try {
            if ('serviceWorker' in navigator) {
                const reg = await navigator.serviceWorker.getRegistration();
                if (reg && reg.active) swStatus = '已激活';
                else if (reg) swStatus = '已注册（未激活）';
                else swStatus = '未注册';
            }
        } catch(e) { swStatus = '检查失败'; }

        // 页面可见性
        const visibility = document.visibilityState === 'visible' ? '前台' : '后台';

        // 角色名安全处理
        const charName = (currentChatCharacter.remark || currentChatCharacter.name || '未知角色').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const html = `
            <div style="background:#f8f8f8; border-radius:10px; padding:12px; margin-bottom:10px;">
                <div style="font-weight:600; margin-bottom:8px; color:#007bff;">📊 基本状态</div>
                <div>角色: ${charName}</div>
                <div>定时消息开关: <span style="color:${cfg.enabled ? '#34c759' : '#ff3b30'}; font-weight:600;">${cfg.enabled ? '✅ 开启' : '❌ 关闭'}</span></div>
                <div>配置来源: <span style="font-weight:600; color:#5856d6;">${configSource}</span></div>
                <div>定时器激活: <span style="color:${timerActive ? '#34c759' : '#ff3b30'}; font-weight:600;">${timerActive ? '✅ 运行中' : '❌ 未运行'}</span></div>
                <div>勿扰模式: ${cfg.dndEnabled ? '开启（' + cfg.dndStartTime + '~' + cfg.dndEndTime + '）' : '关闭'}</div>
                <div>当前是否勿扰: ${isIndDndActive(charId) ? '⛔ 是' : '✅ 否'}</div>
            </div>
            <div style="background:#f8f8f8; border-radius:10px; padding:12px; margin-bottom:10px;">
                <div style="font-weight:600; margin-bottom:8px; color:#ff9500;">⏱ 时间信息</div>
                <div>间隔设置: ${cfg.minInterval}~${cfg.maxInterval} 分钟</div>
                <div>下次触发: ${nextFireText}</div>
                <div>倒计时: <span style="font-weight:600; color:#007bff;">${countdownText}</span></div>
                <div>上次发送: ${lastFireText}</div>
                <div>上次聊天: ${timeSince.text}前（${timeSince.sender}发的）</div>
                <div>当前时间: ${now.toLocaleTimeString('zh-CN')}</div>
            </div>
            <div style="background:#f8f8f8; border-radius:10px; padding:12px; margin-bottom:10px;">
                <div style="font-weight:600; margin-bottom:8px; color:#5856d6;">🔧 系统状态</div>
                <div>Service Worker: ${swStatus}</div>
                <div>SW定时器: ${_indProactiveSWReady ? '✅ 已启动' : '❌ 未启动'}</div>
                <div>页面可见性: ${visibility}</div>
            </div>
            <div style="background:#f8f8f8; border-radius:10px; padding:12px;">
                <div style="font-weight:600; margin-bottom:8px; color:#ff3b30;">📝 最近日志</div>
                ${_indProactiveLog.length === 0 ? '<div style="color:#999;">暂无日志</div>' :
                  _indProactiveLog.slice(0, 10).map(function(log) {
                      var t = new Date(log.time);
                      var timeStr = t.toLocaleTimeString('zh-CN');
                      var safeMsg = (log.msg || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                      return '<div style="font-size:12px; margin-bottom:4px; color:#666;"><span style="color:#999;">[' + timeStr + ']</span> ' + safeMsg + '</div>';
                  }).join('')}
            </div>
        `;

        container.innerHTML = html;
    } catch(e) {
        container.innerHTML = '<div style="color:#ff3b30; text-align:center; padding:20px;">加载失败: ' + (e.message || '未知错误') + '</div>';
        console.error('调试面板刷新失败:', e);
    }
}

// ========== 初始化 ==========

function initAllIndProactive() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;
    let anyActive = false;
    chatCharacters.forEach(char => {
        const effectiveCfg = getEffectiveIndProactiveConfig(char.id);
        if (effectiveCfg.enabled) {
            anyActive = true;
            const charCfg = getIndProactiveConfig(char.id);
            // 检查是否有错过的触发
            if (charCfg.nextFireTime) {
                const nextFire = new Date(charCfg.nextFireTime);
                if (Date.now() >= nextFire.getTime()) {
                    _indLog(char.id, '页面加载时发现错过的触发，立即补发');
                    fireIndProactive(char.id).then(() => {
                        scheduleIndProactive(char.id);
                    });
                    return;
                }
            }
            scheduleIndProactive(char.id);
        }
    });
    if (anyActive) startSWProactiveTimer();
    initIndProactiveBackgroundKeepAlive();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    // 延迟一点等chatCharacters加载完
    setTimeout(() => {
        initAllIndProactive();
    }, 2000);
});


// ============================================================
// 拉黑/黑名单系统
// ============================================================

// ========== 拉黑数据存取 ==========

function getBlockConfig(characterId) {
    const key = `blockConfig_${characterId}`;
    // 优先从内存缓存读取
    if (_blockConfigCache[characterId]) {
        return JSON.parse(JSON.stringify(_blockConfigCache[characterId]));
    }
    // 兼容：尝试从localStorage读取旧数据
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            _blockConfigCache[characterId] = parsed;
            return JSON.parse(JSON.stringify(parsed));
        } catch(e) {}
    }
    return {
        userBlockedChar: false,       // 用户拉黑了角色
        charBlockedUser: false,       // 角色拉黑了用户
        charBlockReason: '',          // 角色拉黑原因
        charBlockTime: null,          // 角色拉黑时间
        userBlockTime: null,          // 用户拉黑时间
        friendRequests: [],           // 好友申请记录 [{id, from, content, time, status:'pending'|'accepted'|'rejected', rejectReason}]
        lastCharRequestTime: null,    // 角色上次发好友申请时间
        lastUserRequestTime: null,    // 用户上次发好友申请时间
        charRequestInterval: 0,       // 角色单独设置的申请频率(分钟)，0表示跟随全局
        showBlockedMsgsAfterUnblock: true, // 解除拉黑后是否让角色看到被拉黑期间的消息
        charAutoUnblockCheckTime: null // 角色上次自动解除拉黑检查时间
    };
}

// 内存缓存
const _blockConfigCache = {};

function saveBlockConfig(characterId, config) {
    // 更新内存缓存
    _blockConfigCache[characterId] = JSON.parse(JSON.stringify(config));
    // 异步写入IndexedDB（不阻塞）
    const key = `blockConfig_${characterId}`;
    storageDB.setItem(key, config).then(() => {
        // 写入成功后，清理localStorage中的旧数据
        try { localStorage.removeItem(key); } catch(e) {}
    }).catch(e => {
        console.error('保存拉黑配置到IndexedDB失败:', e);
    });
}

// 从IndexedDB异步加载拉黑配置（启动时调用）
async function loadBlockConfigFromDB(characterId) {
    const key = `blockConfig_${characterId}`;
    try {
        const data = await storageDB.getItem(key);
        if (data) {
            _blockConfigCache[characterId] = data;
            // 清理localStorage旧数据
            try { localStorage.removeItem(key); } catch(e) {}
            return data;
        }
    } catch(e) {
        console.error('从IndexedDB加载拉黑配置失败:', e);
    }
    // fallback: 从localStorage读取旧数据并迁移
    const raw = localStorage.getItem(key);
    if (raw) {
        try {
            const parsed = JSON.parse(raw);
            _blockConfigCache[characterId] = parsed;
            // 迁移到IndexedDB
            storageDB.setItem(key, parsed).then(() => {
                try { localStorage.removeItem(key); } catch(e) {}
                console.log(`拉黑配置已迁移到IndexedDB: ${characterId}`);
            }).catch(() => {});
            return parsed;
        } catch(e) {}
    }
    return null;
}

// 获取全局拉黑好友申请频率设置
function getGlobalBlockRequestInterval() {
    const val = localStorage.getItem('globalBlockRequestInterval');
    return val ? parseFloat(val) : 10; // 默认10分钟
}

function saveGlobalBlockRequestInterval(minutes) {
    localStorage.setItem('globalBlockRequestInterval', String(minutes));
}

// 获取角色有效的好友申请频率（角色设置优先，否则全局）
function getEffectiveBlockRequestInterval(characterId) {
    const cfg = getBlockConfig(characterId);
    if (cfg.charRequestInterval > 0) {
        return cfg.charRequestInterval;
    }
    return getGlobalBlockRequestInterval();
}

// ========== 拉黑状态查询 ==========

function isUserBlockedChar(characterId) {
    return getBlockConfig(characterId).userBlockedChar;
}

function isCharBlockedUser(characterId) {
    return getBlockConfig(characterId).charBlockedUser;
}

function isAnyBlockActive(characterId) {
    const cfg = getBlockConfig(characterId);
    return cfg.userBlockedChar || cfg.charBlockedUser;
}

// ========== 用户拉黑角色 ==========

async function userBlockCharacter(characterId) {
    if (!characterId) return;
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    const confirmed = await iosConfirm(
        `确定要拉黑「${character.remark || character.name}」吗？\n\n拉黑后：\n• 你仍然可以发消息，但对方不会回复\n• 对方会定时给你发好友申请\n• 你可以随时在设置中解除拉黑`,
        '拉黑角色'
    );
    if (!confirmed) return;

    await loadBlockConfigFromDB(characterId);
    const cfg = getBlockConfig(characterId);
    cfg.userBlockedChar = true;
    cfg.userBlockTime = new Date().toISOString();
    saveBlockConfig(characterId, cfg);

    // 停止该角色的后台活动和主动消息
    if (typeof stopBgActivityTimer === 'function') {
        stopBgActivityTimer(characterId);
    }

    showToast(`已拉黑「${character.remark || character.name}」`);

    // 启动角色好友申请定时器
    scheduleCharFriendRequest(characterId);

    // 刷新聊天界面
    updateBlockUI(characterId);
}

// 用户解除拉黑角色
async function userUnblockCharacter(characterId) {
    if (!characterId) return;
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    const confirmed = await iosConfirm(
        `确定要解除对「${character.remark || character.name}」的拉黑吗？`,
        '解除拉黑'
    );
    if (!confirmed) return;

    const cfg = getBlockConfig(characterId);
    cfg.userBlockedChar = false;
    cfg.userBlockTime = null;
    // 清除待处理的好友申请
    cfg.friendRequests = cfg.friendRequests.filter(r => r.status !== 'pending' || r.from !== 'char');
    saveBlockConfig(characterId, cfg);

    // 停止好友申请定时器
    clearCharFriendRequestTimer(characterId);

    showToast(`已解除对「${character.remark || character.name}」的拉黑`);
    updateBlockUI(characterId);
}

// ========== 角色拉黑用户 ==========

function charBlockUser(characterId, reason) {
    const cfg = getBlockConfig(characterId);
    cfg.charBlockedUser = true;
    cfg.charBlockReason = reason || '不想理你了';
    cfg.charBlockTime = new Date().toISOString();
    saveBlockConfig(characterId, cfg);

    const character = chatCharacters.find(c => c.id === characterId);
    const charName = character ? (character.remark || character.name) : '对方';

    // 显示系统通知
    showBlockNotification(characterId, `${charName} 已将你拉黑`);

    // 启动角色自动解除拉黑检查定时器
    scheduleCharAutoUnblockCheck(characterId);

    updateBlockUI(characterId);
}

// 角色解除拉黑用户
function charUnblockUser(characterId, firstMessage) {
    const cfg = getBlockConfig(characterId);
    cfg.charBlockedUser = false;
    cfg.charBlockReason = '';
    cfg.charBlockTime = null;
    cfg.friendRequests = cfg.friendRequests.filter(r => r.status !== 'pending' || r.from !== 'user');
    saveBlockConfig(characterId, cfg);

    clearCharAutoUnblockTimer(characterId);

    const character = chatCharacters.find(c => c.id === characterId);
    const charName = character ? (character.remark || character.name) : '对方';

    // 弹窗通知
    showIosAlert('好友通知', `${charName} 已解除对你的拉黑，你们可以继续聊天了！`);

    updateBlockUI(characterId);

    // 角色主动发一条消息
    if (firstMessage && character) {
        setTimeout(async () => {
            const msgObj = {
                id: Date.now().toString(),
                characterId: characterId,
                content: firstMessage,
                type: 'char',
                timestamp: new Date().toISOString(),
                sender: 'char'
            };
            if (typeof saveMessageToDB === 'function') await saveMessageToDB(msgObj);
            if (currentChatCharacter && currentChatCharacter.id === characterId) {
                if (typeof appendMessageToChat === 'function') appendMessageToChat(msgObj);
                if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
            }
            if (typeof updateChatListLastMessage === 'function') {
                await updateChatListLastMessage(characterId, firstMessage, new Date().toISOString());
            }
        }, 1500);
    }
}

// ========== 好友申请定时器管理 ==========

const _blockTimers = {};

// 角色定时发好友申请（用户拉黑角色后）
function scheduleCharFriendRequest(characterId) {
    clearCharFriendRequestTimer(characterId);
    const cfg = getBlockConfig(characterId);
    if (!cfg.userBlockedChar) return;

    const intervalMin = getEffectiveBlockRequestInterval(characterId);
    const intervalMs = intervalMin * 60 * 1000;

    // 计算下次触发时间
    let delay = intervalMs;
    if (cfg.lastCharRequestTime) {
        const elapsed = Date.now() - new Date(cfg.lastCharRequestTime).getTime();
        if (elapsed < intervalMs) {
            delay = intervalMs - elapsed;
        } else {
            delay = 1000; // 已经超时，立即触发
        }
    }

    _blockTimers[`charReq_${characterId}`] = setTimeout(async () => {
        await fireCharFriendRequest(characterId);
        scheduleCharFriendRequest(characterId); // 循环
    }, delay);
}

function clearCharFriendRequestTimer(characterId) {
    const key = `charReq_${characterId}`;
    if (_blockTimers[key]) {
        clearTimeout(_blockTimers[key]);
        delete _blockTimers[key];
    }
}

// 角色发送好友申请
async function fireCharFriendRequest(characterId) {
    const cfg = getBlockConfig(characterId);
    if (!cfg.userBlockedChar) return;

    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    try {
        // 构建上下文
        let blockContext = '';

        // 之前被拒绝的记录
        const rejectedRequests = cfg.friendRequests.filter(r => r.from === 'char' && r.status === 'rejected');
        if (rejectedRequests.length > 0) {
            blockContext += `你之前已经发过${rejectedRequests.length}次好友申请，都被拒绝了：\n`;
            rejectedRequests.slice(-3).forEach((r, i) => {
                blockContext += `第${i + 1}次申请内容："${r.content}"`;
                if (r.rejectReason) blockContext += `，被拒绝理由："${r.rejectReason}"`;
                blockContext += '\n';
            });
        }

        // 用户拉黑后发的消息
        const blockedMessages = await getMessagesSinceBlock(characterId, cfg.userBlockTime, 'user');
        if (blockedMessages.length > 0) {
            blockContext += `\n对方拉黑你之后还给你发了这些消息：\n`;
            blockedMessages.slice(-10).forEach(m => {
                blockContext += `- "${m.content}"\n`;
            });
        }

        // 短期记忆和长期记忆
        const memories = await getLongTermMemories(characterId);
        if (memories.length > 0) {
            blockContext += `\n你对对方的长期记忆：\n`;
            memories.slice(-5).forEach(m => {
                blockContext += `- ${m.content}\n`;
            });
        }

        // 调用AI生成申请内容
        const prompt = BLOCK_FRIEND_REQUEST_PROMPT.replace('{blockContext}', blockContext);
        const requestContent = await callBlockAI(characterId, prompt);

        // 创建好友申请
        const request = {
            id: 'fr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            from: 'char',
            characterId: characterId,
            charName: character.remark || character.name,
            charAvatar: character.avatar || '',
            content: requestContent.trim(),
            time: new Date().toISOString(),
            status: 'pending'
        };

        cfg.friendRequests.push(request);
        // 只保留最近50条好友申请记录，防止数据膨胀
        if (cfg.friendRequests.length > 50) {
            cfg.friendRequests = cfg.friendRequests.slice(-50);
        }
        cfg.lastCharRequestTime = new Date().toISOString();
        // 清除失败状态
        cfg.lastCharRequestError = null;
        cfg.lastCharRequestErrorTime = null;
        saveBlockConfig(characterId, cfg);

        // 更新好友申请UI
        updateFriendRequestBadge();

        // 显示通知
        showToast(`${character.remark || character.name} 发来了好友申请`);

    } catch (e) {
        console.error('角色发送好友申请失败:', e);
        // 记录失败状态到配置，让开发者面板能显示
        const cfgErr = getBlockConfig(characterId);
        cfgErr.lastCharRequestError = e.message || '未知错误';
        cfgErr.lastCharRequestErrorTime = new Date().toISOString();
        saveBlockConfig(characterId, cfgErr);
        showToast(`好友申请发送失败: ${e.message || '未知错误'}`, 'error');
    }
}

// 获取拉黑后的消息
async function getMessagesSinceBlock(characterId, blockTime, senderType) {
    try {
        const allChats = await getAllChatsFromDB();
        const blockDate = new Date(blockTime);
        return allChats.filter(c =>
            c.characterId === characterId &&
            c.type === senderType &&
            new Date(c.timestamp) > blockDate
        ).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    } catch (e) {
        console.error('获取拉黑后消息失败:', e);
        return [];
    }
}

// ========== 角色自动解除拉黑检查 ==========

function scheduleCharAutoUnblockCheck(characterId) {
    clearCharAutoUnblockTimer(characterId);
    const cfg = getBlockConfig(characterId);
    if (!cfg.charBlockedUser) return;

    const intervalMin = getEffectiveBlockRequestInterval(characterId);
    // 自动解除检查间隔 = 好友申请频率 * 3（不要太频繁）
    const intervalMs = intervalMin * 3 * 60 * 1000;

    _blockTimers[`autoUnblock_${characterId}`] = setTimeout(async () => {
        await checkCharAutoUnblock(characterId);
        scheduleCharAutoUnblockCheck(characterId);
    }, intervalMs);
}

function clearCharAutoUnblockTimer(characterId) {
    const key = `autoUnblock_${characterId}`;
    if (_blockTimers[key]) {
        clearTimeout(_blockTimers[key]);
        delete _blockTimers[key];
    }
}

async function checkCharAutoUnblock(characterId) {
    const cfg = getBlockConfig(characterId);
    if (!cfg.charBlockedUser) return;

    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    try {
        let unblockContext = '';

        // 用户发来的好友申请
        const userRequests = cfg.friendRequests.filter(r => r.from === 'user');
        if (userRequests.length > 0) {
            unblockContext += `对方发来过${userRequests.length}次好友申请：\n`;
            userRequests.slice(-3).forEach((r, i) => {
                unblockContext += `第${i + 1}次："${r.content}"，状态：${r.status === 'rejected' ? '已拒绝' : '待处理'}\n`;
            });
        }

        // 长期记忆
        const memories = await getLongTermMemories(characterId);
        if (memories.length > 0) {
            unblockContext += `\n你对对方的记忆：\n`;
            memories.slice(-3).forEach(m => {
                unblockContext += `- ${m.content}\n`;
            });
        }

        const timeSinceBlock = getTimeDiffText(new Date(cfg.charBlockTime), new Date());

        const prompt = BLOCK_AUTO_UNBLOCK_PROMPT
            .replace('{blockReason}', cfg.charBlockReason)
            .replace('{blockTime}', new Date(cfg.charBlockTime).toLocaleString('zh-CN'))
            .replace('{timeSinceBlock}', timeSinceBlock)
            .replace('{unblockContext}', unblockContext);

        const result = await callBlockAI(characterId, prompt);
        if (!result) return;

        if (result.includes('[unblock:')) {
            const match = result.match(/\[unblock:(.*?)\]/);
            const firstMsg = match ? match[1] : '我想通了，我们和好吧';
            charUnblockUser(characterId, firstMsg);
        }
        // [keep-block] 则不做任何事

        cfg.charAutoUnblockCheckTime = new Date().toISOString();
        saveBlockConfig(characterId, cfg);

    } catch (e) {
        console.error('自动解除拉黑检查失败:', e);
    }
}

// 时间差文本
function getTimeDiffText(from, to) {
    const diffMs = to - from;
    const minutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}天${hours % 24}小时`;
    if (hours > 0) return `${hours}小时${minutes % 60}分钟`;
    return `${minutes}分钟`;
}

// ========== 用户发送好友申请（角色拉黑用户后） ==========

async function userSendFriendRequest(characterId) {
    const cfg = getBlockConfig(characterId);
    if (!cfg.charBlockedUser) return;

    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    // 弹出输入框让用户写申请理由
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '320px';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '发送好友申请';

        const msgEl = document.createElement('div');
        msgEl.className = 'ios-dialog-message';
        msgEl.textContent = `向「${character.remark || character.name}」发送好友申请`;

        const inputWrap = document.createElement('div');
        inputWrap.style.cssText = 'padding: 8px 16px 16px;';
        const textarea = document.createElement('textarea');
        textarea.placeholder = '写一段话给对方...';
        textarea.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;resize:vertical;min-height:80px;';
        textarea.onfocus = () => { textarea.style.borderColor = '#007aff'; };
        textarea.onblur = () => { textarea.style.borderColor = '#e0e0e0'; };
        inputWrap.appendChild(textarea);

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons';

        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => { closeDialog(); resolve(false); };

        const sendBtn = document.createElement('button');
        sendBtn.className = 'ios-dialog-button primary';
        sendBtn.textContent = '发送';
        sendBtn.onclick = () => {
            const content = textarea.value.trim();
            if (!content) { showToast('请输入申请内容'); return; }
            closeDialog();
            submitUserFriendRequest(characterId, content);
            resolve(true);
        };

        buttonsEl.appendChild(cancelBtn);
        buttonsEl.appendChild(sendBtn);
        dialog.appendChild(titleEl);
        dialog.appendChild(msgEl);
        dialog.appendChild(inputWrap);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        setTimeout(() => overlay.classList.add('show'), 10);

        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => document.body.removeChild(overlay), 300);
        }
    });
}

function submitUserFriendRequest(characterId, content) {
    const cfg = getBlockConfig(characterId);
    const character = chatCharacters.find(c => c.id === characterId);

    const request = {
        id: 'fr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        from: 'user',
        characterId: characterId,
        content: content,
        time: new Date().toISOString(),
        status: 'pending'
    };

    cfg.friendRequests.push(request);
    cfg.lastUserRequestTime = new Date().toISOString();
    saveBlockConfig(characterId, cfg);

    showToast('好友申请已发送');

    // 定时让AI审核
    scheduleCharReviewRequest(characterId, request.id);
}

// 角色审核用户好友申请
function scheduleCharReviewRequest(characterId, requestId) {
    const intervalMin = getEffectiveBlockRequestInterval(characterId);
    // 审核延迟 = 频率的一半，至少1分钟
    const delayMs = Math.max(intervalMin * 0.5 * 60 * 1000, 60000);

    setTimeout(async () => {
        await reviewUserFriendRequest(characterId, requestId);
    }, delayMs);
}

async function reviewUserFriendRequest(characterId, requestId) {
    const cfg = getBlockConfig(characterId);
    if (!cfg.charBlockedUser) return; // 已经解除了

    const request = cfg.friendRequests.find(r => r.id === requestId);
    if (!request || request.status !== 'pending') return;

    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;

    try {
        let reviewContext = '';
        reviewContext += `对方的好友申请内容："${request.content}"\n`;

        // 之前拒绝过的记录
        const rejectedRequests = cfg.friendRequests.filter(r => r.from === 'user' && r.status === 'rejected');
        if (rejectedRequests.length > 0) {
            reviewContext += `\n你之前已经拒绝过${rejectedRequests.length}次：\n`;
            rejectedRequests.slice(-3).forEach((r, i) => {
                reviewContext += `第${i + 1}次申请："${r.content}"，你的拒绝理由："${r.rejectReason || '无'}"\n`;
            });
        }

        // 长期记忆
        const memories = await getLongTermMemories(characterId);
        if (memories.length > 0) {
            reviewContext += `\n你对对方的记忆：\n`;
            memories.slice(-3).forEach(m => {
                reviewContext += `- ${m.content}\n`;
            });
        }

        const prompt = BLOCK_REVIEW_REQUEST_PROMPT
            .replace('{blockReason}', cfg.charBlockReason)
            .replace('{reviewContext}', reviewContext);

        const result = await callBlockAI(characterId, prompt);
        if (!result) return;

        if (result.includes('[friend-accept:')) {
            const match = result.match(/\[friend-accept:(.*?)\]/);
            const msg = match ? match[1] : '';
            request.status = 'accepted';
            saveBlockConfig(characterId, cfg);
            // 角色解除拉黑
            charUnblockUser(characterId, msg);
        } else if (result.includes('[friend-reject:')) {
            const match = result.match(/\[friend-reject:(.*?)\]/);
            request.status = 'rejected';
            request.rejectReason = match ? match[1] : '暂时不想加';
            saveBlockConfig(characterId, cfg);
            showToast(`${character.remark || character.name} 拒绝了你的好友申请`);
        }
    } catch (e) {
        console.error('审核好友申请失败:', e);
    }
}

// ========== 处理角色好友申请（用户操作） ==========

async function acceptCharFriendRequest(requestId, characterId) {
    const cfg = getBlockConfig(characterId);
    const request = cfg.friendRequests.find(r => r.id === requestId);
    if (!request) return;

    request.status = 'accepted';
    cfg.userBlockedChar = false;
    cfg.userBlockTime = null;
    saveBlockConfig(characterId, cfg);

    clearCharFriendRequestTimer(characterId);

    const character = chatCharacters.find(c => c.id === characterId);
    showToast(`已同意「${character ? character.remark || character.name : '角色'}」的好友申请`);

    updateBlockUI(characterId);
    renderFriendRequestList();
}

async function rejectCharFriendRequest(requestId, characterId) {
    // 弹出输入框让用户写拒绝理由
    return new Promise((resolve) => {
        iosPrompt('拒绝理由（可选）', '', (reason) => {
            const cfg = getBlockConfig(characterId);
            const request = cfg.friendRequests.find(r => r.id === requestId);
            if (!request) { resolve(); return; }

            request.status = 'rejected';
            request.rejectReason = reason || '';
            saveBlockConfig(characterId, cfg);

            const character = chatCharacters.find(c => c.id === characterId);
            showToast(`已拒绝「${character ? character.remark || character.name : '角色'}」的好友申请`);

            renderFriendRequestList();
            resolve();
        });
    });
}

// ========== 拉黑系统AI调用（复用单聊API方式） ==========

async function callBlockAI(characterId, userPrompt) {
    try {
        const settings = await storageDB.getItem('apiSettings');
        if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
            console.warn('拉黑系统：API未配置');
            throw new Error('API未配置，请先在设置中配置API');
        }

        const character = chatCharacters.find(c => c.id === characterId);
        let systemPrompt = '';
        if (character) {
            systemPrompt = `你是${character.name}。${character.description || ''}`;
        }

        let response;
        if (settings.provider === 'hakimi') {
            // Gemini API - 与单聊一致，使用 systemInstruction
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
                    systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
                    generationConfig: {
                        temperature: settings.temperature !== undefined ? settings.temperature : 0.8,
                        topP: settings.topP !== undefined ? settings.topP : 0.95,
                        maxOutputTokens: 512
                    }
                })
            });
        } else if (settings.provider === 'claude') {
            // Claude API - 与单聊一致
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
                    temperature: settings.temperature !== undefined ? settings.temperature : 0.8,
                    system: systemPrompt,
                    messages: [{ role: 'user', content: userPrompt }]
                })
            });
        } else {
            // OpenAI-compatible API - 与单聊一致
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [
                        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: settings.temperature !== undefined ? settings.temperature : 0.8,
                    max_tokens: 512
                })
            });
        }

        if (!response.ok) {
            const errorText = await response.text().catch(() => '');
            throw new Error(`API请求失败: ${response.status} ${errorText.substring(0, 200)}`);
        }

        const data = await response.json();
        let text = '';
        if (settings.provider === 'hakimi') {
            text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } else if (settings.provider === 'claude') {
            text = data.content?.[0]?.text || '';
        } else {
            text = data.choices?.[0]?.message?.content || '';
        }

        if (!text.trim()) {
            throw new Error('API返回了空响应');
        }

        return text.trim();
    } catch (e) {
        console.error('拉黑系统AI调用异常:', e);
        throw e; // 向上抛出，让调用方处理
    }
}

// ========== 拉黑通知 ==========

function showBlockNotification(characterId, message) {
    // 添加系统消息到聊天
    const msgObj = {
        id: Date.now().toString(),
        characterId: characterId,
        content: message,
        type: 'system',
        messageType: 'systemNotice',
        timestamp: new Date().toISOString(),
        sender: 'system'
    };

    if (typeof saveMessageToDB === 'function') saveMessageToDB(msgObj);
    if (currentChatCharacter && currentChatCharacter.id === characterId) {
        if (typeof appendMessageToChat === 'function') appendMessageToChat(msgObj);
        if (typeof scrollChatToBottom === 'function') scrollChatToBottom();
    }
}

// ========== UI更新 ==========

function updateBlockUI(characterId) {
    if (!currentChatCharacter || currentChatCharacter.id !== characterId) return;

    const cfg = getBlockConfig(characterId);
    const inputBar = document.querySelector('.chat-input-bar');
    const voiceBtn = document.querySelector('.chat-input-voice');

    if (!inputBar) return;

    // 移除旧的拉黑提示
    const oldBlockBar = document.getElementById('blockStatusBar');
    if (oldBlockBar) oldBlockBar.remove();

    // 移除旧的好友申请按钮
    const oldFrBtn = document.getElementById('blockFriendRequestBtn');
    if (oldFrBtn) oldFrBtn.remove();

    if (cfg.charBlockedUser) {
        // 角色拉黑了用户 - 在语音按钮位置添加好友申请按钮
        if (voiceBtn && voiceBtn.parentNode) {
            const frBtn = document.createElement('div');
            frBtn.id = 'blockFriendRequestBtn';
            frBtn.className = 'chat-input-voice';
            frBtn.title = '发送好友申请';
            frBtn.onclick = () => userSendFriendRequest(characterId);
            frBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ff9500" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>`;
            voiceBtn.parentNode.insertBefore(frBtn, voiceBtn);
            voiceBtn.style.display = 'none';
        }

        // 构建详细的拉黑状态信息
        let blockDetail = '对方已将你拉黑 · 消息将无法送达';
        const blockTimeParts = [];

        // 拉黑时长
        if (cfg.charBlockTime) {
            const elapsed = getTimeDiffText(new Date(cfg.charBlockTime), new Date());
            blockTimeParts.push(`已拉黑 ${elapsed}`);
        }
        // 拉黑原因
        if (cfg.charBlockReason) {
            blockTimeParts.push(`原因：${cfg.charBlockReason}`);
        }

        // 好友申请状态
        const userPendingReqs = cfg.friendRequests.filter(r => r.from === 'user' && r.status === 'pending');
        const userRejectedReqs = cfg.friendRequests.filter(r => r.from === 'user' && r.status === 'rejected');
        if (userPendingReqs.length > 0) {
            const intervalMin = getEffectiveBlockRequestInterval(characterId);
            const reviewDelay = Math.max(intervalMin * 0.5, 1);
            const lastReq = userPendingReqs[userPendingReqs.length - 1];
            const sentTime = new Date(lastReq.time);
            const reviewTime = new Date(sentTime.getTime() + reviewDelay * 60 * 1000);
            const now = new Date();
            if (reviewTime > now) {
                const remaining = getTimeDiffText(now, reviewTime);
                blockTimeParts.push(`好友申请审核中 · 预计 ${remaining}后处理`);
            } else {
                blockTimeParts.push('好友申请审核中 · 即将处理');
            }
        } else if (userRejectedReqs.length > 0) {
            const lastReject = userRejectedReqs[userRejectedReqs.length - 1];
            blockTimeParts.push(`上次申请被拒绝${lastReject.rejectReason ? '：' + lastReject.rejectReason : ''}`);
        } else {
            // 没有发过好友申请，显示角色预计消气时间
            const intervalMin = getEffectiveBlockRequestInterval(characterId);
            const autoCheckDelay = intervalMin * 3;
            if (cfg.charAutoUnblockCheckTime) {
                const lastCheck = new Date(cfg.charAutoUnblockCheckTime);
                const nextCheck = new Date(lastCheck.getTime() + autoCheckDelay * 60 * 1000);
                const now = new Date();
                if (nextCheck > now) {
                    const remaining = getTimeDiffText(now, nextCheck);
                    blockTimeParts.push(`对方可能在 ${remaining}后考虑是否原谅你`);
                } else {
                    blockTimeParts.push('对方可能正在考虑是否原谅你');
                }
            } else if (cfg.charBlockTime) {
                const blockStart = new Date(cfg.charBlockTime);
                const nextCheck = new Date(blockStart.getTime() + autoCheckDelay * 60 * 1000);
                const now = new Date();
                if (nextCheck > now) {
                    const remaining = getTimeDiffText(now, nextCheck);
                    blockTimeParts.push(`对方可能在 ${remaining}后考虑是否原谅你`);
                } else {
                    blockTimeParts.push('对方可能正在考虑是否原谅你');
                }
            }
            blockTimeParts.push('点击右侧按钮发送好友申请');
        }

        // 添加拉黑状态提示条
        if (inputBar.parentNode) {
            const blockBar = document.createElement('div');
            blockBar.id = 'blockStatusBar';
            blockBar.style.cssText = 'background:#fff3cd;color:#856404;text-align:center;padding:8px 12px;font-size:12px;border-bottom:1px solid #ffc107;line-height:1.6;';
            blockBar.innerHTML = `<div style="font-weight:500;">${blockDetail}</div>` +
                (blockTimeParts.length > 0 ? `<div style="font-size:11px;color:#a08000;margin-top:2px;">${blockTimeParts.join(' · ')}</div>` : '');
            inputBar.parentNode.insertBefore(blockBar, inputBar);
        }
    } else if (cfg.userBlockedChar) {
        // 用户拉黑了角色 - 添加拉黑状态提示条
        if (inputBar.parentNode) {
            const blockBar = document.createElement('div');
            blockBar.id = 'blockStatusBar';
            blockBar.style.cssText = 'background:#f8d7da;color:#721c24;text-align:center;padding:6px 12px;font-size:12px;border-bottom:1px solid #f5c6cb;';
            blockBar.textContent = `你已拉黑对方 · 对方无法回复你的消息`;
            inputBar.parentNode.insertBefore(blockBar, inputBar);
        }
    } else {
        // 没有拉黑 - 恢复语音按钮
        if (voiceBtn) voiceBtn.style.display = '';
    }
}

// ========== 好友申请列表（好友标签页） ==========

let _friendReqEditMode = false;

function toggleFriendReqEditMode() {
    _friendReqEditMode = !_friendReqEditMode;
    const editBtn = document.getElementById('friendReqEditBtn');
    const editBar = document.getElementById('friendReqEditBar');
    if (editBtn) editBtn.textContent = _friendReqEditMode ? '完成' : '管理';
    if (editBar) editBar.style.display = _friendReqEditMode ? 'flex' : 'none';
    // 重新渲染列表以显示/隐藏复选框
    renderFriendRequestList();
}

function toggleFriendReqSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.friend-req-checkbox');
    checkboxes.forEach(cb => { cb.checked = checked; });
    updateFriendReqSelectedCount();
}

function updateFriendReqSelectedCount() {
    const checkboxes = document.querySelectorAll('.friend-req-checkbox:checked');
    const countEl = document.getElementById('friendReqSelectedCount');
    const deleteBtn = document.getElementById('friendReqDeleteBtn');
    const selectAllCb = document.getElementById('friendReqSelectAll');
    const allCbs = document.querySelectorAll('.friend-req-checkbox');
    if (countEl) countEl.textContent = `已选 ${checkboxes.length} 项`;
    if (deleteBtn) deleteBtn.disabled = checkboxes.length === 0;
    if (selectAllCb) selectAllCb.checked = allCbs.length > 0 && checkboxes.length === allCbs.length;
}

async function deleteFriendReqSelected() {
    const checkboxes = document.querySelectorAll('.friend-req-checkbox:checked');
    if (checkboxes.length === 0) return;

    const confirmed = await iosConfirm(`确定删除选中的 ${checkboxes.length} 条好友申请记录？`, '删除确认');
    if (!confirmed) return;

    const idsToDelete = new Set();
    checkboxes.forEach(cb => idsToDelete.add(cb.dataset.reqId));

    // 从各角色的配置中删除对应记录
    chatCharacters.forEach(char => {
        const cfg = getBlockConfig(char.id);
        const before = cfg.friendRequests.length;
        cfg.friendRequests = cfg.friendRequests.filter(r => !idsToDelete.has(r.id));
        if (cfg.friendRequests.length !== before) {
            saveBlockConfig(char.id, cfg);
        }
    });

    showToast(`已删除 ${idsToDelete.size} 条记录`);
    renderFriendRequestList();
    updateFriendRequestBadge();
}

function renderFriendRequestList() {
    const container = document.getElementById('friendRequestListContainer');
    if (!container) return;

    // 获取用户头像
    let userAvatarSrc = '';
    try {
        const savedUserData = localStorage.getItem('chatUserData');
        if (savedUserData) {
            const userData = JSON.parse(savedUserData);
            if (userData.avatar) userAvatarSrc = userData.avatar;
        }
        if (!userAvatarSrc) {
            const ua = localStorage.getItem('userAvatar');
            if (ua) userAvatarSrc = ua;
        }
    } catch(e) {}

    // 获取用户名称
    let userName = '你';
    try {
        const uds = localStorage.getItem('chatUserData');
        if (uds) { const ud = JSON.parse(uds); if (ud.name) userName = ud.name; }
    } catch(e) {}

    // 所有历史申请（最近的）
    const allRequests = [];
    chatCharacters.forEach(char => {
        const cfg = getBlockConfig(char.id);
        cfg.friendRequests.forEach(r => {
            allRequests.push({
                ...r,
                charName: char.remark || char.name,
                charAvatar: char.avatar || '',
                characterId: r.characterId || char.id
            });
        });
    });
    allRequests.sort((a, b) => new Date(b.time) - new Date(a.time));

    if (allRequests.length === 0) {
        container.innerHTML = `<div style="text-align:center;color:#999;padding:60px 20px;font-size:14px;">暂无好友申请</div>`;
        // 编辑模式下也隐藏编辑栏
        const editBar = document.getElementById('friendReqEditBar');
        if (editBar) editBar.style.display = 'none';
        const editBtn = document.getElementById('friendReqEditBtn');
        if (editBtn) editBtn.style.display = 'none';
        return;
    }

    // 确保管理按钮可见
    const editBtn = document.getElementById('friendReqEditBtn');
    if (editBtn) editBtn.style.display = '';

    container.innerHTML = allRequests.map(r => {
        const time = new Date(r.time).toLocaleString('zh-CN');
        const isFromChar = r.from === 'char';
        const avatar = isFromChar ? r.charAvatar : userAvatarSrc;
        const name = isFromChar ? r.charName : userName;
        const target = isFromChar ? userName : r.charName;
        let statusHtml = '';
        if (r.status === 'pending' && isFromChar) {
            statusHtml = `
                <div style="display:flex;gap:8px;margin-top:8px;">
                    <button onclick="acceptCharFriendRequest('${r.id}','${r.characterId}')" style="flex:1;background:#34c759;color:#fff;border:none;border-radius:8px;padding:8px 0;font-size:13px;cursor:pointer;">同意</button>
                    <button onclick="rejectCharFriendRequest('${r.id}','${r.characterId}')" style="flex:1;background:#ff3b30;color:#fff;border:none;border-radius:8px;padding:8px 0;font-size:13px;cursor:pointer;">拒绝</button>
                </div>`;
        } else if (r.status === 'pending' && !isFromChar) {
            let reviewInfo = '等待对方审核...';
            const charId = r.characterId;
            if (charId) {
                const intervalMin = getEffectiveBlockRequestInterval(charId);
                const reviewDelay = Math.max(intervalMin * 0.5, 1);
                const sentTime = new Date(r.time);
                const reviewTime = new Date(sentTime.getTime() + reviewDelay * 60 * 1000);
                const now = new Date();
                if (reviewTime > now) {
                    const remaining = getTimeDiffText(now, reviewTime);
                    reviewInfo = `等待对方审核 · 预计 ${remaining}后处理`;
                } else {
                    reviewInfo = '对方正在审核中 · 即将处理';
                }
            }
            statusHtml = `<div style="color:#ff9500;font-size:12px;margin-top:6px;">${reviewInfo}</div>`;
        } else if (r.status === 'accepted') {
            statusHtml = `<div style="color:#34c759;font-size:12px;margin-top:6px;">已同意</div>`;
        } else if (r.status === 'rejected') {
            statusHtml = `<div style="color:#ff3b30;font-size:12px;margin-top:6px;">已拒绝${r.rejectReason ? '：' + r.rejectReason : ''}</div>`;
        }

        const avatarHtml = avatar
            ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">`
            : `<span style="font-size:16px;">${name.charAt(0)}</span>`;

        const checkboxHtml = _friendReqEditMode
            ? `<input type="checkbox" class="friend-req-checkbox" data-req-id="${r.id}" onchange="updateFriendReqSelectedCount()" style="width:18px;height:18px;margin-right:4px;flex-shrink:0;">`
            : '';

        return `
            <div class="friend-request-item" style="padding:12px 16px;">
                <div style="display:flex;align-items:center;gap:10px;">
                    ${checkboxHtml}
                    <div class="friend-request-avatar">${avatarHtml}</div>
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:14px;font-weight:500;color:#333;">${escapeHtml(name)} → ${escapeHtml(target)}</div>
                        <div style="font-size:13px;color:#666;margin-top:4px;word-break:break-word;">${escapeHtml(r.content)}</div>
                        <div style="font-size:11px;color:#bbb;margin-top:4px;">${time}</div>
                        ${statusHtml}
                    </div>
                </div>
            </div>`;
    }).join('');
}

// 更新好友申请角标
function updateFriendRequestBadge() {
    let pendingCount = 0;
    if (typeof chatCharacters !== 'undefined' && chatCharacters) {
        chatCharacters.forEach(char => {
            const cfg = getBlockConfig(char.id);
            pendingCount += cfg.friendRequests.filter(r => r.status === 'pending' && r.from === 'char').length;
        });
    }

    const badge = document.getElementById('friendRequestBadge');
    if (badge) {
        if (pendingCount > 0) {
            badge.textContent = pendingCount;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// ========== 拉黑开发者面板 ==========

let _blockDevPanelTimer = null;
let _blockDevPanelCharId = null;

async function openBlockDevPanel(characterId) {
    const panelEl = document.getElementById('blockDevPanel');
    if (!panelEl) return;

    const cid = characterId || (currentChatCharacter ? currentChatCharacter.id : null);
    if (!cid) { showToast('请先选择角色'); return; }

    _blockDevPanelCharId = cid;
    panelEl.style.display = 'block';

    // 先从IndexedDB拉最新数据再渲染
    await loadBlockConfigFromDB(cid);
    renderBlockDevPanel(cid);

    // 每5秒自动刷新面板数据
    clearInterval(_blockDevPanelTimer);
    _blockDevPanelTimer = setInterval(async () => {
        if (!_blockDevPanelCharId) return;
        const panel = document.getElementById('blockDevPanel');
        if (!panel || panel.style.display === 'none') {
            clearInterval(_blockDevPanelTimer);
            _blockDevPanelTimer = null;
            return;
        }
        await loadBlockConfigFromDB(_blockDevPanelCharId);
        renderBlockDevPanel(_blockDevPanelCharId);
    }, 5000);
}

function closeBlockDevPanel() {
    const panelEl = document.getElementById('blockDevPanel');
    if (panelEl) panelEl.style.display = 'none';
    _blockDevPanelCharId = null;
    if (_blockDevPanelTimer) {
        clearInterval(_blockDevPanelTimer);
        _blockDevPanelTimer = null;
    }
}

function renderBlockDevPanel(characterId) {
    const container = document.getElementById('blockDevPanelContent');
    if (!container) return;

    const cfg = getBlockConfig(characterId);
    const character = chatCharacters.find(c => c.id === characterId);
    const charName = character ? (character.remark || character.name) : '未知角色';

    if (!cfg.userBlockedChar && !cfg.charBlockedUser) {
        container.innerHTML = `
            <div style="text-align:center;color:#999;padding:40px 20px;">
                <div style="font-size:48px;margin-bottom:16px;">✌️</div>
                <div style="font-size:15px;margin-bottom:8px;">一切正常</div>
                <div style="font-size:13px;">你没有拉黑「${charName}」，「${charName}」也没有拉黑你</div>
            </div>`;
        return;
    }

    let html = '';

    if (cfg.userBlockedChar) {
        const blockTime = cfg.userBlockTime ? new Date(cfg.userBlockTime).toLocaleString('zh-CN') : '未知';
        const interval = getEffectiveBlockRequestInterval(characterId);
        let nextReqStatus = '';
        if (cfg.lastCharRequestError) {
            const errTime = cfg.lastCharRequestErrorTime ? new Date(cfg.lastCharRequestErrorTime).toLocaleString('zh-CN') : '';
            nextReqStatus = `<span style="color:#dc3545;">❌ 发送失败${errTime ? '（' + errTime + '）' : ''}</span>`;
        } else if (cfg.lastCharRequestTime) {
            nextReqStatus = new Date(new Date(cfg.lastCharRequestTime).getTime() + interval * 60000).toLocaleString('zh-CN');
        } else {
            nextReqStatus = '等待首次发送...';
        }

        html += `
            <div class="block-dev-section">
                <div class="block-dev-title">🚫 你拉黑了「${charName}」</div>
                <div class="block-dev-info">
                    <div class="block-dev-row"><span>拉黑时间</span><span>${blockTime}</span></div>
                    <div class="block-dev-row"><span>申请频率</span><span>${interval}分钟</span></div>
                    <div class="block-dev-row"><span>下次申请</span><span>${nextReqStatus}</span></div>
                    <div class="block-dev-row"><span>申请总数</span><span>${cfg.friendRequests.filter(r => r.from === 'char').length}次</span></div>
                    ${cfg.lastCharRequestError ? `<div class="block-dev-row"><span>失败原因</span><span style="color:#dc3545;font-size:11px;word-break:break-all;">${cfg.lastCharRequestError}</span></div>` : ''}
                </div>
                <div style="display:flex;gap:8px;margin-top:12px;">
                    <button onclick="userUnblockCharacter('${characterId}')" style="flex:1;background:#34c759;color:#fff;border:none;border-radius:10px;padding:12px 0;font-size:15px;font-weight:500;cursor:pointer;">
                        解除拉黑
                    </button>
                    <button onclick="blockCheatForceCharAccept('${characterId}')" style="flex:1;background:linear-gradient(135deg,#ff9500,#ff6b00);color:#fff;border:none;border-radius:10px;padding:12px 0;font-size:15px;font-weight:500;cursor:pointer;">
                        🔑 立即触发角色好友申请
                    </button>
                </div>
            </div>`;
    }

    if (cfg.charBlockedUser) {
        const blockTime = cfg.charBlockTime ? new Date(cfg.charBlockTime).toLocaleString('zh-CN') : '未知';
        const interval = getEffectiveBlockRequestInterval(characterId);
        const userPendingReqs = cfg.friendRequests.filter(r => r.from === 'user' && r.status === 'pending');

        html += `
            <div class="block-dev-section">
                <div class="block-dev-title">⛔ 「${charName}」拉黑了你</div>
                <div class="block-dev-info">
                    <div class="block-dev-row"><span>拉黑时间</span><span>${blockTime}</span></div>
                    <div class="block-dev-row"><span>拉黑原因</span><span>${cfg.charBlockReason || '未知'}</span></div>
                    <div class="block-dev-row"><span>你的申请</span><span>${cfg.friendRequests.filter(r => r.from === 'user').length}次</span></div>
                </div>
                <button onclick="blockCheatForceUnblock('${characterId}')" style="width:100%;background:linear-gradient(135deg,#ff9500,#ff6b00);color:#fff;border:none;border-radius:10px;padding:12px 0;font-size:15px;font-weight:500;cursor:pointer;margin-top:12px;">
                    🔑 ${userPendingReqs.length > 0 ? '立即触发角色同意好友申请' : '立即触发角色自动解除拉黑'}
                </button>
            </div>`;
    }

    // 角色单独频率设置
    html += `
        <div class="block-dev-section">
            <div class="block-dev-title">⚙️ 角色好友申请频率</div>
            <div style="font-size:12px;color:#999;margin-bottom:10px;">设置后将覆盖全局设置，设为0则跟随全局（当前全局：${getGlobalBlockRequestInterval()}分钟）</div>
            <div style="display:flex;gap:8px;align-items:center;">
                <input type="number" id="blockCharInterval" class="form-input" value="${cfg.charRequestInterval || 0}" min="0" step="1" style="flex:1;">
                <span style="color:#999;font-size:13px;">分钟</span>
            </div>
            <button onclick="saveBlockCharInterval('${characterId}')" style="width:100%;background:#007bff;color:#fff;border:none;border-radius:10px;padding:10px 0;font-size:14px;cursor:pointer;margin-top:10px;">
                保存频率设置
            </button>
        </div>`;

    // 解除后消息可见性开关
    html += `
        <div class="block-dev-section">
            <div class="block-dev-title">👁️ 解除拉黑后消息可见性</div>
            <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;">
                <div style="font-size:13px;color:#666;">解除后让角色看到被拉黑期间的消息</div>
                <label class="ios-switch">
                    <input type="checkbox" id="blockShowMsgsToggle" ${cfg.showBlockedMsgsAfterUnblock ? 'checked' : ''} onchange="toggleBlockMsgVisibility('${characterId}')">
                    <span class="ios-slider"></span>
                </label>
            </div>
        </div>`;

    // 好友申请历史
    const allReqs = cfg.friendRequests.slice().reverse();
    if (allReqs.length > 0) {
        html += `<div class="block-dev-section">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <div class="block-dev-title" style="margin-bottom:0;">📋 好友申请历史</div>
                <div style="display:flex;gap:8px;">
                    <button onclick="blockDevToggleReqSelect('${characterId}')" id="blockDevReqSelectBtn" style="background:#f0f0f0;color:#333;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">管理</button>
                    <button onclick="blockDevDeleteAllReqs('${characterId}')" style="background:#ff3b30;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;">清空</button>
                </div>
            </div>
            <div id="blockDevReqSelectBar" style="display:none;margin-top:8px;padding:8px;background:#f8f8f8;border-radius:8px;display:none;align-items:center;justify-content:space-between;">
                <label style="font-size:12px;color:#333;display:flex;align-items:center;gap:4px;cursor:pointer;">
                    <input type="checkbox" id="blockDevReqSelectAll" onchange="blockDevToggleSelectAll(this.checked)"> 全选
                </label>
                <span id="blockDevReqSelectedCount" style="font-size:11px;color:#999;">已选 0 项</span>
                <button onclick="blockDevDeleteSelectedReqs('${characterId}')" id="blockDevReqDeleteBtn" style="background:#ff3b30;color:#fff;border:none;border-radius:6px;padding:4px 10px;font-size:12px;cursor:pointer;" disabled>删除选中</button>
            </div>`;
        allReqs.forEach(r => {
            const time = new Date(r.time).toLocaleString('zh-CN');
            const from = r.from === 'char' ? charName : '你';
            const statusMap = { pending: '⏳待处理', accepted: '✅已同意', rejected: '❌已拒绝' };
            html += `
                <div style="padding:10px;background:#f8f8f8;border-radius:8px;margin-top:8px;display:flex;align-items:flex-start;gap:8px;">
                    <input type="checkbox" class="block-dev-req-checkbox" data-req-id="${r.id}" onchange="blockDevUpdateSelectedCount()" style="width:16px;height:16px;margin-top:2px;flex-shrink:0;display:none;">
                    <div style="flex:1;min-width:0;">
                        <div style="display:flex;justify-content:space-between;font-size:12px;color:#999;">
                            <span>${from}发起</span><span>${time}</span>
                        </div>
                        <div style="font-size:13px;color:#333;margin-top:4px;">${escapeHtml(r.content)}</div>
                        <div style="font-size:12px;margin-top:4px;">${statusMap[r.status] || r.status}</div>
                        ${r.rejectReason ? `<div style="font-size:12px;color:#ff3b30;margin-top:2px;">拒绝理由：${escapeHtml(r.rejectReason)}</div>` : ''}
                    </div>
                </div>`;
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

function saveBlockCharInterval(characterId) {
    const input = document.getElementById('blockCharInterval');
    if (!input) return;
    const val = parseFloat(input.value) || 0;
    const cfg = getBlockConfig(characterId);
    cfg.charRequestInterval = val;
    saveBlockConfig(characterId, cfg);
    showToast('频率设置已保存');

    // 重新调度定时器
    if (cfg.userBlockedChar) {
        scheduleCharFriendRequest(characterId);
    }
}

function toggleBlockMsgVisibility(characterId) {
    const toggle = document.getElementById('blockShowMsgsToggle');
    if (!toggle) return;
    const cfg = getBlockConfig(characterId);
    cfg.showBlockedMsgsAfterUnblock = toggle.checked;
    saveBlockConfig(characterId, cfg);
    showToast(toggle.checked ? '解除后角色可看到被拉黑期间的消息' : '解除后角色看不到被拉黑期间的消息');
}

// ========== 金手指功能 ==========

// 用户拉黑角色时 → 立即触发角色发好友申请
async function blockCheatForceCharAccept(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    const charName = character.remark || character.name;

    const confirmed = await iosConfirm(
        `🔑 金手指：立即让「${charName}」给你发一条好友申请？`,
        '立即触发'
    );
    if (!confirmed) return;

    showToast('正在触发角色好友申请...');

    // 直接调用角色发好友申请的逻辑
    if (typeof fireCharFriendRequest === 'function') {
        await fireCharFriendRequest(characterId);
    } else {
        // fallback: 手动创建一条角色好友申请
        const cfg = getBlockConfig(characterId);
        const request = {
            id: 'fr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            from: 'char',
            characterId: characterId,
            content: `我是${charName}，我想和你做朋友，请通过我的好友申请吧~`,
            time: new Date().toISOString(),
            status: 'pending'
        };
        cfg.friendRequests.push(request);
        cfg.lastCharRequestTime = new Date().toISOString();
        saveBlockConfig(characterId, cfg);
        showToast(`「${charName}」已发送好友申请`);
        updateFriendRequestBadge();
    }

    renderBlockDevPanel(characterId);
}

// 角色拉黑用户时 → 立即触发解除拉黑或同意好友申请
async function blockCheatForceUnblock(characterId) {
    const character = chatCharacters.find(c => c.id === characterId);
    if (!character) return;
    const charName = character.remark || character.name;
    const cfg = getBlockConfig(characterId);
    const userPendingReqs = cfg.friendRequests.filter(r => r.from === 'user' && r.status === 'pending');

    if (userPendingReqs.length > 0) {
        // 有待处理的好友申请 → 立即同意
        const confirmed = await iosConfirm(
            `🔑 金手指：立即让「${charName}」同意你的好友申请并解除拉黑？`,
            '立即同意'
        );
        if (!confirmed) return;

        // 同意最新的好友申请
        const latestReq = userPendingReqs[userPendingReqs.length - 1];
        latestReq.status = 'accepted';
        saveBlockConfig(characterId, cfg);

        // 解除拉黑
        charUnblockUser(characterId, `好吧，我原谅你了~`);
        showToast(`「${charName}」已同意你的好友申请`);
    } else {
        // 没有好友申请 → 直接解除拉黑
        const confirmed = await iosConfirm(
            `🔑 金手指：立即让「${charName}」解除对你的拉黑？`,
            '立即解除'
        );
        if (!confirmed) return;

        charUnblockUser(characterId, `我想通了，我们和好吧~`);
        showToast(`「${charName}」已解除对你的拉黑`);
    }

    renderBlockDevPanel(characterId);
}

// ========== 拉黑面板好友申请历史管理 ==========

function blockDevToggleReqSelect(characterId) {
    const checkboxes = document.querySelectorAll('.block-dev-req-checkbox');
    const selectBar = document.getElementById('blockDevReqSelectBar');
    const isVisible = checkboxes.length > 0 && checkboxes[0].style.display !== 'none';

    checkboxes.forEach(cb => {
        cb.style.display = isVisible ? 'none' : 'block';
        cb.checked = false;
    });
    if (selectBar) selectBar.style.display = isVisible ? 'none' : 'flex';
    blockDevUpdateSelectedCount();
}

function blockDevToggleSelectAll(checked) {
    const checkboxes = document.querySelectorAll('.block-dev-req-checkbox');
    checkboxes.forEach(cb => { if (cb.style.display !== 'none') cb.checked = checked; });
    blockDevUpdateSelectedCount();
}

function blockDevUpdateSelectedCount() {
    const checkboxes = document.querySelectorAll('.block-dev-req-checkbox:checked');
    const countEl = document.getElementById('blockDevReqSelectedCount');
    const deleteBtn = document.getElementById('blockDevReqDeleteBtn');
    const allCbs = document.querySelectorAll('.block-dev-req-checkbox');
    const selectAllCb = document.getElementById('blockDevReqSelectAll');
    if (countEl) countEl.textContent = `已选 ${checkboxes.length} 项`;
    if (deleteBtn) deleteBtn.disabled = checkboxes.length === 0;
    if (selectAllCb) {
        const visibleCbs = [...allCbs].filter(cb => cb.style.display !== 'none');
        selectAllCb.checked = visibleCbs.length > 0 && checkboxes.length === visibleCbs.length;
    }
}

async function blockDevDeleteSelectedReqs(characterId) {
    const checkboxes = document.querySelectorAll('.block-dev-req-checkbox:checked');
    if (checkboxes.length === 0) return;

    const confirmed = await iosConfirm(`确定删除选中的 ${checkboxes.length} 条记录？`, '删除确认');
    if (!confirmed) return;

    const idsToDelete = new Set();
    checkboxes.forEach(cb => idsToDelete.add(cb.dataset.reqId));

    const cfg = getBlockConfig(characterId);
    cfg.friendRequests = cfg.friendRequests.filter(r => !idsToDelete.has(r.id));
    saveBlockConfig(characterId, cfg);

    showToast(`已删除 ${idsToDelete.size} 条记录`);
    renderBlockDevPanel(characterId);
    updateFriendRequestBadge();
}

async function blockDevDeleteAllReqs(characterId) {
    const cfg = getBlockConfig(characterId);
    if (cfg.friendRequests.length === 0) {
        showToast('没有可删除的记录');
        return;
    }

    const confirmed = await iosConfirm(`确定清空全部 ${cfg.friendRequests.length} 条好友申请记录？`, '清空确认');
    if (!confirmed) return;

    cfg.friendRequests = [];
    saveBlockConfig(characterId, cfg);

    showToast('已清空所有好友申请记录');
    renderBlockDevPanel(characterId);
    updateFriendRequestBadge();
}

// ========== 解析角色回复中的拉黑标签 ==========

function parseBlockTagsFromMessages(characterId, messages) {
    if (!Array.isArray(messages)) return messages;

    const filtered = [];
    for (const msg of messages) {
        if (typeof msg === 'string' && msg.includes('[block-user:')) {
            const match = msg.match(/\[block-user:(.*?)\]/);
            if (match) {
                charBlockUser(characterId, match[1]);
                // 不把这条标签消息加入显示
                continue;
            }
        }
        filtered.push(msg);
    }
    return filtered;
}

// ========== 初始化拉黑系统 ==========

async function initBlockSystem() {
    if (typeof chatCharacters === 'undefined' || !chatCharacters) return;

    // 先从IndexedDB加载所有角色的拉黑配置到内存缓存
    for (const char of chatCharacters) {
        await loadBlockConfigFromDB(char.id);
    }

    chatCharacters.forEach(char => {
        const cfg = getBlockConfig(char.id);
        if (cfg.userBlockedChar) {
            scheduleCharFriendRequest(char.id);
        }
        if (cfg.charBlockedUser) {
            scheduleCharAutoUnblockCheck(char.id);
        }
    });

    updateFriendRequestBadge();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initBlockSystem();
    }, 2500);
});


// ========== 全局拉黑设置 ==========

function saveGlobalBlockSettings() {
    const input = document.getElementById('globalBlockRequestInterval');
    if (!input) return;
    const val = parseFloat(input.value) || 10;
    saveGlobalBlockRequestInterval(val);
    showToast('全局拉黑设置已保存');
}

function initGlobalBlockSettings() {
    const input = document.getElementById('globalBlockRequestInterval');
    if (input) {
        input.value = getGlobalBlockRequestInterval();
    }
}

// 在openChatSettings时更新拉黑按钮状态
function updateBlockButtonInSettings() {
    if (!currentChatCharacter) return;
    const cfg = getBlockConfig(currentChatCharacter.id);
    const btn = document.getElementById('blockCharBtn');
    if (!btn) return;

    if (cfg.userBlockedChar) {
        btn.textContent = '解除拉黑';
        btn.style.background = '#34c759';
        btn.onclick = () => userUnblockCharacter(currentChatCharacter.id);
    } else {
        btn.textContent = '拉黑此角色';
        btn.style.background = '#1c1c1e';
        btn.onclick = () => userBlockCharacter(currentChatCharacter.id);
    }
}


// ========== 群聊功能 ==========

let selectedGroupMembers = new Set();
let tempGroupData = null;

/**
 * 打开创建群聊界面
 */
function openCreateGroup() {
    selectedGroupMembers.clear();
    tempGroupData = null;
    renderGroupMemberSelectList();
    document.getElementById('createGroupPage').classList.add('active');
}

/**
 * 关闭创建群聊界面
 */
function closeCreateGroup() {
    document.getElementById('createGroupPage').classList.remove('active');
}

/**
 * 渲染成员选择列表
 */
function renderGroupMemberSelectList() {
    const container = document.getElementById('groupMemberSelectList');
    
    // 获取所有非群聊的角色
    const availableCharacters = chatCharacters.filter(c => c.groupType !== 'group');
    
    if (availableCharacters.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 40px;">暂无可用角色，请先创建角色</div>';
        return;
    }
    
    let html = '<div style="margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;">';
    html += '<label style="font-size: 14px; color: #666; cursor: pointer; display: flex; align-items: center; gap: 6px;">';
    html += '<input type="checkbox" onchange="toggleSelectAllGroupMembers(this.checked)"> 全选';
    html += '</label>';
    html += '<span style="font-size: 13px; color: #999;">已选 <span id="selectedGroupMemberCount">0</span> 人</span>';
    html += '</div>';
    
    availableCharacters.forEach(char => {
        const isSelected = selectedGroupMembers.has(char.id);
        const checkedAttr = isSelected ? 'checked' : '';
        
        html += `
            <div style="display: flex; align-items: center; gap: 12px; padding: 12px; background: ${isSelected ? '#f0f8ff' : '#fff'}; border: 2px solid ${isSelected ? '#007aff' : '#e0e0e0'}; border-radius: 12px; margin-bottom: 10px; cursor: pointer;" onclick="toggleGroupMemberSelection('${char.id}')">
                <input type="checkbox" ${checkedAttr} onclick="event.stopPropagation(); toggleGroupMemberSelection('${char.id}')" style="width: 18px; height: 18px;">
                <div style="width: 45px; height: 45px; border-radius: 8px; background: #f0f0f0; overflow: hidden; flex-shrink: 0;">
                    ${char.avatar ? `<img src="${char.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #999;">头像</div>'}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px;">${escapeHtml(char.remark || char.name)}</div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml((char.description || '').substring(0, 30))}${char.description && char.description.length > 30 ? '...' : ''}</div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    updateSelectedGroupMemberCount();
}

/**
 * 切换成员选择
 */
function toggleGroupMemberSelection(charId) {
    if (selectedGroupMembers.has(charId)) {
        selectedGroupMembers.delete(charId);
    } else {
        selectedGroupMembers.add(charId);
    }
    renderGroupMemberSelectList();
}

/**
 * 全选/取消全选
 */
function toggleSelectAllGroupMembers(checked) {
    const availableCharacters = chatCharacters.filter(c => c.groupType !== 'group');
    
    if (checked) {
        availableCharacters.forEach(c => selectedGroupMembers.add(c.id));
    } else {
        selectedGroupMembers.clear();
    }
    
    renderGroupMemberSelectList();
}

/**
 * 更新选中数量
 */
function updateSelectedGroupMemberCount() {
    const countEl = document.getElementById('selectedGroupMemberCount');
    if (countEl) {
        countEl.textContent = selectedGroupMembers.size;
    }
}

/**
 * 进入群聊设置（成员关系）
 */
async function proceedToGroupSettings() {
    if (selectedGroupMembers.size < 2) {
        await iosAlert('请至少选择2个成员', '提示');
        return;
    }
    
    // 渲染成员关系列表
    renderGroupRelationList();
    
    // 填充群主选择下拉框
    const ownerSelect = document.getElementById('groupOwnerSelect');
    ownerSelect.innerHTML = '<option value="">请选择群主</option>';
    
    // 添加"我"作为选项
    ownerSelect.innerHTML += '<option value="user">我（用户）</option>';
    
    // 添加所有成员
    Array.from(selectedGroupMembers).forEach(memberId => {
        const char = chatCharacters.find(c => c.id === memberId);
        if (char) {
            ownerSelect.innerHTML += `<option value="${char.id}">${escapeHtml(char.remark || char.name)}</option>`;
        }
    });
    
    // 默认选择"我"为群主
    ownerSelect.value = 'user';
    
    // 清空群名称和头像
    document.getElementById('groupNameInput').value = '';
    document.getElementById('groupAvatarImage').style.display = 'none';
    document.getElementById('groupAvatarPlaceholder').style.display = 'block';
    
    // 显示群聊设置界面
    document.getElementById('groupRelationPage').classList.add('active');
}

/**
 * 关闭群聊设置界面
 */
function closeGroupRelation() {
    document.getElementById('groupRelationPage').classList.remove('active');
}

/**
 * 渲染成员关系列表
 */
function renderGroupRelationList() {
    const container = document.getElementById('groupRelationList');
    
    let html = '';
    Array.from(selectedGroupMembers).forEach(memberId => {
        const char = chatCharacters.find(c => c.id === memberId);
        if (!char) return;
        
        const isKnown = tempGroupData?.membersWhoKnowUser?.includes(memberId) || false;
        
        html += `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; background: #fff; border: 1px solid #e0e0e0; border-radius: 12px; margin-bottom: 10px;">
                <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                    <div style="width: 40px; height: 40px; border-radius: 8px; background: #f0f0f0; overflow: hidden; flex-shrink: 0;">
                        ${char.avatar ? `<img src="${char.avatar}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #999;">头像</div>'}
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="font-size: 14px; font-weight: 500; color: #333;">${escapeHtml(char.remark || char.name)}</div>
                    </div>
                </div>
                <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; user-select: none;">
                    <input type="checkbox" ${isKnown ? 'checked' : ''} onchange="toggleMemberKnowsUser('${memberId}', this.checked)" style="width: 18px; height: 18px;">
                    <span style="font-size: 13px; color: #666;">认识我</span>
                </label>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * 切换成员是否认识用户
 */
function toggleMemberKnowsUser(memberId, knows) {
    if (!tempGroupData) {
        tempGroupData = {
            membersWhoKnowUser: []
        };
    }
    
    if (!tempGroupData.membersWhoKnowUser) {
        tempGroupData.membersWhoKnowUser = [];
    }
    
    if (knows) {
        if (!tempGroupData.membersWhoKnowUser.includes(memberId)) {
            tempGroupData.membersWhoKnowUser.push(memberId);
        }
    } else {
        tempGroupData.membersWhoKnowUser = tempGroupData.membersWhoKnowUser.filter(id => id !== memberId);
    }
}

/**
 * 处理群头像上传
 */
async function handleGroupAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    try {
        const compressedData = await compressImage(file, {
            maxWidth: 800,
            maxHeight: 800,
            quality: 0.85,
            maxSizeKB: 500
        });
        
        const img = document.getElementById('groupAvatarImage');
        img.src = compressedData;
        img.style.display = 'block';
        document.getElementById('groupAvatarPlaceholder').style.display = 'none';
    } catch (error) {
        console.error('群头像处理失败:', error);
        await iosAlert('图片处理失败，请重试', '错误');
    }
}

/**
 * 完成创建群聊
 */
async function finishCreateGroup() {
    const groupName = document.getElementById('groupNameInput').value.trim();
    const groupAvatarImg = document.getElementById('groupAvatarImage');
    const groupAvatar = groupAvatarImg.style.display !== 'none' ? groupAvatarImg.src : '';
    const ownerId = document.getElementById('groupOwnerSelect').value;
    
    if (!groupName) {
        await iosAlert('请输入群名称', '提示');
        return;
    }
    
    if (!ownerId) {
        await iosAlert('请选择群主', '提示');
        return;
    }
    
    // 创建群聊对象（作为一个特殊的chatCharacter）
    const groupId = 'group_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const groupCharacter = {
        id: groupId,
        groupType: 'group', // 标识这是群聊
        groupName: groupName,
        name: groupName,
        remark: groupName,
        avatar: groupAvatar,
        description: `群聊 · ${selectedGroupMembers.size}人`,
        members: Array.from(selectedGroupMembers), // 成员ID数组
        membersWhoKnowUser: tempGroupData?.membersWhoKnowUser || [],
        owner: ownerId,
        admins: [],
        createTime: new Date().toISOString(),
        lastMessageTime: new Date().toISOString(),
        lastMessage: '',
        unreadCount: 0,
        
        // 复用单聊的设置结构
        settings: {
            userPersona: '',
            userPersonaContent: '',
            apiProvider: localStorage.getItem('apiProvider') || 'hakimi',
            apiKey: localStorage.getItem('apiKey') || '',
            model: localStorage.getItem('model') || '',
            temperature: 0.9,
            maxTokens: 2000,
            systemPrompt: '',
            enableLongTermMemory: false,
            ltmFormat: 'diary',
            shortTermMemory: 10,
            timeAwareness: true,
            
            // 群聊特有设置
            bgActivityEnabled: false,
            bgActivityMode: 'scheduled',
            bgActivityInterval: 60,
            memberActivity: {}
        }
    };
    
    // 初始化成员活跃度（默认0.5）
    selectedGroupMembers.forEach(memberId => {
        groupCharacter.settings.memberActivity[memberId] = 0.5;
    });
    
    // 添加到chatCharacters数组
    chatCharacters.push(groupCharacter);
    await saveChatCharacters();
    
    // 保存到IndexedDB
    await saveChatCharacterToDB(groupCharacter);
    
    // 刷新聊天列表
    renderChatList();
    
    // 关闭所有界面
    closeGroupRelation();
    closeCreateGroup();
    
    await iosAlert(`群聊"${groupName}"创建成功！`, '成功');
    
    // 自动打开群聊
    openChatDetail(groupCharacter);
}


/**
 * 群聊发送消息（在sendMessage之后调用）
 */
async function handleGroupChatMessage(userMessage) {
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        return; // 不是群聊，不处理
    }
    
    const groupData = currentChatCharacter;
    const members = groupData.members || [];
    
    if (members.length === 0) {
        console.warn('群聊没有成员');
        return;
    }
    
    // 获取聊天历史
    const allChats = await getAllChatsFromDB();
    const chatHistory = allChats
        .filter(m => m.characterId === groupData.id)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // 获取所有成员信息
    const allMembers = members.map(memberId => chatCharacters.find(c => c.id === memberId)).filter(Boolean);
    
    // 获取时间信息
    const timeInfo = typeof getCurrentTimeInfo === 'function' ? getCurrentTimeInfo() : null;
    
    // 依次让每个成员回复
    for (const memberId of members) {
        const member = chatCharacters.find(c => c.id === memberId);
        if (!member) continue;
        
        try {
            // 构建该成员的提示词
            const prompt = buildGroupChatPrompt(groupData, member, chatHistory, allMembers, timeInfo);
            
            // 替换长期记忆占位符
            let finalPrompt = prompt;
            if (groupData.membersWhoKnowUser && groupData.membersWhoKnowUser.includes(memberId)) {
                const memories = await getLongTermMemories(memberId);
                const memoryText = memories.map(m => m.content).join('\n');
                finalPrompt = finalPrompt.replace('{longTermMemories}', memoryText || '（暂无记忆）');
            } else {
                finalPrompt = finalPrompt.replace('{longTermMemories}', '');
            }
            
            // 显示输入中状态
            showTypingIndicator(member);
            
            // 调用AI
            const response = await callAIForGroupMember(finalPrompt, groupData, member);
            
            // 隐藏输入中状态
            hideTypingIndicator();
            
            if (!response) {
                console.warn(`成员 ${member.remark} 回复失败`);
                continue;
            }
            
            // 解析回复（JSON数组格式）
            let messages = [];
            try {
                messages = JSON.parse(response);
                if (!Array.isArray(messages)) {
                    messages = [response];
                }
            } catch (e) {
                console.warn('解析回复失败，使用原始文本:', e);
                messages = [response];
            }
            
            // 保存并显示每条消息
            for (const msgContent of messages) {
                const charMsg = {
                    id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 6),
                    characterId: groupData.id,
                    groupMemberId: memberId, // 标记是哪个成员发的
                    content: msgContent,
                    type: 'char',
                    sender: member.remark || member.name,
                    timestamp: new Date().toISOString()
                };
                
                // 处理特殊消息类型（引用、@等）
                await processGroupSpecialMessage(charMsg, groupData);
                
                // 保存到数据库
                await saveMessageToDB(charMsg);
                
                // 显示消息
                appendMessageToChat(charMsg);
                
                // 滚动到底部
                scrollChatToBottom();
                
                // 模拟真实发送延迟
                await sleep(Math.random() * 1500 + 500);
            }
            
        } catch (error) {
            console.error(`成员 ${member.remark} 回复出错:`, error);
            hideTypingIndicator();
        }
    }
    
    // 更新聊天列表
    await updateChatListLastMessage(groupData.id, '群聊消息', new Date().toISOString());
}

/**
 * 调用AI获取群成员回复
 */
async function callAIForGroupMember(prompt, groupData, member) {
    // 使用群聊的API设置
    const settings = groupData.settings || {};
    const apiProvider = settings.apiProvider || localStorage.getItem('apiProvider') || 'hakimi';
    const apiKey = settings.apiKey || localStorage.getItem('apiKey') || '';
    const model = settings.model || localStorage.getItem('model') || '';
    const temperature = settings.temperature || 0.9;
    const maxTokens = settings.maxTokens || 2000;
    
    // 获取API URL
    let apiUrl = '';
    if (apiProvider === 'hakimi') {
        apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
    } else if (apiProvider === 'claude') {
        apiUrl = 'https://api.anthropic.com/v1';
    } else if (apiProvider === 'ds') {
        apiUrl = 'https://api.deepseek.com/v1';
    } else if (apiProvider === 'custom') {
        apiUrl = settings.customApiUrl || '';
    }
    
    if (!apiKey || !model) {
        console.error('API配置不完整');
        return null;
    }
    
    try {
        let response;
        
        if (apiProvider === 'hakimi') {
            // Gemini API
            response = await fetch(`${apiUrl}/models/${model}:generateContent?key=${apiKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ role: 'user', parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: temperature,
                        maxOutputTokens: maxTokens
                    }
                })
            });
            
            const data = await response.json();
            if (data.candidates && data.candidates[0] && data.candidates[0].content) {
                return data.candidates[0].content.parts[0].text;
            }
        } else if (apiProvider === 'claude') {
            // Claude API
            response = await fetch(`${apiUrl}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: maxTokens,
                    temperature: temperature,
                    messages: [{ role: 'user', content: prompt }]
                })
            });
            
            const data = await response.json();
            if (data.content && data.content[0]) {
                return data.content[0].text;
            }
        } else if (apiProvider === 'ds') {
            // DeepSeek API
            response = await fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });
            
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
        } else if (apiProvider === 'custom') {
            // 自定义API（OpenAI格式）
            response = await fetch(`${apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [{ role: 'user', content: prompt }],
                    temperature: temperature,
                    max_tokens: maxTokens
                })
            });
            
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return data.choices[0].message.content;
            }
        }
        
        return null;
    } catch (error) {
        console.error('AI调用失败:', error);
        return null;
    }
}

/**
 * 处理群聊特殊消息（引用、@等）
 */
async function processGroupSpecialMessage(message, groupData) {
    const content = message.content;
    
    // 检测引用 [quote:消息ID]
    const quoteMatch = content.match(/\[quote:([^\]]+)\]/);
    if (quoteMatch) {
        message.quotedMessageId = quoteMatch[1];
        // 查找被引用的消息
        const allChats = await getAllChatsFromDB();
        const quotedMsg = allChats.find(m => m.id === message.quotedMessageId);
        if (quotedMsg) {
            message.quotedSender = quotedMsg.sender || '未知';
            message.quotedContent = quotedMsg.content || '';
        }
        // 移除引用标记
        message.content = content.replace(/\[quote:[^\]]+\]/, '').trim();
    }
    
    // 检测@成员
    const atMatches = content.match(/@([^\s@]+)/g);
    if (atMatches) {
        message.atMembers = atMatches.map(at => at.substring(1));
    }
    
    // 处理其他特殊消息类型（语音、图片等）
    // 这里可以复用单聊的处理逻辑
}

/**
 * 显示输入中状态（群聊版本）
 */
function showTypingIndicator(member) {
    const container = document.getElementById('chatMessagesContainer');
    
    // 移除旧的输入中提示
    const oldTyping = document.getElementById('typingIndicator');
    if (oldTyping) {
        oldTyping.remove();
    }
    
    const typingDiv = document.createElement('div');
    typingDiv.id = 'typingIndicator';
    typingDiv.className = 'chat-message-char';
    typingDiv.innerHTML = `
        <div class="chat-avatar">
            <img class="chat-avatar-img" src="${member.avatar || ''}" alt="${member.remark || member.name}">
        </div>
        <div class="chat-message-content">
            <div class="chat-message-name" style="font-size: 12px; color: #999; margin-bottom: 4px;">${escapeHtml(member.remark || member.name)}</div>
            <div class="chat-message-bubble">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
            </div>
        </div>
    `;
    
    container.appendChild(typingDiv);
    scrollChatToBottom();
}

/**
 * 隐藏输入中状态
 */
function hideTypingIndicator() {
    const typingDiv = document.getElementById('typingIndicator');
    if (typingDiv) {
        typingDiv.remove();
    }
}

/**
 * 延迟函数
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * 获取群聊消息的发送者信息
 * @param {Object} messageObj - 消息对象
 * @returns {Object} {avatar, name, isGroupMessage}
 */
function getGroupMessageSender(messageObj) {
    // 检查是否是群聊消息
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        return { avatar: '', name: '', isGroupMessage: false };
    }
    
    // 如果是用户消息
    if (messageObj.type === 'user') {
        const userAvatarImg = document.getElementById('userAvatarImage');
        const userNameInput = document.getElementById('userNameInput');
        return {
            avatar: (userAvatarImg && userAvatarImg.style.display === 'block') ? userAvatarImg.src : '',
            name: (userNameInput && userNameInput.value.trim()) || '用户',
            isGroupMessage: true
        };
    }
    
    // 如果是成员消息
    if (messageObj.groupMemberId) {
        const member = chatCharacters.find(c => c.id === messageObj.groupMemberId);
        if (member) {
            return {
                avatar: member.avatar || '',
                name: member.remark || member.name || '未知成员',
                isGroupMessage: true
            };
        }
    }
    
    return { avatar: '', name: '', isGroupMessage: false };
}


/**
 * 在聊天设置中添加群聊专属选项
 * 这个函数会在openChatSettings中被调用
 */
function addGroupChatSettingsUI() {
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        return; // 不是群聊，不添加
    }
    
    // 查找设置界面的合适位置（在基本信息之后）
    const settingsCard = document.querySelector('#chatSettings .settings-card');
    if (!settingsCard) return;
    
    // 创建群聊专属设置区域
    const groupSettingsHTML = `
        <div class="section-title" style="margin-top: 30px;">
            <span class="section-title-text">群聊设置</span>
        </div>
        
        <!-- 成员管理 -->
        <div class="form-group">
            <button class="btn-primary" onclick="openGroupMemberManagement()" style="width: 100%;">
                成员管理 (${currentChatCharacter.members?.length || 0}人)
            </button>
        </div>
        
        <!-- 成员关系设置 -->
        <div class="form-group">
            <button class="btn-primary" onclick="openGroupRelationManagement()" style="width: 100%;">
                成员关系设置
            </button>
        </div>
        
        <!-- 后台活动设置 -->
        <div class="section-title" style="margin-top: 30px;">
            <span class="section-title-text">后台活动</span>
        </div>
        
        <div class="form-group">
            <label class="toggle-label">
                <span>启用群后台活动</span>
                <input type="checkbox" id="groupBgActivityToggle" ${currentChatCharacter.settings?.bgActivityEnabled ? 'checked' : ''} onchange="toggleGroupBgActivity(this.checked)">
                <span class="toggle-slider"></span>
            </label>
            <div style="margin-top: 8px; font-size: 12px; color: #666;">
                开启后，群成员会在后台自动互动（需要全局后台活动开启）
            </div>
        </div>
        
        <div class="form-group" id="groupBgActivitySettings" style="display: ${currentChatCharacter.settings?.bgActivityEnabled ? 'block' : 'none'};">
            <label class="form-label">后台活动间隔（分钟）</label>
            <input type="number" class="form-input" id="groupBgActivityInterval" value="${currentChatCharacter.settings?.bgActivityInterval || 60}" min="10" max="1440">
            <div style="margin-top: 8px; font-size: 12px; color: #666;">
                每隔多久触发一次后台互动（10-1440分钟）
            </div>
        </div>
        
        <div class="form-group" id="groupMemberActivitySettings" style="display: ${currentChatCharacter.settings?.bgActivityEnabled ? 'block' : 'none'};">
            <button class="btn-primary" onclick="openMemberActivitySettings()" style="width: 100%;">
                成员活跃度设置
            </button>
        </div>
    `;
    
    // 插入到设置卡片的末尾
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = groupSettingsHTML;
    settingsCard.appendChild(tempDiv);
}

/**
 * 切换群后台活动
 */
function toggleGroupBgActivity(enabled) {
    const settingsDiv = document.getElementById('groupBgActivitySettings');
    const activityDiv = document.getElementById('groupMemberActivitySettings');
    
    if (settingsDiv) {
        settingsDiv.style.display = enabled ? 'block' : 'none';
    }
    if (activityDiv) {
        activityDiv.style.display = enabled ? 'block' : 'none';
    }
    
    // 保存设置
    if (currentChatCharacter && currentChatCharacter.settings) {
        currentChatCharacter.settings.bgActivityEnabled = enabled;
    }
}

/**
 * 打开成员管理界面
 */
function openGroupMemberManagement() {
    // TODO: 实现成员管理界面
    iosAlert('成员管理功能开发中...', '提示');
}

/**
 * 打开成员关系管理界面
 */
function openGroupRelationManagement() {
    // TODO: 实现成员关系管理界面
    iosAlert('成员关系管理功能开发中...', '提示');
}

/**
 * 打开成员活跃度设置界面
 */
function openMemberActivitySettings() {
    // TODO: 实现成员活跃度设置界面
    iosAlert('成员活跃度设置功能开发中...', '提示');
}
