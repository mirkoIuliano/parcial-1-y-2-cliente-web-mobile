import { createRouter, createWebHashHistory } from "vue-router"
import Home from '../pages/Home.vue'
import PostsPage from '../pages/PostsPage.vue'
import CreatePostForm from '../pages/CreatePostForm.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import MyProfile from "../pages/MyProfile.vue"
import MyProfileEdit from "../pages/MyProfileEdit.vue"
import MyProfileEditPhoto from "../pages/MyProfileEditPhoto.vue"
import UserProfile from "../pages/UserProfile.vue"
import PrivateChat from "../pages/PrivateChat.vue"
import EditPost from "../pages/EditPost.vue"
import { subscribeToAuthChanges } from "../services/auth"

// Definimos las rutas
const routes = [
    {
        path:'/', 
        component: Home,
    },
    {
        path:'/publicaciones', 
        component: PostsPage,
        // Agregamos un campo 'meta' a las rutas que requieren autenticación
        meta: { // los campos meta son campos que le podemos agregar a cualquier ruta, para asignarles el valor que querramos
            requireAuth: true // el usuario va a necesitar estar autenticado para acceder a esta ruta
        }
    },
    {
        path:'/publicaciones/editar/:id', 
        component: EditPost,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/publicaciones/crear-publicacion', 
        component: CreatePostForm,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/iniciar-sesion', 
        component: Login,
    },
    {
        path:'/registrarse', 
        component: Register,
    },
    {
        path:'/mi-perfil', 
        component: MyProfile,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/mi-perfil/editar', 
        component: MyProfileEdit,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/mi-perfil/editar/foto', 
        component: MyProfileEditPhoto,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/usuario/:id', 
        component: UserProfile,
        meta: { 
            requireAuth: true 
        }
    },
    {
        path:'/usuario/:id/chat', 
        component: PrivateChat,
        meta: { 
            requireAuth: true 
        }
    },
]

// Con esto podemos usar el createRouter para crear nuestro router
const router = createRouter( // createRouter() recibe un objeto con, por lo menos, dos propiedades que le vamos a querer declarar: rutas y history
    { 
        routes, 
        history: createWebHashHistory(), 
    }
)

// Nos suscribimos a los datos del usuario autenticado
let loggedUser = {
    id: null,
    email: null,
    displayName: null,
    bio: null,
}

// Nos suscribimos a los cambios de autenticación
subscribeToAuthChanges(newUserData => loggedUser = newUserData)

// Agregamos que en cada navegación de ruta se verifique si la ruta requiere autenticación, y de así serlo, verifique si el usuario está autenticado. De no estarlo, lo mandamos al login.
router.beforeEach( // vamos a usar el método beforeEach(), que se ejecuta antes de cada navegación de ruta. beforeEach() me pasa los objetos de la ruta a la que voy (to) y a la que vengo (from)
    (to, from) => {

        // console.log("Verificando si el usuario tiene acceso a esta ruta: ", to)

        if (to.meta.requireAuth && loggedUser.id === null) //si la ruta a la que quiero entrar tiene como atributo meta requireAuth en true y el id del usuario autenticado es null (osea que no hay un usuario autenticado) 
        {
            return { // entonces lo redireccionamos a /inicar-sesion
                path: '/iniciar-sesion'
            }
        }

})

// Exportamos el router
export default router