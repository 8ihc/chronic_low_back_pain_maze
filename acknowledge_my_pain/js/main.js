$(document).ready(function () {
    // Initialize Audio Story Players
    initAudioPlayers();

    // Initialize Face Section Scroll Effect (moved to face-section.js)
    if (typeof initFaceScrollEffect === 'function') {
        initFaceScrollEffect();
    }

    // 平滑滾動效果
    $('a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this.getAttribute('href'));
        if (target.length) {
            $('html, body').stop().animate({
                scrollTop: target.offset().top
            }, 1000);
        }
    });

    // 下拉式註釋互動
    $('.expandable-note-trigger').on('click', function () {
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
    $('.expandable-note-trigger').on('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            $(this).click();
        }
    });
});

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

    // 獲取所有 globalAudioToggle 按鈕（可能有多個）
    const globalToggleBtns = document.querySelectorAll('#globalAudioToggle');

    // 定義全域切換邏輯
    const toggleGlobalAudio = () => {
        isGlobalMuted = !isGlobalMuted;

        // 更新所有全域按鈕的狀態
        globalToggleBtns.forEach(btn => {
            const globalText = btn.querySelector('.audio-text');

            if (isGlobalMuted) {
                btn.classList.remove('muted');
                btn.querySelector('svg').outerHTML = SVG_VOLUME_OFF;
                if (globalText) globalText.textContent = '開啟聲音，聆聽南瓜的故事';
            } else {
                btn.classList.add('muted');
                btn.querySelector('svg').outerHTML = SVG_VOLUME_UP;
                if (globalText) globalText.textContent = '向下滑動，聆聽南瓜的故事';
            }
        });

        // 更新所有播放器的靜音狀態
        if (isGlobalMuted) {
            document.querySelectorAll('.audio-story-player .audio-element').forEach(audio => {
                audio.muted = true;
            });
            document.querySelectorAll('.progress-mute-btn').forEach(btn => {
                btn.querySelector('svg').outerHTML = SVG_VOLUME_OFF;
            });
            console.log('🔇 All players muted');
        } else {
            document.querySelectorAll('.audio-story-player .audio-element').forEach(audio => {
                audio.muted = false;
            });
            document.querySelectorAll('.progress-mute-btn').forEach(btn => {
                btn.querySelector('svg').outerHTML = SVG_VOLUME_UP;
            });
            console.log('🔊 All players unmuted');
        }
    };

    // 為所有全域按鈕綁定事件
    if (globalToggleBtns.length > 0) {
        console.log(`✅ Found ${globalToggleBtns.length} global toggle button(s)`);
        globalToggleBtns.forEach(btn => {
            btn.addEventListener('click', toggleGlobalAudio);
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
                ${isGlobalMuted ? SVG_VOLUME_OFF : SVG_VOLUME_UP}
            </button>
            <audio class="audio-element" preload="none">
                <source src="${audioSrc}" type="audio/mp4">
                <source src="${audioSrc}" type="audio/x-m4a">
            </audio>
        `;

        // Get elements
        const audioElement = playerElement.querySelector('.audio-element');
        const subtitleText = playerElement.querySelector('.subtitle-text');
        const muteButton = playerElement.querySelector('.progress-mute-btn');

        // 根據全域狀態設置初始靜音狀態
        audioElement.muted = isGlobalMuted;

        let currentSubtitleIndex = -1;
        let isPlaying = false;
        let hasLoadedAudio = false;
        let playDebounceTimer = null; // Debounce 計時器

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
                console.log(`👁️ Player ${playerId}: intersecting=${entry.isIntersecting}, ratio=${entry.intersectionRatio.toFixed(2)}`);

                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    console.log(`📍 Player ${playerId}: isPlaying=${isPlaying}`);

                    // Load audio when scrolled into view (only once)
                    if (!hasLoadedAudio) {
                        audioElement.preload = 'auto';
                        hasLoadedAudio = true;
                        console.log(`📥 Loading audio for player ${playerId}`);
                    }

                    // Player is in view - 使用 debounce 延遲播放
                    if (!isPlaying && !playDebounceTimer) {
                        console.log(`⏱️ Player ${playerId}: Setting debounce timer (1000ms)`);

                        playDebounceTimer = setTimeout(() => {
                            console.log(`▶️ Player ${playerId}: Debounce completed, attempting to play`);
                            stopAllPlayers();

                            // ✨ 如果這首歌已經播完了(或接近結尾)，強制重頭開始
                            if (audioElement.currentTime >= audioElement.duration - 0.5) {
                                audioElement.currentTime = 0;
                                currentSubtitleIndex = -1;
                                subtitleText.textContent = '';
                            }

                            // 標記為正在播放
                            isPlaying = true;
                            playDebounceTimer = null;

                            // 根據全域靜音狀態設置音訊元素
                            audioElement.muted = isGlobalMuted;
                            console.log(`🔊 Player ${playerId}: muted=${audioElement.muted}`);

                            // 嘗試播放
                            audioElement.play().then(() => {
                                console.log(`✅ Player ${playerId}: Playing successfully`);
                            }).catch(err => {
                                console.log(`❌ Player ${playerId}: Auto-play prevented, trying muted:`, err.message);
                                // 瀏覽器阻止了自動播放，改為靜音播放
                                audioElement.muted = true;
                                muteButton.querySelector('svg').outerHTML = SVG_VOLUME_OFF;
                                return audioElement.play().then(() => {
                                    console.log(`✅ Player ${playerId}: Playing muted successfully`);
                                }).catch(err2 => {
                                    console.error(`❌ Player ${playerId}: Failed to play even when muted:`, err2.message);
                                    isPlaying = false;
                                });
                            });
                        }, 1000); // 延遲 1000ms (1秒)
                    }
                } else {
                    // Player is out of view - 清除 debounce 計時器並停止播放
                    if (playDebounceTimer) {
                        console.log(`🚫 Player ${playerId}: Clearing debounce timer (scrolled away)`);
                        clearTimeout(playDebounceTimer);
                        playDebounceTimer = null;
                    }

                    if (isPlaying) {
                        console.log(`⏸️ Player ${playerId}: Stopping playback`);
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

// ...face-section.js now contains initFaceScrollEffect

// 根據捲動進度更新文字顯示
function updateTextByScroll(lines, lineTexts, progress) {
    const totalLines = lines.length;

    lines.forEach((line, index) => {
        const text = lineTexts[index];
        const textLength = text.length;

        // 計算每一行應該在哪個進度區間顯示
        const lineStartProgress = index / totalLines;
        const lineEndProgress = (index + 1) / totalLines;

        if (progress < lineStartProgress) {
            // 還沒到這一行
            line.textContent = '';
            line.style.opacity = 0;
        } else if (progress >= lineEndProgress) {
            // 這一行已完成
            line.textContent = text;
            line.style.opacity = 1;
        } else {
            // 正在顯示這一行
            line.style.opacity = 1;
            const lineProgress = (progress - lineStartProgress) / (lineEndProgress - lineStartProgress);
            const charsToShow = Math.floor(lineProgress * textLength);
            line.textContent = text.substring(0, charsToShow);
        }
    });
}

// ========== 導航栏交互功能 ==========
$(document).ready(function () {
    // 索引標籤狀態管理
    let isOpen = false;
    let scrollTimer = null;
    let isIndexTabVisible = true;

    // 索引標籤切換
    $('#indexTab').on('click', function (e) {
        e.stopPropagation();
        isOpen = !isOpen;

        if (isOpen) {
            $(this).addClass('active');
            $('#navMenu').addClass('active');
        } else {
            $(this).removeClass('active');
            $('#navMenu').removeClass('active');
        }
    });

    // 點擊選單連結後關閉選單並平滑滾動
    $('.nav-link[href^="#"]').on('click', function (e) {
        e.preventDefault();
        const target = $(this).attr('href');

        // 關閉選單
        isOpen = false;
        $('#indexTab').removeClass('active');
        $('#navMenu').removeClass('active');

        // 平滑滾動
        if (target && target !== '#') {
            $('html, body').animate({
                scrollTop: $(target).offset().top
            }, 800, 'swing');
        }
    });

    // 點擊選單外部關閉選單
    $(document).on('click', function (e) {
        if (!$(e.target).closest('.navbar').length && !$(e.target).closest('.nav-menu').length) {
            isOpen = false;
            $('#indexTab').removeClass('active');
            $('#navMenu').removeClass('active');
        }
    });

    // 滾動時自動隱藏/顯示索引標籤（當選單未開啟時）
    function handleIndexTabAutoHide() {
        if (isOpen) return; // 如果選單開啟，不自動隱藏

        // 顯示索引標籤
        if (!isIndexTabVisible) {
            $('#indexTab').css('opacity', '1');
            isIndexTabVisible = true;
        }

        // 清除之前的計時器
        if (scrollTimer) {
            clearTimeout(scrollTimer);
        }

        // 設定新計時器：停止滾動 2 秒後隱藏
        scrollTimer = setTimeout(function () {
            if (!isOpen) {
                $('#indexTab').css('opacity', '0');
                isIndexTabVisible = false;
            }
        }, 2000);
    }

    // 滾動監聽：header完全離開視窗後才顯示導航栏
    function toggleNavbarVisibility() {
        const header = $('#thought-experiment');
        const pumpkinStory = $('#pumpkin-story');

        if (header.length && pumpkinStory.length) {
            const scrollTop = $(window).scrollTop();
            const pumpkinStoryTop = pumpkinStory.offset().top;

            // 當滾動位置到達或超過「南瓜的故事」section的頂部時顯示導航栏
            if (scrollTop >= pumpkinStoryTop - 10) {
                $('#navbar').addClass('visible');
            } else {
                $('#navbar').removeClass('visible');
            }
        }

        // 處理索引標籤自動隱藏
        handleIndexTabAutoHide();
    }

    // 初始檢查
    toggleNavbarVisibility();

    // 滾動時檢查
    $(window).on('scroll', toggleNavbarVisibility);
});