// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyBbwDqUH9DjK_L3DzPWKXmxjL0XhAjfNIM",
  authDomain: "heallink-project.firebaseapp.com",
  projectId: "heallink-project",
  storageBucket: "heallink-project.firebasestorage.app",
  messagingSenderId: "502925339862",
  appId: "1:502925339862:web:3bca90c9a279a538522d77",
  measurementId: "G-38CEH2T715"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Configure Google Sign-In
/*GoogleSignin.configure({
  webClientId: '502925339862-il5cpvuqqojhnepcukjq180um33cvogs.apps.googleusercontent.com', // From Firebase Console Settings
});*/
