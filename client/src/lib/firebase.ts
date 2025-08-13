import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDZXaf9PO6E69KNiv-yjtwFxGe8c6jyz3c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "video-call-system-140da.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "video-call-system-140da",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "video-call-system-140da.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "818151254357",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:818151254357:web:00c81df2d11a9118ffe7dc"
};

const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
