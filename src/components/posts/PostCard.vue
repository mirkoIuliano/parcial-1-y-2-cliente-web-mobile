<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { addCommentToPost } from '../../services/public-posts';
import { formatDate } from '../../helpers/date';

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
        // addCommentToPost de [publi-posts.js] es una función que agrega un comentario en el array comments del document del posteo
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
                        class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 transition-colors duration-200"
                        >{{!loading ? 'Comentar' : 'Enviando...'}}</button>
                </div>
            </form>
        </div>
    </article>
</template>