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

const loading = ref(false)

const posts = ref([])

onMounted(async () => {

    loading.value = true

    // traemos todos los posteos del usuario con getPostsByUserId
    posts.value = await getPostsByUserId(loggedUser.value.id) // guardamos en el el array posts[] todas las publicaciones del usuario

    if (posts.value == null) {
        loading.value = false
        return console.log("no tiene posteos")
    }

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

    loading.value = false

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

    <article v-if="posts === null && !loading" class="flex items-center justify-center mb-12">
        <div class="flex flex-col items-center gap-8 mb-8">
            <p class="text-center text-slate-500 text-2xl">Todavía no existen posteos...</p>
            <div>
                <img 
                    :src="NoPostsYet" 
                    class="w-60 h-60"
                    alt="Imagen por defecto que simboliza que no hay ningún posteo creado"
                >
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