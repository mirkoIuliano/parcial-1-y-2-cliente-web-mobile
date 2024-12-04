import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { db } from "./firebase" // importamos la variable db que creamos en firebase. Esta es la referencia a la base y la necesitamos para poder escribir o leer datos de la base 
import { auth } from "./firebase"
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
            created_at: serverTimestamp(), 
            // usamos la función serverTimestamp para guardar la fecha de creación. Esta función deja indicado que queremos que cuando el registro se grabe en el servidor, se tome la fecha y la hora del servidor 
        }
    ) 
}

// Función para obtener los posteos de la base de datos
export async function getPublicPosts() {
    const publicPostsCollectionRef = collection(db, "public-posts")
    const postsQuery = query(publicPostsCollectionRef, orderBy("created_at", "desc"))

    const snapshot = await getDocs(postsQuery)
    const posts = await Promise.all(
        snapshot.docs.map(async (doc) => {
            const displayName = await getDisplayNameByUserId(doc.data().user_id)
            return {
                id: doc.id,
                user_id: doc.data().user_id,
                user_name: displayName || "",
                book_title: doc.data().book_title || "",
                review: doc.data().review || "",
                created_at: doc.data().created_at?.toDate(),
                comments: [], // se inicializa vacío y después se "rellena" con subscribeToComments()
                commentsModel: { user_comment: "" },
            }
        })
    )

    return posts
}

// Función para suscribirnos a los comentarios y escuchar los cambios de los comentarios en una publicaición específica
export async function subscribeToComments(postId, callback) {
    // hacemos la referencia a la subcollection de comments del post (osea el docuemnt) específico
    const commentsCollectionRef = collection(db, 'public-posts', postId, 'comments')

    // creamos la query para traerlos en orden ascendente
    const commentsQuery = query(commentsCollectionRef, orderBy('created_at', 'asc')) 

    // con onSnapshota hacemos que cada vez que escuche un cambio se active la función callback
    onSnapshot(commentsQuery, async (snapshot) => {
        // en comments se van a guardar los comentarios con el diplayName dinámico
        const comments = await Promise.all(
            snapshot.docs.map(async (doc) => {
                const displayName = await getDisplayNameByUserId(doc.data().comment_user_id)
                return {
                    id: doc.id,
                    comment_user_id: doc.data().comment_user_id,
                    user_comment: doc.data().user_comment,
                    user_name: displayName || "",
                    created_at: doc.data().created_at?.toDate(),
                }
            })
        )
        callback(comments)
    })
}

// Función para agregar una subcollection que represente los comentarios al documento del post
export async function addCommentToPost(postId, comment) // como parámetros recibe el id del post y el contenido del comentario (el id del que comnetó y el contenido de ese comentario) 
{
    console.log("[public-posts.js addCommentToPost] Se ejecutó la función")
    // commentsCollectionRef  va a tener la referencia a la subcolección comments de la publicación específica
    const commentsCollectionRef  = collection(db, 'public-posts', postId, 'comments') // usamos collection para poder buscar en la subcollection 'comments', en la collection 'public.posts', del documento específico al cual se le está agregando un comentario

    // usamos addDoc para agregar documento 
    await addDoc(commentsCollectionRef , // como primer parámetro le pasamos la referencia a la subcollection
        { // como segundo parámetro le pasamos un objeto con los datos que queremos agregar
            ...comment, // le agregamos todo lo que contenga comment (que es el user_comment y el comment_user_id),
            created_at: serverTimestamp(),
        }
    )
}

// Función para obtener los posteos de un usuario específico
export async function getPostsByUserId(userId) {

    let userPostsQuery

    // Para leer los documentos de la collection "public-posts" empezamos por crear la referencia a dicha collection
    const publicPostsCollectionRef = collection(db, 'public-posts')

    if(userId){ // si hay un user autenticado:
        // console.log("hay un usuario autenticado")
        // creo una query (consulta) para traer todos los documentos (osea todas las publicaciones) del usuario ordenados de manera descendente
        userPostsQuery = query(
            publicPostsCollectionRef, // le paso la referencia a la collection de donde quiero que traiga los documents
            orderBy('created_at', 'desc'), // ordenamos por fecha de creación, de manera descendente
            // y filtro para obtener solo las publicaciones del usuario autenticado
            where('user_id', '==', userId) // solo va a traer los documents que tengan user_id igual al userId 
        )
    } else {
        // TODO: manejar error
        console.error("no se envió ningún Id de usuario para buscar sus publicaciones")
    }

    const postsSnapshot = await getDocs(userPostsQuery)
    
    if (postsSnapshot.docs.length == 0) {
        // console.log("no tiene posteos posteos este usuario")
        return null
    }

    const posts = await Promise.all(
        postsSnapshot.docs.map(async (doc) => {
            const displayName = await getDisplayNameByUserId(doc.data().user_id)
            return {
                id: doc.id,
                user_id: doc.data().user_id,
                user_name: displayName,
                book_title: doc.data().book_title || "",
                review: doc.data().review || "",
                created_at: doc.data().created_at?.toDate(),
                comments: [], // se inicializa vacío y después se "rellena" con subscribeToComments()
                commentsModel: { user_comment: "" },
            }
        })
    )

    return posts

}

// Función para traer un docuemnto específico
export async function getPostById(postId) {
    // Creamos la referencia al documento específico en la colección 'public-posts'
    const postDocRef = doc(db, "public-posts", postId)

    const post = await getDoc(postDocRef) // con getDoc le pasamos le referencia al post y lo guardamos en post

    if (!post.exists()) {
        console.error(`[public-posts.js getPostById] No se encontró el posteo con ID: ${postId}`)
        return null
    }

    // obtenemos el displayName dinámicamente con la función getDisplayNameByUserId, a la cual se le tiene que pasar el id del user como parámetro
    const displayName = await getDisplayNameByUserId(post.data().user_id)

    // retornamos un objeto con todos los datos necesario del posteo
    return {
        id: post.id,
        user_id: post.data().user_id,
        user_name: displayName || "",
        book_title: post.data().book_title || "",
        review: post.data().review || "",
        created_at: post.data().created_at?.toDate(),
        // no retorno nada sobre los comentarios ya que no veo necesario que tenga sección de comentarios en un edit del posteo (quizá en un futuro estaría bueno ampliar esto para que pueda eliminar comentarios de otros usuarios??)
    }
}

// Función para editar un docuemtno
export async function editMyPost(postId, updatedData) {
    // Creamos la referencia al documento específico en la colección 'public-posts'
    const postDocRef = doc(db, "public-posts", postId)

    // Editamos/actualizamos el documento usando la función updateDoc()
    await updateDoc(postDocRef, // como primer parámetro le pasamos la referencia al documento específico
    { // como segundo parámetro le pasamos un objeto con los datos a actualizar 
        book_title: updatedData.book_title,
        review: updatedData.review,
    })
}