// 世界书分组列表
let worldBookGroups = ['默认'];

// 追踪表单是否被修改
let worldBookFormChanged = false;
let worldBookOriginalData = {};

// 初始化世界书
async function initWorldBooks() {
    try {
        const savedWorldBooks = await storageDB.getItem('worldBooks');
        if (savedWorldBooks) {
            worldBooks = JSON.parse(savedWorldBooks);
            // 为旧数据添加默认分组
            worldBooks.forEach(book => {
                if (!book.group) {
                    book.group = '默认';
                }
            });
            console.log('世界书已加载:', worldBooks.length, '个条目');
        } else {
            worldBooks = [];
        }

        // 加载分组数据
        const savedGroups = await storageDB.getItem('worldBookGroups');
        if (savedGroups) {
            worldBookGroups = JSON.parse(savedGroups);
            // 确保有默认分组
            if (!worldBookGroups.includes('默认')) {
                worldBookGroups.unshift('默认');
            }
        } else {
            worldBookGroups = ['默认'];
        }
    } catch (error) {
        console.error('加载世界书失败，使用空列表:', error);
        worldBooks = [];
        worldBookGroups = ['默认'];
        // 清除损坏的数据
        await storageDB.removeItem('worldBooks');
        await storageDB.removeItem('worldBookGroups');
    }
}

// 打开世界书页面
function openWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'flex';
        displayWorldBooks();
    }
}

// 关闭世界书页面
function closeWorldBook() {
    const worldBookPage = document.getElementById('worldBookPage');
    if (worldBookPage) {
        worldBookPage.style.display = 'none';
    }
}

// 添加世界书条目
function addWorldBookItem() {
    showWorldBookCreateOptions();
}

// 显示创建世界书选项（手动创建 或 导入文档）
function showWorldBookCreateOptions() {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '300px';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = '创建世界书';
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons vertical';
    
    // 手动创建按钮
    const manualBtn = document.createElement('button');
    manualBtn.className = 'ios-dialog-button';
    manualBtn.textContent = '手动创建';
    manualBtn.onclick = () => {
        closeDialog();
        openWorldBookEdit();
    };
    
    // 导入文档按钮
    const importBtn = document.createElement('button');
    importBtn.className = 'ios-dialog-button';
    importBtn.textContent = '导入文档';
    importBtn.onclick = () => {
        closeDialog();
        openWorldBookImport();
    };
    
    // 取消按钮
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    buttonsEl.appendChild(manualBtn);
    buttonsEl.appendChild(importBtn);
    buttonsEl.appendChild(cancelBtn);
    
    dialog.appendChild(titleEl);
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

// 打开世界书导入界面
function openWorldBookImport() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt,.docx,.zip';
    input.multiple = true;
    
    input.onchange = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        
        try {
            showToast('正在解析文件...');
            const parsedEntries = await parseImportedFiles(files);
            
            if (parsedEntries.length === 0) {
                await iosAlert('没有解析到有效内容', '提示');
                return;
            }
            
            // 显示确认界面
            showImportConfirmDialog(parsedEntries);
        } catch (error) {
            console.error('文件解析失败:', error);
            await iosAlert('文件解析失败: ' + error.message, '错误');
        }
    };
    
    input.click();
}

// 解析导入的文件
async function parseImportedFiles(files) {
    const entries = [];
    
    for (const file of files) {
        try {
            const fileName = file.name;
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            
            if (fileExt === '.txt') {
                const content = await readTextFile(file);
                if (content.trim()) {
                    entries.push({
                        id: Date.now() + Math.random(),
                        fileName: fileName,
                        content: content.trim(),
                        comment: fileName.replace('.txt', ''),
                        keys: [],
                        enabled: true,
                        selected: true
                    });
                }
            } else if (fileExt === '.docx') {
                const content = await readDocxFile(file);
                if (content.trim()) {
                    entries.push({
                        id: Date.now() + Math.random(),
                        fileName: fileName,
                        content: content.trim(),
                        comment: fileName.replace('.docx', ''),
                        keys: [],
                        enabled: true,
                        selected: true
                    });
                }
            } else if (fileExt === '.zip') {
                const zipEntries = await readZipFile(file);
                entries.push(...zipEntries);
            }
        } catch (error) {
            console.error(`解析文件 ${file.name} 失败:`, error);
        }
    }
    
    return entries;
}

// 读取TXT文件
function readTextFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file, 'UTF-8');
    });
}

// 读取DOCX文件
async function readDocxFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                resolve(result.value);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

// 读取ZIP文件
async function readZipFile(file) {
    const entries = [];
    
    try {
        const zip = await JSZip.loadAsync(file);
        
        for (const [fileName, zipEntry] of Object.entries(zip.files)) {
            if (zipEntry.dir) continue;
            
            const fileExt = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
            
            if (fileExt === '.txt') {
                const content = await zipEntry.async('text');
                if (content.trim()) {
                    entries.push({
                        id: Date.now() + Math.random(),
                        fileName: fileName,
                        content: content.trim(),
                        comment: fileName.replace('.txt', ''),
                        keys: [],
                        enabled: true,
                        selected: true
                    });
                }
            } else if (fileExt === '.docx') {
                const arrayBuffer = await zipEntry.async('arraybuffer');
                try {
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    if (result.value.trim()) {
                        entries.push({
                            id: Date.now() + Math.random(),
                            fileName: fileName,
                            content: result.value.trim(),
                            comment: fileName.replace('.docx', ''),
                            keys: [],
                            enabled: true,
                            selected: true
                        });
                    }
                } catch (error) {
                    console.error(`解析ZIP中的DOCX文件 ${fileName} 失败:`, error);
                }
            }
        }
    } catch (error) {
        console.error('解析ZIP文件失败:', error);
        throw error;
    }
    
    return entries;
}

// 显示导入确认对话框
function showImportConfirmDialog(entries) {
    const overlay = document.createElement('div');
    overlay.className = 'ios-dialog-overlay';
    overlay.style.zIndex = '10001';
    
    const dialog = document.createElement('div');
    dialog.className = 'ios-dialog';
    dialog.style.width = '90%';
    dialog.style.maxWidth = '500px';
    dialog.style.maxHeight = '80vh';
    dialog.style.display = 'flex';
    dialog.style.flexDirection = 'column';
    
    const titleEl = document.createElement('div');
    titleEl.className = 'ios-dialog-title';
    titleEl.textContent = `确认导入 (${entries.length}个文件)`;
    
    const messageEl = document.createElement('div');
    messageEl.className = 'ios-dialog-message';
    messageEl.textContent = '请选择要导入的条目：';
    messageEl.style.marginBottom = '12px';
    
    // 全选/取消全选按钮
    const selectAllDiv = document.createElement('div');
    selectAllDiv.style.cssText = 'padding: 8px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e5e5e5;';
    
    const selectAllBtn = document.createElement('button');
    selectAllBtn.textContent = '全选';
    selectAllBtn.style.cssText = 'padding: 6px 12px; font-size: 13px; color: #007aff; background: transparent; border: 1px solid #007aff; border-radius: 6px; cursor: pointer;';
    selectAllBtn.onclick = () => {
        entries.forEach(e => e.selected = true);
        renderEntryList();
    };
    
    const deselectAllBtn = document.createElement('button');
    deselectAllBtn.textContent = '取消全选';
    deselectAllBtn.style.cssText = 'padding: 6px 12px; font-size: 13px; color: #666; background: transparent; border: 1px solid #ccc; border-radius: 6px; cursor: pointer;';
    deselectAllBtn.onclick = () => {
        entries.forEach(e => e.selected = false);
        renderEntryList();
    };
    
    selectAllDiv.appendChild(selectAllBtn);
    selectAllDiv.appendChild(deselectAllBtn);
    
    // 条目列表容器
    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'flex: 1; overflow-y: auto; padding: 12px 16px; max-height: 400px;';
    
    function renderEntryList() {
        listContainer.innerHTML = entries.map((entry, index) => {
            const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
            return `
                <div style="background: ${entry.selected ? '#f0f8ff' : '#f8f8f8'}; border: 2px solid ${entry.selected ? '#007aff' : '#e5e5e5'}; border-radius: 10px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: all 0.2s;" onclick="toggleEntrySelection(${index})">
                    <div style="display: flex; align-items: center; margin-bottom: 8px;">
                        <input type="checkbox" ${entry.selected ? 'checked' : ''} style="width: 18px; height: 18px; margin-right: 10px; cursor: pointer;" onclick="event.stopPropagation(); toggleEntrySelection(${index})">
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">${escapeHtml(entry.fileName)}</div>
                            <div style="font-size: 12px; color: #666;">${entry.content.length} 字符</div>
                        </div>
                    </div>
                    <div style="font-size: 12px; color: #999; line-height: 1.4; background: white; padding: 8px; border-radius: 6px;">${escapeHtml(preview)}</div>
                </div>
            `;
        }).join('');
    }
    
    window.toggleEntrySelection = (index) => {
        entries[index].selected = !entries[index].selected;
        renderEntryList();
    };
    
    renderEntryList();
    
    const buttonsEl = document.createElement('div');
    buttonsEl.className = 'ios-dialog-buttons';
    buttonsEl.style.borderTop = '1px solid #e5e5e5';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'ios-dialog-button';
    cancelBtn.textContent = '取消';
    cancelBtn.onclick = () => closeDialog();
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'ios-dialog-button primary';
    confirmBtn.textContent = '确认导入';
    confirmBtn.onclick = () => {
        const selectedEntries = entries.filter(e => e.selected);
        if (selectedEntries.length === 0) {
            showToast('请至少选择一个条目');
            return;
        }
        closeDialog();
        openWorldBookEditWithImportedEntries(selectedEntries);
    };
    
    buttonsEl.appendChild(cancelBtn);
    buttonsEl.appendChild(confirmBtn);
    
    dialog.appendChild(titleEl);
    dialog.appendChild(messageEl);
    dialog.appendChild(selectAllDiv);
    dialog.appendChild(listContainer);
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
            delete window.toggleEntrySelection;
        }, 300);
    }
}

// 打开世界书编辑界面并填充导入的条目
function openWorldBookEditWithImportedEntries(importedEntries) {
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 更新分组下拉框选项
        updateGroupSelect();
        
        // 重置修改标记
        worldBookFormChanged = false;
        
        // 清空表单
        document.getElementById('worldBookName').value = '';
        document.getElementById('worldBookGlobal').checked = false;
        document.getElementById('worldBookPosition').value = 'middle';
        document.getElementById('worldBookGroup').value = '默认';
        delete document.getElementById('worldBookEditModal').dataset.editId;
        
        // 填充导入的条目
        window._tempWorldBookEntries = importedEntries.map(entry => ({
            id: entry.id,
            keys: entry.keys || [],
            content: entry.content,
            comment: entry.comment,
            enabled: entry.enabled !== false
        }));
        
        renderWorldBookEntriesEditable();
        
        // 保存原始数据(空)
        worldBookOriginalData = {
            name: '',
            content: '',
            entries: null,
            isGlobal: false,
            position: 'middle',
            group: '默认'
        };
        
        // 添加输入监听
        setupWorldBookFormListeners();
        
        showToast(`已导入 ${importedEntries.length} 个条目`);
    }
}

// 打开世界书编辑弹窗
function openWorldBookEdit(bookId = null) {
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'flex';
        
        // 更新分组下拉框选项
        updateGroupSelect();
        
        // 重置修改标记
        worldBookFormChanged = false;
        
        // 初始化临时条目数组
        window._tempWorldBookEntries = [];
        
        if (bookId !== null) {
            // 编辑模式 - 加载现有世界书数据
            const book = worldBooks.find(b => b.id === bookId);
            if (book) {
                document.getElementById('worldBookName').value = book.name;
                document.getElementById('worldBookGlobal').checked = book.isGlobal;
                document.getElementById('worldBookPosition').value = book.position;
                document.getElementById('worldBookGroup').value = book.group || '默认';
                document.getElementById('worldBookEditModal').dataset.editId = bookId;
                
                // 统一用条目模式
                if (book.entries && book.entries.length > 0) {
                    window._tempWorldBookEntries = JSON.parse(JSON.stringify(book.entries));
                } else if (book.content) {
                    // 兼容旧数据：把content转成一个条目
                    window._tempWorldBookEntries = [{
                        id: Date.now(),
                        keys: [],
                        content: book.content,
                        comment: book.name || '默认条目',
                        enabled: true
                    }];
                }
                
                renderWorldBookEntriesEditable();
                
                // 保存原始数据
                worldBookOriginalData = {
                    name: book.name,
                    content: book.content,
                    entries: book.entries,
                    isGlobal: book.isGlobal,
                    position: book.position,
                    group: book.group || '默认'
                };
            }
        } else {
            // 新建模式 - 清空表单
            document.getElementById('worldBookName').value = '';
            document.getElementById('worldBookContentInput').value = '';
            document.getElementById('worldBookGlobal').checked = false;
            document.getElementById('worldBookPosition').value = 'middle';
            document.getElementById('worldBookGroup').value = '默认';
            delete document.getElementById('worldBookEditModal').dataset.editId;
            
            window._tempWorldBookEntries = [];
            renderWorldBookEntriesEditable();
            
            // 保存原始数据(空)
            worldBookOriginalData = {
                name: '',
                content: '',
                entries: null,
                isGlobal: false,
                position: 'middle',
                group: '默认'
            };
        }
        
        // 添加输入监听
        setupWorldBookFormListeners();
    }
}

// 渲染世界书条目列表
// 渲染可编辑的世界书条目列表
function renderWorldBookEntriesEditable() {
    const container = document.getElementById('worldBookEntriesContainer');
    if (!container) return;
    
    const entries = window._tempWorldBookEntries || [];
    
    if (entries.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px 0; font-size: 13px;">
                暂无条目，点击上方"添加条目"开始创建
            </div>
        `;
        return;
    }
    
    let html = `
        <div style="font-size: 12px; color: #666; margin-bottom: 12px;">
            共 ${entries.length} 个条目，可单独启用或关闭
        </div>
    `;
    
    entries.forEach((entry, index) => {
        const isEnabled = entry.enabled !== false;
        const borderColor = isEnabled ? '#d4edda' : '#e5e5e5';
        const statusColor = isEnabled ? '#28a745' : '#999';
        const statusText = isEnabled ? '已启用' : '已禁用';
        
        html += `
            <div class="wb-entry-card" style="background: #f8f9fa; border: 2px solid ${borderColor}; border-radius: 12px; padding: 14px; margin-bottom: 12px; transition: border-color 0.2s;">
                <!-- 标题行 -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <input type="text" class="form-input" value="${escapeHtml(entry.comment || '')}" 
                           placeholder="条目标题" 
                           onchange="updateEntryField(${index}, 'comment', this.value)"
                           style="flex: 1; padding: 8px 12px; font-size: 14px; font-weight: 600; margin-right: 8px;">
                    <label style="display: flex; align-items: center; cursor: pointer; user-select: none; flex-shrink: 0;">
                        <input type="checkbox" 
                               onchange="toggleTempEntry(${index})" 
                               ${isEnabled ? 'checked' : ''}
                               style="width: 18px; height: 18px; margin-right: 6px; cursor: pointer;">
                        <span style="font-size: 12px; color: ${statusColor}; font-weight: 500; white-space: nowrap;">${statusText}</span>
                    </label>
                </div>
                <!-- 关键词 -->
                <div style="margin-bottom: 8px;">
                    <input type="text" class="form-input" value="${escapeHtml((entry.keys || []).join(', '))}" 
                           placeholder="关键词（逗号分隔，可选）" 
                           onchange="updateEntryKeys(${index}, this.value)"
                           style="padding: 8px 12px; font-size: 13px;">
                </div>
                <!-- 内容 -->
                <div style="margin-bottom: 8px;">
                    <textarea class="form-input" placeholder="条目内容" rows="3" 
                              onchange="updateEntryField(${index}, 'content', this.value)"
                              style="resize: vertical; min-height: 60px; font-size: 13px; line-height: 1.5;">${escapeHtml(entry.content || '')}</textarea>
                </div>
                <!-- 删除按钮 -->
                <div style="text-align: right;">
                    <button onclick="deleteWorldBookEntry(${index})" 
                            style="padding: 6px 14px; font-size: 12px; color: #dc3545; background: rgba(220,53,69,0.08); border: 1px solid rgba(220,53,69,0.2); border-radius: 6px; cursor: pointer;">
                        删除条目
                    </button>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 渲染只读世界书条目列表（用于查看模式）
function renderWorldBookEntries(entries) {
    window._tempWorldBookEntries = JSON.parse(JSON.stringify(entries));
    renderWorldBookEntriesEditable();
}

// 隐藏世界书条目列表（不再需要，保留空函数兼容）
function hideWorldBookEntries() {}

// 切换临时条目的启用状态
function toggleTempEntry(entryIndex) {
    if (window._tempWorldBookEntries && window._tempWorldBookEntries[entryIndex]) {
        window._tempWorldBookEntries[entryIndex].enabled = !window._tempWorldBookEntries[entryIndex].enabled;
        markWorldBookFormChanged();
        renderWorldBookEntriesEditable();
    }
}

// 切换世界书条目的启用状态（兼容旧调用）
function toggleWorldBookEntry(entryIndex) {
    toggleTempEntry(entryIndex);
}

// 添加新条目
function addWorldBookEntry() {
    if (!window._tempWorldBookEntries) {
        window._tempWorldBookEntries = [];
    }
    window._tempWorldBookEntries.push({
        id: Date.now() + Math.floor(Math.random() * 1000),
        keys: [],
        content: '',
        comment: '',
        enabled: true
    });
    markWorldBookFormChanged();
    renderWorldBookEntriesEditable();
    
    // 滚动到底部让用户看到新条目
    setTimeout(() => {
        const container = document.getElementById('worldBookEntriesContainer');
        if (container) {
            const lastCard = container.querySelector('.wb-entry-card:last-child');
            if (lastCard) lastCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// 删除条目
async function deleteWorldBookEntry(entryIndex) {
    const confirmed = await iosConfirm('确定要删除这个条目吗？', '删除条目');
    if (!confirmed) return;
    
    if (window._tempWorldBookEntries) {
        window._tempWorldBookEntries.splice(entryIndex, 1);
        markWorldBookFormChanged();
        renderWorldBookEntriesEditable();
    }
}

// 更新条目字段
function updateEntryField(entryIndex, field, value) {
    if (window._tempWorldBookEntries && window._tempWorldBookEntries[entryIndex]) {
        window._tempWorldBookEntries[entryIndex][field] = value;
        markWorldBookFormChanged();
    }
}

// 更新条目关键词
function updateEntryKeys(entryIndex, value) {
    if (window._tempWorldBookEntries && window._tempWorldBookEntries[entryIndex]) {
        window._tempWorldBookEntries[entryIndex].keys = value.split(',').map(k => k.trim()).filter(k => k);
        markWorldBookFormChanged();
    }
}

// 设置表单输入监听
function setupWorldBookFormListeners() {
    const nameInput = document.getElementById('worldBookName');
    const contentInput = document.getElementById('worldBookContentInput');
    const globalCheckbox = document.getElementById('worldBookGlobal');
    const positionSelect = document.getElementById('worldBookPosition');
    const groupSelect = document.getElementById('worldBookGroup');
    
    // 移除旧的监听器
    nameInput.removeEventListener('input', markWorldBookFormChanged);
    contentInput.removeEventListener('input', markWorldBookFormChanged);
    globalCheckbox.removeEventListener('change', markWorldBookFormChanged);
    positionSelect.removeEventListener('change', markWorldBookFormChanged);
    groupSelect.removeEventListener('change', markWorldBookFormChanged);
    
    // 添加新的监听器
    nameInput.addEventListener('input', markWorldBookFormChanged);
    contentInput.addEventListener('input', markWorldBookFormChanged);
    globalCheckbox.addEventListener('change', markWorldBookFormChanged);
    positionSelect.addEventListener('change', markWorldBookFormChanged);
    groupSelect.addEventListener('change', markWorldBookFormChanged);
}

// 标记表单已修改
function markWorldBookFormChanged() {
    worldBookFormChanged = true;
}

// 关闭世界书编辑弹窗
async function closeWorldBookEdit() {
    // 检查是否有未保存的更改
    if (worldBookFormChanged) {
        const userConfirmed = await showCustomConfirm(
            '提示',
            '你还没有保存哦，是否确定要离开？\n\n点击"确定"放弃修改并返回\n点击"取消"继续编辑'
        );
        
        if (!userConfirmed) {
            // 用户选择取消，继续编辑
            return;
        }
    }
    
    // 关闭弹窗
    const modal = document.getElementById('worldBookEditModal');
    if (modal) {
        modal.style.display = 'none';
        // 重置修改标记
        worldBookFormChanged = false;
        worldBookOriginalData = {};
    }
}

// 保存世界书
async function saveWorldBook() {
    const name = document.getElementById('worldBookName').value.trim();
    const isGlobal = document.getElementById('worldBookGlobal').checked;
    const position = document.getElementById('worldBookPosition').value;
    const group = document.getElementById('worldBookGroup').value;
    
    // 验证
    if (!name) {
        alert('请输入世界书名字！');
        return;
    }
    
    const entries = window._tempWorldBookEntries || [];
    
    // 过滤掉完全空的条目
    const validEntries = entries.filter(e => (e.content && e.content.trim()) || (e.comment && e.comment.trim()));
    
    if (validEntries.length === 0) {
        alert('请至少添加一个有内容的条目！');
        return;
    }
    
    const modal = document.getElementById('worldBookEditModal');
    const editId = modal.dataset.editId;
    
    if (editId) {
        // 编辑现有世界书
        const index = worldBooks.findIndex(b => b.id === parseInt(editId));
        if (index !== -1) {
            const book = worldBooks[index];
            worldBooks[index] = {
                ...book,
                name,
                content: '', // 清空旧的content字段
                entries: validEntries,
                isGlobal,
                position,
                group,
                updatedAt: Date.now()
            };
        }
    } else {
        // 创建新世界书
        const newBook = {
            id: Date.now(),
            name,
            content: '',
            entries: validEntries,
            isGlobal,
            position,
            group,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };
        worldBooks.push(newBook);
    }
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 重置修改标记
        worldBookFormChanged = false;
        window._tempWorldBookEntries = [];
        
        // 显示成功提示
        alert('世界书保存成功！');
        
        // 关闭弹窗并刷新列表
        closeWorldBookEdit();
        displayWorldBooks();
        
        console.log('世界书已保存，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('保存世界书失败:', error);
        alert('保存失败，请重试！');
    }
}

// 显示世界书列表
function displayWorldBooks() {
    const container = document.getElementById('worldBookContent');
    console.log('displayWorldBooks 被调用, 容器:', container, '世界书数量:', worldBooks.length);
    
    if (!container) {
        console.error('找不到世界书容器元素!');
        return;
    }
    
    if (worldBooks.length === 0) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">暂无内容</div>
            </div>
        `;
        return;
    }
    
    // 获取当前选中的分组筛选
    const filterSelect = document.getElementById('worldBookGroupFilter');
    const selectedGroup = filterSelect ? filterSelect.value : 'all';
    
    let html = '<div style="padding: 15px;">';
    let hasContent = false;
    
    // 按分组显示世界书
    worldBookGroups.forEach(group => {
        // 如果选择了特定分组，只显示该分组
        if (selectedGroup !== 'all' && selectedGroup !== group) {
            return;
        }
        
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        
        if (booksInGroup.length > 0) {
            hasContent = true;
            
            // 分组标题
            html += `
                <div style="font-size: 14px; font-weight: 600; color: #666; padding: 10px 5px; margin-top: 10px; border-bottom: 2px solid #e5e5e5; display: flex; align-items: center; justify-content: space-between;">
                    <span>${group}</span>
                    <span style="font-size: 12px; color: #999; font-weight: normal;">${booksInGroup.length} 个</span>
                </div>
            `;
            
            // 分组内的世界书
            booksInGroup.forEach(book => {
                const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 8px; border-radius: 4px; font-size: 11px; margin-left: 8px;">全局</span>' : '';
                const positionText = book.position === 'before' ? '前' : book.position === 'middle' ? '中' : '后';
                
                // 判断是条目模式还是文本模式
                let contentPreview = '';
                if (book.entries && book.entries.length > 0) {
                    // 条目模式：显示条目数量和启用状态
                    const enabledCount = book.entries.filter(e => e.enabled !== false).length;
                    contentPreview = `包含 ${book.entries.length} 个条目，已启用 ${enabledCount} 个`;
                } else if (book.content) {
                    // 文本模式：显示内容预览
                    contentPreview = book.content;
                } else {
                    contentPreview = '暂无内容';
                }
                
                html += `
                    <div style="background: white; border: 1px solid #e5e5e5; border-radius: 12px; padding: 15px; margin-bottom: 12px; margin-top: 8px; cursor: pointer; transition: all 0.2s;" 
                         onclick="openWorldBookEdit(${book.id})"
                         onmouseover="this.style.boxShadow='0 2px 8px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <div style="font-size: 16px; font-weight: 600; color: #333;">
                                ${book.name}${globalBadge}
                            </div>
                            <div style="font-size: 12px; color: #999;">注入: ${positionText}</div>
                        </div>
                        <div style="font-size: 14px; color: #666; line-height: 1.5; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                            ${contentPreview}
                        </div>
                    </div>
                `;
            });
        }
    });
    
    html += '</div>';
    
    // 如果筛选后没有内容，显示空状态
    if (!hasContent) {
        container.innerHTML = `
            <div class="world-book-empty">
                <div class="world-book-empty-text">该分组暂无内容</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = html;
    console.log('世界书列表已更新, HTML长度:', html.length);
}

// 打开删除世界书弹窗
function openWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'flex';
        displayWorldBookDeleteList();
    }
}

// 关闭删除世界书弹窗
function closeWorldBookDeleteModal() {
    const modal = document.getElementById('worldBookDeleteModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 显示删除列表
function displayWorldBookDeleteList() {
    const container = document.getElementById('worldBookDeleteList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        
        // 判断是条目模式还是文本模式
        let contentPreview = '';
        if (book.entries && book.entries.length > 0) {
            const enabledCount = book.entries.filter(e => e.enabled !== false).length;
            contentPreview = `包含 ${book.entries.length} 个条目，已启用 ${enabledCount} 个`;
        } else if (book.content) {
            contentPreview = book.content;
        } else {
            contentPreview = '暂无内容';
        }
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${contentPreview}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选
function toggleSelectAllWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认删除世界书
async function confirmDeleteWorldBooks() {
    const checkboxes = document.querySelectorAll('.world-book-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要删除的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认删除',
        `确定要删除选中的 ${checkboxes.length} 个世界书吗？\n此操作无法撤销！`
    );
    
    if (!confirmed) return;
    
    // 获取要删除的ID列表
    const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 删除选中的世界书
    worldBooks = worldBooks.filter(book => !idsToDelete.includes(book.id));
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功删除 ${idsToDelete.length} 个世界书！`);
        
        // 关闭弹窗并刷新列表
        closeWorldBookDeleteModal();
        displayWorldBooks();
        
        console.log('世界书已删除，当前共有', worldBooks.length, '个条目');
    } catch (error) {
        console.error('删除世界书失败:', error);
        alert('删除失败，请重试！');
    }
}

// 删除单个世界书
function deleteWorldBook(bookId) {
    if (confirm('确定要删除这个世界书吗？')) {
        worldBooks = worldBooks.filter(b => b.id !== bookId);
        storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        displayWorldBooks();
    }
}

// 获取世界书的有效内容（只包含启用的条目）
function getWorldBookContent(book) {
    if (!book) return '';
    
    // 如果有条目，只返回启用的条目
    if (book.entries && book.entries.length > 0) {
        const enabledEntries = book.entries.filter(entry => entry.enabled !== false);
        
        if (enabledEntries.length === 0) {
            return ''; // 所有条目都被禁用
        }
        
        // 合并启用的条目
        let combinedContent = '';
        enabledEntries.forEach((entry, index) => {
            if (entry.keys && entry.keys.length > 0) {
                combinedContent += `[关键词: ${entry.keys.join(', ')}]\n`;
            }
            if (entry.comment) {
                combinedContent += `# ${entry.comment}\n`;
            }
            combinedContent += `${entry.content}\n`;
            if (index < enabledEntries.length - 1) {
                combinedContent += '\n---\n\n';
            }
        });
        
        return combinedContent;
    }
    
    // 没有条目，返回原始内容
    return book.content || '';
}

// 获取所有全局世界书
function getGlobalWorldBooks() {
    return worldBooks.filter(book => book.isGlobal);
}

// 根据位置获取世界书
function getWorldBooksByPosition(position) {
    return worldBooks.filter(book => book.position === position);
}

// ========== 世界书分组管理 ==========

// 更新分组下拉框选项
function updateGroupSelect() {
    const groupSelect = document.getElementById('worldBookGroup');
    if (groupSelect) {
        groupSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            groupSelect.appendChild(option);
        });
    }
}

// 打开分组管理弹窗
function openWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'flex';
        updateWorldBookGroupFilter();
        updateTargetGroupSelect();
        displayWorldBookMoveList();
        displayGroupGlobalList();
        displayGroupsList();
    }
}

// 关闭分组管理弹窗
function closeWorldBookGroupModal() {
    const modal = document.getElementById('worldBookGroupModal');
    if (modal) {
        modal.style.display = 'none';
        // 清空输入框
        document.getElementById('newGroupName').value = '';
    }
}

// 创建新分组
async function createNewGroup() {
    const groupName = document.getElementById('newGroupName').value.trim();
    
    if (!groupName) {
        alert('请输入分组名称！');
        return;
    }
    
    if (worldBookGroups.includes(groupName)) {
        alert('该分组已存在！');
        return;
    }
    
    if (groupName === '默认') {
        alert('不能创建名为"默认"的分组！');
        return;
    }
    
    // 添加新分组
    worldBookGroups.push(groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        
        // 清空输入框
        document.getElementById('newGroupName').value = '';
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        
        alert('分组创建成功！');
    } catch (error) {
        console.error('创建分组失败:', error);
        alert('创建失败，请重试！');
        // 回滚
        worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    }
}

// 更新目标分组下拉框
function updateTargetGroupSelect() {
    const targetSelect = document.getElementById('targetGroupSelect');
    if (targetSelect) {
        targetSelect.innerHTML = '';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            targetSelect.appendChild(option);
        });
    }
}

// 显示世界书移动列表
function displayWorldBookMoveList() {
    const container = document.getElementById('worldBookMoveList');
    if (!container) return;
    
    if (worldBooks.length === 0) {
        container.innerHTML = '<div style="text-align: center; color: #999; padding: 30px;">暂无世界书</div>';
        return;
    }
    
    let html = '';
    worldBooks.forEach(book => {
        const globalBadge = book.isGlobal ? '<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">全局</span>' : '';
        const groupBadge = `<span style="background: #6c757d; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">${book.group || '默认'}</span>`;
        
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5; transition: all 0.2s;"
                 onmouseover="this.style.borderColor='#007bff'"
                 onmouseout="this.style.borderColor='#e5e5e5'">
                <input type="checkbox" class="world-book-move-checkbox" data-book-id="${book.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${book.name}${globalBadge}${groupBadge}
                    </div>
                    <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                        ${book.content}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选（用于移动）
function toggleSelectAllForMove() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 确认移动到分组
async function confirmMoveToGroup() {
    const checkboxes = document.querySelectorAll('.world-book-move-checkbox:checked');
    const targetGroup = document.getElementById('targetGroupSelect').value;
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要移动的世界书！');
        return;
    }
    
    const confirmed = await showCustomConfirm(
        '确认移动',
        `确定要将选中的 ${checkboxes.length} 个世界书移动到"${targetGroup}"分组吗？`
    );
    
    if (!confirmed) return;
    
    // 获取要移动的ID列表
    const idsToMove = Array.from(checkboxes).map(cb => parseInt(cb.dataset.bookId));
    
    // 更新分组
    worldBooks.forEach(book => {
        if (idsToMove.includes(book.id)) {
            book.group = targetGroup;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 显示成功提示
        alert(`成功移动 ${idsToMove.length} 个世界书到"${targetGroup}"分组！`);
        
        // 刷新列表
        displayWorldBookMoveList();
        displayWorldBooks();
        
    } catch (error) {
        console.error('移动世界书失败:', error);
        alert('移动失败，请重试！');
    }
}

// 显示分组列表
function displayGroupsList() {
    const container = document.getElementById('groupsList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const count = worldBooks.filter(book => (book.group || '默认') === group).length;
        const isDefault = group === '默认';
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="font-size: 14px; font-weight: 600; color: #333;">
                    ${group}
                    ${isDefault ? '<span style="color: #999; font-size: 12px; font-weight: normal; margin-left: 8px;">(系统分组)</span>' : ''}
                </div>
                <div style="font-size: 12px; color: #999; margin-top: 4px;">
                    ${count} 个世界书
                </div>
                ${!isDefault ? `
                    <button class="btn-primary" onclick="deleteGroup('${group}')" style="background: #dc3545; padding: 8px 12px; font-size: 14px; margin-top: 10px; width: 100%;">
                        删除
                    </button>
                ` : ''}
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 删除分组
async function deleteGroup(groupName) {
    if (groupName === '默认') {
        alert('不能删除默认分组！');
        return;
    }
    
    const booksInGroup = worldBooks.filter(book => book.group === groupName);
    
    let confirmMessage = `确定要删除"${groupName}"分组吗？`;
    if (booksInGroup.length > 0) {
        confirmMessage += `\n\n该分组中有 ${booksInGroup.length} 个世界书，删除后将移动到"默认"分组。`;
    }
    
    const confirmed = await showCustomConfirm('确认删除', confirmMessage);
    
    if (!confirmed) return;
    
    // 将该分组的世界书移动到默认分组
    worldBooks.forEach(book => {
        if (book.group === groupName) {
            book.group = '默认';
        }
    });
    
    // 删除分组
    worldBookGroups = worldBookGroups.filter(g => g !== groupName);
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBookGroups', JSON.stringify(worldBookGroups));
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        updateTargetGroupSelect();
        updateWorldBookGroupFilter();
        displayGroupGlobalList();
        displayGroupsList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert('分组删除成功！');
    } catch (error) {
        console.error('删除分组失败:', error);
        alert('删除失败，请重试！');
    }
}

// 更新世界书分组筛选器
function updateWorldBookGroupFilter() {
    const filterSelect = document.getElementById('worldBookGroupFilter');
    if (filterSelect) {
        const currentValue = filterSelect.value || 'all';
        filterSelect.innerHTML = '<option value="all">全部分组</option>';
        worldBookGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group;
            option.textContent = group;
            filterSelect.appendChild(option);
        });
        // 恢复之前的选择
        if (filterSelect.querySelector(`option[value="${currentValue}"]`)) {
            filterSelect.value = currentValue;
        }
    }
}

// 根据分组筛选世界书
function filterWorldBooksByGroup() {
    displayWorldBooks();
}

// 显示分组全局设置列表
function displayGroupGlobalList() {
    const container = document.getElementById('groupGlobalList');
    if (!container) return;
    
    let html = '';
    worldBookGroups.forEach(group => {
        const booksInGroup = worldBooks.filter(book => (book.group || '默认') === group);
        const globalCount = booksInGroup.filter(book => book.isGlobal).length;
        const allGlobal = booksInGroup.length > 0 && globalCount === booksInGroup.length;
        
        html += `
            <div style="padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #e5e5e5;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-size: 14px; font-weight: 600; color: #333;">
                            ${group}
                        </div>
                        <div style="font-size: 12px; color: #999; margin-top: 4px;">
                            ${booksInGroup.length} 个世界书，其中 ${globalCount} 个已是全局
                        </div>
                    </div>
                    <label class="ios-switch">
                        <input type="checkbox" ${allGlobal ? 'checked' : ''} onchange="toggleGroupGlobal('${group}', this.checked)">
                        <span class="ios-slider"></span>
                    </label>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 切换分组全局状态
async function toggleGroupGlobal(groupName, isGlobal) {
    const booksInGroup = worldBooks.filter(book => (book.group || '默认') === groupName);
    
    if (booksInGroup.length === 0) {
        alert('该分组没有世界书！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    const actionText = isGlobal ? '设置为全局' : '取消全局';
    const confirmed = await showCustomConfirm(
        '确认操作',
        `确定要将"${groupName}"分组下的 ${booksInGroup.length} 个世界书${actionText}吗？`
    );
    
    if (!confirmed) {
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
        return;
    }
    
    // 更新分组内所有世界书的全局状态
    worldBooks.forEach(book => {
        if ((book.group || '默认') === groupName) {
            book.isGlobal = isGlobal;
        }
    });
    
    try {
        // 保存到数据库
        await storageDB.setItem('worldBooks', JSON.stringify(worldBooks));
        
        // 刷新界面
        displayGroupGlobalList();
        displayWorldBookMoveList();
        displayWorldBooks();
        
        alert(`成功将"${groupName}"分组${actionText}！`);
    } catch (error) {
        console.error('更新分组全局状态失败:', error);
        alert('操作失败，请重试！');
        displayGroupGlobalList(); // 刷新列表，恢复开关状态
    }
}

