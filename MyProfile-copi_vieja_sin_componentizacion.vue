<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { subscribeToAuthChanges } from '../services/auth';
import { addCommentToPost, getPostsByUserId } from '../services/public-posts';
import { auth } from '../services/firebase';
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

const loading = ref(false)

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

async function handleComment (postId, user_comment )
{
    // Preguntamos que si ya está cargando, que no haga nada. Esto lo hacemos para que si se cliquea el btn no lo puedan volver a cliquear varias veces seguidas
    if(loading.value) return; // Si sigue cargando y apretan los manda al return de una así no se hacen muchas peticiones al pepe

    console.log("mandando comentario")

    loading.value = true

    // uso auth.currentUser para saber si hay o no un usuario autenticado 
    if (auth.currentUser){ // si el usuario que quiere comentar está autenticado:
        await addCommentToPost( postId, // llamos a la función addCommentToPost de [public-posts.js]. Como primer parámetro le enviamos el id del documento (osea el id del posteo al que el comentario pertenece)
        { // como segundo parámetro un objeto con los datos del comentario
            user_comment, // el contenido del comentario
            comment_user_id: auth.currentUser.uid // el uid del usuario autenticado que lo hizp
        }
    )
} else {
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    }

    loading.value = false

     // Limpiamos los campos de comentario solo para el post correspondiente
    const post = posts.value.find(post => post.id === postId);
    post.commentsModel.user_comment = "";
}

onUnmounted(() => {
    // Cuando se desmonte vamos a cancelar la suscripción
    unsubscribeFromAuth()
})

</script>

<template>

    <ProfileData :user="loggedUser"/>

    <PostCard
        :key="posts.id" 
        :posts="posts" 
        :handleComment="handleComment" 
    />

</template>