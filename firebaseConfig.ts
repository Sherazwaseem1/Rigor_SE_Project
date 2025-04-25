import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
apiKey: "AIzaSyCaTk9rfVPXN1fEeoCOLdLm-I2GvLX-G3E",
authDomain: "rigor-22d83.firebaseapp.com",
projectId: "rigor-22d83",
storageBucket: "rigor-22d83.firebasestorage.app",
messagingSenderId: "605856640532",
appId: "1:605856640532:web:b96d241dfdea7b2f5ec101"
};

export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);