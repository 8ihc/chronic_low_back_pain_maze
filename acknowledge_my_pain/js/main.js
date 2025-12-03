$(document).ready(function() {
    // 停止所有其他音檔
    function stopAllAudio() {
        $('audio').each(function() {
            this.pause();
            this.currentTime = 0;
        });
        $('.play-btn').removeClass('playing');
        $('.play-icon').text('▶');
    }

    // 播放按鈕點擊事件
    $('.play-btn').click(function() {
        const audioNum = $(this).data('audio');
        const audio = document.getElementById('audio-' + audioNum);
        const btn = $(this);
        const icon = btn.find('.play-icon');

        if (btn.hasClass('playing')) {
            // 暫停當前音檔
            audio.pause();
            btn.removeClass('playing');
            icon.text('▶');
        } else {
            // 停止其他音檔，播放當前音檔
            stopAllAudio();
            audio.play();
            btn.addClass('playing');
            icon.text('⏸');
        }
    });

    // 音檔播放結束事件
    $('audio').on('ended', function() {
        const audioId = $(this).attr('id');
        const audioNum = audioId.split('-')[1];
        const btn = $('[data-audio="' + audioNum + '"]');
        btn.removeClass('playing');
        btn.find('.play-icon').text('▶');
    });

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
