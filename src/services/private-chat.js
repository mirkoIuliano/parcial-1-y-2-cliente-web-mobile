import { addDoc, collection, getDocs, limit, onSnapshot, orderBy, query, serverTimestamp, where } from "firebase/firestore"
import { db } from "./firebase"

/** 
 * Contiene la lista de los docuemntos de chats privados.  
 * La idea es que cada clave del objeto represente un "id" de la conversación (id interno, no tiene que ver con el id de firebase), y como valor contenga el docuemtno del chat.
 * Para el id de la conversación, vamos a generar la unión ordenada de los ids de ambos usuarios con un "_".
 * Por ejemplo, si los usuarios de la conversación son:
 * User1: asd
 * User2: zxc
 * El Id va a quedar como Id: asd_zxc
 * 
 * Y el resultado del is debe ser igual sin importar el orden en que tengamos los ids.
 * Es decir:
 * User1: zxc
 * User2: asd
 * Si están al revés, el Id tiene que ser el mismo => Id: asd_zxc
 * 
 * @type {{}} 
 * 
*/
const privateChatCache = {}

// para manejar esto de manera estandarizada vamos a definir 3 funciones
/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @returns {string} 
 */
function getCacheKey (senderId, receiverId) {
    return [senderId, receiverId].sort().join("_")
}

/**
 * 
 * @param {string} key 
 * @param {*} docuement 
 */
function putInCache(key, docuement) {
    privateChatCache[key] = docuement
}

/**
 * 
 * @param {string} key 
 * @returns {string|null}
 */
function retrieveFromCache(key) {
    return privateChatCache[key] || null // retorna esa clave o null, en el caso de que no exista
}

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @returns {Promise<DocumentReferece>} 
*/

// Cremos esta función ya que tanto para guardar los mensajes como para leer los mensajes vamos a necestiar leer el docuemtno del chat privado. Esta función va a buscar el documento o lo crea en caso de no existir
async function getPrivateChatDocument(senderId, receiverId) {

    // Antes de buscar vamos a preguntar si tenemos la conversación en el caché
    const cacheKey = getCacheKey(senderId, receiverId) // obtengo la calve del caché en base a senderId y receiverId

    // Luego obtenemos el documento
    const cacheDoc = retrieveFromCache(cacheKey)

    // Si tenemos el docuemnto en el caché retornamos el cacheDoc que se encuntra allí
    if (cacheDoc){
        console.log("Recuperando el documento del chat privado del caché")
        return cacheDoc
    }

    console.log("Buscando el documento del chat privado en Firestore")

    const chatCollectionRef = collection(db, 'private-chats')
    
    const chatQuery = query(chatCollectionRef, where( // la función where recibe tres paráemtros: el primero es el nombre de la propiedad del docuemtno que quiereo buscar, el segundo es el operador y el tercero el valor 
        'users', '==', {
            [senderId] : true,
            [receiverId] : true,
        }
    ), limit(1)) // lo limitamos para que solo traiga el Primer registro de la base de datos
    // como se que solo puede haber un docuemento entre estos usuarios, el limit se asegura de que una vez que encuentre ese documento deje de buscar (esto es importante porque si tenemos 10 millones de docuemtnos, si lo encuentra no va a tener que buscar en los que le faltan)

    const chatSnapshot = await getDocs(chatQuery) // usamos getDocs en vez de getDoc porque, si bien sabemos que en este caso solo puede haber un docuemetno, getDoc solo sirve cuando yo sé el id exacto
    
    let chatDoc
    
    if(chatSnapshot.empty) // si el snapshot está vacío creamos un docuemtno porque no encontramos un document que tenga los mismos senderId y receiverId. Como no encontró significa que es un chat privado nuevo y que se tiene que crear un nuevo documento
    {

        chatDoc = await addDoc(chatCollectionRef, {

            users: {
                [senderId] : true,
                [receiverId] : true,
            }

        })

    } else {
        chatDoc = chatSnapshot.docs[0] // chatDoc va a ser el primero que se haya encontrado
    }

    // Antes de retornar el chatDoc, si lo tuvimos que buscar al docuemtno porque no lo teníamos en el caché, guardamos el docuemnto en el caché
    putInCache(cacheKey, chatDoc) 

    return chatDoc
}

/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {string} text 
 */
export async function savePrivateChatMessage(senderId, receiverId, text) // para grabar un mensaje necesitamos saber en qué sala de chat es, por lo cual necesito que me pasen los ids de los dos usuarios y el contenido del mensaje
{
    // Como necesito el docuemnto de la conversación para poder anidar la subcollection dentro, lo primero que vamos a hacer es crear/encontrar el Docuement de la conversación privada entre los dos
    // Primero buscamos y vemos si ya existe
    const chatDoc = await getPrivateChatDocument(senderId, receiverId)

    // Ahora que tenemos el docuemnto (en chatDoc), y especialmente su id, podemos grabar el mensaje en la subcollection de messages del documento
    const messagesSubcollectionRef = collection(db, `private-chats/${chatDoc.id}/messages`) // Para referenciar una subcollection el trabajo es casi lo mismo que con una collection normal. La gran diferencia es que el path va a tener 3 o más valores 
    // La cantidad de segmentos que tiene que tener la url tiene que ser impar si hace referencia a una collection y cantidades pares para apuntar docuemntos
    // Es por eso que nosotros usamos 3 `private-chats/${chatDoc.id}/messages` => messages sería la subcollection
    // Le esatmos diciendo que queremos crear en la colección private-chats, dentro del docuemtno que se acaba de crear (chatDoc), la subcolección de mensajes

    // para pushear el mensaje adentro hacemos addDoc
    await addDoc(messagesSubcollectionRef, // como primer parámetro le pasamos la referencia a la subcollection 'messages' donde van a estar los mensajes de la conversación
    { // como segundo parámetro pasamos el contenido que va a tener cada mensaje. Pasamos un objeto con el id del usuario que envió el mensaje, el contenido y la fecha y hora de creación
        user_id: senderId,
        text,
        created_at: serverTimestamp(),
    })
}



/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {function} callback 
*/
// Para leer mensajes ncestiamos 3 parámetros: el id del que envía, el id del que recibe y el callback que queremos ejecutar
export async function subscribeToPrivateChatMessages(senderId, receiverId, callback) {
    // Primero buscamos el docuemnto del chat privado
    const chatDoc = await getPrivateChatDocument(senderId, receiverId)

    // creamos el query para traer los mensajes
    const queryMessages = query (
        collection(db, `private-chats/${chatDoc.id}/messages`),
        orderBy('created_at')
    )

    onSnapshot(queryMessages, snapshot => {
        const messages = snapshot.docs.map(document => {
            return {
                id: document.data().id,
                user_id: document.data().user_id,
                text: document.data().text,
                created_at: document.data().created_at?.toDate(),
            }
        })
        callback(messages)
    })
}