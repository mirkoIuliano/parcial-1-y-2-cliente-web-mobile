import { addDoc, collection, doc, getDoc, getDocs, onSnapshot, orderBy, query, serverTimestamp, updateDoc, where } from "firebase/firestore"
import { db } from "./firebase"
import { auth } from "./firebase"
import { getDisplayNameByUserId } from "./user-profile"
import { getFileURL, uploadFile } from "./file-storage"


/**
 * Función para guardar posteos nuevos
 * 
 * @param {{user_name:string, book_title: string, review: string}} newPost
 * @returns {Promise} 
 * 
 */
export async function savePulicPost({book_title, review, post_image}) {

    // Obtenemos al usuario autenticado
    const user = auth.currentUser

    // Validamos de que exista el usuario
    if (!user) {
        throw new Error("[public-posts.js savePublicPost] No hay un usuario autenticado")
    }

    // Creamos una referencia a la collection 'public-posts', que es en donde se encuentras todas las publicaciones
    const publicPostsCollectionRef = collection(db, "public-posts") // collection() recibe dos parámetros: la conexión a la base (db) y el nombre/ruta de la collection

    // Definimos la variable imageURL y la inicializamos como null (por defecto tomo que no hay foto en el posteo)
    let imageURL = null

    // Si el usuario envió una imagen se hace lo siguiente:
    if (post_image) {

        // creamos el path donde se va a guardar la imagen en Storage
        const filepath = `public-posts/${user.uid}/${book_title}`

        // con la función uploadFile() de [file-storage] subimos la imagen a Storage
        await uploadFile(filepath, post_image) // le tenemos que pasar la ruta donde se va a subir y la imagen

        // con la función getFileURL de [file-storage] obtenemos la URL de la imagen y la guardamos en imageURL
        imageURL = await getFileURL(filepath) // le tenemos que pasar la ruta de la imagen de la cual queremos obtener su URL 
    }
    
    // Usamos la función addDoc() para agregar un documento a la collection 'public-posts'
    await addDoc(publicPostsCollectionRef, // le pasamos la referencia a la collection donde queremos agregar el documento
        {   // le pasamos como segundo parámetro un objeto que contenga los datos del docuemnto
            user_id: user.uid, // pasamos el id del usuario
            book_title,
            review,
            post_imageURL: imageURL,
            created_at: serverTimestamp(), 
            // usamos la función serverTimestamp para guardar la fecha de creación. Esta función deja indicado que queremos que cuando el registro se grabe en el servidor, se tome la fecha y la hora del servidor 
        }
    ) 

}

/**
 * Función para obtener los posteos de la base de datos
 * 
 * @returns {}
 */
export async function getPublicPosts() {

    const publicPostsCollectionRef = collection(db, "public-posts")

    // Creamos una query (consulta) para traer todos los posteos ordenados por fecha de creación de manera descendente (quiero que aparezcan arriba lo más nuevos)
    const postsQuery = query(publicPostsCollectionRef, orderBy("created_at", "desc"))

    // Con getDocs traemos todos los docuemnts de la collection. getDocs resulta en un objeto 'QuerySnapshot' que tiene información general sobre la consulta y los docuemntos. Todo esto lo guardo en 'snapshot'
    const snapshot = await getDocs(postsQuery)

    // Creamos 'posts' y en él se guardan todos los documentos separados y con el user_name dinámico 
    const posts = await Promise.all(
        // snapshot.docs => de esta forma entramos al array con los docuemtnos
        // snapshot.docs.map => hacemos un map para ir documento por docuemento y realizarle el cambio del user_name con displayName 

        snapshot.docs.map(async (doc) => {

            // en displayName guardamos el displayName que tiene el user actualmente
            const displayName = await getDisplayNameByUserId(doc.data().user_id)

            return {
                id: doc.id,
                user_id: doc.data().user_id,
                user_name: displayName || "",
                book_title: doc.data().book_title || "",
                review: doc.data().review || "",
                created_at: doc.data().created_at?.toDate(),
                post_imageURL: doc.data().post_imageURL || null,
                comments: [], // se inicializa vacío y después se "rellena" con subscribeToComments()
                commentsModel: { user_comment: "" },
            }

        })
    )

    return posts

}

/**
 * Función para suscribirnos a los comentarios y escuchar los cambios de los comentarios en una publicaición específica
 * 
 * @param {string} postId 
 * @param {Function} callback 
 */
export async function subscribeToComments(postId, callback) {

    // Hacemos la referencia a la subcollection 'comments' del documento específico
    const commentsSubcollectionRef = collection(db, 'public-posts', postId, 'comments')

    // Creamos la query para traerlos en orden ascendente
    const commentsQuery = query(commentsSubcollectionRef, orderBy('created_at', 'asc')) 

    // Usamos onSnapshot, que hace que cada vez que escuche un cambio se active la función callback
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

/**
 * Función para agregar comentarios a una publicación
 * 
 * @param {String} postId 
 * @param {Object} comment 
 */
export async function addCommentToPost(postId, comment) // como parámetros recibe el id del post y el contenido del comentario (el id del que comnetó y el contenido de ese comentario) 
{

    // console.log("[public-posts.js addCommentToPost] Se ejecutó la función")

    // 'commentsSubcollectionRef' va a tener la referencia a la subcollection 'comments' de la publicación específica
    const commentsSubcollectionRef  = collection(db, 'public-posts', postId, 'comments')

    // Usamos addDoc() para agregar documento 
    await addDoc(commentsSubcollectionRef , // como primer parámetro le pasamos la referencia a la subcollection
        { // como segundo parámetro le pasamos un objeto con los datos que queremos agregar
            ...comment, // le agregamos todo lo que contenga comment (que es el user_comment y el comment_user_id),
            created_at: serverTimestamp(), // y agregamos un created_at
        }
    )
    
}

/**
 * Función para obtener los posteos de un usuario específico
 * 
 * @param {string} userId 
 * @returns {}
 */
export async function getPostsByUserId(userId) {

    let userPostsQuery

    // Creamos la referencia a la collection "public-posts"
    const publicPostsCollectionRef = collection(db, 'public-posts')

    // Si hay un usuario autenticado:
    if(userId){ 

        // creo una query (consulta) para traer todos los documentos (osea todas las publicaciones) del usuario ordenados de manera descendente
        userPostsQuery = query(
            publicPostsCollectionRef, // le paso la referencia a la collection de donde quiero que traiga los documents
            orderBy('created_at', 'desc'), // ordenamos por fecha de creación, de manera descendente
            // y filtro para obtener solo las publicaciones del usuario autenticado
            where('user_id', '==', userId) // solo va a traer los documents que tengan user_id igual al id del usuario autenticado
        )
    } else {
        console.error("[public-posts getPostsByUserId] No se envió ningún Id de usuario para buscar sus publicaciones")
    }

    // Con getDocs traemos todos los docuemnts de la collection. getDocs resulta en un objeto 'QuerySnapshot' que tiene información general sobre la consulta y los docuemntos. Todo esto lo guardo en 'snapshot'
    const postsSnapshot = await getDocs(userPostsQuery)
    
    // Si el usuario no tiene posteos retornamos null
    if (postsSnapshot.docs.length == 0) {
        // console.log("no tiene posteos posteos este usuario")
        return null
    }

    // Creamos 'posts' y en él se guardan todos los documentos separados y con el user_name dinámico 
    const posts = await Promise.all(
        // postsSnapshot.docs => de esta forma entro al array con los docuemtnos
        // postsSnapshot.docs.map => hago un map para ir documento por docuemento y realizarle el cambio del user_name con displayName 
        postsSnapshot.docs.map(async (doc) => {

            // en displayName guardamos el displayName que tiene el user actualmente
            const displayName = await getDisplayNameByUserId(doc.data().user_id)

            return {
                id: doc.id,
                user_id: doc.data().user_id,
                user_name: displayName,
                book_title: doc.data().book_title || "",
                review: doc.data().review || "",
                created_at: doc.data().created_at?.toDate(),
                post_imageURL: doc.data().post_imageURL || null, 
                comments: [], // se inicializa vacío y después se "rellena" con subscribeToComments()
                commentsModel: { user_comment: "" },
            }

        })

    )

    return posts

}

/**
 * Función para traer una publicación específica
 * 
 * @param {String} postId 
 * @returns 
 */
export async function getPostById(postId) {

    // Creamos la referencia al documento específico
    const postDocRef = doc(db, "public-posts", postId)

    // Con getDoc() obtenemos el documento y lo guardamos en 'post'
    const post = await getDoc(postDocRef)

    // Si no existe el posteo retornamos null
    if (!post.exists()) {
        console.error(`[public-posts.js getPostById] No se encontró el posteo con ID: ${postId}`)
        return null
    }

    // Obtenemos el displayName dinámicamente con la función getDisplayNameByUserId, a la cual se le tiene que pasar el id del user como parámetro
    const displayName = await getDisplayNameByUserId(post.data().user_id)

    // Retornamos un objeto con todos los datos necesario del posteo
    return {
        id: post.id,
        user_id: post.data().user_id,
        user_name: displayName || "",
        book_title: post.data().book_title || "",
        review: post.data().review || "",
        created_at: post.data().created_at?.toDate(),
        post_imageURL: post.data().post_imageURL || null, 
        // no retorno nada sobre los comentarios ya que no veo necesario que tenga sección de comentarios en un edit del posteo (quizá en un futuro estaría bueno ampliar esto para que pueda eliminar comentarios de otros usuarios??)
    }

}

/**
 * Función para editar una publicación
 * 
 * @param {String} postId 
 * @param {Object} updatedData 
 */
export async function editMyPost(postId, updatedData) {

    // Creamos la referencia al documento específico en la colección 'public-posts' usando el postId
    const postDocRef = doc(db, "public-posts", postId)

    // Creamos una variable imageURL para que se guarde aquí la URL de la foto anterior o que sea null en caso de no haber
    let imageURL = updatedData.post_imageURL || null

    // Si se cargó una nueva imagen hacemos lo siguiente:
    if (updatedData.new_image) {

        // creo el path que va a tener el lugar donde se va a guardar la imagen (ponemos el mismo path que la anterior para que se sobreescriba)
        const filepath = `public-posts/${auth.currentUser.uid}/${updatedData.book_title}`

        // con la función uploadFile() de [file-storage] subimos la imagen nueva a Storage
        await uploadFile(filepath, updatedData.new_image)

        // con la función getFileURL de [file-storage] obtenemos la nueva URL de la imagen y la guardamos en imageURL
        imageURL = await getFileURL(filepath)

    }

    // Editamos/actualizamos el documento usando la función updateDoc()
    await updateDoc(postDocRef, // como primer parámetro le pasamos la referencia al documento específico
    { // como segundo parámetro le pasamos un objeto con los datos a actualizar 
        book_title: updatedData.book_title,
        review: updatedData.review,
        post_imageURL: imageURL,
    })
    
}