import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyDEm6tKFugPclcoaN2Al7dL81kXYypzk0E",
  authDomain: "aipaymentmodel.firebaseapp.com",
  projectId: "aipaymentmodel",
  storageBucket: "aipaymentmodel.firebasestorage.app",
  messagingSenderId: "91496044804",
  appId: "1:91496044804:web:be7074616217e3220dd851",
  measurementId: "G-HFKVT048N8"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { auth };
export default app;