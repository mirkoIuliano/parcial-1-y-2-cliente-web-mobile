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
 * @param {string} uid 
 * @param {displayName: string, bio: string, photoURL: string} data 
 */
// creamos la función para modificar displayName, la bio y la foto de un usuario
export async function updateUserProfile(uid, data) { // data sería un objeto con los datos
    // En esta ocasión nosotors queremos modificar un documento en específico
    // Esto requiere que usemos la función doc() de Firestore para crear la referencia a un documento específico
    const profileDocumentRef = doc(db, // como primer parámetro le pasamos la referncia a la base de datos 'Firestore'
        `/users/${uid}` // como segundo parámetro le pasamos el nombre de la collection ('/users') y el id del documento ('/${uid}') => de esta forma tenemos la referencia al doc específico del usuario
        // el proceso sería: primero tenemos acceso a la base de datos con 'db' y después entramos a la collection users ('/users') y entramos al doc específico ('/${uid}')
    )

    // Editamos el documento usando la función updateDoc()
    await updateDoc(profileDocumentRef, // como primer parámetro le pasamos la referencia al documento específico
        { // como segundo parámetro le pasamos los datos 
            ...data
        }
    ) 
}


/**
 * Esta función va a retornar todos los datos del documento del usuario
 * 
 * @param {string} uid 
 * @returns {{id: string, email: string, displayName: string, bio: string}}
 */
// Creamos esta función porque antes veníamos trayendo el displayName, el email y el id desde el Authentication, pero la bio la tenemos en un document dentro de la collection 'users'. Así que ahora vamos a traer TODOS los datos del document específico del usuario
export async function getUserProfileByID(uid) { // recibe como parámetro el uid del usuario
    // creamos una referencia al documento con los registro del usuario
    const profileDocumentRef = doc(db, `/users/${uid}`) // en la colletion 'users', los documents tienen como id el uid del usuario del cual contienen la inforamción. Así que haciendo `/users/${id}` estamos teniendo la referencia al docuemento con los registros del usuario especificado
    const profileSnapshot = await getDoc(profileDocumentRef) // con getDoc() traemos los registros de un documento. Como parámetro hay que pasarle la referencia del document del cual queremos traer los datos

    // como respuesta vamos a retornar un objeto con los datos del documento (osea los datos del usuario)
    return {
        id: profileSnapshot.id, // como id pasamos el id del documento ya que, como dije antes, el docuement tiene como id el uid del usuario
        email: profileSnapshot.data().email,
        displayName: profileSnapshot.data().displayName,
        bio: profileSnapshot.data().bio,
    }
}

/**
 * Esta función va a crear en la Collection 'users', un nuevo Documento con los datos del usuario registrado 
 * 
 * @param {string} id 
 * @param {{email: string}} data 
 */
export async function createUserProfile(id, {email}) {
    // Obtenemos la referencia al documento usando doc(), mandandole como parámetros: 
    // 1. La referencia a la base de datos  
    // 2. El nombre de la collection ('/users') y el id del documento ('/${id}')
    const profileDocumentRef = doc(db, `/users/${id}`) // como en un primer momento no existe el documento, se crea en la Collection 'users' un Document con id = al uid del usuario que acaba de crear usuario
    
    await setDoc( // setDoc() es la función para guardar los datos de un documento específico
        profileDocumentRef, // le pasamos la refencia al documento
        {email} // y le pasamos la data que le queremos guardar
    ) 
}


// Función para obtener el displayName de un usuario por su ID. La utilizo para poder poner los user_name de manera dinámica, cosa que si el usuario lo actualiza, se va a cambiar también en los posts que haya realizado y en los comentarios también
export async function getDisplayNameByUserId(uid) {
    // creamos la referencia al documento dentro de la collection 'users'. En esta collection los documentos tienen los registros (datos) de los users autenticados (como la biografía). Estos docuementos tienen como id de docuemnto, el uid del user
    const profileDocumentRef = doc(db, `/users/${uid}`)
    const profileSnapshot = await getDoc(profileDocumentRef) // obtenemos el documentos con getDoc, que como parámetro recibe la referencia al documento del que se quiere obtener los registros
    
    // si no tiene displayName ponemos el email
    return profileSnapshot.data().displayName && profileSnapshot.data().displayName !== "" ? profileSnapshot.data().displayName : profileSnapshot.data().email.split("@")[0];
    /* Explicación de este condicional
    "profileSnapshot.data().displayName" => si existe el atributo displayName dentro de data() de profileSnapshot
    "&& profileSnapshot.data().displayName !== ''" => y además este displayName tiene algo escrito
    "? profileSnapshot.data().displayName" => en caso de que las dos sean true vamos a retornar el displayName
    ": profileSnapshot.data().email.split("@")[0];" => en caso de que alguna de las dos sean false significa que no tiene display name, así que retornamos lo que sea que esté escrito antes del @ en el email

    Explicación del split:
    Si el user tiene como mail mirkoIuliano@gmail.com
    Se va a poner como user mirkoIuliano
    */
}
