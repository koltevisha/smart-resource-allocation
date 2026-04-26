// src/firebase.js - Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCgFLumtHuRFJk2-RXlS-TYggTLGutfvuQ",
  authDomain: "impact-connect-pro.firebaseapp.com",
  projectId: "impact-connect-pro",
  storageBucket: "impact-connect-pro.firebasestorage.app",
  messagingSenderId: "200367247537",
  appId: "1:200367247537:web:46b5ca32f3a07f4c3d1290",
  measurementId: "G-CP8PHC8YTP"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export default app;
