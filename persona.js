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

