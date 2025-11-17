// To get your Firebase config:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project or select existing one
// 3. Go to Project Settings > General
// 4. Scroll down to "Your apps" section
// 5. Click "Web" icon to add a web app
// 6. Copy the firebaseConfig object here
import { initializeApp } from "firebase/app";

export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  appName: 'Oh Crêpe!',
  version: '1.0.0',
  firebase: {
    apiKey: "AIzaSyB7YMT6pVyQQI84UF7Xw1_JcDwsF5bv4fM",
    authDomain: "oh-crepe-89d9b.firebaseapp.com",
    projectId: "oh-crepe-89d9b",
    storageBucket: "oh-crepe-89d9b.firebasestorage.app",
    messagingSenderId: "327943898410",
    appId: "1:327943898410:web:a9ee1286a0eb71474c8a53"
  }
};

// Initialize Firebase
const app = initializeApp(environment.firebase);