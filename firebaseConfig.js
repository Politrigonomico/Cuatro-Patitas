import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyD6jiz6pJg-Dc-94hAJR5XdlcCVCgqscJU",
  authDomain: "cuatro-patitas-fd509.firebaseapp.com",
  projectId: "cuatro-patitas-fd509",
  storageBucket: "cuatro-patitas-fd509.firebasestorage.app",
  messagingSenderId: "897321943435",
  appId: "1:897321943435:web:dcac9e30d15bf282d9ef8e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;