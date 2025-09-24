// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAyFYlafzJCNvpkzs_aFscFaUjKJ12UDg4",
  authDomain: "mobilecrm-699f6.firebaseapp.com",
  projectId: "mobilecrm-699f6",
  storageBucket: "mobilecrm-699f6.firebasestorage.app",
  messagingSenderId: "12941204782",
  appId: "1:12941204782:web:5709af7d79ea1d72d06ebf",
  measurementId: "G-YY3Z4FXY7S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Connect to emulators in development
if (import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, "http://localhost:9098");
    connectFirestoreEmulator(db, "localhost", 8081);
    connectStorageEmulator(storage, "localhost", 9198);
    console.log("🔥 Connected to Firebase Emulators");
  } catch {
    console.log("Firebase emulators already connected");
  }
}

export { app, analytics, auth, db, storage };
