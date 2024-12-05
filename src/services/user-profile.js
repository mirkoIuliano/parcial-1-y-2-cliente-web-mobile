import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { db } from "./firebase"

/**
 * Función para actualizar displayName, bio y la foto de perfil de un usuario
 * 
 * @param {string} uid 
 * @param {displayName: string, bio: string, photoURL: string} data 
 */
export async function updateUserProfile(uid, data) { // data sería un objeto con los datos

    // Usamos doc() para crear la referencia al documento específico
    const profileDocumentRef = doc(db, // como primer parámetro le pasamos la referncia a la base de datos
        `/users/${uid}` // como segundo parámetro le pasamos el nombre de la collection ('/users') y el id del documento ('/${uid}') => de esta forma tenemos la referencia al doc específico del usuario
    )

    // Actualizamos el documento usando la función de firestore, updateDoc()
    await updateDoc(profileDocumentRef, // como primer parámetro le pasamos la referencia al documento específico
        { // como segundo parámetro le pasamos los datos 
            ...data
        }
    ) 

}


/**
 * Función para obtener todos los datos del documento del usuario
 * 
 * @param {string} uid 
 * @returns {{id: string, email: string, displayName: string, bio: string, photoURL: string|null}}
 */
export async function getUserProfileByID(uid) { // recibe como parámetro el uid del usuario

    // Creamos una referencia al documento con los registros del usuario
    const profileDocumentRef = doc(db, `/users/${uid}`) // en la colletion 'users', los documents tienen como id el uid del usuario del cual contienen la inforamción. Así que haciendo `/users/${id}` estamos teniendo la referencia al docuemento con los registros del usuario especificado

    const profileSnapshot = await getDoc(profileDocumentRef) // con getDoc() traemos los registros de un documento. Como parámetro hay que pasarle la referencia del document del cual queremos traer los datos

    // Como respuesta vamos a retornar un objeto con los datos del documento (osea los datos del usuario)
    return {
        id: profileSnapshot.id, // como id pasamos el id del documento ya que, el docuement tiene como id el uid del usuario
        email: profileSnapshot.data().email,
        displayName: profileSnapshot.data().displayName,
        bio: profileSnapshot.data().bio,
        photoURL: profileSnapshot.data().photoURL,
    }

}

/**
 * Función para crear en la collection 'users', un nuevo document con los datos del usuario registrado 
 * 
 * @param {string} id 
 * @param {{email: string}} data 
 */
export async function createUserProfile(id, {email}) {

    const profileDocumentRef = doc(db, `/users/${id}`) // como en un primer momento no existe el documento, se crea en la Collection 'users' un Document con id igual al uid del usuario que acaba de crearse
    
    await setDoc( // setDoc() es la función para guardar los datos de un documento específico
        profileDocumentRef, // le pasamos la refencia al documento
        {email} // y le pasamos la data que le queremos guardar
    )
    
}

/**
 * Función para obtener el displayName de un usuario por su uid. Sirve para poder poner los user_name de manera dinámica, cosa que si el usuario lo actualiza, se va a cambiar también en los posts y comentarios que haya realizado
 * 
 * @param {string} uid 
 *
 */
export async function getDisplayNameByUserId(uid) {

    // Creamos la referencia al documento con los datos del usuario, que está dentro de la collection 'users'
    const profileDocumentRef = doc(db, `/users/${uid}`)

    // Obtenemos los datos del docuemento con getDoc
    const profileSnapshot = await getDoc(profileDocumentRef)
    
    // Retornamos el displayName o, en su defecto, el email formateado
    return profileSnapshot.data().displayName && profileSnapshot.data().displayName !== "" ? profileSnapshot.data().displayName : profileSnapshot.data().email.split("@")[0];
    /* Explicación de este condicional:
    "profileSnapshot.data().displayName" => si existe el atributo displayName dentro de data() de profileSnapshot
    "&& profileSnapshot.data().displayName !== ''" => y además este displayName tiene algo escrito
    "? profileSnapshot.data().displayName" => en caso de que las dos sean true vamos a retornar el displayName
    ": profileSnapshot.data().email.split("@")[0];" => en caso de que alguna de las dos sean false significa que no tiene display name, así que retornamos lo que sea que esté escrito antes del @ en el email

    Explicación del split:
    Si el user tiene como mail mirkoIuliano@gmail.com
    Se va a poner como user mirkoIuliano
    */

}
