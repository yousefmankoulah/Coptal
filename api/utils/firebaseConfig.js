import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";

// import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const firebaseConfig = {
  // credential: admin.credential.cert(serviceAccount),
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "coptal.firebaseapp.com",
  projectId: "coptal",
  storageBucket: "coptal.appspot.com",
  messagingSenderId: "110791226203",
  appId: "1:110791226203:web:a73e531d98a021b7ba607e",
  measurementId: "G-9B54VC1C5G",
};

// Initialize Firebase
// const bucket = admin.storage().bucket();

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Function to delete a file from the storage bucket
const deleteFileFromStorage = async (filePath) => {
  try {
    const storageRef = ref(storage, filePath);
    await deleteObject(storageRef);
  } catch (error) {
    console.error("Error deleting file:", error);
  }
};

export { app, deleteFileFromStorage };
