<script setup>
import { onMounted, ref } from 'vue';
import {savePulicPost, subscribeToPublicPosts, addCommentToPost} from '../services/public-posts'
import { useRouter } from 'vue-router';
import { auth } from '../services/firebase';


// dentro de esta variable vamos a guardar todos los registros (osea todos los posteos) de la base de datos
const posts = ref([])
/* Ejemplo de cómo quedarían los datos dentro 
const posts = ref(
    [
        {
            book_title: 'libro numero 1',
            review: 'este libro es muy bueno',
            user_name: 'kirmoderico'
        },
        {
            book_title: 'libro numero 2',
            review: 'este libro es muy malo',
            user_name: 'iulianomirko'
        },
    ]
) */

const newComment = ref({
    user_name: "",
    user_comment: "",
})

const router = useRouter(); 

async function handleComment (id, user_comment )
{
    // uso auth.currentUser para saber si hay o no un usuario autenticado 
    if (auth.currentUser){
        await addCommentToPost( id, 
            {
                user_comment 
            }
        )
    } else {
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    }


    // una vez terminado se borran los campos
    // newComment.value.user_name = ""
    // newComment.value.user_comment = ""

    // FIJARME DESPUÉS EN CASA
     // Limpiamos los campos de comentario solo para el post correspondiente
    const post = posts.value.find(post => post.id === id);
    post.commentsModel.user_name = "";
    post.commentsModel.user_comment = "";
}

// Cuando se monte el componente leemos los posteos de Firestore
onMounted(async() => {


    // llamamos a la función "subscribeToPublicPosts()" que sirve para recibir todos posteos de la base de datos
    // subscribeToPublicPosts(newPosts => posts.value = newPosts) // a subscribeToPublicPosts() hay que pasarle como parámetro una función callback

    subscribeToPublicPosts(newPosts => {
        // Añadir un modelo de comentarios independiente para cada post
        posts.value = newPosts.map(post => ({
            ...post,
            commentsModel: {
                user_name: "",
                user_comment: ""
            }
        }));
    });
}) 

</script>

<template>

    <h2 class="text-3xl text-center text-slate-800 font-bold my-6">Posteos de la comunidad</h2>

    <router-link 
        to="/publicaciones/crear-publicacion" 
        class="
            bg-white
            text-slate-800 font-semibold text-xl hover:text-blue-600
            border-2 rounded-lg border-slate-800 hover:border-blue-600
            block mr-16 w-max px-4 py-2 transition-colors duration-200
            fixed bottom-10 right-0
        "
            
    > 
        Crear publicación
    </router-link>

    <section>

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
                        <!-- <label for="user_name" class="block sr-only">Usuario</label>
                        <input 
                            type="text" 
                            for="user_name"
                            class="px-4 py-1 border border-slate-300 rounded-md w-2/12 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                            v-model="post.commentsModel.user_name"
                            placeholder="@user_name"
                        > -->
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

            <!--  -->

            

        </article>

    </section>
</template>
