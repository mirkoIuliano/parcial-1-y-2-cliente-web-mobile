<script setup>
import { onMounted, ref } from 'vue'
import { getPostsByUserId } from '../services/public-posts'
import { getDisplayNameByUserId } from '../services/user-profile'
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
                const resolvedComments  = await Promise.all( // en resolvedComments se va a guardar todos los comentarios del posteo, pero con el user_name puesto dinámicamente
                    userPost.comments.map(async (comment) => { // como comments es un array tenemos que hacer un map de comments
                        const displayName = await getDisplayNameByUserId(comment.comment_user_id) // a getDisplayNameByUserId() le enviamos el id del user que comentó para traer el user_name dinámicamente
                        return { // retorna un objeto
                            ...comment, // con todo el contenido que tenía comment (osea el comment_user_id y el user_comment)
                            user_name: displayName, // y le agregamos user_name, que va a ser el displayName traído dinámicamente
                        }
                    })
                )
                // una vez terminado el userPost.comments.map(), hacemos el return de userPosts.map()
                return { // retornamos un objeto con:
                    ...userPost, // todo lo que ya tenía el documento del posteo
                    comments: resolvedComments, // comments lo igualamos a resolvedComments, que son los mismos comments, pero con user_name
                    commentsModel: { // y le agregamos un objeto commentsModel, que va a servir para la caja de comentarios nuevos
                        user_comment: ""
                    }
                }
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