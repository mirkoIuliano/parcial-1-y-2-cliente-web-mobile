<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addCommentToPost } from '../services/public-posts';

const props = defineProps({
    post: {
        type: Object,
        required: true,
    },
    loggedUser: {
        type: Object,
        required: true,
    },
})

const loading = ref(false)

const router = useRouter()

async function handleComment (postId, user_comment )
{
    // Establecemos el estado de carga solo para este post. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return // evita múltiples clics mientras se envía

    console.log("mandando comentario...")

    // Establecemos el estado de carga solo para este post
    loading.value = true

    // Con el '?.' se encarga de que, solo se encadena si el valor anterior no es null o undefined (osea si hay un valor en serio)
    if (!props.loggedUser?.id){ // si el usuario que quiere comentar no está autenticado:
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    } else {
        // addCommentToPost de [publi-posts] es una función que agrega un comentario en el array comments del document del posteo
        await addCommentToPost( postId, // el primer primer parámetro es el id del documento (osea, el id del posteo al que el comentario pertenece)
        { // como segundo parámetro un objeto con los datos del comentario
            user_comment, // el contenido del comentario
            comment_user_id: props.loggedUser.id // el id del usuario autenticado que lo hizo
        }
    )
    }

    // Restablecemos el estado de carga una vez que se termine de ejecutar todo
    loading.value = false
}

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
    <article class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8">
        <div class="mb-3 flex items-center justify-between">
            <div>
                <h3 class="text-2xl font-semibold text-slate-800">{{ post.book_title }}</h3>
                <p class="text-sm font-semibold text-slate-400 p-0 m-0">{{ formatDate(post.created_at) || 'Subiendo post...'
                    }}</p>
            </div>
            <router-link 
                :to="`/usuario/${post.user_id}`"
                class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
            >
                <p class="mr-4">@{{ post.user_name }}</p>
            </router-link>
        </div>

        <div class="whitespace-pre-wrap break-words font-sans text-base mb-5 p-5 border-b-2">
            {{ post.review }}
        </div>

        <!-- Comentarios -->
        <div class="mb-5">
            <h4 class="font-semibold text-base text-slate-800">Comentarios:</h4>
            <ul>
                <li v-for="comment in post.comments || []" class="text-slate-600 text-sm mt-2">
                    <router-link
                        :to="`/usuario/${comment.comment_user_id}`"
                    >
                        <strong>@{{ comment.user_name }}:</strong> 
                    </router-link>
                    {{ comment.user_comment }}
                </li>
            </ul>

            <form action="#" @submit.prevent="handleComment(post.id, post.commentsModel.user_comment)">
                <div class="mt-5">
                    <label for="user_comment" class="block sr-only">Comentar</label>
                    <input type="text" for="user_comment"
                        class="px-4 py-1 border border-slate-300 rounded-md w-10/12 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        v-model="post.commentsModel.user_comment" placeholder="Ingresar comentario...">
                    <button
                        class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 transition-colors duration-200">{{
                            !loading ? 'Comentar' : 'Enviando...'}}</button>
                </div>
            </form>
        </div>
    </article>
</template>