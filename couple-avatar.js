// ========== 情侣头像库功能 ==========

// 数据结构：
// {
//   id: 'uuid',
//   characterId: 'character_id', // 关联的角色ID
//   coupleName: '两只小白兔',
//   userAvatar: 'data:image/...',
//   characterAvatar: 'data:image/...',
//   description: '两只可爱的白兔，风格一致',
//   createdAt: timestamp,
//   source: 'recognized' // 或 'manual'
//   order: 0 // 排序顺序
// }

// 获取情侣头像库（按角色过滤）
async function getCoupleAvatarLibrary(characterId = null) {
    try {
        const data = await storageDB.getItem('coupleAvatarLibrary');
        const library = data || [];
        
        // 如果指定了角色ID，只返回该角色的情头
        if (characterId) {
            return library.filter(couple => couple.characterId === characterId);
        }
        
        return library;
    } catch (e) {
        console.error('获取情侣头像库失败:', e);
        return [];
    }
}

// 保存情侣头像库
async function saveCoupleAvatarLibrary(library) {
    try {
        await storageDB.setItem('coupleAvatarLibrary', library);
    } catch (e) {
        console.error('保存情侣头像库失败:', e);
    }
}

// 获取情头模式状态
function getCoupleMode() {
    return localStorage.getItem('coupleMode') === 'true';
}

// 设置情头模式状态
function setCoupleMode(enabled) {
    localStorage.setItem('coupleMode', enabled ? 'true' : 'false');
}

// 获取当前使用的情头ID
function getCurrentCoupleId() {
    return localStorage.getItem('currentCoupleId');
}

// 设置当前使用的情头ID
function setCurrentCoupleId(id) {
    if (id) {
        localStorage.setItem('currentCoupleId', id);
    } else {
        localStorage.removeItem('currentCoupleId');
    }
}

// 打开情侣头像库管理界面
async function openCoupleAvatarLibrary() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10002';
    overlay.id = 'coupleAvatarLibraryOverlay';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'width:85%;max-width:360px;max-height:70vh;background:#fff;border-radius:16px;display:flex;flex-direction:column;overflow:hidden;';
    
    // 头部
    const header = document.createElement('div');
    header.style.cssText = 'padding:16px;border-bottom:1px solid #e0e0e0;flex-shrink:0;';
    header.innerHTML = `
        <div style="font-size:17px;font-weight:600;color:#333;margin-bottom:4px;">情侣头像库</div>
        <div style="font-size:12px;color:#999;">管理你和角色的情侣头像</div>
    `;
    
    // 内容区域
    const content = document.createElement('div');
    content.style.cssText = 'flex:1;overflow-y:auto;padding:12px 16px;';
    content.id = 'coupleAvatarLibraryContent';
    
    // 按钮区域
    const footer = document.createElement('div');
    footer.style.cssText = 'padding:12px 16px;border-top:1px solid #e0e0e0;flex-shrink:0;display:flex;gap:8px;';
    
    const recognizeBtn = document.createElement('button');
    recognizeBtn.style.cssText = 'flex:1;padding:10px;background:#f5f5f5;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;';
    recognizeBtn.textContent = '识别';
    recognizeBtn.onclick = () => recognizeCurrentAvatars();
    
    const addBtn = document.createElement('button');
    addBtn.style.cssText = 'flex:1;padding:10px;background:#f5f5f5;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;';
    addBtn.textContent = '添加';
    addBtn.onclick = () => manualAddCoupleAvatar();
    
    const closeBtn = document.createElement('button');
    closeBtn.style.cssText = 'flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;';
    closeBtn.textContent = '关闭';
    closeBtn.onclick = () => closeCoupleAvatarLibrary(overlay);
    
    footer.appendChild(recognizeBtn);
    footer.appendChild(addBtn);
    footer.appendChild(closeBtn);
    
    modal.appendChild(header);
    modal.appendChild(content);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 渲染列表
    await renderCoupleAvatarList();
    
    setTimeout(() => overlay.classList.add('show'), 10);
}

// 渲染情侣头像列表
async function renderCoupleAvatarList() {
    const content = document.getElementById('coupleAvatarLibraryContent');
    if (!content) return;
    
    if (!currentChatCharacter) {
        content.innerHTML = '<div style="text-align:center;padding:30px 16px;color:#999;font-size:13px;">请先打开一个聊天</div>';
        return;
    }
    
    // 只获取当前角色的情头
    const library = await getCoupleAvatarLibrary(currentChatCharacter.id);
    
    if (library.length === 0) {
        content.innerHTML = '<div style="text-align:center;padding:30px 16px;color:#999;font-size:13px;">暂无情侣头像<br/>点击下方按钮添加</div>';
        return;
    }
    
    // 按order排序
    library.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const grid = document.createElement('div');
    grid.style.cssText = 'display:flex;flex-direction:column;gap:10px;';
    
    library.forEach((couple, index) => {
        const item = document.createElement('div');
        item.style.cssText = 'background:#f8f8f8;border-radius:10px;padding:10px;';
        
        item.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:${couple.description ? '8px' : '0'};">
                <img src="${couple.userAvatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:600;color:#333;margin-bottom:${couple.description ? '4px' : '0'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(couple.coupleName)}</div>
                    ${couple.description ? `<div style="font-size:11px;color:#999;line-height:1.3;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;">${escapeHtml(couple.description)}</div>` : ''}
                </div>
                <img src="${couple.characterAvatar}" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,0.1);flex-shrink:0;">
            </div>
            <div style="display:flex;gap:6px;">
                <button onclick="applyCoupleAvatar('${couple.id}')" style="flex:1;padding:6px;background:#fff;color:#333;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;cursor:pointer;">应用</button>
                <button onclick="editCoupleAvatar('${couple.id}')" style="flex:1;padding:6px;background:#fff;color:#333;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;cursor:pointer;">编辑</button>
                <button onclick="deleteCoupleAvatar('${couple.id}')" style="flex:1;padding:6px;background:#fff;color:#ff3b30;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;cursor:pointer;">删除</button>
            </div>
        `;
        
        grid.appendChild(item);
    });
    
    content.innerHTML = '';
    content.appendChild(grid);
}

// 识别当前头像
async function recognizeCurrentAvatars() {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    // 获取当前用户头像
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatar = userAvatarImg && userAvatarImg.style.display === 'block' ? userAvatarImg.src : null;
    
    // 获取当前角色头像
    const charAvatar = currentChatCharacter.avatar;
    
    if (!userAvatar || !charAvatar) {
        showIosAlert('提示', '请先设置用户和角色的头像');
        return;
    }
    
    showToast('正在识别头像...');
    
    // 调用AI识别
    try {
        const result = await callAIToRecognizeCouple(userAvatar, charAvatar);
        showRecognitionResult(result, userAvatar, charAvatar);
    } catch (error) {
        console.error('识别失败:', error);
        showIosAlert('识别失败', '请稍后重试');
    }
}

// 调用AI识别情侣头像
async function callAIToRecognizeCouple(userAvatar, charAvatar) {
    // 获取API设置
    const settings = await storageDB.getItem('apiSettings');
    if (!settings || !settings.apiUrl || !settings.apiKey || !settings.model) {
        throw new Error('请先在设置中配置API');
    }
    
    // 构建识别prompt - 只描述图片，不判断是否为情头
    const prompt = `请分别描述这两张头像图片的内容和特征。

请以JSON格式回复（只返回JSON，不要其他内容）：
{
  "name": "为这对头像起一个简短的名称（如：两只小白兔）",
  "description": "详细描述这两张图片的内容、风格、元素、色调等特征"
}`;

    // 构建消息数组
    const messages = [
        {
            role: 'user',
            content: prompt,
            _hasImage: true,
            _imageData: [userAvatar, charAvatar]
        }
    ];
    
    // 调用API
    try {
        let response;
        
        if (settings.provider === 'hakimi') {
            // Gemini API - 支持多图片
            const parts = [{ text: prompt }];
            
            // 添加两张图片
            for (const imageData of [userAvatar, charAvatar]) {
                const base64Match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
                if (base64Match) {
                    parts.push({
                        inlineData: {
                            mimeType: base64Match[1],
                            data: base64Match[2]
                        }
                    });
                }
            }
            
            response = await fetch(`${settings.apiUrl}/models/${settings.model}:generateContent?key=${settings.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        role: 'user',
                        parts: parts
                    }],
                    generationConfig: {
                        temperature: 1.0,
                        maxOutputTokens: 2048
                    }
                })
            });
        } else if (settings.provider === 'claude') {
            // Claude API - 支持多图片
            const content = [{ type: 'text', text: prompt }];
            
            // 添加两张图片
            for (const imageData of [userAvatar, charAvatar]) {
                const base64Match = imageData.match(/^data:(image\/\w+);base64,(.+)$/);
                if (base64Match) {
                    content.push({
                        type: 'image',
                        source: {
                            type: 'base64',
                            media_type: base64Match[1],
                            data: base64Match[2]
                        }
                    });
                }
            }
            
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
                    messages: [{
                        role: 'user',
                        content: content
                    }]
                })
            });
        } else {
            // OpenAI API - 支持多图片
            const content = [{ type: 'text', text: prompt }];
            
            // 添加两张图片
            for (const imageData of [userAvatar, charAvatar]) {
                content.push({
                    type: 'image_url',
                    image_url: {
                        url: imageData
                    }
                });
            }
            
            response = await fetch(`${settings.apiUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${settings.apiKey}`
                },
                body: JSON.stringify({
                    model: settings.model,
                    messages: [{
                        role: 'user',
                        content: content
                    }],
                    temperature: 1.0,
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
        
        // 解析JSON响应
        try {
            let jsonStr = aiResponse.trim();
            // 移除可能的markdown代码块标记和其他干扰字符
            jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/, '').trim();
            const result = JSON.parse(jsonStr);
            
            return {
                name: result.name || '情侣头像',
                description: result.description || '风格统一的头像'
            };
        } catch (parseError) {
            console.error('JSON解析失败，原始响应:', aiResponse);
            // 返回默认值
            return {
                name: '情侣头像',
                description: aiResponse.substring(0, 200)
            };
        }
    } catch (error) {
        console.error('API调用错误:', error);
        throw error;
    }
}

// 显示识别结果确认窗口
function showRecognitionResult(result, userAvatar, charAvatar) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'width:85%;max-width:340px;background:#fff;border-radius:16px;overflow:hidden;';
    
    dialog.innerHTML = `
        <div style="padding:16px;border-bottom:1px solid #e0e0e0;">
            <div style="font-size:17px;font-weight:600;color:#333;margin-bottom:4px;">识别结果</div>
            <div style="font-size:12px;color:#999;">AI已识别头像内容</div>
        </div>
        <div style="padding:16px;">
            <div style="display:flex;justify-content:center;gap:16px;margin-bottom:12px;">
                <img src="${userAvatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;box-shadow:0 1px 6px rgba(0,0,0,0.1);">
                <img src="${charAvatar}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;box-shadow:0 1px 6px rgba(0,0,0,0.1);">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">情头名称</label>
                <input type="text" id="coupleNameInput" value="${escapeHtml(result.name)}" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">描述</label>
                <textarea id="coupleDescInput" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;min-height:60px;">${escapeHtml(result.description)}</textarea>
            </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid #e0e0e0;display:flex;gap:8px;">
            <button id="cancelRecognitionBtn" style="flex:1;padding:10px;background:#f5f5f5;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">取消</button>
            <button id="confirmRecognitionBtn" style="flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">添加</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // 绑定事件
    document.getElementById('cancelRecognitionBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
    };
    
    document.getElementById('confirmRecognitionBtn').onclick = async () => {
        const name = document.getElementById('coupleNameInput').value.trim();
        const description = document.getElementById('coupleDescInput').value.trim();
        
        if (!name) {
            showIosAlert('提示', '请输入情头名称');
            return;
        }
        
        // 添加到情头库
        await addCoupleToLibrary(name, description, userAvatar, charAvatar, 'recognized');
        
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        
        showToast('已添加到情头库');
        await renderCoupleAvatarList();
    };
}

// 添加情头到库
async function addCoupleToLibrary(name, description, userAvatar, charAvatar, source) {
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    // 获取所有情头库数据
    const allLibrary = await getCoupleAvatarLibrary();
    
    // 获取当前角色的情头
    const characterLibrary = allLibrary.filter(c => c.characterId === currentChatCharacter.id);
    
    // 检查当前角色是否有重名情头
    const exists = characterLibrary.find(c => c.coupleName === name);
    if (exists) {
        const confirmed = await iosConfirm('已存在同名情头，是否覆盖？', '确认');
        if (!confirmed) return;
        
        // 删除旧的
        const index = allLibrary.findIndex(c => c.id === exists.id);
        if (index !== -1) {
            allLibrary.splice(index, 1);
        }
    }
    
    const couple = {
        id: 'couple_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        characterId: currentChatCharacter.id, // 关联角色ID
        coupleName: name,
        userAvatar: userAvatar,
        characterAvatar: charAvatar,
        description: description,
        createdAt: Date.now(),
        source: source,
        order: characterLibrary.length
    };
    
    allLibrary.push(couple);
    await saveCoupleAvatarLibrary(allLibrary);
}

// 手动添加情头
async function manualAddCoupleAvatar() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'width:85%;max-width:340px;background:#fff;border-radius:16px;overflow:hidden;max-height:70vh;display:flex;flex-direction:column;';
    
    dialog.innerHTML = `
        <div style="padding:16px;border-bottom:1px solid #e0e0e0;flex-shrink:0;">
            <div style="font-size:17px;font-weight:600;color:#333;margin-bottom:4px;">手动添加情头</div>
            <div style="font-size:12px;color:#999;">上传一对情侣头像</div>
        </div>
        <div style="padding:16px;overflow-y:auto;flex:1;">
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">用户头像</label>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div id="userAvatarPreview" style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;overflow:hidden;flex-shrink:0;position:relative;">
                        <img id="userAvatarPreviewImg" style="width:100%;height:100%;object-fit:cover;display:none;">
                        <div id="userAvatarPreviewPlaceholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999;">未选择</div>
                    </div>
                    <button onclick="selectUserAvatarForCouple('local')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">本地上传</button>
                    <button onclick="selectUserAvatarForCouple('url')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">URL上传</button>
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">角色头像</label>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div id="charAvatarPreview" style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;overflow:hidden;flex-shrink:0;position:relative;">
                        <img id="charAvatarPreviewImg" style="width:100%;height:100%;object-fit:cover;display:none;">
                        <div id="charAvatarPreviewPlaceholder" style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999;">未选择</div>
                    </div>
                    <button onclick="selectCharAvatarForCouple('local')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">本地上传</button>
                    <button onclick="selectCharAvatarForCouple('url')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">URL上传</button>
                </div>
            </div>
            
            <!-- 识别按钮 -->
            <div style="margin-bottom:12px;">
                <button id="recognizeUploadedBtn" style="width:100%;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;display:none;">识别上传的头像</button>
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">情头名称</label>
                <input type="text" id="manualCoupleName" placeholder="例如：两只小白兔" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">描述（可选）</label>
                <textarea id="manualCoupleDesc" placeholder="描述这对情头的特征" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;min-height:50px;"></textarea>
            </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid #e0e0e0;display:flex;gap:8px;flex-shrink:0;">
            <button id="cancelManualBtn" style="flex:1;padding:10px;background:#f5f5f5;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">取消</button>
            <button id="confirmManualBtn" style="flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">添加</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // 临时存储选择的头像
    window.tempCoupleUserAvatar = null;
    window.tempCoupleCharAvatar = null;
    
    // 检查是否两张头像都已上传，显示识别按钮
    function checkBothAvatarsUploaded() {
        const recognizeBtn = document.getElementById('recognizeUploadedBtn');
        if (window.tempCoupleUserAvatar && window.tempCoupleCharAvatar) {
            recognizeBtn.style.display = 'block';
        } else {
            recognizeBtn.style.display = 'none';
        }
    }
    
    // 存储检查函数供外部调用
    window.checkCoupleAvatarsUploaded = checkBothAvatarsUploaded;
    
    // 识别按钮点击事件
    document.getElementById('recognizeUploadedBtn').onclick = async () => {
        if (!window.tempCoupleUserAvatar || !window.tempCoupleCharAvatar) {
            showIosAlert('提示', '请先上传两张头像');
            return;
        }
        
        showToast('正在识别头像...');
        
        try {
            const result = await callAIToRecognizeCouple(window.tempCoupleUserAvatar, window.tempCoupleCharAvatar);
            
            // 填充识别结果
            document.getElementById('manualCoupleName').value = result.name || '';
            document.getElementById('manualCoupleDesc').value = result.description || '';
            
            showToast('识别完成');
        } catch (error) {
            console.error('识别失败:', error);
            showIosAlert('识别失败', '请稍后重试');
        }
    };
    
    // 绑定事件
    document.getElementById('cancelManualBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        window.checkCoupleAvatarsUploaded = null;
    };
    
    document.getElementById('confirmManualBtn').onclick = async () => {
        const name = document.getElementById('manualCoupleName').value.trim();
        const description = document.getElementById('manualCoupleDesc').value.trim();
        
        if (!name) {
            showIosAlert('提示', '请输入情头名称');
            return;
        }
        
        if (!window.tempCoupleUserAvatar || !window.tempCoupleCharAvatar) {
            showIosAlert('提示', '请选择用户和角色的头像');
            return;
        }
        
        await addCoupleToLibrary(name, description, window.tempCoupleUserAvatar, window.tempCoupleCharAvatar, 'manual');
        
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        
        window.checkCoupleAvatarsUploaded = null;
        showToast('已添加到情头库');
        await renderCoupleAvatarList();
    };
}

// 选择用户头像（用于手动添加情头）
function selectUserAvatarForCouple(type) {
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.getElementById('userAvatarPreviewImg');
                const placeholder = document.getElementById('userAvatarPreviewPlaceholder');
                
                img.src = event.target.result;
                img.style.display = 'block';
                placeholder.style.display = 'none';
                
                window.tempCoupleUserAvatar = event.target.result;
                
                // 检查是否显示识别按钮
                if (window.checkCoupleAvatarsUploaded) {
                    window.checkCoupleAvatarsUploaded();
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            // 验证URL格式
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const img = document.getElementById('userAvatarPreviewImg');
            const placeholder = document.getElementById('userAvatarPreviewPlaceholder');
            
            img.src = url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            img.onerror = function() {
                showIosAlert('错误', '图片加载失败，请检查URL是否正确');
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            
            window.tempCoupleUserAvatar = url;
            
            // 检查是否显示识别按钮
            if (window.checkCoupleAvatarsUploaded) {
                window.checkCoupleAvatarsUploaded();
            }
        });
    }
}

// 选择角色头像（用于手动添加情头）
function selectCharAvatarForCouple(type) {
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.getElementById('charAvatarPreviewImg');
                const placeholder = document.getElementById('charAvatarPreviewPlaceholder');
                
                img.src = event.target.result;
                img.style.display = 'block';
                placeholder.style.display = 'none';
                
                window.tempCoupleCharAvatar = event.target.result;
                
                // 检查是否显示识别按钮
                if (window.checkCoupleAvatarsUploaded) {
                    window.checkCoupleAvatarsUploaded();
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            // 验证URL格式
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const img = document.getElementById('charAvatarPreviewImg');
            const placeholder = document.getElementById('charAvatarPreviewPlaceholder');
            
            img.src = url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            img.onerror = function() {
                showIosAlert('错误', '图片加载失败，请检查URL是否正确');
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            
            window.tempCoupleCharAvatar = url;
            
            // 检查是否显示识别按钮
            if (window.checkCoupleAvatarsUploaded) {
                window.checkCoupleAvatarsUploaded();
            }
        });
    }
}

// 选择用户头像（用于编辑情头）
function selectEditUserAvatar(type) {
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.getElementById('editUserAvatarPreviewImg');
                if (img) {
                    img.src = event.target.result;
                    window.tempEditUserAvatar = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            // 验证URL格式
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const img = document.getElementById('editUserAvatarPreviewImg');
            if (img) {
                img.src = url;
                img.onerror = function() {
                    showIosAlert('错误', '图片加载失败，请检查URL是否正确');
                };
                window.tempEditUserAvatar = url;
            }
        });
    }
}

// 选择角色头像（用于编辑情头）
function selectEditCharAvatar(type) {
    if (type === 'local') {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = document.getElementById('editCharAvatarPreviewImg');
                if (img) {
                    img.src = event.target.result;
                    window.tempEditCharAvatar = event.target.result;
                }
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            // 验证URL格式
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const img = document.getElementById('editCharAvatarPreviewImg');
            if (img) {
                img.src = url;
                img.onerror = function() {
                    showIosAlert('错误', '图片加载失败，请检查URL是否正确');
                };
                window.tempEditCharAvatar = url;
            }
        });
    }
}

// 选择情头角色头像
function selectCoupleCharAvatar(type) {
    if (type === 'url') {
        iosPrompt('输入图片URL', '', (url) => {
            if (!url || !url.trim()) return;
            
            url = url.trim();
            
            // 验证URL格式
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                showIosAlert('提示', '请输入有效的图片URL');
                return;
            }
            
            const img = document.getElementById('charAvatarPreviewImg');
            const placeholder = document.getElementById('charAvatarPreviewPlaceholder');
            
            img.src = url;
            img.style.display = 'block';
            placeholder.style.display = 'none';
            
            img.onerror = function() {
                showIosAlert('错误', '图片加载失败，请检查URL是否正确');
                img.style.display = 'none';
                placeholder.style.display = 'flex';
            };
            
            window.tempCoupleCharAvatar = url;
            
            // 检查是否显示识别按钮
            if (window.checkCoupleAvatarsUploaded) {
                window.checkCoupleAvatarsUploaded();
            }
        });
    }
}

// 应用情头
async function applyCoupleAvatar(coupleId) {
    // 获取所有情头库数据
    const allLibrary = await getCoupleAvatarLibrary();
    const couple = allLibrary.find(c => c.id === coupleId);
    
    if (!couple) return;
    
    if (!currentChatCharacter) {
        showIosAlert('提示', '请先打开一个聊天');
        return;
    }
    
    // 应用用户头像
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    if (userAvatarImg && userAvatarPlaceholder) {
        userAvatarImg.src = couple.userAvatar;
        userAvatarImg.style.display = 'block';
        userAvatarPlaceholder.style.display = 'none';
        localStorage.setItem('userAvatar', couple.userAvatar);
    }
    
    // 应用角色头像
    currentChatCharacter.avatar = couple.characterAvatar;
    await saveChatCharacterToDB(currentChatCharacter);
    
    // 更新聊天界面的角色头像
    const chatAvatars = document.querySelectorAll('.chat-message-char .chat-avatar-img');
    chatAvatars.forEach(img => {
        img.src = couple.characterAvatar;
    });
    
    // 设置当前情头
    setCurrentCoupleId(coupleId);
    
    showToast(`已应用情头：${couple.coupleName}`);
}

// 编辑情头
async function editCoupleAvatar(coupleId) {
    // 获取所有情头库数据
    const allLibrary = await getCoupleAvatarLibrary();
    const couple = allLibrary.find(c => c.id === coupleId);
    
    if (!couple) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10003';
    
    const dialog = document.createElement('div');
    dialog.style.cssText = 'width:85%;max-width:340px;background:#fff;border-radius:16px;overflow:hidden;max-height:70vh;display:flex;flex-direction:column;';
    
    dialog.innerHTML = `
        <div style="padding:16px;border-bottom:1px solid #e0e0e0;flex-shrink:0;">
            <div style="font-size:17px;font-weight:600;color:#333;margin-bottom:4px;">编辑情头</div>
            <div style="font-size:12px;color:#999;">修改头像、名称或描述</div>
        </div>
        <div style="padding:16px;overflow-y:auto;flex:1;">
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">用户头像</label>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div id="editUserAvatarPreview" style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;overflow:hidden;flex-shrink:0;position:relative;">
                        <img id="editUserAvatarPreviewImg" src="${couple.userAvatar}" style="width:100%;height:100%;object-fit:cover;display:block;">
                    </div>
                    <button onclick="selectEditUserAvatar('local')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">本地上传</button>
                    <button onclick="selectEditUserAvatar('url')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">URL上传</button>
                </div>
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">角色头像</label>
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                    <div id="editCharAvatarPreview" style="width:50px;height:50px;border-radius:50%;background:#f0f0f0;overflow:hidden;flex-shrink:0;position:relative;">
                        <img id="editCharAvatarPreviewImg" src="${couple.characterAvatar}" style="width:100%;height:100%;object-fit:cover;display:block;">
                    </div>
                    <button onclick="selectEditCharAvatar('local')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">本地上传</button>
                    <button onclick="selectEditCharAvatar('url')" style="flex:1;padding:7px 12px;background:#f5f5f5;color:#333;border:none;border-radius:6px;font-size:12px;cursor:pointer;">URL上传</button>
                </div>
            </div>
            
            <!-- 识别按钮 -->
            <div style="margin-bottom:12px;">
                <button id="recognizeEditedBtn" style="width:100%;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">重新识别头像</button>
            </div>
            
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">情头名称</label>
                <input type="text" id="editCoupleName" value="${escapeHtml(couple.coupleName)}" placeholder="例如：两只小白兔" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:12px;">
                <label style="font-size:12px;color:#999;display:block;margin-bottom:6px;">描述（可选）</label>
                <textarea id="editCoupleDesc" placeholder="描述这对情头的特征" style="width:100%;padding:8px;border:1.5px solid #e0e0e0;border-radius:8px;font-size:13px;box-sizing:border-box;resize:vertical;min-height:50px;">${escapeHtml(couple.description || '')}</textarea>
            </div>
        </div>
        <div style="padding:12px 16px;border-top:1px solid #e0e0e0;display:flex;gap:8px;flex-shrink:0;">
            <button id="cancelEditBtn" style="flex:1;padding:10px;background:#f5f5f5;color:#333;border:none;border-radius:8px;font-size:13px;cursor:pointer;">取消</button>
            <button id="confirmEditBtn" style="flex:1;padding:10px;background:#333;color:#fff;border:none;border-radius:8px;font-size:13px;cursor:pointer;">保存</button>
        </div>
    `;
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('show'), 10);
    
    // 临时存储编辑的头像（初始化为原头像）
    window.tempEditUserAvatar = couple.userAvatar;
    window.tempEditCharAvatar = couple.characterAvatar;
    
    // 识别按钮点击事件
    document.getElementById('recognizeEditedBtn').onclick = async () => {
        if (!window.tempEditUserAvatar || !window.tempEditCharAvatar) {
            showIosAlert('提示', '请先上传两张头像');
            return;
        }
        
        showToast('正在识别头像...');
        
        try {
            const result = await callAIToRecognizeCouple(window.tempEditUserAvatar, window.tempEditCharAvatar);
            
            // 填充识别结果
            document.getElementById('editCoupleName').value = result.name || '';
            document.getElementById('editCoupleDesc').value = result.description || '';
            
            showToast('识别完成');
        } catch (error) {
            console.error('识别失败:', error);
            showIosAlert('识别失败', '请稍后重试');
        }
    };
    
    // 绑定事件
    document.getElementById('cancelEditBtn').onclick = () => {
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        window.tempEditUserAvatar = null;
        window.tempEditCharAvatar = null;
    };
    
    document.getElementById('confirmEditBtn').onclick = async () => {
        const name = document.getElementById('editCoupleName').value.trim();
        const description = document.getElementById('editCoupleDesc').value.trim();
        
        if (!name) {
            showIosAlert('提示', '请输入情头名称');
            return;
        }
        
        if (!window.tempEditUserAvatar || !window.tempEditCharAvatar) {
            showIosAlert('提示', '请选择用户和角色的头像');
            return;
        }
        
        // 更新情头数据
        couple.coupleName = name;
        couple.description = description;
        couple.userAvatar = window.tempEditUserAvatar;
        couple.characterAvatar = window.tempEditCharAvatar;
        
        await saveCoupleAvatarLibrary(allLibrary);
        
        overlay.classList.remove('show');
        setTimeout(() => document.body.removeChild(overlay), 300);
        
        window.tempEditUserAvatar = null;
        window.tempEditCharAvatar = null;
        
        showToast('已保存');
        await renderCoupleAvatarList();
    };
}

// 删除情头
async function deleteCoupleAvatar(coupleId) {
    const confirmed = await iosConfirm('确定要删除这对情头吗？', '确认删除');
    if (!confirmed) return;
    
    // 获取所有情头库数据
    const allLibrary = await getCoupleAvatarLibrary();
    const index = allLibrary.findIndex(c => c.id === coupleId);
    
    if (index === -1) return;
    
    allLibrary.splice(index, 1);
    await saveCoupleAvatarLibrary(allLibrary);
    
    // 如果删除的是当前使用的情头，清除当前情头ID
    if (getCurrentCoupleId() === coupleId) {
        setCurrentCoupleId(null);
    }
    
    showToast('已删除');
    await renderCoupleAvatarList();
}

// 关闭情侣头像库
function closeCoupleAvatarLibrary(overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
        if (overlay.parentNode) {
            document.body.removeChild(overlay);
        }
    }, 300);
}

// AI换情头功能（由AI调用）
async function aiChangeCoupleAvatar(coupleName) {
    if (!getCoupleMode()) {
        console.log('情头模式未开启');
        return;
    }
    
    if (!currentChatCharacter) {
        console.log('当前没有聊天角色');
        return;
    }
    
    // 只在当前角色的情头库中查找
    const library = await getCoupleAvatarLibrary(currentChatCharacter.id);
    
    // 模糊匹配情头名称
    let couple = library.find(c => c.coupleName === coupleName);
    
    if (!couple) {
        // 尝试包含匹配
        couple = library.find(c => 
            c.coupleName.includes(coupleName) || coupleName.includes(c.coupleName)
        );
    }
    
    if (!couple) {
        // 尝试描述匹配
        couple = library.find(c => 
            c.description && c.description.includes(coupleName)
        );
    }
    
    if (!couple) {
        console.log(`未找到匹配的情头：${coupleName}`);
        return;
    }
    
    // 应用用户头像
    const userAvatarImg = document.getElementById('userAvatarImage');
    const userAvatarPlaceholder = document.getElementById('userAvatarPlaceholder');
    if (userAvatarImg && userAvatarPlaceholder) {
        userAvatarImg.src = couple.userAvatar;
        userAvatarImg.style.display = 'block';
        userAvatarPlaceholder.style.display = 'none';
        localStorage.setItem('userAvatar', couple.userAvatar);
    }
    
    // 应用角色头像
    const oldCharAvatar = currentChatCharacter.avatar;
    currentChatCharacter.avatar = couple.characterAvatar;
    await saveChatCharacterToDB(currentChatCharacter);
    
    // 更新聊天界面的角色头像
    const chatAvatars = document.querySelectorAll('.chat-message-char .chat-avatar-img');
    chatAvatars.forEach(img => {
        img.src = couple.characterAvatar;
    });
    
    // 设置当前情头
    setCurrentCoupleId(couple.id);
    
    // 检查是否显示系统卡片
    const showSystemCardBubbles = localStorage.getItem('showSystemCardBubbles') !== 'false';
    
    // 显示情头更换卡片（如果开关开启）
    if (showSystemCardBubbles) {
        await showCoupleAvatarChangeCard(couple);
    }
    
    // 添加系统消息（始终添加到上下文）
    await addCoupleAvatarChangeSystemMessage(couple);
    
    showToast(`已更换为情头：${couple.coupleName}`);
}

// 显示情头更换卡片
async function showCoupleAvatarChangeCard(couple) {
    if (!currentChatCharacter) return;
    
    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[更换情头]',
        type: 'char',
        timestamp: new Date().toISOString(),
        sender: 'char',
        messageType: 'coupleAvatarChange',
        coupleName: couple.coupleName,
        coupleDescription: couple.description || '',
        userAvatar: couple.userAvatar,
        characterAvatar: couple.characterAvatar
    };
    
    // 渲染到聊天界面
    appendCoupleAvatarChangeCard(messageObj);
    
    // 保存到数据库
    await saveMessageToDB(messageObj);
    
    // 更新聊天列表
    await updateChatListLastMessage(currentChatCharacter.id, '[更换情头]', messageObj.timestamp);
    
    // 滚动到底部
    scrollChatToBottom();
}

// 渲染情头更换卡片到聊天界面
function appendCoupleAvatarChangeCard(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    // 获取角色头像
    let avatar = '';
    if (currentChatCharacter && currentChatCharacter.avatar) {
        avatar = currentChatCharacter.avatar;
    }
    
    const time = formatMessageTime(messageObj.timestamp);
    const coupleName = messageObj.coupleName || '';
    const description = messageObj.coupleDescription || '';
    const userAvatar = messageObj.userAvatar || '';
    const charAvatar = messageObj.characterAvatar || '';
    
    const messageEl = document.createElement('div');
    messageEl.className = 'chat-message chat-message-char';
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="chat-couple-avatar-card">
                <div class="chat-couple-avatar-header">
                    <div class="chat-couple-avatar-title">更换情头</div>
                </div>
                <div class="chat-couple-avatar-body">
                    <div class="chat-couple-avatar-images">
                        <img src="${userAvatar}" class="chat-couple-avatar-img">
                        <img src="${charAvatar}" class="chat-couple-avatar-img">
                    </div>
                    <div class="chat-couple-avatar-name">${escapeHtml(coupleName)}</div>
                    ${description ? `<div class="chat-couple-avatar-desc">${escapeHtml(description)}</div>` : ''}
                </div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
}

// 添加情头更换系统消息
async function addCoupleAvatarChangeSystemMessage(couple) {
    if (!currentChatCharacter) return;
    
    // 获取角色真名
    const charName = currentChatCharacter.name || '角色';
    
    // 构建系统消息
    const systemContent = `${charName} 将你们的头像更换为情头：${couple.coupleName}`;
    
    const systemMessageObj = {
        id: Date.now().toString() + Math.random() + '_system',
        characterId: currentChatCharacter.id,
        content: systemContent,
        type: 'system',
        timestamp: new Date().toISOString(),
        sender: 'system',
        messageType: 'systemNotice'
    };
    
    // 渲染到聊天界面
    appendSystemMessageToChat(systemMessageObj);
    
    // 保存到数据库
    await saveMessageToDB(systemMessageObj);
    
    // 滚动到底部
    scrollChatToBottom();
}

// 切换情头模式
function toggleCoupleMode() {
    const toggle = document.getElementById('coupleModeToggle');
    const enabled = toggle.checked;
    
    setCoupleMode(enabled);
    
    if (enabled) {
        showToast('情头模式已开启，角色现在可以看到并更换情头了');
    } else {
        showToast('情头模式已关闭');
    }
}

// 初始化情头模式开关状态
function initCoupleModeToggle() {
    const toggle = document.getElementById('coupleModeToggle');
    if (toggle) {
        toggle.checked = getCoupleMode();
    }
}

// 在页面加载时初始化
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        initCoupleModeToggle();
    });
}