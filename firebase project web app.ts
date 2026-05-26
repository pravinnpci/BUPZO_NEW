npm install firebase

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB41CX1C1-g7MQtC8kCuStM8eCHRwBlTxM",
  authDomain: "bupzo-marketplace.firebaseapp.com",
  projectId: "bupzo-marketplace",
  storageBucket: "bupzo-marketplace.firebasestorage.app",
  messagingSenderId: "1020680297701",
  appId: "1:1020680297701:web:67e38cd540af23c545880c",
  measurementId: "G-BTH5SGR846"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);



npm install -g firebase-tools


firebase login

firebase init


"site": "bupzo-marketplace-6d02c",


firebase deploy --only hosting:bupzo-marketplace-6d02c
