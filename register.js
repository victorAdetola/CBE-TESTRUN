
import { auth, db } from "./app.js";

import {
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

const registrationForm = document.getElementById("registration-form");
const registerButton = document.getElementById("register-button");
const formMessage = document.getElementById("form-message");

registrationForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    formMessage.textContent = "";

    if (password !== confirmPassword) {
        formMessage.textContent = "Your passwords do not match.";
        formMessage.style.color = "red";
        return;
    }

    registerButton.disabled = true;
    registerButton.textContent = "Creating account...";

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        await setDoc(doc(db, "students", user.uid), {
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            email: user.email,
            phone: phone,
            role: "student",
            createdAt: serverTimestamp()
        });

        formMessage.textContent =
            "Account created successfully! You can now log in.";
        formMessage.style.color = "green";

        registrationForm.reset();

    } catch (error) {
        console.error("Registration error:", error);

        if (error.code === "auth/email-already-in-use") {
            formMessage.textContent =
                "This email is already registered. Please log in.";
        } else if (error.code === "auth/weak-password") {
            formMessage.textContent =
                "Your password is too weak. Please choose a stronger password.";
        } else if (error.code === "auth/invalid-email") {
            formMessage.textContent =
                "Please enter a valid email address.";
        } else if (error.code === "permission-denied") {
            formMessage.textContent =
                "Your account was created, but your profile could not be saved. Please contact the administrator.";
        } else {
            formMessage.textContent =
                "Registration failed. Check your connection and try again.";
        }

        formMessage.style.color = "red";

    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Create Account";
    }
});
