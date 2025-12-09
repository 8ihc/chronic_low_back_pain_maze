$(document).ready(function () {
    // Initialize Audio Story Players
    initAudioPlayers();

    // Initialize Face Section Scroll Effect
    initFaceScrollEffect();

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

// Face Section Scroll Effect
function initFaceScrollEffect() {
    const faceSection = document.querySelector('.face-section');
    const faceSectionHeader = faceSection ? faceSection.querySelector('header') : null;
    const img01 = document.querySelector('.img-01');
    const img02 = document.querySelector('.img-02');
    const mainLines = document.querySelectorAll('.intro-text-main .line');
    const leftLinesFinal = document.querySelectorAll('.intro-text-final-left .line');
    const rightLinesFinal = document.querySelectorAll('.intro-text-final-right .line');

    if (!faceSection || !img01 || !img02) return;

    // 儲存每行的完整文字
    const mainTexts = Array.from(mainLines).map(line => line.textContent);
    const leftTextsFinal = Array.from(leftLinesFinal).map(line => line.textContent);
    const rightTextsFinal = Array.from(rightLinesFinal).map(line => line.textContent);

    window.addEventListener('scroll', function () {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const faceSectionTop = faceSection.offsetTop; // face-section 距離頁面頂部的距離
        const sectionHeight = faceSection.offsetHeight; // 1200vh
        const windowHeight = window.innerHeight; // 100vh

        // 計算從 face-section 頂部開始的滾動量
        const sectionScrolled = scrollTop - faceSectionTop; // 從 face-section 頂部開始計算的滾動量

        // 階段劃分 (1200vh 總長度)：
        // 0-100vh: 01 完整顯示，不做任何變化
        // 100vh-200vh: 左側第一組文字逐字顯示（第一階段）
        // 200vh-300vh: 左側第一組淡出，第二組逐字顯示（第二階段）
        // 300vh-400vh: 左側第二組淡出，臉從 01 過渡到 02，同時「日」「常」淡入（第三階段）
        // 400vh-500vh: 保持 02 和「日」「常」完整顯示（第四階段）
        // 500vh-900vh: 臉部淡出，標題淡入（第五階段）
        // 900vh-1200vh: 標題保持完全顯示（第六階段）

        if (sectionScrolled < windowHeight) {
            // 還在第一個視窗內，保持 01 完全顯示
            img01.style.opacity = 0.8;
            img02.style.opacity = 0;
            // header 內容保持透明
            if (faceSectionHeader) faceSectionHeader.style.opacity = 0;
            // 隱藏所有文字
            mainLines.forEach(line => {
                line.textContent = '';
                line.style.opacity = 0;
            });
            leftLinesFinal.forEach(line => {
                line.textContent = '';
                line.style.opacity = 0;
            });
            rightLinesFinal.forEach(line => {
                line.textContent = '';
                line.style.opacity = 0;
            });
        } else {
            // 開始滾動效果：從 100vh 到 1000vh
            const effectStart = windowHeight; // 100vh
            const effectEnd = sectionHeight; // 1000vh
            const effectDistance = effectEnd - effectStart; // 900vh

            // 計算總進度 (0 到 1)，基於 section 內的滾動量
            const totalProgress = Math.min((sectionScrolled - effectStart) / effectDistance, 1);

            // 階段 1 (0-0.286): 所有 7 行文字逐行顯示並淡出（同一位置）
            if (totalProgress < 0.286) {
                img01.style.opacity = 0.8;
                img02.style.opacity = 0;
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;

                const stageProgress = totalProgress / 0.286; // 映射到 0-1

                // 7 行文字，每行分配 1/7 的進度空間
                // 每行的生命週期：40% 淡入+打字，40% 停留，20% 淡出
                mainLines.forEach((line, index) => {
                    const lineStartProgress = index / mainLines.length;
                    const lineEndProgress = (index + 1) / mainLines.length;
                    const lineProgress = (stageProgress - lineStartProgress) / (lineEndProgress - lineStartProgress);

                    if (lineProgress < 0) {
                        // 還沒到這一行
                        line.textContent = '';
                        line.style.opacity = 0;
                    } else if (lineProgress < 0.4) {
                        // 淡入並打字 (0-40%)
                        const fadeInProgress = lineProgress / 0.4;
                        line.style.opacity = fadeInProgress;
                        const charsToShow = Math.floor(fadeInProgress * mainTexts[index].length);
                        line.textContent = mainTexts[index].substring(0, charsToShow);
                    } else if (lineProgress < 0.8) {
                        // 停留顯示完整文字 (40%-80%)
                        line.textContent = mainTexts[index];
                        line.style.opacity = 1;
                    } else if (lineProgress < 1) {
                        // 淡出 (80%-100%)
                        const fadeOutProgress = (lineProgress - 0.8) / 0.2;
                        line.textContent = mainTexts[index];
                        line.style.opacity = 1 - fadeOutProgress;
                    } else {
                        // 已經結束
                        line.textContent = '';
                        line.style.opacity = 0;
                    }
                });

                // 最終文字隱藏
                leftLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                rightLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
            }
            // 階段 2 (0.286-0.429): 圖片過渡，「日」「常」淡入
            else if (totalProgress < 0.429) {
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;

                const stageProgress = (totalProgress - 0.286) / 0.143; // 映射到 0-1

                // 所有主要文字完全隱藏
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });

                // 圖片過渡（前 50%）
                if (stageProgress < 0.5) {
                    const faceProgress = stageProgress / 0.5; // 映射到 0-1
                    img01.style.opacity = 0.8 * (1 - faceProgress);
                    img02.style.opacity = 0.8 * faceProgress;

                    // 「日」「常」還未顯示
                    leftLinesFinal.forEach(line => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                    rightLinesFinal.forEach(line => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                }
                // 「日」「常」淡入（後 50%）
                else {
                    const finalProgress = (stageProgress - 0.5) / 0.5; // 映射到 0-1

                    // 臉部完全切換到 02
                    img01.style.opacity = 0;
                    img02.style.opacity = 0.8;

                    // 「日」「常」同步淡入
                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = leftTextsFinal[index];
                        line.style.opacity = finalProgress;
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = rightTextsFinal[index];
                        line.style.opacity = finalProgress;
                    });
                }
            }
            // 階段 3 (0.429-0.571): 保持 02 和「日」「常」完整顯示
            else if (totalProgress < 0.571) {
                // 所有主要文字完全隱藏
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });

                // header 內容保持透明
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;

                // 臉完全切換到 02
                img01.style.opacity = 0;
                img02.style.opacity = 0.8;

                // 「日」「常」完整顯示
                leftLinesFinal.forEach((line, index) => {
                    line.textContent = leftTextsFinal[index];
                    line.style.opacity = 1;
                });
                rightLinesFinal.forEach((line, index) => {
                    line.textContent = rightTextsFinal[index];
                    line.style.opacity = 1;
                });
            }
            // 階段 4 (0.571-0.9): 前半段臉部淡出，後半段標題淡入
            else if (totalProgress < 0.9) {
                const fadeProgress = (totalProgress - 0.571) / (0.9 - 0.571); // 映射到 0-1 (500vh-900vh)

                // 所有主要文字完全隱藏
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });

                // img01 完全隱藏
                img01.style.opacity = 0;

                if (fadeProgress < 0.5) {
                    // 前半段 (0-0.5): 臉部和「日」「常」淡出
                    const fadeOutProgress = fadeProgress * 2; // 映射到 0-1

                    img02.style.opacity = Math.max(0, 1 - fadeOutProgress);

                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = leftTextsFinal[index];
                        line.style.opacity = Math.max(0, 1 - fadeOutProgress);
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = rightTextsFinal[index];
                        line.style.opacity = Math.max(0, 1 - fadeOutProgress);
                    });

                    // header 內容保持隱藏
                    if (faceSectionHeader) {
                        faceSectionHeader.style.opacity = 0;
                    }
                } else {
                    // 後半段 (0.5-1.0): 臉部完全消失，標題淡入
                    const fadeInProgress = (fadeProgress - 0.5) * 2; // 映射到 0-1

                    img02.style.opacity = 0;

                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });

                    // header 內容淡入
                    if (faceSectionHeader) {
                        faceSectionHeader.style.opacity = Math.min(1, fadeInProgress);
                    }
                }
            }
            // 階段 5 (0.9-1.0): 標題保持完全顯示
            else {
                // 所有主要文字完全隱藏
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                leftLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                rightLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });

                // 臉部完全隱藏
                img01.style.opacity = 0;
                img02.style.opacity = 0;

                // header 內容完全顯示
                if (faceSectionHeader) {
                    faceSectionHeader.style.opacity = 1;
                }
            }
        }
    });
}

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

$(document).ready(function() {

    // ====== 跑馬燈觸發偵測 ======
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // 如果區塊進入視窗 (isIntersecting)
            if (entry.isIntersecting) {
                // 幫裡面的文字加上 'active' class，動畫就會開始
                const lines = entry.target.querySelectorAll('.scrolling-text');
                lines.forEach(line => line.classList.add('active'));
                
                // (可選) 觸發一次後就取消偵測，避免滑進滑出一直重置
                // observer.unobserve(entry.target); 
            }
        });
    }, { threshold: 0.7 }); // threshold: 0.7 代表「看到 70% 的區塊」時觸發

    // 開始偵測那個包著文字的外框
    const wrapper = document.querySelector('.scrolling-text-wrapper');
    if (wrapper) {
        observer.observe(wrapper);
    }
});

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