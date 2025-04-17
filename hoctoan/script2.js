document.addEventListener('DOMContentLoaded', () => {
    const gameContainer = document.getElementById('memory-game');
    const attemptsSpan = document.getElementById('attempts');
    const resultDiv = document.getElementById('result');
    const resetButton = document.getElementById('reset-button');

    // --- DỮ LIỆU NGUỒN (Giữ nguyên) ---
    const allDerivativePairs = [
        { func: "$x^n$", deriv: "$nx^{n-1}$", id: "deriv_xn" },
        { func: "$u^n$", deriv: "$nu^{n-1}.u'$", id: "deriv_un" },
        { func: "$c$", deriv: "$0$", id: "deriv_c" },
        { func: "$x$", deriv: "$1$", id: "deriv_x" },
        { func: "$kx$", deriv: "$k$", id: "deriv_kx" },
        { func: "$ku$", deriv: "$k.u'$", id: "deriv_ku" },
        { func: "$\\sin(x)$", deriv: "$\\cos(x)$", id: "deriv_sinx" },
        { func: "$\\sin(u)$", deriv: "$u'\\cos(u)$", id: "deriv_sinu" },
        { func: "$\\cos(x)$", deriv: "$-\\sin(x)$", id: "deriv_cosx" },
        { func: "$\\cos(u)$", deriv: "$-u'\\sin(u)$", id: "deriv_cosu" },
        { func: "$\\tan(x)$", deriv: "$\\frac{1}{cos^2(x)}$", id: "deriv_tanx" },
        { func: "$\\tan(u)$", deriv: "$\\frac{u'}{cos^2(u)}$", id: "deriv_tanu" },
        { func: "$\\cot(x)$", deriv: "$-\\frac{1}{sin^2(x)}$", id: "deriv_ctanx" },
        { func: "$\\cot(u)$", deriv: "$-\\frac{u'}{sin^2(u)}$", id: "deriv_ctanu" },
        { func: "$e^x$", deriv: "$e^x$", id: "deriv_ex" },
        { func: "$e^u$", deriv: "$u'.e^u$", id: "deriv_eu" },
        { func: "$\\ln(x)$", deriv: "$\\frac{1}{x}$", id: "deriv_lnx" },
        { func: "$\\ln(u)$", deriv: "$\\frac{u'}{u}$", id: "deriv_lnu" },
        { func: "$\\sqrt{x}$", deriv: "$\\frac{1}{2\\sqrt{x}}$", id: "deriv_sqrtx" },
        { func: "$\\sqrt{u}$", deriv: "$\\frac{u'}{2\\sqrt{u}}$", id: "deriv_sqrtu" },
        
        { func: "$\\frac{1}{x}$", deriv: "$-\\frac{1}{x^2}$", id: "deriv_1overx" },
        { func: "$\\frac{1}{u}$", deriv: "$-\\frac{u'}{u^2}$", id: "deriv_1overu" },
        { func: "$a^x$", deriv: "$a^x \\ln(a)$", id: "deriv_ax" },
        { func: "$a^u$", deriv: "$u'.a^u \\ln(a)$", id: "deriv_au" },
        { func: "$\\log_a(x)$", deriv: "$\\frac{1}{x \\ln(a)}$", id: "deriv_logax" },
        { func: "$\\log_a(u)$", deriv: "$\\frac{u'}{u \\ln(a)}$", id: "deriv_logau" },
        { func: "$u+v$", deriv: "$u'+ v'$", id: "deriv_uv" },
        { func: "$u-v$", deriv: "$u'- v'$", id: "deriv_u1v" },
        { func: "$u.v$", deriv: "$u'v+ v'u$", id: "deriv_uv2" },
        { func: "$\\frac{u}{v}$", deriv: "$\\frac{u'v-v'u}{v^2}$", id: "deriv_uv3" },
    ];

    let firstCard = null;
    let secondCard = null;
    let lockBoard = false;
    let matchedPairs = 0;
    let incorrectAttempts = 0;
    let currentCardsData = [];

    function shuffle(array) { /* ... giữ nguyên hàm shuffle ... */
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function getRandomColor() { /* ... giữ nguyên hàm getRandomColor ... */
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * 25) + 70;
        const lightness = Math.floor(Math.random() * 15) + 75;
        return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    }

    function initGame() {
        firstCard = null; secondCard = null; lockBoard = false;
        matchedPairs = 0; incorrectAttempts = 0;
        attemptsSpan.textContent = incorrectAttempts;
        resultDiv.classList.add('hidden');
        resultDiv.textContent = '';
        gameContainer.innerHTML = '';

        const shuffledAll = shuffle([...allDerivativePairs]);
        const selectedPairs = shuffledAll.slice(0, 5);

        selectedPairs.forEach(pair => { pair.color = getRandomColor(); });

        currentCardsData = [];
        selectedPairs.forEach(pair => {
            currentCardsData.push({ value: pair.func, pairId: pair.id, color: pair.color });
            currentCardsData.push({ value: pair.deriv, pairId: pair.id, color: pair.color });
        });

        shuffle(currentCardsData);

        currentCardsData.forEach(item => {
            const cardElement = document.createElement('div');
            cardElement.classList.add('memory-card');
            cardElement.dataset.pairId = item.pairId;

            const cardFront = document.createElement('div');
            cardFront.classList.add('card-face', 'card-front');
            cardFront.innerHTML = item.value;
            cardFront.style.backgroundColor = item.color;
            cardElement.appendChild(cardFront);

            const cardBack = document.createElement('div');
            cardBack.classList.add('card-face', 'card-back');
            cardBack.textContent = '?';
            cardElement.appendChild(cardBack);

            // **QUAN TRỌNG**: Gắn listener MỘT LẦN khi tạo thẻ
            cardElement.addEventListener('click', handleCardClick);

            gameContainer.appendChild(cardElement);
        });

        requestAnimationFrame(() => {
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                MathJax.typesetPromise(gameContainer.querySelectorAll('.card-front'))
                    .catch(err => console.error('MathJax card typesetting failed:', err));
            }
        });
    }

    function handleCardClick(e) {
        const clickedCard = e.target.closest('.memory-card');

        // Thêm log để debug
        // console.log("Clicked:", clickedCard?.dataset.pairId, "lockBoard:", lockBoard, "firstCard:", firstCard?.dataset.pairId);

        // Điều kiện kiểm tra ban đầu - Rất quan trọng
        if (!clickedCard || lockBoard || clickedCard === firstCard || clickedCard.classList.contains('matched')) {
            // console.log("Click ignored.");
            return;
        }

        flipCard(clickedCard);

        if (!firstCard) {
            // Lật thẻ đầu tiên
            firstCard = clickedCard;
            // console.log("Set firstCard:", firstCard.dataset.pairId);
            return; // Đợi thẻ thứ hai
        }

        // Lật thẻ thứ hai
        secondCard = clickedCard;
        // console.log("Set secondCard:", secondCard.dataset.pairId);
        lockBoard = true; // <<< Khóa bảng NGAY LẬP TỨC
        // console.log("Board locked.");

        checkForMatch();
    }

    function flipCard(card) {
        card.classList.add('flip');
    }

    function unflipCards() {
        // lockBoard đã là true ở đây
        // console.log("Starting unflip timeout. lockBoard:", lockBoard);
        setTimeout(() => {
            if(firstCard) firstCard.classList.remove('flip');
            if(secondCard) secondCard.classList.remove('flip');
            // console.log("Cards unflipped visually. Resetting board.");
            resetBoard(); // Reset *sau khi* thời gian chờ kết thúc
        // }, 1000); // Giảm thời gian chờ một chút (tùy chỉnh)
        }, 900); // Thử 900ms
    }

    function checkForMatch() {
        const isMatch = firstCard.dataset.pairId === secondCard.dataset.pairId;
        // console.log("Checking match:", isMatch);

        if (isMatch) {
            disableCards();
        } else {
            incorrectAttempts++;
            attemptsSpan.textContent = incorrectAttempts;
            unflipCards(); // Gọi hàm để bắt đầu chờ và úp thẻ
        }
    }

    function disableCards() {
        // console.log("Match found! Disabling cards:", firstCard.dataset.pairId, secondCard.dataset.pairId);
        // Không cần gỡ listener nếu đã check class 'matched' ở đầu handleCardClick
        firstCard.classList.add('matched');
        secondCard.classList.add('matched');
        matchedPairs++;

        // ***QUAN TRỌNG***: Reset bảng ngay sau khi xác định là khớp
        // để người dùng có thể lật cặp tiếp theo ngay lập tức.
        resetBoard();
        // console.log("Board reset after match.");


        if (matchedPairs === 5) {
             // console.log("Game finished!");
            setTimeout(showResult, 500); // Chờ chút cho hiệu ứng rồi hiện kết quả
        }
    }

    function resetBoard() {
        // console.log("Resetting board state. Unlocking board.");
        [firstCard, secondCard, lockBoard] = [null, null, false];
    }

    function showResult() {
        resultDiv.textContent = `Hoàn thành! Bạn đã sai ${incorrectAttempts} lần.`;
        resultDiv.classList.remove('hidden');
    }

    resetButton.addEventListener('click', initGame);
    initGame();
});
