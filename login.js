
import { auth } from "./app.js";
import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

const loginForm = document.getElementById("login-form");
const loginButton = document.getElementById("login-button");
const loginMessage = document.getElementById("login-message");

loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    loginMessage.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);

loginMessage.textContent = "Login successful! Opening dashboard...";
loginMessage.style.color = "green";

window.location.href = "dashboard.html";

        // We will add the student dashboard next.
    } catch (error) {
        if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password" ||
            error.code === "auth/user-not-found"
        ) {
            loginMessage.textContent = "Incorrect email or password.";
        } else if (error.code === "auth/too-many-requests") {
            loginMessage.textContent =
                "Too many attempts. Please wait and try again.";
        } else if (error.code === "auth/network-request-failed") {
            loginMessage.textContent =
                "Network error. Check your internet connection.";
        } else {
            loginMessage.textContent =
                "Login failed. Please check your details and try again.";
            console.error("Login error:", error);
        }

        loginMessage.style.color = "red";
    } finally {
        loginButton.disabled = false;
        loginButton.textContent = "Log In";
    }
});
