import { addDoc, collection, doc, getDocs, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { db } from "./firebase" // importamos la variable db que creamos en firebase. Esta es la referencia a la base y la necesitamos para poder escribir o leer datos de la base 
import { arrayUnion, arrayRemove, updateDoc } from "firebase/firestore"
import { auth } from "./firebase"


/**
 * Graba un posteo en la base de datos.
 * 
 * @param {{user_name:string, book_title: string, review: string}} newPost
 * @returns {Promise} 
 * 
 */
// Función para guardar posteos nuevos
export async function savePulicPost({book_title, review}) 
{
    // Obtenemos al usuario autenticado
    const user = auth.currentUser
    // Validamos de que exista tal usuario
    if (!user) {
        console.error("[public-posts.js savePublicPost] No hay un usuario autenticado. ", error)
        throw error
    }


    // Escribimos en Firestore
    // Para interactuar con una collection o document de Firestore es necesario definir una referencia a dicha collection o document
    // Para las collection usamos la función "collection"
    // Para los documentos usamos la función "document" 
    const publicPostsRef = collection(db, 'public-posts') // collection recibe dos parámetros: la conexión a la base (db) y el nombre/ruta de la collection
    
    // Para agregar un docuemnto a una collection, usamos la función addDoc, que recibe 2 arguemntos:
    // 1. La referencia de la collection    2. Un objeto con los datos
    // Este método retorna una promesa que se resuelve cuando termina de escrbir (cuando se confirma que se grabó) (En este caso que vamos a hacer no nos va a servir la promesa, pero quizá en un futuro sí)
    await addDoc(publicPostsRef, // le pasamos la referencia a la collection de las publicaciones (publicPostsRef)
        {   // le pasamos como segundo parámetro un objeto que contenga los datos del posteo
            user_id: user.uid,
            user_name: user.displayName || "Usuario sin user name", // en caso de no tener user name pone eso 
            book_title,
            review,
            comments: [],
        // usamos la función serverTimestamp para guardar la fecha de creación. Esta función deja indicado que queremos que cuando el registro se grabe en el servidor, se tome la fecha y la hora del servidor 
        created_at: serverTimestamp(), 
        }
    ) 
}


/**
 * Función para obtener los posteos de la base de datos
 * 
 * @param {Function} callback 
 */
export async function subscribeToPublicPosts(callback) // va a recibir un callback como parámetro. Este callback lo ejecutamos dentro del onSnapshot
{
    // Para leer los documentos de la collection "public-posts" empezamos por crear la referencia
    const publicPostsRef = collection(db, 'public-posts')
                    // collection es una función de firestore que nos permite obtener una referencia de una collection

    /*
        Creamos un "query" (consulta) para traer los registros ordenados por fecha de creación
        En Firestore se crea una query con una función llamada "query", que recibe AL MENOS 2 parámetros: 
        1. Una referencia a una collection  2. Una o más instrucciones de ordenamiento, filtro o límite
    */
    const postsQuery = query(
        publicPostsRef,
        orderBy('created_at', "desc") // lo ordenamos de manera descendente porque queremos que los posteos más recientes aparezcan arriba
    )

    // Para hacer la lectura en tiempo real usamos la función "onSnapshot()". onSnapshot se ejecuta cada vez que haya cambios en la base de datos
    // Esta función recibe 2 argumentos:
    // 1. La referencia de la collection o una query  2. El callback a ejecutar cada vez que haya cambios en la base de datos. Este callback recibe como parámetro el QuerySnapshot
    onSnapshot(postsQuery, snapshot => { // cada vez que haya un cambio en la base de datos se ejecuta esta fucnión
        const newPosts = snapshot.docs.map(doc => { // hacemos un map, para transformar cada documento en un objeto que tenga un id, user_name, book_title y review
            return {
                id: doc.id,
                user_name: doc.data().user_name || "",
                book_title: doc.data().book_title || "",
                review: doc.data().review || "",
                comments: doc.data().comments || [], // si falta, devuelve un array vacío
            }
        })
        callback(newPosts) // ejecutamos la función que recibimos como parámetro, pasándole los posteos ya transformados 
    })
    
}

// Función para agregar un comentario al post
export async function addCommentToPost(postId, comment) 
{
    // postRef va a tener la referencia al documento de la publicación específica
    const postRef = doc(db, 'public-posts', postId); // usamos doc para poder buscar en la collection 'public.posts' el documento específico al cual se le está agregando un comentario
    // usamos updateDoc para editar el documento 
    await updateDoc(postRef, // como primer parámetro le pasamos la referencia al documento específico
        { // como segundo parámetro le pasamos un objeto con los datos que queremos agregar
            comments: arrayUnion( // uso la función arrayUnion() para agregar datos al array comments, que está dentro de nuestro docuemento del post
                { 
                    ...comment,
                    // created_at: serverTimestamp()  // le agrego el momento en que se creó ese comentario
                }
            ) 
        }
    );
}


export async function getPostsByUserId(callback) {

    let loggedUser = {
        id: null
    }
    if (localStorage.getItem('user')){
        loggedUser = JSON.parse(localStorage.getItem('user'))
    }

    // Para leer los documentos de la collection "public-posts" empezamos por crear la referencia
    const publicPostsRef = collection(db, 'public-posts')

    // Obtenemos al usuario autenticado
    const user = auth.currentUser
    
    let userPostsQuery
    /* 
    Todo este if() lo hice porque si refreseheaba la página leía user.uid como null porque todavía ese proceso de Authentication no estaba realizado
    Lo que hice fue buscar el user en el localStorage y si existe usar ese en vez del user traído con auth.currentUser
    */
    if (user && user.uid) {
        // Crear una consulta para filtrar publicaciones por el campo `user_id`
        userPostsQuery = query(
            publicPostsRef,
            // orderBy('created_at', 'desc'), // Ordenamos por fecha de creación descendente
            // Filtro para obtener solo las publicaciones del usuario autenticado
            where('user_id', '==', user.uid)
        )
    } else {
        // Crear una consulta para filtrar publicaciones por el campo `user_id`
        userPostsQuery = query(
            publicPostsRef,
            // orderBy('created_at', 'desc'), // Ordenamos por fecha de creación descendente
            // Filtro para obtener solo las publicaciones del usuario autenticado
            where('user_id', '==', loggedUser.id)
        )
    }

    // Obtenemos los posteos con getDocs
    const snapshot = await getDocs(userPostsQuery);

    const userPosts = snapshot.docs.map(doc => {
        return {
            id: doc.id,
            user_name: doc.data().user_name || "",
            book_title: doc.data().book_title || "",
            review: doc.data().review || "",
            comments: doc.data().comments || [], // si no tiene, devuelve un array vacío
        }
    })

    callback(userPosts)
}
