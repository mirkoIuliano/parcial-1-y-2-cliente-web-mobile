import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { db } from "./firebase" // importamos la variable db que creamos en firebase. Esta es la referencia a la base y la necesitamos para poder escribir o leer datos de la base 
import { arrayUnion, arrayRemove, updateDoc } from "firebase/firestore"
import { auth } from "./firebase"
import { getAuthenticatedUser } from "./auth"
import { getDisplayNameByUserId } from "./user-profile"


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
    // Para definir una referencia a una collection usamos la función "collection()"
    const publicPostsCollectionRef = collection(db, 'public-posts') // collection() recibe dos parámetros: la conexión a la base (db) y el nombre/ruta de la collection
    
    // Para agregar un docuemnto a una collection, usamos la función addDoc(), que recibe 2 arguemntos:
    // 1. La referencia de la collection    2. Un objeto con los datos que queremos agregar en ek documento
    // Este método retorna una promesa, que se resuelve cuando termina de escrbir (cuando se confirma que se grabó) (En este caso no nos va a servir la promesa, pero quizá en un futuro sí)
    await addDoc(publicPostsCollectionRef, // le pasamos la referencia a la collection de las publicaciones (publicPostsCollectionRef)
        {   // le pasamos como segundo parámetro un objeto que contenga los datos del posteo. En este caso van a ser los datos del usuario que lo hizo, el contenido del posteo y un array vacío de comments
            user_id: user.uid, // pasamos el id del usuario
            book_title,
            review,
            comments: [], // agregamos un array vacío donde se van a guardar los comentarios 
            created_at: serverTimestamp(), 
            // usamos la función serverTimestamp para guardar la fecha de creación. Esta función deja indicado que queremos que cuando el registro se grabe en el servidor, se tome la fecha y la hora del servidor 
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
    // Para leer los documentos de la collection "public-posts" empezamos por crear la referencia a dicha collection
    const publicPostsCollectionRef = collection(db, 'public-posts')
                    // collection es una función de firestore que nos permite obtener una referencia de una collection

    /*
        Creamos un "query" (consulta) para traer los registros ordenados por fecha de creación
        En Firestore se crea una query con una función llamada "query()", que recibe AL MENOS 2 parámetros: 
        1. Una referencia a una collection  2. Una o más instrucciones de ordenamiento, filtro o límite
    */
    const postsQuery = query(
        publicPostsCollectionRef,
        orderBy('created_at', "desc") // lo ordenamos de manera descendente porque queremos que los posteos más recientes aparezcan arriba
    )

    // Para hacer la lectura en tiempo real usamos la función "onSnapshot()". onSnapshot se ejecuta cada vez que haya cambios en la base de datos
    // Esta función recibe 2 argumentos:
    // 1. La referencia de la collection o una query  2. El callback a ejecutar cada vez que haya cambios en la base de datos. Este callback recibe como parámetro el QuerySnapshot
    onSnapshot(postsQuery, async (snapshot) => { // cada vez que haya un cambio en la base de datos se ejecuta esta fucnión
        const newPosts = await Promise.all ( // como necesitamos llamar a la función asíncrona getDisplayNameByUserId() para obtener el displayName, usamos Promise.all() para esperar a que todas las promesas de getDisplayNameByUserId se resuelvan antes de pasar los datos al callback
            snapshot.docs.map(async (doc) => { // hacemos un map, para transformar cada documento en un objeto que tenga un id, user_name, book_title, review, displayName, etc
                const displayName = await getDisplayNameByUserId(doc.data().user_id) // getDisplayNameByUserId() es una función de [user-profile.js] que sirve para obtener el nombre de usuario (displayName) de manera dinámica. Sin esta función, si guardamos user_name: doc.data().user_name, va a quedar estático y si se cambia el nombre va a seguir el nombre anterior en vez del actualziado
                // como respuesta retornamos un objeto que contiene:
                return {
                    id: doc.id,
                    user_id: doc.data().user_id,
                    user_name: displayName || "", // usamos displayName, que es el nombre dinámico
                    book_title: doc.data().book_title || "",
                    review: doc.data().review || "",
                    comments: doc.data().comments || [], // si falta, devuelve un array vacío
                    
                    /* min 21 clase 9
                    created_at lo creamos en savePublicPosts usando serverTimestamp. serverTimestamp define un sentinela, que es un indicador para que firebase sepa que el valor de ese campo se tiene que llenar en el servidor. Deja una indicación de que cuando se grabe en el servidor, use la fecha y hora del servidor para guardarse
                    Como esto recién se crea y se guarda cuando graba en el servidor, en esta primera presentación de los datos, que es local y todavía no se grabó, created_at no se grabó y sería null
                    Para resolver este problema usamos el optional chain operator para pedir la fecha (es el signo de pregunta '?')
                    Operador de encadenación opcional
                    Es lo mismo que el '.', pero antes hace un chequeo
                    El '.' pide a lo que sea que haya antes una propiedad. Si es null, intenta pedir una propiedad a null y falla porque null no tiene propiedades
                    Con el '?.' se encarga de que, solo se encadena si el valor anterior no es null o undefined (osea si hay un valor en serio)
                    Es una forma mucho más abreviada de hacer esto:
                    created_at: doc.data().created_at ? doc.data().created_at.toDate() : null
                    */
                    created_at: doc.data().created_at?.toDate(), // el método toDate() es un método que nos da firebase que sirve para transformar el timestamp que tenemos con created_at y lo convierte a un objeto Date de JS
                }
            })
        ) 
        callback(newPosts) // ejecutamos la función que recibimos como parámetro, pasándole los posteos ya transformados 
    })
    
}

// Función para agregar un comentario al post
export async function addCommentToPost(postId, comment) // como parámetros recibe el id del post y el contenido del comentario (el id del que comnetó y el contenido de ese comentario) 
{
    // postDocumentRef va a tener la referencia al documento de la publicación específica
    const postDocumentRef = doc(db, 'public-posts', postId); // usamos doc para poder buscar en la collection 'public.posts' el documento específico al cual se le está agregando un comentario

    // usamos updateDoc para editar el documento 
    await updateDoc(postDocumentRef, // como primer parámetro le pasamos la referencia al documento específico
        { // como segundo parámetro le pasamos un objeto con los datos que queremos agregar
            comments: arrayUnion( // uso la función arrayUnion() para agregar datos al array comments, que está dentro de nuestro docuemento del post
                { 
                    ...comment, // le agregamos todo lo que contenga comment (que es el user_comment y el comment_user_id)
                }
            ) 
        }
    );
}


export async function getPostsByUserId(callback) {

    let userPostsQuery

    // Para leer los documentos de la collection "public-posts" empezamos por crear la referencia a dicha collection
    const publicPostsCollectionRef = collection(db, 'public-posts')


    const user = getAuthenticatedUser()
    /*
    Uso getAuthenticatedUser() en vez de hacer ==> const user = auth.currentUser;
    Porque si lo hago así, cuando entro a la página, 'user' va a ser null porque tarda en cargar todo lo de Authentication. Como es null, después en el if(user){...} no funciona
    Si quiero ver, comentar el getAuthenticatedUser y poner la otra opción
    Tampoco funciona si pongo ==> const user = await auth.currentUser;
    */

    if(user){ // si hay un user autenticado:
        // console.log("hay un usuario autenticado")
        // creo una query (consulta) para traer todos los documentos del usuario ordenados de manera descendente
        userPostsQuery = query(
            publicPostsCollectionRef, // le paso la referencia a la collection de donde quiero que traiga los documents
            orderBy('created_at', 'desc'), // ordenamos por fecha de creación, de manera descendente
            // y filtro para obtener solo las publicaciones del usuario autenticado
            where('user_id', '==', user.id) // solo va a traer los documents que tengan user_id igual al user.id 
        )
    } else {
        // TODO: manejar error
    }

    // uso onSnapshot para que se actualice si alguien hace un nuevo comentario. Como primer parámetro le tenemos que pasar la referencia a la collection o una query y como segundo, la función callback
    onSnapshot(userPostsQuery, async (snapshot) => { // cada vez que haya un cambio en la base de datos se ejecuta esta fucnión
        const userPosts = await Promise.all( // como necesitamos llamar a la función asíncrona getDisplayNameByUserId() para obtener el displayName, usamos Promise.all() para esperar a que todas las promesas de getDisplayNameByUserId se resuelvan antes de pasar los datos al callback
            snapshot.docs.map(async (doc) => { // hacemos un map, para transformar cada documento en un objeto que tenga un id, user_name, book_title y review
                const displayName = await getDisplayNameByUserId(doc.data().user_id) // getDisplayNameByUserId() es una función de [user-profile.js] que sirve para obtener el nombre de usuario (displayName) de manera dinámica. Sin esta función, si guardamos user_name: doc.data().user_name, va a quedar estático y si se cambia el nombre va a seguir el nombre anterior en vez del actualziado
                return {
                    id: doc.id,
                    user_id: doc.data().user_id,
                    user_name: displayName, // usamos displayName, que es el nombre dinámico
                    book_title: doc.data().book_title || "",
                    review: doc.data().review || "",
                    comments: doc.data().comments || [], // si falta, devuelve un array vacío
                    created_at: doc.data().created_at?.toDate(), // si falta, devuelve un array vacío
                }
            })
        ) 
        callback(userPosts) // ejecutamos la función que recibimos como parámetro, pasándole los posteos ya transformados 
    })

}
