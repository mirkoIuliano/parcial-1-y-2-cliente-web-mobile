<!-- 

-->
<script setup>
import { useRoute } from 'vue-router';
import ProfileData from '../components/profile/ProfileData.vue';
import { useUser } from '../compossables/useUser';
import PostCard from '../components/posts/PostCard.vue';
import { useLoggedUser } from '../compossables/useLoggedUser';
import { getPostsByUserId } from '../services/public-posts';
import { onMounted, ref } from 'vue';
import { getDisplayNameByUserId } from '../services/user-profile';

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
    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Perfil de {{ user.displayName || user.email }}</h2>
    <ProfileData :user="user"/>
    <!-- link para ir a conversación privado con este usuario -->
    <router-link 
        :to="`/usuario/${user.id}/chat`"
        class="mr-4 font-semibold text-blue-800 hover:text-blue-600 transition-colors duration-200"
    > Conversación Privada con {{ user.displayName || user.email }}
    </router-link>

    <p class="text-center" v-if="loading">Cargando posteos...</p>
    <PostCard
        v-if="posts"
        v-for="post in posts" 
        :post="post" 
        :loggedUser="loggedUser"
    />
    <p class="text-center" v-if="!loading && posts == false">No existen posteos de este usuario</p>
</template>