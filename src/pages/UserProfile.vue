<script setup>
import { useRoute, useRouter } from 'vue-router';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../composables/useUser';
import PostCard from '../components/posts/PostCard.vue';
import { useLoggedUser } from '../composables/useLoggedUser';
import { getPostsByUserId, subscribeToComments } from '../services/public-posts';
import { onMounted, ref } from 'vue';
import BaseHeading from '../components/BaseHeading.vue';
import NoPostsYet from '/imgs/no-posts-yet.png'

const route = useRoute()
const router = useRouter()

const posts = ref([])

const { loggedUser } = useLoggedUser()

const { user, loading } = useUser(route.params.id) // con useUser conseguimos los datos del usuario especificado por el route.params.id

const fetchUserProfile = async (userId) => {
    loading.value = true

    // si entramos al perfil del usuario autenticado lo reenviamos a su perfil (/mi-perfil). No tiene sentido que el propio usuario pueda entrar al UserProfile de él mismo
    if (userId == loggedUser.value.id) {
        router.push('/mi-perfil')
        return console.log("son la misma perosna")
    }

    // traemos todos los posteos del usuario con getPostsByUserId
    posts.value = await getPostsByUserId(userId) // guardamos en el el array posts[] todas las publicaciones del usuario

    if (posts.value == null) {
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

} 

onMounted(async () => {
    fetchUserProfile(route.params.id)
}) 

</script>

<template>
    <p class="text-4xl text-center text-cyan-950 font-bold mb-10 mt-6" v-if="loading">Perfil de cargando...</p>
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

    <article v-if="posts === null && !loading"  class="flex items-center justify-center mb-12">
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
        v-if="posts"
        v-for="post in posts" 
        :post="post" 
        :loggedUser="loggedUser"
    />
</template>