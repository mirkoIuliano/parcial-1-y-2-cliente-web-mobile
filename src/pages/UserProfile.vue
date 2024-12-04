<script setup>
import { useRoute, useRouter } from 'vue-router';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../compossables/useUser';
import PostCard from '../components/posts/PostCard.vue';
import { useLoggedUser } from '../compossables/useLoggedUser';
import { getPostsByUserId, subscribeToComments } from '../services/public-posts';
import { onMounted, ref } from 'vue';
import { getDisplayNameByUserId } from '../services/user-profile';
import BaseHeading from '../components/BaseHeading.vue';
import NoPostsYet from '/imgs/no-posts-yet.png'

const route = useRoute()
const router = useRouter()

const posts = ref([])

const { loggedUser } = useLoggedUser()

const { user, loading } = useUser(route.params.id) // con useUser conseguimos los datos del usuario especificado por el route.params.id

onMounted(() => {

    // si entramos al perfil del usuario autenticado lo reenviamos a su perfil (/mi-perfil). No tiene sentido que el propio usuario pueda entrar al UserProfile de él mismo
    if (route.params.id == loggedUser.value.id) {
        router.push('/mi-perfil')
        return console.log("son la misma perosna")
    }

    loading.value = true

    // a la función getPostsByUserId tenemos que pasarle el id del usuario y una función callback
    getPostsByUserId(route.params.id, async (userPosts) => { // userPosts es el resultado de getPostsByUserId()

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
    })}
) 

</script>

<template>
    <BaseHeading v-if="loading">Perfil de cargando...</BaseHeading>
    <BaseHeading v-else>Perfil de {{ user.displayName || user.email }}</BaseHeading>
    
    <div class="flex flex-col mb-8 border-b-2 w-[80%] m-auto pb-8">
        <ProfileData :user="user"/>
        
        <div class="m-auto mt-4">
            <!-- link para ir a conversación privado con este usuario -->
            <router-link 
                :to="`/usuario/${user.id}/chat`"
                class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
            > Conversación Privada con {{ user.displayName || user.email }}
            </router-link>
        </div>
    </div>

    <BaseHeading>Posteos</BaseHeading>

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
        v-if="posts"
        v-for="post in posts" 
        :post="post" 
        :loggedUser="loggedUser"
    />
</template>