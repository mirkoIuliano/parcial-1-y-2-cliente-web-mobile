<script setup>
import { onMounted, ref } from 'vue'
import { subscribeToComments, subscribeToPublicPosts } from '../services/public-posts'
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
    // llamamos a la función "subscribeToPublicPosts()" que sirve para recibir todos los posteos de la base de datos
    subscribeToPublicPosts( async (newPosts) => { // newPosts es una lista con todas las publicaciones
        
        // al array 'posts' le vamos a agregar lo siguiente:
        posts.value = await Promise.all( 
            
            newPosts.map(async (post) => { // hacemos un .map() de la lista de publicaciones que nos llega por subscribeToPublicPosts()

                // creo comments y lo inicializo como un array vacío
                post.comments = []

                // creo commentsModel, que va a servir para que el input de comentarios se independiente para cada publicación 
                post.commentsModel = {
                    user_comment: "", // Campo para capturar el comentario del usuario
                }

                // creo una promesa 'loadComments' para esperar a que los comentarios se cargue durante la suscripción
                const loadComments = new Promise((resolve) => {
                    // usamos subscribeToComments() para suscribirnos a la subcolección comments, osea a los comentarios de este post. A esta función le tenemos que pasar el id del post y un callback
                    subscribeToComments(post.id, (newComments) => {
                        post.comments = [...newComments] // agregamos el contenido de newComments en post.vomments
                        resolve()
                        /* 
                        resolve() es una función de las promesas de JS y sirve para completar la promesa. Indicia que la función asincrónica terminó
                        en mi codigo la uso para asegurarme de que se carguen los comentarios
                        sin esto cuando carga el DOM no aparece ningún comentario hasta que haga un cambio en el input
                        */
                    })
                })

                

                await loadComments
                return post
            })
        )
        loading.value = false
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
