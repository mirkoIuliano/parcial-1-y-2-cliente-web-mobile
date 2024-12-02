/*
# Estructura del chat privado en Firestore
Dentro de los datos de un chat privado, hay 2 estructuras "complejas" (complejas es que es más de un solo valor o que un string o un entero) de data que queremos almacenar:

- Los usuarios participantes (en nuestro caso, siempre van a ser 2).
- Los mensajes (pueden ser X).

¿Cómo nos conviene representar esa data en Firestore?
https://firebase.google.com/docs/firestore/manage-data/structure-data?hl=es-419

A partir de ese documento de guía de Firestore, podemos concluir que las estructuras que
nos conviene utilizar son:

- Para los usuarios, vamos a usar un "mapa". Un mapa es, básicamente, un objeto común de JS.
- Para los mensajes, vamos a usar una subcollection.

La estructura va a quedar algo así:
[C] => Collection
[D] => Document

[C] private-chats {
    [D] idChat1 {
        users: {
            [idUser1]: true,
            [idUser2]: true,
        }

        [C] messages {
            [D] idMessage1 {
                user_id: ...,
                text: ...,
                created_at: ...,
            }

            ...
        }
    }

    ...
}

Tenemos una Collection de chat privados
En su interior va a teber como Document un idChat1
Dentro va a tener una propiedad de users, que va a ser un mapa que va a tener como vlaves los ids de los usuarios participantes 
Y dentro va a tener una subCollection messages
Que dentro va a tener un Document con el id de cada mensaje, que va a tener los datos de quien lo mandó (user_id), el texto (text) y la fecha de creació (created_at)



Nota: Observen que en el mapa de los usuarios los ids van a ser las *claves* y no los valores.
*/

import { addDoc, collection, getDocs, limit, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "./firebase";


/**
 * 
 * @param {string} senderId 
 * @param {string} receiverId 
 * @param {string} text 
 */
export async function savePrivateChatMessage(senderId, receiverId, text) // para grabar un mensaje necesitamos saber: en qué sala de chat es, por lo cual necesito que me pasen los ids de los dos usuarios y el contenido del mensaje
{
    // Como necesito el docuemnto de la conversación para poder anidar la subCollection adentro, lo primero que vamos a hacer es crear/encontrar el Docuement de la conversación privada entre los dos
    // Primero buscamos y vemos si ya existe
    const chatCollectionRef = collection(db, 'private-chats')
    const chatQuery = query(chatCollectionRef, where( // la función where recibe dos paráemtros: el primero es el nombre de la propiedad del docuemtno que quiereo buscar, el segundo es el operador y el tercero el valor 
        'users', '==', {
            [senderId] : true,
            [receiverId] : true,
        }
    ), limit(1)) // lo limitamos para que solo traiga el Primer registro de la base de datos
    // como se que solo puede haber un docuemtno entre estos usuarios, el limit se asegura de que una vez que encuentre ese documento deje de buscar (esto es importante porque si tenemos 10 millones de docuemtnos, si lo encontra no va a tener que termianr con los que le faltan)

    const chatSnapshot = await getDocs(chatQuery) // usamos getDocs en vez de getDoc, porque, si bien sabemos que en este caso solo puede haber un docuemetno, getDoc solo sirve cuando se el id exacto
    
    let chatDoc
    
    
    if(chatSnapshot.empty) // si el snapshot está vacío creamos un docuemtno porque no encontramos nada
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

    

    // Ahora que tenemos el docuemntos (en chatRef), y especialmente su id, podemos grabar el mensaje en la subcollection de messages del documento
    const messagesSubcollectionRef = collection(db, `private-chats/${chatDoc.id}/messages`) // Para referenciar una subcollection el trabajo es casi lo mismo que con una collection común. La gran diferencia es que el path va a tener 3 o más valores 
    // La cantidad de segmentos que tiene que tener la url tiene que ser impar si hace referencia a una collection y cnatidades pares para apuntar docuemntos
    // Es por eso que nosotros usamos 3 `private-chats/${chatDoc.id}/messages`
    // Le esatmos diciendo que queremos crear la colección private-chats, dentro del docuemtno que se acaba de crear (chatDoc) y la subcolección de mensajes

    // para pushear el mensaje adentro hacemos addDoc
    await addDoc(messagesSubcollectionRef, {
        user_id: senderId,
        text,
        created_at: serverTimestamp(),
    })
}

export async function subscribeToPrivateChatMessages() {
    
}