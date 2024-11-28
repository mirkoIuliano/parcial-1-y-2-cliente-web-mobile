<script setup>
import { onMounted, ref } from 'vue';
import {savePulicPost, subscribeToPublicPosts, addCommentToPost} from '../services/public-posts'
import { useRouter } from 'vue-router';
import { auth } from '../services/firebase';
import { getDisplayNameByUserId } from '../services/user-profile';


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

const router = useRouter(); 

async function handleComment (postId, user_comment )
{
    // uso auth.currentUser para saber si hay o no un usuario autenticado 
    if (auth.currentUser){
        // addCommentToPost de [publi-posts] es una función que agrega un comentario en el array comments del deocument del posteo específico 
        await addCommentToPost( postId, // el primer parámetro es el id del document del post
        { // el segundo parámetro es un objeto con el comnetario y el id del usuario que lo comentó
            user_comment,
            comment_user_id: auth.currentUser.uid
            // console.log(auth.currentUser.uid)
        }
    )
} else {
    // si quiere comentar y no está autenticado lo redireccionamos a página de iniciar sesión
        alert("Para comentar es necesario iniciar sesión primero")
        router.push('/iniciar-sesion')
    }

    // Limpiamos los campos de comentario solo para el post correspondiente
    const post = posts.value.find(post => post.id === postId);
    post.commentsModel.user_comment = "";
}

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
    })
}) 


/**
 * 
 * @param {Date|null} date
 * @returns {string} La fecha con formato "DD/MM/AAAA hh:ii". Retorna null si date es null.
 */
function formatDate(date){
    // hacemos esto es null por lo que explica en clase 9 min 27. Básicamente es para solventar un problema de desincronización entre horario de PC y horario del servidor (que es la hora real que se toma)
    if(!date) return null // después cuando subamos un post vamos a poder poner 'Subiendo post...' gracias a esto

    // Vamos a formatear la fecha usando la clase Intl.DateTimeFormat() --> es nativo de JS
    const formatter = new Intl.DateTimeFormat('es-AR', 
    { // como segundo parámetro vamos a poder pasar un objeto de confiruación sobre el formato. Esto lo hacemos porque sino, si el número del día es de un solo dígito aparecería así: 1/10/2022. Con esta configuración aparecería como 01/11/2022
        day: '2-digit',
        month: '2-digit',
        year:'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false, // así le pedimos que no nos use el formato de p.m y a.m y que llegue hasta 24hs

    })

    // Usamos el formateador que creamos para darle la forma al Date
    return formatter.format(date).replace(',', '') // usamos replace para sacarle la coma y en su lugar no poner nada
                                    // sin replace se vería: 24/11/2024, 19:46
                                    // con replace se vería: 24/11/2024 19:46 (sin la coma en el medio)
}

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
                    <!-- <p class="text-sm font-semibold text-slate-400 p-0 m-0">Publicado el DD/MM/YYYY</p> -->
                    <p class="text-sm font-semibold text-slate-400 p-0 m-0">{{ formatDate(post.created_at) || 'Subiendo post...' }}</p>
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

    </section>
</template>
