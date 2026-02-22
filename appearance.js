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
    
    // 显示/隐藏边框颜色选择区域
    const borderColorSection = document.getElementById('borderColorSection');
    if (borderColorSection) {
        borderColorSection.style.display = isPhoneBorderEnabled ? 'block' : 'none';
    }
    
    // 恢复边框颜色设置
    const savedBorderColor = localStorage.getItem('phoneBorderColor') || '#ffffff';
    const customColorPicker = document.getElementById('customBorderColor');
    if (customColorPicker) {
        customColorPicker.value = savedBorderColor;
    }
    
    // 更新颜色选项的选中状态
    document.querySelectorAll('.color-option').forEach(option => {
        if (option.dataset.color === savedBorderColor) {
            option.classList.add('selected');
        }
    });
    
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
    
    // 加载消息通知弹窗设置
    const notifStackEnabled = localStorage.getItem('notifStackEnabled') === 'true';
    const notifStackToggle = document.getElementById('notifStackToggle');
    if (notifStackToggle) notifStackToggle.checked = notifStackEnabled;
    
    const notifOnlyOtherEnabled = localStorage.getItem('notifOnlyOtherEnabled') !== 'false'; // 默认true
    const notifOnlyOtherToggle = document.getElementById('notifOnlyOtherToggle');
    if (notifOnlyOtherToggle) notifOnlyOtherToggle.checked = notifOnlyOtherEnabled;

    // 渲染主屏幕方案列表
    renderLayoutSchemes();

    // 渲染UI风格列表
    renderUiStyles();
    
    // 初始化触感反馈设置
    if (typeof initHapticFeedbackSettings === 'function') {
        initHapticFeedbackSettings();
    }
    
    // 初始化发送动画设置
    if (typeof initSendAnimationSettings === 'function') {
        initSendAnimationSettings();
    }
    
    // 初始化挂坠设置
    if (typeof initPendantSettings === 'function') {
        initPendantSettings();
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
        'pendant': '挂坠',
        'border': '边框'
    };
    return labels[tabName] || tabName;
}

// ========== 主屏幕方案功能 ==========

// 内置方案定义
const BUILTIN_SCHEMES = [
    { id: 'scheme_1', name: '方案一', available: true },
    { id: 'scheme_2', name: '方案二', available: true },
    { id: 'scheme_3', name: '方案三', available: false },
    { id: 'scheme_4', name: '方案四', available: false },
    { id: 'scheme_5', name: '方案五', available: false }
];

// 获取当前激活的方案ID
function getActiveSchemeId() {
    return localStorage.getItem('activeLayoutScheme') || 'scheme_1';
}

// 渲染方案选择列表
function renderLayoutSchemes() {
    const container = document.getElementById('layoutSchemeList');
    if (!container) return;

    const activeId = getActiveSchemeId();
    let html = '';

    BUILTIN_SCHEMES.forEach(scheme => {
        const isActive = scheme.id === activeId;
        if (scheme.available) {
            html += `
                <div class="layout-scheme-card ${isActive ? 'active' : ''}" onclick="applyLayoutScheme('${scheme.id}')">
                    ${isActive ? '<div class="scheme-badge">✓</div>' : ''}
                    <div class="scheme-preview">
                        <div class="scheme-preview-bar"></div>
                        <div class="scheme-preview-block"></div>
                        <div class="scheme-preview-block" style="height:60%;"></div>
                        <div class="scheme-preview-bar"></div>
                    </div>
                    <div class="scheme-name">${scheme.name}</div>
                </div>`;
        } else {
            html += `
                <div class="layout-scheme-card empty">
                    <div class="scheme-preview" style="opacity: 0.4;">
                        <div class="scheme-preview-bar"></div>
                        <div class="scheme-preview-block"></div>
                        <div class="scheme-preview-block" style="height:60%;"></div>
                        <div class="scheme-preview-bar"></div>
                    </div>
                    <div class="scheme-name" style="color: #aaa;">${scheme.name}</div>
                    <div style="font-size: 9px; color: #bbb;">敬请期待</div>
                </div>`;
        }
    });

    container.innerHTML = html;
}

// 应用方案
async function applyLayoutScheme(schemeId) {
    const scheme = BUILTIN_SCHEMES.find(s => s.id === schemeId);
    if (!scheme || !scheme.available) return;

    const activeId = getActiveSchemeId();
    if (schemeId === activeId) return;

    localStorage.setItem('activeLayoutScheme', schemeId);
    renderLayoutSchemes();
    renderActiveScheme();
}

// 方案一原始HTML（缓存）
let _scheme1Html = null;

// 渲染当前激活的方案到 widgetArea
async function renderActiveScheme() {
    const schemeId = getActiveSchemeId();
    const widgetArea = document.getElementById('widgetArea');
    if (!widgetArea) return;

    if (schemeId === 'scheme_1') {
        if (_scheme1Html) {
            widgetArea.innerHTML = _scheme1Html;
            // 重新加载方案一的数据
            await reloadScheme1Data();
        }
    } else if (schemeId === 'scheme_2') {
        // 先缓存方案一的HTML（如果还没缓存）
        if (!_scheme1Html) {
            _scheme1Html = widgetArea.innerHTML;
        }
        // 确保函数已定义
        if (typeof getScheme2Html === 'function') {
            widgetArea.innerHTML = getScheme2Html();
            await loadScheme2Data();
        } else {
            console.error('getScheme2Html函数未定义，请确保script2.js已正确加载');
        }
    }
}

// 重新加载方案一的数据到DOM
async function reloadScheme1Data() {
    try {
        const savedName = await storageDB.getItem('widgetName');
        if (savedName) document.getElementById('widgetName').textContent = savedName;
        
        const savedId = await storageDB.getItem('widgetId');
        if (savedId) document.getElementById('widgetId').textContent = '@' + savedId;
        
        const savedContent = await storageDB.getItem('widgetContent');
        if (savedContent) document.getElementById('widgetContent').textContent = savedContent;
        
        const savedAvatar = await storageDB.getItem('widgetAvatar');
        if (savedAvatar) {
            const img = document.getElementById('avatarImage');
            const placeholder = document.getElementById('avatarPlaceholder');
            if (img) { img.src = savedAvatar; img.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
        }
        
        const savedLoveDate = await storageDB.getItem('notebookLoveDate');
        if (savedLoveDate) {
            const el = document.getElementById('notebookLoveDate');
            if (el) el.textContent = savedLoveDate;
        }
        
        const savedNbText = await storageDB.getItem('notebookText');
        if (savedNbText) {
            const el = document.getElementById('notebookText');
            if (el) el.textContent = savedNbText;
        }
        
        const savedNbImage = await storageDB.getItem('notebookImage');
        if (savedNbImage) {
            const img = document.getElementById('notebookImage');
            const placeholder = document.getElementById('notebookImagePlaceholder');
            if (img) { img.src = savedNbImage; img.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
        }
        
        const savedMusicAvatar = await storageDB.getItem('musicAvatar');
        if (savedMusicAvatar) {
            const img = document.getElementById('musicAvatarImage');
            const placeholder = document.getElementById('musicAvatarPlaceholder');
            if (img) { img.src = savedMusicAvatar; img.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
        }
        
        const savedMusicUsername = await storageDB.getItem('musicUsername');
        if (savedMusicUsername) {
            const el = document.getElementById('musicUsername');
            if (el) el.textContent = savedMusicUsername;
        }
        
        const savedMusicBirthday = await storageDB.getItem('musicBirthday');
        if (savedMusicBirthday) {
            const el = document.getElementById('musicBirthday');
            if (el) el.textContent = savedMusicBirthday;
        }
        
        const savedMusicCover = await storageDB.getItem('musicCover');
        if (savedMusicCover) {
            const img = document.getElementById('musicCoverImage');
            const placeholder = document.getElementById('musicCoverPlaceholder');
            if (img) { img.src = savedMusicCover; img.style.display = 'block'; }
            if (placeholder) placeholder.style.display = 'none';
        }
        
        // 重新加载APP图标
        await loadAppIcons();
        loadAppNames();
        
        // 更新日期时间
        if (typeof updateNotebookDateTime === 'function') updateNotebookDateTime();
        if (typeof updateMusicDate === 'function') updateMusicDate();
        if (typeof updateWidgetDate === 'function') updateWidgetDate();
    } catch (e) {
        console.error('重新加载方案一数据失败:', e);
    }
}

// ========== 方案二：个人资料卡片 ==========
// 方案二的HTML、数据加载和编辑弹窗函数在 script2.js 中

// 加载APP图标（方案一和方案二共用，由原有loadAppIcons处理）

// ========== UI风格功能 ==========

const BUILTIN_UI_STYLES = [
    { id: 'ui_style_1', name: '风格一', available: true },
    { id: 'ui_style_2', name: '风格二', available: false },
    { id: 'ui_style_3', name: '风格三', available: false }
];

function getActiveUiStyle() {
    return localStorage.getItem('activeUiStyle') || 'ui_style_1';
}

function renderUiStyles() {
    const container = document.getElementById('uiStyleList');
    if (!container) return;

    const activeId = getActiveUiStyle();
    let html = '';

    BUILTIN_UI_STYLES.forEach(style => {
        const isActive = style.id === activeId;
        if (style.available) {
            html += `
                <div class="layout-scheme-card ${isActive ? 'active' : ''}" onclick="applyUiStyle('${style.id}')">
                    ${isActive ? '<div class="scheme-badge">✓</div>' : ''}
                    <div class="scheme-preview">
                        <div class="scheme-preview-bar"></div>
                        <div class="scheme-preview-block"></div>
                        <div class="scheme-preview-block" style="height:60%;"></div>
                        <div class="scheme-preview-bar"></div>
                    </div>
                    <div class="scheme-name">${style.name}</div>
                </div>`;
        } else {
            html += `
                <div class="layout-scheme-card empty">
                    <div class="scheme-preview" style="opacity: 0.4;">
                        <div class="scheme-preview-bar"></div>
                        <div class="scheme-preview-block"></div>
                        <div class="scheme-preview-block" style="height:60%;"></div>
                        <div class="scheme-preview-bar"></div>
                    </div>
                    <div class="scheme-name" style="color: #aaa;">${style.name}</div>
                    <div style="font-size: 9px; color: #bbb;">敬请期待</div>
                </div>`;
        }
    });

    container.innerHTML = html;
}

function applyUiStyle(styleId) {
    const style = BUILTIN_UI_STYLES.find(s => s.id === styleId);
    if (!style || !style.available) return;

    const activeId = getActiveUiStyle();
    if (styleId === activeId) return;

    localStorage.setItem('activeUiStyle', styleId);
    renderUiStyles();
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
        } else if (APP_ICON_DEFAULTS[item.id]) {
            const img = document.createElement('img');
            img.src = APP_ICON_DEFAULTS[item.id];
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
    } else if (APP_ICON_DEFAULTS[iconId]) {
        previewImg.src = APP_ICON_DEFAULTS[iconId];
        previewImg.style.display = 'block';
        previewText.style.display = 'none';
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
        el.style.backgroundImage = "url('" + imageData + "')";
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

// APP图标默认图片映射（未自定义时使用的默认图片）
const APP_ICON_DEFAULTS = {
    'couple': 'https://i.postimg.cc/6QLvsPTm/png-(1).png',
    'worldbook': 'https://i.postimg.cc/hPc46GT5/png-(7).png',
    'wallet': 'https://i.postimg.cc/8z3Spkfj/png-(28).png',
    'chat': 'https://i.postimg.cc/RZ8BSCJ3/png-(52).png',
    'api': 'https://i.postimg.cc/bYC8CRYJ/png-(10).png',
    'appearance': 'https://i.postimg.cc/zDt5tkDH/png-(11).png',
    'data': 'https://i.postimg.cc/fW2Z2vW3/png-(24).png',
    'font': 'https://i.postimg.cc/G37r7j38/png-(50).png'
};

// 加载所有自定义图标
async function loadAppIcons() {
    for (const item of APP_ICON_LIST) {
        try {
            const saved = await getImageFromDB('appIcon-' + item.id);
            if (saved) {
                applyAppIcon(item.id, saved);
            } else if (APP_ICON_DEFAULTS[item.id]) {
                applyAppIcon(item.id, APP_ICON_DEFAULTS[item.id]);
            }
        } catch (err) {
            console.error('加载图标失败:', item.id, err);
        }
    }
}
