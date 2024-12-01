<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeToAuthChanges } from '../services/auth';
import { getPostsByUserId } from '../services/public-posts';
import { getDisplayNameByUserId } from '../services/user-profile';
import ProfileData from '../components/ProfileData.vue';
import PostCard from '../components/PostCard.vue';

// creamos "unsubscribeFromAuth()" y la definimos como una función vacía. Esto lo hacemos porque después vamos a guardar en ella una función para desuscribirnos de los cambio de autenticación
let unsubscribeFromAuth = () => {} 

const loggedUser = ref({
    id: null,
    email: null,
    displayName: null,
    photoURL: null,
    bio: null,
})

const posts = ref([])

onMounted(() => {
    // cuando se monte queremos llamar al subscribeToAuthChanges
    unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData) // le pasamos un callback como parámetro. Como resultado vamos a recibir newUserData e igualamos loggedUser con este newUserData
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse ==> lo vamos a usar para que cuando desmontemos el componente se desuscriba

    getPostsByUserId(async (userPosts) => { // userPosts es el resultado de getPostsByUserId()
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
    })
}) 

onUnmounted(() => {
    // Cuando se desmonte vamos a cancelar la suscripción
    unsubscribeFromAuth()
})

</script>

<template>
    <div class="flex items-end gap-4">
        <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Mi Perfil</h2>
        <router-link 
            to="/mi-perfil/editar"
            class="mb-4 text-blue-700 underline"
        >Editar</router-link>
        <router-link 
            to="/mi-perfil/editar/foto"
            class="mb-4 text-blue-700 underline"
        >Editar foto</router-link>
    </div>
    <ProfileData :user="loggedUser"/>

    <PostCard 
        v-for="post in posts"
        :key="post.id" 
        :post="post"
        :loggedUser="loggedUser"
    />

</template>