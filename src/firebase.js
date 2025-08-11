// src/firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyANUcAPUo3qM8bVcq5OhMrQXfBiTzQfu9w",
    authDomain: "time-logger-f3c05.firebaseapp.com",
    projectId: "time-logger-f3c05",
    storageBucket: "time-logger-f3c05.firebasestorage.app",
    messagingSenderId: "1098783480541",
    appId: "1:1098783480541:web:e86c94ae01f4eadf021934",
    measurementId: "G-ZN8Z73PJCJ"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
