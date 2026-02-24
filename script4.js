// ==================== CoT 思维链功能 ====================

/**
 * 获取群聊 CoT 设置
 */
async function getGroupCoTSettings(groupId) {
    try {
        if (!db) {
            console.error('数据库未初始化');
            return getDefaultCoTSettings();
        }
        
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData || !groupData.settings) {
            return getDefaultCoTSettings();
        }
        
        return groupData.settings.cot || getDefaultCoTSettings();
    } catch (error) {
        console.error('获取 CoT 设置失败:', error);
        return getDefaultCoTSettings();
    }
}

/**
 * 保存群聊 CoT 设置
 */
async function saveGroupCoTSettings(groupId, cotSettings) {
    try {
        if (!db) {
            console.error('数据库未初始化');
            return false;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData) {
            throw new Error('群聊不存在');
        }
        
        if (!groupData.settings) {
            groupData.settings = {};
        }
        
        groupData.settings.cot = cotSettings;
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        return true;
    } catch (error) {
        console.error('保存 CoT 设置失败:', error);
        return false;
    }
}

/**
 * 获取默认 CoT 设置
 */
function getDefaultCoTSettings() {
    return {
        enabled: true,
        saveThinking: true, // 默认开启保存思维过程
        showThinkingSummary: false,
        keepRecentThinking: 1, // 默认保留最近1条
        modules: {
            situationAnalysis: {
                name: "情况分析",
                enabled: true,
                description: "分析用户说了什么、当前话题和氛围",
                customPrompt: "" // 用户自定义提示词
            },
            memberAnalysis: {
                name: "成员反应分析",
                enabled: true,
                description: "分析每个成员的性格、关系和发言意愿",
                customPrompt: ""
            },
            interactionPlanning: {
                name: "虚拟时间线规划",
                enabled: true,
                description: "规划虚拟时间线，模拟成员之间的动态互动",
                customPrompt: ""
            },
            permissionJudgment: {
                name: "权限操作判断",
                enabled: true,
                description: "判断是否需要使用管理员/群主权限",
                customPrompt: ""
            },
            contentGeneration: {
                name: "内容生成",
                enabled: true,
                description: "按虚拟时间线生成具体的消息内容",
                customPrompt: ""
            },
            orderRandomization: {
                name: "最终顺序确认",
                enabled: true,
                description: "确认最终输出顺序，保证逻辑连贯和顺序多样性",
                customPrompt: ""
            }
        }
    };
}

/**
 * 解析 CoT 响应
 */
function parseCoTResponse(response) {
    const thinkingMatch = response.match(/<thinking>([\s\S]*?)<\/thinking>/);
    const responseMatch = response.match(/<response>([\s\S]*?)<\/response>/);
    
    return {
        thinking: thinkingMatch ? thinkingMatch[1].trim() : null,
        response: responseMatch ? responseMatch[1].trim() : response.trim(),
        hasCoT: !!(thinkingMatch && responseMatch)
    };
}

/**
 * 打开 CoT 设置界面
 */
async function openCoTSettings() {
    console.log('openCoTSettings 被调用');
    
    // 使用全局变量 currentChatCharacter
    if (!currentChatCharacter) {
        await iosAlert('请先选择一个群聊', '提示');
        return;
    }
    
    if (!currentChatCharacter.isGroup && currentChatCharacter.groupType !== 'group') {
        await iosAlert('当前不是群聊', '提示');
        return;
    }
    
    const cotSettings = await getGroupCoTSettings(currentChatCharacter.id);
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    // 创建弹窗
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 400px;
        max-height: 70vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    // 构建模块列表 HTML
    const moduleNames = {
        situationAnalysis: "情况分析",
        memberAnalysis: "成员反应分析",
        interactionPlanning: "虚拟时间线规划",
        permissionJudgment: "权限操作判断",
        contentGeneration: "内容生成",
        orderRandomization: "最终顺序确认"
    };
    
    const moduleDescriptions = {
        situationAnalysis: "分析用户说了什么、当前话题和氛围",
        memberAnalysis: "分析每个成员的性格、关系和发言意愿（支持多轮发言）",
        interactionPlanning: "规划虚拟时间线，模拟成员之间的动态互动",
        permissionJudgment: "判断是否需要使用管理员/群主权限",
        contentGeneration: "按虚拟时间线生成具体的消息内容",
        orderRandomization: "确认最终输出顺序，保证逻辑连贯和顺序多样性"
    };
    
    let modulesHtml = '';
    for (const [key, module] of Object.entries(cotSettings.modules)) {
        modulesHtml += `
            <div style="margin-bottom: 15px; padding: 15px; background: #f8f8f8; border-radius: 10px;">
                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
                    <div style="flex: 1;">
                        <div style="font-weight: 500; margin-bottom: 4px;">${moduleNames[key]}</div>
                        <div style="font-size: 13px; color: #666;">${moduleDescriptions[key]}</div>
                    </div>
                    <label class="switch-toggle" style="margin-left: 10px;">
                        <input type="checkbox" class="cotModuleToggle" data-module="${key}" ${module.enabled ? 'checked' : ''}>
                        <span class="switch-slider"></span>
                    </label>
                </div>
                <button class="view-prompt-btn" data-module="${key}" style="
                    width: 100%;
                    padding: 8px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #007AFF;
                    cursor: pointer;
                    margin-bottom: 5px;
                ">查看提示词</button>
                <button class="edit-prompt-btn" data-module="${key}" style="
                    width: 100%;
                    padding: 8px;
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 13px;
                    color: #34C759;
                    cursor: pointer;
                ">自定义提示词</button>
            </div>
        `;
    }
    
    modal.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">CoT 思维链设置</h3>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <div style="margin-bottom: 20px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">启用思维链</div>
                        <div style="font-size: 13px; color: #666;">让 AI 在生成回复前进行思考分析</div>
                    </div>
                    <label class="switch-toggle">
                        <input type="checkbox" id="cotMainToggle" ${cotSettings.enabled ? 'checked' : ''}>
                        <span class="switch-slider"></span>
                    </label>
                </div>
            </div>
            
            <div id="cotModulesContainer" style="${cotSettings.enabled ? '' : 'opacity: 0.5; pointer-events: none;'}">
                <div style="font-weight: 600; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #e5e5e5;">
                    思维链模块
                </div>
                
                ${modulesHtml}
                
                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                    <div style="font-weight: 600; margin-bottom: 15px;">高级选项</div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
                        <div>
                            <div style="font-weight: 500; margin-bottom: 4px;">保存思维过程</div>
                            <div style="font-size: 13px; color: #666;">用于调试和分析（会占用存储空间）</div>
                        </div>
                        <label class="switch-toggle">
                            <input type="checkbox" id="cotSaveThinking" ${cotSettings.saveThinking ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    
                    <div style="display: flex; align-items: center; justify-content: space-between;">
                        <div>
                            <div style="font-weight: 500; margin-bottom: 4px;">显示思维摘要</div>
                            <div style="font-size: 13px; color: #666;">在消息中显示简短的思维摘要</div>
                        </div>
                        <label class="switch-toggle">
                            <input type="checkbox" id="cotShowSummary" ${cotSettings.showThinkingSummary ? 'checked' : ''}>
                            <span class="switch-slider"></span>
                        </label>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                        <div style="font-weight: 600; margin-bottom: 10px;">思维链管理</div>
                        <div style="display: flex; gap: 8px; margin-bottom: 15px;">
                            <button id="viewThinkingRecordsBtn" style="
                                flex: 1;
                                padding: 10px;
                                background: #5856D6;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 13px;
                                cursor: pointer;
                            ">查看思维链记录</button>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                        <div style="font-weight: 600; margin-bottom: 10px;">导入/导出</div>
                        <div style="display: flex; gap: 8px;">
                            <button id="exportCoTBtn" style="
                                flex: 1;
                                padding: 10px;
                                background: #007AFF;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 13px;
                                cursor: pointer;
                            ">导出配置</button>
                            <button id="importCoTBtn" style="
                                flex: 1;
                                padding: 10px;
                                background: #34C759;
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 13px;
                                cursor: pointer;
                            ">导入配置</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div style="padding: 15px; border-top: 1px solid #e5e5e5; display: flex; gap: 10px;">
            <button id="cotCancelBtn" style="
                flex: 1;
                padding: 12px;
                background: #f0f0f0;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                cursor: pointer;
            ">取消</button>
            <button id="cotSaveBtn" style="
                flex: 1;
                padding: 12px;
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">保存</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 主开关切换
    const mainToggle = modal.querySelector('#cotMainToggle');
    const modulesContainer = modal.querySelector('#cotModulesContainer');
    mainToggle.addEventListener('change', () => {
        if (mainToggle.checked) {
            modulesContainer.style.opacity = '1';
            modulesContainer.style.pointerEvents = 'auto';
        } else {
            modulesContainer.style.opacity = '0.5';
            modulesContainer.style.pointerEvents = 'none';
        }
    });
    
    // 查看提示词按钮
    modal.querySelectorAll('.view-prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleKey = btn.dataset.module;
            showCoTPromptContent(moduleKey, cotSettings);
        });
    });
    
    // 编辑提示词按钮
    modal.querySelectorAll('.edit-prompt-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const moduleKey = btn.dataset.module;
            editCoTPromptContent(moduleKey, cotSettings, overlay);
        });
    });
    
    // 查看思维链记录按钮
    modal.querySelector('#viewThinkingRecordsBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
        openThinkingViewer();
    });
    
    // 导出配置按钮
    modal.querySelector('#exportCoTBtn').addEventListener('click', () => {
        exportCoTSettings(cotSettings);
    });
    
    // 导入配置按钮
    modal.querySelector('#importCoTBtn').addEventListener('click', () => {
        importCoTSettings(cotSettings, modal);
    });
    
    // 取消按钮
    modal.querySelector('#cotCancelBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // 保存按钮
    modal.querySelector('#cotSaveBtn').addEventListener('click', async () => {
        const newSettings = {
            enabled: mainToggle.checked,
            saveThinking: modal.querySelector('#cotSaveThinking').checked,
            showThinkingSummary: modal.querySelector('#cotShowSummary').checked,
            modules: {}
        };
        
        modal.querySelectorAll('.cotModuleToggle').forEach(toggle => {
            const moduleKey = toggle.dataset.module;
            newSettings.modules[moduleKey] = {
                ...cotSettings.modules[moduleKey],
                enabled: toggle.checked
            };
        });
        
        const success = await saveGroupCoTSettings(currentChatCharacter.id, newSettings);
        if (success) {
            await iosAlert('CoT 设置已保存', '成功');
            document.body.removeChild(overlay);
        } else {
            await iosAlert('保存失败，请重试', '错误');
        }
    });
    
    // 点击遮罩关闭
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}


/**
 * 显示 CoT 提示词内容
 */
function showCoTPromptContent(moduleKey, cotSettings) {
    const prompts = getCoTModulePrompts();
    const defaultContent = prompts[moduleKey] || '提示词内容未找到';
    const customContent = cotSettings.modules[moduleKey]?.customPrompt || '';
    const content = customContent || defaultContent;
    const isCustom = !!customContent;
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const modal = document.createElement('div');
    modal.className = 'ios-modal';
    modal.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 500px;
        max-height: 60vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    const moduleNames = {
        situationAnalysis: "情况分析",
        memberAnalysis: "成员反应分析",
        interactionPlanning: "虚拟时间线规划",
        permissionJudgment: "权限操作判断",
        contentGeneration: "内容生成",
        orderRandomization: "最终顺序确认"
    };
    
    modal.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">${moduleNames[moduleKey] || moduleKey}</h3>
            ${isCustom ? '<div style="font-size: 12px; color: #34C759; margin-top: 5px;">使用自定义提示词</div>' : '<div style="font-size: 12px; color: #666; margin-top: 5px;">使用默认提示词</div>'}
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            <pre style="
                white-space: pre-wrap;
                word-wrap: break-word;
                font-family: 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.6;
                background: #f8f8f8;
                padding: 15px;
                border-radius: 8px;
                margin: 0;
            ">${content}</pre>
        </div>
        <div style="padding: 15px; border-top: 1px solid #e5e5e5;">
            <button id="closePromptBtn" style="
                width: 100%;
                padding: 12px;
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">关闭</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    modal.querySelector('#closePromptBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

/**
 * 编辑 CoT 提示词内容
 */
function editCoTPromptContent(moduleKey, cotSettings, parentOverlay) {
    const prompts = getCoTModulePrompts();
    const defaultContent = prompts[moduleKey] || '';
    const customContent = cotSettings.modules[moduleKey]?.customPrompt || '';
    const displayContent = customContent || defaultContent; // 显示自定义或默认
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 400px;
        max-height: 55vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    const moduleNames = {
        situationAnalysis: "情况分析",
        memberAnalysis: "成员反应分析",
        interactionPlanning: "虚拟时间线规划",
        permissionJudgment: "权限操作判断",
        contentGeneration: "内容生成",
        orderRandomization: "最终顺序确认"
    };
    
    modal.innerHTML = `
        <div style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
            <h3 style="margin: 0; font-size: 15px; font-weight: 600;">编辑：${moduleNames[moduleKey]}</h3>
            <div style="font-size: 11px; color: #666; margin-top: 3px;">修改后留空可恢复默认</div>
        </div>
        <div style="flex: 1; overflow-y: auto; padding: 12px;">
            <textarea id="customPromptInput" style="
                width: 100%;
                min-height: 120px;
                max-height: 200px;
                padding: 10px;
                border: 1px solid #ddd;
                border-radius: 8px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
                resize: vertical;
                box-sizing: border-box;
            " placeholder="输入自定义提示词...">${displayContent}</textarea>
        </div>
        <div style="padding: 10px; border-top: 1px solid #e5e5e5; display: flex; gap: 6px;">
            <button id="resetPromptBtn" style="
                flex: 1;
                padding: 9px;
                background: #FF3B30;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
            ">恢复默认</button>
            <button id="cancelEditBtn" style="
                flex: 1;
                padding: 9px;
                background: #f0f0f0;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                cursor: pointer;
            ">取消</button>
            <button id="saveEditBtn" style="
                flex: 1;
                padding: 9px;
                background: #34C759;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 12px;
                font-weight: 600;
                cursor: pointer;
            ">保存</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const textarea = modal.querySelector('#customPromptInput');
    
    // 恢复默认按钮
    modal.querySelector('#resetPromptBtn').addEventListener('click', () => {
        textarea.value = defaultContent;
    });
    
    // 取消按钮
    modal.querySelector('#cancelEditBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    // 保存按钮
    modal.querySelector('#saveEditBtn').addEventListener('click', () => {
        const newValue = textarea.value.trim();
        // 如果和默认内容相同，则清空自定义（使用默认）
        cotSettings.modules[moduleKey].customPrompt = (newValue === defaultContent) ? '' : newValue;
        document.body.removeChild(overlay);
        
        // 创建高层级提示
        const alertOverlay = document.createElement('div');
        alertOverlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        `;
        
        const alertBox = document.createElement('div');
        alertBox.style.cssText = `
            background: white;
            border-radius: 14px;
            padding: 20px;
            max-width: 300px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        `;
        
        alertBox.innerHTML = `
            <div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">提示</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">自定义提示词已保存到临时设置<br>点击主界面的"保存"按钮以永久保存</div>
            <button style="
                width: 100%;
                padding: 12px;
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: 600;
                cursor: pointer;
            ">确定</button>
        `;
        
        alertOverlay.appendChild(alertBox);
        document.body.appendChild(alertOverlay);
        
        alertBox.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(alertOverlay);
        });
        
        alertOverlay.addEventListener('click', (e) => {
            if (e.target === alertOverlay) {
                document.body.removeChild(alertOverlay);
            }
        });
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

/**
 * 获取 CoT 模块提示词映射
 */
function getCoTModulePrompts() {
    return {
        situationAnalysis: `第一步：理解当前情况
- 用户刚才说了什么？主要话题是什么？
- 用户的语气和情绪如何？（开心/生气/疑问/命令等）
- 用户有没有@某个成员？有没有针对某个成员说话？
- 当前聊天氛围如何？（轻松/严肃/争吵/冷场等）`,
        
        memberAnalysis: `第二步：分析成员反应与发言意愿

对每个成员进行详细分析：

【成员A分析】
- 性格特点：[活跃/内向/幽默/严肃等]
- 与用户关系：[亲密/普通/陌生]
- 对当前话题的态度：[感兴趣/无感/反对/支持]
- 是否应该发言：是/否
  * 原因：[为什么要说话/为什么保持沉默]
- 发言积极性：高/中/低
- 可能发言次数：[1-3次]
  * 第1次：[初始反应]
  * 第2次：[是否会追加/回应他人]
  * 第3次：[是否会继续互动]

【成员B分析】
- 性格特点：...
- 与用户关系：...
- 对当前话题的态度：...
- 是否应该发言：是/否
  * 原因：...
- 发言积极性：高/中/低
- 可能发言次数：[1-3次]
  * 第1次：...
  * 第2次：...

【成员C分析】
（继续分析其他成员...）

【关键判断】
- 谁最可能先说话？
- 谁可能会多次发言？
- 谁可能只说一句就不说了？
- 谁可能完全不说话？
- 谁和谁之间可能产生互动？`,
        
        interactionPlanning: `第三步：规划虚拟时间线（多轮动态互动）

【核心理念】模拟真实群聊中的动态互动过程，成员可以看到彼此的消息并做出反应！

【第一阶段：初始反应分析】
1. 谁会最先看到用户消息？
   - 被@的人 → 最优先
   - 话题相关度高的人 → 很快注意到
   - 性格活跃的人 → 反应快
   - 在线状态/时间因素 → 可能影响

2. 第一波反应（1-2人）：
   - 时间点1: [成员X] 看到用户消息，立即回复："..."（简短/完整回复）
   - 时间点2: [成员Y] 也看到用户消息，回复："..."（可能和X同时，也可能稍晚）

【第二阶段：互相回应】
3. 谁会注意到第一波的消息？
   - 其他成员看到X和Y的回复
   - 谁会被X或Y的话触动？
   - 谁会想要补充/反驳/附和？

4. 第二波互动（1-3人）：
   - 时间点3: [成员X] 看到Y的回复，追加评论："..."
   - 时间点4: [成员Z] 看到XY的对话，插话："..."
   - 时间点5: [成员Y] 回应Z的插话："..."

【第三阶段：深入互动（可选）】
5. 对话是否继续？
   - 话题是否引发更多讨论？
   - 是否有成员想要继续发言？
   - 是否达到自然的对话终点？

6. 第三波互动（0-2人）：
   - 时间点6: [成员W] 最后补充："..."
   - 或者对话自然结束

【关键规则】
- ✅ 每个成员可以发言多次（1-3次都可以）
- ✅ 后面的成员能"看到"前面成员说的话
- ✅ 发言顺序完全取决于当前情况，每次都不同
- ✅ 模拟真实的"看到消息→思考→回复"过程
- ❌ 不要固定的ABAB或ABCABC模式
- ❌ 不要让所有人都说话（有人可能不感兴趣）
- ❌ 不要让对话过长（3-6条消息即可）

【输出格式规划】
最终JSON的顺序 = 虚拟时间线的顺序
例如：时间线是 X→Y→X→Z→Y，则JSON为：
{
  "X": ["第1条", "第3条"],
  "Y": ["第2条", "第5条"],
  "Z": ["第4条"]
}

记住：这是一次性生成，但要模拟出多轮互动的真实感！`,
        
        permissionJudgment: `第四步：权限操作判断（如适用）
- 是否需要使用管理权限？
  * 有人违规了吗？→ 需要禁言/踢人
  * 有人表现突出吗？→ 需要设置管理员/头衔
  * 群主要转让吗？→ 需要转让群主

- 谁有权限执行？
  * 群主：[成员名]，可以执行：所有操作
  * 管理员：[成员名]，可以执行：禁言、踢人

- 执行时机：
  * 在哪条消息中执行？
  * 如何自然地融入对话？`,
        
        contentGeneration: `第五步：按虚拟时间线生成具体内容

【重要】按照第三步规划的时间线，逐条生成消息内容！

按时间顺序生成：

━━━ 时间点1 ━━━
成员：[成员X]
情境：刚看到用户的消息
心理：[他/她此刻的想法和情绪]
内容：[具体要说的话]
风格：[符合性格的表达方式]

━━━ 时间点2 ━━━
成员：[成员Y]
情境：看到用户消息，可能也看到了成员X的回复
心理：[他/她此刻的想法]
内容：[具体要说的话，可以回应X]
风格：[符合性格]

━━━ 时间点3 ━━━
成员：[成员X]（第二次发言）
情境：看到成员Y的回复，想要追加
心理：[为什么要继续说]
内容：[追加的内容]
风格：[保持一致]

━━━ 时间点4 ━━━
成员：[成员Z]
情境：看到XY的对话，决定插话
心理：[他/她的想法]
内容：[插话内容]
风格：[符合性格]

（继续按时间线生成...）

【生成要点】
- 每条消息都要考虑"此时此刻成员能看到什么"
- 后面的消息可以引用/回应前面的消息
- 使用@、引用、表情包等让互动更真实
- 每个成员的多条消息要保持连贯性
- 权限指令（如[mute:xxx]）要自然融入对话

【最终整理】
将所有消息按成员归类，但保持时间顺序：
- 成员X: [时间点1的消息, 时间点3的消息]
- 成员Y: [时间点2的消息, 时间点5的消息]
- 成员Z: [时间点4的消息]`,
        
        orderRandomization: `【第六步：最终顺序确认与输出】

现在要将虚拟时间线转换为JSON输出格式！

【转换规则】
1. 回顾虚拟时间线：
   时间点1: 成员X - "消息A"
   时间点2: 成员Y - "消息B"  
   时间点3: 成员X - "消息C"
   时间点4: 成员Z - "消息D"
   时间点5: 成员Y - "消息E"

2. 按成员归类（保持时间顺序）：
   成员X: ["消息A", "消息C"]
   成员Y: ["消息B", "消息E"]
   成员Z: ["消息D"]

3. JSON输出顺序 = 每个成员第一次出现的时间点：
   - 成员X第一次出现在时间点1
   - 成员Y第一次出现在时间点2
   - 成员Z第一次出现在时间点4
   
   所以JSON顺序为：X → Y → Z

【关键检查】
✅ JSON顺序是否反映了虚拟时间线？
✅ 每个成员的多条消息是否按时间顺序排列？
✅ 这次的顺序和上次不同吗？
✅ 是否避免了固定的ABAB或ABCABC模式？
✅ 被禁言的成员是否已完全排除？

【为什么这样做】
- 真实群聊中，消息顺序是动态的
- 每次对话的情况不同，顺序自然不同
- 通过虚拟时间线，我们模拟了真实的互动过程
- 成员可以"看到"并回应彼此的消息
- 避免了机械的固定模式

【最终输出示例】
{
  "成员X": ["消息A", "消息C"],
  "成员Y": ["消息B", "消息E"],
  "成员Z": ["消息D"]
}

这个顺序完全由当前情况决定，下次可能完全不同！`

    };
}


/**
 * 生成思维摘要
 */
function generateThinkingSummary(thinking) {
    if (!thinking) return '';
    
    // 提取关键信息
    const lines = thinking.split('\n').filter(line => line.trim());
    const summary = [];
    
    // 提取每个步骤的关键点（取前2行）
    let currentStep = '';
    let stepLines = 0;
    
    for (const line of lines) {
        if (line.match(/第[一二三四五]步/)) {
            currentStep = line;
            stepLines = 0;
            summary.push(currentStep);
        } else if (currentStep && stepLines < 2 && line.trim().startsWith('-')) {
            summary.push(line);
            stepLines++;
        }
    }
    
    return summary.slice(0, 8).join('\n'); // 最多8行
}

/**
 * 在消息中显示思维摘要
 */
function appendThinkingSummaryToChat(thinking) {
    const summary = generateThinkingSummary(thinking);
    if (!summary) return;
    
    const chatMessages = document.getElementById('chatMessages');
    if (!chatMessages) return;
    
    const summaryDiv = document.createElement('div');
    summaryDiv.className = 'thinking-summary-message';
    summaryDiv.style.cssText = `
        margin: 10px 15px;
        padding: 10px 15px;
        background: #f0f0f0;
        border-left: 3px solid #007AFF;
        border-radius: 8px;
        font-size: 12px;
        color: #666;
        line-height: 1.6;
        white-space: pre-wrap;
    `;
    
    summaryDiv.innerHTML = `
        <div style="font-weight: 600; color: #007AFF; margin-bottom: 5px;">💭 AI 思维过程摘要</div>
        <div>${summary}</div>
    `;
    
    chatMessages.appendChild(summaryDiv);
}


/**
 * 初始化 CoT 功能
 */
function initCoTFeature() {
    console.log('CoT 思维链功能已加载');
    
    // 检查必要的函数是否存在
    if (typeof buildCoTPrompt !== 'function') {
        console.error('buildCoTPrompt 函数未找到，请检查 prompts.js');
    }
    
    if (typeof parseCoTResponse !== 'function') {
        console.error('parseCoTResponse 函数未找到');
    }
    
    console.log('CoT 功能初始化完成');
}

// 页面加载时初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCoTFeature);
} else {
    initCoTFeature();
}


/**
 * 为现有群聊添加默认 CoT 设置（向后兼容）
 */
async function migrateGroupsToCoT() {
    try {
        if (!db) {
            console.warn('数据库尚未初始化，跳过迁移');
            return 0;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        
        // 使用 Promise 包装 getAll
        const allChars = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!Array.isArray(allChars)) {
            console.warn('获取角色列表失败');
            return 0;
        }
        
        let migratedCount = 0;
        
        for (const char of allChars) {
            if ((char.isGroup || char.groupType === 'group') && (!char.settings || !char.settings.cot)) {
                if (!char.settings) {
                    char.settings = {};
                }
                char.settings.cot = getDefaultCoTSettings();
                
                await new Promise((resolve, reject) => {
                    const putRequest = store.put(char);
                    putRequest.onsuccess = () => resolve();
                    putRequest.onerror = () => reject(putRequest.error);
                });
                
                migratedCount++;
            }
        }
        
        if (migratedCount > 0) {
            console.log(`已为 ${migratedCount} 个群聊添加默认 CoT 设置`);
        }
        
        return migratedCount;
    } catch (error) {
        console.error('迁移群聊 CoT 设置失败:', error);
        return 0;
    }
}

// 在数据库加载后执行迁移 - 使用更长的延迟
window.addEventListener('load', () => {
    setTimeout(() => {
        if (db) {
            migrateGroupsToCoT();
        }
    }, 5000);
});


/**
 * 导出 CoT 配置
 */
function exportCoTSettings(cotSettings) {
    const exportData = {
        version: '1.0',
        exportTime: new Date().toISOString(),
        settings: cotSettings
    };
    
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `cot-settings-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    iosAlert('CoT 配置已导出', '成功');
}

/**
 * 导入 CoT 配置
 */
function importCoTSettings(cotSettings, modal) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const importData = JSON.parse(text);
            
            if (!importData.settings || !importData.settings.modules) {
                throw new Error('配置文件格式错误');
            }
            
            // 合并导入的设置
            Object.assign(cotSettings, importData.settings);
            
            // 更新界面
            modal.querySelector('#cotMainToggle').checked = cotSettings.enabled;
            modal.querySelector('#cotSaveThinking').checked = cotSettings.saveThinking;
            modal.querySelector('#cotShowSummary').checked = cotSettings.showThinkingSummary;
            
            // 更新模块开关
            modal.querySelectorAll('.cotModuleToggle').forEach(toggle => {
                const moduleKey = toggle.dataset.module;
                if (cotSettings.modules[moduleKey]) {
                    toggle.checked = cotSettings.modules[moduleKey].enabled;
                }
            });
            
            await iosAlert('CoT 配置已导入\n请点击"保存"按钮以应用更改', '成功');
        } catch (error) {
            console.error('导入配置失败:', error);
            await iosAlert('导入失败：' + error.message, '错误');
        }
    };
    
    input.click();
}


// ==================== 思维链记录管理 ====================

/**
 * 保存思维链记录
 */
async function saveThinkingRecord(groupId, thinking, userMessage) {
    try {
        console.log('💾 开始保存思维链记录, groupId:', groupId);
        
        if (!db) {
            console.error('数据库未初始化');
            return false;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData) {
            console.error('群聊数据不存在, groupId:', groupId);
            return false;
        }
        
        console.log('💾 找到群聊数据:', groupData.groupName || groupData.name);
        
        // 初始化思维链记录数组
        if (!groupData.thinkingRecords) {
            groupData.thinkingRecords = [];
            console.log('💾 初始化 thinkingRecords 数组');
        }
        
        // 添加新记录
        const record = {
            id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            userMessage: userMessage || '',
            thinking: thinking
        };
        
        groupData.thinkingRecords.push(record);
        console.log('💾 添加新记录, 当前记录数:', groupData.thinkingRecords.length);
        console.log('💾 记录详情:', record);
        
        // 获取保留设置，默认保留最近1条
        const cotSettings = groupData.settings?.cot || {};
        const keepRecent = cotSettings.keepRecentThinking || 1;
        console.log('💾 保留设置: 最近', keepRecent, '条');
        
        // 只保留最近N条
        if (groupData.thinkingRecords.length > keepRecent) {
            groupData.thinkingRecords = groupData.thinkingRecords.slice(-keepRecent);
            console.log('💾 清理旧记录后, 剩余记录数:', groupData.thinkingRecords.length);
        }
        
        console.log('💾 准备保存的数据:', {
            id: groupData.id,
            thinkingRecordsCount: groupData.thinkingRecords.length,
            thinkingRecords: groupData.thinkingRecords
        });
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => {
                console.log('💾 put操作成功');
                resolve();
            };
            request.onerror = () => {
                console.error('💾 put操作失败:', request.error);
                reject(request.error);
            };
        });
        
        // 等待事务完成
        await new Promise((resolve, reject) => {
            tx.oncomplete = () => {
                console.log('💾 事务完成');
                resolve();
            };
            tx.onerror = () => {
                console.error('💾 事务失败:', tx.error);
                reject(tx.error);
            };
        });
        
        console.log('💾 思维链记录已保存到数据库');
        
        // 立即验证保存结果
        const verifyTx = db.transaction(['chatCharacters'], 'readonly');
        const verifyStore = verifyTx.objectStore('chatCharacters');
        const verifyData = await new Promise((resolve, reject) => {
            const request = verifyStore.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        console.log('💾 验证保存结果 - thinkingRecords存在:', !!verifyData?.thinkingRecords);
        console.log('💾 验证保存结果 - 记录数量:', verifyData?.thinkingRecords?.length || 0);
        
        // 更新内存中的 currentChatCharacter 对象
        if (typeof currentChatCharacter !== 'undefined' && currentChatCharacter && currentChatCharacter.id === groupId) {
            currentChatCharacter.thinkingRecords = verifyData.thinkingRecords;
            console.log('💾 已更新 currentChatCharacter 的 thinkingRecords');
        }
        
        return true;
    } catch (error) {
        console.error('保存思维链记录失败:', error);
        return false;
    }
}

/**
 * 获取思维链记录
 */
async function getThinkingRecords(groupId) {
    try {
        console.log('📖 开始读取思维链记录, groupId:', groupId);
        
        if (!db) {
            console.error('数据库未初始化');
            return [];
        }
        
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        console.log('📖 读取到的群聊数据:', groupData ? (groupData.groupName || groupData.name) : 'null');
        console.log('📖 thinkingRecords字段存在:', !!groupData?.thinkingRecords);
        console.log('📖 thinkingRecords内容:', groupData?.thinkingRecords);
        
        return groupData?.thinkingRecords || [];
    } catch (error) {
        console.error('获取思维链记录失败:', error);
        return [];
    }
}

/**
 * 删除指定的思维链记录
 */
async function deleteThinkingRecords(groupId, recordIds) {
    try {
        if (!db) {
            console.error('数据库未初始化');
            return false;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData || !groupData.thinkingRecords) {
            return false;
        }
        
        // 过滤掉要删除的记录
        groupData.thinkingRecords = groupData.thinkingRecords.filter(
            record => !recordIds.includes(record.id)
        );
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        return true;
    } catch (error) {
        console.error('删除思维链记录失败:', error);
        return false;
    }
}

/**
 * 清空所有思维链记录
 */
async function clearAllThinkingRecords(groupId) {
    try {
        if (!db) {
            console.error('数据库未初始化');
            return false;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData) {
            return false;
        }
        
        groupData.thinkingRecords = [];
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        return true;
    } catch (error) {
        console.error('清空思维链记录失败:', error);
        return false;
    }
}

/**
 * 打开思维链查看面板
 */
async function openThinkingViewer() {
    console.log('openThinkingViewer 被调用');
    
    // 检查是否是群聊
    if (!currentChatCharacter) {
        await iosAlert('请先选择一个群聊', '提示');
        return;
    }
    
    if (!currentChatCharacter.isGroup && currentChatCharacter.groupType !== 'group') {
        await iosAlert('当前不是群聊', '提示');
        return;
    }
    
    console.log('当前群聊ID:', currentChatCharacter.id);
    const records = await getThinkingRecords(currentChatCharacter.id);
    console.log('获取到的思维链记录数量:', records.length);
    console.log('思维链记录详情:', records);
    const cotSettings = await getGroupCoTSettings(currentChatCharacter.id);
    
    // 创建遮罩层
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    // 创建模态框
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 400px;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    // 构建记录列表HTML
    let recordsHtml = '';
    if (records.length === 0) {
        recordsHtml = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <div style="font-size: 16px; margin-bottom: 10px;">暂无思维链记录</div>
                <div style="font-size: 13px; line-height: 1.6; color: #666;">
                    可能的原因：<br>
                    1. 还没有发送过消息<br>
                    2. "保存思维过程"选项未开启<br>
                    3. CoT主开关未开启<br>
                    <br>
                    请在CoT设置中开启"保存思维过程"
                </div>
            </div>
        `;
    } else {
        recordsHtml = records.map(record => {
            const date = new Date(record.timestamp);
            const timeStr = `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            const thinkingPreview = record.thinking.substring(0, 100) + (record.thinking.length > 100 ? '...' : '');
            
            return `
                <div class="thinking-record-item" data-record-id="${record.id}" style="
                    margin-bottom: 15px;
                    padding: 15px;
                    background: #f8f8f8;
                    border-radius: 10px;
                    border: 2px solid transparent;
                    transition: all 0.2s;
                ">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <input type="checkbox" class="record-checkbox" data-record-id="${record.id}" style="
                            width: 18px;
                            height: 18px;
                            margin-right: 10px;
                            cursor: pointer;
                        ">
                        <div style="flex: 1;">
                            <div style="font-size: 13px; color: #666; margin-bottom: 4px;">${timeStr}</div>
                            ${record.userMessage ? `<div style="font-size: 14px; color: #333; margin-bottom: 4px;">用户：${record.userMessage}</div>` : ''}
                        </div>
                        <button class="view-thinking-btn" data-record-id="${record.id}" style="
                            padding: 6px 12px;
                            background: #007AFF;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            font-size: 13px;
                            cursor: pointer;
                        ">查看详情</button>
                    </div>
                    <div style="font-size: 13px; color: #666; line-height: 1.5; white-space: pre-wrap;">${thinkingPreview}</div>
                </div>
            `;
        }).join('');
    }
    
    modal.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">思维链记录查看器</h3>
            <div style="font-size: 13px; color: #666; margin-top: 5px;">共 ${records.length} 条记录</div>
        </div>
        
        <div style="padding: 15px 20px; border-bottom: 1px solid #e5e5e5; background: #f9f9f9;">
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                <label style="display: flex; align-items: center; gap: 5px; font-size: 14px;">
                    <input type="checkbox" id="selectAllCheckbox" style="width: 18px; height: 18px; cursor: pointer;">
                    全选
                </label>
                <button id="deleteSelectedBtn" style="
                    padding: 8px 16px;
                    background: #FF3B30;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                " disabled>删除选中</button>
                <button id="clearAllBtn" style="
                    padding: 8px 16px;
                    background: #FF9500;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                ">清空全部</button>
            </div>
            
            <div style="display: flex; align-items: center; gap: 10px;">
                <label style="font-size: 14px; color: #333;">保留最近：</label>
                <input type="number" id="keepRecentInput" value="${cotSettings.keepRecentThinking || 1}" min="1" max="100" style="
                    width: 80px;
                    padding: 6px 10px;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-size: 14px;
                ">
                <label style="font-size: 14px; color: #333;">条记录</label>
                <button id="saveKeepSettingBtn" style="
                    padding: 6px 12px;
                    background: #34C759;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-size: 13px;
                    cursor: pointer;
                ">保存设置</button>
            </div>
        </div>
        
        <div id="recordsContainer" style="flex: 1; overflow-y: auto; padding: 20px;">
            ${recordsHtml}
        </div>
        
        <div style="padding: 15px 20px; border-top: 1px solid #e5e5e5; display: flex; gap: 10px;">
            <button id="closeViewerBtn" style="
                flex: 1;
                padding: 12px;
                background: #f0f0f0;
                color: #333;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                cursor: pointer;
            ">关闭</button>
        </div>
    `;
    
    // 关闭按钮
    modal.querySelector('#closeViewerBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
    
    // 全选功能
    const selectAllCheckbox = modal.querySelector('#selectAllCheckbox');
    const recordCheckboxes = modal.querySelectorAll('.record-checkbox');
    const deleteSelectedBtn = modal.querySelector('#deleteSelectedBtn');
    
    selectAllCheckbox.addEventListener('change', () => {
        recordCheckboxes.forEach(cb => {
            cb.checked = selectAllCheckbox.checked;
        });
        updateDeleteButton();
    });
    
    recordCheckboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            updateDeleteButton();
            // 更新全选状态
            const allChecked = Array.from(recordCheckboxes).every(c => c.checked);
            const someChecked = Array.from(recordCheckboxes).some(c => c.checked);
            selectAllCheckbox.checked = allChecked;
            selectAllCheckbox.indeterminate = someChecked && !allChecked;
        });
    });
    
    function updateDeleteButton() {
        const checkedCount = Array.from(recordCheckboxes).filter(cb => cb.checked).length;
        deleteSelectedBtn.disabled = checkedCount === 0;
        deleteSelectedBtn.textContent = checkedCount > 0 ? `删除选中 (${checkedCount})` : '删除选中';
    }
    
    // 删除选中
    deleteSelectedBtn.addEventListener('click', async () => {
        const checkedIds = Array.from(recordCheckboxes)
            .filter(cb => cb.checked)
            .map(cb => cb.dataset.recordId);
        
        if (checkedIds.length === 0) return;
        
        const confirmed = await iosConfirm(`确定要删除选中的 ${checkedIds.length} 条记录吗？`, '确认删除');
        if (!confirmed) return;
        
        const success = await deleteThinkingRecords(currentChatCharacter.id, checkedIds);
        if (success) {
            await iosAlert('删除成功', '提示');
            document.body.removeChild(overlay);
            openThinkingViewer(); // 重新打开
        } else {
            await iosAlert('删除失败', '错误');
        }
    });
    
    // 清空全部
    modal.querySelector('#clearAllBtn').addEventListener('click', async () => {
        if (records.length === 0) {
            await iosAlert('没有记录可清空', '提示');
            return;
        }
        
        const confirmed = await iosConfirm(`确定要清空全部 ${records.length} 条记录吗？`, '确认清空');
        if (!confirmed) return;
        
        const success = await clearAllThinkingRecords(currentChatCharacter.id);
        if (success) {
            await iosAlert('清空成功', '提示');
            document.body.removeChild(overlay);
            openThinkingViewer(); // 重新打开
        } else {
            await iosAlert('清空失败', '错误');
        }
    });
    
    // 保存保留设置
    modal.querySelector('#saveKeepSettingBtn').addEventListener('click', async () => {
        const keepRecent = parseInt(modal.querySelector('#keepRecentInput').value);
        if (isNaN(keepRecent) || keepRecent < 1) {
            await iosAlert('请输入有效的数字（至少为1）', '提示');
            return;
        }
        
        cotSettings.keepRecentThinking = keepRecent;
        const success = await saveGroupCoTSettings(currentChatCharacter.id, cotSettings);
        
        if (success) {
            await iosAlert('设置已保存', '成功');
        } else {
            await iosAlert('保存失败', '错误');
        }
    });
    
    // 查看详情按钮
    modal.querySelectorAll('.view-thinking-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const recordId = btn.dataset.recordId;
            const record = records.find(r => r.id === recordId);
            if (record) {
                showThinkingDetail(record);
            }
        });
    });
}

/**
 * 显示思维链详情
 */
function showThinkingDetail(record) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 100000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
    `;
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        background: white;
        border-radius: 14px;
        width: 90%;
        max-width: 400px;
        max-height: 70vh;
        display: flex;
        flex-direction: column;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3);
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const date = new Date(record.timestamp);
    const timeStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
    
    modal.innerHTML = `
        <div style="padding: 20px; border-bottom: 1px solid #e5e5e5;">
            <h3 style="margin: 0; font-size: 18px; font-weight: 600;">思维链详情</h3>
            <div style="font-size: 13px; color: #666; margin-top: 5px;">${timeStr}</div>
        </div>
        
        <div style="flex: 1; overflow-y: auto; padding: 20px;">
            ${record.userMessage ? `
                <div style="margin-bottom: 20px;">
                    <div style="font-weight: 600; margin-bottom: 8px; color: #333;">用户消息：</div>
                    <div style="padding: 12px; background: #f0f0f0; border-radius: 8px; font-size: 14px; line-height: 1.6;">
                        ${record.userMessage}
                    </div>
                </div>
            ` : ''}
            
            <div>
                <div style="font-weight: 600; margin-bottom: 8px; color: #333;">思维过程：</div>
                <div style="padding: 15px; background: #f8f8f8; border-radius: 8px; font-size: 14px; line-height: 1.8; white-space: pre-wrap; font-family: 'Courier New', monospace;">
                    ${record.thinking}
                </div>
            </div>
        </div>
        
        <div style="padding: 15px 20px; border-top: 1px solid #e5e5e5; display: flex; gap: 10px;">
            <button id="copyThinkingBtn" style="
                flex: 1;
                padding: 12px;
                background: #007AFF;
                color: white;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                cursor: pointer;
            ">复制思维链</button>
            <button id="closeDetailBtn" style="
                flex: 1;
                padding: 12px;
                background: #f0f0f0;
                color: #333;
                border: none;
                border-radius: 8px;
                font-size: 15px;
                cursor: pointer;
            ">关闭</button>
        </div>
    `;
    
    // 复制按钮
    modal.querySelector('#copyThinkingBtn').addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(record.thinking);
            await iosAlert('已复制到剪贴板', '成功');
        } catch (error) {
            console.error('复制失败:', error);
            await iosAlert('复制失败', '错误');
        }
    });
    
    // 关闭按钮
    modal.querySelector('#closeDetailBtn').addEventListener('click', () => {
        document.body.removeChild(overlay);
    });
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}


// ==================== 群公告功能 ====================

/**
 * 打开群公告管理界面
 */
async function openGroupAnnouncement() {
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        await iosAlert('请先打开一个群聊', '提示');
        return;
    }
    
    const announcements = await getGroupAnnouncements(currentChatCharacter.id);
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10005;display:flex;align-items:center;justify-content:center;padding:20px;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    let announcementsHtml = '';
    if (announcements.length === 0) {
        announcementsHtml = '<div style="text-align:center;padding:40px;color:#999;">暂无公告</div>';
    } else {
        announcementsHtml = announcements.map(ann => {
            const date = new Date(ann.timestamp);
            const timeStr = `${date.getMonth()+1}月${date.getDate()}日 ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            return `
                <div style="margin-bottom:15px;padding:15px;background:#f8f8f8;border-radius:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <div style="font-size:13px;color:#666;">${timeStr}</div>
                        <button onclick="deleteAnnouncement('${ann.id}')" style="padding:4px 10px;background:#ff3b30;color:white;border:none;border-radius:6px;font-size:12px;cursor:pointer;">删除</button>
                    </div>
                    <div style="font-size:14px;color:#333;line-height:1.6;white-space:pre-wrap;">${escapeHtml(ann.content)}</div>
                </div>
            `;
        }).join('');
    }
    
    modal.innerHTML = `
        <div style="padding:20px;border-bottom:1px solid #e5e5e5;">
            <h3 style="margin:0;font-size:18px;font-weight:600;">群公告</h3>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;" id="announcementList">${announcementsHtml}</div>
        <div style="padding:15px 20px;border-top:1px solid #e5e5e5;display:flex;gap:10px;">
            <button onclick="closeAnnouncementModal()" style="flex:1;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">关闭</button>
            <button onclick="openAddAnnouncement()" style="flex:1;padding:12px;background:#007AFF;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">发布公告</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.id = 'announcementOverlay';
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function closeAnnouncementModal() {
    const overlay = document.getElementById('announcementOverlay');
    if (overlay) document.body.removeChild(overlay);
}


/**
 * 打开发布公告界面
 */
function openAddAnnouncement() {
    closeAnnouncementModal();
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10006;display:flex;align-items:center;justify-content:center;padding:20px;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
        <div style="padding:20px;border-bottom:1px solid #e5e5e5;">
            <h3 style="margin:0;font-size:18px;font-weight:600;">发布群公告</h3>
        </div>
        <div style="padding:20px;">
            <textarea id="announcementContent" placeholder="输入公告内容..." style="width:100%;min-height:120px;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;line-height:1.6;resize:vertical;box-sizing:border-box;" maxlength="500"></textarea>
            <div style="margin-top:8px;font-size:12px;color:#999;">最多500字</div>
        </div>
        <div style="padding:15px 20px;border-top:1px solid #e5e5e5;display:flex;gap:10px;">
            <button onclick="closeAddAnnouncementModal()" style="flex:1;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">取消</button>
            <button onclick="publishAnnouncement()" style="flex:1;padding:12px;background:#007AFF;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">发布</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.id = 'addAnnouncementOverlay';
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function closeAddAnnouncementModal() {
    const overlay = document.getElementById('addAnnouncementOverlay');
    if (overlay) document.body.removeChild(overlay);
}

/**
 * 发布公告
 */
async function publishAnnouncement() {
    const content = document.getElementById('announcementContent').value.trim();
    if (!content) {
        await iosAlert('请输入公告内容', '提示');
        return;
    }
    
    const announcement = {
        id: Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        content: content,
        timestamp: new Date().toISOString(),
        publisher: 'user'
    };
    
    await saveGroupAnnouncement(currentChatCharacter.id, announcement);
    
    // 更新内存中的currentChatCharacter对象
    if (currentChatCharacter) {
        if (!currentChatCharacter.announcements) {
            currentChatCharacter.announcements = [];
        }
        currentChatCharacter.announcements.unshift(announcement);
    }
    
    // 更新chatCharacters数组中的对象
    const charIndex = chatCharacters.findIndex(c => c.id === currentChatCharacter.id);
    if (charIndex >= 0) {
        if (!chatCharacters[charIndex].announcements) {
            chatCharacters[charIndex].announcements = [];
        }
        chatCharacters[charIndex].announcements.unshift(announcement);
    }
    
    // 在聊天界面显示系统消息
    const systemMsg = {
        id: Date.now().toString() + Math.random() + '_announcement',
        characterId: currentChatCharacter.id,
        content: `群公告已更新：\n${content}`,
        type: 'system',
        timestamp: new Date().toISOString(),
        sender: 'system',
        messageType: 'systemNotice'
    };
    
    if (typeof saveMessageToDB === 'function') {
        await saveMessageToDB(systemMsg);
    }
    
    if (typeof appendMessageToChat === 'function') {
        appendMessageToChat(systemMsg);
    }
    
    if (typeof scrollChatToBottom === 'function') {
        scrollChatToBottom();
    }
    
    closeAddAnnouncementModal();
    await iosAlert('公告发布成功', '成功');
    openGroupAnnouncement();
}


/**
 * 获取群公告列表
 */
async function getGroupAnnouncements(groupId) {
    try {
        if (!db) return [];
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return groupData?.announcements || [];
    } catch (error) {
        console.error('获取群公告失败:', error);
        return [];
    }
}

/**
 * 保存群公告
 */
async function saveGroupAnnouncement(groupId, announcement) {
    try {
        if (!db) return false;
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        if (!groupData) return false;
        if (!groupData.announcements) groupData.announcements = [];
        groupData.announcements.unshift(announcement);
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        return true;
    } catch (error) {
        console.error('保存群公告失败:', error);
        return false;
    }
}

/**
 * 删除群公告
 */
async function deleteAnnouncement(announcementId) {
    const confirmed = await iosConfirm('确定要删除这条公告吗？', '确认删除');
    if (!confirmed) return;
    
    try {
        if (!db) return;
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(currentChatCharacter.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        if (!groupData || !groupData.announcements) return;
        groupData.announcements = groupData.announcements.filter(a => a.id !== announcementId);
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        // 更新内存中的currentChatCharacter对象
        if (currentChatCharacter && currentChatCharacter.announcements) {
            currentChatCharacter.announcements = currentChatCharacter.announcements.filter(a => a.id !== announcementId);
        }
        
        // 更新chatCharacters数组中的对象
        const charIndex = chatCharacters.findIndex(c => c.id === currentChatCharacter.id);
        if (charIndex >= 0 && chatCharacters[charIndex].announcements) {
            chatCharacters[charIndex].announcements = chatCharacters[charIndex].announcements.filter(a => a.id !== announcementId);
        }
        
        await iosAlert('公告已删除', '成功');
        closeAnnouncementModal();
        openGroupAnnouncement();
    } catch (error) {
        console.error('删除公告失败:', error);
        await iosAlert('删除失败', '错误');
    }
}


// ==================== 群红包功能 ====================

/**
 * 打开发红包界面
 */
async function openSendRedPacket() {
    console.log('🎁 openSendRedPacket 被调用');
    
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        await iosAlert('请先打开一个群聊', '提示');
        return;
    }
    
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    const balance = walletData.balance || 0;
    const memberCount = currentChatCharacter.members?.length || 0;
    
    console.log('💰 钱包余额:', balance);
    console.log('👥 群成员数:', memberCount);
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10005;display:flex;align-items:center;justify-content:center;padding:20px;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
        <div style="padding:20px;border-bottom:1px solid #e5e5e5;">
            <h3 style="margin:0;font-size:18px;font-weight:600;">发红包</h3>
            <div style="font-size:13px;color:#666;margin-top:5px;">钱包余额: ¥${balance.toFixed(2)}</div>
        </div>
        <div style="padding:20px;">
            <div style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">红包类型</label>
                <div style="display:flex;gap:10px;">
                    <button id="normalRedPacketBtn" type="button" style="flex:1;padding:12px;background:#007AFF;color:white;border:none;border-radius:8px;font-size:14px;cursor:pointer;">普通红包</button>
                    <button id="luckyRedPacketBtn" type="button" style="flex:1;padding:12px;background:#f0f0f0;color:#333;border:none;border-radius:8px;font-size:14px;cursor:pointer;">拼手气红包</button>
                </div>
                <div id="redPacketTypeDesc" style="margin-top:8px;font-size:12px;color:#666;">限定人数抢，谁手快谁抢到</div>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">总金额</label>
                <input type="number" id="redPacketAmount" placeholder="0.00" step="0.01" min="0.01" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;">
            </div>
            <div id="redPacketCountSection" style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">限定抢红包人数</label>
                <input type="number" id="redPacketCount" placeholder="1" min="1" max="${memberCount}" value="1" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:16px;box-sizing:border-box;">
                <div style="margin-top:6px;font-size:12px;color:#999;">最多${memberCount}人（群成员数），只有这么多人能抢到</div>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">祝福语</label>
                <input type="text" id="redPacketMessage" placeholder="恭喜发财，大吉大利" maxlength="30" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            </div>
        </div>
        <div style="padding:15px 20px;border-top:1px solid #e5e5e5;display:flex;gap:10px;">
            <button type="button" id="cancelRedPacketBtn" style="flex:1;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">取消</button>
            <button type="button" id="confirmRedPacketBtn" style="flex:1;padding:12px;background:#ff3b30;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">塞钱进红包</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.id = 'redPacketOverlay';
    
    console.log('✅ 红包弹窗已添加到DOM');
    
    // 绑定事件
    const normalBtn = document.getElementById('normalRedPacketBtn');
    const luckyBtn = document.getElementById('luckyRedPacketBtn');
    const cancelBtn = document.getElementById('cancelRedPacketBtn');
    const confirmBtn = document.getElementById('confirmRedPacketBtn');
    
    console.log('🔘 按钮元素:', {
        normalBtn: !!normalBtn,
        luckyBtn: !!luckyBtn,
        cancelBtn: !!cancelBtn,
        confirmBtn: !!confirmBtn
    });
    
    if (normalBtn) {
        normalBtn.addEventListener('click', () => {
            console.log('🔵 普通红包按钮被点击');
            selectRedPacketType('normal');
        });
    }
    
    if (luckyBtn) {
        luckyBtn.addEventListener('click', () => {
            console.log('🟡 拼手气红包按钮被点击');
            selectRedPacketType('lucky');
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            console.log('❌ 取消按钮被点击');
            closeRedPacketModal();
        });
    }
    
    if (confirmBtn) {
        confirmBtn.addEventListener('click', () => {
            console.log('✅ 确认按钮被点击，准备发送红包');
            sendRedPacket();
        });
    }
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            console.log('🔙 点击遮罩层关闭');
            closeRedPacketModal();
        }
    });
    
    console.log('🎉 红包弹窗初始化完成');
}

let selectedRedPacketType = 'normal';

// 红包支付方式选择弹窗
function showRedPacketPaymentChoice(amount) {
    return new Promise((resolve) => {
        console.log('💳 显示支付方式选择弹窗');
        
        const data = JSON.parse(localStorage.getItem('walletData') || '{}');
        const fmt = (n) => n.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        const balanceOk = (data.balance || 0) >= amount;
        const huabeiOk = data.huabeiEnabled && ((data.huabeiTotal - data.huabeiUsed) >= amount) && !data.huabeiFrozen;
        const yuebaoOk = (data.yuebaoAmount || 0) >= amount;
        const bankCards = data.bankCards || [];

        const overlay = document.createElement('div');
        overlay.className = 'ios-dialog-overlay';
        // 设置更高的z-index，确保在红包弹窗之上，并强制显示
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10010;display:flex;align-items:center;justify-content:center;opacity:1;pointer-events:all;';

        const dialog = document.createElement('div');
        dialog.className = 'ios-dialog';
        dialog.style.width = '300px';
        dialog.style.maxHeight = '80vh';
        dialog.style.overflowY = 'auto';
        // 强制显示dialog，覆盖默认的opacity和transform
        dialog.style.opacity = '1';
        dialog.style.transform = 'scale(1)';

        const titleEl = document.createElement('div');
        titleEl.className = 'ios-dialog-title';
        titleEl.textContent = '选择支付方式';

        const msgEl = document.createElement('div');
        msgEl.className = 'ios-dialog-message';
        msgEl.textContent = `红包金额：¥${fmt(amount)}`;

        const buttonsEl = document.createElement('div');
        buttonsEl.className = 'ios-dialog-buttons vertical';

        // 余额
        const balBtn = document.createElement('button');
        balBtn.className = 'ios-dialog-button' + (balanceOk ? ' primary' : '');
        balBtn.textContent = `零钱 (¥${fmt(data.balance || 0)})`;
        balBtn.style.opacity = balanceOk ? '1' : '0.4';
        balBtn.onclick = () => {
            if (!balanceOk) { showToast('余额不足'); return; }
            console.log('✅ 选择了零钱支付');
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
            console.log('✅ 选择了花呗支付');
            close('huabei');
        };

        // 余额宝
        const ybBtn = document.createElement('button');
        ybBtn.className = 'ios-dialog-button' + (yuebaoOk ? ' primary' : '');
        ybBtn.textContent = `余额宝 (¥${fmt(data.yuebaoAmount || 0)})`;
        ybBtn.style.opacity = yuebaoOk ? '1' : '0.4';
        ybBtn.onclick = () => {
            if (!yuebaoOk) { showToast('余额宝资金不足'); return; }
            console.log('✅ 选择了余额宝支付');
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
                    console.log('✅ 选择了银行卡支付:', card.name);
                    close({ type: 'bankcard', index: index });
                };
                buttonsEl.appendChild(cardBtn);
            });
        }

        // 取消
        const cancelBtn = document.createElement('button');
        cancelBtn.className = 'ios-dialog-button';
        cancelBtn.textContent = '取消';
        cancelBtn.onclick = () => {
            console.log('❌ 取消支付');
            close(null);
        };

        buttonsEl.appendChild(cancelBtn);

        dialog.appendChild(titleEl);
        dialog.appendChild(msgEl);
        dialog.appendChild(buttonsEl);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
        
        console.log('✅ 支付方式弹窗已显示，overlay元素:', overlay);
        console.log('📍 overlay在DOM中的位置:', overlay.parentNode);
        console.log('🎨 overlay的样式:', {
            zIndex: overlay.style.zIndex,
            opacity: overlay.style.opacity,
            display: overlay.style.display,
            pointerEvents: overlay.style.pointerEvents
        });

        function close(result) {
            console.log('🔒 关闭支付弹窗，结果:', result);
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            resolve(result);
        }
    });
}


function selectRedPacketType(type) {
    console.log('🔄 切换红包类型:', type);
    
    selectedRedPacketType = type;
    const normalBtn = document.getElementById('normalRedPacketBtn');
    const luckyBtn = document.getElementById('luckyRedPacketBtn');
    const descDiv = document.getElementById('redPacketTypeDesc');
    const countSection = document.getElementById('redPacketCountSection');
    
    if (type === 'normal') {
        // 普通红包：限定人数抢
        normalBtn.style.background = '#007AFF';
        normalBtn.style.color = 'white';
        luckyBtn.style.background = '#f0f0f0';
        luckyBtn.style.color = '#333';
        if (descDiv) descDiv.textContent = '限定人数抢，谁手快谁抢到';
        if (countSection) {
            countSection.style.display = 'block';
            const label = countSection.querySelector('label');
            if (label) label.textContent = '限定抢红包人数';
            const hint = countSection.querySelector('div');
            const memberCount = currentChatCharacter?.members?.length || 0;
            if (hint) hint.textContent = `最多${memberCount}人（群成员数），只有这么多人能抢到`;
        }
        console.log('✅ 已切换到普通红包模式');
    } else {
        // 拼手气红包：所有人都能抢，不需要限制人数
        normalBtn.style.background = '#f0f0f0';
        normalBtn.style.color = '#333';
        luckyBtn.style.background = '#007AFF';
        luckyBtn.style.color = 'white';
        if (descDiv) descDiv.textContent = '所有人都能抢，金额随机';
        if (countSection) {
            // 隐藏人数限制输入框
            countSection.style.display = 'none';
        }
        console.log('✅ 已切换到拼手气红包模式');
    }
}

function closeRedPacketModal() {
    const overlay = document.getElementById('redPacketOverlay');
    if (overlay && overlay.parentNode) {
        overlay.parentNode.removeChild(overlay);
    }
}


/**
 * 发送红包
 */
async function sendRedPacket() {
    console.log('💰 sendRedPacket 函数被调用');
    console.log('📦 当前红包类型:', selectedRedPacketType);
    
    const amountInput = document.getElementById('redPacketAmount');
    const countInput = document.getElementById('redPacketCount');
    const messageInput = document.getElementById('redPacketMessage');
    
    console.log('📝 输入框元素:', {
        amountInput: !!amountInput,
        countInput: !!countInput,
        messageInput: !!messageInput
    });
    
    const amount = parseFloat(amountInput?.value || '0');
    const message = messageInput?.value?.trim() || '恭喜发财，大吉大利';
    
    // 获取群成员数量（包括用户自己）
    const memberCount = (currentChatCharacter.members?.length || 0) + 1; // +1 是用户自己
    
    // 普通红包需要人数限制，拼手气红包的count等于群成员总数
    let count = 1;
    if (selectedRedPacketType === 'normal') {
        count = parseInt(countInput?.value || '1');
    } else if (selectedRedPacketType === 'lucky') {
        // 运气红包：count = 群成员总数（包括发送者）
        count = memberCount;
    }
    
    console.log('💵 红包参数:', { amount, count, message, type: selectedRedPacketType, memberCount });
    
    if (!amount || amount <= 0) {
        console.warn('⚠️ 金额无效:', amount);
        await iosAlert('请输入有效的金额', '提示');
        return;
    }
    
    if (selectedRedPacketType === 'normal') {
        if (!count || count <= 0) {
            console.warn('⚠️ 人数无效:', count);
            await iosAlert('请输入有效的人数', '提示');
            return;
        }
        
        const memberCount = currentChatCharacter.members?.length || 0;
        if (count > memberCount) {
            console.warn('⚠️ 人数超过群成员数:', count, '>', memberCount);
            await iosAlert(`限定人数不能超过群成员数（${memberCount}）`, '提示');
            return;
        }
    }
    
    console.log('💳 准备选择支付方式...');
    
    // 选择支付方式
    const paySource = await showRedPacketPaymentChoice(amount);
    if (!paySource) {
        console.log('❌ 用户取消了支付');
        return;
    }
    
    console.log('✅ 支付方式已选择:', paySource);
    
    // 扣款
    const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
    let sourceDisplayName = '余额';
    let accountType = 'balance';
    let accountIndex = null;
    
    if (paySource === 'balance') {
        walletData.balance = Math.round((walletData.balance - amount) * 100) / 100;
        sourceDisplayName = '零钱';
        accountType = 'balance';
    } else if (paySource === 'huabei') {
        walletData.huabeiUsed = Math.round((walletData.huabeiUsed + amount) * 100) / 100;
        sourceDisplayName = '花呗';
        accountType = 'balance';
    } else if (paySource === 'yuebao') {
        walletData.yuebaoAmount = Math.round((walletData.yuebaoAmount - amount) * 100) / 100;
        sourceDisplayName = '余额宝';
        accountType = 'yuebao';
    } else if (paySource && paySource.type === 'bankcard') {
        const cardIndex = paySource.index;
        const card = walletData.bankCards[cardIndex];
        if (card) {
            card.balance = Math.round((card.balance - amount) * 100) / 100;
            sourceDisplayName = card.name || '银行卡';
            accountType = 'bankcard';
            accountIndex = cardIndex;
            
            // 发送银行转账支出短信
            if (typeof sendBankSms === 'function') {
                sendBankSms(card, 'redpacket', amount);
            }
        }
    }
    
    localStorage.setItem('walletData', JSON.stringify(walletData));
    console.log('💸 扣款成功，来源:', sourceDisplayName);
    
    // 添加账单记录
    if (typeof addBillRecord === 'function') {
        addBillRecord('expense', amount, `群红包：${message}`, accountType, accountIndex);
        console.log('📊 账单记录已添加');
    }
    
    const redPacket = {
        id: 'rp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        type: selectedRedPacketType,
        amount: amount,
        count: count, // 普通红包：限定人数；拼手气红包：固定为1
        message: message,
        sender: 'user',
        senderName: '我',
        timestamp: new Date().toISOString(),
        grabbed: [],
        remaining: amount,
        remainingCount: count,
        paymentSource: paySource
    };
    
    console.log('🎁 红包数据:', redPacket);
    
    const saveResult = await saveRedPacketToGroup(currentChatCharacter.id, redPacket);
    if (!saveResult) {
        console.error('❌ 保存红包失败');
        await iosAlert('保存红包失败，请重试', '错误');
        return;
    }
    console.log('💾 红包已保存到群聊');
    
    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[红包]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'redpacket',
        redPacketData: redPacket
    };
    
    await saveMessageToDB(messageObj);
    console.log('💾 消息已保存到数据库');
    
    appendMessageToChat(messageObj);
    scrollChatToBottom();
    console.log('📱 消息已显示在聊天界面');
    
    closeRedPacketModal();
    showToast(`已通过${sourceDisplayName}发送红包 ¥${amount.toFixed(2)}`);
    console.log('🎉 红包发送完成！');
}


/**
 * 保存红包到群聊
 */
async function saveRedPacketToGroup(groupId, redPacket) {
    console.log('💾 saveRedPacketToGroup 被调用');
    console.log('   - 群聊ID:', groupId);
    console.log('   - 红包ID:', redPacket.id);
    
    try {
        if (!db) {
            console.error('❌ 数据库未初始化');
            return false;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData) {
            console.error('❌ 找不到群聊数据，群聊ID:', groupId);
            return false;
        }
        
        if (!groupData.redPackets) {
            groupData.redPackets = [];
            console.log('📝 初始化红包数组');
        }
        
        // 确保 redPackets 是对象数组，不是ID数组
        if (groupData.redPackets.length > 0 && typeof groupData.redPackets[0] === 'string') {
            console.warn('⚠️ 检测到红包数据格式错误（ID数组），清空重建');
            groupData.redPackets = [];
        }
        
        console.log('📋 保存前红包列表:', groupData.redPackets.map(rp => rp.id || rp));
        
        // 查找是否已存在该红包
        const existingIndex = groupData.redPackets.findIndex(rp => rp.id === redPacket.id);
        if (existingIndex >= 0) {
            // 更新现有红包
            groupData.redPackets[existingIndex] = redPacket;
            console.log('🔄 更新现有红包，索引:', existingIndex, 'ID:', redPacket.id);
        } else {
            // 添加新红包
            groupData.redPackets.push(redPacket);
            console.log('➕ 添加新红包，ID:', redPacket.id);
        }
        
        console.log('📋 保存后红包列表:', groupData.redPackets.map(rp => rp.id));
        console.log('📦 保存后红包对象:', groupData.redPackets);
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => {
                console.log('✅ 数据库写入成功');
                resolve();
            };
            request.onerror = () => {
                console.error('❌ 数据库写入失败:', request.error);
                reject(request.error);
            };
        });
        
        // 等待事务完成
        await new Promise((resolve) => {
            tx.oncomplete = () => {
                console.log('✅ 事务已完成');
                resolve();
            };
            tx.onerror = () => {
                console.error('❌ 事务失败');
                resolve();
            };
        });
        
        // 同步更新内存中的角色对象，防止被 saveChatCharacters 覆盖
        const memoryCharacter = chatCharacters.find(c => c.id === groupId);
        if (memoryCharacter) {
            if (!memoryCharacter.redPackets) {
                memoryCharacter.redPackets = [];
            }
            const existingIndex = memoryCharacter.redPackets.findIndex(rp => rp.id === redPacket.id);
            if (existingIndex >= 0) {
                memoryCharacter.redPackets[existingIndex] = redPacket;
            } else {
                memoryCharacter.redPackets.push(redPacket);
            }
            console.log('🔄 已同步更新内存中的角色对象');
        }
        
        console.log('💾 红包已保存，当前红包总数:', groupData.redPackets.length);
        return true;
    } catch (error) {
        console.error('❌ 保存红包失败:', error);
        return false;
    }
}

/**
 * 模拟AI成员抢红包（已废弃，现在集成到群聊对话中）
 */


// ==================== 群投票功能 ====================

/**
 * 打开创建投票界面
 */
async function openCreatePoll() {
    if (!currentChatCharacter || currentChatCharacter.groupType !== 'group') {
        await iosAlert('请先打开一个群聊', '提示');
        return;
    }
    
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10005;display:flex;align-items:center;justify-content:center;padding:20px;';
    
    const modal = document.createElement('div');
    modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
    
    modal.innerHTML = `
        <div style="padding:20px;border-bottom:1px solid #e5e5e5;">
            <h3 style="margin:0;font-size:18px;font-weight:600;">创建投票</h3>
        </div>
        <div style="flex:1;overflow-y:auto;padding:20px;">
            <div style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">投票主题</label>
                <input type="text" id="pollTitle" placeholder="输入投票主题" maxlength="50" style="width:100%;padding:12px;border:1px solid #ddd;border-radius:8px;font-size:14px;box-sizing:border-box;">
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:block;font-size:14px;color:#333;margin-bottom:8px;">投票选项</label>
                <div id="pollOptionsContainer">
                    <input type="text" class="pollOption" placeholder="选项1" maxlength="30" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:8px;box-sizing:border-box;">
                    <input type="text" class="pollOption" placeholder="选项2" maxlength="30" style="width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:8px;box-sizing:border-box;">
                </div>
                <button onclick="addPollOption()" style="width:100%;padding:10px;background:#f0f0f0;border:1px dashed #ddd;border-radius:8px;font-size:14px;color:#666;cursor:pointer;">+ 添加选项</button>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="pollMultipleChoice" style="width:18px;height:18px;">
                    <span style="font-size:14px;color:#333;">允许多选</span>
                </label>
            </div>
            <div style="margin-bottom:20px;">
                <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
                    <input type="checkbox" id="pollAnonymous" style="width:18px;height:18px;">
                    <span style="font-size:14px;color:#333;">匿名投票</span>
                </label>
            </div>
        </div>
        <div style="padding:15px 20px;border-top:1px solid #e5e5e5;display:flex;gap:10px;">
            <button onclick="closePollModal()" style="flex:1;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">取消</button>
            <button onclick="createPoll()" style="flex:1;padding:12px;background:#007AFF;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;">创建投票</button>
        </div>
    `;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    overlay.id = 'pollOverlay';
    
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            document.body.removeChild(overlay);
        }
    });
}

function addPollOption() {
    const container = document.getElementById('pollOptionsContainer');
    const optionCount = container.querySelectorAll('.pollOption').length;
    if (optionCount >= 10) {
        iosAlert('最多添加10个选项', '提示');
        return;
    }
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'pollOption';
    input.placeholder = `选项${optionCount + 1}`;
    input.maxLength = 30;
    input.style.cssText = 'width:100%;padding:10px;border:1px solid #ddd;border-radius:8px;font-size:14px;margin-bottom:8px;box-sizing:border-box;';
    container.appendChild(input);
}

function closePollModal() {
    const overlay = document.getElementById('pollOverlay');
    if (overlay) document.body.removeChild(overlay);
}


/**
 * 创建投票
 */
async function createPoll() {
    const title = document.getElementById('pollTitle').value.trim();
    const optionInputs = document.querySelectorAll('.pollOption');
    const options = Array.from(optionInputs).map(input => input.value.trim()).filter(v => v);
    const multipleChoice = document.getElementById('pollMultipleChoice').checked;
    const anonymous = document.getElementById('pollAnonymous').checked;
    
    if (!title) {
        await iosAlert('请输入投票主题', '提示');
        return;
    }
    
    if (options.length < 2) {
        await iosAlert('至少需要2个选项', '提示');
        return;
    }
    
    const poll = {
        id: 'poll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        title: title,
        options: options.map(opt => ({ text: opt, votes: [] })),
        multipleChoice: multipleChoice,
        anonymous: anonymous,
        creator: 'user',
        timestamp: new Date().toISOString(),
        closed: false
    };
    
    await savePollToGroup(currentChatCharacter.id, poll);
    
    const messageObj = {
        id: Date.now().toString() + Math.random(),
        characterId: currentChatCharacter.id,
        content: '[投票]',
        type: 'user',
        timestamp: new Date().toISOString(),
        sender: 'user',
        messageType: 'poll',
        pollData: poll
    };
    
    await saveMessageToDB(messageObj);
    appendMessageToChat(messageObj);
    scrollChatToBottom();
    
    closePollModal();
    await iosAlert('投票已创建', '成功');
    
    setTimeout(() => {
        simulateAIVote(poll);
    }, 2000);
}

/**
 * 保存投票到群聊
 */
async function savePollToGroup(groupId, poll) {
    try {
        if (!db) return false;
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        if (!groupData) return false;
        if (!groupData.polls) groupData.polls = [];
        const existingIndex = groupData.polls.findIndex(p => p.id === poll.id);
        if (existingIndex >= 0) {
            groupData.polls[existingIndex] = poll;
        } else {
            groupData.polls.push(poll);
        }
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        return true;
    } catch (error) {
        console.error('保存投票失败:', error);
        return false;
    }
}


/**
 * 模拟AI成员投票
 */
async function simulateAIVote(poll) {
    if (!currentChatCharacter || !currentChatCharacter.members) return;
    
    const members = currentChatCharacter.members.map(id => chatCharacters.find(c => c.id === id)).filter(Boolean);
    const voteCount = Math.floor(Math.random() * members.length) + 1;
    const shuffledMembers = members.sort(() => Math.random() - 0.5).slice(0, voteCount);
    
    for (const member of shuffledMembers) {
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 + 1000));
        
        const optionIndex = Math.floor(Math.random() * poll.options.length);
        poll.options[optionIndex].votes.push({
            voterId: member.id,
            voterName: poll.anonymous ? '匿名' : (member.remark || member.name),
            timestamp: new Date().toISOString()
        });
        
        await savePollToGroup(currentChatCharacter.id, poll);
        
        if (!poll.anonymous) {
            const systemMsg = {
                id: Date.now().toString() + Math.random() + '_vote',
                characterId: currentChatCharacter.id,
                content: `${member.remark || member.name} 参与了投票`,
                type: 'system',
                timestamp: new Date().toISOString(),
                sender: 'system',
                messageType: 'systemNotice'
            };
            await saveMessageToDB(systemMsg);
            appendMessageToChat(systemMsg);
            scrollChatToBottom();
        }
    }
}

/**
 * 用户投票
 */
async function userVotePoll(pollId, optionIndex) {
    try {
        if (!db) return;
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(currentChatCharacter.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        if (!groupData || !groupData.polls) return;
        const poll = groupData.polls.find(p => p.id === pollId);
        if (!poll || poll.closed) {
            await iosAlert('投票已关闭', '提示');
            return;
        }
        
        const hasVoted = poll.options.some(opt => opt.votes.some(v => v.voterId === 'user'));
        if (hasVoted && !poll.multipleChoice) {
            await iosAlert('您已经投过票了', '提示');
            return;
        }
        
        poll.options[optionIndex].votes.push({
            voterId: 'user',
            voterName: poll.anonymous ? '匿名' : '我',
            timestamp: new Date().toISOString()
        });
        
        await new Promise((resolve, reject) => {
            const request = store.put(groupData);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        
        await iosAlert('投票成功', '成功');
        renderChatMessages(currentChatCharacter.id);
    } catch (error) {
        console.error('投票失败:', error);
        await iosAlert('投票失败', '错误');
    }
}

/**
 * 查看投票详情
 */
async function viewPollDetail(pollId) {
    try {
        if (!db) return;
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(currentChatCharacter.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        if (!groupData || !groupData.polls) return;
        const poll = groupData.polls.find(p => p.id === pollId);
        if (!poll) return;
        
        const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10006;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
        
        let optionsHtml = poll.options.map((opt, idx) => {
            const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
            return `
                <div style="margin-bottom:15px;">
                    <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:14px;color:#333;">${escapeHtml(opt.text)}</span>
                        <span style="font-size:14px;color:#666;">${opt.votes.length}票 (${percentage}%)</span>
                    </div>
                    <div style="height:8px;background:#f0f0f0;border-radius:4px;overflow:hidden;">
                        <div style="height:100%;background:#007AFF;width:${percentage}%;transition:width 0.3s;"></div>
                    </div>
                </div>
            `;
        }).join('');
        
        modal.innerHTML = `
            <div style="padding:20px;border-bottom:1px solid #e5e5e5;">
                <h3 style="margin:0;font-size:18px;font-weight:600;">${escapeHtml(poll.title)}</h3>
                <div style="font-size:13px;color:#666;margin-top:5px;">总投票数: ${totalVotes}</div>
            </div>
            <div style="flex:1;overflow-y:auto;padding:20px;">${optionsHtml}</div>
            <div style="padding:15px 20px;border-top:1px solid #e5e5e5;">
                <button onclick="closePollDetailModal()" style="width:100%;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">关闭</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.id = 'pollDetailOverlay';
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    } catch (error) {
        console.error('查看投票详情失败:', error);
    }
}

function closePollDetailModal() {
    const overlay = document.getElementById('pollDetailOverlay');
    if (overlay) document.body.removeChild(overlay);
}


// ==================== 消息渲染函数 ====================

/**
 * 渲染红包消息
 */
function appendRedPacketMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    const redPacket = messageObj.redPacketData;
    const time = formatMessageTime(messageObj.timestamp);
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    let avatar = '';
    let senderName = '';
    
    // 检查是否是群聊消息，使用 getGroupMessageSender 获取正确的发送者信息
    if (typeof getGroupMessageSender === 'function') {
        const groupSender = getGroupMessageSender(messageObj);
        if (groupSender.isGroupMessage) {
            avatar = groupSender.avatar;
            senderName = groupSender.name;
        }
    }
    
    // 如果不是群聊消息或没有获取到头像，使用默认逻辑
    if (!avatar) {
        if (messageObj.type === 'user') {
            const userAvatarImg = document.getElementById('userAvatarImage');
            if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
                avatar = userAvatarImg.src;
            }
        } else if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
    }
    
    const typeText = redPacket.type === 'lucky' ? '拼手气红包' : '普通红包';
    const statusText = redPacket.remainingCount > 0 ? `${redPacket.remainingCount}/${redPacket.count}个` : '已领完';
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="group-redpacket-bubble" onclick="console.log('🖱️ 红包被点击，ID:', '${redPacket.id}'); viewRedPacketDetail('${redPacket.id}')">
                <div class="redpacket-message">${escapeHtml(redPacket.message)}</div>
                <div class="redpacket-type">${typeText} ${statusText}</div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    console.log('✅ 红包消息已渲染，ID:', redPacket.id);
    container.appendChild(messageEl);
}

/**
 * 查看红包详情
 */
/**
 * 用户点击红包，触发AI角色抢红包
 */
async function viewRedPacketDetail(redPacketId) {
    console.log('🎁 viewRedPacketDetail 被调用，红包ID:', redPacketId);
    
    try {
        if (!db) {
            console.error('❌ 数据库未初始化');
            return;
        }
        
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(currentChatCharacter.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        console.log('📦 群聊数据:', groupData);
        console.log('🎁 红包列表:', groupData?.redPackets);
        console.log('🔍 红包列表中的所有ID:', groupData?.redPackets?.map(rp => rp.id));
        console.log('🎯 要查找的红包ID:', redPacketId);
        
        if (!groupData || !groupData.redPackets) {
            console.error('❌ 找不到群聊数据或红包列表');
            await iosAlert('找不到红包数据', '错误');
            return;
        }
        
        const redPacket = groupData.redPackets.find(rp => rp.id === redPacketId);
        console.log('🎯 找到的红包:', redPacket);
        
        if (!redPacket) {
            console.error('❌ 找不到红包，ID:', redPacketId);
            await iosAlert('找不到该红包', '错误');
            return;
        }
        
        // 检查用户是否已经抢过
        const userGrabbed = redPacket.grabbed.find(g => g.memberId === 'user');
        
        // 判断是否可以抢红包
        let canGrab = false;
        if (!userGrabbed) {
            if (redPacket.type === 'normal') {
                // 普通红包：检查剩余名额
                canGrab = redPacket.remainingCount > 0;
            } else if (redPacket.type === 'lucky') {
                // 运气红包：检查剩余金额和剩余人数
                canGrab = redPacket.remaining > 0 && redPacket.remainingCount > 0;
            }
        }
        
        // 用户点击红包后，不需要单独触发API
        // 红包信息会在下次群聊对话时自动包含在提示词中
        
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:10006;display:flex;align-items:center;justify-content:center;padding:20px;';
        
        const modal = document.createElement('div');
        modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:400px;max-height:70vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
        
        // 找出手气王（抢得最多的人）
        let luckyKing = null;
        if (redPacket.type === 'lucky' && redPacket.grabbed.length > 0) {
            luckyKing = redPacket.grabbed.reduce((max, current) => 
                current.amount > max.amount ? current : max
            );
        }
        
        let grabbedHtml = redPacket.grabbed.map(g => {
            const date = new Date(g.timestamp);
            const timeStr = `${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
            const isUser = g.memberId === 'user';
            const isLuckyKing = luckyKing && g.memberId === luckyKing.memberId && g.timestamp === luckyKing.timestamp;
            
            // 获取头像
            let avatar = '';
            if (isUser) {
                // 用户头像
                if (typeof getUserDataForCharacter === 'function') {
                    const userData = getUserDataForCharacter(currentChatCharacter.id);
                    avatar = userData.avatar || '';
                }
            } else {
                // 角色头像
                const member = chatCharacters.find(c => c.id === g.memberId);
                if (member) {
                    avatar = member.avatar || '';
                }
            }
            
            return `
                <div style="display:flex;align-items:center;gap:12px;padding:12px;border-bottom:1px solid #f0f0f0;${isUser ? 'background:#fff8e1;' : ''}">
                    <div style="width:40px;height:40px;border-radius:50%;overflow:hidden;flex-shrink:0;background:#e0e0e0;">
                        ${avatar ? `<img src="${avatar}" style="width:100%;height:100%;object-fit:cover;">` : '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:#999;">头像</div>'}
                    </div>
                    <div style="flex:1;">
                        <div style="font-size:14px;color:#333;font-weight:500;">
                            ${escapeHtml(g.memberName)}${isUser ? ' (我)' : ''}
                            ${isLuckyKing ? '<span style="color:#ff3b30;font-size:12px;margin-left:4px;">手气王</span>' : ''}
                        </div>
                        <div style="font-size:12px;color:#999;margin-top:2px;">${timeStr}</div>
                    </div>
                    <div style="font-size:16px;color:#ff3b30;font-weight:600;">¥${g.amount.toFixed(2)}</div>
                </div>
            `;
        }).join('');
        
        if (redPacket.grabbed.length === 0) {
            grabbedHtml = '<div style="text-align:center;padding:40px;color:#999;">还没有人领取</div>';
        }
        
        let buttonHtml = '';
        if (canGrab) {
            buttonHtml = `
                <button onclick="grabRedPacket('${redPacketId}')" style="width:100%;padding:12px;background:#ff3b30;color:white;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;margin-bottom:10px;">开</button>
            `;
        } else if (userGrabbed) {
            buttonHtml = `
                <div style="text-align:center;padding:12px;background:#f0f0f0;border-radius:8px;font-size:14px;color:#666;margin-bottom:10px;">
                    你已领取 ¥${userGrabbed.amount.toFixed(2)}
                </div>
            `;
        } else {
            buttonHtml = `
                <div style="text-align:center;padding:12px;background:#f0f0f0;border-radius:8px;font-size:14px;color:#999;margin-bottom:10px;">
                    ${redPacket.type === 'normal' ? '手慢了，红包已被抢完' : '红包已领完'}
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div style="padding:20px;border-bottom:1px solid #e5e5e5;background:linear-gradient(135deg,#ff6b6b 0%,#ff3b30 100%);color:white;border-radius:14px 14px 0 0;">
                <h3 style="margin:0;font-size:18px;font-weight:600;">${escapeHtml(redPacket.message)}</h3>
                <div style="font-size:13px;margin-top:5px;opacity:0.9;">
                    ${redPacket.type === 'lucky' ? '拼手气红包' : '普通红包'} · 总金额¥${redPacket.amount.toFixed(2)}
                </div>
                <div style="font-size:12px;margin-top:3px;opacity:0.8;">
                    已领${redPacket.grabbed.length}/${redPacket.count}个
                    ${redPacket.type === 'normal' ? ` · 剩余${redPacket.remainingCount}个` : ''}
                </div>
            </div>
            <div style="flex:1;overflow-y:auto;">${grabbedHtml}</div>
            <div style="padding:15px 20px;border-top:1px solid #e5e5e5;">
                ${buttonHtml}
                <button onclick="closeRedPacketDetailModal()" style="width:100%;padding:12px;background:#f0f0f0;border:none;border-radius:8px;font-size:15px;cursor:pointer;">关闭</button>
            </div>
        `;
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        overlay.id = 'redPacketDetailOverlay';
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });
    } catch (error) {
        console.error('查看红包详情失败:', error);
    }
}

function closeRedPacketDetailModal() {
    const overlay = document.getElementById('redPacketDetailOverlay');
    if (overlay) document.body.removeChild(overlay);
}

/**
 * 用户抢红包
 */
async function grabRedPacket(redPacketId) {
    console.log('💰 grabRedPacket 被调用，红包ID:', redPacketId);
    
    try {
        if (!db) return;
        
        // 获取红包数据 - 使用 readwrite 事务确保数据一致性
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(currentChatCharacter.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData || !groupData.redPackets) {
            console.error('❌ 找不到群聊数据或红包列表');
            return;
        }
        
        const redPacket = groupData.redPackets.find(rp => rp.id === redPacketId);
        if (!redPacket) {
            console.error('❌ 找不到红包，ID:', redPacketId);
            return;
        }
        
        console.log('🎁 红包数据:', redPacket);
        console.log('👥 已抢列表:', redPacket.grabbed);
        
        // 检查是否已经抢过
        const userGrabbed = redPacket.grabbed.find(g => g.memberId === 'user');
        if (userGrabbed) {
            console.warn('⚠️ 用户已经抢过这个红包');
            await iosAlert('你已经领取过这个红包了', '提示');
            closeRedPacketDetailModal();
            return;
        }
        
        // 检查红包是否还有剩余
        if (redPacket.type === 'normal' && redPacket.remainingCount <= 0) {
            console.warn('⚠️ 普通红包已被抢完');
            await iosAlert('手慢了，红包已被抢完', '提示');
            closeRedPacketDetailModal();
            return;
        }
        
        if (redPacket.type === 'lucky' && (redPacket.remaining <= 0 || redPacket.remainingCount <= 0)) {
            console.warn('⚠️ 运气红包已领完');
            await iosAlert('红包已领完', '提示');
            closeRedPacketDetailModal();
            return;
        }
        
        if (redPacket.remaining <= 0) {
            console.warn('⚠️ 红包金额已用完');
            await iosAlert('红包已领完', '提示');
            closeRedPacketDetailModal();
            return;
        }
        
        console.log('✅ 可以抢红包，剩余金额:', redPacket.remaining, '剩余人数:', redPacket.remainingCount);
        
        // 计算抢到的金额
        let grabAmount = 0;
        if (redPacket.type === 'lucky') {
            // 手气红包：随机金额
            if (redPacket.remainingCount === 1) {
                grabAmount = redPacket.remaining;
            } else {
                const maxGrab = redPacket.remaining / redPacket.remainingCount * 2;
                grabAmount = Math.random() * maxGrab;
                grabAmount = Math.max(0.01, Math.min(grabAmount, redPacket.remaining));
            }
        } else {
            // 普通红包：平均分配
            grabAmount = redPacket.amount / redPacket.count;
        }
        
        grabAmount = Math.round(grabAmount * 100) / 100;
        console.log('💰 抢到金额:', grabAmount);
        
        // 更新红包数据
        redPacket.grabbed.push({
            memberId: 'user',
            memberName: '我',
            amount: grabAmount,
            timestamp: new Date().toISOString()
        });
        
        redPacket.remaining = Math.round((redPacket.remaining - grabAmount) * 100) / 100;
        redPacket.remainingCount--;
        
        console.log('💾 保存红包数据，剩余金额:', redPacket.remaining, '剩余人数:', redPacket.remainingCount);
        await saveRedPacketToGroup(currentChatCharacter.id, redPacket);
        
        // 更新钱包余额
        const walletData = JSON.parse(localStorage.getItem('walletData') || '{}');
        walletData.balance = Math.round(((walletData.balance || 0) + grabAmount) * 100) / 100;
        localStorage.setItem('walletData', JSON.stringify(walletData));
        console.log('💳 钱包余额已更新:', walletData.balance);
        
        // 添加账单记录
        if (typeof addBillRecord === 'function') {
            addBillRecord('income', grabAmount, `领取红包：${redPacket.message}`, 'redpacket');
        }
        
        // 发送系统消息
        const senderName = redPacket.sender === 'user' ? (redPacket.senderName || '我') : (redPacket.senderName || '未知');
        const systemMsg = {
            id: Date.now().toString() + Math.random() + '_grab',
            characterId: currentChatCharacter.id,
            content: `我 领取了 ${senderName} 的红包，获得 ¥${grabAmount.toFixed(2)}`,
            type: 'system',
            timestamp: new Date().toISOString(),
            sender: 'system',
            messageType: 'systemNotice'
        };
        
        await saveMessageToDB(systemMsg);
        appendMessageToChat(systemMsg);
        
        // 如果红包被抢完，发送手气王系统消息
        if (redPacket.type === 'lucky' && redPacket.remainingCount === 0 && redPacket.grabbed.length > 0) {
            const luckyKing = redPacket.grabbed.reduce((max, current) => 
                current.amount > max.amount ? current : max
            );
            const luckyKingMsg = {
                id: Date.now().toString() + Math.random() + '_luckyking',
                characterId: currentChatCharacter.id,
                content: `红包已被抢完！手气王：${luckyKing.memberName} (¥${luckyKing.amount.toFixed(2)})`,
                type: 'system',
                timestamp: new Date().toISOString(),
                sender: 'system',
                messageType: 'systemNotice'
            };
            await saveMessageToDB(luckyKingMsg);
            appendMessageToChat(luckyKingMsg);
        }
        
        scrollChatToBottom();
        
        // 只在红包被抢完时在弹窗中显示手气王
        let luckyKingText = '';
        if (redPacket.type === 'lucky' && redPacket.remainingCount === 0 && redPacket.grabbed.length > 0) {
            const luckyKing = redPacket.grabbed.reduce((max, current) => 
                current.amount > max.amount ? current : max
            );
            luckyKingText = `\n\n手气王：${luckyKing.memberName} (¥${luckyKing.amount.toFixed(2)})`;
        }
        
        // 关闭弹窗并显示成功提示
        closeRedPacketDetailModal();
        await iosAlert(`恭喜你抢到 ¥${grabAmount.toFixed(2)}${luckyKingText}`, '领取成功');
        
        console.log('🎉 抢红包完成！');
        
    } catch (error) {
        console.error('❌ 抢红包失败:', error);
        await iosAlert('抢红包失败，请重试', '错误');
    }
}

/**
 * 执行AI角色抢红包指令
 * @param {string} memberId - 角色ID
 * @param {Object} groupData - 群聊数据
 * @returns {Promise<Object>} { success: boolean, systemMessage: string }
 */
async function executeGrabRedPacketCommand(memberId, groupData, redPacketId = null) {
    try {
        console.log('🎯 执行抢红包指令，角色ID:', memberId, '红包ID:', redPacketId);
        
        // 获取最新的红包数据
        if (!db) return { success: false };
        
        const tx = db.transaction(['chatCharacters'], 'readwrite');
        const store = tx.objectStore('chatCharacters');
        const freshGroupData = await new Promise((resolve, reject) => {
            const request = store.get(groupData.id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!freshGroupData || !freshGroupData.redPackets || freshGroupData.redPackets.length === 0) {
            console.warn('⚠️ 没有找到红包数据');
            return { success: false };
        }
        
        // 根据红包ID查找红包，如果没有提供ID则获取最新的红包（最后一个）
        let redPacket;
        if (redPacketId) {
            redPacket = freshGroupData.redPackets.find(rp => rp.id === redPacketId);
            if (!redPacket) {
                console.warn('⚠️ 找不到指定的红包，ID:', redPacketId);
                return { success: false };
            }
        } else {
            redPacket = freshGroupData.redPackets[freshGroupData.redPackets.length - 1];
        }
        console.log('🎁 红包信息:', {
            type: redPacket.type,
            remaining: redPacket.remaining,
            remainingCount: redPacket.remainingCount
        });
        
        // 检查角色是否已经抢过
        const alreadyGrabbed = redPacket.grabbed.find(g => g.memberId === memberId);
        if (alreadyGrabbed) {
            console.log(`⚠️ 角色 ${memberId} 已经抢过红包`);
            return { success: false };
        }
        
        // 检查红包是否还有剩余
        if (redPacket.type === 'normal') {
            // 普通红包：检查剩余名额
            if (redPacket.remainingCount <= 0) {
                console.log('⚠️ 普通红包已被抢完');
                return { success: false };
            }
        } else if (redPacket.type === 'lucky') {
            // 运气红包：检查剩余金额和剩余人数
            if (redPacket.remaining <= 0 || redPacket.remainingCount <= 0) {
                console.log('⚠️ 运气红包已领完');
                return { success: false };
            }
        }
        
        if (redPacket.remaining <= 0) {
            console.log('⚠️ 红包金额已领完');
            return { success: false };
        }
        
        // 获取角色信息
        const member = chatCharacters.find(c => c.id === memberId);
        if (!member) {
            console.warn('⚠️ 找不到角色:', memberId);
            return { success: false };
        }
        
        // 计算抢到的金额
        let grabAmount = 0;
        if (redPacket.type === 'lucky') {
            // 拼手气红包：随机金额算法
            // 使用二倍均值法，保证公平性
            if (redPacket.remainingCount === 1) {
                // 最后一个人，拿走所有剩余金额
                grabAmount = redPacket.remaining;
            } else {
                // 随机金额：0.01 到 (剩余金额 / 剩余人数 * 2)
                const maxGrab = redPacket.remaining / redPacket.remainingCount * 2;
                grabAmount = Math.random() * maxGrab;
                grabAmount = Math.max(0.01, Math.min(grabAmount, redPacket.remaining));
            }
        } else {
            // 普通红包：平均分配
            grabAmount = redPacket.amount / redPacket.count;
        }
        
        grabAmount = Math.round(grabAmount * 100) / 100;
        console.log('💰 抢到金额:', grabAmount);
        
        // 更新红包数据
        redPacket.grabbed.push({
            memberId: member.id,
            memberName: member.remark || member.name,
            amount: grabAmount,
            timestamp: new Date().toISOString()
        });
        
        redPacket.remaining = Math.round((redPacket.remaining - grabAmount) * 100) / 100;
        redPacket.remainingCount--;
        
        await saveRedPacketToGroup(groupData.id, redPacket);
        console.log('💾 红包数据已更新');
        
        // 生成系统消息 - 角色知道自己抢了多少
        const senderName = redPacket.sender === 'user' ? (redPacket.senderName || '我') : (redPacket.senderName || '未知');
        const systemMessage = `${member.remark || member.name} 领取了 ${senderName} 的红包，获得 ¥${grabAmount.toFixed(2)}`;
        
        // 准备返回的系统消息数组
        const systemMessages = [systemMessage];
        
        // 只在红包被抢完时才添加手气王系统消息
        let luckyKingInfo = null;
        if (redPacket.type === 'lucky' && redPacket.remainingCount === 0 && redPacket.grabbed.length > 0) {
            const luckyKing = redPacket.grabbed.reduce((max, current) => 
                current.amount > max.amount ? current : max
            );
            luckyKingInfo = `手气王：${luckyKing.memberName} (¥${luckyKing.amount.toFixed(2)})`;
            // 添加手气王系统消息
            systemMessages.push(`红包已被抢完！${luckyKingInfo}`);
        }
        
        console.log('✅ 抢红包成功:', systemMessage);
        
        return {
            success: true,
            action: 'grab_redpacket',
            member: member.remark || member.name,
            amount: grabAmount,
            systemMessage: systemMessage,
            systemMessages: systemMessages,
            luckyKing: luckyKingInfo,
            isFinished: redPacket.remainingCount === 0
        };
        
    } catch (error) {
        console.error('❌ 执行抢红包指令失败:', error);
        return { success: false };
    }
}




/**
 * 渲染投票消息
 */
function appendPollMessageToChat(messageObj) {
    const container = document.getElementById('chatMessagesContainer');
    const emptyMsg = container.querySelector('.chat-empty-message');
    if (emptyMsg) emptyMsg.remove();
    
    const poll = messageObj.pollData;
    const time = formatMessageTime(messageObj.timestamp);
    
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${messageObj.type === 'user' ? 'chat-message-user' : 'chat-message-char'}`;
    messageEl.dataset.msgId = messageObj.id;
    messageEl.dataset.msgType = messageObj.type;
    
    let avatar = '';
    let senderName = '';
    
    // 检查是否是群聊消息，使用 getGroupMessageSender 获取正确的发送者信息
    if (typeof getGroupMessageSender === 'function') {
        const groupSender = getGroupMessageSender(messageObj);
        if (groupSender.isGroupMessage) {
            avatar = groupSender.avatar;
            senderName = groupSender.name;
        }
    }
    
    // 如果不是群聊消息或没有获取到头像，使用默认逻辑
    if (!avatar) {
        if (messageObj.type === 'user') {
            const userAvatarImg = document.getElementById('userAvatarImage');
            if (userAvatarImg && userAvatarImg.style.display === 'block' && userAvatarImg.src) {
                avatar = userAvatarImg.src;
            }
        } else if (currentChatCharacter && currentChatCharacter.avatar) {
            avatar = currentChatCharacter.avatar;
        }
    }
    
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    
    let optionsHtml = poll.options.map((opt, idx) => {
        const percentage = totalVotes > 0 ? Math.round((opt.votes.length / totalVotes) * 100) : 0;
        return `
            <div class="poll-option" onclick="userVotePoll('${poll.id}', ${idx})">
                <div class="poll-option-text">${escapeHtml(opt.text)}</div>
                <div class="poll-option-votes">${opt.votes.length}票 (${percentage}%)</div>
            </div>
        `;
    }).join('');
    
    messageEl.innerHTML = `
        <div class="chat-message-avatar">
            ${avatar ? `<img src="${avatar}" alt="avatar" class="chat-avatar-img">` : '<div class="chat-avatar-placeholder">头像</div>'}
        </div>
        <div class="chat-message-content">
            <div class="group-poll-bubble">
                <div class="poll-title">${escapeHtml(poll.title)}</div>
                ${optionsHtml}
                <div class="poll-footer">
                    <span>${totalVotes}人已投票</span>
                    <span class="poll-view-detail" onclick="viewPollDetail('${poll.id}')">查看详情</span>
                </div>
            </div>
            <div class="chat-message-time">${time}</div>
        </div>
    `;
    
    container.appendChild(messageEl);
}


// ==================== 辅助函数 ====================

/**
 * 格式化消息时间
 */
if (typeof formatMessageTime !== 'function') {
    function formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}

/**
 * HTML转义
 */
if (typeof escapeHtml !== 'function') {
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * iOS风格确认对话框
 */
if (typeof iosConfirm !== 'function') {
    async function iosConfirm(message, title = '确认') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
            
            const modal = document.createElement('div');
            modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:300px;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
            
            modal.innerHTML = `
                <div style="padding:20px;text-align:center;">
                    <div style="font-size:17px;font-weight:600;margin-bottom:10px;">${escapeHtml(title)}</div>
                    <div style="font-size:14px;color:#666;line-height:1.6;">${escapeHtml(message)}</div>
                </div>
                <div style="border-top:1px solid #e5e5e5;display:flex;">
                    <button id="cancelBtn" style="flex:1;padding:12px;background:none;border:none;border-right:1px solid #e5e5e5;font-size:16px;color:#666;cursor:pointer;">取消</button>
                    <button id="confirmBtn" style="flex:1;padding:12px;background:none;border:none;font-size:16px;color:#007AFF;font-weight:600;cursor:pointer;">确定</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            modal.querySelector('#cancelBtn').onclick = () => {
                document.body.removeChild(overlay);
                resolve(false);
            };
            
            modal.querySelector('#confirmBtn').onclick = () => {
                document.body.removeChild(overlay);
                resolve(true);
            };
            
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    document.body.removeChild(overlay);
                    resolve(false);
                }
            });
        });
    }
}

/**
 * iOS风格提示对话框
 */
if (typeof iosAlert !== 'function') {
    async function iosAlert(message, title = '提示') {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:99999;display:flex;align-items:center;justify-content:center;padding:20px;';
            
            const modal = document.createElement('div');
            modal.style.cssText = 'background:white;border-radius:14px;width:90%;max-width:300px;box-shadow:0 10px 40px rgba(0,0,0,0.3);';
            
            modal.innerHTML = `
                <div style="padding:20px;text-align:center;">
                    <div style="font-size:17px;font-weight:600;margin-bottom:10px;">${escapeHtml(title)}</div>
                    <div style="font-size:14px;color:#666;line-height:1.6;">${escapeHtml(message)}</div>
                </div>
                <div style="border-top:1px solid #e5e5e5;">
                    <button style="width:100%;padding:12px;background:none;border:none;font-size:16px;color:#007AFF;font-weight:600;cursor:pointer;">确定</button>
                </div>
            `;
            
            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            
            const closeModal = () => {
                document.body.removeChild(overlay);
                resolve();
            };
            
            modal.querySelector('button').onclick = closeModal;
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) closeModal();
            });
        });
    }
}

console.log('群聊扩展功能已加载：群公告、群红包、群投票');


/**
 * 检查并显示最新群公告（打开群聊时调用）
 */
async function checkAndShowLatestAnnouncement(groupId) {
    try {
        if (!db) return;
        const tx = db.transaction(['chatCharacters'], 'readonly');
        const store = tx.objectStore('chatCharacters');
        const groupData = await new Promise((resolve, reject) => {
            const request = store.get(groupId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        
        if (!groupData || !groupData.announcements || groupData.announcements.length === 0) {
            return;
        }
        
        // 获取最新的公告
        const latestAnnouncement = groupData.announcements[0];
        
        // 检查是否已经显示过这条公告（使用localStorage记录）
        const shownKey = `announcement_shown_${groupId}_${latestAnnouncement.id}`;
        if (localStorage.getItem(shownKey)) {
            return; // 已经显示过了
        }
        
        // 标记为已显示
        localStorage.setItem(shownKey, 'true');
        
        // 在聊天界面显示公告提示
        const systemMsg = {
            id: Date.now().toString() + Math.random() + '_announcement_tip',
            characterId: groupId,
            content: `📢 群公告：\n${latestAnnouncement.content}`,
            type: 'system',
            timestamp: new Date().toISOString(),
            sender: 'system',
            messageType: 'systemNotice'
        };
        
        if (typeof saveMessageToDB === 'function') {
            await saveMessageToDB(systemMsg);
        }
        
        if (typeof appendMessageToChat === 'function') {
            appendMessageToChat(systemMsg);
        }
        
        if (typeof scrollChatToBottom === 'function') {
            scrollChatToBottom();
        }
    } catch (error) {
        console.error('检查群公告失败:', error);
    }
}
