<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { addCommentToPost } from '../../services/public-posts'
import { formatDate } from '../../helpers/date'

const props = defineProps({
    post: {
        type: Object,
    },
    loggedUser: {
        type: Object,
        required: true,
    },
})

const loading = ref(false)

const router = useRouter()

const errorMessage = ref("")

async function handleComment (postId, user_comment )
{
    // establecemos el estado de carga solo para este post. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return // evita múltiples clics mientras se envía
    if (!user_comment.trim()) {
        errorMessage.value = "El comentario no puede estar vacío"
        return // esto hace que no se permitan comentarios vacíos
    }
    errorMessage.value = ""

    console.log("mandando comentario...")

    // con el '?.' se encarga de que, solo se encadena si el valor anterior no es null o undefined (osea si hay un valor en serio)
    if (!props.loggedUser?.id){ // si el usuario que quiere comentar no está autenticado:
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    } 
    
    // establecemos el estado de carga solo para este post
    loading.value = true

    try {
        // addCommentToPost de [publi-posts.js] es una función que agrega un comentario en la subcolección comments del docuemtn del posteo
        await addCommentToPost( postId, // el primer primer parámetro es el id del documento (osea, el id del posteo al que el comentario pertenece)
        { // como segundo parámetro un objeto con los datos del comentario
            user_comment, // el contenido del comentario
            comment_user_id: props.loggedUser.id // el id del usuario autenticado que lo hizo
        })
        props.post.commentsModel.user_comment = ""
    } catch (error) {
        console.error("Error al intentar agregar un comentario", error)
    }
    loading.value = false
}


</script>

<template>
    <article class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8 min-w-[740px]">
        <div class="mb-3 flex items-center justify-between">
            <div>
                <h3 class="text-2xl font-semibold text-slate-800">{{ post.book_title }}</h3>
                <p class="text-sm font-semibold text-slate-400 p-0 m-0">{{ formatDate(post.created_at) || 'Recién creado' }}</p>
            </div>
            <router-link 
                v-if="post.user_id === loggedUser.id" 
                class=" ml-auto mr-4 py-1 px-3 rounded-md font-medium bg-gray-100 hover:bg-gray-300 transition-colors"
                :to="`/publicaciones/editar/${post.id}`"
            >Editar</router-link>

            <div class="flex flex-col">
                <router-link 
                :to="`/usuario/${post.user_id}`"
                class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
                > @{{ post.user_name }} </router-link>
            </div>
        </div>

        <div class="h-max">
            <div class="mb-5" v-if="post.post_imageURL">
                <img 
                    :src="post.post_imageURL" 
                    :alt="`Imagen referencia del libro ${post.book_title} subida por ${post.user_name}`"
                    class="w-full h-auto rounded-md shadow-md object-cover max-h-[500px]"
                >
            </div>
    
            <div class="whitespace-pre-wrap font-sans mb-5 p-5 border-b-2">
                {{ post.review }}
            </div>
        </div>

        <!-- Comentarios -->
        <div class="mb-5">
            <h4 class="text-lg font-semibold text-slate-800 mb-1 ml-4">Comentarios:</h4>
            <ul class="max-h-40 overflow-y-auto border border-slate-200 px-4 rounded-md">
                <li v-if="post.comments.length == 0" class="text-slate-600 text-sm my-3">No existen comentarios en la publicación todavía...</li>
                <li v-for="comment in post.comments || []" :key="comment.id" class="text-slate-600 text-sm my-3">
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
                    <input type="text" id="user_comment"
                        class="px-4 py-1 border border-slate-300 rounded-md w-10/12 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                        v-model="post.commentsModel.user_comment" placeholder="Ingresar comentario...">
                    <button
                        class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 transition-colors duration-200"
                        >{{!loading ? 'Comentar' : 'Enviando...'}}</button>
                </div>
                <!-- Mensaje de error -->
                <div v-if="errorMessage" class="text-red-500 ml-4">
                    {{ errorMessage }}
                </div>
            </form>
        </div>
    </article>
</template>