
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js";

// Keep your actual Firebase configuration here

  // Import the functions you need from the SDKs you need


  const firebaseConfig = {


    apiKey: "AIzaSyCmTkMuHmH30BzV0GfQj39C8ctn7xNkb5I",


    authDomain: "cbe-examination-system.firebaseapp.com",


    projectId: "cbe-examination-system",


    storageBucket: "cbe-examination-system.firebasestorage.app",


    messagingSenderId: "1019355214061",


    appId: "1:1019355214061:web:570a840ac2009b19f91ce4",


    measurementId: "G-KE9H6QNG40"
};

// Connect your website to Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Make Firebase available to other JavaScript files
export { app, auth, db };
