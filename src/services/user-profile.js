/* En 'profe-combinacion-auth-firestore.txt' hay más info sobre cómo funciona este archivo y lo que vamos a hacer en él */
/* Explicación breve mia:
    Nosotros con la función updateProfile() de Firebase solo podemos editar el nombre de usuario y la foto de perfil
    Para poder ponerle/editarle nuevos datos creamos una collection diferente.
    Esta collection va a tener documentos diferentes para cada usuario.
    Cada doc va a tener como id el uid del usuario, y como registros va a tener displayName, bio
*/

import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";


/**
 * 
 * @param {string} id 
 * @param {displayName: string, bio: string} data 
 */
// creamos la función para modificar displayName y la bio de un usuario
export async function updateUserProfile(id, {displayName, bio}) {
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
        }
    ) 
}


/**
 * Esta función va a retornar todos los datos del documento del usuario
 * 
 * @param {string} id 
 * @returns {{id: string, email: string, displayName: string, bio: string}}
 */
// Creamos esta función porque antes veníamos trayendo el displayName, el email y el id desde el Authentication, pero el y la bio lo tenemos en un doc dentro de una collection. Así que ahora vamos a traer TODOS los datos de la collection y del document específico del usuario
export async function getUserProfileByID(id) {
    const profileRef = doc(db, `/users/${id}`)
    const profileSnapshot = await getDoc(profileRef) // getDoc retorna un documento que colocamos en la varaible profileSnapshot 

    return {
        id: profileSnapshot.id,
        email: profileSnapshot.data().email,
        displayName: profileSnapshot.data().displayName,
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

// export async function getUserNameByUserId(id) {
//     const profileRef = doc(db, `/users/${id}`)
//     const profileSnapshot = await getDoc(profileRef) 
//     const data = profileSnapshot.data()
//     return data.displayName
// }

// Función para obtener el displayName de un usuario por su ID
export async function getDisplayNameByUserId(id) {
    const profileRef = doc(db, `/users/${id}`);
    const profileSnapshot = await getDoc(profileRef);
    return profileSnapshot.exists() ? profileSnapshot.data().displayName : "Usuario desconocido";
}

// export async function getUserNameByUserId(id) {
//     try {
//         const profileRef = doc(db, `/users/${id}`);
//         const profileSnapshot = await getDoc(profileRef);
        
//         if (!profileSnapshot.exists()) {
//             throw new Error(`No se encontró un usuario con el id: ${id}`);
//         }

//         const data = profileSnapshot.data();
        
//         if (!data.displayName) {
//             throw new Error(`El documento con id ${id} no contiene la propiedad 'displayName'.`);
//         }

//         return data.displayName;
//     } catch (error) {
//         console.error("Error obteniendo el nombre del usuario:", error.message);
//         return null; // Retorna null para evitar romper la UI
//     }
// }
