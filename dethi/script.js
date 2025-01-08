const questionTemplates = [
    {
        type: 'dang1',
        generate: () => {
            const k = Math.floor(Math.random() * 10) + 1; // k từ 1 đến 10
            return {
                question: `\\( \\int ${k} dx \\)`,
                correctAnswer: `\\( ${k === 1 ? 'x' : `${k}x`} + C \\)`,
                wrongAnswers: [
                    `\\( \\frac{${k}}{2}x^2 + C \\)`,
                    `\\( ${k}x^2 + C \\)`,
                    `\\( \\frac{${k}}{x} + C \\)`
                ],
                answer: `Lời giải bài toán: Tích phân của hằng số ${k} là ${k}x + C.`
            };
        }
    },
    {
        type: 'dang2',
        generate: () => {
            const n = Math.floor(Math.random() * 4) + 2; // n từ 2 đến 5
            return {
                question: `\\( \\int x^{${n}} dx \\)`,
                correctAnswer: `\\( \\frac{x^{${n + 1}}}{${n + 1}} + C \\)`,
                wrongAnswers: [
                    `\\( x^{${n - 1}} + C \\)`,
                    `\\( \\frac{x^{${n}}}{${n}} + C \\)`,
                    `\\( ${n} x^{${n + 1}} + C \\)`
                ],
                answer: `Lời giải bài toán: Tích phân của x^${n} là \\frac{x^{${n + 1}}}{${n + 1}} + C.`
            };
        }
    }
];

const menu = document.getElementById('menu');
const content = document.getElementById('content');

// Tạo menu các dạng toán
questionTemplates.forEach((template, index) => {
    const button = document.createElement('button');
    button.textContent = `Dạng ${index + 1}`;
    button.addEventListener('click', () => {
        const questionData = template.generate();
        displayQuestion(questionData);
    });
    menu.appendChild(button);
});

// Hiển thị câu hỏi và đáp án
function displayQuestion(data) {
    content.innerHTML = `
        <div class="question">${data.question}</div>
        <div class="answer">${data.answer}</div>
    `;
    MathJax.typeset(); // Render lại công thức toán học
}
