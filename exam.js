
import { questions } from "./question.js";
import { auth, db } from "./app.js";

import {
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const subjectSelect = document.getElementById("subject-select");
const startButton = document.getElementById("start-exam-button");
const examMessage = document.getElementById("exam-message");
const subjectPanel = document.querySelector(".subject-panel");

// Examination variables
let examQuestions = [];
let currentQuestion = 0;
let studentAnswers = [];
let submitted = false;
let resultsAlreadyDisplayed = false;
let calculatorDisplay = "0";

// Timer: 15 minutes
const EXAM_DURATION = 15 * 60;
let timeRemaining = EXAM_DURATION;
let timerInterval = null;


// START EXAMINATION
startButton.addEventListener("click", function () {
    const selectedSubject = subjectSelect.value;

    if (!selectedSubject) {
        examMessage.textContent = "Please select a subject first.";
        return;
    }

    examQuestions = questions.filter(function (item) {
        return item.subject === selectedSubject;
    });

    if (examQuestions.length === 0) {
        examMessage.textContent = "No questions found for this subject.";
        return;
    }

    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    currentQuestion = 0;
    studentAnswers = new Array(examQuestions.length).fill(null);
    submitted = false;
    resultsAlreadyDisplayed = false;
    calculatorDisplay = "0";
    timeRemaining = EXAM_DURATION;

    examMessage.textContent = "";

    showQuestion();
    startTimer();
});


// FORMAT TIME
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return String(minutes).padStart(2, "0") + ":" +
        String(remainingSeconds).padStart(2, "0");
}


// START COUNTDOWN
function startTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(function () {
        if (submitted) {
            clearInterval(timerInterval);
            timerInterval = null;
            return;
        }

        timeRemaining--;

        const timerDisplay = document.getElementById("exam-timer");

        if (timerDisplay) {
            timerDisplay.textContent =
                "Time remaining: " + formatTime(timeRemaining);

            if (timeRemaining <= 60) {
                timerDisplay.style.background = "#fee2e2";
                timerDisplay.style.color = "#b91c1c";
            }
        }

        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            timerInterval = null;

            submitted = true;

            alert("Time is up! Your examination will be submitted.");
            showResults();
        }
    }, 1000);
}


// DISPLAY QUESTION
function showQuestion() {
    if (submitted || examQuestions.length === 0) return;

    const question = examQuestions[currentQuestion];

    const isMathOrPhysics =
        question.subject === "Mathematics" ||
        question.subject === "Physics";

    const timerBackground =
        timeRemaining <= 60 ? "#fee2e2" : "#e0e8ff";

    const timerColor =
        timeRemaining <= 60 ? "#b91c1c" : "#2456c4";

    subjectPanel.innerHTML = `
        <p style="color:#2456c4;font-weight:bold">
            ${escapeHTML(question.subject)} Examination
        </p>

        <div id="exam-timer"
            style="display:inline-block;margin:10px 0 15px;padding:12px 18px;
            background:${timerBackground};color:${timerColor};
            border-radius:10px;font-weight:bold;font-size:20px;">
            Time remaining: ${formatTime(timeRemaining)}
        </div>

        <div style="background:#e6ebf5;height:7px;border-radius:8px;
                    overflow:hidden;margin:15px 0 25px">
            <div style="height:100%;background:#2456c4;
                width:${((currentQuestion + 1) / examQuestions.length) * 100}%">
            </div>
        </div>

        <div class="exam-workspace">
            <section class="question-area">
                <p style="color:#69758b">
                    Question ${currentQuestion + 1} of ${examQuestions.length}
                </p>

                <h2 style="line-height:1.6">
                    ${escapeHTML(question.question)}
                </h2>

                <div style="display:grid;gap:12px;margin:25px 0">
                    ${question.options.map(function (option, index) {
                        const selected =
                            studentAnswers[currentQuestion] === option;

                        return `
                            <button type="button"
                                data-option-index="${index}"
                                class="answer-option"
                                style="
                                    padding:15px;
                                    border:2px solid ${selected ? "#2456c4" : "#e0e6f0"};
                                    border-radius:12px;
                                    background:${selected ? "#e0e8ff" : "white"};
                                    color:#17233f;
                                    text-align:left;
                                    cursor:pointer;">
                                ${String.fromCharCode(65 + index)}.
                                ${escapeHTML(option)}
                                ${selected ? " ✓" : ""}
                            </button>
                        `;
                    }).join("")}
                </div>

                <p style="color:#69758b">
                    Answered:
                    ${studentAnswers.filter(a => a !== null).length}
                    / ${examQuestions.length}
                </p>

                <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:20px">
                    <button type="button" id="previous-question"
                        ${currentQuestion === 0 ? "disabled" : ""}>
                        ← Previous
                    </button>

                    <button type="button" id="next-question">
                        ${currentQuestion === examQuestions.length - 1
                            ? "Review & Submit"
                            : "Next Question →"}
                    </button>
                </div>

                ${isMathOrPhysics ? renderCalculator() : ""}
            </section>

            <aside class="question-sidebar">
                <h3>Question Navigator</h3>

                <p style="font-size:13px;color:#69758b">
                    Select any number to jump to that question.
                </p>

                <div class="question-number-grid">
                    ${examQuestions.map(function (_, index) {
                        const answered = studentAnswers[index] !== null;
                        const current = index === currentQuestion;

                        return `
                            <button type="button"
                                class="question-number"
                                data-question-index="${index}"
                                aria-label="Go to question ${index + 1}"
                                aria-current="${current ? "step" : "false"}"
                                style="
                                    background:${current ? "#2456c4" : answered ? "#334155" : "#f1f4f9"};
                                    color:${current || answered ? "white" : "#25324a"};
                                    border:2px solid ${current ? "#8aa8ff" : "transparent"};
                                    font-weight:${answered || current ? "bold" : "normal"};">
                                ${index + 1}
                            </button>
                        `;
                    }).join("")}
                </div>

                <p style="font-size:12px;line-height:1.8;color:#69758b">
                    <span style="color:#334155">■</span> Answered
                    <br>
                    <span style="color:#2456c4">■</span> Current question
                    <br>
                    <span style="color:#9aa5b5">■</span> Not answered
                </p>
            </aside>
        </div>
    `;

    // Select an answer
    document.querySelectorAll("[data-option-index]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (submitted) return;

            const index = Number(button.dataset.optionIndex);
            studentAnswers[currentQuestion] = question.options[index];

            showQuestion();
        });
    });

    // Navigate directly to a question
    document.querySelectorAll("[data-question-index]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (submitted) return;

            currentQuestion = Number(button.dataset.questionIndex);
            showQuestion();
        });
    });

    // Previous question
    document.getElementById("previous-question").addEventListener("click", function () {
        if (!submitted && currentQuestion > 0) {
            currentQuestion--;
            showQuestion();
        }
    });

    // Next question or review
    document.getElementById("next-question").addEventListener("click", function () {
        if (submitted) return;

        if (currentQuestion < examQuestions.length - 1) {
            currentQuestion++;
            showQuestion();
        } else {
            reviewAnswers();
        }
    });

    if (isMathOrPhysics) {
        connectCalculator();
    }
}


// CALCULATOR DISPLAY
function renderCalculator() {
    return `
        <div class="exam-calculator">
            <h3>Simple Calculator</h3>

            <input id="calculator-display"
                type="text"
                value="${escapeHTML(calculatorDisplay)}"
                readonly
                aria-label="Calculator display">

            <div class="calculator-keys">
                ${["7", "8", "9", "÷",
                   "4", "5", "6", "×",
                   "1", "2", "3", "-",
                   "C", "0", ".", "+", "="].map(function (key) {
                    return `
                        <button type="button" data-calc-key="${key}">
                            ${key}
                        </button>
                    `;
                }).join("")}
            </div>
        </div>
    `;
}


// CONNECT CALCULATOR
function connectCalculator() {
    document.querySelectorAll("[data-calc-key]").forEach(function (button) {
        button.addEventListener("click", function () {
            if (submitted) return;

            const key = button.dataset.calcKey;

            if (key === "C") {
                calculatorDisplay = "0";
            } else if (key === "=") {
                calculatorDisplay = calculateExpression(calculatorDisplay);
            } else if (calculatorDisplay === "Error") {
                calculatorDisplay = "0";
            } else if (
                calculatorDisplay === "0" &&
                !["+", "-", "×", "÷", "."].includes(key)
            ) {
                calculatorDisplay = key;
            } else {
                calculatorDisplay += key;
            }

            const display = document.getElementById("calculator-display");

            if (display) {
                display.value = calculatorDisplay;
            }
        });
    });
}


// CALCULATE WITHOUT EVAL()
function calculateExpression(expression) {
    const match = expression.match(
        /^\s*(-?\d+(?:\.\d+)?)\s*([+\-×÷])\s*(-?\d+(?:\.\d+)?)\s*$/
    );

    if (!match) return "Error";

    const first = Number(match[1]);
    const operator = match[2];
    const second = Number(match[3]);

    let result;

    if (operator === "+") result = first + second;
    else if (operator === "-") result = first - second;
    else if (operator === "×") result = first * second;
    else if (operator === "÷") {
        if (second === 0) return "Error";
        result = first / second;
    }

    return Number.isFinite(result)
        ? String(Number(result.toPrecision(10)))
        : "Error";
}


// REVIEW ANSWERS
function reviewAnswers() {
    if (submitted) return;

    const unanswered = studentAnswers.filter(a => a === null).length;

    subjectPanel.innerHTML = `
        <h2>Review Your Examination</h2>

        <div id="exam-timer"
            style="display:inline-block;margin:10px 0 15px;padding:12px 18px;
            background:${timeRemaining <= 60 ? "#fee2e2" : "#e0e8ff"};
            color:${timeRemaining <= 60 ? "#b91c1c" : "#2456c4"};
            border-radius:10px;font-weight:bold;font-size:20px;">
            Time remaining: ${formatTime(timeRemaining)}
        </div>

        <p>You answered ${examQuestions.length - unanswered}
            out of ${examQuestions.length} questions.</p>

        <p>${unanswered} question(s) remain unanswered.</p>

        <button type="button" id="back-to-questions">
            Return to Questions
        </button>

        <button type="button" id="submit-exam">
            Submit Examination
        </button>
    `;

    document.getElementById("back-to-questions").addEventListener("click", function () {
        if (submitted) return;

        currentQuestion = 0;
        showQuestion();
    });

    document.getElementById("submit-exam").addEventListener("click", function () {
        if (submitted) return;

        if (window.confirm("Are you sure you want to submit your examination?")) {
            submitted = true;
            showResults();
        }
    });
}


// CALCULATE SCORE AND SAVE RESULT
async function showResults() {
    if (resultsAlreadyDisplayed || examQuestions.length === 0) return;

    resultsAlreadyDisplayed = true;
    submitted = true;

    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }

    let score = 0;

    examQuestions.forEach(function (question, index) {
        if (studentAnswers[index] === question.correctAnswer) {
            score++;
        }
    });

    const totalQuestions = examQuestions.length;
    const percentage = Math.round((score / totalQuestions) * 100);
    const subject = examQuestions[0].subject;

    subjectPanel.innerHTML = `
        <div style="text-align:center;padding:25px 0">
            <h2>Examination Completed!</h2>

            <p id="save-result-message" style="color:#64748b">
                Saving your result...
            </p>

            <p style="font-size:50px;font-weight:bold;color:#2456c4">
                ${score}/${totalQuestions}
            </p>

            <p style="font-size:22px">Your score: ${percentage}%</p>
            <p>Subject: ${escapeHTML(subject)}</p>
            <p>Correct answers: ${score}</p>
            <p>Incorrect or unanswered: ${totalQuestions - score}</p>

            <a href="exam.html"
                style="display:inline-block;margin-top:20px;padding:14px 22px;
                background:#2456c4;color:white;border-radius:10px;
                text-decoration:none;font-weight:bold;">
                Choose Another Subject
            </a>

            <br>

            <a href="dashboard.html"
                style="display:inline-block;margin-top:16px;color:#2456c4;">
                Return to Dashboard
            </a>
        </div>
    `;

    const saveMessage = document.getElementById("save-result-message");

    try {
        const user = auth.currentUser;

        if (!user) {
            throw new Error("No signed-in student was found.");
        }

        await addDoc(collection(db, "examResults"), {
            studentId: user.uid,
            subject: subject,
            score: score,
            totalQuestions: totalQuestions,
            percentage: percentage,
            completedAt: serverTimestamp()
        });

        saveMessage.textContent = "Your result has been saved successfully.";
        saveMessage.style.color = "#15803d";

    } catch (error) {
        console.error("Error saving examination result:", error);

        saveMessage.textContent =
            "Your score is shown, but we could not save it. Please contact your administrator.";

        saveMessage.style.color = "#b91c1c";
    }
}


// ESCAPE HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, function (character) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];
    });
}
