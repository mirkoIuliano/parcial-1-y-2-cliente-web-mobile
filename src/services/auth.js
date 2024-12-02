// este archivo se encarga de la autenticación al iniciar sesión

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "./firebase";
import { createUserProfile, getUserProfileByID, updateUserProfile } from "./user-profile";
import { getFileURL, uploadFile } from "./file-storage";

// Creamos una variable donde vamos a tenre los datos del usuario autenticado (si es que existe)
let loggedUser = {
    id: null,
    email: null,
    displayName: null,
    bio: null,
    photoURL: null,
    fullyLoaded: false,
}

// A penas se levanta la página preguntamos si el usuario figura como autenticado, en cuyo caso levantamos los datos
if(localStorage.getItem('user')) // Si en localStorage tenemos el dato 'user'
{
    // vamos a hacer que loggedUser sea igual a un JSON.parse de los datos que están en localStorage, 'user'
    loggedUser = JSON.parse(localStorage.getItem('user'))
}

// Definimos un array de observers
let observers = []


// Nos "suscribimos" a los cambios de la autenticación con onAuthStateChanged()
/* 
Cuando la página carga, onAuthStateChanged() revisa si hay un usuario autenticado y "escucha" cambios en el estado de autenticación
Si el usuario inicia/cierra sesión, esta función:
    - Actualiza los datos locales (loggedUser) con la información del usuario o los reinicia a null
    - Busca información adicional del perfil (como biografía o carrera) en Firestore, si el usuario está autenticado
    - Notifica a los observers
*/
/* 
Dato: onAuthStateChanged() queda "suelto" en la raíz del proyecto y esto hace que cada vez que alguien importe este archivo [auth.js] se ejecuta automáticamente onAuthStateChanged()
    Tan pronto alguien importa este módulo para usar cualquiera de sus funciones, ya le dejamos especificado que vamos a necesitar suscribirnos a la autenticación de Firebase
    Clase 7 (27 de sep), min 36:00 dijo esto 
*/
onAuthStateChanged // onAuthStateChanged() recibe un callback como parámetro, que se ejecuta cada vez que haya un cambio en el estado de autenticación (si se inicia o cierra sesion)
(
    auth, // el primer parámetro es la referencia a Authentication 
    async user => { // el segundo parámetro es el callback que se va a ejecutar cada vez que ocurra un cambio en el estado de autenticación
        /*
        El callback que se le pasa a onAuthStateChanged() se ejecuta cada vez que ocurre un cambio en el estado de autenticación
            - Si un usuario está autenticado, el callback recibe como argumento un objeto {user} con la información del usuario (uid, email, etc.).
            - Si no hay un usuario autenticado, el callback recibe null
        */
        if(user) {
            // si existe user, seteamos los valores de loggedUser con los datos del usuario
            console.log("Confirmando que el usuario está autenticado")

            // Actualizamos los datos locales de loggedUser, notificamos a los observers y guardamos los cambios del user en localStorage con la función updateLoggedUser()
            updateLoggedUser ({ // le pasamos como parámetro un objeto con los datos del usuario autenticado
                id: user.uid, //  En el usuario de Firebase Authentication, el id se llama 'uid' (unique id)
                email: user.email, 
                displayName: user.displayName, 
                photoURL: user.photoURL,
            })

            // Buscamos ahora el resto de datos del perfil. Estos otros datos se encuentran en la collection 'users', en el document respectivo del usuario
            // usamos getUserProfileByID() de [user-profile.js] para obtener estos registros
            getUserProfileByID(user.uid) // le pasamos el id del user, que como se dijo antes, en Firebase Authentication lo encontramos bajo el nombre 'uid'
                .then(userProfile => { // userProfile es el objeto que recibimos como respuesta de la función getUserProfileByID
                    // Actualizamos los datos locales de loggedUser, notificamos a los observers y guardamos los cambios del user en localStorage con la función updateLoggedUser()
                    updateLoggedUser ({ // le pasamos como parámetro un objeto con los datos nuevos del usuario
                        bio: userProfile.bio, // le agregamos la bio
                        fullyLoaded: true, // y le cambiamos el fullyLoaded a true
                    })
                    
                })

        } else {
            // si user no existe, entonces los valores del loggedUser vuelven a ser todos nulos porque significa que no hay un usuario autenticado 
            updateLoggedUser ({
                id: null,
                email: null,
                displayName: null,
                bio: null,
                photoURL: null,
                fullyLoaded: false,
            }
        )
    }
})


// creamos la función para iniciar sesión
export async function login({email, password}) {
    // Tratamos de autenticar usando la función signInWithEmailAndPassword(), que sirve para iniciar sesión con un email y password
    // Recibe 3 parámetros:
    // 1. La instancia de Authentication
    // 2. El email
    // 3. El password
    // Retorna una Promise que se resuelve con UserCredentials, y se rechaza si el login no es exitoso
    try {
        const user = await signInWithEmailAndPassword(auth, email, password) 
        console.log("Sesión iniciada con éxito", user)

    } catch (error) {
        console.error("[auth.js login] Error al tratar de iniciar sesión: ", error)
        throw error
    }
}


// creamos la función para registrarnos (crear cuenta)
export async function register({email, password}) {
    try {
        // Registrarse en la aplicaicón requiere 2 acciones:
        // 1. Crear el usuario en Authentication
        // 2. Crear un documento en Firestore, en la collection 'users', usando el uid del usuario en Authentication

        // Primero nos registramos en Authentication
        const credentials = await createUserWithEmailAndPassword( // createUserWithEmailAndPassword() es como el signInWithEmailAndPassword
            auth, //  le pasamos la referencia al servicio de Authentication
            email, // el email
            password // y el password
        ) // createUserWithEmailAndPassword RETORNA las credenciales del usuario

        // llamamos a la functión "createUserProfile()" de [user-profile.js] para crear el prefil del usuario en Firestore
        await createUserProfile(credentials.user.uid, {email}) // enviamos 2 argumentos: el uid del user y un objeto con el email ingresado
    } catch (error) {
        console.error("[auth.js register] Error al tratar de crear una cuenta: ", error)
        throw error
    }
}


/**
 * Esta es la función para editar mi perfil y poder ponerle un nombre de usuario y biografía
 * 
 * @param {{displayName: string, bio: string}} data
 * @returns {Promise<null>} 
 */
export async function editMyProfile({displayName, bio}) {
    try {
        // Actualizamos el displayName en Authentication
        const promiseAuth = updateProfile( // updateProfile recibe 2 parámetro: 
            auth.currentUser, // 1. El usuario autenticado
            { // 2. Los datos, que solo pueden ser el nombre del usuario y la URL de la foto 
                displayName
            }
        )
        // Info: updateProfile() es una función que permite actualizar los datos de un usuario, pero el profe nos mostró (clase 7, min 55) que solo se pueden actulizar dos datos: la foto de perfil y el nombre de usuario

        // Actualizamos el perfil del usuario en Firestore con la función 'updateUserProfile()' de [user-profile.js]. Acá vamos a actualzar el document del user que está dentro de la collection 'users'
        const promiseProfile = updateUserProfile( // a updateUserProfile() le tenemos que pasar dos parámetros:
            loggedUser.id, // el id del usuario que queremos modificar
            { // un objeto con los datos que queremos editar
                displayName, bio
            }
        ) 

        /* CLASE 8 min 50 saca los 'await' que habían en las funciones updateProfile() y updateUserProfile() porque en realidad no nos importa que hagan estas funciones a la vez y además es mejor por cuestiones de rendimietno que se hagan al unísono
            Lo que pasa es que en MyProfileEdit tenemos una variable 'loading' que nos sirve para indicar cuando se está guardando los datos (sirve más que nada para que se muestre en la interfaz que se están guardando los datos y comunicarselo al usuario)
            Como sacamos estos await, este 'loading' cambia de estado de true a false de manera inmediata porque las funciones se hacen a la vez y no hay nada a lo que esperar.
            Para solucionar esto se guradan updateProfile y updateUserProfile en promiseAuth y promiseProfile, que van a capturar las promesas de las dos funciones (ambas promesas retornan funciones)
        */
        // Esperamos a que ambas promesas se completen, con ayuda de la función Promise.all()
        await Promise.all( // all() es un método de la clase Promise, que permite recibir un array de promesas y retorna una nueva promesa, que se resuelve cuando todas las promesas que le pasamos se resuelven, y que se rechaza cuando alguna de las promesas que le mandamos se no se cumple
            [
                promiseAuth, promiseProfile
            ]
        )
        /*  Clase 8min 56:15
            De esta manera se guardan en paralelo (a la vez se ejecutan las dos funciones) y tenemos el estado de la información de esto que se está procesando
        */


        // Actualizamos los datos locales de loggedUser, notificamos a los observers y guardamos los cambios del user en localStorage con la función updateLoggedUser()
        updateLoggedUser ({ // le pasamos como parámetros un objeto con los datos nuevos del usuario
            displayName,
            bio,
        })


    } catch (error) {
        console.error('[auth.js editMyProfile] Error al tratar de editar el perfil: ', error)
        throw error // creo que ponemos el 'throw error' porque cuando hacemos esto después podemos manejar el error en el componente
    }
}

// esta es la función para cerrar sesión
export async function logout() {
    await signOut(auth)
}

/*--------------------------------------------------------------------------------
| Patrón de Diseño: Observar
+---------------------------------------------------------------------------------
| Un patrón es algo que se repite.
| Un patrón de diseño es una solución común de aplicar a un determinado problema.
| Muchos de estos ya están "identificados" y se les asignaron un nombre.
+---------------------------------------------------------------------------------
| En esta ocsción  vamos a presentar el ptarón 'Observer'.
| Observer sirve para definir una relación de 1 a muchos, entre elementos del 
| sistema. 
| Por un lado, tenemos un elemento llamado el "subject" (sujeto), y por otro lado
| tenemos otros elementos llamados "observers" (obeservadores). Observers serían
| los muchos y el subject el 1.
| La idea es que los observers son elementos que están interesados en ser 
| notificados de cambios o sucesos ocurridos en el subject. Depende de qué sea el
| subject, estos pueden ser acontecimientos en el cilco de vida del sujeto o en
| cambios de sus valores.
|
| La idea de la implementación que vamos a aplicar es que el subject maneje la 
| mayor parte (generalmente en "observer" la mayor parte del trabajo del patrón 
| está resuelta por el sujeto; los observers son los que sacan provecho de esto 
| mayormente).
| El subject va a permitir, a través de una función, que los observers puedan
| "suscribirse" para recibir notificaciones, en nuestro caso, de los cambios en  
| la variable del usuario autenticado.
| Estos observers van a ser guardados en un array.
| Cada vez que se realice algún cambio en los datos de loggedUser, vamos a pedir 
| que se notifique a todos los observers suscritos.
| 
| Nota: Si bien el término más común para agregar un observer es "subscribe",  
| algunas implementaciones lo llaman "attach" o "listen".
| Esto sería un obsrever ===> elementHTML.addEventListener('click', function(){})
| 
| Clase 8 min 15 habla sobre las "memory leaks" y min 20 s/ esto de los observers
| Es crucial que los observers tengan un mecanismo para cancelar su suscripción.
| Si no hacemos esto se va a agregar un nuevo observer arriba del otro y vamos a
| ir acumulando muchísimos hasta poder llegar a colapsar la memoria de la PC.
| 
| 
| 
+--------------------------------------------------------------------------------*/
/*
Este patrón permite que partes de la aplicación "escuchen" cambios en los datos del usuario autenticado (loggedUser).
¿Cómo funciona?
Los "observers" son funciones que se ejecutan automáticamente cuando loggedUser cambia
Cada vez que se actualiza loggedUser, notificas a todos los observers
Ejemplo: Si loggedUser cambia (como al iniciar sesión), se puede actualizar la interfaz automáticamente
*/
// Vamos a crear 3 funciones que vamos a usar para implementar el observer:
/**
 * 
 * @param {Function} callback 
 * @returns {Function} Función para cancelar la suscripción.
 */
export function subscribeToAuthChanges(callback){
    // pusheamos la función callback al array observers
    observers.push(callback)

    // console.log("Observer agregado. El stack actual es: ", observers)

    //Inmediatamente notificamos al callback los datos actuales del usuario autenticado 
    notify(callback)

    // Retornamos una nueva función, que al ejecturase elimine este observer que acaba de agregar
    return () => {
        observers = observers.filter(obs => obs !== callback) /* setea los observers como la lista actual, pero filtrando (osea sacando) todos los que no sean el callback actual */
        // console.log("Observer removido. El stack es: ", observers)
    }  
}

/**
 * Ejecuta el callback pasándole una copia de los datos del usuario autenticado.
 * 
 * @param {Function} callback 
 */
function notify(callback){
    // console.log("Notificando a un observer...")
    callback({...loggedUser}) // Es muy importante que le pasemos una COPIA y no la variable loggedUser en sí, porque si hacemos esto, la estamos pasando por referencia y esto puede abrir problmeas
}

/**
 * Esta función notifica a todos los observers.
 */
function notifyAll(){
    observers // como observers es un array usamos un forEach
    .forEach( // recorro el array con un forEach
        callback => notify(callback) // y a cada uno de los valores (que son todos callback) le pedimos que se los notifique 
    )
}
// notifyAll se tiene que ejecutar cada vez que alguien cambie los valores en loggedUser. Así que dentro de onAuthStateChanged agregamos esta función


/**
 * Actualiza la variable local 'loggedUser' con los datos del usuario autenticado, notifica a los observers y actualiza el usuario en localStorage 
 * 
 * @param {{}} newData 
 */
// creamos una función actualizar los datos locales de loggedUser, notificar a los observers y para actualizar el usuario en localStorage
function updateLoggedUser(newData){
    loggedUser = { // a loggedUser le estamos diciendo que:
        ...loggedUser, // sea igual a lo que ya tenía dentro (...loggedUser)
        ...newData // y que le agregue o modifique según lo nuevo que recibió (argumento newData)
    }
    localStorage.setItem('user', JSON.stringify(loggedUser)) // acá lo guardamos en localStorage
    notifyAll() // acá notificamos a los observers
}


/**
 * @param {File} photo
 */
export async function editMyProfilePhoto(photo){
    try {
        // Generamos la ruta donde queremos guardar el archivo
        // La forma que le vamos a dar es: "users/idDelUsuario/archivo" => osea vamos a crear una carpeta users, dentro de la cual cada usuario va a tener con su id una carpeta y ahí va a guardar el archivo
        const filepath = `users/${loggedUser.id}/avatar.jpg` // TODO: Manejar otras extensiones

        await uploadFile(filepath, photo)

        
        // Guardamos la foto
        // primero traemos la url de la foto
        const photoURL = await getFileURL(filepath)
        const promiseAuth = updateProfile(auth.currentUser, {photoURL})
        const promiseFirestore = updateUserProfile(loggedUser.id, {photoURL})

        await Promise.all([promiseAuth, promiseFirestore])

        updateLoggedUser({photoURL})
    } catch (error) {
        console.error('[auth.js editMyProfilePhoto] Error al tratar de editar la foto de perfil: ', error)
        throw error
    }
}