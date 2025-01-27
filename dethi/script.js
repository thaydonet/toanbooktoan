// Dữ liệu câu hỏi
const questionTemplates = [
    { type: 'dang1', generate: () => generateQuestion(1) },
    { type: 'dang2', generate: () => generateQuestion(2) },
    { type: 'dang3', generate: () => generateQuestion(3) },
    { type: 'dang4', generate: () => generateQuestion(4) },
    { type: 'dang5', generate: () => generateQuestion(5) },
    { type: 'dang6', generate: () => generateQuestion(6) },
    { type: 'dang7', generate: () => generateQuestion(7) },
    { type: 'dang8', generate: () => generateQuestion(8) },
];

// Hàm tạo câu hỏi
function generateQuestion(type) {
    switch (type) {
        case 1:
            const k1 = Math.floor(Math.random() * 10) + 1;
            return {
                type: 'dang1',
                question: `Tính tích phân \\( \\int ${k1} dx \\)`,
                correctAnswer: `\\( ${k1 === 1 ? 'x' : `${k1}x`} + C \\)`,
                wrongAnswers: [
                    `\\( \\frac{${k1}}{2}x^2 + C \\)`,
                    `\\( ${k1}x^2 + C \\)`,
                    `\\( \\frac{${k1}}{x} + C \\)`
                ],
                solution: `Lời giải: Tích phân của hằng số ${k1} là ${k1}x + C.`
            };
        // Thêm các trường hợp khác tương tự
        default:
            return {
                type: `dang${type}`,
                question: `Câu hỏi mẫu ${type}`,
                correctAnswer: `Đáp án đúng`,
                wrongAnswers: [`Đáp án sai 1`, `Đáp án sai 2`, `Đáp án sai 3`],
                solution: `Lời giải mẫu.`
            };
    }
}

// Hàm mở/đóng folder
function toggleFolder(element) {
    const parent = element.parentElement;
    parent.classList.toggle('open');
}

// Hàm thêm/xóa dấu check và hiển thị câu hỏi
function toggleQuestionType(button) {
    button.classList.toggle('checked');
    const type = button.getAttribute('data-type');
    const template = questionTemplates.find(t => t.type === type);
    if (template) {
        const questionData = template.generate();
        if (button.classList.contains('checked')) {
            displayQuestion(questionData);
        } else {
            removeQuestion(questionData);
        }
    }
}

// Hiển thị câu hỏi
function displayQuestion(data) {
    const answers = [data.correctAnswer, ...data.wrongAnswers].sort(() => Math.random() - 0.5);
    const answerLabels = ['A', 'B', 'C', 'D'];

    const answersHTML = answers.map((answer, index) => `
        <div>${answerLabels[index]}. ${answer}</div>
    `).join('');

    const questionArea = document.querySelector('.question-area');
    const questionId = `question-${data.type}`;
    const existingQuestion = document.getElementById(questionId);

    if (!existingQuestion) {
        const questionHTML = `
            <div id="${questionId}" class="question-block">
                <div class="question">${data.question}</div>
                <div class="answers">${answersHTML}</div>
                <div class="solution">Lời giải: ${data.solution}</div>
            </div>
        `;
        questionArea.insertAdjacentHTML('beforeend', questionHTML);
        MathJax.typeset();
    }
}

// Xóa câu hỏi
function removeQuestion(data) {
    const questionId = `question-${data.type}`;
    const existingQuestion = document.getElementById(questionId);
    if (existingQuestion) {
        existingQuestion.remove();
    }
}

// Hàm bắt đầu làm bài online
function startOnlineQuiz() {
    const selectedQuestions = getSelectedQuestions();
    if (selectedQuestions.length === 0) {
        alert("Vui lòng chọn ít nhất một câu hỏi!");
        return;
    }
    const quizId = Math.random().toString(36).substring(7); // Tạo ID ngẫu nhiên
    localStorage.setItem('quizQuestions', JSON.stringify(selectedQuestions)); // Lưu câu hỏi vào localStorage
    window.open(`thi-on-line-id.html?id=${quizId}`, '_blank'); // Mở trang mới
}

// Hàm bắt đầu làm bài offline
function startOfflineQuiz() {
    const numberOfDeals = parseInt(document.getElementById('number-of-deals').value);
    if (isNaN(numberOfDeals) || numberOfDeals < 1) {
        alert("Vui lòng nhập số đề hợp lệ!");
        return;
    }

    const selectedQuestions = getSelectedQuestions();
    if (selectedQuestions.length === 0) {
        alert("Vui lòng chọn ít nhất một câu hỏi!");
        return;
    }

    // Tạo đề thi offline
    let quizContent = '';
    for (let i = 1; i <= numberOfDeals; i++) {
        quizContent += `Đề ${i}:\n`;
        const correctAnswers = []; // Lưu đáp án đúng của từng câu hỏi

        selectedQuestions.forEach((question, index) => {
            const answers = [question.correctAnswer, ...question.wrongAnswers].sort(() => Math.random() - 0.5);
            const answerLabels = ['A', 'B', 'C', 'D'];

            // Tìm đáp án đúng
            const correctAnswerLabel = answerLabels[answers.indexOf(question.correctAnswer)];

            // Lưu đáp án đúng
            correctAnswers.push(`${index + 1}.${correctAnswerLabel}`);

            quizContent += `Câu ${index + 1}: ${question.question}\n`;
            answers.forEach((answer, i) => {
                quizContent += `${answerLabels[i]}. ${answer}\n`;
            });
            quizContent += `Lời giải: ${question.solution}\n\n`;
        });

        // Thêm bảng đáp án đúng vào cuối mỗi đề
        quizContent += `Bảng đáp án đúng:\n${correctAnswers.join('\n')}\n\n`;
    }

    // Lưu nội dung đề thi vào localStorage
    localStorage.setItem('offlineQuizContent', quizContent);

    // Chuyển sang trang đề thi offline
    window.location.href = 'de-thi-offline.html';
}
// Hàm lấy danh sách câu hỏi đã chọn
function getSelectedQuestions() {
    const selectedButtons = document.querySelectorAll('.question-type.checked');
    const selectedQuestions = [];
    selectedButtons.forEach(button => {
        const type = button.getAttribute('data-type');
        const template = questionTemplates.find(t => t.type === type);
        if (template) {
            selectedQuestions.push(template.generate());
        }
    });
    return selectedQuestions;
}