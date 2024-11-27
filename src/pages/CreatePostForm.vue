<script setup>
import { onMounted, ref } from 'vue'
import {savePulicPost, subscribeToPublicPosts} from '../services/public-posts'
import {useRouter} from 'vue-router'

const router = useRouter()

// dentro de esta variable vamos a guardar todos los registros (osea todos los posteos) de la base de datos
const posts = ref([])
/* Ejemplo de cómo quedarían los datos dentro
const posts = ref(
    [
        {
            book_title: 'libro numero 1',
            review: 'este libro es muy bueno',
            user_name: 'kirmoderico'
        },
        {
            book_title: 'libro numero 2',
            review: 'este libro es muy malo',
            user_name: 'iulianomirko'
        },
    ]
)
*/

// esta variable va a capturar los datos de los inputs
const newPost = ref({
    book_title: '',
    review: '',
})

function handleSubmit(){
    console.log("Se envió el formulario de posteo nuevo")

    // llamamos a la función "savePulicPost()" de nuestro archivo [public-post.js] para guardar la publicación en la Firestore
    savePulicPost({
        ...newPost.value, // le pasamos a esta función un objeto con todos los valores de la variable newPost 
    })
    

    // cuando termina todo el proceso de guardar el nuevo posteo borramos los dos campos
    newPost.value.book_title = '';
    newPost.value.review = '';

    router.push('/publicaciones')
}

</script>

<template>
    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Nuevo Posteo</h2>
    <form 
    action="#" 
    @submit.prevent="handleSubmit"
    class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8"
    >

        <div class="mb-5">
            <label for="book_title" class="block mb-2 text-lg font-semibold text-slate-700">Título del Libro</label>
            <input 
                type="text" 
                id="book_title"
                class="px-4 py-2 border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Escribe el título del libro que deseas reseñar"
                v-model="newPost.book_title"
            >
        </div>

        <div class="mb-5">
            <label for="review" class="block mb-2 text-lg font-semibold text-slate-700">Reseña</label>
            <textarea 
                id="review"
                class="px-4 py-2 border border-slate-300 rounded-md w-full h-32 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Comparte tu opinión sobre el libro..."
                v-model="newPost.review"
            ></textarea>
        </div>

        <button class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 transition-colors duration-200">Postear</button>
    </form>



</template>