// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// TODO: Add your Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUWdtnXl9bXtKJ072vPGRJL7ULdI1G3p4",
  authDomain: "prescription-generator-7c040.firebaseapp.com",
  projectId: "prescription-generator-7c040",
  storageBucket: "prescription-generator-7c040.firebasestorage.app",
  messagingSenderId: "837439043878",
  appId: "1:837439043878:web:f47b32c5ee31f5f301a9e7",
  measurementId: "G-8KE7TGG7SN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
