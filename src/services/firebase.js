// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";


// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDmmH_T3Rn3KlTTACDAj3uZlVfJwslUav4",
    authDomain: "parcial-cliente-web-mobile.firebaseapp.com",
    projectId: "parcial-cliente-web-mobile",
    storageBucket: "parcial-cliente-web-mobile.firebasestorage.app",
    messagingSenderId: "384234701732",
    appId: "1:384234701732:web:ac02f14518c5769a5e7731"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Creamos la variable db, que inicia la conexión con Firestore y exporta la referencia a la base. Esta referencia va a ser necesaria para todas las acciones que yo quiero hacer contra la base de datos
export const db = getFirestore(app);

// Exportamos la referencia al servicio de autenticación de Firebase
export const auth = getAuth(app)

// Exportamos la referencia al servicio de Storage
export const storage = getStorage(app)