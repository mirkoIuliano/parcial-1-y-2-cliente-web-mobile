<script setup>
import { onMounted, ref } from 'vue'
import BaseHeading from '../components/BaseHeading.vue'
import { useLoggedUser } from '../compossables/useLoggedUser'
import { useRoute, useRouter } from 'vue-router'
import { getPostById, editMyPost } from '../services/public-posts'

// creamos una variable 'loggedUser', que guarde el resultado de la función componible useLoggedUser()
const { loggedUser } = useLoggedUser()

// dentro de esta variable vamos a guardar todos los registros (osea todos los posteos) de la base de datos
let post = ref[[]]

const loading = ref(false)

const router = useRouter()

const route = useRoute()

const postId = route.params.id

const editPost = ref({
    book_title: "Cargando el titutlo del libro...",
    review: "Cargando reseña...",
})

// el mensaje de error va a estar en la siguiente variable
const errorMessage = ref('')

// el mensaje de exito se va a estar en la siguiente variable
const successMessage = ref("")

onMounted(async () => {

    post = await getPostById(postId)

    // si el id del usuario autenticado no es el mismo que el del usuario que creó el posteo te redirecciona a publicaciones
    if(loggedUser.value.id != post.user_id) {
        alert ("No puedes editar un posteo que haya hecho otro usuario", loggedUser.id, post.user_id)
        return router.push('/publicaciones')
    }

    // editPost.value ahora va a tener los datos del post que acabo de traer
    editPost.value = post
})

const handleSubmit = async () => {

    successMessage.value = ""

    /*---------- Validaciones ----------*/
    if (editPost.value.book_title.length == 0) {
        return errorMessage.value = "Es obligatorio poner el título del libro"
    }

    if (editPost.value.book_title.length < 5) {
        return errorMessage.value = "El título debe tener por lo menos 5 caracteres"
    }

    if (editPost.value.book_title.length > 100) {
        return errorMessage.value = "El título puede tener como máximo 100 caracteres"
    }

    if (editPost.value.review.length == 0) {
        return errorMessage.value = "Es obligatorio escribir una reseña para el posteo"
    }

    if (editPost.value.review.length < 200) {
        return errorMessage.value = "La reseña debe tener por lo menos 200 caracteres"
    }
    
    if (editPost.value.review.length > 2000) {
        return errorMessage.value = "La reseña puede tener como máximo 2000 caracteres"
    }
    /*---------- Fin de validaciones ----------*/

    // Preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return // Si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe

    loading.value = true

    try {
        await editMyPost(postId, {
            book_title: editPost.value.book_title,
            review: editPost.value.review,
        }) // llamamos a la función editPost y le pasamos un objeto con la copia de los datos que queremos editar
    } catch (error) {
        console.error("Ocurrió un error al intentar editar el posteo", error)
    }

    successMessage.value = "¡La publicación fue actualizada con éxito!"
    errorMessage.value = ""
    // cuando termine ponemos el loading en false de vuelta
    loading.value = false


}

</script>

<template>

    <BaseHeading>Editar Publicación</BaseHeading>

    <section>
        <form 
            action="#" 
            @submit.prevent="handleSubmit"
            class="w-2/4 min-w-[500px] border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8"
        >

        <div class="mb-5">
            <label for="book_title" class="block mb-2 text-lg font-semibold text-slate-700">Título del Libro</label>
            <input 
                type="text" 
                id="book_title"
                class="px-4 py-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Escribe el título del libro que deseas reseñar"
                v-model="editPost.book_title"
            >
        </div>

        <div class="mb-5">
            <label for="review" class="block mb-2 text-lg font-semibold text-slate-700">Reseña</label>
            <textarea 
                id="review"
                class="px-4 py-2 border border-slate-300 rounded-md w-full h-56 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Comparte tu opinión sobre el libro..."
                v-model="editPost.review"
            ></textarea>
        </div>

        <!-- Mensaje de error y de éxito -->
        <div v-if="errorMessage" class="text-red-500 mb-4">
            {{ errorMessage }}
        </div>
        <div v-if="successMessage" class="text-green-600 font-medium mb-4">
            {{ successMessage }}
        </div>

        <button class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200">{{ loading ? 'Actualizando...' : 'Guardar Cambios' }}</button>
    </form>
    </section>

</template>