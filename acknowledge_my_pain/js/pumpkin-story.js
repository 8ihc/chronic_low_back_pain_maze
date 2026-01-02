// ===== 南瓜「尿遁」故事跑馬燈效果 JS ======

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