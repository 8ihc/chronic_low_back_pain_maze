// face-section.js
// 專責 face-section 動態滾動動畫

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
        const faceSectionTop = faceSection.offsetTop;
        const sectionHeight = faceSection.offsetHeight;
        const windowHeight = window.innerHeight;
        const sectionScrolled = scrollTop - faceSectionTop;
        const totalProgress = Math.min((sectionScrolled - windowHeight) / (sectionHeight - windowHeight), 1);

        if (sectionScrolled < windowHeight) {
            img01.style.opacity = 0.8;
            img02.style.opacity = 0;
            if (faceSectionHeader) faceSectionHeader.style.opacity = 0;
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
            const effectStart = windowHeight;
            const effectEnd = sectionHeight;
            const effectDistance = effectEnd - effectStart;
            const totalProgress = Math.min((sectionScrolled - effectStart) / effectDistance, 1);

            if (totalProgress < 0.286) {
                img01.style.opacity = 0.8;
                img02.style.opacity = 0;
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;
                const stageProgress = totalProgress / 0.286;
                mainLines.forEach((line, index) => {
                    const lineStartProgress = index / mainLines.length;
                    const lineEndProgress = (index + 1) / mainLines.length;
                    const lineProgress = (stageProgress - lineStartProgress) / (lineEndProgress - lineStartProgress);
                    if (lineProgress < 0) {
                        line.textContent = '';
                        line.style.opacity = 0;
                    } else if (lineProgress < 0.4) {
                        const fadeInProgress = lineProgress / 0.4;
                        line.style.opacity = fadeInProgress;
                        const charsToShow = Math.floor(fadeInProgress * mainTexts[index].length);
                        line.textContent = mainTexts[index].substring(0, charsToShow);
                    } else if (lineProgress < 0.8) {
                        line.textContent = mainTexts[index];
                        line.style.opacity = 1;
                    } else if (lineProgress < 1) {
                        const fadeOutProgress = (lineProgress - 0.8) / 0.2;
                        line.textContent = mainTexts[index];
                        line.style.opacity = 1 - fadeOutProgress;
                    } else {
                        line.textContent = '';
                        line.style.opacity = 0;
                    }
                });
                leftLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                rightLinesFinal.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
            } else if (totalProgress < 0.429) {
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;
                const stageProgress = (totalProgress - 0.286) / 0.143;
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                if (stageProgress < 0.5) {
                    const faceProgress = stageProgress / 0.5;
                    img01.style.opacity = 0.8 * (1 - faceProgress);
                    img02.style.opacity = 0.8 * faceProgress;
                    leftLinesFinal.forEach(line => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                    rightLinesFinal.forEach(line => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                } else {
                    const finalProgress = (stageProgress - 0.5) / 0.5;
                    img01.style.opacity = 0;
                    img02.style.opacity = 0.8;
                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = leftTextsFinal[index];
                        line.style.opacity = finalProgress;
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = rightTextsFinal[index];
                        line.style.opacity = finalProgress;
                    });
                }
            } else if (totalProgress < 0.571) {
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                if (faceSectionHeader) faceSectionHeader.style.opacity = 0;
                img01.style.opacity = 0;
                img02.style.opacity = 0.8;
                leftLinesFinal.forEach((line, index) => {
                    line.textContent = leftTextsFinal[index];
                    line.style.opacity = 1;
                });
                rightLinesFinal.forEach((line, index) => {
                    line.textContent = rightTextsFinal[index];
                    line.style.opacity = 1;
                });
            } else if (totalProgress < 0.9) {
                const fadeProgress = (totalProgress - 0.571) / (0.9 - 0.571);
                mainLines.forEach(line => {
                    line.textContent = '';
                    line.style.opacity = 0;
                });
                img01.style.opacity = 0;
                if (fadeProgress < 0.5) {
                    const fadeOutProgress = fadeProgress * 2;
                    img02.style.opacity = Math.max(0, 1 - fadeOutProgress);
                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = leftTextsFinal[index];
                        line.style.opacity = Math.max(0, 1 - fadeOutProgress);
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = rightTextsFinal[index];
                        line.style.opacity = Math.max(0, 1 - fadeOutProgress);
                    });
                    if (faceSectionHeader) {
                        faceSectionHeader.style.opacity = 0;
                    }
                } else {
                    const fadeInProgress = (fadeProgress - 0.5) * 2;
                    img02.style.opacity = 0;
                    leftLinesFinal.forEach((line, index) => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                    rightLinesFinal.forEach((line, index) => {
                        line.textContent = '';
                        line.style.opacity = 0;
                    });
                    if (faceSectionHeader) {
                        faceSectionHeader.style.opacity = Math.min(1, fadeInProgress);
                    }
                }
            } else {
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
                img01.style.opacity = 0;
                img02.style.opacity = 0;
                if (faceSectionHeader) {
                    faceSectionHeader.style.opacity = 1;
                }
            }
        }
    });
}
