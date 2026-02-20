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
