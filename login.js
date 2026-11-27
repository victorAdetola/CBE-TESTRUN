
import { auth } from "./app.js";
import {
    signInWithEmailAndPassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

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
// FORGOT PASSWORD FUNCTIONALITY

const forgotPassword = document.getElementById("forgot-password");

forgotPassword.addEventListener("click", async function (event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();

    if (!email) {
        loginMessage.textContent =
            "Please enter your registered email address first.";
        loginMessage.style.color = "red";
        return;
    }

    forgotPassword.textContent = "Sending reset email...";

    try {
        await sendPasswordResetEmail(auth, email);

        loginMessage.textContent =
            "If an account exists with this email, a password reset link will be sent. Check your inbox.";
        loginMessage.style.color = "green";

    } catch (error) {
        console.error("Password recovery error:", error);

        if (error.code === "auth/invalid-email") {
            loginMessage.textContent =
                "Please enter a valid email address.";
        } else if (error.code === "auth/too-many-requests") {
            loginMessage.textContent =
                "Too many requests. Please try again later.";
        } else if (error.code === "auth/network-request-failed") {
            loginMessage.textContent =
                "Network error. Check your internet connection.";
        } else {
            loginMessage.textContent =
                "Unable to process your request. Please try again.";
        }

        loginMessage.style.color = "red";

    } finally {
        forgotPassword.textContent = "Forgot Password?";
    }
});