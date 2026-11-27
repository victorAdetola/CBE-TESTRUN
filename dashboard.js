
import { auth, db } from "./app.js";

import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
    doc,
    getDoc,
    collection,
    getDocs,
    query,
    where
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const studentName = document.getElementById("student-name");
const logoutButton = document.getElementById("logout-button");
const dashboardMessage = document.getElementById("dashboard-message");
const resultsMessage = document.getElementById("results-message");
const resultsHistory = document.getElementById("results-history");

onAuthStateChanged(auth, async function (user) {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    try {
        const studentDocument = await getDoc(
            doc(db, "students", user.uid)
        );

        if (studentDocument.exists()) {
            const student = studentDocument.data();

            studentName.textContent =
                "Welcome, " + student.firstName + " " +
                student.lastName + "!";
        } else {
            studentName.textContent = "Welcome, Student!";
            dashboardMessage.textContent =
                "Your student profile could not be found.";
        }

        await loadResults(user.uid);

    } catch (error) {
        console.error("Dashboard error:", error);
        studentName.textContent = "Welcome, Student!";
        dashboardMessage.textContent =
            "We could not load your profile. Please try again.";
    }
});

async function loadResults(studentId) {
    resultsHistory.replaceChildren();
    resultsMessage.textContent = "Loading your examination history...";

    try {
        const resultsQuery = query(
            collection(db, "examResults"),
            where("studentId", "==", studentId)
        );

        const resultsSnapshot = await getDocs(resultsQuery);

        if (resultsSnapshot.empty) {
            resultsMessage.textContent =
                "You have no saved examination results yet.";
            return;
        }

        const results = resultsSnapshot.docs.map(function (resultDoc) {
            return resultDoc.data();
        });

        results.sort(function (a, b) {
            const dateA = a.completedAt?.toMillis
                ? a.completedAt.toMillis()
                : 0;

            const dateB = b.completedAt?.toMillis
                ? b.completedAt.toMillis()
                : 0;

            return dateB - dateA;
        });

        resultsMessage.textContent =
            "You have completed " + results.length +
            " examination(s).";

        results.forEach(function (result) {
            const card = document.createElement("article");
            card.className = "result-card";

            const heading = document.createElement("h4");
            heading.textContent = result.subject || "Examination";

            const score = document.createElement("p");
            score.textContent =
                "Score: " + result.score + "/" +
                result.totalQuestions;

            const percentage = document.createElement("p");
            percentage.textContent =
                "Percentage: " + result.percentage + "%";

            const date = document.createElement("p");

            if (result.completedAt?.toDate) {
                date.textContent =
                    "Completed: " +
                    result.completedAt.toDate().toLocaleString();
            } else {
                date.textContent = "Completion date unavailable.";
            }

            card.append(heading, score, percentage, date);
            resultsHistory.appendChild(card);
        });

    } catch (error) {
        console.error("Results loading error:", error);

        resultsMessage.textContent =
            "Could not load your results. Please refresh and try again.";
    }
}

logoutButton.addEventListener("click", async function () {
    logoutButton.disabled = true;

    try {
        await signOut(auth);
        window.location.href = "login.html";
    } catch (error) {
        console.error("Logout error:", error);

        dashboardMessage.textContent =
            "Could not log out. Please try again.";

        logoutButton.disabled = false;
    }
});
