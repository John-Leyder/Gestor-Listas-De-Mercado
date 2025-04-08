import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBrP8pNRpmihGC-1QGC7MOV9Cu3r5LM4NM",
  authDomain: "gestor-listas-de-mercados.firebaseapp.com",
  projectId: "gestor-listas-de-mercados",
  storageBucket: "gestor-listas-de-mercados.firebasestorage.app",
  messagingSenderId: "513998938902",
  appId: "1:513998938902:web:f3199f57c0f8e0123c2637",
  measurementId: "G-94VJZ4EYWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics
export const analytics = getAnalytics(app);

export default app; 