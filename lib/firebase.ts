import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBGyx42EeYQNH4E_tvJ8A1puUwXOEJQdB0",
  authDomain: "templates-bf342.firebaseapp.com",
  projectId: "templates-bf342",
  storageBucket: "templates-bf342.firebasestorage.app",
  messagingSenderId: "376120510239",
  appId: "1:376120510239:web:b1ef1b99413f8944b7d22a",
  measurementId: "G-FE42K8BPCR"
};

const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, db, auth, storage };

