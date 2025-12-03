$(document).ready(function() {
    // Initialize Audio Story Players
    initAudioPlayers();

    // 平滑滾動效果
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });

    // 下拉式註釋互動
    $('.expandable-note-trigger').on('click', function() {
        const $trigger = $(this);
        const targetId = $trigger.attr('aria-controls');
        const $content = $('#' + targetId);
        const isExpanded = $trigger.attr('aria-expanded') === 'true';

        if (isExpanded) {
            // 收合
            $trigger.attr('aria-expanded', 'false');
            $content.attr('aria-hidden', 'true');
            $content.removeClass('active');
        } else {
            // 展開
            $trigger.attr('aria-expanded', 'true');
            $content.attr('aria-hidden', 'false');
            $content.addClass('active');
        }
    });

    // 鍵盤支援 (Enter 和 Space)
    $('.expandable-note-trigger').on('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $(this).click();
        }
    });
});

// Toggle 專家觀點區塊
function toggleContent(button) {
    const content = button.nextElementSibling;
    button.classList.toggle('active');
    
    if (button.classList.contains('active')) {
        content.style.maxHeight = content.scrollHeight + 'px';
    } else {
        content.style.maxHeight = '0';
    }
}

// Modal 專家訪談功能
const HINT_DATA = {
    videoUrl: "https://d21rhj7n383afu.cloudfront.net/washpost-production/TWP/20161001/57efe827e4b0bc3a464cd99a/57fb002be4b037a240c7b2ab_1439399835595-cf9g26_t_1476067411708_1280_720_2000.mp4",
    
    'qa2': {
        title: "影像報告與疼痛表現不一致：神經外科醫師怎麼看？",
        speaker: "神經外科 陳則宇醫師"
    }
};

const modal = document.getElementById('expertModal');
const modalBody = modal ? modal.querySelector('.modal-body') : null;

function openModal(hintId) {
    if (!modal || !modalBody) return;
    
    const data = HINT_DATA[hintId];
    if (!data) return;

    const videoHTML = `
        <div class="modal-video-container">
            <video controls playsinline width="100%" height="100%" style="border-radius: 8px;">
                <source src="${HINT_DATA.videoUrl}" type="video/mp4">
                您的瀏覽器不支援影片播放。
            </video>
        </div>
    `;

    modalBody.innerHTML = `
        <h2>${data.title}</h2>
        <p style="color: #544733; font-weight: 600;">🎙️ 採訪對象: ${data.speaker}</p>
        ${videoHTML}
    `;
    
    modal.style.display = 'flex';
    
    const videoElement = modalBody.querySelector('video');
    if(videoElement) {
        videoElement.load();
    }
}

function closeModal(event) {
    if (!modal || !modalBody) return;
    
    if (event.target === modal || event.target.className === 'close-btn') {
        const videoElement = modalBody.querySelector('video');
        if (videoElement) {
            videoElement.pause();
            videoElement.currentTime = 0;
        }
        modal.style.display = 'none';
    }
}

// ===== NYT-Style Audio Scrollytelling Module =====

// SVG Icons
const SVG_VOLUME_OFF = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>`;

const SVG_VOLUME_UP = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>`;

// Global mute state
let isGlobalMuted = true;

function initAudioPlayers() {
    console.log('🎵 Initializing Audio Players...');
    const players = document.querySelectorAll('.audio-story-player');
    console.log(`Found ${players.length} players`);
    
    const globalToggleBtn = document.getElementById('globalAudioToggle');
    
    // Setup global mute toggle
    if (globalToggleBtn) {
        console.log('✅ Global toggle button found');
        globalToggleBtn.addEventListener('click', () => {
            isGlobalMuted = !isGlobalMuted;
            
            const globalText = globalToggleBtn.querySelector('.audio-text');
            
            if (isGlobalMuted) {
                globalToggleBtn.classList.remove('muted');
                globalToggleBtn.querySelector('svg').outerHTML = SVG_VOLUME_OFF;
                globalText.textContent = '點擊開啟聲音';
                // Mute all players
                document.querySelectorAll('.audio-story-player .audio-element').forEach(audio => {
                    audio.muted = true;
                });
                document.querySelectorAll('.progress-mute-btn').forEach(btn => {
                    btn.querySelector('svg').outerHTML = SVG_VOLUME_OFF;
                });
                console.log('🔇 All players muted');
            } else {
                globalToggleBtn.classList.add('muted');
                globalToggleBtn.querySelector('svg').outerHTML = SVG_VOLUME_UP;
                globalText.textContent = '點擊關閉聲音';
                // Unmute all players
                document.querySelectorAll('.audio-story-player .audio-element').forEach(audio => {
                    audio.muted = false;
                });
                document.querySelectorAll('.progress-mute-btn').forEach(btn => {
                    btn.querySelector('svg').outerHTML = SVG_VOLUME_UP;
                });
                console.log('🔊 All players unmuted');
            }
        });
    } else {
        console.error('❌ Global toggle button NOT found');
    }
    
    players.forEach((playerElement, index) => {
        const audioSrc = playerElement.dataset.audioSrc;
        const playerId = playerElement.dataset.playerId || `player-${index + 1}`;
        
        console.log(`📻 Setting up player ${playerId}:`, { audioSrc });
        
        // Parse embedded JSON data
        const jsonScript = playerElement.querySelector('script[type="application/json"]');
        let subtitles = [];
        
        if (jsonScript) {
            try {
                subtitles = JSON.parse(jsonScript.textContent);
                console.log(`✅ Parsed ${subtitles.length} subtitles for player ${playerId}`);
            } catch (error) {
                console.error(`❌ Error parsing JSON for player ${playerId}:`, error);
            }
        } else {
            console.warn(`⚠️ No embedded JSON found for player ${playerId}`);
        }
        
        // Clear and create new structure
        playerElement.innerHTML = `
            <div class="subtitle-display">
                <p class="subtitle-text">${subtitles.length > 0 ? '' : '無字幕資料'}</p>
            </div>
            <button class="progress-mute-btn" aria-label="Toggle mute" style="--progress: 0">
                ${SVG_VOLUME_OFF}
            </button>
            <audio class="audio-element" preload="none" muted>
                <source src="${audioSrc}" type="audio/mp4">
                <source src="${audioSrc}" type="audio/x-m4a">
            </audio>
        `;
        
        // Get elements
        const audioElement = playerElement.querySelector('.audio-element');
        const subtitleText = playerElement.querySelector('.subtitle-text');
        const muteButton = playerElement.querySelector('.progress-mute-btn');
        
        let currentSubtitleIndex = -1;
        let isPlaying = false;
        let hasLoadedAudio = false;
        
        // Mute button click handler
        muteButton.addEventListener('click', () => {
            audioElement.muted = !audioElement.muted;
            muteButton.querySelector('svg').outerHTML = audioElement.muted ? SVG_VOLUME_OFF : SVG_VOLUME_UP;
            
            // If paused, start playing
            if (audioElement.paused) {
                stopAllPlayers();
                audioElement.play().catch(err => {
                    console.log('Play prevented:', err);
                });
                isPlaying = true;
            }
            
            console.log(`${audioElement.muted ? '🔇' : '🔊'} Player ${playerId}`);
        });
        
        // Intersection Observer for scrollytelling
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    // Load audio when scrolled into view (only once)
                    if (!hasLoadedAudio) {
                        audioElement.preload = 'auto';
                        hasLoadedAudio = true;
                        console.log(`📥 Loading audio for player ${playerId}`);
                    }
                    
                    // Player is in view - start playing
                    if (!isPlaying) {
                        stopAllPlayers();
                        
                        // ✨ 如果這首歌已經播完了(或接近結尾)，強制重頭開始
                        // 這樣回捲體驗會更好
                        if (audioElement.currentTime >= audioElement.duration - 0.5) {
                            audioElement.currentTime = 0;
                            currentSubtitleIndex = -1;
                            subtitleText.textContent = '';
                        }
                        
                        audioElement.play().catch(err => {
                            console.log('Auto-play prevented:', err);
                        });
                        isPlaying = true;
                    }
                } else {
                    // Player is out of view - fade out and pause
                    if (isPlaying) {
                        fadeOutAndStop(audioElement, subtitleText);
                        isPlaying = false;
                    }
                }
            });
        }, {
            threshold: [0, 0.5, 1]
        });
        
        observer.observe(playerElement);
        
        // Subtitle synchronization
        audioElement.addEventListener('timeupdate', () => {
            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration;
            
            // 1. 更新進度條 (綠色圈圈)
            if (duration > 0) {
                const progress = (currentTime / duration) * 100;
                muteButton.style.setProperty('--progress', progress);
            }
            
            if (subtitles.length === 0) return;
            
            // 2. 找出目前時間點對應的字幕索引
            const matchIndex = subtitles.findIndex(sub => 
                currentTime >= sub.start && currentTime < sub.end
            );
            
            // 3. 只有當「字幕索引改變」時才執行動作 (節省效能)
            if (matchIndex !== currentSubtitleIndex) {
                
                // 更新索引紀錄
                currentSubtitleIndex = matchIndex;
                
                if (matchIndex !== -1) {
                    // --- 情況 A: 找到新字幕 ---
                    const newText = subtitles[matchIndex].text;
                    
                    // 檢查目前是否已經有文字顯示中
                    const isVisible = subtitleText.classList.contains('active');
                    
                    if (isVisible) {
                        // [切換模式]：原本有字 -> 先淡出 -> 等待 -> 換字淡入
                        subtitleText.classList.remove('active');
                        
                        setTimeout(() => {
                            // 再次確認索引沒變 (防止快速捲動時舊的 timeout 覆蓋新的)
                            if (currentSubtitleIndex === matchIndex) {
                                subtitleText.textContent = newText;
                                subtitleText.classList.add('active');
                            }
                        }, 200); // 等待 CSS transition 結束
                        
                    } else {
                        // [啟動模式]：原本沒字 (剛開始播/回捲) -> 立即換字 -> 立即淡入
                        // 這就是解決「回捲延遲」的關鍵，不需要等待淡出
                        subtitleText.textContent = newText;
                        
                        // 使用 requestAnimationFrame 確保下一幀才加上 active
                        // 這能確保動畫觸發更滑順，不會閃爍
                        requestAnimationFrame(() => {
                            subtitleText.classList.add('active');
                        });
                    }
                    
                } else {
                    // --- 情況 B: 進入空檔 (沒字幕的時間) ---
                    subtitleText.classList.remove('active');
                    // 這裡不需清空文字，讓它自然淡出即可
                }
            }
        });
        
        // Reset progress on ended
        audioElement.addEventListener('ended', () => {
            muteButton.style.setProperty('--progress', 0);
            subtitleText.classList.remove('active');
            setTimeout(() => {
                subtitleText.textContent = '';
            }, 300);
            currentSubtitleIndex = -1;
            isPlaying = false;
        });
        
        // Error handling
        audioElement.addEventListener('error', (e) => {
            const error = audioElement.error;
            console.error(`Error loading audio for player ${playerId}:`, {
                code: error ? error.code : 'unknown',
                message: error ? error.message : 'unknown',
                src: audioSrc
            });
            subtitleText.textContent = '音訊載入失敗';
            subtitleText.style.color = '#999';
            subtitleText.style.fontSize = '1rem';
        });
        
        // Additional error check for source element
        const sourceElement = audioElement.querySelector('source');
        if (sourceElement) {
            sourceElement.addEventListener('error', (e) => {
                console.error(`Source error for player ${playerId}:`, audioSrc);
            });
        }
    });
}

function stopAllPlayers() {
    document.querySelectorAll('.audio-story-player .audio-element').forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
    });
    document.querySelectorAll('.audio-story-player .subtitle-text').forEach(text => {
        text.classList.remove('active');
        text.textContent = '';
        text.style = ''; // ✨ 清除所有 JS 加上去的行內樣式
    });
}

function fadeOutAndStop(audioElement, subtitleText) {
    // Create fade out effect
    let volume = audioElement.volume;
    const fadeInterval = setInterval(() => {
        if (volume > 0.1) {
            volume -= 0.1;
            audioElement.volume = Math.max(0, volume);
        } else {
            clearInterval(fadeInterval);
            audioElement.pause();
            audioElement.currentTime = 0;
            audioElement.volume = 1; // Reset volume
            subtitleText.classList.remove('active');
            subtitleText.textContent = '';
        }
    }, 50);
}
