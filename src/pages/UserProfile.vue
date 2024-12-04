<script setup>
import { useRoute } from 'vue-router';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../compossables/useUser';
import PostCard from '../components/posts/PostCard.vue';
import { useLoggedUser } from '../compossables/useLoggedUser';
import { getPostsByUserId } from '../services/public-posts';
import { onMounted, ref } from 'vue';
import { getDisplayNameByUserId } from '../services/user-profile';
import BaseHeading from '../components/BaseHeading.vue';
import NoPostsYet from '/imgs/no-posts-yet.png'

const route = useRoute()

const posts = ref([])

const { loggedUser } = useLoggedUser()

const id = route.params.id

const { user, loading } = useUser(id) // con useUser conseguimos los datos del usuario especificado por el id

onMounted(() => {
    loading.value = true

    // a la función getPostsByUserId tenemos que pasarle el id del usuario y una función callback
    getPostsByUserId(id, async (userPosts) => { // userPosts es el resultado de getPostsByUserId()
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
    })}
) 

</script>

<template>
    <BaseHeading>Perfil de {{ user.displayName || user.email }}</BaseHeading>
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