<script setup>
import { onMounted, ref } from 'vue'
import { getPostsByUserId, subscribeToComments } from '../services/public-posts'
import ProfileData from '../components/profile/ProfileData.vue'
import PostCard from '../components/posts/PostCard.vue'
import { useLoggedUser } from '../compossables/useLoggedUser'
import BaseHeading from '../components/BaseHeading.vue'
import NoPostsYet from '/imgs/no-posts-yet.png'

// creamos una variable 'loggedUser', que guarde el resultado de la función componible useLoggedUser() de compossables 
const { loggedUser } = useLoggedUser()

const loading = ref(true)

const posts = ref([])

onMounted(() => {

    getPostsByUserId(loggedUser.value.id ,async (userPosts) => { // userPosts es el resultado de getPostsByUserId()

        // al array posts le vamos a agregar lo siguiente
        posts.value = await Promise.all(

            userPosts.map(async (userPost) => { // hacemos un map de userPosts y ahora 'userPost' va a representar a cada uno de los docuemntos del usuario

                // creo comments y lo inicializo como un array vacío
                userPost.comments = []

                // creo commentsModel, que va a servir para que el input de comentarios sea independiente para cada publicación 
                userPost.commentsModel = { 
                    user_comment: "" // campo para capturar el comentario del usuario
                }

                // creo una promesa 'loadComments' para esperar a que los comentarios se cargue durante la suscripción
                const loadComments = new Promise((resolve) => {
                    // usamos subscribeToComments() para suscribirnos a la subcolección comments, osea a los comentarios de este post. A esta función le tenemos que pasar el id del post y un callback
                    subscribeToComments(userPost.id, (newComments) => {
                        userPost.comments = [...newComments] // agregamos el contenido de newComments en userPost.comments
                        resolve()
                        /* 
                        resolve() es una función de las promesas de JS y sirve para completar la promesa. Indicia que la función asincrónica terminó
                        en mi codigo la uso para asegurarme de que se carguen los comentarios
                        sin esto cuando carga el DOM no aparece ningún comentario hasta que haga un cambio en el input
                        */
                    })
                })
                await loadComments
                return userPost
            })
        )
        loading.value = false
    })
}) 

</script>

<template>
    <BaseHeading>Mi Perfil</BaseHeading>
    <div class="flex flex-col mb-8 border-b-2 w-[80%] m-auto pb-8">
        <div class="flex items-end gap-12 m-auto">
            <router-link 
                to="/mi-perfil/editar"
                class=" mb-4 py-1 px-3 rounded-md font-medium bg-gray-100 hover:bg-gray-300 transition-colors "
            > Editar perfil </router-link>

            <router-link 
                to="/mi-perfil/editar/foto"
                class=" mb-4 py-1 px-3 rounded-md font-medium bg-gray-100 hover:bg-gray-300 transition-colors "
            > Editar foto </router-link>
        </div>

        <ProfileData :user="loggedUser"/>
    </div>

    <BaseHeading class="mb-10">Mis posteos</BaseHeading>

    <p v-if="loading" class="text-2xl text-slate-700 text-center mt-14">Cargando posteos...</p>

    <article class="flex items-center justify-center mb-12">
        <div v-if="posts.length === 0 && !loading" class="flex flex-col items-center gap-8 mb-8">
            <p class="text-center text-slate-500 text-2xl">Todavía no existen posteos...</p>
            <div>
                <img :src="NoPostsYet" class="w-60 h-60">
            </div>
        </div>
    </article>

    <PostCard 
        v-for="post in posts"
        :key="post.id" 
        :post="post"
        :loggedUser="loggedUser"
    />

</template>