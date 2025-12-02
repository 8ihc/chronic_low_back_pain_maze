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
