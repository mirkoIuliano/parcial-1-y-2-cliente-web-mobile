// Este archivo se encarga de la autenticación al iniciar sesión

import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth"
import { auth } from "./firebase"
import { createUserProfile, getUserProfileByID, updateUserProfile } from "./user-profile"
import { getFileURL, uploadFile } from "./file-storage"

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
if(localStorage.getItem('user')) // si en localStorage tenemos el dato 'user' hacemos lo siguiente:
{
    // Vamos a hacer que loggedUser sea igual a un JSON.parse de los datos que están en localStorage, 'user'
    loggedUser = JSON.parse(localStorage.getItem('user'))
}

// Definimos un array de observers
let observers = []

// Nos "suscribimos" a los cambios de la autenticación con onAuthStateChanged()
onAuthStateChanged // onAuthStateChanged() recibe un callback como parámetro, que se ejecuta cada vez que haya un cambio en el estado de autenticación (si se inicia o cierra sesion)
(
    auth, // el primer parámetro es la referencia a Authentication 
    async user => { // el segundo parámetro es el callback que se va a ejecutar cada vez que ocurra un cambio en el estado de autenticación
        /*
        El callback que se le pasa a onAuthStateChanged() se ejecuta cada vez que ocurre un cambio en el estado de autenticación
            - Si un usuario está autenticado, el callback recibe como argumento un objeto {user} con la información del usuario (uid, email, etc.)
            - Si no hay un usuario autenticado, el callback recibe null
        */
        if(user) {
            // si existe user, seteamos los valores de loggedUser con los datos del usuario
            // console.log("Confirmando que el usuario está autenticado")

            // Actualizamos los datos locales de loggedUser, notificamos a los observers y guardamos los cambios del user en localStorage con la función updateLoggedUser()
            updateLoggedUser ({ // le pasamos como parámetro un objeto con los datos del usuario autenticado
                id: user.uid, //  en el usuario de Firebase Authentication, el id se llama 'uid' (unique id)
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
            
            // Si user no existe, entonces los valores del loggedUser vuelven a ser todos nulos porque significa que no hay un usuario autenticado 
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


// Función para iniciar sesión
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


// Función para registrarnos (crear cuenta)
export async function register({email, password}) {

    try {

        // Registrarse en la aplicaicón requiere 2 acciones:
        // 1. Crear el usuario en Authentication
        // 2. Crear un documento en Firestore, en la collection 'users', usando el uid del usuario en Authentication

        // Primero nos registramos en Authentication
        const credentials = await createUserWithEmailAndPassword(
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
 * Función para editar perfil y poder ponerle un nombre de usuario y biografía
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

        // Actualizamos el perfil del usuario en Firestore con la función 'updateUserProfile()' de [user-profile.js]. Acá vamos a actualzar el document del user que está dentro de la collection 'users'
        const promiseProfile = updateUserProfile( // a updateUserProfile() le tenemos que pasar dos parámetros:
            loggedUser.id, // el id del usuario que queremos modificar
            { // un objeto con los datos que queremos editar
                displayName, bio
            }
        ) 

        // Esperamos a que ambas promesas se completen, con ayuda de la función Promise.all()
        await Promise.all( 
            [
                promiseAuth, promiseProfile
            ]
        )

        // Actualizamos los datos locales de loggedUser, notificamos a los observers y guardamos los cambios del user en localStorage con la función updateLoggedUser()
        updateLoggedUser ({ // le pasamos como parámetros un objeto con los datos nuevos del usuario
            displayName,
            bio,
        })

    } catch (error) {
        console.error('[auth.js editMyProfile] Error al tratar de editar el perfil: ', error)
        throw error
    }
}

// Función para cerrar sesión
export async function logout() {
    await signOut(auth)
}

/**
 * 
 * @param {Function} callback 
 * @returns {Function} Función para cancelar la suscripción
 */
export function subscribeToAuthChanges(callback){

    // pusheamos la función callback al array observers
    observers.push(callback)

    // console.log("Observer agregado. El stack actual es: ", observers)

    // inmediatamente notificamos al callback los datos actuales del usuario autenticado 
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
    callback({...loggedUser}) // es muy importante que le pasemos una COPIA y no la variable loggedUser en sí, porque si hacemos esto, la estamos pasando por referencia y esto puede abrir problmeas
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
// Creamos una función actualizar los datos locales de loggedUser, notificar a los observers y para actualizar el usuario en localStorage
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
        const filepath = `users/${loggedUser.id}/avatar.jpg`

        await uploadFile(filepath, photo)

        // Guardamos la foto
        // Primero traemos la url de la foto
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