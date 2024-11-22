// Este es el archivo de inicialización de Firebase y contiene las instrucciones de inicialización y clqra de los servicios de firebase que voy a querer utilizar. Acá vamos a venir par agregar Firestore, Authentication y Storage

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

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
/* CHATGPT 
    1. initializeApp(firebaseConfig)
        - La función initializeApp es parte del SDK de Firebase y se utiliza para configurar e inicializar una aplicación de Firebase en tu proyecto.
        - Recibe como argumento un objeto de configuración (firebaseConfig), que contiene todos los detalles necesarios para conectar tu proyecto local con tu proyecto en la consola de Firebase.
    El objeto firebaseConfig incluye información como:
        - apiKey: La clave de acceso para conectar con los servicios de Firebase.
        - authDomain: El dominio autorizado para gestionar la autenticación.
        - projectId: El identificador único de tu proyecto en Firebase.
        - storageBucket: El almacenamiento donde puedes guardar archivos (como imágenes o documentos).
        - messagingSenderId: El ID del servicio de mensajería de Firebase Cloud Messaging (para notificaciones push).
        - appId: Un identificador único de la aplicación Firebase.
    Esto establece una conexión entre tu aplicación local y los servicios de Firebase que vas a usar.

    2. const app
        - La constante app almacena la instancia de la aplicación Firebase que se creó al ejecutar initializeApp(firebaseConfig).
        - Esta instancia es esencial para que los demás servicios de Firebase (como Firestore, Authentication o Storage) sepan que están operando en el contexto de tu aplicación específica.

    3. Propósito
    Este paso es necesario para inicializar cualquier servicio de Firebase. Por ejemplo:
        - Para usar Firestore, necesitas pasar app a getFirestore(app).
        - Para usar Authentication, necesitas pasar app a getAuth(app).

    Resumen del flujo:
        1. Configuras el proyecto con firebaseConfig.
        2. Inicializas la aplicación con initializeApp(firebaseConfig).
        3. Guardas la instancia en app, que será usada para conectar y operar los servicios de Firebase en tu aplicación.

    Ejemplos de uso:
        const db = getFirestore(app); // Conectar a Firestore
        const auth = getAuth(app); // Conectar a Authentication
*/



// creamos la variable db, que inicia la conexión con Firestore y exporta la referencia a la base. Esta referencia va a ser necesaria para todas las acciones que yo quiero hacer contra la base de datos
export const db = getFirestore(app);


export const auth = getAuth(app)
/* CHATGPT 
    1. getAuth(app)
        - La función getAuth pertenece al SDK de Firebase Authentication.
        - Toma como argumento la instancia de la aplicación Firebase inicializada (app), que se creó previamente con initializeApp(firebaseConfig).
        - Esto establece el servicio de autenticación para tu aplicación.
        - Devuelve un objeto que representa la referencia al servicio de autenticación de Firebase, que puedes usar para realizar acciones relacionadas con la autenticación, como iniciar sesión, registrar usuarios, cerrar sesión, etc. 
        
    2. export const auth
        - Al declarar export, haces que esta constante (auth) esté disponible para ser importada desde otros módulos o archivos en tu proyecto.
        - Esto permite que cualquier parte de tu aplicación pueda acceder al servicio de autenticación de Firebase utilizando la referencia auth.

    Resumen:
        - getAuth(app): Inicializa el servicio de autenticación para tu app de Firebase.
        - auth: Es la referencia al servicio de autenticación, exportada para que pueda usarse en cualquier lugar del proyecto.
*/