<script setup>
import { onMounted, ref } from 'vue'
import { getPublicPosts, subscribeToComments } from '../services/public-posts'
import PostCard from '../components/posts/PostCard.vue'
import { useLoggedUser } from '../compossables/useLoggedUser'
import NoPostsYet from '/imgs/no-posts-yet.png'
import BaseHeading from '../components/BaseHeading.vue'

// creamos una variable 'loggedUser', que guarde el resultado de la función componible useLoggedUser()
const { loggedUser } = useLoggedUser()

// dentro de esta variable vamos a guardar todos los registros (osea todos los posteos) de la base de datos
const posts = ref([])

const loading = ref(true)

// Cuando se monte el componente leemos los posteos de Firestore
onMounted( async () => {
    // cuando monte el componente traemos todos los posteos con getPublicPosts() y los guardamos en el array posts
    posts.value = await getPublicPosts()
    loading.value = false

    // recorremos el array posts con un forEach
    posts.value.forEach((post) => {  
        // en cada post nos suscribimos a los comentarios para poder ver los cometnarios nuevos cuando se actualizan  
        subscribeToComments( post.id, // el primer parámetro es el id del documento del posteo 
            // el segundo parámetro es la función callback
            (newComments) => { // newComments son los comentarios del posteo con el displayName dinámico 
                post.comments = newComments // hacemos que post.comments (que lo definimos como un array en getPublicPosts) tenga objetos que representen cada uno, un comentario el user_name transformado y el contenido
            }
        )
    })
}) 

</script>

<template>

    <BaseHeading>Posteos de la comunidad</BaseHeading>

    <router-link 
        to="/publicaciones/crear-publicacion" 
        class="
            bg-white
            text-slate-800 font-semibold text-xl hover:text-cyan-700
            border-2 rounded-lg border-cyan-950 hover:border-cyan-700
            block mr-16 w-max px-4 py-2 transition-colors duration-200
            fixed bottom-10 right-0
        "
    > Crear publicación </router-link>

    <section>

        <p v-if="loading" class="text-2xl text-slate-700 text-center mt-14">Cargando posteos...</p>

        <article class="min-h-[60%] flex items-center justify-center">
            <div v-if="posts.length === 0 && !loading" class="flex flex-col items-center gap-8 mb-8">
                <p class="text-center text-slate-500 text-2xl">Todavía no existen posteos...</p>
                <div>
                    <img :src="NoPostsYet" class="w-60 h-60">
                </div>
                <div class="flex flex-col items-center gap-4">
                    <p class="text-slate-700 font-bold text-2xl">¡Crea el primer posteo!</p>
                    <router-link 
                        to="/publicaciones/crear-publicacion" 
                        class="px-6 py-3 bg-cyan-800 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-cyan-700 transition-all duration-300"
                    > Crear </router-link>
                </div>
            </div>
        </article>


        <PostCard 
            v-for="post in posts"
            :key="post.id" 
            :post="post"
            :loggedUser="loggedUser"
        />
    </section>
</template>
