<script setup>
import { onMounted, ref } from 'vue'
import { subscribeToPublicPosts } from '../services/public-posts'
import { getDisplayNameByUserId } from '../services/user-profile'
import PostCard from '../components/posts/PostCard.vue'
import { useLoggedUser } from '../compossables/useLoggedUser'
import NoPostsYet from '/imgs/no-posts-yet.png'
import BaseHeading from '../components/BaseHeading.vue'

// creamos una variable 'loggedUser', que guarde el resultado de la función componible useLoggedUser()
const { loggedUser } = useLoggedUser()

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

const loading = ref(true)

// Cuando se monte el componente leemos los posteos de Firestore
onMounted( async () => {
    // llamamos a la función "subscribeToPublicPosts()" que sirve para recibir todos los posteos de la base de datos
    subscribeToPublicPosts( async (newPosts) => { // newPosts es una lista con todas las publicaciones
        
        // al array 'posts' le vamos a agregar lo siguiente:
        posts.value = await Promise.all( 
            
            newPosts.map(async (post) => { // hacemos un .map() de la lista de publicaciones que nos llega por subscribeToPublicPosts()
                const resolvedComments  = await Promise.all( // creamos una const "resolvedComments" que va a contenter todos los comentarios ya existentes del documento, pero con el user_name adecuado
                    post.comments.map(async (comment) => { // post (que sería uno de los docuemntos de 'newPosts') tiene un atributo comments, que es un array de comentarios. Vamos a hacer un .map() de este array y a cada comentario vamos a ponerle un user_name usando getDisplayNameByUserId()

                        const displayName = await getDisplayNameByUserId(comment.comment_user_id) // con getDisplayNameByUserId() hacemos que el user_name sea dinámico. Si guardasemos el atributo user_name al hacer el comentario, éste quedaría siempre igual y si el usuario que hizo el comentario cambia su user_name en el comentario seguiría apareciendo el user_name viejo
                        // Dentro de comments[] está el contenido del comentario (user_comment) y el id (comment_user_id) de la persona que lo hizo. getDisplayNameByUserId() se encarga de transformar ese id en el user_name
                    
                        return { // retornamos el contenido de los comentarios y el user_name dinámico
                            ...comment,
                            user_name: displayName, // Agregamos el nombre del usuario dinámicamente
                        }
                    })
                ) // acá termina resolvedComments

                // una vez terminado el mapeo de resolvedComments podemos cargar en variable local 'posts.value' un objeto con los siguientes datos
                return { 
                    ...post, // todo lo que contenga el documento (book_title, created_at, review)
                    comments: resolvedComments, // sobreescribimos 'comments' con los comentarios ya existentes con los user_name hechos dinámicamente
                    commentsModel: { // y creamos un objeto commentsModel que nos va a servir después para manejar los nuevos comentarios
                        user_comment: "",
                    }
                    /*  commentsModel más explayado:
                        Como estamos realizando todo esto dentro de onMounted(), cuando se monta el DOM se va a ejecutar todas estas cosas y entre ellas se va a agregar el objeto commentsModels que sería algo así:
                        posts = [
                            {
                                book_title: "El Héroe de las Eras",
                                comments: [
                                    {
                                        comment_user_id: enpbrHIijzYqrl3dqDlhv6iPUnJ3",
                                        user_comment: "si?",
                                        user_name: mirko, ===> creado dinámicamente
                                    },
                                    {
                                        comment_user_id: "xcqnYE8hnEWDPfIZphx5tHF58z03",
                                        user_comment: "Así es",
                                        user_name: esme, ===> creado dinámicamente
                                    },
                                ],
                                created_at 24 de noviembre de 2024, 3:13:15 p.m. UTC-3 ,
                                review: "lorem...",
                                user_id"kkAsUueEouZ7EJf4pydrTiM5R0C3",
                                user_name"Kirmodericofederico",
                                commentsModel: {
                                    user_comment: ""
                                }
                            }
                        ]

                        Este commentsModel siempre va a iniciar vacío y se va a llenar con lo que pongamos en los inputs (hay v.model="post.commentsModel.user_comment")
                        Para esto lo creamos
                        Después se pasa por parámetro este 'post.commentsModel.user_comment' a la función handleComment(), en donde se usa para agregar el nuevo comentario al ya existente array 'comments'
                        
                    */
                }
            })
        )
        loading.value = false
    })
}) 

</script>

<template>

    <BaseHeading>Posteos de la comunidad</BaseHeading>

    <router-link 
        to="/publicaciones/crear-publicacion" 
        class="
            bg-white
            text-slate-800 font-semibold text-xl hover:text-cyan-700
            border-2 rounded-lg border-cyan-950 hover:border-cyan-700
            block mr-16 w-max px-4 py-2 transition-colors duration-200
            fixed bottom-10 right-0
        "
    > Crear publicación </router-link>

    <section>

        <p v-if="loading" class="text-2xl text-slate-700 text-center mt-14">Cargando posteos...</p>

        <article class="min-h-[60%] flex items-center justify-center">
    
            <div v-if="posts.length === 0 && !loading" class="flex flex-col items-center gap-8 mb-8">
                <p class="text-center text-slate-500 text-2xl">Todavía no existen posteos...</p>
                <div>
                    <img :src="NoPostsYet" alt="" class="w-60 h-60">
                </div>
                <div class="flex flex-col items-center gap-4">
                    <p class="text-slate-700 font-bold text-2xl">¡Crea el primer posteo!</p>
                    <router-link 
                        to="/publicaciones/crear-publicacion" 
                        class="px-6 py-3 bg-cyan-800 text-white rounded-lg text-lg font-semibold shadow-md hover:bg-cyan-700 transition-all duration-300"
                    > Crear </router-link>
                </div>
            </div>
        </article>


        <PostCard 
            v-for="post in posts"
            :key="post.id" 
            :post="post"
            :loggedUser="loggedUser"
        />
    </section>
</template>
