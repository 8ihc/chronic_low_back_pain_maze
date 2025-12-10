/* js/your-section.js */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. Intro & Outro 文字浮現效果 (共用邏輯)
    // ==========================================
    // 這裡同時選取開頭 Intro 和結尾 Outro 的文字區塊
    const textBlocks = document.querySelectorAll('.intro-text-block, .outro-text-block');

    if (textBlocks.length > 0) {
        const textObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                } else {
                    entry.target.classList.remove('active');
                }
            });
        }, {
            root: null,
            threshold: 0.5, // 進入 50% 觸發
            rootMargin: "0px"
        });

        textBlocks.forEach(block => textObserver.observe(block));
    }


    // ==========================================
    // 2. Thought Experiment: 卡片翻轉功能
    // ==========================================
    const cards = document.querySelectorAll('.te-card-wrapper');
    if (cards.length > 0) {
        cards.forEach(card => {
            card.addEventListener('click', function() {
                this.classList.toggle('flipped');
            });
        });
    }


    // ==========================================
    // 3. Thought Experiment: 電影字幕捲動控制
    // ==========================================
    const subtitleEl = document.getElementById('dynamic-subtitle');
    const steps = document.querySelectorAll('.scroll-step');
    const thoughtsContainer = document.querySelector('.inner-thoughts-container');

    if (subtitleEl && steps.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const newText = entry.target.getAttribute('data-text');
                    
                    // 判斷當前步驟
                    const isStep2 = entry.target.classList.contains('step-2'); // 痛覺 (紅字)
                    const isStep4 = entry.target.classList.contains('step-5'); // 內心氣泡

                    // 控制內心氣泡 (Step 4 顯示)
                    if (thoughtsContainer) {
                        if (isStep4) {
                            thoughtsContainer.classList.add('active');
                        } else {
                            thoughtsContainer.classList.remove('active');
                        }
                    }

                    // 控制字幕轉場
                    if (subtitleEl.innerHTML !== newText) {
                        subtitleEl.classList.remove('active');
                        
                        setTimeout(() => {
                            subtitleEl.innerHTML = newText;
                            
                            // 控制紅色痛覺字體 (Step 2)
                            if (isStep2) {
                                subtitleEl.classList.add('pain-highlight');
                            } else {
                                subtitleEl.classList.remove('pain-highlight');
                            }
                            
                            subtitleEl.classList.add('active');
                        }, 200);
                    }
                }
            });
        }, {
            root: null,
            rootMargin: '-40% 0px -40% 0px',
            threshold: 0
        });

        steps.forEach(step => observer.observe(step));
        
        // 初始顯示
        setTimeout(() => subtitleEl.classList.add('active'), 500);
    }
});