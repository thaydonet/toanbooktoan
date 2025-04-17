document.addEventListener('DOMContentLoaded', () => {
    const functionItemsContainer = document.getElementById('function-items-container');
    const derivativeItemsContainer = document.getElementById('derivative-items-container');
    const feedbackDiv = document.getElementById('feedback');
    const gradeButton = document.getElementById('grade-button');
    const resetButton = document.getElementById('reset-button');

    // --- DỮ LIỆU NGUỒN VỚI CÚ PHÁP LATEX ---
    const allDerivativePairs = [
        // Sử dụng $...$ cho inline math
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
         // Thêm các cặp khác với cú pháp LaTeX chuẩn
    ];

    let currentPairs = [];
    let draggedItem = null;
    let filledCount = 0;
    let gradingDone = false;

    // --- Hàm khởi tạo trò chơi ---
    function initGame() {
        filledCount = 0;
        gradingDone = false;
        functionItemsContainer.innerHTML = '';
        derivativeItemsContainer.innerHTML = '';
        feedbackDiv.className = ''; // Xóa class màu của feedback

        // 1. Chọn ngẫu nhiên 10 cặp
        const shuffledAll = [...allDerivativePairs].sort(() => Math.random() - 0.5);
        currentPairs = shuffledAll.slice(0, 10);

        // 2. Tạo 10 mục hàm số và vùng thả
        currentPairs.forEach(pair => {
            const funcItem = document.createElement('div');
            funcItem.classList.add('function-item');
            funcItem.dataset.correctDerivative = pair.deriv; // Lưu đạo hàm đúng (dạng LaTeX)

            const funcText = document.createElement('span');
            funcText.classList.add('function-text');
            funcText.innerHTML = pair.func; // Gán chuỗi LaTeX trực tiếp
            funcItem.appendChild(funcText);

            const dropZone = document.createElement('div');
            dropZone.classList.add('drop-zone');
            dropZone.textContent = '_';
            dropZone.dataset.filled = "false";

            addDropZoneListeners(dropZone);

            funcItem.appendChild(dropZone);
            functionItemsContainer.appendChild(funcItem);
        });

        // 3. Tạo và xáo trộn 10 ô đạo hàm tương ứng
        const derivativesToDisplay = currentPairs.map(p => ({ deriv: p.deriv, id: p.id }));
        const shuffledDerivatives = derivativesToDisplay.sort(() => Math.random() - 0.5);

        shuffledDerivatives.forEach(item => {
            const derivBox = document.createElement('div');
            derivBox.classList.add('derivative-box');
            derivBox.setAttribute('draggable', 'true');
            derivBox.id = item.id;
            derivBox.dataset.derivative = item.deriv; // Lưu chuỗi LaTeX
            derivBox.innerHTML = item.deriv; // Gán chuỗi LaTeX trực tiếp

            addDraggableListeners(derivBox);

            derivativeItemsContainer.appendChild(derivBox);
        });

        // --- GỌI MATHJAX ĐỂ RENDER SAU KHI TẠO ELEMENT ---
        // Đợi một chút để đảm bảo DOM được cập nhật hoàn toàn trước khi gọi MathJax
         // Sử dụng requestAnimationFrame để đợi trình duyệt sẵn sàng vẽ lại
        requestAnimationFrame(() => {
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                console.log("Typesetting MathJax...");
                MathJax.typesetPromise([functionItemsContainer, derivativeItemsContainer])
                    .then(() => {
                        console.log("MathJax Typesetting Done!");
                        // Cập nhật trạng thái nút và feedback sau khi render xong (an toàn hơn)
                        gradeButton.disabled = true;
                        gradeButton.textContent = 'Chấm điểm';
                        updateFeedback("Kéo 10 đạo hàm vào ô tương ứng.", "info");
                    })
                    .catch((err) => console.error('MathJax typesetting failed:', err));
            } else {
                console.warn('MathJax not ready for typesetting yet.');
                // Nếu MathJax chưa sẵn sàng, cập nhật nút và feedback ngay
                gradeButton.disabled = true;
                gradeButton.textContent = 'Chấm điểm';
                updateFeedback("Kéo 10 đạo hàm vào ô tương ứng.", "info");
            }
        });


    } // --- Hết initGame ---

    // --- Các hàm xử lý sự kiện kéo thả ---
    // ... (Toàn bộ các hàm addDraggableListeners, addDropZoneListeners, handleDragStart,
    //      handleDragEnd, handleDragOver, handleDragLeave, handleDrop giữ nguyên như phiên bản trước) ...

      // --- Hàm Chấm điểm (GIỮ NGUYÊN LOGIC) ---
    function gradeAnswers() {
        if (gradingDone || filledCount < 10) return;

        gradingDone = true;
        gradeButton.disabled = true;
        gradeButton.textContent = 'Đã chấm';
        let score = 0;

        const allFunctionItems = functionItemsContainer.querySelectorAll('.function-item');

        allFunctionItems.forEach(item => {
            const dropZone = item.querySelector('.drop-zone');
            const correctDerivativeLatex = item.dataset.correctDerivative; // Lấy LaTeX đúng
            const droppedBox = dropZone.querySelector('.derivative-box');

            let isCorrect = false;
            if (droppedBox) {
                const droppedDerivativeLatex = droppedBox.dataset.derivative; // Lấy LaTeX đã thả
                // So sánh chuỗi LaTeX trực tiếp
                if (droppedDerivativeLatex === correctDerivativeLatex) {
                    isCorrect = true;
                    score++;
                }
                dropZone.classList.add(isCorrect ? 'correct-final' : 'incorrect-final');
                droppedBox.setAttribute('draggable', 'false');
                droppedBox.style.cursor = 'default';
            } else {
                 dropZone.classList.add('incorrect-final');
            }

            // Không cần remove listener nữa vì đã có check gradingDone ở đầu các handler
        });

         // Vô hiệu hóa các ô kéo còn lại ở nguồn
        derivativeItemsContainer.querySelectorAll('.derivative-box').forEach(box => {
             box.setAttribute('draggable', 'false');
             box.style.cursor = 'default';
             box.style.opacity = '0.7';
        });

        updateFeedback(`Kết quả: Đúng ${score}/10 câu!`, score === 10 ? "success" : "info");

         // Tùy chọn: Scroll lên đầu để xem kết quả dễ hơn
         // window.scrollTo({ top: 0, behavior: 'smooth' });
    }

     // --- Cập nhật khu vực phản hồi (GIỮ NGUYÊN) ---
    function updateFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = '';
        if (type) {
            feedbackDiv.classList.add(type);
        }
    }

    // --- Gắn sự kiện cho các nút (GIỮ NGUYÊN) ---
    gradeButton.addEventListener('click', gradeAnswers);
    resetButton.addEventListener('click', initGame);

    // --- Bắt đầu game lần đầu ---
    initGame();


    // --- Các hàm xử lý sự kiện kéo thả (Copy lại toàn bộ từ code trước) ---
    // Hàm thêm sự kiện cho các ô kéo được
    function addDraggableListeners(element) {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    }

    // Hàm thêm sự kiện cho các vùng thả
    function addDropZoneListeners(element) {
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
    }

    // Xử lý sự kiện Kéo
    function handleDragStart(e) {
        if (gradingDone || e.target.closest('.drop-zone')) {
            e.preventDefault();
            return;
        }
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', e.target.id);
        requestAnimationFrame(() => {
            if (draggedItem) draggedItem.classList.add('dragging');
        });
    }

    function handleDragEnd(e) {
        if (draggedItem) {
             draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
    }

    // Xử lý sự kiện trên Vùng thả
    function handleDragOver(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');
        if (!gradingDone && dropZone && dropZone.dataset.filled === "false") {
            dropZone.classList.add('drag-over');
        } else {
             e.dataTransfer.dropEffect = "none";
        }
    }

    function handleDragLeave(e) {
         const dropZone = e.target.closest('.drop-zone');
         if (dropZone) {
            dropZone.classList.remove('drag-over');
         }
    }

     function handleDrop(e) {
        e.preventDefault();
        const dropZone = e.target.closest('.drop-zone');

        if (!gradingDone && dropZone && dropZone.dataset.filled === "false" && draggedItem) {
            dropZone.classList.remove('drag-over');

            if(dropZone.textContent === '_') dropZone.textContent = '';

            dropZone.appendChild(draggedItem);
            dropZone.dataset.filled = "true";
            draggedItem.setAttribute('draggable', 'false');
            draggedItem.style.cursor = 'default';

            filledCount++;

            if (filledCount === 10) {
                gradeButton.disabled = false;
                updateFeedback("Bạn đã điền đủ 10 ô. Hãy nhấn 'Chấm điểm'!", "info");
            } else {
                 updateFeedback(`Đã điền ${filledCount}/10 ô.`, "info");
            }
        }
        // Reset draggedItem sau khi drop
        if (draggedItem) {
           // draggedItem.classList.remove('dragging'); // Không cần vì handleDragEnd sẽ làm
           draggedItem = null;
        }
    }
}); // Kết thúc DOMContentLoaded
