<script setup>
import { computed, ref } from 'vue'
import {savePulicPost} from '../services/public-posts'
import { useRouter } from 'vue-router'
import BaseHeading from '../components/BaseHeading.vue'

const router = useRouter()

// esta variable va a capturar los datos de los inputs
const newPost = ref({
    book_title: '',
    review: '',
    post_image: null,
})

// el mensaje de error va a estar en la siguiente variable
const errorMessage = ref('')

// contador de caracteres. Usamos computed que sirve para crear propiedades copmputadas, que son valores derivados basados en otros datos reactivos. computed() permite definir una función que devuelve un valor derivado. Vue automáticamente recalcula ese valor cuando detecta que alguna de las dependencias usadas en la función ha cambiado
const characterCounter = computed(() => newPost.value.review.length)

function handleFileSelection(ev){
    // guardamos en post_image el archivo seleccionado
    newPost.value.post_image = ev.target.files[0]
}

function handleSubmit(){

    /*---------- Validaciones ----------*/
    if (newPost.value.book_title.length == 0) {
        return errorMessage.value = "Es obligatorio poner el título del libro"
    }

    if (newPost.value.book_title.length < 5) {
        return errorMessage.value = "El título debe tener por lo menos 5 caracteres"
    }

    if (newPost.value.book_title.length > 100) {
        return errorMessage.value = "El título puede tener como máximo 100 caracteres"
    }

    if (newPost.value.review.length == 0) {
        return errorMessage.value = "Es obligatorio escribir una reseña para el posteo"
    }

    if (newPost.value.review.length < 200) {
        return errorMessage.value = "La reseña debe tener por lo menos 200 caracteres"
    }
    
    if (newPost.value.review.length > 2000) {
        return errorMessage.value = "La reseña puede tener como máximo 2000 caracteres"
    }
    // TODO: validaciones de archivo (que sea imagen, cuan pesado es, etc)
    /*---------- Fin de validaciones ----------*/

    console.log("Se envió el formulario de posteo nuevo")

    // llamamos a la función "savePulicPost()" de nuestro archivo [public-post.js] para guardar la publicación en la Firestore
    savePulicPost({
        ...newPost.value, // le pasamos a esta función un objeto con todos los valores de la variable newPost 
    })
    
    // cuando termina todo el proceso de guardar el nuevo posteo borramos los dos campos
    newPost.value.book_title = ''
    newPost.value.review = ''

    router.push('/publicaciones')
}

</script>

<template>
    <BaseHeading>Nuevo Posteo</BaseHeading>
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
                v-model="newPost.book_title"
            >
        </div>

        <div class="mb-5">
            <label for="post_image" class="block mb-2 text-lg font-semibold text-slate-700">Imagen de referencia del libro (opcional)</label>
            <input 
                type="file"
                id="post_image" 
                class="block w-full px-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500" 
                @change="handleFileSelection"
            >
        </div>

        

        <div class="mb-5">
            <div class="flex flex-row-reverse items-center justify-between mb-2">
                <div class="mr-4 text-sm">
                    <p :class="{
                        'text-red-500 font-semibold': characterCounter < 200 || characterCounter > 2000,
                        'text-green-500 font-semibold': characterCounter >= 200 && characterCounter <= 2000
                    }">
                        Caracteres: {{ characterCounter }}
                    </p>
                </div>
                <div>
                    <label for="review" class="block text-lg font-semibold text-slate-700">Reseña</label>
                    <p class="text-sm text-slate-500">(mínimo 200 caracteres y máximo 2000)</p>
                </div>
            </div>
            <textarea 
                id="review"
                class="px-4 py-2 border border-slate-300 rounded-md w-full h-56 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                placeholder="Comparte tu opinión sobre el libro..."
                v-model="newPost.review"
            ></textarea>
        </div>

        <!-- Mensaje de error -->
        <div v-if="errorMessage" class="text-red-500 mb-4">
            {{ errorMessage }}
        </div>

        <button class="w-full bg-slate-800 text-white py-2 px-4 rounded-md font-medium text-lg hover:bg-slate-700 focus:bg-slate-700 transition-colors duration-200">Postear</button>
    </form>



</template>