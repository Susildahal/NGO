
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBbxu-wQ_MuvrQs9lstaiYDyR8GGrb_lIA",
  authDomain: "deep-d47d1.firebaseapp.com",
  projectId: "deep-d47d1",
  storageBucket: "deep-d47d1.firebasestorage.app",
  messagingSenderId: "688797376743",
  appId: "1:688797376743:web:66bf006644a6e121fcc242",
  measurementId: "G-Q3299HG5ER"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
export default app;
