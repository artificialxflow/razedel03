import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDPjIl2HJbr0JVVpL1C84XlvSewa5ZJoMI",
  authDomain: "razedel-5cbe6.firebaseapp.com",
  projectId: "razedel-5cbe6",
  storageBucket: "razedel-5cbe6.appspot.com",
  messagingSenderId: "469417441372",
  appId: "1:469417441372:web:c68c75965b165b9b61ce99"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db }; 