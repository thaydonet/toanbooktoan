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
                question: `Câu 1: Tính tích phân \\( \\int ${k1} dx \\)`,
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
                question: `Câu ${type}: Câu hỏi mẫu`,
                correctAnswer: `Đáp án đúng`,
                wrongAnswers: [`Đáp án sai 1`, `Đáp án sai 2`, `Đáp án sai 3`],
                solution: `Lời giải mẫu.`
            };
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
                <div class="solution">
                    <h3>Lời giải:</h3>
                    <div>${data.solution}</div>
                </div>
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
