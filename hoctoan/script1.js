document.addEventListener('DOMContentLoaded', () => {
    const functionItemsContainer = document.getElementById('function-items-container');
    const derivativeItemsContainer = document.getElementById('derivative-items-container');
    const feedbackDiv = document.getElementById('feedback');
    const gradeButton = document.getElementById('grade-button');
    const resetButton = document.getElementById('reset-button');

    // --- DỮ LIỆU NGUỒN VỚI CÚ PHÁP LATEX ---
    const allDerivativePairs = [
        // (Dữ liệu các cặp đạo hàm giữ nguyên như cũ)
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

    let currentPairs = [];
    let draggedItem = null;
    let draggedItemOriginZone = null;
    let filledCount = 0; // Vẫn dùng biến này, nhưng giá trị sẽ được tính lại
    let gradingDone = false;

    // --- Hàm khởi tạo trò chơi ---
    function initGame() {
        filledCount = 0; // Reset về 0 ban đầu
        gradingDone = false;
        draggedItem = null;
        draggedItemOriginZone = null;
        functionItemsContainer.innerHTML = '';
        derivativeItemsContainer.innerHTML = '';
        feedbackDiv.className = '';
        derivativeItemsContainer.classList.remove('source-container');

        derivativeItemsContainer.classList.add('source-container');
        addDropZoneListeners(derivativeItemsContainer);

        // (Code chọn cặp, tạo items, tạo derivatives giữ nguyên như trước)
        // 1. Chọn ngẫu nhiên 10 cặp
        const shuffledAll = [...allDerivativePairs].sort(() => Math.random() - 0.5);
        currentPairs = shuffledAll.slice(0, 10);

        // 2. Tạo 10 mục hàm số và vùng thả
        currentPairs.forEach(pair => {
            const funcItem = document.createElement('div');
            funcItem.classList.add('function-item');
            funcItem.dataset.correctDerivative = pair.deriv;

            const funcText = document.createElement('span');
            funcText.classList.add('function-text');
            funcText.innerHTML = pair.func;
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
            derivBox.dataset.derivative = item.deriv;
            derivBox.innerHTML = item.deriv;

            addDraggableListeners(derivBox);

            derivativeItemsContainer.appendChild(derivBox);
        });


        // --- GỌI MATHJAX ---
        requestAnimationFrame(() => {
            if (typeof MathJax !== 'undefined' && MathJax.typesetPromise) {
                console.log("Typesetting MathJax...");
                MathJax.typesetPromise([functionItemsContainer, derivativeItemsContainer])
                    .then(() => {
                        console.log("MathJax Typesetting Done!");
                        updateFilledStatus(); // Gọi hàm cập nhật trạng thái ban đầu
                    })
                    .catch((err) => console.error('MathJax typesetting failed:', err));
            } else {
                console.warn('MathJax not ready for typesetting yet.');
                updateFilledStatus(); // Gọi hàm cập nhật trạng thái ban đầu
            }
        });
    } // --- Hết initGame ---

    // --- Các hàm xử lý sự kiện kéo thả ---
    function addDraggableListeners(element) {
        element.addEventListener('dragstart', handleDragStart);
        element.addEventListener('dragend', handleDragEnd);
    }

    function addDropZoneListeners(element) {
        element.addEventListener('dragover', handleDragOver);
        element.addEventListener('dragleave', handleDragLeave);
        element.addEventListener('drop', handleDrop);
    }

    function handleDragStart(e) {
        if (gradingDone) {
            e.preventDefault();
            return;
        }
        draggedItem = e.target.closest('.derivative-box');
        if (!draggedItem) return;

        e.dataTransfer.setData('text/plain', draggedItem.id);
        e.dataTransfer.effectAllowed = 'move';

        const parentZone = draggedItem.parentElement;
        if (parentZone && parentZone.classList.contains('drop-zone')) {
            draggedItemOriginZone = parentZone;
        } else {
            draggedItemOriginZone = null;
        }
        setTimeout(() => {
            if (draggedItem) draggedItem.classList.add('dragging');
        }, 0);
    }

    function handleDragEnd(e) {
         if (draggedItem) {
            draggedItem.classList.remove('dragging');
        }
        draggedItem = null;
        draggedItemOriginZone = null;
        document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
    }

    function handleDragOver(e) {
        e.preventDefault();
        if (gradingDone || !draggedItem) return;

        const dropTarget = e.target.closest('.drop-zone, .source-container');

        if (dropTarget) {
            let canDrop = false;
            if (dropTarget.classList.contains('drop-zone')) {
                 if (dropTarget !== draggedItemOriginZone) { // Ko cho thả vào chính nó
                    canDrop = true;
                 }
            }
            else if (dropTarget.classList.contains('source-container') && draggedItemOriginZone) {
                canDrop = true; // Cho thả về nguồn nếu kéo từ zone
            }

            if (canDrop) {
                if (!dropTarget.classList.contains('drag-over')) {
                   dropTarget.classList.add('drag-over');
                }
                e.dataTransfer.dropEffect = "move";
            } else {
                 dropTarget.classList.remove('drag-over');
                 e.dataTransfer.dropEffect = "none";
            }
        } else {
             e.dataTransfer.dropEffect = "none";
        }
    }

    function handleDragLeave(e) {
        const relatedTarget = e.relatedTarget;
        const currentTarget = e.currentTarget;
        if (currentTarget.contains(relatedTarget)) {
            return;
        }
         if (currentTarget.classList.contains('drop-zone') || currentTarget.classList.contains('source-container')) {
              currentTarget.classList.remove('drag-over');
         }
    }

    // --- SỬA LỖI ĐẾM TRONG HÀM NÀY ---
    function handleDrop(e) {
        e.preventDefault();
        if (gradingDone || !draggedItem) return;

        const dropTarget = e.target.closest('.drop-zone, .source-container');
        const finalDropTarget = dropTarget || ( (e.target.classList.contains('drop-zone') || e.target.classList.contains('source-container')) ? e.target : null ) ;
        if (!finalDropTarget) return;

        finalDropTarget.classList.remove('drag-over');

        // -- TH1: Thả vào một DROP ZONE cụ thể --
        if (finalDropTarget.classList.contains('drop-zone')) {
            const dropZone = finalDropTarget;
            if (dropZone === draggedItemOriginZone) return; // Thả vào chính nó

            const existingBox = dropZone.querySelector('.derivative-box');

            // Nếu có ô cũ -> trả về nguồn
            if (existingBox) {
                derivativeItemsContainer.appendChild(existingBox);
                addDraggableListeners(existingBox);
            }

            // Thêm ô đang kéo vào
            if (dropZone.textContent === '_') dropZone.textContent = '';
            dropZone.appendChild(draggedItem);
            dropZone.dataset.filled = "true";
            addDraggableListeners(draggedItem); // Đảm bảo kéo tiếp được

            // Reset zone gốc nếu kéo từ zone khác
            if (draggedItemOriginZone) {
                draggedItemOriginZone.textContent = '_';
                draggedItemOriginZone.dataset.filled = "false";
            }

            // !!! KHÔNG CẬP NHẬT filledCount ở đây nữa !!!
            updateFilledStatus(); // Gọi hàm để đếm lại và cập nhật UI

        }
        // -- TH2: Thả vào VÙNG NGUỒN (derivativeItemsContainer) --
        else if (finalDropTarget.classList.contains('source-container')) {
            // Chỉ xử lý nếu kéo từ một drop zone thả về nguồn
            if (draggedItemOriginZone) {
                derivativeItemsContainer.appendChild(draggedItem);
                addDraggableListeners(draggedItem);

                // Reset zone gốc
                draggedItemOriginZone.textContent = '_';
                draggedItemOriginZone.dataset.filled = "false";

                // !!! KHÔNG CẬP NHẬT filledCount ở đây nữa !!!
                updateFilledStatus(); // Gọi hàm để đếm lại và cập nhật UI
            }
        }
         // handleDragEnd sẽ reset draggedItem và origin zone
    }

    // --- SỬA LỖI ĐẾM TRONG HÀM NÀY ---
    function updateFilledStatus() {
        // --- Đếm lại số ô đã điền từ DOM ---
        let currentFilledCount = 0;
        const allDropZones = functionItemsContainer.querySelectorAll('.drop-zone');
        allDropZones.forEach(zone => {
            // Một zone được coi là đã điền nếu có data-filled="true" VÀ chứa một .derivative-box
            if (zone.dataset.filled === "true" && zone.querySelector('.derivative-box')) {
                 currentFilledCount++;
            }
            // Dọn dẹp: Nếu data-filled="true" nhưng không có box -> đặt lại là false
            else if (zone.dataset.filled === "true" && !zone.querySelector('.derivative-box')) {
                 zone.dataset.filled = "false";
                 if (!zone.textContent.includes('_') && zone.innerHTML.trim() === '') {
                    zone.textContent = '_'; // Khôi phục placeholder nếu cần
                 }
            }
        });
        // Cập nhật biến toàn cục (nếu cần dùng ở nơi khác)
        filledCount = currentFilledCount;
        // ------------------------------------

        // Cập nhật trạng thái nút chấm điểm dựa trên số đếm mới
        if (filledCount === 10 && !gradingDone) {
            gradeButton.disabled = false;
            gradeButton.textContent = 'Chấm điểm';
            updateFeedback("Bạn đã điền đủ 10 ô. Hãy nhấn 'Chấm điểm'!", "info");
        } else {
            gradeButton.disabled = true;
            // Chỉ cập nhật số lượng nếu chưa chấm xong
             if (!gradingDone) {
                 gradeButton.textContent = 'Chấm điểm';
                 updateFeedback(`Đã điền ${filledCount}/10 ô.`, "info");
             }
        }
        // Nếu đang chấm điểm hoặc đã chấm xong, không ghi đè feedback kết quả bằng feedback số lượng
    }


    // --- Hàm Chấm điểm (Giữ nguyên logic chấm, chỉ sửa phần vô hiệu hóa) ---
    function gradeAnswers() {
        if (gradingDone || filledCount !== 10) { // Chỉ chấm khi đúng 10 ô và chưa chấm
             console.warn("Grading condition not met:", {gradingDone, filledCount});
             return;
        }

        gradingDone = true;
        gradeButton.disabled = true;
        gradeButton.textContent = 'Đã chấm';
        let score = 0;

        // --- Vô hiệu hóa KÉO THẢ cho TẤT CẢ các ô đạo hàm ---
        document.querySelectorAll('.derivative-box').forEach(box => {
             box.setAttribute('draggable', 'false');
             box.style.cursor = 'default';
             // Style cho ô ở nguồn sẽ được CSS xử lý qua [draggable="false"]
        });
        // -----------------------------------------------------

        const allFunctionItems = functionItemsContainer.querySelectorAll('.function-item');

        allFunctionItems.forEach(item => {
            const dropZone = item.querySelector('.drop-zone');
            const correctDerivativeLatex = item.dataset.correctDerivative;
            const droppedBox = dropZone.querySelector('.derivative-box');

            let isCorrect = false;
            if (droppedBox) {
                const droppedDerivativeLatex = droppedBox.dataset.derivative;
                if (droppedDerivativeLatex === correctDerivativeLatex) {
                    isCorrect = true;
                    score++;
                }
                dropZone.classList.add(isCorrect ? 'correct-final' : 'incorrect-final');
            } else {
                 // Trường hợp không thể xảy ra nếu filledCount === 10, nhưng vẫn phòng ngừa
                 dropZone.classList.add('incorrect-final');
                 dropZone.textContent = 'Lỗi?'; // Hoặc để trống
            }
        });

        // Cập nhật feedback cuối cùng
        updateFeedback(`Kết quả: Đúng ${score}/10 câu!`, score === 10 ? "success" : (score >= 5 ? "info" : "error"));
    }

    // --- Cập nhật khu vực phản hồi ---
    function updateFeedback(message, type) {
        feedbackDiv.textContent = message;
        feedbackDiv.className = ''; // Reset class
        if (type) {
            feedbackDiv.classList.add(type);
        }
    }

    // --- Gắn sự kiện cho các nút ---
    gradeButton.addEventListener('click', gradeAnswers);
    resetButton.addEventListener('click', initGame);

    // --- Bắt đầu game lần đầu ---
    initGame();

}); // Kết thúc DOMContentLoaded
