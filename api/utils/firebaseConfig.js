import admin from "firebase-admin";
import { initializeApp } from "firebase/app";
import { getStorage, ref, deleteObject } from "firebase/storage";

import serviceAccount from "./serviceAccountKey.json" assert { type: "json" };

const firebaseConfig = {
  credential: admin.credential.cert(serviceAccount),
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "onlinecoaching-a87c5.firebaseapp.com",
  projectId: "onlinecoaching-a87c5",
  storageBucket: "onlinecoaching-a87c5.appspot.com",
  messagingSenderId: "855843127316",
  appId: "1:855843127316:web:70571f4f0ed562ce37a701",
  measurementId: "G-EN8D3PYZNZ",
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