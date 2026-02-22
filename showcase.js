// ========== 第二页照片展示功能 ==========

// 点击照片展示区域，弹出选择菜单
function openShowcasePhotoMenu() {
    showPhotoSourceMenu('设置照片', async (type, value) => {
        if (type === 'url') {
            localStorage.setItem('showcasePhotoURL', value);
            try { await deleteImageFromDB('showcasePhoto'); } catch(e) {}
            displayShowcasePhoto(value);
        } else {
            await saveImageToDB('showcasePhoto', value, 'showcase');
            localStorage.removeItem('showcasePhotoURL');
            displayShowcasePhoto(value);
        }
        showToast('照片已设置');
    }, async () => {
        localStorage.removeItem('showcasePhotoURL');
        try { await deleteImageFromDB('showcasePhoto'); } catch(e) {}
        const img = document.getElementById('photoShowcaseImg');
        if (img) { img.style.display = 'none'; img.removeAttribute('src'); }
        showToast('照片已重置');
    });
}

// 显示照片到展示区域
function displayShowcasePhoto(imageData) {
    const img = document.getElementById('photoShowcaseImg');
    if (img) {
        img.src = imageData;
        img.style.display = 'block';
    }
}

// 页面加载时恢复保存的照片
async function loadShowcasePhoto() {
    try {
        // 顶部展示区
        const url = localStorage.getItem('showcasePhotoURL');
        if (url) {
            displayShowcasePhoto(url);
        } else {
            const imageData = await getImageFromDB('showcasePhoto');
            if (imageData) displayShowcasePhoto(imageData);
        }
        // 左情侣头像
        const coupleLeftUrl = localStorage.getItem('coupleAvatarLeftURL');
        if (coupleLeftUrl) {
            displayCoupleAvatar('left', coupleLeftUrl);
        } else {
            const ld = await getImageFromDB('coupleAvatarLeft');
            if (ld) displayCoupleAvatar('left', ld);
        }
        const coupleRightUrl = localStorage.getItem('coupleAvatarRightURL');
        if (coupleRightUrl) {
            displayCoupleAvatar('right', coupleRightUrl);
        } else {
            const rd = await getImageFromDB('coupleAvatarRight');
            if (rd) displayCoupleAvatar('right', rd);
        }
        // 右票券
        const ticketUrl = localStorage.getItem('ticketPhotoURL');
        if (ticketUrl) {
            displayTicketPhoto(ticketUrl);
        } else {
            const ticketData = await getImageFromDB('ticketPhoto');
            if (ticketData) displayTicketPhoto(ticketData);
        }
        // 票券文字
        const tText = localStorage.getItem('ticketText');
        if (tText !== null) document.getElementById('ticketText').textContent = tText;
        const tFooter = localStorage.getItem('ticketFooter');
        if (tFooter !== null) document.getElementById('ticketFooter').textContent = tFooter;
    } catch (err) {
        console.log('加载展示照片失败:', err);
    }
}

// ========== 左情侣头像组件 ==========
function openCoupleAvatarMenu(side) {
    const label = side === 'left' ? '左头像' : '右头像';
    showPhotoSourceMenu(label, async (type, value) => {
        const urlKey = side === 'left' ? 'coupleAvatarLeftURL' : 'coupleAvatarRightURL';
        const dbKey = side === 'left' ? 'coupleAvatarLeft' : 'coupleAvatarRight';
        if (type === 'url') {
            localStorage.setItem(urlKey, value);
            try { await deleteImageFromDB(dbKey); } catch(e) {}
            displayCoupleAvatar(side, value);
        } else {
            await saveImageToDB(dbKey, value, 'coupleAvatar');
            localStorage.removeItem(urlKey);
            displayCoupleAvatar(side, value);
        }
        showToast(label + '已设置');
    }, async () => {
        const urlKey = side === 'left' ? 'coupleAvatarLeftURL' : 'coupleAvatarRightURL';
        const dbKey = side === 'left' ? 'coupleAvatarLeft' : 'coupleAvatarRight';
        const imgId = side === 'left' ? 'coupleAvatarLeft' : 'coupleAvatarRight';
        localStorage.removeItem(urlKey);
        try { await deleteImageFromDB(dbKey); } catch(e) {}
        const img = document.getElementById(imgId);
        if (img) { img.style.display = 'none'; img.removeAttribute('src'); }
        showToast(label + '已重置');
    });
}

function displayCoupleAvatar(side, src) {
    const id = side === 'left' ? 'coupleAvatarLeft' : 'coupleAvatarRight';
    const img = document.getElementById(id);
    if (img) { img.src = src; img.style.display = 'block'; }
}

// ========== 右票券组件 ==========
function openTicketPhotoMenu() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '票券设置';

    const msgEl = document.createElement('div');
    msgEl.className = 'ios-dialog-message';
    msgEl.textContent = '选择要修改的内容';

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons vertical';

    const photoBtn = document.createElement('button');
    photoBtn.className = 'ios-dialog-button primary';
    photoBtn.textContent = '更换图片';
    photoBtn.onclick = () => { closeM(); openTicketImagePicker(); };

    const textBtn = document.createElement('button');
    textBtn.className = 'ios-dialog-button primary';
    textBtn.textContent = '编辑文字';
    textBtn.onclick = () => { closeM(); editTicketText(); };

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeM();

    buttonsEl.appendChild(photoBtn);
    buttonsEl.appendChild(textBtn);
    buttonsEl.appendChild(cancelBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(msgEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);

    function closeM() {
        overlay.classList.remove('show');
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
    }
}

function openTicketImagePicker() {
    showPhotoSourceMenu('票券图片', async (type, value) => {
        if (type === 'url') {
            localStorage.setItem('ticketPhotoURL', value);
            try { await deleteImageFromDB('ticketPhoto'); } catch(e) {}
            displayTicketPhoto(value);
        } else {
            await saveImageToDB('ticketPhoto', value, 'ticket');
            localStorage.removeItem('ticketPhotoURL');
            displayTicketPhoto(value);
        }
        showToast('票券图片已设置');
    }, async () => {
        localStorage.removeItem('ticketPhotoURL');
        try { await deleteImageFromDB('ticketPhoto'); } catch(e) {}
        const img = document.getElementById('ticketPhotoImg');
        if (img) { img.style.display = 'none'; img.removeAttribute('src'); }
        showToast('票券图片已重置');
    });
}

function displayTicketPhoto(src) {
    const img = document.getElementById('ticketPhotoImg');
    if (img) { img.src = src; img.style.display = 'block'; }
}

function editTicketText() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';

    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '票券文字编辑';

    const inputWrap = document.createElement('div');
    inputWrap.style.cssText = 'padding: 8px 16px 16px; display:flex; flex-direction:column; gap:12px;';

    // 上方文字
    const label1 = document.createElement('div');
    label1.style.cssText = 'font-size:12px; color:#999; margin-bottom:-6px;';
    label1.textContent = '上方文字';
    const input1 = document.createElement('input');
    input1.type = 'text';
    input1.value = document.getElementById('ticketText').textContent || '';
    input1.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;';
    input1.onfocus = () => { input1.style.borderColor = '#007aff'; };
    input1.onblur = () => { input1.style.borderColor = '#e0e0e0'; };

    // 下方文字
    const label2 = document.createElement('div');
    label2.style.cssText = 'font-size:12px; color:#999; margin-bottom:-6px;';
    label2.textContent = '下方文字';
    const input2 = document.createElement('input');
    input2.type = 'text';
    input2.value = document.getElementById('ticketFooter').textContent || '';
    input2.style.cssText = 'width:100%;padding:10px 12px;border:1.5px solid #e0e0e0;border-radius:10px;font-size:14px;outline:none;box-sizing:border-box;';
    input2.onfocus = () => { input2.style.borderColor = '#007aff'; };
    input2.onblur = () => { input2.style.borderColor = '#e0e0e0'; };

    inputWrap.appendChild(label1);
    inputWrap.appendChild(input1);
    inputWrap.appendChild(label2);
    inputWrap.appendChild(input2);

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog(false);

    const okBtn = document.createElement('button');
    okBtn.className = 'ios-dialog-button primary';
    okBtn.textContent = '确定';
    okBtn.onclick = () => closeDialog(true);

    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(okBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(inputWrap);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.classList.add('show');
        input1.focus();
    }, 10);

    function closeDialog(save) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
            if (save) {
                const v1 = input1.value.trim();
                const v2 = input2.value.trim();
                if (v1) {
                    document.getElementById('ticketText').textContent = v1;
                    localStorage.setItem('ticketText', v1);
                }
                if (v2) {
                    document.getElementById('ticketFooter').textContent = v2;
                    localStorage.setItem('ticketFooter', v2);
                }
            }
        }, 300);
    }
}

// ========== 通用照片来源选择菜单 ==========
function showPhotoSourceMenu(title, callback, onReset) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';

    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = title;

    const msgEl = document.createElement('div');
    msgEl.className = 'ios-dialog-message';
    msgEl.textContent = '选择照片来源';

    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons vertical';

    const urlBtn = document.createElement('button');
    urlBtn.className = 'ios-dialog-button primary';
    urlBtn.textContent = '输入图片URL';
    urlBtn.onclick = () => {
        closeM();
        iosPrompt('输入图片URL', '', (url) => {
            if (url && url.trim()) callback('url', url.trim());
        });
    };

    const localBtn = document.createElement('button');
    localBtn.className = 'ios-dialog-button primary';
    localBtn.textContent = '从本地上传';
    localBtn.onclick = () => {
        closeM();
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            try {
                const data = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.8, maxSizeKB: 400 });
                callback('local', data);
            } catch(err) { showToast('图片处理失败'); }
        };
        input.click();
    };

    if (onReset) {
        const resetBtn = document.createElement('button');
        resetBtn.className = 'ios-dialog-button';
        resetBtn.style.color = '#ff3b30';
        resetBtn.textContent = '重置为默认';
        resetBtn.onclick = async () => {
            closeM();
            const confirmed = await iosConfirm('确定要重置为默认吗？', '重置');
            if (confirmed) onReset();
        };
        buttonsEl.appendChild(urlBtn);
        buttonsEl.appendChild(localBtn);
        buttonsEl.appendChild(resetBtn);
    } else {
        buttonsEl.appendChild(urlBtn);
        buttonsEl.appendChild(localBtn);
    }

    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeM();

    buttonsEl.appendChild(cancelBtn);
    dialog.appendChild(titleEl);
    dialog.appendChild(msgEl);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    setTimeout(() => overlay.classList.add('show'), 10);

    function closeM() {
        overlay.classList.remove('show');
        setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
    }
}



// ========== 文档导入功能 ==========

// 存储解析出的角色数据
let parsedDocCharacters = [];

// 打开文档导入界面
function openDocumentImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.txt,.docx,.zip';
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        showToast('正在解析文件...');
        
        try {
            parsedDocCharacters = [];
            
            for (const file of files) {
                await parseDocumentFile(file);
            }
            
            if (parsedDocCharacters.length === 0) {
                showIosAlert('提示', '未能从文件中解析出任何角色数据');
                return;
            }
            
            // 显示预览和选择界面
            showDocCharacterPreview();
            
        } catch (error) {
            console.error('文件解析失败:', error);
            showIosAlert('错误', '文件解析失败：' + error.message);
        }
    };
    
    input.click();
}

// 解析文档文件
async function parseDocumentFile(file) {
    const fileName = file.name.toLowerCase();
    
    if (fileName.endsWith('.txt')) {
        await parseTxtFile(file);
    } else if (fileName.endsWith('.docx')) {
        await parseDocxFile(file);
    } else if (fileName.endsWith('.zip')) {
        await parseZipFile(file);
    }
}

// 解析 TXT 文件
async function parseTxtFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                const character = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name.replace('.txt', ''),
                    description: content.trim(),
                    source: file.name,
                    selected: true
                };
                
                parsedDocCharacters.push(character);
                resolve();
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => reject(new Error('读取文件失败'));
        reader.readAsText(file, 'UTF-8');
    });
}

// 解析 DOCX 文件
async function parseDocxFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                
                // 检查 mammoth 是否可用
                if (typeof mammoth === 'undefined') {
                    throw new Error('DOCX 解析库未加载，请刷新页面重试');
                }
                
                // 使用 mammoth.js 解析 DOCX
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                const content = result.value;
                
                if (!content || content.trim().length === 0) {
                    console.warn('DOCX 文件为空:', file.name);
                    resolve();
                    return;
                }
                
                const character = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: file.name.replace('.docx', ''),
                    description: content.trim(),
                    source: file.name,
                    selected: true
                };
                
                parsedDocCharacters.push(character);
                resolve();
            } catch (error) {
                console.error('解析 DOCX 失败:', file.name, error);
                // 不中断整个流程，只记录错误
                showToast(`解析 ${file.name} 失败`);
                resolve();
            }
        };
        
        reader.onerror = () => {
            console.error('读取文件失败:', file.name);
            showToast(`读取 ${file.name} 失败`);
            resolve(); // 不中断整个流程
        };
        reader.readAsArrayBuffer(file);
    });
}

// 解析 ZIP 文件
async function parseZipFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                
                // 检查 JSZip 是否可用
                if (typeof JSZip === 'undefined') {
                    // 动态加载 JSZip
                    await loadJSZip();
                }
                
                const zip = await JSZip.loadAsync(arrayBuffer);
                
                // 遍历压缩包中的文件
                const promises = [];
                zip.forEach((relativePath, zipEntry) => {
                    const fileName = relativePath.toLowerCase();
                    
                    // 只处理 TXT 和 DOCX 文件，忽略文件夹
                    if (!zipEntry.dir && (fileName.endsWith('.txt') || fileName.endsWith('.docx'))) {
                        promises.push(parseZipEntry(zipEntry, relativePath));
                    }
                });
                
                if (promises.length === 0) {
                    showToast(`${file.name} 中没有找到 TXT 或 DOCX 文件`);
                }
                
                await Promise.all(promises);
                resolve();
                
            } catch (error) {
                console.error('解析 ZIP 失败:', file.name, error);
                showToast(`解析 ${file.name} 失败`);
                resolve(); // 不中断整个流程
            }
        };
        
        reader.onerror = () => {
            console.error('读取文件失败:', file.name);
            showToast(`读取 ${file.name} 失败`);
            resolve(); // 不中断整个流程
        };
        reader.readAsArrayBuffer(file);
    });
}

// 解析 ZIP 中的单个文件
async function parseZipEntry(zipEntry, fileName) {
    try {
        if (fileName.toLowerCase().endsWith('.txt')) {
            const content = await zipEntry.async('text');
            
            if (content && content.trim().length > 0) {
                const character = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: fileName.replace('.txt', '').split('/').pop(),
                    description: content.trim(),
                    source: fileName,
                    selected: true
                };
                
                parsedDocCharacters.push(character);
            }
        } else if (fileName.toLowerCase().endsWith('.docx')) {
            const arrayBuffer = await zipEntry.async('arraybuffer');
            
            // 使用 mammoth.js 解析 DOCX
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            const content = result.value;
            
            if (content && content.trim().length > 0) {
                const character = {
                    id: 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
                    name: fileName.replace('.docx', '').split('/').pop(),
                    description: content.trim(),
                    source: fileName,
                    selected: true
                };
                
                parsedDocCharacters.push(character);
            }
        }
    } catch (error) {
        console.error('解析 ZIP 条目失败:', fileName, error);
    }
}

// 动态加载 JSZip 库
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (window.JSZip) {
            resolve();
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('加载 JSZip 库失败'));
        document.head.appendChild(script);
    });
}

// 显示角色预览和选择界面
function showDocCharacterPreview() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.id = 'docCharacterPreviewOverlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.maxWidth = '90%';
    dialog.style.maxHeight = '80vh';
    dialog.style.overflow = 'hidden';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = `已解析 ${parsedDocCharacters.length} 个角色`;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'ios-dialog-message';
    messageEl.textContent = '请选择要导入的角色';
    messageEl.style.marginBottom = '15px';
    
    // 角色列表容器
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'flex: 1; overflow-y: auto; padding: 0 16px; max-height: 50vh;';
    
    // 渲染角色列表
    parsedDocCharacters.forEach((char, index) => {
        const charItem = document.createElement('div');
        charItem.className = 'doc-char-preview-item';
        charItem.onclick = () => toggleCharacterSelection(index, charItem);
        
        const header = document.createElement('div');
        header.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 8px;';
        
        const checkbox = document.createElement('div');
        checkbox.className = 'doc-char-checkbox' + (char.selected ? ' checked' : '');
        checkbox.innerHTML = char.selected ? '<span style="color: white; font-size: 14px;">✓</span>' : '';
        
        const name = document.createElement('div');
        name.className = 'doc-char-name';
        name.textContent = char.name;
        
        const source = document.createElement('div');
        source.className = 'doc-char-source';
        source.textContent = char.source;
        
        header.appendChild(checkbox);
        header.appendChild(name);
        header.appendChild(source);
        
        const preview = document.createElement('div');
        preview.className = 'doc-char-preview-text';
        preview.textContent = char.description.substring(0, 150) + (char.description.length > 150 ? '...' : '');
        
        charItem.appendChild(header);
        charItem.appendChild(preview);
        listContainer.appendChild(charItem);
    });
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    buttonsEl.style.marginTop = '15px';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.className = 'ios-dialog-button';
    selectAllBtn.textContent = '全选';
    selectAllBtn.onclick = () => toggleSelectAll(listContainer);
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDocCharacterPreview();
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ios-dialog-button primary';
    confirmBtn.textContent = '确认导入';
    confirmBtn.onclick = () => confirmDocCharacterImport();
    
    buttonsEl.appendChild(selectAllBtn);
    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(confirmBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(listContainer);
    dialog.appendChild(buttonsEl);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        overlay.classList.add('show');
    }, 10);
}

// 切换角色选择状态
function toggleCharacterSelection(index, element) {
    parsedDocCharacters[index].selected = !parsedDocCharacters[index].selected;
    
    const checkbox = element.querySelector('.doc-char-checkbox');
    if (parsedDocCharacters[index].selected) {
        checkbox.classList.add('checked');
        checkbox.innerHTML = '<span style="color: white; font-size: 14px;">✓</span>';
    } else {
        checkbox.classList.remove('checked');
        checkbox.innerHTML = '';
    }
}

// 全选/取消全选
function toggleSelectAll(container) {
    const allSelected = parsedDocCharacters.every(char => char.selected);
    const newState = !allSelected;
    
    parsedDocCharacters.forEach(char => {
        char.selected = newState;
    });
    
    // 更新UI
    const checkboxes = container.querySelectorAll('.doc-char-checkbox');
    checkboxes.forEach(checkbox => {
        if (newState) {
            checkbox.classList.add('checked');
            checkbox.innerHTML = '<span style="color: white; font-size: 14px;">✓</span>';
        } else {
            checkbox.classList.remove('checked');
            checkbox.innerHTML = '';
        }
    });
    
    // 更新按钮文字
    const selectAllBtn = document.querySelector('#docCharacterPreviewOverlay .ios-dialog-button');
    if (selectAllBtn) {
        selectAllBtn.textContent = newState ? '取消全选' : '全选';
    }
}

// 关闭预览界面
function closeDocCharacterPreview() {
    const overlay = document.getElementById('docCharacterPreviewOverlay');
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(overlay);
        }, 300);
    }
}

// 确认导入选中的角色
async function confirmDocCharacterImport() {
    const selectedChars = parsedDocCharacters.filter(char => char.selected);
    
    if (selectedChars.length === 0) {
        showIosAlert('提示', '请至少选择一个角色');
        return;
    }
    
    closeDocCharacterPreview();
    
    // 如果只选择了一个角色，直接打开编辑界面
    if (selectedChars.length === 1) {
        openAddChatCharacterWithData(selectedChars[0]);
    } else {
        // 多个角色，逐个导入
        showToast('正在导入角色...');
        
        for (const char of selectedChars) {
            await importDocCharacter(char);
        }
        
        showToast(`成功导入 ${selectedChars.length} 个角色`);
        
        // 刷新角色列表
        if (typeof renderChatCharacterList === 'function') {
            renderChatCharacterList();
        }
    }
}

// 打开新增角色界面并填充数据
function openAddChatCharacterWithData(charData) {
    // 打开新增界面
    openAddChatCharacter();
    
    // 填充数据
    setTimeout(() => {
        document.getElementById('chatCharacterNameInput').value = charData.name;
        document.getElementById('chatCharacterDescInput').value = charData.description;
        
        // 可以添加备注说明来源
        document.getElementById('chatCharacterRemarkInput').value = `从 ${charData.source} 导入`;
    }, 100);
}

// 导入单个文档角色
async function importDocCharacter(charData) {
    try {
        const character = {
            id: 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            name: charData.name,
            remark: `从 ${charData.source} 导入`,
            description: charData.description,
            avatar: '', // 默认无头像
            createTime: Date.now(),
            lastMessageTime: 0,
            category: '默认'
        };
        
        // 保存到数据库
        await saveChatCharacterToDB(character);
        
        // 更新内存中的角色列表
        if (typeof chatCharacters !== 'undefined') {
            chatCharacters.push(character);
        }
        
    } catch (error) {
        console.error('导入角色失败:', charData.name, error);
        throw error;
    }
}
