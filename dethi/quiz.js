// Lấy dữ liệu câu hỏi từ localStorage
const quizQuestions = JSON.parse(localStorage.getItem('quizQuestions'));

// Hiển thị bài thi
function displayQuiz() {
    const quizArea = document.getElementById('quiz-area');
    if (!quizQuestions || quizQuestions.length === 0) {
        quizArea.innerHTML = "<p>Không có câu hỏi nào được chọn!</p>";
        return;
    }

    let quizHTML = '';
    quizQuestions.forEach((question, index) => {
        const answers = [question.correctAnswer, ...question.wrongAnswers].sort(() => Math.random() - 0.5);
        const answerLabels = ['A', 'B', 'C', 'D'];

        const answersHTML = answers.map((answer, i) => `
            <div class="answer">
                <input type="radio" name="question-${index}" value="${answer}" id="q${index}-a${i}">
                <label for="q${index}-a${i}">${answerLabels[i]}. ${answer}</label>
            </div>
        `).join('');

        quizHTML += `
            <div class="question-block">
                <div class="question">Câu ${index + 1}: ${question.question}</div>
                <div class="answers">${answersHTML}</div>
            </div>
        `;
    });

    quizArea.innerHTML = quizHTML;
    MathJax.typeset(); // Render lại công thức toán học
}

// Hàm nộp bài và chấm điểm
function submitQuiz() {
    const resultArea = document.getElementById('result-area');
    let score = 0;
    let resultHTML = '<h2>Kết quả:</h2>';

    quizQuestions.forEach((question, index) => {
        const selectedAnswer = document.querySelector(`input[name="question-${index}"]:checked`);
        if (selectedAnswer) {
            const isCorrect = selectedAnswer.value === question.correctAnswer;
            if (isCorrect) {
                score++;
            }
            resultHTML += `
                <div class="result-block ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="question">Câu ${index + 1}: ${question.question}</div>
                    <div class="answer">Đáp án của bạn: ${selectedAnswer.value}</div>
                    <div class="correct-answer">Đáp án đúng: ${question.correctAnswer}</div>
                    <div class="solution">Lời giải: ${question.solution}</div>
                </div>
            `;
        } else {
            resultHTML += `
                <div class="result-block unanswered">
                    <div class="question">Câu ${index + 1}: ${question.question}</div>
                    <div class="answer">Bạn chưa chọn đáp án!</div>
                    <div class="correct-answer">Đáp án đúng: ${question.correctAnswer}</div>
                    <div class="solution">Lời giải: ${question.solution}</div>
                </div>
            `;
        }
    });

    resultHTML += `<div class="score">Điểm của bạn: ${score}/${quizQuestions.length}</div>`;
    resultArea.innerHTML = resultHTML;
    MathJax.typeset(); // Render lại công thức toán học
}

// Hiển thị bài thi khi trang được tải
displayQuiz();