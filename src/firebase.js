import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth"; // ✅ Add this line

const firebaseConfig = {
  apiKey: "AIzaSyCGRrFpJT4ekEWCUGqf_UTHfLh3cq53_nw",
  authDomain: "one-nation-one-card.firebaseapp.com",
  databaseURL: "https://one-nation-one-card-default-rtdb.firebaseio.com",
  projectId: "one-nation-one-card",
  storageBucket: "one-nation-one-card.firebasestorage.app",
  messagingSenderId: "745040048967",
  appId: "1:745040048967:web:1ae895ca2d7e48863c5262",
  measurementId: "G-44B4JCPXQ8"
};

const app = initializeApp(firebaseConfig);
const realtimeDB = getDatabase(app);
const firestoreDB = getFirestore(app);
const auth = getAuth(app); // ✅ Initialize auth

export { app, realtimeDB, firestoreDB, auth }; // ✅ Export auth
