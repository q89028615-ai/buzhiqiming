function updateApiDescription() {
    const apiSelect = document.getElementById('musicApiSelect');
    const desc = document.getElementById('apiDescription');
    
    const descriptions = {
        'meting1': '实测可用 - 支持网易云、QQ、酷狗、酷我',
        'meting2': '实测可用 - 稳定快速，多平台聚合',
        'meting3': '实测可用 - 支持网易云和QQ音乐',
        'aa1': '聚合多个音乐平台，一次搜索全部结果',
        'nanyi': '全平台聚合API，支持网易云、QQ、酷狗等'
    };
    
    desc.textContent = descriptions[apiSelect.value] || '';
}

// 智能提取歌手信息的辅助函数
function extractArtistInfo(song) {
    // 尝试从多个可能的字段中提取歌手信息
    let artist = null;
    
    // 1. 处理数组格式的歌手信息（如网易云的 ar 字段）
    if (song.ar && Array.isArray(song.ar) && song.ar.length > 0) {
        artist = song.ar.map(a => a.name).filter(Boolean).join(', ');
    }
    // 2. 处理 artists 数组
    else if (song.artists && Array.isArray(song.artists) && song.artists.length > 0) {
        artist = song.artists.map(a => a.name || a).filter(Boolean).join(', ');
    }
    // 3. 处理 artist 数组格式
    else if (Array.isArray(song.artist) && song.artist.length > 0) {
        artist = song.artist.map(a => (typeof a === 'object' ? a.name : a)).filter(Boolean).join(', ');
    }
    // 4. 处理字符串格式的各种字段
    else if (song.singer) {
        artist = song.singer;
    }
    else if (song.artist) {
        artist = song.artist;
    }
    else if (song.artistName) {
        artist = song.artistName;
    }
    else if (song.author) {
        artist = song.author;
    }
    else if (song.auther) { // 注意：有些API拼写错误
        artist = song.auther;
    }
    else if (song.singerName) {
        artist = song.singerName;
    }
    
    // 清理和验证结果
    if (artist) {
        artist = String(artist).trim();
        // 过滤掉无效值
        if (artist === '' || artist === 'null' || artist === 'undefined' || artist === 'None') {
            artist = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知歌手"
    return artist || '未知歌手';
}

// 智能提取专辑信息的辅助函数
function extractAlbumInfo(song) {
    // 尝试从多个可能的字段中提取专辑信息
    let album = null;
    
    // 1. 处理对象格式的专辑信息（如网易云的 al 字段）
    if (song.al && typeof song.al === 'object' && song.al.name) {
        album = song.al.name;
    }
    // 2. 处理 album 对象格式
    else if (song.album && typeof song.album === 'object' && song.album.name) {
        album = song.album.name;
    }
    // 3. 处理字符串格式的各种字段
    else if (typeof song.album === 'string') {
        album = song.album;
    }
    else if (song.albumName) {
        album = song.albumName;
    }
    else if (song.albumTitle) {
        album = song.albumTitle;
    }
    else if (song.disc) {
        album = song.disc;
    }
    else if (song.albumname) {
        album = song.albumname;
    }
    
    // 清理和验证结果
    if (album) {
        album = String(album).trim();
        // 过滤掉无效值
        if (album === '' || album === 'null' || album === 'undefined' || album === 'None' || album === '未知' || album === 'unknown') {
            album = null;
        }
    }
    
    // 返回结果，如果没有找到则返回"未知专辑"
    return album || '未知专辑';
}

// 搜索音乐（聚合多平台）
async function searchMusic() {
    const searchInput = document.getElementById('musicSearchInput').value.trim();
    const apiSource = document.getElementById('musicApiSelect').value;
    
    if (!searchInput) {
        alert('请输入搜索关键词！');
        return;
    }

    // 显示加载提示
    document.getElementById('musicSearchLoading').style.display = 'block';
    document.getElementById('musicSearchResults').style.display = 'none';

    try {
        let results = [];
        
        if (apiSource === 'meting1') {
            results = await searchWithMetingAPINew(searchInput);
        } else if (apiSource === 'meting2') {
            results = await searchWithMetingAPINew2(searchInput);
        } else if (apiSource === 'meting3') {
            results = await searchWithVkeysAPI(searchInput);
        } else if (apiSource === 'aa1') {
            results = await searchWithAA1API(searchInput);
        } else if (apiSource === 'nanyi') {
            results = await searchWithNanYiAPI(searchInput);
        }

        if (results.length > 0) {
            displayMusicResults(results);
        } else {
            document.getElementById('musicSearchLoading').style.display = 'none';
            alert('没有找到相关音乐，请尝试其他关键词或切换API！');
        }
    } catch (error) {
        console.error('搜索音乐失败:', error);
        document.getElementById('musicSearchLoading').style.display = 'none';
        alert('搜索失败：' + error.message + '\n\n建议：\n1. 尝试切换其他API服务\n2. 检查网络连接\n3. 稍后重试');
    }
}

// 新版Meting API 1 (i-meto.com) - 实测可用
async function searchWithMetingAPINew(keyword) {
    const baseUrl = 'https://api.i-meto.com/meting/api';
    return await searchWithMetingCore(baseUrl, keyword);
}

// 新版Meting API 2 (qjqq.cn) - 实测可用
async function searchWithMetingAPINew2(keyword) {
    const baseUrl = 'https://meting.qjqq.cn/api.php';
    return await searchWithMetingCore(baseUrl, keyword);
}

// Meting核心搜索函数
async function searchWithMetingCore(baseUrl, keyword) {
    try {
        const platforms = ['netease', 'tencent', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}?server=${platform}&type=search&id=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`${platform} 返回 ${data.length} 条结果`);
                        
                        // 处理前5条结果
                        for (const song of data.slice(0, 5)) {
                            // Meting API直接在搜索结果中返回URL
                            if (song.url) {
                                const platformNames = {
                                    'netease': '网易云',
                                    'tencent': 'QQ音乐',
                                    'kugou': '酷狗',
                                    'kuwo': '酷我'
                                };
                                
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title || '未知歌曲',
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platformNames[platform] || platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Meting API搜索失败:', error);
        throw error;
    }
}

// Vkeys API - 自定义实现
async function searchWithVkeysAPI(keyword) {
    const baseUrl = 'https://api.vkeys.cn/v2/music';
    return await searchWithVkeysCore(baseUrl, keyword);
}

// Vkeys核心搜索函数（参考METING风格编写）
async function searchWithVkeysCore(baseUrl, keyword) {
    try {
        const platforms = [
            { name: 'netease', label: '网易云' },
            { name: 'tencent', label: 'QQ音乐' }
        ];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const searchTerm = keyword.replace(/\s/g, '');
                const searchUrl = `${baseUrl}/${platform.name}?word=${encodeURIComponent(searchTerm)}`;
                
                console.log(`🎵 搜索${platform.label}:`, searchUrl);
                const response = await fetch(searchUrl);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data.code === 200 && Array.isArray(data.data) && data.data.length > 0) {
                        console.log(`${platform.label} 返回 ${data.data.length} 条结果`);
                        
                        // 处理前6条结果
                        for (const song of data.data.slice(0, 6)) {
                            try {
                                // 获取播放链接（Vkeys API需要额外请求获取URL）
                                const urlResponse = await fetch(`${baseUrl}/${platform.name}?id=${song.id}`);
                                const urlData = await urlResponse.json();
                                
                                if (urlData.code === 200 && urlData.data?.url) {
                                    allResults.push({
                                        id: `${platform.name}_${song.id}`,
                                        name: song.name || song.song || song.title || '未知歌曲',
                                        artist: extractArtistInfo(song),
                                        album: extractAlbumInfo(song),
                                        cover: song.al?.picUrl || song.pic || song.cover || '',
                                        coverSmall: song.al?.picUrl || song.pic || song.cover || '',
                                        playUrl: urlData.data.url,
                                        source: platform.name,
                                        platform: platform.label
                                    });
                                }
                            } catch (urlErr) {
                                console.log(`${platform.label} 获取播放链接失败:`, urlErr);
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`${platform.label} 搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('Vkeys API 搜索失败:', error);
        return [];
    }
}

// AA1 聚合API
async function searchWithAA1API(keyword) {
    try {
        const url = `https://api.aa1.cn/api/api-wenan-wangyiyunyinyue/index.php?msg=${encodeURIComponent(keyword)}&n=20`;
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('AA1 API请求失败');
        }
        
        const data = await response.json();
        const results = [];
        
        if (data && Array.isArray(data)) {
            for (const song of data) {
                if (song.url) {
                    results.push({
                        id: `aa1_${song.id || Math.random()}`,
                        name: song.name || song.title,
                        artist: extractArtistInfo(song),
                        album: extractAlbumInfo(song),
                        cover: song.pic || song.cover,
                        coverSmall: song.pic || song.cover,
                        playUrl: song.url,
                        source: 'netease',
                        platform: '网易云'
                    });
                }
            }
        }
        
        return results;
    } catch (error) {
        console.error('AA1 API搜索失败:', error);
        throw error;
    }
}

// NanYi 聚合API
async function searchWithNanYiAPI(keyword) {
    try {
        const platforms = ['netease', 'qq', 'kugou', 'kuwo'];
        const allResults = [];
        
        for (const platform of platforms) {
            try {
                const url = `https://api.nanyinet.com/api/music/${platform}?msg=${encodeURIComponent(keyword)}&n=5`;
                const response = await fetch(url);
                
                if (response.ok) {
                    const data = await response.json();
                    
                    if (data && data.data && Array.isArray(data.data)) {
                        for (const song of data.data) {
                            if (song.url) {
                                allResults.push({
                                    id: `${platform}_${song.id || Math.random()}`,
                                    name: song.name || song.title,
                                    artist: extractArtistInfo(song),
                                    album: extractAlbumInfo(song),
                                    cover: song.pic || song.cover,
                                    coverSmall: song.pic || song.cover,
                                    playUrl: song.url,
                                    source: platform,
                                    platform: platform
                                });
                            }
                        }
                    }
                }
            } catch (err) {
                console.log(`NanYi ${platform}搜索失败:`, err);
            }
        }
        
        return allResults;
    } catch (error) {
        console.error('NanYi API搜索失败:', error);
        throw error;
    }
}

// 显示音乐搜索结果
function displayMusicResults(results) {
    const resultsContainer = document.getElementById('musicSearchList');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<div style="text-align: center; padding: 30px; color: #999;">没有找到相关音乐</div>';
        document.getElementById('musicSearchLoading').style.display = 'none';
        document.getElementById('musicSearchResults').style.display = 'block';
        return;
    }

    // 平台标识和颜色
    const platformColors = {
        'netease': '#e60012',
        'qq': '#31c27c',
        'kugou': '#2ca7f8',
        'kuwo': '#f63',
        '网易云': '#e60012',
        'QQ音乐': '#31c27c'
    };

    const platformNames = {
        'netease': '网易云',
        'qq': 'QQ音乐',
        'kugou': '酷狗',
        'kuwo': '酷我'
    };

    results.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 12px;
            border-bottom: 1px solid #e0e0e0;
            transition: background-color 0.2s;
            position: relative;
        `;
        
        musicItem.onmouseover = function() {
            this.style.backgroundColor = '#fff';
        };
        
        musicItem.onmouseout = function() {
            this.style.backgroundColor = 'transparent';
        };

        const platformName = music.platform || platformNames[music.source] || music.source;
        const platformColor = platformColors[music.source] || platformColors[music.platform] || '#666';

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 60px; height: 60px; border-radius: 8px; object-fit: cover; margin-right: 12px;" 
                 onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27100%27 height=%27100%27%3E%3Crect fill=%27%23ddd%27 width=%27100%27 height=%27100%27/%3E%3Ctext x=%2750%25%27 y=%2750%25%27 text-anchor=%27middle%27 dy=%27.3em%27 fill=%27%23999%27 font-size=%2714%27%3E封面%3C/text%3E%3C/svg%3E'">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 15px; font-weight: 500; color: #333; margin-bottom: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                    <span style="display: inline-block; padding: 2px 6px; background: ${platformColor}; color: white; border-radius: 4px; font-size: 10px; margin-left: 6px; vertical-align: middle;">
                        ${platformName}
                    </span>
                </div>
                <div style="font-size: 13px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
                <div style="font-size: 12px; color: #999; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.album}
                </div>
            </div>
            <button onclick='addToMusicLibrary(${JSON.stringify(music).replace(/'/g, "&apos;").replace(/"/g, "&quot;")})' 
                    style="padding: 8px 16px; background: #28a745; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; white-space: nowrap;">
                添加
            </button>
        `;

        resultsContainer.appendChild(musicItem);
    });

    // 隐藏加载提示，显示结果
    document.getElementById('musicSearchLoading').style.display = 'none';
    document.getElementById('musicSearchResults').style.display = 'block';
}

// 添加到音乐库
async function addToMusicLibrary(music) {
    try {
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.id === music.id && item.source === music.source);
        if (exists) {
            alert('该音乐已在音乐库中！');
            return;
        }

        // 获取歌词
        let lyric = null;
        const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
        const songId = music.id.split('_').pop(); // 提取原始ID
        
        try {
            if (apiSource === 'meting1') {
                lyric = await getLyricFromMeting('https://api.i-meto.com/meting/api', music.source, songId);
            } else if (apiSource === 'meting2') {
                lyric = await getLyricFromMeting('https://meting.qjqq.cn/api.php', music.source, songId);
            } else if (apiSource === 'meting3') {
                lyric = await getLyricFromVkeys(music.source, songId);
            } else if (apiSource === 'nanyi') {
                lyric = await getLyricFromNanYi(music.source, songId);
            }
            
            if (lyric) {
                music.lyric = lyric;
                console.log('✅ 歌词获取成功');
            } else {
                console.log('⚠️ 未获取到歌词');
            }
        } catch (error) {
            console.error('获取歌词出错:', error);
        }

        // 添加到音乐库
        musicLibrary.push(music);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        alert(`已添加《${music.name}》到音乐库！${music.lyric ? '\n✅ 歌词已同步' : '\n⚠️ 暂无歌词'}`);
    } catch (error) {
        console.error('添加音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 切换自定义音乐上传表单显示
function toggleCustomMusicUpload() {
    const toggle = document.getElementById('customMusicToggle');
    const form = document.getElementById('customMusicForm');
    
    if (toggle.checked) {
        form.style.display = 'block';
    } else {
        form.style.display = 'none';
    }
}

// 处理歌词文件上传
function handleLyricFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 验证文件类型
    if (!file.name.endsWith('.lrc') && !file.name.endsWith('.txt')) {
        alert('请上传LRC或TXT格式的歌词文件！');
        event.target.value = '';
        return;
    }
    
    // 读取文件内容
    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        document.getElementById('customMusicLyric').value = content;
        alert('歌词文件已加载！');
    };
    reader.onerror = function() {
        alert('读取文件失败，请重试！');
    };
    reader.readAsText(file, 'UTF-8');
    
    // 清空文件选择，允许重复上传同一文件
    event.target.value = '';
}

// 清空自定义歌词
function clearCustomLyric() {
    document.getElementById('customMusicLyric').value = '';
}

// 添加自定义音乐
async function addCustomMusic() {
    try {
        const name = document.getElementById('customMusicName').value.trim();
        const artist = document.getElementById('customMusicArtist').value.trim();
        const album = document.getElementById('customMusicAlbum').value.trim();
        const cover = document.getElementById('customMusicCover').value.trim();
        const playUrl = document.getElementById('customMusicUrl').value.trim();
        const lyric = document.getElementById('customMusicLyric').value.trim();
        
        // 验证必填项
        if (!name) {
            alert('请输入歌曲名称！');
            return;
        }
        
        if (!artist) {
            alert('请输入歌手名称！');
            return;
        }
        
        if (!playUrl) {
            alert('请输入音乐URL！');
            return;
        }
        
        // 验证URL格式
        try {
            new URL(playUrl);
        } catch (e) {
            alert('音乐URL格式不正确，请输入有效的URL！');
            return;
        }
        
        // 如果有封面URL，验证格式
        if (cover) {
            try {
                new URL(cover);
            } catch (e) {
                alert('封面URL格式不正确，请输入有效的URL！');
                return;
            }
        }
        
        // 创建音乐对象
        const customMusic = {
            id: `custom_${Date.now()}`,
            name: name,
            artist: artist,
            album: album || '自定义专辑',
            cover: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            coverSmall: cover || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="14"%3E封面%3C/text%3E%3C/svg%3E',
            playUrl: playUrl,
            source: 'custom',
            platform: '本地上传',
            lyric: lyric || null
        };
        
        // 检查是否已存在
        const exists = musicLibrary.some(item => item.playUrl === playUrl);
        if (exists) {
            alert('该音乐URL已在音乐库中！');
            return;
        }
        
        // 添加到音乐库
        musicLibrary.push(customMusic);
        
        // 保存到 IndexedDB
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 更新显示
        displayMusicLibrary();
        
        // 清空表单
        document.getElementById('customMusicName').value = '';
        document.getElementById('customMusicArtist').value = '';
        document.getElementById('customMusicAlbum').value = '';
        document.getElementById('customMusicCover').value = '';
        document.getElementById('customMusicUrl').value = '';
        document.getElementById('customMusicLyric').value = '';
        
        alert(`已添加《${name}》到音乐库！${lyric ? '\n✅ 歌词已同步' : '\n⚠️ 未添加歌词'}`);
    } catch (error) {
        console.error('添加自定义音乐失败:', error);
        alert('添加失败，请重试！');
    }
}

// 显示音乐库
function displayMusicLibrary() {
    const libraryContainer = document.getElementById('musicLibraryList');
    
    if (musicLibrary.length === 0) {
        libraryContainer.innerHTML = `
            <div style="text-align: center; color: #999; padding: 30px;">
                暂无音乐，请先搜索并添加
            </div>
        `;
        return;
    }

    libraryContainer.innerHTML = '';

    musicLibrary.forEach((music, index) => {
        const musicItem = document.createElement('div');
        musicItem.style.cssText = `
            display: flex;
            align-items: center;
            padding: 10px;
            margin-bottom: 8px;
            background: white;
            border-radius: 8px;
            cursor: pointer;
            border: 2px solid ${index === currentMusicIndex ? '#007bff' : 'transparent'};
        `;
        
        musicItem.onclick = function() {
            playMusicByIndex(index);
        };

        musicItem.innerHTML = `
            <img src="${music.coverSmall}" alt="封面" style="width: 50px; height: 50px; border-radius: 6px; object-fit: cover; margin-right: 10px;">
            <div style="flex: 1; min-width: 0;">
                <div style="font-size: 14px; font-weight: 500; color: #333; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.name}
                </div>
                <div style="font-size: 12px; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                    ${music.artist}
                </div>
            </div>
            <button onclick="event.stopPropagation(); removeFromLibrary(${index})" 
                    style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;">
                删除
            </button>
        `;

        libraryContainer.appendChild(musicItem);
    });
}

// 从音乐库删除
async function removeFromLibrary(index) {
    if (confirm('确定要删除这首音乐吗？')) {
        musicLibrary.splice(index, 1);
        await storageDB.setItem('musicLibrary', musicLibrary);
        
        // 如果删除的是当前播放的歌曲
        if (index === currentMusicIndex) {
            audioPlayer.pause();
            isPlaying = false;
            updatePlayPauseButton();
            if (musicLibrary.length > 0) {
                currentMusicIndex = 0;
                loadMusic(currentMusicIndex);
            }
        } else if (index < currentMusicIndex) {
            currentMusicIndex--;
        }
        
        displayMusicLibrary();
    }
}

// 清空音乐库
async function clearMusicLibrary() {
    const confirmed = await iosConfirm('确定要清空音乐库吗？', '确认清空');
    if (confirmed) {
        musicLibrary = [];
        currentMusicIndex = 0;
        audioPlayer.pause();
        isPlaying = false;
        updatePlayPauseButton();
        await storageDB.setItem('musicLibrary', []);
        displayMusicLibrary();
        showIosAlert('成功', '音乐库已清空');
    }
}

// 加载音乐库
async function loadMusicLibrary() {
    try {
        const savedLibrary = await storageDB.getItem('musicLibrary');
        if (savedLibrary && Array.isArray(savedLibrary)) {
            musicLibrary = savedLibrary;
            displayMusicLibrary();
            if (musicLibrary.length > 0) {
                loadMusic(0);
            }
        }
    } catch (error) {
        console.error('加载音乐库失败:', error);
    }
}

// 播放指定索引的音乐
function playMusicByIndex(index) {
    if (index >= 0 && index < musicLibrary.length) {
        currentMusicIndex = index;
        loadMusic(index);
        audioPlayer.play();
        isPlaying = true;
        updatePlayPauseButton();
        displayMusicLibrary(); // 更新高亮
    }
}

// 加载音乐
function loadMusic(index) {
    if (index < 0 || index >= musicLibrary.length) return;
    
    const music = musicLibrary[index];
    
    // 设置音频源
    audioPlayer.src = music.playUrl;
    
    // 更新界面显示
    document.getElementById('currentMusicTitle').textContent = music.name;
    document.getElementById('currentMusicSong').textContent = `♪ ${music.artist}`;
    
    // 更新封面
    document.getElementById('musicCoverImage').src = music.cover;
    document.getElementById('musicCoverImage').style.display = 'block';
    document.getElementById('musicCoverPlaceholder').style.display = 'none';
    
    // 保存当前封面
    storageDB.setItem('musicCover', music.cover);
    
    // 加载歌词
    if (music.lyric) {
        loadLyric(music.lyric);
    } else {
        clearLyric();
    }
}

// 播放/暂停切换
function togglePlayPause() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！请先搜索并添加音乐。');
        return;
    }

    if (isPlaying) {
        audioPlayer.pause();
        isPlaying = false;
    } else {
        audioPlayer.play();
        isPlaying = true;
    }
    
    updatePlayPauseButton();
}

// 更新播放/暂停按钮
function updatePlayPauseButton() {
    const btn = document.getElementById('playPauseBtn');
    if (btn) {
        btn.textContent = isPlaying ? '⏸' : '▶';
    }
}

// 上一首
function playPreviousSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex - 1 + musicLibrary.length) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 下一首
function playNextSong() {
    if (musicLibrary.length === 0) return;
    
    currentMusicIndex = (currentMusicIndex + 1) % musicLibrary.length;
    loadMusic(currentMusicIndex);
    
    if (isPlaying) {
        audioPlayer.play();
    }
    
    displayMusicLibrary();
}

// 切换播放模式
function togglePlayMode() {
    const playModeBtn = document.getElementById('playModeBtn');
    
    if (playMode === 'list') {
        // 切换到单曲循环
        playMode = 'single';
        playModeBtn.textContent = '单';
        playModeBtn.style.color = '#007bff';
        playModeBtn.title = '单曲循环';
        console.log('切换到单曲循环模式');
    } else {
        // 切换到连续播放
        playMode = 'list';
        playModeBtn.textContent = '列';
        playModeBtn.style.color = '';
        playModeBtn.title = '连续播放';
        console.log('切换到列表播放模式');
    }
}

// 更新进度条
function updateProgressBar() {
    if (audioPlayer.duration) {
        const progress = (audioPlayer.currentTime / audioPlayer.duration) * 100;
        const fill = document.getElementById('musicProgressFill');
        if (fill) {
            fill.style.width = progress + '%';
        }
    }
}

// 点击进度条跳转
function seekMusic(event) {
    if (audioPlayer.duration) {
        const progressBar = document.getElementById('musicProgressBar');
        const rect = progressBar.getBoundingClientRect();
        const percent = (event.clientX - rect.left) / rect.width;
        audioPlayer.currentTime = percent * audioPlayer.duration;
    }
}


// ========== 音乐歌词功能 ==========

// 歌词数据结构
let currentLyrics = []; // 当前歌曲的歌词数组 [{time: 秒数, text: 歌词文本}]
let currentLyricIndex = -1; // 当前显示的歌词索引

// 解析LRC格式歌词
function parseLyric(lyricText) {
    if (!lyricText || typeof lyricText !== 'string') {
        return [];
    }
    
    const lyrics = [];
    const lines = lyricText.split('\n');
    
    // LRC时间标签格式：[mm:ss.xx] 或 [mm:ss]
    const timeRegex = /\[(\d{2}):(\d{2})\.?(\d{2,3})?\]/g;
    
    for (const line of lines) {
        const matches = [...line.matchAll(timeRegex)];
        if (matches.length === 0) continue;
        
        // 提取歌词文本（去除所有时间标签）
        const text = line.replace(timeRegex, '').trim();
        if (!text) continue;
        
        // 一行可能有多个时间标签（重复歌词）
        for (const match of matches) {
            const minutes = parseInt(match[1]);
            const seconds = parseInt(match[2]);
            const milliseconds = match[3] ? parseInt(match[3].padEnd(3, '0')) : 0;
            
            const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;
            
            lyrics.push({
                time: timeInSeconds,
                text: text
            });
        }
    }
    
    // 按时间排序
    lyrics.sort((a, b) => a.time - b.time);
    
    return lyrics;
}

// 更新歌词显示
function updateLyric() {
    const lyricElement = document.getElementById('musicLyric');
    if (!lyricElement) return;
    
    // 如果没有歌曲在播放或没有歌词数据，清空显示
    if (!isPlaying || currentLyrics.length === 0) {
        if (lyricElement.textContent !== '') {
            lyricElement.textContent = '';
        }
        return;
    }
    
    const currentTime = audioPlayer.currentTime;
    
    // 查找当前时间应该显示的歌词
    let newIndex = -1;
    for (let i = currentLyrics.length - 1; i >= 0; i--) {
        if (currentTime >= currentLyrics[i].time) {
            newIndex = i;
            break;
        }
    }
    
    // 如果歌词索引发生变化，更新显示
    if (newIndex !== currentLyricIndex) {
        currentLyricIndex = newIndex;
        if (newIndex >= 0) {
            lyricElement.textContent = currentLyrics[newIndex].text;
        } else {
            lyricElement.textContent = '';
        }
    }
}

// 加载歌词到当前播放
function loadLyric(lyricText) {
    currentLyrics = parseLyric(lyricText);
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
    
    console.log('歌词已加载，共', currentLyrics.length, '行');
}

// 清空歌词
function clearLyric() {
    currentLyrics = [];
    currentLyricIndex = -1;
    
    const lyricElement = document.getElementById('musicLyric');
    if (lyricElement) {
        lyricElement.textContent = '';
    }
}

// 从Meting API获取歌词
async function getLyricFromMeting(baseUrl, server, id) {
    try {
        const url = `${baseUrl}?server=${server}&type=lyric&id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Meting API返回格式：{lyric: "lrc内容"}
        if (data && data.lyric) {
            return data.lyric;
        }
        
        return null;
    } catch (error) {
        console.error('获取Meting歌词失败:', error);
        return null;
    }
}

// 从Vkeys API获取歌词
async function getLyricFromVkeys(server, id) {
    try {
        const url = `https://api.vkeys.cn/v2/music/${server}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // Vkeys API返回格式需要根据实际情况调整
        if (data && data.code === 200 && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取Vkeys歌词失败:', error);
        return null;
    }
}

// 从NanYi API获取歌词
async function getLyricFromNanYi(platform, id) {
    try {
        const url = `https://api.nanyinet.com/api/music/${platform}/lyric?id=${id}`;
        console.log('🎵 获取歌词:', url);
        
        const response = await fetch(url);
        if (!response.ok) return null;
        
        const data = await response.json();
        
        // NanYi API返回格式需要根据实际情况调整
        if (data && data.data) {
            if (data.data.lyric) {
                return data.data.lyric;
            } else if (data.data.lrc) {
                return data.data.lrc;
            }
        }
        
        return null;
    } catch (error) {
        console.error('获取NanYi歌词失败:', error);
        return null;
    }
}

// ========== 音乐链接检查功能 ==========

let invalidMusicList = []; // 失效音乐列表

// 检查音乐链接
async function checkMusicLinks() {
    if (musicLibrary.length === 0) {
        alert('音乐库为空！');
        return;
    }

    // 打开弹窗
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'flex';

    // 显示检查进度
    document.getElementById('checkingProgress').style.display = 'block';
    document.getElementById('invalidMusicResult').style.display = 'none';
    document.getElementById('noInvalidMusic').style.display = 'none';

    invalidMusicList = [];
    let checkedCount = 0;

    // 检查每首音乐
    for (const music of musicLibrary) {
        checkedCount++;
        document.getElementById('checkingStatus').textContent = `正在检查 ${checkedCount}/${musicLibrary.length}`;

        const isValid = await checkSingleMusicLink(music.playUrl);
        if (!isValid) {
            invalidMusicList.push(music);
        }
    }

    // 隐藏进度
    document.getElementById('checkingProgress').style.display = 'none';

    // 显示结果
    if (invalidMusicList.length > 0) {
        displayInvalidMusicList();
        document.getElementById('invalidMusicResult').style.display = 'block';
    } else {
        document.getElementById('noInvalidMusic').style.display = 'block';
    }
}

// 检查单个音乐链接
async function checkSingleMusicLink(url) {
    try {
        // 使用HEAD请求检查链接
        const response = await fetch(url, {
            method: 'HEAD',
            mode: 'no-cors' // 避免CORS问题
        });
        
        // no-cors模式下无法获取状态码，所以我们尝试加载音频
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'metadata';
            
            const timeout = setTimeout(() => {
                audio.src = '';
                resolve(false);
            }, 5000); // 5秒超时
            
            audio.onloadedmetadata = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(true);
            };
            
            audio.onerror = () => {
                clearTimeout(timeout);
                audio.src = '';
                resolve(false);
            };
            
            audio.src = url;
        });
    } catch (error) {
        console.error('检查链接失败:', error);
        return false;
    }
}

// 显示失效音乐列表
function displayInvalidMusicList() {
    const container = document.getElementById('invalidMusicList');
    
    let html = '';
    invalidMusicList.forEach(music => {
        html += `
            <div style="display: flex; align-items: center; padding: 12px; background: white; border-radius: 8px; margin-bottom: 8px; border: 2px solid #dc3545;">
                <input type="checkbox" class="invalid-music-checkbox" data-music-id="${music.id}" 
                       style="width: 18px; height: 18px; margin-right: 12px; cursor: pointer;">
                <div style="flex: 1; min-width: 0;">
                    <div style="font-size: 14px; font-weight: 600; color: #333; margin-bottom: 4px;">
                        ${music.name}
                        <span style="background: #dc3545; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">失效</span>
                    </div>
                    <div style="font-size: 12px; color: #666;">
                        ${music.artist} · ${music.platform || '未知平台'}
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// 全选/取消全选失效音乐
function toggleSelectAllInvalid() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(cb => {
        cb.checked = !allChecked;
    });
}

// 重新搜索选中的音乐
async function researchSelectedMusic() {
    const checkboxes = document.querySelectorAll('.invalid-music-checkbox:checked');
    
    if (checkboxes.length === 0) {
        alert('请至少选择一个要重新搜索的音乐！');
        return;
    }

    const confirmed = await showCustomConfirm(
        '确认重新搜索',
        `确定要重新搜索选中的 ${checkboxes.length} 首音乐吗？\n\n将依次搜索并自动更新音乐库中的链接。`
    );

    if (!confirmed) return;

    // 获取选中的音乐ID
    const selectedIds = Array.from(checkboxes).map(cb => cb.dataset.musicId);
    const musicsToResearch = invalidMusicList.filter(m => selectedIds.includes(m.id));

    // 关闭弹窗
    closeInvalidMusicModal();

    // 显示进度提示
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < musicsToResearch.length; i++) {
        const music = musicsToResearch[i];
        const progress = `(${i + 1}/${musicsToResearch.length})`;
        
        try {
            // 搜索音乐
            const keyword = `${music.name} ${music.artist}`;
            const apiSource = document.getElementById('musicApiSelect')?.value || 'meting1';
            
            let results = [];
            if (apiSource === 'meting1') {
                results = await searchWithMetingAPINew(keyword);
            } else if (apiSource === 'meting2') {
                results = await searchWithMetingAPINew2(keyword);
            } else if (apiSource === 'meting3') {
                results = await searchWithVkeysAPI(keyword);
            } else if (apiSource === 'aa1') {
                results = await searchWithAA1API(keyword);
            } else if (apiSource === 'nanyi') {
                results = await searchWithNanYiAPI(keyword);
            }

            if (results.length > 0) {
                // 使用第一个搜索结果更新
                const newMusic = results[0];
                const index = musicLibrary.findIndex(m => m.id === music.id);
                
                if (index !== -1) {
                    // 保留原来的ID和歌词
                    musicLibrary[index] = {
                        ...newMusic,
                        id: music.id,
                        lyric: music.lyric || newMusic.lyric
                    };
                    successCount++;
                    console.log(`✅ ${progress} 成功更新: ${music.name}`);
                }
            } else {
                failCount++;
                console.log(`❌ ${progress} 搜索失败: ${music.name}`);
            }
        } catch (error) {
            failCount++;
            console.error(`❌ ${progress} 搜索出错:`, music.name, error);
        }
    }

    // 保存更新后的音乐库
    try {
        await storageDB.setItem('musicLibrary', musicLibrary);
        displayMusicLibrary();
        
        let message = `重新搜索完成！\n\n`;
        message += `✅ 成功: ${successCount} 首\n`;
        if (failCount > 0) {
            message += `❌ 失败: ${failCount} 首`;
        }
        alert(message);
    } catch (error) {
        console.error('保存音乐库失败:', error);
        alert('保存失败，请重试！');
    }
}

// 关闭失效音乐弹窗
function closeInvalidMusicModal() {
    const modal = document.getElementById('invalidMusicModal');
    modal.style.display = 'none';
    invalidMusicList = [];
}


