<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeToAuthChanges } from '../services/auth';
import { addCommentToPost, getPostsByUserId } from '../services/public-posts';
import { auth } from '../services/firebase';
import { getDisplayNameByUserId } from '../services/user-profile';

// creamos "unsubscribeFromAuth" y la definimos como una función vacía (porque después vamos a igual "unsubscribeFromAuth" a una función)
let unsubscribeFromAuth = () => {}

const loggedUser = ref({
    id: null,
    email: null,
    displayName: null,
    bio: null,
})

const posts = ref([])

onMounted(() => {
    // cuando se monte queremos llamar al subscribeToAuthChanges
    unsubscribeFromAuth = subscribeToAuthChanges(newUserData => loggedUser.value = newUserData)
    // subscribeToAuthChanges retorna como resultado una función para cancelar la suscripción. Esta función se va a guardar en unsubscribeFromAuth, osea que dentro de unsubscribeFromAuth va a tener la función para desuscrirse 

    getPostsByUserId(async (userPosts) => {
        // al array posts le vamos a agregar lo siguiente
        posts.value = await Promise.all(
            userPosts.map(async (userPost) => {
                const resolvedComments  = await Promise.all(
                    userPost.comments.map(async (comment) => {
                        const displayName = await getDisplayNameByUserId(comment.comment_user_id)
                        return{
                            ...comment,
                            user_name: displayName,
                        }
                    })
                )
                return {
                    ...userPost,
                    comments: resolvedComments,
                    commentsModel: {
                        user_comment: ""
                    }
                }
            })
        )
    })
}) 

async function handleComment (id, user_comment )
{
    // uso auth.currentUser para saber si hay o no un usuario autenticado 
    if (auth.currentUser){
        await addCommentToPost( id, 
        {
            user_comment,
            comment_user_id: auth.currentUser.uid
        }
    )
} else {
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    }

     // Limpiamos los campos de comentario solo para el post correspondiente
    const post = posts.value.find(post => post.id === id);
    post.commentsModel.user_comment = "";
}

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
    </div>

    <div class="mb-4">{{ loggedUser.bio || "Acá va mi biografía..." }}</div>
    
    <dl>
        <dt class="font-bold">Email</dt>
        <dd class="mb-3">{{ loggedUser.email }}</dd>
        <dt class="font-bold">Nombre de Usuario</dt>
        <dd class="mb-3">{{ loggedUser.displayName || "No especificado..." }}</dd>
    </dl>
    <!-- 
        La idea es que queremos que de cada usuario pueda especificar, a parte del email, un nombre de usuario, una biografía y una carreara. Como displayName, bio y career son datos opcionales le ponemos un default por si este dato no existe  
    -->

    <!-- Posts creados por el usuario -->
    <article v-for="post in posts" class="w-2/4 border border-slate-300 p-8 rounded-lg shadow-lg bg-white m-auto my-8">

    <div class="mb-3 flex items-center justify-between">
        <div>
            <h3 class="text-2xl font-semibold text-slate-800">{{post.book_title}}</h3>
            <p class="text-sm font-semibold text-slate-400 p-0 m-0">Publicado el DD/MM/YYYY</p>
        </div>
        <p class="mr-4 font-semibold text-slate-500">@{{post.user_name}}</p>
    </div>

    <div class="mb-5">
        <p>{{post.review}}</p>
    </div>

    <!-- Comentarios -->
    <div class="mb-5">
        <h4 class="font-semibold text-base text-slate-800">Comentarios:</h4>
        <ul>
            <li v-for="comment in post.comments || []" class="text-slate-600 text-sm mt-2" >
                <strong>@{{ comment.user_name }}:</strong> {{ comment.user_comment }}
            </li>
        </ul>
        
        <form action="#" @submit.prevent="handleComment(post.id, post.commentsModel.user_comment)">
            <div class="mt-5">
                <label for="user_comment" class="block sr-only">Comentar</label>
                <input 
                    type="text" 
                    for="user_comment"
                    class="px-4 py-1 border border-slate-300 rounded-md w-10/12 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                    v-model="post.commentsModel.user_comment"
                    placeholder="Ingresar comentario..."
                >
                <button class="ml-2 bg-slate-800 text-white px-4 py-1 rounded-md font-medium text-base hover:bg-slate-700 transition-colors duration-200">Comentar</button>
            </div>
        </form>
    </div>
    </article>

</template>