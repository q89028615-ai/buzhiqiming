// API设置相关功能
const apiUrls = {
    hakimi: 'https://generativelanguage.googleapis.com/v1beta',
    claude: 'https://api.anthropic.com/v1',
    ds: 'https://api.deepseek.com/v1',
    custom: ''
};

// 打开API设置界面
async function openApiSettings() {
    document.getElementById('apiSettings').classList.add('active');
    // 加载保存的设置（内部已调用handleProviderChange并恢复保存的地址）
    await loadSettings();
    // 加载副API设置
    if (typeof loadSecSettings === 'function') await loadSecSettings();
    // 加载全局后台设置
    if (typeof initGlobalBgSettings === 'function') initGlobalBgSettings();
    // 加载全局拉黑设置
    if (typeof initGlobalBlockSettings === 'function') initGlobalBlockSettings();
}

// 关闭设置界面
function closeSettings() {
    document.getElementById('apiSettings').classList.remove('active');
}

// 打开数据管理界面（占位）
// ==================== 数据管理功能 ====================

// 打开数据管理界面
async function openDataManagement() {
    document.getElementById('dataManagementSettings').classList.add('active');
    
    // 刷新存储信息和数据统计
    await refreshStorageInfo();
    await updateDataStatistics();
}

// 关闭数据管理界面
function closeDataManagement() {
    document.getElementById('dataManagementSettings').classList.remove('active');
}

// 更新数据统计
let dataChartInstance = null; // 保存图表实例

async function updateDataStatistics() {
    try {
        const allImages = await getAllImagesFromDB();
        const allChats = await getAllChatsFromDB();
        const allFiles = await getAllFilesFromDB();
        const allCharacters = await getAllChatCharactersFromDB();
        
        const imageCount = allImages.length;
        const chatCount = allChats.length;
        const fileCount = allFiles.length;
        const characterCount = allCharacters.length;
        
        // 更新界面数字
        document.getElementById('imageCount').textContent = imageCount;
        document.getElementById('chatCount').textContent = chatCount;
        document.getElementById('characterCount').textContent = characterCount;
        document.getElementById('fileCount').textContent = fileCount;
        
        // 绘制饼状图
        renderDataChart(imageCount, chatCount, fileCount, characterCount);
        
        console.log(`📊 数据统计: ${imageCount}张图片, ${chatCount}条聊天, ${characterCount}个角色, ${fileCount}个文件`);
    } catch (error) {
        console.error('更新数据统计失败:', error);
    }
}

// 绘制数据饼状图
function renderDataChart(imageCount, chatCount, fileCount, characterCount) {
    const canvas = document.getElementById('dataChart');
    const legendDiv = document.getElementById('chartLegend');
    
    if (!canvas) return;
    
    // 如果已有图表实例，先销毁
    if (dataChartInstance) {
        dataChartInstance.destroy();
    }
    
    const ctx = canvas.getContext('2d');
    
    // 数据配置
    const data = {
        labels: ['图片', '聊天记录', '文件', '聊天角色'],
        datasets: [{
            data: [imageCount, chatCount, fileCount, characterCount],
            backgroundColor: [
                '#007aff',  // 蓝色 - 图片
                '#34c759',  // 绿色 - 聊天
                '#ff9500',  // 橙色 - 文件
                '#af52de'   // 紫色 - 角色
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }]
    };
    
    // 图表配置
    const config = {
        type: 'doughnut',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false // 隐藏默认图例，使用自定义图例
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
    
    // 创建图表
    dataChartInstance = new Chart(ctx, config);
    
    // 创建自定义图例
    const total = imageCount + chatCount + fileCount + characterCount;
    const colors = ['#007aff', '#34c759', '#ff9500', '#af52de'];
    const labels = ['图片', '聊天记录', '文件', '聊天角色'];
    const values = [imageCount, chatCount, fileCount, characterCount];
    
    legendDiv.innerHTML = labels.map((label, index) => {
        const percentage = total > 0 ? ((values[index] / total) * 100).toFixed(1) : 0;
        return `
            <div style="display: flex; align-items: center; gap: 6px;">
                <div style="width: 12px; height: 12px; background: ${colors[index]}; border-radius: 2px;"></div>
                <span style="color: #666;">${label}: ${values[index]} (${percentage}%)</span>
            </div>
        `;
    }).join('');
}

// 显示详细信息
async function showDataDetails() {
    try {
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            alert('暂无数据');
            return;
        }
        
        let details = '数据详细信息\n\n';
        details += `总计：${allImages.length} 张图片\n\n`;
        
        allImages.forEach((img, index) => {
            const sizeKB = ((img.data.length - (img.data.indexOf(',') + 1)) * 0.75 / 1024).toFixed(2);
            const date = new Date(img.timestamp).toLocaleString('zh-CN');
            details += `${index + 1}. ${img.id}\n`;
            details += `   类型: ${img.type}\n`;
            details += `   大小: ${sizeKB} KB\n`;
            details += `   时间: ${date}\n\n`;
        });
        
        alert(details);
    } catch (error) {
        console.error('获取详细信息失败:', error);
        alert('获取详细信息失败！');
    }
}

// ==================== 导出数据功能（多种方案） ====================

// 显示导出选项弹窗
async function showExportOptions() {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '300px';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择导出方式';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        messageEl.textContent = '请选择导出完整数据的方式：';
        messageEl.style.paddingBottom = '10px';
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';
        
        // 方案1：分批导出（推荐）
        const batchBtn = document.createElement('button');
        batchBtn.className = 'ios-dialog-button primary';
        batchBtn.textContent = '分批导出（推荐）';
        batchBtn.onclick = () => {
            closeDialog('batch');
        };
        
        // 方案4：基本导出（带检测）
        const basicBtn = document.createElement('button');
        basicBtn.className = 'ios-dialog-button';
        basicBtn.textContent = '基本导出（单文件）';
        basicBtn.onclick = () => {
            closeDialog('basic');
        };
        
        // 方案3：压缩导出
        const compressBtn = document.createElement('button');
        compressBtn.className = 'ios-dialog-button';
        compressBtn.textContent = '压缩导出（ZIP）';
        compressBtn.onclick = () => {
            closeDialog('compress');
        };
        
        // 方案2：流式导出
        const streamBtn = document.createElement('button');
        streamBtn.className = 'ios-dialog-button';
        streamBtn.textContent = '流式导出（大文件）';
        streamBtn.onclick = () => {
            closeDialog('stream');
        };
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog(null);
        };
        
        buttonsEl.appendChild(batchBtn);
        buttonsEl.appendChild(basicBtn);
        buttonsEl.appendChild(compressBtn);
        buttonsEl.appendChild(streamBtn);
        buttonsEl.appendChild(cancelBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
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
                if (result) {
                    handleExport(result);
                }
                resolve(result);
            }, 300);
        }
    });
}

// 处理导出
async function handleExport(type) {
    switch(type) {
        case 'basic':
            await exportBasic();
            break;
        case 'batch':
            await exportBatch();
            break;
        case 'compress':
            await exportCompress();
            break;
        case 'stream':
            await exportStream();
            break;
    }
}

// 方案1：基本导出（单文件，带大小检测）
async function exportBasic() {
    try {
        // 获取所有数据
        const allImages = await getAllImagesFromDB();
        const allChats = await getAllChatsFromDB();
        const allFiles = await getAllFilesFromDB();
        const allCharacters = await getAllChatCharactersFromDB();
        const allSettings = getAllLocalStorageData();
        
        // 获取所有角色的长期记忆
        const allMemories = {};
        for (const char of allCharacters) {
            const memories = await getLongTermMemories(char.id);
            if (memories && memories.length > 0) {
                allMemories[char.id] = memories;
            }
        }
        
        // 检查是否有数据
        const hasData = allImages.length > 0 || allChats.length > 0 || allFiles.length > 0 || 
                       allCharacters.length > 0 || Object.keys(allSettings).length > 0;
        
        if (!hasData) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        // 创建导出数据
        const exportData = {
            version: '4.0',
            exportTime: new Date().toISOString(),
            appName: 'buzhiqiming',
            appNameCN: '不知其名',
            description: 'Complete data backup with all features',
            data: {
                images: allImages,
                chats: allChats,
                files: allFiles,
                characters: allCharacters,
                longTermMemories: allMemories,
                localStorage: allSettings
            },
            statistics: {
                imageCount: allImages.length,
                chatCount: allChats.length,
                fileCount: allFiles.length,
                characterCount: allCharacters.length,
                memoryCount: Object.values(allMemories).reduce((sum, arr) => sum + arr.length, 0),
                settingCount: Object.keys(allSettings).length
            }
        };
        
        // 转换为JSON并计算大小
        const jsonStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        // 大小检测（超过50MB警告）
        if (blob.size > 50 * 1024 * 1024) {
            const confirmed = await iosConfirm(
                `数据量较大 (${fileSizeMB} MB)，可能导致浏览器卡顿或崩溃。\n\n建议：\n1. 先压缩图片\n2. 使用"分批导出"\n\n确定继续导出吗？`,
                '⚠️ 数据量过大警告'
            );
            
            if (!confirmed) return;
        }
        
        // 下载文件
        downloadFile(blob, `buzhiqiming_backup_${new Date().getTime()}.json`);
        
        console.log('✅ 基本导出完成');
        await iosAlert(
            `导出成功！\n\n图片: ${allImages.length}张\n聊天: ${allChats.length}条\n角色: ${allCharacters.length}个\n记忆: ${exportData.statistics.memoryCount}条\n文件: ${allFiles.length}个\n设置: ${Object.keys(allSettings).length}项\n\n文件大小: ${fileSizeMB} MB`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('导出失败:', error);
        await iosAlert('导出失败：' + error.message, '错误');
    }
}

// 方案2：分批导出（多个文件）
async function exportBatch() {
    try {
        const timestamp = new Date().getTime();
        let fileCount = 0;
        
        // 导出图片
        const allImages = await getAllImagesFromDB();
        if (allImages.length > 0) {
            const imagesData = {
                version: '4.0',
                type: 'images',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allImages
            };
            const blob = new Blob([JSON.stringify(imagesData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_images_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出聊天
        const allChats = await getAllChatsFromDB();
        if (allChats.length > 0) {
            const chatsData = {
                version: '4.0',
                type: 'chats',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allChats
            };
            const blob = new Blob([JSON.stringify(chatsData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_chats_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出角色
        const allCharacters = await getAllChatCharactersFromDB();
        if (allCharacters.length > 0) {
            const charactersData = {
                version: '4.0',
                type: 'characters',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allCharacters
            };
            const blob = new Blob([JSON.stringify(charactersData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_characters_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出长期记忆
        const allMemories = {};
        for (const char of allCharacters) {
            const memories = await getLongTermMemories(char.id);
            if (memories && memories.length > 0) {
                allMemories[char.id] = memories;
            }
        }
        if (Object.keys(allMemories).length > 0) {
            const memoriesData = {
                version: '4.0',
                type: 'memories',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allMemories
            };
            const blob = new Blob([JSON.stringify(memoriesData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_memories_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出文件
        const allFiles = await getAllFilesFromDB();
        if (allFiles.length > 0) {
            const filesData = {
                version: '4.0',
                type: 'files',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allFiles
            };
            const blob = new Blob([JSON.stringify(filesData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_files_${timestamp}.json`);
            fileCount++;
            await sleep(500);
        }
        
        // 导出设置
        const allSettings = getAllLocalStorageData();
        if (Object.keys(allSettings).length > 0) {
            const settingsData = {
                version: '4.0',
                type: 'settings',
                exportTime: new Date().toISOString(),
                appName: 'buzhiqiming',
                data: allSettings
            };
            const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
            downloadFile(blob, `buzhiqiming_settings_${timestamp}.json`);
            fileCount++;
        }
        
        if (fileCount === 0) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        await iosAlert(
            `分批导出成功！\n\n已导出 ${fileCount} 个文件\n\n注意：部分浏览器可能需要您手动允许多次下载`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('分批导出失败:', error);
        await iosAlert('导出失败：' + error.message, '错误');
    }
}

// 方案3：压缩导出（使用JSZip）
async function exportCompress() {
    try {
        // 检查是否已加载JSZip库
        if (typeof JSZip === 'undefined') {
            const confirmed = await iosConfirm(
                '压缩导出需要加载 JSZip 库（约100KB）\n\n是否继续？',
                '需要加载外部库'
            );
            
            if (!confirmed) return;
            
            // 动态加载JSZip库
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            
            // 检查是否加载成功
            if (typeof JSZip === 'undefined') {
                await iosAlert('JSZip 库加载失败，请检查网络连接或使用其他导出方式', '加载失败');
                return;
            }
        }
        
        await iosAlert('正在准备数据并压缩，请稍候...', '处理中');
        
        // 获取所有数据
        const allImages = await getAllImagesFromDB();
        const allChats = await getAllChatsFromDB();
        const allFiles = await getAllFilesFromDB();
        const allCharacters = await getAllChatCharactersFromDB();
        const allSettings = getAllLocalStorageData();
        
        // 获取所有角色的长期记忆
        const allMemories = {};
        for (const char of allCharacters) {
            const memories = await getLongTermMemories(char.id);
            if (memories && memories.length > 0) {
                allMemories[char.id] = memories;
            }
        }
        
        // 检查是否有数据
        const hasData = allImages.length > 0 || allChats.length > 0 || allFiles.length > 0 || 
                       allCharacters.length > 0 || Object.keys(allSettings).length > 0;
        
        if (!hasData) {
            await iosAlert('暂无数据可导出', '提示');
            return;
        }
        
        // 创建ZIP文件
        const zip = new JSZip();
        const timestamp = new Date().getTime();
        
        // 添加主数据文件
        const exportData = {
            version: '4.0',
            exportTime: new Date().toISOString(),
            appName: 'buzhiqiming',
            appNameCN: '不知其名',
            description: 'Complete data backup (Compressed)',
            statistics: {
                imageCount: allImages.length,
                chatCount: allChats.length,
                fileCount: allFiles.length,
                characterCount: allCharacters.length,
                memoryCount: Object.values(allMemories).reduce((sum, arr) => sum + arr.length, 0),
                settingCount: Object.keys(allSettings).length
            }
        };
        
        zip.file('info.json', JSON.stringify(exportData, null, 2));
        
        // 分别添加各类数据
        if (allImages.length > 0) {
            zip.file('images.json', JSON.stringify(allImages, null, 2));
        }
        if (allChats.length > 0) {
            zip.file('chats.json', JSON.stringify(allChats, null, 2));
        }
        if (allCharacters.length > 0) {
            zip.file('characters.json', JSON.stringify(allCharacters, null, 2));
        }
        if (Object.keys(allMemories).length > 0) {
            zip.file('memories.json', JSON.stringify(allMemories, null, 2));
        }
        if (allFiles.length > 0) {
            zip.file('files.json', JSON.stringify(allFiles, null, 2));
        }
        if (Object.keys(allSettings).length > 0) {
            zip.file('settings.json', JSON.stringify(allSettings, null, 2));
        }
        
        // 生成ZIP文件
        const blob = await zip.generateAsync({ 
            type: 'blob',
            compression: 'DEFLATE',
            compressionOptions: { level: 9 }
        });
        
        const fileSizeMB = (blob.size / (1024 * 1024)).toFixed(2);
        
        // 下载文件
        downloadFile(blob, `buzhiqiming_backup_${timestamp}.zip`);
        
        await iosAlert(
            `压缩导出成功！\n\n图片: ${allImages.length}张\n聊天: ${allChats.length}条\n角色: ${allCharacters.length}个\n记忆: ${exportData.statistics.memoryCount}条\n文件: ${allFiles.length}个\n设置: ${Object.keys(allSettings).length}项\n\n压缩后大小: ${fileSizeMB} MB`,
            '导出完成'
        );
        
    } catch (error) {
        console.error('压缩导出失败:', error);
        await iosAlert('压缩导出失败：' + error.message, '错误');
    }
}

// 方案2：流式导出（使用StreamSaver.js）
async function exportStream() {
    try {
        // 提示用户这个功能需要外部库
        const confirmed = await iosConfirm(
            '流式导出适合超大数据量（>100MB）\n\n需要加载 StreamSaver.js 库\n\n注意：此功能在某些浏览器可能不稳定\n\n是否继续？',
            '流式导出'
        );
        
        if (!confirmed) return;
        
        // 由于StreamSaver.js较为复杂且需要Service Worker，暂时使用优化的分块导出方案
        await iosAlert(
            '流式导出功能开发中...\n\n建议使用：\n1. 分批导出（多文件，最稳定）\n2. 压缩导出（ZIP格式，体积小）\n\n或先压缩图片再导出',
            '功能提示'
        );
        
    } catch (error) {
        console.error('流式导出失败:', error);
        await iosAlert('流式导出失败：' + error.message, '错误');
    }
}

// 辅助函数：动态加载外部脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('脚本加载失败'));
        document.head.appendChild(script);
    });
}

// 辅助函数：下载文件
function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 辅助函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 导入备份数据功能 ====================

// 导入备份数据
async function importBackupData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.zip';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const fileName = file.name.toLowerCase();
            
            if (fileName.endsWith('.zip')) {
                // ZIP文件导入
                await importFromZip(file);
            } else if (fileName.endsWith('.json')) {
                // JSON文件导入
                await importFromJson(file);
            } else {
                await iosAlert('不支持的文件格式，请选择 .json 或 .zip 文件', '错误');
            }
        } catch (error) {
            console.error('导入失败:', error);
            await iosAlert('导入失败：' + error.message, '错误');
        }
    };
    
    input.click();
}

// 从JSON文件导入
async function importFromJson(file) {
    try {
        const text = await file.text();
        const importData = JSON.parse(text);
        
        // 验证数据格式
        if (!importData.version || !importData.appName || importData.appName !== 'buzhiqiming') {
            await iosAlert('文件格式不正确或不是本应用的备份文件', '错误');
            return;
        }
        
        // 显示导入选项
        await showImportOptions(importData);
        
    } catch (error) {
        console.error('解析JSON失败:', error);
        await iosAlert('文件解析失败，请检查文件格式', '错误');
    }
}

// 从ZIP文件导入
async function importFromZip(file) {
    try {
        // 检查JSZip库
        if (typeof JSZip === 'undefined') {
            await iosAlert('需要加载 JSZip 库来解压文件，请稍候...', '提示');
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js');
            
            if (typeof JSZip === 'undefined') {
                await iosAlert('JSZip 库加载失败，请检查网络连接', '错误');
                return;
            }
        }
        
        const zip = new JSZip();
        const zipData = await zip.loadAsync(file);
        
        // 读取info.json
        const infoFile = zipData.file('info.json');
        if (!infoFile) {
            await iosAlert('ZIP文件中缺少 info.json，可能不是有效的备份文件', '错误');
            return;
        }
        
        const infoText = await infoFile.async('text');
        const info = JSON.parse(infoText);
        
        // 验证
        if (!info.version || !info.appName || info.appName !== 'buzhiqiming') {
            await iosAlert('不是本应用的备份文件', '错误');
            return;
        }
        
        // 读取各类数据
        const importData = {
            version: info.version,
            appName: info.appName,
            exportTime: info.exportTime,
            data: {}
        };
        
        // 读取images.json
        const imagesFile = zipData.file('images.json');
        if (imagesFile) {
            const imagesText = await imagesFile.async('text');
            importData.data.images = JSON.parse(imagesText);
        }
        
        // 读取chats.json
        const chatsFile = zipData.file('chats.json');
        if (chatsFile) {
            const chatsText = await chatsFile.async('text');
            importData.data.chats = JSON.parse(chatsText);
        }
        
        // 读取characters.json
        const charactersFile = zipData.file('characters.json');
        if (charactersFile) {
            const charactersText = await charactersFile.async('text');
            importData.data.characters = JSON.parse(charactersText);
        }
        
        // 读取memories.json
        const memoriesFile = zipData.file('memories.json');
        if (memoriesFile) {
            const memoriesText = await memoriesFile.async('text');
            importData.data.longTermMemories = JSON.parse(memoriesText);
        }
        
        // 读取files.json
        const filesFile = zipData.file('files.json');
        if (filesFile) {
            const filesText = await filesFile.async('text');
            importData.data.files = JSON.parse(filesText);
        }
        
        // 读取settings.json
        const settingsFile = zipData.file('settings.json');
        if (settingsFile) {
            const settingsText = await settingsFile.async('text');
            importData.data.localStorage = JSON.parse(settingsText);
        }
        
        // 显示导入选项
        await showImportOptions(importData);
        
    } catch (error) {
        console.error('解压ZIP失败:', error);
        await iosAlert('ZIP文件解压失败：' + error.message, '错误');
    }
}

// 显示导入选项对话框
async function showImportOptions(importData) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.maxWidth = '90%';
        dialog.style.width = '340px';
        
        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择导入内容';
        
        const messageEl = document.createElement('div');
        messageEl.className = 'ios-dialog-message';
        
        // 统计信息
        const stats = [];
        if (importData.data.images && importData.data.images.length > 0) {
            stats.push(`${importData.data.images.length} 张图片`);
        }
        if (importData.data.chats && importData.data.chats.length > 0) {
            stats.push(`${importData.data.chats.length} 条聊天`);
        }
        if (importData.data.characters && importData.data.characters.length > 0) {
            stats.push(`${importData.data.characters.length} 个角色`);
        }
        if (importData.data.longTermMemories) {
            const memCount = Object.values(importData.data.longTermMemories).reduce((sum, arr) => sum + arr.length, 0);
            if (memCount > 0) stats.push(`${memCount} 条记忆`);
        }
        if (importData.data.files && importData.data.files.length > 0) {
            stats.push(`${importData.data.files.length} 个文件`);
        }
        
        messageEl.innerHTML = `
            <div style="margin-bottom: 15px;">备份文件包含：</div>
            <div style="font-size: 13px; color: #666; line-height: 1.8;">
                ${stats.join('<br>')}
            </div>
            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border-radius: 8px; font-size: 12px; color: #856404;">
                ⚠️ 导入将覆盖现有数据，建议先导出当前数据备份
            </div>
        `;
        
        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';
        
        // 完整导入按钮
        const fullBtn = document.createElement('button');
        fullBtn.className = 'ios-dialog-button primary';
        fullBtn.textContent = '完整导入（覆盖所有）';
        fullBtn.onclick = async () => {
            closeDialog();
            await performImport(importData, 'full');
        };
        
        // 合并导入按钮
        const mergeBtn = document.createElement('button');
        mergeBtn.className = 'ios-dialog-button';
        mergeBtn.textContent = '合并导入（保留现有）';
        mergeBtn.onclick = async () => {
            closeDialog();
            await performImport(importData, 'merge');
        };
        
        // 取消按钮
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            closeDialog();
        };
        
        buttonsEl.appendChild(fullBtn);
        buttonsEl.appendChild(mergeBtn);
        buttonsEl.appendChild(cancelBtn);
        
        dialog.appendChild(titleEl);
        dialog.appendChild(messageEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.classList.add('show');
        }, 10);
        
        function closeDialog() {
            overlay.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(overlay);
                resolve();
            }, 300);
        }
    });
}

// 执行导入
async function performImport(importData, mode) {
    try {
        showToast('正在导入数据，请稍候...');
        
        let importedCount = {
            images: 0,
            chats: 0,
            characters: 0,
            memories: 0,
            files: 0,
            settings: 0
        };
        
        // 导入图片
        if (importData.data.images && importData.data.images.length > 0) {
            if (mode === 'full') {
                // 清空现有图片
                const transaction = db.transaction(['images'], 'readwrite');
                const store = transaction.objectStore('images');
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            
            // 导入图片
            for (const img of importData.data.images) {
                await saveImageToDB(img.id, img.data, img.type);
                importedCount.images++;
            }
        }
        
        // 导入聊天记录
        if (importData.data.chats && importData.data.chats.length > 0) {
            if (mode === 'full') {
                // 清空现有聊天
                const transaction = db.transaction(['chats'], 'readwrite');
                const store = transaction.objectStore('chats');
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            
            // 导入聊天
            const transaction = db.transaction(['chats'], 'readwrite');
            const store = transaction.objectStore('chats');
            for (const chat of importData.data.chats) {
                await new Promise((resolve, reject) => {
                    const request = store.add(chat);
                    request.onsuccess = () => resolve();
                    request.onerror = () => {
                        // 如果是合并模式且ID冲突，跳过
                        if (mode === 'merge') {
                            resolve();
                        } else {
                            reject(request.error);
                        }
                    };
                });
                importedCount.chats++;
            }
        }
        
        // 导入角色
        if (importData.data.characters && importData.data.characters.length > 0) {
            if (mode === 'full') {
                // 清空现有角色
                const transaction = db.transaction(['chatCharacters'], 'readwrite');
                const store = transaction.objectStore('chatCharacters');
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            
            // 导入角色
            for (const char of importData.data.characters) {
                await saveChatCharacterToDB(char);
                importedCount.characters++;
            }
        }
        
        // 导入长期记忆
        if (importData.data.longTermMemories) {
            for (const [charId, memories] of Object.entries(importData.data.longTermMemories)) {
                if (mode === 'full') {
                    // 覆盖模式：直接保存
                    await saveLongTermMemories(charId, memories);
                } else {
                    // 合并模式：追加到现有记忆
                    const existing = await getLongTermMemories(charId);
                    const merged = [...existing, ...memories];
                    await saveLongTermMemories(charId, merged);
                }
                importedCount.memories += memories.length;
            }
        }
        
        // 导入文件
        if (importData.data.files && importData.data.files.length > 0) {
            if (mode === 'full') {
                // 清空现有文件
                const transaction = db.transaction(['files'], 'readwrite');
                const store = transaction.objectStore('files');
                await new Promise((resolve, reject) => {
                    const request = store.clear();
                    request.onsuccess = () => resolve();
                    request.onerror = () => reject(request.error);
                });
            }
            
            // 导入文件
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            for (const file of importData.data.files) {
                await new Promise((resolve, reject) => {
                    const request = store.put(file);
                    request.onsuccess = () => resolve();
                    request.onerror = () => {
                        if (mode === 'merge') {
                            resolve();
                        } else {
                            reject(request.error);
                        }
                    };
                });
                importedCount.files++;
            }
        }
        
        // 导入设置
        if (importData.data.localStorage) {
            if (mode === 'full') {
                // 清空现有设置（保留一些关键设置）
                const keysToKeep = ['lockScreenEnabled', 'lockPassword', 'lockGesture'];
                const savedSettings = {};
                keysToKeep.forEach(key => {
                    const value = localStorage.getItem(key);
                    if (value) savedSettings[key] = value;
                });
                
                localStorage.clear();
                
                // 恢复保留的设置
                Object.entries(savedSettings).forEach(([key, value]) => {
                    localStorage.setItem(key, value);
                });
            }
            
            // 导入设置
            Object.entries(importData.data.localStorage).forEach(([key, value]) => {
                // 跳过一些敏感设置
                if (mode === 'merge' && ['lockScreenEnabled', 'lockPassword', 'lockGesture'].includes(key)) {
                    return;
                }
                localStorage.setItem(key, value);
                importedCount.settings++;
            });
        }
        
        // 刷新界面
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 如果导入了角色，刷新聊天列表
        if (importedCount.characters > 0) {
            if (typeof loadChatCharacters === 'function') {
                await loadChatCharacters();
            }
        }
        
        // 显示结果
        await iosAlert(
            `导入完成！\n\n图片: ${importedCount.images}张\n聊天: ${importedCount.chats}条\n角色: ${importedCount.characters}个\n记忆: ${importedCount.memories}条\n文件: ${importedCount.files}个\n设置: ${importedCount.settings}项\n\n${mode === 'full' ? '已覆盖所有数据' : '已合并到现有数据'}`,
            '导入成功'
        );
        
        console.log('✅ 导入完成:', importedCount);
        
    } catch (error) {
        console.error('导入失败:', error);
        await iosAlert('导入失败：' + error.message, '错误');
    }
}

// 辅助函数：延迟
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 清空所有图片
async function clearAllImages() {
    const confirmed = await iosConfirm(
        '此操作将删除：\n- 头像\n- 壁纸\n- 封面图\n- 所有其他图片\n\n此操作不可恢复！',
        '确定要清空所有图片吗？'
    );
    
    if (!confirmed) return;
    
    const doubleConfirm = await iosConfirm(
        '再次确认：真的要删除所有图片吗？',
        '最后确认'
    );
    
    if (!doubleConfirm) return;
    
    try {
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.clear();
        
        await new Promise((resolve, reject) => {
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 清除界面上的图片
        const avatarImage = document.getElementById('avatarImage');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImage) avatarImage.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
        
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        await iosAlert('所有图片已清空！', '完成');
        console.log('所有图片已清空');
    } catch (error) {
        console.error('清空图片失败:', error);
        await iosAlert('清空失败：' + error.message, '错误');
    }
}

// 清除冗余数据
async function cleanRedundantData() {
    try {
        // 确认操作
        const confirmed = await iosConfirm(
            '此操作将清理：\n\n• 未被引用的图片\n• 无效的缓存数据\n• 过期的临时数据\n\n建议在清理前先导出备份',
            '确定要清除冗余数据吗？'
        );
        
        if (!confirmed) return;
        
        await iosAlert('正在分析冗余数据，请稍候...', '处理中');
        
        let cleanedCount = 0;
        let freedSpaceKB = 0;
        const cleanLog = [];
        
        // 1. 清理未使用的图片
        const allImages = await getAllImagesFromDB();
        const usedImageIds = new Set();
        
        // 收集所有正在使用的图片ID
        // - 聊天角色头像
        chatCharacters.forEach(char => {
            if (char.avatar && char.avatar.startsWith('data:image')) {
                usedImageIds.add(char.avatar);
            }
        });
        
        // - 人设头像
        personas.forEach(persona => {
            if (persona.avatar && persona.avatar.startsWith('data:image')) {
                usedImageIds.add(persona.avatar);
            }
        });
        
        // - 用户头像（从localStorage）
        try {
            const userDataStr = localStorage.getItem('chatUserData');
            if (userDataStr) {
                const userData = JSON.parse(userDataStr);
                if (userData.avatar) {
                    usedImageIds.add(userData.avatar);
                }
            }
        } catch (e) {}
        
        // - 锁屏壁纸和主屏壁纸
        const lockWallpaper = await getImageFromDB('lock-wallpaper');
        if (lockWallpaper) usedImageIds.add(lockWallpaper);
        
        const mainWallpaper = await getImageFromDB('main-wallpaper');
        if (mainWallpaper) usedImageIds.add(mainWallpaper);
        
        // - 音乐封面、贴纸等
        const musicCover = await getImageFromDB('music-cover');
        if (musicCover) usedImageIds.add(musicCover);
        
        const sticker = await getImageFromDB('sticker');
        if (sticker) usedImageIds.add(sticker);
        
        // 检查未使用的图片
        const unusedImages = [];
        for (const img of allImages) {
            let isUsed = false;
            
            // 检查是否在使用中
            if (usedImageIds.has(img.data)) {
                isUsed = true;
            }
            
            // 检查固定ID的图片
            if (['avatar', 'lock-wallpaper', 'main-wallpaper', 'music-cover', 'music-avatar', 'sticker'].includes(img.id)) {
                isUsed = true;
            }
            
            if (!isUsed) {
                unusedImages.push(img);
            }
        }
        
        // 删除未使用的图片
        if (unusedImages.length > 0) {
            for (const img of unusedImages) {
                try {
                    await deleteImageFromDB(img.id);
                    const sizeKB = ((img.data.length - (img.data.indexOf(',') + 1)) * 0.75 / 1024).toFixed(2);
                    freedSpaceKB += parseFloat(sizeKB);
                    cleanedCount++;
                } catch (e) {
                    console.error('删除图片失败:', e);
                }
            }
            cleanLog.push(`清理未使用图片: ${unusedImages.length}张`);
        }
        
        // 2. 清理无效的localStorage数据
        let localStorageCleaned = 0;
        const validKeys = [
            'chatCharacters', 'personas', 'chatUserData', 'lockScreenEnabled', 
            'lockScreenSlideMode', 'lockPasswordEnabled', 'passwordType', 
            'lockPassword', 'lockGesture', 'lockWallpaperEnabled', 
            'customStyleEnabled', 'statusBarEnabled', 'phoneBorderEnabled', 
            'mainWallpaperEnabled'
        ];
        
        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && !validKeys.includes(key)) {
                // 检查是否是临时数据或过期数据
                if (key.startsWith('temp_') || key.startsWith('cache_') || key.includes('backup_old')) {
                    localStorage.removeItem(key);
                    localStorageCleaned++;
                }
            }
        }
        
        if (localStorageCleaned > 0) {
            cleanLog.push(`清理无效缓存: ${localStorageCleaned}项`);
        }
        
        // 3. 清理无效的聊天记录
        try {
            const allChats = await getAllChatsFromDB();
            const validCharacterIds = new Set(chatCharacters.map(c => c.id));
            const invalidChats = allChats.filter(chat => !validCharacterIds.has(chat.characterId));
            
            if (invalidChats.length > 0) {
                const chatsTransaction = db.transaction(['chats'], 'readwrite');
                const chatsStore = chatsTransaction.objectStore('chats');
                
                for (const chat of invalidChats) {
                    try {
                        await new Promise((resolve, reject) => {
                            const request = chatsStore.delete(chat.id);
                            request.onsuccess = () => resolve();
                            request.onerror = () => reject(request.error);
                        });
                    } catch (e) {}
                }
                
                cleanLog.push(`清理无效聊天记录: ${invalidChats.length}条`);
            }
        } catch (e) {
            console.error('清理聊天记录失败:', e);
        }
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 显示结果
        let resultMsg = '清理完成！\n\n';
        
        if (cleanLog.length > 0) {
            resultMsg += cleanLog.join('\n') + '\n\n';
        } else {
            resultMsg += '未发现冗余数据\n\n';
        }
        
        if (freedSpaceKB > 0) {
            const freedSpaceMB = (freedSpaceKB / 1024).toFixed(2);
            if (freedSpaceKB < 1024) {
                resultMsg += `释放空间: ${freedSpaceKB.toFixed(2)} KB`;
            } else {
                resultMsg += `释放空间: ${freedSpaceMB} MB`;
            }
        }
        
        await iosAlert(resultMsg, '清理完成');
        
        console.log('冗余数据清理完成:', cleanLog);
        
    } catch (error) {
        console.error('清理冗余数据失败:', error);
        await iosAlert('清理失败：' + error.message, '错误');
    }
}

// 清空所有数据（整个小手机的所有数据）
async function clearAllData() {
    // 第一次确认
    const confirmed = await iosConfirm(
        '此操作将删除整个小手机的所有数据：\n\n- 所有聊天角色\n- 所有聊天记录\n- 所有图片（头像、壁纸、封面等）\n- 所有文件\n- 所有人设和世界书\n- 所有设置和配置\n\n此操作不可恢复！\n\n⚠️ 注意：仅清空当前页面的数据，不影响其他页面的小手机。',
        '确定要清空所有数据吗？'
    );
    
    if (!confirmed) return;
    
    // 第二次确认
    const doubleConfirm = await iosConfirm(
        '最后确认：\n\n真的要清空整个小手机的所有数据吗？\n\n建议先导出数据备份！',
        '⚠️ 最后确认'
    );
    
    if (!doubleConfirm) return;
    
    try {
        // 清空IndexedDB中的所有数据
        console.log('开始清空IndexedDB数据...');
        
        // 清空images
        try {
            const imagesTransaction = db.transaction(['images'], 'readwrite');
            const imagesStore = imagesTransaction.objectStore('images');
            await new Promise((resolve, reject) => {
                const request = imagesStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 图片数据已清空');
        } catch (error) {
            console.warn('清空图片数据失败:', error);
        }
        
        // 清空chats
        try {
            const chatsTransaction = db.transaction(['chats'], 'readwrite');
            const chatsStore = chatsTransaction.objectStore('chats');
            await new Promise((resolve, reject) => {
                const request = chatsStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 聊天记录已清空');
        } catch (error) {
            console.warn('清空聊天记录失败:', error);
        }
        
        // 清空files
        try {
            const filesTransaction = db.transaction(['files'], 'readwrite');
            const filesStore = filesTransaction.objectStore('files');
            await new Promise((resolve, reject) => {
                const request = filesStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 文件数据已清空');
        } catch (error) {
            console.warn('清空文件数据失败:', error);
        }
        
        // 清空chatCharacters
        try {
            const charactersTransaction = db.transaction(['chatCharacters'], 'readwrite');
            const charactersStore = charactersTransaction.objectStore('chatCharacters');
            await new Promise((resolve, reject) => {
                const request = charactersStore.clear();
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
            console.log('✓ 聊天角色已清空');
            // 清空内存中的角色数组
            chatCharacters = [];
        } catch (error) {
            console.warn('清空聊天角色失败:', error);
        }
        
        // 先清空storageDB（API设置等）- 必须在localStorage之前清空
        console.log('开始清空storageDB数据...');
        try {
            await storageDB.clear();
            console.log('✓ StorageDB已清空 (API设置、预设等)');
        } catch (error) {
            console.warn('清空StorageDB失败:', error);
        }
        
        // 清空localStorage
        console.log('开始清空localStorage数据...');
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            keysToRemove.push(localStorage.key(i));
        }
        keysToRemove.forEach(key => {
            localStorage.removeItem(key);
        });
        console.log(`✓ localStorage已清空 (${keysToRemove.length}项)`);
        
        // 再次确保清空storageDB（防止localStorage清空时触发了某些保存操作）
        try {
            await storageDB.clear();
            console.log('✓ StorageDB二次清空完成');
        } catch (error) {
            console.warn('StorageDB二次清空失败:', error);
        }
        
        // 更新统计
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 清除聊天列表界面
        renderChatList();
        
        // 清除界面显示
        const avatarImage = document.getElementById('avatarImage');
        const avatarPlaceholder = document.getElementById('avatarPlaceholder');
        if (avatarImage) avatarImage.style.display = 'none';
        if (avatarPlaceholder) avatarPlaceholder.style.display = 'block';
        
        const lockScreen = document.getElementById('lockScreen');
        if (lockScreen) {
            lockScreen.style.backgroundImage = 'none';
            lockScreen.style.backgroundColor = '#ffffff';
        }
        
        const mainScreen = document.getElementById('mainScreen');
        if (mainScreen) {
            mainScreen.style.backgroundImage = 'none';
        }
        
        console.log('所有数据已清空完成');
        await iosAlert(
            '所有数据已清空！\n\n页面将在3秒后刷新...',
            '清空完成'
        );
        
        // 3秒后刷新页面
        setTimeout(() => {
            window.location.reload();
        }, 3000);
        
    } catch (error) {
        console.error('清空数据失败:', error);
        await iosAlert('清空失败：' + error.message, '错误');
    }
}

// 刷新存储信息
async function refreshStorageInfo() {
    try {
        const usage = await getStorageUsage();
        if (usage) {
            document.getElementById('storageUsage').textContent = `${usage.usage} MB`;
            document.getElementById('storageQuota').textContent = `${usage.quota} MB`;
            document.getElementById('storageBar').style.width = `${usage.percentage}%`;
            
            // 更新百分比显示（如果存在）
            const percentageEl = document.getElementById('storagePercentage');
            if (percentageEl) {
                percentageEl.textContent = `${usage.percentage}% 已使用`;
            }
            
            console.log(` 存储: ${usage.usage}MB / ${usage.quota}MB (${usage.percentage}%)`);
        }
    } catch (error) {
        console.error('获取存储信息失败:', error);
    }
}

// ==================== 图片压缩功能 ====================

// 压缩进行中标志（防止重复点击）
let isCompressing = false;

// 更新压缩质量显示
function updateCompressionQuality(value) {
    document.getElementById('compressionQuality').textContent = value + '%';
}

// 切换是否压缩小组件图片
function toggleWidgetCompression(checked) {
    console.log('压缩小组件图片:', checked);
}

// 压缩单个图片
async function compressImageBase64(base64Data, quality) {
    return new Promise((resolve, reject) => {
        try {
            // 检查是否为有效的base64数据
            if (!base64Data || typeof base64Data !== 'string' || !base64Data.includes('data:image')) {
                reject(new Error('无效的图片数据'));
                return;
            }
            
            // 创建一个Image对象
            const img = new Image();
            
            // 设置crossOrigin以避免污染canvas
            img.crossOrigin = 'anonymous';
            
            img.onload = function() {
                try {
                    // 创建canvas
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d', { willReadFrequently: true });
                    
                    // 设置canvas尺寸为图片尺寸
                    canvas.width = img.width;
                    canvas.height = img.height;
                    
                    // 绘制图片到canvas
                    ctx.drawImage(img, 0, 0);
                    
                    // 尝试压缩图片
                    try {
                        // 先尝试压缩为jpeg
                        const compressedBase64 = canvas.toDataURL('image/jpeg', quality / 100);
                        
                        // 检查压缩是否成功（有些透明图片压缩后可能变大）
                        if (compressedBase64 && compressedBase64.length > 0) {
                            resolve(compressedBase64);
                        } else {
                            // 压缩失败，返回原图
                            resolve(base64Data);
                        }
                    } catch (canvasError) {
                        // Canvas操作失败，返回原图
                        console.warn('Canvas压缩失败，使用原图:', canvasError.message);
                        resolve(base64Data);
                    }
                } catch (error) {
                    console.warn('图片处理失败，使用原图:', error.message);
                    resolve(base64Data);
                }
            };
            
            img.onerror = function(error) {
                console.warn('图片加载失败，使用原图');
                // 图片加载失败时返回原图而不是reject
                resolve(base64Data);
            };
            
            // 设置图片源
            img.src = base64Data;
            
        } catch (error) {
            console.warn('压缩过程出错，使用原图:', error.message);
            // 出错时返回原图而不是reject
            resolve(base64Data);
        }
    });
}

// 压缩所有图片
async function compressAllImages() {
    // 防止重复点击
    if (isCompressing) {
        await iosAlert('图片压缩正在进行中，请稍候...', '提示');
        return;
    }
    
    try {
        // 获取压缩质量
        const quality = parseInt(document.getElementById('compressionSlider').value);
        const compressWidget = document.getElementById('compressWidgetImages').checked;
        
        // 确认操作（使用自定义iOS风格弹窗）
        const confirmed = await iosConfirm(
            `压缩质量: ${quality}%\n压缩小组件图片: ${compressWidget ? '是' : '否'}\n\n此操作将覆盖原图片且不可恢复！`,
            '确定要压缩所有图片吗？'
        );
        
        if (!confirmed) return;
        
        // 设置压缩标志
        isCompressing = true;
        
        // 显示进度条
        const progressDiv = document.getElementById('compressionProgress');
        const progressBar = document.getElementById('progressBar');
        const progressText = document.getElementById('progressText');
        const progressDetail = document.getElementById('progressDetail');
        const compressBtn = document.getElementById('compressBtn');
        
        progressDiv.style.display = 'block';
        compressBtn.disabled = true;
        compressBtn.style.opacity = '0.5';
        compressBtn.textContent = '正在压缩...';
        
        // 获取所有图片
        const allImages = await getAllImagesFromDB();
        
        if (allImages.length === 0) {
            await iosAlert('暂无图片需要压缩', '提示');
            progressDiv.style.display = 'none';
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
            isCompressing = false;
            return;
        }
        
        // 小组件类型列表
        const widgetTypes = ['avatar', 'music-avatar', 'music-cover', 'sticker'];
        
        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;
        let totalSizeBefore = 0;
        let totalSizeAfter = 0;
        
        // 逐个压缩图片
        for (let i = 0; i < allImages.length; i++) {
            const img = allImages[i];
            
            // 计算原始大小（所有图片都要计算）
            const originalSize = (img.data.length - (img.data.indexOf(',') + 1)) * 0.75;
            totalSizeBefore += originalSize;
            
            // 如果不压缩小组件图片，则跳过小组件类型
            if (!compressWidget && widgetTypes.includes(img.type)) {
                totalSizeAfter += originalSize;
                skipCount++;
                progressDetail.textContent = `跳过小组件图片 (${i + 1}/${allImages.length})`;
                
                // 更新进度
                const progress = Math.round(((i + 1) / allImages.length) * 100);
                progressBar.style.width = `${progress}%`;
                progressText.textContent = `${progress}%`;
                continue;
            }
            
            try {
                
                // 压缩图片
                progressDetail.textContent = `正在压缩 ${img.type} (${i + 1}/${allImages.length})`;
                const compressedData = await compressImageBase64(img.data, quality);
                
                // 计算压缩后大小
                const compressedSize = (compressedData.length - (compressedData.indexOf(',') + 1)) * 0.75;
                
                // 检查是否真的压缩了（如果返回的是原图，大小会一样）
                if (compressedData === img.data) {
                    // 没有压缩，跳过
                    totalSizeAfter += originalSize;
                    skipCount++;
                    progressDetail.textContent = `跳过无法压缩的图片 ${img.type} (${i + 1}/${allImages.length})`;
                } else {
                    totalSizeAfter += compressedSize;
                    
                    // 更新数据库
                    const transaction = db.transaction(['images'], 'readwrite');
                    const store = transaction.objectStore('images');
                    
                    img.data = compressedData;
                    img.timestamp = Date.now(); // 更新时间戳
                    
                    await new Promise((resolve, reject) => {
                        const request = store.put(img);
                        request.onsuccess = () => resolve();
                        request.onerror = () => reject(request.error);
                    });
                    
                    successCount++;
                }
            } catch (error) {
                console.error(`压缩图片失败 (${img.type}):`, error);
                // 压缩失败，保持原大小
                totalSizeAfter += originalSize;
                errorCount++;
            }
            
            // 更新进度
            const progress = Math.round(((i + 1) / allImages.length) * 100);
            progressBar.style.width = `${progress}%`;
            progressText.textContent = `${progress}%`;
        }
        
        // 压缩完成
        const savedSizeKB = ((totalSizeBefore - totalSizeAfter) / 1024).toFixed(2);
        const savedPercentage = totalSizeBefore > 0 ? ((1 - totalSizeAfter / totalSizeBefore) * 100).toFixed(1) : 0;
        
        progressDetail.textContent = `压缩完成！成功: ${successCount}张，跳过: ${skipCount}张，失败: ${errorCount}张`;
        
        // 刷新统计信息
        await updateDataStatistics();
        await refreshStorageInfo();
        
        // 重置按钮
        compressBtn.disabled = false;
        compressBtn.style.opacity = '1';
        compressBtn.textContent = '开始压缩图片';
        
        // 显示结果（使用自定义弹窗）
        await iosAlert(
            `成功: ${successCount}张\n跳过: ${skipCount}张\n失败: ${errorCount}张\n\n节省空间: ${savedSizeKB} KB (${savedPercentage}%)`,
            '压缩完成！'
        );
        
        // 隐藏进度条
        progressDiv.style.display = 'none';
        
        // 重置压缩标志
        isCompressing = false;
        
        console.log(`图片压缩完成: 成功${successCount}张, 跳过${skipCount}张, 失败${errorCount}张, 节省${savedSizeKB}KB`);
        
    } catch (error) {
        console.error('压缩图片失败:', error);
        
        // 重置UI
        const progressDiv = document.getElementById('compressionProgress');
        const compressBtn = document.getElementById('compressBtn');
        if (progressDiv) progressDiv.style.display = 'none';
        if (compressBtn) {
            compressBtn.disabled = false;
            compressBtn.style.opacity = '1';
            compressBtn.textContent = '开始压缩图片';
        }
        
        // 重置压缩标志
        isCompressing = false;
        
        // 显示错误（使用自定义弹窗）
        await iosAlert('压缩失败：' + error.message, '错误');
    }
}
