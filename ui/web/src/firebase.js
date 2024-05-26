// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD-wAAXY0ORO3e0Kfu1xH4Sw20YmsEVNY8",
  authDomain: "coptal.firebaseapp.com",
  projectId: "coptal",
  storageBucket: "coptal.appspot.com",
  messagingSenderId: "110791226203",
  appId: "1:110791226203:web:a73e531d98a021b7ba607e",
  measurementId: "G-9B54VC1C5G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);