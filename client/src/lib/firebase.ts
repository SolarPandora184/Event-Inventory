import { initializeApp, getApps } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyA5cFQXNly1uVkZrJNfP7cKNiHdBd8dxHw",
  authDomain: "leaderboard-62d73.firebaseapp.com",
  databaseURL: "https://leaderboard-62d73-default-rtdb.firebaseio.com",
  projectId: "leaderboard-62d73",
  storageBucket: "leaderboard-62d73.firebasestorage.app",
  messagingSenderId: "612954698449",
  appId: "1:612954698449:web:bdbc99d3b353d297b7cbf0",
  measurementId: "G-LEESBNKQQM"
};

// Initialize Firebase (avoid duplicate app error during hot reload)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const database = getDatabase(app);
