<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeToAuthChanges } from '../services/auth';
import { addCommentToPost, getPostsByUserId } from '../services/public-posts';
import { auth } from '../services/firebase';
import { getDisplayNameByUserId } from '../services/user-profile';
import ProfileData from '../components/ProfileData.vue';

// creamos "unsubscribeFromAuth()" y la definimos como una función vacía. Esto lo hacemos porque después vamos a guardar en ella una función para desuscribirnos de los cambio de autenticación
let unsubscribeFromAuth = () => {} 

const loggedUser = ref({
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
    bio: null,
})

const loading = ref(false)

const posts = ref([])

onMounted(() => {
    // cuando se monte queremos llamar al subscribeToAuthChanges
    unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData) // le pasamos un callback como parámetro. Como resultado vamos a recibir newUserData e igualamos loggedUser con este newUserData
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse ==> lo vamos a usar para que cuando desmontemos el componente se desuscriba

    getPostsByUserId(async (userPosts) => { // userPosts es el resultado de getPostsByUserId()
        // al array posts le vamos a agregar lo siguiente
        posts.value = await Promise.all(
            userPosts.map(async (userPost) => { // hacemos un map de userPosts y ahora 'userPost' va a representar a cada uno de los docuemntos del usuario
                const resolvedComments  = await Promise.all( // en resolvedComments se va a guardar todos los comentarios del posteo, pero con el user_name puesto dinámicamente
                    userPost.comments.map(async (comment) => { // como comments es un array tenemos que hacer un map de comments
                        const displayName = await getDisplayNameByUserId(comment.comment_user_id) // a getDisplayNameByUserId() le enviamos el id del user que comentó para traer el user_name dinámicamente
                        return { // retorna un objeto
                            ...comment, // con todo el contenido que tenía comment (osea el comment_user_id y el user_comment)
                            user_name: displayName, // y le agregamos user_name, que va a ser el displayName traído dinámicamente
                        }
                    })
                )
                // una vez terminado el userPost.comments.map(), hacemos el return de userPosts.map()
                return { // retornamos un objeto con:
                    ...userPost, // todo lo que ya tenía el documento del posteo
                    comments: resolvedComments, // comments lo igualamos a resolvedComments, que son los mismos comments, pero con user_name
                    commentsModel: { // y le agregamos un objeto commentsModel, que va a servir para la caja de comentarios nuevos
                        user_comment: ""
                    }
                }
            })
        )
    })
}) 

async function handleComment (postId, user_comment )
{
    // Preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return; // Si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe

    console.log("mandando comentario")

    loading.value = true

    // uso auth.currentUser para saber si hay o no un usuario autenticado 
    if (auth.currentUser){ // si el usuario que quiere comentar está autenticado:
        await addCommentToPost( postId, // llamos a la función addCommentToPost de [public-posts.js]. Como primer parámetro le enviamos el id del documento (osea el id del posteo al que el comentario pertenece)
        { // como segundo parámetro un objeto con los datos del comentario
            user_comment, // el contenido del comentario
            comment_user_id: auth.currentUser.uid // el uid del usuario autenticado que lo hizp
        }
    )
} else {
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    }

    loading.value = false

     // Limpiamos los campos de comentario solo para el post correspondiente
    const post = posts.value.find(post => post.id === postId);
    post.commentsModel.user_comment = "";
}

onUnmounted(() => {
    // Cuando se desmonte vamos a cancelar la suscripción
    unsubscribeFromAuth()
})

/**
 * 
 * @param {Date|null} date
 * @returns {string} La fecha con formato "DD/MM/AAAA hh:ii". Retorna null si date es null.
 */
function formatDate(date){
    // hacemos esto es null por lo que explica en clase 9 min 27. Básicamente es para solventar un problema de desincronización entre horario de PC y horario del servidor (que es la hora real que se toma)
    if(!date) return null // después cuando subamos un post vamos a poder poner 'Subiendo post...' gracias a esto

    // Vamos a formatear la fecha usando la clase Intl.DateTimeFormat() --> es nativo de JS
    const formatter = new Intl.DateTimeFormat('es-AR', 
    { // como segundo parámetro vamos a poder pasar un objeto de confiruación sobre el formato. Esto lo hacemos porque sino, si el número del día es de un solo dígito aparecería así: 1/10/2022. Con esta configuración aparecería como 01/11/2022
        day: '2-digit',
        month: '2-digit',
        year:'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // así le pedimos que no nos use el formato de p.m y a.m y que llegue hasta 24hs

    })

    // Usamos el formateador que creamos para darle la forma al Date
    return formatter.format(date).replace(',', '') // usamos replace para sacarle la coma y en su lugar no poner nada
                                    // sin replace se vería: 24/11/2024, 19:46
                                    // con replace se vería: 24/11/2024 19:46 (sin la coma en el medio)
}

</script>

<template>

    <ProfileData :user="loggedUser"/>

    <!-- Posts creados por el usuario -->
    <article v-for="post in posts" class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8">

    <div class="mb-3 flex items-center justify-between">
        <div>
            <h3 class="text-2xl font-semibold text-slate-800">{{post.book_title}}</h3>
            <p class="text-sm font-semibold text-slate-400 p-0 m-0">{{ formatDate(post.created_at) || 'Subiendo post...' }}</p>
        </div>
        <router-link 
            :to="`/usuario/${post.user_id}`"
            class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
        >
            <p class="mr-4">@{{post.user_name}}</p>
        </router-link>
    </div>

    <div class="whitespace-pre-wrap break-words font-sans text-base mb-5 p-5 border-b-2">
        {{ post.review }}
    </div>

    <!-- Comentarios -->
    <div class="mb-5">
        <h4 class="font-semibold text-base text-slate-800">Comentarios:</h4>
        <ul>
            <li v-for="comment in post.comments || []" class="text-slate-600 text-sm mt-2" >
                <strong>@{{ comment.user_name }}:</strong> {{ comment.user_comment }}
            </li>
        </ul>
        
        <form action="#" @submit.prevent="handleComment(post.id, post.commentsModel.user_comment)">
            <div class="mt-5">
                <label for="user_comment" class="block sr-only">Comentar</label>
                <input 
                    type="text" 
                    for="user_comment"
                    class="px-4 py-1 border border-slate-300 rounded-md w-10/12 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    v-model="post.commentsModel.user_comment"
                    placeholder="Ingresar comentario..."
                >
                <button class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 transition-colors duration-200">{{ !loading ? 'Comentar' : 'Enviando...'}}</button>
            </div>
        </form>
    </div>
    </article>

</template>