// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCf0s8e9___EoRa4IQl1oJ3hU2FsY_YXgo",
  authDomain: "inventory-management-cc87b.firebaseapp.com",
  projectId: "inventory-management-cc87b",
  storageBucket: "inventory-management-cc87b.appspot.com",
  messagingSenderId: "746677686195",
  appId: "1:746677686195:web:47cac1ff6183da135485c6",
  measurementId: "G-KXY6EMRC09"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

export {firestore}