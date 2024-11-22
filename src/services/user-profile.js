/* En 'profe-combinacion-auth-firestore.txt' hay más info sobre cómo funciona este archivo y lo que vamos a hacer en él */
/* Explicación breve mia:
    Nosotros con la función updateProfile() de Firebase solo podemos editar el nombre de usuario y la foto de perfil
    Para poder ponerle/editarle nuevos datos creamos una collection diferente.
    Esta collection va a tener documentos diferentes para cada usuario.
    Cada doc va a tener como id el uid del usuario, y como registros va a tener displayName, bio y career 
*/

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


/**
 * 
 * @param {string} id 
 * @param {displayName: string, bio: string, career: string} data 
 */
// creamos la función para modificar displayName, career y la bio de un usuario
export async function updateUserProfile(id, {displayName, career, bio}) {
    // En esta ocasión nosotors queremos modificar un documento en específico
    // Esto requiere que usemos la función doc() de Firestore para crear la referencia a un documento específico
    const profileRef = doc(db, // como primer parámetro le pasamos la referncia a la base de datos 'Firestore'
        `/users/${id}` // como segundo parámetro le pasamos el nombre de la collection ('/users') y el id del documento ('/${id}') => de esta forma tenemos la referencia al doc específico del usuario
        // el proceso sería: primero tenemos acceso a la base de datos con 'db' y después entramos a la collection users ('/users') y entramos al doc específico ('/${id}')
    )

    // Editamos el documento usando la función updateDoc()
    await updateDoc(profileRef, // como primer parámetro le pasamos la referencia al documento específico
        { // como segundo parámetro le pasamos los datos 
            displayName,
            bio,
            career,
        }
    ) 
}


/**
 * Esta función va a retornar todos los datos del documento del usuario
 * 
 * @param {string} id 
 * @returns {{id: string, email: string, displayName: string, bio: string, career: string}}
 */
// Creamos esta función porque antes veníamos trayendo el displayName, el email y el id desde el Authentication, pero el career y la bio lo tenemos en un doc dentro de una collection. Así que ahora vamos a traer TODOS los datos de la collection y del document específico del usuario
export async function getUserProfileByID(id) {
    const profileRef = doc(db, `/users/${id}`)
    const profileSnapshot = await getDoc(profileRef) // getDoc retorna un documento que colocamos en la varaible profileSnapshot 

    return {
        id: profileSnapshot.id,
        email: profileSnapshot.data().email,
        displayName: profileSnapshot.data().displayName,
        career: profileSnapshot.data().career,
        bio: profileSnapshot.data().bio,
    }
}

/**
 * 
 * @param {string} id 
 * @param {{email: string}} data 
 */
export async function createUserProfile(id, {email}) {
    // obtenemos la referencia al documento del usuario usando doc(), mandandole como parámetros: 
    // 1. la referencia a la base de datos  
    // 2. el nombre de la collection ('/users') y el id del documento ('/${id}')
    const profileRef = doc(db, `/users/${id}`)
    
    await setDoc( // setDoc es la función para guardar los datos de un documento específico
        profileRef, // le pasamos la refencia al documento
        {email} // y le pasamos la data que le queremos guardar
    ) 
}